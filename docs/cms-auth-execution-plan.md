# Auth CMS → Supabase — Master Work Plan EKSEKUSI C3–E (untuk AI baru)

Status: **eksekusi live belum dikerjakan**. Bagian A–D sudah selesai lokal pada
commit `ae52f54` (belum push). Dokumen ini adalah work order rinci untuk
menyelesaikan sisa: **C2–C4 (review + apply SQL + provision owner)**, **D4 (push
consent)**, **E (deploy + acceptance dua domain)**.

> Baca dulu: `cms-migration-kickoff.md` §6 (prompt) → `AGENTS.md` →
> `ai-handoff.md` → `cms-auth-supabase-plan.md` §11 (progress) →
> `cms-auth-design.md` (design final) → dokumen ini → `cms-migration-todo.md`.

## 0. Ringkasan status actual (7 Oct 2026)

- Runtime live `925d577` (Partners A–E accepted), kedua primary aliases READY.
- Auth lokal **B–D selesai di commit `ae52f54`**, tree bersih, belum push.
- Dependency `@supabase/supabase-js@^2.117.3` sudah terpasang server-only.
- Migration `supabase/migrations/20261014010000_cms_auth_pass7.sql` **belum
  di-apply**.
- Supabase Auth: Google enabled, email/password enabled, `uri_allow_list`
  hanya 2 callback recruitment, `refresh_token_rotation_enabled=true`,
  `jwt_exp=3600`.
- Owner Supabase existing: `auth_id = 5903606f-5543-4832-9db5-f6a433b6c660`,
  email `admin@datasorcerers.com`, email confirmed. (Tidak ada Google identity.)
- Recruitment: allowlist 1 aktif, applications 0, governance tetap terpisah.

## 1. Artefak yang harus divalidasi AI baru sebelum eksekusi

1. `git log`/`status`/refs: `ae52f54` ada, tree bersih, origin/production masih
   `925d577`. Node22 di `/tmp/ds-cms-node22/.../bin/node` (verifikasi dulu).
2. File ada dan konsisten dengan design:
   - `server/cms-auth.mjs`, `server/cms-admin.mjs`, `api/admin/auth/refresh.js`
   - `supabase/migrations/20261014010000_cms_auth_pass7.sql`
   - `tests/cms-auth.test.mjs`, `tests/cms-native-admin.test.mjs`,
     `tests/cms-media.test.mjs`
   - `src/pages/admin/{index,team}.astro`, `src/scripts/cms-{admin,team}-editor.js`
   - `docs/cms-auth-design.md`
3. Jalankan ulang (tanpa env server) untuk konfirmasi baseline hijau:
   - `node --test tests/cms-auth.test.mjs tests/cms-native-admin.test.mjs tests/cms-media.test.mjs`
   - `node --test tests/recruitment.test.mjs`
     Kalau ada regresi, **stop** dan laporkan (jangan lanjut apply).

## 2. C2 — Review SQL/config/grant & dampak recruitment (read-only)

Tujuan: pastikan perubahan additive aman, tidak menyentuh recruitment.

- [ ] C2.1 Baca `20261014010000_cms_auth_pass7.sql` baris demi baris. Verifikasi: - hanya additive (`create table if not exists`, `create or replace function`). - `private.cms_admin_permissions` (auth_id **uuid**), `private.cms_rate_limit`. - RLS enabled + deny policy untuk kedua tabel. - `revoke all ... from public, anon, authenticated` (+ service_role pada tabel). - fungsi `SECURITY DEFINER`, `set search_path = pg_catalog`, objek qualified. - public wrapper hanya `grant execute ... to service_role`. - **tidak** ada `drop`, `alter` tabel recruitment, atau seed email/UID.
- [ ] C2.2 Read-only inspect catalog existing (tanpa mutasi):
      `to_regclass('private.cms_admin_permissions')` / `to_regclass('private.cms_rate_limit')`
      → harus `null` (belum ada). `to_regclass`/`to_regprocedure` untuk
      `public.cms_verify_admin(uuid)`, `public.cms_rate_limit_check(...)`,
      `public.cms_rate_limit_reset(...)` → `null`.
- [ ] C2.3 Inspeksi `private.cms_admin_users` (recruitment): pastikan
      **tidak berubah** dan **tidak dipakai** oleh migration auth (grep: tidak ada
      referensi). Konfirmasi `auth_id text` vs CMS `auth_id uuid` = sengaja beda.
- [ ] C2.4 Konfirmasi owner mapping: `admin@datasorcerers.com`
      (`5903606f-5543-4832-9db5-f6a433b6c660`) adalah satu-satunya yang akan
      di-provision. **Jangan** tambah Google identity, **jangan** seed dari email.

Stop condition: jika catalog menunjukkan table/fungsi auth sudah ada (mis. sisa
percobaan), **inspect state dulu**, jangan blind reapply/drop.

## 3. C2.5 — Local proof ulang (opsional cepat) + freeze baseline

- [ ] `node --test tests/cms-auth.test.mjs` (PostgreSQL ephemeral nyata; bukti
      migration schema/RLS/privilege/rerun/injection).
- [ ] Catat snapshot `sha256` + 19 HTML publik hash (bandingkan ke
      `artifacts/cms-pass6/baseline-html.json`).
- [ ] Tangkap **captured inputs** hybrid pre-apply (kalau butuh parity pre/post),
      dengan `SUPABASE_ANON_KEY` diambil in-memory dari Management API (jangan
      print). Jangan overwrite `src/data/cms-snapshot.json`.

## 4. C3 — Apply additive SQL + provision owner grant (BUTUH IZIN KONKRET)

> Gate: AI baru **wajib** minta izin eksplisit Faiz sebelum menjalankan apply live.
> Tun+jukkan diff migration + rencana + proof lokal dulu.

- [ ] C3.1 Konfirmasi project: Management API `GET /v1/projects/<ref>` → `name`
      harus `web-community`, ref `yejrdckcmlxrkklgtrwy`.
- [ ] C3.2 Apply migration **sekali** via Management API `/database/query`
      (eksekusi isi file, idempotent oleh `if not exists`/`create or replace`).
      Simpan output sanitized ke `artifacts/cms-auth/apply.json`.
- [ ] C3.3 Jika error: **inspect actual state** (`to_regclass`/`to_regprocedure`),
      jangan reapply buta. Laporkan cause.
- [ ] C3.4 Provision owner grant (hanya 1 baris):
      `insert into private.cms_admin_permissions (auth_id, email, active)
 values ('5903606f-5543-4832-9db5-f6a433b6c660','admin@datasorcerers.com', true)
 on conflict (auth_id) do update set active = true, email = excluded.email;`
      **Jangan** hardcode ini ke migration tracked — jalankan sebagai provisioning
      privat setelah mapping disetujui. Simpan bukti (bukan secret) ke artifacts.
- [ ] C3.5 Bukti read-only: panggil `public.cms_verify_admin('5903606f-...')` via
      service_role → `{ok:true}`. Cek catalog: owner/definer/search_path/ACL.
      Uji anon/authenticated **ditolak** (catalog + tidak ada execute).
- [ ] C3.6 Pastikan recruitment tak tersentuh: `private.cms_admin_users` count
      tetap, `private.recruitment_applications` tetap 0.

## 5. C4 — Konfigurasi (minim untuk password)

Password provider **tidak** butuh `uri_allow_list`/callback baru. Yang perlu:

- [ ] C4.1 Pastikan `SUPABASE_ANON_KEY` ada di kedua Vercel (sudah ada; verifikasi
      presence/scope, jangan print).
- [ ] C4.2 **Password owner**: Faiz sendiri yang set/replace password akun
      `admin@datasorcerers.com` di dashboard Supabase. AI **tidak** meminta/mengisi
      password lewat chat. Catat sebagai langkah manual owner.
- [ ] C4.3 Verifikasi `RECRUITMENT_OPEN=false` (recruitment tetap closed) kedua
      project.
- [ ] C4.4 **Jangan** hapus env lama (`CMS_ADMIN_GOOGLE_*`,
      `CMS_ADMIN_API_DEPLOYMENT_ID`) — dipertahankan untuk rollback/observasi.

## 6. D4 — Local commit + minta izin push

- [ ] D4.1 Pastikan `ae52f54` (atau commit auth lokal) berisi kode+SQL+docs+test.
      Commit docs kickoff/execution/AGENTS terpisah bila perlu.
- [ ] D4.2 Laporkan SHA + ringkasan QA + sisa proof real-owner ke Faiz.
- [ ] D4.3 **Minta izin push baru** untuk SHA tersebut. Jangan push sebelum izin.

## 7. E — Push, dua deployment, real acceptance

- [ ] E1. Setelah izin konkret: `git push origin main` **sekali** (existing dua
      push URLs → testing + production). Verifikasi refs sinkron.
- [ ] E2. Tunggu dua Vercel READY untuk SHA tersebut; ambil timestamp provider
      (UTC/WIB) via API. Konfirmasi primary alias assignment + env scope benar.
- [ ] E3. Real owner acceptance **read-only dulu** di dua domain, browser 390/1440: - login `admin@datasorcerers.com` (owner isi sendiri saat login), - GET load Projects (4 baseline), load Team, preview private media, - logout → sesi bersih; reload → 401. - anon (tanpa cookie) → 401; non-owner (kalau ada akun uji) → 403; - refresh: buka dua tab, tunggu access expiry, operasi tetap valid tanpa
      replay mutation; revoked grant (uji lokal dulu, live hanya bila diizinkan)
      → request berikutnya ditolak.
      Mock **bukan** bukti real owner.
- [ ] E4. Recruitment isolation + privacy regression: login recruitment tetap
      jalan sendiri (akun email/password recruitment), cookie `sb-*` tidak saling
      memengaruhi CMS; recruitment `accepting:false`; public routes tetap.
- [ ] E5. Live mutation (save/add/delete/upload) **hanya** bila Faiz menyetujui
      fixture konkret + cleanup. Jangan save/reseed Team sebagai probe.
- [ ] E6. Update checkpoint LIVE dengan proof + docs commit lokal; minta izin push
      checkpoint berikutnya bila perlu. GAS removal tetap pass terpisah.

## 8. Acceptance matrix (wajib)

| Kasus                                                | Bukti minimum                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| Anon / cookie CMS invalid/tampered/expired           | 401 sanitized; nol privileged call; cookie recruitment tak otorisasi      |
| Auth valid tapi non-owner / inactive / tak ada grant | 403; tanpa records/media/hook/mutation                                    |
| Owner aktif                                          | GET load/read media sukses; kontrak + CSRF sama; min/max/revision lolos   |
| Login kredensial salah / rate limit                  | 401 / 429 sanitized, tanpa detail upstream                                |
| Refresh access expired + refresh valid               | cookie ter-rotate, owner sama, tanpa replay mutation                      |
| Refresh gagal / concurrent / dua tab                 | fail-safe deterministik, tanpa shared state lintas-user                   |
| Logout & revocation grant                            | request berikutnya ditolak; recruitment **tidak** global sign-out         |
| Origin/CSRF/content-type/body oversize POST          | ditolak sebelum privileged call; logout setara                            |
| Dua situs / localhost dev                            | cookie host-only secure; origin salah tak bisa pakai; no wildcard         |
| SQL/RPC role grants                                  | denials anon/authenticated + live catalog/read proof; no direct CMS write |
| Recruitment & public                                 | tests + frozen HTML parity; recruitment grant tidak meluas/berubah        |

## 9. Rollback & stop conditions

- Rollback **tidak** drop table additive atau revert data. Simpan config lama.
- Bila gagal: reviewed revert auth-code + dua deployment dengan izin push berlaku;
  restore config scoped. Re-login setelah cutover/rollback expected.
- Jangan diam-diam menerima sesi legacy sebagai fallback.
- **Stop** bila: ref/project salah, perubahan asing tak jelas, akses recruitment
  berubah, credential tidak tersedia, atau parity baseline gagal. Lanjut audit
  independen bila memungkinkan.
- GAS export/env/tab/deployment **tidak** disentuh pada pass ini.

## 10. DoD (Definition of Done)

- C3 applied sekali + owner grant ter-provision, catalog/ACL actual terbukti.
- D4 SHA dilaporkan + izin push diperoleh.
- E: dua READY exact SHA; owner/non-owner/anon/refresh/logout/revocation dua
  domain; recruitment isolated/closed; public/admin/media contract preserved;
  SQL ACL actual; docs match code/config; secrets absent.
- Kalau manual owner acceptance masih pending → tulis **pending**, bukan LIVE.

## 11. Fakta teknis penting (jangan diulang salah)

- Provider **password** ⇒ **tidak ada** OAuth/PKCE/callback CMS/`uri_allow_list`
  tambahan/account-linking. `api/admin/auth/callback.js` dipertahankan tapi
  mengembalikan redirect aman (retired).
- Cookie CMS: `__Host-ds-admin-session` (HTTPS) / `ds-admin-session` (localhost),
  AES-256-GCM ter-seal, AAD = purpose + origin. `exp` = access token; `rexp` =
  window 30 hari. Recruitment cookies (`sb-*`) **terpisah**.
- Tiap request: origin → CSRF (session ter-seal) → `getUser(access)` via
  `@supabase/supabase-js` (server-only, `SUPABASE_ANON_KEY`) → RPC
  `cms_verify_admin(auth_id uuid)` via `SUPABASE_SERVICE_ROLE_KEY`.
- Write Projects/Team tetap Management API; media private Storage; anon public
  read RPC existing. Jangan ubah transport/kontrak.
- Owner Supabase: `5903606f-5543-4832-9db5-f6a433b6c660` /
  `admin@datasorcerers.com` (confirmed). Password di-set owner manual.
- Ignored artifacts: `artifacts/cms-auth/` (baseline/apply/qa-summary/live proof),
  jangan simpan cookie/header/token/error mentah.
