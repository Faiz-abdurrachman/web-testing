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

> Prinsip "ringan & cepat" jadi acuan. Dependency runtime sengaja cuma `astro`.
> (Percobaan GSAP + Three.js ada di commit `5feea0d`, tapi **di-revert** — lihat §10.)

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

- **Manrope** 400/500/600/700 — di-bundle lokal (`public/fonts/*.ttf`, lisensi OFL).
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
`padding 24px 80px`, tinggi 106.8. Di atas halaman transparan (`blur(5px)`),
setelah scroll jadi panel `blur(12px) saturate(140%)` + `rgb(5 5 7 / 58%)`.

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

## 8b. Halaman Recruitment (dibangun bertahap)

Route `/recruitment`, dibangun **per section**. Yang sudah ada: **hero**.

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
- "Available Roles" (Figma `661:1510`, 1440 × 910, di y2558): heading
  Nasalization 56/68 kiri + copy Manrope 18/27, lalu 6 baris role `1280 × 77`
  (gap 23, fill `rgba(255,255,255,.15)`, border gradient, dot + nama +
  arrow-right). Tiap baris link ke `/recruitment/roles/{id}` — ini yang akhirnya
  memakai halaman role detail. Skor diff ~2.8/255.
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
- Data: `src/data/projects.ts` — **4 placeholder** (gambar masih sama semua).
- ⚠️ Jebakan yang sudah kejadian:
  - `overflow:hidden` + `border-radius` + transform 3D → **sudut jadi kotak**.
    Fix: clipping dipindah ke wrapper dalam (`.project-inner` + `clip-path`).
  - Jangan taruh `clip-path` di elemen yang sama dengan `box-shadow` — glow-nya
    ke-potong jadi kotak. Glow aktif sekarang pakai radial gradient (`.project-card::before`).

---

## 10. Motion / interaksi (STATUS: di-revert)

Pernah dibuat lalu **di-revert** supaya kembali ke standar:

- Commit `5feea0d` "feat: add gsap scroll motion, 3d tilt, and a three.js hero
  layer" → di-revert oleh `f925e1d`. Tree sekarang identik dengan `69acaac`.
- Kalau mau lanjut/eksplor lagi: `git cherry-pick 5feea0d` atau lihat diff-nya
  (`git show 5feea0d`). Isinya: GSAP + ScrollTrigger (scroll reveal, hero
  parallax, 3D tilt, magnetic button, cursor glow) + Three.js partikel di hero.
- Yang **tetap ada** (bukan bagian revert): navbar blur, panah carousel HoDS +
  snap, carousel project 3D.
- Kalau nanti bikin ulang: pakai `gsap.matchMedia` + `prefers-reduced-motion`,
  dan verifikasi pakai `reducedMotion: 'reduce'` biar diff tetap bersih.

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
- **HEAD `ff7fe20`** = recruitment lengkap + hover button.
- Pola commit: per fitur + aset referensi dipisah; push ke `main` (Vercel).

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

---

## 17. Command cheat sheet

```sh
npm ci                       # install
npm run dev                  # dev server (4321)
npm run build                # check + build
npm run preview              # serve dist
node scripts/verify.mjs      # verifikasi visual (butuh dev server)
npm run format               # rapiin
git log --oneline            # lihat checkpoint
````

---

## 18. Kontak & referensi

- Detail provenance tiap aset + node Figma: `docs/assets.md`
- Ringkasan publik: `README.md`
- Artefak verifikasi terakhir: `artifacts/verification.json`
