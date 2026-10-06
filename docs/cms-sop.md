# SOP CMS — Data Sorcerers

**Update aktif 6 Oct 2026:** native `/admin` owner login dan Projects Growth
add/delete nyata terbukti. Kedua rebuild untuk add dan delete terverifikasi;
setelah delete empat judul baseline tetap tampil. Login route kedua domain
mengarah ke Google. Owner melaporkan akun non-owner Incognito ditolak. Ikuti
[native plan](cms-native-admin-plan.md) dan
[setup/acceptance](cms-native-admin-setup.md) sebelum media/Team.
GAS/Sheet/Drive existing tetap; konfirmasi sebelum push baru.

Status operasional 6 Oct 2026: lihat `docs/ai-handoff.md`. Work order berikutnya:
`docs/cms-projects-growth-plan.md`. SOP ini melengkapi SOP piksel, bukan mengganti
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
9. Generate installer baru, pandu owner mengganti file dan membuat version
   deployment baru bila GAS berubah, lalu verifikasi real login/save/rebuild.
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
Gambar masih preset existing; upload/cache adalah pass terpisah.

`npm run verify:cms-growth` membangun snapshot fixture sementara 1/2/5/8,
menggunakan static server sendiri lalu memulihkan snapshot dan build baseline
pada finally. Jangan menjalankan build/fetch/site gates lain bersamaan dengan
runner ini karena dist/snapshot dipakai sementara. Bukti di artifacts/cms-growth/.
