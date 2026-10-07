# CMS → Supabase — kickoff aktif untuk AI baru

User: **Faiz**, panggil **bro**, bahasa Indonesia.
Work order berikutnya: **pass 4 Domains**, satu collection. Baseline kode live:
`53f92f8`. Planning sudah dibuat; kode/SQL Domains belum dibuat/applied.

## 1. Status yang benar

| Fitur                | Sumber/status                                                     |
| -------------------- | ----------------------------------------------------------------- |
| Recruitment pass 1–3 | Supabase, intake closed, login admin email/password               |
| CMS Projects pass 1  | Supabase Postgres + Storage projects, live                        |
| CMS Team pass 2      | Supabase Postgres + Storage team, live                            |
| CMS Roles pass 3     | Supabase Postgres, public read RPC cms_load_roles, live           |
| CMS Domains          | GAS saat ini; NEXT pass 4                                         |
| CMS Hods             | GAS; pass 5 sesudah Domains                                       |
| CMS Partners         | GAS; pass 6 sesudah Hods                                          |
| CMS auth             | OAuth custom existing, jangan sentuh sebelum seluruh data selesai |

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
4. [Domains Master Work Plan](cms-pass4-domains-plan.md): kontrak, SQL proposal,
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
  baru atau mengklaim `gas()` handler melayani Domains/Hods/Partners; saat ini
  mereka berasal dari **build-time GAS full export**.
- Full export GAS divalidasi sebelum Supabase override. Hods/Partners tetap
  GAS, dan tab migrated harus tetap valid; jangan hapus GAS atau env sekarang.
- Tidak ada fallback stale. RPC gagal → build gagal, snapshot lama tidak diganti.
- service_role/access token server-only; jangan print env, keys, raw error body,
  URLs bertoken, .env.local atau credentials.
- Konfirmasi sebelum **push baru**; origin memiliki dua push URLs. Approval
  `53f92f8` sudah digunakan, bukan izin push otomatis pass 4 atau dokumen baru.
- Sesi ini hanya planning/docs. Implementasi dimulai saat user mengirim prompt
  lanjut; jangan menganggap checklist TODO sudah dijalankan.

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
tests/cms-media.test.mjs. Usulan migration Domains: 20261011010000;
periksa collision sebelum membuatnya. Jangan mengubah actual Roles SQL.

## 6. Prompt siap copy ke AI baru

```text
Bro, lanjut implementasi CMS pass 4 Domains → Supabase di repo
/home/faiz/ds/ds5opencode.

Baca docs/cms-migration-kickoff.md → AGENTS.md → docs/ai-handoff.md →
docs/cms-pass4-domains-plan.md → docs/cms-migration-todo.md →
docs/cms-supabase-migration-plan.md → docs/cms-sop.md sebelum coding.

Baseline kode live 53f92f8: Projects/Team/Roles sudah Supabase, kedua Vercel
SUCCESS dan Roles acceptance selesai. Domains/Hods/Partners masih GAS.
Ikuti Master Work Plan Domains checklist A–E satu tahap demi satu tahap.

Scope hanya Domains: enam fixed ID/order, labels tiga nested row dengan blank
slot persis baseline, SQL private + RLS + public anon RPC, hybrid snapshot,
tes PostgreSQL nyata dan failure atomicity, 7 gate + SEO, docs + commit.
Tidak ada editor/write API/Storage/state baru. UI/geometri/font/artwork/Zod
existing/assertion tidak berubah. Auth paling akhir, jangan sentuh sekarang.

Periksa git/env/Node 22; jangan mencetak secret. Jangan reset perubahan asing,
reseed Team atau menimpa snapshot baseline: Team remote drift sudah ada.
GAS full export tetap dependency; jangan hapus tab/env/GAS. Jalankan full
CMS suite tanpa server env karena ada tes mutation Team live.

Kerjakan sampai hasil konkret siap review. Konfirmasi sebelum push baru;
origin sekali push men-deploy testing + production. Setelah push berizin,
verifikasi SHA/deployment dan live Home/Recruitment/routing kedua situs.
Laporkan bukti lokal vs live dan blocker yang benar-benar terjadi.
```

## 7. Keputusan yang tidak boleh diasumsikan

Auth CMS final/provider, CAPTCHA keys, retensi/pembukaan recruitment,
perbaikan Team drift, audit cold-cache media, refactor partial GAS validation,
dan penghapusan GAS memerlukan scope/keputusan sendiri. Tidak menambah semua
itu ke pass Domains atas inisiatif AI baru.
