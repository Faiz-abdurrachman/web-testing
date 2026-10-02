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

### A. HOMEPAGE REVISI FONT & SPACING (Node 1430:2040, Frame 1440):
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
5. **Our Project Section (`1430:2146`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px, gap header 82px.
   - Heading "Our Project": Bluu Next Bold 700 56/67.2, linear-gradient per baris.
   - 3D Coverflow Project Cards & Action Button "View All Works".
6. **CTA Recruitment Section (`1430:2162`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px. Container card padding 64px 80px, gap 48px.
   - Heading "Ready to Become a Sorcerer?": Bluu Next Bold 700 56/67.2.
   - Subtitle Manrope 16/24 white (gap 24px), action buttons gap 26px.

### B. RECRUITMENT PAGE REVISI FONT & SPACING (Node 1436:3505, Frame 1440):
1. **Recruitment Hero Section (`1436:3506`)** — [STATUS: SELESAI]
   - Frame 1440 × 866, padding 0 80px. Frame 2733 (1280 × 310) vertically centered (top 278px, bottom 278px).
   - Heading Bluu Next Bold 700 72/86 ("Your Next Chapter" & "Start here", gap 4px).
   - Description Manrope Medium 18/27 #EDE8FF 900×27 (gap 16px, letter-spacing -0.176px).
   - Button Apply Now 120×43 (gap 48px), Primary radial gradient violet (hover #2F196F).
2. **Who Should Join Section (`1436:3512`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px, gap header 74px.
   - Heading "Who Should Join": Bluu Next Bold 700 56/67.2.
   - Domain tracks carousel: gap antar kartu 32px, kartu dimensions & typography check.
3. **What You Will Do Section (`1436:3517`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440 × 903, padding 80px, gap 20px. Body 1312 × 625.
   - Heading "What You Will Do": Bluu Next Bold 700 56/67.2.
   - Pipeline stages/levels: gradient linear cards per role.
4. **Available Roles Section Revisi Card (`1436:3564`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px, gap header 58px.
   - Heading "Available Roles": Bluu Next Bold 700 56/67.2 + subtitle Manrope 18/27.
   - 6 kartu role revisi (gap 40px, kartu layout & typography).
5. **Selection Timeline (`1436:3637`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px.
   - Heading "Selection Timeline": Bluu Next Bold 700 56/67.2.
   - Timeline table header (padding 18px 32px) + 6 timeline rows (gap 18px).
6. **FAQ Section (`1436:3675`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px.
   - Heading "FAQ": Bluu Next Bold 700 56/67.2 uppercase.
   - 6 FAQ accordion cards: stroke 1px #CBC5FF/0.3, radius 20px, gap 16px/24px.
7. **Snippets of Life at Data Sorcerers (`1436:3684`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 40px 80px, gap 56px.
   - Heading "Snippets of Life at data sorcerers": Bluu Next Bold 700 56/67.2.
   - Gallery 1280px (hero frame 556px + 5 thumbnails bar gap 35px).
8. **CTA Recruitment Section (`1436:3687`)** — [STATUS: PENDING AUDIT & REVISI]
   - Frame 1440, padding 80px.
   - Heading "Ready to Become a Sorcery?": Bluu Next Bold 700 56/67.2.
   - Button "Join the Community".

================================================================================
INSTRUKSI EKSEKUSI UNTUK AI BARU (WAJIB DIIKUTI):
================================================================================
1. **Paparkan Rencana Kerja Lengkap Per-Section:**
   Sebelum menyentuh satu baris kode pun, paparkan rencana kerjamu: urutan section yang akan
   diaudit dan direvisi, node Figma yang ditargetkan, serta estimasi perubahannya.
2. **Eksekusi Bertahap (Satu Section per Langkah, DILARANG Melompati Section):**
   - Buka section yang ditargetkan.
   - Export node PNG 1x dan 2x via `node scripts/figma.mjs export <nodeId> 1 png <path>`
     dan `figma_download_figma_images`.
   - Ukur dengan `sharp`: ukur bounding box, posisi x/y, lebar/tinggi, gap, dan padding.
   - Pastikan mematuhi **Strict 8-Point Grid Spacing**.
   - Terapkan font **Bluu Next Bold 700** (`--font-display`) untuk heading dan **Manrope** untuk body.
   - Update assertions di `scripts/verify.mjs`.
   - Jalankan seluruh gate verifikasi (`build`, `verify.mjs`, `responsive-audit.mjs`, `audit:navbar`, `verify:vt`, `format:check`).
   - Update dokumentasi (`docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`).
   - Lakukan git commit per fitur.
3. **Mulai dari mana?**
   Pilih salah satu prioritas di bawah ini dan konfirmasikan ke user:
   - **Opsi 1**: Selesaikan 2 section sisa di Homepage (`Our Project` 1430:2146 dan `CTA Recruitment` 1430:2162) sehingga Homepage 100% selesai.
   - **Opsi 2**: Lanjutkan section-by-section di Recruitment Page mulai dari `Who Should Join` (1436:3512) ke bawah.
```
