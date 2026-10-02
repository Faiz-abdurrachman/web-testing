# Kickoff prompt — buat AI agent baru

Copy-paste seluruh blok di bawah ini ke AI baru sebelum memberikan instruksi kerja. Prompt ini telah memuat seluruh konteks, aturan hukum presisi piksel, 8-point grid, serta checklist per-section. **Status: Homepage (`1430:2040`) + Recruitment Page (`1436:3505`) + About Us (`1439:4184`) 100% selesai. Target berikutnya: PARTNERS PAGE (`1439:4787`) — kerjakan 1 section per pass + 6 gate per section, JANGAN skip section.**

---

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro site: homepage +
About Us + Partners + Recruitment (+ 6 detail role) + 6 detail HoDS.
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
ATURAN INTI & SPACING (HUKUM, WAJIB PATUH, JANGAN DILANGGAR):
================================================================================
1. **STRICT 8-POINT GRID SPACING & PADDING:**
   - Seluruh gap, padding, dan margin layout WAJIB mematuhi kelipatan 8px
     (mis. 8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, 72px, 80px) sesuai spesifikasi frame Figma.
   - Container utama desktop: `padding: 80px` atau `padding: 0 80px`.
   - Hierarki jarak vertikal:
     - Eyebrow ke heading: 8px (atau 4px jika antar-baris heading).
     - Heading ke subtitle/deskripsi: 16px atau 24px.
     - Header frame ke content/grid/rail: 48px, 56px, 74px, atau 80px.
     - Komponen kecil (button): padding 8px 16px, badge: 4px 12px / 4px 16px.
   - **Dilarang memakai magic numbers acak** (misal 13px, 27px, 53px) kecuali merupakan koordinat
     posisi absolut terukur atau kompensasi font descender/letter-spacing terkalibrasi.

2. **PNG NODE HASIL EXPORT FIGMA = SUMBER KEBENARAN:**
   - CSS export Figma, string gradient MCP, dan `effects` payload = hint & sering LOSSY.
   - Kalau render PNG berbeda dengan CSS/MCP → IKUT PNG.
   - SELALU mulai dari export node: `figma_get_figma_data` (struktur) +
     `figma_download_figma_images` (PNG 1x/2x + node teks/komponen terpisah) → UKUR dengan sharp.
     Jangan paste string MCP/CSS mentah.

3. **EFFECT FIGMA (GLASS / SHADOW) TIDAK SELALU MUNCUL DI MCP:**
   - Frame glass (pill/kartu/panel) merender rim 1px bergradasi + backdrop blur, tapi MCP melaporkan kosong.
   - Cek `effects`/`strokes` asli via REST API (`GET /v1/files/<key>/nodes?ids=…`, header `X-Figma-Token: $FIGMA_API_KEY`).
   - Emulasi rim dengan ring `::after` + `mask-composite: exclude` (JANGAN `border` — menggeser content box).
   - Kalibrasi alpha per sisi dari piksel PNG (rim glass lebih terang di atas).

4. **TYPOGRAPHY REVISI — BLUU NEXT BOLD 700 (WAJIB, JANGAN PAKAI NASALIZATION UNTUK HEADING):**
   - Homepage (`1430:2040`), Recruitment (`1436:3505`), dan About Us (`1439:4184`) sudah
     **100%** berganti dari Nasalization ke **Bluu Next Bold 700** (`--font-display`).
   - Halaman publik yang **MASIH** memakai `--font-heading` (Nasalization) = **Partners**
     (`PartnersHero.astro`, `OurPartners.astro`, `WhyPartners.astro`) dan **Detail HoDS**
     (`HoDSDetail.astro`). Itu target revisi berikutnya.
   - Heading: 56px / line-height **67px** (Figma sering lapor 67.2 tapi bbox node = 67 —
     pakai 67 agar container pas) atau 72px / 86px. **Cek bbox PNG sebelum menentukan.**
   - Gradient teks WAJIB per baris (`background-clip: text`), nilai umum
     `linear-gradient(181deg, #fff 15%, #999 42%, #fff 79%)` (fit dari PNG, bukan string MCP).
   - Body & subtitle Manrope (400/500/700), letter-spacing terkalibrasi (mis. `-0.176px`).
   - `--font-heading` masih dipakai HANYA untuk label grup Our Team (Nasalization 400 32/48,
     sesuai Figma) dan fallback `--font-display`.

5. **SEMUA UI = HTML/CSS ASLI:**
   - Teks, tombol, border, kartu, gradient-text dibangun di CSS. Dilarang menaruh screenshot mati/flattened UI.
   - Image fill dipakai apa adanya (`imageRef` diunduh raw → `fit: cover` sesuai crop FILL Figma).

6. **UKUR, JANGAN NEBAK (±1px PRECISION):**
   - Posisi tinta harus cocok referensi ±1px.
   - Geometri di-assert di `scripts/verify.mjs` (`assert.deepEqual`). Update assertion dan path PNG referensi di commit yang sama.
   - Wajib fallback `prefers-reduced-motion`; render reduce harus tetap pixel-exact.
   - View Transitions (ClientRouter) AKTIF: re-init di `astro:page-load` + cleanup di `astro:before-swap`.
   - Commit per fitur (`feat:`, `fix:`, `docs:`). Konfirmasi user sebelum push.

================================================================================
PUSH GANDA (PENTING):
================================================================================
Remote `origin` (= testing) punya DUA push URL (testing + production `Web-Data-Sorcerers/community-web`).
`git push origin main` mengirim ke dua-duanya — jangan tambah remote/push URL lain.
Cek sinkron ( jalankan terpisah; `main`, `origin/main`, `production/main` harus sama ):
`git fetch origin -q && git fetch production -q` lalu
`git rev-parse --short main` / `git rev-parse --short origin/main` / `git rev-parse --short production/main`.

COMMANDS:
- npm ci                     → install (Node 22.x)
- npm run dev                → dev server http://localhost:4321
- npm run build              → astro check + build (HARUS 0 error, 19 halaman)
- npm run format:check       → harus lolos sebelum commit
- PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs           → verifikasi visual + geometri (HARUS exit 0)
- PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs → 18 rute × 26 lebar (HARUS ALL PASS)
- npm run audit:navbar       → geometri navbar exact 1440 (HARUS ALL PASS)
- npm run verify:vt          → smoke View Transitions + cue sound (butuh preview)
- npm run seo:audit          → validasi meta/OG/canonical/sitemap di dist (setelah build)

================================================================================
STATUS MISI: HOMEPAGE + RECRUITMENT + ABOUT US 100% SELESAI → NEXT PAGE: PARTNERS
================================================================================
Homepage (`1430:2040`), Recruitment Page (`1436:3505`), dan About Us (`1439:4184`)
sudah 100% selesai & tervalidasi presisi (checklist di bawah = referensi). Sekarang
lanjut **Partners Page**.

--------------------------------------------------------------------------------
TARGET PAGE BERIKUTNYA: PARTNERS (`1439:4787`) — WAJIB PER-SECTION
--------------------------------------------------------------------------------
URL page  : https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4787
Hero      : https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4788
Our Part. : https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4793
Why DS    : https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4937
Footer    : shared `1439:4983` / komponen `765:17071`

LANGKAH WAJIB (dilarang skip): petakan SEMUA section dari frame halaman (`depth 1`),
tulis checklist di Master Work Plan, lalu kerjakan satu section penuh + 6 gate
sebelum lanjut berikutnya. Inventaris Partners (frame `1439:4787`, 1440×2942, 4 section):

[ ] 1. Hero Section - Partners  `1439:4788`  1440×659   (PartnersHero.astro, revisi)
       padding 242px 80px 160px, gap 8, IMAGE fill. Eyebrow CTA 228×26;
       heading "Let's Build Something Meaningful Together." Bluu Next 700 80/102,
       1280×223 (3 baris), gradient. Navbar instance `1439:4792` ikut ter-render di
       PNG hero → `verify.mjs` sembunyikan `.navbar`, hitung MAE di bawah band navbar.
[ ] 2. Our Partners Section     `1439:4793`  1440×1071  (OurPartners.astro, revisi)
       padding 80, gap 100, fill #050507. 3 sub-frame: Frame 2661 1280×325,
       Frame 2662 1280×193, Frame 2663 1280×193 (masing-masing gap 42).
[ ] 3. Why DS section           `1439:4937`  1440×656   (WhyPartners.astro, revisi)
       padding 80, align center, gap 48, fill #050507. Frame 2666 1280×263 gap 8;
       Frame 2704 1286×185 gap 16.
[ ] 4. Footer                   `1439:4983`  1440×556   (shared Footer.astro, presisi → verifikasi saja)

Catatan Partners:
- PartnersHero/OurPartners/WhyPartners masih `--font-heading` (Nasalization) → revisi
  ke **Bluu Next Bold 700** (`--font-display`) + strict 8pt, ukur ulang dari node BARU
  di atas. `assets/partners page/` = file Figma LAMA → hanya hint, node figma sekarang
  = sumber kebenaran.
- Generator aset: `npm run assets:partners` (`scripts/generate-partners-assets.mjs`).

--------------------------------------------------------------------------------
PELAJARAN WAJIB DARI ABOUT US (JANGAN DIULANG):
--------------------------------------------------------------------------------
1. **Cek dulu apakah section baru BENAR-BENAR beda.** About Us Philosophy (`1439:4219`)
   ternyata PIXEL-IDENTIK (MAE 0.000) dengan homepage Philosophy (`1430:2052`). Bandingkan
   dulu referensi baru vs referensi section lain yang sudah ada (`sharp` MAE). Kalau sama →
   cukup samakan varian/layout (hemat besar, ini pernah memangkas kerjaan 1 section penuh).
2. **Line-break heading WAJIB dicek dari PNG, jangan diasumsikan.** Hero About Us sempat
   salah pecah baris ("...of" / "AI & ...") padahal Figma "...of AI" / "& ...". Export node
   teks via `figma_download_figma_images`, ukur row-band pakai `sharp`.
3. **`line-height` heading: Figma sering lapor 67.2 tapi bbox node = 67.** Pakai `67px`
   (bukan 67.2) supaya header/pipeline pas integer (kasus Our Ecosystem & Our Team).
   Selisih 0.2px menaikkan MAE header ~3→~5 dan menggeser pipeline.
4. **`imageTransform` pada IMAGE fill = crop.** Node potret Our Team punya crop
   `[[sx,0,tx],[0,sy,ty]]`; jangan `fit:fill` mentah — `sharp.extract(tx*W, ty*H, sx*W,
   sy*H)` lalu resize ke ukuran node, baru bake. Lihat `scripts/generate-about-assets.mjs`.
5. **String gradient MCP lossy.** Contoh: bar visi-misi MCP `134deg` tapi fit piksel =
   `100deg`; card fade & heading juga perlu fit dari PNG. Ragu → sweep kecil via Playwright,
   jangan paste string MCP/REST mentah.
6. **Frame bisa punya effect `GLASS` yang tidak muncul di MCP** (eyebrow/card/panel/button).
   Cek REST `/v1/files/<key>/nodes?ids=…` (`effects`/`strokes`), emulasi rim dengan `::after`
   + `mask-composite: exclude` (JANGAN `border` — mengecilkan content box).
7. **`responsive-audit.mjs` punya skip-list text "offscreen"** (`.domain-rail`,
   `.project-card:not(.is-active)`). Rail yang sengaja di-clip (mis. `.team-cards` menampilkan
   4 dari 5 kartu) harus ditambah ke skip-list, kalau tidak audit FAIL di lebar tertentu.
8. **CSS comment harus SATU BARIS.** Comment `/* ... */` multi-baris bikin Prettier tidak
   idempotent → `format:check` gagal terus.
9. **Jangan commit aset raw yang tidak dipakai.** Simpan hanya sumber yang dipakai generator
   (`assets/` sudah di `.vercelignore`).
10. **Preseden lengkap About Us** (Hero/VisiMisi/Philosophy/Ecosystem/OurTeam/Footer) ada di
    `docs/assets.md` §About Us & blok `/about` di `scripts/verify.mjs`. Pakai sebagai template.

--------------------------------------------------------------------------------
REFERENSI STATUS (SUDAH SELESAI — jangan diutak-atik tanpa alasan):
--------------------------------------------------------------------------------

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

================================================================================
INSTRUKSI EKSEKUSI UNTUK AI BARU (WAJIB DIIKUTI):
================================================================================
1. **WAJIB Membuat Rencana Kerja (Plan) Per-Section:**
   Sebelum menyentuh satu baris kode pun, paparkan rencana kerjamu (Master Work Plan):
   ID node Figma dan URL langsung, dimensi frame terukur, strict 8-point grid breakdown,
   typography breakdown, artwork assets provenance, dan testing criteria.
   JANGAN SEKALI-KALI MELOMPATI SECTION ATAU MENGGABUNGKAN MULTIPLE SECTION!
2. **Eksekusi Bertahap (Satu Section per Langkah, Presisi Penuh):**
   - Buka section yang ditargetkan.
   - Export node PNG 1x dan 2x via download/export figma.
   - Ukur dengan `sharp`: ukur bounding box, posisi x/y, lebar/tinggi, gap, dan padding (ink precision ±1px).
   - Pastikan mematuhi **Strict 8-Point Grid Spacing & Padding** (kelipatan 8px, tanpa magic numbers acak).
   - Terapkan font **Bluu Next Bold 700** (`--font-display`) untuk heading dan **Manrope** untuk body.
   - Update assertions di `scripts/verify.mjs`.
   - Jalankan seluruh 6 gate verifikasi (`build`, `verify.mjs`, `navbar-audit`, `verify-vt`, `responsive-audit`, `format:check`).
   - Update dokumentasi (`docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`).
   - Lakukan git commit per fitur dan sinkronkan push ke origin main.
3. **Mulai dari mana?**
   Target saat ini: **Partners (`1439:4787`)**. Inventaris 4 section dulu (lihat
   checklist di atas), lalu mulai dari **Section 1 Hero `1439:4788`** — buat Master
   Work Plan-nya, cek dulu apakah identik dengan section lain (MAE ref vs ref), export
   PNG referensi 1x/2x, ukur dengan sharp, baru sentuh kode. Selesaikan + 6 gate
   sebelum pindah ke Section 2. JANGAN skip section mana pun.
```
