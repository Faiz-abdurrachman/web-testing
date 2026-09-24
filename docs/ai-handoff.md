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

## Baru saja: background "What We Do" DIHIDUPKAN (revisi aman)

**Keputusan user (24 Sep 2026):** setelah sempat di-freeze karena jitter, section
kembali hidup memakai resep di bawah — kali ini bebas snap dan bebas repaint.

**Kondisi sekarang** (`src/components/WhatWeDo.astro`):

- Background dasar (starfield 43 gradient + glow `::before`) tetap pixel-match
  PNG dan tidak diubah geometrinya.
- **Living sky aktif (outer-space drift)**: dua layer bintang meluncur satu arah
  - satu glow breathe, semuanya **hanya `transform`/`opacity`** (compositor).
- Tiap layer bintang geser **tepat satu tile `background-size`** per loop:
  `.what-we-do::after` (jauh) −440×−360px / 12s, `.pillars-layout::after`
  (dekat) −520×−400px / 7s, keduanya `linear infinite`. Karena pola periodik,
  reset loop tak terlihat → **tak ada snap / patah-patah**; dekat lebih cepat
  untuk parallax.
- `inset` layer (`-460px` / `-540px`) **lebih besar dari travel**, jadi box yang
  bergerak selalu menutup section → tak ada tepi kosong.
- Twinkle opacity dihapus (bikin bintang putih berkedip). Glow `::before` breathe
  opacity 0.86↔1.
- `will-change` dipasang; `.pillars-layout::before` (mid) tetap `opacity: 0` —
  dibiarkan agar biaya compositing kecil (prefer 2 layer + glow).
- `intersectionObserver` di `motion.ts` men-toggle `is-idle` pada `.what-we-do`
  saat off-screen → semua animasi `animation-play-state: paused`.
- **Tanpa pointer parallax** (yang lama `background-position` per-frame sudah
  dihapus dan tidak dikembalikan).
- Base state semua layer `opacity: 0` dan semua animasi di dalam
  `@media (prefers-reduced-motion: no-preference)` → saat reduce section tetap
  **pixel-identical** ke PNG (`verify.mjs` bersih).
- `reveal()` section tetap (entrance fade-up bawaan situs).

### Akar masalah lama (jangan diulang)

1. **Drift lebih jauh dari padding layer.** Layer digeser 440–520px padahal
   `inset` cuma 160–200px → tepi kosong layer menyapu masuk, lalu tiap loop
   `transform` balik ke 0 = lompatan ("patah-patah / jentik"). **Sekarang**:
   `inset` layer diperbesar sampai > jarak (`-460`/`-540`), jadi aman.
2. **Pointer parallax animasi `background-position`** tiap frame → repaint
   seluruh gradient → jitter, terutama saat mouse/touch bergerak.

### Aturan yang harus tetap dipatuhi

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

## Loading screen "splash" sihir (24 Sep 2026)

**Keputusan user:** halaman diberi **full-screen loading screen** bertema sihir
(magic circle + logo + sparkles + wordmark) yang menutupi hero saat first paint,
muncul **sekali per sesi** (sessionStorage `ds:splash`), durasi **beberapa detik**.

Implementasi (`src/components/Splash.astro`, di-mount sebagai anak pertama
`<body>` di `BaseLayout.astro`):

- Overlay `position: fixed; inset: 0; z-index: 9999`, background nebula violet
  gelap. Magic circle = SVG (`<style is:inline>` + markup + `<script is:inline>`
  self-contained, tanpa lib baru).
- **Default `display: none`**; hanya tampil saat `<html>` punya class
  `splash-armed`. Script inline **di `<head>`** (`BaseLayout`) menambah class itu
  hanya kalau `!sessionStorage['ds:splash']` **dan** bukan
  `prefers-reduced-motion: reduce`; sebaliknya ia menambah `splash-done`.
- Timing: `window.load` → tunggu min **3000ms** → `is-leaving` (fade+scale) →
  hapus elemen; hard-cap **6000ms**; bisa di-skip klik/key/wheel/touch.
  Scroll dilock (`html overflow:hidden` **+ kompensasi `padding-right` selebar
  scrollbar**) selama splash supaya tak ada geser layout saat reveal; saat
  `splash-armed` juga `history.scrollRestoration='manual'` (reload tak melompat
  ke tengah scroll-sequence hero).
- `verify.mjs` `setNavbarHidden` sudah diperluas dengan `.splash` (defensif).
- No-JS aman: tanpa script `splash-armed` tak pernah dipasang → splash tetap
  `display: none`.

### Entrance hero ditahan sampai splash + pin GSAP siap (jangan diubah tanpa tes)

Dulu animasi hero (CSS + GSAP) jalan **di belakang** splash lalu kelar tak
kelihatan → terkesan "reload berkali-kali". Sekarang:

- **CSS** di `Hero.astro`: semua animasi entrance (`hero-art`, `hero-veil`,
  `hero-sweep`, `hero-line`, `hero-up`) digate pada class `hero-ready` di
  `<html>`. Karena selector itu ada di `<style>` ber-scope, wajib tulis
  `:global(html.hero-ready) ...` — kalau tidak, Astro men-scope jadi
  `.hero-ready[data-astro-cid]` dan rule **tidak pernah match**.
- **GSAP** (`motion.ts`): `hero-ready` dipasang **setelah** ScrollTrigger selesai
  menyiapkan pin. Alasan: `pin: true` membungkus `.hero` dalam `.pin-spacer`, dan
  setiap `ScrollTrigger.refresh()` (termasuk refresh otomatis saat `load`) meng-
  _revert_ lalu memasang ulang spacer → elemen hero di-_reparent_. Chromium
  membatalkan animasi CSS yang sedang jalan saat elemen dipindah, jadi kalau
  `hero-ready` dipasang terlalu awal animasi entrance **restart** (bug "hero
  double refresh" pas reload). Kalau `document.readyState === 'complete'` (jalur
  splash) class dipasang langsung setelah `ScrollTrigger.refresh()`; kalau belum,
  tunggu `load` + 150ms (refresh load ScrollTrigger deferred ~1 frame) dengan
  fallback 2500ms. Class dilepas lagi 3200ms kemudian (setelah animasi terpanjang,
  `hero-sweep` 2.4s+0.4s) supaya refresh berikutnya tidak memutar ulang intro.
- **GSAP init** (`Motion.astro`): `initMotion()` dipanggil hanya setelah event
  `ds:splash-done` (atau langsung kalau `splash-done` sudah ada / fallback 7s),
  dijaga sekali via `window.__dsMotionInit` + flag `inited` di `motion.ts`.
- Saat `prefers-reduced-motion: reduce`, `splash-done` memang dipasang tapi
  seluruh blok animasi ada di `@media (...: no-preference)` → hero tetap
  statik/pixel-match (gate tetap bersih).

### Hero di viewport pendek / landscape (karakter jangan kepotong)

Di tinggi viewport ≤560px (HP landscape, window pendek), `min-height: 100svh` +
padding/konten bikin `.hero` lebih tinggi dari viewport → `object-fit: cover`
mencrop bagian bawah figur (kaki hilang). Fix: blok `@media (max-height: 560px)`
di akhir `<style>` `Hero.astro` — rapatkan padding/gap/ukuran h1/p dan
`.artwork :is(img, video) { object-position: 61% bottom }` (figur dijangkar ke
bawah). Ambang 560 dipilih agar HP portrait terendah (568) & desktop 1440×903
tak tersentuh. Terverifikasi 568×320 / 600×343 / 540×300 / 900×400 / 1280×500
fit + karakter utuh, portrait & 1440×903 tak berubah (sisa: 480×320 overflow 2px,
kaki tetap terlihat).

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
