# Page Full-Screen Migration Plan — Hero Gambar + Section 100svh

Status: **HOMEPAGE SELESAI** (commit `b228f3c`, 4 Oct 2026). **NEXT = About Us
(`1439:4184`) → Recruitment → Partners → Hall of Frames → Contact.**

Dokumen ini adalah **work order resmi** untuk migrasi semua halaman ke pola
full-screen (satu section = satu layar) + hero berbasis gambar. Ikuti
`docs/pixel-precision-sop.md` (hukum presisi) dan `AGENTS.md` (operasional).

---

## 0. Keputusan desain (disetujui user, 4 Oct 2026)

1. **Setiap HERO** memakai gambar dari `assets/hero gambar/` sebagai
   **background** (`object-fit: cover`, full-bleed), tinggi **`100svh`**.
   Gambar yang disediakan **tidak memuat teks** — heading/subtitle/tombol tetap
   **HTML asli** di atasnya. Video, partikel Three.js, dan plate lama dihapus.
2. **Setiap SECTION KONTEN** memakai `min-height: 100svh` + full width + konten
   **ter-center** → satu section mengisi satu layar.
3. **CTA & Footer TIDAK diubah** (CTA tetap tinggi Figma; footer tetap).
4. Posisi/skala konten di dalam section **tetap mengikuti geometri Figma 1440**
   (yang berubah hanya pembungkus section: jadi 100svh + center). Section yang
   kontennya memang lebih tinggi dari viewport (mis. Our Team 1536, HoF
   Spotlight 1241) tetap memakai tinggi kontennya.
5. Semua perubahan **satu section per pass**, tiap halaman wajib lulus **7 gate +
   seo** sebelum lanjut.

> Catatan: `min-height: 100svh` / `100vh` adalah **satuan viewport**, di luar
> scope audit 8-pt (seperti `calc()/cqw/%`). Tidak ada magic number baru.

---

## 1. Resep teknis persis seperti homepage (`b228f3c`)

### 1a. Hero (contoh: `Hero.astro`)

- Hapus `<video>`, `<canvas>` partikel, `.hero-veil`, `.hero-sweep`, dan pembungkus
  `.artwork-entrance/.artwork-stack`. Sisakan satu `.artwork > img`.
- `<img src="/images/hero/background.webp" srcset="... background-2x.webp 2880w"
sizes="100vw" width="1440" height="903" fetchpriority="high" decoding="async">`.
- Artwork: `position:absolute; inset:0; width/height:100%; object-fit:cover`.
- Section: `min-height:100vh; min-height:100svh; padding:80px var(--page-gutter);
display:flex; align-items:center; justify-content:center; overflow:clip`.
- `@media (min-width:1921px)` artwork di-cap `1920px` + `mask-image` (sama seperti
  sebelumnya) supaya tidak melar di layar sangat lebar.
- Konten (`.hero-content`) **tidak berubah** (font Bluu Next, gradient per baris,
  gap 8-pt).
- `motion.ts`: buang tween hero (`animatePlate`, pin timeline, particle burst,
  pointer parallax) untuk hero yang dimigrasi. Bersihkan import yang tak terpakai.
- Hapus script inline `mountHeroParticles` di `Hero.astro`.

### 1b. Section konten (contoh: `WhatWeDo.astro`)

- Tambah ke root section:
  ```css
  min-height: 100vh;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  ```
- Pembungkus konten (mis. `.pillars-layout`, `.projects-inner`) diberi `width:100%`
  (atau `flex:1`) agar tetap ter-center horizontal; `max-width` Figma tetap.
- Untuk section yang kontennya absolute (Philosophy home), bungkus dengan
  `.philosophy:not(.is-about) { min-height:100svh; display:flex; align-items:center }`
  dan `> .canvas { width:100% }`.
- **Jangan** mengubah padding/gap/margin internal (tetap 8-pt). Hanya penambahan
  min-height + centering.

### 1c. Verifikasi (`scripts/verify.mjs`)

- Tinggi & `top` section berubah → update `assert.deepEqual` geometry.
- `top` section berikutnya bergeser (akumulasi 100svh) → update semua downstream.
- Screenshot section kini setinggi `100svh`; **reference PNG Figma di-pad** agar
  konten tetap align (konten ter-center):
  ```js
  sharp(refPath)
    .resize(1440, FIGMA_H)
    .extend({
      top: OFFSET_TOP,
      bottom: OFFSET_BOTTOM,
      background: { r: 5, g: 5, b: 7 },
    })
    .removeAlpha()
    .raw();
  ```
  dengan `OFFSET = (sectionH - FIGMA_H) / 2` dibulatkan; sesuaikan `*Raw.width/height`
  buffer diff. Contoh angka homepage ada di commit `b228f3c`.
- Section yang kontennya lebih tinggi dari viewport (mis. Projects 910) tidak
  di-pad (tinggi tetap).

### 1d. `assets/hero gambar/` → webp

- Bake via sharp: background 1440-major (q85) + `-2x` (q82). Pola:
  `public/images/<page>/hero-bg.webp` + `-2x`.
- Sumber raw tetap di-commit di `assets/` (di-`.vercelignore`).

---

## 2. Peta hero → gambar

| Halaman     | File gambar (`assets/hero gambar/`) | Node hero   | Ukuran Figma |
| ----------- | ----------------------------------- | ----------- | ------------ |
| Home ✓      | `Gambar Hero Section homepage.png`  | `1430:2041` | 1440×903     |
| About       | `Hero Section - About Us.png`       | `1439:4185` | 1440×903     |
| Recruitment | `Gambar Hero recruitment.png`       | `1436:3506` | 1440×866     |
| Partners    | `Hero Section - Partners.png`       | `1439:4788` | 1440×659     |
| Hall of Fr. | `Hero Section - HoF.png`            | `1439:4507` | 1440×903     |
| Contact     | `contact page.png`                  | `1445:5066` | 1440×hug     |

---

## 3. Checklist per halaman (inventaris `depth 1`)

Legenda: **[HS]** = jadikan full-screen (100svh + center), **[HS-skip]** = CTA
(tinggi Figma), **[H]** = hero gambar + 100svh, **[skip]** = footer.

### Homepage `1430:2040` — ✅ SELESAI (`b228f3c`)

| #   | Node        | Section                 | Treatment    |
| --- | ----------- | ----------------------- | ------------ |
| 1   | `1430:2041` | Hero                    | [H] ✅       |
| 2   | `1430:2052` | Our Philosophy          | [HS] ✅      |
| 3   | `1430:2089` | What We Do              | [HS] ✅      |
| 4   | `1430:2138` | House of Data Sorcerers | [HS] ✅      |
| 5   | `1430:2146` | Our Project             | [HS] ✅      |
| 6   | `1430:2162` | CTA Recruitment         | [HS-skip] ✅ |
| 7   | `1430:2176` | Footer                  | [skip]       |

### About Us `1439:4184` — ⏭ NEXT

| #   | Node        | Section                       | Treatment                                         |
| --- | ----------- | ----------------------------- | ------------------------------------------------- |
| 1   | `1439:4185` | Hero Section - About Us (903) | [H]                                               |
| 2   | `1439:4190` | Visi Misi                     | [HS]                                              |
| 3   | `1439:4219` | Philosophy (`is-about`, 837)  | [HS] (buka scope `:not(.is-about)`)               |
| 4   | `1439:4258` | Our Ecosystem (874)           | [HS] (**jaga seam gradient** Δ≤10 dgn Philosophy) |
| 5   | `1688:2933` | Our Team (1536)               | [HS]                                              |
| 6   | `1439:4311` | Footer                        | [skip]                                            |

### Recruitment `1436:3505`

| #   | Node        | Section                | Treatment |
| --- | ----------- | ---------------------- | --------- |
| 1   | `1436:3506` | Hero (866)             | [H]       |
| 2   | `1436:3512` | Who Should Join        | [HS]      |
| 3   | `1436:3517` | What You Will Do (903) | [HS]      |
| 4   | `1436:3564` | Available Roles        | [HS]      |
| 5   | `1436:3637` | Selection Timeline     | [HS]      |
| 6   | `1436:3675` | FAQ (983)              | [HS]      |
| 7   | `1436:3684` | Snippets (897)         | [HS]      |
| 8   | `1436:3687` | CTA Recruitment        | [HS-skip] |
| 9   | `1436:3699` | Footer                 | [skip]    |

### Partners `1439:4787`

| #   | Node        | Section             | Treatment |
| --- | ----------- | ------------------- | --------- |
| 1   | `1439:4788` | Hero (659)          | [H]       |
| 2   | `1439:4793` | Our Partners (1071) | [HS]      |
| 3   | `1439:4937` | Why DS (656)        | [HS]      |
| 4   | `1439:4983` | Footer              | [skip]    |

### Hall of Frames `1439:4506`

| #   | Node        | Section                              | Treatment |
| --- | ----------- | ------------------------------------ | --------- |
| 1   | `1439:4507` | Hero (903)                           | [H]       |
| 2   | `1439:4512` | Sorcerers Spotlight & Gallery (1241) | [HS]      |
| 3   | `1439:4655` | Project Highlights (1014)            | [HS]      |
| 4   | `1439:4699` | Milestone DS (987)                   | [HS]      |
| 5   | `1439:4724` | Footer                               | [skip]    |

### Contact `1445:5065`

| #   | Node        | Section             | Treatment                                                      |
| --- | ----------- | ------------------- | -------------------------------------------------------------- |
| 1   | `1445:5066` | Hero (2 kolom, hug) | [H] + 100svh (**pertahankan layout 2 kolom**, center vertikal) |
| 2   | `1445:5118` | Footer              | [skip]                                                         |

---

## 4. Alur kerja WAJIB per halaman (anti-skip)

1. **Inventaris** ulang `depth 1` dari node halaman Figma (jangan percaya daftar
   ini buta — verifikasi node & dimensi).
2. Tulis **Master Work Plan** untuk tiap section (node ID + URL, dimensi frame,
   breakdown 8-pt, typography, artwork, testing criteria).
3. Kerjakan **satu section per pass**. Untuk tiap section: ubah kode → ukur ulang
   `verify.mjs` → update assertion + pad reference → jalankan **7 gate**.
4. **7 gate** tiap section/halaman:
   1. `npm run build` (0 error, 19 halaman)
   2. `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`
   3. `... node scripts/navbar-audit.mjs`
   4. `... node scripts/verify-vt.mjs`
   5. `... node scripts/responsive-audit.mjs` (468/468)
   6. `npm run audit:spacing`
   7. `npm run format:check`
   - `npm run seo:audit`
5. Update `docs/assets.md`, `docs/ai-handoff.md`, `AGENTS.md`, dan file ini
   (tandai section selesai) di commit yang sama.
6. Commit per halaman. **Konfirmasi user sebelum push** (`git push origin main`
   = deploy testing + production).

---

## 5. Jebakan (jangan diulang)

- **Jangan pakai `zoom`/`transform: scale`** untuk full-screen — user menolaknya
  (render pecah/berantakan). Pakai `min-height: 100svh` + centering.
- **Reference PNG harus di-pad**, bukan di-stretch (stretch merusak MAE).
- **Philosophy About** (`is-about`) punya gradient yang menyatu ke Ecosystem —
  jaga seam (Δ≤10) walau dua-duanya 100svh.
- **Contact** hero bukan centered column (2 kolom) — jangan paksa center
  horizontal; cukup center vertikal.
- **Jangan hapus `HeroVideo.astro`/`hero-video.ts`** sampai semua halaman
  selesai migrasi (masih dipakai About/Partners/HoF sampai diganti).
- **`verify.mjs` mem-pad** reference dengan warna `#050507`; bila section bg
  berbeda (mis. starfield What We Do) padding-nya tetap warna dasar (tidak
  menimbulkan fail — tidak ada threshold MAE).
- Sesudah migrasi sebuah halaman, **cek `dist/` (production build)**, jangan cuma
  dev — Astro minifier bisa menjatuhkan properti.
