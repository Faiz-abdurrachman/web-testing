const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const error = (code, status) => json({ ok: false, error: { code } }, status);

function readCookie(request, name) {
  return (
    (request.headers.get('cookie') || '')
      .split(';')
      .map((s) => s.trim())
      .find((s) => s.startsWith(name + '='))
      ?.slice(name.length + 1) ?? null
  );
}
function cookie(name, value, maxAge, secure) {
  return (
    `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}` +
    (secure ? '; Secure' : '')
  );
}
// Response.redirect() returns immutable headers, so build the 303 manually to
// be able to attach Set-Cookie headers.
function redirectWithCookies(location, cookies = []) {
  const h = new Headers({ ...headers, Location: location });
  cookies.forEach((c) => h.append('Set-Cookie', c));
  return new Response(null, { status: 303, headers: h });
}
async function boundedJson(request, limit) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error();
    }
    chunks.push(Buffer.from(value));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function config(env) {
  const url = new URL(env.SUPABASE_URL || '');
  if (
    url.protocol !== 'https:' ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)
  )
    throw new Error();
  const origin = new URL(env.CMS_ADMIN_ORIGIN || env.SITE_URL || '').origin;
  return {
    rpc: url.origin + '/rest/v1/rpc',
    authBase: url.origin,
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    anon: env.SUPABASE_ANON_KEY || '',
    origin,
    secure: origin.startsWith('https://'),
  };
}

export function createRecruitmentAdminHandler({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  async function callRpc(name, params) {
    const cfg = config(env);
    const response = await fetchImpl(`${cfg.rpc}/${name}`, {
      method: 'POST',
      redirect: 'error',
      signal: AbortSignal.timeout(30000),
      headers: {
        'Content-Type': 'application/json',
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
      body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error();
    return response.json();
  }

  async function verifyIdentity(request) {
    const cfg = config(env);
    const accessToken = readCookie(request, 'sb-access-token');
    if (!accessToken || !cfg.anon) return null;

    const response = await fetchImpl(`${cfg.authBase}/auth/v1/user`, {
      headers: {
        apikey: cfg.anon,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const user = await response.json();
    if (!user?.id) return null;

    const identity = await callRpc('admin_verify_identity', {
      p_auth_id: user.id,
    });
    if (!identity?.ok) return null;

    return { id: user.id, email: identity.email || user.email || '' };
  }

  async function audit(action, actor, targetId, details) {
    try {
      await callRpc('admin_audit_write', {
        p_action: action,
        p_actor_id: actor.id,
        p_actor_email: actor.email,
        p_target_id: targetId || null,
        p_details: details || {},
      });
    } catch {
      // Audit failure must not block the response.
    }
  }

  async function loginWithPassword(request, cfg) {
    if (request.headers.get('origin') !== cfg.origin)
      return error('FORBIDDEN', 403);
    if (
      !(request.headers.get('content-type') || '').startsWith(
        'application/json',
      )
    )
      return error('INVALID_INPUT', 400);
    if (!cfg.anon) return error('CONFIGURATION', 503);

    let body;
    try {
      body = await boundedJson(request, 4096);
    } catch {
      return error('INVALID_INPUT', 400);
    }
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
      return error('INVALID_INPUT', 400);

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1';

    try {
      const rateCheck = await callRpc('admin_rate_limit_check', {
        p_ip: ip,
        p_email: body.email,
        p_max: 5,
        p_window: 60,
      });
      if (rateCheck?.limited) return error('LIMIT', 429);
    } catch {
      // Rate limit failure must not block login; continue without it.
    }

    try {
      const response = await fetchImpl(
        `${cfg.authBase}/auth/v1/token?grant_type=password`,
        {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
          headers: {
            'Content-Type': 'application/json',
            apikey: cfg.anon,
          },
          body: JSON.stringify({
            email: body.email,
            password: body.password,
          }),
        },
      );
      if (!response.ok) return error('UNAUTHORIZED', 401);
      const token = await response.json();
      if (
        typeof token.access_token !== 'string' ||
        !token.access_token ||
        typeof token.refresh_token !== 'string' ||
        !Number.isFinite(token.expires_in)
      )
        return error('UNAUTHORIZED', 401);

      // Reset rate limit on success
      try {
        await callRpc('admin_rate_limit_reset', {
          p_ip: ip,
          p_email: body.email,
        });
      } catch {
        // Non-critical
      }

      const accessAge = Math.min(Math.floor(token.expires_in), 3600);
      const refreshAge = 60 * 60 * 24 * 30;
      const result = json({ ok: true });
      result.headers.append(
        'Set-Cookie',
        cookie('sb-access-token', token.access_token, accessAge, cfg.secure),
      );
      result.headers.append(
        'Set-Cookie',
        cookie('sb-refresh-token', token.refresh_token, refreshAge, cfg.secure),
      );
      return result;
    } catch {
      return error('UNCONFIRMED', 502);
    }
  }

  async function refreshSession(request, cfg) {
    const refreshToken = readCookie(request, 'sb-refresh-token');
    if (!refreshToken || !cfg.anon) return error('UNAUTHORIZED', 401);

    try {
      const response = await fetchImpl(
        `${cfg.authBase}/auth/v1/token?grant_type=refresh_token`,
        {
          method: 'POST',
          redirect: 'error',
          signal: AbortSignal.timeout(15000),
          headers: {
            'Content-Type': 'application/json',
            apikey: cfg.anon,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        },
      );
      if (!response.ok) {
        // Clear expired tokens on failure
        return redirectWithCookies(cfg.origin + '/admin/recruitment/', [
          cookie('sb-access-token', '', 0, cfg.secure),
          cookie('sb-refresh-token', '', 0, cfg.secure),
        ]);
      }
      const token = await response.json();
      if (
        typeof token.access_token !== 'string' ||
        !token.access_token ||
        typeof token.refresh_token !== 'string' ||
        !Number.isFinite(token.expires_in)
      )
        return error('UNAUTHORIZED', 401);

      const accessAge = Math.min(Math.floor(token.expires_in), 3600);
      const refreshAge = 60 * 60 * 24 * 30;
      const result = json({ ok: true, refreshed: true });
      result.headers.append(
        'Set-Cookie',
        cookie('sb-access-token', token.access_token, accessAge, cfg.secure),
      );
      result.headers.append(
        'Set-Cookie',
        cookie('sb-refresh-token', token.refresh_token, refreshAge, cfg.secure),
      );
      return result;
    } catch {
      return error('UNCONFIRMED', 502);
    }
  }

  return async (request, route) => {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return error('CONFIGURATION', 503);
    }

    if (route === 'login') {
      if (request.method === 'GET')
        return redirectWithCookies(cfg.origin + '/admin/recruitment/');
      if (request.method === 'POST') return loginWithPassword(request, cfg);
      return error('METHOD_NOT_ALLOWED', 405);
    }

    if (route === 'refresh') {
      if (request.method === 'POST') return refreshSession(request, cfg);
      return error('METHOD_NOT_ALLOWED', 405);
    }

    if (route === 'logout') {
      return redirectWithCookies(cfg.origin + '/admin/recruitment/', [
        cookie('sb-access-token', '', 0, cfg.secure),
        cookie('sb-refresh-token', '', 0, cfg.secure),
      ]);
    }

    if (['GET', 'POST'].includes(request.method) === false)
      return error('METHOD_NOT_ALLOWED', 405);

    if (route === 'detail') {
      const url = new URL(request.url);
      const receipt = url.searchParams.get('receipt');
      if (
        !receipt ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          receipt,
        )
      )
        return error('INVALID_INPUT', 400);
    }

    const actor = await verifyIdentity(request);
    if (!actor) return error('UNAUTHORIZED', 401);

    try {
      if (route === 'list') {
        let filters = {};
        if (
          request.method === 'POST' &&
          request.headers.get('content-type')?.startsWith('application/json')
        ) {
          filters = await boundedJson(request, 32768).catch(() => ({}));
          if (typeof filters !== 'object' || Array.isArray(filters))
            return error('INVALID_INPUT', 400);
        } else if (request.method === 'GET') {
          const url = new URL(request.url);
          const search = url.searchParams.get('search');
          const hods = url.searchParams.get('primary_hods');
          const since = url.searchParams.get('since');
          const until = url.searchParams.get('until');
          const limit = url.searchParams.get('limit');
          const offset = url.searchParams.get('offset');
          if (search) filters.search = search;
          if (hods) filters.primary_hods = hods;
          if (since) filters.since = since;
          if (until) filters.until = until;
          if (limit) filters.limit = parseInt(limit, 10);
          if (offset) filters.offset = parseInt(offset, 10);
        }
        const result = await callRpc('admin_list_applications', {
          p_filters: filters,
        });
        await audit('admin_read_list', actor, null, { filters });
        return json({ ok: true, data: result });
      }

      if (route === 'detail') {
        const url = new URL(request.url);
        const receipt = url.searchParams.get('receipt');
        if (
          !receipt ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            receipt,
          )
        )
          return error('INVALID_INPUT', 400);
        const result = await callRpc('admin_get_application', {
          p_receipt: receipt,
        });
        if (!result?.found) return error('NOT_FOUND', 404);
        await audit('admin_read_detail', actor, receipt, {});
        return json({ ok: true, data: result });
      }

      if (route === 'stats') {
        const result = await callRpc('admin_get_stats', {});
        await audit('admin_stats', actor, null, {});
        return json({ ok: true, data: result });
      }

      return error('NOT_FOUND', 404);
    } catch {
      return error('SERVER_ERROR', 502);
    }
  };
}
