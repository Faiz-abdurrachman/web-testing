import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { cmsSnapshotSchema } from '../src/data/cms-schema.mjs';
import { syncCmsSnapshot } from '../scripts/cms-client.mjs';

const baseline = JSON.parse(
  await readFile(new URL('../src/data/cms-snapshot.json', import.meta.url)),
);
const migration = await readFile(
  new URL(
    '../supabase/migrations/20261012010000_cms_hods_pass5.sql',
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
  'tabs',
  'sections',
  'union',
  'bullets',
  'empty',
  'metadata',
  'gas-invalid',
]) {
  test(`hybrid Hods source and atomic failure: ${failure || 'success'}`, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ds-hods-'));
    try {
      const path = join(dir, 'snapshot.json');
      const original = JSON.stringify(baseline);
      await writeFile(path, original);
      const gas = structuredClone(baseline);
      gas.hods[0].title = 'Old GAS content';
      const hods = structuredClone(baseline.hods);
      hods[0].title = 'Supabase content';
      if (failure === 'order') hods.reverse();
      if (failure === 'count') hods.pop();
      if (failure === 'tabs') hods[0].tabs.pop();
      if (failure === 'sections') hods[0].tabs[0].sections.pop();
      if (failure === 'union') hods[0].tabs[0].sections[0].bullets = ['x'];
      if (failure === 'bullets') hods[0].tabs[0].sections[1].bullets.pop();
      if (failure === 'empty') hods[0].tabs[0].sections[0].text = '';
      if (failure === 'gas-invalid') gas.hods[0].tabs = [];
      if (failure === 'metadata') hods[0].position = 1;
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
          if (u.pathname.endsWith('cms_load_domains'))
            return Response.json({ domains: baseline.domains });
          assert(u.pathname.endsWith('cms_load_hods'));
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
            failure === 'null' ? null : failure === 'shape' ? {} : { hods },
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
          hods,
        });
      }
      assert.equal(calls, failure === 'gas-invalid' ? 0 : 1);
      assert.deepEqual((await readdir(dir)).sort(), ['snapshot.json']);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}

test('Hods sync local mode and partial remote configuration', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-hods-config-'));
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

test('Hods migration on real ephemeral PostgreSQL: seed, privileges, strict nested slots', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-hods-pg-'));
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
      JSON.parse(ok(sql(`set role ${role}; select public.cms_load_hods();`)));
    assert.deepEqual(load('anon').hods, baseline.hods);
    assert.deepEqual(load('service_role').hods, baseline.hods);
    for (const role of ['anon', 'authenticated']) {
      for (const query of [
        'select * from private.cms_hods',
        'select private.cms_load_hods()',
        "update private.cms_hods set title = 'bad' where id = 'data'",
        "delete from private.cms_hods where id = 'data'",
      ]) {
        assert.notEqual(
          sql(`set role ${role}; ${query}`).status,
          0,
          `${role}: ${query}`,
        );
      }
    }
    assert.notEqual(
      sql('set role authenticated; select public.cms_load_hods()').status,
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
        "select private.cms_hods_utf16_length('x')",
        "select private.cms_hods_tabs_valid('data', '[]')",
        "insert into private.cms_hods (id,title,description,tabs,position) values ('data','x','x','[]',1)",
      ])
        assert.notEqual(sql(`set role ${role}; ${query}`).status, 0);
    }
    assert.equal(
      ok(
        sql(
          "select relrowsecurity from pg_class where oid='private.cms_hods'::regclass",
        ),
      ),
      't',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_policy where polrelid='private.cms_hods'::regclass and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false'",
        ),
      ),
      '1',
    );
    // Temporarily grant direct access in a rolled-back fixture to isolate RLS behavior.
    for (const role of ['anon', 'authenticated']) {
      assert.equal(
        ok(
          sql(
            `begin; grant usage on schema private to ${role}; grant select,insert,update,delete on private.cms_hods to ${role}; set local role ${role}; select count(*) from private.cms_hods; rollback;`,
          ),
        ),
        '0',
      );
      const growth = baseline.hods.at(-1);
      const deniedInsert = sql(
        `begin; delete from private.cms_hods where id='growth'; grant usage on schema private to ${role}; grant insert on private.cms_hods to ${role}; grant execute on function private.cms_hods_utf16_length(text), private.cms_hods_tabs_valid(text,jsonb) to ${role}; set local role ${role}; insert into private.cms_hods (id,title,description,tabs,position) values ('growth','x','x',${literal(JSON.stringify(growth.tabs))}::jsonb,6); rollback;`,
      );
      assert.notEqual(deniedInsert.status, 0);
      assert.match(deniedInsert.stderr, /row-level security/);
    }
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc where oid in ('private.cms_load_hods()'::regprocedure,'public.cms_load_hods()'::regprocedure) and prosecdef and proconfig=array['search_path=pg_catalog']",
        ),
      ),
      '2',
    );
    // Reinsert in reverse physical order; output must still follow fixed positions.
    ok(
      sql(
        'create temp table copy as table private.cms_hods; delete from private.cms_hods; insert into private.cms_hods select * from copy order by position desc;',
      ),
    );
    assert.deepEqual(load('anon').hods, baseline.hods);
    invalid("update private.cms_hods set position=7 where id='data'");
    invalid("update private.cms_hods set id='unknown' where id='data'");
    for (const field of ['title', 'description']) {
      for (const expression of [
        "''",
        'null',
        "repeat('a',20001)",
        "repeat('😀',10001)",
      ])
        invalid(
          `update private.cms_hods set ${field}=${expression} where id='data'`,
        );
      for (const expression of [
        "repeat('a',20000)",
        "repeat('😀',10000)",
        "'quote '' and unicode 日本語'",
      ])
        ok(
          sql(
            `update private.cms_hods set ${field}=${expression} where id='data'`,
          ),
        );
    }
    let negativeFixtures = 0;
    let positiveFixtures = 0;
    const fixture = (h, tabs, valid, zodValid = valid) => {
      const candidate = structuredClone(baseline);
      candidate.hods.find((record) => record.id === h.id).tabs = tabs;
      assert.equal(
        cmsSnapshotSchema.safeParse(candidate).success,
        zodValid,
        `Zod parity ${h.id}: ${JSON.stringify(tabs).slice(0, 180)}; fixture ${negativeFixtures}`,
      );
      const update = `update private.cms_hods set tabs=${literal(JSON.stringify(tabs))}::jsonb where id=${literal(h.id)}`;
      if (valid) {
        ok(sql(update));
        assert.deepEqual(
          load('anon').hods.find((record) => record.id === h.id).tabs,
          tabs,
        );
        positiveFixtures++;
      } else {
        invalid(update);
        negativeFixtures++;
      }
    };
    const malformed = [null, {}, 1, 'scalar', true, []];
    const badText = [
      null,
      1,
      {},
      [],
      '',
      'a'.repeat(20001),
      '😀'.repeat(10001),
    ];
    const goodText = [
      ' ',
      "quote ' 日本語\nsecond line",
      'a'.repeat(20000),
      '😀'.repeat(10000),
    ];
    for (const h of baseline.hods) {
      for (const value of [
        ...malformed,
        h.tabs.slice(1),
        [...h.tabs, h.tabs[0]],
      ])
        fixture(h, value, false);
      for (let t = 0; t < h.tabs.length; t++) {
        const mutate = (fn, valid = false, zodValid = valid) => {
          const tabs = structuredClone(h.tabs);
          fn(tabs);
          fixture(h, tabs, valid, zodValid);
        };
        for (const value of [
          ...malformed,
          { sections: h.tabs[t].sections, label: 'extra' },
        ])
          mutate((tabs) => {
            tabs[t] = value;
          });
        for (const value of [
          ...malformed,
          h.tabs[t].sections.slice(1),
          [...h.tabs[t].sections, h.tabs[t].sections[0]],
        ])
          mutate((tabs) => {
            tabs[t].sections = value;
          });
        for (let s = 0; s < h.tabs[t].sections.length; s++) {
          const section = h.tabs[t].sections[s];
          for (const value of [
            ...malformed,
            { title: section.title },
            { ...section, kind: 'extra' },
            {
              title: section.title,
              text: 'both',
              bullets: ['a', 'b', 'c', 'd'],
            },
            'text' in section
              ? { title: section.title, bullets: ['a', 'b', 'c', 'd'] }
              : { title: section.title, text: 'wrong slot' },
          ])
            mutate((tabs) => {
              tabs[t].sections[s] = value;
            });
          for (const field of [
            'title',
            ...('text' in section ? ['text'] : []),
          ]) {
            for (const value of badText)
              mutate(
                (tabs) => {
                  tabs[t].sections[s][field] = value;
                },
                false,
                value === badText.at(-1),
              );
            // Zod 4 uses codepoint lengths for strings over the limit; SQL intentionally
            // keeps the planned UTF-16 ceiling. Each slot round-trips whitespace/quotes.
            for (const value of goodText.slice(0, t === 0 && s === 0 ? 4 : 2))
              mutate((tabs) => {
                tabs[t].sections[s][field] = value;
              }, true);
          }
          if ('bullets' in section) {
            for (const value of [
              ...malformed,
              section.bullets.slice(1),
              [...section.bullets, 'extra'],
            ])
              mutate((tabs) => {
                tabs[t].sections[s].bullets = value;
              });
            for (let b = 0; b < section.bullets.length; b++) {
              for (const value of badText)
                mutate(
                  (tabs) => {
                    tabs[t].sections[s].bullets[b] = value;
                  },
                  false,
                  value === badText.at(-1),
                );
              for (const value of goodText)
                mutate((tabs) => {
                  tabs[t].sections[s].bullets[b] = value;
                }, true);
            }
          }
        }
      }
      ok(
        sql(
          `update private.cms_hods set tabs=${literal(JSON.stringify(h.tabs))}::jsonb where id=${literal(h.id)}`,
        ),
      );
    }
    assert(negativeFixtures > 1000);
    assert(positiveFixtures > 200);

    // Same-shape reorder is structurally valid but content equality detects the swap.
    const swapped = structuredClone(baseline.hods[1].tabs);
    swapped[0].sections.reverse();
    fixture(baseline.hods[1], swapped, true);
    assert.notDeepEqual(load('anon').hods[1].tabs, baseline.hods[1].tabs);
    assert.equal(
      ok(
        sql(
          "select private.cms_hods_tabs_valid(null,'[]'), private.cms_hods_tabs_valid('unknown','[]'), private.cms_hods_tabs_valid('data',null)",
        ),
      ),
      'f|f|f',
    );
    // Every function revokes the default PUBLIC execute; ownership must permit the definer read.
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc p where p.oid in ('private.cms_hods_utf16_length(text)'::regprocedure,'private.cms_hods_tabs_valid(text,jsonb)'::regprocedure,'private.cms_load_hods()'::regprocedure,'public.cms_load_hods()'::regprocedure) and pg_get_userbyid(p.proowner)='postgres' and not exists (select 1 from aclexplode(p.proacl) a where a.grantee=0 and a.privilege_type='EXECUTE')",
        ),
      ),
      '4',
    );
    // RLS must suppress updates/deletes even when direct privileges are temporarily present.
    for (const role of ['anon', 'authenticated']) {
      assert.equal(
        ok(
          sql(
            `begin; grant usage on schema private to ${role}; grant select,update,delete on private.cms_hods to ${role}; set local role ${role}; with touched as (update private.cms_hods set title='bad' returning id) select count(*) from touched; rollback;`,
          ),
        ),
        '0',
      );
      assert.equal(
        ok(
          sql(
            `begin; grant usage on schema private to ${role}; grant select,delete on private.cms_hods to ${role}; set local role ${role}; with touched as (delete from private.cms_hods returning id) select count(*) from touched; rollback;`,
          ),
        ),
        '0',
      );
    }
    ok(sql("update private.cms_hods set title='Keep edit' where id='data'"));
    ok(sql(migration));
    assert.equal(load('anon').hods[0].title, 'Keep edit');
    assert.equal(load('anon').hods.length, 6);
    ok(sql("delete from private.cms_hods where id='growth'"));
    assert.equal(load('anon').hods.length, 5);
    assert.equal(
      cmsSnapshotSchema.safeParse({ ...baseline, hods: load('anon').hods })
        .success,
      false,
    );
    ok(sql('delete from private.cms_hods'));
    assert.deepEqual(load('anon'), { hods: [] });
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});
