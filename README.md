# Data Sorcerers — Community Web

Website komunitas **Data Sorcerers**: landing page + 6 halaman detail domain
(HoDS) + halaman **Recruitment** lengkap beserta 6 halaman **detail role**.

Tujuan utama project: **pixel-accurate** ke desain Figma/PNG, dibangun dengan
**HTML/CSS asli** (bukan tempelan screenshot), ringan (tanpa framework CSS/JS),
plus beberapa interaksi (navbar blur, carousel, accordion, hover button).

> Dokumen ini buat **tim** (developer/desainer yang lanjut kerja). Sebelum ngoding,
> baca juga: **`AGENTS.md`** (aturan operasional), **`HANDOVER.md`** (konteks
> lengkap + status), dan **`docs/assets.md`** (provenance tiap section + node Figma).

---

## Daftar isi

1. [Mulai cepat — clone sampai jalan](#1-mulai-cepat--clone-sampai-jalan)
2. [Tech stack](#2-tech-stack)
3. [Halaman & fitur yang sudah ada](#3-halaman--fitur-yang-sudah-ada)
4. [Struktur repo](#4-struktur-repo)
5. [Prinsip & aturan kerja](#5-prinsip--aturan-kerja-wajib)
6. [Konvensi UI & interaksi](#6-konvensi-ui--interaksi)
7. [Data (masih placeholder)](#7-data-masih-placeholder)
8. [Verifikasi visual](#8-verifikasi-visual)
9. [Deploy](#9-deploy)
10. [Font](#10-font)
11. [Aset referensi](#11-aset-referensi)
12. [Yang belum / TODO](#12-yang-belum--todo)
13. [SEO & Open Graph](#13-seo--open-graph)

---

## 1. Mulai cepat — clone sampai jalan

### Prasyarat

- **Node.js 22.12+** (repo pakai `engines.node: "22.x"`; Vercel juga 22.x).
- **Git**.
- (Opsional, buat verifikasi visual) **Chromium** di `/usr/bin/chromium`
  (bisa di-override lewat env `CHROMIUM_PATH`).

Cek versi:

```sh
node -v   # harus v22.x
npm -v
```

### Langkah clone & jalankan

```sh
# 1. Clone repo
git clone https://github.com/Web-Data-Sorcerers/community-web.git
cd community-web

# 2. Install dependency (pakai npm ci biar versi persis dari package-lock.json)
npm ci

# 3. Jalankan dev server
npm run dev
```

Buka **http://localhost:4321**.

> Catatan: `assets/` (folder referensi mentah dari Figma) ukurannya ratusan MB
> dan **tidak wajib** buat jalanin situs. Tapi **buat verifikasi visual**,
> folder itu **wajib ada** (verify baca PNG referensi di situ).

### Command penting

| Command                             | Fungsi                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------- |
| `npm ci`                            | Install dependency (bersih, sesuai lockfile).                                                |
| `npm run dev`                       | Dev server (http://localhost:4321, host `0.0.0.0`).                                          |
| `npm run build`                     | `astro check` + build static ke `dist/`. **Harus 0 error.**                                  |
| `npm run preview`                   | Serve hasil build (`dist/`).                                                                 |
| `npm run check`                     | Type-check Astro/TS saja.                                                                    |
| `npm run format`                    | Rapikan semua file pakai Prettier.                                                           |
| `npm run format:check`              | Cek format (harus lolos sebelum commit).                                                     |
| `node scripts/verify.mjs`           | Verifikasi visual (dev server harus jalan; harus exit 0). Bisa juga `npm run verify:visual`. |
| `node scripts/responsive-audit.mjs` | Audit responsif 14 halaman × 26 lebar (320–3840).                                            |
| `npm run assets:og`                 | Regenerate og image (`public/og/og-default.jpg`) + favicon + manifest.                       |
| `npm run seo:audit`                 | Validasi title/meta/OG/canonical/sitemap di `dist/` (setelah build).                         |

### Alur kerja singkat (rekomendasi)

```sh
npm run dev            # terminal 1: dev server
npm run build          # pastikan 0 error
npm run format:check   # pastikan bersih
node scripts/verify.mjs # pastikan exit 0 (butuh dev server jalan)
node scripts/responsive-audit.mjs # audit responsif semua halaman
npm run seo:audit      # validasi SEO/OG (setelah build)
```

---

## 2. Tech stack

| Bagian     | Pilihan                                               | Alasan                                                      |
| ---------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| Framework  | **Astro 7.3.3** (`output: static`)                    | Ringan, 0 JS by default, scoped CSS, build cepat.           |
| Bahasa     | **TypeScript** (`astro/tsconfigs/strict`)             | Aman, dan `astro check` ikut di `build`.                    |
| Styling    | **Scoped CSS** per komponen + `src/styles/global.css` | Tanpa framework CSS, kontrol penuh, bundle kecil.           |
| Format     | **Prettier** + `prettier-plugin-astro`                | Konsisten.                                                  |
| Gambar     | **sharp** (dev)                                       | Konversi/optimasi WebP, ekstraksi/pengukuran PNG referensi. |
| Verifikasi | **Playwright + sharp** (`scripts/verify.mjs`)         | Screenshot + diff pixel vs PNG referensi.                   |
| Animasi    | **GSAP** + **Three.js** (homepage, opsional)          | Scroll reveal, parallax, 3D tilt, partikel hero.            |
| Runtime    | **Node 22.x**                                         | Dipakai Vercel juga.                                        |
| Deploy     | **Vercel** (`vercel.json`)                            | Static, zero-config Astro.                                  |

> **Aturan dependency**: runtime deps sengaja **cuma `astro`** + `gsap` (dan
> `three` untuk lab/motion). Jangan tambah library lain tanpa tanya dulu; kalau
> memang berat, **lazy-import** (contoh: layer Three.js hero).

---

## 3. Halaman & fitur yang sudah ada

### Homepage `/`

Header (navbar fixed + blur saat scroll) → Hero → Our Philosophy → What We Do →
House of Data Sorcerers (rail kartu) → Our Project (carousel 3D) → Recruitment CTA
→ Footer.

### Detail HoDS `/hods/{id}`

6 halaman (data, core, language, vision, product, growth). Layout tab
(LEARNING / Expected Skills / TOOLS / OUTPUT / dst). Di-link dari kartu di
section "House of Data Sorcerers", dan dari kartu "Who Should Join" di halaman
Recruitment (`/hods/{id}?from=recruitment` — tombol back balik ke Recruitment).

### Halaman Recruitment `/recruitment` (LENGKAP)

Hero → Who Should Join (rail kartu) → What You Will Do → Available Roles →
Selection Timeline → FAQ → Snippets of Life → CTA → Footer.

- **Available Roles** me-link ke halaman **Detail Role** `/recruitment/roles/{id}`
  (6 halaman: data, core, language, vision, product, growth).
- Detail role: Back to Open Roles → kartu role 1280 × 279 → About this role →
  Requirement → Contact person.

### Interaksi yang sudah jalan

- Navbar state scroll **blur-only** (tanpa panel/garis kotak); menu mobile
  **full-screen** dengan animasi buka/tutup (fallback instan saat
  `prefers-reduced-motion`) dan hover link berbentuk pill membulat.
- Carousel: Our Project (3D coverflow, loop), Snippets (galeri foto), rail HoDS
  (Home "Choose Your Domain" & Recruitment "Who Should Join"), FAQ accordion.
  Panah: **kiri-kanan di desktop, bawah di mobile** (Projects & DomainRail ganti
  di `1050px`, Snippets di `760px`).
- **Keyboard ←/→** aktif otomatis saat section-nya di tengah viewport (tanpa
  klik/fokus dulu), berlaku di semua carousel/rail.
- **Hover button** = swap warna (lihat §6).
- Semua animasi punya fallback `prefers-reduced-motion`.

### Motion (GSAP + Three.js)

Homepage memakai GSAP (ScrollTrigger) + layer partikel Three.js di hero
(`src/components/Motion.astro`, `src/scripts/motion.ts`, `Hero.astro`).
Semuanya dibungkus `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`
— begitu pengguna minta reduced motion, semua tween/ScrollTrigger di-revert dan
listener kustom dibersihkan:

- scroll-reveal heading & kartu tiap section,
- parallax hero saat scroll (plate `.artwork-stack` bergerak lebih jauh dari
  cutout `.art-figure`) + parallax pointer,
- 3D tilt kartu HoDS & What We Do,
- magnetic button + cursor glow (khusus pointer halus / `pointer: fine`),
- layer partikel Three.js di-`import()` dinamis (di luar bundle awal) dan tidak
  dibuat sama sekali saat reduced motion.

---

## 4. Struktur repo

```
src/
  components/   Shared: Navbar (prop `active`), Footer, Button, DomainCard, DomainRail.
                Home: Hero, Philosophy, WhatWeDo, Domains, Projects, Recruitment.
                Recruitment: RecruitmentHero, WhoShouldJoin, WhatYouWillDo,
                AvailableRoles, SelectionTimeline, Faq, Snippets, Cta, RoleDetail.
  data/         domains.ts  (6 kartu HoDS — dipakai home & recruitment)
                hods.ts     (6 detail HoDS home, 22 tab)
                roles.ts    (6 detail role recruitment)
                projects.ts (4 project, placeholder)
  layouts/      BaseLayout.astro (head: title/description/canonical/OG/Twitter/
                JSON-LD/icons, font preload, slot)
  pages/        index.astro                   (homepage)
                hods/[id].astro               (detail HoDS, getStaticPaths)
                recruitment.astro             (halaman Recruitment)
                recruitment/roles/[id].astro  (detail role, getStaticPaths)
                robots.txt.ts                 (robots.txt endpoint)
  styles/       global.css (font-face, token, reset)
scripts/        verify.mjs (verifikasi visual)
                responsive-audit.mjs (audit responsif semua halaman)
                generate-og.mjs (og image + favicon + manifest)
                seo-audit.mjs (validasi SEO/OG di dist/)
public/         fonts/ + images/ (aset yang diserve)
                og/og-default.jpg, favicon*, icon-*, site.webmanifest
assets/         aset referensi mentah Figma (TIDAK di-serve, besar)
  assets home page/  assets recruitment page/  button/
docs/           assets.md, kickoff-prompt.md, page-build-prompt.md
artifacts/      output verifikasi (git-ignored)
vercel.json     konfigurasi deploy
.vercelignore   exclude `assets/` besar + artifacts dari upload
```

---

## 5. Prinsip & aturan kerja (WAJIB)

1. **PNG referensi = otoritas akhir.** CSS export Figma cuma _hint_. Kalau beda,
   **ikut PNG**. (Contoh: gradient glass hero, box-shadow button.)
2. **Semua UI = HTML/CSS asli.** Gambar hanya untuk artwork/foto. Teks, tombol,
   border, kartu, gradient text → dibangun di CSS. **Jangan flatten screenshot.**
3. **Ukur, jangan nebak.** Kalau kelihatan beda, ukur bbox/pixel dari PNG pakai
   `sharp`, baru sesuaikan. Repo ini penuh angka hasil pengukuran.
4. **Geometri di-assert.** Angka penting di-assert `deepEqual` di
   `scripts/verify.mjs`. Kalau desain sengaja diubah, **update assertion-nya.**
5. **`prefers-reduced-motion`** wajib ada untuk setiap animasi.
6. **Jangan tambah dependency** tanpa tanya; runtime deps tetap `astro`.
7. **Commit per fitur** (`feat:` / `fix:` / `docs:` / `chore:`), **push ke `main`**
   (Vercel auto-deploy).

---

## 6. Konvensi UI & interaksi

- **Button (`Button.astro`)** — varian: `primary` (violet), `glass` (dark glass),
  `white` (navbar), `secondary` (dark glass, hug label), `apply` (violet, hug
  label). **Hover = swap warna**: pill gelap → violet, pill violet → dark, pill
  putih → violet. Fill swap instan (gradient nggak bisa di-transition halus);
  rim/teks nge-fade; `prefers-reduced-motion` mematikan transisi.
- **Carousel/rail keyboard** — ←/→ aktif saat **section-nya ada di tengah
  viewport** (`rect.top ≤ innerHeight/2 ≤ rect.bottom`). Cuma satu carousel yang
  pegang tombol (yang di tengah), jadi nggak bentrok. Berlaku di Projects,
  Snippets, dan `DomainRail` (Home Domains + Recruitment WhoShouldJoin).
- **Detail page gradient full-bleed** — `<main>` lebar 100%, konten di inner
  `max-width: 1440px` yang di-center. Jangan taruh gradient di container
  max-1440 (kepotong di layar > 1440 / zoom out).
- **Jangan pakai lebar fixed-px** yang bisa overflow; pakai `%` / `clamp()` /
  `aspect-ratio`. Selalu tes 320–3840px (jalankan `responsive-audit.mjs`).
- **Panah carousel**: kiri-kanan di desktop, bawah di mobile. DomainRail samping
  sengaja menumpuk tepi kartu rail (full-bleed); panah Projects tidak boleh
  menyentuh kartu aktif. Jangan taruh panah di padding section kalau padding-nya
  lebih pendek dari tinggi panah.
- **Elemen overlay** yang tidak ada di PNG referensi (navbar fixed, panah
  carousel, dots, kartu non-aktif) disembunyikan saat screenshot verifikasi
  (`setNavbarHidden` di `verify.mjs`). Kalau nambah overlay baru, tambahkan ke
  daftar itu.
- **Link tanpa tujuan** tetap `aria-disabled` (bukan link mati / URL karangan).

---

## 7. Data (masih placeholder)

- **Project** (`src/data/projects.ts`) — 4 placeholder, gambarnya masih sama
  semua. Ganti dengan project asli.
- **Tanggal recruitment** — kolom "Date" di Selection Timeline masih placeholder
  "Date" (sesuai PNG/Figma). Ganti kalau tanggal asli sudah ada.
- **Link** yang belum tersedia (nav selain Home & Recruitment, sebagian tombol,
  social + Terms/Privacy/Cookies di footer) sengaja `aria-disabled`.

---

## 8. Verifikasi visual

```sh
npm run dev            # terminal 1 (wajib jalan)
node scripts/verify.mjs # terminal 2
```

- Butuh dev server di `http://localhost:4321` (atau set `PREVIEW_URL`).
- Pakai Chromium di `/usr/bin/chromium` (override: `CHROMIUM_PATH`).
- Yang dicek: geometri desktop (exact `deepEqual`), diff pixel vs PNG referensi,
  screenshot + overlay + diff → `artifacts/`, teks kepotong, overflow horizontal
  320–1920px, interaksi menu mobile, dan **browser error**.
- Output: `artifacts/verification.json` + `*-desktop.png`, `*-diff.png`,
  `*-overlay.png`.
- Skor terakhir (homepage `overall 1.947`, 0 browser error):
  `philosophy 1.670 · whatWeDo 1.958 · domains 2.596 · projects 5.104 ·
recruitment 2.174 · footer 2.666`. Halaman recruitment diukur per-section
  (hero 2.039, Snippets 0.694, dst — detail di `HANDOVER.md` §13). Sisa diff
  wajar dari rasterisasi font + resampling gambar.

**Kalau `verify.mjs` full OOM-kill Chromium** (biasanya di mesin RAM kecil —
sisa < ~1–1,5 GB), verifikasi **per-section** pakai skrip Playwright ringan
(goto `domcontentloaded`, eager-load gambar, screenshot elemen). Launch args
Chromium sudah `--disable-dev-shm-usage --disable-gpu` untuk bantu.

- `verify.mjs` menunggu `waitUntil: 'networkidle'`; di **dev server** (Vite HMR)
  itu bisa hang. Kalau begitu, jalankan terhadap build statis:
  `npm run build && npx astro preview --port 4331` lalu
  `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`.
- Cek responsif semua halaman (tanpa diff PNG, cepat, hemat memori):
  `node scripts/responsive-audit.mjs` — 14 halaman × 26 lebar (320–3840).
- Cek SEO/OG: `npm run seo:audit` (setelah `npm run build`) — lihat §13.

---

## 9. Deploy

- **GitHub → Vercel** (branch `main`, auto-deploy). Import repo di Vercel.
- **Domain kanonik**: `astro.config.mjs` → `site` dari `SITE_URL`, default
  `https://data-sorcerers-community-sigma.vercel.app`. Ganti default (atau set
  env `SITE_URL` di Vercel) bila domain final berubah — ini yang dipakai
  canonical, `og:url`, dan sitemap.
- `vercel.json`: `framework: astro`, `installCommand: npm ci`,
  `buildCommand: npm run build`, `outputDirectory: dist`.
- `.vercelignore`: `assets`, `artifacts`, `.astro`, `.opencode` — biar folder
  referensi besar nggak ke-upload.
- Node 22 dipin lewat `engines.node`.

---

## 10. Font

- **Manrope** 400/500/600/700 — dibundel lokal di `public/fonts/*.ttf`
  (lisensi **OFL**).
- **Nasalization** (font heading) — **TIDAK dibundel** (lisensi desktop melarang
  embed/serve ke web). Di mesin dev pakai font lokal, jadi di device lain heading
  fallback ke sans-serif. Buat konsisten di semua device, harus beli **webfont
  berlisensi** (Adobe Fonts / MyFonts / Fontspring / Typodermic) — detail di
  `HANDOVER.md` §11 & `docs/assets.md`.

---

## 11. Aset referensi

- `assets/` = PNG referensi mentah dari Figma, dikelompokkan per halaman
  (`assets home page/`, `assets recruitment page/`, `button/`). **Tidak
  di-serve** dan di-`.vercelignore`.
- `public/images/` = aset yang benar-benar diserve (gambar/foto/SVG, hasil
  konversi WebP dari aset referensi).
- Provenance tiap section (node Figma, ukuran, catatan penting) ada di
  **`docs/assets.md`** — **update file itu** setiap nambah/ubah section.

---

## 12. Yang belum / TODO

- [ ] **Nasalization webfont** berlisensi (heading fallback di device lain).
- [ ] **Data project asli** (`src/data/projects.ts`).
- [ ] **Tanggal recruitment asli** (kolom "Date" di Selection Timeline).
- [ ] **Halaman lain di Figma**: **About Us, Hall of Frames, Partners, Contact**.
- [ ] Audit art/konten detail HoDS & detail role kalau ada pembaruan Figma.
- [ ] Opsional: lanjutkan motion (GSAP + Three.js — lihat `HANDOVER.md` §10) &
      optimasi bundle.

---

## 13. SEO & Open Graph

- **Canonical origin** dari `site` (`SITE_URL`), default
  `https://data-sorcerers-community-sigma.vercel.app`.
- **`BaseLayout`** meng-emit: title, description, `robots`, canonical, ikon,
  manifest, Open Graph, Twitter `summary_large_image`, dan JSON-LD
  `Organization` + `WebSite`. Prop per halaman: `title`, `description`, `image`,
  `type` (`article` untuk halaman detail), `noindex`.
- **Share card**: `public/og/og-default.jpg` (1200 × 630) — regenerate dengan
  `npm run assets:og` (dari `Gambar Hero Section.png` + logo + headline
  `SORCERY IN DATA MAGIC IN AI.png`). Skrip yang sama juga bikin favicon
  (**transparan**, tanpa background) + `site.webmanifest`.
- **Minifier**: `astro.config.mjs` pakai `vite.build.cssMinify: 'esbuild'` supaya
  properti modern (mis. `backdrop-filter` unprefixed **dan** `-webkit-`) nggak
  dibuang minifier. **Cek fitur CSS di `dist/`/situs live, jangan cuma
  `npm run dev`.**
- **robots + sitemap**: `src/pages/robots.txt.ts` + `@astrojs/sitemap`
  (`sitemap-index.xml`, 14 URL).
- **Validasi**: `npm run build && npm run seo:audit` → harus **PASS**.
- Catatan cache: WhatsApp/medsos nge-cache preview **per URL**. Setelah OG
  berubah, link lama perlu di-refresh (Facebook Sharing Debugger → "Scrape
  Again") atau dibagikan ulang dengan versi URL (`?v=2`); canonical tetap bersih.

---

## Dokumen lain

- **`AGENTS.md`** — manual operasional ringkas (buat AI agent/developer baru).
- **`HANDOVER.md`** — konteks lengkap: stack, struktur, status tiap section,
  checkpoint commit, TODO, gotchas.
- **`docs/assets.md`** — provenance tiap section + node Figma.
- **`docs/kickoff-prompt.md`** — starter prompt buat AI agent baru.
- **`docs/page-build-prompt.md`** — template prompt buat bikin halaman/section baru.
