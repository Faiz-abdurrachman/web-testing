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
const supabaseEnv = {
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'placeholder',
};
const supabaseMock = (url) => {
  const href = typeof url === 'string' ? url : url.href;
  if (href.includes('/rest/v1/rpc/cms_load_partners'))
    return Response.json({ partners: baseline.partners });
  if (href.includes('/rest/v1/rpc/cms_load_hods'))
    return jsonResponse({ hods: baseline.hods });
  if (href.includes('/rest/v1/rpc/cms_load_domains'))
    return jsonResponse({ domains: baseline.domains });
  if (href.includes('/rest/v1/rpc/cms_load_roles'))
    return jsonResponse({ roles: baseline.roles });
  if (href.includes('/rest/v1/rpc/cms_load_projects'))
    return jsonResponse(baseline);
  if (href.includes('/rest/v1/rpc/cms_load_team')) {
    // Return response in Supabase RPC format (members + groups)
    const members = [];
    const groups = [];
    const seen = new Set();
    for (const m of baseline.team.leaderTeam) {
      if (seen.has('leader-' + members.length)) continue;
      seen.add('leader-' + members.length);
      members.push({
        id: 'leader-' + (members.length + 1),
        group: 'leader',
        name: m.name,
        role: m.role,
        photo: m.photo,
        order: members.length + 1,
      });
    }
    if (!groups.find((g) => g.id === 'leader'))
      groups.push({ id: 'leader', title: '' });
    for (const ht of baseline.team.hodsTeams) {
      if (!groups.find((g) => g.id === ht.id))
        groups.push({ id: ht.id, title: ht.title });
      for (const [i, m] of ht.members.entries()) {
        members.push({
          id: ht.id + '-' + (i + 1),
          group: ht.id,
          name: m.name,
          role: m.role,
          photo: m.photo,
          order: i + 1,
        });
      }
    }
    return jsonResponse({
      members,
      groups,
      revision: 'a'.repeat(64),
      photoPresets: ['marchel', 'zidan-rose'],
      minMembers: 1,
      maxMembers: 8,
      minGroups: 7,
      publicationPending: false,
      affectedId: null,
    });
  }
  if (href.includes('/database/query')) return jsonResponse([]);
  return null;
};

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
        env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token, ...supabaseEnv },
        fetchImpl: async (url, opts) => {
          const href = typeof url === 'string' ? url : url.href;
          if (
            href.includes('/rest/v1/rpc/cms_load_projects') ||
            href.includes('/rest/v1/rpc/cms_load_roles') ||
            href.includes('/rest/v1/rpc/cms_load_domains') ||
            href.includes('/rest/v1/rpc/cms_load_hods') ||
            href.includes('/rest/v1/rpc/cms_load_partners')
          )
            return jsonResponse(changed);
          if (href.includes('/database/query')) return jsonResponse([]);
          return supabaseMock(url) || fetchImpl(url, opts);
        },
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
  wrong.team.leaderTeam = [];
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
          env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token, ...supabaseEnv },
          fetchImpl: async (url, opts) =>
            supabaseMock(url) || fetchImpl(url, opts),
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
          env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token, ...supabaseEnv },
          timeoutMs: 10,
          fetchImpl: async (url, opts) => {
            const href = typeof url === 'string' ? url : url.href;
            if (
              href.includes('/rest/v1/rpc/cms_load_projects') ||
              href.includes('/rest/v1/rpc/cms_load_roles') ||
              href.includes('/rest/v1/rpc/cms_load_domains') ||
              href.includes('/rest/v1/rpc/cms_load_hods') ||
              href.includes('/rest/v1/rpc/cms_load_partners')
            )
              return jsonResponse(baseline);
            if (href.includes('/database/query')) return jsonResponse([]);
            return supabaseMock(url) || fetchImpl(url, opts);
          },
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
        env: { CMS_API_URL: endpoint, CMS_API_TOKEN: token, ...supabaseEnv },
        fetchImpl: async (url, opts) => {
          const href = typeof url === 'string' ? url : url.href;
          if (
            href.includes('/rest/v1/rpc/cms_load_projects') ||
            href.includes('/rest/v1/rpc/cms_load_roles') ||
            href.includes('/rest/v1/rpc/cms_load_domains') ||
            href.includes('/rest/v1/rpc/cms_load_hods') ||
            href.includes('/rest/v1/rpc/cms_load_partners')
          )
            return jsonResponse(baseline);
          if (href.includes('/database/query')) return jsonResponse([]);
          return supabaseMock(url) || fetchImpl(url, opts);
        },
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

test('Projects growth export roundtrip accepts 1/2/5/8 with blanks, rejects empty/9 and preserves other guards', async () => {
  const { cmsSnapshotSchema } = await import('../src/data/cms-schema.mjs');
  for (const count of [1, 2, 5, 8]) {
    const gas = gasHarness(gasSource);
    gas.context.setupCms();
    const sheet = gas.sheets.get('projects');
    sheet.cells.splice(1);
    for (let i = 0; i < count; i++)
      sheet.cells.push([
        'fixture-' + i,
        'Project ' + i,
        '["one","two"]',
        'Description',
        baseline.projects[0].image,
      ]);
    sheet.cells.push(['', '', '', '', '']);
    const exported = gas.request({
      action: 'export',
      token: gas.properties.get('EXPORT_TOKEN'),
    });
    assert.equal(cmsSnapshotSchema.parse(exported).projects.length, count);
    assert.deepEqual(exported.team, baseline.team);
  }
  for (const count of [0, 9]) {
    const candidate = structuredClone(baseline);
    candidate.projects = Array.from({ length: count }, (_, i) => ({
      ...baseline.projects[0],
      id: 'fixture-' + i,
    }));
    assert.equal(cmsSnapshotSchema.safeParse(candidate).success, false);
  }
  const candidate = structuredClone(baseline);
  candidate.projects.pop();
  candidate.roles.pop();
  assert.equal(cmsSnapshotSchema.safeParse(candidate).success, false);
});

test('Team export roundtrip accepts 1/2/5/8 per preset group, blanks and reordered stable rows; rejects empty/9', async () => {
  const { cmsSnapshotSchema } = await import('../src/data/cms-schema.mjs');
  for (const count of [1, 2, 5, 8]) {
    const gas = gasHarness(gasSource);
    gas.context.setupCms();
    const sheet = gas.sheets.get('team');
    sheet.cells.splice(1);
    for (const group of [
      { id: 'leader', title: '', members: baseline.team.leaderTeam },
      ...baseline.team.hodsTeams,
    ])
      for (let i = count; i >= 1; i--) {
        const m = group.members[(i - 1) % group.members.length];
        sheet.cells.push([
          group.id + '-' + i,
          group.id,
          group.title,
          m.name,
          m.role,
          m.photo,
          String(i),
        ]);
      }
    sheet.cells.push(Array(7).fill(''));
    const exported = gas.request({
      action: 'export',
      token: gas.properties.get('EXPORT_TOKEN'),
    });
    const parsed = cmsSnapshotSchema.parse(exported);
    assert.equal(parsed.team.leaderTeam.length, count);
    assert(parsed.team.hodsTeams.every((g) => g.members.length === count));
    assert.deepEqual(parsed.projects, baseline.projects);
  }
  for (const count of [0, 9]) {
    const candidate = structuredClone(baseline);
    candidate.team.leaderTeam = Array.from(
      { length: count },
      () => baseline.team.leaderTeam[0],
    );
    assert.equal(cmsSnapshotSchema.safeParse(candidate).success, false);
  }
  const wrong = structuredClone(baseline);
  wrong.team.hodsTeams[0].members[0].photo =
    '/images/cms/projects/' + 'a'.repeat(64) + '.webp';
  assert.equal(cmsSnapshotSchema.safeParse(wrong).success, false);
});
