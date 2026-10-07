# Master Work Plan — CMS pass 5: Hods → Supabase

Status: **A–E selesai, LIVE `763bafc` pada kedua situs, acceptance all-tab PASS.**
Faiz mengizinkan push SHA fitur, origin mengirim ke dua repo. Checkpoint live
sesudahnya lokal dan memerlukan izin push baru. Plan ini menjadi arsip eksekusi
pass Hods; NEXT Partners plan terpisah, auth CMS terakhir.

## 1. Scope, sumber dan aturan baca

Baca berurutan: [kickoff](cms-migration-kickoff.md) → `AGENTS.md` →
[AI handoff](ai-handoff.md) → plan ini → [TODO](cms-migration-todo.md) →
[master migration plan](cms-supabase-migration-plan.md) → [CMS SOP](cms-sop.md).
[Pixel SOP](pixel-precision-sop.md) dan [assets](assets.md) mengunci visual.
Checkpoint aktif dan instruksi user terbaru mengalahkan NEXT arsip.

| Collection | Sebelum pass 5 | Setelah kode pass 5 deploy |
| ---------- | -------------- | -------------------------- |
| Projects   | Supabase       | Supabase                   |
| Team       | Supabase       | Supabase                   |
| Roles      | Supabase       | Supabase                   |
| Domains    | Supabase       | Supabase                   |
| Hods       | GAS            | Supabase                   |
| Partners   | GAS            | GAS                        |

Hanya konten `snapshot.hods`: enam fixed ID, title/description, nested tabs dan
sections. Astro static, RPC build-time anon, kontrak snapshot existing.
Tidak membuat editor/write API/state/revision/Storage/webhook/dependency baru.
Tidak mengubah auth CMS OAuth custom, recruitment Supabase Auth, admin handler,
media, Domains, Partners, UI/geometri/font/artwork/Zod/assertion.
Sesudah acceptance Hods: Partners → keputusan/implementasi auth CMS terakhir.
Milestones/settings, Team drift, cold-cache media dan pemisahan validasi GAS
bukan tambahan scope otomatis. Tidak onboarding ulang project/Sheet/Drive.

## 2. Kontrak actual dan inventaris lengkap

Sumber: `src/data/cms-schema.mjs` (`hodContent`, `hodPanelSlots`, `hod`),
`src/data/cms-snapshot.json`, `src/data/hods.ts` (`hodDesign`).
Record strict `{id,title,description,tabs}`. Tab strict `{sections}`.
Section union strict **salah satu** `{title,text}` atau `{title,bullets}`.
SQL pass ini membatasi title/description/text/bullet ke string 1–20000 UTF-16 units;
whitespace nonempty valid, jangan trim/normalisasi/copy-edit. `''` tidak valid.
Tidak ada field `label`, `kind`, `color`, `cardImage` di snapshot Hods.

**Actual: 6 ID, 21 tab, 55 section, 53 section teks, 2 section bullets,
8 bullet items.** Catatan lama 22 tabs di AGENTS adalah salah hitung, bukan
instruksi menambah tab. Urutan ID: data/core/language/vision/product/growth.
Posisi di tabel berikut 1-based, array JavaScript/JSON 0-based.
`T = {title,text}`; `B4 = {title,bullets:[empat string]}`.
Label tab di bawah adalah metadata desain lokal, **bukan field CMS/DB**.

| ID       | Tab | Label lokal                   | Section slots berurutan | Jumlah |
| -------- | --- | ----------------------------- | ----------------------- | ------ |
| data     | 1   | Data Science                  | T, B4, T                | 3      |
| data     | 2   | Data Analytics                | T, T, T                 | 3      |
| data     | 3   | Data Engineering              | T, T, T                 | 3      |
| data     | 4   | Data Infrastructure           | T, T                    | 2      |
| core     | 1   | Machine Learning              | T, T, T                 | 3      |
| core     | 2   | Deep Learning                 | T, T, T                 | 3      |
| core     | 3   | AI Engineering                | T, T                    | 2      |
| core     | 4   | MLOps                         | T, T, T                 | 3      |
| language | 1   | Natural Language Processing   | T, T                    | 2      |
| language | 2   | Generative AI                 | T, B4, T                | 3      |
| vision   | 1   | Computer Vision               | T, T, T                 | 3      |
| vision   | 2   | Optical Character Recognition | T                       | 1      |
| vision   | 3   | Video Understanding           | T                       | 1      |
| vision   | 4   | Multimodal AI                 | T, T                    | 2      |
| product  | 1   | UI/UX                         | T, T, T                 | 3      |
| product  | 2   | Front-end Development         | T, T, T                 | 3      |
| product  | 3   | Back-end Development          | T, T, T                 | 3      |
| product  | 4   | DevOps                        | T, T                    | 2      |
| growth   | 1   | Public Relations              | T, T, T                 | 3      |
| growth   | 2   | Creative                      | T, T, T, T              | 4      |
| growth   | 3   | Community & Partnership       | T, T, T                 | 3      |

Mask `hodPanelSlots` persis baseline:

```json
{
  "data": [
    [0, 4, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0]
  ],
  "core": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0],
    [0, 0, 0]
  ],
  "language": [
    [0, 0],
    [0, 4, 0]
  ],
  "vision": [[0, 0, 0], [0], [0], [0, 0]],
  "product": [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
    [0, 0]
  ],
  "growth": [
    [0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0]
  ]
}
```

`hods.ts` merges record/tab/section dengan desain **berdasarkan index**; metadata
ID desain juga dapat menutupi ID konten melalui spread. Salah array order
memasangkan konten dengan label/art/color lain. Validasi seluruh ID/order dan
nested value equality sebelum renderer; jangan mengubah loader untuk menutupi
order salah. Tab/section title CMS boleh berubah sesuai text contract;
CHECK hanya menjaga shape, count dan tipe. Pertukaran dua section teks yang
shape-nya sama tidak bisa dibuktikan salah oleh CHECK semata: lindungi melalui
seed/reconciliation/deep equality dan array order, bukan klaim constraint palsu.

Checksum orientasi, hitung ulang pada implementasi tanpa reset bila berbeda:

- Snapshot bytes SHA256:
  `4345f1abe445aa2a400c31413ccc058707a77105a7e388dc8d1074e78da94857`.
- `SHA256(JSON.stringify(snapshot.hods))`:
  `30ae1d2c14aea391e5ab7e1537161d4d81b67e6dbea1833ddf5e510df9862b66`.

Hash berbeda → cari paths/value drift dan perubahan user; tidak auto overwrite.
JSONB key order bukan content drift; array order selalu signifikan.

### Temuan implementasi — Unicode actual (7 Oct 2026)

Node 22.23.0 dan Zod yang terpasang (`zod/v4/core/checks.js`, `$ZodCheckMaxLength`)
memakai Unicode **codepoint** ketika panjang UTF-16 melewati batas. Probe actual:
10001 emoji = 20002 UTF-16 units **diterima Zod**. Jadi asumsi awal plan bahwa
SQL UTF-16 identik dengan Zod untuk emoji tidak benar. Schema/dependency tidak
berubah. SQL Hods tetap mengikuti ceiling UTF-16 konservatif yang diminta plan:
10000 emoji diterima, 10001 ditolak. Semua nilai yang SQL terima memenuhi Zod;
sebagian string astral yang Zod terima ditolak SQL. Tests mencatat perbedaan
ini secara eksplisit, bukan mengklaim parity total. Batas ASCII, tipe/union,
keys, slot/count/order dan whitespace tetap dibandingkan dengan Zod actual.
Postgres NUL/lone surrogate tetap tidak dapat disimpan. Helper Domains applied
tidak diubah atau dinyatakan telah diaudit ulang oleh pass ini.

## 3. Visual terkunci dan routing acceptance

Tidak ada section UI baru. Ini inventaris reference existing dari repo/provenance,
bukan fresh Figma export sesi planning. Semua enam frame desain **1440×1280**.
Figma file `JYUzJK1hFqaEwL6DpdDvjp`:

| Route          | Node      | URL                                                                   |
| -------------- | --------- | --------------------------------------------------------------------- |
| /hods/data     | 864:18857 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-18857 |
| /hods/core     | 864:18904 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-18904 |
| /hods/language | 864:18959 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-18959 |
| /hods/vision   | 864:19013 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-19013 |
| /hods/product  | 864:19024 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-19024 |
| /hods/growth   | 864:19035 | https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp?node-id=864-19035 |

Container desktop padding 80, gap 56, back at (80,80); card
(80,163,1280,279); tabs (80,498), button gap 8, height 32. Body gap 32,
block heading→content 16, panel block gap 42 existing measured exception.
Back gap/title→description 14, bullet dot→text 23 existing exceptions; bullets
row gap 8. Bluu Next Bold 700 heading 48/57.6; Manrope H2 700 26/39,
body 500 18/27; hero description existing CSS line-height 39 (jangan samakan
ke body). Artwork `/images/hods/card-{id}.webp`, arrow.svg dan glow existing;
reference language `assets/assets home page/hods/detail/HoDS-Detail-Language-1x.png`

- 2x. Metadata label/kind/color tetap `hodDesign` lokal.

Desktop geometry assertions tetap 1440×1280, termasuk pada viewport 1440×1400.
Mobile ≤900 memakai padding safe-area + 24 horizontal/40 bottom, gap 40 dan
existing min-height 100lvh. Jangan menerapkan full-screen home standard ke
komponen detail atau mengubah runtime height. Tidak melakukan fresh UI pass;
bila perubahan UI diperlukan, berhenti dan ikuti pixel SOP per-section dahulu.

Home links `/hods/{id}` → back `/#domains` / “Back to HoDS”.
Recruitment links `/hods/{id}?from=recruitment` → back
`/recruitment#who-should-join` / “Back to Who Should Join”.
Tabs actual mendukung click dan ArrowLeft/ArrowRight wrap focus, selected state,
roving tabindex dan panel hidden. Jangan menuntut Home/End sebagai fitur existing
atau mengimplementasikannya diam-diam. Test seluruh 21 tab, bukan tab awal saja.

## 4. SQL proposal yang harus dibuktikan sebelum apply

Migration usulan `supabase/migrations/20261012010000_cms_hods_pass5.sql`;
cek collision dahulu. Jangan rename/change migration Roles/Domains existing.
Satu table `private.cms_hods`:

| Kolom                 | Tipe                      | Constraint                              |
| --------------------- | ------------------------- | --------------------------------------- |
| id                    | text PK                   | six fixed ID whitelist                  |
| title / description   | text NOT NULL             | UTF-16 length 1–20000                   |
| tabs                  | jsonb NOT NULL            | strict nested shape + mask §2           |
| position              | smallint NOT NULL UNIQUE  | fixed CASE id→1..6                      |
| created_at/updated_at | timestamptz default now() | NOT NULL, metadata tidak masuk response |

Tidak perlu child tables atau surrogate IDs untuk fixed nested arrays ini.
JSONB arrays mempertahankan urutan tab/section/bullets; RPC tidak memecahnya
menjadi unordered aggregation. Tidak menyimpan label/kind/color/cardImage.

Helper private immutable `cms_hods_utf16_length(text)` dan
`cms_hods_tabs_valid(text,jsonb)`; Hods helper sendiri, jangan mengubah helper
Domains yang sudah applied. Ikuti UTF-16 approach Domains: count satu
unit untuk BMP, dua untuk codepoint >65535, `''` panjang 0. Jangan memakai
`length(text)` biasa untuk klaim parity emoji. Boundary SQL seluruh field text
10000 emoji accepted/10001 rejected; fixtures ASCII 20000/20001 dan quotes/newline.
Postgres text/JSONB tidak merepresentasikan NUL/lone surrogate: jangan mengklaim
semua JS string dapat disimpan; tetap fail closed, Zod tidak diubah untuk workaround.

Validasi helper bertahap, return false untuk NULL/unknown/scalar/malformed:

1. Mask ID exists; tabs bertipe array, count fixed 4/4/2/4/4/3.
2. Tiap tab object; key set **persis `sections`**, array count sesuai mask.
3. Tiap section object, key set **persis `title,text` atau `title,bullets`**
   sesuai slot, title string 1–20000. Tolak keduanya/neither/extra key/null.
4. T-slot: text string 1–20000; B4-slot: bullets array tepat empat, setiap item
   string 1–20000. Array order disimpan verbatim; whitespace nonempty diterima.
5. Tidak memanggil jsonb_array_length/object_keys sebelum type check. SQL AND
   bukan jaminan safe short-circuit. `CHECK(helper(id,tabs) IS TRUE)` agar NULL
   result tidak bypass; NOT NULL untuk kolom. Revoke PUBLIC helper execute.

Per-row CHECK tidak menjamin keenam record ada. Seed equality + RPC + final
ordered Zod menolak response lima/seven/wrong order; jangan menambah cardinality
trigger/editor atau melengkapi dari GAS. Jangan ubah helper applied tanpa
revalidasi constraints dalam migration yang disengaja.

Keamanan: RLS enable + revoke table ALL PUBLIC/anon/authenticated; explicit
ALL deny policy USING false/WITH CHECK false. Private read
`private.cms_load_hods()` dan wrapper `public.cms_load_hods()` SECURITY DEFINER,
search_path `pg_catalog`, reference schema-qualified. Revoke default PUBLIC/
anon/authenticated EXECUTE pada helper/private read/wrapper, grant wrapper
hanya anon + service_role; authenticated wrapper harus denied. Jangan mengubah
schema grants/default privileges/global policy atau auth.users/collection lain.

Response tepat `{hods:[{id,title,description,tabs},...]}` dengan jsonb_agg
ORDER BY position dan [] saat kosong. Tidak SELECT *, metadata, null stripping,
atau reconstruction yang menyembunyikan invalid payload.
Migration BEGIN/COMMIT, seed persis enam reconciled snapshot records,
ON CONFLICT(id) DO NOTHING; rerun lokal menjaga owner fixture edit. Jika table/
RPC sudah ada, inspect read-only data/constraints/policy/grants/function owner
sebelum action; jangan blind reseed/drop/create-or-replace untuk “memperbaiki”.
Tidak memalsukan migration ledger jika apply via Management API database/query.

## 5. Snapshot hybrid, errors dan fixtures

Tambahkan `cms_load_hods` sesudah RPC Domains pada `syncCmsSnapshot` remote;
assign response.hods lalu final existing Zod, media cache existing, atomic write.
Local mode tanpa dua GAS env tetap tanpa network. Semua migrated reads pakai
SUPABASE_ANON_KEY; dilarang memakai service key sebagai anon workaround.
GAS masih **full export validated sebelum overrides**. Partners membutuhkan GAS,
tab Hods/Roles/Domains/Projects/Team tetap valid; jangan delete tabs/env atau
refactor partial validation/GAS redirects/cache/media/auth di pass ini.

RPC HTTP/network/timeout/JSON/shape/slot/order failure → fail build; old snapshot
bytes tetap, temp file bersih. Tidak fallback GAS Hods/stale. Sanitasi error
nama operasi/status/path saja, bukan upstream raw body/URL/token; follow Domains
scoped error protection tanpa refactor seluruh helper. Mock semua sync callers
untuk RPC baru; Team response tetap members/groups, bukan full snapshot.
Roles/Domains success-path mocks akan mencapai Hods; adapt tests relevan.

## 6. Checklist eksekusi A–E

Lock tahap sebelum masuk tahap dependen; planning bukan bukti local/SQL/live.

### A. Orientasi dan reconciliation

- [x] Git status/SHA/branch/remotes, Node 22 verified; perubahan asing jangan reset.
- [x] Baca tujuh dokumen urut §1; pahami SOP/secrets/izin.
- [x] Snapshot bytes/hash + 19 public HTML baseline fresh, artifacts/cms-pass5/.
- [x] Env presence saja; local .env.local bukan bukti env Vercel actual.
- [x] GAS Hods vs snapshot seluruh 6/21/55/8 values/order/types; mismatch laporkan
      paths/counts dan minta keputusan sumber sebelum seed, tanpa dump secrets.
- [x] Read-only destination table/helper/RPC/grants/policies/data existence.
- [x] Capture pre-pass hybrid inputs, catat Team drift preexisting; tidak reseed.

### B. Kode + PostgreSQL ephemeral

- [x] SQL table/checks/helper/read/RLS/seed sesuai §4, scope Hods saja.
- [x] tests/cms-hods-supabase.test.mjs real ephemeral PG; tidak write live DB.
- [x] Seed exact + shuffled physical INSERT output fixed + wrong ID/position reject.
- [x] Every tab/section slot/type/cardinality, strict keys, null/scalar/Unicode
      negatives + positives, quotes/newlines/whitespace; Zod dibandingkan pada fixtures,
      dengan perbedaan batas astral SQL lebih ketat tercatat di §2.
- [x] Role anon/service wrapper allowed, authenticated denied, table SELECT/DML/
      private helpers/read denied; catalog owner/SECURITY DEFINER/search_path proof.
- [x] Local rollback-only temporary grants isolate RLS even if table grants absent;
      no live grant changes. Test helper/public defaults PUBLIC execute revoked.
- [x] Owner fixture edit + migration rerun preserved, no duplicates.
- [x] Hybrid Hods override + final Zod + atomic failure tests; update sync mocks.
- [x] CMS full suite **tanpa env server**, recruitment contracts PASS sebelum apply.

### C. Apply additive SQL + live DB proof

- [x] Existing web-community ref yejrdckcmlxrkklgtrwy verified in memory.
- [x] Anon key jika missing ambil Management API privat/in-memory; no print/env write.
- [x] Reconcile ulang segera sebelum seed; jangan anggap Sheet tak bisa edit manual.
- [x] Apply hanya setelah A/B PASS; no deploy hook/manual rebuild sebelum push berizin.
- [x] Applied-state inspect setelah HTTP failure; jangan otomatis apply/drop ulang.
- [x] Actual anon HTTP RPC six records exact + Zod; catalog RLS/policy/helper grants/
      function ownership/search_path; actual role execution read allowed/deny proof.
- [x] Same **captured remote inputs** pre/post client: only Hods source changes,
      seluruh values dan non-Hods unchanged; Team remote drift tetap, repo snapshot utuh.
- [x] Proof sanitised timestamp UTC/WIB; local/mock/catalog/role/HTTP evidence dibedakan.

### D. QA + reviewable commit

- [x] Build committed baseline, jangan overwrite snapshot dengan remote Team drift.
- [x] CMS/recruitment counts recorded pass/fail/skip; 10 Team live SKIP expected bila
      env absent, jangan mengejar zero skips lewat production mutation.
- [x] Native/legacy/Team admin mock regression × empat width.
- [x] 7 gate + SEO PASS; snapshot bytes + 19 public HTML exact baseline input sama.
- [x] Local HoDS test all 21 tabs/55 blocks/8 bullets exact + click/ArrowLeft/Right
      wrap/focus/aria/panel hidden; six routes at 390/1440; both origin back flows.
- [x] Docs/checkpoints/TODO updated, single feature commit siap review, tree bersih.

### E. Push berizin + dua-site acceptance

- [x] Fresh presence empat env Supabase + CMS_API_URL/CMS_API_TOKEN Production
      kedua Vercel; gunakan VERCEL_TOKEN lokal in-memory bila CLI beda scope.
      Missing env essential perbaiki dari konfigurasi existing, values tidak dicetak.
- [x] Konfirmasi push SHA baru yang konkret; izin Domains/dokumen sebelumnya consumed.
- [x] Push origin main sekali, fetch dua remote; pastikan tiga SHA feature sama.
- [x] Dua deployment terbaru SHA feature READY/SUCCESS, timestamp actual UTC/WIB;
      queued/building/green lama tidak dianggap live. GitHub anon 403 bukan bukti fail
      deploy: gunakan Vercel API token existing tanpa raw secrets.
- [x] Semua six /hods/{id} × 390/1440 × kedua situs, klik **seluruh 21 tab**;
      copy/nested section/bullet order, labels lokal/art decode, no overflow/pageerror.
- [x] Click Home/Recruitment entry→detail→context-specific back + VT re-init tabs;
      repeat normal query and ?from=recruitment, jangan hanya direct navigation.
- [x] Public smoke Home/Recruitment/Roles tetap baik; admin projects/team/media
      anonymous 401, recruitment {ok:true,accepting:false}; no production mutations.
- [x] Update LIVE checkpoint/DoD, summary proof tracked docs; artifacts ignored
      bukan satu-satunya handoff. Checkpoint docs lokal belum otomatis boleh push.

## 7. Test matrix dan commands

| Layer    | Minimum cases                                                         | Expected                                     |
| -------- | --------------------------------------------------------------------- | -------------------------------------------- |
| SQL      | all 6/21/55/8 values; reverse physical insert; fixed ID position      | exact, ordered, wrong position denied        |
| JSON     | tabs/tab/sections/section scalar/null/wrong count/type/extra key      | CHECK denial tanpa unsafe scalar exception   |
| Union    | both text+bullets, neither, kind/label/color extra, wrong slot kind   | reject, strict parity                        |
| Text     | empty/null/number, whitespace, quotes/newline, ASCII/emoji boundaries | typed UTF-16 limits, no trim                 |
| Order    | nested arrays roundtrip, swapped same-shape text fixture              | order preserved; equality detects swap       |
| Security | private SELECT/INSERT/UPDATE/DELETE/helpers, wrapper three roles      | denied; anon/service allowed/auth denied     |
| Rerun    | owner edit then seed rerun (ephemeral only)                           | edit preserved, no duplicate                 |
| Sync     | GAS differs but SP valid; count/order/nested invalid/error cases      | SP-only, old bytes on failure, no stale      |
| Local    | no GAS config, partial config, missing required Supabase config       | local no fetch / remote fail closed          |
| Browser  | six routes, every tab, both entry contexts, clicks/arrow wrap         | exact content/aria/focus/back/no error       |
| Live     | actual anon RPC + two SHA deployments + full browser + anonymous API  | SQL applied + deploy acceptance proven apart |

Node 22; dependency existing. Run local suites without --env-file and without
inherited remote/server variables. Verify presence only; do not dump env. Baseline
CMS 56 PASS/10 SKIP, Recruitment 24 PASS; Hods tests increase count naturally.

```sh
npm run test:cms
npm run test:recruitment
npm run verify:cms-admin
npm run verify:cms-native-admin
npm run verify:cms-team-admin
npm run build
python3 -m http.server 4331 --directory dist
```

Serve static in separate session; then:

```sh
PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs
PREVIEW_URL=http://localhost:4331 npm run audit:navbar
PREVIEW_URL=http://localhost:4331 npm run verify:vt
PREVIEW_URL=http://localhost:4331 node scripts/responsive-audit.mjs
npm run audit:spacing
npm run format:check
npm run seo:audit
```

New dedicated Hods browser runner may be added if necessary; no package/command
exists yet. Existing verify checks desktop six-route geometry/default back context,
not full 21-tab content coverage. Do not claim that coverage from verify alone.
Use isolated snapshot paths + finally cleanup for live experiments; no full live
Team suite. Private media cold-cache audit remains separate, not assumed PASS.

Proof files ignored artifacts/cms-pass5/: reconciliation, before/after captured
hybrid, PG test log, live-db, QA logs, baseline/after HTML hashes, env presence,
deployments SHA + actual timestamps, full-tab live-browser report/screenshots.
Do not persist keys/raw network request headers; captured response data internal
can include member info, never dump to public logs; tracked docs summary only.

## 8. Risk review, stop/rollback and definition of done

- Nested arrays may validate shape yet have wrong semantic ordering: deep equality,
  checksums, seeds and full-tab browser coverage, no sort/filter/flatten.
- JSONB rejects extra keys only if helper implements it; type/count alone inadequate.
- New helper default PUBLIC execute can expose private surface: explicit revoke,
  function owner inspection and actual roles, not catalog-only claims.
- Seed DO NOTHING preserves existing divergence: reconcile destination before apply.
- Missing six-row cardinality must fail final Zod; no silent GAS completion.
- Full GAS remains dependency even after Hods migrate; only Partners content source
  remains GAS but exported migrated tabs still must validate. Never delete GAS now.
- Team drift cannot be “fixed” in baseline. Separate pre/post same-input proof.
- Fail/timeout after SQL apply does not prove SQL absent; inspect before retry.
- Manual GAS/Supabase edits require reconcile source decision, no blanket overwrite.

Stop dependent work if source mismatch unresolved, privileges unsafe, baseline
changed unexpectedly or gate failed. Continue independent safe investigations;
report actual blocker, not hypothetical onboarding requests. If table applied but
code not deployed, old GAS code stays live; forward-fix without drop. After deploy,
prefer forward-fix; reverting Hods source to GAS needs explicit approval after
compare new edits. GAS backup is not automatically current/dual-written.

DoD: all A–E checked with exact six Hods/21 tabs/55 sections/8 bullet items,
SQL/RPC/security actual proofs, no stale fallback, 7 gate + SEO, same input snapshot/
HTML parity, two approved feature deployments and all-tab live acceptance.
Never call pass 5 LIVE just because SQL applied. Sesi planning sebelumnya
belum mengimplementasikan Hods; status implementasi actual dicatat di atas.

CREATE expected: migration 20261012010000_cms_hods_pass5.sql and
tests/cms-hods-supabase.test.mjs; optional focused browser verification script.
MODIFY: scripts/cms-client.mjs, relevant sync mocks (cms/cms-media/cms-roles/
cms-domains tests), active docs. UNCHANGED: src/data/cms-schema.mjs,
src/data/cms-snapshot.json baseline, src/data/hods.ts/domains.ts, public UI,
fonts/assets/references, scripts/verify.mjs assertions, server/admin/auth/media,
API routes, other migrations/collections.

## 9. Bukti eksekusi sebelum push — 7 Oct 2026

- A: Node 22.23.0, main `dbc2b22`, tree awal bersih, dua remote `6b36519`.
  Snapshot SHA dan Hods SHA §2 cocok; 19 fresh baseline HTML tersimpan.
  GAS Hods exact; destination table/RPC/dua helper absent. Capture pre-pass:
  satu-satunya drift terhadap repo adalah Team, tidak di-reseed.
- B: Hods focused 18/18; full CMS 74 PASS/10 live Team SKIP/0 FAIL; recruitment
  24/24. PostgreSQL nyata: setiap slot, union/keys/type/count/Unicode, exact seed,
  reverse physical insert → fixed output, constraint/privilege/RLS deny,
  default PUBLIC execute revoke, owner/search_path, rerun menjaga owner edit,
  incomplete/empty RPC gagal final schema. Batas astral SQL/Zod berbeda (§2).
- C: SQL applied 12:37:27.829 UTC / 19:37:27.829 WIB ke existing web-community.
  Probe RPC pertama gagal, read-only inspect state lalu HTTP 200 exact; tidak
  reapply/drop. Actual 15 permission denials + allowed anon/service reads,
  RLS/deny policy, ACL/default PUBLIC revoke, owner postgres dan definer/search_path.
  Proof selesai 12:38:12.869 UTC / 19:38:12.869 WIB. Same captured remote inputs
  pre/post hybrid value-identik; seluruh non-Hods utuh, repo snapshot utuh.
- D: 7 gate + SEO, build 0 error/browserErrors[], responsive 468/468, SEO 23,
  spacing 39; tiga admin mock × 320/390/768/1440. Semua enam Hods routes/21 tabs/
  55 blocks/8 bullets × 390/1440 × Home + Recruitment entry/back/VT PASS.
  Snapshot bytes + 19 HTML exact fresh baseline. Runner tracked:
  `PREVIEW_URL=http://localhost:4331 node scripts/verify-cms-hods.mjs`.
- E: fresh empat Supabase + dua GAS keys Production kedua Vercel present.
  Push belum dilakukan; konfirmasi user harus menunjuk SHA feature baru.
  Setelah approval, ulang runner all-tab pada kedua origin, HTTP anonymous smoke,
  verifikasi actual deployments SHA/time, lalu update LIVE checkpoint.

Bukti ignored `artifacts/cms-pass5/`; ringkasan tracked di section ini dan
AGENTS/ai-handoff/TODO/kickoff. Tidak ada hook/rebuild/push atau mutation
Projects/Team/recruitment pada pass ini. Seluruh CMS belum selesai.

## 10. Live acceptance setelah push berizin — 7 Oct 2026

- Feature SHA `763bafc9a350bfe062ea2e5fc5f74bb333b52c94` dipush origin once ke
  testing + production; main/origin/main/production/main sama saat verifikasi.
- API Vercel actual READY: testing **12:53:12.956 UTC / 19:53:12.956 WIB**,
  production **12:55:00.507 UTC / 19:55:00.507 WIB**. Kedua primary domains assigned
  ke deployment SHA ini. Env empat Supabase + dua GAS Production kedua project
  diverifikasi ulang sebelum push; values suppressed.
- Kedua situs: enam Hods routes, semua 21 tabs/55 blocks/8 bullets × 390/1440
  × Home + Recruitment entry contexts PASS. Copy/order/local labels/art exact,
  click/arrow wrap/focus/aria/hidden, context query/back + View Transitions,
  no overflow/pageerror. 24 detail screenshots tersimpan.
- Enam Roles smoke setiap situs PASS; anonymous projects/team/media API 401,
  recruitment `{ok:true,accepting:false}`. Seluruh acceptance read-only.
- Clock evidence: workspace UTC `12:54:39.370` vs Vercel HTTP Date `12:56:57`,
  selisih sekitar 138 s. `checkedAt` browser menggunakan workspace clock;
  READY timestamps menggunakan provider API. Tidak mengurutkan event lintas
  jam tanpa memperhitungkan skew, tidak mengganti actual provider times.
- Proof ignored: deployments/aliases-763bafc.json, live-browser-testing.json,
  live-browser-production.json, 24 screenshots, live-smoke.json, time-check.json.
  Summary tracked di AGENTS/ai-handoff/kickoff/TODO/SOP/master plan.

DoD Hods A–E terpenuhi. Checkpoint LIVE ini lokal belum dipush; izin fitur
`763bafc` consumed. NEXT Partners belum diimplementasikan, auth final pending,
GAS masih dependency. Tidak mengulang seed SQL/Team atau mengganti UI/media/auth.
