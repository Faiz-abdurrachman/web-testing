# CMS / Admin Dashboard — Rencana (brainstorm 4 Oct 2026)

Status: **BRAINSTORM / BELUM DIEKSEKUSI.** Ini rencana untuk membuat editor
non-teknis bisa update kartu, project, role, orang/team, prestasi, dll. tanpa
menyentuh kode. Belum ada perubahan kode untuk CMS.

## 1. Tujuan

Editor (non-developer) bisa CRUD:

- **Projects** ("What Our Sorcery Create" + HoF Project highlights)
- **Team / orang** (About Us `OurTeam`, dan Featured Sorcerers HoF)
- **Roles** (Recruitment Available Roles + 6 detail role)
- **Achievements / Milestone** (HoF)
- **HoDS / Domains** (judul, deskripsi, label tab)
- **Partners**
- **Site settings** (meta/OG, kontak, social)

Target: tambah orang/role/project/prestasi **tanpa deploy manual / tanpa koding**.

## 2. Konteks repo yang WAJIB dipahami dulu

- Astro 7, **`output: 'static'`**, **tanpa adapter/backend**, deploy Vercel.
  `astro.config.mjs`, `vercel.json` (`buildCommand: npm run build`,
  `outputDirectory: dist`).
- Konten sekarang = **typed objects** di `src/data/*.ts`:
  `domains.ts`, `hods.ts`, `projects.ts`, `partners.ts`, `team.ts`, `roles.ts`.
- Gambar di `public/images/...`; sebagian **dibake** oleh script `npm run assets:*`
  dari `assets/`. `assets/` di `.vercelignore`.
- **Pipeline presisi piksel** (`scripts/verify.mjs`, dll) meng-assert **geometri**
  (bukan konten). Ada juga `scripts/responsive-audit.mjs`, `navbar-audit.mjs`,
  `verify-vt.mjs`, `audit:spacing`, `seo:audit`.
- **Dua remote:** `origin` (testing) punya 2 push URL → `git push origin main`
  deploy ke testing + production (`Web-Data-Sorcerers/community-web`).
- Tim: komunitas; editor kemungkinan non-teknis.

## 3. Tiga opsi arsitektur

| Opsi                                                      | Cara kerja                                                        | Cocok kalau                                      | Tradeoff                                                                           |
| --------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| **A. Git-based CMS** (Keystatic / Sveltia / Decap / Tina) | Admin di `/admin` → save → CMS commit ke repo → Vercel auto-build | Simpel, tanpa DB, konten ter-version di git      | Tiap save = 1 build (~1–2 mnt); upload gambar nambah berat repo; butuh OAuth proxy |
| **B. Headless CMS** (Sanity / Payload / Directus)         | Konten di DB hosted; site fetch saat build (atau SSR)             | Dashboard bagus, media library, roles, real-time | Dependency/biaya; refactor sumber data; build tetap perlu                          |
| **C. Custom dashboard + DB** (Supabase/Postgres + Auth)   | `/admin` sendiri, CRUD API, gambar di object storage              | Mau 100% custom, real-time, multi-user           | Paling banyak kerjaan; kelola DB, auth, API                                        |

## 4. Rekomendasi

**Mulai dari A, dan paling pas di Astro: `Keystatic` (`@keystatic/astro`).**

- Integrasi resmi Astro, admin UI di `/keystatic`, konten MD/JSON di repo.
- Tanpa database — cocok static + Vercel sekarang.
- Editor upload gambar, form per-field, preview.
- Upgrade path: kalau butuh real-time/multi-user → pindah ke **Sanity** (hosted)
  atau **Payload** (Postgres, self-host).

Alternatif A: **Sveltia CMS** (drop-in Decap, ringan) atau **TinaCMS** (lebih berat).

## 5. Fondasi wajib (Fase 0 — tanpa CMS dulu)

Pindahkan `src/data/*.ts` → **Astro Content Collections** (`src/content/`) dengan
skema **Zod**, supaya CMS tinggal nunjuk folder ini:

```
src/content/
  projects/*.json
  team/*.json
  roles/*.json
  hods/*.json
  domains/*.json
  partners/partners.json
```

Halaman pakai `getCollection('projects')`. Keuntungan: type-safe + validasi field,
dan CMS jadi "tinggal colok". **Ini langkah paling menentukan; tampilan tidak
boleh berubah sama sekali.**

## 6. Content model (collection → field)

- **projects**: title, tags[], description, image, (nanti) link/repo, year.
- **team**: nama, role, foto (upload), grup (Leader/Data Intelligence/…), socials[], flagship/bio.
- **roles**: title, tagline, chips[], deadline, about, requirements[], contact, whatsapp.
- **hods**: title, description, cardImage, tabs[] (label + sections).
- **achievements/milestones** (HoF): judul, tanggal, deskripsi, gambar.
- **site settings**: meta/OG, kontak, social.

## 7. Jebakan / hal WAJIB hati-hati

1. **Geometri = desain, bukan konten.** `domains.ts` punya
   `rows: { x, y, gap, labels }` (posisi tag di kartu dihitung manual) → CMS boleh
   edit **label**, jangan biarkan editor nambah tag tanpa slot geometri. `roles.ts`
   punya flag `centered`/`tight` → jangan diekspos ke CMS.
2. **Gambar ada 2 jenis:** (a) foto konten (member/project) → boleh upload;
   (b) artwork yang dibake script `assets:*` → tetap manual.
3. **`public/` bukan storage DB.** Commit gambar ke repo → repo membengkak.
   Untuk media banyak: **Vercel Blob** atau **Supabase Storage**.
4. **`verify.mjs` mengunci beberapa konten** (jumlah member grup, jumlah project
   `4`, dsb). Kalau CMS bikin jumlah dinamis, assertion bisa pecah → perlu
   dilonggarkan khusus konten (jangan longgarkan assertion geometri).
5. **Auth & secret.** Git-based butuh OAuth proxy (serverless function Vercel);
   jangan taruh token di repo. `store` git credential lokal jangan di-print.
6. **Deploy ganda** (testing + production): pastikan flow CMS commit ke branch
   yang benar; jangan sampai editor langsung nabrak production tanpa review.
7. **`team.ts` `photo` masih union** `'marchel' | 'zidan-rose'` → harus jadi path
   bebas saat pindah ke collection.

## 8. Roadmap bertahap

1. **Fase 0** — Content Collections refactor (fondasi, tanpa CMS). Build/verify
   tetap hijau. **Tampilan 100% tidak berubah.**
2. **Fase 1** — Pasang Keystatic: `/keystatic` + skema matching collections +
   GitHub OAuth; edit `projects` & `team` dulu.
3. **Fase 2** — Pindahkan `roles` / `hods` / achievements; upload media;
   draft & preview.
4. **Fase 3** — Roles editor + workflow review (staging → production);
   pertimbangkan Sanity/Payload kalau butuh real-time/multi-user.

## 9. Pertanyaan terbuka (harus dijawab user sebelum eksekusi)

1. Berapa editor & butuh role/permission (admin vs kontributor)?
2. Butuh draft/preview sebelum tayang, atau save = langsung live?
3. Perkiraan volume gambar/tahun? (menentukan: repo vs Vercel Blob/Supabase)
4. Budget layanan pihak ketiga, atau harus gratis/self-host?
5. Toleransi build delay — OK ~1–2 menit (git-based) atau harus instan?

## 10. Langkah pertama untuk AI baru

1. Baca `AGENTS.md`, `docs/pixel-precision-sop.md`, `docs/ai-handoff.md`, file ini.
2. Cek `git status` — kemungkinan ada perubahan belum di-commit (tab HoDS +
   navbar hover + AGENTS.md). Konfirmasi user, commit/push dulu supaya bersih.
3. Jawab §9 bersama user.
4. Tulis **Master Plan Fase 0** (daftar collection, skema Zod per file, file mana
   yang diubah) → kerjakan **satu collection per pass + 7 gate**.
   **Jangan ubah tampilan/geometri.**
