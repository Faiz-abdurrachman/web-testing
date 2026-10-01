# Page build prompt — bikin halaman/section baru presisi Figma

Copy-paste template di bawah ke AI, ganti bagian `<...>`. Tujuannya: hasil
**konsisten** dengan halaman yang sudah ada dan **presisi** ke Figma/PNG.
Metode lengkap ada di **`docs/pixel-precision-sop.md`** (wajib dibaca).

Contoh terisi pakai halaman Recruitment (`assets/assets recruitment page/`).

---

```text
Kamu kerja di repo "Data Sorcerers" (Astro static). Task: bikin halaman/section
baru "<NAMA HALAMAN / SECTION>".

LANGKAH 0 — WAJIB baca dulu (jangan skip):
- AGENTS.md                    → aturan operasional, commands, konvensi, gotchas
- docs/pixel-precision-sop.md  → **SOP PRESISI PIKsel** (export node, font, image
                                 fill, ukur sharp, diff, iterasi). Patuhi ini.
- docs/ai-handoff.md           → state terkini
- HANDOVER.md                  → konteks, stack, section yang sudah ada
- docs/assets.md               → provenance + node Figma tiap section

ASET REFERENSI (dikelompokkan per halaman):
- Folder halaman: assets/<page>/
- Sub-section:    assets/<page>/<section>/
- Link Figma + node id dari file .txt di folder aset.
- Full-page ref:  assets/<page>/...PNG (kalau ada).
- File .css di folder aset = HINT saja, bukan otoritas.

LANGKAH 1 — Ambil data Figma + export:
- `figma_get_figma_data` (node section + anak): layout (mode/padding/gap/align),
  ukuran/posisi, teks persis, textStyle (family/weight/size/lineHeight/
  letterSpacing), fills, effects, radius, stroke.
- `figma_download_figma_images`: node section PNG 1x + 2x, plus node TEKS dan
  KOMPONEN (tombol/tab) terpisah untuk mengukur bbox/warna. Simpan di assets/.

LANGKAH 2 — Otoritas desain (hukum):
- **PNG node hasil export = SUMBER KEBENARAN.** CSS export Figma / string gradient
  MCP = hint & sering LOSSY (MCP menormalkan handle gradient; Copy-as-code tidak
  memuat effects). Kalau beda → PNG. Jangan paste string MCP/CSS mentah.
- Ukur dari PNG 2x pakai sharp (bbox tinta, posisi x/y, lebar/tinggi, profil warna).
  "Ink" harus cocok ±1px. JANGAN nebak/eyeball.

LANGKAH 3 — Bangun:
- Astro component + scoped CSS. Route: src/pages/<slug>.astro (static).
- **Semua UI = HTML/CSS asli** (teks, tombol, border, kartu, gradient text).
  Gambar HANYA untuk artwork/foto. Gradient teks per baris (`background-clip:text`).
  Jangan flatten screenshot jadi UI.
- **Font**: bundle font persis Figma (cek lisensi; OFL → public/fonts/*.woff2 +
  @font-face, weight asli biar tidak faux-bold). Selama migrasi, jangan ganti font
  global — pakai token baru (mis. `--font-display`) untuk section yang direvisi.
- **Artwork dengan `imageRef`**: download raw & pakai apa adanya (`fit:cover` sesuai
  crop FILL Figma). JANGAN rekonstruksi dari layer.
- Aset tampil: WebP (sharp) di public/images/<page>/; artwork kualitas tinggi.
- Animasi: WAJIB fallback prefers-reduced-motion (render reduce pixel-exact).
- Link yang belum punya tujuan tetap `aria-disabled` (jangan bikin URL karangan).
- Jangan tambah dependency/library tanpa tanya.

LANGKAH 4 — Verifikasi (LOOP sampai presisi, jangan berhenti sebelum pas):
- Update scripts/verify.mjs: geometri EXACT (assert.deepEqual), path PNG referensi,
  screenshot + diff (tulis artifacts/), containment + overflow 320–3840, 0 browser error.
- Kalau geometri navbar berubah: update scripts/navbar-audit.mjs.
- Sembunyikan overlay yang TIDAK ada di PNG referensi (lihat setNavbarHidden; kalau
  ada overlay baru, tambahkan ke list). JANGAN pakai nama class yang sudah ada di
  list itu (mis. `.project-card`) — komponen baru akan ikut ter-hide.
- Kalau section ada di bawah fold / punya `loading="lazy"`: `scrollIntoView` lalu
  `waitForFunction` semua `<img>` section `complete && naturalWidth>0` + `img.decode()`
  SEBELUM screenshot, kalau tidak kartu terlihat kosong.
- Cek lapis fill Figma: image fill bisa ditumpuk warna (mis. `[rgba(0,0,0,.2), IMAGE]`)
  dan artwork full-bleed butuh ring overlay, bukan `border` (border mengecilkan content).
- Cek `effects`/`strokes` asli via **REST API** (`GET /v1/files/<key>/nodes?ids=…`,
  header `X-Figma-Token: $FIGMA_API_KEY`) — MCP menyembunyikan `GLASS`. Surface
  GLASS = rim 1px + blur → emulasi ring `::after` + `mask-composite` (bukan
  `border`), alpha di-fit dari PNG (top > bottom > sisi). Elemen non-glass
  (input/ikon) jangan diberi rim.
- Target: ink ±1px, MAE rendah (referensi existing ~1.6–5), `npm run build` 0 error,
  `node scripts/verify.mjs` exit 0 (`browserErrors: []`), `node scripts/responsive-audit.mjs`
  18 rute × 26 lebar PASS, `npm run audit:navbar` PASS, `npm run seo:audit` PASS,
  `npm run verify:vt` PASS. Kalau belum pas: UKUR, perbaiki, ulangi.

LANGKAH 5 — Dokumentasi + commit:
- Update docs/assets.md (provenance: node Figma, ukuran frame, sumber aset) +
  docs/ai-handoff.md + AGENTS.md bila aturan/section berubah.
- Commit per fitur (`feat:`/`fix:`/`docs:`). **Konfirmasi user dulu sebelum
  `git push origin main`** (deploy ganda testing + production).

CHECKLIST PRESISI (patokan "beres"):
- [ ] Referensi = PNG node terbaru (bukan CSS/MCP).
- [ ] Font persis Figma ter-bundle (weight benar, bukan faux-bold).
- [ ] Image fill dipakai apa adanya (tidak direkonstruksi).
- [ ] Gradient/efek di-fit dari piksel PNG, bukan string MCP.
- [ ] Semua teks/tombol/border = HTML/CSS asli.
- [ ] Posisi tinta ±1px; MAE per region diukur & dilaporkan.
- [ ] Geometri kunci PASS (deepEqual) di verify; navbar-audit diupdate bila perlu.
- [ ] Overflow 320–3840px aman, teks tidak terpotong.
- [ ] prefers-reduced-motion ada & pixel-exact.
- [ ] build 0 error, verify exit 0, 0 browser error, responsive/audit/seo/vt PASS.
- [ ] docs/assets.md + docs/ai-handoff.md + AGENTS.md diupdate.
- [ ] commit (per fitur); konfirmasi user sebelum push.

Sebelum mulai: ringkas pemahamanmu + rencana urutan section, lalu kerjakan.
```
