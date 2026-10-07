# SOP CMS — Data Sorcerers

## Checkpoint aktif — Hods LIVE, NEXT Partners

Kode live **`763bafc`**, dipush ke testing + production dengan izin Faiz pada
7 Oct 2026. Saat push main/origin/main/production/main sinkron pada SHA ini;
checkpoint LIVE sesudahnya disimpan dalam commit lokal terpisah, belum push.
Kedua domain publik terverifikasi assigned ke deployment SHA baru, **READY**:

- testing: **12:53:12.956 UTC / 19:53:12.956 WIB**;
- production: **12:55:00.507 UTC / 19:55:00.507 WIB**.

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

NEXT: **pass 6 Partners**, plan tersendiri sebelum implementasi; sesudahnya auth
CMS terakhir. Seluruh CMS belum selesai; GAS belum boleh dihapus. Izin push
`763bafc` sudah digunakan: **konfirmasi sebelum push baru**, termasuk checkpoint
docs lokal. [Hods plan](cms-pass5-hods-plan.md), [TODO](cms-migration-todo.md), [kickoff](cms-migration-kickoff.md).

## Checkpoint sebelumnya — Domains LIVE, NEXT Hods

Domains pass 4 A–E selesai pada `6b36519`, kedua Vercel READY/SUCCESS, acceptance
Home/Recruitment/routing × 390/1440 PASS, admin anonymous 401, recruitment closed.
Testing READY 7 Oct 12:02:26.550 UTC, production 12:04:06.630 UTC.
Projects/Team/Roles/Domains read RPC anon; Hods/Partners full GAS export.
Full GAS validation tetap dependency sebelum overrides; preserve tabs/env.
SQL private Domains + RLS/deny + anon RPC verified; tidak ada editor/write API.
Empat Supabase + dua GAS env keys kedua Vercel Production verified. Missing
SUPABASE_ACCESS_TOKEN di kedua project dilengkapi encrypted sebelum push.

QA lokal CMS 56 PASS/10 live Team SKIP, recruitment 24 PASS, PostgreSQL nyata,
7 gate + SEO, tiga admin mock empat width, snapshot/19 HTML identik.
Suite penuh tanpa env server, jangan mutation/reseed Team (drift preexisting).
Cold-cache private media dan partial GAS validation scope terpisah.
Auth CMS tetap OAuth custom; mekanisme final pending dan auth terakhir.
NEXT [pass 5 Hods plan](cms-pass5-hods-plan.md) rinci sudah siap, **PLAN ONLY**;
belum SQL/kode/apply/deploy Hods. 6 ID/21 tabs/55 sections/8 bullet items. [TODO](cms-migration-todo.md),
[Domains plan](cms-pass4-domains-plan.md), [kickoff](cms-migration-kickoff.md).
Izin push `6b36519` sudah digunakan; checkpoint docs lokal memerlukan izin baru.

## B2 Team — pass lokal 6 Oct 2026

Master Work Plan: [Team plan](cms-team-plan.md); update/acceptance:
[Team setup](cms-team-setup.md). Team native `/admin/team/` dan owner RPC
CRUD/foto memakai GAS/Sheet/Drive/hooks EXISTING. Grup preset, chip/fade, frame,
Growth Join Now dan geometri baseline tetap lokal. Policy1–8 anggota/grup,
UUID server, revision guard seluruh Team, posisi sisip, batch+trailing blanks.
Foto hash/cache namespace Team, tanpa hotlink atau stale fallback.

Implementasi/QA lokal PASS: 36 CMS tests Node22, Team admin4widths, 112 group
fixtures, regresi native/legacy Projects4widths, tujuh gate + SEO (responsive
468/468). Team baseline1440×1562/card302×400, MAE2.624; snapshot byte-identik,
assertion geometri tetap. Feature 2a22d8a sudah push dengan izin user ke kedua
repo, main/origin/main/production/main sinkron. Vercel testing SUCCESS22:04:31 WIB
dan production SUCCESS22:05:50 WIB. Belum update GAS Team,
belum real owner Team acceptance. Projects Growth/media live + cleanup selesai.
Username/password ditunda, seluruh CMS belum selesai. NEXT: owner update versi Export/Admin existing tanpa setup/reseed,
uji Team nyata dan dua rebuild/cleanup; B3/B4 sesudah acceptance Team.

**Update aktif 6 Oct 2026:** native `/admin` owner login dan Projects Growth
add/delete nyata terbukti. Kedua rebuild untuk add dan delete terverifikasi;
setelah delete empat judul baseline tetap tampil. Login route kedua domain
mengarah ke Google. Owner melaporkan akun non-owner Incognito ditolak. Ikuti
[native plan](cms-native-admin-plan.md) dan
[setup/acceptance](cms-native-admin-setup.md) sebelum media/Team.
GAS/Sheet/Drive existing tetap; konfirmasi sebelum push baru.

Status operasional 6 Oct 2026: lihat `docs/ai-handoff.md`. Work order berikutnya:
Team, satu collection/pass + tujuh gate + SEO. Projects Growth/media dan cleanup
“uji cms” selesai; export empat baseline, kedua rebuild SUCCESS. Bukti di
`docs/cms-projects-media-setup.md`. SOP ini melengkapi SOP piksel, bukan mengganti
aturan presisi situs. B0/B1 dan editor Projects awal sudah dipasang; jangan
mengulang setup awal atau mengganti backend tanpa instruksi user.

## 1. Batas arsitektur dan otorisasi

- Astro tetap static. Fetch saat build → validasi Zod → snapshot → thin loaders.
- GAS **CMS Export**: execute as owner, akses Anyone, token read-only, tanpa
  fungsi mutation admin. Jangan tambahkan CRUD ke project publik ini.
- GAS **CMS Admin**: project terpisah, execute as owner, akses Only myself,
  allowlist + identitas nonkosong diperiksa server pada setiap RPC.
- Saat ini satu owner/admin. Akun kedua belum didukung deployment Only myself;
  menambahkan allowlist saja tidak cukup. Uji identitas, izin Sheet/Drive dan
  pembatasan akses sebelum menambah admin kedua.
- Save menulis data lalu meminta dua rebuild. Pesan “Penerbitan dimulai” berarti
  permintaan diterima, bukan kedua build selesai. Periksa deployment terbaru,
  commit, timestamp dan log; status sukses lama bukan bukti build baru berhasil.
- User telah mengizinkan commit/push kelanjutan CMS. Pertahankan scope izin;
  aturan umum konfirmasi sebelum push tetap berlaku bila izin belum ada.

## 2. Secret dan akses akun

Konfigurasi live sudah ada; jangan meminta ulang akun, folder, token atau hook
untuk orientasi. Jangan mencetak `.env.local`, Git credentials, process.env,
Script Properties, URL token, redirect keys atau body error mentah.

| Tempat                       | Properti / variabel                                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Export GAS Script Properties | OWNER_EMAIL, ADMIN_EMAILS, SPREADSHEET_ID, DRIVE_FOLDER_ID, EXPORT_TOKEN, CMS_SCHEMA_VERSION                                 |
| Admin GAS Script Properties  | OWNER_EMAIL, ADMIN_EMAILS, SPREADSHEET_ID, DRIVE_FOLDER_ID, DEPLOY_HOOK_TESTING, DEPLOY_HOOK_PRODUCTION, PUBLICATION_PENDING |
| Kedua Vercel project         | CMS_API_URL, CMS_API_TOKEN, environment Production untuk branch main                                                         |
| `.env.local` (ignored)       | CMS_API_URL, CMS_API_TOKEN, CMS_DEPLOY_HOOK_TESTING, CMS_DEPLOY_HOOK_PRODUCTION                                              |

Hook env lokal berawalan CMS_; property admin berawalan DEPLOY_HOOK_. File
lokal tidak menjamin secret terbawa ke workspace baru. Bila file hilang, minta
user memasukkan konfigurasi melalui mekanisme privat, bukan chat/repo. Owner
email, ID Sheet/folder dan URL admin live tetap di luar repo.

Browser automation dan browser user memakai sesi berbeda. Jangan menganggap
login Google/Vercel user tersedia di tool. Siapkan file dan tes lokal dulu;
pandu langkah instalasi akun satu tahap per pesan, tanpa meminta password.

## 3. Protokol satu pass

1. `git status` dahulu. Identifikasi perubahan user; jangan menimpa/reset.
2. Baca state, master plan CMS, SOP piksel, dan plan collection berikutnya.
3. Tulis Master Work Plan satu collection/langkah sebelum kode. Situs memakai
   node/reference Figma existing. Dashboard custom belum punya node Figma:
   tulis fakta itu dan token/layout/test criteria, jangan mengarang node/PNG.
4. Siapkan renderer dan kontrak sebelum mengaktifkan add/delete pada collection.
   Jangan longgarkan count semua collection sekaligus atau assertion geometri.
5. Validasi di server dan build; stable IDs, header Sheet, revision check,
   formula-safe cells, error tersanitasi. Lock admin tidak mengunci project
   Export terpisah; write dalam satu batch untuk mengurangi pembacaan parsial.
6. Jika publication gagal setelah write, laporkan data tersimpan + kegagalan
   publikasi. Retry publication tidak mengulang mutation. Stale revision harus
   ditolak, bukan menimpa perubahan lain.
7. Jalankan tujuh gate situs + SEO tiap pass, CMS tests dan browser admin jika
   relevan; lock pass sebelum collection berikutnya. Simpan bukti ignored.
8. Commit fitur + docs. Sesi Growth 6 Oct: konfirmasi user sebelum push. Deploy dua repo sesuai izin. Perubahan source GAS di
   repo tidak otomatis memperbarui project/deployment GAS live milik user.
9. Hanya bila source GAS berubah: generate installer baru, pandu owner
   mengganti file/version deployment dan verifikasi real login/save/rebuild.
   Pass Domains tidak mengubah GAS, jadi tidak menjalankan langkah installer.
   Jangan reseed Sheet atau membuat folder baru saat update.

## 4. Presisi konten dinamis

Heading Bluu Next Bold 700, body Manrope; spacing 8pt; reduce pixel-exact;
pertahankan template kartu, rim/glow, geometri ±1px dan breakpoint.
`domains.rows`, `roles.centered/tight`, `team.chip/fade`, warna dan art HoDS
adalah metadata desain lokal, bukan field CMS.

Tetap jalankan baseline `verify.mjs` dengan snapshot baseline. Tambahkan fixture
pertumbuhan terpisah (minimum/sedikit/lebih banyak/batas praktis), carousel,
keyboard, dots, scroll dan overflow desktop/mobile. Tidak perlu melonggarkan
assertion baseline hanya agar data fixture baru lolos. Perubahan copy bisa
menaikkan MAE terhadap PNG lama; geometri tetap wajib terukur. Upload foto boleh,
artwork Figma tetap dibake manual. Drive bukan CDN; sediakan pipeline cache/bake
foto sebelum mengaktifkan upload, bukan hotlink tanpa verifikasi.

## 5. Commands / bukti

```sh
npm run test:cms
npm run cms:gas
npm run cms:admin
npm run verify:cms-admin
npm run build
python3 -m http.server 4331 --directory dist
```

Server static dijalankan di terminal/session sendiri. Di terminal lain:

```sh
PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4331 npm run audit:navbar
PREVIEW_URL=http://localhost:4331 npm run verify:vt
PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs
npm run audit:spacing
node scripts/spacing-audit.mjs cms/gas/admin/Index.html
npm run format:check
npm run seo:audit
```

Tujuh gate: build, visual verify, navbar, View Transitions, responsive, spacing,
format; SEO tambahan wajib. Mock RPC browser test bukan bukti auth Google live.
Jangan bergantung pada runner/baseline `/tmp` dari sesi lama; file/server bisa
hilang. Generate ulang artifacts bila perlu. `.env.local` tidak otomatis masuk
proses npm prebuild. Untuk fetch nyata gunakan:

```sh
node --env-file=.env.local scripts/fetch-cms.mjs
```

Fetch ini menulis snapshot; bandingkan terhadap baseline dan lindungi/restorasi
perubahan sendiri bila menjalankan eksperimen. Jangan mereset konten user.

## 6. Jebakan fetch yang sudah diperbaiki

Kode teruji/deployed: `96a9756`. IPv4-first di prebuild; batas 60 detik per
attempt; maksimum dua attempt total untuk timeout atau 404 yang terjadi setelah
redirect ke script.googleusercontent.com. Tiap attempt dimulai di endpoint
export dengan nonce baru, no-store/no-cache. 404 endpoint awal, auth/JSON/schema,
HTML, host redirect terlarang atau size >1 MiB tetap gagal tanpa fallback stale.

Log Vercel pernah membuktikan 404 pada redirect dengan fingerprint endpoint
cocok lokal. Dua build terakhir berhasil setelah repair. Penyebab internal
Google/cache tidak terbukti; jangan menyatakan root cause sudah pasti diketahui.
Jangan mencabut safeguards/retry yang sudah diuji. Jika berulang, cari log build
terbaru (host/hop/durasi/fingerprint), bukan menambah retry tanpa batas.

## 7. Projects Growth policy

Projects menerima 1–8 records; delete terakhir dan add kesembilan ditolak.
ID baru UUID dari server, bukan judul atau input client. Delete konfirmasi judul;
konflik tidak mengubah Sheet atau meminta hook. Add/delete/save membangun dan
memvalidasi candidate final, kemudian satu setValues mencakup records dan blank
trailing rows. Export existing mengabaikan blank rows; tidak memerlukan update.
Gambar deployed sebelumnya preset existing. Pass media lokal menerima preset
atau reference hash WebP terverifikasi di Drive folder existing; native upload
owner-only dan build cache lokal. cd37446 sudah push, kedua Vercel SUCCESS. Belum update GAS media atau live upload
acceptance; lihat cms-projects-media-plan.md dan cms-projects-media-setup.md.

`npm run verify:cms-growth` membangun snapshot fixture sementara 1/2/5/8,
menggunakan static server sendiri lalu memulihkan snapshot dan build baseline
pada finally. Jangan menjalankan build/fetch/site gates lain bersamaan dengan
runner ini karena dist/snapshot dipakai sementara. Bukti di artifacts/cms-growth/.

## 8. Projects media policy — implementasi lokal

Native `/api/admin/media` memerlukan owner session; POST juga Origin + CSRF.
Input <=2 MB JPEG/PNG/WebP, decode max16 MP, animasi/SVG/HTML ditolak. Server
normalisasi sharp existing ke WebP <=256 KiB, hash sebagai reference lokal.
GAS memeriksa owner, hash, signature, batas byte dan folder existing; upload
terpisah dari Sheet save/hooks. Export action media bertoken hanya membaca
referensi Projects aktif. Browser tidak mendapat token export atau ID Drive.
Cache diperiksa hash/decode; missing/corrupt refetch bounded. Kegagalan media
menggagalkan build sebelum snapshot baru. Tidak memakai stale media fallback.

`npm run verify:cms-media` memakai fixture HTTP di static dist, tidak mengubah
snapshot atau reference geometry. Sharp berjalan server/build, tidak di browser.
Generated CMS source sekarang menyertakan cms/gas/media.js pada kedua project.
Update existing deployment diperlukan; jangan menjalankan setupCms/setupAdmin.
