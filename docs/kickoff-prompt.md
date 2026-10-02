# Kickoff prompt — buat AI agent baru

Copy-paste seluruh blok di bawah ini ke AI baru sebelum memberikan instruksi kerja. Prompt ini telah memuat seluruh konteks, aturan hukum presisi piksel, 8-point grid, serta checklist per-section untuk **Homepage** dan **Recruitment Page**.

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

4. **TYPOGRAPHY REVISI — BLUU NEXT BOLD 700:**
   - Semua heading utama pada Homepage Revisi (`1430:2040`) dan Recruitment Page Revisi (`1436:3505`)
     telah berganti dari Nasalization ke **Bluu Next Bold 700** (`--font-display`).
   - Heading 56px / line-height 67.2px atau 72px / line-height 86.4px.
   - Gradient teks diterapkan per baris (`background-clip: text`).
   - Body & subtitle memakai Manrope (400/500/700) dengan letter-spacing terkalibrasi (misal `-0.176px`).

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
Cek sinkron: `git fetch production -q && git rev-parse --short main origin/main production/main`.

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
TARGET MISI UTAMA: AUDIT & EKSEKUSI PER-SECTION DUA HALAMAN REVISI
================================================================================
Dua halaman yang wajib dicek secara ketat spacing, padding, dan font-nya:
1. **Homepage Revisi Font & Spacing**:
   URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1430-2040
2. **Recruitment Page Revisi Font & Spacing**:
   URL: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3505

--------------------------------------------------------------------------------
CHECKLIST STATUS PER-SECTION:
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
5. **Selection Timeline (`1436:3637`)** — [STATUS: TARGET BERIKUTNYA / CURRENT PRIORITY]
   - URL: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3637`
   - Frame 1440 × 812px / 815px, padding 80px, gap header-to-table **56px** (Strict 8-Point Grid kelipatan 8, menggantikan 58px lama).
   - Heading "Selection Timeline": Bluu Next Bold 700 56/67.2px (`--font-display`), gradient 181deg per baris.
   - Timeline table 1280px: Header 1280×78px (padding 18px 32px), Body 1280×451px (padding 18px 32px, gap 18px, 6 rows dengan separator linear gradient).
6. **FAQ Section (`1436:3675`)** — [STATUS: UPCOMING]
   - Frame 1440 × 983px, padding 80px.
   - Heading "FAQ": Bluu Next Bold 700 56/67px uppercase.
   - 6 FAQ accordion cards: stroke 1px #CBC5FF/0.3, radius 20px, gap 16px/24px.
7. **Snippets of Life at Data Sorcerers (`1436:3684`)** — [STATUS: UPCOMING]
   - Frame 1440 × 897px, padding 40px 80px, gap 56px.
   - Heading "Snippets of Life at data sorcerers": Bluu Next Bold 700 56/67px.
   - Gallery 1280px (hero frame 556px + 5 thumbnails bar gap 35px).
8. **CTA Recruitment Section (`1436:3687`)** — [STATUS: UPCOMING]
   - Frame 1440 × 520px, padding 80px.
   - Heading "Ready to Become a Sorcery?": Bluu Next Bold 700 56/67px.
   - Button "Join the Community".
9. **Footer (`1436:3699`)** — [STATUS: UPCOMING]
   - Frame 1440 × 556px, padding 80px.

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
   Target saat ini: **Section 5: Selection Timeline (Node 1436:3637)** pada Recruitment Page.
```
