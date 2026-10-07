import { createCmsAuth } from './cms-auth.mjs';

// Legacy scope list retained for compatibility with existing tests/tools only.
// CMS auth no longer performs Google OAuth; see docs/cms-auth-design.md.
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

// Only routing/collection context is needed here; session + origin/CSRF
// authorization lives in server/cms-auth.mjs.
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
  return { origin: origin.origin, secure };
}
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
  // Isolated CMS auth (Supabase password). See docs/cms-auth-design.md.
  const auth = createCmsAuth({ env, clock, fetchImpl });

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

  const wrapPayload = (p) =>
    p && typeof p === 'object' ? JSON.stringify(p) : p;

  async function teamOperation(cfg, env, token, operation, payload) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const mgmtToken = env.SUPABASE_ACCESS_TOKEN;
    if (!supabaseUrl || !supabaseKey || !mgmtToken) fail('CONFIGURATION');

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

    const queryWrite = async (query) => {
      const res = await fetchImpl(
        'https://api.supabase.com/v1/projects/yejrdckcmlxrkklgtrwy/database/query',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + mgmtToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(30000),
        },
      );
      if (!res.ok) fail('SERVER_ERROR');
      const rows = await res.json();
      if (!rows.length) fail('SERVER_ERROR');
      const key = Object.keys(rows[0])[0];
      return rows[0][key];
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
      return sanitize({ ok: true, data: await rpc('cms_load_team') });
    }

    if (operation === 'save' || operation === 'add' || operation === 'delete') {
      const fnName =
        operation === 'save'
          ? 'cms_save_member'
          : operation === 'add'
            ? 'cms_add_member'
            : 'cms_delete_member';
      const escaped =
        payload && typeof payload === 'object'
          ? JSON.stringify(payload).replace(/'/g, "''")
          : String(payload || '').replace(/'/g, "''");
      const result = await queryWrite(
        `select * from public.${fnName}('${escaped}'::jsonb)`,
      );
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

  async function projectsOperation(cfg, env, token, operation, payload) {
    const supabaseUrl = env.SUPABASE_URL;
    const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
    const mgmtToken = env.SUPABASE_ACCESS_TOKEN;
    if (!supabaseUrl || !supabaseKey || !mgmtToken) fail('CONFIGURATION');

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

    const queryWrite = async (query) => {
      const res = await fetchImpl(
        'https://api.supabase.com/v1/projects/yejrdckcmlxrkklgtrwy/database/query',
        {
          method: 'POST',
          headers: {
            Authorization: 'Bearer ' + mgmtToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query }),
          signal: AbortSignal.timeout(30000),
        },
      );
      if (!res.ok) fail('SERVER_ERROR');
      const rows = await res.json();
      if (!rows.length) fail('SERVER_ERROR');
      const key = Object.keys(rows[0])[0];
      return rows[0][key];
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
      const fnName =
        operation === 'save'
          ? 'cms_save_project'
          : operation === 'add'
            ? 'cms_add_project'
            : 'cms_delete_project';
      const escaped =
        payload && typeof payload === 'object'
          ? JSON.stringify(payload).replace(/'/g, "''")
          : String(payload || '').replace(/'/g, "''");
      const result = await queryWrite(
        `select * from public.${fnName}('${escaped}'::jsonb)`,
      );
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
    // Auth routes delegate to the isolated CMS auth module.
    if (route === 'login') return auth.login(request);
    if (route === 'logout') return auth.logout(request);
    if (route === 'refresh') return auth.refresh(request);
    // Legacy OAuth callback is retired; fail safe without leaking parameters.
    if (route === 'callback')
      return Response.redirect('/admin/?login=failed', 303);

    let cfg;
    try {
      cfg = config(env);
    } catch {
      return error('CONFIGURATION', 503);
    }
    const url = new URL(request.url);
    if (url.origin !== cfg.origin) return error('UNAUTHORIZED', 403);
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
      if (
        !['projects', 'team', 'media'].includes(route) ||
        !['GET', 'POST'].includes(request.method)
      )
        return error('INVALID_INPUT', 405);
      // Trusted Auth identity + CMS permission per request.
      const guard = await auth.authorize(request);
      if (guard.error) return guard.error;
      const session = guard.session;
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
          if (collection === 'projects' || collection === 'team') {
            const storageUrl = `${env.SUPABASE_URL}/storage/v1/object/cms-media/${image.replace(/^\/images\/cms\//, '')}`;
            const sres = await fetchImpl(storageUrl, {
              headers: {
                Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
              },
              signal: AbortSignal.timeout(15000),
            });
            if (!sres.ok) return error('NOT_FOUND', 404);
            const bytes = await sres.arrayBuffer();
            const mediaHeaders = { ...headers, 'Content-Type': 'image/webp' };
            if (guard.setCookie) mediaHeaders['Set-Cookie'] = guard.setCookie;
            return new Response(bytes, { headers: mediaHeaders });
          }
          const result = await gas(
            cfg,
            undefined,
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
          const uploaded = json({
            ok: true,
            data: { image: media.image },
            csrf: session.csrf,
          });
          if (guard.setCookie)
            uploaded.headers.append('Set-Cookie', guard.setCookie);
          return uploaded;
        }
        if (collection === 'team') {
          const storageUrl = `${env.SUPABASE_URL}/storage/v1/object/cms-media/team/${media.image.split('/').pop()}`;
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
          const uploaded = json({
            ok: true,
            data: { image: media.image },
            csrf: session.csrf,
          });
          if (guard.setCookie)
            uploaded.headers.append('Set-Cookie', guard.setCookie);
          return uploaded;
        }
        const result = await gas(cfg, undefined, 'upload', media, collection);
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
          (collection !== 'projects' &&
            collection !== 'team' &&
            !Object.hasOwn(RPC, body.operation)) ||
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
          undefined,
          operation,
          payload,
        );
      } else if (collection === 'team') {
        result = await teamOperation(cfg, env, undefined, operation, payload);
      } else {
        result = await gas(cfg, undefined, operation, payload, collection);
      }
      const response = json(
        result.ok ? { ...result, csrf: session.csrf } : result,
        result.error?.code === 'UNAUTHORIZED' ? 403 : 200,
      );
      // Propagate a refreshed session cookie when the guard rotated it.
      if (guard.setCookie)
        response.headers.append('Set-Cookie', guard.setCookie);
      return response;
    } catch (e) {
      return error(
        e.code === 'UNAUTHORIZED' ? 'UNAUTHORIZED' : 'SERVER_ERROR',
        e.code === 'UNAUTHORIZED' ? 401 : 502,
      );
    }
  };
}
