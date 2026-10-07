# CMS → Supabase Migration — Kickoff untuk AI baru

## Status repo (8 Oct 2026)

**SUDAH LIVE di Supabase:**

- Recruitment pass 1-3 (intake, admin read, rate limit + refresh token)
- **CMS pass 1 — Projects** (tabel `private.cms_projects` + state, Storage bucket `cms-media/projects/`)
- **CMS pass 2 — Team** (tabel `private.cms_team_members` + state, Storage `cms-media/team/`)
- Hybrid snapshot: `rebuildTeamSnapshot()` konversi format DB → Zod
- Write via **Management API** (`/database/query`) karena PostgREST safeupdate blokir UPDATE di RPC
- Env baru: `SUPABASE_ACCESS_TOKEN` wajib di kedua Vercel (tanpa ini write admin gagal)

**Yang MASIH GAS/Sheets/Drive:** Roles, Domains, Hods, Partners (4 collection)

## Urutan sisa pass

| Pass | Collection   | Notes                           |
| ---- | ------------ | ------------------------------- |
| 3    | **Roles**    | Read-only publik, paling ringan |
| 4    | **Domains**  | Read-only, id fixed 6 baris     |
| 5    | **Hods**     | Read-only, tab/panel slot fixed |
| 6    | **Partners** | Read-only, 3 kategori + 4 why   |

## Arsitektur akhir

```
GAS/Sheets/Drive  ──►  Supabase Postgres + Storage
(roles, domains,        ├── cms_projects ✓
hods, partners)         ├── cms_team_members ✓
                        ├── Storage bucket cms-media/{projects,team}/
                        └── Supabase Auth (BELUM — auth = pass PALING AKHIR)
```

## Aturan keras

1. **Data dulu → auth terakhir.** Jangan sentuh auth admin sebelum semua collection migrasi.
   Handler `gas()` masih dipanggil untuk roles/domains/hods/partners.
2. **Satu collection per pass.** UI/geometri/font/artwork/assertion baseline TIDAK berubah. 7 gate + SEO tiap pass.
3. **Hybrid snapshot** — collection di Supabase dibaca via RPC (`SUPABASE_ANON_KEY` build-time).
   Sisanya dari GAS. Tidak ada fallback stale.
4. **Write via Management API** — karena PostgREST safeupdate, semua write operation panggil
   `POST /v1/projects/<ref>/database/query` dengan `SUPABASE_ACCESS_TOKEN`.
   Read tetap via `/rest/v1/rpc/` endpoint.
5. **`service_role` hanya di server.** `SUPABASE_ACCESS_TOKEN` juga server-only.
6. **Secret tidak dicetak.**
7. **Konfirmasi sebelum push.** Origin deploy ke dua situs.

## Env yang wajib di kedua Vercel

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ACCESS_TOKEN`

## File penting untuk AI baru

1. `docs/cms-pass1-projects-plan.md` — pola implementasi Pass 1
2. `docs/cms-pass2-team-plan.md` — pola implementasi Pass 2 (template untuk Pass 3)
3. `AGENTS.md` — aturan operasional, commands, gotchas
4. `docs/cms-supabase-migration-plan.md` — plan induk
5. `docs/cms-sop.md` — SOP CMS, secret handling
6. `server/cms-admin.mjs` — handler (projectsOperation + teamOperation sebagai template)
7. `scripts/cms-client.mjs` — syncCmsSnapshot + rebuildTeamSnapshot
8. `src/data/cms-schema.mjs` — Zod schema
9. `supabase/migrations/20261008010000_cms_projects_pass1.sql` — template migration SQL
10. `.env.local` — secret (jangan dicetak)

## Yang BELUM diputuskan

- Login admin: pindah ke Supabase Auth Google atau tetap OAuth custom? (Auth = pass terakhir)
- CAPTCHA (butuh key Cloudflare)
- Retensi/pembukaan publik recruitment

---

User adalah **Faiz** — panggil "bro". Bahasa Indonesia.
