%Urutan benar: **data dulu (semua collection) → auth terakhir.** Setelah
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
