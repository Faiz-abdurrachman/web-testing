# Fix list 9 — Master Work Order (untuk AI berikutnya)

Sumber: instruksi user 5 Oct 2026 (9 item). Semua item **satu per pass + 7 gate**
(`build · verify.mjs · navbar-audit · verify-vt · responsive-audit · audit:spacing
· format:check` + `seo:audit`). Baca `docs/pixel-precision-sop.md` +
`docs/page-fullscreen-migration-plan.md` sebelum menyentuh UI. Update docs di
commit yang sama. Commit per item. **Konfirmasi user sebelum push.**

Status: **#3 SELESAI (5 Oct 2026).**

---

## ~~#1 — CTA homepage~~

## ~~#3 — Typo~~ **DONE** — `src/components/OurTeam.astro` "Hause" → "House" (x2).

Reference `assets/about-us/team/OurTeam-New-1x.png` regenerated dari node
`1688:2933`. Deviasi sengaja dari ejaan Figma dicatat di `docs/assets.md`.
7 gate + seo ALL PASS.

---

## ~~#1 — CTA homepage~~ **DONE (5 Oct 2026)** — `src/components/Recruitment.astro`

line 22 `href="/recruitment"` (sebelumnya `#available-roles`).
`Cta.astro` (halaman Recruitment) **tidak berubah** (tetap `/recruitment`).
`docs/figma-prototype-flow.md` diperbarui. 7 gate + seo ALL PASS.

---

## #2 — Navbar: link aktif WAJIB punya underline (bukan hanya hover)

## ~~#2 — Navbar: link aktif~~ **DONE (5 Oct 2026)** — semua rute utama

(`/`, `/about`, `/recruitment`, `/partners`, `/hall-of-frames`, `/contact`)
kirim prop `active` benar. Detail pages (`/hods/[id]`, `/recruitment/roles/[id]`)
sengaja tidak render Navbar (pakai back-nav sendiri). **Mobile menu** kini
menampilkan `.nav-underline` (sebelumnya `display:none`) — gradient
`#9b7bff→#ede8ff` 1px full-width. 7 gate + seo ALL PASS.

## #3 — Typo "HAUSE" → "HOUSE"

- **✅ SELESAI (5 Oct 2026):** `src/components/OurTeam.astro` "Hause" → "House" (comment
  line 31 + title line 33). Reference `assets/about-us/team/OurTeam-New-1x.png`
  diregenerasi dari node `1688:2933`. Deviasi sengaja dicatat di `docs/assets.md`.
  7 gate + seo ALL PASS.
  of Data Sorcerers</h3>`.
- **Target:** `House of Data Sorcerers`.
- **Konsekuensi:** reference `assets/about-us/team/OurTeam-New-1x.png`
  (yang menampilkan "Hause") jadi **stale** → **regenerate reference** dari node
  `1688:2933` (`figma_download_figma_images`) ATAU re-export; update
  `verify.mjs` reference path bila nama berubah. MAE region hodsTitle akan naik
  sampai reference baru dipakai. **Keputusan user: dibetulkan.**
- **Docs:** catat deviasi sengaja dari Figma (Figma typo) di `docs/assets.md`.

## #4 — Efek glow tiap kartu harus sesuai Figma (`1594:5145`)

- **File:** `src/components/TeamCard.astro` + `src/data/team.ts`
  (`hodsTeams[].fade`) + panel Growth join card di `OurTeam.astro`.
- **Sekarang:** kartu hanya punya **linear fade** bawah (tint domain,
  di-fit dari PNG). Render kita (Image 4/5) vs Figma (Image 6): glow Figma
  tampak **radial/bloom ungu** di bawah kartu, bukan sekadar linear.
- **Target/aksi:**
  1. **Cek REST `effects`** node kartu `1594:5145` (variant `1594:5144` card
     `1594:4370`) — MCP `figma_get_figma_data` menyembunyikan GLASS/glow.
     `GET /v1/files/JYUzJK1hFqaEwL6DpdDvjp/nodes?ids=1594:4370` header
     `X-Figma-Token`. Cari `effects` (DROP_SHADOW/GLASS) + fill radial.
  2. Export PNG kartu 1× dari node, **fit glow** dari piksel (`sharp`) seperti
     pola role-card `AvailableRoles` (glow = layer sendiri, radial violet,
     `transform-origin: 50% 100%`, di-gate reduce).
  3. Warna glow = tint domain (Data merah dst). Jangan menyamakan Figma yang
     tampak ungu di Image 6 — **verifikasi per-varian** (Data = merah).
  4. Glow di **layer terpisah** yang tidak ter-clip (ingat jebakan SOP: glow di
     dalam `overflow:hidden`/`border-radius` akan kotak).
- **Verifikasi:** MAE region kartu turun; assert geometri glow (pseudo box) di
  `verify.mjs` bila perlu; render reduce tetap pixel-exact.

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

## ~~#7 — Available Roles:~~ **DONE (5 Oct 2026)** — divider pindah ke bawah

"View Details" (Figma `1218:1347` active variant: bottom stroke 0.5px gradient
`90deg #fff→transparent`). Kode: `.role-divider` jadi setelah `.role-link`;
gradient `#9b7bff→#fff` → `#fff→transparent`. 7 gate + seo ALL PASS.

---

## #8 — Panah scroll footer → tombol melayang saat sampai footer

## ~~#8 — Panah scroll footer~~  **DONE (5 Oct 2026)** — tombol scroll-up jadi
   `position:fixed` (right:40px, bottom:40px, z-index:49), muncul (fade) hanya saat
   footer terlihat via IntersectionObserver. Inert di reduce (transition: none).
   Jangan tabrakan sound orb (tidak ada visual component). 7 gate + seo ALL PASS.

---

## #4 — Efek glow tiap kartu harus sesuai Figma (`1594:5145`)

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

1. **#3** (trivial) · 2. **#1** (trivial) · 3. **#2** (audit rute) ·
2. **#7** · 5. **#8** · 6. **#4** · 7. **#5** · 8. **#6** · 9. **#9** (per
   halaman, satu section per pass).

Item #1–#3 = perubahan kecil, risiko rendah. #4, #5, #7 butuh pengukuran Figma
(`1218:1347`, `1594:5145` REST effects). #6 menyentuh global (hati-hati reduce).
#9 = migrasi berulang mengikuti resep yang sudah terbukti (`b228f3c`).

## Definisi selesai (tiap item)

- Kode + assertion `verify.mjs`/audit bila relevan.
- **7 gate + seo PASS.**
- Docs terupdate: `docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`,
  `docs/figma-prototype-flow.md` (#1), `docs/page-fullscreen-migration-plan.md`
  (#9), `docs/pixel-precision-sop.md` (§ animasi #5/#6 bila ada aturan baru).
- Commit per item; **konfirmasi user sebelum `git push origin main`**.
