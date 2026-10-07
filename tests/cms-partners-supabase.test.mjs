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
    '../supabase/migrations/20261013010000_cms_partners_pass6.sql',
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
  'missing-row',
  'shape',
  'count',
  'category-type',
  'why-type',
  'why-count',
  'path',
  'empty',
  'metadata',
  'gas-invalid',
]) {
  test(`hybrid Partners source and atomic failure: ${failure || 'success'}`, async () => {
    const dir = await mkdtemp(join(tmpdir(), 'ds-partners-'));
    try {
      const path = join(dir, 'snapshot.json');
      const original = JSON.stringify(baseline);
      await writeFile(path, original);
      const gas = structuredClone(baseline);
      gas.partners.partnerCategories[0].label = 'Old GAS content';
      gas.partners.whyPartners[0].title = 'Old GAS why';
      gas.partners.partnerLogo = '/images/partners/why-community.webp';
      const partners = structuredClone(baseline.partners);
      partners.partnerCategories[0].label = 'Supabase content';
      partners.whyPartners[0].title = 'Supabase why';
      if (failure === 'count') partners.partnerCategories.pop();
      if (failure === 'category-type') partners.partnerCategories[0] = 'x';
      if (failure === 'why-type') partners.whyPartners[0].title = 4;
      if (failure === 'why-count') partners.whyPartners.pop();
      if (failure === 'path') partners.partnerLogo = '/images/../secret';
      if (failure === 'empty') partners.whyPartners[0].description = '';
      if (failure === 'gas-invalid') gas.partners.partnerCategories = [];
      if (failure === 'metadata') partners.count = 20;
      let calls = 0;
      const rpcOrder = [];
      const run = syncCmsSnapshot({
        snapshotPath: path,
        env,
        fetchImpl: async (url, options) => {
          const u = new URL(url);
          if (u.hostname === 'script.google.com') return Response.json(gas);
          assert.equal(options.headers.apikey, env.SUPABASE_ANON_KEY);
          assert.equal(options.method, 'POST');
          rpcOrder.push(u.pathname.split('/').at(-1));
          if (u.pathname.endsWith('cms_load_hods'))
            return Response.json({ hods: baseline.hods });
          if (u.pathname.endsWith('cms_load_projects'))
            return Response.json({ projects: baseline.projects });
          if (u.pathname.endsWith('cms_load_team')) return Response.json(team);
          if (u.pathname.endsWith('cms_load_roles'))
            return Response.json({ roles: baseline.roles });
          if (u.pathname.endsWith('cms_load_domains'))
            return Response.json({ domains: baseline.domains });
          assert(u.pathname.endsWith('cms_load_partners'));
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
            failure === 'null'
              ? null
              : failure === 'shape'
                ? {}
                : { partners: failure === 'missing-row' ? null : partners },
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
          partners,
        });
      }
      assert.equal(calls, failure === 'gas-invalid' ? 0 : 1);
      assert.deepEqual(
        rpcOrder,
        failure === 'gas-invalid'
          ? []
          : [
              'cms_load_projects',
              'cms_load_team',
              'cms_load_roles',
              'cms_load_domains',
              'cms_load_hods',
              'cms_load_partners',
            ],
      );
      assert.deepEqual((await readdir(dir)).sort(), ['snapshot.json']);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
}

test('Partners sync local mode and partial remote configuration', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-partners-config-'));
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

test('Partners real PostgreSQL: strict schema, Unicode/path parity, RLS, privileges and rerun', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-partners-pg-'));
  const data = join(dir, 'data');
  const port = String(58000 + Math.floor(Math.random() * 1000));
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
  const literal = (v) => "'" + v.replaceAll("'", "''") + "'";
  const json = (v) => literal(JSON.stringify(v)) + '::jsonb';
  const load = (role = 'anon') =>
    JSON.parse(ok(sql(`set role ${role}; select public.cms_load_partners();`)));
  let started = false,
    negative = 0,
    positive = 0,
    denied = 0;
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
    assert.deepEqual(load(), { partners: baseline.partners });
    assert.deepEqual(load('service_role'), { partners: baseline.partners });
    const functions = [
      'private.cms_partners_items_valid(jsonb,text)',
      'private.cms_partners_logo_valid(text)',
      'private.cms_load_partners()',
      'public.cms_load_partners()',
    ];
    assert.equal(
      ok(
        sql(
          `select count(*) from pg_proc p where p.oid in (${functions.map((f) => literal(f) + '::regprocedure').join(',')}) and pg_get_userbyid(proowner)='postgres' and proconfig=array['search_path=pg_catalog'] and not exists(select 1 from aclexplode(coalesce(proacl,acldefault('f',proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE')`,
        ),
      ),
      '4',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc where oid in ('private.cms_load_partners()'::regprocedure,'public.cms_load_partners()'::regprocedure) and prosecdef and provolatile='s'",
        ),
      ),
      '2',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc where oid in ('private.cms_partners_items_valid(jsonb,text)'::regprocedure,'private.cms_partners_logo_valid(text)'::regprocedure) and not prosecdef and provolatile='i'",
        ),
      ),
      '2',
    );
    assert.equal(
      ok(
        sql(
          "select relrowsecurity from pg_class where oid='private.cms_partners'::regclass",
        ),
      ),
      't',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_policy where polrelid='private.cms_partners'::regclass and polcmd='*' and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false'",
        ),
      ),
      '1',
    );
    for (const role of ['anon', 'authenticated', 'service_role']) {
      const queries = [
        'select * from private.cms_partners',
        'select private.cms_load_partners()',
        "select private.cms_partners_items_valid('[]','category')",
        "select private.cms_partners_logo_valid('/images/x.webp')",
        `insert into private.cms_partners (id,partner_categories,partner_logo,why_partners) values (1,${json(baseline.partners.partnerCategories)},'/images/x.webp',${json(baseline.partners.whyPartners)})`,
        "update private.cms_partners set partner_logo='/images/x.webp' where id=1",
        'delete from private.cms_partners where id=1',
        ...(role === 'authenticated'
          ? ['select public.cms_load_partners()']
          : []),
      ];
      for (const query of queries) {
        const r = sql(`set role ${role}; ${query}`);
        assert.notEqual(r.status, 0);
        assert.match(r.stderr, /permission denied/);
        denied++;
      }
    }
    assert.equal(denied, 22);
    const invalid = (query) => {
      const r = sql(query);
      assert.notEqual(r.status, 0);
      assert.match(r.stderr, /check constraint|not-null constraint/);
    };
    invalid('update private.cms_partners set id=2');
    invalid('update private.cms_partners set id=null');
    const duplicate = sql(
      'insert into private.cms_partners select * from private.cms_partners',
    );
    assert.notEqual(duplicate.status, 0);
    assert.match(duplicate.stderr, /duplicate key/);
    const fixture = (partners, valid) => {
      assert.equal(
        cmsSnapshotSchema.safeParse({ ...baseline, partners }).success,
        valid,
      );
      const query = `update private.cms_partners set partner_categories=${json(partners.partnerCategories)}, partner_logo=${partners.partnerLogo === null ? 'null' : literal(partners.partnerLogo)}, why_partners=${json(partners.whyPartners)} where id=1`;
      if (valid) {
        ok(sql(query));
        assert.deepEqual(load().partners, partners);
        positive++;
      } else {
        invalid(query);
        negative++;
      }
    };
    const mutate = (fn, valid = false) => {
      const p = structuredClone(baseline.partners);
      fn(p);
      fixture(p, valid);
    };
    for (const field of ['partnerCategories', 'whyPartners']) {
      for (const value of [
        null,
        {},
        1,
        'scalar',
        true,
        [],
        baseline.partners[field].slice(1),
        [...baseline.partners[field], baseline.partners[field][0]],
      ])
        mutate((p) => {
          p[field] = value;
        });
      for (let i = 0; i < baseline.partners[field].length; i++) {
        for (const value of [
          null,
          {},
          1,
          'scalar',
          true,
          [],
          { ...baseline.partners[field][i], extra: 'x' },
        ])
          mutate((p) => {
            p[field][i] = value;
          });
        for (const key of Object.keys(baseline.partners[field][i])) {
          mutate((p) => {
            delete p[field][i][key];
          });
          for (const value of [
            null,
            1,
            {},
            [],
            true,
            '',
            'a'.repeat(20001),
            '😀'.repeat(20001),
            'a'.repeat(10000) + '😀'.repeat(10001),
            'e\u0301'.repeat(10000) + 'a',
          ])
            mutate((p) => {
              p[field][i][key] = value;
            });
          for (const value of [
            ' ',
            "quote ' 日本語\nsecond line",
            'a'.repeat(20000),
            '😀'.repeat(20000),
            'a'.repeat(10000) + '😀'.repeat(10000),
            'e\u0301'.repeat(10000),
          ])
            mutate((p) => {
              p[field][i][key] = value;
            }, true);
        }
      }
    }
    for (const path of [
      '',
      '/images/',
      '/images/../x',
      '/images/x..webp',
      'https://example.com/x',
      '//images/x',
      'data:image/png,x',
      '/images/é.webp',
      '/images/x\n',
      '/images/x\r',
      '/images/x\t',
      '/images/x\\y',
    ])
      mutate((p) => {
        p.partnerLogo = path;
      });
    for (const path of [
      '/images/x.webp',
      '/images/a_B-1/x.2.webp',
      '/images//x',
      '/images/.',
      '/images/x/',
    ])
      mutate((p) => {
        p.partnerLogo = path;
      }, true);
    mutate((p) => {
      p.partnerLogo = null;
    });
    // Zod permits these JS strings; PostgreSQL cannot represent them, so conversion fails closed.
    for (const value of ['\u0000', '\ud800', '\udfff']) {
      const p = structuredClone(baseline.partners);
      p.partnerCategories[0].label = value;
      assert(cmsSnapshotSchema.safeParse({ ...baseline, partners: p }).success);
      const r = sql(
        `update private.cms_partners set partner_categories=${json(p.partnerCategories)}`,
      );
      assert.notEqual(r.status, 0);
      assert.match(r.stderr, /Unicode|unicode|surrogate/);
    }
    assert.equal(
      ok(
        sql(
          "select private.cms_partners_items_valid(null,'category'),private.cms_partners_items_valid('[]',null),private.cms_partners_items_valid('[]','unknown'),private.cms_partners_logo_valid(null)",
        ),
      ),
      'f|f|f|f',
    );
    mutate((p) => {
      p.partnerCategories.reverse();
      p.whyPartners.reverse();
    }, true);
    assert.notDeepEqual(load().partners, baseline.partners);
    ok(sql(migration)); // Seed must not overwrite the valid reordered fixture.
    assert.notDeepEqual(load().partners, baseline.partners);
    assert.equal(ok(sql('select count(*) from private.cms_partners')), '1');
    // Isolate RLS with local temporary grants, always rolled back.
    for (const role of ['anon', 'authenticated']) {
      const prefix = `begin; grant usage on schema private to ${role}; grant select,insert,update,delete on private.cms_partners to ${role}; grant execute on function private.cms_partners_items_valid(jsonb,text),private.cms_partners_logo_valid(text) to ${role}; set local role ${role};`;
      assert.equal(
        ok(
          sql(prefix + 'select count(*) from private.cms_partners; rollback;'),
        ),
        '0',
      );
      assert.equal(
        ok(
          sql(
            prefix +
              "with touched as (update private.cms_partners set partner_logo='/images/x' returning id) select count(*) from touched; rollback;",
          ),
        ),
        '0',
      );
      assert.equal(
        ok(
          sql(
            prefix +
              'with touched as (delete from private.cms_partners returning id) select count(*) from touched; rollback;',
          ),
        ),
        '0',
      );
      const r = sql(
        `begin; delete from private.cms_partners; grant usage on schema private to ${role}; grant insert on private.cms_partners to ${role}; grant execute on function private.cms_partners_items_valid(jsonb,text),private.cms_partners_logo_valid(text) to ${role}; set local role ${role}; insert into private.cms_partners (id,partner_categories,partner_logo,why_partners) values (1,${json(baseline.partners.partnerCategories)},'/images/x',${json(baseline.partners.whyPartners)}); rollback;`,
      );
      assert.notEqual(r.status, 0);
      assert.match(r.stderr, /row-level security/);
    }
    ok(sql('delete from private.cms_partners'));
    assert.deepEqual(load(), { partners: null });
    assert(!cmsSnapshotSchema.safeParse({ ...baseline, ...load() }).success);
    assert.equal(negative, 199);
    assert.equal(positive, 72);
    console.log(
      `Partners PostgreSQL fixtures: ${negative} invalid, ${positive} valid, ${denied} permission denials`,
    );
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});
