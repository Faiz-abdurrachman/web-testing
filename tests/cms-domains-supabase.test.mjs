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
    '../supabase/migrations/20261011010000_cms_domains_pass4.sql',
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

for (const failure of [
  null,
  'http',
  'timeout',
  'network',
  'json',
  'null',
  'shape',
  'order',
  'count',
  'slots',
  'blank',
  'metadata',
]) {
  test(`hybrid Domains source and atomic failure: ${failure || 'success'}`, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ds-domains-'));
    try {
      const path = join(dir, 'snapshot.json');
      const original = JSON.stringify(baseline);
      await writeFile(path, original);
      const gas = structuredClone(baseline);
      gas.domains[0].title = 'Old GAS content';
      const domains = structuredClone(baseline.domains);
      domains[0].title = 'Supabase content';
      if (failure === 'order') domains.reverse();
      if (failure === 'count') domains.pop();
      if (failure === 'slots') domains[0].labels[0].pop();
      if (failure === 'blank') domains[0].labels[0][0] = ' ';
      if (failure === 'metadata') domains[0].position = 1;
      let calls = 0;
      const run = syncCmsSnapshot({
        snapshotPath: path,
        env,
        fetchImpl: async (url, options) => {
          const u = new URL(url);
          if (u.hostname === 'script.google.com') return Response.json(gas);
          assert.equal(options.headers.apikey, env.SUPABASE_ANON_KEY);
          assert.equal(options.method, 'POST');
          if (u.pathname.endsWith('cms_load_projects'))
            return Response.json({ projects: baseline.projects });
          if (u.pathname.endsWith('cms_load_team')) return Response.json(team);
          if (u.pathname.endsWith('cms_load_roles'))
            return Response.json({ roles: baseline.roles });
          if (u.pathname.endsWith('cms_load_hods'))
            return Response.json({ hods: baseline.hods });
          assert(u.pathname.endsWith('cms_load_domains'));
          calls++;
          if (failure === 'http')
            return new Response('PRIVATE-upstream', { status: 503 });
          if (failure === 'network') throw new Error('PRIVATE-url-token');
          if (failure === 'timeout') {
            assert(options.signal instanceof AbortSignal);
            throw new DOMException('PRIVATE-timeout', 'TimeoutError');
          }
          if (failure === 'json') return new Response('PRIVATE-malformed-json');
          return Response.json(
            failure === 'null' ? null : failure === 'shape' ? {} : { domains },
          );
        },
      });
      if (failure) {
        await assert.rejects(run, (error) => {
          assert(!error.message.includes('PRIVATE'));
          return true;
        });
        assert.equal(await readFile(path, 'utf8'), original);
      } else {
        assert.equal(await run, 'remote');
        assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), {
          ...baseline,
          domains,
        });
      }
      assert.equal(calls, 1);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}

test('Domains sync local mode and partial remote configuration', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-domains-config-'));
  try {
    const path = join(dir, 'snapshot.json');
    const original = JSON.stringify(baseline);
    await writeFile(path, original);
    const noFetch = () => {
      throw new Error('Unexpected fetch');
    };
    assert.equal(
      await syncCmsSnapshot({
        snapshotPath: path,
        env: {},
        fetchImpl: noFetch,
      }),
      'local',
    );
    for (const config of [
      { CMS_API_URL: env.CMS_API_URL },
      { CMS_API_TOKEN: env.CMS_API_TOKEN },
    ])
      await assert.rejects(
        syncCmsSnapshot({
          snapshotPath: path,
          env: config,
          fetchImpl: noFetch,
        }),
      );
    for (const missing of ['SUPABASE_URL', 'SUPABASE_ANON_KEY']) {
      const config = { ...env };
      delete config[missing];
      await assert.rejects(
        syncCmsSnapshot({
          snapshotPath: path,
          env: config,
          fetchImpl: async () => Response.json(baseline),
        }),
        /requires SUPABASE/,
      );
    }
    assert.equal(await readFile(path, 'utf8'), original);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('Domains migration on real ephemeral PostgreSQL: seed, privileges, fixed slots', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-domains-pg-'));
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
      JSON.parse(
        ok(sql(`set role ${role}; select public.cms_load_domains();`)),
      );
    assert.deepEqual(load('anon').domains, baseline.domains);
    assert.deepEqual(load('service_role').domains, baseline.domains);
    for (const role of ['anon', 'authenticated']) {
      for (const query of [
        'select * from private.cms_domains',
        'select private.cms_load_domains()',
        "update private.cms_domains set title = 'bad' where id = 'data'",
        "delete from private.cms_domains where id = 'data'",
      ]) {
        assert.notEqual(
          sql(`set role ${role}; ${query}`).status,
          0,
          `${role}: ${query}`,
        );
      }
    }
    assert.notEqual(
      sql('set role authenticated; select public.cms_load_domains()').status,
      0,
    );
    const literal = (value) => "'" + value.replaceAll("'", "''") + "'";
    const invalid = (query) => {
      const result = sql(query);
      assert.notEqual(result.status, 0, query);
      assert.match(result.stderr, /check constraint|not-null constraint/);
    };
    for (const role of ['anon', 'authenticated']) {
      for (const query of [
        "select private.cms_domains_utf16_length('x')",
        "select private.cms_domains_labels_valid('data', '[]')",
        "insert into private.cms_domains (id,title,description,labels,position) values ('data','x','x','[]',1)",
      ])
        assert.notEqual(sql(`set role ${role}; ${query}`).status, 0);
    }
    assert.equal(
      ok(
        sql(
          "select relrowsecurity from pg_class where oid='private.cms_domains'::regclass",
        ),
      ),
      't',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_policy where polrelid='private.cms_domains'::regclass and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false'",
        ),
      ),
      '1',
    );
    // Temporarily grant direct access in a rolled-back fixture to isolate RLS behavior.
    for (const role of ['anon', 'authenticated']) {
      assert.equal(
        ok(
          sql(
            `begin; grant usage on schema private to ${role}; grant select,insert,update,delete on private.cms_domains to ${role}; set local role ${role}; select count(*) from private.cms_domains; rollback;`,
          ),
        ),
        '0',
      );
      assert.notEqual(
        sql(
          `begin; grant usage on schema private to ${role}; grant insert on private.cms_domains to ${role}; set local role ${role}; insert into private.cms_domains (id,title,description,labels,position) values ('data','x','x','[]',1); rollback;`,
        ).status,
        0,
      );
    }
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc where oid in ('private.cms_load_domains()'::regprocedure,'public.cms_load_domains()'::regprocedure) and prosecdef and proconfig=array['search_path=pg_catalog']",
        ),
      ),
      '2',
    );
    // Reinsert in reverse physical order; output must still follow fixed positions.
    ok(
      sql(
        'create temp table copy as table private.cms_domains; delete from private.cms_domains; insert into private.cms_domains select * from copy order by position desc;',
      ),
    );
    assert.deepEqual(load('anon').domains, baseline.domains);
    invalid("update private.cms_domains set position=7 where id='data'");
    invalid("update private.cms_domains set id='unknown' where id='data'");
    for (const field of ['title', 'description']) {
      for (const expression of [
        "''",
        'null',
        "repeat('a',20001)",
        "repeat('😀',10001)",
      ])
        invalid(
          `update private.cms_domains set ${field}=${expression} where id='data'`,
        );
      for (const expression of [
        "repeat('a',20000)",
        "repeat('😀',10000)",
        "'quote '' and unicode 日本語'",
      ])
        ok(
          sql(
            `update private.cms_domains set ${field}=${expression} where id='data'`,
          ),
        );
    }
    for (const d of baseline.domains) {
      const update = (labels) =>
        `update private.cms_domains set labels=${literal(JSON.stringify(labels))}::jsonb where id=${literal(d.id)}`;
      for (const bad of [
        null,
        {},
        1,
        'scalar',
        [],
        d.labels.slice(1),
        [...d.labels, []],
      ])
        invalid(update(bad));
      for (let r = 0; r < 3; r++) {
        for (const bad of [
          null,
          {},
          1,
          'scalar',
          [],
          [...d.labels[r], 'extra'],
        ]) {
          const labels = structuredClone(d.labels);
          labels[r] = bad;
          invalid(update(labels));
        }
        for (let c = 0; c < d.labels[r].length; c++) {
          for (const bad of [
            null,
            1,
            {},
            [],
            d.labels[r][c] ? '' : ' ',
            'x'.repeat(257),
            '😀'.repeat(129),
          ]) {
            const labels = structuredClone(d.labels);
            labels[r][c] = bad;
            invalid(update(labels));
          }
          if (d.labels[r][c]) {
            for (const good of [
              ' ',
              "quote ' 日本語",
              'a'.repeat(256),
              '😀'.repeat(128),
            ]) {
              const labels = structuredClone(d.labels);
              labels[r][c] = good;
              ok(sql(update(labels)));
              assert.deepEqual(
                load('anon').domains.find((record) => record.id === d.id)
                  .labels,
                labels,
              );
            }
          }
        }
      }
      ok(sql(update(d.labels)));
    }
    ok(sql("update private.cms_domains set title='Keep edit' where id='data'"));
    ok(sql(migration));
    assert.equal(load('anon').domains[0].title, 'Keep edit');
    assert.equal(load('anon').domains.length, 6);
    ok(sql("delete from private.cms_domains where id='growth'"));
    assert.equal(load('anon').domains.length, 5); // Final Zod rejects incomplete collections.
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});
