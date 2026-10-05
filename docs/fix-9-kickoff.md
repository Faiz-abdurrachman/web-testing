# Kickoff prompt — lanjutkan misi #9 (copy-paste ke AI baru)

Tempel seluruh blok di bawah ini ke AI baru. (Prompt umum onboarding ada di
`docs/kickoff-prompt.md`.)

```text
Kamu lanjut kerja di repo "Data Sorcerers" — static Astro + Vercel,
target pixel-accurate ke Figma. Orientasi dulu, jangan sentuh kode sebelum baca.

WAJIB baca dulu (urut, jangan skip):
1. AGENTS.md                         → operating manual (commands, 7 gate, gotchas, file map)
2. docs/pixel-precision-sop.md       → SOP presisi (WAJIB; terutama "Hukum
                                       Animasi, Transisi & Smooth Scroll",
                                       "Hukum Section Full-Screen & Hero Gambar",
                                       strict 8-point grid, hukum warna)
3. docs/ai-handoff.md                → state terkini (bagian "TUGAS BERIKUTNYA")
4. docs/page-fullscreen-migration-plan.md → ★ WORK ORDER #9 (MISI SEKARANG)
5. docs/fix-9-plan.md                → riwayat #1–#8 + #10–#12 (SELESAI; jangan ulang)

STATE SEKARANG: fix-9 #1–#8 + #10–#12 SELESAI, ter-commit & ter-push
(main = origin/main = production/main = 77110d3). Jangan rusak benchmark presisi:
Homepage, About Us, Recruitment (9/9), Partners (4/4), Contact, detail HoDS.

MISI SEKARANG = #9: STANDAR FULL-SCREEN (hero gambar + section 100svh) untuk
halaman tersisa, URUT: Recruitment (`1436:3505`) → Partners (`1439:4787`) →
Hall of Frames (`1439:4506`) → Contact (`1445:5065`).
Resep lengkap + peta hero→gambar + checklist per-section + jebakan ada di
docs/page-fullscreen-migration-plan.md — IKUTI.
- Resep: hero = gambar `assets/hero gambar/*` → `hero-bg.webp`+`-2x` (object-fit
  cover, full-bleed) + `min-height:100svh`; section konten = `min-height:100svh`
  + center; CTA & footer TIDAK diubah.
- DILARANG `zoom` / `transform: scale` (user menolak, render pecah).
- Satu section per pass + 7 gate. Update geometry di verify.mjs + pad reference
  PNG dengan sharp.extend() warna #050507 (jangan stretch).

ATURAN STRICT (HUKUM):
- spacing/padding/margin = KELIPATAN 8 (gate `npm run audit:spacing`); nilai
  non-8 hanya jika terukur dari Figma/PNG (tabel pengecualian di SOP).
- heading = Bluu Next Bold 700 (`--font-display`); body Manrope (400/500/700).
- warna solid = fills Figma persis; gradient = FIT dari PNG node (string MCP lossy).
- geometri ±1px; render `prefers-reduced-motion: reduce` tetap pixel-exact
  (semua animasi baru WAJIB inert di reduce).
- Animasi aksesibel: gate `@media (prefers-reduced-motion: no-preference)`.

7 GATE per section (preview: `npm run build && npx astro preview --port 4331`):
1. npm run build (0 error, 19 halaman)
2. PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
3. PREVIEW_URL=http://localhost:4331 node scripts/navbar-audit.mjs
4. PREVIEW_URL=http://localhost:4331 node scripts/verify-vt.mjs
5. PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs (468/468)
6. npm run audit:spacing
7. npm run format:check
(+ npm run seo:audit)

3 DEVIASI SENGAJA DARI FIGMA (jangan "perbaiki" balik tanpa cek user/docs):
1. Judul grup Our Team: "Hause of Data Sorcerers" → "House of Data Sorcerers".
2. Footer scroll-up: di atas divider/legal (absolute dalam .bottom), BUKAN
   fixed melayang.
3. OurTeam HoDS portrait bleed 42px ala Hall of Frames; leader cards tetap clip.
   (Figma reference meng-clip keduanya.)

CARA KERJA:
- Update docs di commit yang sama (docs/assets.md, docs/ai-handoff.md, AGENTS.md,
  docs/page-fullscreen-migration-plan.md). Perbarui docs/fix-9-plan.md (§#9).
- Commit per section/halaman (style: feat:/fix:/docs:/chore:).
- KONFIRMASI user sebelum push. `git push origin main` = deploy testing +
  production sekaligus (origin punya DUA push URL — jangan tambah remote).
- Gotcha penting: baca §"Gotcha" di AGENTS.md & SOP §2 (Astro ClientRouter:
  script re-init `astro:page-load` + cleanup `astro:before-swap`; multi-line CSS
  comment bikin prettier loop; production build minifier bisa buang properti).

MULAI dari: inventaris `depth 1` node halaman Recruitment (`1436:3505`), tulis
Master Work Plan per section, lalu kerjakan section 1 (Hero `1436:3506`) dulu.
```

## Peta cepat halaman #9

| Urutan | Halaman     | Node page   | Section (depth 1)                                                                                                                                                                                    |
| ------ | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | Recruitment | `1436:3505` | Hero `1436:3506`, WhoShouldJoin `1436:3512`, WhatYouWillDo `1436:3517`, AvailableRoles `1436:3564`, Timeline `1436:3637`, FAQ `1436:3675`, Snippets `1436:3684`, CTA `1436:3687`, Footer `1436:3699` |
| 2      | Partners    | `1439:4787` | Hero `1439:4788`, OurPartners `1439:4793`, WhyDS `1439:4937`, Footer `1439:4983`                                                                                                                     |
| 3      | Hall of Fr. | `1439:4506` | Hero `1439:4507`, Featured `1439:4512`, Projects `1439:4655`, Milestone `1439:4699`, Footer `1439:4724`                                                                                              |
| 4      | Contact     | `1445:5065` | Hero `1445:5066` (2 kolom!), Footer `1445:5118`                                                                                                                                                      |

Hero→gambar: lihat tabel `docs/page-fullscreen-migration-plan.md` §2.
