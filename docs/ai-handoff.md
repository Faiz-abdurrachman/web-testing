# AI handoff — current context

Tujuan: supaya AI agent berikutnya langsung paham kondisi repo **saat ini** tanpa
harus menebak dari git log. Ini dokumen hidup — update kalau ada perubahan besar.

Baca dulu, urut: `AGENTS.md` (aturan operasional) → `HANDOVER.md` (konteks
panjang) → `docs/assets.md` (provenance per section) → file ini.

## Status singkat

- Branch `main`, fitur homepage + Recruitment + role detail + HoDS detail sudah
  jadi. Motion GSAP + Three.js **aktif** (`src/components/Motion.astro` →
  `src/scripts/motion.ts`).
- Semua gate hijau: `format:check`, `build` (14 halaman), `verify.mjs`
  (`browserErrors: []`), `responsive-audit.mjs` (364 combos), `seo:audit`.

## Baru saja: background "What We Do" DI-FREEZE

**Keputusan user (24 Sep 2026):** berhenti dulu tuning animasi background
("gausah gerak aja, nol interaksi dulu"), commit, lanjut nanti.

**Kondisi sekarang** (`src/components/WhatWeDo.astro`):

- Background = **statis, pixel-match PNG**. Glow `::before` tak disentuh.
- Tiga layer bintang (`.what-we-do::after`, `.pillars-layout::before/::after`)
  **tetap ada di stylesheet tapi `opacity: 0`** → tidak pernah tampil. Definisinya
  sengaja dipelihara supaya gampang dihidupkan lagi.
- **Tidak ada animasi**: keyframes `wwd-aurora`, `twinkle`, `wwd-drift*` dan
  observer `is-idle` sudah dihapus.
- **Tidak ada interaksi pointer**: parallax `--wwd-px/--wwd-py` →
  `background-position` sudah dihapus dari `motion.ts`.
- `reveal()` section tetap (entrance fade-up bawaan situs, bukan bagian yang
  dikeluhkan).

### Kenapa di-freeze — akar masalah (jangan diulang)

1. **Drift lebih jauh dari padding layer.** Layer digeser 440–520px padahal
   `inset` cuma 160–200px → tepi kosong layer menyapu masuk, lalu tiap loop
   `transform` balik ke 0 = lompatan ("patah-patah / jentik").
2. **Pointer parallax animasi `background-position`** tiap frame → repaint
   seluruh gradient → jitter, terutama saat mouse/touch bergerak.

### Resep menghidupkan lagi (kalau nanti dilanjutkan)

Patuhi semua ini:

- Animasi **hanya `transform` / `opacity`** (biar jalan di compositor). Jangan
  pernah animasi `background-position` / properti layout.
- **Jarak gerak ≤ `inset` padding layer**, DAN loop-nya halus:
  - pakai pola ayun `animation: ... ease-in-out infinite alternate` (posisi
    awal = akhir → tak ada snap), **atau**
  - drift satu arah dengan jarak = **kelipatan tepat satu tile `background-size`**
    dan `inset` ≥ jarak.
- Pakai `will-change: transform, opacity` pada layer yang bergerak.
- Pause saat off-screen: `IntersectionObserver` → class `is-idle` +
  `animation-play-state: paused`.
- Semua di dalam `@media (prefers-reduced-motion: no-preference)`; saat reduce
  frame harus tetap **pixel-identical** ke PNG.
- **Jaga jumlah & luas layer tetap kecil.** Terukur di headless Chromium
  (SwiftShader, tanpa GPU) saat 1440×900: section hidup = ~20fps, sedangkan
  halaman yang sama dengan motion mati = 60fps. Jadi makin sedikit/sempit layer
  yang dianimasikan, makin aman. Prefer 2 layer bintang + glow.
- Glow `::before` kalau digeser: kalau `inset` diubah, posisi gradient
  `at 94% -18%` **harus dikompensasi ke px** (persentase ikut ukuran elemen) atau
  warna glow bergeser dan tidak match lagi.

## Yang perlu kamu tahu soal motion

- Hero: pinned scroll sequence (`≥768px`), karakter idle, parallax pointer,
  partikel Three.js lazy-import di `Hero.astro` (`window.__heroParticles`).
- Helper di `motion.ts`: `reveal`, `tilt` (3D, `finePointer`), magnetic button,
  cursor glow. Card tilt HoDS + `.pillar` ada; jangan buang tanpa alasan.
- Under `prefers-reduced-motion: reduce` semua inert → `verify.mjs` bersih.

## Commands / gate (semua harus exit 0 sebelum commit)

```sh
npm ci
npm run format && npm run format:check
npm run build                 # 14 halaman, 0 error
# dev http://localhost:4321 ; preview http://localhost:4331
PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs
npm run seo:audit
```

Gotcha: `verify.mjs` bisa hang di `networkidle` melawan dev (Vite HMR) → build +
`npx astro preview --port 4331`. Kalau Chromium OOM (mesin RAM kecil), pakai
`responsive-audit.mjs` atau skrip Playwright per-section ringan.

## Known issues / catatan

- `scripts/verify-feedback.mjs` **gagal pre-existing**: timeout di
  `locator('.artwork .art-bg')` untuk route `/recruitment` (hero recruitment pakai
  `.artwork img`, bukan `.art-bg`). Tidak terkait What We Do.
- Untracked yang sengaja dibiarkan: `.agents/`, `skills-lock.json`,
  `assets/background/hd/video.mp4`, `assets/card baru/` (6 PNG belum dipakai).
- Referensi PNG "What We Do": `assets/assets home page/what we do/What We Do
Section.png` (5760×3376 → 1440×844). Patch glow terukur: center REF
  `rgb(67,52,113)`, upper-right REF `rgb(24,14,54)`.
- Font Nasalization belum di-bundle (lisensi) — jangan akali.
- TODO: webfont Nasalization, data project asli, tanggal recruitment, halaman
  About Us / Hall of Frames / Partners / Contact, dan lanjutan animasi What We Do.
