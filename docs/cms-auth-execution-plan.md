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

- [x] C2.1 Baca `20261014010000_cms_auth_pass7.sql` baris demi baris. Verifikasi: - hanya additive (`create table if not exists`, `create or replace function`). - `private.cms_admin_permissions` (auth_id **uuid**), `private.cms_rate_limit`. - RLS enabled + deny policy untuk kedua tabel. - `revoke all ... from public, anon, authenticated` (+ service_role pada tabel). - fungsi `SECURITY DEFINER`, `set search_path = pg_catalog`, objek qualified. - public wrapper hanya `grant execute ... to service_role`. - **tidak** ada drop table/function, alter tabel recruitment, atau seed email/UID.
      `DROP POLICY IF EXISTS` hanya dua policy auth CMS baru untuk rerun lokal.
- [x] C2.2 Read-only inspect catalog existing (tanpa mutasi):
      `to_regclass('private.cms_admin_permissions')` / `to_regclass('private.cms_rate_limit')`
      → harus `null` (belum ada). `to_regclass`/`to_regprocedure` untuk
      `public.cms_verify_admin(uuid)`, `public.cms_rate_limit_check(...)`,
      `public.cms_rate_limit_reset(...)` → `null`.
- [x] C2.3 Inspeksi `private.cms_admin_users` (recruitment): pastikan
      **tidak berubah** dan **tidak dipakai** oleh migration auth (grep: tidak ada
      referensi). Konfirmasi `auth_id text` vs CMS `auth_id uuid` = sengaja beda.
- [x] C2.4 Konfirmasi owner mapping: `admin@datasorcerers.com`
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

- [x] C3.1 Konfirmasi project: Management API `GET /v1/projects/<ref>` → `name`
      harus `web-community`, ref `yejrdckcmlxrkklgtrwy`.
- [x] C3.2 Apply migration **sekali** via Management API `/database/query`
      (eksekusi isi file, idempotent oleh `if not exists`/`create or replace`).
      Simpan output sanitized ke `artifacts/cms-auth/apply.json`.
- [x] C3.3 Jika error: **inspect actual state** (`to_regclass`/`to_regprocedure`),
      jangan reapply buta. Laporkan cause.
- [x] C3.4 Provision owner grant (hanya 1 baris):
      `insert into private.cms_admin_permissions (auth_id, email, active)
 values ('5903606f-5543-4832-9db5-f6a433b6c660','admin@datasorcerers.com', true)
 on conflict (auth_id) do update set active = true, email = excluded.email;`
      **Jangan** hardcode ini ke migration tracked — jalankan sebagai provisioning
      privat setelah mapping disetujui. Simpan bukti (bukan secret) ke artifacts.
- [x] C3.5 Bukti read-only: panggil `public.cms_verify_admin('5903606f-...')` via
      service_role → `{ok:true}`. Cek catalog: owner/definer/search_path/ACL.
      Uji anon/authenticated **ditolak** (catalog + tidak ada execute).
- [x] C3.6 Pastikan recruitment tak tersentuh: `private.cms_admin_users` count
      tetap, `private.recruitment_applications` tetap 0.

## 5. C4 — Konfigurasi (minim untuk password)

Password provider **tidak** butuh `uri_allow_list`/callback baru. Yang perlu:

- [x] C4.1 Pastikan `SUPABASE_ANON_KEY` ada di kedua Vercel (sudah ada; verifikasi
      presence/scope, jangan print).
- [x] C4.2 **Password owner**: Faiz sendiri yang set/replace password akun
      `admin@datasorcerers.com` di dashboard Supabase. AI **tidak** meminta/mengisi
      password lewat chat. Owner melaporkan sudah set di dashboard sesi ini.
- [ ] C4.3 Verifikasi `RECRUITMENT_OPEN=false` (recruitment tetap closed) kedua
      project. Nilai env sensitive tidak dapat dibaca API; presence + live
      accepting:false kedua domain PASS, exact encrypted value belum dibuktikan.
- [x] C4.4 **Jangan** hapus env lama (`CMS_ADMIN_GOOGLE_*`,
      `CMS_ADMIN_API_DEPLOYMENT_ID`) — dipertahankan untuk rollback/observasi.

## 6. D4 — Local commit + minta izin push

- [x] D4.1 Pastikan `ae52f54` (atau commit auth lokal) berisi kode+SQL+docs+test.
      Commit docs kickoff/execution/AGENTS terpisah bila perlu.
- [x] D4.2 Laporkan SHA + ringkasan QA + sisa proof real-owner ke Faiz.
- [x] D4.3 **Minta izin push baru** untuk SHA tersebut. Jangan push sebelum izin.

## 7. E — Push, dua deployment, real acceptance

- [x] E1. Setelah izin konkret: `git push origin main` **sekali** (existing dua
      push URLs → testing + production). Verifikasi refs sinkron.
- [x] E2. Latest7e17fc0: dua primary alias READY exact SHA confirmed via API
      setelah akses pulih (timestamps §17). First e08a604 juga accepted.
- [ ] E3. Real owner acceptance **read-only dulu** di dua domain, browser 390/1440: - login `admin@datasorcerers.com` (owner isi sendiri saat login), - GET load Projects (4 baseline), load Team, preview private media, - logout → sesi bersih; reload → 401. - anon (tanpa cookie) → 401; non-owner (kalau ada akun uji) → 403; - refresh: buka dua tab, tunggu access expiry, operasi tetap valid tanpa
      replay mutation; revoked grant (uji lokal dulu, live hanya bila diizinkan)
      → request berikutnya ditolak.
      Mock **bukan** bukti real owner.
- [x] E4. Recruitment isolation + privacy regression: login recruitment tetap
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

## 12. Fresh C2/C3 execution proof — 7 Oct 2026

Arsip proof sebelum push e08a604; status terbaru ada di §13.

C3 diizinkan Faiz eksplisit sesi ini: migration
`20261014010000_cms_auth_pass7.sql` **applied sekali** via Management API ke
existing `web-community / yejrdckcmlxrkklgtrwy`; **tepat 1** grant aktif CMS untuk
owner mapping yang disetujui. Owner melaporkan password sudah di-set sendiri di
dashboard; password tidak diminta/dicetak. Tidak ada push/deploy auth sesi ini.
Runtime kedua situs masih `925d577`; auth lokal awal `ae52f54`, docs `b1c437c`.

C2 fresh sebelum apply: 0 tabel/0 fungsi auth, owner UID/email confirmed match,
recruitment `auth_id text`, satu allowlist aktif dan nol applications. Sesudah
apply: 2 tabel RLS/deny, 6 fungsi SECURITY DEFINER fixed `pg_catalog`, public
wrapper service_role-only; service RPC `cms_verify_admin` HTTP200 owner exact.
**12 actual read-only role denials** (6 wrapper anon/authenticated + 6 table
SELECT anon/authenticated/service_role); catalog semua table SELECT/INSERT/
UPDATE/DELETE denied. Recruitment allowlist fingerprint identik; applications0.
Owner grant tidak hardcoded ke migration tracked; tidak ada content writes.

Review lokal menemukan dan memperbaiki tiga celah di `ae52f54`: backend rate
limit gagal kini fail closed sebelum password Auth; endpoint refresh melakukan
trusted getUser + CMS permission dan menolak revoked grant; logout merevoke
refresh session dengan sealed access token + scope local, lalu clear cookie CMS.
Tambahan 3 regression tests. Focused auth/native/media + recruitment **49 PASS**
termasuk ephemeral PostgreSQL. Cookie window30hari dan CSRF stabil sepanjang
refresh kini sesuai dokumentasi actual; login baru membuat CSRF baru.

Vercel Production kedua situs: anon key dan env legacy/GAS tetap present.
`RECRUITMENT_OPEN` sensitive present, nilainya tidak dapat dibaca API; **live
GET kedua situs membuktikan accepting:false**. Jangan menyebut nilai encrypted
terverifikasi bila hanya presence/runtime yang terbukti.

Fresh 7 gate + SEO PASS: build0errors/23pages, verify browserErrors kosong,
navbar/VT PASS, responsive468/468, spacing39, format, SEO23. Tiga admin mock
masing-masing4widths PASS; mock bukan real owner. Snapshot hash
`4345f1abe445aa2a400c31413ccc058707a77105a7e388dc8d1074e78da94857` dan
**19/19 public HTML exact** baseline pass6. Full CMS tanpa env server **102 PASS + 10 Team live SKIP / 0 FAIL**,
termasuk Hods PostgreSQL nyata (selesai ~442 detik); CMS light **84 PASS +
10 SKIP**. Recruitment **24 PASS**.

**NEXT D4:** commit hasil review lokal dan minta izin exact SHA baru sebelum
satu push origin (dua push URLs). **E pending:** dua READY exact SHA/aliases,
real owner/non-owner/anon/expired/revoked/refresh/logout + recruitment isolation,
read-only dulu; fixture/cleanup live mutation harus disetujui. Auth belum LIVE
accepted; seluruh CMS belum selesai; keenam content Supabase buildRPC dan full
GAS export validation tetap. GAS removal pass terpisah.
Proof ignored `artifacts/cms-auth/{c2-audit,c2-parity,c3-apply,c3-read-proof}.json`.

## 13. First deployment and owner-read blocker

Dengan izin Faiz, satu push origin mengirim `e08a604fb18b4aad30c75832f850351114671163`
ke dua repo. Main/origin/main/production/main sinkron. Dua primary alias READY
exact SHA: testing **7 Oct 2026 16:31:50.069 UTC / 23:31:50.069 WIB**;
production **16:33:07.011 UTC / 23:33:07.011 WIB** (timestamp API provider).
Izin push e08a604 consumed; SHA berikutnya termasuk docs perlu izin baru.

Public regression dua situs PASS: 19/19 HTML exact pre/post, 84 browser cases
(19 public + 2 admin shells × 390/1440 × dua situs), anonymous Projects/Team/media
401, recruitment accepting:false. Owner isi password sendiri di browser terhubung,
namun GET Projects/Team **502** kedua domain. Auth belum LIVE accepted.

Read-only RPC inspection menemukan `affectedId:null` dari kedua load functions;
validator admin lama menolak field opsional itu. Perbaikan lokal mengabaikan null
sebagai field absent dan tetap memvalidasi affectedId non-null sebagai string.
Retired callback juga diperbaiki: fixed internal Location header 303, karena
Response.redirect dengan URL relatif melempar error Node live (500).
Regression tests memakai bentuk SQL actual; local handler dengan mock Auth +
real read-only CMS RPC kini 200 (4 Projects/25 Team), bukan real owner proof.

QA fix Node22.23.0: CMS light **85 PASS + 10 Team live SKIP**, recruitment
**24 PASS**, build0errors/23pages, tujuh gate + SEO PASS (verify browserErrors[],
navbar/VT, responsive468/468, spacing39, format, SEO23), tiga admin mock masing-
masing4widths PASS; snapshot hash tetap dan **19/19 public HTML exact**. Full CMS
sebelum fix e08a604 **102 PASS + 10 SKIP / 0 FAIL**; tidak diulang untuk fix
nullable field/callback ini. Proof fresh `readfix-{qa-summary,parity,local-rpc}.json`.

Faiz mengizinkan fixture non-owner example.invalid + cleanup UID/rate-limit
fixture, serta revoke sementara tepat owner CMS grant + restore. Izin bersyarat
**setelah owner read-only PASS**; fixture belum dijalankan. Tidak ada content
write/hook/Team mutation/recruitment user atau allowlist change. SQL C3 sudah
applied sekali; jangan reapply. NEXT: QA + commit fix, minta izin exact SHA baru,
dua READY, lanjut real read/media/refresh/logout/denials dan recruitment isolation.
Expired-session dan E5 content mutation masih pending; fixture E5 belum disetujui.
Proof ignored `artifacts/cms-auth/e-{deployments-e08a604,public-before,public-after,browser}.json`
dan `readfix-local-rpc.json`. Keenam content Supabase buildRPC + full GAS export
validation/env tetap; GAS removal pass terpisah. Seluruh CMS belum selesai.

## 14. 7e17fc0 deployment and partial real-owner proof

Faiz mengizinkan push fix (`gas`); satu `git push origin main` mengirim
`7e17fc05d3ce421eacc5511c57c515a6b1b8aa95` ke kedua repo. Refs main/origin/main/
production/main sinkron. Izin SHA ini consumed; push berikutnya termasuk docs
memerlukan izin baru. Testing primary alias READY exact SHA, provider timestamp
**7 Oct 2026 16:47:54.100 UTC / 23:47:54.100 WIB**. Production terakhir tercatat
BUILDING via API; sesudah environment berubah, terminal Management API terkena
DNS EAI_AGAIN/network restriction. **Production READY exact SHA/alias belum
terkonfirmasi ulang via API**, walaupun callback fixed sudah terbaca di primary.

Browser terhubung restart; owner mengisi credential sendiri lagi. Real owner
Projects **200/4 record**, Team **200/25**, explicit refresh **200** dan after-
refresh read **200** kedua domain. Reload editor + Projects/Team **390/1440**:
4/25 pilihan, workspace tampil, tanpa overflow. Anonymous Projects/Team/media
**401** kedua domain. Public **19/19 HTML exact** pre/post per situs, recruitment
**accepting:false**, callback retired mengikuti redirect ke `/admin/?login=failed`
HTTP200 (tidak lagi500). Tidak ada save/edit/upload/hook/content mutation.

**Batas bukti:** record aktif tidak merujuk media privat; path upload GAS historis
mengembalikan404, sehingga preview private media belum PASS. Explicit refresh
bukan bukti natural access expiry. Recruitment login/stats **200 kedua situs**
setelah owner login manual.
CMS logout **200** → Projects/Team/media **401**, CMS refresh **401**; recruitment
masih **200**, recruitment refresh **200** dan read sesudahnya **200** kedua situs.
Expired-session dan approved non-owner/revocation+cleanup masih pending. Fixture
script disiapkan ignored tetapi **belum dijalankan**; Management
API tidak tersedia dan owner read-only matrix belum lengkap untuk private media.
E5 content fixture belum disetujui. SQL auth tidak diapply ulang; grant/recruitment
users/allowlist tidak diubah. Auth belum LIVE accepted; seluruh CMS belum selesai.

Proof ignored: `e-deployments-7e17fc0.json` (last API state),
`e-owner-7e17fc0.json` (sanitized browser read/UI/refresh/anon/public proof).
NEXT: production READY exact SHA proof; restore Management API access untuk
fixture denial yang sudah approved; pilih private media fixture + cleanup
dengan izin E5 konkret.
GAS export validation/env/legacy credentials tetap; GAS removal pass terpisah.
Checkpoint ini belum commit/push; environment terbaru membatasi `.git` read-only.

## 15. Fresh automated owner acceptance — 8 Oct 2026

Faiz memberi izin eksplisit agent memakai credential sementara untuk testing
login; credential tidak dicatat ke docs/artifacts/commit. Runtime tetap7e17fc0.
Fresh browser contexts kedua domain: password login **200**, Projects **200/4**,
Team **200/25**; explicit refresh **200**, CSRF stabil dan post-refresh read200.
Bad CSRF403, GET refresh405, empty login body400; owner read tetap200.

Isolasi actual dua arah PASS: CMS-only → recruitment401; recruitment-only →
Projects/Team/media401. Invalid sealed CMS cookie → Projects/Team401 dan
recruitment tetap200. Sesi gabungan: CMS logout200 → Projects/Team/media401,
recruitment stats200, refresh200 dan post-refresh stats200 kedua situs.
Recruitment accepting:false. Semua sesi browser pengujian kemudian logout;
recruitment own logout → stats401. Tidak ada content write/upload/hook/SQL/grant
mutation. Read recruitment menjalankan audit handler existing, tanpa mengambil
atau mencetak application PII. Proof ignored `e-fresh-auth-20261008.json`.

E4 isolation/closed/public regression selesai; E3 masih parsial (positive private
media, natural expiry, approved non-owner/revocation fixture). Terminal API tetap
EAI_AGAIN dan `.git` read-only; production READY exact SHA confirmation/fixture
cleanup/commit tetap blocked oleh akses environment. E5 fixture konkret disiapkan
di execution plan §16, belum dieksekusi. Auth belum LIVE accepted penuh.

## 16. Concrete E5 fixture proposal (belum dieksekusi)

Run-id baru per eksekusi. Scope shared Projects/Storage saja, bukan Team.
Prerequisite: Management API read/write dan cleanup tersedia, dua primary alias
READY exact feature SHA, current baseline ditangkap, fixture konkret disetujui.

1. Tangkap baseline Projects fields/order + Team fingerprint + public19HTML
   per situs. Verifikasi min1/max8 dan current4; simpan data sensitif in-memory.
2. Upload tepat1 PNG32×32 sintetis unik (<2MB) via owner media API Projects.
   Path hash dari respons adalah satu-satunya object fixture; cek hash tidak
   existing sebelum upload/cleanup. Tidak merujuk foto/nama anggota.
3. Read private media200/decode kedua domain ×390/1440; credentials omit401.
   Buktikan read-only media sebelum menjalankan approved denial fixtures.
4. Add tepat1 Projects fixture dengan title `Uji CMS Auth <run-id>`, tags
   `QA`/`Temporary`, description `Temporary CMS acceptance fixture <run-id>`,
   image=path tadi, fresh revision. UID dibuat server, simpan affectedId.
5. Save hanya fixture itu (description tambah `verified`), fresh revision.
   Verifikasi dua publication hooks accepted, dua rebuild READY dan fixture
   tampil kedua situs. Setiap error → GET inspect actual state, tanpa blindretry.
6. Delete hanya fixture UID, fresh revision; tunggu dua rebuild READY dan
   baseline empat Projects fields/order kembali exact. Team unchanged.
7. Delete hanya Storage object hash fixture setelah memastikan tidak direferensi
   collection manapun. Verify object absent dan baseline public19HTML restored.
   Revision/state timestamp boleh berubah sebagai konsekuensi mutation normal;
   tidak menyebut state DB byte-identik. Tidak reset/reseed/overwrite snapshot.

Add/save/delete dapat memicu **3×2 deployment hooks**. Bila cleanup gagal, stop
mutations, inspect state dan laporkan fixture UID/object yang masih ada; jangan
hapus object/grant/user di luar fixture. Persetujuan login otomatis tidak sendiri
mengubah gate fixture konkret yang diminta Faiz di E5 kickoff.

## 17. Access restored and missing Storage prerequisite

Full access kembali aktif 8 Oct 2026; `.git` writable dan Management API bekerja.
Dua primary aliases **READY exact7e17fc0** confirmed API: testing provider timestamp
7 Oct16:47:54.100 UTC/23:47:54.100 WIB; production16:49:24.662 UTC/23:49:24.662 WIB.
Cek live: satu CMS owner grant aktif, satu recruitment allowlist aktif/fingerprint
unchanged, applications0. CMS auth/recruitment focused43PASS; catalog table ACL +
6 actual table-read denials PASS. Tidak apply ulang auth migration.

Faiz mengizinkan **fixture E5 + cleanup** eksplisit: satu PNG32×32 + satu Projects
fixture, edit/delete fixture, publikasi3×2 hooks, tanpa Team write. Baseline4
Projects + Team fingerprint ditangkap. Upload pertama502; read-only inspect
menemukan **bucket cms-media tidak ada** (catalog0buckets/0objects; Storage API
Bucket not found). Tidak blindretry; tidak ada object/Projects fixture tersimpan.
Storage existing3Team policies hanya service_role. Proposed prerequisite bucket:
private/public=false, max262144bytes, allowed MIMEimage/webp; provisioning izin
konkret pending terpisah dari E5. Script create disiapkan, belum dijalankan.

Sesi khusus expiry alami dimulai: cookie hanya process memory, tanpa refresh
sebelum3690detik; Auth actual jwt_exp3600. Due workspace UTC18:24:42.845 tanggal
7Oct / WIB01:24:42.845 tanggal8Oct. Hasil **pending**, jangan klaim PASS dari explicit
refresh. Setelah private media PASS, jalankan approved non-owner/revocation
fixtures. GAS tetap; auth belum LIVE accepted penuh. Proof ignored: e-resume-audit,
e-storage-inspect,e-fixture-baseline,e-natural-expiry,e-deployments-7e17fc0.
