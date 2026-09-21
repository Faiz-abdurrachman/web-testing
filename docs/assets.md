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
  its label; the label is Manrope SemiBold 18 / 34.1.
- Measured layout boxes at 1440: heading `(270, 247.5, 900 × 196)`, description
  `(270, 477.5, 900 × 27)`, button `(659.22, 567.5, 121.55 × 51)`.
- Background: `Gambar Hero About Us.png` (5756 × 3600), drawn full-width and
  top-aligned (`object-fit: cover; object-position: top`), so the lower ~35px is
  cropped. It is the decorative glow/arc layer with no text; the masked
  difference against the reference is ~1.2/255. The folder's `Background.png` is
  effectively black and is unused. Served as
  `public/images/recruitment/hero-1440.webp` and `hero-2880.webp`
  (high-quality WebP).
- Navbar: the shared `Navbar.astro` with `active="Recruitment"`. The active
  underline is the Figma 106px gradient
  `linear-gradient(163deg, #9b7bff, #ede8ff, #9b7bff)`; the Home underline keeps
  its original 49px so the homepage comparison is unchanged.
- Verification: `scripts/verify.mjs` asserts the section, heading, description,
  and button boxes exactly, checks the active nav link, diffs the section
  against the reference PNG (~2.2/255; font rasterization and the glow remain),
  and checks horizontal overflow and clipped hero text from 320px to 1920px.
- Remaining sections (e.g. "Who Should Join") and the footer are not built yet.
