# AI handoff — current context

Tujuan: supaya AI agent berikutnya langsung paham kondisi repo **saat ini** tanpa
harus menebak dari git log. Ini dokumen hidup — update kalau ada perubahan besar.

Baca dulu, urut: `AGENTS.md` (aturan operasional) → `HANDOVER.md` (konteks
panjang) → `docs/assets.md` (provenance per section) → file ini.

## Status singkat

- **Latest splash revision (25 Sep 2026): native SVG + Canvas.** User rejected
  the full-artwork background as "cuman gambar" and requested native rendering.
  `Splash.astro` now constructs the seal, rune paths, rotating rings, floor and
  circular progress as SVG; title/tagline are HTML. `splash-atmosphere.ts` generates
  mist, energy strands and particles in Canvas without image textures. Only the
  existing logo image remains. `loading.png` is a local reference, not served.
  Previous loader WebPs and their generator were removed. Preloader logic from
  `606a6ab` is retained. Committed as `e01809a` and pushed.
- Native revision validation: build 14 pages / 0 errors, format, SEO,
  `verify.mjs` with `browserErrors: []`, responsive audit 364/364, and native
  splash checks at 1440×900, 390×844, 320×568 plus reduced motion all passed.
  The splash test verifies that rings rotate, Canvas pixels evolve, and only
  the logo uses an image. Screenshot timing is isolated from production timers.

- Branch `main`, fitur homepage + Recruitment + role detail + HoDS detail sudah
  jadi. Motion GSAP + Three.js **aktif** (`src/components/Motion.astro` →
  `src/scripts/motion.ts`).
- Semua gate hijau: `format:check`, `build` (14 halaman), `verify.mjs`
  (`browserErrors: []`), `responsive-audit.mjs` (364 combos), `seo:audit`.
- **Terbaru:** splash jadi **preloader asli** (nunggu three + video + fonts),
  navbar "living HUD", perf What We Do (starfield tile + `perf:audit`).
- **Glow CTA (home + recruitment page) satu arah:** `cta-glow-sweep` — glow
  geser kiri→kanan terus berulang (bukan ayun/ombak), opacity turun cuma ke
  `0.5` di seam jadi tak pernah hilang; dipakai di `Recruitment.astro` dan
  `Cta.astro`, pause lewat `.is-idle` saat off-screen.
- **Kapsul navbar hug logo/CTA:** tepi kapsul `is-scrolled` gak lagi ikut frame
  konten penuh, tapi `--nb-frame-panel` (= frame − 2×(`--nb-pad` − `--nb-hug`,
  24px)) → ujung kapsul ~24–28px dari logo & tombol Join Community (dulu ~80px).
- **Pass responsive + performa mobile (25 Sep 2026):** particle Three.js kini
  desktop-only (`min-width: 768px`), navbar HP blur 12px tanpa morph layout 0.9s,
  scrim hero HP + figur satu aturan `height:72%; object-position:59% bottom`,
  hero portrait `min-height:100lvh` supaya tidak kekecilan saat address bar
  sembunyi, `viewport-fit:cover` + safe-area, prefix `-webkit-background-clip`,
  chip role tidak lagi menggantung. Detail di `docs/assets.md` §"Mobile
  responsive + performance pass".

## Baru saja: splash jadi preloader asli

**Keluhan user (25 Sep 2026):** splash di awal dimaksudkan buat "download webnya"
biar tidak berat, tapi masih berat dan splash-nya malah keburu cepat hilang.

**Akar:** splash lama cuma timer (`window.load` + min 3000ms / cap 6000ms) dan
`finish()` langsung dipanggil oleh interaksi apa pun (`pointerdown`/`key`/`wheel`/
`touch`) **tanpa menghormati min**, jadi satu scroll/klik menghilangkannya. Splash
juga tidak memicu preload apa pun; video hero (~538 KB webm / 1 MB mp4) baru mulai
di `requestIdleCallback`, dan chunk `three` (~185 KB gz) tak dijamin siap.

**Fix:** registry `window.__dsPreload` di `BaseLayout` (head). `Hero.astro`
mendorong promise `import('three')` dan (desktop) promise `loadeddata` video ke
registry; video mulai di-fetch saat splash armed. `Splash.astro` sekarang menutup
setelah `window.load` **dan** semua promise registry + `document.fonts.ready`
selesai, min 3000ms / cap 6000ms; interaksi hanya boleh skip **setelah** min.
Terukur: jaringan cepat → splash tutup ~3s dengan three/video sudah load (~240ms);
500 kbps/400ms → tutup di cap ~6s (aset belum selesai, memang di-cap).

## Baru saja: deep link / Back mendarat di section yang benar

**Keluhan user (25 Sep 2026):** Back dari detail HoDS mendarat di section yang
salah, dan refresh pada URL ber-hash tidak stay di section. **Akar:** fragment
scroll browser jalan selagi splash masih `overflow: hidden` di `<html>` dan
sebelum Motion memasang hero pin spacer, jadi target bergeser setelahnya; plus
`history.scrollRestoration = 'manual'` mematikan restore posisi saat Back browser.

**Fix:** `src/layouts/BaseLayout.astro` re-apply target `location.hash` setelah
`ds:splash-done` / `load` / `fonts.ready` (beberapa kali singkat, biar layout
berhenti bergeser); `src/components/Splash.astro` membalikkan
`scrollRestoration = 'auto'` begitu splash selesai; `src/styles/global.css`
memberi `section[id]` / `main[id]` `scroll-margin-top: 110px` (semua section, biar
tidak tertutup navbar). Terukur: fresh `/#domains` → `domainsTop` 110 (dulu 1100),
reload sama, dan browser Back dari detail kembali ke posisi section sebelumnya.

## Baru saja: Navbar "living HUD" (kaca melayang + flash + indikator meluncur)

**Permintaan user (25 Sep 2026):** referensi gaya navbar magelang-ai-expo tapi
lebih glass/blur; di paling atas transparan menyatu hero, saat scroll jadi
**kapsul kaca melayang** (atas + bawah membulat), **tanpa auto-hide**; hapus garis
progress; hapus siluet putih hero → pindah jadi kilau di navbar; transisi
masuk/keluar navbar & pergantian tab aktif harus **kenyal ("agar-agar")**; atur
hamburger + logo mobile saat scroll; **tanpa badge petir**.

**Implementasi** (`src/components/Navbar.astro`, `src/components/Hero.astro`,
`src/scripts/motion.ts`):

- Hero: `.hero-flare` (siluet putih) **dihapus** dari markup + CSS + timeline
  motion; glow-nya dipindah ke navbar.
- Di hero transparan total (inner `max-width: 1600px`,
  `padding-inline: clamp(56px,4.5vw,80px)`, gap 130) → saat `is-scrolled` (y>8)
  menarik ke grid 1440 dan jadi kapsul kaca `--nb-radius: 999px` (mask feather
  lama dihapus; `margin-top: 10px`, `--nb-inset: 14px`,
  `backdrop-filter: blur(28px) saturate(180%) brightness(1.07)`, inset highlight
  atas + bawah). `is-condensed` (y>40) → 72px / 64px ≤1050px, logo 0.86.
- Easing: `--nb-dur: 0.9s` + `--nb-ease: cubic-bezier(0.16,1,0.3,1)` untuk
  geometri bar; `--nb-spring: cubic-bezier(0.34,1.56,0.64,1)` untuk indikator.
- `.nav-indicator`: kapsul ungu yang **meluncur** (dipindah JS) dengan
  `left 0.6s` / `width 0.5s` spring + rim gradien `mask-composite`; ikut
  hover/focus lalu duduk di `a.nav-link.active`; re-sync saat resize,
  `transitionend`, dan font load. **Tanpa petir** (bolt `::before` dihapus).
- `.navbar-flash`: satu kali sapuan diagonal putih (`nav-flash` keyframe, ter-clip
  ke radius kapsul) saat pertama `is-scrolled` — pengganti flare hero.
- Mobile ≤1050px: `summary` 44×44 `border-radius: 14px`, dapat glass bg + border
  saat `is-scrolled`; garis burger animasi springy. Auto-hide tetap dihapus.
- Semua inert saat `prefers-reduced-motion: reduce`.

**Terverifikasi:** `format:check`, `build` 0/0/0, `responsive-audit` 364 combos
ALL PASS, `verify.mjs` exit 0 (`browserErrors: []`).

## Baru saja: What We Do starfield jadi tile gambar (perf scroll)

**Keluhan user (25 Sep 2026):** masuk section "Four Pillars of Innovation" terasa
**berat banget** saat scroll. Profiling (Playwright, preview 4333): long task
100–200 ms + avg ~50 ms/frame tepat saat section mulai ter-raster, 55 composited
layer, dua layer bintang animasi 4.16 MP & 3.88 MP.

**Fix (Fase 1 — `src/components/WhatWeDo.astro` + skrip baru):**

- Tiga layer bintang (base 42 gradient, far 20, near 8) di `background-image`
  jadi **tile PNG periodik** yang di-render persis oleh Chromium:
  `scripts/generate-star-tiles.mjs` (`npm run assets:starfield`), pola sumber di
  `scripts/starfield-patterns.mjs` (di-ekstrak dari CSS lama). Output
  `public/images/what-we-do/starfield-{base,far,near}.png`
  (520×440 / 440×360 / 520×400). Tampilan **pixel-identical** ke versi CSS
  (MAE 0 / max 1 di mode reduce).
- `will-change` sekarang **hanya saat section dekat viewport**
  (`.what-we-do:not(.is-idle)`), biar off-screen tidak menyimpan texture raksasa.

**Hasil terukur:** long task masuk section **186 ms → 0 ms**, avg frame ~52 → ~37 ms
(headless `--disable-gpu`; angka absolut inflasi, bandingkan relatif). MAE
`verify.mjs` whatWeDo tetap **2.036**, geometry persis, `browserErrors: []`,
`responsive-audit` 364 combos ALL PASS, `format:check` hijau. Karena audit ini
software-render, tetap cek di GPU nyata sebelum klaim final.

**Fase 2 (diukur, TIDAK diubah):** A/B hover/tilt per kartu (`.pillar-01`,
no-reduce) menunjukkan border `mask-composite`, hover `filter` glow 1231 px, dan
`tilt()` 3D **tidak terukur** sebagai biaya (semua ~37 ms = lantai environment
software-render). Justru membuang `overflow: hidden` lebih berat (51 ms) karena
glow tak ter-clip. Jadi tidak ada perubahan; jangan buang `tilt()`/mask tanpa
alasan baru.

**Fase 3 (selesai):** entry long-task yang tersisa hanya di load awal
(hero/splash, ~174 ms), **bukan** di What We Do, jadi tuning trigger
`pillarIntro` tidak perlu. Ditambah regression guard
`scripts/perf-audit.mjs` (`npm run perf:audit`) yang mengukur frame avg/p90/worst

- long task per section ke `artifacts/perf-audit.json`; set `PERF_MAX_TASK` (ms)
  untuk bikin run gagal kalau ada task lewat budget. Hasil sekarang: `.what-we-do`
  avg 35 ms, long task 0.

## Baru saja: "Four Pillars" cinematic 3D entrance (auto-play, bukan pin)

**Permintaan user (25 Sep 2026):** kartu section What We Do (`Four Pillars of
Innovation`) harus "keluar" smooth pakai GSAP, ga boring / ga AI-slop.

**Implementasi** (`src/components/WhatWeDo.astro` + `pillarIntro` di
`src/scripts/motion.ts`): di `≥1051px` timeline **time-based auto-play sekali**
pas section masuk viewport (`scrollTrigger: { start:'top 72%', once:true }` —
**tanpa pin, tanpa scrub**, jadi selesai sendiri, bukan parallax/scroll-linked):
eyebrow fade, 2 baris `h2` mask-up (wrapper `.line` `overflow:hidden`; gradient
dipindah ke inner span biar clip-nya bekerja), 4 `.pillar` terbang keluar dari
tengah (`x/y` ±70/±56, `scale .82`, `rotation ±4deg`, stagger 01→04, ~1.4s).
`≤1050px` = `reveal` fade-up **lurus** (tanpa rotasi) — semua lebar yang memakai
menu mobile/tablet, supaya di HP/tablet kartunya tidak terbang miring. Saat
reduce tidak dipanggil → gate aman.

**Revisi (25 Sep 2026) — dibikin lebih ringan:** user minta "jangan terlalu
berat". 3D camera tilt di `.pillars-layout` (`rotationX:11 / rotationY:-5 → 0`)
**dihapus** — itu menaruh seluruh section di layer sendiri & me-raster ulang
starfield tiap frame. Sekarang murni 2D (`x/y/scale/rotation/opacity`) → tetap
bagus, jauh lebih murah. Jangan animasikan `rotationX/Y` di `.pillar` (dipakai
`tilt()` hover).

**Terverifikasi:** `verify.mjs` PASS (whatWeDo geometry persis, MAE 2.04,
`browserErrors: []`), `responsive-audit` 364 combos ALL PASS, build 14 halaman.

## Baru saja: Hero headline "strike" (kilatan petir, ringan)

**Permintaan user (25 Sep 2026):** headline hero (`SORCERY IN DATA` / `MAGIC IN
AI`) munculnya seperti **disamber petir / ada kilatan**, jangan lebay, tetap
elegan, nyambung dengan animasi hero. "Sedikit lebih berani".

**Implementasi** (CSS-only di `src/components/Hero.astro`, tanpa ubah JS): markup
`h1` dibungkus `.title-wrap` (relative) + overlay `.strike` (di belakang teks;
`h1` di `z-index:1`). Isinya 2 `svg.bolt` (per baris; masing-masing 2 path —
`.halo` violet lebar + `.core` putih tipis, `pathLength="100"`) dengan **zig-zag
diagonal tajam satu lintasan** (tanpa fork; koreksi lanjutan 25 Sep: versi
cubic-Bézier "mulus" ternyata terbaca user **seperti ulat/tube lembut** — halo
26px/blur9 + core blur2 + amplitudo kecil. Fix: halo ditipiskan `stroke-width:13;
stroke-opacity:.4; blur(4px)`, core dipertegas `stroke-width:2; opacity:1;
blur(.4px)`, amplitudo zig-zag diperbesar, tinggi bolt 46→52px) yang digambar
sekali via dash-draw, plus `.strike-burst` radial bloom di ujung bolt.
`.strike-glint` sudah **dihapus** (band kotak cahaya = sumber "kotakan"). Timing
disinkronkan dengan `hero-line` delay `0.42s`/`0.57s`, burst `0.58s`. Animasi pakai
`stroke-dashoffset/opacity/transform` + `filter: blur()` tipis pada stroke,
default `opacity:0` dan digate `@media (prefers-reduced-motion: no-preference)`
→ render reduce tetap pixel-identical. **Terverifikasi:** `verify.mjs` PASS (EXIT 0,
`browserErrors: []`), build & `responsive-audit` PASS; screenshot hero no-reduce
1440/390 oke.

## Baru saja: FX "Our Philosophy" diturunkan (spark tetap banyak)

**Keluhan user (25 Sep 2026):** glow/aura section Philosophy terlalu dominan vs
referensi PNG. Akar masalah: `.aura` (conic 50%/42%) + `.pulse` (radial 55%)
menumpuk di atas glow statis `glow.webp`.

**Fix** (`src/components/Philosophy.astro`): aura `50%/42% → 20%/16%`, width
`62% → 56%`; pulse `55% → 18%`, width `42% → 38%`. Lalu (revisi lanjutan)
**bulir ditambah 7 → 18** (spark `a–r`, `--s` 2–7px, `--r` 68–246px, durasi &
twinkle bervariasi) **tanpa menyentuh aura/pulse** — glow tetap di level referensi.
Orbit `cubic-bezier` cepat-lambat tetap. Terukur (aligned, float off): region glow
REF 84 vs cur 85; kontribusi aura p99 ≈ 15, pulse p99 ≈ 9; grid brightness
kembali dalam ±2 (hanya core crystal +~10). Reduced-motion tetap identik (`.fx`
`opacity: 0`, spark tanpa animasi).

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

### Hero portrait: figur statis jangan menutupi CTA / mepet tepi kanan

Di HP portrait (≤600px, tinggi >560px), `figure.webp` dijangkar bawah lewat
`@media (max-width: 600px) and (min-height: 561px)`
(`.artwork .art-figure { top:auto; bottom:0; height:72%;
object-position:59% bottom }`). Dulu ada tier tinggi per-lebar (60/64/74/68/70%)
yang **non-monoton** (lebar 361–380px jatuh ke default 74%) dan `object-position`
menarik karakter ke kanan → HP 360/375px kelihatan "kekecilan". Karena pusat
cutout `figure.webp` ada di ~60.5% sumber, satu `59% bottom` menaruh karakter di
~62% lebar layar konsisten dan `height:72%` menjaga porsinya tetap terhadap
viewport. Blok yang sama juga mengganti hero ke `min-height:100lvh` (unit
konstan) supaya address bar yang menyembunyikan diri tidak menyisakan celah di
bawah hero — landscape pendek tetap `100svh`. Selector wajib
`.artwork .art-figure` (0,2,0) supaya menang atas `.artwork :is(img,video)`
(0,1,1). Terukur reduced-motion: 320/360/375/390/412/480 overlap 0, karakter
~36% tinggi layar di ~62% lebar, utuh.

### Hero video animasi kepotong di 601–~730px (karakter jangan keluar frame)

Video `hero-bg.webm/mp4` (1582×992) menggantikan layer statis di `≥601px`.
Karakter di dalam video ada di ~62–78% lebar sumber (tongkat/kanan), sedang cutout
`figure.webp` di 53.6–67.3%. Dengan `object-position` default (50%) + `object-fit:
cover`, lebar portrait 601–~730px mencrop sisi kanan karakter ke luar layar
("belum masuk frame"). Fix: `.art-video { object-position: 80% center }` di
`Hero.astro` → karakter ~60–64% (selaras figure statis, fade mulus). Rule ini
no-op saat tak ada crop horizontal (desktop), dan override `max-height:560px` /
`min-width:1921px` tetap menang. Terverifikasi di Chromium 601×900, 675×900,
733×900, 768×1024.

### Hero "kek double / gambar lalu jadi video" saat pindah tab (26 Sep 2026)

Dua akar masalah, dua perbaikan:

1. **Entrance hero replay tiap navigasi.** Hero meng-arm `html.hero-ready` (blur +
   veil + sweep + teks naik + kilat) di setiap document load, jadi setiap pindah
   Home ↔ Recruitment terasa seperti loading. Fix: `BaseLayout` menandai
   `html.nav-warm` di head kalau `sessionStorage ds:splash === '1'` (splash sudah
   pernah main = kunjungan hangat dalam sesi). `motion.ts` lalu **tidak** menambah
   `hero-ready` dan memanggil `animateFigure(..., settled=true)` (karakter langsung
   diam-idle, tanpa rise-in). Load dingin (tab baru / pertama) tetap animasi penuh.
2. **Layer statis → video (potret beda).** `figure.webp` (cutout kecil) dan video
   (adegan penuh, karakter lebih besar) itu komposisi yang berbeda, jadi fade 700ms
   lama memperlihatkan dua karakter = "double". Fix: `<video>` sekarang `poster`
   = `public/images/hero/hero-poster.webp` — **frame 0 dari clip itu sendiri**
   (dibuat `scripts/generate-hero-video.mjs`, crop/scale/unsharp sama biar pas).
   Di `(prefers-reduced-motion: no-preference) and (min-width: 601px)` video
   `opacity: 1` dari awal, jadi yang tergambar sejak paint pertama adalah poster
   (= komposisi video), dan begitu play tidak ada pergantian komposisi. Under
   reduce / `≤600px` video tetap `opacity: 0` → `background.webp` + `figure.webp`
   tetap render referensi (verify aman). `.artwork-stack.is-video` juga
   menyembunyikan `.art-figure` begitu clip live.
3. **Navigasi MPA tetap full load.** Tambah prefetch Astro:
   `astro.config.mjs` `prefetch: { defaultStrategy: 'viewport' }` + atribut
   `data-astro-prefetch` di link navbar (brand + Home + Recruitment, desktop &
   mobile) → dokumen tujuan sudah ter-cache sebelum diklik. Verifikasi: setelah
   load home, `performance.getEntriesByType('resource')` sudah memuat
   `/recruitment`.

## Yang perlu kamu tahu soal motion

- Hero: pinned scroll sequence (`≥768px`), karakter idle, parallax pointer,
  partikel Three.js lazy-import di `Hero.astro` (`window.__heroParticles`).
- What We Do (`≥761px`): "summon from the core" auto-play sekali (lihat bagian
  atas); card `tilt()` hover jangan diadu dengan `rotationX/Y` entrance.
- Helper di `motion.ts`: `reveal`, `tilt` (3D, `finePointer`), magnetic button,
  cursor glow. Card tilt HoDS + `.pillar` ada; jangan buang tanpa alasan.
- Under `prefers-reduced-motion: reduce` semua inert → `verify.mjs` bersih.

## Pass responsive + performa mobile (25 Sep 2026)

Keluhan: heading di HP bukan Nasalization (lisensi — jangan diakali, lihat
`AGENTS.md`) dan navbar berat/patah-patah saat scroll naik-turun.

- Particle Three.js di `Hero.astro` di-gate `(min-width: 768px)` (dulu cuma
  `!reduce`, jadi ikut jalan di HP). Idle figur dapat `richIdle` (mobile = bob
  saja) + pause via `IntersectionObserver` saat hero off-screen (`motion.ts`).
- Scroll-scrub hero di `<768px` **dihapus**: dulu `.artwork-stack` di-scale
  1→1.1 saat hero keluar. Ditambah `min-height` hero pindah `100dvh` → `100svh`
  (dvh ikut reflow saat address bar HP sembunyi/muncul → section bawah "jump")
  dan `ScrollTrigger.config({ ignoreMobileResize: true })` supaya trigger tidak
  re-measure saat address bar berubah. Sekarang hero HP keluar natural (idle bob
  figur tetap); pinned sequence desktop tidak diubah.
- Navbar: `backdrop-filter` hanya saat `.is-scrolled::before` (tak ada layer blur
  di atas); `≤760px` blur 12px tanpa saturate/brightness dan morph jadi instant
  (bukan transisi layout 0.9s).
- Hero HP: scrim dua arah + `text-shadow` + figur satu aturan (`height:72%`,
  `object-position:59% bottom`) biar copy kebaca di 320–390 tanpa bikin karakter
  kecil/geser; hero portrait `min-height:100lvh` supaya selalu mengisi layar.
- Global: `viewport-fit=cover`, `env(safe-area-inset-top)` (navbar + halaman
  detail), prefix `-webkit-background-clip: text` di semua heading gradient.
- `RoleDetail`: separator chip dibungkus `.chip` biar titik tidak menggantung
  saat wrap baris.
- Ukur headless: mobile 390×844 ≈60fps (avg 16.7ms). Gate hijau: `format:check`,
  `build` 14/0, `responsive-audit` 364 ALL PASS, `verify-splash` PASS,
  `verify.mjs` `browserErrors: []`. Detail di `docs/assets.md`.

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
- **Hero di HP = statis by design**: gate `(min-width: 601px)` di `Hero.astro`
  bikin video `hero-bg` tidak pernah dimuat di `≤600px` (`preload="none"`,
  `opacity: 0`); yang tampil cuma `background.webp` + `figure.webp`. Jadi di HP
  hero cuma gambar, bukan bug / bukan aset lama. Particle Three.js juga
  desktop-only (`min-width: 768px`, sama dengan pinned sequence).
- **Navbar HP** (`≤760px`): blur sengaja 12px tanpa `saturate`/`brightness` dan
  morph instant. Jangan naikkan lagi ke 28px + transisi layout 0.9s — itu yang
  bikin scroll patah-patah.
- Aset hero lama `public/images/hero-2880.webp` (2880×1806, tak direferensikan
  sejak `c53d84d`) sudah dihapus; backup di
  `/home/faiz/ds/ds-backup/hero-2880.webp`.
- Untracked yang sengaja dibiarkan: `.agents/`, `skills-lock.json`,
  `assets/background/hd/video.mp4`, `assets/card baru/` (6 PNG belum dipakai).
- Referensi PNG "What We Do": `assets/assets home page/what we do/What We Do
Section.png` (5760×3376 → 1440×844). Patch glow terukur: center REF
  `rgb(67,52,113)`, upper-right REF `rgb(24,14,54)`.
- Font Nasalization belum di-bundle (lisensi) — jangan akali.
- **HoDS "hidup" (motion-only, `32e7491`).** Setelah 2 eksperimen dekoratif
  (sigil/ember di kartu & aura section) di-rollback karena user nggak suka, versi
  final = **motion saja tanpa mengubah tampilan statis**: (1) attract-mode rail
  di `DomainRail.astro` (sejak `6ca5b1e` **step satu kartu** via smooth-scroll ke
  snap point, dwell ~2.8s, desktop-only; idle ~3.5s; berhenti saat interaksi;
  re-cek reduced tiap step), dan (2) entrance
  `domainIntro()` di `motion.ts` (kartu lift+scale stagger, glow nyala). Semua
  di-skip saat `prefers-reduced-motion: reduce` → `verify.mjs` tetap exact.
  User menolak elemen dekoratif tambahan (sigil, ember, aura, indikator/dot) —
  jangan tambah bentuk baru tanpa izin. Checkpoint `checkpoint-pre-hods-magic`.
- **Perf & robustness pass (26 Sep 2026).** Dari audit home per-section:
  Batch 1 (`ef4a870`–`147a258`) — Philosophy pause off-screen + `sorcerer-2x`
  1722→1290w (HP DPR3 1.76→1.32MB), Hero rAF hanya saat terlihat, Projects buang
  `will-change` permanen, hapus 12 aset mati (336KB). Batch 2 (`6ca5b1e`–`f8ab577`)
  — rail attract-mode jadi step, fix sudut tilt WhatWeDo (`.pillar-inner`), gate
  figure Hero. Batch 3 (`090b059`) — Navbar indicator pakai `transform` +
  rAF-throttle + short-circuit, buang blur 30px menu HP, `inert` latar saat menu
  terbuka. Tampilan statis tidak berubah; semua gate tetap hijau.
- TODO: webfont Nasalization, data project asli, tanggal recruitment, halaman
  About Us / Hall of Frames / Partners / Contact, dan lanjutan animasi What We Do.
