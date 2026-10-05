# Fix list 9 — Master Work Order (untuk AI berikutnya)

Sumber: instruksi user 5 Oct 2026 (9 item) + 3 item kelupaan (dokumentasi/dikerjakan
5 Oct 2026). Semua item **satu per pass + 7 gate** (`build · verify.mjs ·
navbar-audit · verify-vt · responsive-audit · audit:spacing · format:check` +
`seo:audit`). Baca `docs/pixel-precision-sop.md` +
`docs/page-fullscreen-migration-plan.md` sebelum menyentuh UI. Update docs di
commit yang sama. Commit per item. **Konfirmasi user sebelum push.**

Status: **#1 #2 #3 #4 #5 #6 #7 #8 + #10 #11 #12 SELESAI (5 Oct 2026).**
**SISA = #9** (full-screen Recruitment → Partners → HoF → Contact).

---

## ~~#1 — CTA homepage~~ **DONE** — `src/components/Recruitment.astro` line 22

`href="/recruitment"` (sebelumnya `#available-roles`). `Cta.astro` (halaman
Recruitment) tidak berubah. `docs/figma-prototype-flow.md` diperbarui.

## ~~#2 — Navbar link aktif~~ **DONE** — semua rute utama kirim prop `active`

benar; halaman detail sengaja tidak render Navbar (back-nav sendiri). **Mobile
menu** kini menampilkan `.nav-underline` (sebelumnya `display:none`) — gradient
`#9b7bff→#ede8ff` 1px full-width.

## ~~#3 — Typo "HAUSE" → "HOUSE"~~ **DONE** — `src/components/OurTeam.astro`

(comment + title). Reference `assets/about-us/team/OurTeam-New-1x.png`
diregenerasi dari node `1688:2933`. Deviasi sengaja dari ejaan Figma dicatat di
`docs/assets.md`.

## ~~#4 — Efek glow tiap kartu~~ **DONE** — REST node `1594:4370`:

`effects:[{type:"GLASS"}]` (tidak ada DROP_SHADOW/radial). "Glow" yang terlihat =
**fade bawah** + GLASS rim. Fix terukur (A/B in-browser, bukan kira-kira): fade
`tint 0% → tint 35% @35% → dark` (CSS interpolasi gradient premultiplied: stop
tint tanpa alpha membuat ungu/merah hilang) + rim `180deg 0.25→0.02`. Data dark
`#0f0001 → #170002`. **Section MAE 3.503 → 2.774 (−20.8%).**

## ~~#5 — Animasi section Our Team~~ **DONE** — `motion.ts` `reveal()` scoped

`.our-team` (header, 2 group title, leader cards, `.hods-top`, active panel
cards). `OurTeam.astro`: carousel `render()` restart class `is-entering` +
`@keyframes hods-card-in` (stagger `--i * 60ms`), gated
`prefers-reduced-motion: no-preference` + `:global()` (child-component scoping);
`will-change: transform` di `.hods-chips`. Reduce = inert.

## ~~#6 — Scroll & pindah halaman smooth~~ **DONE** — `src/styles/global.css`:

`html { scroll-behavior: smooth }` di-gate `@media
(prefers-reduced-motion: no-preference)`. Same-page hash (`#available-roles`)
smooth; reduce = instan. Cross-page sudah halus via `<ClientRouter />` default.

## ~~#7 — Available Roles divider~~ **DONE** — divider pindah ke bawah

"View Details" (Figma `1218:1347` active variant: bottom stroke 0.5px gradient
`90deg #fff→transparent`). Kode: `.role-divider` setelah `.role-link`; gradient
`#9b7bff→#fff` → `#fff→transparent`.

## ~~#8 — Panah scroll footer~~ **DONE lalu digantikan #10.** Awalnya dibuat

`position:fixed` melayang (IntersectionObserver). **User minta dipindah** (lihat
#10).

## ~~#10 — Panah scroll footer di atas divider/legal~~ **DONE** — tombol

`.scroll-up` dipindah **ke dalam `.bottom`** sebagai child pertama, `position:
absolute; right:0; bottom: calc(100% + 8px)` (`.bottom { position:relative }`).
Klik → scroll ke atas (smooth via #6). IntersectionObserver + `position:fixed` +
`.is-visible` **dihapus**. Geometri footer tidak berubah (absolute).

## ~~#11 — HoF Featured: frame di belakang portrait~~ **DONE** —

`HallOfFramesFeatured.astro`: `.card-photo z-index:1`, `.card-frame z-index:0`,
`.card-fade z-index:2`, `.card-meta z-index:3`. Sebelumnya tanpa z-index →
frame (DOM setelah photo) melukis di depan → garis melintang di wajah.

## ~~#12 — OurTeam HoDS portrait tidak dipotong (ala HoF)~~ **DONE** —

`OurTeam.astro`: `.hods-panel :global(.team-card) { overflow:visible }` +
`.team-cards--hods { padding-top:48px; margin-top:-48px }` (memberi ruang bleed
di dalam padding-box karena `overflow-x:auto` meng-clip cross-axis).
**Leader cards tetap ter-clip** (bleed 132px akan menabrak judul). Portrait HoDS
bleed 42px, clearance 30px dari dots. **Deviasi sengaja dari Figma** (Figma
meng-clip kartu; user minta ala Hall of Frames). Geometri kartu tetap y=1082.
Section MAE ~2.64 (membaik dari 3.305).

## #9 — Lanjutkan standar full-screen (hero gambar + 100svh) halaman tersisa ★ NEXT

- **Work order:** `docs/page-fullscreen-migration-plan.md` — **Recruitment
  (`1436:3505`) → Partners (`1439:4787`) → Hall of Frames (`1439:4506`) →
  Contact (`1445:5065`)**. Homepage & About Us SELESAI.
- **Resep:** hero = gambar `assets/hero gambar/*` → `hero-bg.webp`+`-2x`
  `100svh`; section konten `min-height:100svh` + center; CTA/footer tetap.
  **DILARANG `zoom`/`transform:scale`.**
- **Per halaman:** inventaris `depth 1` → Master Work Plan per section →
  satu section per pass → update `verify.mjs` (geometry + pad reference
  `sharp.extend()` warna `#050507`) → 7 gate.
- **Jebakan:** reference di-pad (jangan stretch); seam gradient (Philosophy)
  dijaga; Contact hero 2 kolom (jangan paksa center horizontal).

---

## Urutan eksekusi

1. ~~#3~~ · 2. ~~#1~~ · 3. ~~#2~~ · 4. ~~#7~~ · 5. ~~#8~~ · 6. ~~#4~~ · 7. ~~#5~~ · 8. ~~#6~~ · 9. ~~#10 #11 #12~~ · 10. **#9** (per halaman, satu
   section per pass).

## Definisi selesai (tiap item)

- Kode + assertion `verify.mjs`/audit bila relevan.
- **7 gate + seo PASS.**
- Docs terupdate: `docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`,
  `docs/figma-prototype-flow.md` (#1), `docs/page-fullscreen-migration-plan.md`
  (#9), `docs/pixel-precision-sop.md` (§ animasi #5/#6, elemen mengapung #10).
- Commit per item; **konfirmasi user sebelum `git push origin main`**.
