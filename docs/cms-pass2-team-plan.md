# Master Work Plan — Pass 2: Team → Supabase

Checkpoint terbaru: [Domains pass 4](cms-pass4-domains-plan.md) LIVE `6b36519`,
dua deployments/acceptance selesai. NEXT [Hods pass 5](cms-pass5-hods-plan.md)
**PLAN ONLY**, [TODO](cms-migration-todo.md). Dokumen ini pola/riwayat pass yang
sudah selesai. Status/setup/scope berikut adalah historis, bukan instruksi
mengulang pass atau onboarding GAS; work order aktif ada di kickoff migrasi.

Status: **LIVE 8 Oct 2026** — migration applied, kode push ke kedua Vercel, build + 7 gate PASS.
AI baru: baca AGENTS.md + [cms-supabase-migration-plan.md](cms-supabase-migration-plan.md)
untuk riwayat Pass 3; work order terbaru adalah Pass 5 Hods.

## 1. Lingkup

Team pindah dari GAS/Sheets/Drive ke **Supabase Postgres + Storage**.
Projects sudah di Supabase (Pass 1). Roles/domains/hods/partners tetap GAS.
Auth tetap OAuth custom (handler masih butuh Google token untuk roles/dll).

**Yang TIDAK berubah:** UI/geometri/font/artwork, Zod schema, Astro static build-time,
verify.mjs, semua assertion baseline. Metadata desain (`chip`, `fade`, urutan domain,
Growth `joinNow`) tetap lokal di `src/data/team.ts`.

## 2. Migration SQL

File: `supabase/migrations/20261009010000_cms_team_pass2.sql`

### 2.1 Tabel `private.cms_team_members`

```sql
create table if not exists private.cms_team_members (
  id         text primary key,
  group_id   text not null check (
    group_id in ('leader', 'data', 'core', 'language', 'vision', 'product', 'growth')
  ),
  name       text not null,
  role       text not null,
  photo      text not null,
  position   smallint not null default 1 check (position between 1 and 8),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table private.cms_team_members enable row level security;
```

### 2.2 Tabel `private.cms_team_state`

```sql
create table if not exists private.cms_team_state (
  id                 int primary key default 1,
  revision           text not null default '',
  publication_pending boolean not null default false,
  updated_at         timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table private.cms_team_state enable row level security;
```

### 2.3 RLS (sama seperti Pass 1)

```sql
revoke all on table private.cms_team_members from public, anon, authenticated;
revoke all on table private.cms_team_state from public, anon, authenticated;

drop policy if exists cms_team_insert on private.cms_team_members;
drop policy if exists cms_team_update on private.cms_team_members;
drop policy if exists cms_team_delete on private.cms_team_members;

create policy cms_team_insert on private.cms_team_members
  for insert with check (false);
create policy cms_team_update on private.cms_team_members
  for update using (false) with check (false);
create policy cms_team_delete on private.cms_team_members
  for delete using (false);
```

### 2.4 Fungsi private — revision helper

```sql
create or replace function private.cms_team_revision()
returns text language sql stable
set search_path = private, pg_catalog
as $$
  select encode(
    sha256(
      string_agg(
        id || group_id || name || role || photo || position::text,
        '|' order by group_id, position, id
      )::bytea
    ),
    'hex'
  )
  from private.cms_team_members;
$$;
```

Note: revision order `group_id, position, id` — bukan position global (tiap grup
punya posisi sendiri). Ini harus cocok dengan urutan deterministik yang dipakai
di GAS Team.

### 2.5 Fungsi private — load

```sql
create or replace function private.cms_load_team()
returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
declare
  v_members  jsonb;
  v_state    private.cms_team_state%rowtype;
  v_presets  jsonb;
  v_groups   jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',      id,
      'group',   group_id,
      'name',    name,
      'role',    role,
      'photo',   photo,
      'order',   position
    ) order by group_id, position, id
  ), '[]'::jsonb) into v_members
  from private.cms_team_members;

  select * into v_state from private.cms_team_state;

  select coalesce(jsonb_agg(distinct photo), '[]'::jsonb)
  into v_presets
  from private.cms_team_members;

  -- Groups dengan title (domain title from seed; bisa di-hardcode di seed)
  select jsonb_agg(
    jsonb_build_object('id', group_id, 'title', '')
    order by min(pos_order)
  ) into v_groups
  from (
    select distinct group_id, min(position) as pos_order
    from private.cms_team_members group by group_id
  ) sub;

  return jsonb_build_object(
    'members',          v_members,
    'groups',           v_groups,
    'revision',         coalesce(v_state.revision, ''),
    'photoPresets',     v_presets,
    'minMembers',       1,
    'maxMembers',       8,
    'minGroups',        7,
    'publicationPending', coalesce(v_state.publication_pending, false),
    'affectedId',       null
  );
end;
$$;
```

### 2.6 Fungsi private — tulis

Mengikuti pola Pass 1: (1) cek revision, (2) mutasi dalam `select ... for update`,
(3) update revision, (4) return full state. Fungsi:

- `private.cms_save_member(p_payload jsonb)` — update existing member
- `private.cms_add_member(p_payload jsonb)` — insert baru, UUID `'member-' || gen_random_uuid()`
- `private.cms_delete_member(p_payload jsonb)` — delete, reorder positions dalam grup

Detail implementasi fungsi menyusul. Pola persis seperti `cms_save_project` dkk
di Pass 1.

### 2.7 Public wrapper functions

```sql
create or replace function public.cms_load_team()
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_load_team(); end; $$;

grant execute on function public.cms_load_team() to anon, service_role;

create or replace function public.cms_save_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_save_member(p_payload); end; $$;

create or replace function public.cms_add_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_add_member(p_payload); end; $$;

create or replace function public.cms_delete_member(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_delete_member(p_payload); end; $$;

grant execute on function public.cms_save_member(jsonb) to service_role;
grant execute on function public.cms_add_member(jsonb) to service_role;
grant execute on function public.cms_delete_member(jsonb) to service_role;
```

### 2.8 Seed data

Nilai persis dari `src/data/cms-snapshot.json` — leaderTeam + hodsTeams.
Gunakan skrip generate seed (sama seperti Pass 1).

```sql
-- Leader seed
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('leader-1', 'leader', 'Marchel Shevchenko', 'Founder', 'marchel', 1),
  ('leader-2', 'leader', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2)
on conflict (id) do nothing;

-- Setiap HoDS (data, core, language, vision, product, growth)
insert into private.cms_team_members (id, group_id, name, role, photo, position) values
  ('data-1', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 1),
  ('data-2', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 2),
  ('data-3', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 3),
  ('data-4', 'data', 'Zidan Amikul', 'Community Lead', 'zidan-rose', 4),
  ...
on conflict (id) do nothing;

-- Revision
insert into private.cms_team_state (id, revision)
values (1, (select private.cms_team_revision()))
on conflict (id) do update set revision = (select private.cms_team_revision());
```

## 3. Storage bucket — team media

Bucket `cms-media` sudah ada dari Pass 1. Tambah path `team/`:

```sql
drop policy if exists cms_media_team_insert on storage.objects;
drop policy if exists cms_media_team_select on storage.objects;

create policy cms_media_team_insert
  on storage.objects for insert with check (
    bucket_id = 'cms-media' and position(name, 'team/') = 1 and auth.role() = 'service_role'
  );

create policy cms_media_team_select
  on storage.objects for select using (
    bucket_id = 'cms-media' and position(name, 'team/') = 1 and auth.role() = 'service_role'
  );
```

Seed: foto placeholder `marchel` dan `zidan-rose` ada di repo (`public/images/cms/team/*.webp`),
tidak perlu di-Storage. Uploaded team photos nanti akan masuk ke `images/cms/team/<hash>.webp` di Storage.

## 4. Hybrid Snapshot (`syncCmsSnapshot`)

Di `scripts/cms-client.mjs`, fungsi `syncCmsSnapshot`:

```js
// Setelah fetch dari Supabase untuk projects...

if (supabaseUrl && supabaseKey) {
  // Projects dari Supabase (sudah ada)
  const sp = await supabaseFetch(
    supabaseUrl,
    supabaseKey,
    'cms_load_projects',
    fetchImpl,
  );
  snapshot.projects = sp.projects;

  // Team dari Supabase (BARU)
  const st = await supabaseFetch(
    supabaseUrl,
    supabaseKey,
    'cms_load_team',
    fetchImpl,
  );
  snapshot.team = rebuildTeamSnapshot(st);

  validateCmsSnapshot(snapshot);
}
```

Fungsi `rebuildTeamSnapshot` mengubah format Supabase (members[] + groups[])
ke format snapshot (`leaderTeam[]` + `hodsTeams[{id, title, members[]}]`):

```js
function rebuildTeamSnapshot(supabaseData) {
  const members = supabaseData.members;
  const groups = supabaseData.groups;

  const leaderMembers = members
    .filter((m) => m.group === 'leader')
    .sort((a, b) => a.order - b.order)
    .map(({ id, name, role, photo }) => ({ name, role, photo }));

  const hodsTeams = groups
    .filter((g) => g.id !== 'leader')
    .map((g) => ({
      id: g.id,
      title: g.title,
      members: members
        .filter((m) => m.group === g.id)
        .sort((a, b) => a.order - b.order)
        .map(({ id, name, role, photo }) => ({ name, role, photo })),
    }));

  return { leaderTeam: leaderMembers, hodsTeams };
}
```

### 4.1 Cache media (update collection path)

Di `cacheProjectMedia`, tambah routing untuk team photos:

```js
for (const image of images) {
  if (image.startsWith('/images/cms/team/')) {
    // Fetch dari Supabase Storage (bucket cms-media, service_role key)
  } else if (image.startsWith('/images/cms/projects/')) {
    // Fetch dari Supabase Storage (sudah ada dari Pass 1)
  } else if (image.startsWith('/images/projects/')) {
    // Skip — aset repo statis
  }
}
```

Gambar `/images/cms/team/*` di-cache dari Supabase Storage, bukan GAS.
Preset `marchel`/`zidan-rose` adalah referensi lokal di `public/images/cms/team/`
dan tidak perlu di-fetch.

## 5. Handler admin (`server/cms-admin.mjs`)

### 5.1 Fungsi `teamOperation()` baru

```js
async function teamOperation(cfg, env, token, operation, payload) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) fail('CONFIGURATION');

  const rpc = async (fn, body) => {
    const url = supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + fn;
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
      },
      body: JSON.stringify(body || {}),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) fail('SERVER_ERROR');
    return res.json();
  };

  const callDeployHooks = async () => {
    /* sama seperti projectsOperation */
  };

  if (operation === 'load') {
    return sanitize({ ok: true, data: await rpc('cms_load_team') });
  }

  if (operation === 'save' || operation === 'add' || operation === 'delete') {
    const rpcName =
      operation === 'save'
        ? 'cms_save_member'
        : operation === 'add'
          ? 'cms_add_member'
          : 'cms_delete_member';
    const result = await rpc(rpcName, { p_payload: payload });
    if (result.error) return { ok: false, error: result.error };
    const publication = await callDeployHooks();
    result.publication = publication;
    result.publicationPending = publication.some((p) => !p.accepted);
    return sanitize({ ok: true, data: result });
  }

  if (operation === 'retry') {
    const publication = await callDeployHooks();
    return sanitize({ ok: true, data: { publication } });
  }

  fail('INVALID_INPUT');
}
```

### 5.2 Branching di handle

Di handle function, tambah cabang `collection === 'team'`:

```js
if (collection === 'team') {
  result = await teamOperation(cfg, env, session.token, operation, payload);
} else if (collection === 'projects') {
  result = await projectsOperation(cfg, env, session.token, operation, payload);
} else {
  // Fallback — tidak akan terjadi karena route hanya 'projects' atau 'team'
  result = await gas(cfg, session.token, operation, payload, collection);
}
```

### 5.3 Media route

Untuk `route === 'media'` dengan `collection === 'team'`:

- **GET**: baca dari Supabase Storage bucket `cms-media/team/<hash>.webp`
- **POST**: upload ke Supabase Storage via sharp pipeline, pakai `normalizeProjectImage(bytes, mime, 'team')`

Keduanya memakai `SUPABASE_SERVICE_ROLE_KEY`. GAS `gas()` tidak dipanggil untuk team media lagi.

## 6. Test

### 6.1 Test baru

`tests/cms-team-supabase.test.mjs` (pola sama seperti `cms-projects-supabase.test.mjs`):

- `cms_load_team` RPC → shape cocok Zod + groups 7
- `cms_save_member` → revision guard, update member
- `cms_add_member` → UUID server, LIMIT per grup 8, COLLISION
- `cms_delete_member` → NOT_FOUND, MINIMUM (1 per grup)
- `cms_team_revision` deterministic

### 6.2 Test existing

- `tests/cms-team.test.mjs` — GAS VM test, tetap jalan (selama GAS masih ada)
- `tests/cms.test.mjs` — tidak diubah
- `tests/cms-native-admin.test.mjs` — OAuth handler
- `tests/cms-projects-supabase.test.mjs` — tetap, regresi projects

### 6.3 Build + 7 gate

```sh
npm run build
npm run test:cms
node scripts/verify.mjs
node scripts/responsive-audit.mjs
node scripts/navbar-audit.mjs
node scripts/verify-vt.mjs
npm run seo:audit
npm run format:check
```

## 7. Risiko

| Risiko                                                               | Mitigasi                                                                                                                                      |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Revision order beda (group_id, position, id vs GAS)                  | Cek urutan seed deterministic. GAS pakai order global; Supabase per grup. Pastikan revision helper menghasilkan hash sama untuk data identik. |
| Shape `cms_load_team` tidak cocok `sanitize()`                       | `sanitize` sudah handle `members` + `groups` key. Pastikan `revision`, `minMembers`, `maxMembers`, `photoPresets` ada.                        |
| Format foto: `marchel`/`zidan-rose` adalah string pendek, bukan path | Zod dan sanitize menerima keduanya. Seed di DB simpan string literal. `photoPresets` mencakup ini.                                            |
| Groups title kosong di DB (`groups[].title == ''`)                   | `sanitize()` terima string apa pun. Tapi di `rebuildTeamSnapshot()` kita butuh title — bisa dari seed, atau hardcode di fungsi.               |
| Migration bentrok dengan existing GAS write                          | Freeze Team GAS selama cutover: matikan dulu admin Team, lalu migrasi, lalu nyalakan via Supabase.                                            |

## 8. File changed

| File                                                    | Action                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| `supabase/migrations/20261009010000_cms_team_pass2.sql` | CREATE                                                        |
| `scripts/cms-client.mjs`                                | MODIFY — hybrid fetch untuk team + `rebuildTeamSnapshot()`    |
| `server/cms-admin.mjs`                                  | MODIFY — tambah `teamOperation()`, dispatch di handle + media |
| `api/admin/team.js`                                     | MODIFY — tidak berubah secara struktural                      |
| `api/admin/media.js`                                    | MODIFY — routing media untuk team (Storage bukan GAS)         |
| `tests/cms-team-supabase.test.mjs`                      | CREATE                                                        |
| `docs/cms-supabase-migration-plan.md`                   | UPDATE                                                        |
| `AGENTS.md`                                             | UPDATE                                                        |
| `docs/ai-handoff.md`                                    | UPDATE                                                        |

## 9. Pre-deploy checklist

Sebelum push:

1. `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` di kedua Vercel (testing + production)
2. Migration SQL di-apply ke Supabase project `web-community`
3. QA lokal PASS: build + test:cms + 7 gate + SEO
4. Konfirmasi user sebelum push
