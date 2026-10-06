# Projects media — Master Work Plan

Status 6 Oct 2026: implementasi + QA PASS; cd37446 push, kedua Vercel SUCCESS.
Update GAS existing, upload/preview/save nyata kedua situs dan cleanup project
sementara “uji cms” PASS; Projects media acceptance selesai.
User memilih menyelesaikan CMS dahulu; login username/password ditunda.
Owner login native + add/delete Projects + kedua rebuild terbukti. Owner melaporkan
akun Google non-owner Incognito ditolak. Pass aktif Projects media.

## Batas pass

Projects saja, 1–8 records, backend Sheet/Drive/Admin/Export existing. Tidak
reseed, membuat folder baru, membuka collection lain atau mengubah auth Google.
Preset gambar existing tetap bisa dipilih. Upload bukan field URL bebas.
Drive tetap privat; situs menerima file lokal hasil validasi/cache saat build.
Jangan menghapus file Drive saat project dihapus: lifecycle media pass tersendiri.

## Referensi dan geometri terkunci

- Home Projects node `1430:2146`, frame 1440×910:
  https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1430-2146
  Kartu existing 549×567, bidang gambar 549×349; pertahankan crop/object-fit,
  rim/glow, posisi arrows/dots dan layout full-screen existing.
- Hall of Frames node `1439:4655`, frame 1440×1014:
  https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1439-4655
  Kartu pusat existing 933px, container-type dan slot coverflow tetap.
- Public typography Bluu Next Bold 700 / Manrope, spacing/padding/gap existing
  sesuai assertion baseline dan SOP piksel. Tidak menambah spacing publik.
- Editor custom tidak punya node/frame Figma. Area input upload memakai tokens
  existing, heading Bluu Next 700, body Manrope, gap 8/16, tombol padding 8/16;
  preview di dalam editor, tanpa overlay yang mengubah geometri situs publik.

## Urutan implementasi setelah acceptance auth

1. Tetapkan kontrak referensi gambar dan limits sebelum kode: file raster
   JPEG/PNG/WebP, tidak SVG/HTML/animasi; byte limit, pixel limit, MIME dan magic
   bytes diverifikasi server. Ukuran upload harus muat Vercel/RPC/base64 bounds.
   Filename/path dari server, tidak memakai filename atau URL bebas dari client.
2. Siapkan normalisasi/cache dengan sharp existing: decode terbatas, orientasi
   EXIF, buang metadata, output WebP, hash konten dan ukuran output terbatas.
   Uji packaging Vercel sebelum menetapkan lokasi normalisasi; penggunaan sharp
   pada Functions harus menghormati aturan dependency/budget repo. Jangan
   menganggap validasi browser cukup atau langsung mengaktifkan upload.
3. GAS Admin: RPC upload khusus dengan auth owner, validasi, batas ukuran dan
   penyimpanan hanya di DRIVE_FOLDER_ID existing. Referensi media tervalidasi
   boleh dipakai save; revision guard dan batch Sheet write tetap. Upload saja
   tidak memicu publication; save project meminta kedua hooks. Error setelah
   write tidak boleh dilaporkan sebagai rollback yang sebenarnya tidak terjadi.
4. GAS Export: jalur read-only bertoken untuk bytes media yang direferensikan
   Projects, folder-bound dan tanpa ID/URL Drive di snapshot publik. Tidak
   menambahkan mutation ke project Export. Deployment existing perlu update
   versi; bukan menjalankan setupCms lagi.
5. Prebuild: fetch metadata/snapshot dan media dengan host/redirect allowlist,
   timeout dan byte limits; normalisasi/verifikasi, cache berdasarkan hash di
   public/images/cms/projects/. Snapshot ditulis atomik setelah semua media siap.
   Gagal fetch/decode berarti build gagal; jangan publish gambar kosong/stale.
6. Native editor: pilih file, preview, status upload dan hasil error, lalu save
   dengan reference server. Session expiry/CSRF/busy/conflict/lost-connection
   semantics tetap. Legacy editor harus tetap bisa membaca record media baru;
   pastikan tidak mematahkan adminReadProjects/validation existing.

## Bukti wajib sebelum publish

- Unit/contract: non-owner/no-session ditolak, CSRF/origin, ukuran/magic/decode,
  traversal/arbitrary folder/file, reference palsu, timeout, respons tersanitasi,
  candidate gagal tidak mengubah Sheet, cache hash dan snapshot atomik.
- Browser native empat widths: file valid/invalid, preview, upload/save,
  pemulihan expiry/conflict, keyboard, pesan saved-vs-build. Legacy compatibility.
- Fixture gambar raster baru di kedua consumer; gambar benar-benar decode,
  crop dalam box existing dan tidak overflow. Baseline preset/reference tetap.
- CMS tests + build + verify + navbar + VT + responsive + spacing + format + SEO.
  Tujuh gate situs sebelum collection berikutnya; bukti ignored artifacts.
- Generate admin/export source, pandu update versi GAS existing, commit lokal;
  konfirmasi sebelum push kedua repo. Owner upload/save nyata, kedua rebuild
  selesai dan gambar tampil pada kedua situs sebelum mengklaim upload live.

Rujukan primer:
[Drive File](https://developers.google.com/apps-script/reference/drive/file),
[Utilities](https://developers.google.com/apps-script/reference/utilities/utilities),
[sharp input limits](https://sharp.pixelplumbing.com/api-input/).

## Hasil implementasi lokal

Kontrak gambar `/images/cms/projects/<sha256>.webp`, tanpa ID/URL Drive di
snapshot. Input JPG/PNG/WebP <=2 MB, max16 MP, tanpa animasi. sharp existing
versi yang sama dipindah ke runtime server (bukan library UI/browser baru):
orientasi, strip metadata, WebP <=256 KiB, max1600×1200 dengan fallback resize
1280×960/960×720. Media tersimpan deterministik di folder existing; upload
tidak memicu hook atau mengubah Sheet. Save menggunakan reference tervalidasi.

Export action media read-only bertoken hanya untuk referensi Projects aktif.
Prebuild memeriksa hash/decode cache dan mengambil media privat bila missing/
corrupt, kemudian menulis snapshot atomik setelah seluruh file siap. Fetch gagal
fail closed. Preview native owner-only melalui API; legacy selector menerima
referensi upload existing. File orphan tidak otomatis dihapus.

29 CMS tests PASS dengan Node22; native+legacy browser empat widths PASS, fixture
media Home/HoF empat widths geometri identik/no overflow. Tujuh gate + SEO PASS,
responsive468/468, 19 HTML publik identik. Bukti artifacts/cms-media/.
Panduan update deployment existing: [setup](cms-projects-media-setup.md).
cd37446 sudah push dengan izin user; kedua Vercel SUCCESS. Actual upload/save/rebuild
owner setelah update GAS PASS; lihat acceptance live di bawah.

Runtime check: build/tests Node22 PASS. Trace fungsi menyertakan sharp native
Linux dan libvips; 92 runtime files ~19.6 MB. Normalisasi berhasil dari salinan
trace yang diisolasi di luar repo, tanpa fallback ke node_modules workspace.
Ini bukan bukti deploy Vercel nyata; kedua deployment harus dicek setelah push.

## Publikasi situs — 6 Oct 2026

cd37446 sinkron pada main/origin/production, kedua Vercel SUCCESS. Testing pertama
gagal pada prebuild Invalid CMS export redirect; production berhasil dan fetch
read-only lokal sesudahnya identik baseline. Rebuild testing lewat hook existing
berhasil; tidak mengubah redirect guard/retry/schema atau memakai stale fallback.
Root cause Google belum terbukti. Route checks: shell/upload control HTTP200
noindex, API media anonymous401, login303 ke Google pada kedua domain.
Bukti artifacts/cms-media/deploy-cd37446.json dan live-routes.json.

## Update GAS oleh owner

Owner mengonfirmasi Code.gs dan versi deployment Export serta Admin existing
diperbarui. Read-only export masih empat Projects identik baseline; action media
baru menolak hash tidak terdaftar dengan UNKNOWN_MEDIA, membuktikan source Export
baru tersedia. Shell upload kedua situs HTTP200 dan API media anonymous401.
Upload Admin/preview/save nyata dan kedua rebuild foto telah diuji di bawah.

## Acceptance upload live — 6 Oct 2026

Owner mengunggah diagram dan menyimpan project sementara “uji cms”. Export
read-only lima Projects, satu referensi hashed WebP 39152 bytes; media cocok
hash dan lolos decode. Full remote prebuild ke ignored artifacts PASS, snapshot
repo tetap baseline. Production SUCCESS 21:25 WIB; testing awal gagal setelah
144 detik dengan “CMS project media fetch or validation failed.” Retrigger hanya
hook testing existing SUCCESS 21:27 WIB. Penyebab awal belum terisolasi; tidak
mengubah source, redirect guard, retry, validasi atau stale policy.

Home dan Hall of Frames kedua domain HTTP200 menampilkan project serta gambar;
file publik cocok hash/decode. Browser nyata 390/1440 kedua domain: kartu upload
aktif, gambar decode, tanpa overflow atau browser errors. Bukti ignored
artifacts/cms-media/owner-upload-{export,live}.json, live-media-prebuild-proof.json,
owner-upload-browser-{testing,production}.json dan screenshot.

Cleanup selesai: owner menghapus “uji cms”; export empat Projects persis baseline
dan tanpa referensi upload. Testing SUCCESS 21:37 WIB; production SUCCESS 21:38 WIB.
Home/HoF kedua domain HTTP200: judul/gambar uji hilang, empat judul awal tampil.
Bukti artifacts/cms-media/owner-media-delete-{export,deployments,live}.json.
File Drive tidak otomatis dihapus. NEXT: Team, satu collection/pass + 7 gate + SEO;
login username/password tetap ditunda sesuai pilihan user.
