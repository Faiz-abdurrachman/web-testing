# NEXT — Projects Growth (tambah/hapus)

Status: BELUM DIMULAI. User meminta pekerjaan ini dikerjakan di sesi AI baru.
Sesi penutup hanya menyinkronkan dokumen. Baca `docs/cms-sop.md` dahulu.

## 0. Fakta awal dan batas pass

B0 enam collections selesai. B1 GAS export + Vercel aktif. Admin owner bisa
memuat dan mengedit empat Projects; unchanged-content save + dua hook diterima.
Build sempat gagal pada redirect Google; client repair `96a9756` sekarang
berstatus deployment success pada kedua repo. 14 CMS tests + 7 gate + SEO PASS.
Full CMS belum selesai: add/delete, upload, Team, roles, HoDS, partners, prestasi,
settings dan hardening masih berikutnya.

Pass ini hanya Projects add/delete. Media upload dan collection lain dikerjakan
setelah pass ini hijau. Jangan mengganti backend, reseed Sheet atau meminta ulang
setup B0. Konfigurasi live sudah dibuat.

## 1. Inventaris dependency sebelum kode

| File / area                                   | Keadaan / pekerjaan                                                                                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| src/data/cms-schema.mjs                       | Projects masih `.length(4)`; guard collection lain tetap                                                                 |
| src/data/cms-snapshot.json                    | Baseline empat Projects, tetap fixture utama                                                                             |
| src/data/projects.ts                          | Thin loader/interface existing, import komponen tetap                                                                    |
| src/components/Projects.astro                 | Map carousel/dots memakai array; uji 1/2/5 dan banyak item, jangan anggap semua count otomatis aman                      |
| cms/gas/export.js                             | Projects diekspor dari rows tanpa fixed count; uji roundtrip count baru, jangan menambahkan mutation                     |
| cms/gas/admin/server.js                       | `adminReadProjects_` masih lastRow 5/range 4; save hanya ID existing; perlu read/add/delete/revision/batch write dinamis |
| cms/gas/admin/Index.html                      | Hanya list + edit + retry; add/delete belum ada                                                                          |
| scripts/generate-gas-admin.mjs                | Image preset existing digenerate dari snapshot; jangan memasukkan secret                                                 |
| scripts/verify-cms-admin.mjs                  | Mock/browser test masih 4 Projects; tambah cases tanpa menghilangkan baseline                                            |
| tests/cms-admin.test.mjs / tests/cms.test.mjs | Auth/save/retry/export tests; perlu add/delete/conflict/preservation fixtures                                            |
| scripts/verify.mjs                            | Assertion baseline/geometri tetap; uji count tambahan di fixture terpisah                                                |

Inventaris semua consumer Projects dengan `rg` sebelum mengubah kontrak. Tulis
substep dan file yang akan disentuh; satu collection per pass.

## 2. Master Work Plan — presisi

Public Projects: Figma node **1430:2146**, Homepage **1430:2040**,
https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=1430-2146
Reference `assets/assets home page/our project/Home-Project-Revisi-1x.png` dan
2×; frame 1440 × 910. Padding desktop 80, header gap 8, header→stage 82 adalah
exception terukur existing. Kartu active 549 × 567, image 549 × 349; Bluu Next
700 heading 56/67, Manrope copy. Lihat angka terperinci `docs/assets.md`.
Gunakan render/site assertions terbaru untuk centering fullscreen/responsif;
angka posisi absolut dari arsip tidak mengalahkan benchmark current.

Admin custom tidak punya Figma node/PNG. Pertahankan palette/typography/tokens
foundation dan layout 1440 × 900; mobile minimum 320. Spacing 8/16/24/32; font
Bluu Next 700 + Manrope. Tambahkan kontrol Tambah project dan Hapus project
secara konsisten, semantic labels, focus terlihat, loading, hasil error jelas.
Tidak ada kontrol CSS/ukuran/tint atau draft/preview. Gambar masih preset existing
sampai pass media siap. Jangan memasang field URL bebas/hotlink Drive sekarang.

## 3. Langkah implementasi / keputusan rutin

1. Simpan baseline original sebelum fixture. Pertahankan stable IDs dan two tags.
2. Tentukan empty behavior sebelum delete terakhir. Minimum satu Project adalah
   opsi kompatibel renderer saat ini; jangan membiarkan UI kosong/rusak. Jika
   mengizinkan nol, empty state harus direncanakan dan diverifikasi terpisah.
3. Pilih batas praktis berdasarkan payload/UI/Sheet, dokumentasikan dan uji batas;
   jangan menganggap count bebas tak terbatas atau melemahkan schema global.
4. Siapkan schema Projects dan renderer untuk count baru. Uji layout sebelum
   membuka add/delete ke editor. Guard roles/team/HoDS/partners tetap.
5. Server generate ID unik; jangan memakai judul sebagai ID mutable. Add/delete
   memeriksa auth, input, expected revision, collision/not-found/minimum.
6. Batch write seluruh Projects, termasuk blanking baris lama dalam batch yang
   sama setelah delete. Export harus mengabaikan blank rows; admin read dinamis
   harus kompatibel. Jangan `clear` terpisah lalu `setValues` yang bisa terlihat
   parsial oleh project Export; script locks tidak shared lintas project GAS.
7. Hanya validasi final candidate sebelum write. Preserve records/order/content
   yang tidak diubah dan formula-safe cells. Konflik/invalid gagal tanpa write
   dan tanpa hook. Tidak boleh mengulang mutation karena retry publikasi.
8. UI tambah/hapus hanya aktif setelah server/renderer siap. Delete dengan aksi
   eksplisit; status membedakan saved / rebuild requested / build completed.
9. Jalankan baseline gates dan fixtures. Commit/push sesuai otorisasi; generate
   admin files; owner update GAS code/HTML dan deploy versi baru tanpa setup ulang.
   Export GAS hanya diupdate jika sourcenya benar-benar berubah.

## 4. Acceptance / lock

- Baseline card/section geometry tetap ±1px, reduced-motion, font/artwork/spacing.
- Fixture 1, 2, 5 dan stress/batas: centering, dots, arrows, keyboard/wraparound,
  mobile active card height, clipping/overflow di 320/390/768/1050/1440.
- Tinjau apakah dots banyak butuh scroll/pagination; jangan merusak state aktif
  atau menutupi arrows. Hindari mengubah baseline hanya untuk count baru.
- Auth anonymous/non-owner ditolak pada setiap RPC; unknown fields/IDs ditolak;
  revision conflict; delete minimum; empty trailing Sheet rows; stable ordering;
  duplicate IDs; formula literals; atomic candidate; partial hook failure/retry.
- 14 tests lama tidak dihapus untuk membuat feature lolos; tambahkan kasus growth.
  Browser mock bukan bukti login real. Jalankan 7 gate + SEO + admin spacing/UI.
- Verifikasi real owner add/delete dan kedua rebuild setelah owner-approved test
  content. Revert test record secara normal jika diminta; jangan reset Sheet.
- Update state, provenance/SOP jika aturan berubah, plan results dan installer
  instructions. Jangan mark growth complete hanya karena mock tests hijau.

## 5. Setelah Projects Growth hijau

1. Projects media upload + cache/bake Drive (tanpa mengubah artwork presisi).
2. Team/orang CRUD + photo renderer dan group/card preset lokal.
3. Roles, partners, HoDS/domains, Featured/prestasi, milestone/settings: satu
   collection/langkah per pass, schema/renderer sebelum CRUD.
4. Hardening: backup/restore, media lifecycle, validation, publication feedback.

Verifikasi tertunda lintas sesi: deny akun Google non-owner yang benar-benar
login (anonymous sudah redirect login), real edit konten berbeda dari baseline,
dan capture log remote-mode testing jika diperlukan. Jangan mengulang login
owner/setup awal untuk tugas growth yang sudah mempunyai konfigurasi.
