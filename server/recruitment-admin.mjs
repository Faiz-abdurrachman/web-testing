import { createHash } from 'node:crypto';

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

function config(env) {
  const url = new URL(env.SUPABASE_URL || '');
  if (
    url.protocol !== 'https:' ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)
  )
    throw new Error();
  return {
    rpc: url.origin + '/rest/v1/rpc',
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    anon: env.SUPABASE_ANON_KEY || '',
    origin: new URL(env.CMS_ADMIN_ORIGIN || env.SITE_URL || '').origin,
  };
}

export function createRecruitmentAdminHandler({
  env = process.env,
  fetchImpl = fetch,
  clock = Date.now,
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
    if (!accessToken) return null;

    const baseUrl = new URL(cfg.rpc).origin;
    const response = await fetchImpl(`${baseUrl}/auth/v1/user`, {
      headers: {
        apikey: cfg.anon,
        Authorization: `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return null;
    const user = await response.json();
    if (!user?.id) return null;

    // Check allowlist
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

  return async (request, route) => {
    try {
      config(env);
    } catch {
      return error('CONFIGURATION', 503);
    }

    if (route === 'login' && request.method === 'GET') {
      try {
        const cfg = config(env);
        const baseUrl = new URL(cfg.rpc).origin;
        const supabaseAuthUrl = `${baseUrl}/auth/v1/authorize?provider=google`;
        return Response.redirect(supabaseAuthUrl, 303);
      } catch {
        return error('CONFIGURATION', 503);
      }
    }

    if (route === 'callback' && request.method === 'GET') {
      // Supabase Auth callback is handled by Supabase itself.
      // The redirect URL configured in Supabase dashboard points to:
      // https://<site>/api/admin/recruitment/callback
      // After successful auth, Supabase sets the session cookies and
      // redirects back to the admin page.
      const url = new URL(request.url);
      const accessToken = url.searchParams.get('access_token');
      const refreshToken = url.searchParams.get('refresh_token');
      if (accessToken) {
        // Set cookies and redirect to admin recruitment page
        const response = Response.redirect(
          new URL('/admin/recruitment', request.url).href,
          303,
        );
        const maxAge = 3600 * 24; // 24 hours
        response.headers.append(
          'Set-Cookie',
          `sb-access-token=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`,
        );
        if (refreshToken) {
          response.headers.append(
            'Set-Cookie',
            `sb-refresh-token=${refreshToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Secure`,
          );
        }
        return response;
      }
      return Response.redirect(
        new URL('/admin/recruitment?login=failed', request.url).href,
        303,
      );
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
          filters = await request.json().catch(() => ({}));
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
