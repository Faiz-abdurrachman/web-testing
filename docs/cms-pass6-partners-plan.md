# CMS pass 6 — Partners → Supabase — Master Work Plan

NEXT [Auth CMS Master Work Plan](cms-auth-supabase-plan.md) rinci **PLAN ONLY**,
eksekusi di AI baru atas permintaan Faiz. Provider/dependency/owner/session
pending. File Partners ini tetap proof A–E accepted, bukan work order diulang.

Status: **A–E selesai — Partners LIVE925d577 di kedua situs**. Push fitur dengan
izin Faiz, kedua exact SHA/primary aliases READY dan acceptance live PASS §10.
Checkpoint docs sesudah acceptance lokal; lihat git log. Izin push925d577
consumed; konfirmasi sebelum push baru. Auth CMS final pending, GAS tetap wajib.

## 1. Baseline, urutan baca, dan scope

Baseline sebelum pass **526b428** (checkpoint docs), fitur Hods **763bafc**.
Keduanya sudah dipush dengan izin; izin tersebut consumed. Testing READY
7 Oct 2026 **13:12:20.677 UTC / 20:12:20.677 WIB**, production
**13:13:44.014 UTC / 20:13:44.014 WIB**. Primary aliases dan HTTP smoke kedua
situs terverifikasi. Hods A–E selesai; jangan mengulang migration/acceptance Hods.
Timestamp READY berasal dari provider; workspace pernah tertinggal ~138 detik.

Baca seluruhnya, berurutan: kickoff (termasuk §6) → AGENTS → ai-handoff → file
ini → migration TODO → master migration plan → CMS SOP. Lalu actual schema,
snapshot, partners.ts, cms-client, GAS export, SQL/tests Hods dan Domains.
Baca pixel-precision SOP, assets provenance dan fullscreen plan sebelum menyentuh
UI. Checkpoint aktif mengalahkan NEXT historis.

Hanya sumber konten Partners build-time yang dipindah. Pada baseline sebelum
pass, Projects/Team/Roles/Domains/Hods sudah Supabase dan Partners masih GAS.
Setelah acceptance925d577, keenam content sources Supabase. Full GAS export tetap divalidasi
sebelum seluruh overrides, termasuk setelah enam collection memakai Supabase.
Jangan hapus tab/env/deployment GAS, refactor partial validation/media, reseed
Team, mengubah recruitment, auth, UI, assets, dependencies atau applied migrations.
Tanpa editor/write API/state/Storage baru. Auth CMS terakhir, provider final pending.

## 2. Kontrak actual dan inventory data

Otoritas: `src/data/cms-schema.mjs`, `src/data/cms-snapshot.json`,
`src/data/partners.ts`, `cms/gas/export.js`. Bentuk snapshot strict:

```json
{
  "partnerCategories": [
    { "label": "Industry" },
    { "label": "Academia" },
    { "label": "Community" }
  ],
  "partnerLogo": "/images/partners/partner-logo.webp",
  "whyPartners": [
    {
      "title": "Talent",
      "description": "Access to emerging AI & Data talent."
    },
    {
      "title": "Research",
      "description": "Collaborate on meaningful research."
    },
    {
      "title": "Innovation",
      "description": "Explore new technologies and ideas."
    },
    {
      "title": "Community",
      "description": "Reach a growing technology community."
    }
  ]
}
```

Tiga kategori + satu path logo + empat why cards = **11 text strings dan satu
asset path**. Categories tepat tiga strict objects `{label}`; why tepat empat
strict objects `{title,description}`. Partners object tepat tiga keys di atas.
Urutan kedua arrays signifikan; tidak ada ID kategori/why di kontrak snapshot.
GAS menyimpan rows bertipe category/why/logo dengan metadata id/order; metadata
tersebut tidak menjadi field RPC. Rekonsiliasi export yang sudah disusun GAS,
bukan sekadar membandingkan urutan fisik rows Sheet.

`partners.ts` menambah count lokal **10/5/5**, total **20 slot logo placeholder**,
dan empat icon lokal berurutan: why-talent, why-research, why-innovation,
why-community `.webp` di `/images/partners/`. Itu bukan 20 records organisasi.
Tidak menambah logo perusahaan, link palsu, count/icons/geometry ke database.
Nama kategori adalah text, bukan enum Zod. Reorder dengan shape valid tetap
valid secara schema; deep equality terhadap sumber yang direkonsiliasi membuktikan order.

Text `min(1).max(20000)` tanpa trim; whitespace-only nonempty valid.
**Installed Zod mengukur codepoints** saat string melampaui UTF-16 threshold;
probe Node 22 planning menerima 20000 emoji. Partners SQL harus memakai
`char_length` untuk Unicode yang PostgreSQL dapat representasikan, dengan tes
boundary actual Zod. Jangan menyalin ceiling UTF-16 Hods/Domain atau mengubah
helper applied. PostgreSQL tidak menyimpan NUL/lone surrogates: fail closed dan
catat batas representasi, jangan mengklaim parity untuk seluruh JS strings.

Image schema: `^/images/[a-zA-Z0-9_./-]+$` dan tidak mengandung `..`.
Probe schema planning menolak terminal LF/CR dan Unicode path. Uji ulang actual
schema saat implementasi, termasuk slash, control, traversal, https/data URL,
protocol-relative, empty, extra keys. Path regex tidak membuktikan file ada:
cek file public existing dan browser decode terpisah. Jangan normalisasi path/text.

Planning awal hanya menginventarisasi snapshot/code lokal. Rekonsiliasi GAS/
snapshot/destination A3/C1 kini actual PASS; lihat §9, bukan bukti planning.

## 3. Inventory visual terkunci per section

Figma file `JYUzJK1hFqaEwL6DpdDvjp`, page frame **1439:4787**.
Inventory depth-1 dari provenance/code existing, bukan fresh Figma export sesi ini.
URL tiap node: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/?node-id=`
diikuti node ID dengan colon diganti hyphen.

| #   | Section / node / URL                                                                             | Figma frame | Status pass ini                        |
| --- | ------------------------------------------------------------------------------------------------ | ----------- | -------------------------------------- |
| 1   | [Hero 1439:4788](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/?node-id=1439-4788)         | 1440×659    | Locked; static copy/art                |
| 2   | [Our Partners 1439:4793](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/?node-id=1439-4793) | 1440×1071   | Locked; three labels + shared logo CMS |
| 3   | [Why DS 1439:4937](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/?node-id=1439-4937)       | 1440×656    | Locked; four titles/descriptions CMS   |
| 4   | [Footer 1439:4983](https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/?node-id=1439-4983)       | 1440×556    | Shared locked component                |

### 3.1 Hero

`PartnersHero.astro`: static artwork `/images/partners/hero-bg.webp` plus existing
resolution/portrait variants, source `assets/hero gambar/Hero Section - Partners.png`.
Reference `assets/partners/hero/Partners-Hero-1x.png`. Runtime min-height
100vh/100svh, content max1280, desktop padding80, gap8. Bluu Next Bold700
80/102 title, Manrope12/18 pill. No video. Copy is not Partners CMS.
Acceptance: existing geometry assertion, static image decode, exact heading,
mobile crop, reduced motion and navbar intact.

### 3.2 Our Partners

`OurPartners.astro`: padding80, section gap100 and group gap42 existing measured
exceptions; head gap20, pill padding4×16, Manrope50018/27. Grid five columns,
gap16; cards243.2×116, radius20; local card-bg and logo78×84. Group nodes
1439:4794 / 1439:4863 / 1439:4900. Reference
`assets/partners/our-partners/OurPartners-1x.png`.
At ≤1050 padding64/gap64/group gap32/grid3; ≤700 padding48/gap48/group gap24,
pill16/24/grid2/gap14 existing exception. Preserve 10/5/5 slots and image alt
`${label} partner ${index+1}`; backgrounds decorative aria-hidden. Cards are
images, not new links. Acceptance: three labels/order, 20 logos decoded,
correct per-group counts/alt, no overflow or clipped text.

### 3.3 Why DS

`WhyPartners.astro`: padding80/gap48, head263 with gap8; Bluu70080/102;
pill Manrope40012/18 padding4×12. Four-column grid gap16, width1286;
card309.5×185 minimum, padding28 existing exception. Icon58×63 local,
title Manrope70026/39, description Manrope40016/24. Local why-glow art792×413;
reference `assets/partners/why-ds/WhyDS-1x.png`.
≥1366 grid4; 1051–1365 grid3; ≤1050 grid2/padding64/gap44 exception;
≤700 grid1/padding48/gap32/card padding24. Acceptance: all four text pairs/order,
index-matched icons/glow decode, heading and responsive/reduced-motion intact.

### 3.4 Footer and exact geometry

Shared Footer/Navbar remain existing. Reference
`assets/partners/footer/Partners-Footer-1x.png`; verify navigation/VT/keyboard
and artwork without changing shared geometry.
**Use actual `scripts/verify.mjs` assertion**, not inferred viewport sizes:
current Partners assertion hero **1440×903**, our **1440×1071**, why **1440×903**,
why grid x77/y514.5/1286×185, three pills/20 cards/overflow0. These runtime sizes
are distinct from Figma reference frames. Existing spacing exceptions remain;
do not repair them as part of backend migration or relax assertions.
Any needed UI change requires separate authorization and per-section pixel SOP:
fresh PNG1×/2×, measured bbox/MAE, ±1px ink, seven gates before next section.

## 4. SQL proposal — implement only after A

Proposed new migration `20261013010000_cms_partners_pass6.sql`; verify filename
collision first. Additive BEGIN/COMMIT, only Partners objects, existing project
**web-community / yejrdckcmlxrkklgtrwy**. No new project/schema-wide grants.

Single `private.cms_partners` singleton row: `id smallint PRIMARY KEY CHECK(id=1)`,
`partner_categories jsonb NOT NULL`, `partner_logo text NOT NULL`,
`why_partners jsonb NOT NULL`, created_at/updated_at timestamptz defaults.
Metadata excluded from RPC. Exact typed validators private/immutable: guard
JSON type before array length/object keys; exact key sets, length3/4, text
codepoint1–20000 and path rule. `CHECK(validator(...) IS TRUE)` rejects NULL.
Do not use permissive casts/jsonpath that accept malformed string/number/null.

Seed exact reconciled snapshot; `ON CONFLICT(id) DO NOTHING` preserves existing
edits. Singleton constraint permits zero rows; loader missing row returns
`{partners:null}` and final Zod rejects it, no default synthesized. RPC selects
one singleton and preserves array order. Rerun test preserves edit/no duplicate;
no state table, revision, trigger or write RPC needed.

`private.cms_load_partners()` plus `public.cms_load_partners()` STABLE
SECURITY DEFINER, fixed `search_path=pg_catalog`, qualified private refs.
Return exactly `{partners:{partnerCategories,partnerLogo,whyPartners}}`.
RLS enabled with defense-in-depth ALL deny policy USING false/WITH CHECK false.
REVOKE table access PUBLIC/anon/authenticated and default PUBLIC EXECUTE on
all new functions. Public wrapper EXECUTE only anon + service_role;
authenticated/private/helper access denied. Verify owner postgres and exact
catalog ACL/security/search_path. Do not change global default privileges or
other collection/schema grants. Do not expose private table via REST.

Inspect destination object existence/schema/owner/ACL/data before apply.
If existing objects differ, stop blind CREATE/reseed and reconcile; approval
for Partners additive apply does not authorize overwrite/drop/Team writes.

## 5. Runtime scope and files

CREATE proposed migration and `tests/cms-partners-supabase.test.mjs`;
optional focused `scripts/verify-cms-partners.mjs`. MODIFY
`scripts/cms-client.mjs`, relevant sync success mocks and active docs only.
Add `cms_load_partners` **after Hods**, assign whole `snapshot.partners`, preserve
full GAS validation before RPC overrides and final schema/atomic media handling.
Use sanitized scoped error; HTTP/timeout/JSON/schema failures fail closed,
never reuse GAS/stale Partners. Local snapshot mode remains without remote fetch.

Sync mocks reaching success in CMS/media/Roles/Domains/Hods tests must include
Partners RPC. Failure fixtures must verify old snapshot bytes retained and temp
cleanup. Do not change `src/data/cms-schema.mjs`, snapshot, partners.ts, UI,
assets, geometry tests, server/API/admin/auth/media, dependencies or other SQL.
If unforeseen change is required, explain concrete blocker rather than widening scope.

## 6. Master Work Plan — A–E

### A — Read, reconcile, capture baseline

- [x] A1 Read all mandatory docs; git status/log/refs/remotes; verify Node22.
      Respect foreign changes; never reset/stash them blindly. Paths in /tmp and
      ignored artifacts may disappear; verify tools rather than assuming reuse.
- [x] A2 Record snapshot SHA/bytes + fresh 19 public HTML baseline and current
      local asset paths/decode. Capture remote inputs privately for before/after.
- [x] A3 Full validated GAS export vs snapshot: all 11 texts/path/array order;
      inspect destination Partners objects/data/ACL read-only. Report mismatch,
      do not choose stale seed or overwrite Team drift to satisfy comparisons.
- [x] A4 Verify private env presence/project ref; capture scoped pre-pass hybrid.
      Record existing Team drift separately. Freeze plan/review scope before code.

### B — Local SQL/runtime and focused proof

- [x] B1 Implement additive singleton/validators/seed/RLS/revokes/wrappers.
- [x] B2 Ephemeral PostgreSQL: valid payload exact; missing row fails schema;
      wrong/duplicate ID, wrong counts/types/null/keys/text/path rejected.
      Reorder preserved; rerun keeps edited valid fixture. Unicode boundary probes
      compare actual Zod with SQL, including ASCII/astral/mixed/combining/newlines.
- [x] B3 Actual role executions: anon/service_role public read allowed;
      authenticated public read denied; PUBLIC/helper/private read denied;
      anon/authenticated direct SELECT/INSERT/UPDATE/DELETE denied. Catalog proof
      includes implicit PUBLIC execute. RLS isolation grants only temporary local
      rollback fixture, never broaden live grants. Document exact denial count.
- [x] B4 Wire RPC and mocks; HTTP/network/timeout/invalid JSON/shape/path errors
      fail closed atomically; no GAS fallback. Invalid full GAS blocks overrides;
      local mode no fetch; missing Supabase env fails remote mode.
- [x] B5 Full CMS suite **without server env** (Team live mutation tests must
      SKIP), recruitment contracts and focused Partners tests pass before apply.

### C — Existing Supabase apply and real read proof

- [x] C1 Immediately recheck GAS/snapshot/destination, project ref and private
      anon key. Only apply reviewed new SQL after A/B green; no stale inputs.
- [x] C2 Apply additive transaction once; inspect applied state if probe fails
      before retry. Real HTTP anon exact, catalog + actual denied role operations
      via read-only transactions. No production INSERT/UPDATE/DELETE probes.
- [x] C3 Run hybrid against same captured inputs pre/post: Partners exact and
      every other collection value identical. Keep Team drift; snapshot baseline
      remains untouched. No fallback. Store sanitized proof in ignored artifacts.

### D — QA and concrete reviewable commit

- [x] D1 Build0 errors, verify.mjs, audit:navbar, verify:vt,
      responsive-audit (468 baseline assertions), audit:spacing, format:check,
      SEO audit (23 pages baseline). Record actual counts; don't invent passes.
- [x] D2 Local Partners browser: 320/390/700/701/1050/1051/1365/1366/1440 widths,
      labels/counts/order/alt/all four why copy + mapped icons, lazy image decode
      after scroll, exact geometry/reduced motion, no overflow/pageerrors.
- [x] D3 Native Projects, legacy Projects, Team mock admin four widths; public
      Home/Recruitment/Hods/Roles regressions. Snapshot bytes +19 HTML exact fresh
      baseline with same inputs; isolate preexisting remote drift separately.
- [x] D4 Update active docs/status/proof/limitations, scoped diff/secrets review;
      feature commit local and complete review summary. **Pause before push**.

### E — Only after new explicit push approval

- [x] E1 Verify four Supabase + two GAS env Production both Vercel projects.
      Presence/scope proof only, never values. Preserve recruitment closed.
- [x] E2 Confirm concrete SHA with Faiz; `git push origin main` once reaches
      two existing push URLs. Fetch refs verify main/origin/main/production/main.
- [x] E3 Verify exact SHA latest deployments READY, primary alias assignment,
      actual provider READY UTC/WIB times on both sites; not GitHub status alone.
- [x] E4 Partners390/1440 both sites: three labels, 10/5/5 logos, alt/order,
      four why text pairs/index icons, artwork decode, navbar/footer entry and
      VT/keyboard/mobile flow, no overflow/pageerror. Smoke Home/Recruitment +
      six Hods and Roles; projects/team/media anonymous401, accepting:false.
      No owner/write/recruitment submission or production mutation.
- [x] E5 Record tracked live checkpoint + proof; lock Partners only after DoD.
      New checkpoint commit local unless separately included in push approval.

## 7. Security, secrets and operational rules

Never cat/print .env.local, git credentials, tokens, payload headers, token URLs
or raw private error bodies. Check env names/presence; use existing credentials
in-memory. Four Supabase env: URL, ANON_KEY, SERVICE_ROLE_KEY, ACCESS_TOKEN;
GAS CMS_API_URL/CMS_API_TOKEN still required. If anon absent locally, retrieve
privately via existing Management API, never replace with service key/write env
as workaround. VERCEL_TOKEN local previously works, CLI default scope differs.
If access unavailable report blocker; don't request secrets through chat.

Run full test:cms without server env to prevent Team live mutations; importing
.env for a narrow read probe must not leak into test runner. Public read-only
browser acceptance only. No admin CRUD, hooks/rebuild, recruitment opening,
bucket/policy changes or secret rotation. Local commits authorized; **each new
push needs concrete approval**, including planning docs. Origin deploys both sites.
SQL filename timestamps are ordering names, not execution dates. Preserve provider
clock evidence separately from workspace artifact checkedAt.

## 8. Artifacts, stop conditions and Definition of Done

Use ignored `artifacts/cms-pass6/`: reconciliation, baseline/hash, local-db,
security, live-db/live-hybrid, qa-summary/logs, browser/screenshots,
vercel-env-presence, deployments/aliases/live-smoke. Captured remote inputs stay
private/ignored; never commit credentials or raw private endpoint responses.
Tracked docs must contain sufficient sanitized summaries if artifacts disappear.

Stop dependent step for unresolved source/destination mismatch, missing credentials,
failed local DB/security/parity gate, source-changing output, unintended mutation,
foreign edits conflict, scope-expanding UI/auth/media need or missing push approval.
Continue independent safe work; never mask errors/fallback or fake a completed phase.
Before push, code rollback can restore reviewed Partners-only change locally;
after apply table can remain additive unused. No DROP/reseed/rollback applied SQL
or deploy rollback without an explicit reviewed action/authorization.

DoD: A–D actual green with SQL applied/read proof and reviewable local commit;
E green only after approval, two exact SHA READY deployments and both-sites
Partners acceptance. All six CMS content sources then Supabase **but full GAS
export remains a dependency**. Editors only Projects/Team; auth CMS and GAS
removal are separate future passes. Never declare entire CMS complete here.

## 9. Proof actual A–D — 7 Oct 2026

- **A:** working tree awal bersih, HEAD16828c2; origin/main dan production/main
  tetap526b428 setelah fetch ulang. Dua existing origin push URLs verified,
  tidak berubah. Node default26 dihindari; seluruh QA22.23.0. Snapshot SHA256
  `4345f1abe445aa2a400c31413ccc058707a77105a7e388dc8d1074e78da94857`;
  fresh build baseline23 pages dan19 public HTML hashed. Full validated GAS
  Partners exact semua11 texts/path/order. Destination table/wrappers/helpers
  absent; project/ref existing verified. Local anon key absent, diambil privat
  in-memory dari Management API; tidak ditulis env/dicetak. Frozen pre-pass
  hybrid berbeda hanya Team terhadap repo; drift dipertahankan.
- **B:** additive private singleton + dua validators immutable (items dan logo),
  seed ON CONFLICT DO NOTHING, private/public stable definer read wrappers,
  RLS ALL deny, explicit table/function revokes termasuk service_role privat.
  Public wrapper hanya anon/service_role. PostgreSQL ephemeral proof seed exact,
  id/duplicate/not-null, 199 invalid +72 valid Zod/SQL parity fixtures meliputi
  seluruh11 text slots, ASCII/20000 astral/mixed/combining/newlines/quotes,
  path/control/traversal/type/key/count. Batas20001 codepoints ditolak; NUL/lone
  surrogates diterima JS Zod tetapi ditolak konversi PostgreSQL, documented
  representational limit. Local RLS granted fixtures rollback, reorder/rerun
  preserve edit/singleton, missing row `{partners:null}` gagal final Zod.
  Catalog PUBLIC implicit execute revoked, helper invoker immutable dan read
  definer stable/search_path qualified. 22 actual local privilege denials
  (anon/authenticated/service_role), allowed public anon/service_role reads.
  Runtime RPC setelah Hods; whole Partners override proven terhadap stale GAS
  category/why/logo. Failure HTTP/network/timeout/JSON/missing row/shape/keys/
  path/count/type mempertahankan snapshot bytes dan tanpa temp residue. Invalid
  full GAS memblokir semua RPC; local mode no fetch, missing env fail closed.
  CMS full92 PASS/10 Team live SKIP/0 fail tanpa server env; recruitment24 PASS,
  focused Partners18 PASS. Initial fixture-count assertion corrected before
  final green; additional focused test verifies exact RPC sequence.
- **C:** immediate GAS/project/ref/destination recheck PASS. SQL transaction
  applied **sekali**; filename13Oct adalah urutan, actual apply7Oct. Initial
  anon probe404; independent read-only inspect table/RPC/count1 + HTTP200 exact,
  lalu proof-only tanpa reapply. Cause404 awal belum diisolasi. Actual RPC exact
  `{partners:{partnerCategories,partnerLogo,whyPartners}}`, catalog owner
  postgres/RLS/deny/search_path/ACL PASS. 13 actual live denied **read** operations
  (4 private/table/helper reads ×3 roles + authenticated public read); both
  anon/service_role public reads exact. Direct SELECT/INSERT/UPDATE/DELETE etc
  privileges denied via catalog; **tidak ada live mutation probes**. Same frozen
  inputs pre/post deep-equal semua collections; Partners exact, Team drift utuh,
  repository snapshot tidak ditimpa.
- **D:** build0 errors, visual exit0/browserErrors[], navbar/VT exit0,
  responsive468/468, spacing39 components, format PASS, SEO23 pages. Local
  Partners320/390/700/701/1050/1051/1365/1366/1440 PASS:3 labels/10-5-5 counts,
  20 exact alt/shared logo paths +decode,4 exact why pairs/mapped local icons,
  decorative aria-hidden, hero/cards/glow/footer artwork decode after scroll,
  no overflow/text clipping/pageerror. Runtime1440 hero903/our1071/why903,
  grid1286×185 exact; existing full verify assertions intact. Keyboard footer
  Home navigation +navbar Partners entry preserves Astro JS context at all9
  widths. Native Projects/legacy Projects/Team mock4 widths each PASS; public
  Home/Recruitment/six Hods/six Roles covered by verify/VT/responsive gates.
  Snapshot bytes and19 public HTML hashes exact fresh baseline. Docs and scoped
  feature commit lokal siap review; tidak ada perubahan UI/schema/assets/auth/
  server/API/media/dependency/other applied SQL. Helpers/codepoints tidak
  memperbaiki applied Hods UTF16 ceiling.

Proof ignored: `artifacts/cms-pass6/{reconciliation,baseline-html,after-html,
local-db,live-db,live-hybrid,qa-summary,browser}.json`, Node22 test/gate/admin logs,
2 Partners390/1440 full-page screenshots. Snapshot/remote inputs private/ignored.
`local-db.json` adalah ringkasan focused PostgreSQL; raw fixtures di tracked test.

**E selesai** dengan push925d577 berizin dan acceptance berikut. Checkpoint docs
lokal, tidak ikut push fitur yang sudah selesai.

## 10. Live acceptance E — 7 Oct 2026

Faiz memberi instruksi **push** untuk concrete feature925d577 (termasuk planning
16828c2). Fresh4Supabase+2GAS env Production pada web-testing dan
data-sorcerers-community semuanya present; nilai tidak dicetak/ditulis. Push
origin main sekali berhasil ke dua existing URLs; fetch refs main/origin/main/
production/main sinkron925d577 sesudah push fitur. Deployment API direct exact
SHA `925d5774e28b2b9e78e75649d88e1b28949ce8cf`, targetproduction, READY;
primary alias lookup actual deployment ID cocok latest exact-SHA deployment.

- web-testing: **13:57:59.202 UTC / 20:57:59.202 WIB**, 07 Oct 2026.
- data-sorcerers-community: **13:59:13.031 UTC / 20:59:13.031 WIB**, 07 Oct 2026.

- Testing primary: `https://web-testing-azure.vercel.app`.
- Production primary: `https://data-sorcerers-community-sigma.vercel.app`.

Provider timestamps di atas actual READY API; artifact checkedAt memakai jam
workspace, tidak dibandingkan untuk ordering lintas clock.

Partners390/1440 kedua situs PASS (4 surfaces): three labels exact/order,
10/5/5 count =20 shared logo paths/alt exact, all4 why title/description pairs,
icons by index dan decorative aria-hidden. Lazy hero/cards/glow/icons/footer
images decode after scroll. Runtime1440×903 hero/why dan1440×1071 Our Partners,
why grid1286×185 exact. No overflow/clipped text/pageerror. Keyboard footer
Home navigation +navbar desktop/mobile Partners entry serta keyboard footer
Partners entry mempertahankan Astro JS context/VT. Four full-page screenshots.

Public smoke Home/Recruitment +all6 Hods/all6 Roles pada390/1440 kedua situs
PASS: HTTP200, headings/back links exact, detail artwork decoded, overflow0,
pageErrors[]. API projects/team/media anonymous401 dan recruitment GET exact
`{ok:true,accepting:false}` pada kedua widths/sites. Read-only acceptance saja;
tidak ada owner write/recruitment submission/SQL apply ulang/hook tambahan.

Artifacts ignored: `vercel-env.json`, `deployments-925d577.json`,
`aliases-925d577.json`, `live-browser-testing.json`, `live-browser-production.json`,
`live-smoke.json`, `live-{testing,production}-partners-{390,1440}.png`.

**DoD Partners A–E tercapai.** Keenam CMS content sources Supabase, tetapi full
GAS validation/env/tab masih dependency. Editors tetap Projects/Team; auth CMS
final belum diputuskan, GAS removal perlu audit/backup/observasi/izin terpisah.
Checkpoint live docs commit lokal, tidak push lagi memakai izin feature consumed.
