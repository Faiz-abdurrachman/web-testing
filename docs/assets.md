# Asset provenance

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
- At the top the bar keeps the reference's soft `backdrop-filter: blur(5px)`.
  After an 8px scroll it switches to a translucent blurred panel
  (`blur(18px) saturate(140%)`, `rgb(5 5 7 / 58%)` with a hairline bottom edge).
  This is an interaction addition; the top-of-page render is unchanged from the
  reference, so the hero comparison is unaffected.

## Images

- Hero: user-provided `assets/assets home page/hero section/Gambar Hero Section.png`.
  Responsive WebP versions preserve the frame composition at 1440 and 2880
  pixels. The original remains untouched. Matching features against the PNG
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
- Background: supplied `Background.png`, converted into responsive WebP.
- Center glow: supplied `Ellipse 3.png`, lossless WebP including blur overflow.
- Card glow and upper-right glow: original SVG exports from Figma, stored in
  `public/images/what-we-do/`. These contain decoration only; card titles,
  numbers, descriptions, borders, and layout are HTML/CSS.
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
- Native horizontal overflow supports touch and trackpads; focused keyboard
  navigation supports Left/Right and Home/End. No destination/detail page
  was supplied, so domain cards are informational articles.
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
  under `prefers-reduced-motion`. Project data lives in `src/data/projects.ts`
  and currently holds four placeholders.
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

## Recruitment page — Hero

Built section by section; only the hero exists so far. Route: `/recruitment`.

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
  the cards stay pixel-identical to the homepage.
- Card links: the cards open the HoDS detail pages with a recruitment origin
  (`/hods/{id}?from=recruitment`), so that page's back link returns to
  `/recruitment#who-should-join` ("Back to Open Roles"); the homepage rail keeps
  plain `/hods/{id}` and "Back to HoDS". The detail pages are static, so the
  origin is applied on the client from the query (`HoDSDetail.astro`).
- Background: the frame's fill is effectively black (`Background.png` in the
  folder is a black export; the Figma fill is near-black with under 0.1%
  non-black pixels). The reference and the full-page PNG render this band pure
  black, so the section uses `#000` rather than the homepage's `#050507`; this
  matches the reference.
- Measured layout at 1440: section `1440 × 789` at homepage y=866; heading
  `(80, 80, 1280 × 68)`; copy `(80, 172, 1280 × 27)`; cards at x 80 / 514 / 948
  / 1382, y 273, 394 × 436.
- Verification: `scripts/verify.mjs` asserts the section, heading, copy and card
  boxes exactly, diffs against the reference (~3.0/255; the card art carries the
  same residual as the homepage, and this reference PNG's cards differ slightly
  from the homepage export), and checks overflow and text from 320px to 1920px.
- Remaining sections and the footer are not built yet.

## Recruitment page — Role detail

Built but currently **not linked**: the Who Should Join cards open the homepage
HoDS detail pages (`/hods/{id}?from=recruitment`), not these. They are kept for
a possible future section (e.g. an available-roles listing). Route
`/recruitment/roles/{id}` (id = data, core, language, vision, product, growth);
these are the recruitment "Detail Role" pages, a different layout from the
homepage's `/hods/{id}` tab pages.

- Figma nodes: `774:17392` (data), `733:15781` (core), `760:14975` (language),
  `760:15276` (vision), `760:15347` (product), `760:15439` (growth). Frame:
  1440 × 1280, `padding 80`, `gap 58`.
- References: `assets/assets recruitment page/who sould join section/detail
role/Detile Roles - …png` (5760 × 5120, i.e. 1440 × 1280 at 4×). Note the
  core reference is the `DATA INTELLIGENCE-1` export (the Figma core frame is
  misnamed "DATA INTELLIGENCE").
- Background: `linear-gradient(-9deg, rgb(108 59 255 / 50%) 0%, #050507 19%)`
  (violet at the bottom-right), matching the PNG.
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
