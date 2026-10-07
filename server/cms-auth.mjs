// CMS auth (Supabase password) — server-only lifecycle.
//
// Design: docs/cms-auth-design.md. No OAuth/PKCE/callback; no @supabase/ssr.
// The browser never holds a Supabase token: access + refresh + CSRF live inside
// one AES-256-GCM sealed, origin-bound cookie in a CMS-only namespace, and every
// request re-verifies trusted Auth identity + CMS permission before privileged
// work. Recruitment cookies/allowlist are never touched.
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
export const authHeaders = headers;
export const json = (body, status = 200) =>
  Response.json(body, { status, headers });
export const authError = (code, status) =>
  json({ ok: false, error: { code } }, status);

const random = () => randomBytes(32).toString('base64url');
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

function seal(value, cfg, purpose) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', cfg.key, iv);
  cipher.setAAD(Buffer.from(purpose + cfg.origin));
  const body = Buffer.concat([
    cipher.update(JSON.stringify(value), 'utf8'),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64url');
}
function unseal(value, cfg, purpose, now) {
  try {
    const buffer = Buffer.from(value || '', 'base64url');
    if (buffer.toString('base64url') !== value) return null;
    const cipher = createDecipheriv(
      'aes-256-gcm',
      cfg.key,
      buffer.subarray(0, 12),
    );
    cipher.setAAD(Buffer.from(purpose + cfg.origin));
    cipher.setAuthTag(buffer.subarray(12, 28));
    const result = JSON.parse(
      Buffer.concat([
        cipher.update(buffer.subarray(28)),
        cipher.final(),
      ]).toString(),
    );
    if (!Number.isFinite(result.exp) || !Number.isFinite(result.rexp))
      return null;
    // Unsealed only while the refresh/session window is open; the access token
    // may already be expired and is refreshed server-side on next request.
    if (result.rexp <= now) return null;
    return result;
  } catch {
    return null;
  }
}
const cookie = (cfg, name, value, age) =>
  `${cfg.prefix}${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${age}${cfg.secure ? '; Secure' : ''}`;
function readCookie(request, cfg, name, now) {
  const entry = (request.headers.get('cookie') || '')
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(cfg.prefix + name + '='));
  return unseal(entry?.slice(entry.indexOf('=') + 1), cfg, name, now);
}
async function boundedJson(stream, limit) {
  const reader = stream?.getReader?.();
  if (!reader) return null;
  let size = 0;
  const chunks = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        return null;
      }
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return null;
  }
}

function config(env) {
  const origin = new URL(env.CMS_ADMIN_ORIGIN);
  const secure = origin.protocol === 'https:';
  if (
    (!secure &&
      !(
        env.NODE_ENV !== 'production' &&
        origin.protocol === 'http:' &&
        ['localhost', '127.0.0.1'].includes(origin.hostname)
      )) ||
    origin.origin !== env.CMS_ADMIN_ORIGIN
  )
    throw Object.assign(new Error('bad origin'), { code: 'CONFIGURATION' });
  const key = Buffer.from(env.CMS_ADMIN_SESSION_SECRET || '', 'base64');
  if (key.length !== 32 || !env.SUPABASE_URL)
    throw Object.assign(new Error('bad config'), { code: 'CONFIGURATION' });
  return {
    origin: origin.origin,
    secure,
    key,
    url: env.SUPABASE_URL.replace(/\/+$/, ''),
    anon: env.SUPABASE_ANON_KEY || '',
    service: env.SUPABASE_SERVICE_ROLE_KEY || '',
    prefix: secure ? '__Host-ds-admin-' : 'ds-admin-',
  };
}

const ipFrom = (request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
  request.headers.get('x-real-ip') ||
  '127.0.0.1';

export function createCmsAuth({
  env = process.env,
  clock = Date.now,
  fetchImpl = fetch,
} = {}) {
  function client(cfg, key) {
    // New client per request; no shared mutable session state in module scope.
    return createClient(cfg.url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { fetch: fetchImpl },
    });
  }

  async function rpc(cfg, name, body) {
    if (!cfg.service)
      throw Object.assign(new Error('no key'), { code: 'CONFIGURATION' });
    const res = await fetchImpl(`${cfg.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.service,
        Authorization: `Bearer ${cfg.service}`,
      },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok)
      throw Object.assign(new Error('rpc'), { code: 'SERVER_ERROR' });
    return res.json();
  }

  async function verifyPermission(cfg, userId) {
    const result = await rpc(cfg, 'cms_verify_admin', { p_auth_id: userId });
    if (!result?.ok) return null;
    return { id: userId, email: result.email || '' };
  }

  // Resolve trusted identity + CMS permission for a sealed session. Refreshes
  // the access token server-side when expired. Returns a discriminated status.
  async function authorizeSession(cfg, session) {
    if (!session?.access || !session?.csrf || !cfg.anon)
      return { status: 'unauthenticated' };
    let access = session.access;
    if (session.exp <= clock()) {
      if (!session.refresh) return { status: 'unauthenticated' };
      try {
        const { data, error } = await client(cfg, cfg.anon).auth.refreshSession(
          { refresh_token: session.refresh },
        );
        if (error || !data?.session?.access_token)
          return { status: 'unauthenticated' };
        access = data.session.access_token;
        session = {
          ...session,
          access,
          refresh: data.session.refresh_token || session.refresh,
          exp: clock() + (data.session.expires_in || 3600) * 1000,
          rotated: true,
        };
      } catch {
        return { status: 'error' };
      }
    }
    try {
      const { data, error } = await client(cfg, cfg.anon).auth.getUser(access);
      if (error || !data?.user?.id) return { status: 'unauthenticated' };
      let actor;
      try {
        actor = await verifyPermission(cfg, data.user.id);
      } catch {
        return { status: 'error' };
      }
      if (!actor) return { status: 'forbidden' };
      return { status: 'ok', actor, session, access };
    } catch {
      return { status: 'error' };
    }
  }

  // Resolve an authorized request, returning { actor, session, access, setCookie? }.
  async function authorize(request) {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return { error: authError('CONFIGURATION', 503) };
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin)
      return { error: authError('UNAUTHORIZED', 403) };
    const now = clock();
    const session = readCookie(request, cfg, 'session', now);
    if (!session || !session.access || !session.csrf)
      return { error: authError('UNAUTHORIZED', 401) };
    // Validate Origin + session-bound CSRF before any upstream Auth call.
    if (
      request.method === 'POST' &&
      (request.headers.get('origin') !== cfg.origin ||
        !equal(session.csrf, request.headers.get('x-csrf-token') || ''))
    )
      return { error: authError('UNAUTHORIZED', 403) };
    const result = await authorizeSession(cfg, session);
    if (result.status === 'unauthenticated')
      return { error: authError('UNAUTHORIZED', 401) };
    if (result.status === 'forbidden')
      return { error: authError('FORBIDDEN', 403) };
    if (result.status !== 'ok')
      return { error: authError('UNAUTHORIZED', 401) };
    const extra = result.session.rotated
      ? cookie(
          cfg,
          'session',
          seal(result.session, cfg, 'session'),
          Math.max(1, Math.floor((result.session.rexp - clock()) / 1000)),
        )
      : null;
    return {
      cfg,
      actor: result.actor,
      session: result.session,
      setCookie: extra,
    };
  }

  async function login(request) {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return authError('CONFIGURATION', 503);
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin) return authError('UNAUTHORIZED', 403);
    if (request.method === 'GET')
      return Response.redirect(cfg.origin + '/admin/', 303);
    if (request.method !== 'POST') return authError('INVALID_INPUT', 405);
    if (request.headers.get('origin') !== cfg.origin)
      return authError('UNAUTHORIZED', 403);
    if (
      (request.headers.get('content-type') || '').split(';')[0] !==
      'application/json'
    )
      return authError('INVALID_INPUT', 415);
    if (!cfg.anon) return authError('CONFIGURATION', 503);
    const body = await boundedJson(request.body, 4096);
    if (
      !body ||
      typeof body !== 'object' ||
      Array.isArray(body) ||
      Object.keys(body).some((k) => !['email', 'password'].includes(k)) ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      !body.email ||
      !body.password ||
      body.email.length > 320 ||
      body.password.length > 256
    )
      return authError('INVALID_INPUT', 400);
    const ip = ipFrom(request);
    try {
      const limit = await rpc(cfg, 'cms_rate_limit_check', {
        p_ip: ip,
        p_email: body.email,
        p_max: 5,
        p_window: 60,
      });
      if (limit?.limited === true) return authError('LIMIT', 429);
      if (limit?.ok !== true || limit?.limited !== false)
        return authError('SERVER_ERROR', 502);
    } catch {
      return authError('SERVER_ERROR', 502);
    }
    let auth;
    try {
      auth = await client(cfg, cfg.anon).auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });
    } catch {
      return authError('UNAUTHORIZED', 401);
    }
    if (auth.error || !auth.data?.session?.access_token || !auth.data.user?.id)
      return authError('UNAUTHORIZED', 401);
    let actor;
    try {
      actor = await verifyPermission(cfg, auth.data.user.id);
    } catch {
      return authError('SERVER_ERROR', 502);
    }
    if (!actor) return authError('FORBIDDEN', 403);
    try {
      await rpc(cfg, 'cms_rate_limit_reset', { p_ip: ip, p_email: body.email });
    } catch {
      // Non-critical.
    }
    const SESSION_WINDOW = 60 * 60 * 24 * 30; // 30 days refresh/session window.
    const session = {
      access: auth.data.session.access_token,
      refresh: auth.data.session.refresh_token,
      csrf: random(),
      exp: clock() + (auth.data.session.expires_in || 3600) * 1000,
      rexp: clock() + SESSION_WINDOW * 1000,
    };
    const age = SESSION_WINDOW;
    const response = json({ ok: true, csrf: session.csrf });
    response.headers.append(
      'Set-Cookie',
      cookie(cfg, 'session', seal(session, cfg, 'session'), age),
    );
    return response;
  }

  async function logout(request) {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return authError('CONFIGURATION', 503);
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin) return authError('UNAUTHORIZED', 403);
    if (request.method !== 'POST') return authError('INVALID_INPUT', 405);
    const now = clock();
    const session = readCookie(request, cfg, 'session', now);
    if (!session || !session.csrf) return authError('UNAUTHORIZED', 401);
    if (
      request.headers.get('origin') !== cfg.origin ||
      !equal(session.csrf, request.headers.get('x-csrf-token') || '')
    )
      return authError('UNAUTHORIZED', 403);
    // Best-effort local sign-out; recruitment session is never affected.
    if (session.refresh && cfg.anon) {
      try {
        await client(cfg, cfg.anon).auth.admin.signOut(session.access, 'local');
      } catch {
        // ignore
      }
    }
    const response = json({ ok: true });
    response.headers.append('Set-Cookie', cookie(cfg, 'session', '', 0));
    return response;
  }

  async function refresh(request) {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return authError('CONFIGURATION', 503);
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin) return authError('UNAUTHORIZED', 403);
    if (request.method !== 'POST') return authError('INVALID_INPUT', 405);
    const now = clock();
    const session = readCookie(request, cfg, 'session', now);
    if (!session || !session.csrf || !session.refresh)
      return authError('UNAUTHORIZED', 401);
    if (
      request.headers.get('origin') !== cfg.origin ||
      !equal(session.csrf, request.headers.get('x-csrf-token') || '')
    )
      return authError('UNAUTHORIZED', 403);
    if (!cfg.anon) return authError('CONFIGURATION', 503);
    let rotated;
    try {
      rotated = await client(cfg, cfg.anon).auth.refreshSession({
        refresh_token: session.refresh,
      });
    } catch {
      rotated = { error: true };
    }
    if (rotated.error || !rotated.data?.session?.access_token) {
      const failed = authError('UNAUTHORIZED', 401);
      failed.headers.append('Set-Cookie', cookie(cfg, 'session', '', 0));
      return failed;
    }
    // Refresh still requires trusted identity and an active CMS permission.
    const checked = await authorizeSession(cfg, {
      ...session,
      access: rotated.data.session.access_token,
      refresh: rotated.data.session.refresh_token,
      exp: now + (rotated.data.session.expires_in || 3600) * 1000,
    });
    if (checked.status !== 'ok') {
      const failed = authError(
        checked.status === 'forbidden' ? 'FORBIDDEN' : 'UNAUTHORIZED',
        checked.status === 'forbidden' ? 403 : 401,
      );
      failed.headers.append('Set-Cookie', cookie(cfg, 'session', '', 0));
      return failed;
    }
    const next = {
      access: rotated.data.session.access_token,
      refresh: rotated.data.session.refresh_token || session.refresh,
      csrf: session.csrf,
      exp: now + (rotated.data.session.expires_in || 3600) * 1000,
      rexp: Number.isFinite(session.rexp)
        ? session.rexp
        : now + 60 * 60 * 24 * 30 * 1000,
    };
    const age = Math.max(1, Math.floor((next.rexp - now) / 1000));
    const response = json({ ok: true, refreshed: true, csrf: next.csrf });
    response.headers.append(
      'Set-Cookie',
      cookie(cfg, 'session', seal(next, cfg, 'session'), age),
    );
    return response;
  }

  return { authorize, login, logout, refresh, _config: config };
}
