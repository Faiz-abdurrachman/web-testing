# Fix list 9 — Master Work Order (untuk AI berikutnya)

Sumber: instruksi user 5 Oct 2026 (9 item). Semua item **satu per pass + 7 gate**
(`build · verify.mjs · navbar-audit · verify-vt · responsive-audit · audit:spacing
· format:check` + `seo:audit`). Baca `docs/pixel-precision-sop.md` +
`docs/page-fullscreen-migration-plan.md` sebelum menyentuh UI. Update docs di
commit yang sama. Commit per item. **Konfirmasi user sebelum push.**

Status: **#1 #2 #3 #4 #7 #8 SELESAI (5 Oct 2026).** Sisa: **#5 → #6 → #9.**

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

## #5 — Animasi section Our Team + transisi tombol/pindah halaman smooth

- **File:** `src/components/OurTeam.astro` (JS carousel), `src/scripts/motion.ts`,
  `src/components/Motion.astro`.
- **Target:**
  1. Entrance scroll-reveal: header, dua group title, kartu leader, carousel
     (chips + kartu stagger) — pakai pola `reveal()` yang sudah ada di
     `motion.ts`; scope ke `.our-team`; `astro:page-load` re-init (jangan
     re-run di swap).
  2. Transisi carousel halus (chip/panel cross-fade + chip translate) —
     **sudah ada** (gated `no-preference`); perhalus timing + `will-change`
     seperlunya.
  3. Semua animasi **inert** pada `prefers-reduced-motion: reduce` (render =
     reference). `verify.mjs` jalan di reduce → tak boleh berubah.
- **Verifikasi:** `npm run perf:audit` (scroll-jank); `verify-vt` (re-init saat
  navigasi klien); screenshot reduce MAE 0 vs sebelumnya.

## #6 — Scroll & pindah halaman/CTA smooth

- **Kondisi:** `<ClientRouter />` (View Transitions) sudah aktif; same-page hash
  (mis. recruitment hero "Apply Now" → `#available-roles`) **melompat**.
- **Target:**
  1. **Same-page:** `html { scroll-behavior: smooth }` di-gate
     `prefers-reduced-motion: no-preference` (reduce = instan). Pastikan
     `scroll-margin-top` section sudah ada (110px — sudah). Uji klik tombol
     `#available-roles` di `/recruitment` hero.
  2. **Cross-page:** pastikan `ClientRouter` transition default halus; tombol
     dengan `href` cross-page (mis. CTA homepage → `/recruitment`) memakai
     navigasi klien (Astro `<a>` + View Transitions) — jangan `preventDefault`
     tanpa alasan. Tambah `@view-transition { navigation: auto }` bila perlu;
     hormati reduce.
  3. Tombol `data-sfx` + transition tetap; jangan blokir navigasi.
- **Jebakan:** deep-link/reload harus tetap mendarat di section (lihat gotcha
  AGENTS: `BaseLayout` re-apply hash setelah `ds:splash-done`/`load`). Jangan
  regresi.
- **Verifikasi:** `verify-vt` (klik tombol klien, hash landing); tambah cek
  smooth-scroll (posisi setelah klik mengarah ke section, bukan instan jump
  dihitung dari `getComputedStyle(html).scrollBehavior`).

## ~~#7 — Available Roles divider~~ **DONE** — divider pindah ke bawah

"View Details" (Figma `1218:1347` active variant: bottom stroke 0.5px gradient
`90deg #fff→transparent`). Kode: `.role-divider` setelah `.role-link`; gradient
`#9b7bff→#fff` → `#fff→transparent`.

## ~~#8 — Panah scroll footer~~ **DONE** — tombol scroll-up jadi

`position:fixed` (right:40px, bottom:40px, z-index:49), muncul (fade) hanya saat
footer terlihat via IntersectionObserver. Inert di reduce (transition: none).

## #9 — Lanjutkan standar full-screen (hero gambar + 100svh) halaman tersisa

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

## Urutan eksekusi yang disarankan

1. ~~#3~~ · 2. ~~#1~~ · 3. ~~#2~~ · 4. ~~#7~~ · 5. ~~#8~~ · 6. ~~#4~~ · 7. **#5** · 8. **#6** · 9. **#9** (per halaman, satu section per pass).

## Definisi selesai (tiap item)

- Kode + assertion `verify.mjs`/audit bila relevan.
- **7 gate + seo PASS.**
- Docs terupdate: `docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`,
  `docs/figma-prototype-flow.md` (#1), `docs/page-fullscreen-migration-plan.md`
  (#9), `docs/pixel-precision-sop.md` (§ animasi #5/#6 bila ada aturan baru).
- Commit per item; **konfirmasi user sebelum `git push origin main`**.
