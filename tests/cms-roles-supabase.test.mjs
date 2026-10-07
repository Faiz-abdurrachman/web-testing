import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { syncCmsSnapshot } from '../scripts/cms-client.mjs';

const baseline = JSON.parse(
  await readFile(new URL('../src/data/cms-snapshot.json', import.meta.url)),
);
const migration = await readFile(
  new URL(
    '../supabase/migrations/20261010010000_cms_roles_pass3.sql',
    import.meta.url,
  ),
  'utf8',
);
const env = {
  CMS_API_URL: 'https://script.google.com/macros/s/test/exec',
  CMS_API_TOKEN: 'test-export-secret',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon',
};
const team = {
  groups: [
    { id: 'leader', title: '' },
    ...baseline.team.hodsTeams.map(({ id, title }) => ({ id, title })),
  ],
  members: [
    { id: 'leader', members: baseline.team.leaderTeam },
    ...baseline.team.hodsTeams,
  ].flatMap((g) =>
    g.members.map((m, i) => ({ ...m, group: g.id, order: i + 1 })),
  ),
};

for (const failure of [null, 'http', 'shape', 'slots', 'network']) {
  test(`hybrid Roles source and atomic failure: ${failure || 'success'}`, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ds-roles-'));
    try {
      const path = join(dir, 'snapshot.json');
      const original = JSON.stringify(baseline);
      await writeFile(path, original);
      const gas = structuredClone(baseline);
      gas.roles[0].title = 'Old GAS content';
      const roles = structuredClone(baseline.roles);
      roles[0].title = 'Supabase content';
      roles[0].whatsapp = '628123456789';
      if (failure === 'slots') roles[0].chips.pop();
      const calls = [];
      const run = syncCmsSnapshot({
        snapshotPath: path,
        env,
        fetchImpl: async (url, options) => {
          const u = new URL(url);
          calls.push(u.pathname);
          if (u.hostname === 'script.google.com') return Response.json(gas);
          assert.equal(options.headers.apikey, env.SUPABASE_ANON_KEY);
          assert.equal(options.method, 'POST');
          if (u.pathname.endsWith('cms_load_partners'))
            return Response.json({ partners: baseline.partners });
          if (u.pathname.endsWith('cms_load_projects'))
            return Response.json({ projects: baseline.projects });
          if (u.pathname.endsWith('cms_load_team')) return Response.json(team);
          if (u.pathname.endsWith('cms_load_domains'))
            return Response.json({ domains: baseline.domains });
          if (u.pathname.endsWith('cms_load_hods'))
            return Response.json({ hods: baseline.hods });
          assert(u.pathname.endsWith('cms_load_roles'));
          if (failure === 'http')
            return new Response('private upstream details', { status: 503 });
          if (failure === 'network') throw new TypeError('network failure');
          return Response.json(failure === 'shape' ? {} : { roles });
        },
      });
      if (failure) {
        await assert.rejects(run);
        assert.equal(await readFile(path, 'utf8'), original);
      } else {
        assert.equal(await run, 'remote');
        assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), {
          ...baseline,
          roles,
        });
      }
      assert.equal(calls.filter((p) => p.endsWith('cms_load_roles')).length, 1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}

test('Roles migration on real ephemeral PostgreSQL: seed, privileges, fixed slots', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-roles-pg-'));
  const data = join(dir, 'data');
  const port = String(56000 + Math.floor(Math.random() * 1000));
  const command = (exe, args) => spawnSync(exe, args, { encoding: 'utf8' });
  const sql = (query) =>
    command('psql', [
      '-X',
      '-h',
      dir,
      '-p',
      port,
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-v',
      'ON_ERROR_STOP=1',
      '-tAq',
      '-c',
      query,
    ]);
  const ok = (r) => {
    assert.equal(r.status, 0, r.stderr);
    return r.stdout.trim();
  };
  let started = false;
  try {
    ok(
      command('initdb', [
        '-D',
        data,
        '-U',
        'postgres',
        '--auth=trust',
        '--no-sync',
      ]),
    );
    ok(
      command('pg_ctl', [
        '-D',
        data,
        '-o',
        `-p ${port} -k ${dir} -c listen_addresses=''`,
        '-l',
        join(dir, 'pg.log'),
        'start',
      ]),
    );
    started = true;
    ok(
      sql(
        'create role anon; create role authenticated; create role service_role bypassrls; create schema private; revoke all on schema private from public, anon, authenticated;',
      ),
    );
    ok(sql(migration));
    ok(sql(migration));
    const load = (role) =>
      JSON.parse(ok(sql(`set role ${role}; select public.cms_load_roles();`)));
    assert.deepEqual(load('anon').roles, baseline.roles);
    assert.deepEqual(load('service_role').roles, baseline.roles);
    for (const role of ['anon', 'authenticated']) {
      for (const query of [
        'select * from private.cms_roles',
        'select private.cms_load_roles()',
        "update private.cms_roles set title = 'bad' where id = 'data'",
        "delete from private.cms_roles where id = 'data'",
      ]) {
        assert.notEqual(
          sql(`set role ${role}; ${query}`).status,
          0,
          `${role}: ${query}`,
        );
      }
    }
    assert.notEqual(
      sql('set role authenticated; select public.cms_load_roles()').status,
      0,
    );
    for (const mutation of [
      'position = 2',
      "chips = '[]'::jsonb",
      "requirements = '[1,2,3,4]'::jsonb",
      "whatsapp = 'bad'",
      "id = 'unknown'",
    ]) {
      assert.notEqual(
        sql(`update private.cms_roles set ${mutation} where id = 'data'`)
          .status,
        0,
        mutation,
      );
    }
    ok(
      sql(
        "update private.cms_roles set whatsapp = '628123456789', title = 'Keep edit' where id = 'data'",
      ),
    );
    ok(sql(migration));
    assert.equal(load('anon').roles[0].whatsapp, '628123456789');
    assert.equal(load('anon').roles[0].title, 'Keep edit');
    ok(sql("update private.cms_roles set whatsapp = null where id = 'data'"));
    assert(!('whatsapp' in load('anon').roles[0]));
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});
