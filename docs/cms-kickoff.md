# CMS kickoff — prompt siap tempel untuk AI baru

## Routing aktif CMS — auth planning untuk AI baru

Untuk CMS gunakan [kickoff migrasi](cms-migration-kickoff.md) **seluruhnya termasuk
prompt §6**, lalu urutan baca auth Master Work Plan. Runtime925d577 Partners
accepted; detailed auth plan **PLAN ONLY**, eksekusi di AI baru, keputusan provider/
deps/owner/session pending. Flow/setup NEXT historis di bawah bukan work order CMS.
GAS export tetap dependency; push baru termasuk docs perlu konfirmasi.

## Work order aktif — CMS pass 5 Hods (plan only)

Kode live **`6b36519`**: Projects/Team/Roles/Domains Supabase. Kedua Vercel
READY dan Domains A–E/dua-site acceptance selesai. Hods/Partners masih GAS.
Checkpoint live **`df31ab0`** + planning terbaru commit lokal belum dipush.
Baca urut [kickoff migrasi](cms-migration-kickoff.md) → AGENTS.md →
[ai-handoff](ai-handoff.md) → [Hods Master Work Plan](cms-pass5-hods-plan.md)
→ [TODO](cms-migration-todo.md) → [master migration plan](cms-supabase-migration-plan.md)
→ [CMS SOP](cms-sop.md). Prompt lengkap AI baru: kickoff migrasi §6.

Hods plan rinci siap **PLAN ONLY**, belum SQL/kode/apply/deploy. Scope 6 fixed
IDs/21 tabs/55 sections/8 bullet items, read-only anon RPC + private SQL/RLS,
hybrid snapshot, real PG/Unicode/security/atomic failure + all-tab browser,
7 gate + SEO, docs/commit. UI/geometri/Zod/assertions/hodDesign/auth tetap.
Jangan reseed Team/hapus GAS/tab/env; full test:cms tanpa env server karena
Team dapat mutation live. Izin push Domains consumed; konfirmasi push baru.
Isi NEXT/setup/flow historis di bawah **arsip**, bukan instruksi aktif Hods.

## B2 Team — pass lokal 6 Oct 2026

Master Work Plan: [Team plan](cms-team-plan.md); update/acceptance:
[Team setup](cms-team-setup.md). Team native `/admin/team/` dan owner RPC
CRUD/foto memakai GAS/Sheet/Drive/hooks EXISTING. Grup preset, chip/fade, frame,
Growth Join Now dan geometri baseline tetap lokal. Policy1–8 anggota/grup,
UUID server, revision guard seluruh Team, posisi sisip, batch+trailing blanks.
Foto hash/cache namespace Team, tanpa hotlink atau stale fallback.

Implementasi/QA lokal PASS: 36 CMS tests Node22, Team admin4widths, 112 group
fixtures, regresi native/legacy Projects4widths, tujuh gate + SEO (responsive
468/468). Team baseline1440×1562/card302×400, MAE2.624; snapshot byte-identik,
assertion geometri tetap. Feature 2a22d8a sudah push dengan izin user ke kedua
repo, main/origin/main/production/main sinkron. Vercel testing SUCCESS22:04:31 WIB
dan production SUCCESS22:05:50 WIB. Belum update GAS Team,
belum real owner Team acceptance. Projects Growth/media live + cleanup selesai.
Username/password ditunda, seluruh CMS belum selesai. NEXT: owner update versi Export/Admin existing tanpa setup/reseed,
uji Team nyata dan dua rebuild/cleanup; B3/B4 sesudah acceptance Team.

## Checkpoint Projects live — sebelum pass Team, 6 Oct 2026

User memilih **admin penuh di website**; pass aktif Projects/auth:
[plan](cms-native-admin-plan.md), [setup/acceptance](cms-native-admin-setup.md).
Kode native /admin + Vercel OAuth/API sudah push pada 824e333 dengan izin user;
dokumentasi deploy 47987c6. Standard Cloud/OAuth/API executable existing dan lima
env server kedua Vercel sudah dikonfigurasi owner. Login native owner dan pemuatan
Projects terbukti melalui screenshot editor dan mutation nyata.

Owner menambah “Uji CMS”: kedua situs publik menampilkan project itu setelah
rebuild. Owner lalu menghapusnya: kedua deployment SUCCESS, project uji hilang
dan empat judul Projects baseline tetap tampil di kedua situs. Login route kedua
domain HTTP 303 ke Google terverifikasi; login owner terpisah di kedua domain
belum dibuktikan. Owner melaporkan akun Google non-owner di Incognito ditolak. Tahap penolakan
Google/backend tidak dirinci; tidak mengklaim allowlist GAS nyata telah terisolasi.

QA kode sebelumnya: 24 CMS tests, native + legacy admin browser empat widths,
7 gate + SEO PASS; responsive 468/468, 19 HTML publik identik baseline sebelum
mutation live. Pass konfigurasi auth tidak mengubah kode/UI/geometri publik.
Bukti read-only publik penghapusan: artifacts/cms-native/owner-delete-live.json.

Projects media upload/cache sekarang tersedia lokal: raster <=2 MB,
normalisasi WebP server (sharp existing), folder Drive privat, hash content,
preview owner-only dan cache/build lokal sebelum snapshot atomik. Tidak hotlink
Drive; preset dan template publik tetap. QA media: 29 CMS tests Node 22, browser
native/legacy empat widths, media renderer Home/HoF empat widths, tujuh gate + SEO
PASS; responsive 468/468 dan 19 HTML publik baseline identik. Media cd37446
sudah push dengan izin user; kedua Vercel SUCCESS. Testing awal gagal dengan
Invalid CMS export redirect; read-only export sesudahnya identik baseline dan
retrigger testing lewat hook existing SUCCESS. Root cause Google belum terbukti.
Kontrol upload/noindex kedua domain HTTP200, API media anonymous401, login303
ke Google. Owner melaporkan update versi GAS Export dan Admin media selesai.
Export action media baru terverifikasi (UNKNOWN_MEDIA untuk hash tidak terdaftar).
Owner upload gambar, preview dan save project sementara “uji cms” berhasil;
export saat uji lima Projects dengan satu media WebP 39152 bytes, hash/decode valid.
Production SUCCESS 21:25 WIB; testing awal gagal pada fetch/validasi media, lalu
retrigger hook testing existing SUCCESS 21:27 WIB. Penyebab awal belum terisolasi;
fetch guard/retry tetap. Gambar dan project tampil pada Home/HoF kedua domain,
browser 390/1440 PASS: decode, kartu aktif, tanpa overflow/browser errors.
Bukti artifacts/cms-media/owner-upload-{export,live}.json dan browser kedua situs.

Cleanup owner selesai: “uji cms” dihapus, export empat Projects persis baseline,
tanpa referensi upload. Testing SUCCESS 21:37 WIB; production SUCCESS 21:38 WIB.
Home/HoF kedua domain HTTP200: project/gambar uji hilang, empat judul baseline ada.
Bukti artifacts/cms-media/owner-media-delete-{export,deployments,live}.json.
Projects Growth + media upload/cache acceptance selesai; file Drive tidak dihapus
otomatis. NEXT: update GAS existing + owner acceptance Team; B3/B4 sesudahnya.
Owner/non-owner + CRUD/rebuild telah diuji, dengan batas bukti di setup guide.
Team lokal PASS; acceptance live belum. Tidak reseed atau ulang
Sheet/folder/onboarding. Public Astro tetap static; browser shell/login, records
melalui API owner, cookie HttpOnly terenkripsi + state/PKCE + CSRF. Backend tetap
Sheets/Drive/Properties/hook existing. Satu collection/pass. Seluruh CMS belum
selesai. User mengizinkan kerja/commit; konfirmasi sebelum push baru.

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
