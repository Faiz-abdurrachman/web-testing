import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import * as contract from '../server/recruitment-contract.mjs';
import { createRecruitmentHandler } from '../server/recruitment.mjs';

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
const env = {
  RECRUITMENT_OPEN: 'true',
  RECRUITMENT_GAS_URL:
    'https://script.google.com/macros/s/test-deployment/exec',
  RECRUITMENT_GAS_TOKEN: 'test-only-token-never-real-credential',
  CMS_ADMIN_ORIGIN: 'https://recruitment.test',
};
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
    { ...env, RECRUITMENT_OPEN: 'false' },
    { ...env, RECRUITMENT_GAS_URL: 'https://attacker.test/exec' },
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
    env,
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
test('Google redirect is GET without token/body; success requires matching confirmed receipt', async () => {
  const calls = [];
  const handle = createRecruitmentHandler({
    env,
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return calls.length === 1
        ? new Response(null, {
            status: 302,
            headers: {
              location:
                'https://script.googleusercontent.com/macros/echo?fixture=test',
            },
          })
        : Response.json({ ok: true, receipt: id, private: 'must not leak' });
    },
  });
  const result = await handle(request());
  assert.deepEqual(await result.json(), { ok: true, receipt: id });
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[1].init.method, 'GET');
  assert.equal(calls[1].init.body, undefined);
  assert.equal(calls[1].init.headers, undefined);
});
test('unconfirmed response has no automatic mutation retry or false success', async () => {
  for (const response of [
    () => Response.json({ ok: true, receipt: 'wrong' }),
    () =>
      Response.json({
        ok: false,
        error: { code: 'SERVER_ERROR' },
        token: 'never leak',
      }),
    () =>
      new Response(null, {
        status: 302,
        headers: { location: 'https://attacker.test/' },
      }),
    () => {
      throw Error('private upstream details');
    },
  ]) {
    let count = 0;
    const handle = createRecruitmentHandler({
      env,
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
            RECRUITMENT_GAS_TOKEN: env.RECRUITMENT_GAS_TOKEN,
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
test('GAS writes once, formula-safe, locked and flushed; retry is idempotent', async () => {
  const gas = await gasFixture(),
    body = {
      id,
      token: env.RECRUITMENT_GAS_TOKEN,
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
test('GAS rejects wrong token and invalid fields without writing', async () => {
  const gas = await gasFixture();
  assert.equal(
    gas.post({ id, token: 'wrong', fields: fields() }).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(
    gas.post({
      id,
      token: env.RECRUITMENT_GAS_TOKEN,
      fields: { ...fields(), agreement_1: '' },
    }).error.code,
    'INVALID_INPUT',
  );
  assert.equal(gas.rows.length, 1);
});
