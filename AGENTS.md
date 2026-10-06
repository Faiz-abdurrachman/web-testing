# AGENTS.md — instructions for AI agents

## Checkpoint terbaru — native /admin, 6 Oct 2026

User memilih **admin penuh di website**; pass aktif Projects/auth:
[plan](docs/cms-native-admin-plan.md), [setup/acceptance](docs/cms-native-admin-setup.md).
Kode native /admin + Vercel OAuth/API sudah push pada 824e333 dengan izin user;
dokumentasi deploy 47987c6. Standard Cloud/OAuth/API executable existing dan lima
env server kedua Vercel sudah dikonfigurasi owner. Login native owner dan pemuatan
Projects terbukti melalui screenshot editor dan mutation nyata.

Owner menambah “Uji CMS”: kedua situs publik menampilkan project itu setelah
rebuild. Owner lalu menghapusnya: kedua deployment SUCCESS, project uji hilang
dan empat judul Projects baseline tetap tampil di kedua situs. Login route kedua
domain HTTP 303 ke Google terverifikasi; login owner terpisah di kedua domain
belum dibuktikan. Owner melaporkan akun Google non-owner di Incognito ditolak. Tahap penolakan
Google/backend tidak dirinci; tidak mengklaim allowlist GAS nyata telah terisolasi.

QA kode sebelumnya: 24 CMS tests, native + legacy admin browser empat widths,
7 gate + SEO PASS; responsive 468/468, 19 HTML publik identik baseline sebelum
mutation live. Pass konfigurasi auth tidak mengubah kode/UI/geometri publik.
Bukti read-only publik penghapusan: artifacts/cms-native/owner-delete-live.json.

Projects media upload/cache sekarang tersedia lokal: raster <=2 MB,
normalisasi WebP server (sharp existing), folder Drive privat, hash content,
preview owner-only dan cache/build lokal sebelum snapshot atomik. Tidak hotlink
Drive; preset dan template publik tetap. QA media: 29 CMS tests Node 22, browser
native/legacy empat widths, media renderer Home/HoF empat widths, tujuh gate + SEO
PASS; responsive 468/468 dan 19 HTML publik baseline identik. Media cd37446
sudah push dengan izin user; kedua Vercel SUCCESS. Testing awal gagal dengan
Invalid CMS export redirect; read-only export sesudahnya identik baseline dan
retrigger testing lewat hook existing SUCCESS. Root cause Google belum terbukti.
Kontrol upload/noindex kedua domain HTTP200, API media anonymous401, login303
ke Google. GAS media belum diperbarui; upload nyata belum diuji.

NEXT: update Code.gs dan versi deployment Export
serta Admin EXISTING sesuai docs/cms-projects-media-setup.md; owner upload/save,
kedua rebuild dan gambar publik harus diuji sebelum klaim media live.
Owner/non-owner + CRUD/rebuild telah diuji, dengan batas bukti di setup guide.
Team → B3/B4 tetap menunggu. Tidak reseed atau ulang
Sheet/folder/onboarding. Public Astro tetap static; browser shell/login, records
melalui API owner, cookie HttpOnly terenkripsi + state/PKCE + CSRF. Backend tetap
Sheets/Drive/Properties/hook existing. Satu collection/pass. Seluruh CMS belum
selesai. User mengizinkan kerja/commit; konfirmasi sebelum push baru.

## Arsip checkpoint Growth sebelum native /admin

**B2 Projects Growth: kode situs sudah push; kedua Vercel SUCCESS pada 1fb25ae.**
Minimum satu / maksimum delapan Projects; add/delete, UUID server, revision guard
serta batch write/trailing blanks tersedia. User menyetujui push pada sesi ini;
1fb25ae terkirim ke kedua repo. GAS Admin live belum diperbarui.
17 CMS tests, 40 renderer fixtures, admin browser dan 7 gate + SEO PASS
(responsive 468/468). NEXT: update admin deployment existing dan uji
owner add/delete + kedua rebuild. Setelah Growth live terverifikasi: media/cache,
lalu Team. Lihat [docs/cms-projects-growth-plan.md](docs/cms-projects-growth-plan.md)
dan [docs/cms-sop.md](docs/cms-sop.md).

| Bagian                   | Status nyata                                                                                                                        |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| B0                       | Selesai: enam snapshot loader + Zod; 19 HTML identik baseline; 7 gate + SEO setiap collection.                                      |
| B1                       | GAS export terpasang, Sheet + folder Drive tersedia, env kedua Vercel terkonfigurasi.                                               |
| B2 Projects foundation   | Admin privat terpasang; empat project dimuat; edit existing + revision guard + dua hook + retry publication tersedia.               |
| Uji owner                | Save tanpa perubahan isi berhasil; kedua rebuild diminta; export tetap identik baseline.                                            |
| Perbaikan fetch          | Kode terakhir deploy `96a9756`; status Vercel testing dan production SUCCESS. 14 CMS tests + 7 gate + SEO PASS; responsive 468/468. |
| Growth/upload/Team/B3/B4 | Growth situs deploy SUCCESS; GAS Admin belum diperbarui. Upload/Team/B3/B4 belum selesai. Jangan menyebut seluruh CMS selesai.      |

404 sebelumnya terjadi sesudah redirect ke `script.googleusercontent.com`.
Penyebab Google/cache belum terbukti. Fetch memakai IPv4-first, nonce/no-cache,
timeout 60 detik per attempt dan maksimal dua attempt bersama untuk timeout
atau redirected 404; tidak fallback stale saat remote gagal.

Bukti production remote-mode lengkap tersedia pada log `fb99c39`. Literal log
remote-mode testing terbaru belum disalin owner; **ini kekurangan bukti rinci,
bukan setup testing belum selesai**. Anonymous admin diarahkan ke login Google.
Uji akun Google lain yang sudah login dan uji perubahan isi nyata masih perlu.
Save berhasil berarti data tersimpan dan build diminta, bukan situs sudah live.

Satu owner/admin aktif; identitas/URL admin, token, hook, Sheet/folder ID tetap
di Script Properties dan env privat. Jangan buat ulang Sheet/folder/deployment
awal atau mengulang pertanyaan onboarding. Admin menggunakan project GAS
terpisah, execute as Me + Only myself; API export publik read-only bertoken.
Menambah admin kedua memerlukan pass auth tersendiri.

User mengizinkan pengerjaan dan commit; konfirmasi sebelum push. Periksa konteks izin
sebelum push; `origin` memiliki dua push URL, sehingga sekali push men-deploy
kedua situs. Bila working tree berisi perubahan asing, tanyakan sebelum mengubahnya.
Growth memakai template konsisten, satu collection/pass; jangan membuka field
geometri atau melonggarkan assertion geometri baseline. Setelah Growth hijau:
Projects media upload/cache → Team → B3 per collection → B4 hardening.

**Urutan baca:** `docs/kickoff-prompt.md` → `AGENTS.md` →
`docs/pixel-precision-sop.md` → `docs/ai-handoff.md` → `docs/cms-plan.md` →
`docs/cms-sop.md` → `docs/cms-b2-plan.md` → `docs/cms-projects-growth-plan.md`.

**Prioritas dokumen:** checkpoint aktif ini dan plan Growth mengalahkan NEXT,
PENDING atau instruksi setup di catatan historis di bawah. Riwayat disimpan
sebagai bukti keputusan, bukan work order aktif. Full-screen sudah selesai;
Contact tetap hero Figma-exact tinggi 954, bukan video/full-screen.

CMS B0 collections hijau: projects, team, roles, partners, domains, hods.
Project: **Data Sorcerers** — a static Astro landing site, a Recruitment page
(+ 6 role-detail pages) and 6 domain-detail pages. Goal: **pixel-accurate to
Figma/PNG** with lightweight HTML/CSS.

Human-facing docs: `HANDOVER.md` (full context) and `docs/assets.md`
(per-section provenance + Figma nodes). For the current live state read
`docs/ai-handoff.md` first. **Before touching any UI, read
`docs/pixel-precision-sop.md` — the strict "how to hit pixel accuracy" protocol.**
Read those for "why"; this file is the operating manual. A copy-paste starter for
new agents lives in `docs/kickoff-prompt.md`; for building a new page/section use
`docs/page-build-prompt.md`.

## CMS commands dan file operasional

- `npm run test:cms` — fetch/export/admin contract tests (baseline terakhir 14).
- `npm run verify:cms-admin` — browser admin mock RPC; bukan Google auth nyata.
- `npm run cms:gas` — generate source export ke ignored `artifacts/cms-gas/`.
- `npm run cms:admin` — generate source admin ke ignored `artifacts/cms-admin/`.
- `docs/cms-sop.md` — auth, secrets, fetch, QA, update GAS existing.
- `docs/cms-projects-growth-plan.md` — Master Work Plan NEXT add/delete Projects.
- `docs/cms-kickoff.md` — prompt lengkap sesi baru; jangan ulang B0/onboarding.

## Commands

```sh
npm ci                    # install (Node 22.x)
npm run dev               # dev server → http://localhost:4321
npm run build             # astro check && astro build (must stay 0 errors)
npm run format            # prettier --write .
npm run format:check      # must pass before commit
node scripts/verify.mjs   # visual verification (dev server must be running)
node scripts/responsive-audit.mjs  # responsive audit: all pages × 26 widths
npm run assets:og         # regenerate og image + favicons + manifest
npm run assets:optimize   # re-encode heavy webp (lossy q82/85/88) from assets/image-src
npm run assets:starfield  # regenerate What We Do starfield tiles (Chromium)
npm run assets:footer     # footer bg: sharp desktop + portrait phone variant
npm run assets:partners   # Partners page artwork (hero/cards/icons, sharp)
npm run assets:hof        # Hall of Frames artwork (hero/cards/projects/rail, sharp)
npm run assets:contact    # Contact page artwork (swirl + info-card icons, sharp)
npm run seo:audit         # validate meta/OG/canonical/sitemap in dist (after build)
npm run perf:audit        # scroll-jank report per section (set PERF_MAX_TASK to fail)
npm run audit:navbar      # navbar states/containment/hug across widths
npm run audit:spacing     # strict 8pt: every padding/gap/margin = 8-multiple or documented exception
npm run verify:vt         # View Transitions + sound-cue smoke (client-side nav)
```

`scripts/verify.mjs` uses Chromium at `/usr/bin/chromium` (override with
`CHROMIUM_PATH`) and `PREVIEW_URL` (default `http://localhost:4321`). It exits
non-zero on any failed assertion.

`scripts/responsive-audit.mjs` is a lightweight, per-route Playwright pass over
all 18 routes × 26 widths (320 → 3840). It checks horizontal overflow, clipped
text, carousel-arrow/card overlap and the navbar breakpoint, and writes
`artifacts/responsive-audit.json`. Use it when the full `verify.mjs` is too slow
or the dev server makes `waitUntil: networkidle` hang (see Verification workflow).

## Git & deploy

- `origin` = **testing**: `https://github.com/Faiz-abdurrachman/web-testing.git`.
- `production` remote = `https://github.com/Web-Data-Sorcerers/community-web.git`.
- **`origin` has TWO push URLs** — a plain `git push origin main` deploys to
  **both** testing and production. Do not add another remote or push URL; just
  push `origin main` as usual.
- Verify both are in sync: `git fetch production -q && git for-each-ref --format='%(refname:short) %(objectname:short)' refs/heads/main refs/remotes/origin/main refs/remotes/production/main` (all three should match).
- Git creds live in the `store` helper (`~/.git-credentials`) — no token needed in
  commands. Never print the token.
- Production was behind testing before this was set up; keep it in sync on every
  feature push.

## Non-negotiable rules

Full protocol: **`docs/pixel-precision-sop.md`**. The rules below are the law.

0. **Mandatory Per-Section Planning Protocol.** Before touching or modifying any
   code for a section, the agent MUST write out a detailed per-section execution
   plan (Master Work Plan) covering: exact Figma node ID and URL, frame dimensions
   (width × height), strict 8-point grid breakdown (padding, gap, margins),
   typography (Bluu Next Bold 700 / Manrope), artwork assets, and testing criteria.
   **NEVER skip sections or combine multiple sections into one pass.** Execute,
   measure, and verify one section at a time.
   Before a page, the agent MUST first **inventory every child section of the Figma
   page frame** (`depth 1`) as a checklist (number, node ID, frame name, w×h,
   status) — including sections that have no component yet. The checklist is the
   work order: finish and lock section N (7 gates) before starting N+1. See
   `docs/pixel-precision-sop.md` §3 Langkah 0b.
1. **The reference PNG node (exported from Figma) is the source of truth.**
   Figma CSS exports, MCP gradient strings and `effects` payloads are only hints
   and are frequently lossy. When they disagree, match the exported PNG.
2. **Start from the exported node, not the CSS.** For every section: get the
   Figma node (MCP) → export the node PNG (1× + 2×) and the individual text /
   component nodes via `figma_download_figma_images` → measure with `sharp`.
3. **Strict 8-Point Grid Spacing & Padding.** All layout padding, margins, and gaps
   MUST strictly follow multiples of 8px (8px, 16px, 24px, 32px, 40px, 48px, 56px,
   64px, 72px, 80px) matching Figma frame specifications. Never introduce arbitrary
   magic numbers.
4. **Bundle the exact font Figma uses** (check licence; OFL → vendor the woff2
   into `public/fonts/` + `@font-face`). Declare the real weight to avoid faux
   bold. Never swap a page's font globally mid-migration — unrevised pages keep
   the old token. Nasalization is **not** bundleable (desktop licence).
5. **Use image-fill artwork verbatim.** If a node has an `imageRef`, download the
   raw image and bake it as-is (`fit: cover` mirroring the Figma FILL crop) — do
   not reconstruct it from layers. Reconstruction was ~24 MAE vs the hero node;
   the raw fill is ~2.7.
6. **All UI is real HTML/CSS.** Images are only artwork/photos. Never flatten a
   screenshot (text, buttons, borders, cards, gradient text) into the UI.
   Text gradients are applied **per line** (`background-clip: text`).
7. **Measure, don't guess.** Extract values from the reference PNG with `sharp`
   (bbox, per-region MAE) and hardcode the measured numbers. "Ink" positions must
   match the reference to **±1px**. Do not eyeball. If a region's diff is high,
   isolate whether it is font, gradient or artwork before "fixing" the CSS.
8. **Keep geometry exact.** Existing values are asserted in `verify.mjs`
   (`assert.deepEqual`). If a design change is intentional, update the assertion
   and the reference PNG path in the same commit.
9. **Always provide a `prefers-reduced-motion` fallback** for any animation; the
   reduced-motion render must remain pixel-exact (all audits run in `reduce`).
10. **Never break the bundle budget.** Runtime deps are `astro` + `gsap` (approved)
    and `three`. Do not add other UI libraries without asking; lazy-import heavy
    code (the hero Three.js layer is a dynamic `import()`).
11. **Commit per feature**, push to `main`. `origin` has **two push URLs**
    (testing + production) — see "Git & deploy". Follow existing message style
    (`feat:`, `fix:`, `docs:`, `chore:`). Confirm with the user before pushing.
12. **Update the docs with the code**: `docs/assets.md` (provenance + node ids),
    `docs/ai-handoff.md` (state), `docs/page-fullscreen-migration-plan.md`
    (progress), and `AGENTS.md` (this file) whenever a section or rule changes.
13. **Full-screen standard (since 4 Oct 2026).** Every content section is one
    screen: `min-height: 100vh; min-height: 100svh` + centred content; every hero
    is a background image from `assets/hero gambar/` + `100svh` (real HTML copy on
    top). CTA & footer keep their Figma height. **Never use `zoom`/`transform:
scale`** for this (user rejected — renders broken). `verify.mjs` section
    reference PNGs are **padded** (not stretched) with `sharp.extend()` by
    `(sectionH − FIGMA_H)/2` top/bottom. Full recipe + per-page/per-section
    checklist: **`docs/page-fullscreen-migration-plan.md`**. Work one section at a
    time, 7 gates each.

## SEO & sharing

- `astro.config.mjs` sets `site` from `SITE_URL` (default
  `https://data-sorcerers-community-sigma.vercel.app`). It drives canonical, `og:url` and the
  sitemap — change it there (or set `SITE_URL`) when the domain changes.
- Every page goes through `BaseLayout`, which emits title, description,
  canonical, Open Graph, Twitter (`summary_large_image`), icons, manifest and
  Organization/WebSite JSON-LD. Pass `title` / `description` / `type`
  (`article` for detail pages) / `image` / `noindex` per page.
- The share card is `public/og/og-default.jpg` (1200×630), generated by
  `npm run assets:og` from `assets/assets home page/hero section/Gambar Hero
Section.png` + logo + the `SORCERY IN DATA MAGIC IN AI.png` headline. Re-run
  it after changing those source assets. The same script writes the favicons and
  manifest; favicons are **transparent** (no background).
- `src/pages/robots.txt.ts` serves robots + the sitemap URL; `@astrojs/sitemap`
  writes `sitemap-index.xml`. After `npm run build`, run `npm run seo:audit`
  (must pass) to validate all of the above.

## File map

```
src/components/*.astro   one section per file; scoped CSS inside
src/components/TeamCard.astro  Our Team member card (302×400; used by OurTeam)
src/components/Sound.astro  floating mute orb + delegated data-sfx wiring
src/data/domains.ts      6 HoDS cards (title/desc/tint/chips)
src/data/hods.ts         6 detail categories → 22 tabs (LEARNING/…/OUTPUT)
src/data/projects.ts     4 placeholder projects (swap for real data)
src/data/partners.ts     Partners categories + why-cards (logos placeholder)
src/data/team.ts         Our Team leader + 6 HoDS carousel groups (placeholder)
src/pages/index.astro    homepage composition
src/pages/about.astro    About Us composition (sections 1–5 + shared footer)
src/pages/partners.astro Partners composition (hero + grids + why)
src/pages/hall-of-frames.astro  HoF composition (hero/featured/projects/milestone)
src/pages/contact.astro  Contact composition (hero + form + info cards)
src/pages/hods/[id].astro detail route (getStaticPaths over hods.ts)
src/pages/lab/sound.astro internal sound audition page (noindex, not in sitemap)
src/styles/global.css    @font-face, tokens, reset
src/scripts/sound.ts     procedural Web Audio SFX engine (no assets, no deps)
scripts/verify.mjs       visual + geometry + responsive verification
scripts/responsive-audit.mjs  per-page × per-width responsive audit
scripts/generate-og.mjs  og share card + favicons + manifest (sharp)
scripts/generate-star-tiles.mjs  What We Do starfield tiles (Chromium)
scripts/starfield-patterns.mjs   gradient source for the starfield tiles
scripts/generate-hero-video.mjs  home hero bg clip (boomerang webm/mp4 + poster)
scripts/generate-recruitment-hero-video.mjs  recruitment hero bg (crossfade loop)
scripts/generate-footer-background.mjs  footer bg: sharp desktop + portrait phone variant
scripts/generate-partners-assets.mjs  Partners page artwork (hero/cards/icons)
scripts/generate-hof-assets.mjs  Hall of Frames artwork (hero/featured/projects/rail)
scripts/generate-contact-assets.mjs  Contact artwork (swirl + info-card icons)
scripts/navbar-audit.mjs  navbar states/containment/hug across widths
scripts/spacing-audit.mjs  strict 8pt: every padding/gap/margin = 8-multiple or documented exception
scripts/perf-audit.mjs   scroll-jank + long-task report per section
scripts/seo-audit.mjs    validates title/meta/OG/canonical/sitemap in dist/
src/pages/robots.txt.ts  robots.txt endpoint (uses Astro.site)
public/og/og-default.jpg share card (served)
public/                  served assets (fonts, images)
assets/<page>/           raw PNGs read by verify/generate scripts (NOT served; unused ones archived outside repo)
docs/assets.md           provenance per section (keep updated)
docs/pixel-precision-sop.md  strict pixel-accuracy protocol (read before any UI)
docs/sound-sop.md        sound system SOP (procedural Web Audio SFX + ambient)
docs/page-fullscreen-migration-plan.md  ★ work order: hero gambar + section 100svh per-halaman/per-section
docs/fix-9-plan.md       ★ work order: 9-item + 3 kelupaan (#1–#8,#10–#12 SELESAI; sisa #9)
docs/our-team-hods-plan.md  Our Team HoDS carousel Master Work Plan (SELESAI 5 Oct 2026)
docs/hero-video-plan.md  (SUPERSEDED 4 Oct 2026) hero video digantikan hero gambar full-screen
docs/about-us-glow-plan.md  About Us glow responsif + karakter tepi (SELESAI 4 Oct 2026)
docs/figma-prototype-flow.md  peta prototype Figma (REST `interactions`) → tombol/link tujuan + gap vs kode (NEXT)
docs/hover-interactions-plan.md  ★ RENCANA: hover interaction untuk semua elemen interaktif
docs/hero-motion-plan.md  ★ RENCANA/BRAINSTORM: hero "hidup" (parallax/GSAP)
docs/hof-featured-modal-plan.md  ★ RENCANA: Featured Sorcerers card + detail modal (mobile & portrait bleed)
docs/ai-handoff.md       live "where we are now" handoff for the next AI agent
artifacts/               verify output (git-ignored)
```

## Verification workflow (critical)

`verify.mjs` conventions you must respect:

- It runs with `reducedMotion: 'reduce'` so CSS/JS transitions do not distort
  measurements. Any new animation must therefore be inert under reduced motion
  or geometry/diff checks will fail.
- `setNavbarHidden(true)` hides elements that are **not in the reference PNG**
  before section screenshots: `.navbar`, `.rail-arrow`, `.project-arrow`,
  `.project-dots`, `.project-card:not(.is-active)`. If you add new overlay UI,
  add it to that list. The sound orb `.sound-toggle` is also hidden by an
  `addInitScript` style so it never reaches any screenshot.
- The report writes `artifacts/verification.json` plus `*-diff.png` /
  `*-overlay.png`. There is **no MAE threshold assertion** — geometry, responsive
  overflow, clipping, interactions, and `browserErrors` are what fail.
- `verify.mjs` waits on `networkidle`; against the **dev** server (Vite HMR) that
  can hang indefinitely. If so, build and run it against the static preview:
  `npm run build && npx astro preview --port 4331` then
  `PREVIEW_URL=http://localhost:4331 node scripts/verify.mjs`. When even that is
  too slow, `scripts/responsive-audit.mjs` covers the responsive checks.

When adding/changing a section, update `docs/assets.md` and the relevant
`verify.mjs` geometry + containment checks.

## Gotchas already hit (do not repeat)

- `overflow:hidden` + `border-radius` + a 3D transform makes corners render
  **square**. Fix: clip on an inner, untransformed wrapper (`.project-inner`
  with `clip-path: inset(0 round 20px)`).
- Putting `clip-path`/`overflow` on an element that has a glow (`box-shadow`)
  **clips the glow** into a hard rectangle. Put the glow on a pseudo/child that
  is not clipped (see `.project-card::before` radial glow).
- `scroll-snap` on the HoDS rail shifts the first card by the gutter unless you
  also set `scroll-padding-inline` to the same value.
- Full-detail PNGs ship an **older card art**; the current art comes from the
  Figma `card detile role (HoDS)` component / `gambar detail card/Property 1=..`.
- `assets/` is hundreds of MB — it must stay listed in `.vercelignore`.
- Nav/CTA/social/legal links are intentionally `aria-disabled` (destinations not
  supplied). Do not invent URLs.
- The mobile menu is a full-screen `<details>` whose open/close is animated in
  JS: the `summary` click is `preventDefault`ed and the code toggles the `open`
  property, adding `is-closing` for the exit transition. Keep the reduced-motion
  branch (instant) or screenshots/verification get flaky.
- Carousel arrows: **desktop = sides, mobile = bottom**. `DomainRail` + Projects
  switch at `1050px`, Snippets at `760px`. `DomainRail`'s side arrows overlay the
  rail's edge cards (cards are full-bleed; the gutter cannot fit a 52px arrow) —
  intended. Projects' side arrows must not touch the _active_ card;
  `responsive-audit.mjs` asserts it.
- **Check the production build, not just dev.** Astro's minifier can drop
  properties: the default Lightning CSS pass removed the unprefixed
  `backdrop-filter`, so the navbar blur vanished in Firefox on Vercel while dev
  looked fine. `astro.config.mjs` now sets `vite.build.cssMinify: 'esbuild'` so
  both prefixed and unprefixed survive. After adding modern CSS, verify it in
  `dist/` (or the deployed site), not only in `npm run dev`.
- **Deep links / reload must land on their section.** The browser's initial
  fragment scroll ran while the splash still had `overflow: hidden` on `<html>`
  and before Motion installed the hero pin spacer, so the target moved afterwards
  and `/#domains` etc. landed wrong; `history.scrollRestoration = 'manual'` also
  stopped browser Back from restoring the section. `BaseLayout.astro` now
  re-applies the hash target after `ds:splash-done` / `load` / `fonts.ready`,
  `Splash.astro` hands scroll restoration back to `auto`, and `global.css` gives
  `section[id]` / `main[id]` a 110px `scroll-margin-top`. Keep this when touching
  the splash or motion init.
- **Mobile perf is load-bearing.** The hero Three.js particles are gated to
  `min-width: 768px` (they used to run on phones and janked scrolling). The
  navbar's `backdrop-filter` only paints on `.is-scrolled::after` (a 12px blur;
  there is no layout morph any more) — do not reintroduce a 28px
  `saturate`/`brightness` blur or 0.9s height/padding transitions. Detail pages get
  `env(safe-area-inset-top)`; keep `viewport-fit=cover` in `BaseLayout`. The
  mobile heroes use `min-height: 100svh` (not `dvh`) and `motion.ts` runs
  `ScrollTrigger.config({ ignoreMobileResize: true })` — both are needed or the
  hero→next-section "jump" returns as the address bar shows/hides.
- **Multi-line CSS comments break Prettier idempotency.** A `/* ... */` block
  whose continuation lines Prettier wants to re-indent never stabilises, so
  `format:check` keeps failing. Keep CSS comments on **one line**.
- **Navbar mirrors Figma exactly (`Navbar.astro`).** It reproduces node
  `755:15178` (component set `530:13894`) / `assets/Navbar.png` (5×): 1440 frame,
  `padding 24px 80px`, logo 54×58.8 at 80/24, a right group `menu → 90px → CTA`,
  inactive links `#707070`, active link `#fff` with a 1px gradient underline whose
  width equals the label (`align-self: stretch` inside a hug column), CTA `42.1px`
  tall with a `148deg` 2px gradient rim. Desktop `≥1301px` hardcodes the Figma tab
  widths (Home 78, About Us 106, Recruitment 134, Hall of Frames 146, Partners 101,
  Contact 98 → menu 753, gap 18) and the CTA `173px`, so the 1440 geometry is exact
  regardless of font rasterisation. There is **no** floating glass capsule,
  sliding indicator, flash or `is-condensed` morph — scrolling only fades in a
  translucent glass backing (`rgb(6 5 10 / 45%)` + `blur(12px)` on
  `.is-scrolled::after`). `scripts/navbar-audit.mjs` (`npm run audit:navbar`)
  asserts the exact 1440 geometry; update it if the design intentionally changes.
- **Detail `<main>` shorter than the viewport leaks the body colour** as a black
  strip under the gradient (phones with the browser chrome hidden). Fix with
  `min-height: 100vh/100lvh` **only at `≤900px`** — `verify.mjs` sets the viewport
  to `1440×1400` and asserts `.role-detail` height `1280`, so a base min-height
  fails the suite.
- **`sizes` on responsive `<img>` matters as much as `srcset`.** `Snippets.astro`
  shipped `sizes="1280px"`, so phones assumed a 1280 CSS-px slot and downloaded
  the 2560w `-2x` files (~1.9 MB). When adding images, give an honest `sizes`.
- **The site uses Astro `<ClientRouter />` (View Transitions).** Navigation is
  client-side, so **bundled component scripts do not re-run on a swap**. Every
  script that touches the DOM must re-init via
  `document.addEventListener('astro:page-load', init)` and tear down window/
  document/matchMedia listeners, observers and GSAP in `astro:before-swap` (see
  `destroyMotion()`, `mountHeroParticles()`'s `dispose()`, and the
  `AbortController` pattern in `Navbar`/`DomainRail`/`Projects`/`Snippets`).
  `<html>` runtime classes (`splash-done`, `nav-warm`) are wiped by the swap and
  re-applied in `astro:after-swap`; the hash is re-applied in `astro:page-load`.
  `verify.mjs` uses full `page.goto` so it does not exercise client nav — run
  `npm run verify:vt` (`scripts/verify-vt.mjs`) for that. Full migration notes:
  `docs/sound-sop.md` §9.
- **Figma MCP gradient strings are lossy.** `figma_get_figma_data` returns a
  normalised `linear-gradient(...)` string (last stop forced to 100%), which
  renders differently from the node. The About Us Philosophy/Ecosystem fills
  looked like `170deg`/`16deg` in the string but the exported node PNG matches
  `163deg 63%→126%` / `24.75deg 53%→133%` (background MAE < 1 vs MCP ≈ 17). Export
  the node (`figma_download_figma_images`) and fit the PNG pixels — never paste the
  MCP gradient string. The old `152.43deg`/`36.99deg` values were also wrong.
  Same for the HoF Featured card fade: the MCP string rendered far too dark/less
  blue, so the **node render** is used as an overlay (card MAE 6.8 → 2.0).
- **A Figma fill can stack an image + a colour.** E.g. the HoF Project cards have
  `fills: [rgba(0,0,0,0.2), IMAGE]`; without the 20% tint the screenshot reads
  far too bright (stage MAE 28 → 3).
- **A real `border` shrinks the content box.** When an artwork/screenshot must fill
  the whole frame, use a **ring overlay** (`::after` + `mask` / `mask-composite:
exclude`), not `border` (the HoF Project shot sat at 929 vs the 933 frame and
  ghosted).
- **Figma does not always clip a frame.** Check the render before adding
  `overflow:hidden` — the HoF Featured portraits intentionally bleed above the card.
- **Do not reuse class names from `verify.mjs`'s hide-list.** `setNavbarHidden`
  hides `.project-card:not(.is-active)`; a new component using `.project-card`
  disappears during verification (renamed to `.hof-project-card`).
- **`loading="lazy"` images deep in the page are not decoded at screenshot time.**
  In `verify.mjs` / diff scripts, `scrollIntoView` then `waitForFunction` every
  `<img>` in the section is `complete && naturalWidth>0` + `img.decode()` before
  the screenshot, or the section renders empty.
- **Figma `GLASS` effects are invisible to `figma_get_figma_data`.** A glass frame
  renders a 1px specular rim + backdrop blur but MCP reports no stroke/effect.
  Fetch the real payload via REST (`GET /v1/files/<key>/nodes?ids=…`, header
  `X-Figma-Token: $FIGMA_API_KEY`) — Contact pill/cards/form are
  `effects:[{type:"GLASS"}]`. Emulate the rim with an `::after` ring + `mask`/
  `mask-composite: exclude` (**never a real `border`** — it shrinks the content
  box) and fit the alpha per edge from the PNG (glass rim is brighter on top:
  top ≈116, bottom ≈96, sides ≈60 at 1×). `backdrop-filter: blur(8px)` is closest
  but only helps where artwork sits behind the panel.
- **Cross-renderer font rasterisation is irreducible residual MAE.** Small text
  (e.g. the 12px pill) differs ~1px/glyph edge between Figma and Chromium even when
  the ink bbox matches; do **not** "fix" it by shifting position or changing the
  gradient. `text-rendering: geometricPrecision` helps some regions but wrecks
  others — never set it globally.
- **A reference hero PNG may include the navbar.** `Contact-Hero-1x.png` (node
  `1445:5066`) contains the navbar; since `verify.mjs` hides `.navbar`, the
  whole-section MAE reads high. Judge precision **excluding the navbar band**
  (Contact: full 2.76 → ~1.28 below the navbar).
- **`container-type: inline-size` decides what a card's inner `cqw` means.**
  `.hof-project-card` is itself a container (base 933), so its inner `cqw` values
  resolve against the card, not the 1280 stage. Dropping it while refactoring the
  HoF carousel made every inner size blow up (stage MAE 34.8). Keep it when
  moving a card to transform-based positioning.
- **The HoF Project highlights is a 3D coverflow (`HallOfFramesProjects.astro`,
  node `1439:4655`).** Slots are classes + transforms (`is-left`/`is-center`/
  `is-right`) so a CSS `transition` animates them; side cards blur/rotate only
  under `prefers-reduced-motion: no-preference`, so the `reduce` render stays the
  static Figma composition (verified). Arrows are `.project-arrow` (in
  `setNavbarHidden`'s hide-list — they never affect the reference diff).

## Fonts

- Manrope is bundled as **WOFF2** (`public/fonts/*.woff2`, OFL) with the TTF kept
  as a fallback. `scripts/optimize-images.mjs` handles the served artwork; heavy
  webp is intentionally lossy (q82/85/88) — see `docs/assets.md` §Performance pass.
- **Nasalization is NOT bundled** (desktop license blocks web embedding). Headings
  fall back to sans-serif off the dev machine. A licensed webfont must be added by
  the humans (see `HANDOVER.md` §11). Do not try to work around the license.

## Riwayat UI (NEXT historis, lihat checkpoint aktif di atas)

- **★ STANDAR FULL-SCREEN: hero gambar + section 100svh.**
  **Homepage SELESAI** (`b228f3c`): hero pakai `assets/hero gambar/Gambar Hero
Section homepage.png` (background, bukan teks) + `100svh`; Philosophy / What We
  Do / Domains / Projects jadi `min-height: 100svh` + center (satu section = satu
  layar); CTA & footer tetap. Video + partikel hero home dihapus. `verify.mjs`
  geometry diupdate + reference PNG di-pad. `navbar-audit.mjs` diperbaiki (tunggu
  animasi entrance, toleransi tetap ±1px). 7 gate + seo ALL PASS.
  **About Us SELESAI (5 Oct 2026):** hero gambar (`assets/hero gambar/Hero Section
  - About Us.png`) + `100svh`, video/partikel dihapus; VisiMisi (`<Starfield />`,
canvas baru bungkus konten+tarot), Philosophy `is-about`(scope`:not(.is-about)`kini semua varian), Our Ecosystem, Our Team →`min-height: 100svh`+ center
(Team konten 1536 > viewport tetap 1536); reference di-pad 31/32, 33/33, 14/15;
seam Philosophy↔Ecosystem ≤16. 7 gate + seo ALL PASS.
**About Us Our Team revision SELESAI (5 Oct 2026):** section`1688:2933`kini
"Leader Team" (2 kartu) + "House of Data Sorcerers" **carousel 6 HoDS** (chips
3-per-page + arrows + 2 dots; chip aktif & fade = tint domain; Growth #4 "Join
Now!" →`/recruitment`); group title Bluu Next 700 56 gradient; grup container
1287 -> kartu x76.5; section 1440×**1562**. Komponen `TeamCard.astro`+`src/data/team.ts` (`leaderTeam`/`hodsTeams`); reference
`assets/about-us/team/OurTeam-New-1x.png`. Rencana:
`docs/our-team-hods-plan.md`.
**★ FIX-9 SELESAI (5 Oct 2026, #1–#8 + #10–#12)** — work order + detail:
**`docs/fix-9-plan.md`**. Ringkas: #1 CTA homepage→`/recruitment`; #2 navbar
active underline (+ mobile menu); #3 typo Hause→House; #4 glow kartu Our Team
(fade tint stop 35%@35% + rim 0.25→0.02, MAE 3.503→**2.774**); #5 animasi Our
Team (entrance `reveal()`+ carousel`is-entering` `@keyframes hods-card-in`,
gated reduce); #6 `html { scroll-behavior: smooth }`gated reduce; #7 divider
"View Details" pindah bawah; #8→#10 panah scroll-up dipindah ke **atas
divider/legal** (bukan fixed); #11 HoF featured frame **di belakang** portrait
(z-index 0/1/2/3); #12 OurTeam **HoDS** portrait bleed 42px ala HoF (leader tetap
clip). **Tiap item 7 gate + seo PASS.** Commit`81ffb25`..`b4b5e62`.
- **★ SELESAI (6 Oct 2026) = #9 halaman full-screen** (hero gambar
  `hero-bg.webp` + semua section konten `100svh` + center; CTA/footer tetap):
  Homepage, About Us, Recruitment, Partners, Hall of Frames. Skrip baru
  `npm run assets:heroes` (`scripts/generate-hero-bg.mjs`). Verify diukur di
  viewport seragam **1440×903**, reference di-pad `sharp.extend()` (Recruitment:
  Who 57/57, WYD 0/20, Timeline 45/46, Snippets 3/3; Partners hero asimetris
  81/163 karena konten Figma tidak center, Why 123/124; HoF hero 903 tanpa pad).
  7 gate + seo ALL PASS.
- **★ RALAT (6 Oct 2026) — Contact hero BUKAN full-screen.** User minta hero
  Contact `1445:5066` sama persis Figma: artwork node `1445:5067` (801×600) di
  `−131/−92` atas `#050507`, section **fixed 954** (tanpa `100svh`). `contact
page.png` tidak dipakai (gambar beda framing, MAE ~16). `hero-bg.*` Contact
  dihapus; Contact dikeluarkan dari `generate-hero-bg.mjs`. MAE 14.73 → **2.757**.
  **Jangan "perbaiki" balik ke full-bleed.** Hero lain tetap full-screen.
- **★ SELESAI (6 Oct 2026) — Hero "hidup" (parallax/GSAP) semua hero.**
  Rencana `docs/hero-motion-plan.md` (efek A+B+C). Helper generik di `motion.ts`:
  `heroEntrance()` + `heroArtworkParallax(opts)` (transform di `img` artwork,
  `scale:1.08` overscan, B=`y` scrub, C=`xPercent/yPercent`; Contact
  `{scroll:false, scale:1.05}`). Reduce inert → 7 gate + seo PASS, geometri/MAE
  tetap.
- **★ FIX (6 Oct 2026).** (1) Hamburger mobile: underline aktif ter-stretch jadi
  garis nyasar → `.mobile-menu .nav-underline { display:none }` (state = fill
  violet). (2) Partners hero mobile: `<picture>` `<source media="max-width:600px">`
  pakai crop portrait yang menampilkan dua jari menyatu
  (`hero-bg-mobile*` dari `assets:heroes` config `mobile`); desktop tetap.
  7 gate + seo PASS.
- **★ NEXT = #9 selesai; berikutnya audit sisa Detail HoDS + konten asli** (foto
  member, logo partner, `projects.ts`, tanggal recruitment, milestone HoF).
  Work order full-screen: **`docs/page-fullscreen-migration-plan.md`** (semua
  ditandai SELESAI). **Jangan rusak benchmark** Homepage/About/Recruitment/
  Partners/HoF/Contact. Video hero Contact kini tidak diperlukan (digantikan
  gambar); `HeroVideo.astro`/`hero-video.ts` sudah tidak dipakai komponen mana
  pun.
- **3 deviasi sengaja dari Figma (jangan "perbaiki" balik tanpa cek):**
  (1) "Hause"→**"House"** (#3); (2) footer scroll-up **di atas divider/legal**
  (#10); (3) OurTeam **HoDS** portrait **bleed** ala HoF, leader tetap clip
  (#12). Figma reference meng-clip kartu OurTeam.
- **★ POLISH UI SELESAI (6 Oct 2026):** (1) OurTeam HoDS — rim atas kartu di-clip
  (`clip-path: inset(1px 0 0 0)`) supaya tidak memotong potret bleed; carousel
  kini panel `display:grid` bertumpuk + **crossfade** (`opacity 0.5s`), entrance
  kartu lebih lembut, chip/dot/arrow ada hover/press (semua gated reduce).
  (2) Footer scroll-up: ikon **panah lurus ke atas**, klik `preventDefault()` +
  `scrollTo(top)` → **scroll, bukan View Transition** (`href="#"` dulu
  di-intercept ClientRouter). (3) `.detail-wave` (RoleDetail + HoDSDetail) jadi
  **dua lapis glow** drift berlawanan + breathe (19s/14s ease-in-out), reduce
  tetap `opacity:0`. 7 gate + seo ALL PASS.
- **★ HERO HD PASS SELESAI (6 Oct 2026):** `npm run assets:heroes`
  (`scripts/generate-hero-bg.mjs`) membake **semua 6 hero** dari
  `assets/hero gambar/` ke `public/images/<page>/<base>.webp` + `-2x` + `-3x`
  (q88/86/84, `fit: cover`); varian 3× dilewati bila sumber < 3× frame (Contact
  2680px → 1×/2× saja, tidak di-upscale). Semua `<img>` hero pakai `srcset`
  w-descriptor + `sizes="100vw"` (Contact tadinya x-descriptor → burik di
  desktop). `generate-hero-layers.mjs` **dihapus**; hero-bg dibuang dari
  `generate-about/partners/hof-assets`. 7 gate + seo ALL PASS.
- **★ FIX lanjutan (6 Oct 2026):** (1) **Leader Team** (About Us) portrait kini
  **bleed** juga (`.team-cards--leader :global(.team-card){overflow:visible}` +
  clip rim atas) — reference menunjukkan bleed ~19px, sebelumnya kepotong
  (region MAE 5.15 → 4.75). (2) Navbar active underline **glow** ditambah
  (`box-shadow 0 0 10px rgb(155 123 255 / 70%)`); underline sendiri sudah ada &
  bekerja di semua halaman + mobile menu. 7 gate + seo PASS.
- **SELESAI (4 Oct 2026) — About Us: glow responsif + karakter menempel tepi.**
  Canvas `zoom: calc(100vw / 1440px)` **dihapus** dari Our Philosophy (`1439:4219`)
  dan Our Ecosystem (`1439:4258`). Gradient tetap **section-level** (full-bleed)
  → pita ungu konsisten di semua lebar; artwork Philosophy anchor
  `left: calc((1440px - 100cqw) / 2)` (≥1441) → tetap 861px, nempel tepi section,
  identik dengan Home. Geometry 1440 tetap, seam Δ 0. `verify.mjs` assertions
  diperbarui (zoom 1, canvas 1440 centered, art `{0,861}`); 7 gate + seo + spacing
  ALL PASS.
- **SELESAI (4 Oct 2026): Semua tombol/link sesuai prototype Figma.** Gap §9
  keenam elemen selesai: Hero Join→`/recruitment`, Explore→`#projects`,
  RecruitmentHero→`#available-roles`, Recruitment Join→`#available-roles`,
  Footer nav 5 link → halaman masing-masing, Cta→`/recruitment`, Navbar CTA
  Join Us (desktop+mobile)→`/recruitment`. Button dengan
  `href` render `<a>` (bukan `<button>`), jadi `verify.mjs` selector
  `relative('button')` diganti `relative('.button')`. 7 gate + seo ALL PASS.
  Detail: `docs/figma-prototype-flow.md` §9.
- **SELESAI (4 Oct 2026): Footer scroll-up + HoF detail close button.**
  `Footer.astro` dapat tombol panah `1564:3289` (absolute kanan-atas `.top`,
  37×37, `rgba(255,255,255,.15)`, hover violet, `href="#"` → scroll atas) sesuai
  prototype `SCROLL_TO` Navbar. `HallOfFramesFeatured.astro` modal close
  (`1554:2935`): (a) `box-shadow` di-fit dari PNG node (stack inset mentah Figma
  terlalu terang di Chromium → ring putih; kini 4 lapis: edge `#7d7b83`, crescent
  bottom-right `#dee0e8`, glow `rgba(85,83,91,.5)`, gelap top-left `#232228`);
  (b) panel dapat `tabindex="-1" autofocus` supaya `showModal()` tidak fokus ke
  tombol close → outline `:focus-visible` putih 2px hilang saat modal dibuka
  mouse (keyboard tetap dapat ring). (c) **Icon X tak center**: `place-items:
center` menolak center item 18px di content-box 12px (padding 8/16) → SVG di
  x=16 bukan 13 (X geser ~3px ke kanan); ganti ke **`place-content: center`**.
  Icon codicon kini cocok reference persis (X 12×12 di (21.875,21.875)); MAE
  close button 22.2 → **15.2**. 7 gate + seo ALL PASS.
- **SELESAI (4 Oct 2026): Navbar hover = underline.** `.nav-underline` jadi
  indikator state: link `.active` selalu menampilkan garis (opacity 1); hover/
  focus link mana pun memunculkan garis (fade `opacity` 0.25s) + teks putih, jadi
  hover pada link aktif pun terlihat (garisnya glow `0 0 10px rgb(155 123 255 /
85%)`). Pill background dibatalkan (user minta garis). Garis tetap 1px/lebar
  label (navbar-audit assert h≈1, w=label) — geometri tak berubah, ALL PASS.
- **★ NEXT: BANGUN CMS / ADMIN DASHBOARD (backend Google Apps Script).** Rencana
  lengkap: **`docs/cms-plan.md`** (keputusan 6 Oct 2026: **GAS + Google Sheets +
  Drive**, **build-time fetch + Vercel rebuild hook**, admin page custom
  HtmlService, 1–2 admin, **save = live**). Fase **B0** = snapshot
  `src/data/cms-snapshot.json` + thin loader (import komponen tetap sama) + Zod,
  **tanpa ubah tampilan/geometri**, satu collection per pass + 7 gate; lalu B1
  pasang GAS export. Jebakan: geometri kartu (`domains.ts` `rows`, `roles.ts`
  `centered`/`tight`) = desain jangan diekspos; `verify.mjs` mengunci sebagian
  jumlah konten; Drive bukan CDN; secret di GAS Script Properties / Vercel env.
  Kebutuhan user: `docs/cms-plan.md` §6.
- **PENDING kecil: video hero Contact (`1445:5066`)** — satu-satunya hero belum
  video; tunggu aset dari user. Lihat `docs/hero-video-plan.md`.
- **Recruitment Hero penajaman (3 Oct 2026):** sumber video planetary 1080p
  memang lembut pada permukaan planet. Generator kini memakai CAS luma 0.6
  sebelum upscale Lanczos dan unsharp ringan 0.25 sesudahnya (AV1 CRF 42,
  x264 CRF 31). Sharpness crop planet t=4 s naik 0.718 → 0.795; output tetap
  dalam budget 0.9/1.1 MB. Fallback statis dan geometri tidak berubah.

- **Recruitment Hero video source (3 Oct 2026):**
  `scripts/generate-recruitment-hero-video.mjs` sekarang memakai
  `Animating_static_planetary_space…_1080p_20261003170119.mp4` (1920×1080,
  24 fps, 10 s) sebagai sumber; `recruitment-hero1.mp4` adalah sumber lama.
  Loop 9 s baru diserve sebagai `public/images/recruitment/hero-bg.{webm,mp4}`
  (0.85/0.90 MiB) + poster (0.06 MiB). Static fallback dan geometri tetap.

- **Partners Hero VIDEO (`1439:4788`, 3 Oct 2026):** shared video component and
  runtime added to `PartnersHero.astro`; 7 s circular loop from the supplied
  1920×1080 clip. WebM 0.54 MiB, MP4 0.47 MiB; fallback static. Latest Figma
  export differs from stored reference by MAE 5.985; approved static baseline
  retained. Contact awaits a source clip.

- **Hall of Frames Hero VIDEO (`1439:4507`, 3 Oct 2026):** shared video component
  and runtime added to `HallOfFramesHero.astro`; 7 s circular loop from the
  supplied 1920×1080 clip. WebM 0.27 MiB, MP4 0.34 MiB; fallback static.
  Current Figma export differs from stored reference by MAE 3.627, so this
  video-only pass retains the approved static baseline. Next: Partners hero.

- **About Us Hero VIDEO (`1439:4185`, 3 Oct 2026):** 7 s circular loop from the
  supplied 1920×1080 clip, encoded as AV1 WebM 1.01 MiB and H.264 MP4 0.98 MiB
  by `scripts/generate-hero-videos.mjs about`. `HeroVideo.astro` and
  `src/scripts/hero-video.ts` gate loading to motion-enabled widths ≥601px and
  pause off-screen/hidden tabs with View Transition cleanup. Static fallback and
  geometry stay unchanged. The latest Figma export differs from the stored hero
  PNG by MAE 5.178 (navbar active state/title render); the existing reference
  remains the static baseline for this video pass. Next: Hall of Frames hero.

- **HEAD (3 Oct 2026).**
  Situs pakai Astro **`<ClientRouter />`** (navigasi klien + `AudioContext`
  persist; semua komponen re-init `astro:page-load` + cleanup
  `astro:before-swap` — `docs/sound-sop.md` §9).
- **AUDIT RECRUITMENT — Section 1 Hero (`1436:3506`) PASS (3 Oct 2026).**
  Static fallback diperbaiki: art dari IMAGE fill baru (`recruitment-hero-fill-raw.png`,
  crop `86,0,1500,902` → 1440×866 via `generate-backgrounds.mjs`), `.artwork::after`
  overlay dihapus (tidak ada di node), copy `letter-spacing` dibuang (Figma 0),
  heading gradient `181deg`. Full MAE **11.909 → 1.600**; geometri tetap; 7 gate ALL
  PASS. **Section 2 Who Should Join (`1436:3512`) PASS (3 Oct 2026)** — ref MAE 0.000,
  hanya heading gradient → global `181deg`; sisa MAE 2.836 = AA font + Starfield hidup.
  **Section 3 What You Will Do (`1436:3517`) PASS (3 Oct 2026)** — ref MAE 0.000, hanya
  heading gradient → global `181deg`; full MAE 3.25 → 1.84.
  **Section 4 Available Roles (`1436:3564`) PASS (3 Oct 2026)** — ref MAE 0.000; dua
  koreksi: heading gradient → global `181deg/79%`, dan `.role-glow` base `opacity: 0.85`
  (render reduce tadinya opacity 1 → glow ~6–11 terlalu terang; card1 BR kini ref
  `134,103,229` vs act `133,109,212`). Full MAE **8.329** (grid kartu 10.203, sisa =
  residual lintas-renderer irreducible: tinta Bluu Next ~1px + rim kaca 1px — jangan
  digeser). Lanjut section 5–9.
- **Section 5 Selection Timeline (`1436:3637`) PASS (3 Oct 2026)** — ref MAE 0.000;
  koreksi: heading gradient → `181deg/79%`; **header "Date" ternyata LEFT-aligned di
  PNG** (x761, sama dgn body) walau MCP bilang CENTER (hapus `text-align:center`,
  error 255px); **rim gradient sebenarnya `90deg`** (bukan `135deg` — MCP lossy; rim
  atas & bawah identik per-x, tergelap di x720); **junction 1px terlalu rendah** →
  header `::after` bottom 2px + body `::after` tanpa top; **separator** Figma memudar
  ke putih non-premultiplied → background `#9b7bff→#fff` + `mask-image` (MAE/baris
  12→1.2); tinta heading 1px lebih rendah → span `top: 1px`. Full MAE **4.3059 →
  2.093** (rim 0.9–1.0, junction 0.8; sisa = AA font irreducible). Geometri DOM tak
  berubah. Lanjut section 6–9.
- **Section 6 FAQ (`1436:3675`) PASS (3 Oct 2026)** — ref MAE 0.000; koreksi: rim
  `135deg` → **`90deg`** (MCP lossy; ref top/bottom rims identik per-x, top x720 =
  `46,39,108` = 90deg-50%). Full MAE **7.7518 → 7.803** (aligned crop ~5.04) —
  **didominasi artefak screenshot**, bukan bug CSS: section top `4213.578` fraksional
  → screenshot bounds dibulatkan ke luar 1px → konten tergeser sub-pixel `0.578px`;
  diff heatmap hanya **outline** glyph/rim (bukan fill), region bebas-teks MAE
  0.4–2.8. Geometri DOM tak berubah. Lanjut section 7–9.
- **Section 7 Snippets (`1436:3684`) PASS (3 Oct 2026)** — ref MAE 0.000; koreksi:
  heading line-height `67.2` → **`67`** (Figma bbox/kickoff convention; section kini
  tepat **897** = tinggi reference PNG). Full MAE **8.6288** (tak berubah) —
  **didominasi artefak screenshot**: section top `5196.781` fraksional + thumbnail 2
  & 4 di x setengah-piksel `338.5/855.5` (tekstur foto tergeser sub-pixel); aligned
  ≈ **3.03**, thumb 1/3/5 ≈ 3 vs 2/4 ≈ 10–14, isi foto identik. Downstream tops
  −0.2 (`.cta` 6093.78125, `.footer` 6613.78125). Lanjut section 8–9.
- **Section 8 CTA (`1436:3687`) PASS (3 Oct 2026)** — ref MAE 0.000; koreksi: panel
  rim `135deg` → **`110deg`** (MCP lossy; sweep angle fit dari PNG, top-rim MAE
  6.9 → 0.6). Full MAE **2.2488 → 2.2509** (tak berubah — **didominasi artefak
  screenshot**, section top `6093.781` fraksional); aligned ≈ **1.107** (terbaik).
  Geometri DOM tak berubah. Lanjut section 9.
- **Section 9 Footer (`1436:3699`, shared) PASS (3 Oct 2026)** — ref MAE 0.060
  (homepage footer ≈ recruitment). **Tanpa perubahan kode.** Diff didominasi: legal
  links sengaja **right-aligned** (mentor-approved, menyimpang dari PNG), backdrop
  landscape bertekstur (resampling ~4 + sub-pixel origin), dan AA teks. Recruitment
  footer MAE **7.7071 → 7.658**; region ter-align brand 2.7 / nav 3.8 / contact 5.0.
  **RECRUITMENT SELESAI — 9/9 section diaudit.** Berikutnya: video hero Contact
  (`1445:5066`, tunggu aset) + audit sisa Detail HoDS (`864:18857` dkk).
- **SELESAI (3 Oct 2026): Hall of Frames — card Project Highlight (`1439:4655`)
  disamakan dengan card "Our Project" homepage (`1430:2146`, `Projects.astro`).**
  Mentor-approved konsistensi: `HallOfFramesProjects.astro` (kelas `.hof-project-card`,
  JANGAN rename) kini memakai **kartu 549×567** homepage (rim `135deg`, glow radial
  violet, image `106.921676% × 61.552028%` opacity .8, tags/copy) + **coverflow JS
  `Projects.astro`** (base `min(1, stageW*.9/549)`, `sideOffset=549*.838`, `step=549*.62`,
  `rotateY ±24`, `depth=-110*d`, side `blur(6+(d-1)*3) brightness(.72)`); **4 project,
  4 dot**; glow bow-tie section (`1439:4656`) + aset `shot/glow.webp` **dihapus**.
  Section 1440×**1014** (header 803×179, stage 80/339/1280×567, dots 687/925/66×9).
  Reference `HoF-Projects-1x.png` + assertion `verify.mjs` diregenerasi (kartu sengaja
  supersede PNG lama). `responsive-audit` skip `.hof-project-card:not(.is-active)`.
  7 gate + seo ALL PASS.
- **SELESAI (3 Oct 2026): Hall of Frames — Featured Sorcerers detail modal
  (`1554:2824`).** Klik kartu Featured membuka `<dialog>`: panel **997×576**
  (centered, `padding 88/80`, `gap 64`, fill `rgba(5,5,7,.5)` + GLASS rim top
  ≈22%), backdrop `blur(7.7px)` + `rgba(217,217,217,.01)`, glow `1554:2898`
  served verbatim (`public/images/hof/detail/glow.svg`), close `1554:2935`
  (44×44 `#1A1A1A` + inset specular). Achievement bar gradient `134deg` + 6px dot;
  Contribution Manrope 400 16/24; title Manrope 700 18/27. Body `471`, gap 32.
  Efek hidup (gated `hover`+`no-preference`): card lift + glow, panel pop,
  bar stagger, glow pulse, close rotate; cue `data-sfx="click"`. **Penting:** list
  item dibuat via JS → pakai `:global(...)` (Astro scoped CSS tak menjangkau node
  JS). `verify.mjs` assert dialog hidden default + open geometry + Esc close;
  closed-section MAE tetap **2.008**. 7 gate + seo ALL PASS.
- **SELESAI (4 Oct 2026): About Us — glow responsif + karakter menempel tepi
  (Our Philosophy `1439:4219` & Our Ecosystem `1439:4258`).** Canvas zoom dihapus;
  gradient section-level; artwork anchor cqw (861px, nempel tepi); seam Δ 0.
  Detail: `docs/about-us-glow-plan.md`, `docs/ai-handoff.md`, `docs/assets.md`.
- **SELESAI (4 Oct 2026): Semua tombol/link sesuai prototype Figma.** Gap §9
  keenam elemen selesai: Hero Join→`/recruitment`, Explore→`#projects`,
  RecruitmentHero→`#available-roles`, Recruitment Join→`#available-roles`,
  Footer nav 5 link → halaman masing-masing, Cta→`/recruitment`. Button dengan
  `href` render `<a>` (bukan `<button>`), jadi `verify.mjs` selector
  `relative('button')` diganti `relative('.button')`. 7 gate + seo ALL PASS.
  Detail: `docs/figma-prototype-flow.md` §9.
- **★ NEXT: BANGUN CMS / ADMIN DASHBOARD** — rencana `docs/cms-plan.md`
  (backend Google Apps Script + Sheets + Drive, build-time fetch + rebuild hook).
  Lihat entri NEXT di atas.
- **PENDING kecil: video hero Contact (`1445:5066`) — satu-satunya hero belum.**
  Tunggu aset dari user. Lalu audit sisa Detail HoDS + konten asli (foto member,
  logo partner, `projects.ts`, tanggal recruitment, milestone HoF). Lihat
  `docs/hero-video-plan.md`.
- **PENDING — CONTACT HERO VIDEO (`1445:5066`) — satu-satunya hero belum video.**
  Home (`1430:2041`), Recruitment (`1436:3506`), About (`1439:4185`), Hall of
  Frames (`1439:4507`, source di-refresh 3 Oct 2026), dan Partners (`1439:4788`)
  sudah video (lihat `docs/hero-video-plan.md` §1). Contact menunggu aset sumber
  dari user. **Satu hero per pass + 7 gate**; geometri statis + reduce tidak
  boleh berubah. Setelah video: audit per-section Detail HoDS (`864:18857` dkk)
  - konten asli.
- **SELESAI (3 Oct 2026): About Us — Our Philosophy (`1439:4219`) — REVISI
  BACKGROUND BLEND.** Tim minta background linear disatukan dengan Our Ecosystem
  (`1439:4258`). Figma kini memberi node fill **gradient** (handles
  `p0(0.553,0.545) → p1(0.798,1.681)`, stops `#050507 → #6c3bff`); di-fit dari PNG
  → `linear-gradient(159.7deg, #050507 54.82%, #6c3bff 133.76%)` (fit MAE 0.554;
  MCP `168deg` lossy). Dipasang di **section** (mirror gradient section-level
  Ecosystem), glow home (`canvas::before`) di-hide untuk varian About. Seam
  Philosophy↔Ecosystem max Δ **9** di 1440/1920/2560. Reference
  `Philosophy-Revisi-1x.png` diregenerasi; MAE section **2.041/255**. **Homepage
  Philosophy (`1430:2052`) TIDAK berubah** (flat + glow, MAE 0.000). `verify.mjs`
  menyelaraskan scroll sebelum capture + assert seam. 7 gate + seo ALL PASS.
- **STATUS RINGKAS (3 Oct 2026).** **Homepage 100% selesai** (Hero → Our
  Philosophy → What We Do → Choose Your Domain/HoDS → Our Project → CTA, node
  `1430:2040`). **Recruitment Page 100% selesai** (node `1436:3505`). **About Us
  (`1439:4184`) + Partners (`1439:4787`) 100% selesai.** **Footer bersama**
  (`765:17071`) selesai untuk 6 halaman. Semua heading section revised memakai
  **Bluu Next Bold 700** (`--font-display`); `--font-heading` (Nasalization) kini
  hanya di label grup `OurTeam.astro` (sengaja) dan wordmark `Splash.astro`.
  **CURRENT: semua halaman konten 100% selesai** (Homepage, Recruitment,
  About Us, Partners, Contact). **Detail HoDS (`HoDSDetail`, 6 rute) SELESAI
  3 Oct 2026** — judul hero pindah ke **Bluu Next Bold 700 48/57.6** + Title
  Case, `.bullets` gap `8`, reference diregenerasi; audit **Contact
  (`1445:5065`) Section 1 Hero PASS** (geometri exact, MAE 2.757 / below-nav
  1.338). **Video hero:** Home, Recruitment, About Us, Hall of Frames (source
  di-refresh), dan Partners sudah looping; **Contact tinggal menunggu aset**.
  Berikutnya: video hero Contact + audit sisa Detail HoDS + konten asli (foto
  member, logo partner, `projects.ts`, tanggal recruitment, milestone HoF) —
  lihat `docs/ai-handoff.md`.
- **AUDIT Homepage (Target A) — koreksi gradient heading (3 Oct 2026).** Semua
  heading homepage (Hero, Philosophy, WhatWeDo, Domains, Projects, CTA
  `Recruitment.astro`) memakai **`181deg #fff 15% / #999 42% / #fff 79%`** (global
  Figma `Gradient Heading`) — menggantikan `211.54deg 32.8/49.8/73.04` (hero/
  philosophy/whatwedo/domains) dan `180deg …80%` (projects/cta) yang keliru.
  Ink-MAE heading hero **13.7 → 7.7**; section ~1 MAE turun. Geometri/8pt/warna
  solid tak berubah; 7 gate ALL PASS. `verify.mjs` tak meng-assert gradient.
- **About Us — Our Vision/Mission (`1439:4190`) — living starfield + HD tarot
  (3 Oct 2026).** Background diganti dari plate bake `visi-misi-bg.webp` ke
  komponen bersama **`<Starfield />`** (`#050507` base, drift hidup sama seperti
  What We Do; `.visi-misi` ditambah ke daftar idle `is-idle` di `motion.ts`).
  Tarot kini di-serve dari sumber HD 4× (`hd tarrot card Assets-1.png`) sebagai
  1×/2×/3× (`npm run assets:about`). Geometri tetap exact (section 1440×840,
  tarot `(1028,261,356,430)`); MAE vs reference lama ~5.85 karena pola background
  sengaja berubah. All 7 gate PASS.
- **About Us Section 1: Hero (`1439:4185`) — 100% SELESAI (2 Oct 2026).**
  Frame Figma `1439:4185` (1440×903, column, padding 80px, justify center,
  gap 16px, IMAGE fill `34bc68…` = `assets/assets about us/hero/raw-hero-bg.png`,
  tidak berubah). Content frame `1439:4186` 1280×287.4 di `(80, 307.8)`:
  Headline `1439:4187` **Bluu Next Bold 700 80/95.2 ls -0.88px**
  (`--font-display`) 1124×190.4 di `(158, 307.8)`, gradient `181deg`
  `#fff 15% / #999 42% / #fff 79%`, 2 baris ("Architecting the Future of AI" /
  "& Data Innovation."). Subtitle `1439:4188` Manrope Medium 500 18/27 putih
  680×81 di `(380, 514.2)`, `text-shadow: 0 4px 20px #000`.
  `AboutHero.astro` kini `--font-display` (bukan Nasalization). Geometri Chromium
  exact (diff 0.0px); MAE hero **4.6874/255** full (3.7902 di bawah band navbar;
  headline 10.84 = edge AA di atas nebula terang, subtitle 5.43). Semua 6 gate
  ALL PASS. Referensi: `assets/about-us/hero/About-Hero-Revisi-1x.png`.
- **About Us Section 2: visi misi (`1439:4190`) — 100% SELESAI (2 Oct 2026).**
  Frame `1439:4190` (1440×840, column, padding 80px, gap 100px, IMAGE fill
  starfield `ff47b4…` → `public/images/about/visi-misi-bg.webp`, generator
  `npm run assets:about`). Vision block `1439:4191` 1280×145.2 di `(80, 80)`;
  Mission block `1439:4195` 1280×435.2 di `(80, 325.2)`. Headings "OUR VISION"
  / "OUR MISION" **Bluu Next Bold 700 56/67.2** (`--font-display`) di `(80, 80)`
  / `(80, 325.2)`, gradient `181deg`. Body Manrope 500 18/27 putih 906 / 828.
  List `1439:4199` 797×266 di `(80, 494.4)`, 6 bar `31px` (gap 16, padding
  `2px 16px`, lebar `713/733/746/775/786/797`, gradient `100deg` hasil fit).
  Tarot `1439:4218` 356×430 di `(1028, 261)` pakai `tarot-cards.webp` (MAE 0.9).
  Section MAE **1.910/255** (vision 3.11, list 3.35, tarot 1.16, bg 0.49).
  Geometri Chromium exact. Semua 6 gate ALL PASS. Referensi:
  `assets/about-us/visi-misi/VisiMisi-Revisi-1x.png`.
- **About Us Section 3: Philosophy (`1439:4219`) — SELESAI (2 Oct 2026; background
  blend 3 Oct 2026).** Node About Us Philosophy **tidak lagi identik** dengan
  homepage Philosophy (`1430:2052`): Figma kini memberi fill **gradient**
  `159.7deg #050507 54.82% → #6c3bff 133.76%` (fit dari PNG, MAE 0.554) supaya
  menyatu ke Our Ecosystem (`1439:4258`); glow home (`canvas::before`) di-hide
  untuk varian About. Homepage tetap flat + glow (MAE 0.000). Reference
  `Philosophy-Revisi-1x.png` diregenerasi. Frame 1440×837. Content frame
  `1439:4221` 591×468 di `(766, 205)` (gap 48): eyebrow "Our Philosphy" 93×26,
  heading Bluu Next Bold 700 56/67.2 2 baris ("We Don't Just Learn AI" / "We
  Build With It", gap 4) di `(766, 239)`, grid prinsip 591×248 (`1439:4228`,
  gap 30/92), 5 item LEARN/SHIP/EXPERIMENT/IMPACT/RESEARCH BUILD. Artwork =
  sorcerer yang sama dengan home. Section MAE **2.041/255** (bottom-right 0.88).
  Seam Philosophy↔Ecosystem max Δ **9** (1440/1920/2560). Geometri Chromium
  exact. Semua 7 gate + seo ALL PASS. Referensi:
  `assets/about-us/philosophy/Philosophy-Revisi-1x.png`.
- **About Us Section 4: Our Ecosystem (`1439:4258`) — 100% SELESAI (2 Oct 2026).**
  Frame `1439:4258` (1440×874, column, padding 80px, gap 116px, gradient
  `24.87deg #050507 52.9% → #6c3bff 132.9%` ≈ tetap `24.75deg 53%/133%`).
  Header `1439:4259` 931×172 di `(254.5, 80)`: eyebrow "Our Ecosystem" 100×26
  (GLASS, gap 8 ke heading), heading "From Community to Impact" **Bluu Next
  Bold 700 56/67** (`--font-display`, line-height **67px** — bbox Figma bulat 67,
  bukan 67.2, agar header pas 172), gradient `181deg`; subtitle Manrope 500 18/27 911. Pipeline `1439:4266` 1280×426 di `(80, 368)` (gap 18): 5 kolom
  bottom-aligned (bottom 776), lebar `188/175/188/175/175`, connector `188/116/
188/116/217`, baseline Line 11 1280 di y `794`. Number Manrope 700 56/54
  gradient `180deg #6c3bff 20.8% → transparent 75%`; step title **Manrope 500**
  18/27 (dulu 700); desc Manrope 400 14/21. Section MAE **2.221/255** (header
  4.18, pipeline 3.20). Geometri Chromium exact. Semua 6 gate ALL PASS.
  Referensi: `assets/about-us/ecosystem/Ecosystem-Revisi-1x.png`.
- **About Us Section 5: Our Team (`1439:4305`) — 100% SELESAI (2 Oct 2026; SUPERSEDED 5 Oct 2026 by `1688:2933` HoDS carousel — lihat entri checkpoint terbaru).**
  Frame 1440×1536, column, padding 80px, gap 80px, fill `#050507`. Header
  `1439:4306` 1280×101 di `(80, 80)`: eyebrow "Our Team" (glass) + heading
  "The Sorcerers Behind It All" **Bluu Next Bold 700 56/67** (`--font-display`,
  line-height 67px agar header 101), gradient `181deg`, center.
  Instance `team 2` `1439:4310` 1280×1195 di `(80, 261)`, gap 80:
  grup Leader (`1439:4310;1260:17189`, 2 kartu) & Data Intelligence
  (`...;1260:17194`, 5 kartu). Label grup **Nasalization 400 32/48**
  (`--font-heading`, tersedia lokal; fallback sans) + dot gradient. Kartu
  `card orang` **302×400** radius 10, `rgba(255,255,255,.1)` + GLASS rim; frame
  dekoratif `card-frame.webp` (Mask group) di `(3,13)` 295×277; potret (crop
  `imageTransform` dibake ke `public/images/team/*.webp`, generator
  `npm run assets:about`); fade `180deg #6c3bff→#0e0626 50%`; info `(40,284)`
  222: nama Manrope 700 22/33, divider, role Manrope 400 16/24, 2 ikon sosial.
  Tombol "See More" 141×43 (glass pill). Komponen baru `OurTeam.astro` + data
  placeholder `src/data/team.ts` (7 member; foto/nama placeholder dari Figma,
  jangan mengarang URL). Section MAE **2.679/255** (header 3.20, leader cards
  6.20, data 3.56, button 1.97). Geometri Chromium exact. Semua 6 gate ALL PASS.
  Referensi: `assets/about-us/team/OurTeam-Revisi-1x.png`.
- **Homepage 100% Selesai — Our Project & CTA Recruitment Section (2 Oct 2026).**
  Seluruh 6 section Homepage (`1430:2040`) kini 100% selesai dan tervalidasi:
  - Section 5: **Our Project Section (`1430:2146`)** — Frame 1440×910px, padding 80px, gap 82px. Eyebrow 86.6×26px di `(80, 80)`, heading "What Our Sorcery Create" Bluu Next Bold 700 56/67px di `(80, 114)` (ink width 646px), 3D coverflow active card 549×567px di `(445.5, 263)`. MAE 5.0764 (Image 2.90, Tags 6.05, Text 5.90, Header 6.67, Bottom 0.0).
  - Section 6: **CTA Recruitment Section (`1430:2162`)** — Frame 1440×554px, padding 80px. Card panel 1280×394px di `(80, 80)` (padding 64px 80px, gap 48px). Eyebrow "Recruitment" 93.2×26px di `(673.4, 145)`, heading "Ready to Become a Sorcery?" Bluu Next Bold 700 56/67px di `(161, 179)`, copy Manrope 400 16/24 586×48px di `(427, 270)`. Single button `<Button variant="community">Join the Community</Button>` (201×43px) di `(619.5, 366)`. MAE 3.1427 (Button & glow 2.32, Header 4.94, Copy 6.37, Outer 0.0).
- **Recruitment Page Section 4: Available Roles (`1436:3564`) & Detail Roles (`774:17392` dkk) + WhatsApp Direct Link (2 Oct 2026).**
  Frame Figma `1436:3564` (1440×843px, padding `80px 80px 80px 80px`, gap header ke grid `58px`). Header Frame 2496 (`1436:3565`, 1280×115px, gap 24px):
  Heading "Available Roles" **Bluu Next Bold 700 56/67px** (`--font-display`) di `(80, 80)`,
  fill `linear-gradient(180deg, #ffffff 15%, #999999 42%, #ffffff 80%)`. Subtitle Manrope Medium 500 18/27px (`--font-body`), `#ffffff`
  di `(80, 168)`. Card Grid Frame 2605 (`1436:3568`, 1280×510.375px) di `(80, 253)`: enam kartu `413.33×235.17px` (gap horizontal 20px, gap vertikal 40px),
  padding `18px 28px`, 1px glass rim `linear-gradient(135deg, #ede8ff 0%, #2e276c 50%, #ede8ff 100%)`.
  Detail Roles 6 halaman (`/recruitment/roles/{data,core,language,vision,product,growth}`):
  Seluruh frame 1440×1280px (strict callout Gembala). Hero Card H1 diupdate ke **Bluu Next Bold 700 48/57.6px** (`--font-display`),
  top-aligned dengan padding 80px dan gap 56px (strict 8-point grid).
  Kartu Contact Person diubah menjadi interactive link ke WhatsApp `+62 851-7151-6704` (Zidan Amikul) via `https://wa.me/6285171516704` dengan pre-filled text pesan per-role, hover lift `translateY(-2px)`, glow violet `0 8px 24px -4px rgb(108 59 255 / 40%)`, specular rim shimmer, icon scale 1.12x, dan Web Audio SFX cues (`data-sfx="click"`, `data-sfx-hover="hover"`).
  Semua 6 gates verifikasi ALL PASS (build 0 error, verify.mjs exit 0, responsive audit 468/468 PASS, navbar audit ALL PASS, verify:vt ALL PASS, format:check ALL PASS). Geometri diff 0.0px.
- **Recruitment Page Section 6: FAQ Section (`1436:3675`) — 100% Selesai (2 Oct 2026).**
  Frame Figma `1436:3675` ("Frame 2495", 1440×983px, padding `80px`, gap header-ke-list **`56px`** — strict 8-point grid kelipatan 8, mengoreksi 58px lama).
  Heading "FAQ" (`1436:3676`): **Bluu Next Bold 700 56/67.2px** (`--font-display`), fill linear gradient 181deg `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`. Ink width terukur: 103.5px, ink height 46px.
  List 1280px (`1436:3677`): width 1280px at `(80, 203.2)`, height 700px, gap `32px` (`4 × 8px`), padding `0`.
  6 Accordion Items: Items 1–4 `1280×77px` di y = `[203.2, 312.2, 421.2, 530.2]`, Items 5–6 `1280×116px` di y = `[639.2, 787.2]` (2 baris teks).
  Background `rgba(255, 255, 255, 0.15)`, 1px glass rim **`linear-gradient(90deg, #ede8ff 0%, #2e276c 50%, #ede8ff 100%)`** (audit 3 Oct 2026: MCP `135deg` lossy; ref top/bottom rims identik per-x).
  Section MAE: **7.7518 → 7.803/255** (audit 3 Oct 2026, rim `90deg`). **Didominasi artefak screenshot, bukan bug CSS:** section top `4213.578` fraksional → screenshot bounds dibulatkan ke luar 1px → konten tergeser sub-pixel `0.578px`; diff heatmap hanya **outline** glyph/rim, region bebas-teks 0.4–2.8, ter-align (top:1) ~5.04. Sisa = AA font irreducible. Geometri Chromium diff 0.0px.
  Downstream section tops (`.snippets` 5196.78, `.cta` 6093.78, `.footer` 6613.78) terkalibrasi presisi.
  Semua 7 gate + seo ALL PASS.
- **Recruitment Page Section 7: Snippets of Life at Data Sorcerers (`1436:3684`) — AUDIT PASS (3 Oct 2026).**
  Frame Figma `1436:3684` ("Frame 2502", 1440×**897**px, padding `40px 80px`, gap header-ke-gallery **`56px`** — strict 8-point grid, mengoreksi 58px lama), fill `#050507`.
  Heading `1436:3685`: "Snippets of Life at data sorcerers" **Bluu Next Bold 700 56/67px** (`--font-display` — audit 3 Oct 2026: `67.2` → `67`, Figma bbox/kickoff convention → section tepat 897 = tinggi reference PNG), `text-align: center`, fill `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`. Ink width terukur 840.75px.
  Gallery instance `1436:3686` ("galeryy ds"): 1280×694px VERTICAL gap `35px` (nilai autolayout Figma: 556 + 35 + 103). Hero carousel 1280×556 radius 20px; 5 thumbnail 246×103 `space-between` di x `[80, 338.5, 597, 855.5, 1114]`.
  Section MAE: **8.6288/255** (audit 3 Oct 2026 — tak berubah, **didominasi artefak screenshot**: section top `5196.781` fraksional + thumbnail 2 & 4 di x setengah-piksel `338.5/855.5` → tekstur foto tergeser sub-pixel; aligned ≈ **3.03**, thumb 1/3/5 ≈ 3 vs 2/4 ≈ 10–14, isi foto identik). Geometri DOM kini persis Figma. Downstream tops −0.2 (`.cta` **6093.78125**, `.footer` 6613.78125).
  Semua 7 gate + seo ALL PASS (`build`, `verify.mjs`, `navbar-audit`, `verify-vt`, `responsive-audit`, `audit:spacing`, `format:check`).
- **Recruitment Page Section 8: CTA Recruitment (`1436:3687`) — AUDIT PASS (3 Oct 2026).**
  Frame Figma `1436:3687` ("CTA Recruicment Section", 1440×520px, padding `80px`), fill `#050507`. Panel `1438:4072`: 1280×360px di `(80, 80)`, `height:360px` + `justify-content:center`, padding `64px 80px`, gap `48px`, fill `rgba(98,80,255,.1)`, 1px glass rim **`110deg`** (audit 3 Oct 2026: MCP `135deg` lossy — sweep angle fit dari PNG, top-rim MAE 6.9 → 0.6).
  Heading `1438:4077`: "Ready to Become a Sorcery?" **Bluu Next Bold 700 56/67.2px** (`--font-display`), center, fill `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)` (ink 710.25×52). Copy `1438:4078`: Manrope 400 16/24, `letter-spacing:-0.176px`, width 586 (teks lama sesuai PNG).
  Button `community` "Join the Community" 201×43; glow `glow.svg` IMAGE-SVG `1438:4081` di `(349.83, 351)` 1000.33×271.5.
  Section MAE: **2.2488 → 2.2509/255** (audit 3 Oct 2026, rim `110deg`; tak berubah — **didominasi artefak screenshot**, section top `6093.781` fraksional). Aligned MAE ≈ **1.107** (terbaik dari semua section). Geometri diff 0.0px. Downstream `.footer` top → **6613.78125**.
  Semua 7 gate + seo ALL PASS (`build`, `verify.mjs`, `navbar-audit`, `verify-vt`, `responsive-audit`, `audit:spacing`, `format:check`).
- **Recruitment Page Section 9: Footer (`1436:3699` / komponen bersama `765:17071`) — AUDIT PASS (3 Oct 2026).**
  `Footer.astro` dipakai **6 halaman** (index, about, recruitment, partners, hall-of-frames, contact) — revisi ini site-wide. Figma footer diperbarui:
  Brand name Nasalization → **Bluu Next Bold 700 32/38.4** (`--font-display`), gradient `270deg #fff → #ede8ff`; brand lockup gap `14 → 8`, brand copy gap `26 → 24`, nav/contact gap `34 → 32`; brand desc `#CBC5FF → #fff`; border social + `instagram.svg`/`linkedin.svg` fill `#CBC5FF → #fff`; copyright "All rights reserved" → "All right reserved" (per PNG). Top row `1280×314`, divider y `454.13`, legal y `475.13`.
  Legal links tetap **right-aligned** (approved mentor revision 23 Sep 2026, supersedes PNG left-grouped). Section MAE: homepage footer **5.8380/255** (brand region 3.0), recruitment footer **7.7071 → 7.658/255** (audit 3 Oct 2026, **tanpa perubahan kode**). Diff didominasi: legal links sengaja right-aligned (struktural), backdrop landscape bertekstur (resampling ~4 + sub-pixel origin), dan AA teks. Region ter-align brand 2.7 / nav 3.8 / contact 5.0. Semua 7 gate + seo ALL PASS.
- **Recruitment Page SELESAI — 9/9 section diaudit (3 Oct 2026).** Berikutnya: audit Partners (`1439:4787`) + 6 detail HoDS (`864:18857` dkk) per-section, atau isi konten asli. Wajib Master Work Plan per-section sebelum sentuh kode!
- **Recruitment Page Section 3: What You Will Do (`1436:3517`) (2 Oct 2026).**
  Frame Figma `1436:3517` (1440×903px, padding `80px 80px 80px 80px`, gap header ke body `20px`). Header Frame 2734 (`1436:4048`, 1280×118px, gap 24px):
  Heading "What You Will Do" **Bluu Next Bold 700 56/67px** (`--font-display`) di `(80, 80)`,
  fill `linear-gradient(180deg, #ffffff 15%, #999999 42%, #ffffff 80%)`. Subtitle Manrope Medium 500 18/27px (`--font-body`), `#ffffff`
  di `(544.5, 171)`. Body Frame 2542 (`1436:3520`, 1312×625px) di `(64, 218)`: Tarot Card 1 di `(983, 218, 356×430)`, Tarot Card 2 di `(129, 434, 295.39×361.78)`,
  Connector SVG di `(64, 313, 1312×531)`, Content 8 labels di `(158, 348, 1125×409)` dengan 8-point grid intra-pair gap 16px dan inter-pair gap 24px
  (y: 348, 395, 450, 497, 552, 599, 654, 701). Reference export `Recruitment-WhatYouWillDo-Revisi-1x.png`, MAE **3.2541/255**.
  Semua 6 gates verifikasi ALL PASS.
- **Recruitment Page Section 2: Who Should Join (`1436:3512`) (2 Oct 2026).**
  Frame Figma `1436:3512` (1440×789px, padding `80px 80px 80px 80px`, gap `74px`). Header Frame 2547 (1280×119px, gap 24px):
  Heading "Who Should Join?" **Bluu Next Bold 700 56/67.2px** (`--font-display`, line-height 68px) di `(80, 80)`,
  fill `linear-gradient(180deg, #ffffff 15%, #999999 42%, #ffffff 80%)`. Subtitle Manrope Medium 500 18/27px (`--font-body`)
  di `(80, 172)`. HoDS Card Rail Frame 2509 (1280×436px, cards 405×436px, gap 32px) di `(80, 273)`. Background living sky
  `Starfield.astro`. Reference export `Recruitment-WhoShouldJoin-Revisi-1x.png`, MAE **2.8430/255**.
  Audit responsif 18 rute × 26 widths (468/468) & verify.mjs exit 0. Geometri diff 0.0px.
  Detail: `docs/assets.md` §Recruitment page — Who Should Join.
- **Recruitment Page Hero & Apply Now Button — revisi font, buttons & spacing (2 Oct 2026).**
  Frame Figma `1436:3506` (1440×866px, padding `0 80px`), Content Frame 2733 (1280×310px, gap `48px`
  ke button, vertically centered top 278px / bottom 278px). Header Frame 2732 (900×176px, gap `4px`):
  Line 1 `1436:3508` "Your Next Chapter", Line 2 `1436:4043` "Start here" dengan **Bluu Next Bold 700 72/86**
  (token `--font-display`), linear gradient per line, text-align center. Hero description `1436:3509` Manrope Medium 500
  18/27 `#EDE8FF` (900×27px, gap ke heading 16px, `letter-spacing: -0.176px` 1 baris). Button Component Set
  `Apply Noww Button` (`1436:3502`, 120×43px, radius 20px, Manrope Medium 500 18/27): Primary default `1436:3501`
  (radial gradient `#6C3BFF` -> `#9B7BFF` -> `#6C3BFF`, specular inner shadow) & hover `#2F196F`; Secondary default
  `1436:3498` (`#1A1A1A` 12px blur) & hover `#4C3B7E`. Legacy button base `.primary` (205px) dipertahankan untuk
  homepage & Cta. Audit responsif 18 rute × 26 widths (468/468) & verify.mjs exit 0. Geometri diff 0.0px.
  Detail: `docs/assets.md` §Recruitment Page — Hero Section & Apply Now Button.
- **Detail HoDS Pages (/hods/[id]) — penyesuaian height 1280px & spacing (2 Oct 2026).**
  Frame Figma `864:18857`, `864:18904`, `864:18959`, `864:19013`, `864:19024`, `864:19035`
  dan callout Gembala: "Penyesuaian Height (tinggi card) menjadi 1280px untuk ALL Detile HoDS".
  Container `.hods-detail-inner` `min-height: 1280px`, gap `56px`, padding `80px`.
  Back link di `(80, 80)`, hero card di `(80, 163)` (1280×279), tabs di `(80, 498)` (gap 8px),
  role body gap `32px`, block gap `16px`. Geometri di-assert pada seluruh 6 rute (`/hods/{data,core,language,vision,product,growth}`).
  Regional MAE `/hods/language`: Top **0.5816**, Content **1.3456**, Bottom **2.3912**.
  Audit responsif 18 rute × 26 widths (468/468) & verify.mjs exit 0.
  Detail: `docs/assets.md` §Detail HoDS Pages (/hods/[id]).
- **Homepage Choose Your Domain (HoDS) — revisi font, cards & spacing (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2138`. Judul **Bluu Next Bold 700 56/67.2** (token
  `--font-display`), gradient per baris, Eyebrow `House of Data Sorcerers`
  (Figma `GLASS` effect, 159×26, gap ke heading 8px). Subtitle Manrope 16/24 white
  (gap ke heading 24px). Gap header ke rail kartu 74px. Rail Frame 2509 (1280×436),
  gap antar card diperkecil ke 32px dan ukuran kartu diperlebar ke 405×436px di koordinat
  `x: [80, 517, 954, 1391, 1828, 2265], y: 303`. Judul kartu Manrope Bold 700 22/33,
  deskripsi Manrope 400 16/24 white, gap teks 8px. Keyboard navigation (step 437px) &
  attract-mode step scroll utuh. Section MAE **2.4051**. Geometri diff 0.0px.
  Detail: `docs/assets.md` §Homepage House of Data Sorcerers (HoDS).
- **Homepage What We Do — revisi font, cards & spacing (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2089`. Judul **Bluu Next Bold 700 56/67.2** (token
  `--font-display`), gradient per baris, 2 baris `gap: 4px`. Eyebrow `What We Do`
  (Figma `GLASS` effect, gap ke heading 8px). 4 kartu pillar 391×254 di `(80,80)`,
  `(969,80)`, `(80,506)`, `(969,506)`. Judul kartu **Manrope Bold 700 26/39**,
  gap nomor-ke-judul 0px, gap judul-ke-desc 16px, gradient rim 1px `135deg`.
  Section MAE **2.5790**. Geometri diff 0.0px. Detail: `docs/assets.md` §Homepage What We Do.
- **Homepage Our Philosophy — revisi font & spacing (2 Oct 2026).** Frame Figma
  `1430:2040`, section `1430:2052`. Judul **Bluu Next Bold 700 56/67** (token
  `--font-display`), gradient per baris, 2 baris `gap: 4px`, `&nbsp;` menjaga
  double-space Figma (587px width exact). Kolom desktop 591px di `x: 766, y: 205`.
  Strict 8pt spacing: eyebrow gap 8px, title-to-grid 48px, icon-to-font 24px,
  title-to-subtitle 8px, grid 30px×92px. Section MAE **2.568** (turun dari 27+;
  Grid MAE 2.72, Ilus 1.99). Geometri diff 0.0px. About Us (`variant="about"`)
  100% utuh. Detail: `docs/assets.md` §Homepage Our Philosophy.
- **Contact precision pass — Figma GLASS rim (1 Oct 2026, `c55c5e5`).** Pill
  `1445:5072`, kartu info `1445:5077`, panel form `1445:5098` pakai effect
  **`GLASS`** (cek via REST API — MCP `figma_get_figma_data` menyembunyikannya).
  Diemulasi ring `::after` + `mask-composite: exclude` (bukan `border`) + alpha
  di-fit dari PNG → rim persis (top 116/115, bottom 96/95, sisi 60/60). MAE hero
  3.00 → 2.76 (konten tanpa navbar ~1.28), kartu ~5.1 → ~3.4, form 1.35 → 1.11.
- **Homepage hero — revisi font & spacing (1 Oct 2026, `e515b26`).** Frame Figma
  `1430:2040`, hero `1430:2041`. Judul **Bluu Next Bold 72/86** (OFL di-bundle,
  token `--font-display`; Nasalization tetap untuk halaman lain), gradient per
  baris, paragraf Manrope 18/25 lebar 655, spacing 80/64/16/24; tombol
  `community`/`explore` (hover `#2F196F`/`#4C3B7E`); navbar CTA **"Join Us"
  93×43** (shared, semua halaman). **Art hero = plate Figma persis**
  (`Home-Hero-Plate.png` → `background.webp`, `figure.webp` dihapus) → hero MAE
  **27.96 → 3.18**. Detail: `docs/assets.md` §Homepage hero +
  `docs/pixel-precision-sop.md` §6.
- **Hall of Frames + Contact selesai (1 Oct 2026, file Figma
  `JYUzJK1hFqaEwL6DpdDvjp`).** `/hall-of-frames` (Hero `1439:4507` MAE 4.34,
  Featured `1439:4512` 2.01, Projects `1439:4655` 2.96, Milestone `1439:4699`
  1.33) dan `/contact` (`ContactHero.astro`, hero `1445:5066` MAE 3.00). Semua
  link navbar aktif. Generator: `npm run assets:hof` + `npm run assets:contact`.
  Detail: `docs/assets.md` §Hall of Frames / §Contact.
- **Sudah live:** About Us §1–4, Partners page (`/partners`), Recruitment
  lengkap, Hall of Frames, Contact, 6 detail role, 6 detail HoDS, Navbar exact
  Figma, motion, sound, SEO/OG, View Transitions. **18 rute publik** (+
  `/lab/sound` internal) — semua link navbar aktif.
- **PARTNERS PAGE — 100% SELESAI (`1439:4787`, file `JYUzJK1hFqaEwL6DpdDvjp`).**
  Homepage (`1430:2040`), Recruitment (`1436:3505`), About Us (`1439:4184`) &
  Partners semua 100%. Partners 4 section (Master Work Plan per-section + 6 gate):
  1. Hero Section - Partners `1439:4788` (1440×659) — **SELESAI 3 Oct 2026**
  2. Our Partners Section `1439:4793` (1440×1071) — **SELESAI 3 Oct 2026**
  3. Why DS section `1439:4937` (1440×656) — **SELESAI 3 Oct 2026**
  4. Footer `1439:4983` (1440×556, shared `Footer.astro`) — **SELESAI (verified)**
     Detail: `docs/ai-handoff.md` §"Next Task", `docs/kickoff-prompt.md`.
- **CURRENT — Contact (`1445:5065`) audit strict per-section + Detail HoDS.**
  Contact sudah diimplementasi (Hero `1445:5066` MAE 2.76, Footer `1445:5118`
  shared) → audit ulang 8pt/font/MAE satu per satu. Lalu revisi `HoDSDetail`
  (6 rute `/hods/[id]`) ke Bluu Next Bold 700 + strict 8pt.
- **Partners Section 1: Hero (`1439:4788`) — 100% SELESAI (3 Oct 2026).**
  Frame 1440×659, column, `padding 242px 80px 160px`, align center, `gap 8px`,
  IMAGE fill `e79b1f65…` (= raw `assets/partners/hero/hero-fill-raw.png` →
  `hero-bg.webp` via `npm run assets:partners`; generator kini baca raw baru,
  bukan `Hero Section - Partners1.png` lama). CTA `1439:4789` 228×26 di
  `(606,242)`, `padding 4px 12px`, radius 32, `rgba(255,255,255,.15)`, teks
  `1439:4790` Manrope 400 12/18. Heading `1439:4791` **Bluu Next Bold 700
  80/102** (`--font-display`) 1280×223 di `(80,276)`, ink 789×180 @ `(326,295)`,
  2 baris ("Let's Build Something" / "Meaningful Together."), **satu gradient
  `181deg #fff 15% / #999 42% / #fff 79%` membentang blok 223px** (bukan per
  baris — per-line terbukti lebih buruk, heading MAE 10.2 vs 7.6). Navbar
  instance `1439:4792` ada di PNG → `.navbar` disembunyikan verify. Geometri
  Chromium exact; MAE **4.128/255** full (2.730 di bawah band navbar, bg 1.204,
  heading 7.561, pill 16.5). Semua 6 gate ALL PASS. Referensi
  `assets/partners/hero/Partners-Hero-1x.png`.
- **Partners Section 2: Our Partners (`1439:4793`) — 100% SELESAI (3 Oct 2026).**
  Frame 1440×1071, column, `padding 80px`, `gap 100px`, fill `#050507`. Tiga grup
  (`1439:4794` Industry 10 kartu, `1439:4863` Academia 5, `1439:4900` Community
  5), tiap grup column `gap 42px`. Header row `gap 20px`: pill (`padding 4px 16px`,
  radius 20, radial `circle at 8% 19% #6C3BFF→#3C2188`, inset highlight, Manrope
  500 18/27) + line wrapper `padding 10px` (line 1px `90deg #9B7BFF→transparent`).
  Grid **`gap 16px`** (dulu 20) → kartu **243.2×116** (dulu 240), radius 20,
  `rgba(255,255,255,.15)`; art `partner-card-bg.webp` (cocok node baru MAE 2.33),
  logo ter-center (78×84). Tak ada heading → tak ada perubahan font (pill sudah
  Manrope). Geometri Chromium exact; MAE **2.860/255** (header/pill 2.62, card row
  6.82). Semua 6 gate + seo ALL PASS. Referensi
  `assets/partners/our-partners/OurPartners-1x.png`.
- **Partners Section 3: Why DS (`1439:4937`) — 100% SELESAI (3 Oct 2026).**
  Frame 1440×656, column, `padding 80px`, align center, `gap 48px`, fill `#050507`.
  Header `1439:4938` (fixed 263, `gap 8`): pill "Why Data Sorcerers?" (Manrope 400
  12/18, `rgba(255,255,255,.15)`, radius 32) + heading `1439:4941` **Bluu Next
  Bold 700 80/102** (`--font-display`) 1280×229, 2 baris ("More Than A Network" /
  "A Building Partner"), **satu gradient `181deg` membentang blok**. Grid 4 kartu
  `309.5×185` `gap 16` lebar 1286 (x77); kartu `rgba(255,255,255,.15)` + rim 1px
  `135deg`, glow = raw IMAGE-SVG `1439:4949` (`why-glow.webp`, fit `(-184,-18)`),
  icon = crop sprite `imageRef 36308539…` (imageTransform) → `why-*.webp` 58×63,
  judul Manrope 700 26/39, desc Manrope 400 16/24 `#EDE8FF`. Geometri Chromium
  exact; MAE **3.216/255** (heading 4.87, cards 8.57, bg 0.000). Semua 6 gate +
  seo ALL PASS. Referensi `assets/partners/why-ds/WhyDS-1x.png`.
- **Partners Section 4: Footer (`1439:4983`) — SELESAI (verified 3 Oct 2026).**
  Komponen bersama `Footer.astro` (1440×556). Node `1439:4983` **pixel-identik**
  dengan reference recruitment (`Recruitment-Footer-Revisi-1x.png`, MAE 0.060).
  `verify.mjs` kini juga mendiff footer halaman Partners vs
  `assets/partners/footer/Partners-Footer-1x.png` → MAE **5.873/255** (setara
  homepage 5.838). **Partners page 100% (4 section).**
- **Detail HoDS revision (`HoDSDetail.astro`, 3 Oct 2026).** Judul hero 6 rute
  `/hods/[id]` pindah dari `--font-heading` (Nasalization 400 uppercase) ke
  **Bluu Next Bold 700 48/57.6** (`--font-display`, Figma `864:18900`/`864:19238`),
  gradient `270deg #fff → #ede8ff`, **Title Case** (`src/data/hods.ts` titles
  diselaraskan `src/data/domains.ts`). `.role-copy top 84.5 → 85`; `.bullets` gap
  `13 → 8` (Figma `798:2745`). Reference `HoDS-Detail-Language-1x/2x.png`
  diregenerasi dari node `864:18959`. `verify.mjs` sekarang assert heading
  `font-family` Bluu Next + weight `700` per rute. Geometri tak berubah
  (`back 80/80`, `card 80/163/1280×279`, `tabs 80/498`, height 1280).
- **Detail HoDS tabs — transisi halus (4 Oct 2026).** Active pill pindah ke
  pseudo `::before` (gradient radial) dengan `opacity` cross-fade 0.34s (gradient
  tak bisa diinterpolasi, jadi lapisan pseudo yang di-fade) + hover lembut pada
  `background-color`. Isi panel di-stagger masuk (`hods-block-in` 0.5s, delay
  `--i * 70ms` per `.block`) dan restart tiap ganti tab (`display:none → block`).
  Semua animasi di-gate `prefers-reduced-motion: no-preference`; reduce = instan
  (render verify tetap identik). Tidak ada padding/gap/geometri baru.
- **Next plan (prioritas).** **Homepage (`1430:2040`), About Us (`1439:4184`),
  Recruitment (`1436:3505`, 9/9), dan Partners (`1439:4787`, 4/4) SELESAI diaudit
  (3 Oct 2026)** — benchmark presisi, jangan rusak tanpa alasan. Verifikasi ulang
  3 Oct 2026: `npm run audit:spacing` PASS (38 komponen), semua heading halaman
  `--font-display` (Nasalization hanya `OurTeam`/`Splash`/`lab/sound`), `verify.mjs`
  PASS. **★ SELESAI (4 Oct 2026) = About Us glow responsif + karakter menempel
  tepi** — Our Philosophy (`1439:4219`) & Our Ecosystem (`1439:4258`); canvas
  zoom dihapus, gradient section-level, artwork anchor cqw (seam Δ 0). **★ NEXT =
  terapkan SEMUA tombol/link sesuai prototype Figma** (`docs/figma-prototype-flow.md`;
  SOP §"Hukum Navigasi & Prototype"): satu elemen/halaman per pass + 7 gate, tujuan
  100% benar, catat tiap perubahan; Home & Recruitment jangan rusak. **PENDING =
  video hero Contact (`1445:5066`)** (tunggu aset). Lalu audit sisa Detail HoDS +
  konten asli (`projects.ts`, tanggal recruitment, logo partner, foto/nama member
  team, member/project/milestone HoF). Protokol: inventaris `depth 1` → Master
  Work Plan per section → 7 gate per section; **dilarang lompat/gabung section**.
  Detail: `docs/ai-handoff.md` §"Next Task" & `docs/kickoff-prompt.md`.
- **Deploy GANDA**: `git push origin main` → testing + production.
- **Available Roles hover (`f92b88a`).** Kartu reaktif pointer: pool radial violet
  ikut kursor (`--mx/--my`), ember lean (`--gx/--gy` ±22/16px + `scale(1.06)`),
  divider draw dari kiri, panah overshoot. Gate `(pointer: fine)` +
  `no-preference`; state istirahat = identik referensi.
- **Available Roles glow wave diperkecil (`d26f81e`).** `@keyframes
role-glow-wave` = `scale: 1 → 1.04` saja (drift `translate ±6%` dibuang) →
  ukuran glow balik mendekati frame statis (sebelumnya `1.15 → 1.22`).
- **Navbar redesign → exact Figma (28 Sep 2026).** `Navbar.astro` rewritten to
  match node `755:15178` / `assets/Navbar.png`: gradient top wash
  (`180deg rgba(108,59,255,.1) → transparent`), inactive links `#707070`, active
  link `#fff` + a 1px gradient underline (Home `49px`; width = label width),
  right-aligned `menu → 90px → CTA`, CTA `42.1px` with a `148deg` 2px gradient rim
  (`.button.white`), and **no** glass capsule / sliding indicator / `is-condensed`
  morph. Desktop `≥1301px` hardcodes the tab widths + CTA `173px` for an exact
  `menu 753`; scrolled state only fades in a translucent `rgb(6 5 10 / 45%)` +
  `blur(12px)` glass backing. `scripts/navbar-audit.mjs` rewritten to assert this
  geometry. Mobile keeps the full-screen hamburger, link colours aligned to Figma.
- **Detail role/HoDS mobile (`3dc3432`, `d0fd3be`).** Bottom glow wave baru
  (`glow.svg` satu arah) + `main` `min-height: 100vh`/`100lvh` **khusus ≤900px**
  supaya gradient mentok bawah. Jangan naikkan ke base: `verify.mjs` assert
  `.role-detail` height `1280` di viewport `1440×1400`.
- **Perf:** detail ringan; Home/Recruitment berat. **P0 sudah dieksekusi**
  (Home mobile 1.33→0.98 MB); audit + rencana P0–P2 di
  `docs/ai-handoff.md` §"Perf audit & rencana".
- **OG/share:** tag di server OK; WhatsApp kosong = cache Meta (refresh lewat
  Facebook Sharing Debugger), bukan bug kode.
- `main` HEAD (lihat `git log`; checkpoint fitur recruitment = `ff7fe20`) = homepage + **halaman Recruitment lengkap** (hero →
  Who Should Join → What You Will Do �� Available Roles → Selection Timeline →
  FAQ → Snippets → CTA → Footer) + halaman detail role
  (`/recruitment/roles/{id}`, di-link dari Available Roles) + hover button.
  Detail HoDS (home) tetap.
- Polish terakhir (setelah checkpoint recruitment): menu hamburger **full-screen**
  dengan animasi buka/tutup JS (fallback instant saat `prefers-reduced-motion`)
  plus hover pill membulat; panah carousel **kiri-kanan di desktop, bawah di
  mobile**; skrip `scripts/responsive-audit.mjs` (18 halaman × 26 lebar) ALL PASS.
  Lihat `git log`.
- **Available Roles cards (redesign 26 Sep 2026)**: proporsional penuh —
  `aspect-ratio: 1652 / 956` + `container-type: inline-size`, semua ukuran `cqw`;
  base `#2a2a2c`, glow violet kanan-bawah (`public/images/recruitment/role-glow.webp`,
  diekstrak dari `Card Role 1.png`, MAE ≈ 2.5), ring gradient `150deg` via CSS
  `::after` + `mask-composite`, divider gradient, `View Details` + panah
  `basil:arrow-right-solid` inline. Judul **Title Case** dari `domains.ts`; tagline
  dari `roles.ts` `tagline` (bukan `about`). Grid 3/2/1, `gap 40px 20px`. Geometri
  di-assert di `verify.mjs` (section `851.375`, list `518.375`, kartu
  `413.33 × 239.19`). Glow di layer sendiri `.role-glow` yang **beranimasi halus**
  (`scale 1 → 1.04` saja sejak `d26f81e`; drift `translate ±6%` dibuang supaya
  tidak terlihat kegedean), `alternate` 9s, `transform-origin: 50% 100%` → selalu
  overfill, tanpa edge keras; hover menambah pool radial ikut kursor + ember lean
  (`f92b88a`). Di-gate `prefers-reduced-motion: no-preference` dan di-pause
  off-screen via `.available-roles.is-idle` (observer di `motion.ts`). Statis
  (reduce) tetap persis referensi. Sumber referensi:
  `assets/assets recruitment page/available roles/Card Role *.png`.
- **Hero mobile fluid (≤600px)**: h1/body/gap/padding pakai `clamp()` fluid +
  `min-height: 100svh` dengan konten dipusatkan vertikal;
  judul konsisten 2 baris sampai 320px; tombol home stack ≤480px. **≥601px tidak
  diubah** — tablet/desktop dan diff PNG hero 1440 tetap (jaga ini saat mengedit).
- **Hero = plate Figma persis + revisi font & spacing (1 Oct 2026)**: `Hero.astro`
  memakai satu plate full-frame 1583 × 993 (`public/images/hero/background.webp`)
  = **image fill Figma** node `1430:2041` (`assets/assets home page/hero
section/Home-Hero-Plate.png`), digenerate `scripts/generate-hero-layers.mjs`.
  Cocok referensi ~2.7 MAE — menggantikan layered `background.webp`+`figure.webp`
  rekonstruksi (yang ~24 MAE; `figure.webp` dihapus). Judul **Bluu Next Bold
  72/86** (`--font-display`, woff2 OFL di-bundle; Nasalization tetap untuk halaman
  lain), 2 baris `gap 4`, gradient per baris; paragraf Manrope 18/25 lebar 655;
  padding 80, gap 64/16/24. Tombol `community` (primary violet, hover `#2F196F`)
  & `explore` (glass, hover `#4C3B7E`). Navbar CTA "Join Us" 93 × 43 (shared,
  semua halaman; `navbar-audit` assert 743 menu / gap 195 / CTA 93). Idle karakter
  terpisah → idle halus seluruh plate (`.art-bg`, overscan 1.05, `motion.ts
animatePlate`). Referensi hero: `Home-Hero-Revisi.png` (node `1430:2041`).
- SEO/OG selesai: canonical + Open Graph/Twitter + JSON-LD + `robots.txt` +
  sitemap (`@astrojs/sitemap`) + share card `public/og/og-default.jpg`. Origin
  dari `SITE_URL` (default `https://data-sorcerers-community-sigma.vercel.app`) — **ganti begitu
  domain final diketahui**. `npm run seo:audit` PASS.
- **Motion (GSAP + Three.js) aktif lagi** (revisi `5feea0d`, pakai
  `gsap.matchMedia` + cleanup listener): `src/components/Motion.astro` +
  `src/scripts/motion.ts`. Hero punya **pinned scroll sequence** (≥768px:
  zoom `.artwork-stack` 1→1.35, figure naik, copy keluar, `.hero-flare` sweep,
  durasi `+=110%`), karakter `.art-figure` punya **idle sendiri** (bob `yPercent`,
  sway `rotation`, breathing `scale`) + entrance + reaksi pointer, plus partikel
  Three.js (700 titik, burst via `window.__heroParticles`) lazy di `Hero.astro`;
  plus scroll reveal, parallax pointer, 3D tilt, magnetic button, cursor glow.
  **Hero recruitment ikut motion (Phase 2, 26 Sep 2026):** `/recruitment` kini
  include `<Motion />`; blok `.recruitment-hero` = entrance copy (tunggu
  `ds:splash-done`, skip `nav-warm`) + pointer parallax + pinned zoom ≥768px
  (`scale 1.04→1.35`, copy naik, `end +=110%`). **Phase 3 (26 Sep 2026):** field
  partikel Three.js diekstrak ke `src/scripts/hero-particles.ts`
  (`mountHeroParticles(canvas, host, preload)`, dipakai `Hero.astro` +
  `RecruitmentHero.astro`, canvas `.hero-canvas`), burst digerakkan pinned
  timeline lewat `window.__heroParticles.burst`; desktop-only ≥768px, inert di
  reduce/mobile.
  Catatan: `y` (scroll) vs `yPercent` (idle) komposibel di GSAP. `gsap` masuk dependencies
  (disetujui); `three` sudah ada. Under reduce semuanya inert →
  `verify.mjs`/`responsive-audit.mjs` tetap bersih.
- Reference assets dikelompokkan per halaman di `assets/` (`assets home page/`,
  `assets recruitment page/`, `button/`); `assets/` di-`.vercelignore`.
- **Konvensi tambahan** (detail di HANDOVER §16):
  - Carousel/rail: ←/→ aktif saat section-nya di **tengah viewport** (aturan
    shared; cuma satu carousel yang pegang). Berlaku Projects, Snippets,
    `DomainRail` (home Domains + recruitment WhoShouldJoin).
  - Button: hover = **swap warna** (dark↔violet, white→violet).
  - Detail page: gradient **full-bleed** (`<main>` 100% + inner max-1440).
  - Jangan pakai lebar fixed-px yang bisa overflow; tes 320–3840px.
  - Kalau `verify.mjs` full OOM-kill Chromium (mesin RAM kecil) → verifikasi
    per-section pakai skrip Playwright ringan.
- Open TODO: Nasalization webfont, real project data, tanggal recruitment,
  halaman **About Us / Hall of Frames / Partners / Contact**.

## Mentor revision — 23 September 2026

The user approved changes that supersede the older PNG in these areas: bounded
HoDS rail (3 cards >1200px / 2 at 761–1200px / 1 ≤760px), viewport-aware heroes,
Available Roles preview-card grid, brighter navbar text and right-aligned legal
links. Role detail Back targets `#available-roles`; recruitment HoDS Back still
returns to `#who-should-join` with the matching label. Role images must be clean
artwork, generated from `public/images/hods/card-*.webp`, not the flattened role
reference exports. See the dated section in `docs/assets.md` for asset provenance
and revised geometry. `scripts/generate-backgrounds.mjs` re-encodes
`assets/background/hd` to lossy WebP q88 and asserts MAE < 5; do not claim these
~1.6K sources are native 4K. Run `scripts/verify-feedback.mjs` against the preview for click/drag/tap,
back-navigation, rail geometry and DPR screenshots in addition to normal audits.
