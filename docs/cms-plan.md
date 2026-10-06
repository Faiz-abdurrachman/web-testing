# CMS / Admin Dashboard — Rencana (backend Google Apps Script)

Status: **B0 SELESAI · B1 PRODUCTION LIVE, TESTING LOG PENDING** · diputuskan 6 Oct 2026 ·
Patuhi `docs/pixel-precision-sop.md` + `AGENTS.md`. **Satu langkah per pass + 7
gate.** Jangan rusak benchmark (geometri/MAE) atau assertion `verify.mjs`.

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

```
┌─────────────────────────┐        ┌──────────────────────────────┐
│  Google Sheets (DB)     │        │  Admin (browser)             │
│  tabs: projects, team,  │◀──────▶│  {GAS /exec} — Google login  │
│  roles, hods, domains,  │  GAS   │  form CRUD + upload gambar    │
│  partners, milestones,  │  API   └──────────────────────────────┘
│  settings               │                     │ upload
└─────────────────────────┘                     ▼
            ▲                          ┌──────────────────┐
            │ doGet/list               │ Google Drive     │
            │ doPost (admin)           │ (folder gambar)  │
            ▼                          └──────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  Astro build (Vercel)                                        │
│  1) scripts/fetch-cms.mjs  → GET GAS export (token)          │
│  2) tulis src/data/cms-snapshot.json (validasi Zod)          │
│  3) npm run build (pakai snapshot)                           │
└─────────────────────────────────────────────────────────────┘
            ▲ trigger rebuild
            │ Vercel Deploy Hook (testing + production)
┌─────────────────────────────────────────────────────────────┐
│  GAS: setiap save admin → POST hook → Vercel build ulang     │
└─────────────────────────────────────────────────────────────┘
```

- **GAS Web App** (`doGet`/`doPost`): satu endpoint JSON. `action=export`
  (read semua collection, butuh token) untuk build; `action=list` (per
  collection); `action=save`/`delete` (butuh admin).
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
- **Gambar**: admin upload → GAS simpan ke folder Drive → balas URL publik;
  sel menyimpan URL. (Artwork yang dibake `assets:*` **tetap manual**.)
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
- **Fase B1 — GAS read + export.** Installer `cms/gas/export.js` membuat Sheet
  dengan 8 collection tabs, folder Drive privat, seed snapshot, token dan
  konfigurasi Script Properties; `doGet` export/list read-only. Generator
  `npm run cms:gas` menulis `artifacts/cms-gas/Code.gs`. Remote build fetch
  memvalidasi payload lalu mengganti snapshot atomik. Pemasangan Google dan
  env Vercel membutuhkan sesi owner; verifikasi real export + build kedua
  project sebelum menyatakan B1 live. Rencana: `docs/cms-b1-plan.md`.
- **Fase B2 — Admin page (HtmlService).** Login Google (1–2 akun), form CRUD
  untuk `projects` & `team` dulu, upload gambar ke Drive, tombol save →
  panggil Deploy Hook.
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

## 6. Yang dibutuhkan dari user sebelum eksekusi

1. **Akun Google** untuk backend (yang jadi owner Sheet/GAS) + email 1–2 admin.
2. Konfirmasi **folder Drive** untuk media (atau biarkan dibuat otomatis).
3. URL **Deploy Hook** Vercel untuk 2 project (testing & production) — dibuat di
   dashboard Vercel.
4. Setuju **Fase B0 dulu** (refactor data → snapshot + loader, tampilan nol
   perubahan) sebelum menyentuh GAS.

## 7. Langkah pertama untuk AI baru

1. Baca `AGENTS.md`, `docs/pixel-precision-sop.md`, `docs/ai-handoff.md`, file
   ini.
2. `git status` harus bersih; commit/push dulu kalau ada sisa.
3. Tunggu jawaban §6.
4. Kerjakan **Fase B0** (snapshot + thin loader + Zod + `fetch-cms.mjs` mode
   fallback) — **satu pass + 7 gate, tampilan tidak berubah**. Update
   `docs/assets.md`/`docs/ai-handoff.md`/`AGENTS.md` di commit yang sama.

## Keputusan sesi B0

User menyetujui B0, memilih satu owner/admin Google, dan meminta folder media
dibuat otomatis. Identitas akun tetap di luar repo. Deploy Hook berbeda dari URL
situs publik; kedua hook perlu dibuat saat B1/B2. B1 menambahkan fetch remote; lokal tanpa env tetap memakai snapshot.
Kode read API dan admin akan berada di project GAS terpisah. Rencana per-pass: `docs/cms-b0-plan.md`.

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

B1 code dan tes selesai; live setup masih pending. Panduan login, installer,
Script Properties dan env Vercel: `docs/cms-gas-setup.md`.

Production Vercel `fb99c39` remote-mode build and deployment are confirmed.
Testing deployment also success; remote-mode log confirmation pending. Next
private dashboard work order: `docs/cms-b2-plan.md`.

B2 Projects foundation source is verified (`cms/gas/admin/`, `npm run cms:admin`):
private owner auth, existing Projects editing, revision check and two rebuild
hooks with retry. Site geometry/source remain unchanged. Owner installation
pending; additions/uploads/Team follow separate passes. Work order:
`docs/cms-b2-plan.md`; installation: `docs/cms-admin-setup.md`.
