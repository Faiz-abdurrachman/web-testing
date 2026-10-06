# Native /admin — konfigurasi dan acceptance

Kode native Projects tersedia lokal; belum push dan belum live Google login.
User memilih admin penuh di situs. Semua perubahan konten tetap memakai GAS
Admin EXISTING, Sheet/Drive/Properties/rebuild hooks existing. Jangan reseed atau
membuat ulang CMS Export, Sheet/folder, atau project GAS Admin.

## Konfigurasi owner setelah kode ditinjau

1. Di Google Cloud, siapkan standard Cloud project untuk OAuth client web dan
   Apps Script API. Hubungkan project Cloud yang sama ke GAS Admin existing
   melalui Project Settings → GCP project number. Jika sudah standard, gunakan
   project itu. Enable Google Apps Script API; owner aktifkan akses Apps Script
   API di Apps Script user settings. Perubahan Cloud project dapat meminta
   otorisasi ulang GAS; periksa editor lama sesudahnya.
2. Konfigurasi OAuth consent untuk owner. Jika external + Testing, hanya owner
   menjadi test user. OAuth membutuhkan seluruh scopes manifest GAS Admin:
   spreadsheets, drive, userinfo.email, script.external_request. Ini scopes
   script existing, bukan akses baru CMS Export. Scope Drive/Sheets dapat
   menampilkan consent aplikasi belum diverifikasi selama testing.
3. Buat OAuth client tipe Web application pada project yang sama. Redirect URI
   tepat untuk masing-masing domain yang benar-benar dipakai:
   `https://<domain-situs>/api/admin/auth/callback`. Jangan pakai URL GAS /exec
   atau wildcard. Testing dan production harus terdaftar. Preview deployment
   acak tidak didukung. Simpan Client ID/secret privat.
4. Pada GAS Admin existing, Deploy → New deployment → API executable, akses
   **Only myself**. Ini tambahan deployment type pada project yang sama,
   bukan mengganti web app privat existing. Gunakan versi Growth terbaru;
   Functions adminLoadProjects/adminSaveProject/adminAddProject/
   adminDeleteProject/adminRetryPublication sudah tersedia.
   Simpan ID API executable deployment secara privat. Jangan gunakan ID CMS
   Export atau URL /exec. Client menggunakan endpoint REST dengan deploymentId
   sesuai referensi Google saat ini; verifikasi panggilan nyata pada acceptance.
5. Set env server pada KEDUA project Vercel, tanpa prefix PUBLIC_:

   | Env                            | Isi privat                                                               |
   | ------------------------------ | ------------------------------------------------------------------------ |
   | CMS_ADMIN_ORIGIN               | Origin tepat situs itu, tanpa trailing slash; berbeda testing/production |
   | CMS_ADMIN_GOOGLE_CLIENT_ID     | Client ID OAuth web                                                      |
   | CMS_ADMIN_GOOGLE_CLIENT_SECRET | Client secret OAuth web                                                  |
   | CMS_ADMIN_API_DEPLOYMENT_ID    | ID API executable GAS Admin                                              |
   | CMS_ADMIN_SESSION_SECRET       | Base64 32 byte acak; buat berbeda untuk tiap project                     |

   Generate secret di terminal owner: `openssl rand -base64 32`; simpan langsung
   ke env privat, jangan kirim nilainya di chat/log/docs. Semua CMS_API_* dan
   SITE_URL existing tetap. Env baru memerlukan redeploy kedua situs.

6. Konfirmasi user sebelum push; satu `git push origin main` men-deploy kedua
   repo. Pastikan kedua deployment SUCCESS. Jangan mencetak token/client
   secret/owner email/admin identifiers dalam bukti.

## Acceptance live yang wajib

- Anonymous /admin hanya shell/login; GET API unauthorized, tidak ada records.
- Owner login Google kembali ke /admin dan dapat membaca empat Projects.
  Callback memanggil adminLoadProjects sebelum menerbitkan cookie sesi.
  GAS memeriksa active/effective user + Properties allowlist pada setiap RPC.
- Akun Google non-owner ditolak; jangan melonggarkan auth untuk mengatasi error.
- Uji save, add project temporer, delete project temporer; revision conflict
  dari dua tab; minimum satu / maksimum delapan; retry publication saat perlu.
  Pastikan isi export dan kedua rebuild selesai untuk perubahan nyata.
- Logout menghapus cookie browser; sesi kedaluwarsa maksimal satu jam kemudian
  perlu login lagi. Tidak ada refresh token/penyimpanan token di localStorage.
  Cookie sesi stateless: logout tidak mencabut salinan cookie yang sebelumnya
  dicuri; berlaku sampai token kedaluwarsa. Rotasi SESSION_SECRET mencabut
  seluruh sesi situs itu jika perlu.
- Koneksi terputus saat mutation: muat ulang untuk memeriksa hasil, jangan
  mengulang otomatis karena operasi mungkin sudah tersimpan. Google/Vercel
  timeout tidak membuktikan mutation batal.
- /admin noindex, sitemap tetap 18 public routes; public 19 HTML baseline sama.

## Lokal dan batas bukti

`npm run build` menghasilkan shell /admin statis; `npm run dev` tidak menjalankan
Vercel Functions. `npm run test:cms` menguji handler OAuth/API dengan upstream
mock; `npm run verify:cms-native-admin` menguji dist editor + mock HTTP empat
widths. Keduanya tidak membuktikan auth Google sebenarnya atau packaging Vercel.
Deployment API executable, consent, identity dan packaging harus diverifikasi
sesudah konfigurasi owner dan push. Tanpa env lengkap API fail closed.

Referensi: [GAS execution](https://developers.google.com/apps-script/api/how-tos/execute),
[REST scripts.run](https://developers.google.com/apps-script/api/reference/rest/v1/scripts/run),
[OAuth web server](https://developers.google.com/identity/protocols/oauth2/web-server),
[Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js).
