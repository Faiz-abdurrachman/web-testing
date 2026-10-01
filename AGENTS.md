# AGENTS.md — instructions for AI agents

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
- Verify both are in sync: `git fetch production -q && git rev-parse --short main
origin/main production/main` (all three should match).
- Git creds live in the `store` helper (`~/.git-credentials`) — no token needed in
  commands. Never print the token.
- Production was behind testing before this was set up; keep it in sync on every
  feature push.

## Non-negotiable rules

Full protocol: **`docs/pixel-precision-sop.md`**. The rules below are the law.

1. **The reference PNG node (exported from Figma) is the source of truth.**
   Figma CSS exports, MCP gradient strings and `effects` payloads are only hints
   and are frequently lossy. When they disagree, match the exported PNG.
2. **Start from the exported node, not the CSS.** For every section: get the
   Figma node (MCP) → export the node PNG (1× + 2×) and the individual text /
   component nodes via `figma_download_figma_images` → measure with `sharp`.
3. **Bundle the exact font Figma uses** (check licence; OFL → vendor the woff2
   into `public/fonts/` + `@font-face`). Declare the real weight to avoid faux
   bold. Never swap a page's font globally mid-migration — unrevised pages keep
   the old token. Nasalization is **not** bundleable (desktop licence).
4. **Use image-fill artwork verbatim.** If a node has an `imageRef`, download the
   raw image and bake it as-is (`fit: cover` mirroring the Figma FILL crop) — do
   not reconstruct it from layers. Reconstruction was ~24 MAE vs the hero node;
   the raw fill is ~2.7.
5. **All UI is real HTML/CSS.** Images are only artwork/photos. Never flatten a
   screenshot (text, buttons, borders, cards, gradient text) into the UI.
   Text gradients are applied **per line** (`background-clip: text`).
6. **Measure, don't guess.** Extract values from the reference PNG with `sharp`
   (bbox, per-region MAE) and hardcode the measured numbers. "Ink" positions must
   match the reference to **±1px**. Do not eyeball. If a region's diff is high,
   isolate whether it is font, gradient or artwork before "fixing" the CSS.
7. **Keep geometry exact.** Existing values are asserted in `verify.mjs`
   (`assert.deepEqual`). If a design change is intentional, update the assertion
   and the reference PNG path in the same commit.
8. **Always provide a `prefers-reduced-motion` fallback** for any animation; the
   reduced-motion render must remain pixel-exact (all audits run in `reduce`).
9. **Never break the bundle budget.** Runtime deps are `astro` + `gsap` (approved)
   and `three`. Do not add other UI libraries without asking; lazy-import heavy
   code (the hero Three.js layer is a dynamic `import()`).
10. **Commit per feature**, push to `main`. `origin` has **two push URLs**
    (testing + production) — see "Git & deploy". Follow existing message style
    (`feat:`, `fix:`, `docs:`, `chore:`). Confirm with the user before pushing.
11. **Update the docs with the code**: `docs/assets.md` (provenance + node ids),
    `docs/ai-handoff.md` (state) and `AGENTS.md` (this file) whenever a section
    or rule changes.

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
src/components/Sound.astro  floating mute orb + delegated data-sfx wiring
src/data/domains.ts      6 HoDS cards (title/desc/tint/chips)
src/data/hods.ts         6 detail categories → 22 tabs (LEARNING/…/OUTPUT)
src/data/projects.ts     4 placeholder projects (swap for real data)
src/data/partners.ts     Partners categories + why-cards (logos placeholder)
src/pages/index.astro    homepage composition
src/pages/about.astro    About Us composition (sections 1–4, OLD Figma file)
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
scripts/perf-audit.mjs   scroll-jank + long-task report per section
scripts/seo-audit.mjs    validates title/meta/OG/canonical/sitemap in dist/
src/pages/robots.txt.ts  robots.txt endpoint (uses Astro.site)
public/og/og-default.jpg share card (served)
public/                  served assets (fonts, images)
assets/<page>/           raw PNGs read by verify/generate scripts (NOT served; unused ones archived outside repo)
docs/assets.md           provenance per section (keep updated)
docs/pixel-precision-sop.md  strict pixel-accuracy protocol (read before any UI)
docs/sound-sop.md        sound system SOP (procedural Web Audio SFX + ambient)
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

## Current checkpoint

- **HEAD (1 Oct 2026, `c55c5e5` + docs; `main` lokal belum di-push).**
  Situs pakai Astro **`<ClientRouter />`** (navigasi klien + `AudioContext`
  persist; semua komponen re-init `astro:page-load` + cleanup
  `astro:before-swap` — `docs/sound-sop.md` §9).
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
- **Next plan (prioritas).** Konten asli (`projects.ts`, tanggal recruitment,
  logo partner, member/project/milestone HoF); revisi font & spacing homepage
  ke section lain (Philosophy → What We Do → HoDS → Our Project → CTA, pakai
  `--font-display` + grid 8px); webfont Nasalization. Detail:
  `docs/ai-handoff.md` §"Next plan".
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
