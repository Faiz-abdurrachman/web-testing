# Projects upload — update existing deployments

Status: cd37446 sudah push; GAS Export/Admin existing diperbarui owner.
Upload, preview dan save nyata project sementara “uji cms” berhasil. Production
SUCCESS 21:25 WIB; testing retry SUCCESS 21:27 WIB setelah kegagalan fetch/validasi
media awal yang penyebabnya belum terisolasi. Home/HoF kedua domain menampilkan
gambar; hash/decode valid dan browser 390/1440 tanpa overflow/errors.
Cleanup langkah 3 selesai: owner menghapus “uji cms”; export kembali empat
Projects persis baseline. Testing SUCCESS 21:37 WIB, production SUCCESS 21:38 WIB;
Home/HoF kedua domain HTTP200 tanpa project/gambar uji, empat judul awal tetap.
Bukti artifacts/cms-media/owner-media-delete-{export,deployments,live}.json.
NEXT: Team, satu collection/pass. Langkah update di bawah adalah rujukan historis;
tidak perlu setup/deployment/env baru.

Login Google tetap digunakan; login username/password ditunda sesuai pilihan user.

## File siap ditempel

Generate dengan `npm run cms:gas` dan `npm run cms:admin`. File tanpa secrets:

- Export: `artifacts/cms-gas/Code.gs`.
- Admin: `artifacts/cms-admin/Code.gs`.

Buka [Apps Script](https://script.google.com/home). Gunakan dua project CMS
EXISTING yang sudah terpasang. Jangan buat project, folder atau spreadsheet baru.

1. **CMS Export existing:** buka Code.gs, ganti seluruh isi dengan file Export
   di atas, lalu Save. Jangan Run setupCms atau installer lain.
2. Deploy → Manage deployments → pilih deployment web app Export existing →
   Edit/pensil → Version: New version → Deploy. URL /exec yang dipakai Vercel
   harus tetap; token dan Script Properties tidak diganti.
3. **CMS Admin existing:** buka Code.gs, ganti seluruh isi dengan file Admin
   di atas, lalu Save. Index.html dan manifest tidak berubah dalam pass ini.
   Jangan Run setupAdmin; akun, hooks, Sheet/folder Properties tetap.
4. Deploy → Manage deployments → pilih API executable existing yang digunakan
   native /admin → Edit/pensil → Version: New version → Deploy. Deployment ID
   tetap dan akses Only myself. Kalau fallback web app GAS masih dipakai,
   update version deployment web app existing itu juga untuk backend media baru.
5. Situs dipush hanya setelah user mengizinkan. Tunggu kedua Vercel SUCCESS;
   lima env admin, CMS_API_URL/TOKEN dan SITE_URL tetap. Save env tidak diperlukan
   karena endpoint/deployment ID existing tidak diganti.

## Acceptance manual setelah deploy

Buka [admin production](https://data-sorcerers-community-sigma.vercel.app/admin/)
atau [admin testing](https://web-testing-azure.vercel.app/admin/), login owner.

1. Tambah project sementara, pilih file JPG/PNG/WebP <=2 MB. Preview harus muncul;
   pesan gambar siap berarti upload tersimpan, bukan project sudah diterbitkan.
2. Isi judul/deskripsi/dua kategori, lalu Simpan dan terbitkan. Tunggu kedua
   deployment baru SUCCESS. Pastikan gambar tampil di Home dan Hall of Frames
   pada kedua situs, termasuk ukuran mobile; tidak memakai hotlink Drive.
3. Hapus hanya project sementara; tunggu kedua rebuild. Empat Projects baseline
   harus tetap. File Drive tidak otomatis dihapus: lifecycle media pass berikutnya.
4. File SVG/HTML/animasi, oversized/corrupt atau sesi habis harus ditolak dengan
   pesan yang jelas. Save dengan reference media palsu tidak boleh mengubah Sheet.

Upload live dan cleanup project sementara terbukti. Bukti mock untuk
penolakan file/kontrak tetap QA lokal, bukan uji owner semua skenario negatif.
