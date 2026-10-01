# Kickoff prompt — buat AI agent baru

Copy-paste ini ke AI baru sebelum ngasih task. Ganti bagian `TASK` di bawah.

---

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro site: homepage +
About Us + Partners + Recruitment (+ 6 detail role) + 6 detail HoDS.
Target: **pixel-accurate ke Figma/PNG**, HTML/CSS ringan (bukan flatten screenshot).

Sebelum ngapa-ngapain, WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md                    → aturan operasional, commands, konvensi verifikasi, gotchas
2. docs/pixel-precision-sop.md  → **SOP PRESISI PIKsel (paling penting)** — cara
                                  export node Figma, bundle font, pakai image fill,
                                  ukur sharp, diff, iterasi. Baca sebelum sentuh UI apa pun.
3. docs/ai-handoff.md           → STATE PALING TERKINI ("dimana kita sekarang")
4. HANDOVER.md                  → konteks panjang: stack, struktur, status, TODO
5. docs/assets.md               → provenance tiap section + node Figma
6. docs/sound-sop.md            → SOP sound (Web Audio prosedural) + porting
                                  (skill `.agents/skills/data-sorcerers-sound/SKILL.md`)

ATURAN INTI (hukum, jangan dilanggar):
- **PNG node hasil export dari Figma = sumber kebenaran.** CSS export Figma, string
  gradient MCP, dan `effects` payload = hint & sering LOSSY. Kalau beda → ikut PNG.
- SELALU mulai dari export node: `figma_get_figma_data` (struktur) +
  `figma_download_figma_images` (PNG 1x/2x + node teks/komponen terpisah) → UKUR
  dengan sharp. Jangan paste string MCP/CSS mentah.
- **Effect Figma (GLASS/shadow) TIDAK selalu muncul di MCP.** `figma_get_figma_data`
  bisa melaporkan fills/effects kosong padahal node memakai effect `GLASS`
  (rim 1px + backdrop blur). Cek `effects`/`strokes` asli via **REST API**
  (`GET /v1/files/<key>/nodes?ids=…`, header `X-Figma-Token: $FIGMA_API_KEY`).
  Emulasi rim dengan ring `::after` + `mask-composite: exclude` (JANGAN `border` —
  menggeser content box), alpha di-fit dari PNG (rim glass lebih terang di atas).
- **Bundle font persis Figma** (cek lisensi; OFL → vendor woff2 ke public/fonts/ +
  @font-face; deklarasikan weight asli biar tidak faux-bold). Jangan ganti font
  global mid-migrasi — halaman yang belum direvisi tetap token lamanya.
  Nasalization TIDAK boleh di-bundle (lisensi desktop) — jangan diakali.
- **Image fill dipakai APA ADANYA** (`imageRef` → download raw → `fit:cover` sesuai
  crop FILL Figma). Jangan rekonstruksi dari layer (hero rekonstruksi ~24 MAE vs
  raw fill ~2.7 MAE).
- **Semua UI = HTML/CSS asli.** Teks/tombol/border/kartu/gradient-text dibangun di
  CSS. Gradient teks per baris (`background-clip:text`).
- **Ukur, jangan nebak.** Posisi tinta harus cocok referensi **±1px**. Kalau diff
  satu region tinggi, cek dulu: font? gradient? artwork? — jangan langsung "fix CSS".
- **Geometri di-assert** di scripts/verify.mjs (`assert.deepEqual`). Kalau desain
  sengaja diubah → update assertion + path PNG referensi di commit yang sama.
- Wajib fallback `prefers-reduced-motion`; render reduce harus tetap pixel-exact
  (semua audit jalan di reducedMotion: reduce).
- Runtime deps SENGAJA cuma `astro` + `gsap` + `three`. Jangan tambah library lain
  tanpa tanya; lazy-import yang berat.
- View Transitions (ClientRouter) AKTIF: tiap komponen yang sentuh DOM WAJIB
  re-init di `astro:page-load` + cleanup di `astro:before-swap` (docs/sound-sop.md §9).
- Update docs tiap ubah section: docs/assets.md + docs/ai-handoff.md + AGENTS.md.
- Commit per fitur (`feat:`/`fix:`/`docs:`/`chore:`). **Konfirmasi user dulu sebelum
  push** (Vercel auto-deploy dari `main`).

PUSH GANDA (penting): remote `origin` (= testing) punya DUA push URL (testing +
production `Web-Data-Sorcerers/community-web`). `git push origin main` mengirim ke
dua-duanya — jangan tambah remote/push URL lain. Cek sinkron:
`git fetch production -q && git rev-parse --short main origin/main production/main`.

COMMANDS:
- npm ci                     → install (Node 22.x)
- npm run dev                → dev server http://localhost:4321
- npm run build              → astro check + build (HARUS 0 error, 18 halaman)
- npm run format:check       → harus lolos sebelum commit
- node scripts/verify.mjs               → verifikasi visual + geometri (HARUS exit 0)
- node scripts/responsive-audit.mjs     → 18 rute × 26 lebar 320–3840 (HARUS exit 0)
- npm run audit:navbar       → geometri navbar exact 1440 (HARUS ALL PASS)
- npm run verify:vt          → smoke View Transitions + cue sound (butuh preview)
- npm run seo:audit          → validasi meta/OG/canonical/sitemap di dist (setelah build)
- npm run perf:audit         → scroll-jank + long-task per section
- npm run assets:og / :starfield / :footer / :partners / :hof / :contact /
  :optimize → regen aset

CATATAN VERIFIKASI: pakai Chromium `/usr/bin/chromium` (override CHROMIUM_PATH) dan
`PREVIEW_URL` (default http://localhost:4321). `verify.mjs` nunggu `networkidle`;
kalau hang di dev/OOM: `npm run build && npx astro preview --port 4331` lalu
`PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`. Baca "Verification
workflow" di AGENTS.md (reducedMotion + setNavbarHidden). CSS modern
(mis. backdrop-filter): cek di `dist/`/live, bukan cuma dev.

KONDISI SEKARANG (detail: docs/ai-handoff.md):
- **18 rute publik**: `/`, `/about`, `/partners`, `/recruitment`,
  `/hall-of-frames`, `/contact`, `/recruitment/roles/{6}`, `/hods/{6}`
  (+ `/lab/sound` internal, noindex). **Semua link navbar aktif.**
- **Detail HoDS Pages (/hods/[id]) SELESAI (2 Oct 2026).**
  Frame Figma `864:18857`, `864:18904`, `864:18959`, `864:19013`, `864:19024`, `864:19035`
  dan callout Gembala: "Penyesuaian Height (tinggi card) menjadi 1280px untuk ALL Detile HoDS".
  Container `.hods-detail-inner` `min-height: 1280px`, gap `56px`, padding `80px`.
  Back link di `(80, 80)`, hero card di `(80, 163)` (1280×279), tabs di `(80, 498)` (gap 8px),
  role body gap `32px`, block gap `16px`. Geometri di-assert pada seluruh 6 rute (`/hods/{data,core,language,vision,product,growth}`).
  Regional MAE `/hods/language`: Top **0.5816**, Content **1.3456**, Bottom **2.3912**.
- **Homepage Choose Your Domain (HoDS) SELESAI (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2138`. Judul **Bluu Next Bold 700 56/67.2** (token
  `--font-display`), gradient per baris, Eyebrow `House of Data Sorcerers`
  (Figma `GLASS` effect, 159×26, gap ke heading 8px). Subtitle Manrope 16/24 white
  (gap ke heading 24px). Gap header ke rail kartu 74px. Rail Frame 2509 (1280×436),
  gap antar card diperkecil ke 32px dan ukuran kartu diperlebar ke 405×436px di koordinat
  `x: [80, 517, 954, 1391, 1828, 2265], y: 303`. Judul kartu Manrope Bold 700 22/33,
  deskripsi Manrope 400 16/24 white, gap teks 8px. Keyboard navigation (step 437px) &
  attract-mode step scroll utuh. Section MAE **2.4051**. Geometri diff 0.0px.
- **Homepage What We Do SELESAI (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2089`. Judul **Bluu Next Bold 700 56/67.2** (token `--font-display`),
  2 baris `gap: 4px`. Eyebrow `What We Do` (Figma `GLASS` effect, gap ke heading 8px).
  4 kartu pillar diperlebar ke **391px × 254px** di `(80,80)`, `(969,80)`, `(80,506)`, `(969,506)`.
  Judul kartu **Manrope Bold 700 26/39**, gap nomor-ke-judul 0px, gap judul-ke-desc 16px, gradient rim 1px `135deg`.
  Section MAE **2.5790**. Geometri diff 0.0px.
- **Homepage Our Philosophy SELESAI (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2052`. Judul **Bluu Next Bold 700 56/67** (token
  `--font-display`), 2 baris `gap: 4px`, `&nbsp;` menjaga double-space Figma (587px width exact).
  Kolom desktop 591px di `x: 766, y: 205`. Strict 8pt spacing: eyebrow gap 8px, title-to-grid 48px,
  icon-to-font 24px (sesuai desainer Gembala), title-to-subtitle 8px, grid 30px×92px. Section MAE **2.568**.
- **Homepage hero SELESAI (1 Oct 2026).** Frame Figma
  `1430:2040`/hero `1430:2041`. Judul **Bluu Next Bold 72/86** (SIL OFL di-bundle,
  token `--font-display`), 2 baris gap 4, gradient per baris; paragraf Manrope 18/25 lebar 655;
  tombol `community` (hover #2F196F) & `explore` (hover #4C3B7E); navbar CTA **"Join Us" 93×43**. Hero MAE **3.18**.
- **Hall of Frames SELESAI** (`/hall-of-frames`): Hero 4.34, Featured 2.01, Projects 3D 2.96, Milestone 1.33.
- **Contact SELESAI** (`/contact`): Hero 2.76 (konten 1.28), form 0.57.
- **About Us §1–4 SELESAI** (`/about`): versi lama (jangan diubah sebelum izin user).
- **Partners SELESAI** (`/partners`): hero, OurPartners, WhyPartners.

PRIORITAS BERIKUTNYA:
1. **Revisi Recruitment Page — Hero Section (`1436:3506`) & Button Component (`1436:3502`)**:
   - Frame Figma: `1436:3506` ("About Us Hero Section" di file `JYUzJK1hFqaEwL6DpdDvjp`, page `1436:3505`). Ukuran frame 1440 × 866.
   - Heading `1436:4044` (`Frame 2732`, 900 × 176): **Bluu Next Bold 700 72px / 86.4px** (token `--font-display`), 2 baris gap 4px: "Your Next Chapter" (`1436:3508`) & "Start here" (`1436:4043`), linear-gradient.
   - Description `1436:3509`: Manrope Medium 500 18px / 27px, `#EDE8FF`, 900 × 27px, gap ke heading 16px.
   - Frame 2733 (`1280 × 310`): gap 48px ke tombol Apply Now.
   - Button component set `Apply Noww Button` (`1436:3502`):
     - Primary default (`1436:3501`): 120 × 43px, padding 8px 16px, radial gradient `#6C3BFF` (0%), `#9B7BFF` (50%), `#6C3BFF` (100%), inner shadows, Manrope Medium 500 18/27 white.
     - Primary hover (`1436:3499`): background berubah solid ke `#2F196F` (`rgba(47, 25, 111, 1)`), transisi halus.
     - Secondary default (`1436:3498`): `#1A1A1A` (`rgba(26, 26, 26, 1)`).
     - Secondary hover (`1436:3500`): `#4C3B7E` (`rgba(76, 59, 126, 1)`).
2. Lanjut ke section Recruitment berikutnya:
   - What You Will Do (`1436:3522`)
   - Who Should Join (`1436:3523`)
   - Available Roles (`1436:3540`)
   - Selection Timeline (`1436:3582`)
   - FAQ (`1436:3597`)
   - Snippets (`1436:3612`)
   - CTA Recruitment (`1436:3622`)

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
Revisi Recruitment Hero Section (`src/components/RecruitmentHero.astro`) dan Button Component (`src/components/Button.astro`) berdasarkan Figma node 1436:3506 dan component set 1436:3502 (file JYUzJK1hFqaEwL6DpdDvjp).
Ikuti SOP presisi piksel (docs/pixel-precision-sop.md):
1. Export referensi 1x & 2x: node 1436:3506 ke assets/assets recruitment page/hero section/Recruitment-Hero-Revisi-{1x,2x}.png lewat:
   node scripts/figma.mjs export 1436:3506 1 png "assets/assets recruitment page/hero section/Recruitment-Hero-Revisi-1x.png"
   node scripts/figma.mjs export 1436:3506 2 png "assets/assets recruitment page/hero section/Recruitment-Hero-Revisi-2x.png"
2. Update Heading font ke Bluu Next Bold 700 72px / 86.4px (token --font-display), 2 baris ("Your Next Chapter" & "Start here"), gap 4px, gradient per baris (background-clip: text).
3. Update Hero Description Manrope Medium 500 18/27 #EDE8FF, gap 16px dari heading.
4. Update Button Component (src/components/Button.astro) dengan hover state persis component set 1436:3502:
   - primary default: radial gradient #6C3BFF -> #9B7BFF -> #6C3BFF dengan specular inner shadow.
   - primary hover: solid background #2F196F (rgba(47, 25, 111, 1)).
   - sec default: solid #1A1A1A, sec hover: solid #4C3B7E.
5. Pertahankan Three.js / background visual effect, sound cue (data-sfx="open" / hover), dan responsive behavior.
6. Ukur dengan sharp, sesuaikan assertions di scripts/verify.mjs, jalankan responsive audit, dan pastikan seluruh test suite lolos exit 0.
```
