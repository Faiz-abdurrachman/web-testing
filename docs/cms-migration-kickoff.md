# CMS → Supabase — kickoff aktif untuk AI baru

User **Faiz**, panggil **bro**, bahasa Indonesia. Repo
`/home/faiz/ds/ds5opencode`. Work order berikut **pass 6 Partners**, belum implementasi/plan pass baru.
**Hods A–E selesai, LIVE `763bafc`** kedua situs. Baca [Hods plan](cms-pass5-hods-plan.md)
§9–10 untuk actual proof, lalu TODO/master plan/SOP; buat plan Partners tersendiri
sebelum kode. Auth CMS terakhir dan mekanisme final pending.

Hods SQL private/RLS/anon RPC applied, six records/21 tabs/55 sections/8 bullets
exact. CMS 74 PASS/10 Team live SKIP, recruitment 24 PASS, 7 gate + SEO, tiga admin
mock empat widths, snapshot/19 HTML exact. Live all-tab acceptance × 390/1440 ×
Home/Recruitment kedua situs PASS; Roles smoke, API admin anonymous 401 dan
recruitment closed PASS. Sumber aktif Projects/Team/Roles/Domains/Hods Supabase,
Partners GAS; full GAS export masih divalidasi sebelum overrides. Team drift
preexisting utuh. SQL Unicode ceiling UTF-16 lebih ketat daripada Zod installed,
selisih diuji/didokumentasikan; schema/UI/geometri/assets/auth/media utuh.

API Vercel READY testing **12:53:12.956 UTC / 19:53:12.956 WIB**, production
**12:55:00.507 UTC / 19:55:00.507 WIB**, 7 Oct 2026. Primary domains assigned ke
SHA baru. Jam workspace sekitar 138 detik di belakang Vercel HTTP Date; artifact
browser `checkedAt` memakai workspace, READY memakai provider, jangan mengurutkan
raw timestamp kedua clock seolah sama. Empat Supabase + dua GAS env Production
kedua project verified ulang; secrets tetap private/in-memory.

Feature `763bafc`, checkpoint `df31ab0`, planning `dbc2b22` telah dipush dengan
izin Faiz. Checkpoint LIVE sesudah push disimpan lokal terpisah, belum push;
**izin `763bafc` consumed, konfirmasi sebelum push baru** termasuk docs lokal.
Jangan reseed/drop/reapply Hods/Team, hapus tab/env GAS atau mulai auth/media.
Prompt §6 di bawah arsip prompt implementasi Hods yang sudah dieksekusi A–E;
bukan work order untuk mengulang pass Hods. NEXT Partners memerlukan plan baru.

## 1. Baseline live sebelum push Hods (arsip checkpoint Domains)

Kode live **`6b36519`**, Domains selesai A–E. Kedua Vercel READY untuk SHA ini:
testing 7 Oct 2026 **12:02:26.550 UTC / 19:02:26.550 WIB**, production
**12:04:06.630 UTC / 19:04:06.630 WIB**. Home/Recruitment 390/1440, six cards/
slots/rail/all detail links/back PASS. Admin anonymous 401, recruitment closed.
Tanggal migration filename hanya urutan repo, bukan tanggal execution.

Checkpoint docs **`df31ab0`** lokal, belum push; plan Hods/checkpoint terbaru
lihat `git log -3 --oneline`. Jangan memakai git reset untuk “kembali baseline”.
Runtime kode `6b36519` tetap live meskipun HEAD docs lokal lebih baru.

| Bagian      | Sumber/status                                            |
| ----------- | -------------------------------------------------------- |
| Recruitment | Supabase pass 1–3, accepting:false, auth email/password  |
| Projects    | Supabase Postgres + Storage, Management API write, live  |
| Team        | Supabase Postgres + Storage, Management API write, live  |
| Roles       | Supabase public read RPC, live                           |
| Domains     | Supabase public read RPC, live                           |
| Hods        | GAS live; SQL/kode/QA lokal selesai, push pending        |
| Partners    | GAS; pass 6 setelah Hods accepted                        |
| CMS auth    | OAuth custom existing, mekanisme final pending, terakhir |

QA baseline pass 4: Node 22.23.0, CMS 56 PASS/10 Team live SKIP, Recruitment
24 PASS, PostgreSQL nyata, tiga admin mock empat width, 7 gate + SEO, responsive
468/468, SEO 23 pages, spacing 39 komponen, snapshot/19 HTML publik byte-identik.
Proof ignored artifacts/cms-pass4/ bisa hilang; ringkasan tracked ada di handoff.

## 2. Urutan baca wajib sebelum coding

1. File ini.
2. `AGENTS.md`.
3. [AI handoff](ai-handoff.md).
4. [Hods Master Work Plan](cms-pass5-hods-plan.md): kontrak actual, seluruh
   21-tab inventory, SQL proposal, A–E, test matrix, stop/rollback/DoD.
5. [Migration TODO](cms-migration-todo.md).
6. [Master migration plan](cms-supabase-migration-plan.md).
7. [CMS SOP](cms-sop.md).

Lalu actual Domains SQL/tests + cms-client/schema/hods.ts, sebagai contoh
read-only; jangan menyalin CRUD Projects/Team. Pixel SOP/assets dibaca untuk
kontrak visual terkunci; tidak ada izin perubahan UI. Checkpoint aktif + arahan
user terbaru mengalahkan NEXT historis di HANDOVER/kickoff/GAS/Growth/auth docs.

## 3. Kontrak Hods dan batas scope

**6 fixed IDs, 21 tabs, 55 sections (53 text + 2 bullets), 8 bullet items.**
Hods bukan Domains cards dan bukan Team HoDS carousel. Snapshot:
`{id,title,description,tabs:[{sections:[{title,text}|{title,bullets}]}]}`.
Tab labels/kind/color/cardImage tetap lokal `src/data/hods.ts`, bukan field DB.
Array order record/tab/section/bullet signifikan; loader merge via index.
Matriks lengkap, checksum, Figma nodes/spacing/reference terkunci di plan §2–3.

Tidak ada editor/write API/state/Storage/dependency/auth baru. UI/geometri/font/
artwork/schema Zod/assertions tidak berubah. Partners/auth pass berikutnya.
Jangan reseed Team, memperbaiki cold-cache media, refactor partial GAS validation,
atau hapus GAS/tab/env. Full GAS export tetap validasi sebelum overrides.

## 4. Secrets, env dan lessons live

Existing Supabase **web-community**, ref **yejrdckcmlxrkklgtrwy**.
Empat env Production kedua Vercel verified pass 4: SUPABASE_URL,
SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN. GAS env
CMS_API_URL/CMS_API_TOKEN dipertahankan. **Cek presence ulang**, jangan asumsi.
SUPABASE_ACCESS_TOKEN semula missing kedua project, dilengkapi encrypted sebelum
push pass 4; jangan mengklaim env historis otomatis ada saat sesi baru.

Local anon key absent pass 4: Management API api-keys read privat/in-memory;
jangan print/write key atau memakai service key sebagai anon. VERCEL_TOKEN
lokal dapat akses kedua project; credential CLI default scope berbeda. Cek
presence file/key tanpa values; bila akses privat hilang, laporkan blocker,
jangan minta secret lewat chat. Jangan print .env.local/credentials/error body/
URLs bertoken/headers. Capture inputs untuk proof hanya ke ignored private artifacts.

Team remote drift sudah ada sebelum Roles/Domains; pre/post same captured inputs
membuktikan tidak diubah. Jangan overwrite committed baseline untuk “membuat tes cocok”.
**Full test:cms tanpa env server**, karena Team tests dapat mutation live.
Node default sesi sebelumnya 26; pilih/verifikasi Node 22, jangan asumsi path
/tmp/server/Postgres/artifacts masih tersedia. PG ephemeral tests local wajib.
RPC probe pertama sesudah SQL apply pernah gagal, berikutnya HTTP 200: inspect
applied state sebelum retry, tidak blind apply/drop. GitHub anon status bisa
403 rate limit; API Vercel existing membuktikan deployment actual SHA/time.

## 5. Scope file dan approval

CREATE usulan SQL `20261012010000_cms_hods_pass5.sql` (cek collision),
`tests/cms-hods-supabase.test.mjs`, optional focused browser verification.
MODIFY cms-client RPC Hods, relevant sync mocks, active docs. Jangan ubah
migrations applied, schema/hods.ts/UI/assertions/admin/auth/media/collection lain.

Kerja dan commit lokal diizinkan. Izin push **`6b36519` sudah digunakan**;
konfirmasi **SHA push baru** setelah hasil konkret reviewable. Origin punya dua
push URLs: git push origin main sekali deploy testing + production. Jangan
memicu hooks/rebuild/push sebelum approval. Checkpoint docs lokal juga perlu
approval push; tidak perlu onboarding/re-konfirmasi pekerjaan lokal authorized.

## 6. Arsip prompt implementasi yang memulai pass ini

```text
Bro, lanjut implementasi CMS pass 5 Hods → Supabase di repo:
/home/faiz/ds/ds5opencode

Baca berurutan sebelum coding:
1. docs/cms-migration-kickoff.md
2. AGENTS.md
3. docs/ai-handoff.md
4. docs/cms-pass5-hods-plan.md
5. docs/cms-migration-todo.md
6. docs/cms-supabase-migration-plan.md
7. docs/cms-sop.md

Baseline kode live 6b36519: Projects/Team/Roles/Domains Supabase,
kedua Vercel READY dan Domains acceptance selesai. Hods/Partners masih GAS.
Checkpoint live df31ab0 dan planning Hods terbaru commit lokal belum dipush;
periksa git log/status, jangan reset docs/perubahan asing. Periksa Node 22 dahulu.

Ikuti Master Work Plan Hods checklist A–E satu tahap demi satu tahap.
Scope hanya Hods: enam fixed ID/order, 21 tabs, 55 sections (53 text + dua
bullets x4), strict nested union/keys dan UTF-16 boundaries. Rekonsiliasi semua
GAS/snapshot, SQL private + RLS + public anon read RPC, snapshot hybrid,
tes PostgreSQL ephemeral + actual anon/role proof, full-tab browser coverage,
tujuh gate + SEO, docs dan commit siap review.

UI/geometri/font/artwork/schema Zod/assertion/hodDesign tetap.
Jangan buat editor/write API/state/Storage/dependency baru. Auth terakhir.
Jangan reseed Team atau menimpa baseline: remote drift sudah ada sebelumnya.
Jangan hapus tab/env GAS: full export tetap dependency meski Partners saja
menjadi konten GAS sesudah pass ini. Jangan refactor media/partial validation.
Jangan jalankan seluruh test:cms dengan env server: ada Team live mutation tests.
Secret jangan dicetak; anon key bila missing ambil privately/in-memory via
Management API existing, bukan service key workaround. VERCEL_TOKEN lokal
pernah akses dua project sementara credential CLI default beda scope.

Lanjut sampai hasil konkret siap review. Konfirmasi sebelum push baru;
izin push Domains sudah digunakan, origin sekali push deploy dua situs.
Setelah push berizin, verifikasi kedua SHA/deployment actual + semua six Hods
routes/21 tabs pada 390/1440 kedua situs, Home/Recruitment entry/back flows,
admin anonymous 401 dan recruitment accepting:false, tanpa production mutation.
Pisahkan bukti planning/local/SQL applied/push/deploy/live; laporkan blocker nyata.
Panggil gw bro, bahasa Indonesia.
```

## 7. Keputusan yang tetap terpisah

Auth CMS/provider final, CAPTCHA keys, retensi/pembukaan recruitment,
Team drift repair, audit private media cold-cache, partial GAS validation,
GAS deletion, milestones/settings belum diputuskan/diotorisasi untuk pass Hods.
