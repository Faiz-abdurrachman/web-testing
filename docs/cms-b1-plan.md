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
API is deployed. Authenticated real export matches the committed baseline; a
local remote-mode build passes with 0 errors, all 19 HTML files identical and
SEO passing. Both Vercel env configurations/builds remain pending.
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

Real setup execution is confirmed by the user. Deployed read API authenticated
export PASS and deep-equals the baseline. Local build using the real API PASS
(remote mode, 0 errors); all 19 generated HTML files remain identical and SEO
PASS. Evidence: ignored `artifacts/cms-b1/live-export-report.json` and
`live-build.log`; credentials only in ignored local env and GAS Properties.
Both Vercel env configurations and deployed remote builds remain pending. B1 is
not live yet. Setup guide: `cms-gas-setup.md`.

## Vercel timeout repair — execution plan (6 Oct 2026)

User configured both Vercel projects. Deployment testing at `38d1589` failed
in prebuild with `CMS export timed out` at the existing 15-second deadline.
Local authenticated export/build passed; no UI or collection changes needed.

This pass raises each export attempt to 60 seconds and allows one retry only
for a timeout, for a maximum of two attempts. Each attempt retains redirect,
body-size and schema guards. Invalid data/auth/URLs remain immediate failures;
exhausted timeouts preserve the previous snapshot and fail the build. Test
recovery and exhaustion at headers/body, non-retryable errors and preservation.
Run remote build, all seven site gates plus SEO, and compare the 19 HTML files
and all data exports with baseline. Commit the repair and deploy both repos
under existing CMS push authorization. Verify Vercel status and remote-mode logs
before declaring B1 live.

Repair results: 8 CMS tests PASS; real GAS remote-mode build 0 errors;
all six data exports and all 19 HTML files identical baseline. Seven site
gates + SEO PASS, responsive 468/468. Logs: ignored
`artifacts/cms-b1/timeout-repair-build.log` and
`/tmp/ds-cms-b0/b1-timeout-*.log`. Vercel repair deployment pending.
