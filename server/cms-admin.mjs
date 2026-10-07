import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

export const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/script.external_request',
];
const RPC = {
  load: 'adminLoadProjects',
  save: 'adminSaveProject',
  add: 'adminAddProject',
  delete: 'adminDeleteProject',
  retry: 'adminRetryPublication',
  upload: 'adminUploadProjectImage',
  media: 'adminReadProjectImage',
};
const TEAM_RPC = {
  load: 'adminLoadTeam',
  save: 'adminSaveMember',
  add: 'adminAddMember',
  delete: 'adminDeleteMember',
  retry: 'adminRetryPublication',
  upload: 'adminUploadTeamImage',
  media: 'adminReadTeamImage',
};
const ERRORS = new Set([
  'UNAUTHORIZED',
  'CONFIGURATION',
  'INVALID_INPUT',
  'INVALID_DATA',
  'CONFLICT',
  'NOT_FOUND',
  'MINIMUM',
  'LIMIT',
  'COLLISION',
  'SERVER_ERROR',
]);
const LIMIT = 512 * 1024;
const random = () => randomBytes(32).toString('base64url');
const equal = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const left = Buffer.from(a),
    right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};
const fail = (code) => {
  throw Object.assign(new Error('Admin request failed'), { code });
};
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const error = (code, status) => json({ ok: false, error: { code } }, status);

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
    fail('CONFIGURATION');
  const key = Buffer.from(env.CMS_ADMIN_SESSION_SECRET || '', 'base64');
  if (
    key.length !== 32 ||
    !env.CMS_ADMIN_GOOGLE_CLIENT_ID ||
    !env.CMS_ADMIN_GOOGLE_CLIENT_SECRET ||
    !/^[\w-]+$/.test(env.CMS_ADMIN_API_DEPLOYMENT_ID || '')
  )
    fail('CONFIGURATION');
  return {
    origin: origin.origin,
    secure,
    key,
    client: env.CMS_ADMIN_GOOGLE_CLIENT_ID,
    secret: env.CMS_ADMIN_GOOGLE_CLIENT_SECRET,
    deployment: env.CMS_ADMIN_API_DEPLOYMENT_ID,
    prefix: secure ? '__Host-ds-admin-' : 'ds-admin-',
  };
}
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
    if (!Number.isFinite(result.exp) || result.exp <= now) return null;
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
const redirect = (url, cookies = []) => {
  const h = new Headers({ ...headers, Location: url });
  cookies.forEach((c) => h.append('Set-Cookie', c));
  return new Response(null, { status: 303, headers: h });
};
async function boundedJson(response, limit = 1024 * 1024) {
  const reader = response.body?.getReader();
  if (!reader) fail('SERVER_ERROR');
  let size = 0;
  const chunks = [];
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {
        await reader.cancel();
        fail('SERVER_ERROR');
      }
      chunks.push(Buffer.from(value));
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    fail('SERVER_ERROR');
  }
}
// Rebuild a strict public contract: raw Google errors/properties never reach the browser.
function sanitize(result) {
  if (result?.ok !== true)
    return {
      ok: false,
      error: {
        code: ERRORS.has(result?.error?.code)
          ? result.error.code
          : 'SERVER_ERROR',
      },
    };
  const data = result.data;
  if (!data || typeof data !== 'object') fail('SERVER_ERROR');
  const out = {};
  if ('projects' in data) {
    if (
      !Array.isArray(data.projects) ||
      data.projects.length < 1 ||
      data.projects.length > 8 ||
      !/^[a-f0-9]{64}$/.test(data.revision) ||
      data.minProjects !== 1 ||
      data.maxProjects !== 8 ||
      !Array.isArray(data.imagePresets) ||
      data.imagePresets.length > 16
    )
      fail('SERVER_ERROR');
    const str = (value) => {
      if (typeof value !== 'string' || value.length > 20000)
        fail('SERVER_ERROR');
      return value;
    };
    out.projects = data.projects.map((p) => {
      if (!Array.isArray(p.tags) || p.tags.length !== 2) fail('SERVER_ERROR');
      return {
        id: str(p.id),
        title: str(p.title),
        description: str(p.description),
        tags: p.tags.map(str),
        image: str(p.image),
      };
    });
    out.revision = data.revision;
    out.imagePresets = data.imagePresets.map(str);
    out.minProjects = 1;
    out.maxProjects = 8;
    out.publicationPending = data.publicationPending === true;
    if (data.affectedId !== undefined) out.affectedId = str(data.affectedId);
  }
  if ('members' in data) {
    const str = (v) => {
      if (typeof v !== 'string' || v.length > 20000) fail('SERVER_ERROR');
      return v;
    };
    if (
      !Array.isArray(data.members) ||
      data.members.length < 7 ||
      data.members.length > 56 ||
      !/^[a-f0-9]{64}$/.test(data.revision) ||
      data.minMembers !== 1 ||
      data.maxMembers !== 8 ||
      !Array.isArray(data.groups) ||
      data.groups.length !== 7 ||
      !Array.isArray(data.photoPresets) ||
      data.photoPresets.length > 58
    )
      fail('SERVER_ERROR');
    const ids = [
      'leader',
      'data',
      'core',
      'language',
      'vision',
      'product',
      'growth',
    ];
    out.groups = data.groups.map((g, i) => {
      if (g.id !== ids[i]) fail('SERVER_ERROR');
      return { id: g.id, title: str(g.title) };
    });
    const seen = new Set();
    out.members = data.members.map((m) => {
      if (
        !ids.includes(m.group) ||
        !Number.isInteger(m.order) ||
        m.order < 1 ||
        m.order > 8 ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(m.id) ||
        seen.has(m.id) ||
        !['name', 'role'].every(
          (k) =>
            typeof m[k] === 'string' &&
            m[k].trim() &&
            m[k].length <= 80 &&
            !/[\r\n]/.test(m[k]),
        ) ||
        (!['marchel', 'zidan-rose'].includes(m.photo) &&
          !/^\/images\/cms\/team\/[a-f0-9]{64}\.webp$/.test(m.photo))
      )
        fail('SERVER_ERROR');
      seen.add(m.id);
      return {
        id: m.id,
        group: m.group,
        name: m.name,
        role: m.role,
        photo: m.photo,
        order: m.order,
      };
    });
    ids.forEach((id) => {
      const group = out.members.filter((m) => m.group === id);
      if (
        !group.length ||
        group.length > 8 ||
        new Set(group.map((m) => m.order)).size !== group.length
      )
        fail('SERVER_ERROR');
    });
    out.photoPresets = data.photoPresets.map((p) => {
      if (
        !['marchel', 'zidan-rose'].includes(p) &&
        !/^\/images\/cms\/team\/[a-f0-9]{64}\.webp$/.test(p)
      )
        fail('SERVER_ERROR');
      return p;
    });
    out.revision = data.revision;
    out.minMembers = 1;
    out.maxMembers = 8;
    out.publicationPending = data.publicationPending === true;
    if (data.affectedId !== undefined) out.affectedId = str(data.affectedId);
  }
  if ('publication' in data) {
    if (
      !Array.isArray(data.publication) ||
      data.publication.length !== 2 ||
      !['testing', 'production'].every((t) =>
        data.publication.some((p) => p.target === t),
      )
    )
      fail('SERVER_ERROR');
    out.publication = data.publication.map((p) => ({
      target: p.target,
      accepted: p.accepted === true,
    }));
  }
  const mediaPath = /^\/images\/cms\/(?:projects|team)\/[a-f0-9]{64}\.webp$/;
  if ('image' in data) {
    if (!mediaPath.test(data.image)) fail('SERVER_ERROR');
    out.image = data.image;
  }
  if ('media' in data) {
    if (
      !mediaPath.test(data.media?.image) ||
      data.media.mimeType !== 'image/webp' ||
      typeof data.media.data !== 'string' ||
      data.media.data.length > 349528
    )
      fail('SERVER_ERROR');
    out.media = {
      image: data.media.image,
      mimeType: 'image/webp',
      data: data.media.data,
    };
  }
  if (
    !out.members &&
    !out.projects &&
    !out.publication &&
    !out.image &&
    !out.media
  )
    fail('SERVER_ERROR');
  return { ok: true, data: out };
}

export function createAdminHandler({
  env = process.env,
  fetchImpl = fetch,
  clock = Date.now,
} = {}) {
  async function gas(cfg, token, operation, payload, collection = 'projects') {
    const response = await fetchImpl(
      `https://script.googleapis.com/v1/scripts/${cfg.deployment}:run`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: (collection === 'team' ? TEAM_RPC : RPC)[operation],
          parameters: payload === undefined ? [] : [payload],
          devMode: false,
        }),
        signal: AbortSignal.timeout(65000),
        redirect: 'error',
      },
    );
    if (response.status === 401 || response.status === 403)
      fail('UNAUTHORIZED');
    if (!response.ok) fail('SERVER_ERROR');
    const body = await boundedJson(response);
    if (body.done !== true || body.error || !body.response)
      fail('SERVER_ERROR');
    const result = sanitize(body.response.result);
    if (
      result.ok &&
      ['load', 'save', 'add', 'delete'].includes(operation) &&
      !(collection === 'team' ? result.data.members : result.data.projects)
    )
      fail('SERVER_ERROR');
    return result;
  }

  async function projectsOperation(cfg, env, token, operation, payload) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseKey) fail('CONFIGURATION');

    const baseUrl = supabaseUrl.replace(/\/+$/, '');

    const rpc = async (fn, body) => {
      const url = `${baseUrl}/rest/v1/rpc/${fn}`;
      const res = await fetchImpl(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseKey,
          Authorization: 'Bearer ' + supabaseKey,
        },
        body: JSON.stringify(body || {}),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) fail('SERVER_ERROR');
      return res.json();
    };

    const callDeployHooks = async () => {
      const hooks = [
        { target: 'testing', url: env.CMS_DEPLOY_HOOK_TESTING },
        { target: 'production', url: env.CMS_DEPLOY_HOOK_PRODUCTION },
      ];
      const results = [];
      for (const hook of hooks) {
        if (!hook.url) {
          results.push({ target: hook.target, accepted: false });
          continue;
        }
        try {
          const res = await fetchImpl(hook.url, {
            method: 'POST',
            signal: AbortSignal.timeout(30000),
          });
          results.push({ target: hook.target, accepted: res.ok });
        } catch {
          results.push({ target: hook.target, accepted: false });
        }
      }
      return results;
    };

    if (operation === 'load') {
      return sanitize({ ok: true, data: await rpc('cms_load_projects') });
    }

    if (operation === 'save' || operation === 'add' || operation === 'delete') {
      const rpcName =
        operation === 'save'
          ? 'cms_save_project'
          : operation === 'add'
            ? 'cms_add_project'
            : 'cms_delete_project';
      const result = await rpc(rpcName, { p_payload: payload });
      if (result.error) return { ok: false, error: result.error };
      const publication = await callDeployHooks();
      result.publication = publication;
      result.publicationPending = publication.some((p) => !p.accepted);
      return sanitize({ ok: true, data: result });
    }

    if (operation === 'retry') {
      const publication = await callDeployHooks();
      return sanitize({ ok: true, data: { publication } });
    }

    fail('INVALID_INPUT');
  }

  return async function handle(request, route) {
    let cfg;
    try {
      cfg = config(env);
    } catch {
      return ['login', 'callback'].includes(route)
        ? redirect('/admin/?login=unavailable')
        : error('CONFIGURATION', 503);
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin) return error('UNAUTHORIZED', 403);
    const now = clock();
    const collection =
      route === 'team' ||
      (route === 'media' && url.searchParams.get('collection') === 'team')
        ? 'team'
        : 'projects';
    if (
      route === 'media' &&
      url.searchParams.has('collection') &&
      !['projects', 'team'].includes(url.searchParams.get('collection'))
    )
      return error('INVALID_INPUT', 400);
    try {
      if (route === 'login' && request.method === 'GET') {
        const flow = { state: random(), verifier: random(), exp: now + 600000 };
        const target = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        target.search = new URLSearchParams({
          client_id: cfg.client,
          redirect_uri: cfg.origin + '/api/admin/auth/callback',
          response_type: 'code',
          scope: SCOPES.join(' '),
          state: flow.state,
          code_challenge: createHash('sha256')
            .update(flow.verifier)
            .digest('base64url'),
          code_challenge_method: 'S256',
          prompt: 'select_account',
          access_type: 'online',
        }).toString();
        return redirect(target.href, [
          cookie(cfg, 'flow', seal(flow, cfg, 'flow'), 600),
        ]);
      }
      if (route === 'callback' && request.method === 'GET') {
        const clear = cookie(cfg, 'flow', '', 0);
        try {
          const flow = readCookie(request, cfg, 'flow', now);
          if (
            !flow ||
            !equal(flow.state, url.searchParams.get('state')) ||
            !url.searchParams.get('code') ||
            url.searchParams.has('error')
          )
            fail('UNAUTHORIZED');
          const response = await fetchImpl(
            'https://oauth2.googleapis.com/token',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({
                client_id: cfg.client,
                client_secret: cfg.secret,
                code: url.searchParams.get('code'),
                code_verifier: flow.verifier,
                grant_type: 'authorization_code',
                redirect_uri: cfg.origin + '/api/admin/auth/callback',
              }),
              signal: AbortSignal.timeout(15000),
              redirect: 'error',
            },
          );
          if (!response.ok) fail('UNAUTHORIZED');
          const token = await boundedJson(response, 16384);
          if (
            token.token_type?.toLowerCase() !== 'bearer' ||
            typeof token.access_token !== 'string' ||
            token.access_token.length > 2048 ||
            !Number.isFinite(token.expires_in) ||
            token.expires_in <= 0 ||
            !SCOPES.every((s) => token.scope?.split(' ').includes(s))
          )
            fail('UNAUTHORIZED');
          const state = await gas(cfg, token.access_token, 'load');
          if (!state.ok || !state.data.projects) fail('UNAUTHORIZED');
          const age = Math.min(Math.floor(token.expires_in), 3600);
          const session = {
            token: token.access_token,
            csrf: random(),
            exp: now + age * 1000,
          };
          return redirect(cfg.origin + '/admin/', [
            clear,
            cookie(cfg, 'session', seal(session, cfg, 'session'), age),
          ]);
        } catch {
          return redirect(cfg.origin + '/admin/?login=failed', [
            clear,
            cookie(cfg, 'session', '', 0),
          ]);
        }
      }
      if (
        !['projects', 'team', 'logout', 'media'].includes(route) ||
        !['GET', 'POST'].includes(request.method) ||
        (route === 'logout' && request.method !== 'POST')
      )
        return error('INVALID_INPUT', 405);
      const session = readCookie(request, cfg, 'session', now);
      if (!session || !session.token || !session.csrf)
        return error('UNAUTHORIZED', 401);
      if (
        request.method === 'POST' &&
        (request.headers.get('origin') !== cfg.origin ||
          !equal(session.csrf, request.headers.get('x-csrf-token')))
      )
        return error('UNAUTHORIZED', 403);
      if (route === 'logout') {
        const response = json({ ok: true });
        response.headers.set('Set-Cookie', cookie(cfg, 'session', '', 0));
        return response;
      }
      if (route === 'media') {
        const {
          normalizeProjectImage,
          verifyProjectMedia,
          MEDIA_INPUT_LIMIT,
          MEDIA_PATH,
        } = await import('./cms-media.mjs');
        if (request.method === 'GET') {
          const image = url.searchParams.get('image');
          if (
            !MEDIA_PATH.test(image || '') ||
            !image.startsWith('/images/cms/' + collection + '/')
          )
            return error('INVALID_INPUT', 400);
          if (collection === 'projects') {
            const storageUrl = `${env.SUPABASE_URL}/storage/v1/object/cms-media/${image.replace(/^\/images\/cms\//, '')}`;
            const sres = await fetchImpl(storageUrl, {
              headers: {
                Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
              },
              signal: AbortSignal.timeout(15000),
            });
            if (!sres.ok) return error('NOT_FOUND', 404);
            const bytes = await sres.arrayBuffer();
            return new Response(bytes, {
              headers: { ...headers, 'Content-Type': 'image/webp' },
            });
          }
          const result = await gas(
            cfg,
            session.token,
            'media',
            { image },
            collection,
          );
          if (!result.ok)
            return json(
              result,
              result.error.code === 'UNAUTHORIZED' ? 403 : 400,
            );
          const bytes = await verifyProjectMedia(result.data.media, image);
          return new Response(bytes, {
            headers: { ...headers, 'Content-Type': 'image/webp' },
          });
        }
        let media;
        try {
          if (Number(request.headers.get('content-length')) > MEDIA_INPUT_LIMIT)
            return error('INVALID_INPUT', 413);
          const reader = request.body?.getReader();
          if (!reader) return error('INVALID_INPUT', 400);
          const chunks = [];
          let size = 0;
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              size += value.byteLength;
              if (size > MEDIA_INPUT_LIMIT) {
                await reader.cancel();
                return error('INVALID_INPUT', 413);
              }
              chunks.push(Buffer.from(value));
            }
          } finally {
            reader.releaseLock();
          }
          media = await normalizeProjectImage(
            Buffer.concat(chunks),
            request.headers.get('content-type')?.split(';')[0],
            collection,
          );
        } catch {
          return error('INVALID_INPUT', 400);
        }
        if (collection === 'projects') {
          const storageUrl = `${env.SUPABASE_URL}/storage/v1/object/cms-media/projects/${media.image.split('/').pop()}`;
          const ures = await fetchImpl(storageUrl, {
            method: 'POST',
            headers: {
              Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
              'Content-Type': 'image/webp',
            },
            body: Buffer.from(media.data, 'base64'),
            signal: AbortSignal.timeout(30000),
          });
          if (!ures.ok) return error('SERVER_ERROR', 502);
          return json({
            ok: true,
            data: { image: media.image },
            csrf: session.csrf,
          });
        }
        const result = await gas(
          cfg,
          session.token,
          'upload',
          media,
          collection,
        );
        if (result.ok && result.data.image !== media.image)
          fail('SERVER_ERROR');
        return json(
          result.ok ? { ...result, csrf: session.csrf } : result,
          result.error?.code === 'UNAUTHORIZED' ? 403 : 200,
        );
      }
      let operation = 'load',
        payload;
      if (request.method === 'POST') {
        if (
          request.headers.get('content-type')?.split(';')[0] !==
          'application/json'
        )
          return error('INVALID_INPUT', 415);
        let body;
        try {
          body = await boundedJson(request, LIMIT);
        } catch {
          return error('INVALID_INPUT', 400);
        }
        if (
          !body ||
          typeof body !== 'object' ||
          Object.keys(body).some(
            (k) => !['operation', 'payload'].includes(k),
          ) ||
          (collection !== 'projects' && !Object.hasOwn(RPC, body.operation)) ||
          ['load', 'upload', 'media'].includes(body.operation)
        )
          return error('INVALID_INPUT', 400);
        operation = body.operation;
        payload = body.payload;
        if (operation === 'retry' && payload !== undefined)
          return error('INVALID_INPUT', 400);
        if (
          operation !== 'retry' &&
          (!payload || typeof payload !== 'object' || Array.isArray(payload))
        )
          return error('INVALID_INPUT', 400);
      }
      let result;
      if (collection === 'projects') {
        result = await projectsOperation(
          cfg,
          env,
          session.token,
          operation,
          payload,
        );
      } else {
        result = await gas(cfg, session.token, operation, payload, collection);
      }
      const response = json(
        result.ok ? { ...result, csrf: session.csrf } : result,
        result.error?.code === 'UNAUTHORIZED' ? 403 : 200,
      );
      if (result.error?.code === 'UNAUTHORIZED')
        response.headers.set('Set-Cookie', cookie(cfg, 'session', '', 0));
      return response;
    } catch (e) {
      return error(
        e.code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'SERVER_ERROR',
        e.code === 'UNAUTHORIZED' ? 401 : 502,
      );
    }
  };
}
