# CMS / Admin Dashboard — Rencana (backend Google Apps Script)

**Update aktif 6 Oct 2026:** native `/admin` owner login dan Projects Growth
add/delete nyata terbukti. Project sementara tampil setelah rebuild kedua situs,
lalu dihapus; kedua deployment SUCCESS, empat judul baseline tetap tampil.
Login route kedua domain mengarah ke Google. Uji akun non-owner nyata dan login
owner terpisah di kedua domain belum dibuktikan. Ikuti
[native plan](cms-native-admin-plan.md) dan
[setup/acceptance](cms-native-admin-setup.md) sebelum media/Team.
GAS/Sheet/Drive existing tetap; tanpa perubahan geometri atau collection lain.

Status: implementasi + QA PASS; owner add/delete + kedua rebuild PASS.
NEXT: acceptance non-owner. Seluruh CMS belum selesai; konfirmasi sebelum push baru.
SOP operasional: [cms-sop.md](cms-sop.md).

## 0. Keputusan yang sudah disetujui

| Pertanyaan             | Keputusan user                                              |
| ---------------------- | ----------------------------------------------------------- |
| Backend                | **Google Apps Script (GAS) + Google Sheets + Google Drive** |
| Update konten ke situs | **Build-time fetch + rebuild hook** (bukan runtime fetch)   |
| Admin dashboard        | **Halaman admin custom yang di-host GAS** (`HtmlService`)   |
| Jumlah admin           | **1–2 admin, full akses**                                   |
| Draft/preview          | **Tidak — save = live** (via rebuild otomatis)              |

Prinsip: **konten boleh berubah; geometri/desain tidak.** CMS hanya mengedit
**isi** (teks/gambar/link) dan penambahan record melalui template desain
terdaftar. Ukuran kartu, font, spacing, rim/glow dan koordinat desain tetap lokal.
Jumlah slot B0/B1 adalah guard migrasi sementara; dukungan penambahan record
menjadi work order B2/B3 per collection. Pertahankan assertion geometri existing
serta fixture baseline; uji jumlah baru dalam fixture tambahan.

## 1. Arsitektur

```text
Editor browser → GAS Admin privat /exec (HtmlService, Google login)
              → google.script.run RPC (auth owner pada setiap request)
              → Sheets (write tervalidasi) → POST dua Vercel Deploy Hooks
Vercel prebuild → GAS Export publik /exec (read-only, token)
               → Sheets (enam collections) → Zod → snapshot atomik → Astro HTML
Drive privat   → folder media tersedia; upload/cache belum diimplementasikan
```

- **Dua project GAS:** Export `doGet` untuk export/list bertoken, `doPost`
  menolak mutation. Admin `doGet` menyajikan editor; write lewat RPC terautentikasi.
  Tidak ada endpoint JSON anonymous untuk save/delete.
- **Project/deployment terpisah**: endpoint export untuk Vercel menjalankan GAS sebagai
  owner dan menerima request tanpa login Google, tetapi setiap export/list wajib
  memakai token. Endpoint ini hanya membaca data; token export tidak memberi
  akses save/delete/upload.
- **Auth admin**: deployment dashboard pertama menjalankan GAS sebagai owner
  dengan akses "only myself". Setiap mutation tetap memeriksa admin pada server
  dan menolak identitas kosong. Penambahan admin Gmail kedua perlu konfigurasi
  identitas dan akses Sheet/Drive yang diuji; jangan menganggap "only myself"
  mendukung dua akun. Acuan:
  [GAS deployment](https://developers.google.com/apps-script/guides/web) dan
  [Session identity](https://developers.google.com/apps-script/reference/base/session).
- **Gambar (pass berikutnya):** upload ke Drive privat, lalu validasi dan cache/bake
  bytes saat build. Jangan bergantung hotlink Drive. Artwork `assets:*` tetap manual.
- **Save = live**: GAS memanggil 2 **Vercel Deploy Hook** (testing +
  production). Site rebuild ~1–2 menit, lalu konten live. Bukan runtime fetch,
  jadi HTML tetap berisi konten (SEO + pixel aman).

## 2. Skema Google Sheet (satu tab per collection)

Baris 1 = header; tiap baris berikutnya = 1 record; array/objek disimpan
sebagai **string JSON** (divalidasi Zod di build).

| Tab          | Kolom B1                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------- |
| `projects`   | id, title, tags (JSON[]), description, image                                                  |
| `team`       | id, group, groupTitle, name, role, photo, order                                               |
| `roles`      | id, title, tagline, chips (JSON[]), deadline, about, requirements (JSON[]), contact, whatsapp |
| `hods`       | id, title, description, tabs (JSON[])                                                         |
| `domains`    | id, title, description, labels (JSON[][])                                                     |
| `partners`   | id, type (`category`/`logo`/`why`), order, label, image, title, description                   |
| `milestones` | id, year, title, description, image — reserved, empty                                         |
| `settings`   | key, value — reserved, empty                                                                  |

Semua sel data B1 plain text; nested fields JSON. Team members punya stable ID
untuk admin, tetapi loader tetap mengekspor bentuk existing. Partners B1 masih
kategori/logo bersama/Why copy; per-organisasi disiapkan pada B3. Installer
hanya mengisi tab kosong dan tidak menimpa record editor saat dijalankan ulang.

> **Jangan diekspos ke editor (geometri/desain):** `domains.rows`
> (x/y/gap/labels = posisi tag dihitung manual), `roles.centered`/`tight`,
> `team.chip`/`fade`, `hods` urutan tab & `color`. Ini nilai desain — bukan
> konten. Kalau perlu diedit, batasi hanya `labels`/teks.

## 3. Integrasi Astro (rendah risiko)

Tujuan: **komponen/halaman tidak berubah API-nya** (import tetap
`from '../data/projects'`), supaya tidak menyentuh tampilan/geometri.

- `scripts/fetch-cms.mjs`:
  - Bila `CMS_API_URL` + `CMS_API_TOKEN` ada → fetch `?action=export`, validasi
    Zod, tulis `src/data/cms-snapshot.json`.
  - Bila tidak (dev lokal) → pakai snapshot yang di-commit (deterministik untuk
    `verify.mjs`).
- `src/data/projects.ts`, `team.ts`, `roles.ts`, `hods.ts`, `domains.ts`,
  `partners.ts` menjadi **thin loader**: impor `cms-snapshot.json`, ekspor
  konstanta bertipe sama seperti sekarang. Semua komponen & `getStaticPaths`
  tetap bekerja tanpa perubahan.
- Hooks build: `"prebuild": "node scripts/fetch-cms.mjs"`. Lokal tanpa env memakai
  snapshot yang di-commit. Saat remote dikonfigurasi (B1), gagal fetch/validasi
  harus menggagalkan build agar data lama tidak diterbitkan sebagai update baru.
- (Opsional nanti) pindah ke **Astro Content Collections + Zod** bila mau
  `getCollection`; bukan syarat.

## 4. Fase (satu langkah per pass + 7 gate)

- **Fase B0 — SELESAI.** `cms-snapshot.json` (data existing), enam thin loader,
  `fetch-cms.mjs` (fallback lokal) + skema Zod via `astro/zod`. **19 HTML dan
  semua ekspor data identik baseline.** Enam pass, 7 gate + SEO tiap pass.
  Rencana/hasil: `docs/cms-b0-plan.md`.
- **Fase B1 — SELESAI, GAS read + export.** Installer `cms/gas/export.js` membuat Sheet
  dengan 8 collection tabs, folder Drive privat, seed snapshot, token dan
  konfigurasi Script Properties; `doGet` export/list read-only. Generator
  `npm run cms:gas` menulis `artifacts/cms-gas/Code.gs`. Remote build fetch
  memvalidasi payload lalu mengganti snapshot atomik. Pemasangan Google dan
  env Vercel membutuhkan sesi owner; verifikasi real export + build kedua
  project; langkah pemasangan tersebut sudah selesai. Rencana/riwayat: `docs/cms-b1-plan.md`.
- **Fase B2 — SEBAGIAN SELESAI, Admin page (HtmlService).** Login Google (1–2 akun), form CRUD
  untuk `projects` & `team` dulu, upload gambar ke Drive, tombol save →
  panggil Deploy Hook. Editor existing Projects sudah terpasang; Growth, media
  dan Team masih work order terpisah. 1fb25ae sudah push, kedua Vercel SUCCESS. NEXT: update GAS dan owner test Growth; `cms-projects-growth-plan.md`.
- **Fase B3 — Collection lain.** `roles`, `partners`, lalu `hods`/`domains`
  (field aman saja), `milestones`, `settings`.
- **Fase B4 — Hardening.** Validasi input, error handling, backup Sheet,
  media library, guard jumlah slot.

## 5. Jebakan (WAJIB)

1. **Geometri = desain, bukan konten** (§2) — jangan ekspos field desain.
2. **`verify.mjs` mengunci beberapa jumlah** (mis. `projects` = 4, Featured = 8,
   kartu partner). CMS membuat konten dinamis → **assertion konten yang boleh
   dinamis dilonggarkan khusus**, jangan longgarkan assertion geometri.
3. **Konten baru = MAE naik** terhadap reference PNG lama (reference
   merefleksikan konten lama). Ini wajar; yang dijaga adalah **geometri**.
4. **Drive bukan CDN.** Hotlink `drive.google.com/uc`/`lh3` bisa lambat/diblokir;
   cache via rewrite/proxy atau pertimbangkan Vercel Blob kalau berat. Artwork
   pixel-exact tetap dibake manual.
5. **Secret jangan di repo.** `EXPORT_TOKEN`, URL Deploy Hook, `DRIVE_FOLDER_ID`,
   email admin → **GAS Script Properties**; `CMS_API_URL/TOKEN` → Vercel env.
6. **OAuth/Google**: deployment admin memakai Google login dan pemeriksaan admin
   pada setiap mutation. Deployment export perlu akses tanpa login untuk Vercel,
   dengan token read-only; jangan menerapkan akses anonymous ke mutation.
7. **Deploy ganda** (testing + production): save memicu **dua** Deploy Hook.
8. **`team.ts` `photo` masih union** → ubah ke path bebas saat migrasi.
9. **Build deterministik**: `verify.mjs`/audit jalan lokal tanpa env → wajib
   fallback snapshot (bukan fetch).

## 6. Kebutuhan user — sudah dipenuhi, jangan ulang onboarding

1. Satu akun owner/admin dipilih; identitas hanya di Properties/env privat.
2. Folder Drive privat dan Sheet dibuat otomatis saat setup GAS, sudah tersedia.
3. Dua Deploy Hook berbeda project sudah dibuat, dikonfigurasi di admin dan diuji
   HTTP 201. Save owner sudah meminta rebuild testing dan production.
4. B0 disetujui dan selesai; B1 terpasang; admin Projects existing terpasang.

Browser tools tidak memiliki sesi login user. Untuk update GAS berikutnya,
pandu user mengganti source dan membuat versi baru pada deployment existing.
Jangan meminta password/token melalui dokumen, membuat Sheet/folder ulang atau
menjalankan seed ulang. Referensi: `cms-admin-setup.md`, `cms-gas-setup.md`.

## 7. Langkah pertama AI baru

1. Ikuti urutan baca di `cms-kickoff.md`; periksa `git status`.
2. Bila ada perubahan asing, tanyakan sebelum mengubahnya; jangan auto commit/push.
3. Ringkas checkpoint dan NEXT. Setup awal selesai, tidak perlu menunggu §6 lagi.
4. Kerjakan **Projects Growth** sesuai `cms-projects-growth-plan.md`, satu
   collection/pass. Preserve baseline, tambahkan fixture growth, 7 gate + SEO.
5. Commit per fitur; pandu update GAS existing setelah hasil konkret hijau.
   Ikuti konteks izin push; sekali push origin main deploy kedua situs.

## Kontrak payload B0

`src/data/cms-schema.mjs` adalah kontrak JSON build; bentuk Sheet perlu dipetakan
ke kontrak ini pada B1. Snapshot hanya berisi enam collection yang sudah memiliki
module data. `team` berisi leader dan grup HoDS; `domains.labels` adalah matriks
teks chip; panel HoDS menyimpan title/text/bullets. Layout, tint, coordinates,
jenis/urutan panel dan artwork baked tetap di module TypeScript.

API Partners masih memakai kategori dan satu logo bersama; logo per organisasi,
Featured achievements, milestones dan settings diekstrak di B3. Foto team B0
masih memakai dua selector artwork existing; path foto upload diperluas bersama
renderer di B2 agar referensi lama tetap persis.

## Penambahan record (keputusan user setelah B0)

Editor perlu bisa menambah anggota, kartu, Available Roles dan HoDS dengan
komponen desain konsisten. B2/B3 harus mengubah guard jumlah hanya setelah
renderer collection terkait mendukung jumlah dinamis. Gunakan preset desain
terdaftar untuk record baru; penambahan HoDS dengan artwork baru membutuhkan
aset baked. CSS, koordinat, gradient, font dan spacing tidak menjadi field CMS.
Rencana dan kriteria fixture tambahan: `docs/cms-b1-plan.md`.

## Verifikasi saat handoff

Fix fetch `96a9756` memiliki status Vercel SUCCESS untuk testing dan production.
14 CMS tests, admin browser, 7 gate + SEO PASS (responsive 468/468).
Owner load empat Projects dan save tanpa perubahan isi dikonfirmasi. Anonymous
admin request diarahkan Google login. Masih perlu uji akun non-owner yang sudah
login dan perubahan isi nyata; testing literal remote-mode log belum disalin.
Penyebab Google/cache 404 lama tidak terbukti. Detail bukti: `ai-handoff.md`.
