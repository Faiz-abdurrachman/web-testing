# CMS → Supabase — kickoff aktif untuk AI baru

## Checkpoint aktif — Partners SQL applied + QA lokal, menunggu izin push

Pass 6 Partners **A–D selesai**, implementasi lokal siap review; **E belum
berjalan**, belum push/deploy/live acceptance Partners. Baseline situs tetap
**526b428**, planning lokal **16828c2**; lihat `git log` untuk commit fitur lokal.
[Master Work Plan Partners](cms-pass6-partners-plan.md) §9 menyimpan proof.
Konfirmasi SHA konkret sebelum push baru; origin sekali push men-deploy dua situs.

Migration additive `20261013010000_cms_partners_pass6.sql` applied sekali ke
existing **web-community / yejrdckcmlxrkklgtrwy**, 7 Oct 2026. GAS/snapshot/DB
exact: **3 category labels + 1 local logo path + 4 why pairs**, order/keys/types
utuh. Singleton private + RLS deny; public RPC anon/service_role saja.
Catalog owner postgres, fixed search_path/definer/ACL dan **13 actual read role
denials** PASS; write privileges denied via catalog, tanpa live DML probes.
Probe anon pertama HTTP404; inspect state menunjukkan tabel/RPC dan satu row,
read berikutnya HTTP200 exact. Tidak reapply; penyebab 404 awal belum diisolasi.

Node **22.23.0**: CMS **92 PASS + 10 live Team SKIP / 0 FAIL**, recruitment
**24 PASS**, focused Partners **18 PASS** + PostgreSQL ephemeral (199 invalid /
72 valid schema-parity fixtures, 22 role denials, RLS isolation/rerun/order).
Partners SQL memakai Unicode **codepoints** sesuai installed Zod; NUL/lone
surrogates yang PostgreSQL tidak representasikan tetap fail closed. Schema dan
applied helpers Domains/Hods tidak diubah. Path regex dan asset decode terpisah.

Tujuh gate + SEO PASS: build0 errors/23 pages, visual browserErrors kosong,
navbar/VT, responsive **468/468**, spacing39, format. Partners browser sembilan
widths **320/390/700/701/1050/1051/1365/1366/1440** PASS: labels10/5/5 slots,
20 alt/logos, four why pairs/index icons, artwork decode, exact geometry,
keyboard footer/navbar entry/VT, tanpa overflow/clipping/pageerror. Native +
legacy Projects + Team admin mock empat widths PASS, bukan real owner auth.
Fresh snapshot bytes dan **19 public HTML exact**; same captured remote inputs
pre/post value-identik. Team drift preexisting tetap, tidak reseed/mutation.

**Kode lokal** membaca keenam content collections dari Supabase RPC; situs live
masih baseline lima RPC + Partners GAS sampai push berizin. **Full GAS export
masih divalidasi sebelum overrides**; jangan hapus GAS/tab/env. Count10/5/5,
icons, UI/geometri/font/artwork/schema/assertions/admin/auth/media tetap.
Tanpa editor/write API/state/Storage/dependencies baru. Auth CMS final pending;
seluruh CMS belum selesai. E wajib fresh env kedua Vercel, izin SHA, dua exact
READY/aliases dan acceptance live; tidak trigger hook/deploy sebelum izin.
Bukti ignored `artifacts/cms-pass6/`; ringkasan tracked ini berlaku jika hilang.

Faiz, panggil **bro**, bahasa Indonesia. Repo `/home/faiz/ds/ds5opencode`.
Work order aktif **pass 6 Partners E**, [Master Work Plan](cms-pass6-partners-plan.md)
A–D selesai, SQL applied + QA lokal; belum push/deploy/acceptance live Partners.
Baca file ini seluruhnya termasuk prompt §6; jangan mengulang apply Partners
atau pass Hods yang sudah LIVE. E dimulai setelah izin push konkret.

## 1. Baseline actual dan status izin

Baseline deployed **526b428**, checkpoint docs sesudah fitur Hods **763bafc**.
Keduanya sudah dipush dengan izin Faiz. main/origin/main/production/main sinkron
526b428 pada pemeriksaan sesi planning. Planning Partners terbaru commit lokal;
lihat git log/status, jangan reset atau menimpa perubahan asing.

Kedua primary aliases assigned exact SHA526b428, READY pada 7 Oct 2026:

- Testing: **13:12:20.677 UTC / 20:12:20.677 WIB**,
  `https://web-testing-azure.vercel.app`.
- Production: **13:13:44.014 UTC / 20:13:44.014 WIB**,
  `https://data-sorcerers-community-sigma.vercel.app`.

Checkpoint rebuild smoke PASS: six Hods headings exact, Home/Recruitment/
Partners HTTP200, admin projects/team/media anonymous401, recruitment closed.
Hods feature full acceptance: all6 routes/21 tabs ×390/1440 ×Home/Recruitment
contexts kedua situs PASS; 6 IDs/55 sections/8 bullets exact, artwork/tab
interaction/aria/keyboard/VT/back/no overflow/pageerror. No production mutation.
[Hods plan](cms-pass5-hods-plan.md) §9–10 menyimpan actual proof.

| Bagian             | Sumber/status aktif                                          |
| ------------------ | ------------------------------------------------------------ |
| Recruitment        | Supabase pass1–3; accepting:false; Auth email/password       |
| Projects/Team      | Supabase Postgres + Storage; write Management API            |
| Roles/Domains/Hods | Supabase public read RPC; LIVE accepted                      |
| Partners           | Live masih GAS; lokal SQL/RPC/QA pass6 A–D PASS              |
| CMS auth           | Custom OAuth existing; final provider pending, pass terakhir |

QA Hods Node22.23.0: CMS74 PASS/10 Team live SKIP/0 fail, recruitment24 PASS,
focused Hods18 PASS/ephemeral PostgreSQL, 7 gate + SEO, tiga admin mocks empat
widths, responsive468/468, SEO23 pages, spacing39, snapshot/19 public HTML exact.
Ini historical baseline, bukan klaim tes Partners sudah dilakukan.
**Izin push763bafc/526b428 consumed; konfirmasi sebelum push baru**, termasuk docs.

## 2. Urutan baca wajib sebelum coding

1. File ini seluruhnya, termasuk §6.
2. `AGENTS.md`.
3. [AI handoff](ai-handoff.md), checkpoint aktif dan aturan.
4. [Partners Master Work Plan](cms-pass6-partners-plan.md) seluruhnya, A–E.
5. [Migration TODO](cms-migration-todo.md).
6. [Master migration plan](cms-supabase-migration-plan.md).
7. [CMS SOP](cms-sop.md).

Lalu actual cms-schema/snapshot/partners.ts/cms-client/GAS export serta SQL/tests
Hods/Domains. Pixel SOP/assets/fullscreen plan untuk kontrak visual terkunci;
tidak ada izin perubahan UI. Checkpoint aktif + arahan user terbaru mengalahkan
NEXT historis GAS/Growth/Team/Hods/auth. Artifacts ignored boleh hilang; pakai
ringkasan tracked dan buat fresh baseline, jangan mengarang proof.

## 3. Kontrak Partners dan scope

**3 category labels +1 local logo path +4 why title/description pairs**.
11 text strings, arrays strict/order signifikan. RPC proposal
`{partners:{partnerCategories:[{label}],partnerLogo,whyPartners:[{title,description}]}}`.
Snapshot actual labels Industry/Academia/Community; why Talent/Research/
Innovation/Community; logo `/images/partners/partner-logo.webp`.
Count10/5/5 =20 placeholder slots dan why-icons tetap lokal `partners.ts`,
bukan 20 DB records atau field editor. Inventory empat section/Figma nodes/
spacing/font/artwork/assertion existing lengkap di plan §3.

Partners SQL harus dibandingkan dengan **actual installed Zod codepoint limit**;
Hods UTF-16 ceiling lebih ketat adalah temuan terdokumentasi, jangan menyalin
helper lama atau mengubah applied SQL/schema. Path regex dan asset existence/
decode diuji terpisah. Actual Partners GAS/destination parity kini PASS, lihat plan §9.

Hanya Partners read build-time; tanpa editor/write API/state/Storage/dependency
baru. UI/geometri/font/artwork/schema/assertions/admin/auth/media tetap.
Jangan reseed/mutation Team, memperbaiki drift, cold-cache media, partial GAS
validation, recruitment/CAPTCHA atau auth. **Full GAS export tetap divalidasi
sebelum overrides**, bahkan setelah seluruh enam content sources Supabase;
jangan hapus GAS/tab/env. Auth terakhir dan GAS removal pass terpisah.

## 4. Secrets, env dan lessons operasional

Existing Supabase **web-community / yejrdckcmlxrkklgtrwy**; tidak buat project baru.
Cek presence/scope ulang empat env Supabase (URL/ANON_KEY/SERVICE_ROLE_KEY/
ACCESS_TOKEN) dan dua GAS (CMS_API_URL/CMS_API_TOKEN) Production kedua Vercel.
Keberadaan historis tidak menjamin sesi baru. Secret .env.local/credentials,
headers/URLs bertoken/raw private errors tidak dicetak atau dikomit.

Local anon key sebelumnya absent; ambil privat/in-memory via existing
Management API, jangan service-key workaround atau meminta secret lewat chat.
VERCEL_TOKEN lokal pernah akses dua project, credential CLI default beda scope.
Jika akses hilang, catat blocker dan lanjut kerja independent yang aman.

**Full test:cms tanpa env server**: ada Team live mutation tests, harus SKIP.
Team drift preexisting dipertahankan; same captured inputs untuk pre/post,
jangan overwrite snapshot repo untuk membuat tes cocok. Node default26;
pilih/verifikasi Node22. Path22 terakhir `/tmp/ds-cms-node22/node_modules/node-linux-x64/bin/node`,
verifikasi masih ada; jangan asumsi /tmp/PG/server/artifacts tersedia.
RPC probe pertama setelah apply pernah gagal lalu HTTP200; inspect state
sebelum retry, tidak blind reapply/drop. Vercel API direct membuktikan actual
SHA/alias/READY, GitHub status anon bisa rate limited. Workspace pernah ~138s
behind provider HTTP Date; jangan urutkan raw timestamps lintas clock.

## 5. Scope file dan approval

CREATE usulan `supabase/migrations/20261013010000_cms_partners_pass6.sql`,
`tests/cms-partners-supabase.test.mjs`, optional focused verifier. MODIFY
cms-client RPC Partners setelah Hods, sync success mocks relevan, active docs.
Jangan ubah applied migrations, snapshot/schema/partners.ts/UI/assets/assertions,
server/API/admin/auth/media/other collection/dependencies.

Kerja/commit lokal authorized. Partners additive apply hanya setelah A/B
reconciliation + local DB/security proof, project/ref verified; tidak berarti
izin overwrite/drop/reseed. Push/hook/deploy baru menunggu izin konkret setelah
D menghasilkan hasil reviewable. `git push origin main` sekali ke dua existing
push URLs deploy testing+production; jangan menambah remote/push URL.
E verifikasi kedua deployment/aliases/live; pisahkan plan/local/SQL/push/live.

## 6. Prompt siap salin — lanjut acceptance E setelah izin baru

```text
Bro, lanjut CMS pass6 Partners di /home/faiz/ds/ds5opencode.
Panggil gw bro, bahasa Indonesia. Baca kickoff seluruhnya termasuk §6 lalu
AGENTS → ai-handoff → Partners plan → TODO → master migration plan → CMS SOP.
Checkpoint aktif Partners A–D/SQL applied/QA lokal mengalahkan PLAN ONLY historis.

Cek git status/log/refs dan Node22 dahulu. Baseline live526b428; planning16828c2
serta fitur Partners terbaru lokal, belum push. Jangan reset/perubahan asing.
Master Work Plan Partners §9: full GAS/snapshot/DB exact3categories/1path/4why;
SQL applied SEKALI, initial RPC404 lalu state inspect+HTTP200 exact,13 live read
denials/catalog. Jangan apply/reseed/drop lagi. Same frozen inputs pre/post
identik, Team drift preexisting tetap. Local QA92CMS PASS+10TeamSKIP,24recruitment,
18focused Partners/real PG,7gate+SEO,Partners9widths/admin3mocks4widths,
snapshot/19HTML exact. Proof artifacts boleh hilang; ringkasan tracked authoritative.

Work order E1–E5 setelah izin SHA konkret. Izin push lama consumed; jika belum
ada izin baru, siapkan read-only hasil review lalu minta konfirmasi sesuai AGENTS.
Verifikasi fresh4Supabase+2GAS env Production kedua Vercel, nilai tidak dicetak.
Push origin main sekali ke dua existing push URLs hanya dengan izin; jangan
trigger hooks/deploy sendiri. Verify exact SHA refs/two READY+primary aliases,
actual provider timestamps UTC/WIB. Partners390/1440 kedua situs copy/count10-5-5/
20alts/why order/icons/art decode/navbar/footer/keyboard/VT/no overflow/errors;
Home/Recruitment/sixHods/sixRoles regression, admin projects/team/media anonymous401,
recruitmentaccepting:false, tanpa owner mutation atau submission.

UI/geometri/font/art/schema/assertions/admin/auth/media/dependencies tetap;
count/icons lokal, tanpa editor/write API/state/Storage. Full GAS export masih
divalidasi sebelum semua6RPC overrides: jangan hapus tab/env/GAS. Jangan mutation/
reseed Team, cold-cache media, partial validation, recruitment/CAPTCHA/auth.
SQL Partners codepoints cocok actual Zod; NUL/lone surrogate fail closed PG;
applied Hods/Domains helpers tidak diubah. Full test:cms TANPA env server.
Secrets private/in-memory; jangan service-key workaround untuk anon. Auth CMS
terakhir/provider pending; seluruh CMS belum selesai. E accepted baru lock
Partners/update live checkpoint, checkpoint commit lokal kecuali push berizin.
```

## 7. Sesudah Partners dan keputusan terpisah

Partners diterima dulu, lalu auth CMS final (provider/mekanisme belum diputuskan).
Penghapusan GAS memerlukan audit dependency/backup/observasi/izin tersendiri;
seluruh CMS belum selesai hanya karena enam content sources Supabase.
Team drift repair, private media cold-cache, partial validation, CAPTCHA,
retensi/pembukaan recruitment, milestones/settings bukan scope otomatis.
