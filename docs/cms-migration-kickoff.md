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
Faiz meminta persiapan docs sekarang dan **eksekusi auth di AI baru**.
[Master Work Plan auth CMS](cms-auth-supabase-plan.md) **PLAN ONLY**;
provider/dependency/mapping/session decisions pending, execution A–E unchecked.
Baca seluruhnya termasuk §6. Partners accepted, bukan pass yang diulang.

## 1. Baseline actual dan status izin

Runtime deployed **925d577** kedua primary aliases; checkpoint docs **3229c5b**
lokal, disusul planning auth terbaru (lihat git log). Izin push925d577 consumed;
konfirmasi push baru termasuk docs. `origin` dua existing push URLs, satu push
men-deploy testing+production. Jangan tambah remote, reset/stash perubahan asing.

- Testing `https://web-testing-azure.vercel.app`, READY7Oct2026
  **13:57:59.202 UTC /20:57:59.202 WIB**.
- Production `https://data-sorcerers-community-sigma.vercel.app`, READY7Oct2026
  **13:59:13.031 UTC /20:59:13.031 WIB**.

Timestamp dari API provider. Workspace checkedAt berbeda clock. Tracked proof
[Partners plan](cms-pass6-partners-plan.md) §9–10 authoritative bila ignored
artifacts hilang. Migration Partners applied sekali; jangan reapply/drop/reseed.
Keenam CMS content sources Supabase RPC build-time; Projects/Team Management API
writes + private Storage. **Full GAS export tetap required sebelum overrides.**
CMS auth custom OAuth; recruitment password Auth terpisah, accepting:false.
Seluruh CMS belum selesai. GAS removal, Team drift/cold-cache/partial validation,
CAPTCHA/retensi/pembukaan atau multi-admin bukan scope auth otomatis.

## 2. Urutan baca wajib

1. File ini seluruhnya, termasuk §6.
2. `AGENTS.md`.
3. [AI handoff](ai-handoff.md), checkpoint aktif dan aturan.
4. [Auth CMS Master Work Plan](cms-auth-supabase-plan.md) seluruhnya, A–E.
5. [Migration TODO](cms-migration-todo.md).
6. [Master migration plan](cms-supabase-migration-plan.md).
7. [CMS SOP](cms-sop.md).

Lalu actual server/routes/editors/recruitment allowlist/tests/package/vercel
sesuai auth plan §2. Before any UI: pixel SOP/assets/fullscreen plan. Arsip
Growth/GAS/setup/content pass bukan work order. Master plan §3.4/5.4 lama hanya
proposal; **auth plan actual terbaru mengalahkan asumsi tabel/user_id/SDK lama**.

## 3. Scope auth dan temuan yang harus dipertahankan

Target auth Supabase untuk CMS Projects/Team/media, preserve editor/CRUD/media/
publication/public snapshot/UI contracts. Planning saja sesi ini; AI baru audit A
kemudian selesaikan provider/dependency/owner/session/config decisions §3.
Google via Supabase rekomendasi bersyarat untuk UX existing; belum dipilih.
Password membutuhkan scope/UI plan terpisah. Jangan install SDK/configure provider
atau mutate Auth user hanya karena proposal.

Callback CMS existing cek GAS owner sekali saat login; operasi Supabase kemudian
memakai encrypted session. Target trusted Auth identity + **CMS-specific active
permission setiap request**, Origin/CSRF sebelum privileged call. Service/Management
key server-only; tidak grant authenticated direct CMS writes/Storage/table access.
`private.cms_admin_users` existing auth_id text adalah **recruitment allowlist**;
jangan reuse/seed/alter otomatis untuk CMS. Account linking bisa mengubah akses
PII, review sebelum provider activation. CMS cookies harus terpisah recruitment.
Full GAS export tetap validated; auth cutover tidak sama dengan GAS removal.

## 4. Operasional, secrets dan baseline

Existing Supabase web-community/yejrdckcmlxrkklgtrwy, dua existing Vercel projects;
tidak onboarding ulang. Verifikasi env presence/scope privately, bukan dumpvalues.
`.env.local`, git credentials, tokens, auth codes/cookies/PII/private errors tidak
print/commit. Anon key bila missing retrieve Management API in-memory, bukan
servicekey workaround. Credential CLI Vercel pernah beda scope; VERCEL_TOKEN
existing bisa dipakai privat. Access hilang: catat blocker, lanjut independent.

Node default26; Node22 terakhir binary
`/tmp/ds-cms-node22/node_modules/node-linux-x64/bin/node`, verifikasi dulu.
**Full test:cms tanpa env server**: Team live mutation tests wajib SKIP. Fresh
baseline frozen inputs, snapshot bytes +19 public HTML exact; Team drift tetap.
Artifacts/PG/server /tmp mungkin tidak tersedia. Historical QA92CMSPASS/10SKIP,
24recruitment,18Partners/realPG/7gate+SEO bukan fresh auth results.
SQL error/probe fail: inspect actualstate sebelum retry, tidak blind reapply/drop.
Vercel API exact SHA/alias/READY proof; jangan memakai clock/name migration untuk
menyimpulkan actual apply/deploy chronology.

## 5. Tahapan dan batas approval

A audit/baseline/decision → B finaldesign/localcode+SQLproof → C localreview dan
approved live prerequisites → D fullQA/docs/localcommit siapreview → E authorized
push/duaREADY/realowner acceptance. Detail checklist di auth plan §6. Jangan
skip gates atau melabel mocks sebagai real Supabase owner proof.

User ingin implementasi **di sesi AI baru**. Sesi persiapan hanya docs/localcommit,
tanpa runtime/SQL/config/deps/deploy. AI baru memanfaatkan izin yang sudah ada,
meminta keputusan missing sebelum dependent actions, dan menyelesaikan hasil
reviewable sebelum minta push. Real mutation acceptance memerlukan fixture/cleanup
konkret dan authorization yang berlaku; jangan save/reseed Team sebagai probe.
Push baru wajib konfirmasi. Checkpoint docs setelah live juga tidak otomatis push.

## 6. Prompt siap salin — mulai auth CMS di AI baru

```text
Bro, lanjut auth CMS → Supabase di /home/faiz/ds/ds5opencode.
Panggil gw bro, bahasa Indonesia. Eksekusi kita di sesi AI ini; sesi sebelumnya
hanya menyiapkan planning/docs, belum ada kode/SQL/apply/config/deps/deploy auth.

Periksa git status/log/refs dan Node22 dahulu. Runtime live925d577 kedua domain
READY/Partners A–E accepted; docs3229c5b + planning terbaru lokal, lihat git log.
Izin push925d577 consumed. Konfirmasi sebelum push baru termasuk planning docs;
origin dua push URLs, satu push deploy testing+production. Jangan reset/edit asing.

Baca kickoff migrasi SELURUHNYA termasuk §6 → AGENTS → ai-handoff →
docs/cms-auth-supabase-plan.md SELURUHNYA → migration TODO → master migration
plan → CMS SOP. Ikuti auth Master Work Plan checklist A–E dan actual fileinventory.
Checkpoint aktif/auth plan mengalahkan NEXT/assumsi historis. UI terkunci; sebelum
UI baca pixel SOP/assets/fullscreen plan, per-section protocol tetap berlaku.

Mulai A: audit actual login/callback/cookie/CSRF/route/config/allowlist dan fresh
baseline, lalu sajikan rekomendasi konkret untuk keputusan provider/dependency/
owner mapping/session. Provider Google vs password, SDK baru dan config/grant
belum dipilih/disetujui; jangan infer dari kata gas. Kerjakan independentaudit
sambil menunggu, implementasi dependent setelah keputusan/otorisasi mencukupi.

Callback CMS custom saat ini cek owner via GAS, operasi Supabase pakai encrypted
session. Target trusted Supabase Auth identity + CMS-specific active permission
setiap request sebelum service/Management/Storage/hook. Existing private.cms_admin_users
(auth_id text) mengotorisasi recruitment, JANGAN otomatis reuse/seed/alter atau
link Auth Google/password identity. Recruitment cookies/users/allowlist/PII/Auth
password/accepting:false tetap. CMS cookies/CSRF/logout namespace dan scopeisolated.

Preserve UI/editor/CRUD/revision/min-max/media/publication, write ManagementAPI
existing, server-only keys, anon publicreadRPC, no direct authenticated writes.
Keenam CMS content sources Supabase buildRPC, full GASexport MASIH validated
sebelum overrides; jangan hapus GAS/tab/env/client/deployment. GASremoval terpisah.
Partners SQL appliedsekali, jangan reapply/reseed; Teamdrift tetap. Full test:cms
TANPA env server agar10Team live mutation SKIP. Secrets/PII/cookies/authcodes
jangan print/commit. Fresh frozenbaseline19publicHTML/snapshotexact + SOP7gate/SEO,
3adminmocks4widths, auth/security/realPG tests; mockbukanrealownerproof.

Selesaikan localresult siapreview, update docs/status dan localcommit; minta izin
push SHA baru. Setelah approved push: duaREADY/exactaliases dan realowner/nonowner/
anon/refresh/logout/revocation dua-domainacceptance, recruitmentisolation/closed,
publicregression. Realmutation butuh approvedfixture+cleanup, tanpa arbitraryTeamwrite.
Jangan klaim authLIVE/seluruhCMSselesai jika realacceptance masihpending.
```

## 7. Setelah auth diterima

GAS removal hanya setelah audit dependency/export/media/auth, backup/observation
serta izin tersendiri. Retire old secrets/OAuth redirects secara terkontrol, bukan
saat planning. Team drift/media cold-cache/CAPTCHA/retention/recruitment opening
milestones/settings tetap work order terpisah.
