# CMS → Supabase — kickoff aktif untuk AI baru

User: **Faiz**, panggil **bro**, bahasa Indonesia.
Work order berikutnya: **pass 5 Hods**, satu collection, Master Work Plan dahulu.
Baseline kode live **`6b36519`**; Domains A–E selesai, kedua deployments READY dan
acceptance Home/Recruitment/routing kedua situs PASS. Checkpoint docs lokal
belum dipush; izin push feature telah digunakan.

## 1. Status yang benar

| Fitur                | Sumber/status                                                     |
| -------------------- | ----------------------------------------------------------------- |
| Recruitment pass 1–3 | Supabase, intake closed, login admin email/password               |
| CMS Projects pass 1  | Supabase Postgres + Storage projects, live                        |
| CMS Team pass 2      | Supabase Postgres + Storage team, live                            |
| CMS Roles pass 3     | Supabase Postgres, public read RPC cms_load_roles, live           |
| CMS Domains          | Supabase public anon RPC, live dan acceptance selesai             |
| CMS Hods             | GAS; pass 5 sesudah Domains                                       |
| CMS Partners         | GAS; pass 6 sesudah Hods                                          |
| CMS auth             | OAuth custom existing, jangan sentuh sebelum seluruh data selesai |

Bukti historis Roles sebelum pass 4 (status Domains terbaru di checkpoint):

Commit `53f92f8` terkirim ke testing + production dengan izin user. Kedua
Vercel SUCCESS, live browser six Roles × 390/1440 × dua situs PASS; admin API
anonymous 401, recruitment accepting:false. Local QA: CMS 42 PASS/10 SKIP
(tes Team mutation live), Recruitment 24 PASS, PostgreSQL Roles nyata,
7 gate + SEO PASS, snapshot repo/19 HTML baseline identik.

Tanggal bukti deploy: testing 2026-10-07 11:20:17 UTC dan production
11:21:28 UTC (18:20:17/18:21:28 WIB). Nama file migration bertanggal kemudian
adalah urutan file repo, bukan bukti tanggal execution. Catatan tanggal historis
8 Oct tidak mengalahkan timestamp deployment actual.

## 2. Urutan baca dan dokumen otoritatif

1. File ini: checkpoint + starter prompt.
2. `AGENTS.md`: aturan operasional dan izin.
3. [AI handoff](ai-handoff.md): status/batas bukti terbaru.
4. [Domains Master Work Plan](cms-pass4-domains-plan.md): kontrak, SQL actual,
   kritik risiko, checklist A–E, tes dan DoD.
5. [Migration TODO](cms-migration-todo.md): done vs TODO seluruh pass.
6. [Master migration plan](cms-supabase-migration-plan.md) + [CMS SOP](cms-sop.md).
7. [Roles plan](cms-pass3-roles-plan.md), actual SQL Roles dan tests Roles:
   template read-only paling relevan; Projects/Team bukan template CRUD Domains.
8. Baca `docs/pixel-precision-sop.md` + `docs/assets.md` sebelum perubahan UI apa
   pun; pass Domains justru mengunci UI tanpa perubahan.

Checkpoint aktif + arahan user terbaru mengalahkan NEXT/setup/auth historis.
Jangan membaca arsip GAS sebagai work order untuk membuat ulang setup.

## 3. Aturan dan koreksi arsitektur

- Satu collection/pass; tidak menyentuh UI/font/artwork/geometri/assertion.
- Data dulu; auth CMS paling akhir. Pilihan mekanisme auth belum final.
- Read migrated collections via RPC build-time **anon key**. Write existing
  Projects/Team lewat Management API database/query dengan access token server.
- Domains/Roles tidak punya editor atau write API. Jangan membuat handler admin
  baru atau mengklaim `gas()` handler melayani Domains/Hods/Partners. Kode lokal
  Domains memakai RPC; Hods/Partners tetap **build-time GAS full export**.
- Full export GAS divalidasi sebelum Supabase override. Hods/Partners tetap
  GAS, dan tab migrated harus tetap valid; jangan hapus GAS atau env sekarang.
- Tidak ada fallback stale. RPC gagal → build gagal, snapshot lama tidak diganti.
- service_role/access token server-only; jangan print env, keys, raw error body,
  URLs bertoken, .env.local atau credentials.
- Konfirmasi sebelum **push baru**; origin memiliki dua push URLs. Approval
  `53f92f8` sudah digunakan, bukan izin push otomatis pass 4 atau dokumen baru.
- Domains A–E selesai dengan izin push baru. NEXT Hods perlu plan sendiri;
  jangan apply ulang SQL Domains atau menganggap semua CMS sudah selesai.

## 4. Temuan yang wajib dipertahankan

- Team remote berbeda snapshot repo sebelum pass 3. Proof pre/post menunjukkan
  non-Roles tidak diubah. Jangan reseed Team atau menimpa baseline snapshot.
- Domains labels nested tiga row mengandung blank dekoratif **persis ''**;
  ID/order terikat desain via array index. Mask lengkap di plan §3.
- .env.local saat pass 3 tidak memiliki SUPABASE_ANON_KEY. Verifikasi memakai
  Management API membaca anon key di memori, tanpa mencetak atau menulis env.
  Cek presence ulang; jangan menganggap env lokal/dua Vercel otomatis sama.
- Full `test:cms` dengan server env dapat menjalankan mutation Team live.
  Jalankan suite tanpa env server; tes Domains baru memakai DB ephemeral.
- Private Storage read dengan build anon key/cold cache belum diaudit oleh
  Roles pass. Jangan membuka bucket atau memperbaiki media diam-diam di Domains.
- Artifacts ignored bisa hilang; simpan ringkasan di docs, buat proof baru saat
  implementasi. Node 22, bukan mengandalkan instalasi/temp server AI lama.

## 5. Env dan file implementasi

Empat env wajib kedua Vercel: SUPABASE_URL, SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN. Env GAS dipertahankan.
Project existing web-community, ref yejrdckcmlxrkklgtrwy.

File utama: scripts/cms-client.mjs, src/data/cms-schema.mjs,
src/data/cms-snapshot.json, src/data/domains.ts,
supabase/migrations/20261010010000_cms_roles_pass3.sql,
tests/cms-roles-supabase.test.mjs, tests/cms.test.mjs,
tests/cms-media.test.mjs. Migration Domains actual: 20261011010000, applied. Tes baru:
tests/cms-domains-supabase.test.mjs. Jangan mengubah actual Roles SQL.

## 6. Prompt lanjut pass 5

```text
Bro, baseline kode live 6b36519: Projects/Team/Roles/Domains Supabase.
Domains A–E selesai: SQL/RPC nyata, dua Vercel READY, Home/Recruitment/routing
390/1440 kedua situs PASS. Baca kickoff → AGENTS → ai-handoff → TODO → master
migration plan → CMS SOP. Periksa git/commit docs lokal terbaru dan Node 22.
NEXT Hods: susun Master Work Plan tersendiri dahulu, inventaris six IDs +
ordered tabs/panels/text vs bullets/slot counts, rekonsiliasi GAS/snapshot.
Jangan implementasi collection lain atau auth. UI/Zod/assertions tetap, jangan
reseed Team atau hapus tab/env GAS. Full suite CMS tanpa env server.
Kerja/commit lokal diizinkan; konfirmasi sebelum push baru, origin deploy dua situs.
```

## 7. Keputusan yang tidak boleh diasumsikan

Auth CMS final/provider, CAPTCHA keys, retensi/pembukaan recruitment,
perbaikan Team drift, audit cold-cache media, refactor partial GAS validation,
dan penghapusan GAS memerlukan scope/keputusan sendiri. Tidak menambah semua
itu ke pass Domains atas inisiatif AI baru.
