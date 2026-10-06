import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as contract from '../server/recruitment-contract.mjs';
import {
  canonicalContentHash,
  createRecruitmentHandler,
} from '../server/recruitment.mjs';

const id = '12345678-1234-4123-8123-123456789abc';
const fields = () => ({
  full_name: 'Test Applicant',
  preferred_name: 'Test',
  email: 'test@example.test',
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

// Legacy, uninstalled GAS source kept until the removal pass (see
// docs/cms-supabase-migration-plan.md §9). It is not part of the live path.
const gasToken = 'test-only-token-never-real-credential';
async function gasFixture() {
  const rows = [
    ['receipt', 'content_hash', 'received_at', ...contract.APPLICATION_FIELDS],
  ];
  let flushes = 0,
    locks = 0,
    releases = 0;
  const sheet = {
    getLastRow: () => rows.length,
    getRange: (r, c, n, w) => ({
      getValues: () =>
        Array.from({ length: n }, (_, i) =>
          Array.from(
            { length: w },
            (_, j) => rows[r - 1 + i]?.[c - 1 + j] ?? '',
          ),
        ),
      setNumberFormat() {
        return this;
      },
      setValues(values) {
        for (let i = 0; i < values.length; i++) rows[r - 1 + i] = values[i];
        return this;
      },
    }),
  };
  const context = vm.createContext({
    ...contract,
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) =>
          ({
            RECRUITMENT_GAS_TOKEN: gasToken,
            RECRUITMENT_SHEET_ID: 'fixture-private-sheet',
            RECRUITMENT_OPEN: 'true',
          })[key],
      }),
    },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_, text) => [
        ...createHash('sha256').update(text).digest(),
      ],
    },
    LockService: {
      getScriptLock: () => ({
        waitLock() {
          locks++;
        },
        releaseLock() {
          releases++;
        },
      }),
    },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet }),
      flush() {
        flushes++;
      },
    },
    ContentService: {
      MimeType: { JSON: 'json' },
      createTextOutput: (text) => ({ setMimeType: () => JSON.parse(text) }),
    },
  });
  vm.runInContext(
    contract.validateApplication.toString() +
      '\n' +
      (await readFile(
        new URL('../recruitment/gas/intake.js', import.meta.url),
        'utf8',
      )),
    context,
  );
  const post = (body) =>
    context.doPost({ postData: { contents: JSON.stringify(body) } });
  return { post, rows, counts: () => ({ flushes, locks, releases }) };
}
test('legacy GAS source writes once, formula-safe, locked and flushed; retry is idempotent', async () => {
  const gas = await gasFixture(),
    body = {
      id,
      token: gasToken,
      fields: { ...fields(), full_name: '=IMPORTXML("fixture")' },
    };
  assert.equal(gas.post(body).ok, true);
  assert.equal(gas.post(body).ok, true);
  assert.equal(gas.rows.length, 2);
  assert.equal(
    gas.rows[1][3 + contract.APPLICATION_FIELDS.indexOf('full_name')],
    '\'=IMPORTXML("fixture")',
  );
  assert.equal(gas.counts().flushes, 1);
  assert.equal(gas.counts().locks, gas.counts().releases);
  assert.equal(
    gas.post({ ...body, fields: { ...fields(), full_name: 'changed' } }).error
      .code,
    'ID_CONFLICT',
  );
  assert.equal(gas.rows.length, 2);
});
test('legacy GAS source rejects wrong token and invalid fields without writing', async () => {
  const gas = await gasFixture();
  assert.equal(
    gas.post({ id, token: 'wrong', fields: fields() }).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(
    gas.post({
      id,
      token: gasToken,
      fields: { ...fields(), agreement_1: '' },
    }).error.code,
    'INVALID_INPUT',
  );
  assert.equal(gas.rows.length, 1);
});
