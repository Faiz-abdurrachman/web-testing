import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const source =
  (await readFile(
    new URL('../cms/gas/admin/server.js', import.meta.url),
    'utf8',
  )) +
  '\n' +
  (await readFile(new URL('../cms/gas/media.js', import.meta.url), 'utf8')) +
  '\n' +
  (await readFile(
    new URL('../cms/gas/admin/team.js', import.meta.url),
    'utf8',
  ));
const baseline = JSON.parse(
  await readFile(
    new URL('../src/data/cms-snapshot.json', import.meta.url),
    'utf8',
  ),
);
const headers = ['id', 'group', 'groupTitle', 'name', 'role', 'photo', 'order'];
const teamRows = [
  { id: 'leader', title: '', members: baseline.team.leaderTeam },
  ...baseline.team.hodsTeams,
].flatMap((g) =>
  g.members.map((m, i) => [
    g.id + '-' + (i + 1),
    g.id,
    g.title,
    m.name,
    m.role,
    m.photo,
    String(i + 1),
  ]),
);
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
  const cells = [headers.slice(), ...structuredClone(teamRows)];
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
  h.props.set('OWNER_EMAIL', owner);
  h.props.set('ADMIN_EMAILS', JSON.stringify([owner]));
  return h;
};

const content = ({ id, ...member }) => member;
test('Team CRUD preserves stable IDs and other groups, inserts/reorders, blanks trailing rows and requests both hooks', () => {
  const h = ready();
  const initial = plain(h.context.adminLoadTeam().data);
  assert.equal(initial.members.length, 25);
  const added = plain(
    h.context.adminAddMember({
      revision: initial.revision,
      member: { ...content(initial.members[0]), name: '=Literal', order: 1 },
    }),
  );
  assert.equal(added.ok, true);
  assert.equal(
    h.context.adminAddMember({
      revision: added.data.revision,
      member: content(initial.members[0]),
    }).error.code,
    'COLLISION',
  );
  assert.match(added.data.affectedId, /^member-/);
  assert.equal(h.counts.writes, 1);
  assert.equal(h.calls.length, 2);
  assert.deepEqual(
    added.data.members.filter((m) => m.group !== 'leader'),
    initial.members.filter((m) => m.group !== 'leader'),
  );
  assert.equal(
    added.data.members.find((m) => m.id === initial.members[0].id).order,
    2,
  );
  const moved = {
    ...added.data.members.find((m) => m.id === added.data.affectedId),
    group: 'data',
    order: 2,
  };
  const saved = plain(
    h.context.adminSaveMember({ revision: added.data.revision, member: moved }),
  );
  assert.equal(saved.ok, true);
  assert.equal(saved.data.members.find((m) => m.id === moved.id).order, 2);
  const deleted = plain(
    h.context.adminDeleteMember({
      revision: saved.data.revision,
      id: moved.id,
    }),
  );
  assert.equal(deleted.ok, true);
  assert.deepEqual(deleted.data.members, initial.members);
  assert.deepEqual(h.cells.at(-1), Array(7).fill(''));
  assert.deepEqual(
    plain(h.context.adminLoadTeam().data.members),
    initial.members,
  );
  assert.equal(h.counts.writes, 3);
  assert.equal(h.counts.locks, 0);
});
test('Team auth, revision, fields, group/header/order constraints and UUID collisions reject without write/hooks', () => {
  const h = ready();
  for (const identity of ['', 'other@example.test']) {
    h.setActive(identity);
    for (const fn of [
      'adminLoadTeam',
      'adminSaveMember',
      'adminAddMember',
      'adminDeleteMember',
      'adminUploadTeamImage',
      'adminReadTeamImage',
    ])
      assert.equal(h.context[fn]({}).error.code, 'UNAUTHORIZED');
  }
  h.setActive(owner);
  const state = plain(h.context.adminLoadTeam().data);
  for (const patch of [
    { group: 'unknown' },
    { photo: 'https://evil.test/a.png' },
    { photo: '/images/cms/projects/' + 'a'.repeat(64) + '.webp' },
    { order: 0 },
    { order: 9 },
    { name: ' ' },
    { name: 'x'.repeat(81) },
    { name: 'two\nlines' },
    { fade: 'evil' },
    { id: '../bad' },
  ])
    assert.equal(
      h.context.adminSaveMember({
        revision: state.revision,
        member: { ...state.members[0], ...patch },
      }).ok,
      false,
    );
  assert.equal(
    h.context.adminSaveMember({ revision: 'stale', member: state.members[0] })
      .error.code,
    'CONFLICT',
  );
  assert.equal(
    h.context.adminDeleteMember({ revision: state.revision, id: 'missing' })
      .error.code,
    'NOT_FOUND',
  );
  assert.equal(
    h.context.adminAddMember({
      revision: state.revision,
      member: state.members[0],
    }).error.code,
    'INVALID_INPUT',
  );
  h.cells[1][3] = 'Manual edit';
  assert.equal(
    h.context.adminSaveMember({
      revision: state.revision,
      member: state.members[0],
    }).error.code,
    'CONFLICT',
  );
  h.cells[1][3] = state.members[0].name;
  h.cells[2][6] = h.cells[1][6];
  assert.equal(h.context.adminLoadTeam().ok, false);
  h.cells[2][6] = '2';
  h.cells[0][0] = 'unexpected';
  assert.equal(h.context.adminLoadTeam().error.code, 'INVALID_DATA');
  assert.equal(h.counts.writes, 0);
  assert.equal(h.calls.length, 0);
  assert.equal(h.counts.locks, 0);
});
test('Team group minimum/move-last and max are enforced; partial publication retry never repeats mutation', () => {
  const h = ready();
  h.cells.splice(2, 1);
  let state = plain(h.context.adminLoadTeam().data);
  assert.equal(
    h.context.adminDeleteMember({
      revision: state.revision,
      id: state.members[0].id,
    }).error.code,
    'MINIMUM',
  );
  assert.equal(
    h.context.adminSaveMember({
      revision: state.revision,
      member: { ...state.members[0], group: 'data' },
    }).error.code,
    'MINIMUM',
  );
  for (let i = 2; i <= 8; i++)
    h.cells.push([
      'extra-' + i,
      'leader',
      '',
      'Member',
      'Role',
      'zidan-rose',
      String(i),
    ]);
  state = plain(h.context.adminLoadTeam().data);
  assert.equal(
    h.context.adminAddMember({
      revision: state.revision,
      member: content(state.members[0]),
    }).error.code,
    'LIMIT',
  );
  assert.equal(h.counts.writes, 0);
  assert.equal(h.calls.length, 0);
  h.failHook(prodHook);
  const saved = plain(
    h.context.adminSaveMember({
      revision: state.revision,
      member: { ...state.members[0], role: '@literal' },
    }),
  );
  assert.equal(saved.ok, true);
  assert.equal(saved.data.publicationPending, true);
  h.failHook(null);
  assert.equal(h.context.adminRetryPublication().ok, true);
  assert.equal(h.counts.writes, 1);
});
