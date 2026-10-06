# CMS B2 — private admin dashboard

Status: PLANNING. Production B1 remote-mode build at `fb99c39` confirmed by
owner logs; both GitHub Vercel statuses success. Testing remote-mode log
confirmation pending. No B2 UI or mutations deployed yet.

## Pass order

1. Private GAS admin foundation and Projects collection: authorize every RPC,
   edit/add/delete Projects using the existing site template, validate input,
   concurrency protection, two rebuild hooks, generator and owner installation.
2. Projects media upload/cache: upload photos to the private media folder,
   validate types/size and bake/cache validated Drive bytes at build time rather
   than relying on Drive hotlinks. Artwork presets remain manual.
3. Team collection: member CRUD and photo support with local group/card design.

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
