# Asset provenance

> Note: raw `assets/` exports that no script reads were moved out of the repo to
> `/home/faiz/ds/ds5opencode-assets-archive/` (see its `MOVE-MANIFEST*.md`) to
> keep the working tree small. Only the PNGs read by `scripts/verify.mjs` /
> `scripts/generate-*.mjs` remain in `assets/`. Paths below still name the
> original locations; move a file back from the archive if you need it.

## Performance pass (25 September 2026)

The served artwork is now **lossy WebP** at q82 (content photos), q85 (HoDS
cards) and q88 (full-bleed backgrounds + role cards). This supersedes the
earlier "lossless" notes below: lossless photo WebP was 3–10× larger at no
visible gain. Measured MAE stays under 2/255 on the backgrounds.

- `npm run assets:optimize` (`scripts/optimize-images.mjs`) re-encodes the heavy
  served art under `public/images/{recruitment,footer,what-you-will-do,philosophy,projects,hods}`.
  It backs the pristine originals up to `assets/image-src/` (git-ignored) and
  always encodes from there, so re-running never compounds loss; a file that
  would grow is left as its original. `philosophy/glow.webp` is downscaled to
  512px — a soft 980px glow, so the resize is invisible.
- `scripts/generate-backgrounds.mjs` writes the full-bleed backgrounds and role
  cards at q88 (from `assets/background/hd/*.png` and the pristine cards) and
  asserts MAE < 5 instead of bit-identical pixels.
- Manrope is served as **WOFF2** first (`public/fonts/manrope-*.woff2`, ~30KB vs
  ~95KB TTF), with the TTF kept as a fallback and preloaded as woff2.
- The hero clip is fetched after `requestIdleCallback` (or 300ms) and skipped
  under `saveData`/2G, so the static art is the first paint.
- Result: `dist` 56MB → 13MB; initial transfer `/` 2.37 → 1.72MB and
  `/recruitment` 3.37 → 0.59MB (full scroll 3.60/5.82 → 1.87/1.14MB).

## Visual reference

- Figma file: https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=755-15215
- Main reference: `assets/assets home page/hero section/Hero Section.png` (5760 × 3612).
- Frame: 1440 × 903; horizontal inset: 80; navbar height: 106.8.
- Heading: Nasalization Regular, 80 / 98; two explicit lines.
- Body: Manrope Regular, 16 / 24; width 619; letter spacing -0.176.
- Copy gap: 24; copy-to-actions gap: 96; button gap: 24.

The screenshot is the final visual authority when exported CSS differs.
The standalone hero reference does not include the homepage's bottom fade;
that transition belongs to the later full-page integration.

### Hero motion layer (GSAP + Three.js)

The homepage motion system runs from `src/components/Motion.astro` →
`src/scripts/motion.ts` (GSAP + ScrollTrigger) plus a dynamically imported
Three.js particle canvas in `Hero.astro`:

- One orchestrated page-load moment, not scattered effects. An earlier pass had
  an ambient cursor spotlight (`.hero-aura`) and a violet ember canvas
  (`.hero-embers`); both were removed as distracting decoration after review
  against the frontend-design guidance to spend boldness in one place.
- Entrance (CSS only, gated behind `@media (prefers-reduced-motion: no-preference)`):
  the artwork blurs/zooms in, a dark `.hero-veil` lifts, one quiet `.hero-sweep`
  light streak crosses, the two `h1` lines rise out of a blur, then the paragraph
  and actions fade up.
- `.artwork-entrance` carries that CSS blur/zoom on its own wrapper; the GSAP
  targets (`.artwork-stack`, `.art-figure`) sit below it so the keyframe's
  `fill: both` end state can never override GSAP's inline transform.
- Pinned scroll sequence (desktop ≥768px): a scrubbed timeline on `.hero`
  (`start: top top`, `end: +=110%`, `scrub: 1`, `pin: true`). Over the sequence
  `.artwork-stack` zooms `scale 1 → 1.35` while drifting `y: -110`, `.art-figure`
  rises `y: +90` (nearer layer), and `.hero-content` lifts `y: -200` with
  `autoAlpha: 0` / `scale: 0.94`. A `.hero-flare` light bar sweeps left→right
  (`xPercent -160 → 520`, `skewX: -14`). Measured: at 50% scroll the stack is at
  `scale 1.35`/`y -110`, copy opacity `0`, flare peaked — the hero stays pinned
  for the full 993px before unpinning. Below 768px the pin is dropped for a
  light scrub (`y/scale` only).
- Character life: `.art-figure` gets its own entrance (rises `yPercent 7 → 0` +
  fade, delayed after the plate) then a never-ending idle loop — bob
  `yPercent 0 → 1.3` (2.6s), weight-shift `rotation 0 → 0.9°` (3.4s, pivot
  `60% 88%` at the feet) and breathing `scale 1 → 1.015` (1.9s). The pointer adds
  `rotationX/Y ±5°`. These compose with the scroll `y` because GSAP keeps `y`
  (px) vs `yPercent` and `rotation` (Z) vs `rotationX/Y` as separate components.
- Particle burst: the scrubbed timeline animates a `{ value }` proxy that writes
  `window.__heroParticles.burst`, which the Three.js tick reads to accelerate
  drift, enlarge the points (`size 0.14 → 0.30`), spin the field and dolly the
  camera (`z 9 → 4.5`). Measured canvas contribution jumped from `MAE 0.05` (old
  90-point layer, effectively invisible) to `~1.35` at mid-sequence.
- Pointer parallax on `.artwork-stack` (`±1.5%`) that requires a `pointer: fine`
  overscan: the layer is scaled `1.04` under `(prefers-reduced-motion:
no-preference)` so the ~2% edge slack per side absorbs the travel and the
  screen edge never shows. Under reduced motion nothing is scaled, so the hero
  still matches its reference frame. Plus `.domain-card` / `.pillar` 3D tilt
  (`rotationX/Y`), and magnetic `.button` translate.
- Everything is wrapped in
  `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`, so requesting
  reduced motion reverts every tween/ScrollTrigger and runs the returned cleanup
  (event listeners removed). The Three.js layer is skipped under
  reduced motion and is `import()`-ed so it never blocks the initial bundle.
- Reduced-motion contract: under `verify.mjs`/`responsive-audit.mjs` (both use
  `reducedMotion: 'reduce'`) nothing animates, so geometry/diff stay clean and
  no new `setNavbarHidden` entries are needed.

### Hero layered scene (Option B, production pack)

The hero art is no longer one flattened image. It is split into two full-frame
1583 × 993 layers so the sorcerer can parallax independently of the plate:

- Source pack: `assets/background/hero/data-sorcerers-hero-production-pack/`
  (audited; not served). Only `background/background_clean.png` and
  `character/sorcerer_primary.png` are used. The pack's FX layers are full-frame
  images that over-blow under `screen` blending, so none are shipped; rune/staff/
  crystal exports are baked into the plate and unused.
- Generator: `node scripts/generate-hero-layers.mjs` writes
  `public/images/hero/background.webp` (clean plate, lossy q86) and
  `public/images/hero/figure.webp` (lossless cutout on a transparent plate with a
  mirrored 0.32-opacity reflection). Both are exactly 1583 × 993.
- Placement was measured from the reference, not eyeballed: character height
  **355 px** of 993 (35.7%), feet at **86%** height, centred at **60.5%** width
  → trimmed cutout `218 × 355` at `left = 849, top = 499`. Asserted in the
  generator.
- Both layers share `object-fit: cover` inside `.artwork-stack`, so the cutout
  stays locked to the plate at every viewport (verified at 390, 1440 and 1920 px
  — identical `getBoundingClientRect`). Parallax moves `.art-bg` (+46 px) and
  `.art-figure` (+28 px) at different rates for depth; the entrance
  blur/zoom now targets `.artwork-stack` so both layers stay together.
- **Fidelity trade-off**: `sorcerer_primary.png` is a reconstruction, not a
  pixel-match extraction of the reference figure (template RMSE ≈ 104 against
  the flattened master). The hero therefore reads as the same scene with a
  re-rendered sorcerer. The previous single flattened art is retired
  (`public/images/backgrounds/hero.webp` removed; `generate-backgrounds.mjs` no
  longer emits it).
- **Short viewports (height ≤ 560px, e.g. phone landscape)**: `min-height:
100svh` plus the mobile paddings made `.hero` taller than the viewport, so
  `object-fit: cover` cropped the bottom of the figure (feet/reflection lost).
  A `@media (max-height: 560px)` block at the end of `Hero.astro` tightens the
  paddings/gaps and font sizes (`clamp(..., Nsvh, ...)`) and anchors the art with
  `object-position: 61% bottom` so the character stays in frame. The 560px
  threshold leaves every portrait phone (shortest is 568px) and the 1440 × 903
  desktop reference untouched. Verified: 568×320, 600×343, 540×300, 480×320,
  900×400 and 1280×500 keep the hero within the viewport with the full figure;
  390×844, 360×640, 320×568 and 1440×903 are byte-identical. The 480×320 case is
  322px vs a 320px viewport (2px overflow) but the feet remain visible.
- **Animated video layer (`public/images/hero/hero-bg.webm` + `hero-bg.mp4`,
  1582 × 992, 5 s / 120 frames, 24 fps)**: a full-scene clip (nebula, planet,
  water and the sorcerer) that fades in over the static stack at `≥601 px`
  only; `≤600 px` keeps the static `background.webp` + `figure.webp`. Its
  character sits at **~62–78%** of the source width (measured off an ffmpeg
  10×10 grid — `figure.webp`'s cutout is at 53.6–67.3%). With the default
  `object-position: 50% 50%` and `object-fit: cover`, portrait widths between
  601 and ~730px cropped the arm/staff against the right edge. `.art-video` now
  sets `object-position: 80% center`, which shifts the clip's character to
  ~60–64% screen — aligned with the static figure and fully in frame. The rule
  is a no-op wherever there is no horizontal crop (desktop), and the
  `max-height: 560px` / `min-width: 1921px` `object-position` overrides still
  win for their layers. Verified in headed-reduced Chromium at 601×900,
  675×900, 733×900 and 768×1024.

## Navbar

- Figma node: `755:15219` (component set `530:13894`). The `assets/assets home page/navbar/`
  tab exports and `assets/assets home page/hero section/Navbar.png` are all 5760 × 428 (the
  1440 × 107 navbar at 4×).
- Frame: full-width, `padding 24px 80px`, `space-between`. The logo is
  54 × 58.8; the menu group uses a 90px gap, the six tabs an 18px gap, and each
  tab `padding 8px 14px`. The white CTA is Manrope SemiBold 18.
- The header is `position: fixed`. Its inner content is locked to a
  `max-width: 1440px` container and centered, so on screens wider than the
  Figma frame the logo and CTA stay on the 1440 grid (brand x = 80 at 1440,
  320 at 1920, 640 at 2560) instead of stretching to the viewport edges.
- At the top the bar keeps the reference's soft `backdrop-filter: blur(8px)
saturate(140%)`. After an 8px scroll it keeps a **blur-only** treatment
  (`blur(28px) saturate(180%) brightness(1.07)`) feathered by a mask — no
  background panel and no hairline border, so it never reads as a box. The mask
  keeps the blur visible across most of the bar (`#000 65%` → transparent). This
  is an interaction addition; the hero comparison is unaffected geometrically.
  The production build keeps **both** `backdrop-filter` and
  `-webkit-backdrop-filter` (esbuild `cssMinify` in `astro.config.mjs`); the
  default Lightning CSS pass dropped the unprefixed one, which removed the blur
  in Firefox on the deployed site.
- Below 1050px the desktop menu is replaced by a full-screen `<details>` menu: a
  borderless blurred overlay with a soft edge, JS-animated open/close, a
  hamburger that morphs into an X, body scroll lock and a reduced-motion
  fallback. Nav links get a rounded hover pill on both menus.

## Images

- Hero: the homepage hero now renders the layered production-pack scene (see
  "Hero layered scene" above). The earlier flattened art
  (`assets/background/hd/hero.png` ← `Gambar Hero Section.png`) is still the
  source for the OG share card via `scripts/generate-og.mjs`; it is not used by
  the homepage hero anymore. Matching features against the PNG
  reference identified a slightly zoomed fill: source crop approximately
  `(22.69, 0, 5725.3, 3576.0)` in the 5736 × 3600 source. This is important:
  simply stretching the full supplied background shifts the figure and horizon.
- Logo: original Figma image fill exported from node
  `I755:15219;530:13497`. `logo-source.png` retains the source; `logo.png`
  applies the crop specified by Figma. No logo was redrawn.
- Text, navigation, and buttons are HTML/CSS, never flattened reference images.

## Fonts

- Manrope 400, 500, 600, 700: Google Fonts, local TTF files.
  License: `public/fonts/Manrope-OFL.txt`.
- Nasalization Regular: Typodermic Fonts (Ray Larabie). The free dafont
  download (https://www.dafont.com/nasalization.font) is a **desktop** license
  and explicitly excludes serving or embedding the font in a website. The
  desktop font was installed on the development machine for local preview only
  and is not in this repo.

  Licensed webfonts are available from Typodermic's resellers:
  - Adobe Fonts — https://fonts.adobe.com/fonts/nasalization — included with a
    Creative Cloud plan and cleared for website publishing; add it to a web
    project and link the generated CSS (no self-hosting).
  - MyFonts — https://www.myfonts.com/collections/nasalization-font-typodermic/ —
    annual, single-domain webfont license for self-hosting with `@font-face`.
  - Fontspring — https://www.fontspring.com/fonts/typodermic/nasalization
  - Foundry page — https://typodermicfonts.com/nasalization/

To self-host, place the licensed `.woff2` in `public/fonts/` and add it to the
Nasalization `@font-face` in `src/styles/global.css`, keeping the `local()`
lines as a fallback. For Adobe Fonts, add the project `<link>` in
`BaseLayout.astro`. Until then, devices without the local font use sans-serif
and do not match the heading reference.

## Our Philosophy

- Figma node: `755:15281` in the same file.
- Reference: `assets/assets home page/ourphilosophy/Philosophy Section(1).png`, 5760 × 3348.
- Frame: 1440 × 837; starts at homepage y=903, immediately after the hero.
- Label: x=855, y=150, 93 × 26. The supplied spelling “Our Philosphy” is kept.
- Heading: x=855, y=190, 471 × 204; Nasalization Regular 56/68; three lines.
- Principles: x=855, y=468, 471 × 248; column gap 92, row gap 30.
- Principle names: Manrope Bold 18/27; descriptions: Manrope Regular 14/21.
- Illustration: supplied `Mask group.png`, optimized to responsive WebP.
  Its export includes blur overflow: the displayed bounds are x=0, y=12,
  861 × 770, while the visible illustration begins at y=134.
- Icons: the five separate supplied PNGs, encoded as lossless WebP and kept
  at their Figma display sizes (63 × 64 or 59 × 60).
- Bottom-right glow: supplied `Ellipse 4.png`, lossless WebP. Its exported
  bounds include 350px of blur overflow on each side of the 280px ellipse.
- Below desktop width, the content adapts; mobile places the illustration
  beneath the text. No mobile Figma reference was supplied.

Desktop comparison on the development machine verified the section, heading,
and principles coordinates exactly. The image comparison still contains minor
font rasterization and image resampling differences, so this is not a claim
of a zero-pixel-difference rendering. The hero geometry and its comparison
score were unchanged when this section was added.

## What We Do

- Figma node: `763:16215` in the same file.
- Reference: `assets/assets home page/what we do/What We Do Section.png`, 5760 × 3376.
- Frame: 1440 × 844, starts at homepage y=1740.
- Cards: first at (160,80), 311 × 254; second at (971,80), 309 × 254;
  third at (160,510), 309 × 254; fourth at (970,510), 310 × 254.
- Central heading group: y=334, with a 26px label, 14px gap, and 136px heading.
  Heading typography: Nasalization Regular 56/68.
- Card titles: Nasalization Regular 24/36; numbers and descriptions:
  Manrope Regular 16/24, letter spacing -0.176px.
- Background is **pure CSS, no image assets**: a subtle starfield (repeating
  radial-gradient tile) on `.what-we-do`, plus the purple glows — upper-right and
  center on `.what-we-do::before`. Colour values (`#6C3BFF` / `#9B7BFF`) and
  positions were measured from the reference PNG. The former star/glow
  background exports (`stars-*.webp`, `center-glow.webp`, `corner-glow.svg`)
  were removed.
- The **card glow is unchanged**: still the supplied SVG export
  `public/images/what-we-do/card-glow.svg`, positioned by `.card-glow`. Only the
  background was converted to CSS; card markup, borders, typography and the glow
  image are as before.
- **Living sky (outer-space drift)**: the base starfield + glow stay
  PNG-matched; two extra star layers then fly through space and the glow
  breathes. All of it is compositor-only — `transform`/`opacity`, never
  `background-position`. Each star layer slides **exactly one background tile**
  per loop (`440×360px` at `12s`, `520×400px` at `7s`) with `linear` timing, so
  the wrap is seamless because the pattern is periodic — no snap, no twinkle
  flicker. Each layer's `inset` (`-460px` / `-540px`) is larger than its travel,
  so the moving box always covers the section and no empty edge can show. The mid
  layer (`.pillars-layout::before`) is left at `opacity: 0` to keep only two
  drifting layers + the glow. `will-change: transform` is set on the moving
  layers. An `IntersectionObserver` in `motion.ts` toggles `is-idle` on
  `.what-we-do` so all animations `animation-play-state: paused` while the
  section is off-screen. The old per-frame `--wwd-px/--wwd-py` →
  `background-position` pointer parallax was removed and is not coming back.
- The whole sky lives inside `@media (prefers-reduced-motion: no-preference)`
  and every layer defaults to `opacity: 0`, so under reduced motion the section
  is still pixel-identical to the reference PNG (verification runs with
  `reducedMotion: 'reduce'`).
- **Card hover** (`.pillar:hover`, `@media (hover: hover)`): a violet spotlight
  follows the cursor (`.pillar::before` at `--mx/--my`, set by the existing 3D
  tilt), the gold hairline brightens, the drop shadow lifts and `.card-glow`
  scales/brightens. Transitions are gated to
  `prefers-reduced-motion: no-preference`; reduced motion still shows the hover
  state instantly.
- Cards otherwise use the standard fade-up reveal (`reveal(whatWeDo, '.pillar',
…)`).
- Every animation that remains (card hover) lives inside
  `@media (prefers-reduced-motion: no-preference)`; under reduced motion the hover
  state is instant, so verification screenshots stay pixel-identical to the
  reference.
- Mobile places the heading first, then the four cards in reading order.
  The desktop composition uses CSS Grid with explicit reference dimensions.
- Visual verification checks exact card geometry at 1440px and checks for
  card/text overlap and clipping from 320px through 1920px.

## House of Data Sorcerers

- Figma node: `765:16731`; reference: `assets/assets home page/hods/House of Data Sorcerers Section.png`.
- Frame: 1440 × 826, at homepage y=2584. Header begins at y=80; cards at y=310.
- Six cards, each 394 × 436, with 40px gaps; first card x=80. The fourth
  card is intentionally partially visible at the viewport edge.
- All headings, descriptions, rotated topic chips, backgrounds, and borders
  use HTML/CSS. The six decorative glow SVGs are original Figma exports in
  `public/images/domains/`; full-card reference PNGs are never used as UI.
- Card titles: Manrope Bold 22/33. Descriptions: Manrope Regular 16/24.
  The spelling “ORC” follows the supplied design.
- Navigation: native horizontal overflow supports touch and trackpads, plus
  click-drag for mouse. The rail arrows sit at the **sides on desktop** and
  **below the cards on mobile/tablet (≤1050px)**; on desktop the side arrows
  overlay the rail's edge cards (the rail is full-bleed and the gap cannot fit a
  52px arrow). Cards link to their HoDS detail pages. Focused keyboard
  navigation supports Left/Right and Home/End, and the arrow keys also scroll
  the rail whenever its section is at the viewport centre (no focus needed).
- Mobile adapts card width and heading size; no mobile reference was supplied.
- Verification compares the section to its PNG, checks exact desktop card
  bounds and keyboard scrolling, and checks overflow at 320–1920px.
- Minor border, font rasterization, and blur differences remain; the comparison
  is evidence of visual alignment, not a zero-pixel-difference guarantee.

## Our Project

- Figma node: `765:16732`; supplied PNG: 5760 × 3668.
- Desktop frame: 1440 × 917, begins at homepage y=3410. Heading group
  starts at (80,80), heading at y=120; project display starts at y=270.
- Featured card: (445.5,270), 549 × 567. Side panels: 363 × 534,
  positioned at x=78.5 and 998.5, y=286.5.
- `public/images/projects/arutala-aksara.webp` is the original Figma image
  fill exported as lossless WebP; its crop and 80% opacity follow Figma.
  `side-left.svg` and `side-right.svg` are original decorative vector exports.
- The section heading, project name, supplied Lorem ipsum copy, category
  tags, central card and border are HTML/CSS. No full-section or full-card
  screenshot is used as the interface.
- The two empty side panels follow the reference; no additional projects,
  carousel controls or destination links were supplied.
- Mobile hides the decorative side panels and fits the featured project to
  available width. This is an adaptation, not a supplied mobile design.
- The section is presented as a **3D coverflow** with left / centre / right
  slots: the highlighted card stays on the Figma grid (549 × 567 at
  (445.5,270)) while the neighbours sit at the reference's side-panel
  positions (x ≈ 78.5 and 998.5), tilted with `rotateY` and blurred so only the
  active project is sharp. The carousel loops, so left and right cards are
  present from the first project. Switching rotates the cards between slots.
  Navigation covers arrows, dots, drag/swipe, and arrow keys; motion is disabled
  under `prefers-reduced-motion`. The arrows sit at the **sides on desktop**
  (>1050px) and **below the stage on mobile/tablet** (≤1050px); the side arrows
  never touch the active card. The arrow keys also work whenever the section
  is the one at the viewport centre, so no focus is needed. Each carousel only
  reacts when its own section holds the centre, which keeps them from fighting
  over the keys. Project data lives in `src/data/projects.ts` and currently
  holds four placeholders.
- Verification includes reference overlay/difference images, desktop geometry
  (heading + active card), text containment and page overflow checks from 320px
  to 1920px.

## Recruitment CTA

- Figma node: `765:16766`; supplied PNG: 5760 × 2308.
- Desktop frame: 1440 × 577 at homepage y=4327. Panel: (80,80), 1280 × 417.
- Label y=153, heading y=193 (56/68), description y=281 (586 × 48),
  buttons y=373 (205px and 179px wide, with a 26px gap).
- Original decorative glow exported to `public/images/recruitment/glow.svg`.
  Its rotation and overflowing bounds follow Figma. Text, border and buttons
  are HTML/CSS; the shared Button component now supports a compact glass size.
- The PNG/Figma description takes precedence over the stale filename/CSS
  description in the supplied folder. The heading spelling is preserved.
- No button URLs were supplied. Buttons retain the preview's existing
  aria-disabled state. Mobile wraps the heading and stacks the two buttons.
- Visual validation compares the supplied PNG, checks exact desktop geometry
  and tests text containment and page overflow from 320px through 1920px.
  Glass effects and font rendering retain small differences from the PNG.

## Footer

- Figma node: `765:17071`; reference: `assets/assets home page/footer/Footer.png`, 5760 × 2224.
- Frame: 1440 × 556 at 1×; padding `80px 80px 28px`; column gap 60.
- Row 1 is `1280 × 324`. Brand column at x=80: brand lockup 206 wide
  (Nasalization Regular 32, gradient `linear-gradient(270deg, #fff, #EDE8FF)`;
  Manrope Regular 16/24 tagline), a 17.5/28.44 `#CBC5FF` three-line statement,
  then two 48 × 48 social buttons (0.75px `#CBC5FF` border, 24px icons).
  Navigation column at x=652.73 and Contact column at x=1096.33; each header is
  Manrope Bold 16/24, and each list uses a 16px gap.
- Row 2: 1px divider `rgb(203 197 255 / 30%)` at y=463.69, then the legal bar at
  y=484.69 — copyright at x=80 (320 wide) and Terms/Privacy/Cookies at x=640.72
  (218 wide), Manrope Regular 16/24.
- The background is the supplied HD Figma image (`assets/assets home page/footer/Gambar Footer.png`,
  5760 × 2224) encoded as **lossless** WebP at 1440 and 2880 under
  `public/images/footer/`, so the footer art is not lossy-compressed. The
  supplied artwork sits 2px (4px at 2×) right of the fill baked into
  `Footer.png`; that sub-pixel-derived offset is baked into the export so the
  HD art still aligns with the reference. `instagram.svg` and `linkedin.svg` are the Figma social vectors.
  Text, borders, divider, and social frames are HTML/CSS; no flattened
  screenshot is used as the interface.
- Social, Navigation, Terms, Privacy, and Cookies destinations were not
  supplied, so they keep the preview's unavailable state. Below desktop width
  the columns wrap and then stack; no mobile Figma reference was supplied.
- Visual validation compares the supplied PNG, asserts the 1440 × 556 frame,
  column x positions (80 / 652.73 / 1096.33), the divider and legal bar y
  positions, and checks text containment from 320px through 1920px. Anti-aliased
  text over the bright lower background keeps a higher difference score than
  the flat sections; alignment is exact (mask cross-correlation offset 0).
- The Recruitment page reuses this same `Footer.astro` component (its
  `footer.txt` points at the same Figma node `765:17071` and its `Footer.png`
  is the same 1440 × 556 reference). It renders at homepage y=6706 with the
  identical ~2.67/255 difference.

## Recruitment page — Hero

Route: `/recruitment`. The page is complete (hero → Who Should Join → What You
Will Do → Available Roles → Selection Timeline → FAQ → Snippets → CTA → Footer);
this section documents the hero.

- Figma node: `770:15523`. The node is named "About Us Hero Section" in the
  file, but its content (and the supplied `hero.txt`) is the Recruitment page
  hero. Reference: `assets/assets recruitment page/hero section/About Us Hero
Section.png`, 4320 × 2598 (1440 × 866 at 3×). The reference PNG **includes the
  navbar**, so the navbar stays visible when it is screenshotted.
- Frame: 1440 × 866, `padding 0 80`, column, `justify-content: center`,
  `align-items: center`, `gap 63px`.
- Heading: "YOUR NEXT CHAPTER START HERE.", Nasalization Regular 400, 80 / 98,
  centered in a 900px box, two lines ("YOUR NEXT CHAPTER" then "START HERE.").
  Fill is `linear-gradient(180deg, #fff 0%, #707070 55%, #fff 100%)` with
  `background-clip: text`. Measured glyphs: line 1 `(273, 269, 891)`, line 2
  `(462, 368, 516)`.
- Description: "Join Data Sorcerers and turn your curiosity into capability,
  experiments, research, and real-world projects." Manrope Medium 500, 18 / 27,
  `#EDE8FF`, centered in a 900px box. Measured glyphs: `(277, 484, 884)` — a
  single line.
- Button: "Apply Now" (Figma `Secondary Buttom`, component set `97:442`,
  instance `770:15519`): 122 × 51, `border-radius: 200px`, `#1A1A1A`,
  `backdrop-filter: blur(6px)`, inset highlights, plus a clipped "liquid"
  highlight (`294.11 × 121.64` at `(-85.34, -27.45)`, `rgba(217,217,217,.1)`,
  `blur(4px)`). Implemented as `Button.astro` `variant="secondary"`, which hugs
  its label; the label is Manrope SemiBold 18 / 34.1. The rim is baked from the
  reference PNG rather than from the raw Figma shadows: a bright 2px diagonal
  ring (top-left and bottom-right) plus soft inset rims. Figma's
  `inset 0 0 40px rgba(242,242,242,.5)` rasterizes as a subtle rim, while its
  literal CSS translation washes the whole pill, so the PNG recipe is used
  instead (region difference ~8.6/255, close to the font-rasterization floor).
- Measured layout boxes at 1440: heading `(270, 247.5, 900 × 196)`, description
  `(270, 477.5, 900 × 27)`, button `(659.22, 567.5, 121.55 × 51)`.
- Background: `Gambar Hero About Us.png` (5756 × 3600), drawn full-width and
  top-aligned (`object-fit: cover; object-position: top`), so the lower ~35px is
  cropped. It is the decorative glow/arc layer with no text; the masked
  difference against the reference is ~1.2/255. The folder's `Background.png` is
  effectively black and is unused. Served as
  `public/images/recruitment/hero-1440.webp` and `hero-2880.webp` as
  **lossless** WebP: the artwork carries fine grain that lossy WebP removes,
  which visibly softens the glow (lossless restores the reference's
  high-frequency detail).
- Navbar: the shared `Navbar.astro` with `active="Recruitment"`. The active
  underline is the Figma 106px gradient
  `linear-gradient(163deg, #9b7bff, #ede8ff, #9b7bff)`; the Home underline keeps
  its original 49px so the homepage comparison is unchanged.
- Verification: `scripts/verify.mjs` asserts the section, heading, description,
  and button boxes exactly, checks the active nav link, diffs the section
  against the reference PNG (~2.0/255; the residual is font and glass
  rasterization), and checks horizontal overflow and clipped hero text from
  320px to 1920px.

## Recruitment page — Who Should Join

- Figma node: `770:15545`; reference
  `assets/assets recruitment page/who sould join section/Who Should Join
Section.png`, 5760 × 3156 (1440 × 789 at 4×).
- Frame: 1440 × 789, `padding 80`, column, `gap 74`. The header is centered and
  full-width; the card rail below is full-bleed.
- Heading: "Who Should Join?", Nasalization Regular 400, 56 / 68, centered in a
  1280px box, fill `linear-gradient(14.17deg, #707070 16.09%, #fff 91.78%)`
  (verified against the PNG: brighter at the top, greyer at the bottom).
- Copy: "We welcome passionate individuals across technical, creative, and
  operational domains." Manrope Medium 500, 18 / 27, `#fff`, centered, 1280px.
- Card rail: the **same** cards as the homepage's House of Data Sorcerers section
  (`DomainCard` + `domains.ts`) — six 394 × 436 cards with a 40px gap, first at
  x=80, the fourth clipped at the viewport edge. The rail markup, arrows,
  keyboard/scroll behaviour and CSS were extracted into a shared
  `DomainRail.astro` used by both `Domains.astro` and `WhoShouldJoin.astro`, so
  the cards stay pixel-identical to the homepage. Arrows follow the shared
  placement (sides on desktop, below on mobile ≤1050px).
- Card links: the cards open the HoDS detail pages with a recruitment origin
  (`/hods/{id}?from=recruitment`), so that page's back link returns to
  `/recruitment#who-should-join` ("Back to Open Roles"); the homepage rail keeps
  plain `/hods/{id}` and "Back to HoDS". The detail pages are static, so the
  origin is applied on the client from the query (`HoDSDetail.astro`).
- Background: `Background.png` is the Figma frame fill (a near-black starfield,
  the same artwork as the What You Will Do fill). Exported lossless to
  `public/images/recruitment/who-should-join-background-{1440,2880}.webp` and
  painted with `background-size: cover`, centered. The card rail dominates the
  difference (~3.0/255), so the starfield only moves it slightly.
- Measured layout at 1440: section `1440 × 789` at homepage y=866; heading
  `(80, 80, 1280 × 68)`; copy `(80, 172, 1280 × 27)`; cards at x 80 / 514 / 948
  / 1382, y 273, 394 × 436.
- Verification: `scripts/verify.mjs` asserts the section, heading, copy and card
  boxes exactly, diffs against the reference (~3.0/255; the card art carries the
  same residual as the homepage, and this reference PNG's cards differ slightly
  from the homepage export), and checks overflow and text from 320px to 1920px.
- The remaining recruitment sections and the footer are documented below; the
  page reuses the shared `Footer.astro`.

## Recruitment page — Role detail

Linked from the "Available Roles" section. Route `/recruitment/roles/{id}`
(id = data, core, language, vision, product, growth); these are the recruitment
"Detail Role" pages, a different layout from the homepage's `/hods/{id}` tab
pages. (The Who Should Join cards open the homepage HoDS detail pages instead.)

- Figma nodes: `774:17392` (data), `733:15781` (core), `760:14975` (language),
  `760:15276` (vision), `760:15347` (product), `760:15439` (growth). Frame:
  1440 × 1280, `padding 80`, `gap 58`.
- References: `assets/assets recruitment page/who sould join section/detail
role/Detile Roles - …png` (5760 × 5120, i.e. 1440 × 1280 at 4×). Note the
  core reference is the `DATA INTELLIGENCE-1` export (the Figma core frame is
  misnamed "DATA INTELLIGENCE").
- Background: `linear-gradient(-9deg, rgb(108 59 255 / 50%) 0%, #050507 19%)`
  (violet at the bottom-right), matching the PNG. The gradient is full-bleed
  (`width: 100%` on the `<main>`, with the content in a centred
  `max-width: 1440px` inner wrapper) so it reaches the viewport edges on wide
  screens instead of stopping at 1440. The homepage HoDS detail pages
  (`HoDSDetail.astro`) use the same full-bleed treatment.
- Content per page: "Back to Open Roles" (links to `/recruitment#who-should-join`),
  the 1280 × 279 role card (art + 136deg gradient border + Nasalization 48
  title + chip row + deadline + "Apply Now"), ABOUT THIS ROLE, REQUIREMENT
  bullets, and a 347 × 134 CONTACT PERSON box. All six use
  `deadline: 20 Oktober 2026` and `contact: Zidan Amikul`.
- Card art: the frame fill is the `card detile role (HoDS)` component
  (Property 1=1..6), exported from
  `…/detail role/gambar detail role/Property 1=N.png` to
  `public/images/roles/role-{id}-{1280,2560}.webp` (lossless). This is a
  **different export** from the homepage's `images/hods/card-*.webp`, so the
  role pages do not reuse it. Icons: `images/hods/arrow.svg` (back),
  `images/roles/date.svg`, `images/roles/whatsapp.svg`.
- Layout: back link at y80 (y155.5 on the data page); card at y135 (data:
  210.5, language/vision/product/growth: 165). Data is the only frame that
  centers its content and groups the back link with the card (28px gap); core
  keeps the 28px gap but is top-aligned; the other four space the back link
  from the card by the outer 58px. The references agree, so the data is driven
  by `centered` / `tight` flags in `src/data/roles.ts`.
- The Apply Now pill (`Secondary Buttom` / `563:530`) is a new `Button`
  `variant="apply"`: 122 × 51, violet radial fill, 2px gradient ring.
- The pages are standalone (no navbar/footer), like the homepage's `/hods/[id]`
  pages.
- Verification: `scripts/verify.mjs` asserts the section, card, back link,
  apply button and contact box for all six pages, diffs each against its
  reference (1.7–2.4/255), checks overflow and text from 320px to 1920px, and
  separately checks the Who Should Join card `href`s and the context-aware HoDS
  back link.

## Recruitment page — What You Will Do

- Figma node: `770:16251`; reference
  `assets/assets recruitment page/what you will do/What You Will Do Section.png`,
  5760 × 3612 (1440 × 903 at 4×). The section sits at homepage y=1655.
- Frame: 1440 × 903, `padding 80 80 63` (the bottom is 63, not 80, so the
  section matches the reference height), column, centered, `gap 20`.
- Background: the supplied `Background.png` is the Figma frame fill (a
  near-black starfield; it matches the fill exported from Figma, MAD 0.11). It
  is exported lossless to `public/images/what-you-will-do/background-{1440,
2880}.webp` and painted with `background-size: cover` (Figma `scaleMode:
FILL`). Including it drops the section difference from ~1.83 to ~1.45/255.
- Heading: "What You Will Do", Nasalization Regular 400, 56 / 68, centered in a
  1280px box, gradient `linear-gradient(180deg, #fff 0%, #707070 78%)`.
- Copy: "Life inside the Data Sorcerers ecosystem", Manrope Medium 500, 18 / 27,
  `#fff`, centered.
- Body: a fixed 1312 × 625 collage at (64, 215) holding:
  - two tarot card artworks — `card-1` (356 × 430 at 983, 215) and `card-2`
    (295.39 × 361.78 at 129, 431), exported from the supplied PNGs to lossless
    WebP at 1×/2× under `public/images/what-you-will-do/`;
  - a decorative connector vector (`connector.svg`, 1312 × 531). Figma places it
    at y=96 in the Body and reports 529px; the SVG's own height is 531 and the
    reference PNG aligns it at y=95, so it sits at 64, 310 (lines and 7px nodes
    in `#6C3BFF`/white);
  - eight HTML/CSS label pills inside the 1125 × 409 "Content" frame (at 94, 130
    of the Body; absolute 158, 345), in a diagonal staircase at x 158 / 380 / 600
    / 821 and y 345 / 399 / 453 / 507 / 561 / 615 / 669 / 723. Each is 462 × 31
    (label 2 is 461 in Figma) with a
    `linear-gradient(134deg, #fff 0%, #6c3bff 4%, #6c3bff X%, transparent)`
    (X = 57 / 56 / – / – / 26 / 26 / 43 / 43%), a 6px gradient dot and Manrope
    Medium 18 / 27 text: LEARN WITH OTHERS, PRACTICE YOUR SKILLS, WORK ON
    EXPERIMENTS, CONTRIBUTE TO PROJECTS, PARTICIPATE IN RESEARCH, SHARE
    KNOWLEDGE, BUILD YOUR PORTOFOLIO, COLLABORATE ACROSS DISCIPLINES.
- Below 1320px the collage becomes a stacked column of the eight labels (cards
  and connector hidden) — an adaptation, since no mobile reference exists.
- Verification: `scripts/verify.mjs` asserts the section, heading, body, all
  eight labels, both cards and the connector exactly, diffs against the
  reference (~1.24/255; the residual is anti-aliasing on the connector lines and
  the label edges), and checks overflow and text from 320px to 1920px.

## Recruitment page — Available Roles

- Figma node: `661:1510`; reference
  `assets/assets recruitment page/available roles section/Available Roles
Section.png`, 5760 × 3640 (1440 × 910 at 4×). The section sits at homepage
  y=2558.
- Frame: 1440 × 910, `padding 80`, `gap 58`, `#050507`. The 1280 content is
  centred (`align-items: center` + `max-width: 1280px`), so it stays centered on
  viewports wider than 1440 instead of hugging the left gutter; at 1440 it is
  unchanged (x=80).
- Heading: "Available Roles", Nasalization Regular 400, 56 / 68, **left**
  aligned in a 1280px box at (80, 80), gradient
  `linear-gradient(180deg, #fff 0%, #707070 84%)`. The heading and copy were
  exported as `components/Available Roles.png` / `Text.png`.
- Copy: "Select a role to view full details, requirements, and apply.", Manrope
  Medium 500, 18 / 27, `#fff`, left, (80, 168, 1280 × 27).
- Role list: six rows, `1280 × 77`, `gap 23`, starting at y=253. Each row is
  `padding 18px 32px`, `border-radius 20px`, `rgba(255,255,255,.15)` fill, a 1px
  `linear-gradient(135deg, #ede8ff, #2e276c, #ede8ff)` border, a 6px gradient
  dot + role name (Manrope Regular 400, 26 / 39, `#fff`, gap 22) on the left and
  the Figma `vuesax/outline/arrow-right` icon (`images/recruitment/
arrow-right.svg`) on the right. Row names come from `domains.ts`.
- Each row links to the role detail page (`/recruitment/roles/{id}`) — this is
  where the previously unlinked role pages are used.
- Verification: `scripts/verify.mjs` asserts the section, heading, copy, list and
  all six rows exactly, checks the row `href`s, diffs against the reference
  (~2.8/255; the residual is the row text rasterization), and checks overflow and
  text from 320px to 1920px.

## Recruitment page — Selection Timeline

- Figma node: `661:1515`; reference
  `assets/assets recruitment page/selection timeline section/TIMELINE.png`,
  5760 × 3260 (1440 × 815 at 4×). The section sits at homepage y=3468.
- Frame: 1440 × 815, `padding 80`, `gap 58`, `#050507`. Like Available Roles, the
  1280 content is centred, so it stays centered on viewports wider than 1440
  (unchanged at 1440).
- Heading: "Selection Timeline", Nasalization Regular 400, 56 / 68, **left**,
  gradient `linear-gradient(180deg, #fff 0%, #707070 80%)`, (80, 80, 1280 × 68).
- Table, 1280 wide at x=80:
  - Header (80, 206, 1280 × 78): `rgba(108,59,255,.25)` fill, 1px
    `linear-gradient(135deg, #ede8ff, #2e276c, #ede8ff)` border,
    `border-radius 20px 20px 0 0`, `padding 18px 32px`; "Phase" (Manrope Bold
    700, 26 / 39) and a 568px "Date" column.
  - Body (80, 284, 1280 × 451): `rgba(255,255,255,.15)` fill, the same border
    and `border-radius 0 0 20px 20px`, `padding 18px 32px`, `gap 36px`. Six rows
    (phase Manrope Medium 500 26 / 39, left; 568px date column) separated by 1px
    rules (`linear-gradient(90deg, #9b7bff, transparent)`, 1248 wide).
  - Phases: OPEN RECRUITMENT, APPLICATION, FOUNDATION SCREENING, HOODS
    INTERVIEW, TRIAL / CHALLENGE, MEMBER.
  - The date cells hold the Figma placeholder text "Date" (the reference PNG
    shows the same); swap in the real dates when they are supplied. The section
    was cross-checked with OCR against the reference for the phase names.
- Verification: `scripts/verify.mjs` asserts the section, heading, header, body
  and row geometry exactly, diffs against the reference (~3.2/255; the residual
  is text rasterization), and checks overflow and text from 320px to 1920px.

## Recruitment page — FAQ

- Figma node: `661:1553`; reference
  `assets/assets recruitment page/faq section/Frame 2495.png`, 5760 × 3944
  (1440 × 986 at 4×). The section sits at homepage y=4283.
- Frame: 1440 × 986, `padding 80`, `gap 58`; the background is the supplied
  `Background.png` (the same near-black starfield as Who Should Join), exported
  lossless to `public/images/recruitment/faq-background-{1440,2880}.webp`.
- Heading: "FAQ" (Figma "faq" with uppercase case), Nasalization Regular 400,
  56 / 68, **left**, gradient `linear-gradient(180deg, #fff 0%, #707070 74%)`,
  (80, 80, 1280 × 68). The 1280 content is centred on wide viewports.
- List: 1280 at y=206, `gap 32`; six `<details>` accordion items, closed by
  default (matching the reference). Each item is `rgba(255,255,255,.15)`, a 1px
  `linear-gradient(135deg, #ede8ff, #2e276c, #ede8ff)` border, `border-radius
20px`, `padding 19px 32px`, with the question (Manrope Medium 500, 26 / 39,
  white) and a `vuesax/outline/arrow` chevron. The reference render shows it
  **pointing down** when the item is closed (the `arrow-right` path rotated 90°,
  shipped as `public/images/recruitment/chevron-down.svg`); it rotates 180° to
  point up when open. Items 1–4 are one line (77px); items 5–6 are two lines
  (116px).
- Answers come from the open (A) variants of the six FAQ components
  (component sets `830:4263`, `830:4362`, `830:4367`, `830:4372`, `830:4377`,
  `830:4382`): Manrope Medium 18 / 27, revealed below the question with a 42px
  gap. Answer 5 duplicates answer 1 in Figma and is kept as-is. The toggle is
  animated: the arrow transition is pure CSS (`rotate(180deg)` on
  `[open]`/`.is-open`), while a small inline script measures and transitions
  the answer panel height (320ms) so expansion never snaps. Both transitions
  are disabled under `prefers-reduced-motion` (instant toggle), and the
  `[open]` selector keeps the native `<details>` usable without JS.
- Verification: `scripts/verify.mjs` asserts the section, heading, list and all
  six item boxes exactly, diffs against the reference (~5.0/255; the six long
  questions dominate the rasterization residual), and checks overflow and text
  from 320px to 1920px.

## Recruitment page — Snippets

- Figma node: `706:2330`; reference
  `assets/assets recruitment page/snippets section/Frame 2502.png`, 5760 × 3600
  (1440 × 900 at 4×). The section sits at homepage y=5269.
- Frame: 1440 × 900, `padding 40px 80px`, `gap 58`, `#050507`.
- Heading: "Snippets of Life at data sorcerers", Nasalization Regular 400,
  56 / 68, **center**, gradient `linear-gradient(90deg, #fff, #ede8ff)`,
  (80, 40, 1280 × 68). The content is centred on wide viewports.
- Gallery ("galeryy ds", component `630:3687`), 1280 wide at y=166: a hero
  carousel (1280 × 556, `border-radius: 20px`) and a row of five 246 × 103
  thumbnails (space-between at x 80 / 338.5 / 597 / 855.5 / 1114), gap 35. The
  five DS variants use the same five photos with a different hero, so the hero
  is a 5-slide carousel: arrows (same style as the other rails; in the side
  gutter next to the hero on desktop >760px, below the gallery on mobile
  ≤760px, never over the hero or thumbnails), drag/swipe, clickable thumbnails
  and arrow keys (active whenever the section is the one at the viewport centre,
  like the homepage carousel). The track clones the ends so it loops without a
  jump; `prefers-reduced-motion` drops the transition.
- Layout is fluid: the gallery is capped at 1280px and the hero/thumbnails use
  `aspect-ratio` with a percentage thumbnail width, so the element sizes scale
  with the viewport (a container query unit drives the 35px hero→thumbnail gap)
  instead of overflowing. At 1440 it is exactly the reference.
- The Figma image fills do not reproduce the reference crop, so the displayed
  regions are extracted from the DS component renders (hero per variant, thumbs
  from DS 1) and exported to
  `public/images/recruitment/snippet-{hero-1..5,thumb-1..5}[-2x].webp`
  (lossless). The photos are artwork; the frames, radii, arrows and layout are
  HTML/CSS.
- Verification: `scripts/verify.mjs` asserts the section, heading, gallery, hero
  and all five thumb boxes exactly, diffs against the reference (initial slide,
  ~0.7/255), hides the new `.snippet-arrow` overlay, and checks overflow from
  320px to 1920px. (The Selection Timeline rules and its proportional date
  column were also switched to percentage widths so nothing overflows at
  768–1024px.)

## Recruitment page — CTA

- Figma nodes: section `839:4659`, panel `839:4660`; reference
  `assets/assets recruitment page/cta section/Frame 2393.png`, 5120 × 1508
  (1280 × 377 at 4×). The section sits at homepage y=6169 and is 1440 × 537.
- Section: `padding 80`, `#050507`. Panel: 1280 × 377 at (80, 80), `padding
73px 0 79px` (the reference wants the content higher than Figma's symmetric
  72px), `gap 44`, `rgba(98,80,255,.1)`, 1px
  `linear-gradient(135deg, #e0dcff, #2e276c, #e0dcff)` border,
  `border-radius 20px`, `overflow: hidden`. The panel is capped at `max-width:
1280px` and centred, so on viewports wider than 1440 it stays on the 1440 grid
  instead of stretching (and the glow keeps its Figma position relative to it).
- Heading: "READY TO BECOME A SORCERY?", Nasalization Regular 400, 56 / 68,
  center, gradient `linear-gradient(270deg, #fff, #ede8ff)`.
- Copy: "Join a community where your learning can become experimentation, your
  ideas can become projects, and your work can create real impact." Manrope
  Regular 400, 16 / 1.5, `letter-spacing -0.011em`, width 586, center.
- Button: "Join the Community" (`Button` `variant="primary"`), 205 × 51.
- Decorative glow: Figma `IMAGE-SVG` `839:4672`, 1000.33 × 271.5 at (269.83, 271) inside the panel. It reuses the homepage CTA's treatment
  (`public/images/recruitment/glow.svg`, rotated -2.23deg and oversized inside a
  1000.331 × 271.502 frame), which matches the reference far better than the raw
  Figma SVG/PNG export (browser blur rasterization differs).
- Note: `Frame 2393.png` is a **transparent** export (the panel fill is
  `rgba(98,80,255,.1)`); comparisons must composite it over `#050507`.
- Verification: `scripts/verify.mjs` asserts the section, panel, actions and
  glow boxes exactly (plus the heading/copy positions), diffs the panel against
  the reference (~5.1/255; font and glow rasterization remain),
  and checks overflow from 320px to 1920px.

## Buttons (shared)

`Button.astro` implements the Figma "Secondary Buttom" (`97:442`) and "CTA
Navbar" (`97:483`) component sets; the reference exports live in
`assets/button/button/`.

- `primary` — violet radial pill (Join the Community).
- `glass` — dark glass pill (Explore Our Project).
- `white` — white navbar pill (Join Community).
- `secondary` — dark glass pill that hugs its label (recruitment hero Apply Now).
- `apply` — violet pill that hugs its label (role detail Apply Now).

Hover comes from each set's state-2 variants: the dark pills turn violet, the
violet pills turn dark, and the white pill turns violet. The fill swaps
instantly (gradients do not interpolate) while the rim and text fade;
`prefers-reduced-motion` removes that transition. Default rendering is
unchanged, so the section comparisons are unaffected.

## Open Graph card

- The share card `public/og/og-default.jpg` (1200 × 630 JPEG) is generated by
  `scripts/generate-og.mjs` (`npm run assets:og`), not hand-made:
  - background: `assets/assets home page/hero section/Gambar Hero Section.png`,
    cover-cropped to 1200 × 630 over `#050507`;
  - a left→right plus bottom dark gradient (SVG) so the text side stays legible
    (the reference art is darker on the left, brighter to the right);
  - the logo (`public/images/logo.png`) at the top-left;
  - the supplied `SORCERY IN DATA MAGIC IN AI.png` headline at the lower left,
    which keeps the brand typography without embedding the licensed Nasalization
    font.
- The same script writes the favicons (`favicon.ico`, `favicon.png`,
  `apple-touch-icon.png`, `icon-192/512.png`) and `site.webmanifest` from the logo.
  The icon backgrounds are **transparent** (the logo is centred on an empty
  canvas, not composited on a dark fill).
- `BaseLayout` points every page's canonical, Open Graph and Twitter tags at this
  card; the canonical origin comes from `site` (`SITE_URL`) in `astro.config.mjs`.

## Mentor feedback revision — 23 September 2026

This revision intentionally supersedes the original PNG geometry for hero content,
HoDS rails, footer legal alignment and Available Roles. Existing artwork, brand
fonts and unrelated section geometry are retained.

- New supplied sources: `assets/background/hd/{hero,recruitment,footer,hitam bintang}.png`.
  Native sizes are 1583×993, 1586×992, 2019×779 and 1586×992 respectively.
  `scripts/generate-backgrounds.mjs` exports them at their original dimensions as
  lossless WebP under `public/images/backgrounds/` and asserts equality of decoded
  RGBA pixels. No enlargement or sharpen filter is applied. These sources are not
  native 4K/Retina backgrounds: wide/high-DPR displays still interpolate pixels.
  Above 1920px, hero artwork is capped at 1920px, bottom-aligned and feathered
  at the sides to avoid excessive enlargement and cropped figures.
  New HD artwork is served directly at native resolution (no misleading larger
  `srcset` descriptors). Hero, Recruitment, Footer and the three starfield sections
  use these assets. OG generation now uses the new hero source.
- Heroes cap their desktop minimum height at the viewport height and their original
  903/866px heights, without growing with viewport width. Content can grow when
  needed. Home mobile retains room for the figure; Recruitment mobile uses content
  plus padding. Recruitment heading is brighter and has a subtle background overlay.
- DomainRail now clips to a centred max-1280 content area: three full cards above
  1200px, two at 761–1200px, one at ≤760px. Gap is 40px (24px on mobile). Side
  arrows are outside the content on large desktop; below at ≤1200px. Pointer capture
  begins only after a 6px drag threshold; plain clicks keep normal anchor behavior.
  Reduced motion disables smooth arrow scrolling. Resize updates arrow availability.
- Role detail artwork was found to contain baked-in title/chips/deadline/buttons.
  All six served role images are now generated from the clean, artwork-only
  `public/images/hods/card-{id}.webp` fills at 1280/2560px. Text/buttons remain HTML.
  This supersedes the older advice that the role export must be used independently.
- Role back links now return to `/recruitment#available-roles`. HoDS back links
  preserve their origin; recruitment origin is labelled "Back to Who Should Join".
- Available Roles is a 3/2/1-column grid (desktop/tablet/mobile), with title, first
  sentence of the existing role description, three focus chips and View role link.
  It has no matching old PNG; verification checks its new geometry and containment
  rather than treating the obsolete row layout as a visual reference.
- Footer legal links align to the right. Navbar available links use `#ede8ff`,
  unavailable links `#b5aec9`, and active links white.
- `scripts/verify-feedback.mjs` covers actual clicks through all six HoDS cards
  from both origins, drag without accidental navigation, keyboard endpoints, role
  card/back navigation, rail clipping geometry, footer alignment, hero viewport
  bounds and screenshots at DPR 1/2. Output: `artifacts/feedback/`.

## Available Roles — card redesign (23 September 2026)

The mentor supplied new per-role card artwork that supersedes the earlier
Available Roles preview card. The design is adopted, but its baked-in Figma
typography is **not** used: the text is rebuilt in HTML/CSS with the site fonts.

- Sources: `assets/card baru/{data intelligence,core ai,language,vision,product,growth}.png`,
  1448 × 1086 canvas with the card alpha-bbox ≈ 1358 × 797 (ratio ≈ 1.70:1).
  Supplied as a per-page reference group, not served.
- Measured from the PNGs (card width 1350):
  - corner radius ≈ 46px ≈ 3.4% of the card width;
  - a **gold gradient frame inset** ≈ 16px (≈1.2% of width) with a ~4px stroke —
    brighter at the top, rgb(248,212,121), fading to rgb(150,110,65) lower;
  - a **4-point sparkle** at each corner (≈40 × 50px), a white core with a warm
    gold glow, ≈20–30px inside the corner;
  - card fill is a dark violet gradient (top rgb(41,30,47) → bottom rgb(23,16,27))
    over a soft violet glow.
- The sparkle is the only extracted asset: `public/images/recruitment/card-sparkle.svg`
  (decorative vector). Border, fill, chips and text are HTML/CSS; the PNG is never
  flattened into the UI.
- Layout follows the supplied card fully (number, title, summary, chips,
  `View role`) with the grid kept at **3 / 2 / 1** columns. The card is a fixed
  `aspect-ratio: 1350 / 795` with `container-type: inline-size`, and every inner
  metric is expressed in `cqw`, so the whole composition scales with the column
  width exactly like the reference. Positions (in `cqw`): number `top 7.85 /
left 7.41`, title `top 14.37`, summary `top 23.85 / width 56.2`, chips
  `top 38.52`, `View role` `top 51.04` (icon at the content-left, label at
  `left 13.6`). Chips are parenthesised labels, matching the reference, not pills.
- The only intentional deviation is the **typeface**: the reference uses the
  Figma font, which is replaced with the site fonts (title Manrope 700, body
  Manrope). Because glyph metrics differ, text widths and line breaks are not
  pixel-identical; the summary is clamped to the reference's three lines.
- Titles are shown in the site's **Title Case** (`domains.ts`, e.g.
  "Core AI & Engineering") instead of the reference's all-caps, and the card
  fill/glow and title colour are tinted violet (`#6c3bff` / `#9b7bff` /
  `#ede8ff`) so the card sits with the rest of the site palette.
- Behaviour is proportional at **all** breakpoints (chosen option): on phones the
  card is faithful to the reference but the type is small. This is a deliberate
  trade-off, not a bug.
- Verification: `scripts/verify.mjs` asserts the new section/list/card geometry
  (section `840.65625`, list `507.65625`; all cards `241.828125` high) and checks
  text containment from 320–1920px. There is no PNG pixel diff for this section
  because the supplied card text is intentionally replaced.

## Hero mobile fluid scale (23 September 2026)

Home and recruitment heroes are mobile-first fluid below 601px; the tablet
(601–1100) and desktop (≥1101) values are intentionally untouched, so the 1440
PNG comparisons and `verify.mjs` hero geometry stay valid.

- The `≤600px` blocks use `clamp()` for heading, body, spacing and vertical
  padding (`svh`-aware), so the scale is continuous instead of stepping at
  breakpoints.
- Both heroes fill the mobile viewport exactly: `min-height: 100svh` (`100vh`
  fallback) with the content vertically centred, so the hero matches the screen
  at every mobile size (320–600px).
- The heading cap at 600px equals the 601px value (home 42px, recruitment 40px),
  so there is no jump across the mobile/tablet boundary.
- The heading floor keeps both heroes on two lines down to 320px (home 28px,
  recruitment 23px); the recruitment copy clamps to 2 lines too.
- Home buttons stack full-width at ≤480px, so they never wrap unpredictably.
- Verified with a 11-width × 9-height mobile matrix plus the tablet/desktop
  widths: no overflow, no clipped text, identical ≥601px geometry, and
  `responsive-audit.mjs` ALL PASS (364 combos).

## Loading splash — magic circle (24 September 2026)

- New `src/components/Splash.astro`, mounted as the first child of `<body>` in
  `BaseLayout.astro`. Full-screen `position: fixed` overlay so the hero is not
  visible while its art loads.
- Artwork is 100% CSS/SVG (no new dependency, no raster asset): a gold magic
  circle (outer ring + 24 radial ticks, 7-point heptagram, dashed violet inner
  ring) drawn over a dark violet nebula gradient, with the existing
  `public/images/logo.png` glowing at the centre, 16 twinkling star sparks, the
  wordmark (Nasalization fallback) and a shimmering progress bar.
- Shown **once per session** (`sessionStorage: ds:splash`); an inline `<head>`
  script arms it via `html.splash-armed` only when unseen **and** not
  `prefers-reduced-motion: reduce` (otherwise it adds `html.splash-done`). The
  overlay defaults to `display: none`, so reduced-motion and no-JS visitors
  never see it. Exit is `window.load` + min 3000ms / hard-cap 6000ms, skippable
  by pointer/key/wheel/touch; scroll is locked for its duration with a
  scrollbar-width `padding-right` compensation so the reveal does not shift.
- Hero entrance (CSS in `Hero.astro`, GSAP in `Motion.astro`) is gated on
  `html.hero-ready` so the intro plays **once, in view**, after the overlay and
  after ScrollTrigger has built its `.pin-spacer` (`:global(html.hero-ready)` is
  required because the Hero styles are scoped). `motion.ts` adds the class once
  the pin is settled and removes it after the longest entrance, because the pin's
  DOM re-parenting on `refresh()` otherwise cancels and replays the CSS animation
  (the reported "hero double refresh" on reload).
- `.splash` added to `verify.mjs` `setNavbarHidden` for defence; because the
  verifiers run with `reducedMotion: 'reduce'` the overlay is never armed during
  audits.
