# Recruitment — GAS/Sheets publication guide

Feature a151969 was pushed with user approval. Both Vercel deployments SUCCESS;
form live200, intake accepting:false, admin anonymous401, live browser390/1440
both sites PASS. No applicant POST was sent during live QA. A deployment
of the website alone does not install the new GAS intake. Pendaftaran remains
closed until both server and GAS configuration are ready. Do not change existing
CMS Export/Admin, OAuth, Sheet/folder, Properties or rebuild hooks. Team GAS
update/live acceptance is still a separate pending task.

## Destination

Use one dedicated recruitment Apps Script project and one private spreadsheet
for applicant records. This new destination is required by the new public form;
it does not repeat CMS onboarding or reseed any CMS data. The intake exposes no
record reads, CMS RPC or admin login. It does not upload files; applicants may
provide a portfolio/evidence link. No website rebuild is needed per application.

1. Create the private recruitment spreadsheet and dedicated Apps Script project.
   Generate source with `npm run recruitment:gas`; use
   `artifacts/recruitment-gas/Code.gs` and `appsscript.json`. Never paste this
   source over the existing CMS projects.
2. In this recruitment project's Script Properties set:
   `RECRUITMENT_SHEET_ID` (the new private spreadsheet),
   `RECRUITMENT_GAS_TOKEN` (random secret at least32 characters),
   `RECRUITMENT_OPEN=false`. Keep all values private. Run
   `prepareRecruitmentSheet` once to add headers to the empty `applications` tab.
   It refuses non-empty tabs; never delete rows to get around that guard.
3. Deploy this intake as a web app, execute as Me, access Anyone. Although
   Google allows the server to reach it anonymously, every write requires the
   server secret. GET never returns applicant records. Authorize Sheets scope
   using the owner account. Keep the spreadsheet private.
4. In both existing Vercel projects configure server-only
   `RECRUITMENT_GAS_URL` (this intake's /exec URL),
   `RECRUITMENT_GAS_TOKEN` (same secret), and `RECRUITMENT_OPEN=false`.
   Existing `CMS_ADMIN_ORIGIN` already identifies each website origin; no OAuth
   changes are needed. Do not use PUBLIC_ variables or put values in Git.
5. After code is deployed and the intake is ready, set GAS
   `RECRUITMENT_OPEN=true`, then Vercel `RECRUITMENT_OPEN=true` and redeploy each
   existing website so server env updates apply. Missing/closed configuration
   disables submit. Set these flags false again if recruitment should close.

## Acceptance before announcing recruitment

Use a clearly temporary test applicant, complete all four steps on mobile and
desktop, and submit once. Success must show a receipt UUID; verify the same UUID
and expected answers in exactly one private Sheet row. Test both public sites
because their origins/configuration differ. GET status contains only accepting;
no applicant names/emails/answers. Anonymous CMS/admin API access must remain denied.

If the connection breaks after a write, the form keeps the exact payload and
receipt for manual retry; an identical retry returns the same receipt without
adding a second row. Changed answers cannot overwrite that receipt. Success
means GAS has written and flushed the row, not that an acceptance decision or
email was sent. There is no automatic notification feature in this pass.

Remove the test row manually from the recruitment Sheet after acceptance and
record sanitized evidence (row count, receipt match and result, no applicant
payload/secrets). Do not trigger CMS rebuild hooks or alter public content for
this test. Close recruitment again until opening is intended.

Local tests use a GAS/HTTP mock; they do not prove Google deployment or real
Sheet writes. Public intake uses origin checks, bounded payloads, strict
server/GAS validation, a honeypot, formula-safe cells, a shared secret, locking
and idempotency. Honeypot/origin checks are not a comprehensive bot defense;
monitor Apps Script quotas and add an abuse-control pass if opening broadly.
Draft/pending answers use browser localStorage and can remain on shared devices
until cleared or submitted. No applicant payload is logged by our client/server.

## Google references

- [Apps Script web apps](https://developers.google.com/apps-script/guides/web)
- [Content service redirects](https://developers.google.com/apps-script/guides/content)
- [Lock service](https://developers.google.com/apps-script/reference/lock/)
