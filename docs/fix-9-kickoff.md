# Kickoff prompt — eksekusi 9-item fix list (copy-paste ke AI baru)

Tempel seluruh blok di bawah ini ke AI baru. (Prompt umum onboarding ada di
`docs/kickoff-prompt.md`; yang ini khusus misi 9 fix.)

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro + Vercel,
target pixel-accurate ke Figma. Orientasi dulu, jangan sentuh kode sebelum baca.

WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md                         → operating manual (commands, 7 gate, gotchas)
2. docs/pixel-precision-sop.md       → SOP presisi (WAJIB; terutama "Hukum
                                       Animasi, Transisi & Smooth Scroll",
                                       "Hukum Section Full-Screen & Hero Gambar",
                                       strict 8-point grid, hukum warna)
3. docs/fix-9-plan.md                → ★ WORK ORDER 9 item (MISI SEKARANG)
4. docs/ai-handoff.md                → state terkini
5. docs/page-fullscreen-migration-plan.md → resep full-screen (untuk item #9)

MISI SEKARANG: kerjakan 9-item fix list di docs/fix-9-plan.md.
- Kerjakan SATU ITEM PER PASS sampai lolos 7 GATE, baru lanjut item berikutnya.
  DILARANG lompat / gabung item.
- Urutan yang disarankan: #3 (typo Hause→House) → #1 (CTA homepage →
  /recruitment) → #2 (navbar active underline di semua rute) → #7 (garis "View
  Details" Available Roles sesuai Figma 1218:1347) → #8 (tombol scroll-up footer
  melayang) → #4 (glow kartu Our Team sesuai Figma 1594:5145) → #5 (animasi
  section Our Team + transisi tombol) → #6 (scroll & navigasi smooth) →
  #9 (lanjut full-screen Recruitment → Partners → HoF → Contact).
- Detail tiap item (kondisi kode sekarang, target Figma, file, jebakan,
  verifikasi) ada di docs/fix-9-plan.md — ikuti.

ATURAN STRICT (HUKUM):
- spacing/padding/margin = KELIPATAN 8 (gate `npm run audit:spacing`).
- heading = Bluu Next Bold 700 (`--font-display`); body Manrope (400/500/700).
- warna solid = fills Figma persis; gradient = FIT dari PNG node (string MCP lossy).
- geometri ±1px; render `prefers-reduced-motion: reduce` tetap pixel-exact
  (semua animasi baru WAJIB inert di reduce).
- DILARANG `zoom`/`transform: scale` untuk full-screen.
- Jangan rusak benchmark presisi: Homepage, Recruitment (9/9), Partners (4/4),
  About Us.

7 GATE per item (preview: `npm run build && npx astro preview --port 4331`):
1. npm run build (0 error, 19 halaman)
2. PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
3. PREVIEW_URL=http://localhost:4331 node scripts/navbar-audit.mjs
4. PREVIEW_URL=http://localhost:4331 node scripts/verify-vt.mjs
5. PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs (468/468)
6. npm run audit:spacing
7. npm run format:check
(+ npm run seo:audit)

CARA KERJA:
- Baca docs/fix-9-plan.md dulu. Untuk item yang butuh Figma (1218:1347, 1594:5145),
  export node PNG + cek REST `effects` bila perlu, lalu UKUR dengan sharp
  (jangan kira-kira).
- Update docs di commit yang sama (docs/assets.md, docs/ai-handoff.md, AGENTS.md,
  docs/figma-prototype-flow.md untuk #1, docs/page-fullscreen-migration-plan.md
  untuk #9). Perbarui docs/fix-9-plan.md (tandai item selesai).
- Commit per item (style: feat:/fix:/docs:/chore:).
- KONFIRMASI user sebelum push. `git push origin main` = deploy testing +
  production sekaligus.
- 3 commit lokal terbaru (belum di-push): bc8502f (About full-screen),
  9e4ba41 (Our Team HoDS carousel), 2e5cca8 (docs fix-9 plan).

MULAI dari item #3 (typo "Hause" → "House" di src/components/OurTeam.astro).
Ingat: mengubah teks membuat reference assets/about-us/team/OurTeam-New-1x.png
stale → regenerate dari node 1688:2933 via figma_download_figma_images + update
verify.mjs bila nama file berubah.
```

## Ringkasan 9 item (untuk cepat)

| #   | Item                               | File utama                   | Figma                                              |
| --- | ---------------------------------- | ---------------------------- | -------------------------------------------------- |
| 1   | CTA homepage → `/recruitment`      | `Recruitment.astro`          | `1430:2162`                                        |
| 2   | Navbar active underline semua rute | `Navbar.astro` + pages       | `755:15178`                                        |
| 3   | Typo "Hause"→"House"               | `OurTeam.astro`              | `1688:2933`                                        |
| 4   | Glow kartu sesuai Figma            | `TeamCard.astro`, `team.ts`  | `1594:5145`                                        |
| 5   | Animasi section Our Team           | `OurTeam.astro`, `motion.ts` | —                                                  |
| 6   | Scroll & navigasi smooth           | global / `BaseLayout`        | —                                                  |
| 7   | Garis "View Details" hover         | `AvailableRoles.astro`       | `1218:1347`                                        |
| 8   | Tombol scroll-up footer melayang   | `Footer.astro`               | `765:17071`                                        |
| 9   | Full-screen halaman sisa           | per halaman                  | `1436:3505`, `1439:4787`, `1439:4506`, `1445:5065` |
