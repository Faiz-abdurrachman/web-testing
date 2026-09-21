# AGENTS.md — instructions for AI agents

Project: **Data Sorcerers** — a static Astro landing site + 6 domain-detail
pages. Goal: **pixel-accurate to Figma/PNG** with lightweight HTML/CSS.

Human-facing docs: `HANDOVER.md` (full context) and `docs/assets.md`
(per-section provenance + Figma nodes). Read those for "why"; this file is the
operating manual. A copy-paste starter for new agents lives in
`docs/kickoff-prompt.md`.

## Commands

```sh
npm ci                    # install (Node 22.x)
npm run dev               # dev server → http://localhost:4321
npm run build             # astro check && astro build (must stay 0 errors)
npm run format            # prettier --write .
npm run format:check      # must pass before commit
node scripts/verify.mjs   # visual verification (dev server must be running)
```

`scripts/verify.mjs` uses Chromium at `/usr/bin/chromium` (override with
`CHROMIUM_PATH`) and `PREVIEW_URL` (default `http://localhost:4321`). It exits
non-zero on any failed assertion.

## Non-negotiable rules

1. **The reference PNG is the source of truth.** Figma CSS exports are only
   hints. When they disagree, match the PNG.
2. **All UI is real HTML/CSS.** Images are only artwork/photos. Never flatten a
   screenshot (text, buttons, borders, cards, gradient text) into the UI.
3. **Measure, don't guess.** Extract values from the reference PNG with `sharp`
   (bbox, pixel diffs) and hardcode the measured numbers. Do not eyeball.
4. **Keep geometry exact.** Existing values are asserted in `verify.mjs`
   (`assert.deepEqual`). If a design change is intentional, update the assertion.
5. **Always provide a `prefers-reduced-motion` fallback** for any animation.
6. **Never break the bundle budget.** Runtime deps are intentionally just
   `astro`. Do not add UI libraries without asking; lazy-import heavy code.
7. **Commit per feature**, push to `main` (Vercel auto-deploys). Follow existing
   message style (`feat:`, `fix:`, `docs:`, `chore:`).

## File map

```
src/components/*.astro   one section per file; scoped CSS inside
src/data/domains.ts      6 HoDS cards (title/desc/tint/chips)
src/data/hods.ts         6 detail categories → 22 tabs (LEARNING/…/OUTPUT)
src/data/projects.ts     4 placeholder projects (swap for real data)
src/pages/index.astro    homepage composition
src/pages/hods/[id].astro detail route (getStaticPaths over hods.ts)
src/styles/global.css    @font-face, tokens, reset, cursor-glow
scripts/verify.mjs       visual + geometry + responsive verification
public/                  served assets (fonts, images)
assets/                  raw Figma PNG references (NOT served; large)
docs/assets.md           provenance per section (keep updated)
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
  add it to that list.
- The report writes `artifacts/verification.json` plus `*-diff.png` /
  `*-overlay.png`. There is **no MAE threshold assertion** — geometry, responsive
  overflow, clipping, interactions, and `browserErrors` are what fail.

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

## Fonts

- Manrope is bundled (`public/fonts/*.ttf`, OFL).
- **Nasalization is NOT bundled** (desktop license blocks web embedding). Headings
  fall back to sans-serif off the dev machine. A licensed webfont must be added by
  the humans (see `HANDOVER.md` §11). Do not try to work around the license.

## Current checkpoint

- `main` HEAD is the state **before** the motion experiment. The GSAP + Three.js
  motion commit (`5feea0d`) was reverted (`f925e1d`). Card 3D (project carousel)
  predates that and must stay.
- If asked to resume motion: it is legitimate to `git cherry-pick 5feea0d`, but
  re-implement with `gsap.matchMedia` + reduced-motion and re-verify.
- Open TODO: Nasalization webfont, real project data, missing pages (About,
  Recruitment, Hall of Frames, Partners, Contact).
