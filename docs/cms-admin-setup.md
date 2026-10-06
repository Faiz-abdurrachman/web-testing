# Install the private Projects editor (B2 foundation)

This is a separate Apps Script project. Keep the public CMS Export project
unchanged. Its export token must never authorize admin edits.

## Files

Run `npm run cms:admin`. Generated files (no secrets) are ignored by git:

- `artifacts/cms-admin/Code.gs`
- `artifacts/cms-admin/Index.html`
- `artifacts/cms-admin/appsscript.json`

## Owner installation

1. Login to Apps Script with the existing CMS owner account. Create a new
   project named **Data Sorcerers CMS Admin**.
2. Replace Code.gs with the generated Code.gs. Add an HTML file named **Index**
   and copy the generated Index.html into it. Save both.
3. Enable the manifest in Project Settings and replace appsscript.json with the
   generated admin manifest. This adds the external-request permission for
   requesting Vercel builds.
4. In this new project's Script Properties set:

   | Property                 | Value source                                   |
   | ------------------------ | ---------------------------------------------- |
   | `SPREADSHEET_ID`         | Same property from existing CMS Export project |
   | `DRIVE_FOLDER_ID`        | Same property from existing CMS Export project |
   | `DEPLOY_HOOK_TESTING`    | Ignored local env `CMS_DEPLOY_HOOK_TESTING`    |
   | `DEPLOY_HOOK_PRODUCTION` | Ignored local env `CMS_DEPLOY_HOOK_PRODUCTION` |

   Do not copy EXPORT_TOKEN. Do not create another Sheet or Drive folder.
   All account identifiers, IDs and hooks remain in Properties, never docs/code.

5. Select **setupAdmin → Run**, review the requested Google permissions and
   authorize under the owner account. Success log must say **Admin setup
   complete. Deploy with access Only myself.** This checks Sheet headers,
   current Projects, file/folder ownership and both hook URLs. It sets owner
   and allowlist automatically without logging account identity.
6. Deploy → New deployment → Web app:
   **Execute as Me** and **Who has access Only myself**. Save the new admin
   `/exec` URL. Never use Anyone for this project.

## Owner live checks

- Open the admin URL with the owner account; four existing Projects load.
- Check another account/private signed-out window cannot use the editor.
- First click Simpan dan terbitkan without changing content. This exercises
  real authorization, Sheet write and both hooks while keeping baseline content.
- Verify both Vercel rebuilds succeed with remote-mode logs. A hook acceptance
  means the build is requested, not already published.
- Test a small owner-approved content edit and confirm the result on both sites;
  preserve/revert the baseline copy if geometry verification still uses it.
- If either build request fails, the content is still saved; Coba terbitkan lagi
  requests publication without repeating the Sheet write. Stale edits ask the
  editor to reload instead of overwriting newer content.

This first pass edits existing Projects only. Add/delete, uploaded images, Team
and other collections require their next tested passes. No final CMS completion
claim before those are implemented. A second admin needs a separate tested
identity/access configuration; current Only myself deployment supports one owner.

Authentication/RPC references:
[Google web app deployment](https://developers.google.com/apps-script/guides/web),
[HtmlService RPC](https://developers.google.com/apps-script/guides/html/communication),
[Session identity](https://developers.google.com/apps-script/reference/base/session).
