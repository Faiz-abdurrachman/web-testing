# Kickoff prompt — buat AI agent baru

Copy-paste ini ke AI baru sebelum ngasih task. Ganti bagian `TASK` di bawah.

---

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro site: homepage +
halaman Recruitment (+ 6 halaman detail role) + 6 halaman detail HoDS.
Target: pixel-accurate ke Figma/PNG, HTML/CSS ringan.

Sebelum ngapa-ngapain, WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md           → aturan operasional, commands, konvensi verifikasi, gotchas
2. docs/ai-handoff.md  → STATE PALING TERKINI ("dimana kita sekarang"); baca ini
                         sebelum nebak dari git log
3. HANDOVER.md         → konteks panjang: stack, struktur, status, TODO
4. docs/assets.md      → provenance tiap section + node Figma

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

Commands:
- npm ci                     → install (Node 22.x)
- npm run dev                → dev server http://localhost:4321
- npm run build              → astro check + astro build (HARUS 0 error)
- npm run format:check       → harus lolos sebelum commit
- node scripts/verify.mjs               → verifikasi visual + geometri (HARUS exit 0)
- node scripts/responsive-audit.mjs     → 14 rute × 26 lebar (320–3840; HARUS exit 0)
- npm run perf:audit         → scroll-jank + long-task per section (set PERF_MAX_TASK untuk fail)
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
- 14 rute: `/`, `/recruitment`, `/recruitment/roles/{id}` (6), `/hods/{id}` (6).
- Motion GSAP + Three.js AKTIF (`src/components/Motion.astro` +
  `src/scripts/motion.ts`): hero pinned scroll + partikel Three.js (lazy), idle
  karakter, scroll reveal, 3D tilt, magnetic button, cursor glow. Semua inert saat
  reduced motion.
- Navbar "living HUD": transparan di hero → kapsul kaca melayang saat scroll
  (`--nb-radius: 999px`), flash sweep, indikator tab aktif meluncur springy,
  hamburger mobile. Tanpa auto-hide, tanpa petir, tanpa garis progress.
- What We Do: starfield di-raster jadi tile PNG periodik
  (`public/images/starfield/starfield-*.png`, regen `npm run assets:starfield`)
  supaya scroll tidak berat; `will-change` hanya saat section dekat viewport.
- Deep link / Back: `BaseLayout.astro` re-apply target hash setelah splash selesai
  (`section[id]`/`main[id]` punya `scroll-margin-top: 110px`). Jangan diubah tanpa
  alasan — pernah bug Back mendarat di section salah.
- Available Roles card redesign: `aspect-ratio: 1350/795` + `container-type:
  inline-size`, semua metrik `cqw`, border emas inset (`mask-composite`), sparkle
  SVG 4 sudut. Judul Title Case dari `domains.ts`; geometri di-assert di `verify.mjs`.
- Hero mobile fluid (≤600px) pakai `clamp()` + `min-height: 100svh`; ≥601px jangan
  diubah (tablet/desktop + diff PNG 1440 tetap).
- SEO/OG: origin dari `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`) → canonical/OG/Twitter/
  JSON-LD, robots, sitemap, share card. Ganti origin kalau domain final beda.
- Konvensi: carousel/rail pakai ←/→ saat section-nya di tengah viewport (Projects &
  DomainRail ganti di 1050px, Snippets di 760px); button hover = swap warna; jangan
  pakai lebar fixed-px yang bisa overflow (tes 320–3840px).

Kalau bikin/ubah section: update `docs/assets.md` + `docs/ai-handoff.md` dan
tambah/cek assertion di `scripts/verify.mjs`.

TODO utama: font Nasalization (webfont berlisensi — jangan diakali), data project
asli, tanggal recruitment, halaman About Us / Hall of Frames / Partners / Contact.

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
<pahami semuanya dulu>
```
