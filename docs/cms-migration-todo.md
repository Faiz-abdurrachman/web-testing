# CMS → Supabase — TODO dan status penerimaan

## Checkpoint auth CMS — e08a604 deployed, acceptance owner blocked

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

## Auth CMS — local B–D selesai, menunggu izin apply/push (7 Oct 2026)

Keputusan user: provider **password Supabase**; dependency
**`@supabase/supabase-js` server-only saja**; allowlist CMS **terpisah**;
cookie namespace CMS terpisah + logout lokal; live action butuh izin konkret.
Password ⇒ tanpa OAuth/callback/uri_allow_list/account-linking. Design:
[cms-auth-design.md](cms-auth-design.md). Work order rinci C3–E:
[cms-auth-execution-plan.md](cms-auth-execution-plan.md).

- [x] A: audit/baseline/env presence + keputusan provider/dep/owner/session.
- [x] B: migration isolasi + PostgreSQL proof; modul auth + integrasi; form UI;
      focused auth tests + adaptasi native/media tests.
- [x] C1/D lokal: CMS light 81 PASS, recruitment 24 PASS, Team live 10 SKIP,
      auth 6 PASS (PG nyata), 7 gate + SEO, tiga admin mock 4 widths,
      snapshot/19 HTML unchanged.
- [ ] C3: apply additive SQL + provision owner grant (butuh izin konkret).
- [ ] C4: config live (tidak ada callback yang dibutuhkan untuk password).
- [ ] D4: minta izin push SHA baru.
- [ ] E: dua READY + real owner/non-owner/anon/refresh/logout/revocation
      dua-domain acceptance; read-only dulu; recruitment isolation/closed.

## Work order sesi berikutnya — auth CMS, PLAN ONLY

Faiz meminta **eksekusi di AI baru**. [Master Work Plan auth CMS](cms-auth-supabase-plan.md)
sudah disiapkan rinci: inventory actual, keputusan provider/dependency/owner,
security contract, checklist A–E, SQL permission proposal, QA, dua-domain
acceptance dan rollback. Sesi persiapan ini **docs saja**; belum kode/SQL/apply/
provider config/dependency/push/deploy auth. Semua execution checklist pending.

Runtime live **925d577**, checkpoint docs **3229c5b lokal** dan planning terbaru
lihat git log; origin/production masih925d577. Izin push925d577 consumed;
konfirmasi sebelum push baru termasuk docs. Urutan baca aktif: kickoff seluruhnya
termasuk §6 → AGENTS → ai-handoff → auth plan → TODO → master plan → CMS SOP.
Provider/mekanisme belum dipilih; lakukan audit A lalu selesaikan gate keputusan
sebelum implementasi dependent. OAuth CMS custom masih berjalan sekarang.

**Temuan actual:** callback CMS masih cek owner via GAS; API Supabase CMS memakai
sesi encrypted, bukan fresh GAS check per operasi. `private.cms_admin_users`
existing (`auth_id text`, bukan proposal user_id uuid) mengotorisasi recruitment.
Jangan otomatis reuse/seed tabel itu untuk CMS atau link Google/password identity.
Target CMS permission terisolasi + trusted Auth identity per request; recruitment
cookies/users/allowlist tetap. Keenam content sources Supabase tetapi full GAS
export tetap divalidasi; penghapusan GAS belum diizinkan. UI/data/Team drift tetap.

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

## Checkpoint Hods sebelumnya — historis

Pass 5 Hods **A–E selesai, LIVE `763bafc`** pada kedua situs.
[Master Work Plan](cms-pass5-hods-plan.md) §9–10 menyimpan local/SQL/live proof.
Vercel READY testing 12:53:12.956 UTC, production 12:55:00.507 UTC (7 Oct 2026),
primary domains assigned ke SHA fitur. All 21-tab acceptance kedua situs ×
390/1440 × Home/Recruitment contexts PASS, admin anonymous 401, recruitment closed.
Checkpoint **526b428 sudah push**, kedua aliases exact SHA READY: testing
13:12:20.677 UTC, production 13:13:44.014 UTC (7 Oct 2026), HTTP smoke PASS.
NEXT [Partners plan](cms-pass6-partners-plan.md) **PLAN ONLY**, lalu auth CMS
terakhir. GAS tetap wajib. Izin push `763bafc`/`526b428` consumed; planning
terbaru lokal, konfirmasi sebelum push baru.

## 1. Yang benar-benar sudah selesai

- [x] Recruitment pass 1: intake Supabase, idempotency + privacy.
- [x] Recruitment pass 2: admin read, Supabase Auth email/password.
- [x] Recruitment pass 3: rate limit + refresh token.
- [x] CMS pass 1 Projects: Postgres + Storage, handler write Management API.
- [x] CMS pass 2 Team: Postgres + Storage, hybrid reconstruction, Management API.
- [x] CMS pass 3 Roles: enam fixed records, private table + RLS + anon read RPC.
- [x] Roles GAS/DB/snapshot equality; SQL applied dan privileges verified.
- [x] Roles local QA: CMS 42 PASS + 10 live Team SKIP, Recruitment 24 PASS,
      PostgreSQL nyata, 7 gate + SEO, tiga admin browser mock empat width.
- [x] `53f92f8` push ke kedua repo dengan izin Faiz.
- [x] Vercel testing SUCCESS 2026-10-07 11:20:17 UTC (18:20:17 WIB).
- [x] Vercel production SUCCESS 2026-10-07 11:21:28 UTC (18:21:28 WIB).
- [x] Live Roles: enam routes × 390/1440 × dua situs PASS, copy/link/overflow/
      pageerrors; admin anonymous 401, recruitment tetap accepting:false.
- [x] Planning/handoff Domains disusun sebelum implementasi; actual A–E selesai di §2.

Bukti pass 3 (ignored, boleh tidak tersedia di workspace baru):
`artifacts/cms-pass3/{live-db,live-hybrid,live-browser,deploy-53f92f8}.json`.
Tidak menjalankan mutation Team live untuk membuktikan Roles. Team remote
berbeda snapshot repo sebelum pass 3; non-Roles pre/post identik, tidak diubah.

## 2. Pass 4 Domains — selesai A–E

Rincian executable checklist A–E dan matriks tes ada di Master Work Plan.

- [x] A1: baca state, Node 22, git bersih/isolasi perubahan asing, env presence.
- [x] A2: snapshot/HTML baseline baru + proof remote sebelum pass.
- [x] A3: Domains GAS vs snapshot cocok keenam record, urutan, nested slot/blank.
- [x] A4: read-only check tabel/RPC destination existing, rekonsiliasi mismatch.
- [x] B1: SQL tabel/helper/check/RLS/revoke/public RPC/seed idempotent.
- [x] B2: PostgreSQL ephemeral positif/negatif/security/rerun/Unicode boundary.
- [x] B3: hybrid `cms_load_domains` + fail closed + fixture mocks relevan.
- [x] B4: local CMS/recruitment contracts PASS, jangan load server env full suite.
- [x] C1: apply additive SQL setelah reconciliation + local DB proof.
- [x] C2: real anon RPC exact data, catalog + role privilege proof.
- [x] C3: remote hybrid parity dengan pre-pass; Team drift tidak di-reset.
- [x] D1: build/verify/navbar/VT/responsive/spacing/format/SEO PASS.
- [x] D2: native/legacy/Team admin regression; snapshot/HTML baseline parity.
- [x] D3: docs + commit fitur siap review, proof sanitised tersimpan.
- [x] E1: empat env Supabase pada kedua Vercel, GAS env tetap untuk Hods/Partners.
- [x] E2: **konfirmasi push baru** lalu push origin, dua remote SHA sinkron.
- [x] E3: dua latest deployments SHA pass 4 SUCCESS.
- [x] E4: Home/Recruitment 390/1440, six cards/blank slots/rail/links/back;
      anonymous admin 401 + recruitment closed, no write test production.
- [x] E5: update checkpoint LIVE dengan proof; baru lock pass 4.

Proof live `artifacts/cms-pass4/{vercel-env,env-fix,deployments-6b36519,live-browser}.json`.
Testing READY 12:02:26.550 UTC, production READY 12:04:06.630 UTC, 7 Oct 2026.
Token server missing pada kedua project telah dilengkapi encrypted sebelum push.
Tidak ada fallback stale; GAS full export tetap dependency.

## 3. Pass 5 Hods — selesai A–E, LIVE

Semua rincian executable di [Master Work Plan Hods](cms-pass5-hods-plan.md).
Bukti local/SQL di plan §9, deployment/all-tab live acceptance di §10.

- [x] A1: baca tujuh dokumen, git/SHA/perubahan asing, Node 22, env presence.
- [x] A2: fresh snapshot/hash/19 public HTML + pre-pass captured hybrid inputs.
- [x] A3: GAS/snapshot seluruh 6 ID/21 tabs/55 sections/8 bullets exact; destination read-only inspect.
- [x] B1: private SQL + strict typed JSON/mask/UTF-16 helpers/RLS/revoke/anon RPC/seed.
- [x] B2: PG ephemeral all slots/unions/keys/Unicode/order/rerun/security/RLS proof.
- [x] B3: hybrid Hods RPC + atomic errors/no stale + relevant sync fixture mocks.
- [x] B4: full CMS tanpa env server + recruitment contracts PASS sebelum SQL live.
- [x] C1: project/ref verified + private anon key retrieval + immediate reconciliation.
- [x] C2: additive apply + inspect applied state on failure + actual anon/catalog/role proof.
- [x] C3: same captured inputs pre/post hybrid unchanged values/non-Hods; Team drift utuh.
- [x] D1: 7 gate + SEO, snapshot/19 HTML baseline equality, counts/pass/skip recorded.
- [x] D2: local all 21 tabs/55 blocks/8 bullets content + click/arrow wrap/focus/aria/hidden/back.
- [x] D3: three admin mocks four widths, active docs + reviewable feature commit.
- [x] E1: fresh four Supabase/two GAS env Production kedua Vercel, secrets suppressed.
- [x] E2: konfirmasi SHA push baru, origin once/two remotes synced.
- [x] E3: two latest feature-SHA READY deployments + timestamps actual UTC/WIB.
- [x] E4: all six Hods/21 tabs × 390/1440 × both sites + Home/Recruitment entry/back/VT.
- [x] E5: anonymous admin 401/recruitment closed, no production mutation + LIVE checkpoint/DoD.

## 4. Pass 6 Partners — A–E selesai, LIVE925d577

[Master Work Plan Partners](cms-pass6-partners-plan.md) memuat kontrak exact,
inventory empat section terkunci, SQL proposal, matrix tes, secrets/stop/DoD.
Rekonsiliasi, SQL applied dan QA lokal actual tercatat di plan §9; E actual PASS, lihat plan §10.

- [x] Plan rinci + kickoff §6 + urutan baca wajib disiapkan untuk AI baru.
- [x] A1–A4: baca/git/Node22/env, fresh baseline, GAS/snapshot/destination
      reconciliation, capture inputs dan Team drift tanpa mutation.
- [x] B1–B5: additive singleton SQL/RLS/strict validators/anon RPC, PostgreSQL
      ephemeral/security/Unicode/path/rerun, hybrid/mocks/fail closed, local tests.
- [x] C1–C3: immediate reconciliation, additive apply once, real HTTP anon +
      catalog/role denied proof, same-input pre/post parity tanpa reset Team.
- [x] D1–D4: tujuh gate + SEO, Partners browser widths/boundaries,
      tiga admin mocks, snapshot/19 HTML exact, docs + feature commit siap review.
- [x] E1–E5: env kedua Vercel, izin SHA push baru, dua READY exact aliases,
      Partners390/1440 kedua situs + regression/admin401/closed, LIVE checkpoint.

## 5. Sesudah Partners (belum dikerjakan)

| Urutan            | Status                        | Scope awal                                             |
| ----------------- | ----------------------------- | ------------------------------------------------------ |
| Pass 6 Partners   | LIVE925d577                   | tiga kategori, empat why, satu logo repo; A–E accepted |
| Auth CMS terakhir | PLAN ONLY / keputusan pending | detailed plan A–E; eksekusi di AI baru                 |
| Penghapusan GAS   | BELUM DIIZINKAN               | semua pass diterima, backup/observasi + izin baru      |

Milestones/settings bukan tambahan scope otomatis. Tinjau apakah benar dipakai
sebelum menawarkan migrasi; jangan menambah pass/collection sendiri.

### Checklist auth CMS untuk AI baru

[Master Work Plan](cms-auth-supabase-plan.md) berisi sub-checklist A1–E5 lengkap.

- [x] Planning/handoff rinci dan inventory actual disiapkan; docs saja.
- [ ] A: fresh audit/baseline/env presence + provider/dependency/owner/session decisions.
- [ ] B: final contract/SQL local PG/server auth/session-bound CSRF/focused tests.
- [ ] C: local regression/review, approved additive SQL/config/isolated owner grant.
- [ ] D: tujuh gate+SEO/admin mocks/public parity/security proof/docs/localcommit siap review.
- [ ] E: izin push baru, dua exact READY aliases, real owner/non-owner/anon/refresh/logout/
      revocation/isolation acceptance + LIVE checkpoint.

Tidak ada runtime/SQL/config/deps/deploy auth sesi planning. Recruitment
allowlist existing tetap terpisah; GAS export removal belum diizinkan.

## 6. Temuan dan keputusan yang harus dibawa ke AI baru

- [ ] Team drift: **catat dan isolasi**, belum diizinkan untuk diperbaiki/reseed.
      Tidak menghalangi tes Partners yang memakai perbandingan sebelum/sesudah.
- [ ] Full GAS export masih divalidasi sebelum overrides; menghapus tabs
      collection migrated bisa menggagalkan build. Refactor ini belum dikerjakan.
- [ ] Local anon key belum ada di .env.local saat pass 3; tersedia untuk deploy
      yang berhasil. Verifikasi private key retrieval/in-memory; jangan cetak key.
- [ ] Private Storage vs build anon key perlu audit media tersendiri: cache lokal
      bisa menyembunyikan kegagalan cold-cache. Tidak dibuktikan Roles tests dan
      tidak boleh mengubah bucket policy agar public sebagai jalan pintas Partners.
- [ ] Catalog proof tidak setara mutation/role-execution proof seluruh fitur.
- [ ] Auth CMS: Google lewat Supabase atau pertahankan custom masih pending;
      bagian master plan lama adalah proposal, bukan approval. Ikuti auth plan §3 decision gates; password via Supabase juga memerlukan scope UI tersendiri.
- [ ] CAPTCHA: key Cloudflare belum diputuskan/disediakan.
- [ ] Retensi/pembukaan recruitment: belum diputuskan; accepting:false tetap.

Item bagian ini adalah issue/keputusan terpisah, **bukan** instruksi agar AI
auth menyelesaikannya semua. Laporkan blocker yang benar-benar terjadi.

## 7. Aturan perubahan status

Pisahkan status `plan`, `kode lokal`, `SQL applied`, `QA lokal`, `pushed`,
`dua deployments`, `live acceptance`. Satu status tidak membuktikan lainnya.
Jangan mengarang hasil tes, env kedua Vercel, tanggal atau approval.
Update file ini dan kickoff/ai-handoff/AGENTS tiap checkpoint baru.
