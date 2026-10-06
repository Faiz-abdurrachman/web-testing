# Native /admin — konfigurasi dan acceptance

Kode native Projects 824e333 sudah push dengan izin user; kedua Vercel SUCCESS.
Shell /admin dan routing API terverifikasi; login Google belum aktif.
User memilih admin penuh di situs. Semua perubahan konten tetap memakai GAS
Admin EXISTING, Sheet/Drive/Properties/rebuild hooks existing. Jangan reseed atau
membuat ulang CMS Export, Sheet/folder, atau project GAS Admin.

## Konfigurasi owner setelah kode ditinjau

1. Di Google Cloud, siapkan standard Cloud project untuk OAuth client web dan
   Apps Script API. Hubungkan project Cloud yang sama ke GAS Admin existing
   melalui Project Settings → GCP project number. Jika sudah standard, gunakan
   project itu. Enable Google Apps Script API dan Google Drive API. Perubahan
   Cloud project meminta otorisasi ulang GAS; periksa editor lama sesudahnya.
   Toggle API pada Apps Script user settings tidak diperlukan untuk scripts.run;
   toggle itu mengizinkan pengelolaan source/deployments melalui API, yang tidak
   digunakan native admin.
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
Packaging/routing Functions live sudah terbukti (shell 200, API 503 CONFIGURATION).
Deployment API executable, consent dan identity harus diverifikasi sesudah
konfigurasi owner dan redeploy. Tanpa env lengkap API fail closed.

Referensi: [GAS execution](https://developers.google.com/apps-script/api/how-tos/execute),
[REST scripts.run](https://developers.google.com/apps-script/api/reference/rest/v1/scripts/run),
[OAuth web server](https://developers.google.com/identity/protocols/oauth2/web-server),
[Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js).

## Progress konfigurasi owner — 6 Oct 2026

Owner melaporkan standard Cloud project dibuat; Apps Script API dan Drive API
aktif; consent External/Testing, satu owner test user, empat manifest scopes,
OAuth web client dengan dua callback, lalu Cloud project terhubung ke GAS Admin.
Secret yang sempat terlihat pada screenshot sudah diganti dan secret lama
Disabled menurut owner; nilainya tidak disimpan di repo. Client/secret baru
harus disimpan privat dan dipakai saat konfigurasi Vercel.

Owner menjalankan adminLoadProjects setelah pergantian Cloud, membuat API
executable Only myself pada GAS Admin existing, mengisi lima env server pada
kedua Vercel dan redeploy. File env privat di artifacts/cms-native/ memiliki
permissions 0600 dan git-ignored; nilai tidak dicetak atau disimpan dalam source.
CMS_ADMIN_ORIGIN testing sempat tidak cocok (403); pemeriksaan terbaru kedua
login route HTTP 303 ke Google, tanpa membocorkan URL OAuth/query/cookie.

Acceptance owner nyata: screenshot menunjukkan editor native dan Projects dimuat.
Owner menambah project sementara “Uji CMS”; save meminta kedua hook dan project
muncul pada HTML publik testing/production setelah rebuild. Owner menghapusnya;
kedua deployment SUCCESS, judul uji hilang dan empat judul baseline tetap tampil
di kedua situs. Bukti sanitized read-only:
artifacts/cms-native/owner-delete-live.json.

Owner melaporkan akun non-owner ditolak pada uji Incognito di production.
Tahap penolakan Google/platform atau GAS tidak dirinci; ini bukti akses editor
terblokir, bukan pembuktian terisolasi tiap layer auth. NEXT: Projects media.
Login owner secara terpisah
pada kedua domain, logout/relogin nyata dan konflik dua sesi nyata belum dibuktikan;
coverage mock lokal bukan bukti acceptance Google tersebut. Media/cache cd37446 sudah push, kedua Vercel SUCCESS; GAS updated, owner upload/preview/save kedua situs PASS; cleanup “uji cms” pending;
collection lain menunggu. Seluruh CMS belum selesai.

Rujukan untuk toggle user settings:
[Google API access](https://developers.google.com/apps-script/api/how-tos/enable)
menyatakan eksekusi fungsi tidak membutuhkan granting access to script projects.
