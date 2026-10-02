# Kickoff prompt — buat AI agent baru

Copy-paste seluruh blok di bawah ini ke AI baru sebelum memberikan instruksi kerja.
Prompt ini memuat seluruh konteks, aturan hukum presisi piksel, strict 8-point grid,
protokol per-section, dan checklist. **Status (3 Oct 2026): Homepage (`1430:2040`) +
Recruitment (`1436:3505`) + About Us (`1439:4184`) + Partners (`1439:4787`) + Contact
(`1445:5065`) + 6 detail role + 6 detail HoDS (`864:18857` dkk) 100% selesai. Target
berikutnya: audit/verifikasi ulang **strict per-section** (homepage & recruitment =
benchmark paling penting), dengan **Plan per halaman → inventaris semua section →
kerjakan 1 section per pass + 7 gate per section. JANGAN skip section mana pun.**

---

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro site: homepage +
About Us + Partners + Recruitment (+ 6 detail role) + 6 detail HoDS + Contact.
Target: **pixel-accurate ke Figma/PNG**, HTML/CSS ringan (bukan flatten screenshot).

Sebelum ngapa-ngapain, WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md                    → aturan operasional, commands, konvensi verifikasi, gotchas
2. docs/pixel-precision-sop.md  → **SOP PRESISI PIKSEL (paling penting)** — cara
                                  export node Figma, bundle font, pakai image fill,
                                  ukur sharp, diff, iterasi. Baca sebelum sentuh UI apa pun.
3. docs/ai-handoff.md           → STATE PALING TERKINI ("dimana kita sekarang")
4. HANDOVER.md                  → konteks panjang: stack, struktur, status, TODO
5. docs/assets.md               → provenance tiap section + node Figma
6. docs/sound-sop.md            → SOP sound (Web Audio prosedural) + porting
                                  (skill `.agents/skills/data-sorcerers-sound/SKILL.md`)

================================================================================
ATURAN INTI, SPACING & PADDING (HUKUM, WAJIB PATUH, JANGAN DILANGGAR):
================================================================================
1. **STRICT 8-POINT GRID SPACING & PADDING (HUKUM MUTLAK):**
   - SELURUH gap, padding, dan margin layout WAJIB kelipatan 8px
     (8, 16, 24, 32, 40, 48, 56, 64, 72, 80) sesuai frame Figma.
   - Container utama desktop: `padding: 80px` atau `padding: 0 80px`.
   - Hierarki vertikal baku:
     - Eyebrow → heading: **8px**; antar-baris heading: **4px**.
     - Heading → subtitle/desc: **16px** atau **24px**.
     - Header frame → content/grid/rail: **48/56/74/80px**.
     - Button: `8px 16px`; badge/pill: `4px 12px` / `4px 16px`.
   - **Dilarang magic numbers acak.** Nilai non-8 HANYA sah bila terukur dari
     frame Figma/PNG dan tertulis justifikasinya di `docs/pixel-precision-sop.md`
     §"Hukum Spacing" (tabel pengecualian lengkap) + `docs/assets.md`.
   - **GATE SPACING OTOMATIS:** `npm run audit:spacing`
     (`scripts/spacing-audit.mjs`) memindai semua komponen — setiap
     `padding/gap/margin` numerik harus kelipatan 8 ATAU ada di tabel
     pengecualian; kalau tidak → **exit 1**. Per-komponen saat satu section:
     `node scripts/spacing-audit.mjs src/components/<Komponen>.astro`.
   - Pengecualian yang SUDAH terbukti (dari Figma/PNG, bukan karangan — daftar
     penuh di SOP): `1`(ring) `2 3 4 5 6 7 10 12 13 14 15 18 19 20 21 22 23 26 28
     30 31 35 36 42 44 52 58 60 66 74 82 92 100 116 146 150 242 855`, plus
     line-height heading `67/67.2/95.2/38.4/102/57.6`. Nilai non-integer
     (`0.5`, `6.789`, …), unit `cqw/%`, `calc()/clamp()/var()/env()/max()/min()`,
     dan margin negatif = teknik (di luar scope audit).
   - Setiap pemakaian non-8 harus bisa ditunjuk node Figma/ukurannya. Kalau tidak
     bisa dijustifikasi → ukur ulang, ubah ke kelipatan 8 terdekat, dan update
     assertion `scripts/verify.mjs` di commit yang sama.

2. **PNG NODE HASIL EXPORT FIGMA = SUMBER KEBENARAN:**
   - CSS export Figma, string gradient MCP, dan `effects` payload = hint & sering LOSSY.
   - Kalau render PNG beda dengan CSS/MCP → IKUT PNG.
   - SELALU mulai dari export node: `figma_get_figma_data` (struktur) +
     `figma_download_figma_images` (PNG 1x/2x + node teks/komponen terpisah) → UKUR sharp.
     Jangan paste string MCP/CSS mentah.

3. **EFFECT FIGMA (GLASS / SHADOW) TIDAK SELALU MUNCUL DI MCP:**
   - Frame glass (pill/kartu/panel) merender rim 1px bergradasi + backdrop blur,
     tapi MCP melaporkan kosong. Cek `effects`/`strokes` asli via REST API
     (`GET /v1/files/<key>/nodes?ids=…`, header `X-Figma-Token: $FIGMA_API_KEY`).
   - Emulasi rim dengan ring `::after` + `mask-composite: exclude` (JANGAN `border`
     — menggeser content box). Kalibrasi alpha per sisi dari piksel PNG (top lebih
     terang dari sisi/bawah).

4. **TYPOGRAPHY — BLUU NEXT BOLD 700 (`--font-display`) UNTUK SEMUA HEADING:**
   - Homepage, Recruitment, About Us, Partners, Contact, **6 detail role**, dan
     **6 detail HoDS** sudah **100%** Bluu Next Bold 700.
   - Sisa `--font-heading` (Nasalization, TIDAK di-bundle) HANYA: label grup
     `OurTeam.astro` (Nasalization 400 32/48 sesuai Figma — sengaja) dan wordmark
     `Splash.astro`. Jangan tambah Nasalization baru.
   - Detail HoDS (revisi 3 Oct 2026): judul hero **Bluu Next Bold 700 48/57.6**
     (`--font-display`), gradient `270deg #fff → #ede8ff`, **Title Case**
     (Figma `864:18900`/`864:19238`). `verify.mjs` assert font-family Bluu Next +
     weight 700 tiap rute.
   - Heading: 56px/line-height **67px** (Figma kadang lapor 67.2, bbox node = 67 —
     pakai 67 agar container integer) atau 72/86, 80/102, 48/57.6. Cek bbox PNG.
   - Gradient heading: **per baris kalau tiap baris node TERPISAH**; **satu gradient
     membentang blok kalau dua baris ada di SATU text node** (Partners Hero & Why DS
     = satu node → satu `linear-gradient(181deg, #fff 15%, #999 42%, #fff 79%)`).
     Selalu fit dari piksel PNG, bukan string MCP.
   - Body & subtitle Manrope (400/500/700), letter-spacing terkalibrasi.

5. **SEMUA UI = HTML/CSS ASLI:**
   - Teks, tombol, border, kartu, gradient-text dibangun di CSS. Dilarang menaruh
     screenshot mati/flattened UI.
   - Image fill dipakai apa adanya (`imageRef` diunduh raw → `fit: cover`/crop FILL
     Figma). `imageTransform` `[[sx,0,tx],[0,sy,ty]]` = crop → `sharp.extract(tx*W,
     ty*H, sx*W, sy*H)` lalu resize ke ukuran node.

6. **UKUR, JANGAN NEBAK (±1px PRECISION):**
   - Posisi tinta harus cocok referensi ±1px; MAE per region diukur & dilaporkan.
   - Geometri di-assert di `scripts/verify.mjs` (`assert.deepEqual`). Update assertion
     + path PNG referensi di commit yang sama.
   - Wajib fallback `prefers-reduced-motion`; render reduce harus tetap pixel-exact.
   - View Transitions (ClientRouter) AKTIF: re-init di `astro:page-load` + cleanup di
     `astro:before-swap`.
   - Commit per fitur (`feat:`, `fix:`, `docs:`). Konfirmasi user sebelum push.

================================================================================
PROTOKOL WAJIB PER-SECTION (ANTI-SKIP — INI YANG PALING SERING DILANGGAR):
================================================================================
SEBELUM menyentuh satu baris kode untuk suatu section, WAJIB:
  a. **Inventaris SEMUA section halaman** — buka frame halaman di Figma (`depth 1`),
     daftar semua anak frame berurutan sebagai checklist: nomor, node ID, nama frame,
     w×h, status. Termasuk section yang belum ada komponennya. Checklist = urutan kerja.
  b. Tulis **Master Work Plan** untuk section yang dikerjakan: node ID + URL, dimensi
     frame, layout, breakdown strict 8pt (padding/gap/margin), typography (font/weight/
     size/line-height/gradient), artwork provenance, dan testing criteria.
  c. Cek dulu apakah section baru **pixel-identik** dengan section/node lain yang sudah
     ada (MAE ref vs ref via sharp). Kalau sama → cukup samakan varian (contoh: About
     Philosophy == Home Philosophy MAE 0.000; Partners Footer == Recruitment Footer MAE 0.060).
  d. Kerjakan HANYA satu section, sampai lolos **7 gate**, baru pindah ke section
     berikutnya di checklist. **DILARANG melompat section atau menggabung beberapa
     section dalam satu pass.**

7 GATE WAJIB (semua harus PASS sebelum commit):
  1. `npm run build`                          → astro check + build, 0 error, 19 halaman
  2. `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`      → exit 0, browserErrors []
  3. `PREVIEW_URL=http://localhost:4331 node scripts/navbar-audit.mjs` → ALL PASS
  4. `PREVIEW_URL=http://localhost:4331 node scripts/verify-vt.mjs`    → ALL PASS
  5. `PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs` → 468/468
  6. `npm run audit:spacing`                  → strict 8pt PASS (semua padding/gap/margin)
  7. `npm run format:check`                   → ALL PASS
  (+ `npm run seo:audit` setelah build, PASS.)

Cara jalankan preview (verify butuh server statis):
  npm run build && npx astro preview --port 4331
  (dev server bisa bikin `waitUntil: networkidle` hang → pakai preview.)

================================================================================
PUSH GANDA (PENTING):
================================================================================
Remote `origin` (= testing) punya DUA push URL (testing + production
`Web-Data-Sorcerers/community-web`). `git push origin main` mengirim ke dua-duanya —
jangan tambah remote/push URL lain. Cek sinkron (jalankan terpisah):
`git fetch origin -q && git fetch production -q` lalu bandingkan
`git rev-parse --short main` / `origin/main` / `production/main` (harus sama).
Confirm user sebelum push (deploy ke production).

================================================================================
STATUS MISI: SEMUA HALAMAN 100% SELESAI — SEKARANG AUDIT STRICT PER-SECTION
================================================================================
Semua halaman publik tuntas & tervalidasi presisi. **Homepage (`1430:2040`) &
Recruitment (`1436:3505`) = benchmark presisi — JANGAN rusak tanpa alasan.**
Detail HoDS (`864:18857` dkk) **SELESAI 3 Oct 2026** (judul hero Bluu Next Bold
700 48/57.6 Title Case, `.bullets` gap 8, reference diregenerasi). Contact
(`1445:5065`) Hero **AUDIT PASS** (MAE 2.757 / below-nav 1.338).

================================================================================
CARA KERJA AI BARU (WAJIB): PLAN PER HALAMAN → EKSEKUSI PER SECTION
================================================================================
Untuk SETIAP halaman, urutannya:
  1. **Inventaris** semua anak frame halaman di Figma (`depth 1`) → checklist:
     nomor, node ID, nama frame, w×h, status. (Checklist awal sudah disediakan di
     bawah — WAJIB diverifikasi ulang via `depth 1` sebelum mulai.)
  2. Tulis **Master Work Plan** untuk section ke-1: node ID + URL, dimensi frame,
     layout, breakdown strict 8pt (padding/gap/margin), typography
     (Bluu Next Bold 700 / Manrope), gradient per-node, artwork provenance, dan
     testing criteria. Cek dulu pixel-identik vs node lain (MAE ref vs ref).
  3. Kerjakan HANYA section ke-1 sampai lolos **7 GATE**, baru pindah ke-2. Dst.
  **DILARANG lompat section / gabung beberapa section dalam satu pass.**

Urutan target:
  A. **Audit Homepage (`1430:2040`)** strict per-section (benchmark paling penting).
  B. **Audit Recruitment (`1436:3505`)** strict per-section (benchmark).
  C. **Audit Partners (`1439:4787`)** + **6 detail HoDS** per-section.
  D. Konten asli (foto member, logo partner, `projects.ts`, tanggal recruitment,
     milestone HoF).

--------------------------------------------------------------------------------
TARGET A: HOMEPAGE (`1430:2040`) — AUDIT STRICT PER-SECTION
URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1430-2040
Checklist (verifikasi ulang via `depth 1` sebelum mulai):
[ ] 1. 1430:2041  Hero Section            1440×903  `Hero.astro`
[ ] 2. 1430:2052  Our Philosophy          1440×837  `Philosophy.astro`
[ ] 3. 1430:2089  What We Do              1440×840  `WhatWeDo.astro`
[ ] 4. 1430:2138  House of Data Sorcerers 1440×819  `Domains.astro` + `DomainRail`
[ ] 5. 1430:2146  Our Project             1440×910  `Projects.astro`
[ ] 6. 1430:2162  CTA Recruitment         1440×554  `Cta.astro`
Tiap section: cek 8pt (`node scripts/spacing-audit.mjs <komponen>`), font Bluu Next,
gradient per-node, MAE region vs reference PNG, update assertion `verify.mjs`.

--------------------------------------------------------------------------------
TARGET B: RECRUITMENT (`1436:3505`) — AUDIT STRICT PER-SECTION
URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3505
Checklist (verifikasi ulang via `depth 1` sebelum mulai):
[ ] 1. 1436:3506  Hero Section       1440×866  `RecruitmentHero.astro`
[ ] 2. 1436:3512  Who Should Join    1440×789  `WhoShouldJoin` (DomainRail)
[ ] 3. 1436:3517  What You Will Do   1440×903  `WhatYouWillDo.astro`
[ ] 4. 1436:3564  Available Roles    1440×843  `AvailableRoles.astro`
[ ] 5. 1436:3637  Selection Timeline 1440×812  `SelectionTimeline.astro`
[ ] 6. 1436:3675  FAQ                 1440×983  `Faq.astro`
[ ] 7. 1436:3684  Snippets            1440×897  `Snippets.astro`
[ ] 8. 1436:3687  CTA                 1440×520  `Cta.astro`
[ ] 9. 1436:3699  Footer              1440×556  `Footer.astro` (shared)

--------------------------------------------------------------------------------
TARGET C: PARTNERS (`1439:4787`) + DETAIL HoDS (`864:18857` dkk) — AUDIT PER-SECTION
Partners URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4787
[ ] 1. 1439:4788  Hero Section - Partners  1440×659
[ ] 2. 1439:4793  Our Partners             1440×1071
[ ] 3. 1439:4937  Why DS                   1440×656
[ ] 4. 1439:4983  Footer                   1440×556 (shared)

Detail HoDS (6 rute `/hods/[id]`, `HoDSDetail.astro`) — 6 frame @1440×1280:
[ ] 864:18857  Detile HoDS - Data Intelligence
      https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=864-18857
[ ] 864:18904  Detile HoDS - Core AI & Engineering
[ ] 864:18959  Detile HoDS - Language & Reasoning
      https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=864-18959
[ ] 864:19013  Detile HoDS - Vision & Multimodal
      https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=864-19013
[ ] 864:19024  Detile HoDS - Product & Software
      https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=864-19024
[ ] 864:19035  Detile HoDS - Growth & Community
      https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=864-19035
Catatan: judul hero = Bluu Next Bold 700 48/57.6 Title Case (SELESAI); `.bullets`
gap 8; reference `HoDS-Detail-Language-1x/2x.png` sudah diregenerasi dari node
`864:18959`. Audit sisa (spacing/font/MAE) per section.

--------------------------------------------------------------------------------
REFERENSI STATUS (SUDAH SELESAI — jangan diutak-atik tanpa alasan):
================================================================================

### A. HOMEPAGE REVISI FONT & SPACING (Node 1430:2040, Frame 1440) — [STATUS: 100% SELESAI]:
1. **Hero Section (`1430:2041`)** — [STATUS: SELESAI]
   - Frame 1440 × 903, padding 80px, content centered.
   - Heading Bluu Next Bold 700 72/86, gradient per baris, Manrope 18/25 lebar 655.
   - Spacing 80/64/16/24, tombol Primary violet & Sec glass, plate bg webp. Section MAE: 3.18.
2. **Our Philosophy (`1430:2052`)** — [STATUS: SELESAI]
   - Frame 1440 × 837, padding 80px. Kolom 591px di x:766, y:205.
   - Heading Bluu Next Bold 700 56/67, 8pt spacing (eyebrow gap 8px, grid 30×92). Section MAE: 2.568.
3. **What We Do (`1430:2089`)** — [STATUS: SELESAI]
   - Frame 1440 × 840, padding 80px. 4 kartu pillar 391×254 di (80,80), (969,80), (80,506), (969,506).
   - Heading Bluu Next Bold 700 56/67.2, kartu title Manrope Bold 700 26/39. Section MAE: 2.579.
4. **House of Data Sorcerers / Choose Your Domain (`1430:2138`)** — [STATUS: SELESAI]
   - Frame 1440 × 819, padding 80px. Gap header 74px. Rail 1280×436 dengan 6 kartu 405×436px, gap 32px.
   - Heading Bluu Next Bold 700 56/67.2, kartu title Manrope Bold 22/33. Section MAE: 2.405.
5. **Our Project Section (`1430:2146`)** — [STATUS: SELESAI]
   - Frame 1440 × 910px, padding 80px, gap header 82px. Eyebrow 86.6×26px di (80, 80).
   - Heading "What Our Sorcery Create": Bluu Next Bold 700 56/67px di (80, 114) ink 646px.
   - 3D Coverflow Project Cards 549×567px di (445.5, 263). Section MAE: 5.0764.
6. **CTA Recruitment Section (`1430:2162`)** — [STATUS: SELESAI]
   - Frame 1440 × 554px, padding 80px. Container card 1280×394px di (80, 80), padding 64px 80px, gap 48px.
   - Eyebrow "Recruitment" di (673.4, 145), Heading "Ready to Become a Sorcery?": Bluu Next Bold 700 56/67px di (161, 179).
   - Copy Manrope 400 16/24 di (427, 270), single button "Join the Community" 201×43px di (619.5, 366). Section MAE: 3.1427.

### B. RECRUITMENT PAGE REVISI FONT & SPACING (Node 1436:3505, Frame 1440):
1. **Recruitment Hero Section (`1436:3506`)** — [STATUS: SELESAI]
   - Frame 1440 × 866, padding 0 80px. Frame 2733 (1280 × 310) vertically centered (top 278px, bottom 278px).
   - Heading Bluu Next Bold 700 72/86 ("Your Next Chapter" & "Start here", gap 4px).
   - Description Manrope Medium 18/27 #EDE8FF 900×27 (gap 16px, letter-spacing -0.176px).
   - Button Apply Now 120×43 (gap 48px), Primary radial gradient violet (hover #2F196F).
2. **Who Should Join Section (`1436:3512`)** — [STATUS: SELESAI]
   - Frame 1440 × 789px, padding 80px, gap header ke rail 74px.
   - Header Frame 2547 (1280×119px, gap 24px): Heading Bluu Next Bold 700 56/68px di (80, 80), Subtitle Manrope 500 18/27px di (80, 172).
   - HoDS Card Rail Frame 2509 (1280×436px, cards 405×436px, gap 32px) di (80, 273). Section MAE: 2.8430.
3. **What You Will Do Section (`1436:3517`)** — [STATUS: SELESAI]
   - Frame 1440 × 903px, padding 80px (8-point grid), gap header ke body 20px.
   - Header Frame 2734 (1280×118px, gap 24px): Heading Bluu Next Bold 700 56/67px di (80, 80), Subtitle Manrope 500 18/27px di (544.5, 171).
   - Body Frame 2542 (1312×625px) di (64, 218): Tarot Card 1 di (983, 218), Tarot Card 2 di (129, 434), Connector SVG di (64, 313), 8 labels di (158, 348) dengan 8pt grid intra-pair gap 16px dan inter-pair gap 24px. Section MAE: 3.2541.
4. **Available Roles Section Revisi Card (`1436:3564`) & Detail Roles (`774:17392` dkk)** — [STATUS: 100% SELESAI]
   - Frame 1440 × 843px, padding 80px (Strict 8-Point Grid), layout VERTICAL, gap: 58px.
   - Header Frame 2496 (`1436:3565`): 1280 × 115px di (80, 80), gap 24px:
     - Heading "Available Roles" (388 × 67px): Bluu Next Bold 700 56/67px (`--font-display`), gradient linear 180deg.
     - Subtitle (1280 × 27px): Manrope Medium 500 18/27px (`--font-body`), `#ffffff`.
   - Card Grid Frame 2605 (`1436:3568`): 1280 × 510px di (80, 253), layout VERTICAL, gap: 40px:
     - Row 1 (Frame 2603): 3 card role (Card 1, 2, 3) 413 × 235px, gap: 20px, padding: 18px 28px, background `rgba(255, 255, 255, 0.15)`.
     - Row 2 (Frame 2604): 3 card role (Card 4, 5, 6) 413 × 235px, gap: 20px, padding: 18px 28px, background `rgba(255, 255, 255, 0.15)`.
   - 6 Detail Role Pages (`/recruitment/roles/[id]`):
     - Seluruh frame 1440 × 1280px (top-aligned, padding 80px, gap 56px).
     - Hero Card H1 diupdate ke Bluu Next Bold 700 48/57.6px (`--font-display`).
     - Kartu Contact Person: interactive direct link ke WhatsApp `+62 851-7151-6704` (Zidan Amikul) via `https://wa.me/6285171516704` dengan pre-filled role inquiry message, hover lift `translateY(-2px)`, glow violet `0 8px 24px -4px rgb(108 59 255 / 40%)`, specular rim, icon zoom `scale(1.12)`, dan Web Audio SFX cues.
5. **Selection Timeline (`1436:3637`)** — [STATUS: 100% SELESAI]
   - Frame 1440 × 812px / 815px, padding 80px, gap header-to-table **56px** (Strict 8-Point Grid kelipatan 8, mengoreksi 58px lama).
   - Heading "Selection Timeline": Bluu Next Bold 700 56/67.2px (`--font-display`), gradient 181deg per baris.
   - Timeline table 1280px: Header 1280×78px (padding 18px 32px), Body 1280×451px (padding 18px 32px, gap 18px, 6 rows dengan separator linear gradient).
   - Section MAE: **4.3059/255** vs reference `Recruitment-SelectionTimeline-Revisi-1x.png`. All 6 verification gates pass.
6. **FAQ Section (`1436:3675`)** — [STATUS: 100% SELESAI]
   - Frame 1440 × 983px, padding 80px, gap header ke list **56px** (Strict 8-Point Grid kelipatan 8, mengoreksi 58px lama).
   - Heading "FAQ": Bluu Next Bold 700 56/67.2px uppercase (`--font-display`), linear gradient 181deg per baris.
   - List 1280px (Frame 2546, gap 32px): 6 accordion cards (stroke 1px glass rim, radius 20px, gap 32px, 4 cards 77px + 2 cards 116px).
   - Section MAE: **7.7518/255** (Header MAE 0.7854, List MAE 10.2983, Bottom MAE 2.7911) vs reference `Recruitment-Faq-Revisi-1x.png`. All 6 verification gates pass.
7. **Snippets of Life at Data Sorcerers (`1436:3684`)** — [STATUS: 100% SELESAI]
   - URL: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3684`
   - Frame 1440 × 897.2px, padding 40px 80px, gap **56px** (Strict 8-Point Grid, mengoreksi 58px lama).
   - Heading "Snippets of Life at data sorcerers": Bluu Next Bold 700 56/67.2px center, gradient 181deg.
   - Gallery 1280px (hero frame 556px + 5 thumbnails bar 246×103px, gap 35px autolayout).
   - Section MAE: **8.6288/255** vs `Recruitment-Snippets-Revisi-1x.png`. All 6 verification gates pass.
8. **CTA Recruitment Section (`1436:3687`)** — [STATUS: 100% SELESAI]
   - URL: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3687`
   - Frame 1440 × 520px, padding 80px. Panel 1280×360px (padding 64px 80px, gap 48px, `height:360px` + center).
   - Heading "Ready to Become a Sorcery?": Bluu Next Bold 700 56/67.2px center, gradient 181deg.
   - Button "Join the Community" 201×43px (`variant="community"`).
   - Section MAE: **2.2488/255** vs `Recruitment-Cta-Revisi-1x.png`. All 6 verification gates pass.
9. **Footer (`1436:3699` / komponen bersama `765:17071`)** — [STATUS: 100% SELESAI]
   - URL: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3699`
   - Frame 1440 × 556px, padding 80px. Komponen bersama (`Footer.astro`) untuk 6 halaman.
   - Brand name **Bluu Next Bold 700 32/38.4**; spacing brand lockup 8, copy 24, nav/contact 32; desc & ikon social putih.
   - Section MAE: homepage **5.8380/255**, recruitment **7.7071/255**. All 6 verification gates pass.
     - Legal links tetap right-aligned (mentor-approved 23 Sep 2026).

### C. ABOUT US (Node `1439:4184`, 6 section) — [STATUS: 100% SELESAI 2 Oct 2026]:
1. **Hero Section - About Us (`1439:4185`)** — 1440×903, padding 80, justify center,
   gap 16, IMAGE fill. Content `1439:4186` 1280×287.4 di (80,307.8): headline
   `1439:4187` **Bluu Next 700 80/95.2 ls -0.88** 1124×190.4 di (158,307.8),
   gradient `181deg`, 2 baris ("Architecting the Future of AI" / "& Data Innovation.");
   subtitle `1439:4188` Manrope 500 18/27 #fff 680×81 di (380,514.2),
   `text-shadow: 0 4px 20px #000`. MAE **4.6874** (3.7902 di bawah navbar).
2. **visi misi (`1439:4190`)** — 1440×840, padding 80, gap 100, IMAGE starfield
   (`public/images/about/visi-misi-bg.webp`). Vision 1280×145.2 (80,80); Mission
   1280×435.2 (80,325.2). Heading "OUR VISION"/"OUR MISION" Bluu Next 700 56/67.2
   gradient 181deg; list 797×266 di (80,494.4), 6 bar 31px gap 16 pad 2/16 lebar
   713/733/746/775/786/797 gradient fit `100deg`; tarot 356×430 di (1028,261)
   (`tarot-cards.webp`). MAE **1.910**.
3. **Philosophy (`1439:4219`)** — 1440×837, **identik dengan homepage** `1430:2052`
   (ref MAE 0.000). Content 591×468 di (766,205) gap 48; heading Bluu Next 56/67
   2 baris; grid prinsip 591×248 (gap 30/92). MAE **2.316**.
4. **Our Ecosystem (`1439:4258`)** — 1440×874, padding 80, gap 116, gradient
   `24.87deg #050507 52.9%→#6c3bff 132.9%`. Header 931×172 di (254.5,80);
   pipeline 1280×426 di (80,368), 5 kolom bottom 776, baseline y794; step title
   Manrope 500 (bukan 700). MAE **2.221**.
5. **Our Team (`1439:4305`)** — 1440×1536, padding 80, gap 80. Header 1280×101;
   `team 2` 1280×1195 di (80,261): Leader (2 kartu) + Data Intelligence (5 kartu),
   kartu **302×400** radius 10 + GLASS rim, frame `card-frame.webp` (3,13) 295×277,
   fade `180deg #6c3bff→#0e0626`, potret crop `imageTransform` dibake. Komponen
   baru `OurTeam.astro` + `src/data/team.ts` (placeholder). MAE **2.679**.
6. **Footer (`1439:4311`)** — shared `Footer.astro` 1440×556. MAE **6.38**.

Semua section About Us sudah **Bluu Next Bold 700** + strict 8pt. Referensi
`assets/about-us/`. Generator `npm run assets:about`.

### D. PARTNERS (Node `1439:4787`, 4 section) — [STATUS: 100% SELESAI 3 Oct 2026]:
1. **Hero (`1439:4788`)** — 1440×659, padding 242px 80px 160px, gap 8, IMAGE fill raw
   `assets/partners/hero/hero-fill-raw.png`. Pill `1439:4789` 228×26; heading
   `1439:4791` Bluu Next Bold 700 80/102, 1280×223, ink 789×180 @ (326,295), 2 baris,
   **satu gradient 181deg membentang blok**. MAE **4.128** full / **2.730** under-nav.
2. **Our Partners (`1439:4793`)** — 1440×1071, padding 80, gap 100, #050507. 3 grup
   (Industry 10 / Academia 5 / Community 5) gap 42; grid **gap 16** → kartu
   **243.2×116**, radius 20, rgba(255,255,255,.15). MAE **2.860**.
3. **Why DS (`1439:4937`)** — 1440×656, padding 80, gap 48, #050507. Heading Bluu Next
   Bold 700 80/102 satu gradient; grid 4 kartu **309.5×185** gap 16 (lebar 1286);
   kartu rgba(255,255,255,.15) + rim 135deg + glow raw IMAGE-SVG `1439:4949`
   (`why-glow.webp`, fit (-184,-18)); icon = crop sprite `imageRef 36308539…`.
   MAE **3.216** (bg 0.000).
4. **Footer (`1439:4983`)** — shared, node **pixel-identik** recruitment (MAE 0.060);
   render MAE **5.873**. Referensi `assets/partners/`; generator `npm run assets:partners`.

### E. CONTACT (Node `1445:5065`, 2 section) — [STATUS: 100% SELESAI 1 Oct 2026]:
1. **Hero (`1445:5066`)** — 1440×954, padding 240px 80px 120px, gap 160, #050507.
   Artwork `1445:5067` (-131,-92) 801×600. Row `1445:5068` 1280×594 @ (80,240) gap 32.
   Left 587 (`1445:5069`); form panel `1445:5098` 661, padding 20px 32px, gap 32,
   rgba(255,255,255,.12), radius 20. GLASS rim diemulasi `::after` + mask (bukan border).
   MAE hero **2.76** (konten tanpa navbar ~1.28), kartu ~3.4, form 1.11.
   Referensi `assets/contact/hero/Contact-Hero-1x.png`.
2. **Footer (`1445:5118`)** — shared `Footer.astro`.

================================================================================
PELAJARAN WAJIB DARI ABOUT US + PARTNERS (JANGAN DIULANG):
================================================================================
1. **Cek dulu apakah section baru BENAR-BENAR beda.** About Us Philosophy (`1439:4219`)
   PIXEL-IDENTIK (MAE 0.000) dengan homepage Philosophy (`1430:2052`); Partners Footer
   (`1439:4983`) identik recruitment (MAE 0.060). Bandingkan referensi baru vs
   referensi existing (sharp MAE) sebelum menulis CSS.
2. **Line-break heading WAJIB diukur dari PNG**, jangan diasumsikan. Export node teks,
   ukur row-band `sharp` (alpha>200).
3. **`lineHeightPx` Figma ≠ bbox.** Figma lapor 67.2 tapi node = 67 → pakai 67px untuk
   heading satu baris/header supaya container integer. Hero Partners 80/102.
4. **Satu text node = satu gradient membentang blok; node per baris = per baris.**
   Partners Hero & Why DS = satu node → gradient `181deg` di elemen blok (per-line
   terbukti lebih buruk: heading MAE 10.17 vs 7.56). About/Recruitment yang node-nya
   terpisah pakai gradient per `<span>`.
5. **`imageTransform` = crop.** `sharp.extract(tx*W, ty*H, sx*W, sy*H)` lalu resize ke
   ukuran node. Icon Why DS = 4 crop dari 1 sprite (`imageRef 36308539…`).
6. **String gradient MCP lossy.** Fit dari piksel PNG. Ragu → sweep kecil via Playwright.
7. **GLASS effect tidak muncul di MCP.** Cek REST `effects`/`strokes`, emulasi rim
   `::after` + `mask-composite: exclude` (JANGAN `border`).
8. **Artwork IMAGE-SVG / render node:** bake apa adanya, lalu posisikan dengan fit
   MAE (contoh glow Why DS fit (-184,-18) → persentase kartu).
9. **`responsive-audit.mjs` punya skip-list text "offscreen"** (`.domain-rail`,
   `.project-card:not(.is-active)`, `.team-cards`). Rail yang sengaja di-clip harus
   ditambah ke skip-list.
10. **CSS comment harus SATU BARIS** (multi-baris bikin Prettier tidak idempoten →
    `format:check` gagal).
11. **Jangan commit aset raw yang tidak dipakai** — simpan hanya sumber yang dipakai
    generator (`assets/` sudah di `.vercelignore`).
12. **Referensi PNG hero bisa memuat navbar** → `verify.mjs` sembunyikan `.navbar`,
    hitung MAE di bawah band navbar.
13. **`loading="lazy"` belum ter-decode saat screenshot** → `scrollIntoView` +
    `waitForFunction` semua `<img>` `complete && naturalWidth>0` + `img.decode()`.
14. **Reference PNG bisa STALE** (export lama sebelum revisi Figma). Contoh: detail
    HoDS — export lama masih judul uppercase Nasalization; Figma sekarang Bluu Next
    Title Case (`864:18900`). Selalu cek `figma_get_figma_data` node terbaru dulu;
    kalau beda, **regenerasi reference** dari node itu di commit yang sama
    (node `864:18959` → `HoDS-Detail-Language-1x/2x.png`).
15. **Judul mengikuti Figma, termasuk Title Case.** `src/data/hods.ts` diselaraskan
    `domains.ts` ("Data Intelligence", bukan "DATA INTELLIGENCE").

================================================================================
INSTRUKSI EKSEKUSI UNTUK AI BARU (WAJIB DIIKUTI):
================================================================================
1. **WAJIB Membuat Rencana Kerja (Plan) Per-Section:**
   Sebelum menyentuh satu baris kode pun, paparkan Master Work Plan: node ID Figma +
   URL, dimensi frame, strict 8-point grid breakdown (padding/gap/margin), typography
   breakdown, artwork provenance, testing criteria.
   JANGAN SEKALI-KALI MELOMPATI SECTION ATAU MENGGABUNGKAN MULTIPLE SECTION!
2. **Eksekusi Bertahap (Satu Section per Langkah, Presisi Penuh):**
   - Inventaris semua section halaman (`depth 1`) dulu → checklist.
   - Export node PNG 1x & 2x + node teks/komponen terpisah.
   - Ukur `sharp`: bbox tinta, x/y, w/h, gap, padding (ink precision ±1px).
   - Pastikan strict 8pt (`node scripts/spacing-audit.mjs <komponen>`, tanpa magic numbers).
   - Font Bluu Next Bold 700 (`--font-display`) untuk heading, Manrope untuk body.
   - Update assertion geometri & reference path di `scripts/verify.mjs`.
   - Jalankan 7 gate + `seo:audit`.
   - Update dokumen (`docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`).
   - Commit per fitur; confirm user sebelum push ke origin main.
3. **Mulai dari mana?**
   Target default **A → B → C**: audit strict per-section **Homepage (`1430:2040`)**
   dulu, lalu **Recruitment (`1436:3505`)**, lalu **Partners (`1439:4787`)** + **6
   detail HoDS** (`864:18857` dkk). Inventaris dulu (checklist di atas), buat Master
   Work Plan section pertama, cek pixel-identik vs node lain, export PNG referensi,
   ukur, baru sentuh kode. Selesaikan + 7 gate sebelum pindah section. JANGAN skip.
```
