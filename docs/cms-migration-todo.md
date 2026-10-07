# CMS → Supabase — TODO dan status penerimaan

Work order aktif: **pass 4 Domains**, [Master Work Plan](cms-pass4-domains-plan.md).
Baseline kode live `53f92f8`. Domains SQL applied dan kode/QA lokal selesai;
push/deploy/acceptance baru belum dilakukan. Satu collection per pass, auth terakhir.

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
- [x] Planning/handoff Domains disusun; **ini tidak berarti pass 4 selesai**.

Bukti pass 3 (ignored, boleh tidak tersedia di workspace baru):
`artifacts/cms-pass3/{live-db,live-hybrid,live-browser,deploy-53f92f8}.json`.
Tidak menjalankan mutation Team live untuk membuktikan Roles. Team remote
berbeda snapshot repo sebelum pass 3; non-Roles pre/post identik, tidak diubah.

## 2. Pass 4 Domains — TODO berurutan

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
- [ ] E1: empat env Supabase pada kedua Vercel, GAS env tetap untuk Hods/Partners.
- [ ] E2: **konfirmasi push baru** lalu push origin, dua remote SHA sinkron.
- [ ] E3: dua latest deployments SHA pass 4 SUCCESS.
- [ ] E4: Home/Recruitment 390/1440, six cards/blank slots/rail/links/back;
      anonymous admin 401 + recruitment closed, no write test production.
- [ ] E5: update checkpoint LIVE dengan proof; baru lock pass 4.

Jika gate gagal jangan menandai tahap berikutnya complete, jangan longgarkan
assertion atau seed collection lain. Tidak ada fallback stale.

## 3. Work order sesudah pass 4 (belum dikerjakan)

| Urutan            | Status           | Scope awal; perlu plan tersendiri                                            |
| ----------------- | ---------------- | ---------------------------------------------------------------------------- |
| Pass 5 Hods       | TODO             | six IDs, ordered tabs/panels, text vs bullets + slot counts; read-only       |
| Pass 6 Partners   | TODO             | tiga kategori + empat why items + logo repo, read-only                       |
| Auth CMS terakhir | BELUM DIPUTUSKAN | pilih mekanisme login, audit owner/allowlist/cookie/CSRF, dua domain         |
| Penghapusan GAS   | BELUM DIIZINKAN  | semua data diterima, backup/observasi/reverse-migration aman, izin eksplisit |

Milestones/settings bukan tambahan scope otomatis. Tinjau apakah benar dipakai
sebelum menawarkan migrasi; jangan menambah pass/collection sendiri.

## 4. Temuan dan keputusan yang harus dibawa ke AI baru

- [ ] Team drift: **catat dan isolasi**, belum diizinkan untuk diperbaiki/reseed.
      Tidak menghalangi tes Domains yang memakai perbandingan sebelum/sesudah.
- [ ] Full GAS export masih divalidasi sebelum overrides; menghapus tabs
      collection migrated bisa menggagalkan build. Refactor ini belum dikerjakan.
- [ ] Local anon key belum ada di .env.local saat pass 3; tersedia untuk deploy
      yang berhasil. Verifikasi private key retrieval/in-memory; jangan cetak key.
- [ ] Private Storage vs build anon key perlu audit media tersendiri: cache lokal
      bisa menyembunyikan kegagalan cold-cache. Tidak dibuktikan Roles tests dan
      tidak boleh mengubah bucket policy agar public sebagai jalan pintas Domains.
- [ ] Catalog proof tidak setara mutation/role-execution proof seluruh fitur.
- [ ] Auth CMS: Google lewat Supabase atau pertahankan custom masih pending;
      bagian master plan lama adalah proposal, bukan approval.
- [ ] CAPTCHA: key Cloudflare belum diputuskan/disediakan.
- [ ] Retensi/pembukaan recruitment: belum diputuskan; accepting:false tetap.

Item bagian ini adalah issue/keputusan terpisah, **bukan** instruksi agar AI
Domains menyelesaikannya semua. Laporkan blocker yang benar-benar terjadi.

## 5. Aturan perubahan status

Pisahkan status `plan`, `kode lokal`, `SQL applied`, `QA lokal`, `pushed`,
`dua deployments`, `live acceptance`. Satu status tidak membuktikan lainnya.
Jangan mengarang hasil tes, env kedua Vercel, tanggal atau approval.
Update file ini dan kickoff/ai-handoff/AGENTS tiap checkpoint baru.
