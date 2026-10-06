# Master Work Plan — B2 Team, 6 Oct 2026

## Status dan scope

Awal HEAD 61a3b6f, working tree bersih. Projects Growth/media live acceptance
serta cleanup selesai. Empat Projects baseline kembali persis. Pass ini hanya
Team; B3/B4 dan username/password tetap berikutnya. Backend, OAuth, Sheet,
folder Drive dan dua hooks EXISTING. Tidak menjalankan setup/reseed. Commit
diizinkan, push wajib konfirmasi karena origin men-deploy dua situs.

## Inventaris dan desain terkunci

Consumer Team: src/data/team.ts → OurTeam.astro → TeamCard.astro, /about.
Sheet existing: id, group, groupTitle, name, role, photo, order. Export membuang
ID/order dari snapshot publik; stable ID tetap tersedia di admin. Metadata chip,
fade, urutan enam domain dan Growth Join Now tetap lokal. Collection lain tidak
berubah. Snapshot baseline dan assertion verify.mjs tetap.

About existing inventory (bukan membangun ulang halaman): Hero 1439:4185
1440×903; VisiMisi 1439:4190 1440×840; Philosophy 1439:4219 1440×837;
Ecosystem 1439:4258 1440×874; Our Team revisi 1688:2933 1440×1562;
Footer 1439:4311 1440×556. Semua terkunci; hanya adapter konten Team diperluas.
Referensi baseline existing sudah diexport, tidak mengubah desain/referensi.

Our Team node 1688:2933:
https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=1688-2933
Component per HoDS 1594:5145; reference assets/about-us/team/OurTeam-New-1x.png.
Padding 80; header gap 8; header→groups 48; groups gap80; title→cards48;
carousel gap72, chip gap16, card gap24. Groups width1287/x76.5, card302×400,
leader baseline x406/732 y344, HoDS baseline y1082. Card info x42/y284/w217,
gap7 merupakan exception Figma. Bluu Next Bold700 heading56/67 gradient181deg
white15%/gray42%/white79%; Manrope name700 22/33 white, role400 16/24 #d8d1d1.
Existing card-frame.webp dan dua preset portrait dipertahankan byte-identik.
Upload portrait memakai slot lokal 302×442/top−42, object-fit cover, top center;
tidak ada field crop/koordinat. Raster transparan tetap transparan. Nama/peran
panjang ditangani dalam slot existing dengan ellipsis, teks penuh via title.

Editor native /admin/team custom tidak punya Figma node. Pakai token/style
/admin existing: target1440×900, min320; padding32/16, panel24/16, gap8/16/32,
Bluu Next700 title40, Manrope16; bg#050507/surface#16141f/accent#9b7bff,
text white/muted#bcb7cb. Navigasi Projects/Team; semantic labels, focus visible,
status polite, loading/error/conflict preservation, explicit delete confirmation.
Legacy GAS editor Projects tetap tersedia; Team RPC baru terproteksi owner,
editor Team utama native sesuai keputusan user.

## Policy / implementasi berurutan

1. Perluas hanya schema Team: tujuh grup preset, 1–8 anggota masing-masing;
   foto preset atau hash /images/cms/team/*.webp. Semua group harus terisi.
   Nama/peran 1–80 chars (baseline lolos); judul domain tetap preset existing.
   Order integer1–8 unik per grup, editable untuk reorder; ID baru server UUID.
   Candidate akhir valid sebelum write; memindahkan anggota terakhir ditolak.
2. Renderer: baseline persis, jumlah baru menggunakan row scrolling existing;
   leader >2 memakai row scroll left-aligned agar kartu pertama tetap terjangkau.
   Team upload slot fixed, tanpa hotlink. Media path collection-qualified;
   export media hanya referensi Projects/Team aktif, cache hash/decode sebelum
   snapshot atomik, bounded fetch tanpa stale fallback.
3. GAS Team RPC load/add/save/delete: auth setiap request, header/plain-text,
   UUID/collision, revision seluruh rows, lock, satu batch dan trailing blanks,
   formula literal, sanitasi error, dua hooks + retry tanpa ulang mutation.
4. Native API Team memakai session/CSRF/Origin dan whitelist RPC existing;
   media Team scope eksplisit. UI Team native terpisah dengan navigasi konsisten.
5. CMS server/schema/export/media tests, browser Team4widths, Projects native
   dan legacy regression. Fixture Team1/2/5/8 setiap grup di320/390/768/1440:
   card geometry, reachable last card, group/chip switch, decode, long text,
   Growth CTA, no document overflow, View Transition re-init.
6. Baseline tujuh gate + SEO, evidence ignored artifacts/cms-team, generated
   GAS source, docs, commit. Live acceptance terpisah setelah push disetujui:
   owner update versi Export/Admin existing tanpa setup, CRUD/foto/reorder,
   kedua rebuild success dan cleanup. Mock bukan bukti login Google/live.

## Hasil QA lokal / lock

36 CMS tests Node22 PASS (29 existing tetap, 7 Team tambahan). Team browser
320/390/768/1440 PASS: safe text, CRUD, upload/preview, conflict preservation,
dirty confirmation, retry tanpa save ulang, focus/overflow dan expiry. Projects
native/legacy regresi4widths PASS. Fixture1/2/5/8 anggota setiap grup pada
320/390/768/1440: 112 group cases PASS, photo decode302×442, kartu302×400,
reachable first/last, chip/pager/arrow switch, Growth CTA, View Transition.
Snapshot dipulihkan byte-identik, media fixture dihapus, baseline dist dibangun.

Tujuh gate + SEO PASS: build0errors/21HTML (19 existing + dua admin), visual
browserErrors[], navbar, VT, responsive468/468, spacing dan format. OurTeam
1440×1562, leader/HoDS geometry assertion unchanged, MAE2.6235. Preset art/font
reference tetap. Evidence artifacts/cms-team/{tests,build-final,verify,navbar,
vt-retry,responsive,checks,seo}.log, admin-report.json, renderer-report.json,
baseline-team.json + screenshots; source GAS generated artifacts/cms-gas dan
artifacts/cms-admin. Semua ignored, tanpa secret.

Runner awal lazy decode menunggu pada hidden panel; fixture runner sekarang
memuat gambar secara eager dan decode timeout. Percobaan retry sempat collision
build karena runner lama masih memulihkan dist; run final sequential PASS.
VT gate pertama pada QA paralel gagal dengan satu history “Transition was
skipped”; run terpisah PASS/pageerrors none. Tidak mengubah assertion atau
mengabaikan errors untuk mendapatkan PASS. Tidak mengklaim akar masalah
fetch/redirect Google sebelumnya.

Kode belum push, GAS Team belum update, real owner Team CRUD/photo/reorder +
dua rebuild/cleanup belum diuji. Ikuti cms-team-setup.md setelah izin push.
B2 Team live acceptance belum selesai; seluruh CMS belum selesai.
