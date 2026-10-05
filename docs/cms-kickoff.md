# CMS kickoff — prompt siap-tempel untuk AI baru

> **⚠️ DITUNDA (4 Oct 2026).** Tugas CMS belum dijalankan. Prioritas sekarang =
> **migrasi full-screen (hero gambar + section 100svh)** — lihat
> `docs/page-fullscreen-migration-plan.md`. Pakai dokumen ini **setelah** migrasi
> selesai.

Copy-paste seluruh blok di bawah ini ke AI baru (sesi baru) untuk memulai
pekerjaan **CMS / Admin Dashboard**. Prompt ini melengkapi
`docs/kickoff-prompt.md` (onboarding umum) dengan tugas CMS yang spesifik.

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
Rencana lengkap (3 opsi arsitektur, content model, jebakan, roadmap fase,
5 pertanyaan terbuka) SUDAH ADA di docs/cms-plan.md.

TUGAS PERTAMA:
1. `git status` dulu (harusnya bersih). Kalau ada yang belum di-commit, tanya user.
2. Ringkas ke user: (a) status project, (b) NEXT-nya, (c) 5 pertanyaan terbuka
   di docs/cms-plan.md §9. Tanyakan jawabannya dulu — JANGAN sentuh kode sebelum
   dijawab.
3. Setelah dijawab, tulis Master Plan Fase 0: pindahkan `src/data/*.ts` menjadi
   Astro Content Collections (`src/content/`) + skema Zod. Kerjakan SATU
   collection per pass. TAMPILAN & GEOMETRI TIDAK BOLEH BERUBAH. Lalu 7 gate + seo.
4. Setelah Fase 0 hijau, baru pasang Keystatic (Fase 1, `@keystatic/astro`,
   admin di `/keystatic`, git-based, tanpa DB).

ATURAN TETAP (jangan dilanggar):
- spacing/padding/margin = kelipatan 8 (gate `npm run audit:spacing`);
- heading = Bluu Next Bold 700 (`--font-display`), body Manrope;
- geometri ±1px, render `prefers-reduced-motion: reduce` tetap pixel-exact;
- satu section/collection per pass + 7 gate + `seo:audit`;
- jangan rusak presisi Home (`1430:2040`) & Recruitment (`1436:3505`);
- commit per fitur, KONFIRMASI user sebelum push; `git push origin main`
  = deploy ke testing + production sekaligus;
- geometri kartu (`domains.ts` `rows`, `roles.ts` `centered`/`tight`) itu DESAIN,
  jangan diekspos ke CMS; `verify.mjs` mengunci sebagian jumlah konten.
```
