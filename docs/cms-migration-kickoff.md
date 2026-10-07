# CMS → Supabase — kickoff aktif untuk AI baru

## Checkpoint aktif — Partners LIVE, NEXT auth CMS final

**Pass 6 Partners A–E selesai, LIVE `925d577`**, dipush dengan izin Faiz ke
kedua repo. Sesudah push fitur, main/origin/main/production/main sinkron925d577.
Kedua primary domains assigned ke exact feature SHA dan **READY**:

- web-testing: **13:57:59.202 UTC / 20:57:59.202 WIB**, 07 Oct 2026.
- data-sorcerers-community: **13:59:13.031 UTC / 20:59:13.031 WIB**, 07 Oct 2026.

Timestamp READY dari API Vercel actual; browser/artifact checkedAt memakai jam
workspace. Jangan urutkan event dengan mencampur kedua clock atau nama migration.
Checkpoint docs sesudah acceptance ini **commit lokal saja**; lihat git log.
Izin push925d577 sudah digunakan; konfirmasi sebelum push baru termasuk docs.
[Master Work Plan Partners](cms-pass6-partners-plan.md) §9–10 menyimpan proof.

Migration additive `20261013010000_cms_partners_pass6.sql` applied sekali ke
existing web-community / yejrdckcmlxrkklgtrwy. GAS/snapshot/DB exact **3 category
labels + 1 local logo path + 4 why pairs**, strict keys/types/order. Private
singleton + RLS ALL deny; public RPC anon/service_role saja. Catalog owner/
search_path/definer/ACL dan13 actual denied live reads PASS; write permissions
via catalog denied, tanpa live DML probes. Initial anon404 → independent state
inspect/count1 + HTTP200 exact → proof-only tanpa reapply; cause awal unresolved.

Live Partners **390/1440 kedua situs PASS**:3 labels/10-5-5 slots/20 alt/logos,
4 why pairs/index-matched local icons, hero/cards/glow/footer artwork decode,
exact desktop geometry, navbar mobile/desktop entry, keyboard footer entry/back,
Astro VT context retained, tanpa overflow/clipping/pageerror. Home/Recruitment +
6 Hods +6 Roles ×390/1440 kedua situs PASS (HTTP200/headings/back/art decode/
overflow); projects/team/media API anonymous401 dan recruitmentaccepting:false.
Tidak ada owner mutation, submission, hook atau SQL apply ulang.

Node22.23.0 QA lokal: CMS92 PASS+10 Team live SKIP/0FAIL, recruitment24 PASS,
focused Partners18 PASS+PostgreSQL (199 invalid/72 valid parity fixtures,
22 role denials, RLS/order/rerun/missing row/Unicode/path). Tujuh gate+SEO PASS,
responsive468/468, spacing39, SEO23 pages, three admin mocks4widths. Snapshot
bytes/19 public HTML exact fresh baseline. Same captured inputs pre/post deep
value-identik; Team drift preexisting utuh, tidak reseed/overwrite snapshot.
Codepoint ceiling sesuai installed Zod; NUL/lone surrogate fail closed PG.

**Sumber aktif keenam CMS content collections = Supabase RPC build-time.**
**Full GAS export masih divalidasi sebelum overrides**; jangan hapus GAS/tab/env.
Empat Supabase +dua GAS env Production kedua Vercel fresh verified sebelum push,
nilai tidak dicetak. Count10/5/5/icons, UI/geometri/font/artwork/schema/assertions,
admin/auth/media/dependencies tetap; tanpa Partners editor/write API/state/Storage.
Auth CMS tetap OAuth custom, **provider/mekanisme final pending**, pass berikutnya
butuh keputusan user. Seluruh CMS belum selesai dan GAS removal belum diizinkan.
Proof ignored `artifacts/cms-pass6/`:live-db/live-hybrid/qa-summary/vercel-env,
deployments/aliases-925d577,live-browser-testing/production,live-smoke,4screenshots.
Ringkasan tracked ini menjadi handoff bila artifacts hilang.

Faiz, panggil **bro**, bahasa Indonesia. Repo `/home/faiz/ds/ds5opencode`.
Partners A–E accepted; status/proof terbaru di awal file dan plan §9–10.
NEXT auth CMS final **belum diputuskan**, bukan izin implementasi otomatis.
Baca seluruhnya termasuk §6; jangan mengulang SQL/apply/acceptance Partners.

## 1. Baseline actual dan status izin

Fitur deployed **925d577**, pass6 Partners A–E accepted pada kedua primary
aliases. Planning16828c2 ikut push berizin bersama fitur; checkpoint docs sesudah
acceptance lokal saja, lihat git log/status. Izin push925d577 consumed.
Baseline sebelum pass526b428 dan fitur Hods763bafc adalah riwayat accepted,
bukan work order untuk diulang. Jangan reset atau menimpa perubahan asing.

Kedua primary aliases assigned exact SHA925d577, READY pada7Oct2026:

- Testing **13:57:59.202 UTC /20:57:59.202 WIB**,
  `https://web-testing-azure.vercel.app`.
- Production **13:59:13.031 UTC /20:59:13.031 WIB**,
  `https://data-sorcerers-community-sigma.vercel.app`.

Timestamp API Vercel actual; jangan dibandingkan untuk ordering dengan workspace
checkedAt. Partners390/1440 kedua situs accepted: labels/count10-5-5/20alt/
why pairs/order/icons/art decode/geometri/keyboard/navbar/footer/VT/no errors.
Home/Recruitment/sixHods/sixRoles390/1440 kedua situs smoke PASS, API admin401,
recruitmentclosed, tanpa mutation/submission. [Partners proof](cms-pass6-partners-plan.md)
§9–10 authoritative. Historical Hods all21-tab acceptance di [Hods plan](cms-pass5-hods-plan.md) §9–10.

| Bagian             | Sumber/status aktif                                          |
| ------------------ | ------------------------------------------------------------ |
| Recruitment        | Supabase pass1–3; accepting:false; Auth email/password       |
| Projects/Team      | Supabase Postgres +Storage; write Management API             |
| Roles/Domains/Hods | Supabase public read RPC; LIVE accepted                      |
| Partners           | Supabase public read RPC; LIVE925d577 accepted               |
| CMS auth           | Custom OAuth existing; final provider pending, pass terakhir |

Full GAS export masih divalidasi sebelum overrides, walau enam content sources
Supabase. Jangan hapus tab/env/GAS. QA lokal Node22.23.0: CMS92PASS/10TeamSKIP,
recruitment24PASS/Partners18PASS+realPG,7gate+SEO/admin mocks/Partners9widths,
snapshot19HTML exact. Auth CMS final belum diputuskan; seluruh CMS belum selesai.

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

## 6. Prompt siap salin — handoff sesudah Partners LIVE

```text
Bro, baca konteks CMS di /home/faiz/ds/ds5opencode.
Panggil gw bro, bahasa Indonesia. Urutan kickoff seluruhnya termasuk §6 →
AGENTS → ai-handoff → Partners plan → TODO → master migration plan → CMS SOP.
Checkpoint Partners LIVE925d577/A–E accepted mengalahkan planning historis.

Cek git status/log/refs/Node22 dahulu; baseline fitur live925d577 kedua primary
aliases exact SHA READY, Partners390/1440 kedua situs accepted. Checkpoint docs
setelah live acceptance commit lokal, lihat git log. Izin push925d577 consumed;
konfirmasi sebelum push baru termasuk docs. Jangan reset/perubahan asing.

SQL Partners applied SEKALI; initial anon404 lalu independent inspect/count1/
HTTP200 exact dan13actual denied reads/catalog PASS, tanpa DML live probes.
Jangan reapply/drop/reseed. GAS/snapshot/DB exact3category labels/1local logo/
4why pairs; codepoint limit installed Zod/PG, NUL/lone surrogate fail closed.
Same frozen pre/post input values identik; Team drift preexisting tetap.
QA local92CMSPASS+10TeamSKIP/24recruitment/18Partners/realPG/7gate+SEO,
Partners9widths/admin3mocks4widths/snapshot19HTML exact. Smoke live kedua situs
Home/Recruitment/sixHods/sixRoles390/1440 PASS, anonymousadmin401,
recruitmentaccepting:false. Proof plan §9–10 authoritative jika artifacts hilang.

Keenam CMS content sources sudah Supabase RPC build-time; full GAS export masih
divalidasi sebelum overrides, jangan hapus GAS/tab/env. Empat Supabase+duaGAS
env kedua Vercel fresh verified sebelum push, secret jangan dicetak. UI/geometri/
font/art/schema/assertions/admin/auth/media/dependencies tetap; Partners count/
icons lokal, tanpa editor/write API/state/Storage. Full test:cms TANPA env server.

NEXT auth CMS final belum diputuskan: tunggu work order/keputusan user sebelum
implementasi. OAuth custom CMS existing tetap; recruitment Authemail/password
terpisah. GAS removal belum diizinkan dan audit/backup/observasi pass tersendiri.
Jangan otomatis mutation/reseed Team, cold-cache media, partial GAS validation,
recruitment/CAPTCHA/retensi/pembukaan atau milestones/settings. Seluruh CMS belum
selesai. Tidak onboarding ulang project/Sheet/folder/credentials.
```

## 7. Sesudah Partners dan keputusan terpisah

Partners diterima dulu, lalu auth CMS final (provider/mekanisme belum diputuskan).
Penghapusan GAS memerlukan audit dependency/backup/observasi/izin tersendiri;
seluruh CMS belum selesai hanya karena enam content sources Supabase.
Team drift repair, private media cold-cache, partial validation, CAPTCHA,
retensi/pembukaan recruitment, milestones/settings bukan scope otomatis.
