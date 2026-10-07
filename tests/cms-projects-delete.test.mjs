import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('Projects delete preserves revision guards, reindexes a middle deletion and denies public writes in PostgreSQL', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-projects-delete-pg-'));
  const data = join(dir, 'data');
  const port = String(59000 + Math.floor(Math.random() * 1000));
  const command = (exe, args) => spawnSync(exe, args, { encoding: 'utf8' });
  const ok = (result) => {
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  };
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
  const migration = await readFile(
    new URL(
      '../supabase/migrations/20261008010000_cms_projects_pass1.sql',
      import.meta.url,
    ),
    'utf8',
  );
  const fix = await readFile(
    new URL(
      '../supabase/migrations/20261015010000_cms_projects_delete_fix.sql',
      import.meta.url,
    ),
    'utf8',
  );
  const load = () => JSON.parse(ok(sql('select public.cms_load_projects();')));
  const remove = (id, revision) =>
    JSON.parse(
      ok(
        sql(
          `set role service_role; select public.cms_delete_project('${JSON.stringify({ id, revision })}'::jsonb);`,
        ),
      ),
    );
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
        'create role anon; create role authenticated; create role service_role bypassrls; create schema private;',
      ),
    );
    ok(sql(migration));
    const initial = load();
    const target = initial.projects[1].id;
    assert.notEqual(
      sql(
        `select public.cms_delete_project('${JSON.stringify({ id: target, revision: initial.revision })}'::jsonb);`,
      ).status,
      0,
    );
    assert.deepEqual(load(), initial); // Failed legacy delete rolls back its mutation.
    const acl = ok(
      sql(
        "select proacl::text from pg_proc where oid='private.cms_delete_project(jsonb)'::regprocedure",
      ),
    );
    ok(sql(fix));
    assert.equal(
      ok(
        sql(
          "select proacl::text from pg_proc where oid='private.cms_delete_project(jsonb)'::regprocedure",
        ),
      ),
      acl,
    );
    assert.deepEqual(remove(target, 'stale').error, { code: 'CONFLICT' });
    assert.deepEqual(remove('absent', initial.revision).error, {
      code: 'NOT_FOUND',
    });
    const deleted = remove(target, initial.revision);
    assert.deepEqual(
      deleted.projects,
      initial.projects.filter((p) => p.id !== target),
    );
    assert.equal(deleted.affectedId, target);
    assert.notEqual(deleted.revision, initial.revision);
    assert.equal(deleted.publicationPending, true);
    assert.equal(
      ok(
        sql(
          "select string_agg(position::text,',' order by position) from private.cms_projects",
        ),
      ),
      '1,2,3',
    );
    for (const role of ['anon', 'authenticated']) {
      assert.notEqual(
        sql(`set role ${role}; select public.cms_delete_project('{}'::jsonb);`)
          .status,
        0,
      );
    }
    while (load().projects.length > 1) {
      const current = load();
      remove(current.projects[0].id, current.revision);
    }
    const last = load();
    assert.deepEqual(remove(last.projects[0].id, last.revision).error, {
      code: 'MINIMUM',
    });
    assert.deepEqual(load(), last);
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});
