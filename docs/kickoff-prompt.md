# Kickoff prompt — buat AI agent baru

Copy-paste ini ke AI baru sebelum ngasih task. Ganti bagian `TASK` di bawah.

---

```text
Kamu lanjut kerja di repo "Data Sorcerers" (static Astro site: landing page +
6 halaman detail HoDS). Sebelum ngapa-ngapain, WAJIB baca dulu (urut):

1. AGENTS.md      → aturan operasional, commands, konvensi verifikasi, gotchas
2. HANDOVER.md    → konteks lengkap: stack, struktur, status tiap section,
                    checkpoint, TODO
3. docs/assets.md → provenance tiap section + node Figma

Ringkas aturan intinya (patuhi):
- PNG referensi = sumber kebenaran. CSS export Figma cuma hint. Kalau beda → ikut PNG.
- Semua UI harus HTML/CSS asli. Jangan flatten screenshot jadi gambar (teks, tombol,
  border, kartu, gradient text).
- Ukur dari PNG pakai sharp (bbox/pixel diff). Jangan nebak/eyeball.
- Angka geometri sudah di-assert di scripts/verify.mjs (deepEqual). Kalau desain
  sengaja diubah, update assertion-nya juga.
- Wajib kasih fallback prefers-reduced-motion buat tiap animasi.
- Runtime deps sengaja cuma `astro`. Jangan tambah library tanpa tanya; lazy-import
  kalau berat.
- Commit per fitur, pesan gaya `feat:` / `fix:` / `docs:` / `chore:`, push ke `main`.

Cara kerja & verifikasi:
- npm ci   → install (Node 22.x)
- npm run dev            → dev server http://localhost:4321
- npm run build          → astro check + build (HARUS 0 error)
- npm run format:check   → harus lolos
- node scripts/verify.mjs → verifikasi visual (dev server harus jalan; HARUS exit 0).
  Kalau hang di `networkidle`/OOM: `npm run build && npx astro preview --port 4331`
  lalu `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`.
- node scripts/responsive-audit.mjs → audit responsif 14 halaman × 26 lebar
  (320–3840; HARUS exit 0)
- npm run assets:og → regen og share image + favicon + manifest
- npm run seo:audit → validasi meta/OG/canonical/sitemap di dist (setelah build;
  HARUS exit 0)

Kalau bikin/ubah section: update docs/assets.md + tambah/cek assertion di
scripts/verify.mjs (geometri + containment + overflow 320–1920px). Baca bagian
"Verification workflow" di AGENTS.md dulu (reducedMotion + setNavbarHidden).

Yang perlu kamu tahu sekarang:
- HEAD 'main' (lihat git log; checkpoint fitur recruitment = ff7fe20) = homepage + halaman Recruitment LENGKAP: hero → Who
  Should Join → What You Will Do → Available Roles → Selection Timeline → FAQ →
  Snippets → CTA → Footer, plus halaman detail role (/recruitment/roles/{id},
  di-link dari Available Roles) + hover button.
- Detail HoDS (home) = layout tab; detail role (recruitment) = layout lain
  (About this role/Requirement/Contact). Gradient keduanya full-bleed.
- Motion GSAP+Three (commit 5feea0d) masih di-revert (f925e1d). Card 3D
  (carousel project) tetap ada dan jangan diutak-atik.
- Polish terbaru: navbar state scroll jadi **blur-only** (tanpa panel gelap/garis
  kotak); menu hamburger **full-screen** dengan animasi buka/tutup JS (fallback
  instan saat prefers-reduced-motion) + hover pill membulat; panah carousel
  **kiri-kanan di desktop, bawah di mobile** (Projects & DomainRail ganti di
  1050px, Snippets di 760px). Pakai `scripts/responsive-audit.mjs` buat cek cepat.
- SEO/OG sudah ada: origin `site` dari `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`) → canonical + Open Graph/Twitter + JSON-LD
  di `BaseLayout`, `robots.txt`, sitemap (`@astrojs/sitemap`), share card
  `public/og/og-default.jpg` (regen `npm run assets:og`), validasi
  `npm run seo:audit`. **Ganti origin kalau domain final beda.**
- Konvensi tambahan: carousel/rail pakai ←/→ saat section-nya di tengah viewport;
  button hover = swap warna (dark↔violet, white→violet); jangan pakai lebar
  fixed-px yang bisa overflow (tes 320–3840px).
- Kalau `verify.mjs` full hang di `networkidle` atau Chromium OOM-killed (mesin
  RAM kecil), verifikasi pakai `scripts/responsive-audit.mjs` atau per-section
  pakai skrip Playwright ringan.
- TODO utama: font Nasalization (webfont berlisensi), data project asli, tanggal
  recruitment, halaman lain (About Us, Hall of Frames, Partners, Contact).

Sebelum mulai task di bawah: ringkas dulu pemahamanmu + rencana singkat, lalu kerjakan.

TASK:
<pahami semaunya dulu>
```
