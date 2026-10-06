# Recruitment form integration — 6 Oct 2026

## Checkpoint and isolation

Clean main caacaa9 contains the current CMS, Team and public design work.
Backup branch backup/pre-recruitment-caacaa9 protects this checkpoint.
Integration branch integration/recruitment-form starts at caacaa9 in a separate
worktree. Team branch production/recruitment-page has one unique feature commit
97dca2b; main has 71 unique commits. Import only that commit's changes, review the
four affected files, and preserve all current RoleDetail CSS/glow and CMS files.
No push until user confirms the concrete reviewed result. Origin pushes deploy
both testing and production. Team GAS acceptance remains pending independently.

## Master Work Plan — one new form surface

Source of the new form: teammate commit 97dca2b, not a supplied Figma export.
No Figma node, URL or reference PNG exists for this custom form; do not invent
one or claim Figma pixel accuracy. Existing detail roles use nodes 774:17392 and
siblings, documented in docs/assets.md, 1440×1280. Existing reference URL:
https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=774-17392. Their only intended change is
the Apply Now destination /recruitment/apply?role=<id>; geometry stays asserted.

Page inventory: (1) existing Navbar, locked; (2) RecruitmentForm, one surface
with header, stepper, four sequential fieldsets and submission feedback;
(3) existing Footer, locked. Target desktop viewport1440×900, mobile320 onward,
form width1040, content height variable for real inputs. The four panels are
states of the same surface, not separate public content sections. Long forms
scroll naturally. No new artwork, fonts, dependencies or global style changes.

Use existing team form direction: bg#050507, text#fff, accent#9b7bff and#6c3bff,
secondary#2f196f, helper#a3a3a3, error#ff6b8b. Bluu Next Bold700 headline,
Manrope body/controls. Desktop section padding128/80/120, tablet120/40/80,
phone112/16/64; container gap48, header gap24, panel gap32, cards32/40
(phone24/16), field gap8, grids24, input padding16. New surface spacing must
follow8pt; preserve previously documented existing design exceptions.

Import teammate markup/data, then review behavior: complete validation before
step jumps/submission, accurate role preselection, dynamic domain skills,
multiselect draft restoration, text-safe DOM, accessible focus/errors/stepper,
View Transition teardown and reduced-motion behavior. No submitted applicant
payload in console. Draft remains recoverable on errors; clear only after
confirmed storage. Confirm backend destination with user before implementing
storage; UI must not show success for missing backend or opaque no-cors fetch.
Keep recruitment submission separate from owner-only CMS RPC/auth/data export.

## Acceptance and release

Capture baseline build HTML hashes; unchanged routes remain equal except the
six role link destinations. Review screenshots desktop/mobile. Form QA: all
four steps, six role links, direct URL and client navigation, required fields,
invalid email/URL, agreement checks, multiselect draft/reload, storage unavailable,
submit unavailable and confirmed response/error behavior when configured.
Run build, visual assertions unchanged, navbar, VT, responsive, spacing, format
and SEO, plus CMS tests/native/legacy/Team admin regression. Extend form-specific
coverage rather than loosening existing assertions. Document backend/live proof
limits, preserve branch backup, commit integration. Advance main only after
local QA and review; do not push without explicit confirmation.

## GAS submission extension (user selected Apps Script)

Implement a dedicated intake GAS source/project and private recruitment Sheet;
this is a new feature destination, not a repeat of CMS setup. CMS scripts,
Properties, hooks, folder and export remain untouched. Server-only
RECRUITMENT_GAS_URL and RECRUITMENT_GAS_TOKEN authenticate writes. Opening is
explicit via RECRUITMENT_OPEN=true. Unconfigured/closed GET status returns
accepting:false; no false success. Browser same-origin POST to website API,
complete server/GAS validation, fixed columns, formula-safe plain text, script
lock, UUID idempotency plus content hash to prevent duplicate rows on manual
retry after ambiguous timeouts. No automatic POST retry. GAS returns receipt
only after SpreadsheetApp.flush; no applicant data in responses/logs/export.
Google ContentService redirect follows only the Googleusercontent host and
uses GET without token/body; no stale fallback or claim about earlier CMS faults.
Owner deployment/configuration and real persisted-row acceptance remain manual.

## Local outcome — 6 Oct 2026

Teammate feature97dca2b imported cleanly onto caacaa9. The current RoleDetail
CSS/glow remained unchanged; its only source diff is the Apply Now link. Original
option data is shared between typed frontend wrapper and server/GAS validator.
New intake API/source does not modify any CMS backend/auth/media/snapshot file.

QA PASS under Node22.20.0: seven recruitment backend/contract/GAS tests and36
CMS tests; native Projects, legacy GAS and native Team admin browser4widths each.
Form browser4flows at320/390/768/1440,416 populated panel/width cases, six role
links and repeated real client navigation. Required step jumps, email/URL errors,
radiogroup/multiselect/domain draft restore, blocked browser storage, closed status,
ambiguous write/timeout followed by reload and same-receipt retry all PASS.
The simulated upstream writes once and confirms the identical UUID on retry;
this is mock proof, not a real Google Sheet write.

Seven gates plus SEO PASS: build22HTML/0errors/0warnings; visual assertions
unchanged/browserErrors[]; responsive468/468; navbar exact1440; VT pageerrors:none;
spacing39existing components plus the new form; format check; SEO exact19public
sitemap routes and22HTML. Added the new sitemap route to an exact route-set check,
without weakening any geometry assertions. Native admins remain noindex.

Baseline comparison: nine existing HTML byte-identical; six differ only in
renaming a CSS asset from Motion to Footer with identical bytes; six detail role
pages have the intended Apply Now link. CMS snapshot byte-identical. Existing
verify.mjs and responsive-audit.mjs unchanged. Screenshots reviewed at390/1440;
added112px scroll margin so focused form panels/fields clear the fixed navbar.
No claim of Figma MAE for a custom form without a reference PNG.

QA runners initially needed two corrections: label clicks for intentionally
hidden radios, and accepting the static server's trailing slash. A dynamic-input
CSS scope fix was verified through computed styles. SEO initially failed its
old18route count; now asserts exactly the19expected public routes. Final reruns
PASS, with no relaxed public geometry assertions. Evidence is ignored under
artifacts/recruitment/ (build-final.log, browser-final.log/browser.json,
tests-final.log, cms-tests.log, visual/responsive/navbar/vt/spacing/format/seo
logs, html-comparison-final.json and snapshot-proof.json). GAS source generated
in artifacts/recruitment-gas/, with no secrets/records. Install guide prepared.

Release status below supersedes this local-only checkpoint. Google deployment
and real Sheet acceptance are still pending. Intake
remains closed until owner configures the dedicated GAS/Sheet and both Vercel
server env/open flags, then verifies actual persisted rows. CMS Team GAS/owner
acceptance remains pending separately; entire CMS is not complete.

## Push and live verification — 6 Oct 2026

User approved push. Main a151969 (with prior docs caacaa9) reached both repos;
main/origin/main/production/main verified equal at the feature SHA. GitHub Vercel
statuses SUCCESS: testing2026-10-06T15:46:15Z (22:46:15WIB),
production2026-10-06T15:47:44Z (22:47:44WIB). No failed status/retrigger on this
push. Earlier CMS Google redirect/media failure causes remain unproven.

Both sites /recruitment/apply/ HTTP200 with all four panels, role Data Apply Now
link verified. GET /api/recruitment/application returns only
{ok:true,accepting:false}; owner configuration/open flags are still absent/closed.
Projects and Team API anonymous401, /about/ baseline leaders present. Actual
browser390/1440 each site PASS: role link client navigation and preselection,
required-step blocking, all four panels, no horizontal overflow or page errors.
Submit disabled and zero recruitment POST requests: no test applicant was sent
or stored in Google. No real GAS persistence or broad live acceptance claim.

Evidence ignored in artifacts/recruitment/deploy-a151969.json,
live-routes.json, live-browser.json/log and live-{site}-{width}-header.png.
NEXT owner installs the dedicated intake using docs/recruitment-setup.md, then
verifies receipt/row match in both sites. CMS Team GAS/live acceptance remains
pending independently. Post-deploy docs checkpoint committed locally, not pushed.
