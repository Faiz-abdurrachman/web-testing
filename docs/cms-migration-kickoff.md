# CMS → Supabase — kickoff aktif untuk AI baru

## Acceptance resumed — akses pulih, E5 approved, media prerequisite missing

Full access kembali aktif 8 Oct 2026; `.git` writable dan Management API bekerja.
Dua primary aliases **READY exact7e17fc0** confirmed API: testing provider timestamp
7 Oct16:47:54.100 UTC/23:47:54.100 WIB; production16:49:24.662 UTC/23:49:24.662 WIB.
Cek live: satu CMS owner grant aktif, satu recruitment allowlist aktif/fingerprint
unchanged, applications0. CMS auth/recruitment focused43PASS; catalog table ACL +
6 actual table-read denials PASS. Tidak apply ulang auth migration.

Faiz mengizinkan **fixture E5 + cleanup** eksplisit: satu PNG32×32 + satu Projects
fixture, edit/delete fixture, publikasi3×2 hooks, tanpa Team write. Baseline4
Projects + Team fingerprint ditangkap. Upload pertama502; read-only inspect
menemukan **bucket cms-media tidak ada** (catalog0buckets/0objects; Storage API
Bucket not found). Tidak blindretry; tidak ada object/Projects fixture tersimpan.
Storage existing3Team policies hanya service_role. Proposed prerequisite bucket:
private/public=false, max262144bytes, allowed MIMEimage/webp; provisioning izin
konkret pending terpisah dari E5. Script create disiapkan, belum dijalankan.

Sesi khusus expiry alami dimulai: cookie hanya process memory, tanpa refresh
sebelum3690detik; Auth actual jwt_exp3600. Due workspace UTC18:24:42.845 tanggal
7Oct / WIB01:24:42.845 tanggal8Oct. Hasil **pending**, jangan klaim PASS dari explicit
refresh. Setelah private media PASS, jalankan approved non-owner/revocation
fixtures. GAS tetap; auth belum LIVE accepted penuh. Proof ignored: e-resume-audit,
e-storage-inspect,e-fixture-baseline,e-natural-expiry,e-deployments-7e17fc0.

## Fresh auth acceptance — 8 Oct 2026, izin login otomatis

Faiz memberi izin eksplisit agent memakai credential sementara untuk testing
login; credential tidak dicatat ke docs/artifacts/commit. Runtime tetap7e17fc0.
Fresh browser contexts kedua domain: password login **200**, Projects **200/4**,
Team **200/25**; explicit refresh **200**, CSRF stabil dan post-refresh read200.
Bad CSRF403, GET refresh405, empty login body400; owner read tetap200.

Isolasi actual dua arah PASS: CMS-only → recruitment401; recruitment-only →
Projects/Team/media401. Invalid sealed CMS cookie → Projects/Team401 dan
recruitment tetap200. Sesi gabungan: CMS logout200 → Projects/Team/media401,
recruitment stats200, refresh200 dan post-refresh stats200 kedua situs.
Recruitment accepting:false. Semua sesi browser pengujian kemudian logout;
recruitment own logout → stats401. Tidak ada content write/upload/hook/SQL/grant
mutation. Read recruitment menjalankan audit handler existing, tanpa mengambil
atau mencetak application PII. Proof ignored `e-fresh-auth-20261008.json`.

E4 isolation/closed/public regression selesai; E3 masih parsial (positive private
media, natural expiry, approved non-owner/revocation fixture). Terminal API tetap
EAI_AGAIN dan `.git` read-only; production READY exact SHA confirmation/fixture
cleanup/commit tetap blocked oleh akses environment. E5 fixture konkret disiapkan
di execution plan §16, belum dieksekusi. Auth belum LIVE accepted penuh.

## Checkpoint auth CMS — 7e17fc0 pushed, real acceptance parsial

Faiz mengizinkan push fix (`gas`); satu `git push origin main` mengirim
`7e17fc05d3ce421eacc5511c57c515a6b1b8aa95` ke kedua repo. Refs main/origin/main/
production/main sinkron. Izin SHA ini consumed; push berikutnya termasuk docs
memerlukan izin baru. Testing primary alias READY exact SHA, provider timestamp
**7 Oct 2026 16:47:54.100 UTC / 23:47:54.100 WIB**. Production terakhir tercatat
BUILDING via API; sesudah environment berubah, terminal Management API terkena
DNS EAI_AGAIN/network restriction. **Production READY exact SHA/alias belum
terkonfirmasi ulang via API**, walaupun callback fixed sudah terbaca di primary.

Browser terhubung restart; owner mengisi credential sendiri lagi. Real owner
Projects **200/4 record**, Team **200/25**, explicit refresh **200** dan after-
refresh read **200** kedua domain. Reload editor + Projects/Team **390/1440**:
4/25 pilihan, workspace tampil, tanpa overflow. Anonymous Projects/Team/media
**401** kedua domain. Public **19/19 HTML exact** pre/post per situs, recruitment
**accepting:false**, callback retired mengikuti redirect ke `/admin/?login=failed`
HTTP200 (tidak lagi500). Tidak ada save/edit/upload/hook/content mutation.

**Batas bukti:** record aktif tidak merujuk media privat; path upload GAS historis
mengembalikan404, sehingga preview private media belum PASS. Explicit refresh
bukan bukti natural access expiry. Recruitment login/stats **200 kedua situs**
setelah owner login manual.
CMS logout **200** → Projects/Team/media **401**, CMS refresh **401**; recruitment
masih **200**, recruitment refresh **200** dan read sesudahnya **200** kedua situs.
Expired-session dan approved non-owner/revocation+cleanup masih pending. Fixture
script disiapkan ignored tetapi **belum dijalankan**; Management
API tidak tersedia dan owner read-only matrix belum lengkap untuk private media.
E5 content fixture belum disetujui. SQL auth tidak diapply ulang; grant/recruitment
users/allowlist tidak diubah. Auth belum LIVE accepted; seluruh CMS belum selesai.

Proof ignored: `e-deployments-7e17fc0.json` (last API state),
`e-owner-7e17fc0.json` (sanitized browser read/UI/refresh/anon/public proof).
NEXT: production READY exact SHA proof; restore Management API access untuk
fixture denial yang sudah approved; pilih private media fixture + cleanup
dengan izin E5 konkret.
GAS export validation/env/legacy credentials tetap; GAS removal pass terpisah.
Checkpoint ini belum commit/push; environment terbaru membatasi `.git` read-only.

## Arsip e08a604 — deployed, acceptance owner blocked

Dengan izin Faiz, satu push origin mengirim `e08a604fb18b4aad30c75832f850351114671163`
ke dua repo. Main/origin/main/production/main sinkron. Dua primary alias READY
exact SHA: testing **7 Oct 2026 16:31:50.069 UTC / 23:31:50.069 WIB**;
production **16:33:07.011 UTC / 23:33:07.011 WIB** (timestamp API provider).
Izin push e08a604 consumed; SHA berikutnya termasuk docs perlu izin baru.

Public regression dua situs PASS: 19/19 HTML exact pre/post, 84 browser cases
(19 public + 2 admin shells × 390/1440 × dua situs), anonymous Projects/Team/media
401, recruitment accepting:false. Owner isi password sendiri di browser terhubung,
namun GET Projects/Team **502** kedua domain. Auth belum LIVE accepted.

Read-only RPC inspection menemukan `affectedId:null` dari kedua load functions;
validator admin lama menolak field opsional itu. Perbaikan lokal mengabaikan null
sebagai field absent dan tetap memvalidasi affectedId non-null sebagai string.
Retired callback juga diperbaiki: fixed internal Location header 303, karena
Response.redirect dengan URL relatif melempar error Node live (500).
Regression tests memakai bentuk SQL actual; local handler dengan mock Auth +
real read-only CMS RPC kini 200 (4 Projects/25 Team), bukan real owner proof.

QA fix Node22.23.0: CMS light **85 PASS + 10 Team live SKIP**, recruitment
**24 PASS**, build0errors/23pages, tujuh gate + SEO PASS (verify browserErrors[],
navbar/VT, responsive468/468, spacing39, format, SEO23), tiga admin mock masing-
masing4widths PASS; snapshot hash tetap dan **19/19 public HTML exact**. Full CMS
sebelum fix e08a604 **102 PASS + 10 SKIP / 0 FAIL**; tidak diulang untuk fix
nullable field/callback ini. Proof fresh `readfix-{qa-summary,parity,local-rpc}.json`.

Faiz mengizinkan fixture non-owner example.invalid + cleanup UID/rate-limit
fixture, serta revoke sementara tepat owner CMS grant + restore. Izin bersyarat
**setelah owner read-only PASS**; fixture belum dijalankan. Tidak ada content
write/hook/Team mutation/recruitment user atau allowlist change. SQL C3 sudah
applied sekali; jangan reapply. NEXT: QA + commit fix, minta izin exact SHA baru,
dua READY, lanjut real read/media/refresh/logout/denials dan recruitment isolation.
Expired-session dan E5 content mutation masih pending; fixture E5 belum disetujui.
Proof ignored `artifacts/cms-auth/e-{deployments-e08a604,public-before,public-after,browser}.json`
dan `readfix-local-rpc.json`. Keenam content Supabase buildRPC + full GAS export
validation/env tetap; GAS removal pass terpisah. Seluruh CMS belum selesai.

## Arsip checkpoint sebelum e08a604 — C2/C3 selesai (7 Oct 2026)

C3 diizinkan Faiz eksplisit sesi ini: migration
`20261014010000_cms_auth_pass7.sql` **applied sekali** via Management API ke
existing `web-community / yejrdckcmlxrkklgtrwy`; **tepat 1** grant aktif CMS untuk
owner mapping yang disetujui. Owner melaporkan password sudah di-set sendiri di
dashboard; password tidak diminta/dicetak. Tidak ada push/deploy auth sesi ini.
Runtime kedua situs masih `925d577`; auth lokal awal `ae52f54`, docs `b1c437c`.

C2 fresh sebelum apply: 0 tabel/0 fungsi auth, owner UID/email confirmed match,
recruitment `auth_id text`, satu allowlist aktif dan nol applications. Sesudah
apply: 2 tabel RLS/deny, 6 fungsi SECURITY DEFINER fixed `pg_catalog`, public
wrapper service_role-only; service RPC `cms_verify_admin` HTTP200 owner exact.
**12 actual read-only role denials** (6 wrapper anon/authenticated + 6 table
SELECT anon/authenticated/service_role); catalog semua table SELECT/INSERT/
UPDATE/DELETE denied. Recruitment allowlist fingerprint identik; applications0.
Owner grant tidak hardcoded ke migration tracked; tidak ada content writes.

Review lokal menemukan dan memperbaiki tiga celah di `ae52f54`: backend rate
limit gagal kini fail closed sebelum password Auth; endpoint refresh melakukan
trusted getUser + CMS permission dan menolak revoked grant; logout merevoke
refresh session dengan sealed access token + scope local, lalu clear cookie CMS.
Tambahan 3 regression tests. Focused auth/native/media + recruitment **49 PASS**
termasuk ephemeral PostgreSQL. Cookie window30hari dan CSRF stabil sepanjang
refresh kini sesuai dokumentasi actual; login baru membuat CSRF baru.

Vercel Production kedua situs: anon key dan env legacy/GAS tetap present.
`RECRUITMENT_OPEN` sensitive present, nilainya tidak dapat dibaca API; **live
GET kedua situs membuktikan accepting:false**. Jangan menyebut nilai encrypted
terverifikasi bila hanya presence/runtime yang terbukti.

Fresh 7 gate + SEO PASS: build0errors/23pages, verify browserErrors kosong,
navbar/VT PASS, responsive468/468, spacing39, format, SEO23. Tiga admin mock
masing-masing4widths PASS; mock bukan real owner. Snapshot hash
`4345f1abe445aa2a400c31413ccc058707a77105a7e388dc8d1074e78da94857` dan
**19/19 public HTML exact** baseline pass6. Full CMS tanpa env server **102 PASS + 10 Team live SKIP / 0 FAIL**,
termasuk Hods PostgreSQL nyata (selesai ~442 detik); CMS light **84 PASS +
10 SKIP**. Recruitment **24 PASS**.

**NEXT D4:** commit hasil review lokal dan minta izin exact SHA baru sebelum
satu push origin (dua push URLs). **E pending:** dua READY exact SHA/aliases,
real owner/non-owner/anon/expired/revoked/refresh/logout + recruitment isolation,
read-only dulu; fixture/cleanup live mutation harus disetujui. Auth belum LIVE
accepted; seluruh CMS belum selesai; keenam content Supabase buildRPC dan full
GAS export validation tetap. GAS removal pass terpisah.
Proof ignored `artifacts/cms-auth/{c2-audit,c2-parity,c3-apply,c3-read-proof}.json`.

## Checkpoint aktif — Auth CMS B–D lokal selesai, NEXT eksekusi C3–E

**Auth CMS → Supabase sudah diimplementasikan lokal di commit `ae52f54`**, tree
bersih, **belum push/deploy/apply**. Keputusan user (7 Oct 2026): provider
**password Supabase**; dependency **`@supabase/supabase-js` server-only saja**;
allowlist CMS **terpisah** `private.cms_admin_permissions`; cookie namespace CMS
terpisah (`__Host-ds-admin-session`) + logout lokal; live action butuh izin
konkret. Password ⇒ **tidak ada** OAuth/PKCE/callback/`uri_allow_list`/
account-linking.

**Urutan baca aktif:** `cms-migration-kickoff.md` seluruhnya termasuk §6 →
`AGENTS.md` → `ai-handoff.md` → `cms-auth-supabase-plan.md` (termasuk §11 progress)
→ **`cms-auth-design.md`** (design final) → **`cms-auth-execution-plan.md`**
(Master Work Plan C3–E, rinci) → `cms-migration-todo.md`. Auth plan §11 dan
execution plan **mengalahkan** pernyataan historis "PLAN ONLY".

**Sudah ada (lokal, `ae52f54`):** `server/cms-auth.mjs`, integrasi
`server/cms-admin.mjs`, `api/admin/auth/refresh.js`, form password di
`/admin/` & `/admin/team/`, migration `20261014010000_cms_auth_pass7.sql`
(**belum apply**), `tests/cms-auth.test.mjs`, adaptasi native/media test.

**QA lokal PASS:** CMS light 81 PASS, recruitment 24 PASS, Team live 10 SKIP,
auth 6 PASS (termasuk PostgreSQL nyata), 7 gate + SEO, tiga admin mock 4 widths,
snapshot + 19/19 public HTML unchanged. Suite Hods real-PG timeout di environment
lama (tidak terkait auth).

**Sisa (butuh izin konkret Faiz):** C3 apply migration + provision owner grant,
C4 konfigurasi password owner (owner isi sendiri), D4 push SHA baru, E dua
deployment + real owner/non-owner/anon/refresh/logout/revocation acceptance
(read-only dulu). **Detail lengkap: `cms-auth-execution-plan.md`.**

Owner Supabase existing: `auth_id = 5903606f-5543-4832-9db5-f6a433b6c660`,
email `admin@datasorcerers.com` (confirmed). Recruitment cookies/allowlist tetap
terpisah; seluruh CMS belum selesai; GAS removal belum diizinkan.

## Checkpoint sebelumnya — Partners LIVE

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
Auth CMS B–D sudah lokal (`ae52f54`); AI baru mengeksekusi sisa **C3–E** sesuai
[Master Work Plan auth CMS](cms-auth-supabase-plan.md) §11 +
[cms-auth-execution-plan.md](cms-auth-execution-plan.md). Baca seluruhnya termasuk
§6. Partners accepted, bukan pass yang diulang.

## 1. Baseline actual dan status izin

Runtime deployed **925d577** kedua primary aliases; checkpoint docs lokal setelah
itu termasuk auth `ae52f54` (lihat git log). Izin push925d577 consumed;
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

A–D lokal **sudah selesai** di `ae52f54`. Sisa: **C2 review → C3 apply
SQL + provision owner grant → C4 config password owner → D4 push consent → E
deploy + acceptance**. Detail checklist: `cms-auth-execution-plan.md` §2–§7.
Jangan skip gate atau melabel mock sebagai real Supabase owner proof.

AI baru memanfaatkan izin yang sudah ada, **meminta izin konkret** sebelum apply
live/push, dan menyelesaikan hasil reviewable dulu. Real mutation acceptance
memerlukan fixture/cleanup konkret; jangan save/reseed Team sebagai probe. Push
baru wajib konfirmasi; checkpoint docs setelah live tidak otomatis push.

## 6. Prompt siap salin — eksekusi auth CMS C3–E di AI baru

```text
Bro, lanjut auth CMS → Supabase di /home/faiz/ds/ds5opencode.
Panggil gw bro, bahasa Indonesia. Sesi sebelumnya sudah MENYELESAIKAN A–D LOKAL
(commit ae52f54) — BUKAN plan-only lagi. Tugas lu eksekusi sisa C2–E: apply SQL,
provision owner grant, push, dan acceptance dua domain.

Periksa git status/log/refs dan Node22 dulu. Runtime live925d577 (Partners A–E
accepted); auth lokal ae52f54 belum push. Izin push925d577 consumed; konfirmasi
sebelum push SHA baru termasuk docs. origin dua push URLs, satu push deploy
testing+production. Jangan reset/stash perubahan asing.

Baca kickoff SELURUHNYA termasuk §6 → AGENTS → ai-handoff →
docs/cms-auth-supabase-plan.md (termasuk §11 progress) → docs/cms-auth-design.md
→ docs/cms-auth-execution-plan.md (Master Work Plan C3–E, detail) →
docs/cms-migration-todo.md. §11 + execution plan MENGALAHKAN pernyataan historis
"PLAN ONLY". UI terkunci; sebelum UI baca pixel SOP/assets/fullscreen plan.

C2: review migration 20261014010000_cms_auth_pass7.sql + catalog existing
(harus belum ada table/fungsi auth) + pastikan private.cms_admin_users
(recruitment, auth_id text) TIDAK tersentuh/tidak dipakai. Konfirmasi owner
mapping: admin@datasorcerers.com (auth_id 5903606f-5543-4832-9db5-f6a433b6c660).
Stop bila catalog sudah ada — inspect state, jangan blind reapply/drop.

C3 (BUTUH IZIN KONKRET dari gw sebelum apply live): tunjukkan diff + proof lokal,
lalu apply migration sekali via Management API ke project web-community
(yejrdckcmlxrkklgtrwy), provision 1 row private.cms_admin_permissions (bukan
hardcode ke migration tracked), bukti read-only cms_verify_admin + catalog/ACL +
role denials. Inspect state bila error, jangan reapply buta.

C4: password owner di-set SENDIRI oleh gw di dashboard Supabase (jangan minta/
isi password lewat chat). Verifikasi SUPABASE_ANON_KEY ada di kedua Vercel
(presence saja), RECRUITMENT_OPEN=false. JANGAN hapus env lama CMS_ADMIN_GOOGLE_*.

Provider = PASSWORD: TIDAK ada OAuth/PKCE/callback CMS/uri_allow_list tambahan/
account-linking. api/admin/auth/callback.js tetap tapi retired (redirect aman).

Preserve UI/editor/CRUD/revision/min-max/media/publication, write ManagementAPI
existing, server-only keys, anon public readRPC, no direct authenticated writes.
Keenam CMS content sources Supabase buildRPC; full GAS export MASIH validated;
jangan hapus GAS/tab/env/client/deployment. Recruitment cookies/users/allowlist/
PII/accepting:false tetap. Full test:cms TANPA env server agar 10 Team live
mutation SKIP. Secrets/PII/cookies/token jangan print/commit. Re-run CMS light +
recruitment + 7 gate+SEO + tiga admin mock 4 widths + snapshot/19 HTML parity
sebelum push. Mock BUKAN real owner proof.

D4: minta izin push SHA baru. Setelah approved push: E1 satu push origin (dua
situs), E2 dua READY exact SHA + alias, E3 real owner login/read Projects/Team/
private media/logout dua domain 390/1440 + non-owner denial + anon denial +
expired/revoked session — READ-ONLY dulu; E4 recruitment login/session isolation
+ closed + public regression; E5 live mutation hanya dengan fixture+cleanup yang
gw setujui, tanpa arbitrary Team write. Update checkpoint LIVE + docs commit;
jangan klaim auth LIVE/seluruh CMS selesai bila real acceptance masih pending.
GAS removal pass terpisah.
```

## 7. Setelah auth diterima

GAS removal hanya setelah audit dependency/export/media/auth, backup/observation
serta izin tersendiri. Retire old secrets/OAuth redirects secara terkontrol, bukan
saat planning. Team drift/media cold-cache/CAPTCHA/retention/recruitment opening
milestones/settings tetap work order terpisah.
