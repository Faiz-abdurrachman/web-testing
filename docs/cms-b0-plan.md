# CMS B0 — snapshot foundation

Status: IN PROGRESS. One collection per pass, with seven gates and SEO before
starting the next collection. B0 uses the committed snapshot without networking.
The existing module exports and rendered data must remain identical.

## Work order

| Pass | Collection | Existing reference                        | Status  |
| ---- | ---------- | ----------------------------------------- | ------- |
| 1    | projects   | Home `1430:2146`, HoF `1439:4655`         | PASS    |
| 2    | team       | About `1688:2933`                         | PASS    |
| 3    | roles      | Recruitment `1436:3564`, six role details | PENDING |
| 4    | partners   | Partners `1439:4793`, `1439:4937`         | PENDING |
| 5    | domains    | Home `1430:2138`, Recruitment `1436:3512` | PENDING |
| 6    | hods       | Six HoDS details, beginning `864:18857`   | PENDING |

## Plan for each pass

Before migrating a collection, capture its existing exports and inventory its
content fields and design fields. Add only that collection to the versioned JSON
snapshot and its Zod schema. Keep geometry, fixed slots, artwork configuration,
chip coordinates, gradient values, tab ordering and text colors in local code.
Replace content literals with a typed loader while retaining existing exports.

Reference URLs use
`https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=`
followed by the node ID with its colon replaced by a hyphen. This is a data
refactor: section dimensions, padding, gaps, fonts, artwork and references are
preserved from the verified implementation. Headings use Bluu Next 700 and body
copy uses Manrope; spacing follows the existing measured 8pt exceptions.

For every pass, compare loader exports deeply against the captured originals,
build against the local snapshot, compare generated HTML against the baseline,
and run build, verify, navbar audit, View Transition audit, responsive audit,
spacing audit, format check and SEO audit. Keep all geometry assertions intact.
Record results below, then commit the pass.

## B0 boundaries and B1 follow-up

Use Zod through Astro's existing `astro/zod` export, without adding a runtime
dependency. Validate schema version, required fields, unique IDs, route ordering
and fixed slot counts. Invalid snapshots must fail before the Astro build.

`fetch-cms.mjs` validates the committed snapshot in B0. B1 will add authenticated
remote fetch with timeout, bounded response and atomic replacement after full
validation. A configured remote failure must fail the build; local operation
without CMS credentials continues using the committed snapshot.

One Google owner/admin has been selected; the media folder will be created during
GAS setup. Account identifiers, folder IDs, tokens and deploy hook URLs belong in
Script Properties/environment variables and are excluded from repo files.
Deploy hooks still need to be created for both Vercel projects.

Featured achievements, milestones and settings currently live inside components
or layouts. Their extraction belongs to B3, with a dedicated pass for each.
Team photo upload requires adapting the existing fixed photo renderer in B2.

## Verification results

Projects: build 0 errors, verify exit 0 (browserErrors empty), navbar PASS,
View Transitions PASS, responsive 468/468, spacing PASS, format PASS, SEO PASS.
All six data exports and all 19 HTML files equal the pre-B0 baseline. Schema
negative cases and local/partial-env CLI behavior passed. Navbar audit now waits
for both pseudo-element opacities, fixing a timing race without changing UI.

team: 7 gates + SEO PASS; responsive 468/468; all six exports and all 19
HTML files equal the pre-B0 baseline.
