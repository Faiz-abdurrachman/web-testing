# Kickoff prompt — buat AI agent baru

Copy-paste ini ke AI baru sebelum ngasih task. Ganti bagian `TASK` di bawah.

---

```text
Kamu lanjut kerja di rep^o "Data Sorcerers" — static Astro site: homepage +
halaman Recruitment (+ 6 halaman detail role) + 6 halaman detail HoDS.
Target: pixel-accurate ke Figma/PNG, HTML/CSS ringan.

Sebelum ngapa-ngapain, WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md           → aturan operasional, commands, konvensi verifikasi, gotchas
2. docs/ai-handoff.md  → STATE PALING TERKINI ("dimana kita sekarang"); baca ini
                         sebelum nebak dari git log
3. HANDOVER.md         → konteks panjang: stack, struktur, status, TODO
4. docs/assets.md      → provenance tiap section + node Figma
5. docs/sound-sop.md   → SOP sound system (Web Audio prosedural) + tuning + gotcha
                         (skill `.agents/skills/data-sorcerers-sound/SKILL.md`)

Aturan inti (patuhi):
- PNG referensi = sumber kebenaran; CSS export Figma cuma hint. Kalau beda → ikut PNG.
- Semua UI = HTML/CSS asli. Jangan flatten screenshot jadi gambar (teks, tombol,
  border, kartu, gradient text).
- Ukur dari PNG pakai sharp (bbox/pixel diff). Jangan nebak/eyeball.
- Geometri di-assert di scripts/verify.mjs (assert.deepEqual). Kalau desain sengaja
  diubah, update assertion-nya juga.
- Wajib fallback prefers-reduced-motion untuk tiap animasi (verify/audit jalan di
  `reducedMotion: reduce`).
- Runtime deps sengaja cuma `astro` + `gsap` + `three`. Jangan tambah library lain
  tanpa tanya; lazy-import yang berat.
- Commit per fitur, gaya `feat:`/`fix:`/`docs:`/`chore:`. Konfirmasi dulu ke user
  sebelum push (Vercel auto-deploy dari `main`).
- **Push GANDA**: remote `origin` (= testing) punya **dua push URL** (testing +
  production `Web-Data-Sorcerers/community-web`). `git push origin main` mengirim
  ke dua-duanya — jangan tambah remote lain. Cek sinkron: `git fetch production
  -q && git rev-parse --short main origin/main production/main`.

Commands:
- npm ci                     → install (Node 22.x)
- npm run dev                → dev server http://localhost:4321
- npm run build              → astro check + astro build (HARUS 0 error)
- npm run format:check       → harus lolos sebelum commit
- node scripts/verify.mjs               → verifikasi visual + geometri (HARUS exit 0)
- node scripts/responsive-audit.mjs     → 14 rute × 26 lebar (320–3840; HARUS exit 0)
- npm run perf:audit         → scroll-jank + long-task per section (set PERF_MAX_TASK untuk fail)
- npm run verify:vt          → smoke View Transitions + cue sound (navigasi klien; butuh preview)
- npm run seo:audit          → validasi meta/OG/canonical/sitemap di dist (setelah build)
- npm run assets:og          → regen og image + favicon + manifest
- npm run assets:starfield   → regen tile bintang What We Do (Chromium)
- npm run assets:optimize    → re-encode webp berat

Catatan verifikasi: `verify.mjs`/`responsive-audit.mjs` pakai Chromium di
`/usr/bin/chromium` (override `CHROMIUM_PATH`) dan `PREVIEW_URL` (default
http://localhost:4321). Kalau verify hang di `networkidle`/OOM: `npm run build &&
npx astro preview --port 4331` lalu `PREVIEW_URL=http://localhost:4331 node
scripts/verify.mjs`. Baca "Verification workflow" di AGENTS.md (reducedMotion +
setNavbarHidden). Fitur CSS modern (mis. `backdrop-filter`): cek di `dist/`/live,
bukan cuma dev.

Kondisi sekarang (detail di docs/ai-handoff.md):
- 14 rute: `/`, `/recruitment`, `/recruitment/roles/{id}` (6), `/hods/{id}` (6)
  (+ `/lab/sound` internal, noindex).
- **View Transitions AKTIF** (`<ClientRouter />` di `BaseLayout`): navigasi
  antar-halaman klien (cross-fade) + `AudioContext` persist. Karena Astro tidak
  menjalankan ulang script bundled saat swap, **tiap komponen re-init lewat
  `astro:page-load`** dan cleanup di `astro:before-swap` (AbortController/
  observer/GSAP). Aturan lengkap: `docs/sound-sop.md` §9. Kalau bikin komponen
  baru yang menyentuh DOM, WAJIB ikut pola ini.
- Motion GSAP + Three.js AKTIF (`src/components/Motion.astro` +
  `src/scripts/motion.ts`): hero pinned scroll + partikel Three.js (lazy), idle
  karakter, scroll reveal, 3D tilt, magnetic button, cursor glow. Semua inert saat
  reduced motion.
- Navbar = **persis Figma** (`Navbar.astro`, node `755:15178` / `assets/Navbar.png`
  = 5× frame 1440×106.8): `padding 24px 80px`, logo 54×58.8 di 80/24, grup kanan
  `menu (gap 18) → 90px → CTA`, link non-aktif `#707070`, aktif `#fff` + underline
  gradient 1px selebar label (Home 49px), CTA putih `173 × 42.1` rim `148deg` 2px.
  ≥1301px lebar tab di-hardcode ke Figma (menu **753**) biar persis; saat scroll
  cuma cross-fade ke backing kaca transparan (`rgb(6 5 10 / 45%)` + `blur(12px)`),
  **tanpa** kapsul/indikator/flash/morph. Mobile ≤1050 = hamburger full-screen,
  warna link diselaraskan. Audit: `npm run audit:navbar` (assert geometri 1440).
- What We Do: starfield di-raster jadi tile PNG periodik
  (`public/images/starfield/starfield-*.png`, regen `npm run assets:starfield`)
  supaya scroll tidak berat; `will-change` hanya saat section dekat viewport.
- Deep link / Back: `BaseLayout.astro` re-apply target hash setelah splash selesai
  (`section[id]`/`main[id]` punya `scroll-margin-top: 110px`). Jangan diubah tanpa
  alasan — pernah bug Back mendarat di section salah.
- Available Roles card: `aspect-ratio: 1652/956` + `container-type: inline-size`,
  semua metrik `cqw`, base `#2a2a2c`, glow violet kanan-bawah (`role-glow.webp`) +
  ring gradient `150deg` via `mask-composite`. Judul Title Case dari `domains.ts`,
  tagline dari `roles.ts`. Glow wave halus `scale 1→1.04` (di-pause off-screen).
  Hover pointer-reactive: pool radial ikut kursor + ember lean + divider draw +
  panah overshoot (gate `(pointer: fine)` + `no-preference`). Geometri di-assert
  di `verify.mjs` (section `851.375`, list `518.375`, kartu `413.33 × 239.19`).
- Detail role/HoDS: `main` `min-height: 100vh/100lvh` **hanya ≤900px** biar
  gradient mentok bawah (desktop tetap frame 1280 — `verify.mjs` assert di
  1440×1400); jangan naikkan ke base.
- Hero mobile fluid (≤600px) pakai `clamp()` + `min-height: 100svh`; ≥601px jangan
  diubah (tablet/desktop + diff PNG 1440 tetap).
- SEO/OG: origin dari `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`) → canonical/OG/Twitter/
  JSON-LD, robots, sitemap, share card. Ganti origin kalau domain final beda.
- Sound: SFX prosedural + ambient (Web Audio, 0 aset/0 dependency), orb mute
  melayang (`src/components/Sound.astro` di `BaseLayout`), cue per-komponen via
  `data-sfx` / `data-sfx-hover` / event `ds:sfx`, cue `transition` pada link
  internal, halaman audisi `/lab/sound`. **SOP portable (disukai user, bakal
  dipakai ulang): `docs/sound-sop.md`** (§10 cara porting ke project lain).
  Jangan tambah dependency/file audio tanpa izin.
- Konvensi: carousel/rail pakai ←/→ saat section-nya di tengah viewport (Projects &
  DomainRail ganti di 1050px, Snippets di 760px); button hover = swap warna; jangan
  pakai lebar fixed-px yang bisa overflow (tes 320–3840px).

Kalau bikin/ubah section: update `docs/assets.md` + `docs/ai-handoff.md` dan
tambah/cek assertion di `scripts/verify.mjs`.

TODO utama: **ikuti `docs/ai-handoff.md` §"Next plan — untuk AI berikutnya"**.
**Perf P0 SELESAI (28 Sep 2026, HEAD `4fe4c19`):** Home mobile 1.33→0.98 MB —
sorcerer → AVIF (`sorcerer-2x` 481→196 KB), video hero di-re-encode (home webm
0.38 MB, recruitment 0.76 MB), poster tak di-fetch di HP, `sizes` Snippets +
960w, `logo.png` 14 KB, hero bg/fig 180/86 KB. Sudah live juga: VT hardening
(`verify-vt.mjs` uji Back/Forward + reload + reduce; sisa device nyata), OG
hardening, hover kartu (domain/project/snippet) + hover cue project, keyboard
carousel cues, dan fix parity hover home + rail edge fade (`6c79831`–`4fe4c19`).
**P0(b) "splash jangan nunggu `three`" = BATAL** (HP memang tidak menunggu
`three`; desktop sengaja).

Prioritas berikutnya (opsional, urut): (a) AVIF hero art + ikon philosophy/glow
kalau mau tembus Home ≤800 KB; (b) konten asli (project/tanggal recruitment);
(c) halaman About Us / Hall of Frames / Partners / Contact (nav `aria-disabled` —
jangan bikin URL palsu); (d) webfont Nasalization (berlisensi — jangan diakali).
Sound selesai (`docs/sound-sop.md`).

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
<pahami semuanya dulu>
```
