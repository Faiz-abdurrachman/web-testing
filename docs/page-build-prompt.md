# Page build prompt — bikin halaman/section baru presisi Figma

Copy-paste template di bawah ke AI, ganti bagian `<...>`. Tujuannya: hasil
**konsisten** dengan halaman yang sudah ada dan **presisi** ke Figma/PNG.

Contoh terisi pakai halaman Recruitment (`assets/assets recruitment page/`).

---

```text
Kamu kerja di repo "Data Sorcerers" (Astro static). Task: bikin halaman baru
"<NAMA HALAMAN / SECTION>".

LANGKAH 0 — WAJIB baca dulu (jangan skip):
- AGENTS.md      → aturan operasional, commands, konvensi verifikasi, gotchas
- HANDOVER.md    → konteks, stack, section yang sudah ada, checkpoint
- docs/assets.md → provenance + node Figma tiap section

ASET REFERENSI (dikelompokkan per halaman):
- Folder halaman: assets/assets recruitment page/
- Sub-section:   assets/assets recruitment page/hero section/
- Link Figma (dari hero.txt): node 770:15523
- Full-page ref: assets/assets recruitment page/RECRUITMENT PAGE.png
                 (2880x14524 → 1440x7262 @1x)
- File .css di folder aset = HINT saja, bukan otoritas.

LANGKAH 1 — Deep dive (satu section per iterasi):
- Baca SEMUA .txt (link Figma) + .css referensi.
- Ambil data Figma node terkait (figma MCP): layout (mode/padding/gap/align),
  ukuran & posisi tiap elemen, teks persis, font (family/weight/size/line-height/
  letter-spacing), warna, gradient, radius, stroke, shadow.
- Kalau halaman punya banyak section, kerjakan urut, commit per section.

LANGKAH 2 — Otoritas desain:
- PNG referensi = SUMBER KEBENARAN. CSS export Figma cuma hint. Kalau beda → PNG.
- Ukur dari PNG pakai sharp (bounding box, posisi, warna, pixel diff).
- JANGAN nebak/eyeball. Kalau ragu, ukur.

LANGKAH 3 — Bangun:
- Buat Astro component + scoped CSS. Semua UI = HTML/CSS asli (teks, tombol,
  border, kartu, gradient text). Gambar HANYA untuk artwork/foto. Jangan flatten
  screenshot jadi UI.
- Route: src/pages/<slug>.astro (static). Kalau perlu, wire dari Navbar — tapi
  link yang belum punya tujuan tetap aria-disabled (jangan bikin URL karangan).
- Aset tampil: convert ke WebP (sharp), simpan di public/images/<page>/.
  Untuk artwork/foto pakai kualitas tinggi/lossless.
- Kalau ada animasi: WAJIB sediakan fallback prefers-reduced-motion.
- Jangan tambah dependency/library tanpa tanya. Runtime deps harus tetap ringan.

LANGKAH 4 — Verifikasi (LOOP sampai presisi, jangan berhenti sebelum pas):
- Tambah pengecekan di scripts/verify.mjs:
  * geometri desktop EXACT (assert.deepEqual: x/y/width/height section + elemen kunci),
  * screenshot section + diff vs PNG referensi (tulis ke artifacts/),
  * containment teks + overflow horizontal 320–3840px,
  * 0 browser error.
- Saat screenshot, elemen yang TIDAK ada di PNG referensi harus disembunyikan
  (lihat setNavbarHidden di verify.mjs; kalau ada overlay UI baru, tambahkan ke list).
- Target: `npm run build` 0 error; `node scripts/verify.mjs` exit 0; 0 browser
  error; skor diff ~< 2.5/255 (sisa wajar dari rasterisasi font + resampling gambar).
- Jalankan juga `node scripts/responsive-audit.mjs` (14 halaman × 26 lebar) dan
  `npm run seo:audit` (setelah build) — dua-duanya harus PASS. Kalau ada section
  ber-carousel, panah: kiri-kanan di desktop, bawah di mobile (lihat AGENTS gotchas).
- Kalau geometri/diff belum pas: UKUR, perbaiki, ulangi. Jangan klaim selesai
  sebelum benar-benar sesuai.

LANGKAH 5 — Dokumentasi + commit:
- Update docs/assets.md: provenance section baru (node Figma, ukuran frame,
  catatan penting, sumber gambar).
- Update README + HANDOVER: daftar halaman/section.
- Commit per fitur (gaya `feat:` / `fix:` / `docs:`), push ke `main`.

CHECKLIST PRESISI (patokan "beres"):
- [ ] Semua ukuran/posisi/font/warna diambil dari Figma + diverifikasi ke PNG.
- [ ] PNG = otoritas saat CSS Figma beda.
- [ ] Semua teks/tombol/border = HTML/CSS asli.
- [ ] Geometri element kunci PASS (deepEqual) di verify.
- [ ] Overflow 320–3840px aman, teks tidak terpotong.
- [ ] prefers-reduced-motion ada kalau ada animasi.
- [ ] build 0 error, verify exit 0, 0 browser error.
- [ ] docs/assets.md + README + HANDOVER diupdate.
- [ ] commit + push.

Sebelum mulai: ringkas pemahamanmu + rencana urutan section, lalu kerjakan.
```
