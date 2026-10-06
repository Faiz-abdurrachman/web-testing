# CMS B1 — GAS export and build fetch

Status: CODE VERIFIED; LIVE SETUP PENDING. User authorized continuation, commits and deployment after
B0. B0 was pushed to both remotes at `1b38088`.

## Execution plan — one backend step

Implement a GAS installer and token-protected export/list API, plus the remote
branch of `scripts/fetch-cms.mjs`. Seed the six existing collections from the
committed snapshot and create eight Sheet tabs, including reserved milestones
and settings. Create a private Drive media folder automatically. Store owner,
admin allowlist, spreadsheet/folder IDs and export token only in Script
Properties. Setup must be repeatable without overwriting existing content.

User has installed Code.gs and the manifest, and confirmed successful
`setupCms` execution under the newly selected owner account. Account identifiers
remain outside the repo. The automation browser has a separate Google session;
Google deployment/configuration is being guided in the user's browser. The read
API deployment, authenticated real export and both Vercel builds remain pending.
Do not mark B1 live until those checks pass.

Use separate GAS projects for the public read API and the future private admin
dashboard. The public project contains no admin mutation functions. B2 admin
configuration will reference the same Sheet/folder and deploy hooks, with
server authorization on every edit. Never expose deployment secrets to clients.

Remote fetch requires both env values, accepts only GAS HTTPS `/exec` endpoints,
uses a timeout and response-size limit, follows only Google content redirects,
validates the complete snapshot and atomically replaces it. Fetch or validation
failure must preserve the previous snapshot and fail the build. Offline mode
continues validating the committed snapshot without any network request.

## Content growth requirement (user, 6 Oct 2026)

Editors must be able to add members, cards, available roles and HoDS using the
same design templates. Fixed counts in B0/B1 protect the migration baseline;
they are temporary guards, not the final editor capability.

Implement growth one collection at a time in B2/B3. Reuse the existing component,
card sizes, 8pt spacing, typography, rim/glow and responsive grid/carousel. New
records select a registered template preset; editors never enter coordinates,
CSS, tint or gradient values. New HoDS require a preset and suitable baked
artwork; adding a custom artwork preset remains a measured design task.

Keep existing geometry assertions and baseline fixtures. Test added records in
separate fixtures, including static detail routes, overflow, carousel controls
and card geometry. Extra content may increase rows/section height without
stretching cards. Do not enable CRUD additions until that collection's renderer
and schema support them.

## Verification

Test the Sheet roundtrip against the baseline, repeated setup, denied anonymous
setup, token authorization, malformed Sheet data and read-only API behavior.
Test remote fetch success, redirects, timeout, size limit, partial env, invalid
payload and atomic preservation on failure. Run seven gates and SEO against the
offline baseline; all 19 HTML files must remain identical.

Live gates require real Google deployment and Vercel env configuration. B2
dashboard/upload/save hooks follow after real B1 export succeeds.

## Results (6 Oct 2026)

Seven CMS boundary/integration tests PASS. Generated Code.gs syntax and seed
roundtrip PASS. Build 0 errors; verify exit 0; navbar and View Transitions PASS;
responsive 468/468; spacing, format and SEO PASS. All six module exports and all
19 HTML files remain identical to the pre-B0 baseline. No UI/assets changed.

Real setup execution is confirmed by the user. Export deployment URL/token,
Vercel env and real remote builds remain pending. B1 is not live yet. Setup
guide: `cms-gas-setup.md`.
