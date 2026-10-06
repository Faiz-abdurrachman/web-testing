// Real-database proof for the recruitment intake (pass 1).
//
// Runs the actual SQL migration against a real PostgreSQL server and verifies:
//   - service_role insert -> status inserted
//   - identical retry     -> status duplicate, still one row (idempotent)
//   - changed answers     -> ID_CONFLICT, still one row
//   - concurrent same receipt -> exactly one row (transaction/race)
//   - anon / authenticated -> denied for the wrapper, the table and the
//     private function (EXECUTE + schema usage)
//
// Engine defaults to an ephemeral cluster started from the local postgres
// binaries. Set RECRUITMENT_DB_URL to run against an external database instead
// (the migration is still applied and the roles are ensured).
//
// This proves real database behaviour. The HTTP handler tests in
// tests/recruitment.test.mjs are mock-only and do not prove Postgres.

import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const migrationFile = join(
  root,
  'supabase/migrations/20261006120000_recruitment_intake_pass1.sql',
);
const evidenceDir = join(root, 'artifacts/recruitment-db');
const RACE_CLIENTS = 8;
const HASH_A = 'a'.repeat(64);
const HASH_B = 'b'.repeat(64);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let activeCluster = null;
const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, ok: Boolean(ok), detail });
  if (!ok) console.error(`  FAIL ${name}: ${detail}`);
  else console.log(`  ok   ${name}`);
};

function initCluster() {
  const base = mkdtempSyncSafe();
  const data = join(base, 'data');
  const sock = join(base, 'sock');
  const log = join(base, 'server.log');
  const port = 55000 + Math.floor(Math.random() * 400);
  return { base, data, sock, log, port };
}
function mkdtempSyncSafe() {
  return join(tmpdir(), 'ds-recruitment-pg-' + randomUUID().slice(0, 8));
}

const connFor = (c) =>
  c.external
    ? [process.env.RECRUITMENT_DB_URL]
    : ['-h', c.sock, '-p', String(c.port), '-U', 'postgres'];

function psql(c, sql, { stop = true } = {}) {
  const args = [
    ...connFor(c),
    ...(stop ? ['-v', 'ON_ERROR_STOP=1'] : []),
    '-tAc',
    sql,
  ];
  return spawnSync('psql', args, { encoding: 'utf8' });
}
function out(result) {
  return (result.stdout || '').trim();
}
// psql prints a `SET` command tag before the result when the script sets the
// role, so extract the JSON object rather than parsing the whole output.
function parseResult(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function raceSql(receipt, hash, fields, role) {
  return `set role ${role}; select public.submit_recruitment_application('${receipt}'::uuid, '${hash}', $json$${fields}$json$::jsonb) from (select pg_sleep(0.4)) s;`;
}
async function runClient(c, sql) {
  return new Promise((resolve) => {
    const child = spawn('psql', [...connFor(c), '-tAc', sql], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '',
      stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function main() {
  const external = Boolean(process.env.RECRUITMENT_DB_URL);
  const c = external ? { external: true } : initCluster();
  activeCluster = c;
  if (!external) {
    await mkdir(c.base, { recursive: true });
    await mkdir(c.sock, { recursive: true });
    const init = spawnSync(
      'initdb',
      ['-D', c.data, '-U', 'postgres', '--auth=trust', '--no-sync'],
      { encoding: 'utf8' },
    );
    if (init.status !== 0)
      throw new Error('initdb failed: ' + (init.stderr || init.stdout));
    const start = spawnSync(
      'pg_ctl',
      [
        '-D',
        c.data,
        '-o',
        `-p ${c.port} -k ${c.sock} -c listen_addresses=''`,
        '-l',
        c.log,
        'start',
      ],
      { encoding: 'utf8' },
    );
    if (start.status !== 0)
      throw new Error('pg_ctl start failed: ' + (start.stderr || start.stdout));
    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
      ready = psql(c, 'select 1;').status === 0;
      if (!ready) await sleep(250);
    }
    if (!ready) throw new Error('postgres did not become ready');
  }

  const roles = `do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then execute 'create role anon nologin'; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then execute 'create role authenticated nologin'; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role')
    then execute 'create role service_role nologin bypassrls'; end if;
end $$;`;
  if (psql(c, roles).status !== 0)
    throw new Error('could not ensure Supabase roles');

  const apply = spawnSync(
    'psql',
    [...connFor(c), '-v', 'ON_ERROR_STOP=1', '-f', migrationFile],
    { encoding: 'utf8' },
  );
  if (apply.status !== 0)
    throw new Error('migration failed: ' + (apply.stderr || apply.stdout));

  const version = out(psql(c, 'show server_version;'));
  const fieldsA = '{"full_name":"Real Applicant","primary_hods":"data"}';
  const receipt = randomUUID();

  // 1. First insert through the exposed wrapper as service_role.
  const first = psql(
    c,
    raceSql(receipt, HASH_A, fieldsA, 'service_role').replace(
      ' from (select pg_sleep(0.4)) s',
      '',
    ),
  );
  const firstStatus = parseResult(out(first))?.status;
  check(
    'service_role insert via wrapper',
    first.status === 0 && firstStatus === 'inserted',
    `status=${first.status} result=${out(first)} err=${first.stderr.trim()}`,
  );
  check(
    'exactly one row after first insert',
    out(psql(c, 'select count(*) from private.recruitment_applications;')) ===
      '1',
    out(psql(c, 'select count(*) from private.recruitment_applications;')),
  );

  // 2. Identical retry -> duplicate, no second row.
  const retry = psql(
    c,
    raceSql(receipt, HASH_A, fieldsA, 'service_role').replace(
      ' from (select pg_sleep(0.4)) s',
      '',
    ),
  );
  const retryStatus = parseResult(out(retry))?.status;
  check(
    'identical retry is idempotent (duplicate)',
    retry.status === 0 && retryStatus === 'duplicate',
    `status=${retry.status} result=${out(retry)}`,
  );
  check(
    'still one row after identical retry',
    out(psql(c, 'select count(*) from private.recruitment_applications;')) ===
      '1',
    out(psql(c, 'select count(*) from private.recruitment_applications;')),
  );

  // 3. Same receipt, changed answers -> ID_CONFLICT, no new row.
  const conflict = psql(
    c,
    raceSql(receipt, HASH_B, '{"full_name":"Changed"}', 'service_role').replace(
      ' from (select pg_sleep(0.4)) s',
      '',
    ),
  );
  check(
    'changed answers under same receipt is ID_CONFLICT',
    conflict.status !== 0 && /ID_CONFLICT/.test(conflict.stderr),
    `status=${conflict.status} err=${conflict.stderr.trim()}`,
  );
  check(
    'still one row after conflict',
    out(psql(c, 'select count(*) from private.recruitment_applications;')) ===
      '1',
    out(psql(c, 'select count(*) from private.recruitment_applications;')),
  );

  // 4. Concurrency: N clients, same receipt + hash, released together.
  const raceReceipt = randomUUID();
  const raceFields = '{"full_name":"Race"}';
  const clients = await Promise.all(
    Array.from({ length: RACE_CLIENTS }, () =>
      runClient(c, raceSql(raceReceipt, HASH_A, raceFields, 'service_role')),
    ),
  );
  const raceStatuses = clients.map(
    (r) => parseResult(out(r))?.status ?? `error:${r.code}`,
  );
  const inserted = raceStatuses.filter((s) => s === 'inserted').length;
  const duplicated = raceStatuses.filter((s) => s === 'duplicate').length;
  const raceRows = Number(
    out(
      psql(
        c,
        `select count(*) from private.recruitment_applications where receipt = '${raceReceipt}';`,
      ),
    ),
  );
  check(
    `race: ${RACE_CLIENTS} concurrent same-receipt writes leave exactly one row`,
    raceRows === 1 && inserted === 1 && duplicated === RACE_CLIENTS - 1,
    `rows=${raceRows} inserted=${inserted} duplicate=${duplicated} statuses=${JSON.stringify(raceStatuses)}`,
  );

  // 5. Authorization: anon/authenticated are denied everywhere.
  const deny = (label, role, sql, expect) => {
    const r = psql(c, `set role ${role}; ${sql}`);
    check(
      `${role} denied: ${label}`,
      r.status !== 0 && new RegExp(expect, 'i').test(r.stderr),
      `status=${r.status} err=${r.stderr.trim()}`,
    );
  };
  deny(
    'wrapper EXECUTE',
    'anon',
    `select public.submit_recruitment_application('${randomUUID()}'::uuid, '${HASH_A}', '{}'::jsonb);`,
    'permission denied',
  );
  deny(
    'wrapper EXECUTE',
    'authenticated',
    `select public.submit_recruitment_application('${randomUUID()}'::uuid, '${HASH_A}', '{}'::jsonb);`,
    'permission denied',
  );
  deny(
    'table SELECT',
    'anon',
    'select count(*) from private.recruitment_applications;',
    'permission denied',
  );
  deny(
    'table SELECT',
    'authenticated',
    'select count(*) from private.recruitment_applications;',
    'permission denied',
  );
  deny(
    'private function EXECUTE',
    'anon',
    `select private.recruitment_submit_intake('${randomUUID()}'::uuid, '${HASH_A}', '{}'::jsonb);`,
    'permission denied',
  );

  // service_role still succeeds after the denial probes.
  const after = psql(
    c,
    raceSql(
      randomUUID(),
      HASH_A,
      '{"full_name":"After"}',
      'service_role',
    ).replace(' from (select pg_sleep(0.4)) s', ''),
  );
  const afterStatus = parseResult(out(after))?.status;
  check(
    'service_role still succeeds after denial probes',
    after.status === 0 && afterStatus === 'inserted',
    `status=${after.status} result=${out(after)}`,
  );

  const migrationText = await readFile(migrationFile, 'utf8');
  const evidence = {
    engine: 'postgres',
    mode: external ? 'external' : 'ephemeral-cluster',
    server_version: version,
    migration: {
      file: 'supabase/migrations/20261006120000_recruitment_intake_pass1.sql',
      sha256: createHash('sha256').update(migrationText).digest('hex'),
    },
    race: {
      clients: RACE_CLIENTS,
      inserted,
      duplicate: duplicated,
      rows: raceRows,
    },
    checks,
    passed: checks.every((item) => item.ok),
    note: 'Real Postgres execution. HTTP handler tests are mock-only (tests/recruitment.test.mjs).',
    generated_at: new Date().toISOString(),
  };
  await mkdir(evidenceDir, { recursive: true });
  await writeFile(
    join(evidenceDir, 'proof.json'),
    JSON.stringify(evidence, null, 2) + '\n',
  );
  console.log(
    `\nrecruitment DB proof: ${evidence.passed ? 'PASS' : 'FAIL'} (${checks.filter((x) => x.ok).length}/${checks.length})`,
  );
  console.log(`evidence: artifacts/recruitment-db/proof.json`);

  if (!external) await cleanup(c);
  if (!evidence.passed) process.exitCode = 1;
}

async function cleanup(c) {
  spawnSync('pg_ctl', ['-D', c.data, 'stop', '-m', 'immediate'], {
    encoding: 'utf8',
  });
  await rm(c.base, { recursive: true, force: true });
}

main().catch(async (error) => {
  console.error('recruitment DB proof crashed:', error.message);
  if (activeCluster && !activeCluster.external) await cleanup(activeCluster);
  process.exitCode = 1;
});
