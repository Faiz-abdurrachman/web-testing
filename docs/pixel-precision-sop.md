# SOP — Presisi piksel (WAJIB untuk semua section/halaman)

## Checkpoint CMS — Partners SQL applied + QA lokal, belum deploy

Pass 6 Partners A–D selesai; [proof dan scope](cms-pass6-partners-plan.md#9-proof-actual-a-d--7-oct-2026).
Kode lokal memakai Partners read RPC Supabase; situs masih baseline526b428
(Partners GAS), menunggu izin push baru dan acceptance E. UI/font/artwork,
spacing/geometry/reference/assertions tidak diubah; count10/5/5 dan icons lokal.
Fresh snapshot/19 public HTML exact, 7 gate + SEO PASS, Partners sembilan widths
PASS. Full GAS export tetap divalidasi; jangan hapus tab/env. Auth terakhir.
Checkpoint planning terdahulu di bawah disimpan sebagai riwayat.

## Penggunaan untuk CMS — checkpoint aktif pass 6 Partners planning

Deployed checkpoint `526b428`, fitur Hods `763bafc`; Projects/Team/Roles/Domains/
Hods Supabase, Partners GAS. NEXT [Partners Master Work Plan](cms-pass6-partners-plan.md)
dan [CMS SOP](cms-sop.md), **PLAN ONLY**, belum SQL/runtime/apply/deploy Partners.
Planning tidak mengubah aturan presisi. UI/font/artwork/geometri/reference/
assertion terkunci; count10/5/5 dan why-icons tetap lokal. Satu collection/pass,
tujuh gate + SEO; jangan mengubah baseline untuk Team drift. Pass Partners hanya
sumber konten build-time; perubahan UI perlu authorization dan protocol penuh
per section. NEXT GAS/Growth historis tidak menjadi work order aktif.

Aturan tetap untuk UI/admin yang diotorisasi di pass tersendiri: admin custom
belum punya node Figma, tulis layout/spacing/font/test criteria dan jangan
mengarang node/PNG. Fixture growth terpisah dari fixture baseline, jangan
melonggarkan assertion geometri. Baked artwork bukan field editor; media
privat perlu pipeline cache. Ini aturan umum, bukan tambahan scope Partners.

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

**Tabel pengecualian (dipakai berulang, semua dari Figma/PNG atau teknik render):**

| Nilai                        | Pemakaian terbukti (provenance)                       |
| ---------------------------- | ----------------------------------------------------- |
| `1`                          | ring/mask 1px (GLASS), offset hairline                |
| `2`                          | stack judul/nilai kartu info; offset glow             |
| `3`                          | offset glow/tepi terkalibrasi                         |
| `4`                          | gap antar-baris heading; eyebrow → heading            |
| `5`                          | gap hairline                                          |
| `6`                          | dot / micro gap tag                                   |
| `7`                          | gap info kartu team (Figma)                           |
| `10`                         | padding pill/tag (Figma)                              |
| `12`                         | padding pill/badge; gap header-row kartu (Figma)      |
| `13`                         | gap tag kartu (Figma)                                 |
| `14`                         | gap back-link; judul kartu → copy (Figma)             |
| `15`                         | offset baseline judul kartu (terkalibrasi)            |
| `18`                         | ikon→teks kartu info; padding item FAQ (Figma)        |
| `19`                         | padding header/body FAQ (Figma)                       |
| `20`                         | padding kartu (Figma)                                 |
| `21`                         | header Available Roles → subtitle (Figma; header 115) |
| `22`                         | padding kartu; gap FAQ (Figma)                        |
| `23`                         | dot→teks bullets (Figma `798:2746`)                   |
| `26`                         | ruang hover scroll-container / kalibrasi              |
| `28`                         | gap section footer (Figma)                            |
| `30`                         | gap kolom grid Philosophy (Figma)                     |
| `31`                         | tinggi bar list Visi-Misi (Figma)                     |
| `35`                         | gap thumbnail Snippets (Figma)                        |
| `36`                         | gap connector pipeline (Figma)                        |
| `42`                         | header → grid (Partners); gap panel (Figma)           |
| `44`                         | gap grup footer/why/HoF (Figma)                       |
| `52`                         | gap pipeline Our Ecosystem (Figma)                    |
| `58`                         | gap section / timeline (Figma)                        |
| `60`                         | gap section footer (Figma)                            |
| `66`                         | margin rail → section / row-gap HoF (Figma)           |
| `74`                         | header frame → rail (Figma)                           |
| `82`                         | header → carousel Our Project (Figma)                 |
| `92`                         | gap baris grid Philosophy (Figma)                     |
| `100`                        | gap header section (Figma)                            |
| `116`                        | gap Our Ecosystem (Figma)                             |
| `146`                        | HoF Milestone year → content (Figma)                  |
| `150`                        | padding atas mobile Philosophy (Figma)                |
| `242`                        | padding atas hero Partners (Figma)                    |
| `855`                        | x konten desktop Philosophy (Figma)                   |
| `67/67.2/95.2/38.4/102/57.6` | line-height heading (cek bbox PNG)                    |

**Di luar scope audit (teknik, bukan angka ajaib):** nilai non-integer
(mis. `0.5`, `6.789`, `20.367`) = offset baseline sub-pixel terkalibrasi; unit
`cqw/cqh`, `%`, serta `calc()/clamp()/var()/env()/max()/min()` = layout
responsif/proporsional; margin negatif = offset glow/rail. Nilai-nilai ini tidak
diperiksa karena memang bergantung konteks.

**AUDIT SPACING WAJIB (jalankan sebelum commit tiap section):** `npm run
audit:spacing` (`scripts/spacing-audit.mjs`) memindai semua komponen: setiap
`padding/gap/margin` numerik harus kelipatan 8 ATAU ada di tabel di atas, kalau
tidak → **exit 1**. Jalankan juga per-komponen saat mengerjakan satu section:

```sh
node scripts/spacing-audit.mjs src/components/<Komponen>.astro
```

Kalau ada angka yang tidak bisa dipertanggungjawabkan → ukur ulang dari Figma/PNG,
lalu **ubah ke kelipatan 8 terdekat ATAU tambahkan ke tabel pengecualian dengan
node Figma/bbox PNG sebagai bukti** dan update assertion di `scripts/verify.mjs`.

### Hukum Warna — fills & gradient (WAJIB sama persis dengan Figma)

Warna adalah bagian dari presisi piksel, bukan selera. Setiap section WAJIB mendata
warna **tiap text node** (judul, subtitle, copy, eyebrow, label, placeholder) dan
mencocokkannya ke Figma.

- **Teks solid = `fills` node Figma apa adanya** (hex persis). Ambil dari
  `figma_get_figma_data` → `fills`. Contoh palette homepage: copy `#FFFFFF`
  (node `1430:2047`), putih `#FFFFFF`, lavender `#EDE8FF`, muted `#999999`,
  disabled `#A3A3A3`, nav inactive `#707070`, nilai kartu `#ADADAD`. **Jangan
  kira-kira / jangan pakai "kira-kira mirip".**
- **Teks gradient = fit dari PNG node** (angle + stop + posisi); string MCP
  `linear-gradient(...)` **lossy** (stop terakhir dipaksa 100%). Contoh homepage:
  heading (hero **dan** section) `181deg #fff 15% / #999 42% / #fff 79%` —
  global Figma `Gradient Heading`. Nilai lama hero `211.54deg 32.8/49.8/73.04`
  **salah** (dikoreksi 3 Oct 2026: fit ulang dari PNG menurunkan ink-MAE hero
  13.7 → 7.7 dan heading section ~1 MAE). Sekali lagi: **fit dari piksel**,
  bukan paste MCP.
- **Aturan per-node:** satu text node 2 baris → satu gradient membentang blok
  (satu `<span>`/elemen); tiap baris node terpisah → gradient per baris
  (`<span>` masing-masing).
- **Alpha/opacity persis:** tulis `rgb(r g b / a)` sesuai `fills` (mis.
  `rgb(255 255 255 / 12%)`, `rgb(255 255 255 / 15%)`, `rgb(108 59 255 / 50%)`,
  `#6c3bff80`). Jangan bulatkan.
- **Warna non-teks** (fill tombol, kartu, rim/stroke, glow) juga dari `fills`/
  `strokes`/`effects` Figma — termasuk yang disembunyikan MCP (GLASS) → cek REST.
- **Cara verifikasi:** `getComputedStyle(el).color` / `background-image` di
  Chromium vs `fills` Figma. Hex solid harus **sama persis**; gradient target
  MAE region ≤ ±2 level/channel (fit ulang dari PNG kalau lebih).
- **Placeholder** (`::placeholder`) juga dari fill node (mis. Contact
  `#A3A3A3`).

### Hukum Glow, Gradient & Artwork Responsif

Glow/gradient latar yang di-fit ke frame **1440** adalah bagian dari komposisi
presisi, bukan hiasan bebas. Aturannya:

- **Glow/gradient besar WAJIB satu sistem koordinat dengan kanvas.** Kalau
  konten 1440 di-`zoom`/`scale` (mis. `.canvas { zoom: calc(100vw / 1440px) }`),
  maka gradient/glow HARUS berada **di dalam kanvas itu**, bukan di `<section>`
  full-bleed. Gradient di section full-bleed melebar saat zoom-out → pita warna
  bergeser (studi kasus: About Us Philosophy `1439:4219` & Our Ecosystem
  `1439:4258`, ungu cuma di sudut saat >1440). Kalau memilih tak pakai `zoom`,
  tiru pola Home (kanvas 1440 center + glow/art ekstensi ke luar).
- **Artwork karakter yang menempel tepi** di-anchor dengan
  `left: calc((1440px - 100cqw) / 2)` (≥1441) sehingga ia "nempel" ke tepi
  section tanpa ikut membesar; JANGAN di-zoom. Kalau teks di-zoom, art ditaruh
  **di luar** kanvas zoom supaya skalanya tetap.
- **Seam antar-section** yang gradientnya di-desain menyatu (Philosophy ↔
  Ecosystem) harus diuji: baris bawah section N vs baris atas section N+1,
  **Δ maksimum ≤ ~10** (referensi sendiri ±8). Jangan sampai muncul sliver
  `#050507` (warna dasar) di perbatasan.
- **Uji multi-lebar, bukan cuma 1440.** Glow/gradient/art dicek di **1440, 1920,
  2560, 3840** (dan 320–1440 untuk layout); 1440 tetap pixel-exact vs PNG,
  lebar besar harus konsisten secara visual dengan komposisi 1440. Render
  `prefers-reduced-motion: reduce` tetap pixel-exact.
- Referensi: `docs/about-us-glow-plan.md`.

### Hukum Navigasi & Prototype (tombol & link)

Setiap tombol/CTA/kartu/link yang **punya tujuan di prototype Figma** WAJIB
mengarah ke destinasi yang **100% benar** — bukan dikarang, bukan `aria-disabled`.

- **Sumber kebenaran tujuan = prototype Figma.** MCP `figma_get_figma_data`
  **TIDAK mengekspos** prototype interactions. Baca via REST API:
  `GET /v1/files/<key>` (header `X-Figma-Token`), walk `document`, ambil
  `node.interactions[]` → `trigger.type` + `actions[]` (`type: "NODE"`,
  `destinationId`, `navigation`, `transition`), lalu resolve `destinationId`
  ke nama/path. Peta hasil ekstraksi + gap vs kode: **`docs/figma-prototype-flow.md`**.
- **Satu elemen per pass.** Terapkan satu tombol/link, verifikasi, catat, baru
  lanjut. Jangan gabung. Home (`1430:2040`) & Recruitment (`1436:3505`) adalah
  benchmark presisi — perubahan link tidak boleh menggeser geometri/MAE.
- **`aria-disabled` hanya untuk yang benar-benar tak punya tujuan.** Contoh yang
  sah: legal links (`Terms/Privacy/Cookies`), social footer/OurTeam, `Apply Now`
  di detail role (Figma hanya hover). Selain itu → link asli.
- **Perbedaan aksi prototype:** `NAVIGATE` → pindah halaman; `SCROLL_TO` →
  anchor in-page (mis. `#available-roles`, `#projects`); `BACK` →
  `history.back()`; `CHANGE_TO`/`SWAP`/`DRAG` → state lokal (accordion, carousel,
  tab), **bukan** pindah halaman.
- **Anchor in-page:** pakai id section yang ada (`#projects`,
  `#available-roles`, `#who-should-join`, `#domains`, `#our-philosophy`). Sudah
  di-handle View Transitions (`BaseLayout` re-apply hash; `section[id]` punya
  `scroll-margin-top: 110px`).
- **A11y & motion:** pakai `<a href>` untuk navigasi (bukan `<button>`), label
  deskriptif, smooth-scroll harus menghormati `prefers-reduced-motion`, dan cue
  suara lewat `data-sfx` (lihat `docs/sound-sop.md`).
- **Verifikasi:** klik tiap link (manual + `verify:vt` untuk navigasi klien);
  pastikan tidak ada `aria-disabled` yang tersisa untuk elemen yang punya tujuan.
- Referensi: **`docs/figma-prototype-flow.md`** (peta + gap + bug prototype).

### Hukum Section Full-Screen & Hero Gambar (berlaku sejak 4 Oct 2026)

Standar baru (disetujui user): **tiap section konten = satu layar penuh** dan
**tiap hero = gambar background + `100svh`**. Resep + checklist per-halaman:
**`docs/page-fullscreen-migration-plan.md`** (work order resmi).

- **Hero:** background = `<img>` dari `assets/hero gambar/` (`object-fit: cover`,
  full-bleed), tinggi `min-height: 100vh; min-height: 100svh`. Gambar sumber
  **tidak memuat teks** — heading/subtitle/tombol tetap HTML asli. Video,
  partikel Three.js, veil/sweep, dan plate lama **dihapus**. Di `≥1921px` art
  di-cap `1920px` + `mask-image` (jangan melar).
- **Section konten:** `min-height: 100vh; min-height: 100svh; display:flex;
flex-direction:column; justify-content:center;` + pembungkus `width:100%`.
  **CTA & Footer tidak diubah.**
- **Satuan viewport di luar scope audit 8-pt** (seperti `calc()/cqw/%`): tidak
  ada magic number baru. Padding/gap/margin internal **tetap kelipatan 8**.
- **Dilarang `zoom` / `transform: scale`** untuk full-screen (render pecah; user
  menolak). Gunakan `min-height: 100svh` + centering.
- **`prefers-reduced-motion: reduce` tetap pixel-exact** — animasi baru wajib
  inert di reduce.
- **`verify.mjs`:** section naik jadi 100svh → update `height`/`top` assertion;
  **reference PNG di-pad** (bukan di-stretch) dengan `sharp.extend()` sebesar
  `(sectionH − FIGMA_H)/2` top & bottom, warna dasar `#050507`, agar konten tetap
  align karena ter-center. Section yang kontennya > viewport tidak di-pad.
- **Satu section per pass + 7 gate per halaman**; update `docs/assets.md`,
  `docs/ai-handoff.md`, `AGENTS.md`, dan `page-fullscreen-migration-plan.md` di
  commit yang sama. Jangan lompat/gabung section.

### Hukum Animasi, Transisi & Smooth Scroll (sejak 5 Oct 2026)

User minta semua perpindahan **halus & elegan**. Aturan keras:

- **Reduce = pixel-exact & inert.** Setiap animasi/transition WAJIB di-gate
  `@media (prefers-reduced-motion: no-preference)`; di `reduce` render harus
  sama dengan reference (audit & `verify.mjs` jalan di reduce).
- **Scroll same-page smooth, bukan lompat.** `html { scroll-behavior: smooth }`
  **hanya** di dalam `@media (prefers-reduced-motion: no-preference)` (reduce =
  instan). Hash target wajib punya `scroll-margin-top` (sudah 110px). Contoh:
  tombol "Apply Now" di hero `/recruitment` → `#available-roles` harus mengalir,
  bukan jump.
- **Pindah halaman = View Transitions.** Pakai `<ClientRouter />` (sudah aktif);
  tombol/link cross-page jangan `preventDefault` tanpa alasan. Semua script yang
  menyentuh DOM WAJIB `astro:page-load` re-init + `astro:before-swap` teardown
  (lihat gotcha §2). Navigasi klien tak boleh menyisakan listener/ScrollTrigger.
- **Animasi masuk (reveal):** pakai `motion.ts` (`reveal()`, `gsap.matchMedia`);
  entrance Our Team (header, title grup, kartu leader, carousel) + stagger kartu.
  Jangan animasi properti layout (width/height/top/left) — pakai
  `transform`/`opacity` saja (hindari reflow/jank).
- **Deep-link/reload tetap mendarat di section** (hash di-reapply setelah
  `ds:splash-done`/`load`/`fonts.ready` — jangan regresi).
- **Elemen mengapung (mis. tombol scroll-up footer):** **default = bukan
  `position: fixed`** — permintaan user 5 Oct 2026: tombol scroll-up footer
  diletakkan **di dalam alur footer, di atas divider/legal** (`.scroll-up` di
  dalam `.bottom`, `position: absolute; right:0; bottom: calc(100% + 8px)`;
  `.bottom { position: relative }`). Jangan pakai `fixed` + `IntersectionObserver`
  untuk footer (pernah dibuat, dibatalkan user). `aria-label` jelas; klik → scroll
  ke atas (smooth via `html { scroll-behavior: smooth }` #6, reduce = instan).
  Kalau di masa depan butuh benar-benar mengapung, ikuti aturan lama (`fixed` +
  observer, reduce instan, jangan tabrakan `.sound-toggle`) — tapi konfirmasi user
  dulu.
- **Verifikasi:** `verify-vt` (navigasi klien + hash), `perf:audit` (jank),
  dan render `reduce` headless vs reference (MAE tak berubah).

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
- **Pill/tombol GLASS punya fill + lapisan "liquid" + rim, dan rimnya bisa
  ASIMETRIS.** Contoh `OurTeam` "See More" (komponen `1248:15694`): fill `#1A1A1A`
  - child "liquid" `rgba(217,217,217,.1)`, plus inset shadows; rim PNG terbaca
    ≈226 di kanan-bawah dan ≈117 di kiri-atas (bukan seragam). Implementasi lama
    `#161616` + radial highlight terang kiri-atas → interior ~22 vs referensi ~46
    (region MAE ~29). Cara benar: ambil `fills`/`effects` node (REST), set
    `background` = fill node, tambahkan lapisan liquid (`::before`) + rim via inset
    shadow/ring `::after`, lalu **fit intensitasnya dari PNG**. Tombol ber-`hug`
    punya **floor MAE dari AA teks** lintas-renderer — berhenti di floor, jangan
    geser posisi. Catat nilai & provenance di `docs/assets.md`.
- **Rasterisasi font lintas-renderer = sisa MAE yang sulit hilang.** Pada teks
  kecil (mis. pill Manrope 12px) Figma vs Chromium bisa beda ~1px/tepi glyph walau
  bbox tinta identik; **jangan** kejar dengan menggeser posisi/mengganti gradient.
  `text-rendering: geometricPrecision` membantu sebagian region tapi merusak region
  lain — jangan dipasang global.
- **Referensi PNG hero bisa IKUT memuat navbar.** `Contact-Hero-1x.png` (node
  `1445:5066`) menyertakan navbar; karena `verify.mjs` menyembunyikan `.navbar`,
  MAE "seluruh section" jadi menggelembung. Hitung MAE presisi **tanpa region
  navbar** (Contact: full 2.76 → **~1.28** di bawah navbar).
- **Cek dulu apakah section baru benar-benar beda dari section lain.** About Us
  Philosophy `1439:4219` ternyata **pixel-identik** (MAE 0.000) dengan homepage
  Philosophy `1430:2052`. Sebelum menulis CSS baru: export node PNG baru, bandingkan
  (`sharp` MAE) vs referensi section existing. Kalau sama → samakan layout/varian
  (di About Us ini memangkas satu section penuh dari kerja rekonstruksi).
- **Line-break heading WAJIB diukur dari PNG**, jangan diasumsikan. Hero About Us
  salah pecah baris ("...Future of" / "AI & ...") padahal Figma "...Future of AI"
  / "& Data Innovation." Export node teks terpisah, ukur row-band `sharp` (alpha>200).
- **`lineHeightPx` Figma ≠ bbox.** Figma lapor `67.2` tapi `absoluteBoundingBox` node
  teks = `67`. Untuk heading satu baris/header, pakai **`line-height: 67px`** supaya
  container pas integer; `67.2` menggeser header/pipeline 0.2px (Our Ecosystem MAE
  3.45 → 2.22; Our Team header 101.2 → 101). Verifikasi dengan mengukur header frame.
  Konfirmasi terbaru: Snippets `1436:3684` heading `67.2` → `67` membuat section
  **tepat 897** = tinggi reference PNG (sebelumnya 897.203).
- **Sudut gradient stroke Figma dari MCP juga LOSSY, bukan cuma stop-nya.** String
  `linear-gradient(135deg, …)` sering bukan sudut render asli. Seleksi & FAQ rim
  (global `fill_9a45ebdb`) render **`90deg`**: rim atas & bawah **identik per-x**
  (terang di kedua ujung, tergelap di pusat tabel x720) — 135deg mustahil begitu.
  CTA panel `1436:3687` justru **`110deg`** (bukan 135deg): sweep sudut vs PNG
  menurunkan top-rim MAE 6.9 → 0.6. **Cara pasti:** sweep sudut via Playwright
  (inject `linear-gradient(<A>deg, …)`), ukur MAE region rim vs PNG, pilih minimum.
- **`textAlignHorizontal` Figma bisa SALAH.** Header Date Selection Timeline
  (`1436:3644`) MCP bilang `CENTER`, tapi PNG menaruh "Date" **LEFT** (x761, sama
  dengan baris body). Selisihnya 255px! **PNG > MCP.** Jika bbox tinta vs PNG beda
  jauh, percaya PNG.
- **Section origin fraksional → artefak screenshot 1px (BUKAN bug CSS).** Kalau top
  section bukan integer (mis. `6613.781`, `5196.781`, `4213.578`), Playwright
  membulatkan `locator.screenshot()` bounds **ke luar** 1px → seluruh konten tergeser
  sub-pixel. Gejalanya: diff heatmap hanya **outline** glyph/rim (bukan fill),
  region bebas-teks MAE rendah, dan crop `top:1` menurunkan MAE drastis (mis. FAQ
  7.80 → 5.04; Snippets 7.90 → 3.03; CTA 2.25 → 1.19). **Jangan kejar dengan
  menggeser CSS** — laporkan sebagai artifak, ukur "aligned MAE" untuk menilai
  presisi sebenarnya. (Screenshot bounds: `top=floor(rect.top)`, `height=ceil(bottom)-floor(top)`.)
- **Garis separator yang fade ke putih = non-premultiplied.** Figma
  `linear-gradient(90deg, #9b7bff, rgba(255,255,255,0))` merambat **warnanya ke
  putih** saat alpha turun. CSS menginterpolasi **premultiplied** → RGB tetap ungu
  (terlalu gelap di ujung kanan). Emulasi: pisahkan ramp warna & alpha —
  `background: linear-gradient(90deg, #9b7bff, #fff)` +
  `-webkit-mask-image: linear-gradient(90deg, #000, transparent)` (Selection
  Timeline MAE/baris 12 → 1.2).
- **Sambungan dua frame bertumpuk (junction) bisa 1px lebih tinggi dari tumpukan
  naif.** Selection Timeline: header 78px + body 451px menaruh garis junction di
  baris 280-281, sedangkan PNG di 279-280. Fix tanpa mengubah box/baris: header
  `::after` base **2px** (`padding: 1px 1px 2px 1px`) + body `::after` **tanpa top**
  (`padding: 0 1px 1px 1px`).
- **Tinta heading kadang 1px lebih rendah dari render CSS.** Nudge lewat inner
  `<span style="position:relative;top:1px">` agar **geometri `h2` (yang di-assert
  `verify.mjs`) tidak berubah**; `transform`/`top` pada `h2` langsung akan menggeser
  bbox yang di-assert.
- **`imageTransform` pada IMAGE fill = crop.** Node gambar Figma bisa punya
  `imageTransform` `[[sx,0,tx],[0,sy,ty]]`; **jangan** `fit: fill` gambar mentah —
  `sharp.extract(tx*W, ty*H, sx*W, sy*H)` lalu resize ke ukuran node (Our Team potret).
- **`responsive-audit.mjs` punya skip-list text "offscreen/clipped"** (`.domain-rail`,
  `.project-card:not(.is-active)`). Rail yang sengaja di-clip (mis. `.team-cards`
  menampilkan 4 dari 5 kartu) harus ditambahkan ke skip-list, kalau tidak audit FAIL
  di lebar tertentu (`offscreen:h3.team-name`).

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
6. **Testing & Verification Gates**: Target geometri `verify.mjs`, MAE target, dan 7 gate audit.

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
  ke-N lolos 7 gate.

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
  Bold 72/86** (gradient per baris `181deg #fff 15% / #999 42% / #fff 79%`),
  paragraf Manrope **18/25** lebar 655, spacing **80/64/16/24**,
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
- [ ] Font persis Figma ter-bundle (weight benar, tanpa faux bold). Heading =
      `--font-display` (Bluu Next Bold 700); body/subtitle = Manrope (400/500/700);
      Nasalization (`--font-heading`) HANYA di `Splash` wordmark + label grup
      `OurTeam` (jangan di section revisi).
- [ ] Gradient heading = fit dari PNG: `181deg #fff 15% / #999 42% / #fff 79%`
      (bukan `211.54deg`); alpha persis.
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

## 9. Target berjalan (4 Oct 2026)

**NEXT: TERAPKAN SEMUA TOMBOL/LINK SESUAI PROTOTYPE FIGMA** (lihat SOP §"Hukum
Navigasi & Prototype" + peta **`docs/figma-prototype-flow.md`**). Setiap tujuan
**100% benar**, `aria-disabled` hanya untuk yang benar-benar tak punya destinasi,
**satu elemen per pass + 7 gate**, dan **catat tiap perubahan** di doc. Prioritaskan
Home (`1430:2040`) & Recruitment (`1436:3505`) — benchmark presisi, jangan rusak.
Gap awal: `docs/figma-prototype-flow.md` §9 (6 elemen).

**PENDING: video hero Contact (`1445:5066`)** — tunggu aset. Sisanya sudah video
(Home/Recruitment/About/HoF/Partners); lihat `docs/hero-video-plan.md` §1.
Setelah itu: audit per-section Detail HoDS (`864:18857` dkk) + konten asli.
URL Figma halaman terkait ada di `docs/kickoff-prompt.md`.

**Selesai (jangan rusak tanpa alasan):**

- Homepage (`1430:2040`, §1–7), Recruitment (`1436:3505`, 9/9), About Us
  (`1439:4184`, §1–6; visi-misi punya `<Starfield />` final — **jangan disentuh**),
  Partners (`1439:4787`, §1–4), Contact hero (`1445:5065`).
- **About Us glow responsif + karakter menempel tepi (`1439:4219`/`1439:4258`) —
  SELESAI 4 Oct 2026**: canvas `zoom` dihapus, gradient section-level, artwork
  anchor `left: calc((1440px - 100cqw) / 2)` (861px, nempel tepi), seam Δ 0.
  Detail: `docs/about-us-glow-plan.md`.
- **Hall of Frames card Project Highlight (`1439:4655`) — SELESAI 3 Oct 2026**:
  disamakan dengan card "Our Project" homepage (`Projects.astro`) — kartu 549×567 +
  coverflow JS, 4 project/4 dot, glow bow-tie dihapus; section 1440×1014; reference
  - assertion `verify.mjs` diregenerasi. Detail: `docs/assets.md`.
- **Berikutnya setelah video:** audit Partners (`1439:4787`) + 6 detail HoDS
  (`864:18857` dkk) per-section; lalu konten asli. State lengkap →
  `docs/ai-handoff.md`.

## 10. Video hero (aturan keras)

Semua hero boleh pakai `<video>` looping sebagai background, dengan syarat:

- **Fallback statis wajib.** `<picture>`/art plate tetap ada; video `opacity:0`
  secara default, hanya tampil di
  `@media (prefers-reduced-motion: no-preference) and (min-width: 601px)`.
  Under `reduce` **dan** ≤600px: video tidak di-attach/di-load/play.
- **Jangan ubah geometri.** Video `position:absolute; inset:0; object-fit:cover` di
  dalam `.artwork` (`z-index:-1`, `aria-hidden`). Section height/padding/gap/font
  tidak berubah; reference PNG (di-capture reduce) & MAE **tetap sama**.
- **Markup:** `<video muted loop playsinline preload="none">` + `<source webm>` dulu
  lalu `mp4`. **Jangan** set `poster`/`autoplay`/`preload="auto"` di markup — attach
  `poster` + `preload='auto'` + `load()` via JS hanya saat akan play.
- **Encode:** webm AV1 (`libsvtav1` crf 43, preset 8), mp4 H.264 (`libx264` crf
  28–30, preset slow, `+faststart`), `yuv420p`, `-an`; poster = frame 0 webp q82;
  `unsharp=5:5:0.5`. Resolusi ≥1920×1080; 2560×1440 untuk hero yang di-pin/zoom.
  Budget ~ webm ≤0.9 MB / mp4 ≤1.1 MB per hero.
- **Loop:** crossfade sirkular (1s) untuk motion terarah, atau ping-pong; tidak boleh
  ada seam terlihat.
- **A11y/UX:** `aria-hidden`, `muted`, `playsinline`; pause off-screen
  (`IntersectionObserver`) dan saat tab hidden (`visibilitychange`); cleanup
  `astro:before-swap` (`AbortController`/`dispose`), re-init `astro:page-load`.
- **Kualitas:** cek frame 0/tengah/seam 1:1 sebelum lanjut; jangan "burik".
  Detail langkah + rollout: `docs/hero-video-plan.md`.

**Tabel pengecualian spacing** (§Hukum Spacing) berlaku juga di hero; seluruh
padding/gap/margin hero tetap kelipatan 8 atau ada di tabel.
