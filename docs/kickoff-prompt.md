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
- npm run build              → astro check + build (HARUS 0 error, 17 halaman)
- npm run format:check       → harus lolos sebelum commit
- node scripts/verify.mjs               → verifikasi visual + geometri (HARUS exit 0)
- node scripts/responsive-audit.mjs     → 17 rute × 26 lebar 320–3840 (HARUS exit 0)
- npm run audit:navbar       → geometri navbar exact 1440 (HARUS ALL PASS)
- npm run verify:vt          → smoke View Transitions + cue sound (butuh preview)
- npm run seo:audit          → validasi meta/OG/canonical/sitemap di dist (setelah build)
- npm run perf:audit         → scroll-jank + long-task per section
- npm run assets:og / :starfield / :footer / :partners / :optimize → regen aset

CATATAN VERIFIKASI: pakai Chromium `/usr/bin/chromium` (override CHROMIUM_PATH) dan
`PREVIEW_URL` (default http://localhost:4321). `verify.mjs` nunggu `networkidle`;
kalau hang di dev/OOM: `npm run build && npx astro preview --port 4331` lalu
`PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`. Baca "Verification
workflow" di AGENTS.md (reducedMotion + setNavbarHidden). CSS modern
(mis. backdrop-filter): cek di `dist/`/live, bukan cuma dev.

KONDISI SEKARANG (detail: docs/ai-handoff.md):
- **17 rute publik**: `/`, `/about`, `/partners`, `/recruitment`,
  `/recruitment/roles/{6}`, `/hods/{6}` (+ `/lab/sound` internal, noindex).
- **Homepage hero — revisi font & spacing (terbaru, 1 Oct 2026).** Frame Figma
  `1430:2040`/hero `1430:2041`. Judul **Bluu Next Bold 72/86** (SIL OFL di-bundle,
  token `--font-display`; Nasalization tetap untuk halaman lain), 2 baris gap 4,
  gradient per baris; paragraf Manrope 18/25 lebar 655; spacing 80/64/16/24; tombol
  `community` (hover #2F196F) & `explore` (hover #4C3B7E); navbar CTA **"Join Us"
  93×43** (shared). **Art hero = image fill Figma persis** → hero MAE 27.96 → 3.18.
  Referensi: `Home-Hero-Revisi.png`. Node teks `1430:2044/2045/2046`.
- **About Us §1–4 SELESAI** (`/about`): ambient glow = **fill per-section Figma**
  (`Philosophy` 163deg 63%/126%; `Ecosystem` 24.75deg 53%/133%) — MCP menormalkan
  handle (lossy), fit dari PNG.
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
1. **Lanjutkan revisi font & spacing homepage** ke section berikutnya, urut:
   **Philosophy → What We Do → HoDS → Our Project → CTA**, pakai `--font-display`
   (Bluu Next) + grid 8px sesuai frame `1430:2040`. Perlakukan tiap section seperti
   hero: export node → ukur → implement → diff ±1px → update verify.
2. Konten asli (`projects.ts`, tanggal recruitment) — butuh material user.
3. Halaman **Hall of Frames / Contact** (nav masih `aria-disabled` — jangan bikin
   URL palsu).
4. Webfont Nasalization (berlisensi — jangan diakali).

Kalau bikin/ubah section: WAJIB update `docs/assets.md` + `docs/ai-handoff.md` dan
tambah/cek assertion + path referensi di `scripts/verify.mjs`.

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
<TULIS TASK DI SINI>
```
