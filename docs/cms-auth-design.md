# Auth CMS → Supabase — Design final (pass B1)

Status: **local implementation, belum apply/deploy**. Keputusan user 7 Oct 2026:
provider **password Supabase**, SDK **`@supabase/supabase-js` server-only**,
allowlist CMS terpisah, cookie namespace terpisah + logout lokal, live action
butuh izin konkret. Menggantikan asumsi Google/password plan awal: **tidak ada
OAuth/PKCE/callback/`uri_allow_list` CMS** dan **tidak ada account linking**.

## 1. Route dan method

| Route                              | Method     | Kontrak                                                                                       |
| ---------------------------------- | ---------- | --------------------------------------------------------------------------------------------- |
| `/api/admin/auth/login`            | `GET`      | Halaman shell sudah memuat form; GET mengembalikan 303 ke `/admin/` (tanpa flow OAuth)        |
| `/api/admin/auth/login`            | `POST`     | JSON `{email,password}` + Origin exact → sesi CMS ter-seal; 200 `{ok:true}` / error sanitized |
| `/api/admin/auth/logout`           | `POST`     | Origin + CSRF → hapus cookie sesi CMS; 200 `{ok:true}`                                        |
| `/api/admin/auth/refresh`          | `POST`     | Origin + CSRF → rotate access/refresh dalam cookie ter-seal; 200 `{ok:true,refreshed:true}`   |
| `/api/admin/{projects,team,media}` | `GET/POST` | Sesi CMS + permission per request; POST Origin+CSRF; transport/sanitasi existing tak berubah  |

Route individual existing dipertahankan (bukan catch-all, bukan Astro SSR).

## 2. Session model

- Cookie: **`__Host-ds-admin-session`** (HTTPS) / **`ds-admin-session`** (localhost dev),
  `Path=/; HttpOnly; SameSite=Lax; Secure` (HTTPS). Nilai = AES-256-GCM sealed
  (`CMS_ADMIN_SESSION_SECRET` 32-byte base64, AAD = purpose + origin), berisi
  `{ access, refresh, csrf, exp }`. `exp` = access token expiry (clock server).
- Satu-satunya state sesi CMS ada di cookie ini. Browser **tidak** menyimpan
  token Supabase, tidak ada `sb-*`, tidak ada localStorage/HTML token.
- Cookie recruitment (`sb-access-token`/`sb-refresh-token`) **tidak disentuh**.
- Nama cookie CMS tidak pernah sama dengan recruitment.

## 3. Otorisasi per request

Urutan untuk setiap request API CMS:

1. `config(env)` valid (origin/secret/...), origin request == `CMS_ADMIN_ORIGIN`.
2. Unseal cookie sesi CMS; tanpa/rusak/expired → 401 sanitized.
3. **Trusted identity:** `supabase.auth.getUser(access)` (network ke Auth server,
   server-validated) dengan `SUPABASE_ANON_KEY` sebagai apikey.
4. **CMS permission:** RPC `cms_verify_admin(p_auth_id)` (service_role) →
   `{ok, email}`; `active=true` wajib. Bukan owner/inactive → 403 sanitized.
5. POST: Origin exact + `X-CSRF-Token` == `session.csrf` (constant-time).
6. Operasi privileged existing (projects/team/media) dijalankan.
7. Gagal Auth/permission/DB/network → **fail closed**, error sanitized, tidak ada
   fallback ke cookie lama atau cek GAS owner.

`getSession()`/decode JWT lokal/email/UID client **tidak dipakai** untuk otorisasi.

## 4. Login/kredensial

- `POST /login`: validasi Origin + content-type json + body cap 4096 + shape
  `{email,password}` (string, email ≤320, password ≤256). Rate limit CMS
  (terpisah dari recruitment) via RPC `cms_rate_limit_check/reset`.
- `supabase.auth.signInWithPassword({email,password})` (anon key). Gagal → 401
  `UNAUTHORIZED` sanitized (tanpa bocorkan detail upstream).
- Cek allowlist `cms_verify_admin(user.id)`; gagal → bersihkan sesi/flow, 403.
- Sukses: seal `{access, refresh, csrf, exp}`, set cookie, 200 `{ok:true}`.
- Non-owner: tidak ada cookie sesi, error sanitized.
- Belum ada enrollment otomatis dari email/domain/metadata. Owner di-provision
  manual/seed privat (butuh izin konkret di C).

## 5. Cookie & CSRF contract (dipertahankan)

- `csrf` acak 256-bit (`randomBytes(32).toString('base64url')`, 43 char) disimpan
  dalam sesi ter-seal; respons sukses mengembalikan `csrf`; editor mengirim
  `X-CSRF-Token`. Perbandingan `timingSafeEqual`.
- Token lama otomatis invalid saat login/logout/refresh (cookie baru menggantikan).
- `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`,
  `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` untuk semua
  respons auth/admin/media/error.
- Error sanitized: hanya `{ok:false,error:{code}}` dengan code dari allowlist.

## 6. Refresh & lifecycle

- Access token `jwt_exp=3600` (dari config Auth actual). Cookie sesi `Max-Age` =
  umur access token (≤3600s).
- Saat access expired tapi refresh valid: server refresh via SDK
  `refreshSession({refresh_token})`, rotate cookie (access+refresh baru), tetap
  permission check sebelum operasi. `refresh_token_rotation_enabled=true` (reuse
  interval 10s) → simpan refresh **terbaru**; parallel request deterministic
  fail-safe (satu menang, lain pakai cookie yang ada / 401 graceful).
- Refresh gagal/replay → hapus cookie, 401; UI tidak mengklaim save berhasil.
- Logout: `signOut({scope:'local'})` opsional best-effort + hapus cookie sesi CMS.
  Residual lifetime access JWT didokumentasikan (tidak instant-revoke global).
- Cookie expiry ≠ Auth session lifetime; lifetime final eksplisit di sini.

## 7. SQL proposal (additive, terisolasi)

Filename: `supabase/migrations/20261014010000_cms_auth_pass7.sql` (setelah pass6).

Tabel `private.cms_admin_permissions`:

- `auth_id uuid primary key` (trusted Supabase Auth user id — kolom actual Auth
  `auth.uid()` bertipe uuid, beda dari recruitment `auth_id text`),
- `email text not null default ''`, `active boolean not null default true`,
  `created_at timestamptz not null default now()`.
- RLS enabled + `revoke all` dari public/anon/authenticated (deny by default).
- Minimal metadata; tidak ada PII sensitif.

Rate limit CMS: `private.cms_rate_limit` (ip text, email text, attempts int,
window_start timestamptz) + helper check/reset — **terpisah** dari recruitment.

Fungsi `SECURITY DEFINER`, `set search_path = pg_catalog`, objek qualified:

- `private.cms_verify_admin(p_auth_id uuid) returns jsonb` → `{ok,email}`.
- `private.cms_rate_limit_check(p_ip,p_email,p_max,p_window)` / `_reset`.
- Public wrapper `public.cms_verify_admin(uuid)` + rate wrappers,
  `revoke all ... from public, anon, authenticated; grant execute ... to service_role`.
- Tidak ada grant authenticated untuk tulis/baca tabel CMS. Anon tidak bisa enumerasi.
- Tidak ada owner email/UID/secret hardcoded di migration tracked. Seed grant
  diprovision privat setelah mapping disetujui.

## 8. UI (admin internal, bukan public site)

- Halaman `/admin/` dan `/admin/team/`: ganti link "Masuk dengan Google" menjadi
  **form email+password** inline (label, input email, input password,
  tombol "Masuk"). Tanpa Figma node → ukuran/spacing diukur dari layout admin
  existing (token warna/font yang sudah ada), 8pt, aksesibel (focus-visible,
  label, aria-live status).
- Editor JS: blok `401` menampilkan form login, bukan redirect Google.
- Logout tetap tombol existing; kirim CSRF.
- Public UI/geometri/artwork **tidak berubah** (admin bukan bagian situs publik).

## 9. Error matrix

| Kondisi                                 | Status  | Catatan                             |
| --------------------------------------- | ------- | ----------------------------------- |
| Sesi absen/tampered/expired             | 401     | sanitized, zero privileged call     |
| Auth user valid tapi non-owner/inactive | 403     | tanpa records/media/CSRF privileged |
| Login kredensial salah                  | 401     | tanpa detail upstream               |
| Rate limit login                        | 429     | `LIMIT`                             |
| Origin/CSRF/content-type salah POST     | 403/415 | sebelum privileged call             |
| Auth/permission timeout/malformed       | 401/502 | fail closed, no fallback            |
| Refresh gagal/replay                    | 401     | cookie dihapus, no write replay     |
| Config absen                            | 503     | sanitized                           |

## 10. Rollback

- Tidak drop tabel additive; tidak revert data.
- Kode lama OAuth custom + env `CMS_ADMIN_GOOGLE_*`/`CMS_ADMIN_API_DEPLOYMENT_ID`
  **dipertahankan** sampai acceptance+observation (tidak dihapus pass ini).
- Bila gagal: revert auth-code + dua deployment dengan izin push berlaku;
  restore config scoped. Re-login setelah cutover/rollback expected.
- GAS export/env/tab/deployment tidak disentuh.

## 11. Env (nama saja)

- Sudah ada: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
  `SUPABASE_ACCESS_TOKEN`, `CMS_ADMIN_ORIGIN`, `CMS_ADMIN_SESSION_SECRET`, hooks.
- Dipakai baru: `SUPABASE_ANON_KEY` untuk `getUser`/password grant (sudah ada di
  kedua Vercel, target production/preview/development).
- Tidak dihapus: `CMS_ADMIN_GOOGLE_CLIENT_ID/SECRET`, `CMS_ADMIN_API_DEPLOYMENT_ID`.

## 12. Definition of Done (local B)

- [ ] Migration + ephemeral PostgreSQL proof (valid/absent/inactive, role denials,
      rerun, injection) **tanpa apply live**.
- [ ] `server/cms-auth.mjs` lifecycle + integrasi `server/cms-admin.mjs`.
- [ ] UI form password di dua halaman admin; editor 401 handling.
- [ ] Focused auth tests (+ adapt native tests) tanpa hapus security test.
- [ ] `npm run test:cms` tanpa env server: Team live SKIP; recruitment 24 PASS.
- [ ] 7 gate + SEO, 3 admin mock 4 widths, snapshot/19 HTML parity.
