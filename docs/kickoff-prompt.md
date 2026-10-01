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
- **Hall of Frames SELESAI** (`/hall-of-frames`, file Figma
  `JYUzJK1hFqaEwL6DpdDvjp`): Hero `1439:4507` (MAE 4.34), Featured Sorcerers
  `1439:4512` (2.01), Project highlights `1439:4655` (2.96), Community
  Milestone `1439:4699` (1.33). Aset: `npm run assets:hof`.
- **Contact SELESAI** (`/contact`, page `1445:5065`): `ContactHero.astro`
  (hero `1445:5066`, MAE 3.00; form panel 0.57) — hero kiri + form asli +
  artwork swirl. Aset: `npm run assets:contact`. Kartu info sengaja **non-link**
  (destinasi belum diberikan — jangan bikin URL karangan).
- **Homepage hero — revisi font & spacing (1 Oct 2026).** Frame Figma
  `1430:2040`/hero `1430:2041`. Judul **Bluu Next Bold 72/86** (SIL OFL di-bundle,
  token `--font-display`; Nasalization tetap untuk halaman lain), 2 baris gap 4,
  gradient per baris; paragraf Manrope 18/25 lebar 655; spacing 80/64/16/24; tombol
  `community` (hover #2F196F) & `explore` (hover #4C3B7E); navbar CTA **"Join Us"
  93×43** (shared). **Art hero = image fill Figma persis** → hero MAE 27.96 → 3.18.
- **Homepage Our Philosophy — revisi font & spacing (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2052`. Judul **Bluu Next Bold 700 56/67** (token
  `--font-display`), 2 baris `gap: 4px`, `&nbsp;` menjaga double-space Figma (587px width exact).
  Kolom desktop 591px di `x: 766, y: 205`. Strict 8pt spacing: eyebrow gap 8px, title-to-grid 48px,
  icon-to-font 24px (sesuai desainer Gembala), title-to-subtitle 8px, grid 30px×92px. Section MAE **2.568**.
- **Homepage What We Do — revisi font, cards & spacing (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2089`. Judul **Bluu Next Bold 700 56/67.2** (token `--font-display`),
  2 baris `gap: 4px`. Eyebrow `What We Do` (Figma `GLASS` effect, gap ke heading 8px).
  4 kartu pillar diperlebar ke **391px × 254px** di `(80,80)`, `(969,80)`, `(80,506)`, `(969,506)`.
  Judul kartu **Manrope Bold 700 26/39**, gap nomor-ke-judul 0px, gap judul-ke-desc 16px, gradient rim 1px `135deg`.
  Section MAE **2.5790**. Geometri diff 0.0px.
- **About Us §1–4 SELESAI** (`/about`, dibangun dari file Figma LAMA
  `RntmRWAgLrh5utgzcjrUik`): ambient glow = **fill per-section Figma**
  (`Philosophy` 163deg 63%/126%; `Ecosystem` 24.75deg 53%/133%) — MCP menormalkan
  handle (lossy), fit dari PNG. **CATATAN:** ada desain About Us BARU di file
  `JYUzJK1hFqaEwL6DpdDvjp` node `1439:4184` (hero Bluu Next 80 + section Our
  Team) — user minta **JANGAN disentuh dulu**; `/about` masih versi lama.
- **Partners page SELESAI** (`/partners`): hero/OurPartners/WhyPartners, geometri
  di-assert; logo partner masih placeholder DS.
- **Recruitment LENGKAP** + 6 detail role + 6 detail HoDS.
- **Navbar = persis Figma** (`Navbar.astro`): padding 24/80, logo 54×58.8 di 80/24,
  link #707070/aktif #fff + underline gradient, menu 743 / gap 16 / space-between
  (gap 195), CTA "Join Us" 93×43; scroll = backing kaca transparan, tanpa morph.
  Mobile ≤1050 = hamburger full-screen.
- **Motion GSAP + Three.js AKTIF** (Motion.astro/motion.ts): hero pinned + partikel
  (lazy), scroll reveal, tilt, magnetic. Semua inert saat reduce. Idle hero = idle
  halus seluruh plate (`animatePlate`, overscan 1.05).
- **Sound prosedural SELESAI** (`docs/sound-sop.md`), 0 dependency/0 file audio.
- **View Transitions AKTIF**; **SEO/OG/sitemap** selesai (origin dari `SITE_URL`).
- Konvensi: carousel/rail pakai ←/→ saat section di tengah viewport (Projects &
  DomainRail 1050px, Snippets 760px); button hover = swap warna; jangan pakai lebar
  fixed-px yang bisa overflow (tes 320–3840).

PRIORITAS BERIKUTNYA (lihat docs/ai-handoff.md §"Next plan"):
1. **Lanjutkan revisi font & spacing homepage: House of Data Sorcerers (HoDS) / "Choose Your Domain" (`1430:2138`)**:
   - Frame Figma: `1430:2138` (1440 × 819, `padding: 80px`).
   - Header group `1430:2139` (`Frame 2284`, 1280 × 149):
     - `Frame 2283` (`1280 × 101`, `VERTICAL gap: 8px`):
       - Eyebrow CTA `1430:2141` (`159 × 26px`, padding `4px 12px`, border-radius 32px, `rgba(255,255,255,0.15)` with Figma `GLASS` effect, text: "House of Data Sorcerers").
       - Heading `1430:2143` ("Choose Your Domain", `538 × 67px`, **Bluu Next Bold 700 56px / 67.2px**, per-line clipped `linear-gradient(211.54deg, #FFFFFF 32.8%, #999999 49.8%, #FFFFFF 73.04%)`, gap ke eyebrow: **8px**).
     - Subtitle `1430:2144` (Manrope Regular 16/24 white, `1280 × 24px`, gap ke heading: **24px**).
   - Gap header group ke rail kartu: **74px** (`Frame 2284` ke `HoDS Card`).
   - Rail kartu `HoDS Card` (`1430:2145` / `DomainRail.astro`): `1280 × 436px` (`Frame 2509`, `gap: 32px`, 6 kartu domain `405 × 436px`).
   - Lanjut per section: **Our Project (`1430:2146`) → CTA Recruitment (`1430:2162`)**.
2. **About Us revisi ke file baru** (`1439:4184`, hero + Our Team) — **tunggu
   izin user** (sekarang masih versi lama).
3. Konten asli (`projects.ts`, tanggal recruitment, logo partner 20 slot, member/
   project/milestone HoF) — butuh material user.
4. Webfont Nasalization (berlisensi — jangan diakali).

Kalau bikin/ubah section: WAJIB update `docs/assets.md` + `docs/ai-handoff.md` dan
tambah/cek assertion + path referensi di `scripts/verify.mjs`.

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
Revisi section House of Data Sorcerers (HoDS) / "Choose Your Domain" pada homepage
berdasarkan Figma node 1430:2138 (frame 1430:2040, file JYUzJK1hFqaEwL6DpdDvjp).
Ikuti SOP presisi piksel (docs/pixel-precision-sop.md):
1. Export referensi 1x & 2x: node 1430:2138 ke assets/assets home page/hods/Home-HoDS-Revisi-{1x,2x}.png
   lewat node scripts/figma.mjs export 1430:2138 1 png ...
2. Export cutouts header Frame 2284 dan Eyebrow 1430:2141.
3. Update Heading font ke Bluu Next Bold 700 56px / 67.2px, gradient per baris, gap eyebrow 8px.
4. Update Subtitle Manrope 16/24, gap 24px.
5. Pertahankan attract-mode rail dan interaksi keyboard pada DomainRail.astro.
6. Ukur dengan sharp, sesuaikan geometri di scripts/verify.mjs, jalankan responsive audit,
   pastikan MAE seminimal mungkin (<3.0) dan semua tes exit 0.
```
