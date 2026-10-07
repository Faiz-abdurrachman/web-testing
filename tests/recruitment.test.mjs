import test from 'node:test';
import assert from 'node:assert/strict';
import * as contract from '../server/recruitment-contract.mjs';
import {
  canonicalContentHash,
  createRecruitmentHandler,
} from '../server/recruitment.mjs';

const id = '22345678-1234-4123-8123-123456789abc';
const fields = () => ({
  full_name: 'Admin Test',
  preferred_name: 'Admin',
  email: 'admin@example.test',
  whatsapp: '+628123456789',
  institution: 'Test',
  city_region: 'Test',
  current_status: 'University Student',
  current_level: 'Foundation',
  primary_hods: 'data',
  most_relevant_work: 'Test project',
  real_world_problem: 'Test problem',
  explore_or_build: 'Test research',
  why_join: 'Test learning',
  time_commitment: '2–4 hours',
  best_description: 'C',
  independent_learning: 'Yes',
  agreement_1: 'on',
  agreement_2: 'on',
  agreement_3: 'on',
  foundation_skills: ['Python', 'SQL'],
  learning_methods: ['Self-learning', 'Books / Articles'],
});

const serviceKey = 'test-only-service-role-key-not-a-real-credential-0000';
const supabaseEnv = {
  RECRUITMENT_OPEN: 'true',
  SUPABASE_URL: 'https://testproject.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: serviceKey,
  SUPABASE_ANON_KEY: 'test-anon-key',
  CMS_ADMIN_ORIGIN: 'https://recruitment.test',
};
const rpcUrl =
  'https://testproject.supabase.co/rest/v1/rpc/submit_recruitment_application';
const request = (body = { id, fields: fields(), website: '' }, headers = {}) =>
  new Request('https://recruitment.test/api/recruitment/application', {
    method: 'POST',
    headers: {
      origin: 'https://recruitment.test',
      'content-type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });
const rpcJson = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });

// Pass 1 tests (from recruitment.test.mjs)
test('contract validates every domain and rejects incomplete/foreign answers', () => {
  for (const domain of contract.DOMAINS)
    assert.equal(
      contract.validateApplication({
        ...fields(),
        primary_hods: domain.id,
        specific_area: domain.specificAreas[0],
        foundation_skills: [domain.skills[0].items[0]],
      }).primary_hods,
      domain.id,
    );
  for (const name of [...contract.REQUIRED_TEXT, ...contract.REQUIRED_CHOICES])
    assert.throws(() =>
      contract.validateApplication({ ...fields(), [name]: '' }),
    );
  for (const changed of [
    { email: 'bad' },
    { whatsapp: 'abc' },
    { portfolio_link: 'javascript:alert(1)' },
    { foundation_skills: ['Photoshop'] },
    { learning_methods: 'Self-learning' },
    { learning_methods: ['Self-learning', 'Self-learning'] },
    { unknown: 'secret' },
    { full_name: 'x'.repeat(201) },
  ])
    assert.throws(() =>
      contract.validateApplication({ ...fields(), ...changed }),
    );
});
test('missing configuration and closed intake fail closed', async () => {
  for (const settings of [
    {},
    { ...supabaseEnv, RECRUITMENT_OPEN: 'false' },
    { ...supabaseEnv, SUPABASE_URL: 'https://attacker.test' },
    { ...supabaseEnv, SUPABASE_URL: 'http://testproject.supabase.co' },
    { ...supabaseEnv, SUPABASE_SERVICE_ROLE_KEY: 'short' },
  ]) {
    const handle = createRecruitmentHandler({
      env: settings,
      fetchImpl: () => {
        throw Error('must not fetch');
      },
    });
    assert.equal((await handle(request())).status, 503);
    assert.deepEqual(
      await (
        await handle(
          new Request('https://recruitment.test/api/recruitment/application'),
        )
      ).json(),
      { ok: true, accepting: false },
    );
  }
});
test('intake rejects foreign origin, malformed payload, honeypot and oversized body before upstream', async () => {
  const handle = createRecruitmentHandler({
    env: supabaseEnv,
    fetchImpl: () => {
      throw Error('must not fetch');
    },
  });
  assert.equal(
    (await handle(request(undefined, { origin: 'https://attacker.test' })))
      .status,
    403,
  );
  assert.equal(
    (await handle(request({ id, fields: fields(), website: 'spam' }))).status,
    400,
  );
  assert.equal(
    (await handle(request({ id: 'bad', fields: fields(), website: '' })))
      .status,
    400,
  );
  assert.equal(
    (
      await handle(
        request({
          id,
          fields: { ...fields(), full_name: 'x'.repeat(40000) },
          website: '',
        }),
      )
    ).status,
    413,
  );
});
test('server calls the exposed RPC with a canonical payload and only the service key', async () => {
  const calls = [];
  const handle = createRecruitmentHandler({
    env: supabaseEnv,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return rpcJson(200, { receipt: id, status: 'inserted' });
    },
  });
  const payload = await (await handle(request())).json();
  assert.deepEqual(payload, { ok: true, receipt: id });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, rpcUrl);
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.apikey, serviceKey);
  assert.equal(calls[0].init.headers.Authorization, `Bearer ${serviceKey}`);
  const sent = JSON.parse(calls[0].init.body);
  const validated = contract.validateApplication(fields());
  assert.deepEqual(Object.keys(sent).sort(), [
    'p_fields',
    'p_hash',
    'p_receipt',
  ]);
  assert.equal(sent.p_receipt, id);
  assert.equal(sent.p_hash, canonicalContentHash(validated));
  assert.deepEqual(sent.p_fields, validated);
  assert.equal(JSON.stringify(payload).includes(serviceKey), false);
});
test('duplicate retry returns the same receipt without a false second insert', async () => {
  const handle = createRecruitmentHandler({
    env: supabaseEnv,
    fetchImpl: async () => rpcJson(200, { receipt: id, status: 'duplicate' }),
  });
  assert.deepEqual(await (await handle(request())).json(), {
    ok: true,
    receipt: id,
  });
});
test('same receipt with changed answers is an ID_CONFLICT, not a false success', async () => {
  const handle = createRecruitmentHandler({
    env: supabaseEnv,
    fetchImpl: async () =>
      rpcJson(400, { code: 'P0001', message: 'ID_CONFLICT' }),
  });
  const response = await handle(request());
  assert.equal(response.status, 409);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: 'ID_CONFLICT' },
  });
});
test('unconfirmed upstream never reports success or retries the mutation', async () => {
  for (const response of [
    () => rpcJson(200, { receipt: 'wrong', status: 'inserted' }),
    () => rpcJson(200, { receipt: id, status: 'unknown' }),
    () => rpcJson(500, { message: 'boom' }),
    () => rpcJson(403, { message: 'denied' }),
    () => new Response('not json', { status: 200 }),
    () => {
      throw Error('private upstream details');
    },
  ]) {
    let count = 0;
    const handle = createRecruitmentHandler({
      env: supabaseEnv,
      fetchImpl: async () => {
        count++;
        return response();
      },
    });
    const result = await handle(request());
    assert.equal(result.status, 502);
    assert.deepEqual(await result.json(), {
      ok: false,
      error: { code: 'UNCONFIRMED' },
    });
    assert.equal(count, 1);
  }
});

// Pass 2 — Admin read tests
import { createRecruitmentAdminHandler } from '../server/recruitment-admin.mjs';

const adminId = 'admin-test-uuid-1234-5678';
const adminUrl = 'https://recruitment.test/api/admin/recruitment';
const makeRequest = (route, method = 'GET', token = 'test-valid-token') =>
  new Request(adminUrl + '/' + route, {
    method,
    headers: {
      cookie: 'sb-access-token=' + token,
      origin: 'https://recruitment.test',
      'content-type': 'application/json',
    },
  });

function mockRpc(name, result) {
  return async (url, init) => {
    if (url.includes('auth/v1/user')) {
      return new Response(
        JSON.stringify({ id: adminId, email: 'admin@test.test' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.includes(name)) {
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    // Default for non-matching RPC: return ok
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
}

test('admin routes without auth return 401', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: async () => new Response('{}', { status: 401 }),
  });
  const req = new Request(adminUrl + '/applications', { method: 'GET' });
  const response = await handle(req, 'list');
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: 'UNAUTHORIZED' },
  });
});

test('admin list returns applications when authorized', async () => {
  const mockData = {
    applications: [
      {
        receipt: id,
        full_name: 'Test User',
        email: 'test@test.test',
        primary_hods: 'data',
        received_at: '2026-10-07T00:00:00Z',
        schema_version: 1,
      },
    ],
    total: 1,
    filtered: 1,
  };
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: mockRpc('admin_list_applications', mockData),
  });
  const response = await handle(makeRequest('applications'), 'list');
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.ok, true);
  assert.deepEqual(result.data, mockData);
});

test('admin list supports search and filter params', async () => {
  const mockData = {
    applications: [
      {
        receipt: id,
        full_name: 'Filtered User',
        email: 'filter@test.test',
        primary_hods: 'core',
        received_at: '2026-10-07T00:00:00Z',
        schema_version: 1,
      },
    ],
    total: 1,
    filtered: 1,
  };
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: mockRpc('admin_list_applications', mockData),
  });
  const req = new Request(
    adminUrl +
      '/applications?search=filter&primary_hods=core&limit=10&offset=0',
    {
      method: 'GET',
      headers: {
        cookie: 'sb-access-token=valid',
        origin: 'https://recruitment.test',
      },
    },
  );
  const response = await handle(req, 'list');
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.data.applications.length, 1);
  assert.equal(result.data.applications[0].primary_hods, 'core');
});

test('admin detail returns full application data', async () => {
  const mockDetail = {
    found: true,
    receipt: id,
    content_hash: 'a'.repeat(64),
    received_at: '2026-10-07T00:00:00Z',
    schema_version: 1,
    fields: { full_name: 'Detail User', email: 'detail@test.test' },
    email: 'detail@test.test',
    full_name: 'Detail User',
    primary_hods: 'data',
    agreement_1: true,
    agreement_2: true,
    agreement_3: true,
  };
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: mockRpc('admin_get_application', mockDetail),
  });
  const req = new Request(adminUrl + '/application?receipt=' + id, {
    method: 'GET',
    headers: {
      cookie: 'sb-access-token=valid',
      origin: 'https://recruitment.test',
    },
  });
  const response = await handle(req, 'detail');
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.data.found, true);
  assert.equal(result.data.full_name, 'Detail User');
});

test('admin detail for missing receipt returns 404', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: mockRpc('admin_get_application', { found: false }),
  });
  const req = new Request(adminUrl + '/application?receipt=' + id, {
    method: 'GET',
    headers: {
      cookie: 'sb-access-token=valid',
      origin: 'https://recruitment.test',
    },
  });
  const response = await handle(req, 'detail');
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: 'NOT_FOUND' },
  });
});

test('admin stats returns aggregated counts', async () => {
  const mockStats = {
    total: 3,
    by_hods: [
      { hods: 'data', count: 2 },
      { hods: 'core', count: 1 },
    ],
  };
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: mockRpc('admin_get_stats', mockStats),
  });
  const response = await handle(makeRequest('stats'), 'stats');
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.data.total, 3);
  assert.equal(result.data.by_hods.length, 2);
});

test('admin route without valid receipt format returns 400', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
  });
  const req = new Request(adminUrl + '/application?receipt=not-a-uuid', {
    method: 'GET',
    headers: {
      cookie: 'sb-access-token=valid',
      origin: 'https://recruitment.test',
    },
  });
  const response = await handle(req, 'detail');
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: { code: 'INVALID_INPUT' },
  });
});

test('admin audit log is written after every successful read', async () => {
  const auditCalls = [];
  const fetchImpl = async (url, init) => {
    if (url.includes('auth/v1/user')) {
      return new Response(
        JSON.stringify({ id: adminId, email: 'audit@test.test' }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.includes('admin_audit_write')) {
      auditCalls.push(JSON.parse(init.body));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }
    if (url.includes('admin_list_applications')) {
      return new Response(
        JSON.stringify({ applications: [], total: 0, filtered: 0 }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    }
    if (url.includes('admin_verify_identity')) {
      return new Response(
        JSON.stringify({ ok: true, email: 'audit@test.test' }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      );
    }
    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };
  const handle = createRecruitmentAdminHandler({ env: supabaseEnv, fetchImpl });
  await handle(makeRequest('applications'), 'list');
  assert.equal(auditCalls.length, 1);
  assert.equal(auditCalls[0].p_action, 'admin_read_list');
  assert.equal(auditCalls[0].p_actor_id, adminId);
});

test('login redirects to Supabase with a PKCE challenge and verifier cookie', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: () => {
      throw Error('must not fetch');
    },
  });
  const response = await handle(
    new Request(adminUrl + '/login', { method: 'GET' }),
    'login',
  );
  assert.equal(response.status, 303);
  const location = new URL(response.headers.get('location'));
  assert.equal(
    location.origin + location.pathname,
    'https://testproject.supabase.co/auth/v1/authorize',
  );
  assert.equal(location.searchParams.get('provider'), 'google');
  assert.equal(
    location.searchParams.get('redirect_to'),
    'https://recruitment.test/api/admin/recruitment/callback',
  );
  assert.equal(location.searchParams.get('code_challenge_method'), 's256');
  assert.ok((location.searchParams.get('code_challenge') || '').length >= 40);
  const setCookie = response.headers.get('set-cookie') || '';
  assert.match(setCookie, /sb-pkce=/);
  assert.match(setCookie, /HttpOnly/);
});

test('callback exchanges the code for tokens and sets HttpOnly session cookies', async () => {
  const calls = [];
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      if (url.includes('/auth/v1/token?grant_type=pkce')) {
        return new Response(
          JSON.stringify({
            access_token: 'access-abc',
            refresh_token: 'refresh-abc',
            expires_in: 3600,
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }
      throw Error('unexpected fetch ' + url);
    },
  });
  const req = new Request(adminUrl + '/callback?code=the-code', {
    method: 'GET',
    headers: { cookie: 'sb-pkce=the-verifier' },
  });
  const response = await handle(req, 'callback');
  assert.equal(response.status, 303);
  assert.equal(
    response.headers.get('location'),
    'https://recruitment.test/admin/recruitment/',
  );
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some((c) => /^sb-access-token=access-abc/.test(c)));
  assert.ok(cookies.some((c) => /^sb-refresh-token=refresh-abc/.test(c)));
  assert.ok(cookies.some((c) => /^sb-pkce=;/.test(c)));
  assert.ok(cookies.filter((c) => /HttpOnly/.test(c)).length >= 3);
  assert.equal(calls.length, 1);
  const sent = JSON.parse(calls[0].init.body);
  assert.equal(sent.auth_code, 'the-code');
  assert.equal(sent.code_verifier, 'the-verifier');
});

test('callback without a code fails closed to a login error', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: () => {
      throw Error('must not fetch');
    },
  });
  const response = await handle(
    new Request(adminUrl + '/callback', { method: 'GET' }),
    'callback',
  );
  assert.equal(response.status, 303);
  assert.match(response.headers.get('location'), /login=failed/);
});

test('logout clears the session cookies', async () => {
  const handle = createRecruitmentAdminHandler({
    env: supabaseEnv,
    fetchImpl: () => {
      throw Error('must not fetch');
    },
  });
  const response = await handle(
    new Request(adminUrl + '/logout', { method: 'GET' }),
    'logout',
  );
  assert.equal(response.status, 303);
  const cookies = response.headers.getSetCookie();
  assert.ok(cookies.some((c) => /^sb-access-token=;/.test(c)));
  assert.ok(cookies.some((c) => /^sb-refresh-token=;/.test(c)));
});
