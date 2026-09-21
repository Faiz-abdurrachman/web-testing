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
  components/    Navbar, Hero, Philosophy, WhatWeDo, Domains, DomainCard,
                 Projects, Recruitment, Footer, HoDSDetail, Button
  data/          domains.ts  (6 kartu HoDS)
                 hods.ts     (6 kategori detail, 22 tab)
                 projects.ts (4 project, masih placeholder)
  layouts/       BaseLayout.astro (head, font preload, slot)
  pages/         index.astro           (homepage)
                 hods/[id].astro       (6 halaman detail, getStaticPaths)
  styles/        global.css (font-face, tokens, reset)
scripts/         verify.mjs  (verifikasi visual)
public/          fonts/ + images/ (aset yang diserve)
assets/          aset referensi mentah (PNG dari Figma) — TIDAK di-serve
  <nama page>/   dikelompokkan per halaman, mis. "assets home page/"
docs/            assets.md (catatan provenance tiap section)
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
> `assets/assets home page/hods/detail card hods/`.

---

## 9. Carousel project 3D (Our Project)

- 3D coverflow: kartu aktif di grid Figma (`549×567` di `(445.5,270)`) tajam;
  kartu kiri/kanan di posisi panel samping (`x ≈ 78.5 / 998.5`), miring
  (`rotateY 24°`) + **blur**.
- **Loop** (kiri & kanan selalu ada dari project pertama).
- Navigasi: panah, dot, drag/swipe, keyboard (←/→). `prefers-reduced-motion` → tanpa transisi.
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
    navbar (fixed), panah rail, panah/dots project, dan kartu project non-aktif.
  - `setNavbarHidden()` menangani itu semua.
- Output: `artifacts/verification.json` + gambar `*-desktop.png`, `*-diff.png`,
  `*-overlay.png`.

Skor terakhir (overall **1.947**, 0 browser error):

```
philosophy 1.670  whatWeDo 1.958  domains 2.596
projects   5.104  recruitment 2.174  footer 2.666
```

---

## 14. Commit history / checkpoint

```
a0b58fd  set up Astro + hero
8afaa22  Our Philosophy
463a93b  What We Do
c2b30f4  House of Data Sorcerers
5fbacd1  Our Project
421bcb7  Recruitment CTA
7e41a6a  footer
325087c  center navbar canvas + scroll blur
3359963  anchor philosophy artwork to centered canvas
ed50fe0  compose homepage sections
a321e37  docs + visual verification
c611a71  configure Vercel deployment
85c0e46  sources for licensed Nasalization webfont
2979999  HoDS detail pages with role tabs
20ae5d5  per-category HoDS detail card art
bd90366  carousel arrows on HoDS rail
372da54  3D coverflow carousel (Our Project)
6328b4e  left/centre/right blurred slots
ce45779  loop carousel + fix rounded clipping under 3D
d79ce6a  round card corners without clipping glow
4b2ff6b  soft radial glow under active project card
8fb3d37  navbar scroll blur → 12px
69acaac  HoDS detail reference assets   ← CHECKPOINT (sebelum motion)
5feea0d  gsap + three motion (di-revert)
f925e1d  Revert motion               ← HEAD
```

---

## 15. Yang belum / TODO

- [ ] **Nasalization webfont** (heading fallback di device lain) — §11.
- [ ] **Data project asli** — `src/data/projects.ts` masih 4 placeholder, gambar sama semua.
- [ ] **Link yang belum tersedia** (sengaja `aria-disabled`, bukan link mati):
      nav link selain Home, tombol hero/CTA, social + Terms/Privacy/Cookies di footer.
- [ ] Halaman lain yang ada di Figma tapi belum dibuat: About Us, Recruitment page,
      Hall of Frames, Partners, Contact.
- [ ] Audit tiap halaman detail HoDS kalau ada pembaruan art/konten di Figma.
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
```

---

## 18. Kontak & referensi

- Detail provenance tiap aset + node Figma: `docs/assets.md`
- Ringkasan publik: `README.md`
- Artefak verifikasi terakhir: `artifacts/verification.json`
