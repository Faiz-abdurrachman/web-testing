# Master Migration Plan — GAS/Sheets/Drive → Supabase

## Work order sesi berikutnya — auth CMS, PLAN ONLY

Faiz meminta **eksekusi di AI baru**. [Master Work Plan auth CMS](cms-auth-supabase-plan.md)
sudah disiapkan rinci: inventory actual, keputusan provider/dependency/owner,
security contract, checklist A–E, SQL permission proposal, QA, dua-domain
acceptance dan rollback. Sesi persiapan ini **docs saja**; belum kode/SQL/apply/
provider config/dependency/push/deploy auth. Semua execution checklist pending.

Runtime live **925d577**, checkpoint docs **3229c5b lokal** dan planning terbaru
lihat git log; origin/production masih925d577. Izin push925d577 consumed;
konfirmasi sebelum push baru termasuk docs. Urutan baca aktif: kickoff seluruhnya
termasuk §6 → AGENTS → ai-handoff → auth plan → TODO → master plan → CMS SOP.
Provider/mekanisme belum dipilih; lakukan audit A lalu selesaikan gate keputusan
sebelum implementasi dependent. OAuth CMS custom masih berjalan sekarang.

**Temuan actual:** callback CMS masih cek owner via GAS; API Supabase CMS memakai
sesi encrypted, bukan fresh GAS check per operasi. `private.cms_admin_users`
existing (`auth_id text`, bukan proposal user_id uuid) mengotorisasi recruitment.
Jangan otomatis reuse/seed tabel itu untuk CMS atau link Google/password identity.
Target CMS permission terisolasi + trusted Auth identity per request; recruitment
cookies/users/allowlist tetap. Keenam content sources Supabase tetapi full GAS
export tetap divalidasi; penghapusan GAS belum diizinkan. UI/data/Team drift tetap.

## Checkpoint aktif — Partners LIVE, NEXT auth CMS final

**Pass 6 Partners A–E selesai, LIVE `925d577`**, dipush dengan izin Faiz ke
kedua repo. Sesudah push fitur, main/origin/main/production/main sinkron925d577.
Kedua primary domains assigned ke exact feature SHA dan **READY**:

- web-testing: **13:57:59.202 UTC / 20:57:59.202 WIB**, 07 Oct 2026.
- data-sorcerers-community: **13:59:13.031 UTC / 20:59:13.031 WIB**, 07 Oct 2026.

Timestamp READY dari API Vercel actual; browser/artifact checkedAt memakai jam
workspace. Jangan urutkan event dengan mencampur kedua clock atau nama migration.
Checkpoint docs sesudah acceptance ini **commit lokal saja**; lihat git log.
Izin push925d577 sudah digunakan; konfirmasi sebelum push baru termasuk docs.
[Master Work Plan Partners](cms-pass6-partners-plan.md) §9–10 menyimpan proof.

Migration additive `20261013010000_cms_partners_pass6.sql` applied sekali ke
existing web-community / yejrdckcmlxrkklgtrwy. GAS/snapshot/DB exact **3 category
labels + 1 local logo path + 4 why pairs**, strict keys/types/order. Private
singleton + RLS ALL deny; public RPC anon/service_role saja. Catalog owner/
search_path/definer/ACL dan13 actual denied live reads PASS; write permissions
via catalog denied, tanpa live DML probes. Initial anon404 → independent state
inspect/count1 + HTTP200 exact → proof-only tanpa reapply; cause awal unresolved.

Live Partners **390/1440 kedua situs PASS**:3 labels/10-5-5 slots/20 alt/logos,
4 why pairs/index-matched local icons, hero/cards/glow/footer artwork decode,
exact desktop geometry, navbar mobile/desktop entry, keyboard footer entry/back,
Astro VT context retained, tanpa overflow/clipping/pageerror. Home/Recruitment +
6 Hods +6 Roles ×390/1440 kedua situs PASS (HTTP200/headings/back/art decode/
overflow); projects/team/media API anonymous401 dan recruitmentaccepting:false.
Tidak ada owner mutation, submission, hook atau SQL apply ulang.

Node22.23.0 QA lokal: CMS92 PASS+10 Team live SKIP/0FAIL, recruitment24 PASS,
focused Partners18 PASS+PostgreSQL (199 invalid/72 valid parity fixtures,
22 role denials, RLS/order/rerun/missing row/Unicode/path). Tujuh gate+SEO PASS,
responsive468/468, spacing39, SEO23 pages, three admin mocks4widths. Snapshot
bytes/19 public HTML exact fresh baseline. Same captured inputs pre/post deep
value-identik; Team drift preexisting utuh, tidak reseed/overwrite snapshot.
Codepoint ceiling sesuai installed Zod; NUL/lone surrogate fail closed PG.

**Sumber aktif keenam CMS content collections = Supabase RPC build-time.**
**Full GAS export masih divalidasi sebelum overrides**; jangan hapus GAS/tab/env.
Empat Supabase +dua GAS env Production kedua Vercel fresh verified sebelum push,
nilai tidak dicetak. Count10/5/5/icons, UI/geometri/font/artwork/schema/assertions,
admin/auth/media/dependencies tetap; tanpa Partners editor/write API/state/Storage.
Auth CMS tetap OAuth custom, **provider/mekanisme final pending**, pass berikutnya
butuh keputusan user. Seluruh CMS belum selesai dan GAS removal belum diizinkan.
Proof ignored `artifacts/cms-pass6/`:live-db/live-hybrid/qa-summary/vercel-env,
deployments/aliases-925d577,live-browser-testing/production,live-smoke,4screenshots.
Ringkasan tracked ini menjadi handoff bila artifacts hilang.

## Checkpoint sebelumnya — Hods LIVE, NEXT Partners

Baseline deployed terbaru **`526b428`** (checkpoint docs Hods), fitur runtime
Hods **`763bafc`**. Keduanya sudah dipush dengan izin Faiz; setelah push checkpoint,
main/origin/main/production/main sinkron `526b428`. Kedua primary domains assigned
ke SHA checkpoint, **READY**, 7 Oct 2026:

- testing: **13:12:20.677 UTC / 20:12:20.677 WIB**;
- production: **13:13:44.014 UTC / 20:13:44.014 WIB**.

Rebuild docs-only: six Hods headings exact, Home/Recruitment/Partners HTTP200,
admin projects/team/media anonymous401 dan recruitment closed kedua situs PASS.
Full all-tab browser acceptance fitur `763bafc` tetap bukti di bawah.
Planning Partners terbaru lokal, lihat git log; belum push dan bukan SQL/runtime.

Timestamp deployment dari API Vercel actual. Jam workspace pada probe HTTP Date
sekitar 138 detik di belakang Vercel; timestamps `checkedAt` browser/artifacts
memakai jam workspace, bukan timestamp READY provider. Tidak menyimpulkan
urutan event dengan mencampur kedua jam atau nama migration.

**Pass 5 Hods A–E selesai.** Migration additive
`20261012010000_cms_hods_pass5.sql` applied ke existing web-community; GAS/
snapshot/DB exact **6 ID / 21 tabs / 55 sections / 8 bullet items**, order dan
strict nested union/keys utuh. Private table + RLS deny, public RPC anon +
service_role; PUBLIC/helper/private/authenticated access denied. Actual HTTP
anon exact, catalog owner/search_path/definer dan **15 role denials** verified.
Probe RPC pertama setelah apply gagal; read-only state inspect dan probe
berikutnya HTTP 200 exact, tidak reapply; cause awal belum terisolasi.

Live acceptance kedua situs **semua six routes/21 tabs × 390/1440 × Home +
Recruitment contexts PASS**: exact copy/nested sections/bullets/local labels,
art decode, click/ArrowLeft/Right wrap/focus/aria/hidden, entry/back + VT,
tanpa overflow/pageerror. Enam Roles smoke setiap situs juga PASS; API admin
projects/team/media anonymous **401**, recruitment **accepting:false**.
Tidak ada mutation Projects/Team/recruitment.

**Sumber aktif:** Projects/Team/Roles/Domains/Hods = Supabase RPC build-time;
Partners content = GAS. Full GAS export masih divalidasi sebelum overrides;
jangan hapus tab/env GAS. Hods tanpa editor/write API/state/Storage baru.
UI/geometri/font/artwork/schema Zod/assertions/admin/auth/media tetap.
Same captured remote inputs pre/post value-identik; Team drift preexisting
utuh, repo snapshot tidak ditimpa. Auth CMS tetap OAuth custom, final pending.

QA lokal Node **22.23.0**: CMS **74 PASS + 10 Team live SKIP / 0 FAIL**,
recruitment **24 PASS**, focused Hods **18 PASS** + real ephemeral PostgreSQL,
7 gate + SEO, tiga admin mock empat width, responsive **468/468**, SEO 23 pages,
spacing 39 components, snapshot bytes/19 public HTML exact fresh baseline.
**Unicode:** SQL ceiling 20000 UTF-16 mengikuti plan, lebih ketat untuk astral
text daripada installed Zod codepoint limit; schema utuh, selisih diuji dan
tercatat di Hods plan §2. Helper Domains applied tidak diubah.

Empat Supabase + dua GAS env Production kedua Vercel verified ulang sebelum
push; local anon key diambil Management API in-memory, tanpa print/env write.
Proof ignored `artifacts/cms-pass5/`: live-db/live-hybrid, qa-summary,
vercel-env, deployments/aliases-763bafc, live-browser-testing/production,
24 screenshot six detail routes × dua widths × dua situs, live-smoke,
time-check. Ringkasan tracked ini menjadi handoff bila artifacts hilang.

NEXT: **pass 6 Partners**, [Master Work Plan](cms-pass6-partners-plan.md)
rinci **PLAN ONLY**, belum SQL/runtime/apply/deploy Partners. Ikuti checklist
A–E dan prompt kickoff §6; setelah Partners accepted, auth CMS terakhir.
Seluruh CMS belum selesai; GAS belum boleh dihapus. Izin push `763bafc` dan
`526b428` sudah digunakan: **konfirmasi sebelum push baru**, termasuk planning
docs lokal. [Hods proof](cms-pass5-hods-plan.md), [TODO](cms-migration-todo.md),
[kickoff](cms-migration-kickoff.md).

## Checkpoint sebelumnya — empat collection CMS live, NEXT Hods

Projects/Team/Roles/Domains live `6b36519`, kedua Vercel READY/SUCCESS dan
Domains acceptance Home/Recruitment/routing 390/1440 selesai. Recruitment pass
1–3 juga Supabase, intake closed. [Domains Master Work Plan](cms-pass4-domains-plan.md)
A–E selesai. NEXT [Hods Master Work Plan](cms-pass5-hods-plan.md) **PLAN ONLY**
→ Partners → auth CMS terakhir; lihat
[TODO](cms-migration-todo.md) dan [kickoff aktif](cms-migration-kickoff.md).

Write existing Projects/Team memakai Management API database/query karena
safeupdate PostgREST; read RPC anon. Roles/Domains tidak punya editor/write API.
Full GAS export tetap divalidasi sebelum overrides; Hods/Partners masih GAS.
Team remote drift preexisting dicatat, tidak di-reseed. Pilihan mekanisme auth
CMS belum final; bagian desain auth/SDK di bawah adalah proposal bersyarat,
bukan approval implementasi atau dependency. Rekrutmen punya auth terpisah.

Bagian inventaris/checkpoint awal berikut menyimpan konteks 6 Oct sebelum
migration; jangan mengklaim semua CMS masih GAS atau meminta setup ulang.
Izin push `6b36519` sudah digunakan; konfirmasi sebelum push baru, termasuk docs lokal.

Disusun 6 Oct 2026. Bahasa: Indonesia. Semua nama env/property dicatat **tanpa
nilai** — jangan pernah mencetak secret/token/URL admin.

> ## Target akhir (diputuskan user, 6 Oct 2026)
>
> **Seluruh backend ke Supabase: Postgres + Storage + Supabase Auth.** Tidak ada
> lagi Google Sheets, Google Drive, Apps Script, Apps Script API, atau OAuth
> custom jangka panjang. GAS hanya jembatan sementara selama migrasi.
>
> **Astro tetap static; UI, desain, geometri, template, font, artwork, dan semua
> assertion baseline TIDAK berubah.** Yang berubah hanya sumber data di belakang
> `cms-snapshot.json` + tiga permukaan: auth, media, dan tulisan admin/intake.
>
> Catatan desain historis (mekanisme auth belum final pada checkpoint terbaru):
>
> - **Mekanisme auth CMS** belum final; opsi Supabase Auth Google di §5.4
>   hanya proposal untuk pass auth terakhir. OAuth custom tetap sekarang.
> - **Kunci bypass RLS** → `service_role` / secret key hanya di server, lihat
>   §3.3.
> - **Snapshot gabungan** selama migrasi → snapshot hybrid per-collection, lihat
>   §5.6.

## 0. Arsip checkpoint awal 6 Oct (bukan status aktif)

| Fakta                                                             | Bukti                                         |
| ----------------------------------------------------------------- | --------------------------------------------- |
| `main` lokal `686e7dd`, dokumentasi deployment belum push         | `git status` → ahead 1 dari origin            |
| Feature `a151969` sudah di testing + production                   | `origin/main` = `production/main` = `a151969` |
| Form recruitment live, intake `accepting:false`                   | docs `recruitment-integration-plan.md` §Push  |
| GAS recruitment **belum dipasang**, penyimpanan nyata belum diuji | docs `recruitment-setup.md`                   |
| Projects CRUD/media live acceptance selesai                       | docs `cms-projects-media-setup.md`            |
| Team kode/QA selesai; update GAS + acceptance nyata pending       | docs `cms-team-setup.md`                      |
| Seluruh CMS belum selesai                                         | docs `ai-handoff.md`                          |
| Deadline masih lama; user mempertimbangkan migrasi penuh          | arahan task ini                               |

Kesimpulan audit: satu-satunya backend data saat ini adalah **GAS + Sheets +
Drive + Google OAuth/Apps Script API**, dengan **satu titik publikasi** (dua
Vercel Deploy Hook) dan **satu kontrak snapshot** (`src/data/cms-snapshot.json`).
Perubahan backend tidak boleh menyentuh desain/geometri, template kartu,
`verify.mjs`, atau assertion baseline.

**Aturan keras selama migrasi (berlaku setiap tahap):**

1. **Satu sumber data aktif per fitur.** Tidak ada dual-write permanen; tidak
   ada fallback stale; backup GAS **tidak** dianggap sinkron otomatis setelah
   cutover.
2. **Desain tetap lokal.** `domains.rows`, `roles.centered/tight`,
   `team.chip/fade`, urutan tab HoDS, warna/tint, artwork, font, gradient,
   spacing 8pt, geometri ±1px, reduce-exact — bukan field backend.
3. **Kontrak snapshot + Zod dipertahankan.** Komponen tetap mengimpor dari
   `../data/*`; yang berubah hanya sumber di belakang `cms-snapshot.json`.
4. **Publikasi tetap build-time.** Astro tetap static; SEO/OG/pixel aman.
5. **Privasi pendaftar** tidak pernah terekspos publik, log, atau respons.
6. **Secret hanya di env server/Supabase**, tidak di repo/docs/chat.
7. **`service_role` (bypass RLS) hanya di server.** Key ini melewati RLS; jangan
   pernah ada di browser, bundle, `PUBLIC_*`, atau repo. Anon key untuk baca
   publik; service role untuk build/admin/intake server.
8. **Snapshot gabungan hanya selama migrasi, per-collection.** Satu collection
   tetap satu sumber aktif; hybrid tidak boleh jadi fallback stale permanen.

## 1. Inventaris ketergantungan GAS/Sheets/Drive/auth/hooks

### 1.1 Backend GAS/Sheets/Drive

| Komponen            | Lokasi                                                                                         | Fungsi                                                                      | Dependensi                    |
| ------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------- |
| CMS Export `doGet`  | `cms/gas/export.js`                                                                            | read-only `export`/`list`/`media` bertoken                                  | Sheets, Drive, `EXPORT_TOKEN` |
| CMS Export `doPost` | `cms/gas/export.js`                                                                            | selalu `READ_ONLY`                                                          | —                             |
| Media read          | `cms/gas/media.js`                                                                             | baca bytes WebP dari Drive privat, cek sha256                               | Drive folder                  |
| Admin `doGet`       | `cms/gas/admin/server.js`                                                                      | sajikan `Index.html` (HtmlService)                                          | OAuth Google, Properties      |
| Admin RPC Projects  | `cms/gas/admin/server.js`                                                                      | `adminLoad/Save/Add/Delete/RetryPublication/Upload/ReadProjectImage`        | Sheets, Drive, Deploy Hooks   |
| Admin RPC Team      | `cms/gas/admin/team.js`                                                                        | `adminLoadTeam/Add/Save/DeleteMember`, `adminUpload/ReadTeamImage`, reorder | Sheets (`team` tab), Drive    |
| Recruitment intake  | `recruitment/gas/intake.js`                                                                    | `doPost` tulis 1 baris `applications`, idempotency UUID+hash                | Sheets, Script Lock           |
| Recruitment prepare | `recruitment/gas/intake.js`                                                                    | `prepareRecruitmentSheet`                                                   | Sheets                        |
| Generator           | `scripts/generate-gas-bootstrap.mjs`, `generate-gas-admin.mjs`, `generate-recruitment-gas.mjs` | bake seed + source ke `artifacts/*-gas/`                                    | snapshot, contract            |
| Sheet tabs          | `CMS_TABLES`                                                                                   | `projects, team, roles, hods, domains, partners, milestones, settings`      | Spreadsheet privat            |
| Drive folder        | `DRIVE_FOLDER_ID`                                                                              | media privat `ds-project-<hash>.webp`, `ds-team-<hash>.webp`                | DriveApp                      |

### 1.2 Auth & identitas

| Layer            | Mekanisme                                                                                      | Catatan                                                          |
| ---------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Admin GAS legacy | Google login + `Session` active/effective + allowlist `ADMIN_EMAILS`, deployment `Only myself` | satu owner                                                       |
| Native `/admin`  | Google OAuth web (PKCE, state), server AES-256-GCM cookie stateless, CSRF token, sesi ≤1 jam   | `server/cms-admin.mjs`                                           |
| Apps Script API  | `https://script.googleapis.com/v1/scripts/<deployment>:run` Bearer token                       | scopes spreadsheets+drive+userinfo.email+script.external_request |
| Recruitment      | shared secret `RECRUITMENT_GAS_TOKEN` server→GAS, tanpa login                                  | intake belum dipasang                                            |

### 1.3 Environment & secret (nama saja)

- Vercel server: `CMS_API_URL`, `CMS_API_TOKEN`, `CMS_ADMIN_ORIGIN`,
  `CMS_ADMIN_GOOGLE_CLIENT_ID`, `CMS_ADMIN_GOOGLE_CLIENT_SECRET`,
  `CMS_ADMIN_API_DEPLOYMENT_ID`, `CMS_ADMIN_SESSION_SECRET`,
  `RECRUITMENT_GAS_URL`, `RECRUITMENT_GAS_TOKEN`, `RECRUITMENT_OPEN`, `SITE_URL`.
- GAS Export Properties: `OWNER_EMAIL`, `ADMIN_EMAILS`, `SPREADSHEET_ID`,
  `DRIVE_FOLDER_ID`, `EXPORT_TOKEN`, `CMS_SCHEMA_VERSION`.
- GAS Admin Properties: tambahan `DEPLOY_HOOK_TESTING`,
  `DEPLOY_HOOK_PRODUCTION`, `PUBLICATION_PENDING`.
- Recruitment intake Properties: `RECRUITMENT_SHEET_ID`,
  `RECRUITMENT_GAS_TOKEN`, `RECRUITMENT_OPEN`.
- Lokal (ignored): `.env.local` dengan `CMS_API_*`, `CMS_DEPLOY_HOOK_*`.

### 1.4 Jalur publikasi & build (yang mengikat backend)

- `npm run build` → `prebuild` → `scripts/fetch-cms.mjs` →
  `scripts/cms-client.mjs` (`syncCmsSnapshot`) → fetch GAS export → Zod
  (`src/data/cms-schema.mjs`) → `cacheProjectMedia` → tulis snapshot atomik.
- Tanpa env → mode `local`, snapshot committed (deterministik untuk `verify.mjs`).
- Save admin → tulis Sheet → panggil **dua** Vercel Deploy Hook (testing +
  production) → rebuild ~1–2 menit → konten live.
- `origin` punya **dua push URL** → satu push men-deploy kedua situs.

### 1.5 Konsumen data (tidak boleh berubah API)

`src/data/projects.ts`, `team.ts`, `roles.ts`, `hods.ts`, `domains.ts`,
`partners.ts` adalah thin loader dari `cms-snapshot.json`. Komponen, halaman,
dan `getStaticPaths` mengimpor dari sana. `src/pages/admin/*`,
`src/scripts/cms-admin-editor.js`, `cms-team-editor.js` adalah klien editor
native; `src/pages/recruitment/apply.astro` + `src/scripts/recruitment-form.ts`
adalah klien form. Server handler: `server/cms-admin.mjs`,
`server/cms-media.mjs`, `server/recruitment.mjs`,
`server/recruitment-contract.mjs`.

### 1.6 QA yang mengikat backend

`tests/cms.test.mjs` (fetch/export/snapshot), `cms-admin.test.mjs` +
`cms-team.test.mjs` (GAS VM contract), `cms-native-admin.test.mjs` (OAuth
handler), `cms-media.test.mjs` (sharp + cache), `recruitment.test.mjs`
(contract + handler). Enam suite ini merujuk GAS secara langsung; migrasi harus
menambah suite baru, bukan melonggarkan yang lama.

## 2. Klasifikasi: dipertahankan / diadaptasi / diganti / kelak dihapus

### 2.1 Dipertahankan (jangan diubah)

- **Astro static + `<ClientRouter />`**, UI, desain, geometri, font, artwork.
- **Kontrak snapshot + Zod** (`src/data/cms-schema.mjs`) dan **bentuk ekspor
  thin loader** (`projects/team/roles/hods/domains/partners`).
- **Snapshot atomik** (tulis temp → rename) dan **mode `local`** tanpa env.
- **Pipeline media**: validasi raster (`server/cms-media.mjs`), sharp WebP
  ≤256 KiB, hash sha256 sebagai nama file, cache build sebelum snapshot.
- **Publikasi build-time + dua rebuild** dan **satu push dua repo**.
- **Editor native `/admin` + `/admin/team`** (shell, layout, noindex) dan
  **form recruitment** (langkah, validasi, draft localStorage, receipt).
- **Semua assertion baseline** `verify.mjs`, `responsive-audit.mjs`,
  `navbar-audit.mjs`, `verify-vt.mjs`, `audit:spacing`, `seo:audit`.
- **7 gate + SEO per pass**.

### 2.2 Diadaptasi (logika sama, sumber berbeda)

| Sebelum                                      | Sesudah                                              | Yang harus dijaga                                                       |
| -------------------------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------- |
| `cms/gas/export.js` `doGet`                  | PostgREST/RPC baca dari Postgres                     | snapshot identik, token/RLS read-only                                   |
| `syncCmsSnapshot` fetch GAS                  | fetch Supabase (server key) saat build               | atomic write, Zod, no stale fallback, bounded size/timeout, hybrid §5.6 |
| `server/cms-admin.mjs` `gas()` `scripts.run` | Supabase Auth (Google) + PostgREST/RPC admin         | sanitasi respons, error code publik, session/allowlist, no key di klien |
| `server/recruitment.mjs` POST ke GAS         | POST ke Supabase (Vercel Function)                   | origin check, bounded body, honeypot, contract identik, **idempotency** |
| `recruitment/gas/intake.js` write            | Postgres insert/RPC                                  | lock ekuivalen, content-hash, UUID receipt, formula-safe                |
| Drive folder media                           | Supabase Storage bucket privat                       | sha256, ≤256 KiB, no hotlink                                            |
| GAS Deploy Hook call                         | Vercel Hook via DB webhook/Edge Function atau server | save = live, dua target                                                 |
| GAS revision sha256(records)                 | kolom `revision`/`updated_at` DB                     | conflict semantics harus diuji ulang (lihat §5.3)                       |

### 2.3 Diganti (mekanisme baru)

- **Google Sheets** → **Postgres (Supabase)** per collection.
- **DriveApp folder** → **Supabase Storage bucket privat**.
- **GAS Script Properties** → **Supabase env + RLS + tabel allowlist admin**.
- **OAuth custom AES cookie** (`/api/admin/auth/*`) → **Supabase Auth provider
  Google** + cookie sesi server (`@supabase/ssr`). Hapus PKCE/state/AES buatan
  sendiri; lihat §5.4.
- **GAS `scripts.run`** → **PostgREST/RPC**. Yang dihapus: Apps Script API +
  **API executable deployment**. **Yang TETAP diperlukan:** Google Cloud OAuth
  client + consent screen, karena Supabase Auth provider Google memakainya
  (redirect URI pindah ke `…supabase.co/auth/v1/callback`, §5.4.1). Jangan
  hapus OAuth client/consent.
- **`service_role` key** menggantikan peran GAS Admin sebagai pihak yang boleh
  menulis; hanya dipakai di Vercel Function server, bukan di GAS Properties.

### 2.4 Kelak dihapus (hanya setelah §9 terpenuhi)

`cms/gas/**`, `recruitment/gas/**`, `scripts/generate-gas-*.mjs`,
`scripts/generate-recruitment-gas.mjs`, GAS VM tests, env GAS di kedua Vercel,
Script Properties, Spreadsheet, Drive folder (setelah backup), Apps Script API +
deployment executable, dependency `sharp` **tetap** (dipakai media).

> **Dikecualikan (tetap diperlukan):** Google Cloud **OAuth client + consent
> screen** untuk Supabase Auth provider Google (§5.4.1), dan dependency
> `@supabase/*`. Jangan memasukkannya ke daftar hapus.

> Catatan: `server/cms-media.mjs` dan `scripts/cms-client.mjs` **tidak dihapus** —
> hanya endpoint fetch-nya berubah.

## 3. Skema Supabase, RLS, dan privasi pendaftar

### 3.1 Prinsip skema

- Bentuk tabel **memetakan kontrak snapshot** agar loader/Zod tetap; nested
  field desain tetap `jsonb` **hanya jika perlu**. Field desain tidak muncul
  di admin.
- Urutan/slot tetap dijaga sebagai **constraint/aturan desain**, bukan field
  bebas: `domains` 6 baris id tetap, `roles` id tetap, `hods` tab/panel slot,
  `partners` 3 kategori + 4 why, `team` 7 grup.
- Kolom audit: `created_at`, `updated_at`, `updated_by`.

### 3.2 Arsip proposal tabel — bukan catalog applied

Tabel berikut inventory desain awal, **bukan** definisi SQL actual. Bentuk applied
masing-masing collection ditentukan migrations/plan pass accepted. Contoh Partners
actual singleton smallint + arrays, bukan record per-slot. Auth plan actual terbaru
mengalahkan proposal global; milestones/settings tidak menjadi pass otomatis.

| Tabel                      | Kunci                 | Konten                                                                                               |
| -------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------- |
| `cms_projects`             | `id text pk`          | title, tags jsonb[2], description, image                                                             |
| `cms_team_groups`          | `id text pk`          | title, position                                                                                      |
| `cms_team_members`         | `id text pk`          | group_id fk, name, role, photo, position (1–8/grup)                                                  |
| `cms_roles`                | `id text pk`          | title, tagline, chips jsonb, deadline, about, requirements jsonb, contact, whatsapp                  |
| `cms_hods`                 | `id text pk`          | title, description, tabs jsonb                                                                       |
| `cms_domains`              | `id text pk`          | title, description, labels jsonb                                                                     |
| `cms_partners`             | `id text pk`          | type, position, label, image, title, description                                                     |
| `cms_milestones`           | `id text pk`          | year, title, description, image (reserved)                                                           |
| `cms_settings`             | `key text pk`         | value                                                                                                |
| `cms_admin_users`          | `auth_id text UNIQUE` | existing recruitment allowlist; CMS permission proposal terpisah                                     |
| `cms_publication`          | `id int pk`           | publication_pending, revision, updated_at                                                            |
| `recruitment_applications` | `receipt uuid pk`     | content_hash text (index, **bukan** unique global), received_at, fields (kolom eksplisit atau jsonb) |

### 3.3 Hak akses (RLS) dan tiga kunci

Supabase punya tiga identitas; pemisahannya adalah inti keamanan migrasi:

| Kunci                                          | Melewati RLS?                  | Dipakai di                                                                       | Tidak boleh di                         |
| ---------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------- | -------------------------------------- |
| **anon** (`SUPABASE_ANON_KEY`)                 | tidak                          | browser publik bila perlu baca                                                   | —                                      |
| **authenticated** (JWT user)                   | tidak (RLS pakai `auth.uid()`) | sesi admin terautentikasi                                                        | —                                      |
| **service_role** (`SUPABASE_SERVICE_ROLE_KEY`) | **ya, bypass RLS**             | Vercel Function server (build fetch, admin write, intake insert, media, publish) | browser, bundle, `PUBLIC_*`, repo, log |

Aturan:

- **Deny by default**: RLS aktif di **semua** tabel; tidak ada grant anon yang
  tidak perlu.
- **Konten CMS migrated actual**: tabel privat dengan RLS/revoke/deny policy;
  anon membaca lewat SECURITY DEFINER public wrapper, bukan table SELECT.
  Projects/Team write hanya server lewat Management API dengan owner session
  OAuth custom. Roles/Domains read-only. Desain authenticated admin RLS
  adalah proposal pass auth terakhir, bukan grant yang harus ditambah sekarang.
- **`recruitment_applications`**: **tidak ada** policy `anon`/`authenticated`
  untuk `SELECT`. Insert hanya lewat Vercel Function ber-`service_role` (setelah
  origin check + kontrak validasi). Owner/admin hanya baca via jalur
  terautentikasi + allowlist (atau service role server), tidak lewat klien
  publik.
- **`cms_admin_users` / `cms_publication`**: tanpa akses anon.
- **Kunci bypass RLS dilarang keras di klien.** Artinya: tidak ada `service_role`
  di `src/`, tidak ada prefix `PUBLIC_`, tidak ada di `dist/`, dan tidak
  dicetak. Vercel Function memuatnya dari env server.
- **Build Astro** memakai `SUPABASE_ANON_KEY` untuk RPC konten publik.
  service_role bukan pengganti anon; akses media privat harus diaudit terpisah
  pada jalur server tanpa memperluas public bucket policy.
- **Rotasi**: bila key sempat terlihat, rotasi di dashboard Supabase dan update
  env kedua Vercel; jangan mengandalkan penghapusan saja.

### 3.4 Auth CMS terakhir — actual scope dan permission terisolasi

Desain operasional terbaru: [Auth CMS Master Work Plan](cms-auth-supabase-plan.md)
§2–4 dan A–E. **PLAN ONLY**, provider/dependency/owner/session pending; bukan
izin perubahan RLS, multi-admin/editor, audit atau recruitment PII.

Actual `private.cms_admin_users` existing memakai `auth_id text`, email, active
serta id serial; dipakai **recruitment**, bukan proposal user_id uuid. Jangan
reuse/seed/alter otomatis untuk CMS. Proposal auth CMS: private allowlist terpisah,
trusted Supabase Auth identity dan CMS active permission per request sebelum
service-role/Management/Storage calls. Recruitment identity linking/permissions
wajib ditinjau, cookies terpisah saja tidak cukup memisahkan akses.

Content public read tetap anon RPC, bukan direct anon SELECT. Authenticated tidak
mendapat direct CMS writes. Projects/Team Management writes dan private media
transport existing tetap server-mediated. RLS deny/ACL existing dipertahankan;
service role melewati RLS, sehingga server permission check wajib. Revocation
CMS grant berlaku request berikutnya; Origin+session-bound CSRF wajib POST.

Multi-admin/editor, MFA, audit baru, freshness15menit dan PII management adalah
proposal masa depan, bukan scope otomatis auth pass. Jangan menambahkan grant
recruitment kepada owner CMS sebagai efek samping cutover.

### 3.5 Privasi pendaftar (wajib)

- `recruitment_applications` **tidak pernah** dapat dibaca anon; tidak ada
  endpoint publik yang mengembalikan record.
- PII (nama, email, WhatsApp, isi jawaban) hanya untuk owner/admin terautentikasi.
- **Tidak ada payload pendaftar di log/respons/analytics/error**; GET status
  hanya `{ ok, accepting }` seperti sekarang.
- Kolom `content_hash` (index, bukan unique global) untuk idempotency retry;
  `receipt` = UUID klien, unik. Retry dengan receipt sama + hash sama → receipt
  yang sama tanpa baris kedua; receipt sama + hash beda → `ID_CONFLICT`. Dua
  pendaftar berbeda dengan jawaban identik harus tetap boleh tersimpan.
- Pertimbangkan retensi + pemisahan akses (tabel terpisah/schema terbatas),
  dan `pgcrypto`/enkripsi kolom sensitif bila diperlukan. Supabase default
  terenkripsi at-rest; jangan mengklaim lebih.
- Honeypot, origin check, batas payload 32 KiB, validasi server+GAS-contract
  dipertahankan di handler Vercel.

## 4. Urutan migrasi

**Recruitment dulu** (fitur baru, GAS belum dipasang, tanpa data live yang
hilang → risiko terendah). **Lalu CMS satu collection/pass**. Urutan migrasi aktif: `projects` → `team` → `roles` → `domains` → `hods` → `partners`, lalu auth terakhir.
Inventory `milestones`/`settings` adalah keputusan scope terpisah, bukan pass otomatis; hardening setelah data diterima.

**Rekomendasi penting:** jangan pasang intake GAS recruitment sama sekali.
Implementasikan intake Supabase langsung; ini menghindari kerja ganda dan
satu-satunya backend yang belum live.

## 5. Migrasi teknis (data, ID, revision, media, login, publikasi)

### 5.1 Data & ID

- Sumber migrasi = `src/data/cms-snapshot.json` (kontrak kanonik) **plus** baca
  langsung Sheet/export sebelum freeze untuk menangkap perubahan terakhir.
- **Pertahankan ID** yang ada. Perhatikan: Sheet `team` memakai id
  `group-index` (mis. `data-1`) sementara admin native menghasilkan
  `member-<uuid>`; rekonsiliasi ID sebelum/ketika migrasi team agar tidak
  memutus referensi.
- `domains`/`roles`/`hods` id tetap (design-fixed) — jaga 6 baris & urutan.
- Nested `jsonb` dipertahankan agar Zod/loader tidak berubah.

### 5.2 Media

- Enumerasi file Drive `ds-project-*`/`ds-team-*`; verifikasi sha256 sama dengan
  hash di nama/path. Upload ke Storage bucket privat dengan path logis sama
  (`.webp`, hash).
- **Opsi A (dianjurkan):** Supabase Storage sumber; `cacheProjectMedia` tetap
  membake ke `public/images/cms/...` saat build → path publik, geometri, SEO,
  dan no-hotlink tidak berubah.
- **Opsi B:** peta URL Storage dengan rewrite. Lebih berisiko (query/hotlink/
  caching). Jangan pakai hotlink langsung tanpa verifikasi.
- File yatim (tidak direferensikan) → kandidat lifecycle/cleanup, jangan hapus
  otomatis saat migrasi.

### 5.3 Revision & konflik

- Saat ini revision = sha256(JSON records). Bila memakai DB, ganti ke
  `updated_at`/nomor versi atau tetap hitung hash atas record set.
- **Semantik konflik berubah** → wajib uji dua tab/dua sesi (CONFLICT),
  add/delete, min/max (Projects 1–8, Team 1–8/grup), reorder posisi sisip.

### 5.4 Auth terakhir — keputusan dan desain bersyarat

[Master Work Plan auth CMS](cms-auth-supabase-plan.md) menjadi desain aktual;
checklist A–E seluruhnya execution pending. Faiz meminta eksekusi **di AI baru**.
Google via Supabase rekomendasi untuk mempertahankan login UX existing; provider
belum dipilih. Password memerlukan scope/UI plan tambahan. SDK proposal
`@supabase/ssr` + `@supabase/supabase-js` belum installed/disetujui.

Jika Google dipilih: gunakan Node Functions login/callback existing
`/api/admin/auth/login|callback`, bukan Astro SSR adapter baru. Google callback
ke existing Supabase `/auth/v1/callback`; Supabase redirect ke exact testing dan
production `/api/admin/auth/callback`. Pertahankan unrelated recruitment redirects
serta oldconfig selama observation/rollback. Tidak wildcard atau client URL trust.

Server-only cookies proposal HttpOnly/Secure/SameSite=Lax/Path=/ dalam namespace
CMS terpisah recruitment; SDK default tidak otomatis HttpOnly. New Auth client
per request; refresh/Set-Cookie chunks/redirect/cache headers diuji. `getSession`
user atau unverified JWT tidak cukup untuk permission; trusted Auth verification

- CMS-specific active grant setiap request, bounded failures fail closed.
  CSRF current session-bound contract dipertahankan, bukan generic double-submit
  assumption. Logout scope explicit local proposal untuk menghindari global logout
  recruitment; residual access-token lifetime dan revocation tests harus jelas.

No direct authenticated content writes/grants baru; preserve Management API writes.
Jangan seed existing recruitment `cms_admin_users` untuk CMS. Owner provisioning,
account linking/provider/settings/grant mutations setelah concrete design/approval.
Jangan delete GAS export/env/OAuth client dalam pass ini. Auth cutover dan GAS
removal dipisahkan; old env retirement setelah acceptance+observation terkontrol.

### 5.5 Publikasi static

- Pertahankan `prebuild` + snapshot atomik + dua Vercel Deploy Hook.
- Pemicu rebuild: DB webhook/Edge Function **atau** server admin memanggil hook
  setelah write sukses (seperti sekarang). Jangan mengandalkan GAS.
- "Save = live" tetap berarti data tersimpan + rebuild diminta; verifikasi
  kedua deployment SUCCESS sebelum mengklaim live.

### 5.6 Snapshot gabungan selama migrasi (hybrid)

Selama CMS dimigrasikan collection-per-pass, **satu** `cms-snapshot.json` harus
berisi sebagian collection dari Supabase dan sebagian masih dari GAS. Aturannya:

- **Bentuk snapshot + Zod tidak berubah.** `cmsSnapshotSchema` tetap validasi
  keenam collection sekaligus; loader/komponen tidak tahu asalnya.
- **Peta sumber actual tercatat di kickoff/TODO dan dispatch cms-client.mjs**;
  file cms/cms-sources.json belum dibuat. Jangan menganggap file/env switch itu
  sudah ada. Remote sources live: projects/team/roles/domains/hods Supabase,
  partners GAS (pass 5 `763bafc`). Local mode memakai snapshot committed.
- Implementasi actual fetch full GAS snapshot yang tervalidasi terlebih dulu,
  override migrated collections dari RPC, validasi Zod final dan atomic write.
  Jadi source konten tiap collection sudah tunggal tetapi validitas full GAS
  masih dependency; pure per-collection reads adalah proposal refactor terpisah.
  Tidak mencampur field: satu collection sepenuhnya dari satu sumber.
- **Tidak ada fallback stale.** Jika sumber aktif sebuah collection gagal,
  build gagal (kecuali mode `local` tanpa kedua env GAS yang memang memakai
  snapshot committed untuk `verify.mjs`). Hybrid **bukan** izin fallback ke GAS
  ketika Supabase error.
- **Cutover per collection** = tambahkan override RPC source `gas`→`supabase` dalam
  satu commit, setelah rekonsiliasi (§6) hijau. Membalik entri peta **hanya
  aman bila belum ada tulisan baru**; setelah ada tulisan Supabase, wajib
  reverse-migration §6.3 (bukan sekadar balik peta). Jangan menganggap cutover
  bisa dibalik gratis setelah data masuk.
- **Berakhir**: setelah keenam collection + recruitment di Supabase, hapus peta
  hybrid, hapus cabang kode GAS di `syncCmsSnapshot`, dan hapus kode GAS (§9).
  Tambah test yang menegaskan tidak ada collection ber-source `gas`.
- **Bahaya yang dicegah**: content source drift dan hybrid permanen. Review
  source inventory kickoff/TODO + actual cms-client.mjs tiap pass; jangan
  mendokumentasikan file konfigurasi yang belum diimplementasikan sebagai fakta.

Peta sumber live pass 5 `763bafc` (bukan file runtime):

```json
{
  "recruitment": "supabase",
  "projects": "supabase",
  "team": "supabase",
  "roles": "supabase",
  "partners": "gas",
  "domains": "supabase",
  "hods": "supabase"
}
```

(`recruitment` tidak masuk `cms-snapshot.json`; ia punya tabel & pipeline
sendiri, tetapi sumbernya mengikuti peta yang sama.)

## 6. Backup, pembandingan, cutover, rollback per tahap

### 6.1 Pra-cutover (setiap collection & recruitment)

1. **Freeze** fitur itu (matikan write GAS / `RECRUITMENT_OPEN=false`).
2. **Backup**: export snapshot, salinan Spreadsheet (File → Copy), salinan
   folder Drive, catat sha256 + jumlah baris + revision. Simpan di luar repo.
3. **Import** ke Supabase + hitung checksum di tujuan.
4. **Rekonsiliasi**: collection aktif pass harus value-identik dengan sumber
   yang disepakati; bandingkan non-target terhadap pre-pass remote. Baseline
   repo tetap untuk visual; jangan reset Team drift preexisting demi membuat
   seluruh snapshot live tampak identik baseline.
5. **Render parity**: build + 19/22 HTML identik baseline; 7 gate + SEO PASS.

### 6.2 Cutover

- Ganti env ke Supabase sebagai **satu-satunya** sumber; nonaktifkan write GAS
  (read-only/closed). Jangan dual-write.
- Karena GAS tidak sinkron otomatis: **semua tulisan setelah cutover hanya ada
  di Supabase**. Ini disengaja; rollback §6.3 menanganinya.

### 6.3 Rollback (per tahap) — dikoreksi untuk data baru

Rollback **bukan** sekadar membalik env. Setelah cutover, GAS tidak menerima
tulisan, jadi **setiap tulisan baru hanya ada di Supabase**. Membalik env tanpa
memindahkan tulisan itu = kehilangan data. Aturan:

**Klasifikasi tulisan setelah cutover:**

- **Konten CMS (admin):** bisa dibekukan (freeze) — admin cukup tidak menulis
  selama window. Reversible.
- **Pendaftaran recruitment (publik):** **tidak bisa ditarik kembali** setelah
  pendaftar menerima receipt. Ini yang paling berisiko di-rollback.

**Syarat sebelum cutover (agar rollback aman):**

1. **Freeze tulisan** untuk fitur itu: admin berhenti menulis; recruitment
   `RECRUITMENT_OPEN=false` sehingga tidak ada pendaftar baru.
2. **Drain in-flight**: tunggu request berjalan selesai (timeout handler ≤60 dtk)
   sebelum membalik apa pun.
3. Snapshot/backup §6.1 tersimpan di luar repo + checksum.

**Dua jenis rollback:**

- **A. Rollback sebelum ada tulisan baru** (window bersih): balikkan env/peta
  sumber ke GAS + restore snapshot baseline. Aman, tidak ada data hilang.
- **B. Rollback setelah ada tulisan baru** (reverse migration, **manual &
  terverifikasi**):
  1. Export baris Supabase (konten atau `recruitment_applications`) ke format
     kanonik.
  2. Impor balik ke Sheet/GAS (atau target lama) dan **verifikasi** jumlah +
     checksum tiap baris.
  3. Baru aktifkan kembali write GAS.
  4. Untuk recruitment: batalkan/selesaikan dulu semua receipt yang sudah
     diterbitkan; jangan mengaktifkan GAS intake recruitment (migrasi ini
     memang tidak memasangnya — §MWP).
     Tanpa langkah ini, env flip akan **menghilangkan** pendaftaran yang sudah
     masuk.

**Aturan tambahan:**

- **Utamakan forward-fix** daripada rollback bila data baru sudah ada: perbaiki
  di Supabase (satu sumber aktif), jangan pindah-pindah.
- Rollback setelah-cutover **wajib disetujui user** dan hanya saat owner hadir.
- Simpan backup GAS selama periode observasi; **jangan** menganggapnya hidup/
  sinkron, dan jangan pernah dual-write untuk "mengamankan".
- Catat RPO efektif = 0 selama freeze (tidak ada tulisan yang boleh hilang);
  bila freeze dilanggar, perlakukan sebagai kasus B.

### 6.4 Aturan pembandingan data

- Hitung jumlah baris per tabel vs Sheet.
- Diff field kanonik + `jsonb` ternormalisasi.
- Bandingkan sha256 snapshot hasil vs baseline.
- Verifikasi media: hash cocok, decode webp, ≤256 KiB.
- Semua bukti disimpan di `artifacts/` (ignored), tanpa nilai PII/secret.

## 7. QA setiap pass (CMS/admin/recruitment + 7 gate + SEO)

Setiap pass wajib:

1. `npm run test:cms` + suite baru Supabase (RLS anon gagal, admin allowlist,
   applicant privacy, idempotency UUID+hash, media hash, revision conflict).
2. `npm run test:recruitment` + `verify:recruitment` untuk pass recruitment.
3. Browser admin native/legacy/Team pada 4 width (mock RPC **bukan** bukti auth
   Google/Supabase sebenarnya).
4. **7 gate:** `npm run build`, `node scripts/verify.mjs` (preview static),
   `npm run audit:navbar`, `npm run verify:vt`, `node scripts/responsive-audit.mjs`,
   `npm run audit:spacing`, `npm run format:check`.
5. **SEO:** `npm run seo:audit` (rute publik tetap tepat; admin noindex).
6. Regresi lintas fitur: Projects & Team projects live, Home/About/Recruitment/
   Partners/HoF/Contact baseline tidak rusak.
7. Jangan longgarkan assertion geometri/konten baseline; tambah fixture baru
   terpisah.

Bukti maksimal vs mock harus dibedakan jelas (lihat §10).

## 8. Kebutuhan setup owner, biaya/kuota, risiko, batas bukti

### 8.1 Arsip proposal setup awal / auth (bukan onboarding ulang)

Project Supabase dan empat env server sudah digunakan pass live. Daftar
setup awal di bawah bukan TODO Domains. Provider/callback/SDK hanya berlaku
jika user memilih desain auth pada pass terakhir; jangan implementasikan sekarang.

- Buat Supabase project (organisasi + region terdekat, mis. Singapore).
- Terapkan migrasi SQL skema + RLS + seed dari snapshot.
- Bucket Storage privat untuk media.
- Auth: **Supabase Auth provider Google**; daftarkan redirect kedua domain
  (testing + production) di dashboard Supabase + OAuth consent.
- Isi env server **kedua** Vercel — tanpa prefix `PUBLIC_`:
  `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (bypass RLS,
  server-only), plus token pemicu rebuild. Kunci `service_role` **tidak** masuk
  bundle klien. Dependency baru: `@supabase/ssr` (klien) + `@supabase/supabase-js`
  (server) — perlu persetujuan.
- Arsip proposal owner enrollment: kini wajib CMS-specific permission terisolasi; jangan seed recruitment `cms_admin_users` untuk CMS.
- Konfigurasi pemicu rebuild (webhook/Edge Function/server hook).
- Redeploy kedua situs; verifikasi rute admin/ANON.

### 8.2 Biaya/kuota (perlu dikonfirmasi; angka tier bisa berubah)

- Free tier: DB ~500 MB, Storage ~1 GB, egress ~5 GB/bulan, Auth MAU terbatas,
  project bisa di-pause saat idle.
- Pro (~$25/bulan per project) untuk backup harian + tanpa pause; bandwidth
  egress adalah biaya utama bila media di-hotlink (karena itu §5.2 Opsi A).
- Batas konkret harus dicek di halaman harga Supabase saat implementasi; angka
  tier di atas bisa berubah.
- GAS quota (Apps Script) yang sudah ada tetap relevan selama belum dihapus.

### 8.3 Risiko

| Risiko                                               | Dampak                  | Mitigasi                                                       |
| ---------------------------------------------------- | ----------------------- | -------------------------------------------------------------- |
| Dual-source drift                                    | data hilang/inkonsisten | satu sumber aktif, freeze sebelum cutover                      |
| Service role key bocor (bypass RLS)                  | akses penuh DB          | server-only, dilarang di bundle/`PUBLIC_`/repo/log, rotasi key |
| Snapshot hybrid tertinggal / collection dobel sumber | drift tanpa terlihat    | peta sumber per-collection + review tiap pass (§5.6)           |
| PII pendaftar terekspos                              | pelanggaran privasi     | RLS deny, no public read, no log                               |
| Revision/konflik berubah                             | save menimpa perubahan  | uji ulang conflict, migrasi algoritma                          |
| Media hotlink/egress                                 | biaya + lambat          | cache build (§5.2A), jangan hotlink                            |
| Auth lock-in / callback                              | admin tidak bisa login  | uji kedua domain + non-owner                                   |
| Rollback setelah tulisan baru                        | data baru tidak ke GAS  | export balik manual sebelum re-enable                          |
| Regression geometri                                  | situs rusak             | jaga assertion, 7 gate+SEO tiap pass                           |
| Free tier pause                                      | build/admin down        | pantau kuota, pertimbangkan Pro                                |

### 8.4 Batas bukti

- Mock test **bukan** bukti auth/RLS/write Supabase nyata.
- Deployment situs **bukan** bukti migrasi data.
- "Save berhasil" **bukan** bukti live; harus dua rebuild SUCCESS + verifikasi
  publik.
- Tidak mengklaim root cause kegagalan Google/fetch lama; tidak mengklaim
  seluruh CMS selesai.

## 9. Kriteria kapan kode GAS lama boleh dihapus

Baru boleh dihapus setelah **semuanya**:

1. Recruitment berjalan via Supabase, `accepting` benar, **satu baris nyata**
   diterima dan diverifikasi, PII private, retry idempotent.
2. Seluruh collection CMS (projects, team, roles, partners, domains, hods)
   dimigrasikan, direkonsiliasi, dan diterima owner (CRUD nyata).
3. Supabase adalah **satu-satunya** sumber aktif; GAS sudah read-only/closed
   dan tidak ada kode yang memanggilnya.
4. Backup GAS final (Sheet + Drive + source + Properties) tersimpan di luar repo
   dan ditandai.
5. Window observasi rollback selesai tanpa incident; rollback tidak lagi
   diperlukan.
6. Semua suite test baru hijau; test GAS lama **dipindahkan/dihapus dalam
   commit terpisah** (bukan bersamaan dengan cutover).
7. Docs (`AGENTS.md`, `cms-plan.md`, `cms-sop.md`, `ai-handoff.md`, setup guide)
   diperbarui.
8. **Persetujuan eksplisit user** untuk menghapus.

Backup branch/tag dipertahankan sebelum penghapusan. `sharp` dan pipeline media
tetap.

## 10. Rekomendasi

1. **Mulai dari recruitment tanpa memasang GAS intake.** Implementasi Supabase
   intake langsung mengurangi risiko dan kerja ganda. Form publik + kontrak
   validasi tidak berubah.
2. **Auth terakhir dan mekanisme pending** (§5.4 proposal). Jangan mengganti
   OAuth custom CMS selama pass data; minta keputusan setelah semua collection
   diterima. Recruitment email/password tetap terpisah.
3. **Satu collection/pass**, snapshot+Zod dipertahankan, peta sumber hybrid
   (§5.6) selama migrasi, dua rebuild, 7 gate + SEO tiap pass; jangan sentuh
   geometri/assertion.
4. **`service_role` only server** (§3.3); anon key tidak diberi tulis.
5. **Jangan hapus apa pun sekarang.** Pertahankan GAS read-only sampai §9.
6. **Jangan push** sebelum user mengonfirmasi; `origin` men-deploy dua situs.
7. Putuskan juga: region Supabase, tier (free vs Pro), retensi PII pendaftar,
   dan apakah `milestones`/`settings` ikut serta.

## 11. Yang perlu keputusan user sebelum implementasi

- Mekanisme auth CMS final **BELUM DIPUTUSKAN**; §5.4 proposal Google, auth terakhir.
- Project/region existing web-community sudah ada; jangan onboarding ulang. Tier/kuota ditinjau terpisah bila diperlukan.
- Retensi & akses data pendaftar.
- Persetujuan dependency baru `@supabase/supabase-js` + `@supabase/ssr`.
- Urutan aktif: recruitment/Projects/Team/Roles selesai → Domains → Hods →
  Partners → auth terakhir. Milestones/settings bukan tambahan otomatis.
- Konfirmasi window cutover (owner hadir) dan izin commit/push terpisah.
- Siapa/berapa admin di `cms_admin_users` (sekarang satu owner).
