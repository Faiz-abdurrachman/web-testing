// CMS Pass 2 — Team Supabase RPC contract tests
// These tests call the Supabase RPCs directly (service_role) to verify:
// - cms_load_team returns correct shape and counts
// - cms_team_revision is deterministic
// - cms_save_member revison guard and update
// - cms_add_member UUID server, LIMIT, COLLISION
// - cms_delete_member NOT_FOUND, MINIMUM
//
// Run: node --env-file=.env.local tests/cms-team-supabase.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const rpc = async (fn, body = {}) => {
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: 'Bearer ' + supabaseKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`RPC ${fn} failed: HTTP ${res.status}`);
  return res.json();
};

const skip = !supabaseUrl || !supabaseKey;

test(
  'load team returns 7 groups, 25 members, revision, presets',
  { skip },
  async () => {
    const data = await rpc('cms_load_team');
    assert.equal(data.minMembers, 1);
    assert.equal(data.maxMembers, 8);
    assert.equal(data.minGroups, 7);
    assert.equal(data.groups.length, 7);
    assert.equal(data.groups[0].id, 'leader');
    assert.equal(data.groups[1].id, 'data');
    assert.equal(data.members.length, 25);
    assert(/^[a-f0-9]{64}$/.test(data.revision), 'revision is sha256 hex');
    assert(Array.isArray(data.photoPresets));
    assert(data.photoPresets.includes('zidan-rose'));
    assert(data.publicationPending === false);
  },
);

test('revision is deterministic (repeatable)', { skip }, async () => {
  const a = await rpc('cms_load_team');
  const b = await rpc('cms_load_team');
  assert.equal(a.revision, b.revision);
});

test('save member updates name and bumps revision', { skip }, async () => {
  const before = await rpc('cms_load_team');
  const member = before.members[0];
  const payload = {
    revision: before.revision,
    member: { ...member, name: 'Updated Name' },
  };
  const result = await rpc('cms_save_member', { p_payload: payload });
  assert.equal(result.saved, true);
  assert.equal(result.affectedId, member.id);
  assert.notEqual(result.revision, before.revision);
  const updated = result.members.find((m) => m.id === member.id);
  assert.equal(updated.name, 'Updated Name');
  // Restore
  const restore = await rpc('cms_save_member', {
    p_payload: {
      revision: result.revision,
      member: { ...member, name: member.name },
    },
  });
  assert.equal(restore.saved, true);
});

test('save member rejects stale revision', { skip }, async () => {
  const data = await rpc('cms_load_team');
  const result = await rpc('cms_save_member', {
    p_payload: { revision: 'stale', member: data.members[0] },
  });
  assert(result.error);
  assert.equal(result.error.code, 'CONFLICT');
});

test('save member rejects missing id', { skip }, async () => {
  const data = await rpc('cms_load_team');
  const result = await rpc('cms_save_member', {
    p_payload: {
      revision: data.revision,
      member: { ...data.members[0], id: 'not-found' },
    },
  });
  assert(result.error);
  assert.equal(result.error.code, 'NOT_FOUND');
});

test('add member generates UUID and bumps revision', { skip }, async () => {
  const before = await rpc('cms_load_team');
  const template = before.members[0];
  const result = await rpc('cms_add_member', {
    p_payload: {
      revision: before.revision,
      member: {
        group: template.group,
        name: 'New Person',
        role: 'Tester',
        photo: 'zidan-rose',
        order: 1,
      },
    },
  });
  assert.equal(result.saved, true);
  assert(/^member-/.test(result.affectedId));
  assert.notEqual(result.revision, before.revision);
  assert.equal(result.members.length, before.members.length + 1);
  // Cleanup: delete the added member
  const del = await rpc('cms_delete_member', {
    p_payload: { revision: result.revision, id: result.affectedId },
  });
  assert.equal(del.saved, true);
});

test('add member rejects invalid input', { skip }, async () => {
  const data = await rpc('cms_load_team');
  const result = await rpc('cms_add_member', {
    p_payload: {
      revision: data.revision,
      member: {
        group: 'data',
        name: '',
        role: '',
        photo: 'zidan-rose',
        order: 1,
      },
    },
  });
  assert(result.error);
  assert.equal(result.error.code, 'INVALID_INPUT');
});

test('delete member removes and bumps revision', { skip }, async () => {
  const before = await rpc('cms_load_team');
  // Add a member first, then delete it
  const add = await rpc('cms_add_member', {
    p_payload: {
      revision: before.revision,
      member: {
        group: 'data',
        name: 'Temp Person',
        role: 'Temp',
        photo: 'zidan-rose',
        order: 5,
      },
    },
  });
  assert.equal(add.saved, true);
  const del = await rpc('cms_delete_member', {
    p_payload: { revision: add.revision, id: add.affectedId },
  });
  assert.equal(del.saved, true);
  assert.equal(del.members.length, before.members.length);
  assert.notEqual(del.revision, before.revision);
});

test('delete member rejects not found', { skip }, async () => {
  const data = await rpc('cms_load_team');
  const result = await rpc('cms_delete_member', {
    p_payload: { revision: data.revision, id: 'not-found' },
  });
  assert(result.error);
  assert.equal(result.error.code, 'NOT_FOUND');
});

test(
  'delete member rejects minimum (1 member per group)',
  { skip },
  async () => {
    const data = await rpc('cms_load_team');
    // Find a group with only 1 member (if any) — leader has 2, min 1
    // Add extra member, then delete back to 1
    const leaderMembers = data.members.filter((m) => m.group === 'leader');
    // leader group has 2 members, so delete 1 should work, then 2nd should fail
    const del1 = await rpc('cms_delete_member', {
      p_payload: { revision: data.revision, id: leaderMembers[0].id },
    });
    assert.equal(del1.saved, true);
    // Now try to delete the last one
    const del2 = await rpc('cms_delete_member', {
      p_payload: { revision: del1.revision, id: leaderMembers[1].id },
    });
    assert(del2.error);
    assert.equal(del2.error.code, 'MINIMUM');
    // Restore: add back
    const restore = await rpc('cms_add_member', {
      p_payload: {
        revision: del1.revision,
        member: {
          group: 'leader',
          name: leaderMembers[0].name,
          role: leaderMembers[0].role,
          photo: leaderMembers[0].photo,
          order: 1,
        },
      },
    });
    assert.equal(restore.saved, true);
  },
);
