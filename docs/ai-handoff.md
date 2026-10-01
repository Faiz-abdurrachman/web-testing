# AI handoff — current context

Tujuan: supaya AI agent berikutnya langsung paham kondisi repo **saat ini** tanpa
harus menebak dari git log. Ini dokumen hidup — update kalau ada perubahan besar.

Baca dulu, urut: `AGENTS.md` (aturan operasional) → `HANDOVER.md` (konteks
panjang) → `docs/assets.md` (provenance per section) → file ini.

## Ringkasan cepat (untuk AI baru) — 1 Oct 2026

Semua yang kamu butuhkan dalam ~30 detik. Detail/history ada di bawah.

- **Homepage hero — revisi font & spacing (PALING BARU, 1 Oct 2026):** Figma
  frame `1430:2040`; hero `1430:2041`. Judul pindah ke **Bluu Next Bold 72/86**
  (OFL, **di-bundle** `public/fonts/bluu-next-700.woff2`, token `--font-display`;
  Nasalization tetap untuk halaman lain), 2 baris `gap 4`, gradient per baris;
  paragraf Manrope 18/25 lebar 655; spacing 80/64/16/24. Tombol baru `community`
  (violet, hover `#2F196F`) + `explore` (glass, hover `#4C3B7E`); navbar CTA
  **"Join Us" 93 × 43** (global). **Art hero diganti plate Figma persis**
  (`Home-Hero-Plate.png` → `background.webp`, `generate-hero-layers.mjs`;
  `figure.webp` dihapus) → hero MAE **27.96 → 3.18**. Detail: `docs/assets.md`
  §Homepage hero — font & spacing revision.
- **Hall of Frames (WIP, 1 Oct 2026):** route `/hall-of-frames` (Figma page
  `1439:4506`, file `JYUzJK1hFqaEwL6DpdDvjp`). **Hero selesai** (`1439:4507`)
  → `HallOfFramesHero.astro` (MAE 4.34). **Featured Sorcerers selesai**
  (`1439:4512`) → `HallOfFramesFeatured.astro` (header Bluu Next 56; 8 kartu
  302×400, potret bleed di atas frame seperti Figma, overlay frame + fade dari
  render node karena string gradient MCP lossy → MAE **2.01**). Assertion
  `hofHero` + `hofFeatured` di `verify.mjs`, exit 0, `browserErrors: []`.
  Berikutnya: **Project highlights** (`1439:4655`) → Community Milestone
  (`1439:4699`). Nav "Hall of Frames" sudah aktif (`/hall-of-frames`).
- **Contact (belum dimulai):** route `/contact` (Figma `1445:5065`).
- **Partners Page (30 Sep 2026):** `/partners` (`PartnersHero` +
  `OurPartners` + `WhyPartners`, komponen & `data/partners.ts` baru). Nav
  "Partners" kini link asli. Geometri persis referensi (halaman 1440×2966: hero
  665 / Our Partners 1075 / Why 670 / footer 556), kartu partner 240×116 (grid 5) & kartu Why 309.5×189 (baris 4). **Logo partner masih placeholder DS**
  (20 slot). Aset: `npm run assets:partners`. Figma page `1331:15712`. Detail:
  §"Baru saja: Partners page" + `docs/assets.md` §Partners page.
- **About Us Page (selesai 30 Sep 2026):** `/about` telah diimplementasikan
  dari Hero sampai Section 4 secara presisi ke Figma (`RntmRWAgLrh5utgzcjrUik`):
  - Section 1: `AboutHero.astro` (`Hero Section - About Us`).
  - Section 2: `VisiMisi.astro` (`1248:14797`, tarot card, deskripsi, checklist misi).
  - Section 3: `Philosophy.astro` (`variant="about"`, node `922:16330`, `linear-gradient(163deg, #050507 63%, #6C3BFF 126%)`, full-bleed ke pinggir tanpa batas hitam, teks "We Build With It" tidak tersentuh glow).
  - Section 4: `OurEcosystem.astro` (node `1248:14877`, `linear-gradient(24.75deg, #050507 53%, #6C3BFF 133%)`, `align-items: flex-end` persis Frame 2587 sehingga ke-5 garis vertikal rata sempurna di atas garis horizontal baseline, angka 01-05 gradient vertikal + judul Bold 700).
  - Polish Section 4: header mendapat inset 10px sesuai Figma sehingga pipeline mulai y=374; garis vertikal CSS berubah ungu→putih sesuai sampel piksel PNG (SVG export Figma justru transparan di ujung bawah), baseline tetap SVG Figma. Ambient glow = **fill per-section** (bukan satu radial/parent bersama): Philosophy `163deg/63%/126%`, Ecosystem `24.75deg/53%/133%`, sudut+stop di-fit dari PNG node (MAE < 1); string gradient Figma MCP menormalkan handle (lossy) dan nilai lama `152.43deg`/`36.99deg` salah. Provenance: `docs/assets.md` §About Us — Our Ecosystem.
  - Responsif wide view: hanya canvas dalam Philosophy/Ecosystem yang scale mulus mulai viewport 1456px (maksimal 2×); section gradient tetap full-bleed. Zoom pada `body` pernah membuat gutter hitam dan tepi section bergeser, jadi jangan dipasang lagi. Ukuran referensi 1440px tetap sesuai Figma.
  - Pipeline responsif: 1051–1284px tetap 5 kolom fluid, frame 426px menjaga ujung kelima garis pada y=782 dan baseline pada y=799; 701–1050px grid 2 kolom (langkah kelima di tengah), ≤700px urutan 1 kolom. Desktop 1440px tetap sesuai Figma.
  - Sambungan Section 3 & 4 mengalir seamless tanpa patahan horizontal di seluruh resolusi (1366px, 1440px, 1920px).
- **Navbar (28 Sep 2026):** `Navbar.astro` + `.button.white` dirombak
  jadi **persis Figma** node `755:15178` / `assets/Navbar.png`. Ringkas: link `#707070`/aktif `#fff` + underline gradient 1px,
  grup kanan `menu (gap 18) → 90px → CTA` (CTA `173×42.1`), tab di-hardcode di
  ≥1301px (menu 753), scroll = backing kaca transparan `rgb(6 5 10 / 45%)` +
  `blur(12px)`. `npm run audit:navbar` assert geometri 1440.

- **Situs:** static **Astro 7** — 16 rute publik (`/`, `/about`, `/recruitment`,
  `/partners`, `/recruitment/roles/{6}` 6 halaman, `/hods/{6}` 6 halaman) +
  `/lab/sound` internal (`noindex`, di luar sitemap). Target: **pixel-accurate ke
  PNG referensi**, HTML/CSS ringan (bukan flatten screenshot).
- **Perbaikan lokal 29 Sep 2026:** sudut glow kartu HoDS yang menjadi kotak
  saat hover diperbaiki dengan `.domain-card-inner` sebagai clip wrapper tanpa
  transform; halo luar memakai radial gradient blur, outer card tetap memegang
  lift, grounding shadow, dan ring. Lihat
  `docs/assets.md` §"Domain card hover corner fix".
- **Footer background lokal 29 Sep 2026:** gambar baru `Gambar Footer(2).png`
  (7200×2780) menggantikan `footerhd.png`. `npm run assets:footer` menghasilkan
  WebP q90 responsif 1440/2880/5760/7200w + varian portrait HP 1170×3450;
  footer memakai `srcset`, layout teks tetap. Lihat `docs/assets.md` §Footer.
- **Philosophy float lokal 29 Sep 2026:** gambar sorcerer + FX kristal memakai
  dua lapisan komposit yang tersinkron (`translate3d()` 10px / 7s bolak-balik),
  sehingga spark mengikuti gambar sementara gambar bisa bergerak terpisah dari
  repaint FX. Promosi
  layer hanya saat section terlihat; FX dibatasi `contain: paint`. Frame
  reduced-motion tetap. Lihat `docs/assets.md` §Our Philosophy.
- **Available Roles divider 29 Sep 2026:** enam kartu kini menyembunyikan garis
  saat diam dan menggambarnya saat hover/fokus keyboard. Garis putih permanen di
  bawah animasi dihapus; `verify.mjs` cek keenam state diam dan hover pada dua
  baris. Geometri kartu tetap. Lihat `docs/assets.md` §Available Roles.
- **Runtime deps sengaja cuma** `astro` + `gsap` + `three`. Jangan tambah library
  lain tanpa tanya; lazy-import yang berat.
- **Commit terbaru (1 Oct 2026; `main` = `origin/main` = `production/main` =
  `e515b26`, sudah sinkron):**
  - `e515b26` **Homepage hero — revisi font & spacing** — Bluu Next Bold
    (OFL di-bundle) 72/86 gradient per baris, paragraf 18/25 lebar 655, spacing
    80/64/16/24; tombol `community`/`explore`; navbar CTA "Join Us" 93×43;
    **art hero = image fill Figma persis** (`Home-Hero-Plate.png` →
    `background.webp`, `figure.webp` dihapus) → hero MAE 27.96 → 3.18. Detail di
    §"Baru saja: Homepage hero".
  - `5329a4a` **hapus token Figma hardcoded** — `scripts/figma.mjs` dulu punya
    PAT di fallback; push ke production ditolak GitHub Push Protection. Fix:
    token dibuang (pakai env `FIGMA_API_KEY` / config MCP) + history
    `86b49c6..HEAD` di-rewrite (`git filter-branch`) membuang secret. **SHA lama
    di dokumen ini tidak berlaku lagi — pakai `git log` sebagai acuan.** Token
    lama **wajib di-revoke** di Figma (Settings → Personal access tokens).
  - `68b57d5` **Partners page** — rute `/partners` + `PartnersHero`/`OurPartners`/
    `WhyPartners` + `data/partners.ts`; nav "Partners" aktif; aset via
    `npm run assets:partners`; assertion `partnersGeometry` di `verify.mjs`.
  - `72a2cbf` **About Philosophy/Ecosystem wide-screen** — hapus cap zoom 2×
    (canvas selalu isi viewport), gradient About pindah ke canvas; lihat
    "Baru saja" di bawah.
  - `c0ee241` **docs** — handoff About Us + gotcha gradient Figma MCP.
  - `5e52601` **glow About = fill per-section Figma** — `Philosophy`/`Ecosystem`
    pakai `linear-gradient(...)` hasil fit PNG (lihat "Baru saja" di bawah),
    plus `OurEcosystem` (baseline SVG) + assertion `aboutEcosystem` di
    `verify.mjs`.
  - `f693196` **About Us page sections 1–4** — `AboutHero`, `VisiMisi`,
    `Philosophy` (`variant="about"`), `OurEcosystem` (pipeline
    `align-items: flex-end`, inset header 10px).
  - `52e815a` **Navbar persis Figma** (`755:15178`) — lihat section "Navbar".
  - `33c482a` **role card dividers** hanya saat hover/fokus.
  - `fe71b27` **VT hardening + OG hardening** — `verify-vt.mjs` kini uji
    Back/Forward lewat client router, reload deep-link `/#domains`, dan reduce
    benar-benar inert (tanpa `hero-ready`/`.pin-spacer`); `BaseLayout` dapat
    `<html prefix="og: https://ogp.me/ns#">` + `og:image:secure_url`.
  - `6aefa49` **perf** — `philosophy/sorcerer-2x.webp` di-re-encode 1290w
    (936→492 KB).
  - `c3b122c` **Perf P0(a)+(d)** — `sizes` Snippets jujur + varian 960w (HP
    berhenti ambil 2560w), `logo.png` 40→14 KB, hero `background`/`figure`
    180/86 KB. Recruitment mobile 2.09→1.15 MB. **Sisa P0 = tugas berikutnya.**
  - `473ca00` **Perf P0(b)** — **sorcerer → AVIF**
    (`sorcerer-2x` 481→196 KB, 1x 200→89 KB), **video hero di-re-encode** (home
    webm 0.74→0.38 MB / mp4 1.46→0.72 MB; recruitment webm 1.66→0.76 MB / mp4
    2.38→1.00 MB), **poster tak lagi di-fetch di HP** (dipasang via JS hanya saat
    video main). Home mobile 1.33→0.98 MB, recruitment 0.64→0.57 MB. P0 sisa
    tinggal opsional: AVIF hero art + ikon philosophy/glow kalau mau tembus
    ≤800 KB.
  - **Card hover (`6c79831` → `7821e87` → `4fe4c19`, 28 Sep 2026)** — kartu yang
    sudah bersound
    kini punya hover visual subtle (angkat + glow + ring menyala):
    `.domain-card`, `.project-card.is-active`, `.thumb`. Kartu Project juga
    opt-in `data-sfx-hover` (sebelumnya section Projects cuma panah/dot yang
    bersound). Semua di-gate `(hover: hover) and (pointer: fine) and
(prefers-reduced-motion: no-preference)` → state istirahat & `verify.mjs`
    tidak berubah. `.domain-rail` dapat `padding-block: 26px` +
    `margin-block: -26px` dan `.domain-carousel { display: flow-root }` supaya
    lift `-10px` tidak kepotong (scroll container clip 2 axis); geometri tetap
    (verify assert section `826` / card `y 310`). Detail di `docs/assets.md`
    §"Card hover on Domain / Project / Snippet cards". **Home/recruitment
    parity:** entrance GSAP `domainIntro()` dulu meninggalkan inline `transform`
    di `.domain-card`/`.glow` (menang atas CSS `:hover`) → cuma rail recruitment
    yang terangkat; `motion.ts` sekarang `clearProps: 'transform'` di akhir
    entrance. Terukur dua rail: `rest: none` / `hover: translateY(-10px)`.
    Commit: `6c79831` (fitur) → `7821e87` (parity `clearProps` + edge fade awal)
    → `4fe4c19` (edge fade kondisional).
    **Rail edge fade:** saat rail bergeser, kartu tepi dulu terpotong keras;
    `DomainRail` sekarang toggle `is-clip-left` / `is-clip-right` di `sync()`
    (dihitung dari apakah tepi rail jatuh di dalam kartu) + `mask-image` fade
    120px (gate `no-preference`). Kartu penuh tak pernah diredupkan (rail pas
    2/3 kartu saat diam) → `verify.mjs` tetap. Detail §"Rail edge fade" di
    `docs/assets.md`. **Terbuka:** user sempat lihat "kartu tepi kepotong" dan
    minta reproduce — sudah dicek: saat diam tak ada kartu separuh di lebar mana
    pun (390–1600), jadi partial hanya saat rail bergeser dan kini memudar.
    Belum dikonfirmasi user pakai screenshot penuh + lebar window.
  - **Keyboard carousel cues (`6c79831`, 28 Sep 2026)** — panah keyboard
    di `DomainRail` (Choose Your Domain / Who Should Join), `Projects`, dan
    `Snippets` sekarang dispatch `ds:sfx` cue `select` tiap kali menGeser
    carousel (input keyboard tidak lewat wiring hover/click delegated); di-drop
    saat reduced motion. Detail di `docs/assets.md` §"Keyboard carousel cues".
- **Latar yang tetap berlaku:** `450833a` migrasi View Transitions
  (`<ClientRouter />`, `AudioContext` persist; tiap komponen re-init lewat
  `astro:page-load` + cleanup `astro:before-swap` — aturan di
  `docs/sound-sop.md` §9) dan `601107b` sound Fase 2 (cue `transition` link
  internal).
- **Sound system (Fase 0–3) SELESAI dan disukai user** → SOP portable yang bisa
  dipakai ulang di project lain: **`docs/sound-sop.md`** (lihat §1–§3 + §10
  "Porting"). Ringkasan agent: `.agents/skills/data-sorcerers-sound/SKILL.md`.
  Aturan: **0 dependency, 0 file audio**, gate reduced-motion.
- **Motion GSAP + Three.js aktif** (`Motion.astro` → `motion.ts`): hero pinned +
  partikel, idle karakter, scroll reveal, tilt, magnetic. Semua **inert saat
  `prefers-reduced-motion: reduce`**.
- **Gate sebelum commit (semua harus exit 0):** `npm run format:check`,
  `npm run build` (0 error, **16 halaman**), `PREVIEW_URL=… node scripts/verify.mjs`
  (`browserErrors: []`), `node scripts/responsive-audit.mjs` (**16 rute × 26 lebar
  = 416 combos**), `npm run seo:audit` (17 halaman, sitemap 16). **Penting:** `verify.mjs` pakai `page.goto` penuh, jadi
  **tidak menguji navigasi klien** — pakai **`npm run verify:vt`**
  (`scripts/verify-vt.mjs`): cek konteks JS persist, komponen re-init, cue
  `transition` tepat satu, modifier tidak di-intercept, dan deep-link hash.
- **Deploy GANDA:** `git push origin main` → testing **dan** production.
- **Next:** §"Next plan — untuk AI berikutnya" di bawah. **About Us sections 1–4
  selesai**; **Partners page selesai** (`/partners`, 16 rute publik); Perf P0
  **selesai** (Home mobile 0.98 MB); sisa **opsional** (AVIF hero art + ikon
  philosophy/glow), konten asli, halaman **Hall of Frames / Contact** (nav masih
  `aria-disabled`), webfont Nasalization. VT hardening & OG **selesai**.

## Baru saja: Homepage hero — font & spacing revision (1 Oct 2026)

- **Sumber:** Figma file `JYUzJK1hFqaEwL6DpdDvjp`, frame `1430:2040` "Home Page
  Revisi Font & Spacing"; hero `1430:2041` (1440 × 903, padding 80, content
  centred), navbar `1430:2051`, buttons `1430:2048`. Referensi baru diexport via
  `figma_download_figma_images` (`Home-Hero-Revisi.png` + varian 2× & node teks).
- **Font:** desain pindah dari Nasalization ke **Bluu Next Bold**, dan Bluu Next
  **SIL OFL** → sekarang di-bundle (`public/fonts/bluu-next-700.woff2` +
  `BluuNext-OFL.txt`, `@font-face` weight 700, token `--font-display`). Halaman
  lain tetap Nasalization (belum direvisi) supaya diff/ geometri halaman itu tidak
  berubah.
- **Hero:** judul 72/86 dua baris `gap 4` + gradient per baris
  (`211.54deg #fff 32.8% / #999 49.8% / #fff 73.04%`); paragraf Manrope 18/25
  lebar 655; padding 80, gap 64/16/24. Posisi tinta cocok referensi ±1px.
- **Tombol** (`Button.astro`): varian baru `community` (primary violet hug 43px,
  hover `#2F196F`) & `explore` (glass, hover `#4C3B7E`; rim di-fit dari export
  karena inset shadow Figma jauh lebih terang dari node). Varian lama tidak
  diubah. Navbar CTA → **"Join Us"** `community` 93 × 43 (global; semua halaman),
  menu 743 / gap 195; `navbar-audit.mjs` diupdate.
- **Art:** `background.webp` + `figure.webp` (rekonstruksi, ~24 MAE) **diganti**
  image fill Figma `Home-Hero-Plate.png` → `background.webp` (1583 × 993, q85,
  82 KB) via `generate-hero-layers.mjs`; `figure.webp` dihapus. Idle karakter
  terpisah → idle halus seluruh plate (`motion.ts` `animatePlate`, overscan 1.05).
  Hero MAE (reduce, 1440) **27.96 → 3.18**.
- **Gate:** build 17 halaman, `verify.mjs` EXIT 0 (`browserErrors: []`),
  `responsive-audit` 416 ALL PASS, `navbar-audit` ALL PASS, `seo:audit` PASS,
  `verify:vt` PASS, `format:check` OK.
- **Berikutnya:** lanjutkan revisi font/spacing ke section homepage lain
  (Philosophy, WhatWeDo, HoDS, Projects, CTA) memakai `--font-display` + grid 8px;
  lalu halaman lain saat frame revisinya ada.

## Baru saja: Partners page (30 Sep 2026)

- **Rute baru `/partners`** (`src/pages/partners.astro`) — komponen
  `PartnersHero`, `OurPartners`, `WhyPartners` + `data/partners.ts` + Footer/
  Motion. Figma `RntmRWAgLrh5utgzcjrUik` page `1331:15712` (hero `1301:3740`,
  Our Partners `1297:3541`, Why DS `1331:15711`).
- **Geometri persis referensi** (full page 1440×**2966**): hero **665**, Our
  Partners **1075**, Why DS **670**, Footer 556. Kartu partner 240×116 (grid 5),
  kartu Why 309.5×189 (baris 4). Di-assert di `verify.mjs` (`partnersGeometry`).
- **Aset** (`npm run assets:partners`, `scripts/generate-partners-assets.mjs`):
  hero bg dari `Hero Section - Partners1.png` (art tangan bersih dari user,
  5760×2660); **kartu partner memakai artwork referensi `Frame 2655.png`**
  karena export swoosh Figma tidak mereproduksi gradient penuh; ikon Why dari 4
  `ChatGPT Image … 2*.png`; logo partner = **placeholder** DS
  (`Logo_transparan (1) 4.png`) untuk 20 slot.
- **Glow Why card** di-fit dari piksel referensi: `radial-gradient(108% 48% at
100% 100%)`; header 263px **top-align** (bukan center).
- Nav "Partners" kini link asli (bukan `aria-disabled`); label lain tak berubah.
  `responsive-audit` +1 rute (16×26=416 ALL PASS), `seo:audit` 17 halaman
  (sitemap 16). Detail: `docs/assets.md` §Partners page.

## Baru saja: About Philosophy wide-screen composition fix (30 Sep 2026)

- **Keluhan user:** di section Our Philosophy (`/about`), artwork menyentuh glow /
  terpotong di lebar desktop. Referensinya = komposisi 1440 (artikel punya jarak
  tetap ke glow). Saat zoom out kelihatan benar, di 100% "mepet".
- **Akar masalah:** `zoom` pada `.canvas` menskalakan artwork + konten, tapi
  `linear-gradient` section ada di `.philosophy` (full-viewport) sehingga tidak
  ikut berskala. Ditambah `.illustration { left: calc((1440px - 100cqw) / 2) }`
  di ≥1441px yang **dikalikan `zoom`** → artwork terdorong keluar kiri (di 2560
  tinggal sliver, di 3440 sudah hilang).
- **Fix:** gradient About dipindah ke `.philosophy.is-about .canvas` (ikut
  `zoom`), jadi glow + artwork + konten berskala seragam dari referensi 1440;
  breakpoint `zoom` 1456 → **1441** supaya canvas mengisi viewport tepat; dan
  `.philosophy.is-about .illustration { left: 0 }` menetralkan anchor `cqw`.
- **Tindak lanjut — bar hitam kiri-kanan (30 Sep 2026).** `zoom` masih di-cap
  `min(2, …)`, jadi di CSS viewport > 2880px (mis. browser zoom-out) canvas
  beku di 2880 dan tersisa gutter `#050507` di pinggir (≈7px di 2894, 480px di
  3840). **Cap dihapus** di Philosophy About **dan** Our Ecosystem
  (`zoom: calc(100vw / 1440px)`) → gutter 0 di 1440–5120px. `verify.mjs` cek
  full-bleed di 3200px.
- **Hasil terukur:** art-right→h2 gap konsisten −6…−12px sama seperti referensi
  di 1440–2880; seam Philosophy↔Ecosystem tetap nyambung (Δ ≤ 2/kanal di
  1440/1920/2560); 1440 MAE vs PNG 1.42. `verify.mjs` nambah assertion (zoom
  canvas, lebar canvas, containment artwork) di blok `aboutWide` (1920px).
  `responsive-audit` 390 combos ALL PASS, `verify.mjs` EXIT 0.
  Detail: `docs/assets.md` §About Us — Philosophy & Our Ecosystem.

## Baru saja: About Us glow = fill per-section Figma (30 Sep 2026)

- **Keluhan user:** implementasi glow sebelumnya (satu radial besar di parent
  bersama) membuat area ungu kegedean & tidak match Figma. **Figma = sumber
  kebenaran absolut.**
- **Hasil audit Figma MCP** (file `RntmRWAgLrh5utgzcjrUik`): halaman
  `About Us Page` `1277:18477` berisi section **bersaudara**; **tiap section
  punya fill sendiri**, TIDAK ada gradient parent / elemen dekoratif yang
  menyeberang seam.
  - Philosophy `922:16330`: `linear-gradient(163deg, #050507 63%, #6C3BFF 126%)`.
  - Our Ecosystem `1248:14877`: `linear-gradient(24.75deg, #050507 53%,
#6C3BFF 133%)`.
  - `Mask group` `922:16363` (kristal + ellipse `#6C3BFF blur(125px)`) milik
    Philosophy (artwork), bukan ambient.
- **Gotcha penting:** string `linear-gradient(...)` dari Figma MCP
  **menormalkan handle** (stop terakhir dipaksa 100%) → lossy. MCP bilang
  `170deg/59%/100%` (Philosophy) & `16deg/57%/100%` (Ecosystem), tapi render node
  asli cocok dengan `163deg/63%/126%` & `24.75deg/53%/133%` (MAE < 1 vs MCP ≈ 17).
  Nilai lama `152.43deg`/`36.99deg` juga salah (MAE ≈ 4.3). **Selalu export node
  via MCP lalu fit piksel PNG**, jangan paste string gradient MCP mentah.
- **Implementasi:** `.philosophy.is-about` & `.ecosystem` pakai `background:
linear-gradient(...)` hasil fit. Tidak ada parent bersama, tidak ada pita seam.
  Seam terukur nyambung (Δ ≤ 2/255). Area ungu 22% (Philosophy) / 30% (Ecosystem),
  stabil 375–2560px (zoom proporsional karena `canvas { zoom: 100vw/1440 }`).
  Provenance: `docs/assets.md` §About Us — Our Ecosystem.
- **Verifikasi:** background MAE vs PNG node 0.73/0.63 per kanal; `verify.mjs`
  EXIT 0, `responsive-audit` 390 ALL PASS, `seo:audit`, `verify:vt` PASS.

## Baru saja: Navbar exact Figma redesign (28 Sep 2026)

- **User minta `Navbar.astro` sama persis dengan Figma node `755:15178`
  (component set `530:13894`) / `assets/Navbar.png` (7200×534 = frame
  1440×106.8 @5×), konsisten di semua layar.** Ini **menggantikan** desain
  "living HUD" (kapsul kaca melayang + indikator meluncur + flash + cursor bloom)
  — section lama di bawah kini sejarah.
- Perubahan `Navbar.astro`:
  - Bar default = gradient Figma `180deg rgba(108,59,255,.1) → transparent`
    (`.navbar::before`), bukan transparan polos.
  - Link non-aktif `#707070` (Figma `fill_c809fc54`), aktif `#fff` + **underline
    gradient 1px** `163deg #9b7bff → #ede8ff → #9b7bff` selebar label (Home 49px;
    `align-self: stretch` dalam kolom hug). Item lain simpan underline tak
    terlihat agar tinggi seragam.
  - Layout = **grup kanan** (`nav` + CTA): tab `gap 18px`, **gap 90px** ke CTA,
    `padding 24px 80px`, frame `max-width: 1440px`, tab `padding 8px 14px`,
    Manrope Medium 18/27. **≥1301px lebar tab di-hardcode ke Figma** (Home 78,
    About Us 106, Recruitment 134, Hall of Frames 146, Partners 101, Contact 98 →
    menu **753**), CTA `width 173px` → geometri 1440 persis tanpa tergantung
    rasterisasi font; 1051–1300px tetap fluid `clamp()`.
  - `is-condensed` **dihapus**; scroll hanya cross-fade ke backing **kaca
    transparan** `rgb(6 5 10 / 45%)` + `blur(12px) saturate(130%)`
    (`.navbar::after`) — bukan solid gelap, jadi tidak terlihat kotak pekat.
    `is-ready` entrance tetap.
  - CTA `Button variant="white"` = Figma `97:483`: `width 173px`,
    `height 42.1px`, `padding 4px 16px`, rim gradient `148deg` 2px via `::after` +
    `mask-composite` (menggantikan outline rata `#cbc5ff`).
  - Mobile: hamburger full-screen tetap; warna link diselaraskan (`#707070`
    non-aktif, `#fff` aktif + baris gradient violet).
- `scripts/navbar-audit.mjs` **ditulis ulang**: assert geometri persis di 1440
  (logo 80/24, CTA kanan 1360 & tinggi 42.1, gap menu→CTA 90, underline = lebar
  label), backing toggle + tanpa overflow di 20 lebar, reduce instant. Gate
  hijau: `format:check`, `build` 15 halaman, `verify.mjs` (`browserErrors: []`),
  `responsive-audit` 364 ALL PASS, `verify:vt` PASS, `seo:audit` PASS,
  `audit:navbar` ALL PASS.
- Referensi `assets/Navbar.png` (root `assets/`, belum di-track).

## Checkpoint terakhir (28 Sep 2026) — detail

- **HEAD saat itu `4fe4c19` (28 Sep 2026); HEAD sekarang `dd87041` (30 Sep 2026).** Di atas migration VT + sound: `fe71b27`
  (VT + OG hardening), `6aefa49` (re-encode `sorcerer-2x`), `c3b122c` (Perf P0
  a+d), `473ca00` (Perf P0 b: AVIF sorcerer + video + poster), `6c79831` (hover
  kartu + keyboard cues), `7821e87` (parity hover home + edge fade awal),
  `4fe4c19` (edge fade kondisional). Ringkasan tiap perubahan ada di section
  "Baru saja" di bawah; sisa P0 ada di "Next plan".
- **Repo + deploy GANDA (penting).** `origin` =
  `github.com/Faiz-abdurrachman/web-testing` (testing) dan setelannya sudah
  **push ke production sekaligus**: `origin` punya dua push URL → `git push
origin main` mengirim ke **testing + production**
  (`github.com/Web-Data-Sorcerers/community-web`, remote `production`).
  Jalankan `git push origin main` seperti biasa; kalau perlu cek sinkron pakai
  `git fetch production -q && git rev-parse --short main origin/main
production/main`. **Update 30 Sep 2026:** `main` = `781278e` sedangkan
  `origin/main` = `production/main` = `86b49c6` (**beberapa commit lokal belum di-push**,
  working tree bersih).
- **Available Roles glow wave DIPERKECIL.** `@keyframes role-glow-wave` sekarang
  cuma `scale: 1 → 1.04` (drift `translate ±6%` dibuang) supaya ukuran glow
  balik ke frame statis. Hover kartu dapat "pointer pool" radial violet (ikut
  kursor via `--mx/--my`) + ember lean (`--gx/--gy`) + divider yang tergambar +
  panah overshoot; semuanya di-gate `no-preference` + `(pointer: fine)`. Commit
  `f92b88a` (hover) & `d26f81e` (glow tune).
- **Navbar mobile proporsional (`12c683d`).** Saat `is-condensed`, aturan base
  `.navbar.is-condensed { --nb-pad: 80px }` menang specificity atas
  `--nb-pad: var(--page-gutter)` di `@media (max-width:1050px)` → logo/burger
  kedorong 80px dari tepi. Fix: reset `--nb-pad` ke page gutter di media ≤1050.
- **Detail role/HoDS mobile tanpa celah hitam (`d0fd3be`).** Kalau konten lebih
  pendek dari layar (HP + browser chrome sembunyi), body `#050507` tampak sebagai
  strip hitam di bawah gradient. Fix: `main` dapat `min-height: 100vh` +
  `100lvh` **khusus `@media (max-width:900px)`** supaya gradient mentok ke bawah.
  **Jangan naikkan ke base:** `verify.mjs` men-set viewport `1440×1400` dan
  meng-assert `.role-detail` height **1280** — ngasih min-height di desktop bikin
  test gagal.
- **Perf: detail ringan, Home/Recruitment berat.** Detail 0.20–0.33 MB, LCP
  ~0.6–1.0 s. Home desktop ~2.1 MB + LCP tinggi; Recruitment ~3.1 MB. Akar utama:
  splash nunggu `three` (181 KB gz) + video, `sizes="1280px"` di Snippets bikin
  HP ambil varian 2560w, video hero 0.6–1.6 MB, gambar kebesaran. **P0 sudah
  dieksekusi** (Home mobile 1.33→0.98 MB); sisa opsional + P1/P2 — lihat
  "## Perf audit & rencana".
- **OG/share WhatsApp.** Tag OG di server sudah benar & kebaca crawler
  (diverifikasi via UA WhatsApp/Facebook + Microlink). WhatsApp nggak nampilin
  preview = cache Meta, bukan bug kode → refresh lewat Facebook Sharing Debugger.
  Hardening `og:image:secure_url` + `<html prefix="og: https://ogp.me/ns#">`
  **sudah diterapkan** (`fe71b27`).
- **Sound system selesai (`66b284e`, 28 Sep 2026).** SFX prosedural + backsound
  ambient (Web Audio, **0 aset, 0 dependency**), orb mute melayang, wiring
  komponen, halaman audisi `/lab/sound`. Detail lengkap + SOP di
  **`docs/sound-sop.md`**; ringkasan agent di skill
  `.agents/skills/data-sorcerers-sound/SKILL.md`. Section "## Sound system" di
  bawah merinci arsitektur.
- **View Transitions aktif (28 Sep 2026).** `<ClientRouter />` (`astro:transitions`)
  di `BaseLayout` → navigasi antar-halaman **klien** (cross-fade, tanpa reload),
  dan `AudioContext` **persist** sehingga ambient + cue `transition` tidak putus
  (keluhan user "suara kepotong + pindah tab ga smooth"). Efek berantai:
  script bundled **tidak** re-run saat swap, jadi tiap komponen di-re-init lewat
  `astro:page-load` + cleanup (`AbortController`/observer/timer); `motion.ts`
  dapat `destroyMotion()` (revert `gsap.matchMedia` + kill ScrollTrigger) yang
  dipanggil di `astro:before-swap`; `mountHeroParticles()` mengembalikan
  `dispose()` (renderer/geometry/texture/rAF/listener) dipanggil juga di
  `before-swap`; class runtime `<html>` (`splash-done`/`nav-warm`) di-re-apply di
  `astro:after-swap`; hash di-re-apply di `astro:page-load`. Verifikasi:
  **`npm run verify:vt`** (`scripts/verify-vt.mjs`, sudah di-commit) hijau
  (konteks JS persist, FAQ/Snippets/DomainRail re-init, cue tepat satu, deep-link
  `#domains` top≈110). **Detail §9 `docs/sound-sop.md`.**
- **Sound Fase 2 — page-transition cue (28 Sep 2026).** Cue baru `transition`
  (~0.28 s "seal" whoosh + pluck) dimainkan saat klik link **internal**
  (Navbar, kartu role/HoDS, back link ber-hash). Intercept ada di `Sound.astro`
  (delegated, satu listener, `document` persist): main `transition` tanpa
  `preventDefault`/delay (ClientRouter yang navigasi). Pointer-only
  (`event.detail > 0`), hormati modifier/`target`/`download`/`tel:`/`mailto:`/
  hash same-page/link URL saat ini; reduce = wiring mati. Cue transisi
  **menggantikan** cue `data-sfx` link (tidak dobel). `whoosh(dir, duration)` +
  `isReady` ditambah di `sound.ts`; `transition` masuk audisi `/lab/sound`.
  Smoke: `npm run verify:vt` hijau (normal/reduce/modifier/kartu-`open`/
  back-hash). Tuning level cue (Bagian B) **ditunda**.
- **Gate terakhir (HEAD `66b284e`) hijau:** `format:check`, `build` 15 halaman
  (14 + `/lab/sound`), `verify.mjs` (`EXIT 0`, `browserErrors: []`),
  `responsive-audit` 364 combos ALL PASS, `seo:audit` PASS (sitemap tetap 14),
  `audit:navbar` ALL PASS.

## Baru saja: View Transitions hardening + OG hardening (28 Sep 2026, di atas `b4a8b80`)

- **OG:** `BaseLayout.astro` kini `<html prefix="og: https://ogp.me/ns#">` dan
  punya `og:image:secure_url`; `npm run seo:audit` PASS (15 halaman, sitemap 14).
- **`scripts/verify-vt.mjs` diperluas** — semua hijau, `pageerrors: none`:
  browser **Back/Forward** lewat client router (konteks JS persist, tanpa
  reload), **reload** deep-link `/#domains` tetap mendarat `top ≈ 110`, dan saat
  **reduce** tidak ada `hero-ready` maupun `.pin-spacer` di home/recruitment.
  Uji lama (cue `transition` tunggal, komponen re-init, modifier) tetap lolos.
- **Perf client-nav (report-only).** Chromium software-render + CPU 4×: warm
  client-nav home→recruit ~9 long task / 1566 ms, recruit→home ~10 / 1540 ms
  (max 720 ms); full reload home 981 ms, recruitment 871 ms. Jadi VT menambah
  kerja di halaman berat (GSAP pin + Three particles + re-init komponen) —
  optimasinya bagian **Perf P0/P1** (butuh acc), bukan regresi baru. Angka
  inflasi (software render) → bandingkan relatif.
- **Gate hijau (di atas `b4a8b80`):** `format:check`, `build` 15 halaman 0 error,
  `verify.mjs` `EXIT 0` (`browserErrors: []`), `responsive-audit` 364 ALL PASS,
  `seo:audit` PASS, `verify:vt` `EXIT 0`.
- **Sisa (manual, tidak di mesin ini):** uji Safari/Firefox & perangkat asli
  (Playwright firefox belum terpasang). Fallback non-View-Transitions ditangani
  Astro; belum diverifikasi langsung.

## Baru saja: Perf P0 — Snippets sizes + aset ringan (28 Sep 2026)

Scope yang disetujui: (a) `sizes` Snippets + (d) kompres logo/mobile hero.

- **(a) Snippets.** `Snippets.astro` `sizes` dibuat jujur
  (`(max-width:760px) calc(100vw - 48px)` → `(max-width:1440px) calc(100vw - 160px)`
  → `1280px`) + varian **960w** baru (`npm run assets:optimize`). HP berhenti
  mengunduh `-2x` 2560w: DPR3 390 pilih `snippet-hero-N.webp` (1280w), DPR2 390
  pilih `snippet-hero-N-960.webp`.
- **(d) Aset.** `logo.png` palette → **40 → 14 KB** (opaque-MAE 1.4); hero
  `background.webp` q86→q82 → **219 → 180 KB** (MAE 1.6); hero `figure.webp`
  lossless→nearLossless q60 → **128 → 86 KB** (opaque-MAE 1.6). Diubah di
  `scripts/optimize-images.mjs` (logo + 960 variant) & `generate-hero-layers.mjs`
  (bg/fig); reproducible (pristine di `assets/image-src/`; pack hero di arsip).
- **Terukur (mobile 390, `transferSize`):** `/recruitment` **2.09 → 1.15 MB**
  (DPR3) / **0.93 MB** (DPR2); `/` **1.40 MB**. `verify.mjs` before→after delta
  **0.000** untuk semua section (hero −0.03), `browserErrors: []`.
- **Koreksi dokumen:** splash **tidak** menunggu `three` di HP —
  `hero-particles.ts` `return` sebelum push di `<768px`; hanya desktop (≥768)
  yang preload `three`+video, sesuai tujuan splash (**jangan dihapus**). Jadi
  mengecilkan byte gambar langsung memperpendek splash HP.
- **Gate hijau:** `format:check`, `build` 15 halaman 0 error, `verify.mjs`
  `EXIT 0`, `responsive-audit` 364 ALL PASS, `seo:audit` PASS, `verify:vt` `EXIT 0`.
- **Sisa P0:** (c) re-encode video hero; kompres `sorcerer-2x.webp` (481 KB,
  target ~150 KB); hindari `hero-poster.webp` (74 KB) ke-fetch di HP.

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

- **Hero home ganti plate video + crop dilepas (26 Sep 2026):** background hero
  home sekarang pakai `assets/assets home page/hero section/hero.mp4`
  (1280×720, 24 fps, 10 s) — "clean plate": **tanpa bolt terlukis, tanpa sparkle
  Gemini**, komposisi stabil (`signalstats` YAVG ~55–56 tiap frame).
  `scripts/generate-hero-video.mjs` diubah: `SRC` baru, `DURATION='5'` →
  boomerang (5 s depan + reverse) jadi loop **10 s** mulus; **crop + scale
  dilepas** — ekspor frame native **1280×720** (dulu `1046×656+66+32` +
  `scale=1582:992:lanczos`, ~1.5× upscale), sisa hanya `unsharp`.
  `.art-video` `object-position` jadi **`50% center`** (dulu `80%` yang
  di-tune untuk frame ter-crop; dengan frame 16:9 penuh `80%` mendorong staff
  keluar sisi kanan di lebar sempit). Output **h264 crf21** (1.46 MB) +
  **AV1 crf34** (0.72 MB) + `hero-poster.webp` frame 0 (74 KB). Grade tanpa
  koreksi ("pakai apa adanya"). Gating ≥601px, dan fallback statis tak berubah
  (reduce/≤600px tetap `background.webp` + `figure.webp`; verify aman).
- **Available Roles cards redesign (26 Sep 2026):** kartu diganti dari Figma
  `1184:1475` / `1218:1385` (ref `assets/assets recruitment page/available roles/
Card Role *.png`, 1652×956). Base `#2a2a2c`, glow violet kanan-bawah
  (`public/images/recruitment/role-glow.webp`, diekstrak dari `Card Role 1.png`,
  MAE ≈ 2.5), ring gradient **`150deg`** (bukan `135deg` Figma — supaya mid-edge
  cocok dengan PNG), radius `20px`, `aspect-ratio 1652/956`, semua ukuran `cqw`.
  Isi: judul Title Case (`domains.ts`) → tagline baru `roles.ts` `tagline` →
  divider gradient → `View Details` + panah `basil:arrow-right-solid` (inline).
  Sparkle, nomor `01 / OPEN ROLE`, chip, dan frame emas **dibuang**. Grid 3/2/1
  `gap 40px 20px`. Geometri `verify.mjs` kini section `851.375`, list `518.375`,
  kartu `413.33 × 239.19`, plus cek overflow konten kartu 320–1920px. Glow
  dipindah ke layer `.role-glow` yang **hidup** (`transform-origin: 50% 100%`,
  `alternate` 9s, stagger per kolom). **DIREVISI 26 Sep (`d26f81e`):** `scale`
  hanya `1 → 1.04` dan drift `translate ±6%` **dibuang** — user bilang glow
  terlihat kegedean, jadi ukurannya dibuat mendekati frame statis. Gate
  `no-preference`, pause off-screen via `.available-roles.is-idle` (observer
  `motion.ts`). Statis (reduce) = persis referensi. Ditambah hover
  pointer-reactive (`f92b88a`): pool radial ikut kursor, ember lean, divider
  draw, panah overshoot.
- Branch `main`, fitur homepage + Recruitment + role detail + HoDS detail sudah
  jadi. Motion GSAP + Three.js **aktif** (`src/components/Motion.astro` →
  `src/scripts/motion.ts`).
- Semua gate hijau: `format:check`, `build` (14 halaman), `verify.mjs`
  (`browserErrors: []`), `responsive-audit.mjs` (364 combos), `seo:audit`.
- **Terbaru:** splash jadi **preloader asli** (nunggu three + video + fonts),
  perf What We Do (starfield tile + `perf:audit`). Navbar "living HUD" →
  **digantikan 28 Sep 2026** oleh navbar persis Figma (lihat section di atas).
- **Glow CTA (home + recruitment page) satu arah:** `cta-glow-sweep` — glow
  geser kiri→kanan terus berulang (bukan ayun/ombak), opacity turun cuma ke
  `0.5` di seam jadi tak pernah hilang; dipakai di `Recruitment.astro` dan
  `Cta.astro`, pause lewat `.is-idle` saat off-screen.
- **(LAMA — digantikan 28 Sep 2026) Kapsul navbar hug logo/CTA:** tepi kapsul `is-scrolled` gak lagi ikut frame
  konten penuh, tapi `--nb-frame-panel` (= frame − 2×(`--nb-pad` − `--nb-hug`,
  24px)) → ujung kapsul ~24–28px dari logo & tombol Join Community (dulu ~80px).
- **Navbar proporsional + mulus (26 Sep 2026):** `.desktop-menu` jadi
  `display: contents` → `nav` & CTA jadi anak flex langsung `.navbar-inner`, jadi
  `space-between` membagi `logo | menu | CTA` dengan gap **sama** di semua lebar
  (dulu blok menu+CTA dipaku ke kanan → jarak logo→Home 135–347px di atas,
  215px saat scrolled). Sekarang ~150px scrolled di 1440/1456, simetris dua sisi,
  responsif 58→239px. Plus **hysteresis** kelas scroll (`is-scrolled` 10 masuk/6
  keluar, `is-condensed` 44/36) supaya tidak chatter di ambang, dan loop rAF
  `followFor(1000)` **dihapus** (offset link relatif ke `nav` konstan). Audit baru
  `scripts/navbar-audit.mjs` (`npm run audit:navbar`, 20 lebar).
- **Hero recruitment pakai video (26 Sep 2026, Phase 1):** `recruitment-hero1.mp4`
  (1920×1080, 10s) jadi plate hero hidup di atas fallback statis
  `recruitment.webp`, pola sama dengan `Hero.astro`. Diencode lewat
  `scripts/generate-recruitment-hero-video.mjs` → `public/images/recruitment/
hero-bg.webm` (1.66 MB) + `hero-bg.mp4` (2.38 MB) + `hero-poster.webp` (64 KB),
  audio dibuang. Loop **crossfade circular** 1s (seam 7.24 → 1.18/255, tanpa
  membalik aurora). Gating ≥601px + no-preference + bukan saveData; reduce/≤600px
  tetap statis (gate `verify` aman). Pause off-screen + tab hidden.
  - **Quality pass (26 Sep 2026):** semula 1920×1080 AV1 **crf44** (~450 kbps)
    → blok 8×8/16×16 kelihatan di langit gelap (yang dikeluhkan "burik"),
    diperparah crop `cover` + pinned zoom 1.35× (≈2× upscale device px di
    retina). Sekarang disajikan **2560×1440** (lanczos + `unsharp`) dengan AV1
    crf34 / x264 crf24; blocking hilang, bintang tetap tajam saat zoom. Cuma
    satu codec di-fetch per browser (Chrome/Edge webm dulu, Safari mp4).
- **Footer HD + backdrop portrait HP (26 Sep 2026):** background pakai
  `footerhd.png` yang lebih tajam/terang lewat
  `scripts/generate-footer-background.mjs` (`npm run assets:footer`) →
  `footer.webp` (q88, MAE 1.21). Di mobile landscape 2.59:1 tak bisa nutup footer
  portrait tanpa zoom `cover` ~1.33× → upscale ~4× @DPR3 (itu penyebab "burik").
  `Footer.astro` sekarang punya `<source media="(max-width:600px)">` ke
  `footer-mobile.webp` (1170×3450, q84, 86 KB) — langit bintang + landscape
  di-anchor bawah (`object-position: center bottom`). Desktop tetap landscape
  native, geometri/diff `verify.mjs` tidak berubah.
- **Hero recruitment jadi motion penuh (26 Sep 2026, Phase 2):** halaman
  `/recruitment` sekarang meng-include `<Motion />` (sebelumnya hanya home, jadi
  GSAP tidak jalan di sana sama sekali). Di `src/scripts/motion.ts` ditambah blok
  `.recruitment-hero`: **entrance** copy/CTA (tunggu `ds:splash-done`, skip saat
  `nav-warm`), **pointer parallax** plate (`scale 1.04` overscan + `xPercent`/
  `yPercent` ±1.5%), dan **pinned scroll zoom** ≥768px (`end +=110%`, `scrub 1`,
  `scale 1.04→1.35`, copy naik `y:-200` + fade). Inert di reduce → `verify.mjs`
  tetap 866/geometri. Pin pakai `scale` di `.artwork`; overscan 1.04 bikin art
  tetap nutup viewport 903 selagi section-nya cuma 866 (tidak ada seam). Mobile
  <768px tanpa pin. **Phase 3 (26 Sep 2026):** field partikel Three.js
  diekstrak ke `src/scripts/hero-particles.ts`
  (`mountHeroParticles(canvas, host, preload, { preset })`, sekarang dipakai
  `Hero.astro` + `RecruitmentHero.astro`, canvas `.hero-canvas`), burst
  digerakkan timeline pinned via `window.__heroParticles.burst`. Dua preset biar
  dua hero nggak kembar: **`motes`** (home, default, 700 titik yang rush ke
  kamera saat zoom) dan **`embers`** (recruitment, 220 spark lebih besar/hangat
  yang naik + sway, fade di tepi atas/bawah, burst cuma ngebut-in laju — tanpa
  rush kamera/morph ukuran). Desktop-only ≥768px, inert di reduce/mobile, error
  WebGL di-swallow biar art statis tetap tampil.
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

## Baru saja: Navbar "living HUD" (kaca melayang + flash + indikator meluncur) — DIGANTIKAN 28 Sep 2026

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
  `public/images/starfield/starfield-{base,far,near}.png`
  (520×440 / 440×360 / 520×400) — dipindah dari `public/images/what-we-do/`
  karena dipakai bersama. Tampilan **pixel-identical** ke versi CSS
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

## Hero headline "strike" — DIHAPUS (26 Sep 2026)

**Status:** efek kilatan petir di headline **sudah dihapus** dari
`src/components/Hero.astro` atas permintaan user ("ilangin efek petir").
Markup `.strike`, CSS `.bolt`/`.bolt-*`/`.strike-burst`, rule `.bolt path` di
blok `hero-ready`, dan keyframes `strike-draw`/`strike-burst` dibuang; tidak ada
referensi `bolt`/`strike` yang tersisa (`.title-wrap` + `h1 { position:relative;
z-index:1 }` dipertahankan, no-op). Deskripsi di bawah = riwayat implementasi
25 Sep 2026.

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

Video `hero-bg.webm/mp4` sekarang diekspor **native 1280×720** (crop/scale
dilepas, 26 Sep 2026) dan menggantikan layer statis di `≥601px`. Karena platnya
16:9 sementara hero-nya ~1.594 aspek, `object-fit: cover` hanya mencrop sisi
kiri/kanan. Dengan `object-position` off-centre (`80%`) lebar portrait
601–~730px mendorong tongkat/kanan karakter ke luar tepi kanan ("belum masuk
frame"). Fix: `.art-video { object-position: 50% center }` di `Hero.astro` →
pusat karakter (~53% sumber) + tongkat utuh sampai gate 601px. Rule ini no-op
saat tak ada crop horizontal (desktop), dan override `max-height:560px` /
`min-width:1921px` tetap menang. Terverifikasi di Chromium 1440, 900, 768, 733,
675, 601 px.

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
   (dibuat `scripts/generate-hero-video.mjs`, sharpen pass sama biar pas).
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

### Starfield hidup dipakai bareng Who Should Join + What You Will Do + FAQ (26 Sep 2026)

Permintaan: bintang di recruitment section **Who Should Join** (`We welcome
passionate individuals…`), **What You Will Do** (`Life inside the Data
Sorcerers ecosystem`) dan **FAQ** harus hidup seperti section **Four Pillars of
Innovation** di home — "background bintangnya di samain aja".

- Langit Four Pillars (base tile + `far` drift 12s + `near` drift 7s) diekstrak
  jadi `src/components/Starfield.astro`; tile dipindah ke
  `public/images/starfield/` (dulu `public/images/what-we-do/`).
- Ketiga section (`WhoShouldJoin` → `.who-should-join`, `WhatYouWillDo` →
  `.what-you-will-do`, `Faq` → `.faq`) render `<Starfield />` sebagai child
  pertama, dan CSS-nya dapat `position: relative; isolation: isolate` (layer-nya
  `position: absolute; inset: 0; z-index: -1; overflow: hidden`, jadi geometry
  tidak berubah — verify Who Should Join `1440×789` & FAQ `1440×986` tetap).
  `backgrounds/stars.webp` dihapus (tidak ada konsumen lagi).
- `motion.ts` menambah ketiganya ke observer `is-idle` (bareng
  `.recruitment`/`.cta`) supaya drift pause saat off-screen.
- Terukur: dua frame jarak 2.2s beda (`frameMAE ≈ 0.04`) saat `no-preference`,
  `0.000` saat `reduce`. `perf-audit` semua section long task 0.

## Yang perlu kamu tahu soal motion

- Hero: pinned scroll sequence (`≥768px`), karakter idle, parallax pointer,
  partikel Three.js lazy-import di `Hero.astro` (`window.__heroParticles`).
- What We Do (`≥761px`): "summon from the core" auto-play sekali (lihat bagian
  atas); card `tilt()` hover jangan diadu dengan `rotationX/Y` entrance.
- Helper di `motion.ts`: `reveal`, `tilt` (3D, `finePointer`), magnetic button,
  cursor glow. Card tilt HoDS + `.pillar` ada; jangan buang tanpa alasan.
- **Client-side navigation (ClientRouter):** `Motion.astro` memanggil
  `initMotion()` di `astro:page-load` dan `destroyMotion()` di
  `astro:before-swap` (revert `gsap.matchMedia` + kill ScrollTrigger). Karena
  listener `astro:page-load` persist, `initMotion` juga jalan di halaman detail
  (tanpa hero) — praktis no-op kecuali magnetic `.button`; inert saat reduce.
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
- Navbar (pass 25 Sep 2026 — **digantikan 28 Sep 2026**): dulu `backdrop-filter`
  hanya saat `.is-scrolled::before`, `≤760px` blur 12px tanpa saturate/brightness
  dan morph instant. Sekarang lihat §"Baru saja: Navbar exact Figma redesign".
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

## Sound system — Fase 0 (28 Sep 2026)

SFX prosedural lewat **Web Audio API**, tanpa aset audio & tanpa dependency baru.
`src/scripts/sound.ts` (singleton `sound`) mensintesis 7 cue (`hover`, `click`,
`select`, `open`, `close`, `success`, `error`) + reverb impulse yang digenerate di
runtime. `src/components/Sound.astro` di-mount **sekali di `BaseLayout`** (semua
14 rute) dan:

- merender **orb mute melayang pojok kanan-bawah** (`.sound-toggle`, `z-index: 40`
  — di bawah navbar/menu HP `z 50`), menyimpan preferensi di
  `localStorage['ds:sound']`;
- memasang **delegated listener**: elemen ber-atribut `data-sfx` → cue klik,
  `data-sfx-hover` → cue pointer-enter (tanpa handler per komponen);
- autoplay: `AudioContext` di-`unlock()` pada gesture pertama; `play()` diam
  kalau context belum `running` / sedang mute;
- gate: wiring tidak dipasang saat `prefers-reduced-motion: reduce` → audit
  (force reduce) tetap senyap & `browserErrors: []`.

Audisi palet: **`/lab/sound`** (7 tombol cue; noindex, dikecualikan dari sitemap
lewat `sitemap({ filter })` di `astro.config.mjs` — jaga agar sitemap tetap 14
URL untuk `seo:audit`).

- **Fase 1 (28 Sep 2026) — komponen sudah di-wire:** `data-sfx` (klik) /
  `data-sfx-hover` (pointer-enter) ada di Button, brand + nav-link + hamburger
  Navbar, DomainCard, rail arrow, AvailableRoles, Projects (arrow/dot),
  Snippets (arrow/thumb), FAQ summary, tab HoDSDetail, back link Role/HoDS,
  Footer. Cue stateful dikirim lewat event `ds:sfx` (`detail.cue`): menu mobile
  `open`/`close` (Navbar), FAQ `open`/`close`, tab `select`, splash selesai
  `success`. Hover di-gate `(hover: hover)` supaya HP tidak berisik.
- **Fase 2 (28 Sep 2026) — page-transition cue:** delegated `click` di
  `Sound.astro` mendeteksi link internal same-origin (pointer-only, tanpa
  modifier/target/download/tel/mailto, bukan hash same-page) → main cue
  `transition` **tanpa delay** (ClientRouter yang melakukan navigasi klien).
  Menggantikan cue `data-sfx` link itu supaya tidak dobel; reduce = wiring mati.
  `whoosh(dir, duration)` + `isReady` ditambah di `sound.ts`; cue `transition`
  tampil di `/lab/sound`. Wiring delegated dipasang sekali (guard
  `window.__dsSoundWired`) karena `document` persist; orb di-rebind per
  `astro:page-load`.
- **Fase 3 (28 Sep 2026) — backsound ambient:** `sound.ts` punya drone
  prosedural ("pad") — 4 sine detuned (A2/E3/A3/E4) + noise lowpass dengan LFO
  napas & sweep cutoff lambat, di-route ke reverb, **tanpa aset & tanpa JS
  per-frame**. Mulai otomatis setelah gesture pertama (saat sound on), fade
  `setTargetAtTime` 1.2s biar tidak nge-click; mati saat mute, tab `hidden`,
  atau `prefers-reduced-motion` (`setAmbientAllowed(false)` dari `Sound.astro`).
  Gain target `0.28`. Tidak ada tombol terpisah — orb mengontrol SFX + ambient.
- `verify.mjs` mem-hide `.sound-toggle` via `addInitScript` (overlay bukan
  bagian PNG referensi) + masuk daftar `setNavbarHidden`. Semua non-visual:
  `responsive-audit` & `verify.mjs` tetap bersih.

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

## Perf audit & rencana (28 Sep 2026)

Diukur Playwright + CDP (Chromium, throttle **4G + CPU 4×**, preview lokal; angka
absolut inflasi karena throttle + software render → bandingkan **relatif**):

| Route                             | Berat        | LCP       | Long-task         |
| --------------------------------- | ------------ | --------- | ----------------- |
| Home desktop                      | 2.10 MB      | 11.4 s    | 5.9 s (max 1.0 s) |
| Home mobile                       | 1.51 MB      | 2.1 s     | 1.7 s             |
| Recruitment desktop               | 3.11 MB      | 1.2 s     | 3.4 s             |
| Recruitment mobile                | 2.09 MB      | 8.5 s     | 0.8 s             |
| `/hods/*`, `/recruitment/roles/*` | 0.20–0.33 MB | 0.6–1.0 s | 0 ms              |

Bundle: `three.module` **181 KB gz**, `Motion`/GSAP **45 KB gz**.

> **Sesudah P0(a)+(d) (28 Sep 2026, `transferSize`, tanpa throttle):**
> `/recruitment` mobile **2.09 → 1.15 MB** (DPR3) / **0.93 MB** (DPR2);
> `/` mobile **1.40 MB**. Sisa berat HP: `sorcerer-2x.webp` 481 KB +
> `hero-poster.webp` 74 KB (lihat "Rencana").
>
> **Sesudah P0(b) (28 Sep 2026, `transferSize`, DPR3):** `/` mobile
> **1.33 → 0.98 MB** (`sorcerer-2x.avif` 196 KB, poster tak di-fetch),
> `/recruitment` **0.64 → 0.57 MB**. Video (desktop-only) home webm 0.38 MB,
> recruitment webm 0.76 MB. Sisa untuk tembus **≤800 KB** di Home mobile:
> hero art (`background` 180 + `figure` 87 KB) + ikon philosophy (`impact` 49,
> `experiment` 44, `research` 40, `ship` 37, `learn` 28) + `glow` 54 KB —
> kandidat AVIF berikutnya (belum dikerjakan).

**Akar (urut dampak):**

1. ~~**Splash nunggu aset berat.**~~ **Koreksi (28 Sep 2026, diukur):
   HP tidak menunggu `three`.** `hero-particles.ts` `return` di `<768px`
   **sebelum** push `import('three')` ke `window.__dsPreload` (dan `Hero.astro`
   hanya push video ≥601px), jadi splash HP diukur ~4.5 s dari `window.load`
   (gambar) + font — bukan `three`. Desktop (≥768px) **memang** menunggu
   `three`+video (~4.2 s) — itu tujuan splash, jangan dihapus.
2. ~~**`Snippets.astro` `sizes="1280px"`**~~ **FIXED (28 Sep 2026):** `sizes`
   kini jujur + varian **960w**; HP pilih 1280w (DPR3) / 960w (DPR2), bukan
   `-2x` 2560w (358–562 KB).
3. **Video hero (DONE 28 Sep 2026):** ~~recruitment `hero-bg.webm` 1.6 MB, home
   0.58 MB~~ → di-re-encode jadi home webm 0.38 MB / mp4 0.72 MB, recruitment
   webm 0.76 MB / mp4 1.00 MB (desktop saja; HP sudah di-gate ≥601px).
4. **`three` 181 KB gz** untuk 700 partikel → long-task ~1 s saat init.
5. **Gambar kebesaran (DONE 28 Sep 2026):** ~~`logo.png` 40 KB → 14 KB~~
   (192×210, tampil 54×59, tiap halaman), ~~hero `background.webp` 219 → 180 KB,
   `figure.webp` 128 → 86 KB~~, ~~philosophy `sorcerer-2x.webp` 481 → 196 KB
   (AVIF)~~, ~~`hero-poster.webp` 74 KB~~ (tak lagi di-fetch di HP). **Sisa:** font
   120 KB (4 bobot di-preload) + opsional AVIF hero art/ikon.
6. Jank scroll minor: `.domains` task ~55 ms, frame terburuk ~117 ms
   (`perf:audit`, headless software-render).

**Rencana (prioritas):**

- **P0 — DONE (28 Sep 2026).** (a) `sizes` Snippets responsif + varian 960w;
  (d) kompres `logo.png` (14 KB) + hero `background`/`figure` (180/86 KB);
  (b) **sorcerer → AVIF** (`sorcerer-2x` 481→196 KB, 1x 200→89 KB); (c) **video
  hero di-re-encode** (home webm 0.74→0.38 MB / mp4 1.46→0.72 MB; recruitment
  webm 1.66→0.76 MB / mp4 2.38→1.00 MB, SSIM ≈ 0.983/0.989); **poster tak
  di-fetch di HP** (JS-only, desktop tetap poster-first). Home mobile
  1.33→0.98 MB. **Sisa opsional** kalau mau tembus ≤800 KB: AVIF hero art +
  ikon philosophy + `glow`. (Catatan: "splash nunggu `three`" tetap **batal** —
  HP tidak menunggu `three`, desktop sengaja menunggu; jangan diubah.)
- **P1**: perkecil/ganti `three` (partikel → canvas 2D) — **butuh izin** (`three`
  sudah disetujui; jangan hapus tanpa tanya); preload 2 bobot font + subset.
- **P2**: investigasi jank `.domains`.
- Target: Home mobile ≤ ~800 KB & LCP < 2.5 s (4G); Recruitment mobile ≤ ~1.2 MB
  (**sudah tercapai: 1.15 MB DPR3 / 0.93 MB DPR2**).

## Known issues / catatan

- **Splash memblok interaksi 3–6 s** (cap). Di HP splash tutup ~4.5 s, terutama
  menunggu `window.load` (gambar) + font — **bukan** `three` (tak difetch di
  `<768px`). Memperkecil byte gambar (P0 a/d) langsung memperpendek ini.
- **DEV: GSAP/Three mati dengan `504 Outdated Optimize Dep`.** Kalau semua animasi
  (hero pin/zoom, reveal) hilang di `npm run dev` tapi build/preview normal, itu
  cache Vite basi — **bukan** kode. Fix: `npx astro dev stop && rm -rf
node_modules/.vite && npx astro dev`, lalu hard refresh tab. Dev server Astro
  sekarang daemon (`astro dev stop|status|logs`).
- `scripts/verify-feedback.mjs` **gagal pre-existing**: timeout di
  `locator('.artwork .art-bg')` untuk route `/recruitment` (hero recruitment pakai
  `.artwork img`, bukan `.art-bg`). Tidak terkait What We Do.
- **Hero di HP = statis by design**: gate `(min-width: 601px)` di `Hero.astro`
  bikin video `hero-bg` tidak pernah dimuat di `≤600px` (`preload="none"`,
  `opacity: 0`); yang tampil cuma `background.webp` + `figure.webp`. Jadi di HP
  hero cuma gambar, bukan bug / bukan aset lama. Particle Three.js juga
  desktop-only (`min-width: 768px`, sama dengan pinned sequence).
- **Navbar:** blur backing sengaja cukup 12px tanpa `saturate`/`brightness` dan
  **tanpa morph layout** (revisi 28 Sep 2026: kapsul/`is-condensed` dihapus).
  Jangan tambah lagi 28px blur + transisi layout 0.9s — itu yang bikin scroll
  patah-patah.
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
  Hall of Frames / Partners / Contact (About Us sudah selesai), dan lanjutan
  animasi What We Do.

## Next plan — untuk AI berikutnya (update 1 Oct 2026)

Urutan yang disarankan. Baca `docs/sound-sop.md` (khususnya §9) kalau menyentuh
sound atau navigasi; detail P0–P2 ada di "Perf audit & rencana" di atas.

1. **Homepage — revisi font & spacing (SEDANG JALAN).** Hero + navbar **selesai**
   (1 Oct 2026, lihat "Baru saja" di atas). Lanjut per section pakai
   **`--font-display` (Bluu Next)** + grid 8px sesuai frame `1430:2040`:
   Philosophy → What We Do → HoDS → Our Project → CTA; lalu halaman lain saat
   frame revisinya tersedia. Halaman yang belum direvisi tetap `--font-heading`
   (Nasalization) supaya diff & geometri tidak berubah.
1. **Perf P0 — SELESAI (28 Sep 2026).** (a) `sizes` Snippets + 960w, (d)
   `logo.png`/hero `background`/`figure` (lihat "P0 pass"), lalu (b) **sorcerer →
   AVIF** (`sorcerer-2x` 481→196 KB), (c) **video hero di-re-encode** (home webm
   0.38 MB, recruitment webm 0.76 MB; SSIM ≈ 0.983/0.989), dan **poster tak lagi
   di-fetch di HP** (dipasang via JS hanya saat video main; desktop tetap
   poster-first). Terukur: **Home mobile 1.33 → 0.98 MB**, Recruitment 0.64 →
   0.57 MB (DPR3). Gate hijau. Reproduce: `npm run assets:optimize`,
   `node scripts/generate-hero-video.mjs`,
   `node scripts/generate-recruitment-hero-video.mjs`.
   - **Sisa opsional (kalau mau tembus Home ≤800 KB):** AVIF hero art
     (`background` 180 + `figure` 87 KB) dan ikon philosophy (`impact` 49,
     `experiment` 44, `research` 40, `ship` 37, `learn` 28) + `glow` 54 KB —
     teknik yang sama (AVIF + webp fallback), ukur MAE dulu. **Catatan:** P0(b)
     "splash jangan nunggu `three`" tetap **dibatalkan** — HP memang tidak
     menunggu `three`; desktop sengaja menunggu (jangan diubah).
1. **View Transitions (DONE; sisa device nyata).** `verify-vt.mjs` sudah menguji
   Back/Forward, reload deep-link, dan inert saat reduce. Sisa: uji Safari/Firefox
   & perangkat asli (Playwright firefox belum terpasang). `transition:persist`
   belum perlu. Smoke: **`npm run verify:vt`**.
1. **Konten:** data project asli (`src/data/projects.ts` masih 4 placeholder) dan
   tanggal recruitment (`SelectionTimeline.astro` masih "Date"). Butuh material user.
1. **Halaman baru:** ~~About Us~~ **DONE**, ~~Partners~~ **DONE** (`/partners`).
   Sisa: **Hall of Frames / Contact**. Nav-nya sudah ada tapi `aria-disabled` —
   **jangan bikin URL palsu**, konfirmasi ke user dulu. Logo partner asli (20
   slot) juga masih ditunggu (sekarang placeholder DS).
1. **Nasalization webfont:** butuh file berlisensi dari manusia — **jangan
   diakali**. Taruh `.woff2` di `public/fonts/`, update `@font-face` di
   `global.css` (pertahankan `local()`).
1. **Sound (opsional):** tuning level cue/ambient (Bagian B, ditunda), pisah
   kontrol SFX vs ambient, atau ganti ke sample AI lewat MCP ElevenLabs kalau mau
   non-prosedural.
1. ~~**OG hardening**~~ — **DONE:** `<html prefix="og: https://ogp.me/ns#">` +
   `og:image:secure_url` di `BaseLayout.astro`, `seo:audit` PASS.
