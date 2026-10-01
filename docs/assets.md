# Asset provenance

## Hall of Frames — Community Milestone (1 October 2026)

- Section node **`1439:4699`** ("Milestone DS Section"), 1440 × 987,
  `padding 100px 80px`, `gap 80`, `#050507`. Header `1439:4700` (1108 wide,
  `gap 24`): title **Bluu Next Bold 56 / 84** (`-0.011em`, gradient heading) +
  Manrope Medium 18/27 subtitle.
- Timeline `1439:4703` (`gap 58`): three rows `1439:4704/4714/4719` (row
  `year (64) → gap 146 → content (944)`, height 143). Year = Manrope SemiBold
  **26 / 42** and item title = Manrope SemiBold **36 / 48**, both filled with the
  `180deg #6C3BFF → #fff` gradient (per text node); description = Manrope Medium
  18/27 white. The **gradient rail with three diamonds** is the exported
  IMAGE-SVG node `1439:4709` (14 × 414 at `130/21`, absolute), shipped as
  `public/images/hof/milestone/rail.webp` — not rebuilt. Content is placeholder
  lorem (2024/2025/2026, "Our First Focused").
- `npm run assets:hof` writes the rail. `verify.mjs` asserts the `hofMilestone`
  geometry (section 1440 × 987, header 80/100/1108 × 162, list 80/342/1280 × 545,
  rail 210/363/14 × 414, rows 342/543/744 × 143, overflow 0) and diffs vs
  `HoF-Milestone-1x.png` (MAE **1.33**). Responsive: ≤900px the rail hides and
  the year stacks above the copy.

## Hall of Frames — Project highlights (1 October 2026)

- Section node **`1439:4655`** ("Project highlights"), 1440 × 1181, `padding 80`,
  `gap 19`, `#050507`. Header `1439:4661` (803 wide, `gap 24`): a "Project
  Highlight" pill (`rgba(255,255,255,.15)`, radius 32, `4px 12px`, Manrope 400
  12/18), title **Bluu Next Bold 56 / 67** gradient ("See What Our Sorcerers
  Create") and a Manrope Medium 18/27 subtitle. A decorative **bow-tie glow**
  (`1439:4656`, an IMAGE-SVG with `blur(43px)`) sits behind the stage.
- Stage `1439:4667` is **1280 × 730**, an `inline-size` container so it scales
  proportionally (`1cqw = 12.8px`). Three browser-window cards: centre
  `1439:4686` **933 × 730** at `174/0` (on top), sides `1439:4677`/`1439:4668`
  **800 × 625.94** at `0/60` and `480/67`. The card is itself a container
  (base 933), so the side cards are just the centre scaled (0.8575). Class is
  `hof-project-card` (renamed — `verify.mjs`'s `setNavbarHidden` hides
  `.project-card:not(.is-active)` from the homepage carousel and was hiding
  these).
- Card layers: the **raw browser-mockup screenshot** (imageRef `44090885…`,
  `HoF-Project-Shot-raw.png`) under a **20% black tint** — Figma's fill is
  `[rgba(0,0,0,0.2), IMAGE]`; without the tint the mockup read far too white
  (stage MAE 28 → 3). Then the `#0E0626` bar, title, lorem description and two
  `#6C3BFF` pills. The **136deg gradient rim is an `::after` + mask overlay**,
  not a border: a real 2px border shrank the content box (929 vs 933) and shifted
  the mockup. The Figma drop shadow is reproduced with `box-shadow` in stage-cqw.
- `1439:4695` dots: three 13px circles (`#707070`), the middle active with a
  `153deg #6C3BFF → #9483C6` gradient. All text is **placeholder**
  ("Arutala Aksara", lorem).
- `npm run assets:hof` bakes `public/images/hof/projects/{shot,glow}.webp`
  (the blur-baked glow ships as a single 1200w asset — the 3514px export was
  visually identical and much heavier). `verify.mjs` asserts the `hofProjects`
  geometry (section 1440 × 1181, header 318.5/80/803, stage 80/339/1280 × 730,
  centre 933 × 730 at 254/339, sides 800 × 625.9, dots 49 × 13, overflow 0) and
  diffs vs `HoF-Projects-1x.png` (MAE **2.96**). Responsive: the stage scales
  proportionally down to 900px, then only the centre card shows.

## Hall of Frames — Featured Sorcerers (1 October 2026)

- Section node **`1439:4512`** ("SORCERERS SPOTLIGHT & MEMBERS GALLERY"),
  1440 × 1241, `padding 80`, `gap 80`, `#050507`. Header `1439:4513` is 768 wide
  (`gap 24`): title **Bluu Next Bold 56 / 84** (`letter-spacing -0.011em`,
  gradient heading) + subtitle Manrope Medium 500 18/27 white. Gallery
  `1439:4516` = two rows of four cards, `column-gap 24` / `row-gap 66`.
- Cards (`featured-card`) are **302 × 400**, radius 10, fill
  `rgba(255,255,255,0.1)`, drawn with container queries (`1cqw = 3.02px`) so the
  whole card scales, like `AvailableRoles`. **Figma does not clip the card**: the
  portrait bleeds above the frame — card 1 uses a 302 × 532 rect at `y −132`
  (node `1439:4522`), the others a 302 × 442 rect at `y −42` (node `1439:4539`).
  The portraits are the **Figma-rendered rects** (already cropped as displayed),
  baked to `public/images/hof/featured/photo-{1,2}{,-2x}.webp`.
- Decorative inner frame = the exported **"Mask group"** node `1439:4519`
  (295 × 277 at `3/13`), used as a transparent overlay (`frame.webp`), not
  rebuilt. Bottom violet fade = the exported node **`1439:4523`** overlay
  (`fade.webp`): the MCP `linear-gradient(180deg, rgba(108,59,255,0) → #0E0626)`
  string is **lossy** (the rendered reference is markedly bluer — fitting a CSS
  gradient left card MAE ≈ 6.8; the node overlay drops it to ≈ 2.0).
- Meta block at `y 284` (`gap 7`): name Manrope Bold 22/33 white; 1px
  `rgba(255,255,255,.3)` divider (width = block; card 1 is `max-content`,
  others 217); role Manrope 16/24 white (lead) or `#D8D1D1`; two 16px social
  icons (nodes `1439:4529`/`1439:4533`, white `fill-opacity .53` as **inline
  SVG**). Content is placeholder (Marchel / Zidan / Rose, rows repeated).
- `npm run assets:hof` (`scripts/generate-hof-assets.mjs`) writes the served art.
  `verify.mjs` asserts the `hofFeatured` geometry (section 1440 × 1241, header
  336/80/768, grid 80/295/1280, card 302 × 400 at 80/406, frame 295 × 277 at
  83/308, 8 cards, overflow 0) and diffs vs `HoF-Featured-1x.png`
  (MAE **2.01**). Responsive: 4 columns > 1100px, 2 at 561–1100, 1 ≤ 560px.

## Hall of Frames — Hero (1 October 2026)

- New route `/hall-of-frames` (Figma page `1439:4506`, file
  `JYUzJK1hFqaEwL6DpdDvjp`). Hero node **`1439:4507`** (1440 × 903, column,
  centred, `gap 10`), fills = one **raw image fill** `6b05af5d…`. Reference
  exports live in `assets/hall of frames/hero/`:
  `HoF-Hero-1x.png` (1440 × 903), `HoF-Hero-2x.png` (2880 × 1806),
  `HoF-Hero-Title.png`, `HoF-Hero-Subtitle.png`, and the raw fill
  `HoF-Hero-Bg-raw.png` (3344 × 1882).
- Title `1439:4509`: **Bluu Next Bold 700, 80 / 102**, two lines
  ("Where Knowledge" / "Turns Into Legacy"), fill = the shared **"Gradient
  Heading"** `linear-gradient(181deg, #fff 15%, #999 42%, #fff 79%)`. It is a
  single text node, so the gradient spans the whole two-line block (not per
  line) — implemented as one `h1` with two `display:block` spans under a single
  `background-clip:text`.
- Subtitle `1439:4510`: Manrope Medium 500 **18 / 27** `#EDE8FF`, width **758**,
  two lines. Content frame `1439:4508` is 800 wide, `gap 24`; measured
  `content 320 / 310.5 / 800 × 282` (h1 800 × 204; p 341 / 538.5 / 758 × 54).
  Text block aligned at vertical shift 0 vs the reference; title MAE ≈ 3.9.
- Art: the raw image fill is baked as-is (`FILL` = `object-fit: cover`) by
  `scripts/generate-hof-assets.mjs` (`npm run assets:hof`) →
  `public/images/hof/hero-bg.webp` (1440w) + `hero-bg-2x.webp` (3210w, covers
  2880 × 1806). Not reconstructed.
- Navbar is the shared component; the active "Hall of Frames" underline is
  `118px` (= the 146px tab minus 2 × 14 padding), matching Figma. "Hall of
  Frames" is now a real link (`/hall-of-frames`) in `Navbar.astro`
  `destinations`; "Contact" stays `aria-disabled` until its page exists. A page
  whose tab is not linked yet renders its active entry as an `aria-disabled`
  `<span>`, so the `active` class is applied to the disabled branch too —
  otherwise the current tab stayed `#707070` with no underline.
- Verification: `scripts/verify.mjs` asserts the hero/content/title/subtitle
  geometry (1440 × 903, 800 × 282, 80/102, 758 × 54), `overflow 0`, and diffs
  against `HoF-Hero-1x.png` (MAE 4.34). Build 18 pages, `verify.mjs` exit 0
  (`browserErrors: []`), responsive 320–3840 all clean (hero heroH
  903/760/100svh by breakpoint).

## Homepage hero — font & spacing revision (1 October 2026)

- **Figma frame `1430:2040` "Home Page Revisi Font & Spacing"**, hero section
  `1430:2041` (1440 × 903, `padding 80`, content vertically centred). Navbar
  instance `1430:2051`, hero buttons `1430:2048`. Reference renders exported with
  `figma_download_figma_images` to
  `assets/assets home page/hero section/Home-Hero-Revisi.png` (1×) and
  `*-2x.png`, plus the isolated text/button/navbar nodes used for measurement.
- **Headline**: Figma switched the display face from Nasalization to **Bluu Next
  Bold 700**, **72 / 86**, two lines `gap 4`, gradient painted per line
  (`linear-gradient(211.54deg, #fff 32.8%, #999 49.8%, #fff 73.04%)`). Bluu Next
  is **SIL OFL 1.1**, so it is now bundled: `public/fonts/bluu-next-700.woff2`
  (20 KB) + `BluuNext-OFL.txt`, declared at weight 700 (single cut, avoids faux
  bold) and exposed as the `--font-display` token. `--font-heading` (Nasalization)
  is untouched so other pages keep their current look until their own revision.
- **Paragraph**: Manrope Regular **18 / 25**, width **655** (was 16/24, 619).
- **Spacing** (design uses an 8px grid): hero `padding 80`, content `gap 64`,
  copy `gap 16`, actions `gap 24`; measured text ink rows match the reference to
  ±1px (295/383/475/500). Buttons 201 × 43 + 195 × 43 at gap 24.
- **Buttons** (`Button.astro`): new `community` (Primary — violet radial pill that
  hugs its label, 43px, hover fills `#2F196F`) and `explore` (Secondary dark glass
  pill, hover `#4C3B7E`). The raw Figma inset shadows render far brighter than the
  node, so `explore`'s rim is baked from the reference export (dark violet fill
  `#22213a`, thin bright edge + soft top-left highlight). Existing variants
  (`primary`/`glass`/`white`/`secondary`/`apply`) are unchanged.
- **Navbar CTA**: now **"Join Us"** — the same `community` pill, **93 × 43** with
  hover `#2F196F` (node `1393:3355`), replacing the old white `Join Community`
  172 × 43. Shared component, so this applies to every page; the revision frame
  also uses `menu gap 16` (menu 743) and a space-between layout (195px gaps).
  `scripts/navbar-audit.mjs` asserts the new geometry.
- **Hero art**: replaced the two reconstructed layers
  (`background.webp` + `figure.webp`, ~24 MAE vs the reference background) with
  the **exact Figma image fill** of `1430:2041`
  (`assets/assets home page/hero section/Home-Hero-Plate.png`, 1437 × 894),
  baked to `public/images/hero/background.webp` (1583 × 993, q85, 82 KB) by
  `scripts/generate-hero-layers.mjs`. `fit: cover` mirrors the Figma FILL crop;
  the plate reproduces the reference background at **~2.7 MAE**. The separate
  character idle became a subtle whole-plate idle in `motion.ts`
  (`animatePlate`, 5% overscan) — reduced-motion is inert and still pixel-exact.
  Hero MAE (reduced motion, 1440) dropped **27.96 → 3.18**.
- **Verification**: `scripts/verify.mjs` now asserts the bundled "Bluu Next"
  loads and diffs against `Home-Hero-Revisi.png`; `navbar-audit` asserts CTA
  93 × 43 / gaps 195. Gates: build 17 pages, verify EXIT 0 (`browserErrors: []`),
  responsive 416 ALL PASS, navbar ALL PASS, seo PASS, verify:vt PASS.

## Partners page (30 September 2026)

- Route `/partners`, composed of `PartnersHero`, `OurPartners`, `WhyPartners`
  (+ the shared `Footer`). Figma file `RntmRWAgLrh5utgzcjrUik`, page node
  `1331:15712`, 1440 design. Section heights: Hero `1301:3740` **665**, Our
  Partners `1297:3541` **1075**, Why DS `1331:15711` **670**, Footer **556** —
  total **2966** (`assets/partners page/Partners Page.png` 7200×14830 @5×).
- Hero: `padding 242px 80px 160px`, gap 14, centred; pill `rgba(255,255,255,.15)`
  radius 32 (Manrope 400 12/18); headline Nasalization 400 **80/102**
  ("Let's Build Something / Meaningful Together."). Background = the two-hand
  artwork `Hero Section - Partners1.png` (5760×2660, the clean art the user
  supplied; the earlier imageRef `e79b1f65…` export was a different render).
- Our Partners: `padding 80px`, gap 100, `#050507`. Three groups (gap 42) —
  Industry (2×5 cards), Academia (1×5), Community (1×5). Group header = a radial
  pill (`circle at 8% 19%, #6C3BFF → #3C2188`) + a 1px `90deg #9B7BFF → transparent`
  rule. Cards: 5-column grid, gap 20, **240×116**, radius 20. The card art is the
  reference card itself (`Frame 2655.png` → `partner-card-bg.webp`): the Figma
  "swoosh" IMAGE-SVG export did **not** reproduce the full violet gradient, so the
  rendered card is used directly. Logos are **placeholders** (the Data Sorcerers
  mark, `partner-logo.webp` from `Logo_transparan (1) 4.png`) for all 20 slots.
- Why DS: `padding 80px`, gap 58, top-aligned 263px header (pill + 80/102
  headline) then a 4×309.5px card row (gap 14, max-width 1280). Card: `padding 28`,
  gap 20, `#262626`, 1px `135deg #EDE8FF → #2E276C → #EDE8FF` rim (mask-composite)
  and a bottom-right violet glow (`radial-gradient(108% 48% at 100% 100%)`, fitted
  from the reference pixels). Icons from the four `ChatGPT Image … 2*.png` marks
  (Talent/Research/Innovation/Community).
- Responsive: `WhyPartners` uses 4 columns ≥1366px, 3 at 1051–1365, 2 at
  701–1050, 1 below; `OurPartners` 5 → 3 (≤1050) → 2 (≤700). Nav "Partners" is now
  a real link (`/partners`); the navbar tab widths stay the Figma values.
- Regenerate served art with `npm run assets:partners`
  (`scripts/generate-partners-assets.mjs`). `verify.mjs` asserts the section
  heights (665/1075/670), card sizes (240×116, 309.5×189), 3 group pills and 20
  cards at 1440.

## About Us — Philosophy & Our Ecosystem (30 September 2026)

- Figma file `RntmRWAgLrh5utgzcjrUik`, section `1331:15784` and pipeline
  `1331:15792`. The section is 1440 × 880. Its padded header is 931 × 178 at
  (254.5, 80); the pipeline is 1280 × 426 at (80, 374). The five columns are
  bottom-aligned above the baseline at y=800.
- `OurEcosystem.astro` keeps headings, descriptions, numbers, and layout as
  HTML/CSS. The 188/116/217px connectors use a CSS violet-to-white gradient:
  pixel samples in the supplied PNG brighten toward the baseline, whereas the
  Figma SVG export fades to transparent and rendered too dark. The 1280 × 2
  baseline remains the Figma SVG in `public/images/about/ecosystem-baseline.svg`.
- Figma uses **per-section fills**, not a shared/parent glow (`about us` page
  `1277:18477`): Philosophy `922:16330` is `linear-gradient(163deg, #050507 63%,
#6C3BFF 126%)`; Our Ecosystem `1248:14877` is `linear-gradient(24.75deg,
#050507 53%, #6C3BFF 133%)`. The two are siblings (no decorative layer crosses
  the seam) and meet continuously: both reach ~`#3C238C` at the seam's right edge
  and `#050507` at the left. Angles/stops above were fitted from the rendered
  node PNGs (right-edge/top-edge MAE < 1); the MCP gradient string normalises
  handles and is lossy, and the earlier `152.43deg` / `36.99deg` values were
  wrong (MAE ≈ 4.3 vs < 1). Implemented as each section's `background`; the
  crystal "Mask group" (`922:16363`) belongs to Philosophy. Rejected: the
  temporary one shared parent radial + seam bands (oversized purple).
- The philosophy About variant had hidden the home page's `.canvas::before`
  glow (`glow.webp`) and uses the section fill instead, matching Figma.
- Pipeline header padding was restored to the Figma 10px inset, moving the
  pipeline down 20px to y=374 without changing the 880px section height.
- Wide viewport pass: the inner canvases of Philosophy and Ecosystem scale
  continuously from a 1441px viewport with an **uncapped** `zoom: calc(100vw /
1440px)`, so the canvas always fills the viewport width. The 1440px Figma
  geometry stays unchanged. Scaling the whole `body` created black gutters and
  misaligned the section edge at browser zoom levels.
- **Philosophy wide-screen fix (30 September 2026).** The About variant's
  `linear-gradient` was moved from `.philosophy.is-about` onto its **zoomed
  canvas**, so the glow, artwork and content scale together from the 1440px
  reference instead of the artwork growing while the full-viewport gradient
  stayed put. The old `.illustration { left: calc((1440px - 100cqw) / 2) }`
  anchor (which multiplied with the canvas `zoom`) pushed the artwork off the
  left edge above 1920px; for the About variant it is now pinned to `left: 0`.
  The `zoom` was originally capped at 2×, which froze the canvas at 2880px and
  left `#050507` gutters on the edges once the CSS viewport exceeded 2880px
  (e.g. browser zoom-out); the cap was removed so the glow reaches the edges at
  any width (verified gutter 0 from 1440 to 5120px). The
  Philosophy↔Ecosystem seam stays continuous (channel Δ ≤ 2 at 1440/1920/2560).
  `verify.mjs` asserts the zoom, canvas width, artwork left/right containment at
  1920px and full-bleed (left 0 / right = clientWidth) at 3200px.
- At 1051–1284px the five columns shrink proportionally within the section,
  while the pipeline keeps its 426px frame: all connector bottoms remain at
  y=782 and the baseline at y=799. At 701–1050px the
  pipeline uses two columns with its fifth step centred on the last row; at
  700px and below it keeps the single-column reading order. The baseline is
  reserved for widths where five readable columns fit.

## Splash — native ritual scene (25 September 2026, latest revision)

- User rejected the raster-scene implementation and requested native web rendering
  using `assets/assets home page/loading.png` only as a visual reference. No loader
  scene, fog, seal, or rune bitmap is shipped. The only image is the existing logo.
- Reference measurements with sharp: canvas 1672×941; seal center `(836,348)`;
  radial luminance peaks at 182, 206, 216, 245, 250 and 259px; title top 67.16%;
  floor center approximately `(836,826)`. SVG uses the same coordinate system.
- `Splash.astro`: concentric SVG rings, 120 tick marks, 12 individually pulsing
  rune paths, rotating geometry, four fixed cardinal ornaments, luminous arcs,
  elliptical floor circles, real HTML title/tagline, and monotonic circular
  deadline progress. Existing Manrope/Nasalization fallback is retained.
- `src/scripts/splash-atmosphere.ts`: native Canvas 2D noise-generated mist,
  evolving energy strands and 68 motes. No fetched textures or new dependencies.
  Rendering is capped at 30fps on a 1008×568 canvas, skipped while document is
  hidden, and stopped on splash completion or a reduced-motion preference change.
- The reference informs composition, not a claim of pixel-identical reconstruction.
  Photographic rocks/environment are deliberately not recreated as CSS polygons;
  the native scene uses the requested dark void and ritual light.
- Existing preloader registry, 3s minimum / 6s cap, session gate, exit event and
  scroll restoration are unchanged. `scripts/verify-splash.mjs` checks native
  rendering, geometry, progress, timing, exit, session reuse and reduced motion.
  Screenshots go to `artifacts/splash/`. `verify.mjs` already hides `.splash`.

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
- `philosophy/sorcerer-2x.webp` is downscaled to **1290w** (q82, 914KB → 481KB).
  The 1722w source was only ever selected at DPR≥2; DPR1 still uses the 861w
  `1x`, so the reference frame is unchanged. The width is pinned in the resize
  map so re-running `assets:optimize` reproduces it.
- `scripts/generate-backgrounds.mjs` writes the full-bleed backgrounds and role
  cards at q88 (from `assets/background/hd/*.png` and the pristine cards) and
  asserts MAE < 5 instead of bit-identical pixels.
- Manrope is served as **WOFF2** first (`public/fonts/manrope-*.woff2`, ~30KB vs
  ~95KB TTF), with the TTF kept as a fallback and preloaded as woff2.
- The hero clip is fetched after `requestIdleCallback` (or 300ms) and skipped
  under `saveData`/2G, so the static art is the first paint.
- Result: `dist` 56MB → 13MB; initial transfer `/` 2.37 → 1.72MB and
  `/recruitment` 3.37 → 0.59MB (full scroll 3.60/5.82 → 1.87/1.14MB).
- **P0 pass (28 Sep 2026).** `Snippets.astro` `sizes` made honest and a **960w**
  variant added (phones now pick 1280w at DPR3 / 960w at DPR2 instead of the
  2560w `-2x`, 358–562KB); `logo.png` palette-quantised (40 → 14KB, opaque MAE
  1.4); hero `background.webp` q86 → q82 (219 → 180KB) and `figure.webp`
  lossless → near-lossless q60 (128 → 86KB). Measured mobile transfer:
  `/recruitment` 2.09 → 1.15MB (DPR3) / 0.93MB (DPR2), `/` 1.40MB. Reproduce with
  `npm run assets:optimize` (logo + 960w) and
  `node scripts/generate-hero-layers.mjs` (hero layers; the `background_clean` /
  `sorcerer_primary` pack now lives in the assets archive — restore it under
  `assets/background/hero/data-sorcerers-hero-production-pack/` first).
- **P0(b) pass (28 Sep 2026).** Philosophy sorcerer + hero video + poster:
  - **Sorcerer scene → AVIF first.** `npm run assets:optimize` now also writes
    `philosophy/sorcerer-{1x,2x}.avif` (q58, effort 4) from the same pristine
    sources; `Philosophy.astro` lists the AVIF `<source>` first with the WebP
    source as fallback. `sorcerer-2x` drops **481 → 196KB** (1x 200 → 89KB) with
    opaque MAE ≈ 3.6 / 3.1 vs pristine (invisible at display size). Home mobile
    1335 → 976KB (DPR3).
  - **Hero video re-encode.** `generate-hero-video.mjs` x264 crf 21 → 25 and AV1
    crf 34 → 43 (home webm 0.74 → 0.38MB, mp4 1.46 → 0.72MB);
    `generate-recruitment-hero-video.mjs` x264 crf 24 → 30 and AV1 crf 34 → 43
    (recruitment webm 1.66 → 0.76MB, mp4 2.38 → 1.00MB). SSIM ≈ 0.983 / 0.989 vs
    a near-lossless reference of the same filter chain — no visible blocking.
  - **Poster off mobile.** `Hero`/`RecruitmentHero` no longer put `poster` in the
    markup; it is attached in JS inside `load()`, which only runs on
    wide/motion-OK viewports, so phones and reduced-motion never fetch the
    `hero-poster.webp` (74/65KB). Desktop keeps poster-first behaviour.
  - Re-measure: `/` mobile **1.33 → 0.98MB** (DPR3), `/recruitment` **0.64 →
    0.57MB**. Reproduce with `npm run assets:optimize`,
    `node scripts/generate-hero-video.mjs`,
    `node scripts/generate-recruitment-hero-video.mjs`.
- **Dead asset cleanup (26 September 2026).** Removed 12 superseded files
  (336KB): `public/images/recruitment/{hero-1440,hero-2880}.webp`,
  `recruitment/who-should-join-background-{1440,2880}.webp`,
  `recruitment/faq-background-{1440,2880}.webp`,
  `what-you-will-do/background-{1440,2880}.webp`,
  `footer/footer-bg-{1440,2880}.webp` and `projects/side-{left,right}.svg`.
  The recruitment/footer sections use the shared lossy
  `public/images/backgrounds/{recruitment,footer}.webp` (the flat
  `backgrounds/stars.webp` was itself removed on 26 Sep 2026 when the
  recruitment skies became the shared living `Starfield.astro`), and the 3D
  coverflow replaced the decorative side panels.

## Sound — procedural arcane palette (28 September 2026)

- No audio assets are downloaded or licensed: `src/scripts/sound.ts` synthesises
  every cue with the Web Audio API, and a runtime `ConvolverNode` impulse
  response gives a long (1.5 s), high-passed "cathedral" tail. Palette: `hover`
  (1.56 kHz glass tick), `click` (430 Hz arcane pluck), `select` (620/1710 Hz),
  `transition` (short 0.28 s rising seal whoosh + 392→660 Hz pluck, played before
  an internal page navigation), `open`/`close` (band-pass sweep 420↔2400 Hz),
  `success` (rising Cmaj7 chime), `error` (233→155 Hz thud).
- **Magic layer (28 Sep 2026):** every cue is rounded out with inharmonic bell
  partials (ratios 2.0 / 3.01 / 4.24 / 5.43, detuned ±7 cents and panned L/R)
  plus a short high band-passed "fairy-dust" shimmer noise; `open`/`success` also
  get an upward riser sweep. Master gain 0.75 through a gentle
  `DynamicsCompressor` limiter so the levels stay clean.
- `src/components/Sound.astro` mounts once in `BaseLayout`, so all 14 routes get
  it: a floating glass/violet mute orb bottom-right (`.sound-toggle`,
  `z-index: 40`, below the navbar/mobile menu at 50) and a delegated wiring for
  `data-sfx` (click) / `data-sfx-hover` (pointer enter). The preference persists
  in `localStorage['ds:sound']`.
- Autoplay: the `AudioContext` unlocks on the first user gesture; hover cues
  (not gestures) only sound afterwards. SFX wiring is skipped under
  `prefers-reduced-motion: reduce`, so the audits stay silent.
- `/lab/sound` is an internal `noindex` audition page (excluded from the sitemap
  via `sitemap({ filter })`). Phase 1 is wired: `data-sfx` / `data-sfx-hover` on
  Button, Navbar (brand, nav links, hamburger), DomainCard/rail arrows,
  AvailableRoles, Projects/Snippets controls, FAQ, HoDS tabs, back links and
  Footer; stateful cues (menu open/close, FAQ, tabs, splash finish) dispatch a
  `ds:sfx` window event. Hover is gated to `(hover: hover)`.
- **Ambient pad (Phase 3, 28 Sep 2026):** a procedural drone bed in the same
  engine — four detuned sines (A2/E3/A3/E4) plus a low-passed noise wind, both
  breathing on slow LFOs, routed to the reverb. It fades in after the first
  gesture while sound is on and fades out on mute, hidden tab or reduced motion.
  No per-frame JS and no audio files; the floating orb controls it together with
  the one-shot cues.
- **Page-transition (Fase 2, 28 Sep 2026):** a delegated click listener in
  `Sound.astro` plays the short `transition` cue on same-origin internal links.
  It is pointer-only, skips modifiers/new-tab/download/tel/mailto and same-page
  hash jumps, and it replaces (not adds to) the link's `data-sfx` cue so a link
  never plays twice. Because the site now uses Astro's `<ClientRouter />`
  (View Transitions) the document and the AudioContext survive the navigation, so
  the cue plays in full with no navigation delay — and the ambient drone no
  longer stops between pages.
- `verify.mjs` hides `.sound-toggle` with an `addInitScript` style (overlay UI
  absent from every reference PNG) and lists it in `setNavbarHidden`.

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
- Headline "strike" — **REMOVED 26 Sep 2026** at the user's request ("remove the
  lightning"): the two zig-zag `.bolt` SVGs, the `.strike` wrapper, the
  `.strike-burst` bloom, their `hero-ready` animation rules and the
  `strike-draw` / `strike-burst` keyframes were all deleted. The `h1` now just
  rises out of a blur (`.hero-line`). (History: a diagonal zig-zag lightning
  drawn behind the text — white core over a soft violet halo — synced to the
  `hero-line` delays.)
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
  `public/images/hero/background.webp` (clean plate, lossy **q82**, 180KB) and
  `public/images/hero/figure.webp` (cutout on a transparent plate with a mirrored
  0.32-opacity reflection, **near-lossless q60**, 86KB). Both are exactly
  1583 × 993. Both were compressed further on 28 Sep 2026 (from q86/lossless,
  219/128KB) — see the performance pass.
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
- **Portrait phones (width ≤ 600px, height > 560px)**: the static `figure.webp` is
  bottom-anchored via `@media (max-width: 600px) and (min-height: 561px)`
  (`.artwork .art-figure { top: auto; bottom: 0; height: 72%; object-position:
59% bottom }`). The earlier width-scoped height buckets (60/64/74/68/70%) were
  non-monotonic — 361–380px fell through to the 74% default — and their
  `object-position` pulled the sorcerer to the right on narrow screens, so
  360/375px phones read as "kekecilan". `figure.webp`'s cutout centre is at
  ~60.5% of the source, so a single `59% bottom` keeps the character at ~62% of
  the screen on every width and `height: 72%` keeps it the same share of the
  viewport. The same media block also swaps the hero to `min-height: 100lvh`
  (constant unit) so retracting the address bar never leaves a gap below the
  hero; short landscape keeps `100svh`. The
  selector must be `.artwork .art-figure` (specificity 0,2,0) to beat the base
  `.artwork :is(img, video)` (0,1,1). Measured in reduced-motion Chromium:
  320/360/375/390/412/480 all zero overlap, character ~36% of screen height at
  ~62% width, fully in frame.
- **Animated video layer (`public/images/hero/hero-bg.webm` + `hero-bg.mp4`,
  1280 × 720, 10 s / 240 frames, 24 fps)**: a full-scene clip (nebula, planet,
  water and the sorcerer). **Source swapped 26 Sep 2026** to
  `assets/assets home page/hero section/hero.mp4` (1280 × 720, 24 fps, 10 s) —
  the calmer "clean plate": no baked lightning strike and no Gemini sparkle, and
  the composition holds across the whole clip (`signalstats` YAVG ~55–56 every
  frame). **Crop removed (26 Sep 2026):** the export keeps the full native
  1280 × 720 frame — no crop, no rescale — so no pixels are invented and the
  whole scene stays visible; the earlier `1046×656+66+32 → scale=1582:992:lanczos`
  window forced a ~1.5× upscale and threw away the edges. Only `unsharp` remains
  in the filter chain. The whole clip is ping-ponged (first 5 s forward + reverse)
  into a seamless 10 s loop; grade is untouched ("pakai apa adanya"). Output is
  h264 crf21 (1.46 MB) + AV1 crf34 (0.72 MB) + `hero-poster.webp` (frame 0,
  74 KB); SSIM ~0.99 vs the source frame at native scale. The old clip was
  1280 × 720 with a lighter/magenta grade and a baked lightning burst near
  t=3 s; it is no longer used. At `(prefers-reduced-motion: no-preference) and
(min-width: 601px)` it is **visible from first paint** — `opacity: 1` — using
  `poster="/images/hero/hero-poster.webp"`, which is the clip's own frame 0
  (written by `scripts/generate-hero-video.mjs` with the same sharpen pass). The
  poster stands in until playback starts, so the hero never swaps from the
  smaller static cutout to the clip's larger sorcerer mid-view (that overlap read
  as a "double"). `≤600 px` and reduced motion keep `opacity: 0` and the static
  `background.webp` + `figure.webp` reference render; once the clip is live
  `.artwork-stack.is-video` hides `.art-figure`. Because the plate is now a
  native 16:9 frame, `object-fit: cover` trims only the sides; `.art-video` sets
  `object-position: 50% center`, which keeps the sorcerer's centre (~53% of
  source) and the staff fully inside the frame down to the 601px gate — the
  earlier `80% center` (tuned for the cropped clip) pushed the staff past the
  right edge on narrow portrait widths. Verified in Chromium at 1440, 900, 768,
  733, 675 and 601 px.

## Navbar

- Figma node: `755:15178` (component set `530:13894`). Reference PNG:
  `assets/Navbar.png` (7200 × 534 = the 1440 × 106.8 navbar at **5×**). The older
  `assets/assets home page/hero section/Navbar.png` (5760 × 428, 4×) is the same
  component set.
- **Exact Figma reproduction (28 Sep 2026).** `Navbar.astro` was rewritten to the
  reference. The bar is `position: fixed`; its content is locked to a centered
  `max-width: 1440px` frame with `padding: 24px 80px` (logo 54 × 58.8 at x = 80,
  y = 24). Layout is `space-between` between the logo and a **right group**
  (`nav` + CTA). Measured off the PNG: "Home" label x ≈ 359.6, menu width ≈ 751,
  menu→CTA gap **90px**, CTA right edge **1360** (width ≈ 173, height **42.1**).
  On screens wider than 1440 the frame stays centered (brand x = 320 at 1920,
  640 at 2560).
- **Tabs.** Each tab `padding 8px 14px`, `gap 2px` between label and underline,
  `gap 18px` between tabs, Manrope Medium 18/27. Inactive `#707070`
  (Figma `fill_c809fc54`); active `#fff` with a **1px gradient underline**
  `linear-gradient(163deg, #9b7bff 0%, #ede8ff 0%, #9b7bff 100%)` whose width
  equals the label (`align-self: stretch` inside a hug column — Home 49px,
  Recruitment = its label width). Non-active tabs keep an invisible underline so
  every item shares one height. At **≥1301px** the tab frame widths are hardcoded
  to the Figma component set (`Home 78, About Us 106, Recruitment 134, Hall of
Frames 146, Partners 101, Contact 98`), so the menu is exactly **753px** (gap 18)
  and nothing depends on font rasterisation; between 1051–1300px the gaps,
  padding, font and menu→CTA gap scale fluidly with `clamp()` so the bar never
  overflows.
- **CTA.** `Button variant="white"` now mirrors Figma component set `97:483`: it
  hugs its label, is pinned to `width 173px` + `height 42.1px` (so its left edge
  lands at x = 1187 and right at 1360, matching the PNG), `padding 4px 16px`,
  white fill, Manrope SemiBold 18 `#1e1e1e`, with a **2px gradient rim**
  `148deg rgba(203,197,255,.5) → rgba(47,90,255,.5) → rgba(238,245,255,.5)` (via
  `::after` + `mask-composite`), replacing the old flat `#cbc5ff` outline.
- **Background.** At the top `.navbar::before` paints Figma's own fill
  `linear-gradient(180deg, rgba(108,59,255,.1), rgba(11,7,18,0))`. Once scrolled
  (`y > 10` entering, `y > 6` leaving) it cross-fades to `.navbar::after`, a
  **translucent glass** backing (`rgb(6 5 10 / 45%)` + `backdrop-filter: blur(12px)
saturate(130%)`) so the page shows through blurred instead of a solid box; both
  pseudo-elements sit at `z-index: -1` behind the content. The production build
  keeps both `backdrop-filter` and `-webkit-backdrop-filter` (esbuild
  `cssMinify`).
- **Removed in this revision:** the floating glass capsule, the `is-condensed`
  morph, the sliding `.nav-indicator` capsule, the one-shot `.navbar-flash` sweep,
  the cursor bloom and the per-link sheen. The bar no longer changes geometry on
  scroll — only the backing fades in. `is-ready` still runs the staggered entrance
  after `ds:splash-done` (`.brand`, each `.desktop-menu .nav-link` at
  `--i * 55ms + 80ms`, CTA 0.5s), inert under reduced motion.
- `scripts/navbar-audit.mjs` (`npm run audit:navbar`) was rewritten: it asserts the
  exact 1440 geometry (logo 80/24, CTA right 1360 & height 42.1, menu→CTA gap 90,
  underline width = label width), that the backing toggles on/off with no document
  overflow across 20 widths, and that reduced motion is instant.
- Below 1050px the desktop menu is replaced by the full-screen `<details>`
  hamburger menu (JS-animated open/close, hamburger→X, body scroll lock,
  reduced-motion fallback). Mobile link colours are aligned to Figma (`#707070`
  inactive, `#fff` active with a violet gradient row).

## Images

- Hero: the homepage hero now renders the layered production-pack scene (see
  "Hero layered scene" above). The earlier flattened art
  (`assets/background/hd/hero.png` ← `Gambar Hero Section.png`) is still the
  source for the OG share card via `scripts/generate-og.mjs`; it is not used by
  the homepage hero anymore. The leftover served copy
  `public/images/hero-2880.webp` (2880 × 1806, from the first commit `a0b58fd`,
  unreferenced since `c53d84d`; its `hero-1440.webp` sibling was already gone)
  was deleted and backed up outside the repo at
  `/home/faiz/ds/ds-backup/hero-2880.webp` (`sha256 9346ab9a…`). Matching features against the PNG
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
- **Crystal motion FX** (only under `prefers-reduced-motion: no-preference`):
  a rotating conic `.aura`, a breathing radial `.pulse`, and eighteen orbiting
  `.spark` dots (a–r, sizes 2–7px, radii 68–246px) centred on the crystal
  (`--crystal-x/y`), all `mix-blend-mode: screen` and compositor-only
  (`transform`/`opacity`). Extra bulir were added 2026-09-25 without touching the
  aura/pulse, so the glow stays at reference level. `.fx` is
  `opacity: 0` by default so the reduced-motion render stays pixel-identical to
  the export. The static `glow.webp` carries the reference bloom; the dynamic
  layers stay subtle on purpose (tuned 2026-09-25 when the glow read too
  dominant — aura `50%/42% → 20%/16%`, width `62% → 56%`; pulse `55% → 18%`,
  width `42% → 38%`). Aligned grid check now matches the reference within ±2
  brightness (only the crystal core sits ~+10), versus the previous wash-out.
- **Float smoothness pass (29 Sep 2026).** The illustration picture and crystal
  FX use two synchronized compositor layers, so the glow and spark positions
  stay locked to the artwork during the 10px bob while the image can move
  independently of the 18 sparks. The same 7s round trip uses alternating
  `translate3d()` tweens with eased turns. `will-change: transform` applies only
  while the section is near the viewport, and `contain: paint` on `.fx` bounds
  spark/aura repaints to the illustration. Both layers pause off-screen and are
  inert under reduced motion; the reference geometry stays unchanged.

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
- Background is a **generated periodic star tile**:
  `public/images/starfield/starfield-base.png` (520 × 440, transparent, tiled
  with `background-repeat: repeat`) on `.what-we-do`, plus the purple glows —
  upper-right and center on `.what-we-do::before`. Colour values (`#6C3BFF` /
  `#9B7BFF`) and positions were measured from the reference PNG. The tile is
  rasterised from the original 42 CSS `radial-gradient`s by
  `scripts/generate-star-tiles.mjs` (`npm run assets:starfield`, patterns in
  `scripts/starfield-patterns.mjs`), so it is pixel-identical to the CSS version
  (baseline MAE 0 / max 1) while costing one small texture blit instead of 42
  gradient evaluations per tile. The former star/glow background exports
  (`stars-*.webp`, `center-glow.webp`, `corner-glow.svg`) stay removed. The
  tiles live in a shared `public/images/starfield/` folder (moved from
  `public/images/what-we-do/`) because the recruitment **Who Should Join** and
  **What You Will Do** sections reuse the same living sky through
  `src/components/Starfield.astro`.
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
  drifting layers + the glow. Both drifting layers are generated tiles too
  (`starfield-far.png` 440 × 360, `starfield-near.png` 520 × 400), so the huge
  layers raster by blitting a small texture instead of re-evaluating 20/8
  gradients per tile. `will-change: transform` is applied **only while the
  section is near the viewport** (`.what-we-do:not(.is-idle)`) so off-screen the
  page doesn't hold the oversized layers' textures resident. An
  `IntersectionObserver` in `motion.ts` toggles `is-idle` on `.what-we-do` so all
  animations `animation-play-state: paused` while the section is off-screen. The
  old per-frame `--wwd-px/--wwd-py` → `background-position` pointer parallax was
  removed and is not coming back. Measured effect of the tile conversion: the
  scroll-into-section long task dropped from 186 ms to 0 ms and average frame
  time from ~52 ms to ~37 ms (headless software-render audit; `no-gpu`, so treat
  the absolute numbers as relative). A regression guard lives in
  `scripts/perf-audit.mjs` (`npm run perf:audit`).
- The whole sky lives inside `@media (prefers-reduced-motion: no-preference)`
  and every layer defaults to `opacity: 0`, so under reduced motion the section
  is still pixel-identical to the reference PNG (verification runs with
  `reducedMotion: 'reduce'`).
- **Shared `Starfield.astro`** (recruitment revision, 26 Sep 2026): the same
  base tile + `starfield-far` (`440 × 360`, `0.8`, `12s`) + `starfield-near`
  (`520 × 400`, `0.85`, `7s`) drift is packaged as `src/components/Starfield.astro`
  and dropped into the recruitment **Who Should Join** (`.who-should-join`),
  **What You Will Do** (`.what-you-will-do`) and **FAQ** (`.faq`) sections, which
  previously painted the flat `backgrounds/stars.webp` (that file is now removed).
  The component is `position: absolute; inset: 0; z-index: -1; overflow: hidden`,
  so the parent must be `position: relative; isolation: isolate`; it never affects
  section geometry. `motion.ts` now toggles `is-idle` on those three sections
  (same observer list as the CTA glow) to pause the drift off-screen. Measured:
  two frames 2.2 s apart differ (`frameMAE ≈ 0.04`) with `no-preference`, `0.000`
  under `reduce`.
- **Card hover** (`.pillar:hover`, `@media (hover: hover)`): a violet spotlight
  follows the cursor (`.pillar::before` at `--mx/--my`, set by the existing 3D
  tilt), the gold hairline brightens, the drop shadow lifts and `.card-glow`
  scales/brightens. Transitions are gated to
  `prefers-reduced-motion: no-preference`; reduced motion still shows the hover
  state instantly.
- **Card hover on Domain / Project / Snippet cards (28 Sep 2026).** The cards
  that carry the `data-sfx-hover` cue now also answer the pointer:
  `.domain-card` (`DomainCard.astro`) floats up `translateY(-10px)` with a
  grounding shadow + tinted halo, a brighter gradient ring
  (`::after { filter: brightness(1.5) }`), a slight background lift and the
  artwork `.glow` scaling `1.045`; `.project-card.is-active`
  (`Projects.astro`) brightens its ring and zooms the artwork `scale(1.05)` with a
  larger under-glow (the coverflow sets the card transform inline, so the effect
  lives on its children); `.thumb` (`Snippets.astro`) lifts and gains a violet
  ring plus a gentle image zoom. Project cards also opt into the hover cue now
  (`data-sfx-hover`). All gated
  `(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)`,
  so the rest state (and `verify.mjs`) is unchanged and reduced motion gets no
  transition or transform. `.domain-rail` also gets
  `padding-block: 26px; margin-block: -26px` (and `display: flow-root` on
  `.domain-carousel`): a horizontal scroll container clips on both axes, so the
  lift was being cut at the rail's top edge; the equal negative margin keeps the
  geometry identical (`verify.mjs` still asserts section `826` / card `y 310`).
  **Home/recruitment parity:** the home `domainIntro()` entrance (GSAP) used to
  leave an inline `transform` on `.domain-card`/`.glow` that out-ranked the CSS
  `:hover`, so only the recruitment rail lifted; the entrance now ends with
  `clearProps: 'transform'` (in `motion.ts`), handing the transform back to CSS.
  Measured: both rails `rest: none` / `hover: translateY(-10px)`.
- **Domain card hover corner fix (29 Sep 2026).** The lifted `.domain-card` no
  longer combines its own `transform` with `overflow: hidden` and a rounded
  border. A full-size, untransformed `.domain-card-inner` clips the glow and chip
  artwork to `border-radius: inherit`. The outer hover halo is now a blurred
  radial gradient instead of a rectangular box shadow; the grounding shadow and
  gradient ring remain on the outer card. This removes hard glow corners during
  hover without changing the resting card geometry.
- **Keyboard carousel cues (28 Sep 2026).** Arrow-key navigation on
  `DomainRail`, `Projects` and `Snippets` now dispatches `ds:sfx` with the
  `select` cue (same as their arrow buttons) whenever a key actually moves the
  carousel — keyboard input bypasses the delegated hover/click wiring.
  `Sound.astro` drops it under reduced motion, so the audits stay silent.
- **Rail edge fade (28 Sep 2026).** While a domain rail glides, its partial
  edge cards used to be hard-cut at the rail bounds. `DomainRail.astro` now
  toggles `is-clip-left` / `is-clip-right` in `sync()` — computed from whether
  the rail's left/right edge lands **inside a card** — and, under
  `prefers-reduced-motion: no-preference`, a `mask-image` fades that edge by
  `120px`. Full cards are never dimmed (the rail exactly fits 2 or 3 cards at
  rest, so no edge class applies then) and `verify.mjs` stays unchanged.
- **Pillars entrance — "summon from the core"** (`pillarIntro` in `motion.ts`):
  on `≥761px` a **time-based timeline auto-plays once** when the section reaches
  the viewport (`scrollTrigger: { start: 'top 72%', once: true }` — no pin and no
  `scrub`, so it completes on its own rather than tracking scroll). The eyebrow
  fades in, the two `h2` lines mask up (`.line` wrapper with `overflow: hidden`;
  the gradient lives on the inner span so the clip actually masks it), and each
  `.pillar` flies **outward from the heading** (`x/y` ±70/±56 toward centre,
  `scale: 0.82`, `rotation: ±4deg`, staggered 01→02→03→04, ~1.4s total).
  `≤760px` keeps the simple `reveal` fade-up. All transform/opacity only.
  A 3D camera tilt on `.pillars-layout` (`rotationX/Y`) was **removed after
  review** — it put the whole section on its own layer and re-rasterised the
  starfield every frame for little visual gain; the 2D card fly-out reads just
  as well and stays cheap.
- The old generic `reveal(whatWeDo, '.pillar', …)` is gone.
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
- **Liveliness pass (`32e7491`, revised `6ca5b1e`).** Two motion-only additions,
  both skipped under `prefers-reduced-motion: reduce` so the reduce frame stays
  exact: (1) `DomainRail.astro` has an **attract mode** — desktop-only
  (`hover`+`pointer:fine`); when the section overlaps the viewport centre band
  and is idle ~3.5s the rail **steps one card at a time** (smooth scroll onto
  the snap points, ~2.8s dwell, reversing at the ends) — any
  hover/drag/wheel/touch/key/focus takes over, and it re-checks reduced motion
  per step and on the media-change event. (2) `motion.ts` `domainIntro()`
  replaces the plain card reveal with a staggered lift + scale, with each card's
  `.glow` igniting one beat later. No card markup/geometry changed.
- **What We Do tilt (`08309c1`).** The card clip moved to an untransformed
  `.pillar-inner` wrapper, so the 3-D hover tilt no longer squares the rounded
  corners (the documented `overflow`+`radius`+`transform` gotcha). Pillar
  geometry is unchanged.
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
  The decorative `side-left.svg` / `side-right.svg` exports were removed on
  26 Sep 2026 — the 3D coverflow replaced the side panels.
- The section heading, project name, supplied Lorem ipsum copy, category
  tags, central card and border are HTML/CSS. No full-section or full-card
  screenshot is used as the interface.
- The two empty side panels follow the reference; no additional projects,
  carousel controls or destination links were supplied.
- Mobile hides the decorative side panels and fits the featured project to
  available width. This is an adaptation, not a supplied mobile design.
- **Phones ≤520px**: the coverflow is replaced by a single
  full-width card (no transform scaling) so the copy stays legible — the image
  becomes a top block (aspect 1799/1102), then tags/title/description flow with
  normal type (h3 22/30, body 15/22). The cards sit in a flex track one slot
  wide and the switch **slides horizontally** (`transition: transform 0.5s`; JS
  sets `translateX(-active*100%)`) — a smooth swipe, no fade. The stage keeps
  `overflow: hidden` and its height follows the active card
  (`${activeCard.offsetHeight}px`, 0.4s). `Projects.astro`'s `render()` clears
  the inline coverflow styles below this breakpoint; the desktop branch (and its
  asserted 549×567 card) is untouched. 600px still uses the coverflow.
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
- **Living glow (one-way sweep)**: `.glow-art` drifts left -> right only
  (`translate` -150px -> +150px) and repeats, with a gentle breathing
  `scale 1 -> 1.04`. Opacity dips to 0.5 only at the loop seam (never 0) so the
  glow is always present and there is no gap; there is no up/down motion.
  `cta-glow-sweep`, 6.5s `linear` `infinite`; uses the `translate`/`scale`
  properties so the base `rotate(-2.23deg)` is kept. Only exists under
  `prefers-reduced-motion: no-preference` (static under reduce) and
  `.recruitment.is-idle` / `.cta.is-idle` pause it off-screen. The same
  `cta-glow-sweep` is duplicated in `Cta.astro` so the recruitment-page CTA
  reads as one direction with this one.
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
- **Background update (29 Sep 2026, user-supplied):** the footer now uses
  `assets/assets home page/footer/Gambar Footer(2).png` (7200 × 2780, exactly
  5× the 1440 × 556 footer frame). This supersedes the 2017 × 780
  `footerhd.png` background and the old background pixels in `Footer.png`; the
  old PNG remains the source for text and layout measurements. `npm run
assets:footer` converts the new source to q90 WebP variants at 1440, 2880,
  5760 and 7200 pixels wide (83, 191, 444 and 610 KB). `Footer.astro` uses
  `srcset`/`sizes="100vw"` to select them by viewport and DPR. The decoded WebP
  MAE against the source resized to each width is 1.01, 0.76, 0.63 and 0.58/255;
  the full 7200px export is retained for large retina screens. The source is
  fully opaque despite its PNG alpha channel. Text, borders, divider, and social
  frames remain HTML/CSS; `instagram.svg` and `linkedin.svg` are the Figma
  vectors. `scripts/generate-backgrounds.mjs` does not touch the footer.
- **Phone portrait backdrop (updated 29 Sep 2026):** the 2.59:1 landscape cannot cover a
  portrait footer (≈390 × 1033 at ≤600px) without `object-fit: cover` zooming
  ~1.33× and stretching to 1170 device px at DPR 3 (~4× upscale → visibly soft).
  `Footer.astro` now has a `<source media="(max-width: 600px)">` swapping to a
  generated portrait derivative `public/images/backgrounds/footer-mobile.webp`
  (1170 × 3450, q90, 77 KB) from the new 7200px source: an extended star sky (gradient zenith→seam with
  deterministic ±1 dither, the site's `starfield-base.png` tiled in `screen`) with the
  landscape scaled `MW × 1.35` and anchored to the bottom edge
  (`.backdrop img { object-position: center bottom }` ≤600px). Desktop keeps the
  full landscape at native resolution, so `verify.mjs` footer geometry/diff is
  unchanged.
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
  effectively black and is unused. Served as the shared lossy
  `public/images/backgrounds/recruitment.webp` (q88); the earlier lossless
  `recruitment/hero-{1440,2880}.webp` exports were removed on 26 Sep 2026. The
  artwork carries fine grain, so it is encoded at the higher q88 end of the
  range to keep the glow from softening (lossless restores the reference's
  high-frequency detail).
- **Animated background (26 Sep 2026):** the hero plate is now a looping video
  layer over the static `recruitment.webp` fallback, same contract as the home
  `Hero.astro`. Source `assets/assets recruitment page/hero section/
recruitment-hero1.mp4` (1920 × 1080, 24fps, 10s) → `scripts/
generate-recruitment-hero-video.mjs` → `public/images/recruitment/`
  `hero-bg.webm` (AV1 crf34, 1.66 MB) + `hero-bg.mp4` (h264 crf24, 2.38 MB) +
  `hero-poster.webp` (frame 0, 64 KB). Audio is dropped (`-an`).
  - The source does **not** loop seamlessly (frame 0 vs 239 differ ~7/255), so a
    plain loop seamed. The export uses a **circular crossfade**: the last 1s is
    blended into the first 1s via `xfade=...:offset=0` and the clip is trimmed to
    9s, which drops the seam to ~1.2/255 without reversing the aurora (a
    ping-pong boomerang would; this clip visibly builds up). Poster = the
    export's own frame 0 so the static art never swaps composition mid-view.
  - Playback is gated to `(prefers-reduced-motion: no-preference) and
(min-width: 601px)` and skipped under `saveData`/2G. Under reduced motion
    (and ≤600px) the video stays `opacity: 0` and `recruitment.webp` is the
    reference render, so `verify.mjs` geometry + PNG diff are unchanged. The clip
    pauses off-screen (`IntersectionObserver`) and on `visibilitychange`.
  - Poster/loop diff vs reference: composition is close (planet rim ~5% higher
    than the static render).
  - **Quality pass (26 Sep 2026):** the clip is now served at 2560 × 1440
    (lanczos + `unsharp`) with AV1 crf34 / x264 crf24. The earlier 1920 × 1080
    AV1 webm at crf44 (~450 kbps) carried visible 8 × 8/16 × 16 blocking across
    the dark sky, compounded by the hero's `cover` crop plus pinned 1.35× zoom
    (≈2× upscale in device pixels on retina). Only one codec is ever fetched —
    Chrome/Edge take the webm (listed first), Safari the mp4.
- **Hero motion (Phase 2, 26 Sep 2026):** `src/pages/recruitment.astro` now
  includes `<Motion />`, and `src/scripts/motion.ts` gained a `.recruitment-hero`
  block (inside the same `gsap.matchMedia`, so it is inert under reduced motion →
  the `verify.mjs` geometry/PNG diff is untouched). Three layers, mirroring the
  home hero at a smaller scale:
  - **Entrance:** `h1 span`, `p` and the CTA are held at `autoAlpha: 0, y: 34`
    and revealed (`power3.out`, stagger 0.09) once `ds:splash-done` fires;
    skipped on warm (`nav-warm`) navigation.
  - **Pointer parallax:** `.artwork` gets a 1.04 overscan, then `quickTo`
    `xPercent`/`yPercent` ±1.5% on fine pointers.
  - **Pinned scroll zoom (≥768px):** `start: 'top top'`, `end: '+=110%'`,
    `scrub: 1`, `pin: true` — the plate scrubs `scale 1.04 → 1.35` while the
    `.hero-content` and CTA lift `y: -200`, fade out and scale to 0.94. The
    1.04 overscan means the scaled art still covers the viewport below the
    866px section, so no seam shows while pinned. Phones/tablets (<768px) get no
    pin.
  - **Particle field (Phase 3, 26 Sep 2026):** the home hero's Three.js field is
    now a shared module `src/scripts/hero-particles.ts`
    (`mountHeroParticles(canvas, host, preload, { preset })`), mounted by both
    `Hero.astro` and `RecruitmentHero.astro` (`.hero-canvas` at `z-index: 0`;
    `.hero-content` and the CTA sit above at `z-index: 1`). Two presets keep the
    heroes distinct: **`motes`** (home, default) is the original 700-spec field
    that drifts and rushes the camera; **`embers`** (recruitment, 26 Sep 2026) is
    220 larger, warmer sparks that rise from the horizon with a gentle sway and
    fade in/out near the floor/ceiling, mapping `burst` to a mild speed-up only
    (no camera rush, no size morph). The pinned timeline scrubs
    `window.__heroParticles.burst` 0→1 (with an `onLeaveBack` reset). Desktop-only
    (`≥768px`), inert under reduced motion, paused off-screen; a WebGL/`three`
    failure is swallowed so the static art stays.
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
- Background (26 Sep 2026): now the **shared living sky** —
  `src/components/Starfield.astro`, the same base tile + `far`/`near` drift as
  the home "Four Pillars of Innovation" section (`public/images/starfield/`),
  matching the mentor's "bikin hidup kayak section Four Pillars, background
  bintangnya disamain" revision. It is an absolutely positioned, `overflow: hidden`,
  `z-index: -1` layer, so the section geometry is untouched. The previously
  supplied `Background.png` frame fill (a near-black starfield) was served as
  `public/images/backgrounds/stars.webp` (q88, `cover`, centered); both that file
  and the lossless `recruitment/who-should-join-background-{1440,2880}.webp`
  exports were removed on 26 Sep 2026 once all its consumers migrated.
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
- Background (26 Sep 2026): the **shared living sky** —
  `src/components/Starfield.astro`, same base tile + `far`/`near` drift as the
  home "Four Pillars of Innovation" section (`public/images/starfield/`). The
  supplied `Background.png` frame fill (a near-black starfield, MAD 0.11 vs the
  Figma export) previously shipped as `public/images/what-you-will-do/background-
{1440,2880}.webp` / `backgrounds/stars.webp` painted `cover` (Figma
  `scaleMode: FILL`); that flat fill is superseded by the drifting sky the mentor
  requested. The component is `position: absolute; inset: 0; overflow: hidden;
z-index: -1`, so nothing about the section geometry changes.
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

> The **card grid** described here (six `1280 × 77` rows) is historical: it was
> replaced by the 23 September then the **26 September 2026** card design — see
> "Available Roles — card redesign (26 September 2026)" below. The heading, copy,
> frame and section position below are still current.

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
- Frame: 1440 × 986, `padding 80`, `gap 58`. Background (26 Sep 2026): the
  **shared living sky** (`src/components/Starfield.astro`, same base tile +
  `far`/`near` drift as the home "Four Pillars" section), added when the mentor
  asked for these recruitment backdrops to be alive too. The supplied
  `Background.png` — the same near-black starfield as Who Should Join — was
  previously served as the shared `public/images/backgrounds/stars.webp`; both it
  and the earlier lossless `recruitment/faq-background-{1440,2880}.webp` exports
  are removed, and the geometry is unchanged (`.faq` stays `1440 × 986`).
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
  HTML/CSS. Since 28 Sep 2026 the hero also ships a **960w** variant
  (`snippet-hero-N-960.webp`, generated by `assets:optimize`) and the `<img>`
  `sizes` is honest, so phones download 1280w (DPR3) or 960w (DPR2) instead of the
  2560w `-2x` (the old `sizes="1280px"` forced 3840w at DPR3).
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
  Figma SVG/PNG export (browser blur rasterization differs). It now shares the
  homepage CTA's one-way `cta-glow-sweep` (left -> right, 6.5s linear, opacity
  never below 0.5), paused via `.cta.is-idle` when off-screen.
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
  Since 28 Sep 2026 `<html>` carries `prefix="og: https://ogp.me/ns#"` and the
  image also emits `og:image:secure_url` (crawler hardening; `seo:audit` PASS).

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

## Available Roles — card redesign (26 September 2026)

**Divider interaction update (29 September 2026):** The six cards now hide the
divider at rest and reveal it from the left on hover or keyboard focus. The
divider previously had a permanent white gradient underneath the animated
segment, which made the two rows appear inconsistent. Reduced motion reveals it
instantly. Card geometry is unchanged; `verify.mjs` checks all six resting states
and hover on a card in each row. This user-approved interaction supersedes the
static divider shown in the original PNG.

The card grid was redesigned from Figma `1184:1475` (single card) and `1218:1385`
(6-card container), reference PNGs
`assets/assets recruitment page/available roles/Card Role {1..6}.png`
(1652 × 956, transparent corners, ratio ≈ 1.728:1). This supersedes the
23 September gold-frame/sparkle card (kept below for provenance).

- Card: `#2a2a2c` (= `rgba(255,255,255,.15)` over the `#050507` section), a
  violet glow art anchored bottom-right, a 1px gradient ring, `border-radius 20px`
  (at the 413px reference width), `padding 18px 28px`, `aspect-ratio: 1652 / 956`.
- Content is a flex column: title (Manrope 700, 26 / 39, `#fff`, Title Case from
  `domains.ts`) → tagline (`roles.ts` `tagline`, Manrope 400, 16 / 24, `#ede8ff`,
  3 lines) → divider (`linear-gradient(90deg, #fff 0 50%, transparent)`, 0.5px) →
  `View Details` (Manrope 500, 16 / 32, `#fff`) + the Figma
  `basil:arrow-right-solid` (20 × 20, inlined SVG). Grid is **3 / 2 / 1** columns
  with `gap 40px 20px`; 3 × 413.33 + 2 × 20 = 1280, matching the reference width.
- Every inner metric is a `cqw` of the card (`container-type: inline-size` +
  `aspect-ratio`) so the whole card scales with the column width.
- The only extracted asset is the glow:
  `public/images/recruitment/role-glow.webp` (413 × 239, 8 KB). It is derived from
  `Card Role 1.png` — base `rgb(42,42,44)` subtracted, text bands vertically
  inpainted, then box-downscaled (mitchell). Composited over the CSS base it
  reproduces the reference at **MAE ≈ 2.5/255** (excluding text). No PNG is
  flattened into the UI: title, tagline, divider, ring and arrow are HTML/CSS.
- The ring gradient angle is `150deg`, not the Figma-exported `135deg`: a true CSS
  `135deg` on the 413 × 239 box shifts the mid-edge tone away from the PNG, while
  `150deg` reproduces the symmetric mid-edges measured in the reference.
- The tagline is deliberately shorter than the detail page's `about` and is
  written to wrap to three lines. Titles follow `domains.ts` Title Case.
- Verification: `scripts/verify.mjs` asserts the section/list/row geometry
  (section `851.375`, list `518.375`, rows `413.33 × 239.19`) plus the hrefs, text
  containment and card-content overflow from 320–1920px. There is no PNG pixel
  diff for the section (the card text is rebuilt); `role-glow.webp` is validated
  separately at MAE 2.5 against the reference crop.

## Available Roles — card redesign (23 September 2026, superseded)

The mentor supplied per-role card artwork that superseded the earlier
Available Roles preview card. Its baked-in Figma typography was **not** used: the
text was rebuilt in HTML/CSS with the site fonts.

- Sources: `assets/card baru/{data intelligence,core ai,language,vision,product,growth}.png`,
  1448 × 1086 canvas with the card alpha-bbox ≈ 1358 × 797 (ratio ≈ 1.70:1).
  Supplied as a per-page reference group, not served.
- The only extracted asset was `public/images/recruitment/card-sparkle.svg`,
  removed with the 26 September redesign. Border, fill, chips and text were
  HTML/CSS; the PNG was never flattened into the UI.

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
  never see it. It doubles as a **real preloader**: before lifting it waits for
  `window.load` **and** the registry `window.__dsPreload` — the Hero pushes the
  lazy `three` chunk (and, on desktop, a promise that resolves on the background
  video's `loadeddata`) — plus `document.fonts.ready`, with min 3000ms / hard-cap
  6000ms. A pointer/key/wheel/touch dismisses it only **after** the min, so the
  preload always gets a head start; on a slow link it releases at the 6000ms cap.
  Scroll is locked for its duration with a scrollbar-width `padding-right`
  compensation so the reveal does not shift.
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

## Mobile responsive + performance pass (25 September 2026)

> Catatan navbar di section ini **sudah digantikan 28 Sep 2026** — lihat §Navbar
> di atas (navbar persis Figma, backing kaca transparan, tanpa kapsul/morph).

User: on a phone the headings are not Nasalization (licence, see `AGENTS.md`) and
the navbar feels heavy / stutters while scrolling up and down.

**Root causes.** (1) The fixed navbar painted a `backdrop-filter: blur(28px)
saturate(180%) brightness(1.07)` and the `is-condensed` morph transitioned
layout properties (`height`, `padding`, `max-width`) over 0.9s — re-rasterised
every scroll frame and restarted whenever the scroll crossed the 8/40px
thresholds. (2) The Three.js particle field in `Hero.astro` ran on **every**
viewport; the old gate was only `!reduce`, not a width check. (3) The hero
figure's three `repeat: -1` idle tweens ran forever.

**Changes.**

- `Hero.astro`: particles gated to `(min-width: 768px)` (matching the pinned
  scroll sequence in `motion.ts`); `≤600px` gets a stronger two-axis scrim, a
  `text-shadow` on the body copy, and a single bottom-anchored figure rule
  (`height: 72%; object-position: 59% bottom` — see §Portrait phones above) so
  the copy stays legible over the sorcerer at 320–390 without hiding the art.
  Mobile uses `min-height: 100svh` for layout and `100lvh` on portrait phones so
  the section still fills when the address bar retracts (stable, not `dvh` — see
  the follow-up below).
- `motion.ts`: `animateFigure` takes `richIdle` (desktop = bob + sway +
  breathing; mobile = bob only) and pauses its tweens through an
  `IntersectionObserver` while the hero is off-screen.
- `motion.ts` follow-up: the `<768px` scroll-scrub that scaled `.artwork-stack`
  from 1 to 1.1 as the hero left was removed. On a `100dvh` hero the collapsing
  address bar kept re-measuring the trigger, so the art visibly grew/shrank
  ("kek ketimpa") on real phones; phones now scroll the hero away untouched and
  keep only the figure's idle bob. The desktop pinned sequence is unchanged.
- `motion.ts` follow-up 2: hero `min-height` switched `100dvh` → `100svh` (dvh
  reflows with the collapsing address bar, which shifted the next section
  mid-scroll) and ScrollTrigger is now `config({ ignoreMobileResize: true })`
  so it stops re-measuring every trigger on the address-bar resize. Together
  these remove the mobile hero→Philosophy "jump".
- `Navbar.astro`: `backdrop-filter` moved to `.navbar.is-scrolled::before` (the
  top-of-page state owns no blur layer); `≤760px` drops to `blur(12px)` without
  `saturate`/`brightness`, and the morph is an instant class swap
  (`.navbar-inner` / `.brand` `transition: none`).
- `BaseLayout.astro`: `viewport-fit=cover`; navbar and detail pages use
  `env(safe-area-inset-top)`; every gradient heading also declares
  `-webkit-background-clip: text`.
- `RoleDetail.astro`: each separator dot is wrapped in `.chip` with its label, so
  flex wrapping no longer strands a lone dot at the start/end of a line.

**Measured (headless, relative).** mobile 390×844 ≈ 60fps (avg 16.7ms, 2 long
tasks, max 76ms); desktop 1440 still runs the particles + pinned sequence.
Gates: `format:check`, `build` 14/0, `responsive-audit` 364 ALL PASS,
`verify-splash` PASS, `verify.mjs` `browserErrors: []`, `perf:audit` report-only
(only the footer logs an 80ms task).
