# SOP — Presisi piksel (WAJIB untuk semua section/halaman)

Tujuan proyek ini: **pixel-accurate ke Figma/PNG**. Dokumen ini adalah protokol
keras yang harus diikuti tiap mengubah/membuat UI. Ringkasnya: **export node PNG
dari Figma → bundle font yang sama → pakai image-fill apa adanya → ukur dengan
`sharp` → diff → iterasi**. Jangan pernah "kira-kira".

Baca bersama `AGENTS.md` (aturan operasional), `docs/assets.md` (provenance),
dan `docs/ai-handoff.md` (state terkini).

## 1. Hierarki sumber kebenaran (dari paling tinggi)

1. **Render node PNG dari Figma** (`figma_download_figma_images`, 1× di lebar
   frame + 2× untuk ukur). Ini otoritas akhir.
2. **File font yang sama persis** dengan yang dipakai Figma (tanpa ini mustahil
   presisi — lihat §5).
3. **Image fill mentah Figma** (kalau node punya `imageRef`) — dipakai apa adanya
   untuk artwork, bukan direkonstruksi.
4. **Angka Figma API/MCP** (fontSize/lineHeight/gap/padding/posisi) = titik awal.
5. **CSS "Copy as code" Figma / string MCP** = **hint saja, sering lossy**.

Aturan: kalau (1) berbeda dengan (4)/(5), **ikut (1)**.

### Hukum Spacing & Padding (Strict 8-Point Grid)

- **Seluruh gap, padding, dan margin layout WAJIB mematuhi kelipatan 8px** (mis. 8px, 16px, 24px, 32px, 40px, 48px, 56px, 64px, 72px, 80px) sesuai spesifikasi frame Figma.
- Padding container utama desktop: `padding: 80px` atau `padding: 0 80px`.
- Jarak antar-elemen (gap hirarki):
  - Eyebrow ke heading: **8px** (atau 4px jika antar-baris heading).
  - Heading ke subtitle/deskripsi: **16px** atau **24px**.
  - Header frame ke content/grid/rail: **48px**, **56px**, **74px**, atau **80px**.
  - Komponen kecil (button padding): `8px 16px`, badge: `4px 12px` / `4px 16px`.
- **Dilarang memakai magic numbers acak** (misal 13px, 27px, 53px) kecuali merupakan koordinat offset absolut terukur atau kompensasi font descender/letter-spacing terkalibrasi.

**Pengecualian yang SAH (bukan magic number):** nilai autolayout Figma yang
terukur memang bukan kelipatan 8 — mis. gap gallery Snippets `35`, gap footer
section `60`, bottom padding footer `28`, header→rail `74`, section `100/116`,
gap baris heading `4`, padding kartu `18px 28px`, dan line-height
`67.2 / 95.2 / 38.4`. Nilai-nilai ini **dipertahankan** karena berasal dari frame
Figma/PNG, bukan dikarang. Aturannya: **setiap angka non-8 wajib punya
justifikasi terukur (node Figma / bbox PNG)** yang dicatat di `docs/assets.md`.
Kalau tidak bisa dijustifikasi, itu magic number → ganti ke kelipatan 8 terdekat.

## 2. Gotcha yang sudah terbukti (jangan diulang)

- **String `linear-gradient(...)` dari Figma MCP menormalkan handle → lossy**
  (stop terakhir dipaksa 100%, sudut bergeser). Contoh About: MCP `170deg` /
  `16deg`, render asli `163deg` / `24.75deg` (MAE MCP ≈ 17 vs fit ≈ 0.7).
  **Selalu fit dari piksel PNG node**, jangan paste string MCP mentah.
- **"Copy as code" Figma tidak memuat `effects`** (shadow/glow) pada teks dan
  memakai angka desimal aneh. Cek `effects` lewat data node; kalau tidak ada di
  data node, artinya **tidak ada shadow** (verifikasi dengan export node teks ke
  atas putih: shadow/glow akan tampak sebagai halo; teks bersih = tidak ada).
- **Gradient teks diterapkan per text-node** (per baris kalau tiap baris node
  terpisah), jadi tiap baris punya salinan gradient sendiri — bukan satu gradient
  membentang di dua baris. Implementasikan per `<span>` baris.
- **Jangan rekonstruksi art yang sudah ada image fill-nya.** Rekonstruksi
  (layering/cutout) pernah dipakai untuk hero dan hasilnya ~24 MAE vs render;
  memakai image fill mentah langsung turun ke ~2.7 MAE. Lihat §6.
- **Minifier build bisa membuang properti CSS** (mis. `backdrop-filter`
  unprefixed). Cek hasil di `dist/`/live, bukan cuma `dev`.
- **Satu fill bisa menumpuk gambar + warna.** Figma kadang punya
  `fills: [rgba(0,0,0,0.2), {type:IMAGE, imageRef}]` — bukan cuma gambar. Kalau
  tint itu tidak dipasang, render jadi jauh lebih terang (studi kasus card HoF
  Project: stage MAE 28 → 3 setelah tint 20% ditambah).
- **`border` nyata mengecilkan content box.** Kalau artwork/screenshot harus
  mengisi penuh frame, jangan pakai `border` — pakai **ring overlay** (pseudo
  `::after` + `mask`/`mask-composite: exclude`) supaya isi tetap selebar frame
  (studi kasus: shot 929 vs 933 → ghost).
- **Figma TIDAK selalu meng-clip frame.** Sebelum pasang `overflow:hidden`,
  cek render: kalau node anak sengaja overflow (mis. potret bleed ke atas frame),
  jangan clip.
- **Jangan pakai nama class yang bentrok dengan hide-list `verify.mjs`.**
  `setNavbarHidden` menyembunyikan `.navbar`, `.rail-arrow`, `.project-arrow`,
  `.project-dots`, `.project-card:not(.is-active)` — komponen baru yang memakai
  `.project-card` akan ikut hilang saat verifikasi (studi kasus: rename ke
  `.hof-project-card`).
- **Gambar `loading="lazy"` di depth bawah halaman belum ter-decode saat
  screenshot.** Di `verify.mjs`/skrip diff, `scrollIntoView` dulu lalu
  `waitForFunction` semua `<img>` di section `complete && naturalWidth>0` +
  `img.decode()` sebelum screenshot, jika tidak section terlihat kosong.
- **Figma `GLASS` effect TIDAK muncul di `figma_get_figma_data` (MCP).** Frame
  glass (pill/kartu/panel) merender **rim 1px bergradasi + backdrop blur**, tapi
  MCP melaporkan fills/effects seolah kosong. Ambil `effects`/`strokes` asli via
  **REST API**: `GET https://api.figma.com/v1/files/<key>/nodes?ids=<id>` dengan
  header `X-Figma-Token: $FIGMA_API_KEY` — contoh Contact: `effects:[{type:"GLASS"}]`.
  Emulasi rim dengan **ring `::after` + `mask`/`mask-composite: exclude`** (JANGAN
  `border` — border mengecilkan content box), lalu **kalibrasi alpha per sisi dari
  piksel PNG** (glass rim lebih terang di atas: contoh terukur top ≈116, bottom
  ≈96, sisi ≈60 di 1×). Blur opsional (`backdrop-filter: blur(8px)` paling dekat;
  hanya berdampak bila ada artwork di belakang panel).
- **Rasterisasi font lintas-renderer = sisa MAE yang sulit hilang.** Pada teks
  kecil (mis. pill Manrope 12px) Figma vs Chromium bisa beda ~1px/tepi glyph walau
  bbox tinta identik; **jangan** kejar dengan menggeser posisi/mengganti gradient.
  `text-rendering: geometricPrecision` membantu sebagian region tapi merusak region
  lain — jangan dipasang global.
- **Referensi PNG hero bisa IKUT memuat navbar.** `Contact-Hero-1x.png` (node
  `1445:5066`) menyertakan navbar; karena `verify.mjs` menyembunyikan `.navbar`,
  MAE "seluruh section" jadi menggelembung. Hitung MAE presisi **tanpa region
  navbar** (Contact: full 2.76 → **~1.28** di bawah navbar).

## 3. Alur kerja presisi (per section)

### Langkah 0 — Buat Rencana Kerja Per-Section (Master Work Plan Wajib)

Sebelum menyentuh satu baris kode pun pada section baru, AI agent WAJIB memaparkan rencana kerja (Master Work Plan) secara mendalam:

1. **Identitas Node**: Node ID Figma, URL link langsung node, frame title, and parent page.
2. **Geometri & Autolayout**: Lebar × tinggi frame, layout direction (row/column), alignment.
3. **Strict 8-Point Grid Spacing & Padding**:
   - Container section padding (mis. `padding: 80px`).
   - Gap vertikal antara header frame ke content/grid/table (mis. `gap: 56px` — pastikan kelipatan 8px, ganti jika ada magic number lama).
   - Padding internal card atau table.
   - Gap antar-elemen (eyebrow, heading, subtitle).
4. **Tipografi**:
   - Heading: **Bluu Next Bold 700** (`--font-display`), size/line-height, gradient text per line.
   - Body/Subtitle: **Manrope** (`--font-body`), weight 400/500/700, size/line-height, color.
5. **Aset & Artwork**: Image fill raw vs CSS ring rim vs SVG.
6. **Testing & Verification Gates**: Target geometri `verify.mjs`, MAE target, dan 6 gate audit.

> **PENTING**: Dilarang keras melompati section atau menggabungkan multiple section dalam satu pass. Selesaikan 100% per-section, verifikasi, dan kunci sebelum beralih ke section selanjutnya!

### Langkah 0b — Inventaris WAJIB semua section halaman (anti-skip)

Sebelum mengerjakan halaman baru, AI agent WAJIB memetakan **seluruh** section dari
frame halaman Figma (node halaman, `depth 1`) dan menuliskan checklist-nya di
Master Work Plan. Setiap section = satu entri dengan: nomor urut, Node ID, nama
frame, dimensi (w × h), dan status (`BELUM / SEDANG / SELESAI`).

- Section diambil **persis dari urutan anak frame halaman** — tidak boleh ada yang
  dilewati, tidak boleh digabung, tidak boleh ditambah dari luar urutan.
- Beberapa section mungkin **belum ada komponennya** di `src/components/` (mis.
  section baru yang belum diimplementasikan) — tetap **wajib** didaftarkan dan
  dibuat, bukan diabaikan.
- Section bersama (mis. `Footer` instance) tetap didaftarkan; jika komponennya
  sudah presisi, tandai `SELESAI (shared)` dengan bukti gate-nya.
- Checklist ini yang dipakai untuk laporan progress: satu section selesai → baru
  lanjut ke entri berikutnya. Jangan pernah menyentuh section ke-N+2 sebelum
  ke-N lolos 6 gate.

Contoh format checklist (wajib ada di Master Work Plan):

```
Halaman: About Us (1439:4184) — 6 section
[ ] 1. 1439:4185  Hero Section - About Us      1440×903
[ ] 2. 1439:4190  visi misi section            1440×840
[ ] 3. 1439:4219  Philosophy Section           1440×837
[ ] 4. 1439:4258  Our Ecosystem Section        1440×874
[ ] 5. 1439:4305  Our Team Section             1440×1536
[ ] 6. 1439:4311  Footer (shared, sudah presisi) 1440×556
```

### Langkah A — Ambil struktur Figma

- `figma_get_figma_data` pada node section (dan node anak yang perlu).
- Catat: mode layout, padding, gap, align, ukuran, posisi, teks persis,
  `textStyle` (family/weight/size/lineHeight/letterSpacing), fills, effects,
  radius, stroke.

### Langkah B — Export referensi

- `figma_download_figma_images`:
  - node section → `…-Revisi.png` (1×, lebar frame) + `…-2x.png`.
  - node **teks** terpisah (transparan) untuk mengukur bbox glyph.
  - node **komponen** terpisah (tombol/tab) untuk mengukur lebar/tinggi & warna.
  - kalau node punya `imageRef`, unduh **image mentahnya** (isi `imageRef`) —
    ini art persisnya.
- Simpan di `assets/<page>/<section>/` (bukan di `public/`).

### Langkah C — Ukur dengan `sharp`

Ukur dari PNG 2× (bagi 2 untuk CSS px): bbox tinta tiap teks, lebar/tinggi
tombol, posisi (x/y), dan **profil warna** (dropdown gradient/fill) via sampling
piksel. `sharp.resize(lebar, tinggi, {fit:'cover'})` untuk menyamakan skala.
Tulis skrip sekali pakai di `/tmp/opencode/` (jangan commit), pakai
`createRequire('<repo>/package.json')` supaya `sharp`/`@playwright/test` resolve.

### Langkah D — Bangun HTML/CSS

- Hardcode angka hasil ukur (jangan pakai fixed-px yang bisa overflow; uji
  320–3840px).
- Semua teks/tombol/border/kartu/gradient-text = HTML/CSS asli.
- Gradient teks: `background: linear-gradient(...)`, `-webkit-background-clip:
text; background-clip: text; color: transparent;` **per baris**.
- Kalau ada animasi: sediakan `prefers-reduced-motion` (statis = persis referensi).

### Langkah E — Loop diff (jangan berhenti sebelum pas)

- Screenshot elemen via Playwright (`reducedMotion: 'reduce'`, viewport = frame),
  bandingkan dengan PNG referensi pakai `sharp`: **MAE per region** (judul,
  paragraf, tombol, navbar, background) + visual crop berdampingan.
- Target: **posisi tinta ±1px**, MAE tiap region serendah mungkin (referensi
  existing ~1.6–5; hero revision final **3.18**). Kalau satu region tinggi,
  cari penyebabnya (font? gradient? artwork?) sebelum lanjut.
- Sembunyikan overlay yang tidak ada di PNG (lihat `setNavbarHidden` di
  `verify.mjs`).

### Langkah F — Kunci di verifikasi

- Update `scripts/verify.mjs`: assertion geometri (`assert.deepEqual`), path PNG
  referensi, dan cek font yang dipakai (`document.fonts.load(...)`).
- Update `scripts/navbar-audit.mjs` kalau geometri navbar berubah.
- Update `docs/assets.md` (provenance) + `docs/ai-handoff.md` (state).

## 4. Aturan font (paling sering bikin gagal presisi)

- **Bundle font persis yang dipakai Figma.** Family baru → unduh woff2 dari
  sumber resmi, simpan di `public/fonts/`, tambah `@font-face` + license kalau
  OFL. Contoh: **Bluu Next** (SIL OFL) di `public/fonts/bluu-next-700.woff2`,
  token `--font-display`.
- **Hati-hati faux bold:** kalau font hanya punya satu cut (mis. Bluu Next
  Bold), deklarasikan `@font-face { font-weight: 700 }` dan pakai `font-weight:
700` (jangan deklarasikan 400 lalu minta 700 → browser menebalkan sintetis).
- **Jangan ganti font global selama migrasi.** Halaman yang belum direvisi tetap
  pakai font lamanya (`--font-heading`); section yang sudah direvisi pakai token
  baru (`--font-display`). Ini menjaga diff & geometri halaman lain.
- **Lisensi:** cek dulu. Nasalization **tidak boleh** di-bundle (lisensi desktop);
  jangan akali. Kalau file asli dari desainer tersedia, minta untuk kecocokan
  versi glyph.

## 5. Aturan artwork (image fill vs rekonstruksi)

- Kalau node punya `imageRef`: **unduh image mentah & pakai apa adanya** (bake ke
  webp dengan `fit:'cover'` mengikuti crop FILL Figma). Jangan pecah jadi layer
  rekonstruksi kecuali motion memang butuh cutout terpisah.
- Kalau motion butuh elemen bergerak terpisah (mis. karakter idle) dan art-nya
  satu plate datar: gerakkan **seluruh plate** dengan **overscan** (mis. 1.05)
  supaya tepi tidak bocor — jangan bergerak melebihi overscan.
- Generator aset harus reproducible lewat script di `scripts/generate-*.mjs`
  (baca dari `assets/`, tulis ke `public/images/...`).

## 6. Studi kasus — Homepage hero (1 Oct 2026)

- Frame `1430:2040`, hero `1430:2041`. Judul pindah **Nasalization → Bluu Next
  Bold 72/86** (gradient per baris `211.54deg #fff 32.8% / #999 49.8% / #fff
73.04%`), paragraf Manrope **18/25** lebar 655, spacing **80/64/16/24**,
  tombol Primary/Sec baru (hover `#2F196F` / `#4C3B7E`), navbar CTA **"Join Us"
  93×43** (shared).
- **Art**: node hero punya image fill → diunduh (`Home-Hero-Plate.png`) dan
  dipakai langsung → background MAE **~24 → ~2.7**; hero MAE keseluruhan
  **27.96 → 3.18** (reduced motion, 1440). `figure.webp` (rekonstruksi) dihapus.
- Angka ukur kunci (1440): content `x80 y277 w1280 h349`; tinta judul baris 1/2 di
  y `295/383`; paragraf y `475/500`; tombol y `583`, lebar `201` + `195`; CTA
  navbar `x1267 w93`; menu `x329 w743`.
- Pelajaran: **diff tinggi bisa jadi karena artwork, bukan teks** — cek region
  dulu (background vs teks) sebelum menyalahkan font.

## 7. Studi kasus — Hall of Frames + Contact (1 Oct 2026)

Semua di file Figma `JYUzJK1hFqaEwL6DpdDvjp`. Hasil akhir (reduced motion, 1440):

- **HoF Hero** `1439:4507`: art = raw image fill (`fit:cover`), judul Bluu Next
  80/102 (satu gradient menyeberang blok 2 baris). MAE 4.34 (bg 1.45).
- **Featured Sorcerers** `1439:4512`: 8 kartu 302×400 via **container queries**
  (`1cqw = 3.02px`). **Figma tidak clip** → potret bleed ke atas (302×532 @ y−132
  untuk kartu lead, 302×442 @ −42 lainnya). Frame dekoratif + **fade bawah**
  memakai **render node** (bukan string `linear-gradient` MCP yang lossy: fade
  MCP merender jauh lebih gelap; overlay node memangkas kartu MAE 6.8 → 2.0).
  MAE section 2.01.
- **Project highlights** `1439:4655`: stage 1280×730 dengan 3 kartu browser-mockup
  (tengah 933×730 + sisi 800×626). Screenshot = raw `imageRef` + **tint 20%**
  (lihat §2); rim = ring overlay (bukan border); glow = render node
  IMAGE-SVG `1439:4656` (blur ter-bake; cukup 1 file 1200w, downscale aman karena
  low-frequency). MAE 2.96.
- **Community Milestone** `1439:4699`: timeline 3 baris; rail gradient + 3 diamond
  = render node `1439:4709`. MAE 1.33.
- **Contact** `1445:5066`: hero 1440×954; artwork swirl = render node `1445:5067`
  di `−131/−92`; form/field = HTML asli. MAE 3.00 (panel form 0.57).
  - **Precision pass (1 Oct 2026, lanjutan).** Pill `1445:5072`, kartu info
    `1445:5077`, panel `1445:5098` memakai **GLASS** (REST `effects:[GLASS]`; MCP
    tidak menampilkan). Diemulasi ring `::after` + mask, alpha dikalibrasi
    (`37% → 11% @52% → 28%` di atas fill) → rim kartu/panel **persis** (top
    116/115, bottom 96/95, sisi 60/60). MAE: hero 3.00 → **2.76** (konten tanpa
    navbar ~**1.28**), kartu ~5.1 → **~3.4**, form 1.35 → **1.11**. Input field &
    arrow disc **bukan** glass (fill solid) — jangan beri rim. Sisa: pill ~18
    (rasterisasi 12px + blur), title 6.6 (gradient sudah optimal), submit 4.17,
    footer 5.91, artwork 3.9.
- Pelajaran berulang: **kalau satu region diff tinggi, isolasi dulu** — di proyek
  ini penyebab tersering bukan font, tapi (a) gradient MCP lossy, (b) tint/lapis
  fill kelewat, (c) artwork/scale, (d) class bentrok hide-list, (e) gambar lazy
  belum decode.

## 8. Checklist presisi (patokan "beres")

- [ ] Referensi = PNG node terbaru yang diexport (bukan CSS).
- [ ] Font persis Figma ter-bundle (weight benar, tanpa faux bold).
- [ ] Image fill dipakai apa adanya (tidak direkonstruksi).
- [ ] `effects`/`strokes` asli dicek via REST API (MCP menyembunyikan `GLASS`).
- [ ] Gradient/efek di-fit dari piksel PNG, bukan string MCP.
- [ ] Strict 8-point grid spacing & padding terverifikasi (gap/padding kelipatan 8px, tanpa magic numbers).
- [ ] Posisi tinta ±1px; MAE per region diukur & dilaporkan.
- [ ] Geometri di-assert di `verify.mjs`; navbar-audit diupdate bila perlu.
- [ ] `prefers-reduced-motion` inert & tetap pixel-exact.
- [ ] `format:check`, `build` 0 error, `verify.mjs` exit 0 (`browserErrors: []`),
      `responsive-audit` 468 PASS (18 rute × 26 lebar), `navbar-audit` PASS,
      `seo:audit` PASS, `verify:vt` PASS.
- [ ] `docs/assets.md` + `docs/ai-handoff.md` + `AGENTS.md` diupdate.
- [ ] Commit per fitur; konfirmasi user sebelum `git push origin main`
      (deploy ganda).
