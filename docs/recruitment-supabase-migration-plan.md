# Master Work Plan — Recruitment → Supabase

Status: **LIVE 7 Oct 2026.** Pass 1 (intake) SELESAI di Supabase project
`web-community`. Pass 2 (admin read / derived columns / audit) SELESAI — login
admin pakai Supabase Auth email + password, user admin + allowlist `cms_admin_users`
sudah di-seed. Kode sudah push.

Dokumen ini turunan dari
[`docs/cms-supabase-migration-plan.md`](cms-supabase-migration-plan.md) dan
memakai target akhir yang sama: **Postgres + Storage + Supabase Auth**; Astro/UI/
geometri/CMS existing tetap.

Disusun 6 Oct 2026. Bahasa: Indonesia. Nama env/property dicatat **tanpa nilai**
— jangan pernah mencetak secret/token/PII pendaftar.

## 0. Scope, non-goal, dan larangan

**In scope (satu pass):** memindahkan tujuan penyimpanan form recruitment dari
GAS/Sheets (yang **belum dipasang**) ke **Supabase Postgres**, tanpa mengubah
kontrak API, UI, langkah form, validasi, atau geometri.

**Non-goal (pass lain):** editor admin data pendaftar, migrasi collection CMS,
penghapusan kode GAS CMS, autentikasi admin (lihat §9), analitik/notifikasi.

**Larangan tegas:**

1. **Jangan memasang GAS intake recruitment** (`recruitment/gas/intake.js`) di
   Google. Fitur ini langsung dibangun di Supabase.
2. Jangan mengubah UI/form/geometri; form custom **tidak punya node Figma** —
   jangan mengarang referensi atau klaim MAE.
3. Jangan mengubah CMS/auth/media/snapshot existing.
4. Satu sumber data aktif per fitur; tanpa fallback stale; GAS backup tidak
   dianggap sinkron.
5. PII pendaftar tidak boleh muncul di log/respons/error/analytics.
6. `service_role` hanya di server.

## 1. Inventaris permukaan recruitment saat ini

| Permukaan                   | Lokasi                                                                                           | Perubahan pada pass ini                          |
| --------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------ |
| Halaman form                | `src/pages/recruitment/apply.astro`                                                              | **tidak berubah**                                |
| Klien form                  | `src/scripts/recruitment-form.ts`                                                                | **tidak berubah**                                |
| Wrapper tipe form           | `src/data/recruitment-form.ts`                                                                   | **tidak berubah**                                |
| Sumber opsi/domain          | `src/data/recruitment-options.mjs`                                                               | **tidak berubah**                                |
| API publik                  | `api/recruitment/application.js`                                                                 | routenya tetap, isi handler swap                 |
| Handler server              | `server/recruitment.mjs`                                                                         | upstream GAS → Supabase                          |
| Kontrak validasi            | `server/recruitment-contract.mjs`                                                                | **tidak berubah**                                |
| Test                        | `tests/recruitment.test.mjs`, `scripts/verify-recruitment-form.mjs`                              | ditambah suite Supabase                          |
| GAS intake (belum dipasang) | `recruitment/gas/intake.js`, `scripts/generate-recruitment-gas.mjs`, `docs/recruitment-setup.md` | **tidak dipasang**; nanti dihapus (§9 main plan) |
| Env yang dibuang            | `RECRUITMENT_GAS_URL`, `RECRUITMENT_GAS_TOKEN`                                                   | diganti env Supabase                             |
| Env yang dipertahankan      | `RECRUITMENT_OPEN`, `CMS_ADMIN_ORIGIN`/`SITE_URL`                                                | tetap kill-switch/origin                         |

Kontrak field (dari `server/recruitment-contract.mjs`) yang menjadi kolom:
`TEXT_FIELDS`, `CHOICES`, `MULTI_FIELDS`, `REQUIRED_TEXT`, `REQUIRED_CHOICES`,
`APPLICATION_FIELDS`, `DOMAINS`. Jangan menambah/mengurangi field pada pass ini.

Perilaku API yang **wajib** dipertahankan:

- `GET /api/recruitment/application` → `{ ok: true, accepting: boolean }` saja.
- `POST` body `{ id (uuid), fields, website }`; respons sukses
  `{ ok: true, receipt }`; error `CLOSED | FORBIDDEN | INVALID_INPUT | LIMIT |
ID_CONFLICT | UNCONFIRMED | METHOD_NOT_ALLOWED`.
- Origin check, content-type JSON, batas body 32 KiB, honeypot `website`.
- Tidak ada retry POST otomatis dari server; retry manual klien memakai UUID sama.

## 2. Keputusan: disetujui vs usulan (belum disetujui)

| #   | Keputusan                                                                 | Status                               |
| --- | ------------------------------------------------------------------------- | ------------------------------------ |
| 1   | Tujuan = Supabase Postgres, pipeline langsung (tanpa GAS intake)          | **disetujui user**                   |
| 2   | Kontrak API, UI, validasi, geometri tidak berubah                         | **disetujui user**                   |
| 3   | Insert lewat Vercel Function server (`service_role`), bukan klien         | **disetujui user**                   |
| 4   | Pass 1 **hanya** intake; auth/admin, CAPTCHA, fitur tambahan = pass pisah | **disetujui user** (pemisahan scope) |
| 5   | Skema pass 1 = `fields jsonb` kanonik + metadata                          | **disetujui user** (7 Oct 2026)      |
| 6   | `RECRUITMENT_OPEN` tetap di env (kill-switch)                             | **disetujui user** (7 Oct 2026)      |
| 7   | Akses data pendaftar server owner-only; route admin = pass terpisah       | **disetujui user** (7 Oct 2026)      |
| 8   | Idempotency unique `receipt` + `ON CONFLICT` + fungsi DB atomik           | **disetujui user** (7 Oct 2026)      |
| 9   | Kolom turunan/queryable (email, primary_hods, array, boolean)             | **pass lanjutan, belum disetujui**   |
| 10  | Baca admin (route server + audit)                                         | **pass lanjutan, belum disetujui**   |
| 11  | Rate limit server-side                                                    | **pass lanjutan, belum disetujui**   |
| 12  | CAPTCHA (Turnstile) — butuh perubahan klien                               | **pass terpisah, belum disetujui**   |
| 13  | Retensi PII (mis. 12 bulan)                                               | **belum diputuskan**                 |
| 14  | Enkripsi tambahan `email`/`whatsapp` (pgcrypto)                           | **belum diputuskan**                 |
| 15  | Pembukaan recruitment untuk publik                                        | **belum diputuskan**                 |

Catatan status:

- **disetujui user** = dari arahan eksplisit; dasar implementasi. Pass 1 (#1–#8)
  sudah disetujui 7 Oct 2026.
- **pass lanjutan / pass terpisah / belum diputuskan** = jangan diimplementasikan
  di pass 1; menunggu keputusan terpisah.

## 3. Arsitektur target

```text
Browser form (UI tetap)
  → POST /api/recruitment/application  (Vercel Function, server)
     → cek Origin + content-type + ukuran + honeypot
     → validateApplication()  (kontrak existing)
     → hitung content_hash kanonik
     → panggil Supabase (service_role): submit_recruitment_application(...)
         → INSERT ... ON CONFLICT (receipt) DO NOTHING  (transaksi atomik)
         → hash sama → receipt sama (idempotent, tanpa baris kedua)
         → hash beda → ID_CONFLICT
     → respons { ok: true, receipt }
  → Supabase Postgres `recruitment_applications`

GET status → { ok, accepting }  (dari flag; tanpa menyentuh PII)
Admin read (pass lain) → route server requireAdmin + audit
```

GAS tidak ada di jalur.

## 4. Skema Supabase dan akses data pendaftar

### 4.1 Pass 1 — tabel minimal `recruitment_applications`

Arah rekomendasi user untuk pass intake pertama (belum disetujui formal): data
kanonik sebagai `fields jsonb` + metadata; **tanpa** kolom turunan/queryable dan
**tanpa** baca admin. Ini menjaga pass pertama tetap kecil.

| Kolom            | Tipe                                 | Catatan                                            |
| ---------------- | ------------------------------------ | -------------------------------------------------- |
| `receipt`        | `uuid primary key`                   | UUID klien; kunci idempotency                      |
| `content_hash`   | `text not null`                      | hash kanonik; **index biasa, bukan unique global** |
| `received_at`    | `timestamptz not null default now()` | waktu server                                       |
| `schema_version` | `int not null`                       | versi kontrak (`1` saat ini)                       |
| `fields`         | `jsonb not null`                     | payload kanonik lengkap `validateApplication()`    |

Index: `unique(receipt)` (pk), `(received_at desc)`. **Tidak** ada unique pada
`content_hash` (dua pendaftar berbeda dengan jawaban identik tetap boleh).

### 4.2 Inventaris field lengkap (kontrak → `fields jsonb`)

Sumber kontrak: `server/recruitment-contract.mjs`. **38 field**, semuanya
disimpan apa adanya (nilai sudah dinormalisasi `validateApplication()`) di
`fields jsonb`. Kolom turunan di §4.1 **tidak** wajib di pass 1; bila nanti
ditambah, mapping-nya seperti catatan di bawah.

**Teks (20):** `full_name`, `preferred_name`, `email`, `whatsapp`, `institution`,
`city_region`, `currently_exploring`, `secondary_interest`, `most_relevant_work`,
`portfolio_link`, `alternative_evidence`, `real_world_problem`,
`technology_approach`, `explore_or_build`, `skill_to_improve`, `six_months_goal`,
`team_story`, `why_join`, `what_to_contribute`, `what_to_build_together`.

**Pilihan tunggal (12):** `current_status`, `current_level`, `primary_hods`,
`project_experience`, `team_comfort`, `time_commitment`,
`cross_hods_willingness`, `best_description`, `independent_learning`,
`agreement_1`, `agreement_2`, `agreement_3`.

**Multiselect (5):** `learning_methods`, `desired_output`, `team_roles`,
`contribution_types`, `foundation_skills`.

**Dinamis per domain (1):** `specific_area` (anggota `DOMAINS[…].specificAreas`
sesuai `primary_hods`).

Catatan mapping bila kolom turunan dibuat (pass lanjutan):

- **Persetujuan `"on"`:** kontrak hanya menerima `agreement_1/2/3 === 'on'`
  (array `['on']`) dan `REQUIRED_CHOICES` mewajibkannya. Di `fields jsonb`
  disimpan `"on"` apa adanya (kanonik). Kolom boolean turunan nanti:
  `agreement_n = (fields->>'agreement_n' = 'on')` — selalu `true` untuk baris
  valid, `false`/`null` bila kosong.
- **`team_comfort`:** nilai string `'1'`–`'5'`; kolom turunan opsional
  `smallint` 1–5.
- **`project_experience`**, `current_status`, `current_level`, `desired_output`,
  `team_roles`, `contribution_types`: nilai pilihan dari opsi existing, bukan
  teks bebas — validasi tetap di kontrak, bukan di DB.
- **`primary_hods`/`specific_area`/`foundation_skills`** saling terkait (domain
  menentukan area & skill); jangan validasi silang di DB pada pass 1.

### 4.3 Akses

- **RLS aktif** di tabel ini.
- **Tidak ada** policy `anon`/`authenticated` untuk `SELECT` maupun `INSERT`.
  Klien publik tidak pernah menyentuh tabel langsung.
- **Insert** hanya lewat Vercel Function ber-`service_role` (yang memvalidasi
  origin/kontrak/honeypot) atau fungsi DB server-only (lihat §6.1).
- **Pass 1 tanpa baca admin**: tidak ada route baca dan tidak ada kolom
  turunan. Baca admin (route server `requireAdmin` + audit) adalah **pass
  lanjutan, belum disetujui** — bukan bagian pass intake pertama.
- **`service_role`** hanya di env server kedua Vercel; tidak di bundle/`PUBLIC_`.

### 4.4 PII

- Data diminimalkan: hanya field yang benar-benar dikumpulkan form.
- Tidak ada PII di log/respons/error/analytics; GET hanya `accepting`.
- Bukti acceptance disanitasi (jumlah baris, kecocokan hash/receipt, hasil;
  **tanpa** nama/email/jawaban).

## 5. API existing (bentuk tidak berubah)

- Route dan kontrak respons dipertahankan persis (§1).
- Yang berubah **hanya** transport upstream di `server/recruitment.mjs`:
  dari POST ke GAS menjadi pemanggilan Supabase.
- Env pada kedua Vercel:
  - **buang** `RECRUITMENT_GAS_URL`, `RECRUITMENT_GAS_TOKEN`;
  - **tambah** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`;
  - **tetap** `RECRUITMENT_OPEN`, `CMS_ADMIN_ORIGIN`/`SITE_URL`.
- `accepting` = `RECRUITMENT_OPEN === 'true'` **dan** konfigurasi Supabase
  lengkap (fail closed bila tidak lengkap).
- Tidak ada notifikasi/email otomatis (di luar scope).

## 6. Transaksi & idempotency (retry tidak menggandakan)

Fungsi DB (usulan §2 #8), `SECURITY DEFINER`, dipanggil server; skema pass 1
minimal (§4.1):

```text
submit_recruitment_application(p_receipt uuid, p_hash text, p_fields jsonb)
  INSERT INTO recruitment_applications
      (receipt, content_hash, schema_version, fields)
  VALUES (p_receipt, p_hash, 1, p_fields)      -- received_at default now()
  ON CONFLICT (receipt) DO NOTHING
  RETURNING receipt

  jika baris tersisip      → return { receipt, status: 'inserted' }
  jika konflik:
    baca content_hash lama
    sama  → return { receipt, status: 'duplicate' }   (idempotent)
    beda  → raise ID_CONFLICT
```

- **Satu transaksi**; unique `receipt` menyerialkan race tanpa perlu script
  lock. Dua request bersamaan dengan receipt sama → tepat satu baris.
- **Hash kanonik** dihitung dari field ternormalisasi dengan urutan deterministik
  (urut `APPLICATION_FIELDS`, array apa adanya). Algoritma hash harus stabil dan
  didokumentasikan; beda hash = `ID_CONFLICT`.
- **Tidak ada auto-retry** POST. Timeout/unknown → `UNCONFIRMED`; klien simpan
  payload+receipt untuk retry manual; retry receipt+hash sama mengembalikan
  receipt sama tanpa baris kedua.
- Tidak ada tulisan parsial: validasi kontrak **sebelum** insert.

### 6.1 Jalur RPC: objek internal privat + wrapper exposed (dikoreksi)

RLS di tabel **tidak cukup** untuk fungsi `SECURITY DEFINER`: fungsi berjalan
dengan hak pemilik dan bisa dipanggil via PostgREST `/rest/v1/rpc` oleh siapa
pun yang punya `EXECUTE`. Model yang dipakai:

- **Tabel + fungsi inti di schema `private`** (`private.recruitment_applications`,
  `private.recruitment_submit_intake`) — schema ini **tidak** diekspos
  PostgREST.
- **Wrapper RPC di schema exposed `public`** (`public.submit_recruitment_application`)
  — tipis, hanya memanggil fungsi privat.
- **`EXECUTE` wrapper hanya untuk `service_role`**:
  `REVOKE ALL ... FROM PUBLIC, anon, authenticated;`
  `GRANT EXECUTE ... TO service_role;`
- **`EXECUTE` fungsi privat dicabut** dari `PUBLIC, anon, authenticated`.
- **`SECURITY DEFINER SET search_path`** tetap/aman di kedua fungsi
  (`private, pg_catalog` untuk inti; `pg_catalog` di wrapper dengan panggilan
  yang di-schema-qualify).
- **Tanpa `USAGE` schema `private`** untuk `anon`/`authenticated`.
- Panggilan dari Vercel Function memakai `service_role`; klien publik tidak
  pernah memanggil RPC.

**Test wajib (pass 1), sudah dijalankan di Postgres nyata:**

- `anon`/`authenticated` memanggil wrapper → **permission denied**, bukan insert.
- `anon`/`authenticated` `SELECT` tabel privat → **permission denied**.
- `anon` memanggil fungsi privat langsung → **permission denied**.
- `service_role` → insert/idempotent/`ID_CONFLICT` + race satu baris (§6).

Bukti: `scripts/verify-recruitment-db.mjs` (`npm run verify:recruitment-db`),
13/13 PASS di Postgres 18.6; evidence `artifacts/recruitment-db/proof.json`.

## 7. Anti-spam

**Pass 1 (tanpa perubahan klien):** origin allowlist, honeypot `website` harus
kosong (field sudah ada di form), kontrak ketat, batas 32 KiB, batas panjang
field, `content-type` JSON. **Tidak ada** perubahan UI form pada pass ini.

**Pass lanjutan, server-only (belum disetujui):**

- **Rate limit** per IP + per receipt (Upstash Redis / Vercel KV), respons
  `LIMIT`/429 tanpa membocorkan detail — murni server, tanpa perubahan klien.
- **Minimum time-to-submit** (timing) dan deteksi duplikasi email (soft flag).

**Pass terpisah, butuh perubahan klien (belum disetujui):**

- **CAPTCHA (Cloudflare Turnstile)** hanya jika dibuka luas. Ini **bukan**
  fitur pass 1 karena bertentangan dengan larangan perubahan klien: Turnstile
  memerlukan (a) script/widget di halaman form, (b) token dikirim ke server,
  (c) verifikasi `siteverify` server-side + secret baru, (d) penanganan
  kegagalan/expiry di UI. Diperlukan persetujuan user eksplisit + pass QA UI
  tersendiri; jangan diselundupkan ke pass intake.

Pantau kuota Supabase (insert/egress) dan catat percobaan gagal tanpa payload.

## 8. Retensi & akses PII

- **Akses (pass lanjutan, belum disetujui):** owner/admin ber-allowlist via
  jalur server + audit; tidak ada akses publik. Ekspor/hapus = owner-only,
  tercatat. Pass 1 belum punya route baca.
- **Retensi (belum diputuskan, §2 #13):** usul simpan sampai mis. 12 bulan
  setelah recruitment ditutup, lalu hapus/arsipkan; kebijakan ditulis di doc
  operasional.
- **Penghapusan:** hapus baris berdasarkan `receipt` bila diminta; catat di
  `cms_audit_log` tanpa payload.
- **Enkripsi tambahan (belum diputuskan, §2 #14):** at-rest bawaan Supabase;
  `pgcrypto` untuk `email`/`whatsapp` bila diinginkan. Jangan mengklaim lebih
  dari yang benar.
- **Bukti:** sanitized (count, receipt match, result); tidak ada nama/email.

## 9. Callback/session/auth — pass terpisah, bukan pass 1

Pass 1 **tidak menyentuh auth**: intake recruitment tidak punya login pengguna,
hanya origin + `service_role`. Tidak ada route auth baru, tidak ada Supabase
Auth, tidak ada perubahan klien di pass intake pertama.

Saat baca/kelola data pendaftar dibutuhkan (pass lanjutan), autentikasi admin
mengikuti main plan §5.4 — **Supabase Auth provider Google**, pemisahan tiga
callback, desain cookie/session — dan otorisasinya mengikuti main plan §3.4
(`cms_admin_users` + `requireAdmin` + audit). Membangun pass auth ini terpisah
dari intake supaya pekerjaan awal tetap kecil.

## 10. QA (CMS/admin relevan) + 7 gate + SEO

Setiap pass wajib:

1. `npm run test:recruitment` (diadaptasi ke mock Supabase, kontrak tetap).
2. Suite baru: insert sukses; **retry receipt+hash sama → satu baris**;
   receipt beda hash → `ID_CONFLICT`; **race dua request receipt sama → satu
   baris**; **`anon`/`authenticated` tidak bisa `EXECUTE` fungsi intake (§6.1)**
   maupun `SELECT`/`INSERT` tabel; honeypot; origin salah; melebihi 32 KiB;
   `accepting=false` → `CLOSED`; tidak ada PII di respons/log.
3. `npm run verify:recruitment` (form 4 langkah, draft, error, closed, retry).
4. Regresi CMS/admin: `npm run test:cms`, `verify:cms-admin`,
   `verify:cms-native-admin`, `verify:cms-team-admin` 4 width — pastikan CMS
   tidak tersentuh.
5. **7 gate:** `npm run build`, `node scripts/verify.mjs` (preview static),
   `npm run audit:navbar`, `npm run verify:vt`,
   `node scripts/responsive-audit.mjs`, `npm run audit:spacing`,
   `npm run format:check`.
6. **SEO:** `npm run seo:audit` (rute publik tetap; admin noindex).
7. Jangan melonggarkan assertion geometri/konten baseline; tambah fixture baru
   terpisah. Form custom tanpa node Figma → tidak ada klaim MAE.

Mock ≠ bukti Supabase nyata; lihat §14.

## 11. Acceptance

**Lokal (mock):** semua skenario §10 hijau + 7 gate + SEO.

**Live (owner, setelah env diisi):**

1. Deploy dengan `RECRUITMENT_OPEN=false`; GET `{ok, accepting:false}`.
2. Isi env Supabase kedua Vercel; set buka; submit **satu** pendaftar uji
   (mobile + desktop) di **kedua** domain.
3. Verifikasi **tepat satu** baris per submit; `receipt` cocok; jawaban sesuai;
   GET tidak memuat PII.
4. Retry manual dengan receipt+hash sama → receipt sama, **tidak** ada baris
   kedua; receipt sama + isi beda → `ID_CONFLICT`.
5. Dengan kunci `anon`/`authenticated` (bukan `service_role`), panggil
   `rpc('submit_recruitment_application', …)` dan `SELECT` tabel → **ditolak**
   (§6.1), bukan insert/terbaca.
6. Pastikan **tidak ada** project GAS intake yang dipasang (bukti bahwa jalur
   GAS tidak dipakai).
7. Hapus baris uji; tutup kembali; rekam bukti sanitized.
8. Pastikan `/about`, Projects, dan admin CMS tetap normal (tidak tersentuh).

## 12. Rollback

Karena **GAS intake recruitment tidak pernah dipasang**, rollback sederhana dan
tanpa migrasi balik data:

- **Rollback kode:** `RECRUITMENT_OPEN=false` + redeploy versi sebelumnya →
  form kembali `accepting:false`; tidak ada pendaftar baru.
- **Data Supabase yang sudah masuk tetap disimpan** (tidak dihapus saat
  rollback); baris uji dihapus manual.
- **Bila tetap ingin meninggalkan Supabase** untuk fitur ini: ekspor baris
  dulu lalu arsipkan; jangan hapus tanpa persetujuan owner.
- **Window:** recruitment tetap **tertutup** selama deploy/rollback supaya tidak
  ada pendaftar yang hilang (RPO = 0).

## 13. Work order

**Pass 1 — intake minimal: SELESAI LIVE 7 Oct 2026.**

1. ✅ Approve §2 #4–#8 (7 Oct 2026).
2. ✅ Supabase project `web-community` (`yejrdckcmlxrkklgtrwy`, ap-southeast-1);
   migrasi diterapkan.
3. ✅ Kode: transport `server/recruitment.mjs` GAS → Supabase RPC; env
   (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`); test diadaptasi.
4. ✅ Lokal: `test:recruitment` 9/9; `verify:recruitment-db` 13/13 di Postgres
   nyata; 7 gate + SEO PASS.
5. ✅ Env `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`RECRUITMENT_OPEN=false`
   terpasang di kedua Vercel project; deploy `f01a89b` READY.
6. ✅ Acceptance live kedua situs PASS; baris uji dihapus; recruitment kembali
   `accepting:false`; tabel kosong.
7. ✅ Docs diperbarui + commit; **push `f01a89b` dengan konfirmasi user**
   (`origin` men-deploy dua situs).

**Pass lanjutan (terpisah, hanya setelah pass 1 hijau + approval):**

- **Pass 2 (SELESAI 7 Oct 2026):** kolom turunan/queryable (§4.2) + baca admin
  owner-only (auth Supabase §9) + audit. Kode, migration, tests selesai.
  Login admin = **Supabase Auth email + password** (`grant_type=password`,
  cookie HttpOnly). Route catch-all
  `/api/admin/recruitment/{applications|application|stats|login|logout}`.
  Tests 19/19. `SUPABASE_ANON_KEY` terpasang di kedua Vercel. Google provider
  tidak dipakai.
- **Pass 3:** rate limit server-side (§7) + refresh token otomatis.
- **Pass 4:** CAPTCHA + perubahan klien (§7) — pass UI tersendiri.
- **Keputusan terpisah:** pembukaan publik (§2 #15).

Jangan menggabungkan pass lanjutan ke pass 1.

## 14. Batas bukti

- Mock test **bukan** bukti Supabase nyata (RLS/insert/auth).
- Deployment situs **bukan** bukti penyimpanan baris.
- `accepting:false` bukan berarti Supabase belum siap — itu kill-switch.
- Tidak mengklaim GAS intake pernah live; tidak mengklaim seluruh CMS selesai.

## 15. Keputusan user yang belum dipilih (belum disetujui)

- Kolom turunan/queryable (§4.2) dan jalur baca admin (§4.3/§9) — pass lanjutan.
- Rate limit: kapan & provider (Upstash/Vercel KV).
- CAPTCHA (Turnstile): ya/tidak + kapan; ini pass terpisah dengan perubahan
  klien.
- Retensi PII + apakah pakai enkripsi `email`/`whatsapp`.
- Kapan recruitment dibuka untuk publik.

## 16. Kebutuhan setup Supabase (SELESAI 7 Oct 2026)

Langkah di bawah sudah dijalankan untuk project `web-community`:

1. Buat project Supabase (organisasi + region terdekat, mis. Singapore).
2. Terapkan migrasi `supabase/migrations/20261006120000_recruitment_intake_pass1.sql`
   (SQL Editor atau `supabase db push`). Roles `anon`/`authenticated`/
   `service_role` standar Supabase sudah ada.
3. Verifikasi grant: `anon`/`authenticated` **tidak** bisa `EXECUTE` wrapper
   maupun menyentuh schema `private`. Bisa dijalankan dengan menunjuk
   `RECRUITMENT_DB_URL` (koneksi migration/owner, **bukan** service key) ke
   `npm run verify:recruitment-db`.
4. Pada **kedua** Vercel, set server-only: `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY` (tanpa prefix `PUBLIC_`), dan
   `RECRUITMENT_OPEN=false` (tetap tertutup). Buang `RECRUITMENT_GAS_URL` dan
   `RECRUITMENT_GAS_TOKEN` saat cutover env.
5. Redeploy kedua situs agar env berlaku; GET harus `{ ok, accepting:false }`.
6. Acceptance live §11 (dengan membuka sementara), lalu tutup kembali.
7. **Tidak** membuat Storage, Auth, tabel turunan, atau route admin pada pass
   ini. Jangan memasang GAS intake.

## 17. Referensi

- [`docs/cms-supabase-migration-plan.md`](cms-supabase-migration-plan.md) — plan
  induk (target, RLS, auth, hybrid snapshot, rollback, penghapusan GAS).
- [`docs/recruitment-integration-plan.md`](recruitment-integration-plan.md),
  [`docs/recruitment-setup.md`](recruitment-setup.md) — status GAS lama (tidak
  dipasang).
- [`server/recruitment.mjs`](../server/recruitment.mjs),
  [`server/recruitment-contract.mjs`](../server/recruitment-contract.mjs).
