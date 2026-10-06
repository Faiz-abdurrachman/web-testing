# CMS kickoff — prompt siap tempel untuk AI baru

## Checkpoint terbaru — native /admin, 6 Oct 2026

User memilih **admin penuh di website**; pass aktif Projects/auth:
[plan](cms-native-admin-plan.md), [setup/acceptance](cms-native-admin-setup.md).
Kode native /admin + Vercel OAuth/API tersedia lokal, belum push/live.
QA: 24 CMS tests, native + legacy admin browser empat widths, 7 gate + SEO PASS;
responsive 468/468, 19 HTML publik identik baseline. Auth Google nyata masih pending.
GAS Admin Growth sudah diperbarui menurut owner; export read-only setelahnya
empat Projects tetap baseline. Deployment situs Growth 1fb25ae dan checkpoint
198586b SUCCESS pada kedua repo (testing checkpoint diretrigger berhasil).
Owner add/delete nyata, akun non-owner dan kedua rebuild perubahan isi belum diuji.

NEXT: selesaikan QA/commit native, konfirmasi sebelum push; konfigurasi OAuth web

- standard Cloud/API executable pada GAS Admin EXISTING dan env server kedua
  Vercel, lalu acceptance owner/non-owner + CRUD/rebuild. Tidak reseed atau ulang
  Sheet/folder/onboarding. Public Astro tetap static; browser hanya shell/login,
  records melalui API owner, cookie HttpOnly terenkripsi + state/PKCE + CSRF.
  Backend tetap Sheets/Drive/Properties/hook existing. Tidak memperluas collection.
  Media/cache → Team → B3/B4 menunggu. Catatan historis di bawah tidak mengalahkan
  checkpoint ini. Persetujuan push sebelumnya hanya untuk Growth; native perlu
  konfirmasi baru. Jangan menyebut native Google auth sudah live atau seluruh CMS selesai.

Checkpoint 6 Oct 2026: B0/B1 selesai, B2 editor Projects existing sudah terpasang.
Projects Growth implementasi + QA lokal PASS (17 tests, 40 fixtures, admin browser,
7 gate + SEO, responsive 468/468). Feature 1fb25ae sudah push, kedua Vercel SUCCESS. NEXT update GAS + uji owner live. Copy blok berikut ke sesi baru.

```text
Lanjut di repo /home/faiz/ds/ds5opencode — Data Sorcerers, Astro static + Vercel.
Orientasi dulu; baca URUT tanpa skip:
1. docs/kickoff-prompt.md
2. AGENTS.md
3. docs/pixel-precision-sop.md
4. docs/ai-handoff.md
5. docs/cms-plan.md
6. docs/cms-sop.md
7. docs/cms-b2-plan.md
8. docs/cms-projects-growth-plan.md
Lalu HANDOVER.md, docs/assets.md dan source terkait.

git status dulu. Bila ada perubahan asing/belum commit, tanyakan user sebelum
mengubahnya. Ringkas status nyata dan NEXT, kemudian lanjut pekerjaan yang sudah
diizinkan. Jangan ulang minta pilihan backend, akun, folder, hook atau izin B0.
User telah memilih GAS + Sheets + Drive, build-time fetch + dua Vercel hook,
HtmlService admin, satu owner/admin dahulu, save = live tanpa draft/preview.

B0: enam snapshot loader + Zod selesai, 19 HTML baseline identik.
B1: export GAS read-only bertoken terpasang, Sheet/folder tersedia, Vercel env
kedua project tersedia. B2: admin GAS TERPISAH privat sudah terpasang dengan
execute as Me + Only myself; empat Projects dimuat; edit existing, revision
check, dua hook dan retry publication tersedia. User melakukan save tanpa ubah
isi. Anonymous access diarahkan login. Akun non-owner yang sudah login belum diuji.

Build hooks sempat gagal 404 setelah redirect Google. Fix fetch 96a9756 sudah
push; status Vercel TESTING dan PRODUCTION SUCCESS. 14 CMS tests + 7 gate + SEO
PASS, responsive 468/468. Penyebab Google/cache belum terbukti; jangan klaim pasti.
Testing remote-mode literal log belum disalin, jangan menganggap env/setup gagal.
Detail fetch: IPv4-first, nonce/no-cache, 60s per attempt, maksimal dua attempt
bersama untuk timeout atau 404 pada redirect googleusercontent. Tidak fallback
stale bila remote gagal. Secret ada di Properties/env privat; jangan dicetak.

TUGAS: tuntaskan verifikasi/publikasi B2 PROJECTS GROWTH, SATU collection/pass.
Ikuti hasil terbaru docs/cms-projects-growth-plan.md. Kode lokal Growth tersedia:
1–8 Projects, UUID server, revision guard, satu batch write + blank trailing rows.
Jangan ulang implementasi yang sudah hijau; pandu update GAS Admin existing lalu
uji owner add/delete dan kedua rebuild. Belum ada bukti Growth live.
Pastikan stable ID, revision guard, validasi candidate sebelum batch Sheet write,
minimum/empty policy yang jelas dan render 1/2/5+ project aman. Ubah hanya guard
jumlah Projects setelah renderer diuji. Pertahankan fixture baseline dan semua
assertion geometri; tambahkan fixture jumlah baru terpisah. Image masih preset
existing, upload/cache gambar adalah pass setelah Growth.

Template kartu konsisten. Jangan ekspos rows/coordinates domains, centered/tight
roles, team.chip/fade, CSS/font/gradient atau artwork geometry ke CMS. Untuk HoDS
baru nanti gunakan desain/artwork preset terdaftar; bukan merakit artwork via form.
Spacing 8pt, heading Bluu Next Bold 700, body Manrope, geometri ±1px, reduce exact.
Jangan rusak Home 1430:2040 dan Recruitment 1436:3505. Contact hero tetap 954.
Admin custom tidak punya Figma node; jangan mengarang referensi.

Setiap pass: tests CMS + browser admin + 7 gate site + seo:audit. Gunakan static
preview untuk verify; jangan bergantung runner /tmp sesi lama. Ikuti cms-sop.md.
Setelah hijau, generate npm run cms:admin; pandu owner update kode/HTML DAN versi
deployment di project admin EXISTING. Jangan buat ulang Sheet/folder/reseed.
Login browser tool tidak sama dengan akun Google user. Pandu langkah manual.
Save berarti tersimpan/rebuild diminta; pastikan kedua rebuild selesai sebelum
mengklaim live. Uji owner add/delete serta akun Google non-owner sungguhan.

Update AGENTS.md, ai-handoff, assets, CMS plan/Growth plan/setup guide sesuai hasil.
Commit per fitur. User mengizinkan pengerjaan/commit; konfirmasi sebelum push. Baca izin
sesi sebelum push; git push origin main mengirim ke testing + production.
Jangan taruh token, email admin, folder/Sheet ID, admin URL atau hook di repo.
Setelah Growth: Projects media upload/cache, lalu Team; B3 satu collection/pass;
B4 hardening. Jangan menyebut seluruh CMS selesai hanya karena Projects selesai.
```
