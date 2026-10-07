# CMS → Supabase — TODO dan status penerimaan

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

## 4. Pass 6 Partners — PLAN ONLY, implementasi belum dimulai

[Master Work Plan Partners](cms-pass6-partners-plan.md) memuat kontrak exact,
inventory empat section terkunci, SQL proposal, matrix tes, secrets/stop/DoD.
Planning selesai tidak membuktikan rekonsiliasi GAS/database atau implementasi.

- [x] Plan rinci + kickoff §6 + urutan baca wajib disiapkan untuk AI baru.
- [ ] A1–A4: baca/git/Node22/env, fresh baseline, GAS/snapshot/destination
      reconciliation, capture inputs dan Team drift tanpa mutation.
- [ ] B1–B5: additive singleton SQL/RLS/strict validators/anon RPC, PostgreSQL
      ephemeral/security/Unicode/path/rerun, hybrid/mocks/fail closed, local tests.
- [ ] C1–C3: immediate reconciliation, additive apply once, real HTTP anon +
      catalog/role denied proof, same-input pre/post parity tanpa reset Team.
- [ ] D1–D4: tujuh gate + SEO, Partners browser widths/boundaries,
      tiga admin mocks, snapshot/19 HTML exact, docs + feature commit siap review.
- [ ] E1–E5: env kedua Vercel, izin SHA push baru, dua READY exact aliases,
      Partners390/1440 kedua situs + regression/admin401/closed, LIVE checkpoint.

## 5. Sesudah Partners (belum dikerjakan)

| Urutan            | Status           | Scope awal                                            |
| ----------------- | ---------------- | ----------------------------------------------------- |
| Pass 6 Partners   | PLAN ONLY        | tiga kategori, empat why, satu logo repo; A–E pending |
| Auth CMS terakhir | BELUM DIPUTUSKAN | pilih login, owner/cookie/CSRF/dua domain             |
| Penghapusan GAS   | BELUM DIIZINKAN  | semua pass diterima, backup/observasi + izin baru     |

Milestones/settings bukan tambahan scope otomatis. Tinjau apakah benar dipakai
sebelum menawarkan migrasi; jangan menambah pass/collection sendiri.

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
      bagian master plan lama adalah proposal, bukan approval.
- [ ] CAPTCHA: key Cloudflare belum diputuskan/disediakan.
- [ ] Retensi/pembukaan recruitment: belum diputuskan; accepting:false tetap.

Item bagian ini adalah issue/keputusan terpisah, **bukan** instruksi agar AI
Partners menyelesaikannya semua. Laporkan blocker yang benar-benar terjadi.

## 7. Aturan perubahan status

Pisahkan status `plan`, `kode lokal`, `SQL applied`, `QA lokal`, `pushed`,
`dua deployments`, `live acceptance`. Satu status tidak membuktikan lainnya.
Jangan mengarang hasil tes, env kedua Vercel, tanggal atau approval.
Update file ini dan kickoff/ai-handoff/AGENTS tiap checkpoint baru.
