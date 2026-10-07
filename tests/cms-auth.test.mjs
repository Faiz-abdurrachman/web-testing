import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createCmsAuth } from '../server/cms-auth.mjs';

const migration = await readFile(
  new URL(
    '../supabase/migrations/20261014010000_cms_auth_pass7.sql',
    import.meta.url,
  ),
  'utf8',
);

const origin = 'https://admin.example.test';
const USER_ID = '11111111-1111-1111-1111-111111111111';
const env = {
  NODE_ENV: 'production',
  CMS_ADMIN_ORIGIN: origin,
  CMS_ADMIN_SESSION_SECRET: Buffer.alloc(32, 9).toString('base64'),
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
};
const request = (path, options = {}) => new Request(origin + path, options);

function harness({
  authorized = true,
  userOk = true,
  badLogin = false,
  limited = false,
  limitFailure = false,
} = {}) {
  let now = 100000;
  const calls = [];
  const fetchImpl = async (url, options) => {
    const u = String(url);
    calls.push(u);
    if (u.includes('/auth/v1/token')) {
      const isRefresh = u.includes('grant_type=refresh_token');
      if (badLogin && !isRefresh)
        return Response.json(
          { error: 'invalid_grant', error_description: 'PRIVATE' },
          { status: 400 },
        );
      return Response.json({
        access_token: 'ACCESS-' + calls.length,
        refresh_token: 'REFRESH-' + calls.length,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: USER_ID },
      });
    }
    if (u.includes('/auth/v1/user'))
      return userOk
        ? Response.json({ id: USER_ID, email: 'owner@example.test' })
        : Response.json({ message: 'PRIVATE' }, { status: 401 });
    if (u.includes('cms_verify_admin'))
      return Response.json(
        authorized ? { ok: true, email: 'o@e.t' } : { ok: false },
      );
    if (u.includes('cms_rate_limit_check') && limitFailure)
      return Response.json({ message: 'PRIVATE' }, { status: 500 });
    if (u.includes('cms_rate_limit_check'))
      return Response.json(
        limited ? { ok: false, limited: true } : { ok: true, limited: false },
      );
    if (u.includes('cms_rate_limit_reset')) return Response.json({ ok: true });
    return Response.json({});
  };
  const auth = createCmsAuth({ env, clock: () => now, fetchImpl });
  return {
    auth,
    calls,
    setAuthorized: (value) => (authorized = value),
    advance: (n) => (now += n),
  };
}

function cookieOf(response) {
  return response.headers
    .getSetCookie()
    .map((v) => v.split(';')[0])
    .join('; ');
}
const login = (h, body = { email: 'owner@example.test', password: 'pw' }) =>
  h.auth.login(
    request('/api/admin/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );

test('login rejects wrong method, origin, content-type and malformed body without upstream calls', async () => {
  const h = harness();
  assert.equal(
    (await h.auth.login(request('/', { method: 'DELETE' }))).status,
    405,
  );
  assert.equal(
    (await h.auth.login(request('/', { method: 'GET' }))).status,
    303,
  );
  assert.equal(
    (
      await h.auth.login(
        request('/api/admin/auth/login', {
          method: 'POST',
          headers: {
            Origin: 'https://evil.test',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
        }),
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await h.auth.login(
        request('/api/admin/auth/login', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'text/plain' },
          body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
        }),
      )
    ).status,
    415,
  );
  assert.equal(
    (
      await h.auth.login(
        request('/api/admin/auth/login', {
          method: 'POST',
          headers: { Origin: origin, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'a@b.c', extra: 1 }),
        }),
      )
    ).status,
    400,
  );
  assert.equal(h.calls.length, 0);
});

test('login denies bad credentials and rate limit, never leaks upstream text', async () => {
  const bad = harness({ badLogin: true });
  const failed = await login(bad);
  assert.equal(failed.status, 401);
  assert.deepEqual(await failed.json(), {
    ok: false,
    error: { code: 'UNAUTHORIZED' },
  });
  const limited = harness({ limited: true });
  const throttled = await login(limited);
  assert.equal(throttled.status, 429);
  assert(!JSON.stringify(await throttled.json()).includes('PRIVATE'));
});

test('non-owner denies with FORBIDDEN and no session cookie', async () => {
  const h = harness({ authorized: false });
  const denied = await login(h);
  assert.equal(denied.status, 403);
  assert.deepEqual(await denied.json(), {
    ok: false,
    error: { code: 'FORBIDDEN' },
  });
  assert(!denied.headers.get('set-cookie'));
});

test('authorize requires valid session, origin, CSRF and permission', async () => {
  const h = harness();
  const ok = await login(h);
  const cookie = cookieOf(ok);
  const csrf = (await ok.json()).csrf;
  assert.equal((await h.auth.authorize(request('/x'))).error.status, 401);
  assert.equal(
    (
      await h.auth.authorize(
        request('/x', { method: 'POST', headers: { Cookie: cookie } }),
      )
    ).error.status,
    403,
  );
  assert.equal(
    (
      await h.auth.authorize(
        request('/x', {
          method: 'POST',
          headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': 'bad' },
        }),
      )
    ).error.status,
    403,
  );
  const good = await h.auth.authorize(
    request('/x', {
      method: 'GET',
      headers: { Cookie: cookie },
    }),
  );
  assert.equal(good.actor.id, USER_ID);
  assert.equal(good.session.csrf, csrf);
});

test('expired access refreshes from sealed refresh token; final logout clears locally', async () => {
  const h = harness();
  const ok = await login(h);
  const cookie = cookieOf(ok);
  const csrf = (await ok.json()).csrf;
  h.advance(3600001);
  const refreshed = await h.auth.authorize(
    request('/x', { headers: { Cookie: cookie } }),
  );
  assert.equal(refreshed.actor.id, USER_ID);
  assert(refreshed.setCookie.includes('__Host-ds-admin-session='));
  assert(h.calls.some((u) => u.includes('grant_type=refresh_token')));
  const out = await h.auth.logout(
    request('/api/admin/auth/logout', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': csrf },
    }),
  );
  assert.equal(out.status, 200);
  assert(out.headers.get('set-cookie').includes('Max-Age=0'));
  assert.equal(
    (
      await h.auth.logout(
        request('/api/admin/auth/logout', {
          method: 'POST',
          headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': 'bad' },
        }),
      )
    ).status,
    403,
  );
});

test('CMS auth SQL: schema, RLS deny, privileges, security and rerun (real PostgreSQL)', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-auth-pg-'));
  const data = join(dir, 'data');
  const port = String(59000 + Math.floor(Math.random() * 1000));
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
  let started = false,
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
    // Rerun additive migration must be safe.
    ok(sql(migration));

    // Tables + RLS.
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_class where oid in ('private.cms_admin_permissions'::regclass,'private.cms_rate_limit'::regclass) and relrowsecurity",
        ),
      ),
      '2',
    );
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_policy where polrelid in ('private.cms_admin_permissions'::regclass,'private.cms_rate_limit'::regclass) and polcmd='*' and pg_get_expr(polqual,polrelid)='false' and pg_get_expr(polwithcheck,polrelid)='false'",
        ),
      ),
      '2',
    );
    // Functions SECURITY DEFINER, fixed search_path, no PUBLIC execute.
    const funcs = [
      'private.cms_verify_admin(uuid)',
      'private.cms_rate_limit_check(text,text,integer,integer)',
      'private.cms_rate_limit_reset(text,text)',
      'public.cms_verify_admin(uuid)',
      'public.cms_rate_limit_check(text,text,integer,integer)',
      'public.cms_rate_limit_reset(text,text)',
    ];
    assert.equal(
      ok(
        sql(
          `select count(*) from pg_proc p where p.oid in (${funcs.map((f) => `'${f}'::regprocedure`).join(',')}) and prosecdef and pg_get_userbyid(proowner)='postgres' and proconfig=array['search_path=pg_catalog'] and not exists(select 1 from aclexplode(coalesce(proacl,acldefault('f',proowner))) a where a.grantee=0 and a.privilege_type='EXECUTE')`,
        ),
      ),
      '6',
    );
    // Public wrappers: only service_role may execute.
    assert.equal(
      ok(
        sql(
          "select count(*) from pg_proc where oid='public.cms_verify_admin(uuid)'::regprocedure and has_function_privilege('service_role',oid,'execute')",
        ),
      ),
      '1',
    );
    const literal = (v) => "'" + v.replaceAll("'", "''") + "'";
    // Absent -> ok:false; invalid uuid input is rejected by type system.
    assert.equal(
      ok(sql('select public.cms_verify_admin(null)')),
      '{"ok": false}',
    );
    assert.equal(
      ok(sql(`select public.cms_verify_admin(${literal(USER_ID)}::uuid)`)),
      '{"ok": false}',
    );
    // Active grant -> ok:true; inactive -> ok:false.
    ok(
      sql(
        `insert into private.cms_admin_permissions (auth_id,email,active) values (${literal(USER_ID)}::uuid,'o@e.t',true)`,
      ),
    );
    assert.equal(
      ok(sql(`select public.cms_verify_admin(${literal(USER_ID)}::uuid)`)),
      '{"ok": true, "email": "o@e.t"}',
    );
    ok(
      sql(
        `update private.cms_admin_permissions set active=false where auth_id=${literal(USER_ID)}::uuid`,
      ),
    );
    assert.equal(
      ok(sql(`select public.cms_verify_admin(${literal(USER_ID)}::uuid)`)),
      '{"ok": false}',
    );
    // Rate limit: allowed then limited after max attempts.
    assert.equal(
      ok(sql("select public.cms_rate_limit_check('1.2.3.4','o@e.t',2,60)")),
      '{"ok": true, "limited": false}',
    );
    assert.equal(
      ok(sql("select public.cms_rate_limit_check('1.2.3.4','o@e.t',2,60)")),
      '{"ok": true, "limited": false}',
    );
    assert.equal(
      ok(sql("select public.cms_rate_limit_check('1.2.3.4','o@e.t',2,60)")),
      '{"ok": false, "limited": true}',
    );
    assert.equal(
      ok(sql("select public.cms_rate_limit_reset('1.2.3.4','o@e.t')")),
      '{"ok": true}',
    );

    // Role denials: table + helper + wrapper access.
    for (const role of ['anon', 'authenticated', 'service_role']) {
      const statements = [
        'select * from private.cms_admin_permissions',
        'select * from private.cms_rate_limit',
        `select private.cms_verify_admin(${literal(USER_ID)}::uuid)`,
        "select private.cms_rate_limit_check('1.2.3.4','o@e.t',2,60)",
        `insert into private.cms_admin_permissions (auth_id) values (${literal(USER_ID)}::uuid)`,
        `update private.cms_admin_permissions set active=false where auth_id=${literal(USER_ID)}::uuid`,
        'delete from private.cms_admin_permissions',
        ...(role === 'service_role'
          ? []
          : [
              `select public.cms_verify_admin(${literal(USER_ID)}::uuid)`,
              "select public.cms_rate_limit_check('1.2.3.4','o@e.t',2,60)",
            ]),
      ];
      for (const statement of statements) {
        const r = sql(`begin; set local role ${role}; ${statement}; rollback;`);
        if (r.status !== 0) denied += 1;
      }
      const insert = sql(
        `begin; set local role ${role}; insert into private.cms_rate_limit (ip_address,email) values ('1.2.3.4','o@e.t'); rollback;`,
      );
      if (insert.status !== 0) denied += 1;
    }
    assert(denied >= 18, 'expected >=18 role denials, got ' + denied);
    // service_role holds execute on wrappers (lenient bypass role).
    assert.equal(
      ok(
        sql(
          `set role service_role; select (public.cms_verify_admin(${literal(USER_ID)}::uuid))->>'ok';`,
        ),
      ),
      'false',
    );
  } finally {
    if (started) command('pg_ctl', ['-D', data, '-m', 'immediate', 'stop']);
    await rm(dir, { recursive: true, force: true });
  }
});

test('rate limit backend failure denies login before password authentication', async () => {
  const h = harness({ limitFailure: true });
  const response = await login(h);
  assert.equal(response.status, 502);
  assert(!h.calls.some((u) => u.includes('/auth/v1/token')));
  assert(!JSON.stringify(await response.json()).includes('PRIVATE'));
});

test('refresh denies revoked CMS permission and clears only the CMS cookie', async () => {
  const h = harness();
  const response = await login(h);
  const cookie = cookieOf(response);
  const csrf = (await response.json()).csrf;
  h.setAuthorized(false);
  const denied = await h.auth.refresh(
    request('/api/admin/auth/refresh', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': csrf },
    }),
  );
  assert.equal(denied.status, 403);
  assert(denied.headers.get('set-cookie').includes('Max-Age=0'));
  assert(!denied.headers.get('set-cookie').includes('sb-'));
  assert(h.calls.some((u) => u.includes('/auth/v1/user')));
});

test('logout revokes the sealed access token with local scope', async () => {
  const h = harness();
  const response = await login(h);
  const cookie = cookieOf(response);
  const csrf = (await response.json()).csrf;
  const out = await h.auth.logout(
    request('/api/admin/auth/logout', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: origin, 'X-CSRF-Token': csrf },
    }),
  );
  assert.equal(out.status, 200);
  assert(h.calls.some((u) => u.includes('/auth/v1/logout?scope=local')));
  assert(!h.calls.some((u) => u.includes('scope=global')));
});
