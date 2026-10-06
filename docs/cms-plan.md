# CMS / Admin Dashboard — Rencana (backend Google Apps Script)

Status: **RENCANA (belum dieksekusi)** · diputuskan 6 Oct 2026 ·
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
**isi** (teks/gambar/link), bukan struktur layout, jumlah slot, atau nilai
geometri yang di-assert.

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
- **Auth admin**: GAS web app "Execute as: me" + "Who has access: only myself"
  (atau akun Google admin) → hanya 1–2 akun bisa buka dashboard & POST.
- **Gambar**: admin upload → GAS simpan ke folder Drive → balas URL publik;
  sel menyimpan URL. (Artwork yang dibake `assets:*` **tetap manual**.)
- **Save = live**: GAS memanggil 2 **Vercel Deploy Hook** (testing +
  production). Site rebuild ~1–2 menit, lalu konten live. Bukan runtime fetch,
  jadi HTML tetap berisi konten (SEO + pixel aman).

## 2. Skema Google Sheet (satu tab per collection)

Baris 1 = header; tiap baris berikutnya = 1 record; array/objek disimpan
sebagai **string JSON** (divalidasi Zod di build).

| Tab          | Kolom                                                                                         |
| ------------ | --------------------------------------------------------------------------------------------- |
| `projects`   | id, title, tags (JSON[]), description, image, year?, link?                                    |
| `team`       | id, group (`leader`\|`data`\|`core`\|…), name, role, photo, socials (JSON[]), order           |
| `roles`      | id, title, tagline, chips (JSON[]), deadline, about, requirements (JSON[]), contact, whatsapp |
| `hods`       | id, title, description, cardImage, tabs (JSON[])                                              |
| `domains`    | id, title, description, tint, rows (JSON[])                                                   |
| `partners`   | category, label, count, logo                                                                  |
| `milestones` | id, year, title, description, image                                                           |
| `settings`   | key, value (meta/OG, kontak, social)                                                          |

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
- Hooks build: `"prebuild": "node scripts/fetch-cms.mjs"` (aman: gagal fetch →
  fallback snapshot, build tidak pernah pecah).
- (Opsional nanti) pindah ke **Astro Content Collections + Zod** bila mau
  `getCollection`; bukan syarat.

## 4. Fase (satu langkah per pass + 7 gate)

- **Fase B0 — Fondasi tanpa GAS.** Tambah `cms-snapshot.json` (dari data
  sekarang) + thin loader + `fetch-cms.mjs` (mode fallback) + skema Zod.
  **Nol perubahan tampilan/geometri** (snapshot = data existing). 7 gate.
- **Fase B1 — GAS read + export.** Buat project GAS, Sheet + 8 tab, `doGet`
  export/list, token. Vercel env `CMS_API_URL`/`CMS_API_TOKEN` + build fetch.
  Verify build Vercel masih identik.
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
6. **OAuth/Google**: admin page di GAS pakai Google login (tanpa OAuth proxy
   terpisah). Pastikan akses web app = spesifik, bukan "anyone".
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
