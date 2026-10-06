import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import {
  CMS_MAX_BYTES,
  fetchCmsSnapshot,
  syncCmsSnapshot,
} from '../scripts/cms-client.mjs';

const baseline = JSON.parse(
  await readFile(
    new URL('../src/data/cms-snapshot.json', import.meta.url),
    'utf8',
  ),
);
const endpoint = 'https://script.google.com/macros/s/test-deployment/exec';
const token = 'test-only-export-token-for-cms-tests';
const jsonResponse = (value = baseline) =>
  new Response(JSON.stringify(value), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

async function withSnapshot(run) {
  const directory = await mkdtemp(join(tmpdir(), 'ds-cms-test-'));
  const path = join(directory, 'snapshot with spaces.json');
  const original = JSON.stringify(baseline);
  await writeFile(path, original);
  try {
    await run({ directory, path, original });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('offline validates locally without calling fetch; partial config fails', async () => {
  await withSnapshot(async ({ path, original }) => {
    const fetchImpl = () => {
      throw new Error('Network must not be used offline');
    };
    assert.equal(
      await syncCmsSnapshot({ snapshotPath: path, env: {}, fetchImpl }),
      'local',
    );
    await assert.rejects(
      syncCmsSnapshot({
        snapshotPath: path,
        env: { CMS_API_TOKEN: token },
        fetchImpl,
      }),
      /both/,
    );
    assert.equal(await readFile(path, 'utf8'), original);
  });
});

test('GAS redirects return a valid payload and atomically replace the snapshot', async () => {
  await withSnapshot(async ({ path, directory }) => {
    const changed = structuredClone(baseline);
    changed.projects[0].title = 'Updated project';
    const calls = [];
    const fetchImpl = async (url, options) => {
      calls.push(new URL(url));
      assert.equal(options.redirect, 'manual');
      if (calls.length === 1) {
        assert.equal(calls[0].searchParams.get('token'), token);
        return new Response(null, {
          status: 302,
          headers: {
            location:
              'https://script.googleusercontent.com/macros/echo?user_content_key=test',
          },
        });
      }
      return jsonResponse(changed);
    };
    assert.equal(
      await syncCmsSnapshot({
        snapshotPath: path,
        env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token },
        fetchImpl,
      }),
      'remote',
    );
    assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), changed);
    assert.equal(calls.length, 2);
    assert.deepEqual(await readdir(directory), ['snapshot with spaces.json']);
  });
});

test('failed remote responses preserve the snapshot and hide credentials', async () => {
  const wrong = structuredClone(baseline);
  wrong.team.leaderTeam.pop();
  const cases = [
    async () => new Response('Forbidden', { status: 403 }),
    async () =>
      new Response('<html>Google login</html>', {
        headers: { 'content-type': 'text/html' },
      }),
    async () =>
      new Response('{broken', {
        headers: { 'content-type': 'application/json' },
      }),
    async () => jsonResponse(wrong),
    async () => jsonResponse({ error: { code: 'UNAUTHORIZED' } }),
    async () =>
      new Response(null, {
        status: 302,
        headers: { location: `https://example.com/?token=${token}` },
      }),
    async () => {
      throw new TypeError(`Request failed for ${endpoint}?token=${token}`);
    },
    async () =>
      new Response('x', {
        headers: {
          'content-type': 'application/json',
          'content-length': String(CMS_MAX_BYTES + 1),
        },
      }),
    async () =>
      new Response('x'.repeat(CMS_MAX_BYTES + 1), {
        headers: { 'content-type': 'application/json' },
      }),
  ];
  for (const fetchImpl of cases)
    await withSnapshot(async ({ path, directory, original }) => {
      await assert.rejects(
        syncCmsSnapshot({
          snapshotPath: path,
          env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token },
          fetchImpl,
        }),
        (error) => !error.message.includes(token),
      );
      assert.equal(await readFile(path, 'utf8'), original);
      assert.deepEqual(await readdir(directory), ['snapshot with spaces.json']);
    });
});

test('invalid endpoints never send a token; redirects and timeouts are bounded', async () => {
  for (const apiUrl of [
    'http://script.google.com/macros/s/id/exec',
    'https://example.com/exec',
    'https://script.google.com/macros/s/id/dev',
    `${endpoint}?token=old`,
    'not-a-url',
  ])
    await assert.rejects(
      fetchCmsSnapshot({
        apiUrl,
        apiToken: token,
        fetchImpl: () => assert.fail('Must not fetch'),
      }),
    );
  let calls = 0;
  await assert.rejects(
    fetchCmsSnapshot({
      apiUrl: endpoint,
      apiToken: token,
      fetchImpl: async () => {
        calls++;
        return new Response(null, {
          status: 302,
          headers: { location: endpoint },
        });
      },
    }),
    /redirect/,
  );
  assert.equal(calls, 4);
  await assert.rejects(
    fetchCmsSnapshot({
      apiUrl: endpoint,
      apiToken: token,
      timeoutMs: 10,
      fetchImpl: (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        }),
    }),
    /timed out/,
  );
  await assert.rejects(
    fetchCmsSnapshot({
      apiUrl: endpoint,
      apiToken: token,
      timeoutMs: 10,
      fetchImpl: async (_url, { signal }) =>
        new Response(
          new ReadableStream({
            start(controller) {
              signal.addEventListener(
                'abort',
                () =>
                  controller.error(new DOMException('Aborted', 'AbortError')),
                { once: true },
              );
            },
          }),
          { headers: { 'content-type': 'application/json' } },
        ),
    }),
    /timed out/,
  );
});

test('timeouts retry once from the export endpoint; exhausted retries preserve the snapshot', async () => {
  for (const stage of ['headers', 'body']) {
    for (const recover of [true, false]) {
      await withSnapshot(async ({ path, directory, original }) => {
        let calls = 0;
        const fetchImpl = async (url, { signal }) => {
          calls++;
          assert.equal(new URL(url).pathname, '/macros/s/test-deployment/exec');
          if (recover && calls === 2) return jsonResponse();
          if (stage === 'headers')
            return new Promise((_resolve, reject) => {
              signal.addEventListener(
                'abort',
                () => reject(new DOMException('Aborted', 'AbortError')),
                { once: true },
              );
            });
          return new Response(
            new ReadableStream({
              start(controller) {
                signal.addEventListener(
                  'abort',
                  () =>
                    controller.error(new DOMException('Aborted', 'AbortError')),
                  { once: true },
                );
              },
            }),
            { headers: { 'content-type': 'application/json' } },
          );
        };
        const sync = syncCmsSnapshot({
          snapshotPath: path,
          env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token },
          timeoutMs: 10,
          fetchImpl,
        });
        if (recover) {
          assert.equal(await sync, 'remote');
          assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), baseline);
        } else {
          await assert.rejects(sync, /timed out/);
          assert.equal(await readFile(path, 'utf8'), original);
        }
        assert.equal(calls, 2);
        assert.deepEqual(await readdir(directory), [
          'snapshot with spaces.json',
        ]);
      });
    }
  }
  for (const response of [
    () => jsonResponse({ error: { code: 'UNAUTHORIZED' } }),
    () => new Response('Forbidden', { status: 403 }),
  ]) {
    let calls = 0;
    await assert.rejects(
      fetchCmsSnapshot({
        apiUrl: endpoint,
        apiToken: token,
        fetchImpl: async () => {
          calls++;
          return response();
        },
      }),
    );
    assert.equal(calls, 1);
  }
});

test('HTTP diagnostics identify the failed hop without exposing URLs or credentials', async () => {
  for (const redirected of [false, true]) {
    let calls = 0;
    await assert.rejects(
      fetchCmsSnapshot({
        apiUrl: endpoint,
        apiToken: token,
        fetchImpl: async () => {
          calls++;
          if (redirected && calls % 2 === 1)
            return new Response(null, {
              status: 302,
              headers: {
                location: `https://script.googleusercontent.com/macros/echo?user_content_key=private-key&token=${token}`,
              },
            });
          return new Response(`private-body ${token}`, { status: 404 });
        },
      }),
      (error) => {
        assert.match(error.message, /HTTP status 404/);
        assert.match(
          error.message,
          redirected
            ? /script.googleusercontent.com \(redirects=1/
            : /script.google.com \(redirects=0/,
        );
        assert.match(error.message, /endpoint=[a-f0-9]{12}/);
        for (const secret of [
          token,
          'private-key',
          'private-body',
          'test-deployment',
        ])
          assert(!error.message.includes(secret));
        return true;
      },
    );
    assert.equal(calls, redirected ? 4 : 1);
  }
});

test('redirect 404 retries with a fresh export request; exhaustion leaves snapshot intact', async () => {
  for (const recover of [true, false]) {
    await withSnapshot(async ({ path, original, directory }) => {
      const calls = [];
      const fetchImpl = async (value, options) => {
        const url = new URL(value);
        calls.push(url);
        assert.equal(options.cache, 'no-store');
        assert.equal(options.headers['Cache-Control'], 'no-cache');
        if (url.hostname === 'script.google.com')
          return new Response(null, {
            status: 302,
            headers: {
              location: `https://script.googleusercontent.com/macros/echo?user_content_key=attempt-${calls.length}`,
            },
          });
        if (recover && calls.length === 4) return jsonResponse();
        return new Response('expired redirect', { status: 404 });
      };
      const sync = syncCmsSnapshot({
        snapshotPath: path,
        env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token },
        fetchImpl,
      });
      if (recover) {
        assert.equal(await sync, 'remote');
        assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), baseline);
      } else {
        await assert.rejects(sync, /404 at script.googleusercontent.com/);
        assert.equal(await readFile(path, 'utf8'), original);
      }
      assert.equal(calls.length, 4);
      assert.equal(calls[0].hostname, 'script.google.com');
      assert.equal(calls[2].hostname, 'script.google.com');
      assert(calls[0].searchParams.get('cms_request'));
      assert.notEqual(
        calls[0].searchParams.get('cms_request'),
        calls[2].searchParams.get('cms_request'),
      );
      assert.notEqual(calls[1].href, calls[3].href);
      assert.deepEqual(await readdir(directory), ['snapshot with spaces.json']);
    });
  }
});

function gasHarness(source) {
  let active = 'owner@example.test';
  const properties = new Map();
  const sheets = new Map();
  const logs = [];
  const counters = { sheet: 0, folder: 0, lock: 0 };
  const makeSheet = () => {
    const cells = [];
    return {
      cells,
      getLastRow: () => cells.length,
      getLastColumn: () => Math.max(0, ...cells.map((row) => row.length)),
      setFrozenRows: () => {},
      getRange(row, column, height, width) {
        const range = {
          setNumberFormat: () => range,
          setValues(values) {
            assert.equal(values.length, height);
            values.forEach((valuesRow, y) => {
              assert.equal(valuesRow.length, width);
              cells[row - 1 + y] ??= [];
              valuesRow.forEach((value, x) => {
                assert(
                  !String(value).startsWith('='),
                  'Formula must be escaped',
                );
                cells[row - 1 + y][column - 1 + x] = String(value).startsWith(
                  "'",
                )
                  ? String(value).slice(1)
                  : value;
              });
            });
            return range;
          },
          getValues: () =>
            Array.from({ length: height }, (_, y) =>
              Array.from(
                { length: width },
                (_, x) => cells[row - 1 + y]?.[column - 1 + x] ?? '',
              ),
            ),
        };
        return range;
      },
    };
  };
  const spreadsheet = {
    getId: () => 'test-sheet-id',
    getSheetByName: (name) => sheets.get(name),
    insertSheet: (name) => {
      const sheet = makeSheet();
      sheets.set(name, sheet);
      return sheet;
    },
  };
  const context = vm.createContext({
    console: { log: (value) => logs.push(value) },
    CMS_SEED: structuredClone(baseline),
    Session: {
      getActiveUser: () => ({ getEmail: () => active }),
      getEffectiveUser: () => ({ getEmail: () => 'owner@example.test' }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => properties.get(key) ?? null,
        setProperty: (key, value) => properties.set(key, value),
      }),
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => counters.lock++,
        releaseLock: () => counters.lock--,
      }),
    },
    Utilities: { getUuid: () => '12345678-abcd-abcd-abcd-123456789012' },
    SpreadsheetApp: {
      create: () => {
        counters.sheet++;
        return spreadsheet;
      },
      openById: () => spreadsheet,
      flush: () => {},
    },
    DriveApp: {
      createFolder: () => {
        counters.folder++;
        return { getId: () => 'test-folder-id' };
      },
    },
    ContentService: {
      MimeType: { JSON: 'application/json' },
      createTextOutput: (text) => ({
        text,
        setMimeType() {
          return this;
        },
      }),
    },
  });
  vm.runInContext(source, context);
  const request = (params) =>
    JSON.parse(context.doGet({ parameter: params }).text);
  return {
    context,
    properties,
    counters,
    logs,
    sheets,
    request,
    setActive: (email) => {
      active = email;
    },
  };
}

const gasSource = await readFile(
  new URL('../cms/gas/export.js', import.meta.url),
  'utf8',
);

test('GAS setup seeds eight tabs and exports the exact snapshot; reruns preserve edits', () => {
  const gas = gasHarness(gasSource);
  gas.context.setupCms();
  assert.equal(gas.sheets.size, 8);
  assert.equal(gas.properties.get('ADMIN_EMAILS'), '["owner@example.test"]');
  const exportToken = gas.properties.get('EXPORT_TOKEN');
  assert.deepEqual(
    gas.request({ action: 'export', token: exportToken }),
    baseline,
  );
  gas.sheets.get('projects').cells[1][1] = 'Editor changed this';
  gas.context.setupCms();
  assert.equal(
    gas.request({ action: 'export', token: exportToken }).projects[0].title,
    'Editor changed this',
  );
  assert.equal(gas.counters.sheet, 1);
  assert.equal(gas.counters.folder, 1);
  assert.equal(gas.counters.lock, 0);
  assert(
    gas.logs.every(
      (line) =>
        !line.includes(exportToken) && !line.includes('owner@example.test'),
    ),
  );
});

test('GAS export is read only; auth and malformed Sheet data fail without leaking values', () => {
  const gas = gasHarness(gasSource);
  gas.setActive('');
  assert.throws(() => gas.context.setupCms(), /authorization/);
  assert.equal(gas.counters.sheet, 0);
  gas.setActive('owner@example.test');
  gas.context.setupCms();
  const exportToken = gas.properties.get('EXPORT_TOKEN');
  assert.equal(
    gas.request({ action: 'export', token: 'wrong' }).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(
    gas.request({ action: 'save', token: exportToken }).error.code,
    'UNKNOWN_ACTION',
  );
  assert.equal(JSON.parse(gas.context.doPost().text).error.code, 'READ_ONLY');
  assert.equal(
    gas.request({ action: 'list', collection: 'settings', token: exportToken })
      .error.code,
    'UNKNOWN_COLLECTION',
  );
  assert.deepEqual(
    gas.request({ action: 'list', collection: 'projects', token: exportToken })
      .data,
    baseline.projects,
  );
  gas.setActive('other@example.test');
  assert.throws(() => gas.context.setupCms(), /authorization/);
  gas.sheets.get('projects').cells[1][2] = 'secret-malformed-json';
  const invalid = gas.request({ action: 'export', token: exportToken });
  assert.deepEqual(invalid, { error: { code: 'INVALID_CMS_DATA' } });
  assert.equal(gas.counters.lock, 0);
});

test('GAS denies unexpected headers and duplicate records; literals are protected from formulas', () => {
  const gas = gasHarness(gasSource);
  gas.context.setupCms();
  const exportToken = gas.properties.get('EXPORT_TOKEN');
  const projectSheet = gas.sheets.get('projects');
  projectSheet.cells[2][0] = projectSheet.cells[1][0];
  assert.equal(
    gas.request({ action: 'export', token: exportToken }).error.code,
    'INVALID_CMS_DATA',
  );
  projectSheet.cells[0][0] = 'wrong-header';
  assert.throws(() => gas.context.setupCms(), /headers/);
  for (const value of [
    '=IMPORTXML("bad")',
    '+formula',
    '-text',
    '@text',
    "'quoted",
  ])
    assert.equal(gas.context.cmsSheetCell_(value), "'" + value);
  assert.equal(gas.counters.lock, 0);
});
