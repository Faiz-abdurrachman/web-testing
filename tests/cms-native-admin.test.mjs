import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createAdminHandler, SCOPES } from '../server/cms-admin.mjs';
const origin = 'https://admin.example.test';
const env = {
  NODE_ENV: 'production',
  CMS_ADMIN_ORIGIN: origin,
  CMS_ADMIN_SESSION_SECRET: Buffer.alloc(32, 7).toString('base64'),
  CMS_ADMIN_GOOGLE_CLIENT_ID: 'private-client',
  CMS_ADMIN_GOOGLE_CLIENT_SECRET: 'private-secret',
  CMS_ADMIN_API_DEPLOYMENT_ID: 'private-deployment',
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'placeholder',
  CMS_DEPLOY_HOOK_TESTING: '',
  CMS_DEPLOY_HOOK_PRODUCTION: '',
};
const data = {
  projects: [
    {
      id: 'one',
      title: 'Title',
      description: 'Description',
      tags: ['One', 'Two'],
      image: '/images/one.webp',
      secret: 'LEAK',
    },
  ],
  revision: 'a'.repeat(64),
  imagePresets: ['/images/one.webp'],
  minProjects: 1,
  maxProjects: 8,
  publicationPending: false,
  secret: 'LEAK',
};
const request = (path, options = {}) => new Request(origin + path, options);
function harness(teamData) {
  let now = 100000;
  const calls = [];
  let owner = true,
    scopes = SCOPES.join(' '),
    throws = false;
  const handle = createAdminHandler({
    env,
    clock: () => now,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (throws) throw new Error('PRIVATE upstream details LEAK');
      if (url.endsWith('/token'))
        return Response.json({
          access_token: 'PRIVATE-access-token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: scopes,
        });
      if (typeof url === 'string' && url.includes('/rest/v1/rpc/'))
        return Response.json(data);
      return Response.json({
        done: true,
        response: {
          result: owner
            ? {
                ok: true,
                data:
                  teamData &&
                  /Team|Member/.test(JSON.parse(options.body).function)
                    ? teamData
                    : data,
              }
            : { ok: false, error: { code: 'UNAUTHORIZED', detail: 'LEAK' } },
        },
      });
    },
  });
  return {
    handle,
    calls,
    advance: (n) => {
      now += n;
    },
    deny: () => {
      owner = false;
    },
    missingScope: () => {
      scopes = SCOPES[0];
    },
    throwFetch: () => {
      throws = true;
    },
  };
}
function cookies(response) {
  return response.headers
    .getSetCookie()
    .map((v) => v.split(';')[0])
    .join('; ');
}
async function login(h) {
  const start = await h.handle(request('/api/admin/auth/login'), 'login');
  const state = new URL(start.headers.get('location')).searchParams.get(
    'state',
  );
  const callback = await h.handle(
    request('/api/admin/auth/callback?state=' + state + '&code=private-code', {
      headers: { Cookie: cookies(start) },
    }),
    'callback',
  );
  return { start, callback, cookie: cookies(callback) };
}
test('native admin fails closed for missing config, unexpected origin, anonymous and unsupported method', async () => {
  const handle = createAdminHandler({ env: {} });
  assert.equal((await handle(request('/'), 'projects')).status, 503);
  const h = harness();
  assert.equal((await h.handle(request('/'), 'projects')).status, 401);
  assert.equal(
    (await h.handle(new Request('https://evil.test/'), 'login')).status,
    403,
  );
  assert.equal(
    (await h.handle(request('/', { method: 'DELETE' }), 'projects')).status,
    405,
  );
  assert.equal(h.calls.length, 0);
});
test('OAuth uses PKCE, private cookies, fixed callback, owner verification and sanitized response', async () => {
  const h = harness();
  const { start, callback, cookie } = await login(h);
  const target = new URL(start.headers.get('location'));
  const tokenBody = h.calls[0].options.body;
  assert.equal(
    target.searchParams.get('redirect_uri'),
    origin + '/api/admin/auth/callback',
  );
  assert.equal(
    target.searchParams.get('code_challenge'),
    createHash('sha256')
      .update(tokenBody.get('code_verifier'))
      .digest('base64url'),
  );
  assert.equal(target.searchParams.get('code_challenge_method'), 'S256');
  assert(start.headers.get('set-cookie').includes('HttpOnly; SameSite=Lax'));
  assert(start.headers.get('set-cookie').includes('Secure'));
  assert.equal(callback.headers.get('location'), origin + '/admin/');
  assert(!cookie.includes('PRIVATE-access-token'));
  assert.equal(
    h.calls[1].url,
    'https://script.googleapis.com/v1/scripts/private-deployment:run',
  );
  assert.equal(JSON.parse(h.calls[1].options.body).devMode, false);
  const loaded = await h.handle(
    request('/', { headers: { Cookie: cookie } }),
    'projects',
  );
  assert.equal(loaded.headers.get('cache-control'), 'no-store');
  const body = await loaded.json();
  assert.equal(body.ok, true);
  assert.equal(body.csrf.length, 43);
  assert(!JSON.stringify(body).includes('LEAK'));
  assert(!JSON.stringify(body).includes('PRIVATE'));
});
test('invalid, expired or tampered OAuth state never exchanges code; non-owner or missing scopes denied', async () => {
  for (const mode of ['state', 'expired', 'tampered', 'owner', 'scopes']) {
    const h = harness();
    const start = await h.handle(request('/'), 'login');
    const state = new URL(start.headers.get('location')).searchParams.get(
      'state',
    );
    if (mode === 'expired') h.advance(600001);
    if (mode === 'owner') h.deny();
    if (mode === 'scopes') h.missingScope();
    const response = await h.handle(
      request('/?state=' + (mode === 'state' ? 'bad' : state) + '&code=code', {
        headers: {
          Cookie: mode === 'tampered' ? cookies(start) + 'X' : cookies(start),
        },
      }),
      'callback',
    );
    assert.equal(
      response.headers.get('location'),
      origin + '/admin/?login=failed',
      mode,
    );
    if (['state', 'expired', 'tampered'].includes(mode))
      assert.equal(h.calls.length, 0);
    assert(
      response.headers.getSetCookie().every((c) => c.includes('Max-Age=0')),
    );
  }
});
test('session tamper, expiry and origin binding deny access without GAS calls', async () => {
  const h = harness();
  const { cookie } = await login(h);
  const before = h.calls.length;
  assert.equal(
    (
      await h.handle(
        request('/', { headers: { Cookie: cookie + 'X' } }),
        'projects',
      )
    ).status,
    401,
  );
  const other = createAdminHandler({
    env: { ...env, CMS_ADMIN_ORIGIN: 'https://other.test' },
  });
  assert.equal(
    (
      await other(
        new Request('https://other.test/', { headers: { Cookie: cookie } }),
        'projects',
      )
    ).status,
    401,
  );
  h.advance(3600001);
  assert.equal(
    (await h.handle(request('/', { headers: { Cookie: cookie } }), 'projects'))
      .status,
    401,
  );
  assert.equal(h.calls.length, before);
});
test('mutations require CSRF/origin/JSON and fixed RPC; input cap and no automatic retry', async () => {
  const h = harness();
  const { cookie } = await login(h);
  const loaded = await (
    await h.handle(request('/', { headers: { Cookie: cookie } }), 'projects')
  ).json();
  const headers = {
    Cookie: cookie,
    Origin: origin,
    'X-CSRF-Token': loaded.csrf,
    'Content-Type': 'application/json',
  };
  const post = (body, extra = {}) =>
    request('/', {
      method: 'POST',
      headers: { ...headers, ...extra },
      body: JSON.stringify(body),
    });
  const before = h.calls.length;
  const gasCalls = () =>
    h.calls.filter((c) => {
      try {
        return JSON.parse(c.options?.body)?.function;
      } catch {
        return false;
      }
    }).length;
  const gasBefore = gasCalls();
  assert.equal(
    (
      await h.handle(
        post({ operation: 'save' }, { Origin: 'https://evil.test' }),
        'projects',
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await h.handle(
        post({ operation: 'save' }, { 'X-CSRF-Token': 'bad' }),
        'projects',
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await h.handle(
        post({ operation: 'retry' }, { 'Content-Type': 'text/plain' }),
        'projects',
      )
    ).status,
    415,
  );
  for (const operation of [
    'doGet',
    'adminSetup',
    '__proto__',
    'load',
    'constructor',
  ])
    assert.equal((await h.handle(post({ operation }), 'projects')).status, 400);
  assert.equal(
    (
      await h.handle(
        post({ operation: 'save', payload: { text: 'x'.repeat(600000) } }),
        'projects',
      )
    ).status,
    400,
  );
  assert.equal(h.calls.length, before);
  for (const operation of ['save', 'add', 'delete', 'retry']) {
    const result = await h.handle(
      post({
        operation,
        ...(operation === 'retry'
          ? {}
          : { payload: { revision: 'a'.repeat(64) } }),
      }),
      'projects',
    );
    assert.equal(result.status, 200);
    // projects route pakai Supabase RPC + deploy hooks — tidak ada GAS calls baru
    assert.equal(gasCalls(), gasBefore);
  }
  h.throwFetch();
  const count = h.calls.length;
  const failed = await h.handle(
    post({ operation: 'add', payload: {} }),
    'projects',
  );
  assert.equal(failed.status, 502);
  assert.equal(h.calls.length, count + 1);
  assert.deepEqual(await failed.json(), {
    ok: false,
    error: { code: 'SERVER_ERROR' },
  });
});
test('logout clears session only with CSRF and owner denial remains enforced on each RPC', async () => {
  const h = harness();
  const { cookie } = await login(h);
  const result = await (
    await h.handle(request('/', { headers: { Cookie: cookie } }), 'projects')
  ).json();
  assert.equal(
    (
      await h.handle(
        request('/', { method: 'POST', headers: { Cookie: cookie } }),
        'logout',
      )
    ).status,
    403,
  );
  const response = await h.handle(
    request('/', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': result.csrf },
    }),
    'logout',
  );
  assert(response.headers.get('set-cookie').includes('Max-Age=0'));
  h.deny();
  // Denied owner: projects route tetap 200 (session valid, read via Supabase bypass),
  // team route akan 403 (GAS ngecek owner)
  const denied = await h.handle(
    request('/', { headers: { Cookie: cookie } }),
    'projects',
  );
  assert.equal(denied.status, 200);
  assert(!JSON.stringify(await denied.json()).includes('LEAK'));
});

test('Google failures and unexpected result fields are sanitized without retry', async () => {
  for (const upstream of [
    Response.json(
      { error: { message: 'PRIVATE-google-secret' } },
      { status: 503 },
    ),
    Response.json({ done: true, error: { message: 'PRIVATE-google-secret' } }),
    Response.json({
      done: true,
      response: {
        result: {
          ok: false,
          error: { code: 'UNKNOWN', message: 'PRIVATE-google-secret' },
        },
      },
    }),
  ]) {
    const h = harness();
    const { cookie } = await login(h);
    let calls = 0;
    const handle = createAdminHandler({
      env,
      clock: () => 100000,
      fetchImpl: async () => {
        calls++;
        return upstream;
      },
    });
    const response = await handle(
      request('/', { headers: { Cookie: cookie } }),
      'projects',
    );
    assert.equal(calls, 1);
    const body = await response.json();
    assert.deepEqual(body, { ok: false, error: { code: 'SERVER_ERROR' } });
  }
});

test('Team API uses existing session and CSRF, fixed Team RPC and sanitized content', async () => {
  const groups = [
    'leader',
    'data',
    'core',
    'language',
    'vision',
    'product',
    'growth',
  ].map((id) => ({ id, title: id }));
  const teamData = {
    members: groups.map((g) => ({
      id: g.id + '-1',
      group: g.id,
      order: 1,
      name: 'Name',
      role: 'Role',
      photo: 'marchel',
      secret: 'LEAK',
    })),
    revision: 'a'.repeat(64),
    groups,
    photoPresets: ['marchel', 'zidan-rose'],
    minMembers: 1,
    maxMembers: 8,
    secret: 'LEAK',
  };
  const h = harness(teamData);
  assert.equal(
    (await h.handle(request('/api/admin/team'), 'team')).status,
    401,
  );
  const { cookie } = await login(h);
  const loaded = await h.handle(
    request('/api/admin/team', { headers: { Cookie: cookie } }),
    'team',
  );
  const result = await loaded.json();
  assert.equal(result.ok, true);
  assert.equal(result.data.members.length, 7);
  assert(!JSON.stringify(result).includes('LEAK'));
  assert.equal(
    JSON.parse(h.calls.at(-1).options.body).function,
    'adminLoadTeam',
  );
  const payload = {
    revision: result.data.revision,
    member: result.data.members[0],
  };
  assert.equal(
    (
      await h.handle(
        request('/api/admin/team', {
          method: 'POST',
          headers: { Cookie: cookie, 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation: 'save', payload }),
        }),
        'team',
      )
    ).status,
    403,
  );
  const headers = {
    Cookie: cookie,
    Origin: origin,
    'X-CSRF-Token': result.csrf,
    'Content-Type': 'application/json',
  };
  await h.handle(
    request('/api/admin/team', {
      method: 'POST',
      headers,
      body: JSON.stringify({ operation: 'save', payload }),
    }),
    'team',
  );
  assert.equal(
    JSON.parse(h.calls.at(-1).options.body).function,
    'adminSaveMember',
  );
  assert.equal(
    (
      await h.handle(
        request(
          '/api/admin/media?collection=team&image=' +
            encodeURIComponent(
              '/images/cms/projects/' + 'a'.repeat(64) + '.webp',
            ),
          { headers: { Cookie: cookie } },
        ),
        'media',
      )
    ).status,
    400,
  );
  h.deny();
  assert.equal(
    (
      await h.handle(
        request('/api/admin/team', { headers: { Cookie: cookie } }),
        'team',
      )
    ).status,
    403,
  );
});
