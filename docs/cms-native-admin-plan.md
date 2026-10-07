# Native website admin — Projects/auth pass (6 Oct 2026)

## Status dokumen — arsip native OAuth/GAS

Isi setup/flow di bawah merekam pass historis; jangan onboarding/config ulang.
Runtime latest925d577, keenam content collections Supabase, CMS login masih
custom OAuth. NEXT [Auth CMS Master Work Plan](cms-auth-supabase-plan.md)
**PLAN ONLY**, eksekusi di AI baru setelah decision gates. Baca kickoff migrasi
§6 dan checkpoint ai-handoff dahulu. Recruitment Auth/allowlist terpisah dan
GAS export tetap dependency. Push baru memerlukan konfirmasi.

User selected full admin inside the website at /admin with Google owner login.
Working tree clean at 198586b. Projects Growth code deployed successfully to both
sites; owner reports GAS Admin code/HTML deployment updated. Read-only export
checked after update: four Projects, byte-equivalent content baseline. Real
owner add/delete and signed-in non-owner denial remain unverified. Native admin
now takes priority; media/cache, Team and B3/B4 follow separate passes.

## Architecture and scope

Astro public pages remain static. /admin is a static login/editor shell with no
embedded CMS records or secrets. Native Vercel Node Functions under api/admin/
provide Google OAuth code flow and authorized Projects RPC. No UI library,
adapter or new database dependency. Existing GAS Admin becomes callable through
an additional owner-only API executable deployment in the SAME script project;
Sheets, Drive, Script Properties, CRUD/revision locks and hooks remain there.
CMS Export stays read-only. This pass covers Projects only.

Google OAuth client and API executable share a standard Google Cloud project.
This is new auth integration needed by user-selected architecture, not repeating
initial CMS onboarding. Owner configures Google consent/OAuth and server env
privately after implementation/QA; never paste credentials, account, IDs or
URLs into tracked docs. Existing HtmlService editor remains usable during migration.

Login uses random state + PKCE, HttpOnly encrypted short-lived flow cookie.
Callback verifies state/cookie/origin, exchanges code only on server, and calls
adminLoadProjects to verify the actual GAS owner before creating a session.
AES-256-GCM encrypts access token and CSRF token in an HttpOnly/Secure/SameSite
cookie, bound to configured origin. Session expires with Google access token
(maximum one hour); no refresh token storage or new session database.
Each API call invokes GAS authorization again. Mutation POST requires exact
Origin + CSRF header and JSON, payload cap; no automatic mutation retry.
Only load/save/add/delete/retry RPC names are allowed; setup/doGet/private
helpers cannot be invoked. All upstream errors and responses sanitized;
no logs/raw credentials/owner identity in browser. No anonymous write endpoint.

## Master Work Plan — custom admin surface

No Figma node/reference exists for admin; do not invent one. Public Projects
node 1430:2146 Home (1440×910), HoF 1439:4655 (1440×1014) retain their existing
refs/549×567 cards, font, artwork and geometry. No public section modification.

Single admin surface inventory: (1) branded header/login, (2) Projects list and
editor, (3) saved/rebuild feedback, logout. Target 1440×900, scrolling allowed;
mobile minimum 320. Build/verify this one surface before expanding collections.
Brand foundation: bg #050507, surface #16141f, white #fff, muted #bcb7cb,
accent #9b7bff, error #ffb6b6. Bluu Next Bold 700 display 40/48 (mobile 32),
Manrope body 16/24 and helper 14/21; local bundled fonts. Main padding 32/16,
list/editor gap 32, panels 24/16, fields gap/padding 16, labels/actions gap 8,
header gap 16 and divider margin 32. Existing cards, image presets, stable IDs,
minimum 1 / maximum 8 policy. Login layout focused on owner access, clear
content workflow; no unsupported collections, animation, arbitrary decorations
or CSS/layout fields. Logo uses existing licensed project asset if appropriate.

## Execution and acceptance

1. Preserve baseline dist HTML hashes before build. Add server auth/RPC + HTTP
   tests: missing config, anonymous/non-owner, OAuth state/PKCE, cookie tampering,
   expiry/origin binding, scope checks, CSRF/cross-origin, allowlist, input cap,
   sanitized responses, no mutation retry and lost connection ambiguity.
2. Port tested Projects editor to /admin with native fetch transport and same
   controls. Login/loading/errors/session expiry/logout, dirty edits, conflict,
   minimum/maximum and saved-vs-build distinction remain explicit.
3. Local mock Google/GAS HTTP integration + browser at 320/390/768/1440,
   keyboard, safe text, add/delete/retry, conflict, expiry. This does not prove
   actual Google login or API executable identity. Review screenshots.
4. Seven site gates + SEO, existing 17 CMS tests + new auth tests. Public 19
   baseline HTML must remain equal except intentional robots disallow /admin;
   /admin noindex and excluded from sitemap. Functions packaging tested with
   Vercel tooling when available; no dummy creds or development bypass in prod.
5. Update docs/AGENTS/handoff/assets/SOP, commit. Confirm before feature push
   (earlier push approval concerned completed Growth). Owner config/deployment
   instructions prepared before asking to configure or approve deployment.
6. Native live acceptance pending owner OAuth/standard Cloud/API deployment;
   non-owner denied and real add/delete + both rebuilds required. Whole CMS
   remains incomplete until later collection/media/hardening passes.

## Primary references

- https://vercel.com/docs/functions/runtimes/node-js
- https://developers.google.com/apps-script/api/how-tos/execute
- https://developers.google.com/apps-script/api/reference/rest/v1/scripts/run
- https://developers.google.com/identity/protocols/oauth2/web-server

## Hasil implementasi lokal

24 CMS tests PASS (17 existing + 7 native auth/security). Native HTTP-mock
browser PASS 320/390/768/1440: CRUD, minimum/maximum, retry, conflicts, escaping,
keyboard, session expiry/draft preservation, logout. Legacy GAS browser PASS.
Admin spacing audit eksplisit PASS; 19 baseline public HTML hashes identik,
Astro build 20 pages / 0 errors; SEO PASS, admin noindex/sitemap excluded.
Public geometry assertions/reference assets tetap. Tujuh site gates + SEO PASS; responsive 468/468, browserErrors [].

Live OAuth/Cloud/API executable belum diverifikasi;
tidak ada env/auth bypass dummy untuk production. Panduan owner konkret tersedia
di cms-native-admin-setup.md. User menyetujui push; 824e333 terkirim ke kedua repo. Kedua Vercel SUCCESS.
Shell /admin HTTP 200/noindex; API HTTP 503 CONFIGURATION pada kedua domain
situs. Login route kembali ke shell dengan pesan belum aktif. Ini membuktikan
packaging/routing Functions; actual OAuth/API executable/owner CRUD belum diuji.

## Acceptance live — 6 Oct 2026

Owner login native dan pemuatan Projects terbukti melalui screenshot editor.
Add project sementara dan delete nyata berhasil; perubahan terbit di kedua
situs, lalu kedua deployment SUCCESS dan empat judul baseline tetap tampil.
Login route kedua domain HTTP 303 ke Google. Owner melaporkan akun non-owner Incognito ditolak;
login owner terpisah kedua domain belum dibuktikan. Lihat setup guide untuk
batas bukti. Catatan konfigurasi pending di bagian sebelumnya adalah historis.
