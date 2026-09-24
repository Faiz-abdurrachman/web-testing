# Handover — Data Sorcerers (community-web)

Dokumen ini rangkuman lengkap project buat serah-terima ke tim: stack, struktur,
konvensi, status tiap section, cara verifikasi, checkpoint commit, jebakan, dan
yang masih pending.

- **Repo**: https://github.com/Web-Data-Sorcerers/community-web
- **Figma**: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS
  (file `Web Community DS`)
- **Deploy**: Vercel (auto dari branch `main`)
- **Buat AI agent**: baca juga `AGENTS.md` (operating manual ringkas buat AI).
- **Prompt buat AI baru**: `docs/kickoff-prompt.md` (copy-paste starter).
- **Prompt bikin halaman baru presisi**: `docs/page-build-prompt.md`.

---

## 1. Ringkasan

Website community "Data Sorcerers" — static site, homepage landing + 6 halaman
detail domain (HoDS). Fokus utama: **pixel-accurate** ke desain Figma/PNG,
dibangun dengan HTML/CSS asli (bukan tempelan screenshot), plus beberapa
interaksi (navbar blur, carousel panah, carousel project 3D).

---

## 2. Quick start

```sh
npm ci          # install (Node 22.x)
npm run dev     # dev server → http://localhost:4321
npm run build   # astro check + build static ke dist/
npm run preview # serve hasil build
```

Verifikasi visual (butuh dev server jalan):

```sh
node scripts/verify.mjs          # → tulis artifacts/, exit 0 kalau lolos
node scripts/responsive-audit.mjs # audit responsif 14 halaman × 26 lebar
npm run assets:og                # regen og image + favicon + manifest
npm run seo:audit                # validasi meta/OG/canonical/sitemap (setelah build)
npm run format:check             # cek Prettier
```

---

## 3. Tech stack

| Bagian     | Pilihan                                               | Alasan                                           |
| ---------- | ----------------------------------------------------- | ------------------------------------------------ |
| Framework  | **Astro 7.3.3** (`output: static`)                    | Ringan, 0 JS by default, scoped CSS, cepat       |
| Bahasa     | **TypeScript strict** (`astro/tsconfigs/strict`)      | Aman + `astro check` di build                    |
| Styling    | **Scoped CSS** per komponen + `src/styles/global.css` | Tanpa framework CSS, kontrol penuh, bundle kecil |
| Format     | **Prettier** + `prettier-plugin-astro`                | Konsisten                                        |
| Gambar     | **sharp** (dev)                                       | Optimasi WebP/lossless                           |
| Verifikasi | **Playwright + sharp** (`scripts/verify.mjs`)         | Screenshot + diff vs PNG referensi               |
| Runtime    | **Node 22.x** (`engines.node`)                        | Dipakai Vercel juga                              |
| Deploy     | **Vercel** (`vercel.json`)                            | Static, zero-config Astro                        |

> Prinsip "ringan & cepat" jadi acuan. Dependency runtime: `astro` + `gsap`
> (disetujui) + `three`. Motion GSAP + Three.js sudah **aktif** — lihat §10.

---

## 4. Struktur repo

```
src/
  components/    Shared: Navbar (prop `active`), Footer, Button
                 (primary/glass/white/secondary/apply), DomainCard, DomainRail.
                 Home: Hero, Philosophy, WhatWeDo, Domains, Projects, Recruitment.
                 Recruitment: RecruitmentHero, WhoShouldJoin, WhatYouWillDo,
                 AvailableRoles, SelectionTimeline, Faq, Snippets, Cta, RoleDetail.
  data/          domains.ts  (6 kartu HoDS, dipakai home + recruitment)
                 hods.ts     (6 kategori detail home, 22 tab)
                 roles.ts    (6 detail-role recruitment: chips/about/requirements)
                 projects.ts (4 project, masih placeholder)
  layouts/       BaseLayout.astro (head, font preload, slot)
  pages/         index.astro                     (homepage)
                 hods/[id].astro                 (6 detail HoDS, getStaticPaths)
                 recruitment.astro               (halaman Recruitment lengkap)
                 recruitment/roles/[id].astro    (6 detail role, getStaticPaths)
  styles/        global.css (font-face, tokens, reset)
scripts/         verify.mjs  (verifikasi visual)
public/          fonts/ + images/ (aset yang diserve)
assets/          aset referensi mentah (PNG dari Figma) — TIDAK di-serve
  <nama page>/   dikelompokkan per halaman, mis. "assets home page/",
                 "assets recruitment page/", plus "button/".
docs/            assets.md (provenance tiap section) + kickoff/page-build prompt
artifacts/       output verifikasi (screenshot/diff/overlay) — git-ignored
vercel.json      konfigurasi deploy
.vercelignore    exclude assets besar dari upload
```

---

## 5. Prinsip kerja (WAJIB dibaca)

1. **PNG referensi = otoritas akhir.** CSS export dari Figma cuma _referensi_.
   Kalau beda, ikut PNG. (Contoh: gradient glass hero di CSS Figma ≠ render PNG;
   kita ikut PNG.)
2. **Semua UI = HTML/CSS asli.** Gambar cuma untuk artwork/foto. Teks, tombol,
   border, kartu, gradient text → dibangun di CSS. **Jangan** flatten screenshot
   jadi UI.
3. **Ukur, jangan nebak.** Kalau "kelihatannya beda", ukur bbox/pixel dari PNG
   (pakai sharp) lalu sesuaikan. Repo ini penuh angka hasil pengukuran.
4. **Jangan hardcode angka kalau bisa diukur.** Semua ukuran (font, gap, radius,
   posisi) diambil dari Figma + diverifikasi vs PNG.
5. **Aksesibilitas & reduced-motion** dijaga (skip-link, aria, `prefers-reduced-motion`).
6. **Commit per fitur, pesan jelas**, push ke `main` (Vercel auto-deploy).

---

## 6. Design tokens (`src/styles/global.css`)

- `--color-background: #050507`, `--color-text: #fff`, `--color-accent: #9b7bff`
- `--font-body: 'Manrope'`, `--font-heading: 'Nasalization'`
- `--page-gutter: clamp(24px, 5.5556vw, 112px)` (di 1440 = 80px)
- Ukuran frame Figma 1440 lebar.

**Font:**

- **Manrope** 400/500/600/700 — di-bundle lokal sebagai **WOFF2**
  (`public/fonts/*.woff2`, lisensi OFL) dengan TTF sebagai fallback.
- **Nasalization** — **TIDAK di-bundle** (lisensi desktop melarang embed web).
  Di mesin dev dipakai font lokal, jadi di device lain heading fallback ke
  sans-serif. Cara dapat webfont berlisensi: lihat §11.

**Button (`Button.astro`)** — varian `primary`/`glass`/`white`/`secondary`/
`apply` (Figma `97:442` & `97:483`). Hover = swap warna dari varian state-2:
pill gelap → violet, pill violet → gelap, pill putih → violet. Fill swap
instan (gradient nggak bisa di-transition), rim/teks yang nge-fade;
`prefers-reduced-motion` mematikan transisi. Default nggak berubah.

---

## 7. Section homepage

Frame 1440, gutter 80. Skor = mean absolute channel difference vs PNG referensi
(bukan 0 karena rasterisasi font + resampling gambar).

| Section                 | Ukuran   | Figma node  | Referensi (PNG)                                                    | Diff  |
| ----------------------- | -------- | ----------- | ------------------------------------------------------------------ | ----- |
| Hero (incl. navbar)     | 1440×903 | `755:15215` | `assets/assets home page/hero section/Hero Section.png`            | 1.95  |
| Our Philosophy          | 1440×837 | `755:15281` | `assets/assets home page/ourphilosophy/Philosophy Section(1).png`  | 1.67  |
| What We Do              | 1440×844 | `763:16215` | `assets/assets home page/what we do/What We Do Section.png`        | 1.96  |
| House of Data Sorcerers | 1440×826 | `765:16731` | `assets/assets home page/hods/House of Data Sorcerers Section.png` | 2.60  |
| Our Project             | 1440×917 | `765:16732` | `assets/assets home page/our project/Our Project Section.png`      | 5.10* |
| Recruitment CTA         | 1440×577 | `765:16766` | `assets/assets home page/cta/CTA Recruicment Section.png`          | 2.17  |
| Footer                  | 1440×556 | `765:17071` | `assets/assets home page/footer/Footer.png`                        | 2.67  |

\* Naik karena carousel project 3D (kartu tetangga menggantikan panel samping
dekoratif — lihat §9).

**Navbar** (`530:13894` / `755:15219`): fixed, inner `max-width:1440px` di-center,
`padding 24px 80px`, tinggi 106.8. Di atas halaman transparan (`blur(8px)
saturate(140%)`). Setelah scroll tetap **blur-only**: `blur(28px) saturate(180%)
brightness(1.07)` dengan mask fade
ke bawah, **tanpa** background panel dan **tanpa** garis tepi (dulu ada panel
`rgb(5 5 7 / 58%)` + hairline; dihapus agar tidak terlihat seperti kotak).
Hover link nav = pill membulat (`border-radius:999px`, bg putih 10%) dengan
transisi. Menu mobile (≤1050) = **full-screen** dengan animasi buka/tutup
(lihat §8b). Build memakai `vite.build.cssMinify: 'esbuild'` supaya
`backdrop-filter` **unprefixed + `-webkit-`** dua-duanya ikut ke CSS produksi
(lihat §16.17).

---

## 8. Halaman detail HoDS

- Route: `/hods/data`, `/hods/core`, `/hods/language`, `/hods/vision`,
  `/hods/product`, `/hods/growth` (`src/pages/hods/[id].astro`, `getStaticPaths`).
- Klik kartu di section HoDS → masuk detail. Tombol "Back to HoDS" → `/#domains`.
- Konten: `src/data/hods.ts` — 6 kategori, 22 tab, tiap tab punya
  **LEARNING / section tengah (Expected Skills·TOOLS·FOCUS·ALGORITHMS·…)/ OUTPUT**.
- Layout: kartu role `1280×279` (art + border gradient + judul Nasalization 48 +
  deskripsi), lalu tab pill, lalu konten. Frame gradient
  `linear-gradient(-9deg, rgb(108 59 255 / 50%) 0%, #050507 19%)`.
- Art kartu per kategori: `public/images/hods/card-*.webp` (lossless), sumber
  komponen Figma `card detile role (HoDS)` (`719:1094`).
- Tinggi tiap halaman **persis sama** dengan PNG referensi: data 1133, core 1013,
  language 887, vision 1013, product 1067, growth 1013.
- Figma node detail: DI `864:18857`/`774:17392`; set konten: `800:2945` (data),
  `800:3278` (core), `803:3470` (language), `803:3670` (vision), `806:3872`
  (product), `807:4044` (growth).

> Catatan: frame `Detile Roles - ...` di Figma itu halaman **lain** (About this
> role / Requirement / Contact person). Yang dipakai = layout tab sesuai aset
> `assets/hods/detail card hods/`.
>
> Gradient ungu di detail HoDS & detail Role itu **full-bleed**: `<main>` selebar
> 100%, konten di inner `max-width: 1440px` yang di-center. Jangan dipasang di
> container max-1440, nanti kepotong di layar > 1440 / zoom out.

---

## 8b. Halaman Recruitment (LENGKAP)

Route `/recruitment`. **LENGKAP**: hero → Who Should Join → What You Will Do →
Available Roles → Selection Timeline → FAQ → Snippets → CTA → Footer, plus 6
halaman detail role. Bagian di bawah ini merinci tiap section.

- Aset referensi: `assets/assets recruitment page/`.
- Hero: Figma node `770:15523` (dinamai "About Us Hero Section" di file, tapi
  isinya hero Recruitment). Frame 1440 × 866, gap 63, konten di-center.
  Heading Nasalization 80/98 (2 baris, gradient putih→#707070→putih), deskripsi
  Manrope Medium 18/27 `#EDE8FF`, tombol "Apply Now" (`Secondary Buttom`
  `97:442`) 122 × 51.
- Background: `Gambar Hero About Us.png` full-width top-aligned → WebP di
  `public/images/recruitment/`. (`Background.png` di folder itu nyaris hitam,
  tidak dipakai.)
- Navbar pakai `Navbar.astro` dengan prop `active="Recruitment"`; underline
  106px gradient. Home tetap 49px supaya diff homepage tidak berubah.
- Tombol pakai `Button.astro` `variant="secondary"` (hug label).
- "Who Should Join" (Figma `770:15545`, 1440 × 789): heading Nasalization 56/68
  - copy Manrope 18/27, lalu **rail kartu HoDS yang sama** dengan homepage
    (394 × 436, gap 40, full-bleed). Rail diekstrak ke komponen bersama
    `DomainRail.astro` (dipakai `Domains.astro` & `WhoShouldJoin.astro`) biar
    kartu identik. Keyboard ←/→ aktif otomatis saat section di tengah viewport
    (lihat §9). Background section `#000` (sesuai PNG referensi & full-page,
    beda dari homepage yang `#050507`). Skor diff ~3.0/255.
- **Routing kartu "Who Should Join"**: kartu nembak ke **detail HoDS** yang
  sama dengan home (`/hods/{id}?from=recruitment`), BUKAN ke halaman role
  detail. Tombol back di detail HoDS kontekstual: default "Back to HoDS" →
  `/#domains`; kalau `?from=recruitment` → "Back to Open Roles" →
  `/recruitment#who-should-join`. Karena halaman statis, `from` diterapkan
  client-side di `HoDSDetail.astro`.
- **Halaman role detail** (`/recruitment/roles/{id}`, data/core/language/
  vision/product/growth): di-link dari section "Available Roles". Frame Figma
  1440 × 1280, isi: Back to Open Roles → kartu
  1280 × 279 (art + judul + chips + deadline + Apply Now) → ABOUT THIS ROLE →
  REQUIREMENT → CONTACT PERSON. Konten di `src/data/roles.ts`. Art dari
  `Property 1=N.png` (beda dengan `images/hods/card-*.webp` home) →
  `public/images/roles/role-*.webp`. Tombol Apply Now = `Button variant="apply"`.
  Layout: data centered (gap back→kartu 28), core gap 28 top-aligned, sisanya
  gap 58 top-aligned (flag `centered` / `tight`). Standalone tanpa navbar/footer.
- "What You Will Do" (Figma `770:16251`, 1440 × 903, di y1655): heading
  Nasalization 56/68 + copy Manrope 18/27, lalu collage 1312 × 625 berisi 2
  kartu tarot (artwork), connector SVG dekoratif, dan 8 label HTML/CSS di
  staircase diagonal (462 × 31). Background hitam. Di <1320px label distack,
  kartu/connector disembunyikan (adaptasi). Skor diff ~1.24/255.
- "Available Roles": **grid kartu 3/2/1** (bukan 6 baris `1280 × 77` lama).
  Kartu proporsional penuh `aspect-ratio: 1350 / 795` + `container-type:
inline-size` (semua metrik `cqw`), border emas inset (CSS `::after` +
  `mask-composite`), sparkle SVG 4 sudut, judul **Title Case** dari `domains.ts`,
  latar/teks bertint violet. Tiap kartu link ke `/recruitment/roles/{id}`.
  Referensi desain baru: `assets/card baru/*.png`. Lihat `docs/assets.md` →
  "Available Roles — card redesign"; geometri section (`840.65625`) di-assert di
  `verify.mjs`. (Layout 6-baris yang lama di Figma `661:1510` sudah obsolete.)
- "Selection Timeline" (Figma `661:1515`, 1440 × 815, di y3468): heading
  Nasalization 56/68 kiri, lalu tabel 1280 (header "Phase | Date" ungu + body
  6 baris phase) dengan border gradient & separator 1px. Kolom tanggal masih
  placeholder "Date" (sesuai PNG/Figma). Skor diff ~3.2/255.
- "FAQ" (Figma `661:1553`, 1440 × 986, di y4283): heading Nasalization 56/68
  uppercase + 6 item accordion `<details>` (tertutup by default = sesuai PNG),
  fill transparan + border gradient, pertanyaan Manrope 26/39 + arrow. Jawaban
  diambil dari varian A komponen FAQ. Background starfield (sama seperti WSJ).
  Skor diff ~5.0/255 (teks panjang).
- "Snippets" (Figma `706:2330`, 1440 × 900, di y5269): heading Nasalization
  56/68 center + galeri (`galeryy ds`) berupa **carousel fluid**: hero
  1280 × 556 (5 foto, panah kiri/kanan, drag/swipe, thumbnail bisa diklik,
  keyboard (aktif otomatis saat section di viewport), loop,
  `prefers-reduced-motion`) + 5 thumbnail 246 × 103. Elemen &
  gap proporsional (container query unit) → nggak overflow. Foto di-export dari
  render komponen DS (hero per varian, thumb dari DS 1). Diff ~0.7/255.
  (Bonus fix: line Selection Timeline & kolom tanggal dijadikan % biar nggak
  overflow di 768–1024.)
- "CTA" (Figma `839:4659`/`839:4660`, section 1440 × 537 di y6169): panel
  1280 × 377 fill transparan + border gradient, heading Nasalization 56/68,
  copy Manrope 16/24, tombol "Join the Community" (205 × 51), + glow dekoratif
  (pakai perlakuan yang sama dengan CTA home: `glow.svg` di-rotate/oversize).
  **Catatan**: `Frame 2393.png` transparan → composite ke `#050507` dulu. Panel
  dikunci `max-width:1280` + center biar glow tetap presisi di layar lebar. Skor
  diff panel ~5.1/255.
- **Footer**: halaman recruitment pakai komponen `Footer.astro` yang **sama**
  dengan homepage (node `765:17071`, referensi sama). Render di y6706, diff
  ~2.67/255. Navbar & Footer = komponen bersama (konsisten antar halaman).
- Verify: blok `recruitmentPage`, `recruitmentWhoShouldJoin`, `recruitmentRoles`,
  `recruitmentWhatYouWillDo`, `recruitmentAvailableRoles`,
  `recruitmentSelectionTimeline`, `recruitmentFaq`, `recruitmentSnippets`,
  `recruitmentCta`, `recruitmentFooter` di `scripts/verify.mjs` (geometri exact +
  diff PNG + overflow 320–1920), plus cek href kartu & back link kontekstual.
- **Menu mobile** (komponen `Navbar.astro`, semua halaman): di ≤1050px menu jadi
  overlay **full-screen** (`position:fixed; inset:0`) dengan blur + darkening
  ringan, borderless, fade halus di tepi. Buka/tutup **dianimasikan di JS**: klik
  `summary` di-`preventDefault`, toggle properti `open`, tambah `is-closing` untuk
  fade keluar; fallback instan saat `prefers-reduced-motion`. Body dikunci
  (`body.menu-open`), hamburger berubah jadi X saat terbuka, Escape/klik-luar/resize
  menutup.
- Halaman recruitment sudah **LENGKAP** (§8b): hero → Who Should Join → What You
  Will Do → Available Roles → Selection Timeline → FAQ → Snippets → CTA → Footer.
  Full-page `RECRUITMENT PAGE.png` (1440 × 7262) cuma referensi; CTA-nya beda
  dari section PNG (pakai referensi section).

---

## 9. Carousel project 3D (Our Project)

- 3D coverflow: kartu aktif di grid Figma (`549×567` di `(445.5,270)`) tajam;
  kartu kiri/kanan di posisi panel samping (`x ≈ 78.5 / 998.5`), miring
  (`rotateY 24°`) + **blur**.
- **Loop** (kiri & kanan selalu ada dari project pertama).
- Navigasi: panah, dot, drag/swipe, keyboard (←/→). **Aturan keyboard (semua
  carousel/rail):** ←/→ aktif otomatis saat **section-nya ada di tengah viewport**
  (`rect.top ≤ innerHeight/2 ≤ rect.bottom`), tanpa perlu fokus. Cuma satu
  carousel yang pegang tombol (yang di tengah), jadi nggak bentrok. Handler saat
  fokus jalan duluan (`defaultPrevented`). Berlaku di Projects, Snippets, dan
  `DomainRail` (home Domains + recruitment WhoShouldJoin). `prefers-reduced-motion`
  → tanpa transisi.
- **Penempatan panah (semua carousel)**: **desktop → kiri/kanan**, **mobile →
  bawah** kartu. Projects & DomainRail ganti di `1050px`, Snippets di `760px`.
  Panah samping DomainRail menumpuk tepi kartu rail (rail full-bleed; gutter nggak
  cukup untuk panah 52px) — disengaja. Panah samping Projects **tidak** menyentuh
  kartu aktif. Drag: DomainRail native scroll (touch) + drag mouse; Projects &
  Snippets pakai pointer event. `responsive-audit.mjs` meng-assert panah Projects
  vs kartu aktif.
- Data: `src/data/projects.ts` — **4 placeholder** (gambar masih sama semua).
- ⚠️ Jebakan yang sudah kejadian:
  - `overflow:hidden` + `border-radius` + transform 3D → **sudut jadi kotak**.
    Fix: clipping dipindah ke wrapper dalam (`.project-inner` + `clip-path`).
  - Jangan taruh `clip-path` di elemen yang sama dengan `box-shadow` — glow-nya
    ke-potong jadi kotak. Glow aktif sekarang pakai radial gradient (`.project-card::before`).

---

## 10. Motion / interaksi (STATUS: AKTIF)

Dibuat pertama di `5feea0d`, sempat di-revert (`f925e1d`), lalu **dihidupkan
ulang** dengan pendekatan yang lebih aman:

- `src/components/Motion.astro` + `src/scripts/motion.ts` (GSAP + ScrollTrigger):
  pinned scroll sequence hero (desktop ≥768px: `.artwork-stack` zoom 1→1.35 +
  `y -110`, `.art-figure` `y +90`, `.hero-content` keluar `y -200`/fade,
  `.hero-flare` sweep, `end: +=110%`, `scrub: 1`), scroll reveal section, 3D tilt
  kartu HoDS/What We Do, magnetic button, cursor glow, parallax pointer.
- Karakter `.art-figure` hidup: entrance naik + idle loop (bob `yPercent`,
  weight-shift `rotation` pivot kaki, breathing `scale`) + reaksi pointer
  `rotationX/Y`; semua komposibel dengan `y` scroll.
- Layer partikel Three.js di `Hero.astro` (canvas 700 titik + glow sprite,
  `import('three')` dinamis supaya di luar bundle awal); `burst`-nya digerakkan
  timeline lewat `window.__heroParticles`; tidak dibuat saat reduced motion.
- Semua dibungkus `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`,
  jadi minta reduce = semua tween/ScrollTrigger di-revert + listener dibersihkan.
- Entrance CSS hero (blur/zoom, veil, sweep, heading) tetap; wrapper
  `.artwork-entrance` memisahkannya dari target GSAP supaya `fill: both` tidak
  menimpa transform inline GSAP.
- Verifikasi pakai `reducedMotion: 'reduce'` → diff tetap bersih
  (`verify.mjs`, `responsive-audit.mjs` ALL PASS, 0 browser error).
- Yang **tetap ada** (bukan bagian murni motion): navbar blur, panah carousel
  HoDS, carousel project 3D.

---

## 11. Font Nasalization (penting)

Gratis di dafont = **desktop-only**, dilarang di-embed/serve ke web. Untuk
konsisten di semua device, beli webfont dari reseller Typodermic:

- **Adobe Fonts** — https://fonts.adobe.com/fonts/nasalization (paling gampang,
  ikut langganan CC, tinggal `<link>` project)
- **MyFonts** — https://www.myfonts.com/collections/nasalization-font-typodermic/
- **Fontspring** — https://www.fontspring.com/fonts/typodermic/nasalization
- **Foundry** — https://typodermicfonts.com/nasalization/

Self-host: taruh `.woff2` di `public/fonts/`, update `@font-face` Nasalization di
`global.css` (pertahankan `local()` sebagai fallback). Detail di `docs/assets.md`.

---

## 12. Deploy

- **GitHub** → **Vercel** (import repo, branch `main`, auto-deploy).
- `vercel.json`: `framework: astro`, `installCommand: npm ci`,
  `buildCommand: npm run build`, `outputDirectory: dist`.
- `engines.node: "22.x"`.
- `.vercelignore`: `assets`, `artifacts`, `.astro`, `.opencode` — supaya folder
  referensi besar (`assets/` ratusan MB) **tidak** ke-upload ke Vercel.
- Gak ada env var yang dibutuhkan.

---

## 13. Verifikasi visual (`scripts/verify.mjs`)

- Butuh dev server jalan di `http://localhost:4321` (atau set `PREVIEW_URL`).
- Pakai Chromium di `/usr/bin/chromium` (override: `CHROMIUM_PATH`).
- Yang dicek: geometri desktop (memakai `assert.deepEqual`, angka exact), diff vs
  PNG referensi, screenshot + overlay + diff → `artifacts/`, teks kepotong,
  overflow horizontal 320–1920px, interaksi menu mobile, dan browser error.
- **Konvensi penting di dalam verifikasi:**
  - `reducedMotion: 'reduce'` — supaya animasi/transisi tidak mengacaukan ukuran.
  - **Elemen yang bukan bagian PNG referensi disembunyikan saat screenshot:**
    navbar (fixed), panah rail, panah/dots project, kartu project non-aktif, dan
    panah Snippets (`.snippet-arrow`). `setNavbarHidden()` menangani itu semua.
- Output: `artifacts/verification.json` + gambar `*-desktop.png`, `*-diff.png`,
  `*-overlay.png`.
- ⚠️ `verify.mjs` menunggu `waitUntil: 'networkidle'`; terhadap **dev server**
  (Vite HMR) ini bisa hang (kejadian di mesin ini). Jalankan terhadap build statis:
  `npm run build && npx astro preview --port 4331` lalu
  `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`. Kalau tetap berat,
  pakai `scripts/responsive-audit.mjs` (per-route, `domcontentloaded`, hemat memori).

**`scripts/responsive-audit.mjs`** — audit responsif semua halaman (pengganti
cepat untuk cek overflow):

- 14 route × 26 lebar (320, 360, 375, 390, 414, 480, 600, 760, 768, 820, 900,
  1024, 1050, 1051, 1100, 1200, 1280, 1300, 1366, 1440, 1600, 1680, 1920, 2560,
  3440, 3840).
- Cek: overflow horizontal, teks ke-clip/offscreen, panah vs konten (kartu aktif
  Projects, hero/thumb Snippets), dan mode navbar di breakpoint 1050. Menulis
  `artifacts/responsive-audit.json`; exit non-zero kalau ada isu.
- Status terakhir: **ALL PASS** (364 kombinasi).

Skor homepage (full run terakhir, overall **1.947**, 0 browser error):

```
philosophy 1.670  whatWeDo 1.958  domains 2.596
projects   5.104  recruitment 2.174  footer 2.666
```

Skor halaman recruitment (diukur terisolasi — lihat catatan memori):

```
hero 2.039  WSJ 3.005  WYD 1.236  Available Roles 2.788
Selection Timeline 3.178  FAQ 4.999
Snippets 0.694  CTA(panel) 5.135  footer 2.666
```

Sisa diff didominasi rasterisasi font + glow dekoratif (browser vs Figma).

⚠️ **Memori**: `verify.mjs` full (screenshot full-page + banyak navigasi) bisa
bikin Chromium di-OOM-kill di mesin RAM kecil (sisa ~1 GB) — gejalanya browser
"closed" di tengah run. Launch args sudah `--disable-dev-shm-usage --disable-gpu`.
Kalau tetap gagal, verifikasi **per-section** pakai skrip Playwright ringan
(goto `domcontentloaded`, eager-load gambar, screenshot elemen). Di mesin lega
full verify tetap target.
philosophy 1.670 whatWeDo 1.958 domains 2.596
projects 5.104 recruitment 2.174 footer 2.666

````

---

## 14. Commit history / checkpoint

- Histori homepage awal + carousel 3D + detail HoDS: lihat `git log`.
- `69acaac` = checkpoint sebelum eksperimen motion; `5feea0d` (GSAP + Three.js)
  → di-revert `f925e1d`.
- `5315b72`…`901d78f` = docs (AGENTS.md, HANDOVER.md, kickoff-prompt,
  page-build-prompt) + `4b91b51` assets dikelompokkan per halaman.
- `d61338e`…`ff7fe20` = **halaman Recruitment lengkap**: reference assets
  (chore) + tiap section: hero, Who Should Join, What You Will Do, Available
  Roles, Selection Timeline, FAQ, Snippets, CTA, Footer, plus detail role
  (`/recruitment/roles/{id}`) dan polish (gradient full-bleed, keyboard carousel,
  hover button). Pola: `feat:` section didahului `chore: … reference assets`.
- Checkpoint fitur recruitment = `ff7fe20` (recruitment lengkap + hover button);
  HEAD nambah commit docs setelahnya (`git log`).
- Setelah checkpoint recruitment: polish navbar/menu + carousel — state scroll
  navbar **blur-only** (tanpa panel/garis), menu mobile **full-screen** + animasi
  buka/tutup, hover pill membulat, panah carousel **desktop kiri-kanan / mobile
  bawah**, plus `scripts/responsive-audit.mjs`. Lihat `git log`.
- SEO/OG: origin `site` dari `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`); canonical + OG/Twitter + JSON-LD di
  `BaseLayout`; `robots.txt` (endpoint `src/pages/robots.txt.ts`); sitemap
  `@astrojs/sitemap`; share card `public/og/og-default.jpg` (dibuat via
  `npm run assets:og`); validasi `npm run seo:audit` **PASS**. **Ganti origin
  begitu domain final beda.**
- `7a6a984` = lab 3D hero (`/lab/hero-3d`, noindex, terpisah); `60cc01b`,
  `c53d84d`, `06586ac` = **mentor revision 23 Sep 2026** (rail bounded, background
  HD native, Available Roles preview grid, hero viewport-aware). `51d565a` =
  balance tinggi hero mobile.
- **Checkpoint terbaru (HEAD, lihat `git log`)**: **redesign kartu Available Roles**
  (proporsional `cqw` + border emas + sparkle SVG + judul Title Case + tint violet)
  dan **hero mobile fluid** (`≤600px` clamp + `min-height: 100svh`,
  konten terpusat; `≥601px` tidak berubah). Dokumen (AGENTS/HANDOVER/assets/
  kickoff) disinkronkan di commit yang sama.
- Pola commit: per fitur + aset referensi dipisah; push ke `main` (Vercel).
- **Catatan aset lokal (untracked, sengaja)**: `assets/card baru/` (6 PNG) ada di
  mesin dev tapi **tidak** di-commit (ukuran + bukan milik repo/mentor).
  `.vercelignore` tetap mengecualikan `assets/`.
- **Arsip aset berat (24 Sep 2026)**: aset tak terpakai (~532 MB) dipindah **keluar**
  repo ke `/home/faiz/ds/ds5opencode-assets-archive/` (tidak dihapus; lihat
  `MOVE-MANIFEST.md` di sana). Termasuk `assets/background/background/` yang dulu
  ada di sini. Beberapa path di antaranya tadinya **tracked** → 74 file kini
  berstatus `D` di `git status` sampai deletion-nya di-commit.

---

## 15. Yang belum / TODO

- [ ] **Nasalization webfont** (heading fallback di device lain) — §11.
- [ ] **Data project asli** — `src/data/projects.ts` masih 4 placeholder, gambar sama semua.
- [ ] **Tanggal recruitment** — kolom "Date" di Selection Timeline masih
      placeholder (sesuai PNG/Figma). Ganti kalau tanggal asli sudah ada.
- [ ] **Link yang belum tersedia** (sengaja `aria-disabled`, bukan link mati):
      nav link selain Home & Recruitment, sebagian tombol hero/CTA, social +
      Terms/Privacy/Cookies di footer.
- [x] ~~Halaman Recruitment~~ — **LENGKAP** (§8b).
- [x] ~~Redesign kartu Available Roles (proporsional + border emas + sparkle)~~ dan
      ~~hero mobile fluid (home & recruitment)~~ — selesai 23 Sep 2026 (§21).
- [ ] Halaman lain yang ada di Figma tapi belum dibuat: **About Us,
      Hall of Frames, Partners, Contact**.
- [ ] Audit tiap halaman detail HoDS / detail role kalau ada pembaruan Figma.
- [ ] Opsional: lanjutkan motion (lihat §10) & optimasi bundle.

---

## 16. Gotchas (jebakan yang sudah kejadian)

1. **Sudut kotak pada elemen 3D**: `overflow:hidden` + `border-radius` gagal
   nge-clip saat elemen kena transform 3D → pindahkan clip ke wrapper dalam.
2. **Glow ke-potong**: `clip-path`/`overflow` di elemen berglow memotong
   `box-shadow`. Pakai radial-gradient pseudo yang nggak di-clip.
3. **`scroll-snap` ng geser kartu pertama**: wajib set `scroll-padding-inline`
   sebesar padding rail, kalau nggak kartu pertama geser sebesar gutter.
4. **PNG vs CSS Figma**: PNG menang. (gradient glass hero, dsb.)
5. **Full PNG detail HoDS art-nya versi lama** — art yang benar dari komponen
   Figma `card detile role (HoDS)` / folder `gambar detail card/Property 1=..`.
6. **Aset gede**: `assets/` ratusan MB → jangan lupa `.vercelignore`.
7. **Verifikasi**: transition 3D bikin ukuran mid-animasi → set `reducedMotion`.
8. **`prefers-reduced-motion`** harus selalu jadi fallback.
9. **Lebar fixed-px bikin overflow** di layar sempit: di Selection Timeline,
   garis separator (`1248px`) & kolom tanggal (`568px`) bikin halaman overflow di
   768–1024. Fix: jadi proporsional (`calc(100% + 32px)` & `%`). Selalu tes
   overflow 320–1920.
10. **Referensi PNG bisa transparan**: `Frame 2393.png` (CTA) panel fill-nya
    `rgba(98,80,255,.1)` + area transparan → `removeAlpha()` salah; **composite ke
    `#050507`** dulu waktu diff.
11. **Fill image Figma nggak selalu match crop referensi** (Snippets hero,
    glow CTA). Ukur dulu; kalau nggak match, pakai **render komponen** (export
    region dari PNG komponen) atau perlakuan yang sama dengan section yang sudah
    lolos (glow CTA = glow home).
12. **Keyboard carousel** pakai aturan "section di tengah viewport"; jangan andelin
    IntersectionObserver + `defaultPrevented` saja (dua carousel bisa jalan
    bareng di zona overlap). Skip `input/textarea`.
13. **Menu mobile** = full-screen `<details>` dengan animasi JS. Jangan andalkan
    `allow-discrete`/`@starting-style` untuk animasi close (di Chromium mesin ini
    nggak jalan); close pakai `is-closing` + finalize lewat `transitionend`.
    Klik `summary` wajib `preventDefault`, kalau nggak toggle native langsung
    nutup tanpa animasi. Fallback `prefers-reduced-motion` harus instan (verify
    pakai reduced motion).
14. **Panah carousel jangan nutupin konten**: desktop samping, mobile bawah.
    DomainRail samping sengaja menumpuk tepi kartu rail (full-bleed, gutter nggak
    cukup); Projects harus bebas dari kartu aktif. Kalau padding section < tinggi
    panah, jangan taruh panah di padding (Snippets bawah cuma 40px → pakai gutter
    saat desktop, bawah saat mobile).
15. **Jaga geometri 1440**: perubahan responsif pakai `position:absolute` supaya
    tinggi section yang di-assert tidak berubah. Jalankan
    `node scripts/responsive-audit.mjs` setiap habis ubah layout.
16. **`<details>` nggak bisa dianimasikan native**: konten item tertutup di-hide
    UA, jadi transisi CSS nggak jalan. Faq.astro pakai progressive enhancement:
    `preventDefault()` di `summary`, animasi tinggi panel via JS (320ms) + guard
    `version` biar klik cepat nggak bikin state nyangkut, dan `[open]`/
    `height:auto` tetap dipasang supaya tetap jalan tanpa JS. Panah: chevron-down
    (`chevron-down.svg` = path `arrow-right` dirotasi 90°) → `rotate(180deg)` saat
    terbuka. Dua-duanya di-nonaktifkan di `prefers-reduced-motion`.
17. **Minifier build bisa buang properti CSS**: Lightning CSS (default) menghapus
    `backdrop-filter` **unprefixed**, cuma nyisa `-webkit-` → blur navbar hilang
    di Firefox saat deploy padahal di `npm run dev` kelihatan. Fix:
    `vite.build.cssMinify: 'esbuild'` di `astro.config.mjs` (dua prefix ikut).
    **Selalu verifikasi CSS modern di `dist/`/situs live**, jangan cuma dev.

---

## 17. Command cheat sheet

```sh
npm ci                       # install
npm run dev                  # dev server (4321)
npm run build                # check + build
npm run preview              # serve dist
node scripts/verify.mjs      # verifikasi visual (butuh dev server)
node scripts/responsive-audit.mjs # audit responsif 14 halaman × 26 lebar
npm run assets:og            # regen og image + favicon + manifest
npm run seo:audit            # validasi meta/OG/canonical/sitemap (setelah build)
npm run format               # rapiin
git log --oneline            # lihat checkpoint
````

---

## 18. Kontak & referensi

- Detail provenance tiap aset + node Figma: `docs/assets.md`
- Ringkasan publik: `README.md`
- Artefak verifikasi terakhir: `artifacts/verification.json`

---

## 19. SEO, Open Graph & sitemap

- **Origin kanonik**: `astro.config.mjs` → `site` dari `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`). Ini yang dipakai canonical, `og:url`,
  sitemap, dan JSON-LD. Ganti default (atau set `SITE_URL` di Vercel) begitu
  domain final diketahui.
- **`BaseLayout.astro`** meng-emit: `<title>`, meta description, `robots`,
  `canonical`, ikon (`favicon.ico`/png, apple-touch, manifest), Open Graph
  (`og:type/site_name/locale/title/description/url/image` + `image:width/height/alt`),
  Twitter `summary_large_image`, dan JSON-LD `Organization` + `WebSite`.
  Prop baru: `description`, `image`, `type` (`website`|`article`), `noindex`.
- **Per halaman**: home pakai default; `recruitment` deskripsi khusus; halaman
  detail HoDS & role pakai `type="article"` + deskripsi dari data (judul role diberi
  suffix "Open Role" biar tidak bentrok dengan judul HoDS).
- **Share card**: `public/og/og-default.jpg` (1200×630 JPEG), dibuat
  `scripts/generate-og.mjs` (`npm run assets:og`) dari `Gambar Hero Section.png`
  - logo + `SORCERY IN DATA MAGIC IN AI.png`, pakai overlay gradient biar teks di
    kiri kebaca. Favicon/manifest juga dibuat skrip yang sama; favicon
    **transparan** (tanpa background gelap).
- **robots + sitemap**: `src/pages/robots.txt.ts` (pakai `Astro.site`);
  `@astrojs/sitemap` menulis `sitemap-index.xml` + `sitemap-0.xml` (14 URL).
- **Audit**: `npm run seo:audit` membaca `dist/**/*.html` dan memvalidasi title
  unik, description, canonical absolut, OG/Twitter lengkap, `og:image` ada &
  1200×630, JSON-LD valid, `robots.txt`, dan 14 URL sitemap. **PASS.**
- Validasi share asli (Facebook Debugger / X Card Validator) butuh domain live.

## 20. Mentor feedback revision (23 September 2026)

See `docs/assets.md` → "Mentor feedback revision" for authoritative changes to
older geometry above. Heroes now adapt to viewport height; HoDS rails show a bounded
3/2/1 cards; Available Roles is a descriptive card grid; legal links align right;
navbar text is brighter. Drag no longer consumes ordinary HoDS clicks, and role
back links return to Available Roles. All role artwork exports are text-free.
The supplied `assets/background/hd` sources are served as lossy WebP **q88**
(MAE < 5 vs the source), with their actual native resolution documented rather
than described as 4K. Run `node scripts/generate-backgrounds.mjs` to reproduce
those assets and clean role images, and `npm run assets:optimize` to re-encode
the remaining heavy artwork. Run `PREVIEW_URL=http://localhost:4331 node scripts/verify-feedback.mjs`
for focused interaction and visual coverage, alongside the existing audits.

## 21. Redesign kartu Available Roles + hero mobile fluid (23 September 2026)

Dua perubahan terbaru (setelah `51d565a`). Detail aset di `docs/assets.md`.

**A. Available Roles — kartu proporsional (menggantikan preview grid `06586ac`)**

- Sumber desain baru: `assets/card baru/{data intelligence,core ai,language,
vision,product,growth}.png` (1448 × 1086; kartu alpha-bbox ≈ 1358 × 797,
  rasio ≈ 1,70). **Lokal & untracked** (tidak di-commit).
- Kartu: `aspect-ratio: 1350 / 795` + `container-type: inline-size`; semua metrik
  internal `cqw` → skala persis seperti PNG di lebar kolom apa pun.
- **Border emas inset** dibuat di CSS (`::after`, `inset: 1.19cqw`, stroke
  ~0.3cqw, gradient `#ffe6a3 → #a97a50`), **bukan** gambar. Sparkle 4 sudut =
  `public/images/recruitment/card-sparkle.svg` (dekoratif). Tidak ada PNG yang
  di-flatten.
- Konten: `01 / OPEN ROLE` → judul → ringkasan (kalimat pertama, clamp 3 baris) →
  3 chip (label dalam tanda kurung) → `View role`. Judul pakai **Title Case** dari
  `domains.ts` (`Core AI & Engineering`), bukan all-caps `roles.ts`.
- Tint violet (`#6c3bff` / `#9b7bff` / `#ede8ff`) agar selaras palet web.
- Grid tetap **3 / 2 / 1**; font judul Manrope 700, body Manrope.
- `verify.mjs`: assertion geometri baru (section `840.65625`, list
  `507.65625`, kartu `241.828125`) + containment 320–1920. Posisi section
  recruitment setelahnya (timeline/FAQ/snippets/CTA/footer) ikut digeser
  (delta `-100.328125` dari angka lama).

**B. Hero mobile fluid (home & recruitment)**

- Hanya blok `≤600px` yang diubah; `601–1100` dan `≥1101` **tidak disentuh**
  (tablet/desktop + diff PNG hero 1440 tetap).
- h1/body/gap/padding `clamp()` fluid; judul konsisten **2 baris** sampai 320px
  (home floor 28px, recruitment 23px); tombol home stack full-width `≤480px`.
- Tinggi: `min-height: 100svh` (fallback `100vh`) dengan konten dipusatkan
  vertikal → hero mengisi **penuh** layar mobile di semua ukuran. Cap h1 di 600px
  = nilai 601px (home 42px, recruitment 40px) supaya mulus di batas breakpoint.
- Risiko: **Nasalization belum di-bundle**, jadi di device tanpa font itu heading
  fallback ke sans-serif dan metrik/line-break bisa berbeda. "Pas di semua pixel"
  hanya terjamin di environment yang punya Nasalization sampai webfont berlisensi
  ditambahkan.

**Verifikasi akhir yang dijalankan & PASS**: `npm run format:check`, `npm run
build` (astro check 0 error), `verify.mjs` (exit 0, `browserErrors: []`),
`responsive-audit.mjs` (364/364), `verify-feedback.mjs`, `seo:audit`.
