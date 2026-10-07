# Master Work Plan — Pass 1: Projects → Supabase

Status: **DIEKSEKUSI 7 Oct 2026** — migration applied ke Supabase live;
kode (`cms-client.mjs`, `cms-admin.mjs`) + test (36/36) + 7 gate + SEO PASS.
Hari-hari berikutnya: tambah env `SUPABASE_URL` + `SUPABASE_ANON_KEY` ke **kedua**
Vercel project sebelum push deploy (build remote wajib Supabase).

## 1. Lingkup

Projects pindah dari GAS/Sheets/Drive ke Supabase Postgres + Storage.
Team/roles/domains/hods/partners tetap di GAS (pass berikutnya).
Auth tetap OAuth custom (handler masih butuh Google token untuk Team).

Yang TIDAK berubah: UI/geometri/font/artwork, Zod schema, Astro static build-time,
verify.mjs, semua assertion baseline.

## 2. Migration SQL

File: `supabase/migrations/20261008010000_cms_projects_pass1.sql`

### 2.1 Tabel `private.cms_projects`

```sql
create table if not exists private.cms_projects (
  id          text primary key,
  title       text not null,
  tags        jsonb not null default '[]'::jsonb,
  description text not null,
  image       text not null,
  position    smallint not null default 1 check (position between 1 and 8),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table private.cms_projects enable row level security;
```

### 2.2 Tabel `private.cms_projects_state`

```sql
create table if not exists private.cms_projects_state (
  id                 int primary key default 1,
  revision           text not null default '',
  publication_pending boolean not null default false,
  updated_at         timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table private.cms_projects_state enable row level security;
```

### 2.3 RLS

Schema `private` — anon/authenticated tidak punya USAGE, jadi tidak bisa akses
tabel langsung. Tidak perlu policy select/insert/update/delete — cukup revoke
all. Akses hanya lewat public wrapper functions (`SECURITY DEFINER`).

```sql
revoke all on table private.cms_projects from public, anon, authenticated;
revoke all on table private.cms_projects_state from public, anon, authenticated;

-- Policy jaga-jaga (defense-in-depth), idempotent: drop dulu baru create
drop policy if exists cms_projects_insert on private.cms_projects;
drop policy if exists cms_projects_update on private.cms_projects;
drop policy if exists cms_projects_delete on private.cms_projects;

create policy cms_projects_insert on private.cms_projects
  for insert with check (false);
create policy cms_projects_update on private.cms_projects
  for update using (false) with check (false);
create policy cms_projects_delete on private.cms_projects
  for delete using (false);
```

### 2.4 Fungsi private — baca

```sql
-- Revision helper: sha256 of record set ordered by position (deterministic)
create or replace function private.cms_projects_revision()
returns text language sql stable
set search_path = private, pg_catalog
as $$
  select encode(
    sha256(
      string_agg(
        id || title || tags::text || description || image || position::text,
        '|' order by position, id
      )::bytea
    ),
    'hex'
  )
  from private.cms_projects;
$$;

-- Load projects + full state (editor expects all fields)
create or replace function private.cms_load_projects()
returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
declare
  v_records  jsonb;
  v_state    private.cms_projects_state%rowtype;
  v_images   jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id',          id,
      'title',       title,
      'tags',        tags,
      'description', description,
      'image',       image
    ) order by position, id
  ), '[]'::jsonb) into v_records
  from private.cms_projects;

  select * into v_state from private.cms_projects_state;

  select coalesce(jsonb_agg(distinct image), '[]'::jsonb)
  into v_images
  from private.cms_projects;

  return jsonb_build_object(
    'projects',          v_records,
    'revision',          coalesce(v_state.revision, ''),
    'imagePresets',      v_images,
    'minProjects',       1,
    'maxProjects',       8,
    'publicationPending', coalesce(v_state.publication_pending, false),
    'affectedId',        null
  );
end;
$$;
```

### 2.5 Fungsi private — tulis

Semua fungsi tulis: (1) cek revision, (2) mutasi dalam `select ... for update`,
(3) update revision, (4) return full state.

```sql
-- Save project (upsert)
create or replace function private.cms_save_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
declare
  v_revision text;
  v_project jsonb := p_payload -> 'project';
  v_id      text  := v_project ->> 'id';
  v_title   text  := v_project ->> 'title';
  v_tags    jsonb := v_project -> 'tags';
  v_desc    text  := v_project ->> 'description';
  v_image   text  := v_project ->> 'image';
begin
  select revision into v_revision from private.cms_projects_state for update;
  if (p_payload ->> 'revision') is null
     or v_revision is distinct from (p_payload ->> 'revision') then
    return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
  end if;

  if not exists (select 1 from private.cms_projects where id = v_id) then
    return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
  end if;

  update private.cms_projects
    set title=v_title, tags=v_tags, description=v_desc, image=v_image,
        updated_at=now()
    where id=v_id;

  update private.cms_projects_state
    set revision = private.cms_projects_revision(),
        publication_pending = true,
        updated_at = now();

  select revision into v_revision from private.cms_projects_state;
  return private.cms_load_projects() ||
    jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
end;
$$;

-- Add project (generate UUID server-side)
create or replace function private.cms_add_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
declare
  v_revision text;
  v_project  jsonb := p_payload -> 'project';
  v_id       text  := 'project-' || gen_random_uuid()::text;
  v_title    text  := v_project ->> 'title';
  v_tags     jsonb := v_project -> 'tags';
  v_desc     text  := v_project ->> 'description';
  v_image    text  := v_project ->> 'image';
  v_count    smallint;
  v_result   jsonb;
begin
  select revision into v_revision from private.cms_projects_state for update;
  if (p_payload ->> 'revision') is null
     or v_revision is distinct from (p_payload ->> 'revision') then
    return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
  end if;

  select count(*)::smallint into v_count from private.cms_projects;
  if v_count >= 8 then
    return jsonb_build_object('error', jsonb_build_object('code', 'LIMIT'));
  end if;

  if exists (select 1 from private.cms_projects where id = v_id) then
    return jsonb_build_object('error', jsonb_build_object('code', 'COLLISION'));
  end if;

  if v_image is null or v_image = '' or v_title is null or v_title = '' then
    return jsonb_build_object('error', jsonb_build_object('code', 'INVALID_INPUT'));
  end if;

  insert into private.cms_projects (id, title, tags, description, image, position)
  values (v_id, v_title, v_tags, v_desc, v_image, v_count + 1);

  update private.cms_projects_state
    set revision = private.cms_projects_revision(),
        publication_pending = true,
        updated_at = now();

  select revision into v_revision from private.cms_projects_state;
  return private.cms_load_projects() ||
    jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
end;
$$;

-- Delete project
create or replace function private.cms_delete_project(
  p_payload jsonb
) returns jsonb language plpgsql security definer
set search_path = private, pg_catalog
as $$
declare
  v_revision text;
  v_id       text := p_payload ->> 'id';
  v_count    smallint;
begin
  select revision into v_revision from private.cms_projects_state for update;
  if (p_payload ->> 'revision') is null
     or v_revision is distinct from (p_payload ->> 'revision') then
    return jsonb_build_object('error', jsonb_build_object('code', 'CONFLICT'));
  end if;

  select count(*)::smallint into v_count from private.cms_projects;
  if v_count <= 1 then
    return jsonb_build_object('error', jsonb_build_object('code', 'MINIMUM'));
  end if;

  delete from private.cms_projects where id = v_id;
  if not found then
    return jsonb_build_object('error', jsonb_build_object('code', 'NOT_FOUND'));
  end if;

  update private.cms_projects
    set position = row_number() over (order by position, id)
    where true;

  update private.cms_projects_state
    set revision = private.cms_projects_revision(),
        publication_pending = true,
        updated_at = now();

  select revision into v_revision from private.cms_projects_state;
  return private.cms_load_projects() ||
    jsonb_build_object('affectedId', v_id, 'revision', v_revision, 'saved', true);
end;
$$;
```

### 2.6 Public wrapper functions

Semua fungsi: `SECURITY DEFINER`, set search_path `pg_catalog`, panggil private.

```sql
-- READ: grant to anon + service_role (build-time, anon SELECT)
create or replace function public.cms_load_projects()
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_load_projects(); end; $$;

grant execute on function public.cms_load_projects() to anon, service_role;

-- WRITE: grant ONLY to service_role (admin write via Vercel Function)
create or replace function public.cms_save_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_save_project(p_payload); end; $$;

create or replace function public.cms_add_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_add_project(p_payload); end; $$;

create or replace function public.cms_delete_project(p_payload jsonb)
returns jsonb language plpgsql security definer
set search_path = pg_catalog
as $$ begin return private.cms_delete_project(p_payload); end; $$;

grant execute on function public.cms_save_project(jsonb) to service_role;
grant execute on function public.cms_add_project(jsonb) to service_role;
grant execute on function public.cms_delete_project(jsonb) to service_role;
```

### 2.8 Seed data

Nilai persis dari `src/data/cms-snapshot.json`. Emit dari file kanonik, bukan
ketik manual — gunakan skrip `scripts/generate-cms-seed.mjs`.

```sql
insert into private.cms_projects (id, title, tags, description, image, position) values
  ('arutala',        'Arutala Aksara',        '["HoDS Apa","Lomba/research"]'::jsonb, 'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 1),
  ('nusantara-ocr',  'Nusantara OCR',         '["HoDS Vision","Open Source"]'::jsonb,    'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 2),
  ('pralaya',        'Pralaya Predictor',     '["HoDS Data","Research"]'::jsonb,         'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 3),
  ('kriya',          'Kriya Design System',   '["HoDS Product","Community"]'::jsonb,     'Lorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum Lorem ipsumLorem ipsumLorem ipsumLorem ipsumLorem ipsum', '/images/projects/arutala-aksara.webp', 4)
on conflict (id) do nothing;

-- Revision dari hash kanonik
insert into private.cms_projects_state (id, revision)
values (1, (select private.cms_projects_revision()))
on conflict (id) do update set revision = (select private.cms_projects_revision());
```

## 3. Hybrid Snapshot (`syncCmsSnapshot`)

### 3.1 Mekanisme

Di `syncCmsSnapshot` (`scripts/cms-client.mjs`):

```js
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (apiUrl && apiToken) {
  // Mode remote: projects WAJIB dari Supabase — tidak ada fallback GAS
  if (!supabaseUrl || !supabaseKey)
    throw new Error('CMS projects migration requires SUPABASE_URL and SUPABASE_ANON_KEY');

  const snapshot = await fetchCmsSnapshot({ apiUrl, apiToken, ... });
  const sp = await supabaseFetch(supabaseUrl, supabaseKey, 'cms_load_projects');
  snapshot.projects = sp.projects;

  // Re-validate Zod setelah hybrid merge
  validateCmsSnapshot(snapshot);

  ...cache media, write atomik...
  return 'remote';
}

// Mode local: baca snapshot committed
const snapshot = parseSnapshot(await readFile(snapshotPath, 'utf8'));
await cacheProjectMedia({ snapshot, mediaRoot });
return 'local';
```

### 3.2 Cache media (split collection)

```js
const images = [
  ...new Set([
    ...snapshot.projects
      .filter((p) => !p.image.startsWith('/images/projects/')) // skip repo statis
      .map((p) => p.image),
    ...snapshot.team.leaderTeam.map((m) => m.photo),
    ...snapshot.team.hodsTeams.flatMap((g) => g.members.map((m) => m.photo)),
  ]),
];

for (const image of images) {
  if (image.startsWith('/images/cms/projects/')) {
    // Fetch dari Supabase Storage (bucket cms-media, service_role key)
  } else if (image.startsWith('/images/cms/team/')) {
    // Fetch dari GAS media (masih GAS)
  }
}
```

Images `/images/projects/*` adalah aset statis di `public/images/projects/` —
tidak perlu di-fetch (seperti sekarang).

### 3.3 ENV dibutuhkan

Kedua Vercel project (testing + production) harus punya:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (build-time SELECT via anon)
- `SUPABASE_SERVICE_ROLE_KEY` (handler write — runtime function, bukan build)

## 4. Handler admin

### 4.1 Modifikasi minimal — route projects tetap di `api/admin/projects.js`

File `api/admin/projects.js` tetap. Isi:

```js
import { createAdminHandler } from '../../server/cms-admin.mjs';
const handle = createAdminHandler();
export default { fetch: (request) => handle(request, 'projects') };
```

### 4.2 Dispatch di `server/cms-admin.mjs`

Di dalam `createAdminHandler`, setelah fungsi `gas()`, tambah `projectsOperation`. Fungsi ini memakai `fetchImpl` dan `sanitize` dari closure yang sama.

```js
async function projectsOperation(cfg, env, token, operation, payload) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  const rpc = async (fn, body) => {
    const url = supabaseUrl + '/rest/v1/rpc/' + fn;
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

  if (operation === 'load') {
    return sanitize({ ok: true, data: await rpc('cms_load_projects') });
  }

  if (operation === 'save') {
    const result = await rpc('cms_save_project', { p_payload: payload });
    if (result.error) return { ok: false, error: result.error };
    // Panggil deploy hooks — catat hasil masing-masing
    const publication = await callDeployHooks(env);
    result.publication = publication;
    result.publicationPending = publication.some((p) => !p.accepted);
    return sanitize({ ok: true, data: result });
  }

  if (operation === 'add') {
    const result = await rpc('cms_add_project', { p_payload: payload });
    if (result.error) return { ok: false, error: result.error };
    const publication = await callDeployHooks(env);
    result.publication = publication;
    result.publicationPending = publication.some((p) => !p.accepted);
    return sanitize({ ok: true, data: result });
  }

  if (operation === 'delete') {
    const result = await rpc('cms_delete_project', { p_payload: payload });
    if (result.error) return { ok: false, error: result.error };
    const publication = await callDeployHooks(env);
    result.publication = publication;
    result.publicationPending = publication.some((p) => !p.accepted);
    return sanitize({ ok: true, data: result });
  }

  if (operation === 'retry') {
    const publication = await callDeployHooks(env);
    return sanitize({
      ok: true,
      data: { publication },
    });
  }

  fail('INVALID_INPUT');
}

async function callDeployHooks(env) {
  const hooks = [
    { target: 'testing', url: env.CMS_DEPLOY_HOOK_TESTING },
    { target: 'production', url: env.CMS_DEPLOY_HOOK_PRODUCTION },
  ];
  const results = [];
  for (const hook of hooks) {
    if (!hook.url) {
      results.push({ target: hook.target, accepted: false });
      continue;
    }
    try {
      const res = await fetchImpl(hook.url, {
        method: 'POST',
        signal: AbortSignal.timeout(30000),
      });
      results.push({ target: hook.target, accepted: res.ok });
    } catch {
      results.push({ target: hook.target, accepted: false });
    }
  }
  return results;
}
```

Branching di handle:

```js
if (collection === 'projects') {
  const result = await projectsOperation(
    cfg,
    env,
    session.token,
    operation,
    payload,
  );
  const response = json(
    result.ok ? { ...result, csrf: session.csrf } : result,
    result.error?.code === 'UNAUTHORIZED' ? 403 : 200,
  );
  if (result.error?.code === 'UNAUTHORIZED')
    response.headers.set('Set-Cookie', cookie(cfg, 'session', '', 0));
  return response;
}
// Team: tetap gas()
```

### 4.3 Media (upload/read)

Handler `media` route:

- Projects: baca/tulis Supabase Storage bucket `cms-media`
  - GET: `SUPABASE_URL/storage/v1/object/cms-media/projects/<hash>.webp` (service_role)
  - POST: upload ke Storage, pakai sharp pipeline yang sama (`normalizeProjectImage`)
- Team: tetap lewat `gas()` (Drive/GAS)

Branch:

```js
if (route === 'media') {
  const collection = url.searchParams.get('collection') || 'projects';
  if (collection === 'projects') {
    // Supabase Storage
    return await projectsMediaOperation(request, env);
  } else {
    // Team: tetap gas()
    return await gasMediaOperation(request, cfg, session, collection);
  }
}
```

## 5. Media — seed dari Drive ke Storage (satu kali)

1. Script `scripts/seed-cms-media-to-storage.mjs`:
   - Baca `cms-snapshot.json`, collect image paths
   - Filter: `/images/cms/projects/*` (jika ada uploaded images) → perlu di-copy
   - `/images/projects/*` (repo statis) → skip
2. Download dari Drive via GAS admin (existing)
3. Upload ke Supabase Storage bucket `cms-media/projects/<hash>.webp`
4. Verify sha256

Pada seed awal (4 project placeholder), semua pakai `/images/projects/arutala-aksara.webp`
yang sudah ada di repo — tidak perlu seed Storage.

### 5.1 Bucket `cms-media`

```sql
-- Bucket dibuat manual di dashboard atau via Management API
-- Policy: service_role ONLY (build pakai service_role key)
-- BUKAN anon SELECT — ini storage privat

insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', false)
on conflict (id) do nothing;

-- Policy untuk service_role (idempotent: drop dulu baru create)
drop policy if exists cms_media_select on storage.objects;
drop policy if exists cms_media_insert on storage.objects;

create policy cms_media_select
  on storage.objects for select using (
    bucket_id = 'cms-media' and auth.role() = 'service_role'
  );

create policy cms_media_insert
  on storage.objects for insert with check (
    bucket_id = 'cms-media' and auth.role() = 'service_role'
  );
```

## 6. Test

### 6.1 Test baru

`tests/cms-projects-supabase.test.mjs`:

- `cms_load_projects` RPC → shape cocok Zod
- `cms_save_project` → revision guard, update state
- `cms_add_project` → UUID server, CONFLICT, LIMIT
- `cms_delete_project` → NOT_FOUND, MINIMUM
- `cms_projects_revision` deterministic

### 6.2 Test existing

- `tests/cms.test.mjs` — tidak diubah (masih test GAS fetch/export)
- `tests/cms-admin.test.mjs` — GAS VM test, tidak diubah
- `tests/cms-native-admin.test.mjs` — OAuth handler, tetap pakai route `projects` yang masih ada
- `tests/cms-media.test.mjs` — media pipeline, ditambah storage path

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

| Risiko                                               | Mitigasi                                                                                                  |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Revision guard beda implementasi → conflict terlewat | Uji 2 sesi: save/add/delete concurrent. Hash deterministik (order by position).                           |
| Supabase fetch gagal di build → produksi error       | Hard fail: jangan degrade. Log jelas di console.                                                          |
| Payload shape mismatch → editor error                | Uji manual: load → ubah title → save → lihat response.                                                    |
| Upload media ke Storage gagal → broken image         | Validasi response upload; kalau gagal, return INVALID_INPUT ke editor.                                    |
| Deploy hook gagal → publicationPending=true          | Sama seperti GAS: hook gagal tetap return state dengan publicationPending=true.                           |
| Supabase credentials belum di-set di Vercel          | Tambah checklist pre-deploy: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY di kedua project. |

## 8. File changed

| File                                                        | Action                                                        |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `supabase/migrations/20261008010000_cms_projects_pass1.sql` | CREATE                                                        |
| `scripts/cms-client.mjs`                                    | MODIFY — hybrid fetch                                         |
| `server/cms-admin.mjs`                                      | MODIFY — tambah `projectsOperation()`, dispatch di handle     |
| `api/admin/projects.js`                                     | MODIFY — tidak berubah secara struktural                      |
| `api/admin/media.js`                                        | MODIFY — dispatch collection (projects → Storage, team → GAS) |
| `server/cms-media.mjs`                                      | MODIFY — support Storage path untuk projects                  |
| `tests/cms-projects-supabase.test.mjs`                      | CREATE                                                        |
| `docs/cms-supabase-migration-plan.md`                       | UPDATE                                                        |
| `AGENTS.md`                                                 | UPDATE                                                        |
| `docs/ai-handoff.md`                                        | UPDATE                                                        |

---

Bro, revisi final udah. Semua poin lo udah masuk:

- 1: `v_id := v_project ->> 'id'` dari dalam project
- 2: `image` dari payload, validasi non-empty
- 3: Full state (projects, revision, imagePresets, min/max, publicationPending, affectedId, publication, saved)
- 4: `/images/projects/*` skip (repo statis), `/images/cms/projects/*` Storage, `/images/cms/team/*` GAS
- 5: csrf di-append via `{...result, csrf: session.csrf}` wrapper
- A-E: seed konten persis snapshot, revision helper update tiap mutasi, deploy hooks inline
- F-H: no GAS fallback, service_role only bucket, retry/upload explicit

Ready buat review.
