# About Us — Responsive glow & character plan (NEXT)

**Status:** rencana untuk AI berikutnya. Kerjakan **satu section per pass + 7 gate**,
jangan digabung. Baca dulu: `AGENTS.md`, `docs/pixel-precision-sop.md`
(§Hukum Glow/Gradient/Artwork Responsif), `docs/assets.md`,
`docs/ai-handoff.md`.

Target: **About Us (`1439:4184`)** — Section 3 Our Philosophy (`1439:4219`) dan
Section 4 Our Ecosystem (`1439:4258`). Dua masalah: **glow ungu tidak responsif
saat zoom-out**, dan **karakter Philosophy tidak menempel tepi seperti Home**.
Homepage & Recruitment tetap benchmark presisi — JANGAN diutak-atik.

---

## 1. Masalah (terverifikasi)

### 1a. Glow/gradient ungu tidak responsif saat zoom-out (>1440px)

- `.philosophy.is-about` dan `.ecosystem` melukis **gradient di `<section>`
  full-bleed**, sedangkan konten 1440 di-`zoom`
  (`.canvas { zoom: calc(100vw / 1440px) }` di `@media (min-width: 1441px)`).
- Gradient di-fit untuk kotak **1440×837** (stop `54.82% → 133.76%`) dan
  **1440×874** (stop `53% → 133%`). Di viewport >1440 kotak gradient melebar ke
  lebar viewport → pita ungu bergeser (terkonsentrasi di sudut/atas) dan seam
  Philosophy↔Ecosystem rusak. Di 1440 semuanya cocok.
- Bukti render: `about-eco-2560.png` (ungu cuma di atas, bawah gelap) vs
  `about-eco-1440.png`. Lihat `/tmp/opencode/` hasil capture.

### 1b. Karakter Philosophy (About) tidak "nempel samping" seperti Home

- About: `.illustration { left: 0 }` **di dalam canvas yang di-`zoom`** → art ikut
  membesar (861px @1440 → 1148 @1920 → 1530 @2560) alih-alih menempel tepi.
- Home: `@media (min-width: 1441px) .illustration { left: calc((1440px - 100cqw) / 2) }`
  → art tetap 861px, anchor ke tepi section (nilai negatif di >1440), konten tetap
  di tengah. Inilah perilaku yang diminta.
- Akibatnya di About, komposisi karakter vs glow desync dari desain.

## 2. Root cause

Gradient/glow ada di **`<section>`** (tidak ikut `zoom`), konten ada di
**`.canvas`** (ikut `zoom`). Dua sistem koordinat berbeda → desync saat lebar ≠ 1440.

## 3. Pendekatan (validasi dulu, jangan asumsi)

A. **Satukan koordinat glow dengan kanvas.** Pindahkan gradient section ke
`.canvas` (atau layer `.glow` seukuran kanvas 1440) sehingga ikut `zoom` dan
identik di ≤1440. Pastikan seam tetap kontinu (Philosophy bottom row ≈
Ecosystem top row). Alternatif: **buang `zoom`**, tiru Home (kanvas 1440
center + glow/art ekstensi ke luar). Ukur mana yang paling dekat ke PNG di
1440/1920/2560.
B. **Karakter menempel tepi seperti Home.** Anchor art ke tepi section dengan
`left: calc((1440px - 100cqw) / 2)` (≥1441) dan **jangan** ikut zoom. Kalau
`zoom` dipertahankan untuk teks, taruh `.illustration` **di luar** kanvas zoom
supaya tidak ikut membesar.
C. Putuskan `zoom` dipertahankan atau dibuang (harus konsisten untuk kedua
section + seam). Dampak 1440 harus nol (MAE tetap).

## 4. Master Work Plan per section (1 pass/section + 7 gate)

### Section A — Our Philosophy (About) `1439:4219`

- URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4219
- Frame **1440×837**, padding 80 (base ≤1399) / absolut desktop: content
  `766/205`, `591×468`, gap 48; heading Bluu Next Bold 700 **56/67**, gradient
  `181deg #fff 15% / #999 42% / #fff 79%` per baris; eyebrow glass; principles
  grid `591×248`, gap `30 / 92`.
- **Glow:** section gradient `159.7deg, #050507 54.82% → #6c3bff 133.76%` (fit
  PNG, MAE 0.554), dipasang section-level sekarang → pindahkan ke koordinat kanvas.
- **Artwork:** `sorcerer-{1x,2x}.{avif,webp}` `861×770` (image fill mentah);
  anchor tepi kiri.
- **Referensi:** `assets/about-us/philosophy/Philosophy-Revisi-1x.png`
  (re-export dari node, pastikan MAE 0 vs tersimpan sebelum ubah kode).
- **Test:** geometri 1440 tetap (`verify.mjs` `aboutPhilosophyGeometry`); MAE
  section tak berubah (**2.041**); seam ≤ 9; capture 1920/2560/3840 → pita ungu
  bawah konsisten + karakter menempel kiri; render reduce pixel-exact.

### Section B — Our Ecosystem `1439:4258`

- URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4258
- Frame **1440×874**, padding 80, gap 116, gradient
  `24.75deg, #050507 53% → #6c3bff 133%`.
- Header `254.5/80` `931×172`; pipeline `80/368` `1280×426`; baseline
  `80/793` `1280×2`; lineBottoms `[776,776,776,776,776]`; step title Manrope 500.
- **Referensi:** `assets/about-us/ecosystem/Ecosystem-Revisi-1x.png`.
- **Test:** sama seperti A — glow atas/bawah konsisten di 1920/2560/3840, seam
  dengan Philosophy Δ ≤ 9, MAE 1440 tak berubah (**2.221**).

## 5. Acceptance (kedua section)

- **1440:** MAE vs reference **tidak berubah** (Philosophy 2.041 / Ecosystem
  2.221) + geometri DOM tetap.
- **1920 / 2560 / 3840:** pita ungu **atas & bawah** konsisten seperti 1440;
  tidak ada artefak "ungu cuma di sudut"; seam Philosophy↔Ecosystem tetap
  menyatu (Δ ≤ 9).
- **Karakter Philosophy** menempel tepi kiri dari 761→3840, tidak menutupi
  konten; bandingkan visual dengan Home (`1430:2052`) di 1920/2560.
- Responsif 320→3840 tanpa overflow/teks terpotong; render `reduce` pixel-exact.
- **7 gate + seo + `audit:spacing` PASS.** Update `docs/assets.md`, assertion
  `verify.mjs` (tambah cek glow/karakter di lebar besar + seam), `AGENTS.md`.

## 6. Gotchas (jangan diulang)

- **Jangan rusak Home** (`variant="home"`, node `1430:2052`, MAE 0.000) &
  halaman lain.
- `zoom` + `container-type: inline-size` → `cqw` relatif ke section; kalau art
  dipindah keluar zoom, pakai math viewport (`calc((1440px - 100cqw) / 2)`).
- CSS comment **satu baris** (Prettier idempoten). Jangan `text-rendering:
geometricPrecision` global.
- Setelah memindahkan gradient/glow, cek **`dist/`** (minifier build), bukan cuma
  `npm run dev`.
- Node Figma bisa berubah: re-export reference dulu, cek **MAE 0** vs tersimpan;
  kalau beda, regenerasi reference di commit yang sama.
