# Pemasangan GAS B1

Kode B1 tersedia; pemasangan pada akun Google dan Vercel belum selesai. Akun
owner/admin yang sudah dipilih digunakan saat login, tanpa memasukkan email atau
secret ke repo. Browser automation sesi ini belum login Google.

## 1. Login dan buat project

1. Buka [Google Apps Script](https://script.google.com/home), klik **Sign in /
   Masuk**, pilih akun admin, dan selesaikan login di halaman Google.
2. Pada dashboard, klik **New project / Project baru**.
3. Ubah nama project menjadi **Data Sorcerers CMS Export**.

## 2. Pasang installer

Di repo, jalankan `npm run cms:gas`. Hasilnya ada di
`artifacts/cms-gas/Code.gs` dan `artifacts/cms-gas/appsscript.json`, tanpa secret.

1. Di editor GAS, buka **Code.gs**, ganti isinya dengan installer yang dihasilkan,
   lalu Save.
2. Buka **Project Settings**, aktifkan **Show appsscript.json manifest file in
   editor**. Kembali ke editor dan ganti manifest dengan file yang dihasilkan.
3. Pilih fungsi **setupCms**, klik **Run**, lalu tinjau dan setujui izin Google
   pada akun owner. Installer membuat Sheet beserta delapan collection tabs,
   mengisi data baseline, dan membuat folder media privat. Setup ulang tidak
   menimpa isi yang sudah ada.
4. Buka **Project Settings → Script Properties**. Installer menyimpan
   `SPREADSHEET_ID`, `DRIVE_FOLDER_ID`, `OWNER_EMAIL`, `ADMIN_EMAILS`,
   `EXPORT_TOKEN`, dan `CMS_SCHEMA_VERSION`. Simpan token di konfigurasi Vercel
   atau `.env.local` yang diabaikan git; jangan menyalinnya ke docs/chat.

Milestones/settings baru berupa tab cadangan. Snapshot export B1 berisi enam
collection existing; konten tambahan dan dukungan jumlah dinamis masuk B2/B3.

## 3. Deploy endpoint export

Klik **Deploy → New deployment → Web app**:

- **Execute as:** Me (owner).
- **Who has access:** Anyone, agar Vercel bisa fetch tanpa login Google.
- Klik **Deploy** dan salin URL yang berakhiran `/exec`.

Project ini khusus read API. Token wajib untuk export/list. `doPost` dan aksi
save/delete ditolak. Project dashboard B2 terpisah dan memakai akses Google
terbatas plus otorisasi server. Jangan mengubah project export menjadi admin.

GAS ContentService melakukan redirect ke `script.googleusercontent.com`; build
client hanya mengikuti redirect Google yang diizinkan. Login HTML, token salah,
payload invalid, timeout atau response >1 MiB menggagalkan build dan menjaga
snapshot sebelumnya. Acuan:
[deployment GAS](https://developers.google.com/apps-script/guides/web),
[Script Properties](https://developers.google.com/apps-script/guides/properties).

## 4. Konfigurasi dan verifikasi Vercel

Pada **kedua project**, buka **Settings → Environment Variables** dan tambah:

- `CMS_API_URL`: URL `/exec` endpoint export.
- `CMS_API_TOKEN`: nilai `EXPORT_TOKEN` dari Script Properties.

Gunakan environment yang sesuai dengan deployment branch `main` kedua project.
Jangan hanya mengatur environment bernama Preview bila branch main dideploy
sebagai Production. Jalankan rebuild dan periksa log `[cms] Snapshot validated
(remote mode).` Bandingkan hasil real export dengan baseline dan lakukan audit
kedua deployment. B1 live belum selesai sebelum pemeriksaan ini lulus.

Untuk validasi lokal sementara, simpan kedua env dalam `.env.local` yang
diabaikan git, lalu jalankan `node --env-file=.env.local scripts/fetch-cms.mjs`.
`npm run build` tidak otomatis membaca `.env.local` ke proses prebuild. Jangan
menempel token ke argumen shell atau log. Mode tanpa env selalu offline dan
deterministik.

## 5. Deploy Hook (B2)

Deploy Hook adalah URL pemicu build ulang setelah admin menyimpan konten. Pada
masing-masing project Vercel, buka **Settings → Git → Deploy Hooks**, buat hook
untuk branch **main**, lalu simpan kedua URL di Script Properties project admin
B2. URL situs publik tidak dipakai sebagai hook. Hook baru digunakan saat alur
Save admin B2 siap.

Acuan: [Vercel Deploy Hooks](https://vercel.com/docs/deploy-hooks).
