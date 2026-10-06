# CMS kickoff — prompt siap-tempel untuk AI baru

Copy-paste seluruh blok di bawah ini ke AI baru (sesi baru) untuk memulai
pekerjaan **CMS / Admin Dashboard**. Prompt ini melengkapi
`docs/kickoff-prompt.md` (onboarding umum) dengan tugas CMS yang spesifik.

Rencana lengkap: `docs/cms-plan.md`. Status: **RENCANA (belum dieksekusi)**.

```text
Sesi baru. Kamu lanjut kerja di repo "Data Sorcerers" — Astro static + Vercel,
target pixel-accurate ke Figma. Ini sesi baru, jadi orientasi dulu.

WAJIB baca dulu (urut, jangan skip):
1. docs/kickoff-prompt.md        → onboarding umum (aturan presisi, 7 gate, status, NEXT)
2. AGENTS.md                     → operating manual (commands, konvensi, gotchas)
3. docs/pixel-precision-sop.md   → SOP presisi piksel (kalau nanti sentuh UI)
4. docs/ai-handoff.md            → state terkini
5. docs/cms-plan.md              → ★ RENCANA CMS / ADMIN DASHBOARD (tugas utama)

KONTEKS TUGAS:
User mau bikin CMS/admin dashboard supaya editor NON-TEKNIS bisa update project,
team/orang, role, prestasi, HoDS, dan partners TANPA menyentuh kode.
KEPUTUSAN USER (6 Oct 2026) — sudah final:
- Backend: Google Apps Script (GAS) + Google Sheets (DB) + Google Drive (gambar)
- Update ke situs: build-time fetch (scripts/fetch-cms.mjs) + Vercel rebuild hook
- Admin: halaman custom yang di-host GAS (HtmlService), login Google, 1-2 admin
- Save = live (rebuild otomatis ~1-2 menit), TANPA draft/preview
Rencana lengkap: docs/cms-plan.md (arsitektur, skema Sheet, fase B0-B4, jebakan,
kebutuhan user §6).

TUGAS PERTAMA:
1. `git status` dulu (harusnya bersih). Kalau ada yang belum di-commit, tanya user.
2. Ringkas ke user: (a) status project, (b) NEXT-nya, (c) kebutuhan user di
   docs/cms-plan.md §6 (akun Google, folder Drive, 2 URL Vercel Deploy Hook,
   setuju mulai Fase B0). Tanyakan dulu — JANGAN sentuh kode sebelum dijawab.
3. Setelah dijawab, kerjakan Fase B0: snapshot `src/data/cms-snapshot.json` +
   thin loader (src/data/*.ts baca snapshot; import komponen tetap sama) + skema
   Zod + scripts/fetch-cms.mjs mode fallback. TAMPILAN & GEOMETRI TIDAK BOLEH
   BERUBAH. Kerjakan SATU collection per pass, 7 gate + seo tiap pass.
4. Setelah Fase B0 hijau, Fase B1 pasang GAS (Sheet + doGet export + token) lalu
   Fase B2 admin page (HtmlService) + upload Drive + Deploy Hook.

ATURAN TETAP (jangan dilanggar):
- spacing/padding/margin = kelipatan 8 (gate `npm run audit:spacing`);
- heading = Bluu Next Bold 700 (`--font-display`), body Manrope;
- geometri ±1px, render `prefers-reduced-motion: reduce` tetap pixel-exact;
- satu collection/langkah per pass + 7 gate + `seo:audit`;
- jangan rusak presisi Home (`1430:2040`) & Recruitment (`1436:3505`);
- commit per fitur, KONFIRMASI user sebelum push; `git push origin main`
  = deploy ke testing + production sekaligus;
- geometri kartu (`domains.ts` `rows`, `roles.ts` `centered`/`tight`, `team.chip`/
  `fade`) itu DESAIN, jangan diekspos ke CMS; `verify.mjs` mengunci sebagian
  jumlah konten (jangan longgarkan assertion geometri);
- secret (token/Deploy Hook/folder id/email admin) di GAS Script Properties +
  Vercel env, JANGAN di repo;
- Drive bukan CDN: artwork pixel-exact tetap dibake manual; konten foto boleh
  upload.
```
