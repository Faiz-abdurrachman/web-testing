# CMS B2 — private admin dashboard

Status: PROJECTS FOUNDATION CODE VERIFIED; OWNER DASHBOARD LOADED; LIVE SAVE CHECKS PENDING. Production B1 remote-mode build at `fb99c39` confirmed by
owner logs; both GitHub Vercel statuses success. Testing remote-mode log
confirmation pending. No B2 UI or mutations deployed yet.

## Pass order

1. Private GAS admin foundation and Projects editing: authorize every RPC,
   edit existing project content, validate input, concurrency protection,
   two rebuild hooks, generator and owner installation. Fixed counts stay
   guarded; add/delete controls are not enabled in this foundation pass.
2. Projects growth: dynamic schema/renderer, add/delete controls and separate
   fixtures before enabling additions. Keep baseline geometry assertions.
3. Projects media upload/cache: upload photos to the private media folder,
   validate types/size and bake/cache validated Drive bytes at build time rather
   than relying on Drive hotlinks. Artwork presets remain manual.
4. Team collection: member CRUD and photo support with local group/card design.

Lock each pass with seven site gates + SEO before the next collection/step.
B3 covers roles, partners, domains/HoDS and achievements/settings separately.

## Projects pass — Master Work Plan

No Figma node exists for the new admin dashboard; this is a custom editor UI,
not a migration of any existing Figma section. Site Projects continues using
its existing measured component/reference and unchanged geometry. New admin
layout target: 1440 × 900 desktop; fluid min 320 px; document may scroll.

Palette: background #050507, surface #16141f, text #ffffff, muted #bcb7cb,
accent #9b7bff, error #ffb6b6. Bluu Next Bold 700 display, Manrope body, served
from existing licensed font assets over HTTPS. Tokens use 8 px increments:
outer padding 32 desktop / 16 mobile, list/editor gap 32, form gap 16,
field padding 16, action gap 8. Header title 40 px / body 16 px. Focus visible,
semantic labels, polite status announcements and no automatic animation.

Layout: left-aligned collection heading and project list; selected project's
labelled form on the right, stacked below the list on mobile. Existing title,
description, two category tags and image preset are content fields. Template
geometry, CSS, coordinates and fonts are never editor controls. Buttons use
Indonesian editor language: Tambah project, Simpan dan terbitkan, Hapus project.
Do not expose unsupported future collections as functioning navigation.

Use a separate GAS project and HtmlService; initial deployment executes as the
owner and access Only myself. Check nonempty active identity, effective owner
and Script Properties allowlist on every read/mutation/upload/rebuild RPC.
Keep property values, hooks, token and exception internals outside client HTML.
No anonymous mutation endpoint or export-token-based admin access.

Reference the existing spreadsheet/media folder via Script Properties. Admin
setup validates configuration without recreating the Sheet or reseeding data.
Projects reads and writes preserve exact B1 columns. Validation matches build
schema. Updates use locks and a revision hash to reject stale edits. Never
accept formula-executing text, raw HTML or unconstrained remote image URLs.
Delete requires an explicit editor action and must leave a renderable list.

Growth: relax only Projects count guard after the renderer and export accept
added records. Keep baseline geometry and content fixture checks, with separate
1/2/5-project fixtures for carousel dots, arrows, keyboard, clipping and card
sizes at desktop/mobile. Do not loosen other collection guards.

Save writes validated content then triggers both hooks. Tell the editor content
is saved and rebuild requested, not already live. If either hook fails, keep
the saved content and offer retry publication without duplicating records.
Store hook secrets in Script Properties. Restrict hook URL hosts/path shape,
sanitize all RPC errors and never log secret values.

Verification: denied anonymous/other identity; valid owner; Sheet header/input
validation; conflict detection; CRUD; formula protection; hook success/partial
failure/retry; client error/loading/keyboard/mobile states. Use a local mock RPC
harness for browser review without pretending it validates real Google login.
Then owner installs/deploys admin and verifies actual login/save/rebuild with
both projects. Run all seven site gates + SEO and baseline equality each pass.

## User setup remaining

Confirm testing remote-mode build log. Create a Deploy Hook for branch main in
each Vercel project. Temporary owner-provided values may be held in ignored
local env for setup; deployment secrets live in GAS Script Properties. Never
commit admin identity, Sheet/folder IDs, tokens or hook URLs.

## Foundation pass execution checkpoint

User configured both Deploy Hooks in ignored local env. Format/host valid,
different project IDs, POST accepted HTTP 201 with pending jobs for each.
No hook values entered the repo/logs. Initial dashboard pass edits the current
Projects collection only; growth/media follow as separate tested steps.
Baseline site imports/CSS/renderers/schema remain unchanged in foundation.
Public export GAS contains no admin mutation functions. Admin uses a new
project, same Sheet/Drive, owner-only deployment, server allowlist checks and
revision-guarded single-batch project writes. Each save requests both rebuilds
and reports saved-versus-rebuild status accurately. The owner must install
and verify actual private login before opening this editor for live use.

Public Projects design remains node `1430:2146` (Homepage `1430:2040`),
https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=1430-2146
frame 1440 × 910, desktop padding 80, header gap 8, measured header/stage gap
82 (existing documented exception). Bluu Next Bold 700 56/67, Manrope card
copy; artwork and reference `Home-Project-Revisi-1x.png` remain untouched.
This foundation adds only GAS admin source and QA/scripts, not public markup.

## Foundation pass results

13 CMS server/fetch tests PASS. Admin browser mock PASS at 320, 390, 768 and
1440: fonts loaded, no overflow, keyboard, safe text rendering, partial-hook
retry, conflict preservation/reload. Admin spacing PASS. Site build 0 errors;
visual, navbar, View Transitions, responsive 468/468, spacing, format and SEO
PASS. Public source/data/assets unchanged. Evidence in ignored
`artifacts/cms-admin/`: site-build/gate logs, browser-report and screenshots.
Both real Vercel hooks accepted HTTP 201. Generated private admin files contain
no deployment secrets. Real owner login/save/rebuild has not yet been tested;
installation guide: `docs/cms-admin-setup.md`. No B2 completion claim until
growth, media and Team passes and real installation checks are complete.

## Owner installation checkpoint

Owner confirmed successful setupAdmin after copying Code.gs, Index.html,
manifest and Script Properties into the separate Admin GAS project. A screenshot
of the deployed dashboard shows all four Projects and populated fields,
confirming real authorized server reads. Deployment identifiers/URL/account
remain outside repo. Unchanged-content save, both rebuild results with remote
mode, and non-owner denial remain pending. Do not mark this foundation live
verified or the whole CMS complete until the remaining checks/passes finish.

## Owner save checkpoint / rebuild issue

Owner confirmed the saved + both publication requests accepted message on an
unchanged-content save. Real authenticated export remains identical baseline
with four Projects. An anonymous request to the admin redirects to Google
login and does not expose the editor. A different signed-in account has not
yet been tested. Latest Vercel commit statuses for `a656374` failed: testing
at 09:26:29 UTC, production at 09:27:29 UTC. Older production deployment was
successful; a successful historic deployment does not prove the new hook build
succeeded. Request latest logs before diagnosing or marking the foundation
fully live verified. Growth/media/Team remain next after fixing rebuilds.

Rebuild failure repair checkpoint: `96a9756` requests fresh export nonces and
retries redirected Google 404 once. 14 CMS tests, real export baseline equality,
7 site gates + SEO PASS; latest Vercel statuses success for both projects.
Continue Projects growth next. Private admin Code.gs/Index do not need updating
for this build-client repair; a different signed-in account denial and live
content-change verification remain pending.
