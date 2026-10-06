import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const source = await readFile(
  new URL('../cms/gas/admin/server.js', import.meta.url),
  'utf8',
);
const baseline = JSON.parse(
  await readFile(
    new URL('../src/data/cms-snapshot.json', import.meta.url),
    'utf8',
  ),
);
const headers = ['id', 'title', 'tags', 'description', 'image'];
const plain = (value) => JSON.parse(JSON.stringify(value));
const owner = 'owner@example.test';
const testHook =
  'https://api.vercel.com/v1/integrations/deploy/testing-project/private-test';
const prodHook =
  'https://api.vercel.com/v1/integrations/deploy/production-project/private-prod';
function harness() {
  let active = owner;
  let effective = owner;
  let fileOwner = owner;
  let failTarget;
  const calls = [];
  const logs = [];
  const counts = { writes: 0, locks: 0, reads: 0 };
  const props = new Map(
    Object.entries({
      SPREADSHEET_ID: 'test-sheet',
      DRIVE_FOLDER_ID: 'test-folder',
      DEPLOY_HOOK_TESTING: testHook,
      DEPLOY_HOOK_PRODUCTION: prodHook,
    }),
  );
  const cells = [
    headers.slice(),
    ...baseline.projects.map((project) =>
      headers.map((key) =>
        key === 'tags' ? JSON.stringify(project.tags) : project[key],
      ),
    ),
  ];
  const sheet = {
    getLastRow: () => cells.length,
    getLastColumn: () => cells[0].length,
    getRange: (row, column, height, width) => {
      const range = {
        getValues: () => {
          counts.reads++;
          return Array.from({ length: height }, (_, y) =>
            Array.from(
              { length: width },
              (_, x) => cells[row - 1 + y]?.[column - 1 + x] ?? '',
            ),
          );
        },
        setNumberFormat: () => range,
        setValues: (values) => {
          counts.writes++;
          values.forEach((record, y) =>
            record.forEach((value, x) => {
              cells[row - 1 + y] ??= [];
              cells[row - 1 + y][column - 1 + x] = value.startsWith("'")
                ? value.slice(1)
                : value;
            }),
          );
          return range;
        },
      };
      return range;
    },
  };
  const file = { getOwner: () => ({ getEmail: () => fileOwner }) };
  const context = vm.createContext({
    ADMIN_IMAGE_PRESETS: [
      ...new Set(baseline.projects.map((project) => project.image)),
    ],
    console: { log: (value) => logs.push(value) },
    Session: {
      getActiveUser: () => ({ getEmail: () => active }),
      getEffectiveUser: () => ({ getEmail: () => effective }),
    },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (key) => props.get(key) ?? null,
        setProperty: (key, value) => props.set(key, value),
      }),
    },
    DriveApp: { getFileById: () => file, getFolderById: () => file },
    SpreadsheetApp: {
      openById: () => ({ getSheetByName: () => sheet }),
      flush: () => {},
    },
    LockService: {
      getScriptLock: () => ({
        waitLock: () => counts.locks++,
        releaseLock: () => counts.locks--,
      }),
    },
    Utilities: {
      getUuid: () => '12345678-abcd-abcd-abcd-123456789012',
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_algorithm, value) =>
        [...createHash('sha256').update(value).digest()].map((byte) =>
          byte > 127 ? byte - 256 : byte,
        ),
    },
    HtmlService: {
      createHtmlOutput: (text) => text,
      createHtmlOutputFromFile: (name) => ({
        name,
        setTitle() {
          return this;
        },
      }),
    },
    ContentService: { createTextOutput: (text) => text },
    UrlFetchApp: {
      fetch: (url, options) => {
        calls.push({ url, options });
        return {
          getResponseCode: () => (url === failTarget ? 503 : 201),
          getContentText: () =>
            JSON.stringify({ job: { id: 'test-job' }, private: testHook }),
        };
      },
    },
  });
  vm.runInContext(source, context);
  return {
    context,
    props,
    cells,
    calls,
    counts,
    logs,
    setActive: (value) => {
      active = value;
    },
    setEffective: (value) => {
      effective = value;
    },
    setFileOwner: (value) => {
      fileOwner = value;
    },
    failHook: (url) => {
      failTarget = url;
    },
  };
}
const ready = () => {
  const h = harness();
  assert.equal(h.context.setupAdmin().ok, true);
  return h;
};

test('private admin authorizes setup and each public RPC; export tokens grant no admin access', () => {
  const h = harness();
  h.setActive('');
  assert.equal(h.context.setupAdmin().error.code, 'UNAUTHORIZED');
  assert.match(h.context.doGet(), /Akses ditolak/);
  assert.equal(h.context.adminLoadProjects().error.code, 'UNAUTHORIZED');
  h.props.set('EXPORT_TOKEN', 'not-admin-auth');
  assert.equal(
    h.context.adminSaveProject({ token: 'not-admin-auth' }).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(h.context.adminRetryPublication().error.code, 'UNAUTHORIZED');
  assert.equal(h.counts.reads, 0);
  assert.equal(h.calls.length, 0);
  h.setActive(owner);
  h.setFileOwner('other@example.test');
  assert.equal(h.context.setupAdmin().error.code, 'UNAUTHORIZED');
  h.setFileOwner(owner);
  assert.equal(h.context.setupAdmin().ok, true);
  assert.equal(h.context.doGet().name, 'Index');
  h.setEffective('other@example.test');
  assert.equal(h.context.adminLoadProjects().error.code, 'UNAUTHORIZED');
  h.setEffective(owner);
  h.props.set('ADMIN_EMAILS', '[broken');
  assert.equal(h.context.adminRetryPublication().error.code, 'UNAUTHORIZED');
  assert(!JSON.stringify(h.logs).includes(owner));
});

test('project save preserves columns, IDs, count and other records; both hooks are requested', () => {
  const h = ready();
  const before = plain(h.context.adminLoadProjects().data);
  assert.deepEqual(before.projects, baseline.projects);
  const changed = { ...before.projects[0], title: '=literal title' };
  const result = plain(
    h.context.adminSaveProject({ revision: before.revision, project: changed }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.data.saved, true);
  assert.equal(result.data.publicationPending, false);
  assert.deepEqual(result.data.projects.slice(1), baseline.projects.slice(1));
  assert.deepEqual(result.data.projects[0], changed);
  assert.notEqual(result.data.revision, before.revision);
  assert.equal(h.counts.writes, 1);
  assert.equal(h.counts.locks, 0);
  assert.deepEqual(
    h.calls.map((call) => call.url),
    [testHook, prodHook],
  );
  assert(
    h.calls.every(
      (call) =>
        call.options.method === 'post' &&
        call.options.followRedirects === false,
    ),
  );
  for (const value of [owner, testHook, prodHook, 'test-sheet', 'test-folder'])
    assert(!JSON.stringify(result).includes(value));
  assert.equal(
    h.context.adminSaveProject({ revision: before.revision, project: changed })
      .error.code,
    'CONFLICT',
  );
  assert.equal(h.counts.writes, 1);
  assert.equal(h.calls.length, 2);
});

test('invalid input, invalid headers, stale Sheet edits and bad hook configuration never write', () => {
  const h = ready();
  const state = plain(h.context.adminLoadProjects().data);
  for (const patch of [
    { tags: ['one'] },
    { title: ' ' },
    { image: 'https://example.com/evil' },
    { css: 'bad' },
    { id: '../bad' },
  ]) {
    assert.equal(
      h.context.adminSaveProject({
        revision: state.revision,
        project: { ...state.projects[0], ...patch },
      }).ok,
      false,
    );
  }
  h.props.set('DEPLOY_HOOK_PRODUCTION', 'https://evil.example/private');
  assert.equal(
    h.context.adminSaveProject({
      revision: state.revision,
      project: state.projects[0],
    }).error.code,
    'CONFIGURATION',
  );
  h.props.set('DEPLOY_HOOK_PRODUCTION', testHook);
  assert.equal(h.context.adminRetryPublication().error.code, 'CONFIGURATION');
  h.props.set('DEPLOY_HOOK_PRODUCTION', prodHook);
  h.cells[1][1] = 'Manual Sheet edit';
  assert.equal(
    h.context.adminSaveProject({
      revision: state.revision,
      project: state.projects[0],
    }).error.code,
    'CONFLICT',
  );
  h.cells[0][0] = 'unexpected';
  assert.equal(h.context.adminLoadProjects().error.code, 'INVALID_DATA');
  assert.equal(h.counts.writes, 0);
  assert.equal(h.calls.length, 0);
  assert.equal(h.counts.locks, 0);
});

test('partial hook failure preserves saved content; retry publication does not repeat the write', () => {
  const h = ready();
  const state = plain(h.context.adminLoadProjects().data);
  h.failHook(prodHook);
  const changed = { ...state.projects[0], description: 'New description' };
  const result = plain(
    h.context.adminSaveProject({ revision: state.revision, project: changed }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.data.saved, true);
  assert.equal(result.data.publicationPending, true);
  assert.deepEqual(
    result.data.publication.map((item) => item.accepted),
    [true, false],
  );
  assert.equal(
    h.context.adminLoadProjects().data.projects[0].description,
    changed.description,
  );
  assert.equal(h.context.adminLoadProjects().data.publicationPending, true);
  h.failHook(null);
  assert(
    h.context
      .adminRetryPublication()
      .data.publication.every((item) => item.accepted),
  );
  assert.equal(h.props.get('PUBLICATION_PENDING'), 'false');
  assert.equal(h.counts.writes, 1);
  assert.equal(h.calls.length, 4);
});

const content = ({ id, ...project }) => project;
test('growth add/delete are revision guarded, atomic, ordered and stable; blank rows remain readable', () => {
  const h = ready();
  const initial = plain(h.context.adminLoadProjects().data);
  h.failHook(prodHook);
  const added = plain(
    h.context.adminAddProject({
      revision: initial.revision,
      project: { ...content(initial.projects[0]), title: "'literal new title" },
    }),
  );
  assert.equal(added.ok, true);
  assert.equal(added.data.projects.length, 5);
  assert.deepEqual(added.data.projects.slice(0, 4), initial.projects);
  assert.match(added.data.affectedId, /^project-/);
  assert.equal(added.data.publicationPending, true);
  assert.equal(
    h.context.adminAddProject({
      revision: initial.revision,
      project: content(initial.projects[0]),
    }).error.code,
    'CONFLICT',
  );
  assert.equal(
    h.context.adminAddProject({
      revision: added.data.revision,
      project: content(initial.projects[0]),
    }).error.code,
    'COLLISION',
  );
  assert.equal(h.counts.writes, 1);
  h.context.adminRetryPublication();
  assert.equal(h.counts.writes, 1);
  const deleted = plain(
    h.context.adminDeleteProject({
      revision: added.data.revision,
      id: initial.projects[1].id,
    }),
  );
  assert.equal(deleted.ok, true);
  assert.deepEqual(
    deleted.data.projects.map((p) => p.id),
    [
      initial.projects[0].id,
      initial.projects[2].id,
      initial.projects[3].id,
      added.data.affectedId,
    ],
  );
  assert.deepEqual(h.cells[5], ['', '', '', '', '']);
  assert.deepEqual(
    plain(h.context.adminLoadProjects().data.projects),
    deleted.data.projects,
  );
  assert.equal(h.counts.writes, 2);
  assert.equal(
    h.context.adminDeleteProject({
      revision: added.data.revision,
      id: initial.projects[0].id,
    }).error.code,
    'CONFLICT',
  );
  assert.equal(h.counts.writes, 2);
  assert.equal(h.counts.locks, 0);
});

test('growth rejects auth, unknown fields/IDs, minimum, maximum and invalid candidates without hooks/write', () => {
  const h = ready();
  for (const identity of ['', 'other@example.test']) {
    h.setActive(identity);
    assert.equal(h.context.adminAddProject({}).error.code, 'UNAUTHORIZED');
    assert.equal(h.context.adminDeleteProject({}).error.code, 'UNAUTHORIZED');
  }
  h.setActive(owner);
  const initial = plain(h.context.adminLoadProjects().data);
  for (const project of [
    { ...content(initial.projects[0]), id: 'client-id' },
    { ...content(initial.projects[0]), tags: ['one'] },
  ]) {
    assert.equal(
      h.context.adminAddProject({ revision: initial.revision, project }).ok,
      false,
    );
  }
  assert.equal(
    h.context.adminDeleteProject({ revision: initial.revision, id: 'missing' })
      .error.code,
    'NOT_FOUND',
  );
  assert.equal(h.counts.writes, 0);
  assert.equal(h.calls.length, 0);
  h.cells.splice(2);
  let state = h.context.adminLoadProjects().data;
  assert.equal(
    h.context.adminDeleteProject({
      revision: state.revision,
      id: state.projects[0].id,
    }).error.code,
    'MINIMUM',
  );
  for (let i = 1; i < 8; i++)
    h.cells.push([
      'fixture-' + i,
      'Project',
      '["one","two"]',
      'Description',
      baseline.projects[0].image,
    ]);
  state = h.context.adminLoadProjects().data;
  assert.equal(
    h.context.adminAddProject({
      revision: state.revision,
      project: content(state.projects[0]),
    }).error.code,
    'LIMIT',
  );
  h.cells[2][0] = h.cells[1][0];
  assert.equal(
    h.context.adminDeleteProject({
      revision: state.revision,
      id: state.projects[0].id,
    }).error.code,
    'INVALID_DATA',
  );
  assert.equal(h.counts.writes, 0);
  assert.equal(h.calls.length, 0);
});
