import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAdminHandler } from '../server/cms-admin.mjs';
const origin = 'https://admin.example.test';
const env = {
  NODE_ENV: 'production',
  CMS_ADMIN_ORIGIN: origin,
  CMS_ADMIN_SESSION_SECRET: Buffer.alloc(32, 7).toString('base64'),
  CMS_ADMIN_GOOGLE_CLIENT_ID: 'private-client',
  CMS_ADMIN_GOOGLE_CLIENT_SECRET: 'private-secret',
  CMS_ADMIN_API_DEPLOYMENT_ID: 'private-deployment',
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'placeholder-anon',
  SUPABASE_SERVICE_ROLE_KEY: 'placeholder',
  SUPABASE_ACCESS_TOKEN: 'placeholder-token',
  CMS_DEPLOY_HOOK_TESTING: '',
  CMS_DEPLOY_HOOK_PRODUCTION: '',
};
const USER_ID = '11111111-1111-1111-1111-111111111111';
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
    authorized = true,
    userOk = true,
    throws = false;
  const handle = createAdminHandler({
    env,
    clock: () => now,
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      if (throws) throw new Error('PRIVATE upstream details LEAK');
      const u = String(url);
      if (u.includes('/auth/v1/token'))
        return Response.json({
          access_token: 'PRIVATE-access-token',
          refresh_token: 'PRIVATE-refresh-token',
          token_type: 'bearer',
          expires_in: 3600,
          user: { id: USER_ID },
        });
      if (u.includes('/auth/v1/user')) {
        if (!userOk)
          return Response.json({ message: 'PRIVATE' }, { status: 401 });
        return Response.json({ id: USER_ID, email: 'owner@example.test' });
      }
      if (u.includes('/rest/v1/rpc/cms_verify_admin'))
        return Response.json(
          authorized
            ? { ok: true, email: 'owner@example.test' }
            : { ok: false },
        );
      if (u.includes('/rest/v1/rpc/cms_rate_limit'))
        return Response.json({ ok: true, limited: false });
      if (u.includes('/rest/v1/rpc/')) {
        if (u.includes('cms_load_team')) {
          return Response.json(
            teamData || {
              members: [],
              groups: [],
              revision: 'a'.repeat(64),
              photoPresets: [],
              minMembers: 1,
              maxMembers: 8,
              minGroups: 7,
              publicationPending: false,
              affectedId: null,
            },
          );
        }
        return Response.json(data);
      }
      if (u.includes('/database/query')) {
        if (
          teamData &&
          JSON.parse(options.body).query.includes('cms_save_member')
        )
          return Response.json([
            { cms_save_member: { ...teamData, saved: true } },
          ]);
        // Return write result — wrap in select result format
        const result = {
          saved: true,
          projects: data.projects,
          revision: 'a'.repeat(64),
          imagePresets: data.imagePresets,
          minProjects: 1,
          maxProjects: 8,
          publicationPending: false,
          affectedId: data.projects[0].id,
        };
        return Response.json([{ cms_save_project: result }]);
      }
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
      authorized = false;
    },
    unauthorized: () => {
      authorized = false;
    },
    breakUser: () => {
      userOk = false;
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
  const response = await h.handle(
    request('/api/admin/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@example.test',
        password: 'private-password',
      }),
    }),
    'login',
  );
  return { response, cookie: cookies(response) };
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
test('password login seals a private session, verifies permission and sanitizes response', async () => {
  const h = harness();
  const { response, cookie } = await login(h);
  assert.equal(response.status, 200);
  assert(response.headers.get('set-cookie').includes('HttpOnly; SameSite=Lax'));
  assert(response.headers.get('set-cookie').includes('Secure'));
  assert(cookie.startsWith('__Host-ds-admin-session='));
  assert(!cookie.includes('PRIVATE-access-token'));
  assert(!cookie.includes('PRIVATE-refresh-token'));
  const loginBody = await response.clone().json();
  assert.equal(loginBody.ok, true);
  assert.equal(loginBody.csrf.length, 43);
  // Password grant + verify RPC are called; no Google/GAS calls.
  assert(h.calls.some((c) => String(c.url).includes('/auth/v1/token')));
  assert(h.calls.some((c) => String(c.url).includes('cms_verify_admin')));
  assert(!h.calls.some((c) => String(c.url).includes('google')));
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
test('login denies bad credentials, non-owner and broken user without leaking detail', async () => {
  // missing/short body
  const h1 = harness();
  assert.equal(
    (
      await h1.handle(
        request('/api/admin/auth/login', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'owner@example.test' }),
        }),
        'login',
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await h1.handle(
        request('/api/admin/auth/login', {
          method: 'POST',
          headers: {
            Origin: 'https://evil.test',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
        }),
        'login',
      )
    ).status,
    403,
  );
  // non-owner: auth succeeds but cms_verify_admin returns ok:false
  const h2 = harness();
  h2.unauthorized();
  const denied = await login(h2);
  assert.equal(denied.response.status, 403);
  assert(!denied.cookie.includes('__Host-ds-admin-session'));
  const body = await denied.response.json();
  assert.deepEqual(body, { ok: false, error: { code: 'FORBIDDEN' } });
  // malformed JSON body fails closed without upstream calls
  const h3 = harness();
  const badBody = await h3.handle(
    request('/api/admin/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: '{not-json',
    }),
    'login',
  );
  assert.equal(badBody.status, 400);
  assert.equal(h3.calls.length, 0);
});
test('session tamper, refresh and origin binding enforce trusted identity', async () => {
  const h = harness();
  const { cookie } = await login(h);
  // Tampered sealed cookie never authorizes.
  assert.equal(
    (
      await h.handle(
        request('/', { headers: { Cookie: cookie + 'X' } }),
        'projects',
      )
    ).status,
    401,
  );
  // Same cookie value is unusable on a different origin (origin-bound AAD).
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
  // Expired access token refreshes server-side from the sealed refresh token.
  h.advance(3600001);
  const refreshed = await h.handle(
    request('/', { headers: { Cookie: cookie } }),
    'projects',
  );
  assert.equal(refreshed.status, 200);
  assert(
    h.calls.some((c) => String(c.url).includes('grant_type=refresh_token')),
  );
});
test('invalid access with no usable refresh fails closed (401)', async () => {
  const h = harness();
  const { cookie } = await login(h);
  h.breakUser();
  h.advance(3600001);
  const response = await h.handle(
    request('/', { headers: { Cookie: cookie } }),
    'projects',
  );
  assert.equal(response.status, 401);
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
  const privilegedCalls = () =>
    h.calls.filter(
      (c) =>
        String(c.url).includes('/database/query') ||
        (String(c.url).includes('/rest/v1/rpc/') &&
          !String(c.url).includes('cms_verify_admin') &&
          !String(c.url).includes('cms_rate_limit')),
    ).length;
  const gasBefore = gasCalls();
  const privilegedBefore = privilegedCalls();
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
  assert.equal(privilegedCalls(), privilegedBefore);
  assert(h.calls.length >= before);
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
  // Auth backend outage fails closed before any privileged call.
  h.throwFetch();
  const privilegedAtThrow = privilegedCalls();
  const failed = await h.handle(
    post({ operation: 'add', payload: {} }),
    'projects',
  );
  assert.equal(failed.status, 401);
  assert.equal(privilegedCalls(), privilegedAtThrow);
  assert.deepEqual(await failed.json(), {
    ok: false,
    error: { code: 'UNAUTHORIZED' },
  });
});
test('logout clears session only with CSRF and per-request permission is enforced', async () => {
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
  // Revoking CMS permission makes the very next request fail closed.
  h.deny();
  const denied = await h.handle(
    request('/', { headers: { Cookie: cookie } }),
    'projects',
  );
  assert.equal(denied.status, 403);
  assert(!JSON.stringify(await denied.json()).includes('LEAK'));
  // Restore permission then logout clears the sealed session cookie.
  const h2 = harness();
  const logged = await login(h2);
  const loaded2 = await (
    await h2.handle(
      request('/', { headers: { Cookie: logged.cookie } }),
      'projects',
    )
  ).json();
  const response = await h2.handle(
    request('/', {
      method: 'POST',
      headers: {
        Cookie: logged.cookie,
        Origin: origin,
        'X-CSRF-Token': loaded2.csrf,
      },
    }),
    'logout',
  );
  assert(response.headers.get('set-cookie').includes('Max-Age=0'));
});

test('upstream permission/backend failures are sanitized without retry', async () => {
  const { cookie } = await login(harness());
  for (const upstream of [
    Response.json(
      { error: { message: 'PRIVATE-upstream-secret' } },
      { status: 503 },
    ),
    Response.json({
      done: true,
      error: { message: 'PRIVATE-upstream-secret' },
    }),
    Response.json({
      done: true,
      response: {
        result: {
          ok: false,
          error: { code: 'UNKNOWN', message: 'PRIVATE-upstream-secret' },
        },
      },
    }),
  ]) {
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
    // getUser/refresh/verify fail closed before any privileged call, exactly once.
    assert.equal(calls, 1);
    assert.equal(response.status, 401);
    const body = await response.json();
    assert.deepEqual(body, { ok: false, error: { code: 'UNAUTHORIZED' } });
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
  assert.equal(h.calls.at(-1).url.split('/').at(-1), 'cms_load_team');
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
  assert.match(
    JSON.parse(h.calls.at(-1).options.body).query,
    /public\.cms_save_member/,
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
  // Supabase cutover authorizes via the encrypted owner session, not GAS RPC.
  const tamperedCookie = cookie.replace(/=./, '=X');
  assert.equal(
    (
      await h.handle(
        request('/api/admin/team', { headers: { Cookie: tamperedCookie } }),
        'team',
      )
    ).status,
    401,
  );
});
