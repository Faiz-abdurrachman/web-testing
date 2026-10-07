# Auth CMS → Supabase — Master Work Plan untuk AI baru

Status **PLAN ONLY, 7 Oct 2026**. Faiz meminta persiapan rinci sekarang dan
**eksekusi di sesi AI baru**. Sesi penyusunan ini hanya docs; tidak ada kode,
SQL, apply, provider setting, user/identity mutation, dependency, push atau deploy
baru. Provider dan mekanisme sesi belum dipilih. Checklist A–E di bawah adalah
work order bersyarat; jangan menandai implementasi selesai berdasarkan planning.

## 1. Checkpoint dan urutan baca

Runtime live **925d577**; Partners A–E accepted, kedua primary aliases exact SHA
READY 7 Oct 2026: testing 13:57:59.202 UTC /20:57:59.202 WIB, production
13:59:13.031 UTC /20:59:13.031 WIB. Checkpoint docs **3229c5b lokal**, disusul
commit planning ini (lihat git log). Origin/production masih925d577 sampai push
baru disetujui. Izin push925d577 sudah digunakan. Jangan reset perubahan asing.

Urutan wajib: kickoff migrasi seluruhnya termasuk §6 → AGENTS → ai-handoff →
file ini seluruhnya → migration TODO → master migration plan → CMS SOP.
Lalu baca actual files §2, bukan hanya proposal lama §5.4. Sebelum UI baca
pixel-precision SOP, assets provenance dan page-fullscreen migration plan.
Checkpoint aktif dan keputusan user terbaru mengalahkan NEXT historis.

Keenam content collections Supabase RPC build-time. Projects/Team writes lewat
Management API; media private Supabase Storage. **Full GAS export tetap
required dan divalidasi sebelum overrides.** Auth cutover bukan GAS removal.
Recruitment Auth email/password terpisah, accepting:false. Team drift
preexisting tetap; jangan reseed/reconcile dengan menimpa snapshot.

## 2. Inventory actual yang menjadi dasar plan

| File/jalur                                                    | Peran actual / kontrak yang dipertahankan                                                                          |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `server/cms-admin.mjs`                                        | Factory handler; Google OAuth custom; encrypted cookie; Projects/Team/media dispatch; Origin/CSRF; sanitasi; hooks |
| `api/admin/auth/login.js`, `callback.js`, `logout.js`         | Tiga route individual existing; bukan catch-all, bukan Astro SSR callback                                          |
| `api/admin/projects.js`, `team.js`, `media.js`                | Route owner existing; tetap server-mediated                                                                        |
| `server/cms-media.mjs`                                        | Normalisasi raster/hash/batas upload; tidak refactor                                                               |
| `src/pages/admin/index.astro`, `team.astro`                   | Static noindex shell, tanpa records/secrets; layout tetap                                                          |
| `src/scripts/cms-admin-editor.js`, `cms-team-editor.js`       | Same-origin fetch, `result.csrf`, `X-CSRF-Token`, POST logout; UX tetap                                            |
| `server/recruitment-admin.mjs`, recruitment API/client        | Auth password, cookies `sb-access-token`/`sb-refresh-token`; tidak diubah                                          |
| `20261007120000_recruitment_pass2_admin_read.sql`             | Existing recruitment allowlist/helper/audit, bukan CMS grant baru                                                  |
| `tests/cms-native-admin.test.mjs`, `tests/cms*.test.mjs`      | Native auth/security + content/media/GAS contracts; adapt test terkait, jangan skip security tests                 |
| `scripts/verify-cms-{native-admin,admin,team-admin}.mjs`      | Tiga browser mock, empat widths masing-masing; bukan real owner proof                                              |
| `scripts/cms-client.mjs`, schema/snapshot, migrations pass1–6 | Content pipeline dan applied SQL terkunci                                                                          |
| `package.json`, lockfile, `vercel.json`                       | Node22, API hosting existing; Supabase SDK belum installed                                                         |

### 2.1 Auth CMS sekarang

LoginGET memulai Google OAuth dengan state + PKCE S256. CallbackGET memeriksa
flow cookie/code/state, menukar Google token, memeriksa scopes, lalu memanggil
GAS `adminLoadProjects` untuk owner authorization. Sesi AES-256-GCM origin-bound
memuat Google token + CSRF, expiry maksimal sekitar satu jam. Cookie HTTPS
`__Host-ds-admin-flow/session`, HttpOnly/Secure/SameSite=Lax/Path=/; localhost
menggunakan prefix `ds-admin-`. Origin request harus sama dengan config.

Projects/Team/media Supabase memakai sesi encrypted yang sudah lolos callback;
**tidak ada fresh GAS owner allowlist check pada setiap operasi Supabase**.
Target auth baru harus menambahkan validasi identity + CMS permission per request
sebelum service-role/Management/Storage/hooks. POST tetap Origin exact + CSRF
constant-time, JSON/body cap dan sanitasi existing. Logout sekarang clear cookie.

### 2.2 Temuan allowlist penting

`private.cms_admin_users` existing mengotorisasi **recruitment**. Actual columns:
`id serial`, `auth_id text UNIQUE NOT NULL`, `email text NOT NULL`, `created_at`,
`active boolean`. Bukan tabel proposal `user_id uuid` dari master plan lama.
Recruitment menguji trusted Auth user.id lewat RPC `admin_verify_identity`.

**Jangan reuse/seed/alter allowlist itu untuk CMS secara otomatis.** Menambahkan
Google identity dapat membuka akses PII recruitment. Proposal pass ini: allowlist
CMS terpisah, private, additive, satu owner yang disetujui, tanpa enrollment dari
email/domain/metadata client. Nama/desain final setelah A dan B, catalog existing
harus dibaca dulu. Tidak ada multi-admin/editor/role expansion otomatis.
Account linking Google/password pada project sama perlu ditinjau sebelum provider
activation: namespace cookie terpisah saja tidak memisahkan Auth user permissions.

### 2.3 Inventory env/config — presence saja, tanpa values

- Existing Supabase server: `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ACCESS_TOKEN`; Production kedua Vercel.
- Full GAS build: `CMS_API_URL`, `CMS_API_TOKEN`, tetap required.
- Existing CMS auth: `CMS_ADMIN_ORIGIN`, `CMS_ADMIN_SESSION_SECRET`,
  `CMS_ADMIN_GOOGLE_CLIENT_ID`, `CMS_ADMIN_GOOGLE_CLIENT_SECRET`,
  `CMS_ADMIN_API_DEPLOYMENT_ID`; inventory sebelum decouple config factory.
- Publication: `CMS_DEPLOY_HOOK_TESTING`, `CMS_DEPLOY_HOOK_PRODUCTION` existing;
  hanya server, URL bertoken tidak dicetak.
- Recruitment flag/config dan Google/Supabase redirect/provider settings:
  baca presence/scope privately, preserve unrelated keys/settings. Jangan menghapus
  old env walau kode baru tidak memakai sebelum rollback/retirement disetujui.

## 3. Keputusan wajib sebelum implementasi dependent

AI baru lakukan A dahulu dan siapkan rekomendasi konkret. Tanyakan keputusan
berikut sebagai satu paket ringkas; jangan meminta secret lewat chat.

| Keputusan                              | Opsi dan rekomendasi bersyarat                                                                                                                                                            | Status                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Provider CMS                           | Google via Supabase direkomendasikan untuk mempertahankan tombol/UX Google; password via Supabase butuh form/UI scope terpisah; custom existing tidak mencapai target Auth Supabase       | **DECIDED 7 Oct 2026: Password Supabase** (Google tidak dipakai; tidak ada callback/uri_allow_list/account linking) |
| SDK/transport sesi                     | Server-only `@supabase/ssr` + `@supabase/supabase-js` proposal; pin compatible versions dan buktikan API Node Functions. REST tanpa deps alternatif dengan beban PKCE/refresh lebih besar | **DECIDED: `@supabase/supabase-js@2.117.3` saja** (server-only; `@supabase/ssr` tidak dipakai)                      |
| Owner mapping                          | Trusted Auth ID + CMS-specific active permission; verifikasi owner secara privat. Jangan auto-grant karena email atau copy recruitment grant                                              | **DECIDED: allowlist CMS terpisah** `private.cms_admin_permissions` (auth_id uuid)                                  |
| Session lifecycle                      | Server-only cookie namespace CMS; explicit local sign-out direkomendasikan agar tidak global-signout recruitment; refresh/lifetime/failure policy harus ditulis dan diuji                 | **DECIDED: cookie `__Host-ds-admin-session` + logout lokal**; refresh server-side; window 30 hari                   |
| Provider/redirect config dan SQL apply | Existing project, exact dua callback; review diff config dan migration/local proof dahulu, periksa otorisasi perubahan live                                                               | **PENDING concrete action (C)** — password tidak butuh callback; hanya SQL apply + owner grant                      |
| Live acceptance mutation               | Read-only login/read/media/logout dahulu; fixture save/add/delete/upload/revocation test hanya dengan izin konkret + cleanup plan                                                         | **PENDING** (E; read-only dulu, minta izin konkret)                                                                 |

Tidak semua keputusan memerlukan pertanyaan terpisah. Gunakan izin yang benar-benar
ada di sesi baru; jangan mengulang approval yang sudah jelas, dan jangan menganggap
prompt “gas” memilih Google, dependency, account linking atau menghapus GAS.
Selagi menunggu keputusan, lanjut audit/baseline/test design yang independent.

## 4. Desain target bersyarat dan security contract

### 4.1 Login/callback bila Google dipilih

Pertahankan entry `/api/admin/auth/login` dan callback
`/api/admin/auth/callback` di Node Functions existing. Tidak menambah Astro SSR
adapter atau public login page otomatis. Server mulai Supabase OAuth PKCE dan
redirect; Google mengembalikan ke **Supabase**
`https://yejrdckcmlxrkklgtrwy.supabase.co/auth/v1/callback`; Supabase mengembalikan
code ke **aplikasi** pada exact dua URL berikut:

- `https://web-testing-azure.vercel.app/api/admin/auth/callback`
- `https://data-sorcerers-community-sigma.vercel.app/api/admin/auth/callback`

Read-only inspect konfigurasi dulu, pertahankan redirect lain milik recruitment.
Tidak wildcard produksi atau URL dari Host/query yang tidak dipercaya. Final
redirect `/admin/` atau fixed allowlisted internal destination. Callback error,
cancelled consent, missing/expired/replayed code/verifier, wrong-origin dan
parallel login harus fail closed tanpa membocorkan auth parameters/token.
Code/verifier exchange dan state binding harus diuji terhadap SDK version aktual.

### 4.2 Identity dan izin setiap request

Urutan: validate route/method/config/origin → resolve/refresh CMS session →
trusted Supabase Auth identity → CMS-specific active permission → POST Origin +
CSRF + payload validation → existing privileged operation. Tidak mengandalkan
`getSession().user`, decode JWT lokal, client-supplied email/UID atau metadata
untuk otorisasi. Gunakan trusted server Auth verification, dengan proposal
`getUser()` per request untuk freshness; gagal Auth/permission backend fail closed.
Anon401; signed-in non-owner403 atau existing sanitized equivalent yang dikunci
B; respons denial tidak membawa records/media/CSRF privileged. Callback non-owner
clear CMS session/flow dan redirect failure sesuai UX existing.

Service-role tetap server-only. Authenticated tidak mendapat direct CMS table,
Storage atau write-RPC grants baru. Public read RPC anon existing tetap.
Management API writes Projects/Team tetap: jangan mengganti transport karena
PostgREST safeupdate issue existing. Revision/min-max/UUID/media/publication
contracts tidak berubah. Hooks hanya setelah successful save, retry publication
hanya hook, tanpa retry mutation otomatis.

### 4.3 Cookies, refresh, CSRF, logout

Proposal server-only: HttpOnly + Secure HTTPS + SameSite=Lax + Path=/, host-only
CMS namespace khusus. Browser editor cukup same-origin API, tidak Supabase client,
localStorage token, HTML token atau public-prefixed server secret. SDK defaults
**tidak otomatis menjamin HttpOnly**; adapter/options harus dibuktikan. Jangan
memakai nama cookie recruitment. New client per request, tanpa shared mutable
session/client di module scope. Propagate semua Set-Cookie termasuk chunks,
refresh dan redirect; private/no-store pada auth/admin/media/error response.

Refresh expired access token di server, persist rotated cookies, tetap permission
check sebelum operasi. Uji parallel tabs/requests, refresh failure/replay, client
clock skew dan origin isolation. Jangan replay write ketika auth/network gagal;
UI session-expired tidak mengklaim save berhasil. Cookie expiry dan Auth session
lifetime bukan parameter yang sama; final lifetime harus eksplisit.

CSRF existing adalah token terikat sesi dalam cookie encrypted, bukan sekadar
“double-submit” generic. Pilih carrier pengganti yang session-bound, server-verified,
origin-bound dan constant-time; preserve response `csrf` dan header client. Token
lama harus invalid setelah login/logout/session change. LogoutPOST tetap CSRF+
Origin, clear semua CMS cookies/flow/chunks, pilih sign-out scope eksplisit.
Owner revocation CMS permission harus berlaku pada request berikutnya; uji lokal
DB/mock dulu, real grant change hanya bila diizinkan dan restorasi terkontrol.

### 4.4 SQL proposal, bila CMS-specific allowlist diperlukan

Additive migration baru saja, filename setelah pass6 sesuai repo convention;
jangan mengarang applied timestamp. Private table key trusted Auth ID, active flag,
minimal metadata; relation/type dipilih dari catalog actual. RLS enabled + deny
policies, revoke PUBLIC/anon/authenticated table/helper. Minimal public wrapper
untuk service-role permission check, no anon enumeration. SECURITY DEFINER owner,
fixed search_path pg_catalog, qualified objects, parameter type/validation dan
EXECUTE ACL diverifikasi. Tidak memberi browser hak mengelola grant.

Jangan hardcode owner email/UID/secret ke tracked SQL. Provision grant privat setelah
identity mapping approved; upsert hanya CMS-specific grant yang tepat, bukan
reseed Auth users/recruitment. Migration harus reproducible tanpa owner seed.
Real PostgreSQL ephemeral: valid/absent/inactive owner, role denials/catalog,
strict return shape, SQL injection inputs, rerun additive safety. Live permission
proof read-only; dilarang DML role probes ke live collection.

## 5. Scope file dan visual lock

Allowed setelah gate keputusan: server auth helper (file baru jika perlu), auth
route handlers + `server/cms-admin.mjs` integration, auth/security tests, minimal
browser mocks, additive CMS permission migration, active docs. Editor scripts
hanya bila session/CSRF handling perlu, tanpa layout/CRUD semantics changes.
Package/lockfile hanya setelah approval dependency. Env/provider changes butuh
concrete diff dan izin yang berlaku. Retain deprecated env sampai rollback aman.

Locked: recruitment server/routes/client/allowlist/users/config, applied content
migrations/RPC/schema/snapshot/media policy, CMS data, GAS export validation,
assets/fonts/layout/reference/geometry assertions, collection editors baru,
CAPTCHA/retention/opening, Team drift, cold-cache media, multi-admin/MFA/newaudit
features. Jangan delete Google Cloud client/GAS deployment/tab/env untuk authpass.

Public UI tidak berubah: Bluu Next Bold700/Manrope, 8pt spacing, artwork verbatim,
PNG source of truth, exact assertions, reduced-motion fallback/bundle budget.
Admin existing custom belum punya Figma node; tulis actual measured layout,
spacing/font/art/tests bila perubahan UI diotorisasi, jangan invent node/PNG.
Password login yang mengubah UI memerlukan scope dan per-section plan tambahan.

## 6. Checklist A–E dan urutan kerja

### A — audit, fresh baseline, keputusan

- [ ] A1 Baca urutan wajib seluruhnya; git status/log/refs dan Node22 dahulu.
      Node default26; terakhir binary22 di `/tmp/ds-cms-node22/.../bin/node`,
      verifikasi availability/version, jangan asumsikan artifacts atau PG ada.
- [ ] A2 Baca actual §2; gambar alur login→callback→session→API→servicecall.
      Catat config wajib, cookie/header/error/method/CSRF contracts.
- [ ] A3 Read-only inspect existing Supabase Auth settings/catalog/permission
      table dan dua Vercel env presence/scope, tanpa secret/PII output.
      Account-linking dan recruitment exposure review, jangan change settings.
- [ ] A4 Fresh baseline: snapshot bytes, 19public HTML hashes memakai same inputs,
      admin mocks4widths, anon401/recruitmentclosed, current auth test results.
      Simpan sanitized proof di ignored `artifacts/cms-auth/`; baseline counts
      historis92CMS/10SKIP/24recruitment bukan hasil fresh otomatis.
- [ ] A5 Sajikan provider/deps/owner/sesi/config rekomendasi dan decision record
      §3; lanjut dependent B/C hanya setelah keputusan/otorisasi mencukupi.

### B — desain rinci dan local implementation

- [ ] B1 Tulis final flow, route/method/status/cookie/CSRF contract, versions,
      allowlist schema/ACL, error matrix, redirect/config diff dan rollback.
- [ ] B2 Implement isolated permission migration + ephemeral PostgreSQL proof;
      tidak apply live dahulu, tidak menyentuh recruitment grant.
- [ ] B3 Implement server-only auth per-request lifecycle dan authorization;
      login/callback/logout/refresh/denials, session-bound CSRF, cookie adapter.
- [ ] B4 Integrate hanya Projects/Team/media protection, preserve transport,
      sanitization/body cap/status/error hooks; old session invalidates at cutover.
- [ ] B5 Meaningful auth tests seluruh §7; adapt native tests terkait tanpa
      menghapus GAS VM/content/security tests atau mengklaim mocks realauth.

### C — local review dan live prerequisites terkontrol

- [ ] C1 Local focused auth/PG + CMS/recruitment regression, Node22. Full CMS
      **tanpa env server** supaya 10 Team live mutation tests SKIP.
- [ ] C2 Review SQL/config/grant diff dan owner mapping; verifikasi existingref,
      dampak recruitment/identity linking, callback coexistence dan rollback.
      Pastikan izin berlaku untuk masing-masing mutation live yang diperlukan.
- [ ] C3 Apply additive auth SQL sekali jika approved; inspect state sebelum retry
      error, actual catalog/permission/read proof, tanpa collection mutation.
- [ ] C4 Configure approved provider/redirects/grant/env dengan backup private
      existing config dan values suppressed. Jangan disable old OAuth callback
      dahulu atau wildcard; dua env projects checked, recruitment tetap closed.

### D — QA lengkap dan hasil konkret siap review

- [ ] D1 Build0errors, tujuh gate+SEO sesuai SOP; responsive468/468, SEO23pages,
      spacing39components historis digunakan sebagai baseline, report actual.
- [ ] D2 Tiga admin mocks4widths + focused auth browser flow/errors/session expiry,
      CSRF and logout; keyboard/noindex/nooverflow/noerrors.
- [ ] D3 Snapshot bytes/19public HTML unchanged same frozen inputs. Smoke Partners,
      Hods/Roles/Home/Recruitment; Team drift tidak “dibetulkan”.
- [ ] D4 Diff review secrets/deps/scope, update docs/TODO/status+artifacts index;
      local commit implementation terpisah checkpoint docs. Laporkan remaining
      real-owner proof dan concrete SHA, **minta izin push baru** sebagai final step.

### E — push, dua deployment, real acceptance

- [ ] E1 Sesudah izin konkret, `git push origin main` sekali, existing dua pushURLs;
      fetch/refs sync. Tidak menambah remote atau memakai hook sebagai bypass izin.
- [ ] E2 Dua Vercel READY exact SHA + primaryalias assignment, env correctscope;
      timestamps provider UTC/WIB, workspace checkedAt terpisah.
- [ ] E3 Real owner login/read Projects/Team/private media/logout di dua domains,
      real non-owner denial + anon denial + expired/revoked session. Browser
      390/1440; auth mock bukan pengganti. Owner interaksi bila login tidak bisa
      dilakukan agent; tidak meminta password/token di chat.
- [ ] E4 Recruitment login/session isolation dan anon privacy regression tanpa
      PII fetch/submission; recruitment accepting:false, public routes unchanged.
      Jika live mutation diperlukan, approve fixture minimal+cleanup dahulu,
      tidak save/reseed Team untuk sekadar proof.
- [ ] E5 Update LIVE checkpoint setelah evidence lengkap, localdocs commit,
      permission push baru untuk checkpoint berikutnya. GAS removal terpisah.

## 7. Acceptance matrix wajib

| Kasus                                                           | Bukti minimum                                                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Anonymous / invalid / tampered / expired CMS cookie             | 401 sanitized; zero privileged calls/data; recruitment cookie alone never authorizes CMS                   |
| Auth valid tetapi non-owner/inactive/missing CMS permission     | Denied; no Projects/Team/media records, hooks or mutation                                                  |
| Trusted active owner                                            | GET load/read media succeeds; same response contract+CSRF; original min/max/revision/validation tests pass |
| Supabase Auth/permission timeout or malformed response          | Fail closed, no fallback old cookie/GAS owner check, bounded timeout/sanitized error                       |
| Callback cancelled/missing/replayed/wrong verifier/state/origin | No session/data, safe fixed failure redirect, clears own flow only                                         |
| Forged POST Origin/CSRF/content-type/oversize body              | Denied before privileged call; logout equally protected                                                    |
| Refresh expired access + valid refresh                          | Rotated cookies propagated, same owner validated, no replay mutation                                       |
| Refresh failure / concurrent refresh / two login tabs           | Defined deterministic fail-safe behavior, no cross-user shared state                                       |
| Logout and CMS owner revocation                                 | Next CMS request denied; no global recruitment sign-out; residual JWT lifetime documented                  |
| Two sites / localhost dev                                       | Host-only secure cookies, wrong-origin cookie unusable, exact callback allowlist, no preview wildcard      |
| Caching/token exposure                                          | No-store/noindex, no token in logs/HTML/localStorage/URL redirect; all cookie chunks clear                 |
| Allowlist SQL/RPC role grants                                   | Local actual role denials + live catalog/read proof; no authenticated direct CMS writes                    |
| Existing CMS/public/recruitment                                 | Tests+browser mocks+frozen public HTML parity; no recruitment permission expansion or data mutation        |

### 7.1 Commands QA sesudah implementasi lokal

Verifikasi Node22 dan dependency install existing dahulu. Jalankan CMS/recruitment
suite dalam proses **tanpa env server yang di-load/inherit**, jangan
`node --env-file=.env.local --test tests/cms*.test.mjs`. Focused auth test baru
menggunakan mocks/ephemeral DB, bukan remote owner writes. Build baseline remote
menggunakan captured inputs terkontrol bila diperlukan; jangan overwrite snapshot.

```sh
npm run test:cms
npm run test:recruitment
npm run verify:cms-native-admin
npm run verify:cms-admin
npm run verify:cms-team-admin
npm run build
```

Static server terminal terpisah: `python3 -m http.server 4331 --directory dist`.
Tujuh gates lengkap: build + commands di bawah; SEO tambahan wajib.

```sh
PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4331 npm run audit:navbar
PREVIEW_URL=http://localhost:4331 npm run verify:vt
PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs
npm run audit:spacing
npm run format:check
npm run seo:audit
```

Catat exit status, actual pass/skip/fail, browser errors/screenshots, baseline
hashes dan scope diff. Ulang broader tests hanya jika perubahan/failure/concern
baru membenarkan. Sesi planning docs ini cukup format/diff/link/scope checks,
bukan menjalankan runtime/live suites atau memalsukan auth acceptance.

## 8. Rollback, stop conditions, DoD dan artifacts

Rollback tidak drop additive table atau revert data. Simpan private oldconfig,
pertahankan old OAuth client/redirect/env selama observation. Bila failure,
reviewed revert auth-code + dua deployments dengan izin push/deploy yang berlaku;
restore hanya scoped config changes. Jangan diam-diam menerima legacy session
sebagai fallback pada auth baru. Re-login setelah auth cutover/rollback expected.
Revokasi/refresh/logout supportability harus dibuktikan sebelum retire old secrets.

Stop dependent work jika provider/SDK/identity permission belum diputuskan,
foreign working changes tak jelas, wrong project/ref, recruitment access berubah,
credential unavailable, atau Auth/baseline parity gagal. Lanjut independent audit
jika bisa. Jangan state “complete” karena SQL applied/push saja.

DoD: A–E evidence lengkap; owner/non-owner/anon/callback/refresh/logout/revocation
+two-domain acceptance; public/admin/media contracts preserved; recruitment
isolated/closed; SQL ACL actual; docs match code/config; secrets absent; two READY
exact SHA. Kalau manual owner acceptance pending, tulis **pending**, bukan LIVE
accepted. GAS export dependency tetap sampai removal pass approved terpisah.

Ignored `artifacts/cms-auth/` suggested: baseline.json, decision-summary.json
(sanitized), local-db.json, auth-tests.log, qa-summary.json, env-presence.json,
live-permission.json, deployment/aliases-<sha>.json, browser-testing/production,
screenshots tanpa PII/token. Tracked checkpoint menyimpan ringkasan handoff bila
artifacts hilang. Never store raw cookies/headers/Auth codes/private errors.

## 9. Referensi resmi untuk validasi implementasi

Dibaca saat planning 7 Oct2026; baca ulang versi aktual saat memilih SDK.
Tidak menyalin framework Next.js middleware ke static Astro Node Functions.

- [Supabase Google login](https://supabase.com/docs/guides/auth/social-login/auth-google): provider callback menuju Supabase, aplikasi menerima code untuk exchange PKCE.
- [Server Auth client](https://supabase.com/docs/guides/auth/server-side/creating-a-client): gunakan identity tervalidasi; user dari getSession saja tidak cukup untuk authorization.
- [Advanced server auth](https://supabase.com/docs/guides/auth/server-side/advanced-guide): cookie lifecycle/refresh, HttpOnly bergantung desain; getClaims berbeda freshness dari getUser; client per request dan response cache control.
- [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow): verifier/code lifecycle; periksa dukungan/version parallel flow sebelum mengandalkan API tertentu.
- [Sign out](https://supabase.com/docs/reference/javascript/auth-signout): scope harus eksplisit; logout bukan instant invalidation semua access JWT.

## 10. Handoff sesi penyusunan

Inventory repo dan plan selesai; semua execution A–E masih unchecked. Tidak ada
fresh auth runtime QA/live proof diklaim. Baseline Partners proof di plan pass6
§9–10 tetap historical authority. Prompt sesi baru: kickoff migrasi §6.

## 11. Progress eksekusi (sesi AI, 7 Oct 2026)

Keputusan user direkam: **provider password Supabase**, **`@supabase/supabase-js`
server-only saja**, allowlist CMS terpisah, cookie namespace terpisah + logout
lokal, live action butuh izin konkret. Karena password, **tidak ada OAuth/PKCE/
callback/`uri_allow_list`/account-linking**.

- **A selesai:** git/Node22, alur actual, Supabase Auth settings + katalog +
  Vercel env presence (tanpa secret/PII), baseline fresh (snapshot sha256,
  19/19 public HTML, test tanpa env server).
- **B selesai (local):** design `docs/cms-auth-design.md`; migration additive
  `supabase/migrations/20261014010000_cms_auth_pass7.sql` (allowlist + rate limit
  terpisah, RLS deny, `SECURITY DEFINER`, wrapper service_role) + bukti
  PostgreSQL nyata; modul `server/cms-auth.mjs` (login/getUser/verify per
  request/refresh/logout, CSRF session-bound, cookie ter-seal); integrasi
  `server/cms-admin.mjs` (projects/team/media) + route `refresh.js`; form
  password di `/admin/` & `/admin/team/`; test `tests/cms-auth.test.mjs` +
  adaptasi native/media test.
- **C/D selesai (local):** CMS light **81 PASS**, recruitment **24 PASS**, Team
  live **10 SKIP**; 7 gate + SEO PASS (build, verify, navbar, VT, responsive
  468/468, spacing 39, format, seo 23); tiga admin mock 4 widths PASS;
  snapshot/19 public HTML unchanged. **Belum apply SQL/config live, belum
  push/deploy, belum acceptance.** Hods real-PG suite timeout di environment ini
  (tidak terkait auth).
- **C2/C3 selesai live (sesi lanjutan):** approved additive migration applied sekali,
  satu grant owner, service RPC HTTP200, catalog + 12 read-only role denials PASS;
  recruitment fingerprint/counts unchanged. Owner melaporkan password sudah
  di-set sendiri. Lihat execution plan §12 untuk fresh QA/perbaikan review lokal.
- **E1/E2 selesai:** approved push `e08a604`, dua READY exact SHA/aliases.
  Owner Projects/Team read 502 karena SQL load `affectedId:null` ditolak validator;
  retired callback juga 500 karena relative Response.redirect. Fix lokal + QA
  sebelum izin SHA baru. Execution plan §13 menyimpan bukti dan fixture denial
  bersyarat yang sudah diizinkan. E3/E4/E5 masih pending; auth belum LIVE accepted.

Latest runtime: approved push `7e17fc0`; real owner load Projects/Team, explicit
refresh, 390/1440 editor, logout401 and recruitment login/refresh isolation PASS
kedua domain. Dua READY exact SHA API proof selesai setelah akses pulih. E5 fixture+cleanup
approved; upload502 mengungkap bucket cms-media belum ada (0bucket/0object).
Provisioning bucket privat menunggu izin. Positive media/denial/expiry/E5 belum
PASS; probe expiry alami sedang berjalan. Lihat execution plan §17.
