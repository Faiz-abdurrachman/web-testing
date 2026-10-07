# CMS → Supabase Migration — Kickoff untuk AI baru

## Status repo (7 Oct 2026, setelah sesi terakhir)

**Yang SUDAH LIVE di Supabase:**

- Recruitment pass 1 (intake): tabel `private.recruitment_applications`, RPC `submit_recruitment_application`
- Recruitment pass 2 (admin read): login email+password, audit, allowlist
- Recruitment pass 3 (rate limit + refresh token): 5 attempts/min/IP+email, auto-refresh 30 menit
- Tests 24/24 PASS, migration sudah di-apply, kode SUDAH PUSH ke origin

**Yang MASIH GAS/Sheets/Drive:** SELURUH CMS (projects, team, roles, domains, hods, partners)

**Target akhir (disetujui user):** Seluruh backend ke Supabase (Postgres + Storage + Supabase Auth).
Astro/UI/geometri/font/assertion baseline TIDAK berubah.

---

## Apa yang harus dikerjakan — Migrasi CMS ke Supabase

### Arsitektur akhir

```
GAS/Sheets/Drive  ──►  Supabase Postgres + Storage
(satu per satu)          ├── cms_projects, team, roles, domains, hods, partners
                         ├── Storage bucket privat buat foto
                         └── Supabase Auth buat login admin
```

### Urutan (6 pass, 1 collection per pass)

| Pass | Collection   | Notes                                                                           |
| ---- | ------------ | ------------------------------------------------------------------------------- |
| 1    | **Projects** | Paling matang — sudah ada editor native, growth, media upload. Mulai dari sini. |
| 2    | **Team**     | Sudah ada editor. Foto pindah dari Drive ke Storage.                            |
| 3    | **Roles**    | Read-only publik, gak ada editor sendiri.                                       |
| 4    | **Domains**  | Read-only, id fixed.                                                            |
| 5    | **Hods**     | Read-only, id fixed.                                                            |
| 6    | **Partners** | Read-only.                                                                      |

### Tiap pass

1. Migration SQL (tabel di `private`, RLS, fungsi baca/tulis, seed data)
2. Update `fetch-cms.mjs` / handler (dari GAS ke Supabase)
3. **Hybrid snapshot** — collection yg sudah di Supabase dibaca dari DB, sisanya masih dari GAS
4. Test + 7 gate
5. Push

### Function count

Sekarang: 8 dari 12 quota Vercel Hobby. Dengan 1 catch-all CMS (`api/admin/cms/[...route].js`) = 9. Aman.

### Yang TIDAK berubah

- UI, geometri, font, artwork, snapshot Zod, verify.mjs
- Astro tetap static, build-time fetch
- 7 gate + SEO tiap pass

### File penting yang perlu dibaca sebelum mulai

1. `docs/cms-supabase-migration-plan.md` — plan induk (sudah direview user)
2. `docs/recruitment-supabase-migration-plan.md` — pola migrasi recruitment sebagai referensi
3. `AGENTS.md` — aturan operasional, commands, gotchas
4. `docs/cms-sop.md` — SOP CMS, secret handling, protokol pass
5. `docs/ai-handoff.md` — state terkini recruitment
6. `docs/kickoff-prompt.md` — konteks lengkap repo
7. `docs/cms-b2-plan.md` — plan Projects Growth sebelumnya
8. `docs/cms-plan.md` — rencana CMS GAS asli
9. `server/cms-admin.mjs` — handler GAS admin existing (yang akan diganti)
10. `server/cms-media.mjs` — pipeline media
11. `scripts/fetch-cms.mjs` — build-time fetch
12. `scripts/cms-client.mjs` — syncCmsSnapshot
13. `src/data/cms-snapshot.json` — snapshot kanonik
14. `src/data/cms-schema.mjs` — Zod schema
15. `tests/cms*.test.mjs` — test suite
16. `.env.local` — secret (jangan dicetak, jangan commit)

### Constraints

- `SUPABASE_ACCESS_TOKEN` ada di `.env.local` — untuk apply migration via Management API
- Supabase project ref: `yejrdckcmlxrkklgtrwy` (web-community, ap-southeast-1)
- Migration via: `POST https://api.supabase.com/v1/projects/<ref>/database/query`
- Vercel Hobby = max 12 serverless functions
- Push origin = deploy ke DUA situs (testing + production) — KONFIRMASI DULU

### ⚠️ ATURAN KERAS: Auth = pass PALING AKHIR (coupling)

**Jangan pindah auth admin ke Supabase Auth sebelum SEMUA collection selesai
migrasi.** Alasan teknis (bukan sekadar risiko):

`server/cms-admin.mjs:345` fungsi `gas()` memanggil Apps Script API
(`https://script.googleapis.com/v1/scripts/<deployment>:run`) dengan
`Authorization: Bearer <Google access token>`. Token itu berasal dari **OAuth
custom** (PKCE/state/AES cookie). Selama masih ada collection yang dibaca dari
GAS (team, roles, domains, hods, partners), handler **wajib** punya Google
token itu.

Kalau auth diganti ke Supabase Auth lebih awal:

- Google access token hilang (Supabase Auth tidak menerbitkannya)
- Collection yang belum dimigrasi **mati total** (load/save rusak)

Urutan benar: **data dulu (semua collection) → auth terakhir.** Setelah
`script.googleapis.com` tidak dipanggil lagi, baru ganti auth ke Supabase Auth
(lihat §5.4 plan induk).

Pass 1 (Projects) **tetap pakai OAuth custom** — bukan "nanti aja", tapi karena
memang harus begitu.

### Yang BELUM diputuskan (tanya user dulu)

- Login admin: pindah ke Supabase Auth Google atau tetap OAuth custom?
- Mulai kapan?

---

## Ringkasan percakapan sesi terakhir

User memilih **Pass 3 (rate limit + refresh token)** setelah orientasi.
Sudah dikerjakan:

1. Migration SQL `20261007210000_recruitment_pass3_rate_limit.sql` — tabel + fungsi + public wrapper
2. Apply ke Supabase via Management API
3. Rate limit check di `loginWithPassword` (5 attempts/min/IP+email, 429 LIMIT)
4. Route `POST refresh` di catch-all + handler
5. Client auto-refresh tiap 30 menit
6. 5 test baru → 24/24 PASS
7. Build, CMS tests (36/36), format, SEO — ALL PASS
8. Docs updated (AGENTS.md, ai-handoff.md, recruitment-plan)
9. Kode commit + push

Setelah itu user minta dibuatin plan CMS migration lengkap — dan memutuskan
untuk **eksekusi di AI baru** biar konteks gak hilang. Dokumen ini adalah handoff-nya.

User adalah **Faiz** — panggil "bro". Bahasa Indonesia.
