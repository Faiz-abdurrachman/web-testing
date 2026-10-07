# CMS → Supabase — kickoff aktif untuk AI baru

Faiz, panggil **bro**, bahasa Indonesia. Repo `/home/faiz/ds/ds5opencode`.
Work order aktif **pass 6 Partners**, [Master Work Plan](cms-pass6-partners-plan.md)
rinci siap **PLAN ONLY**. Belum SQL/runtime/apply/deploy Partners. Baca file ini
seluruhnya termasuk prompt §6; jangan mengulang pass Hods yang sudah LIVE.

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
| Partners           | GAS; pass6 PLAN ONLY                                         |
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
decode diuji terpisah. Planning belum membuktikan Partners GAS/destination parity.

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

## 6. Prompt siap salin untuk AI baru

```text
Bro, lanjut implementasi CMS pass 6 Partners → Supabase di
/home/faiz/ds/ds5opencode.

Baca docs/cms-migration-kickoff.md seluruhnya termasuk §6, lalu urutan wajib:
AGENTS.md → docs/ai-handoff.md → docs/cms-pass6-partners-plan.md →
docs/cms-migration-todo.md → docs/cms-supabase-migration-plan.md → docs/cms-sop.md.
Ikuti Master Work Plan Partners checklist A–E, rinci satu tahap demi satu tahap.
Sebelum UI baca pixel SOP/assets/fullscreen plan; UI tidak diotorisasi berubah.

Baseline deployed526b428 (checkpoint docs), fitur Hods763bafc; keduanya sudah
push, dua Vercel READY dan Hods accepted. Planning Partners terbaru lokal,
lihat git log/status; periksa Node22 dahulu. Jangan reset/perubahan asing.
Partners PLAN ONLY: belum SQL/runtime/apply/deploy, jangan mengulang Hods.

Scope hanya Partners: tiga category labels, satu local logo path, empat why
pairs, strict keys/types/array order. Count10/5/5 dan empat icons tetap lokal,
20 slot logo bukan20DBrecords. Rekonsiliasi GAS/snapshot/destination sebelum
seed/apply, additive private singleton/RLS/anon RPC, hybrid setelah Hods,
PostgreSQL ephemeral/security/actual role denials/Unicode/path/rerun, failure
atomicity tanpa fallback, full local tests, Partners browser/boundaries,
tujuh gate + SEO, tiga admin mocks, snapshot/19HTML parity, docs/commit reviewable.
Partners SQL Unicode cocok actual Zod codepoints; jangan salin UTF16 helper
Hods atau ubah applied migrations/schema. Jangan claim GAS parity dari planning.

UI/geometri/font/artwork/Zod/assertions/admin/auth/media/dependencies tetap.
Tanpa editor/write API/state/Storage baru. Jangan mutation/reseed Team atau
perbaiki drift; same captured inputs pre/post dan baseline repo tetap.
Full test:cms tanpa env server agar Team live mutation tests SKIP. Secrets
jangan dicetak; anon key bila missing ambil privately/in-memory via existing
Management API, bukan service key. Cek env presence kedua Vercel saat E.
Jangan hapus GAS/tab/env: full export masih dependency setelah enam content
sources Supabase. Auth CMS terakhir; recruitment tetap accepting:false.

Lanjut sampai hasil konkret siap review, kerja/commit lokal authorized.
Konfirmasi sebelum push baru; izin763bafc/526b428 sudah digunakan, origin sekali
push deploy dua situs. Tidak trigger hooks/deploy sebelum izin. Sesudah push
berizin: dua exact SHA READY/primary aliases/timestamps actual, Partners390/1440
kedua situs exact labels/counts/why/order/alt/icons/art/VT/nav/no overflow/errors,
public regression, admin anonymous401 dan recruitmentclosed tanpa mutation.
Pisahkan planning/local/SQLapplied/pushed/deploy/live, laporkan blocker nyata.
Panggil gw bro, bahasa Indonesia.
```

## 7. Sesudah Partners dan keputusan terpisah

Partners diterima dulu, lalu auth CMS final (provider/mekanisme belum diputuskan).
Penghapusan GAS memerlukan audit dependency/backup/observasi/izin tersendiri;
seluruh CMS belum selesai hanya karena enam content sources Supabase.
Team drift repair, private media cold-cache, partial validation, CAPTCHA,
retensi/pembukaan recruitment, milestones/settings bukan scope otomatis.
