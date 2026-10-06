# Asset provenance

## Homepage — full-screen sections + image hero (4 October 2026, `b228f3c`)

- **Standar baru**: tiap hero = **gambar background** + `100svh`; tiap section
  konten = `min-height: 100svh` + center. Work order: `docs/page-fullscreen-migration-plan.md`.
- **Hero homepage** (`1430:2041`, frame 1440×903): sumber user
  `assets/hero gambar/Gambar Hero Section homepage.png` (5736×3600, RGBA) → di-crop
  center ke 1440×903 → `public/images/hero/background.webp` (q85, ~102 KB) +
  `background-2x.webp` (2880×1806, q82, ~208 KB). Gambar **tidak memuat teks**;
  heading/subtitle/tombol tetap HTML. Video (`hero-bg.{webm,mp4}`, `hero-poster.webp`),
  partikel Three.js (`hero-canvas`), `.hero-veil`, `.hero-sweep`, dan plate lama
  **tidak lagi dipakai** oleh homepage (script `generate-hero-video.mjs` /
  `hero-particles.ts` tetap ada; `Hero.astro` tidak mengimpornya lagi).
- Reference verify baru (node export 1×): `assets/home-page/hero/Home-Hero-Reference-1x.png`
  (1440×903). `verify.mjs` memakai reference ini.
- **Section homepage**: `Philosophy.astro` (`:not(.is-about)`), `WhatWeDo.astro`,
  `Domains.astro`, `Projects.astro` → `min-height: 100svh` + `justify-content:center`
  (tinggi render = 903 di viewport 1440×903). `Recruitment.astro` (CTA) **tidak**
  diubah (tetap 554). Reference PNG section **di-pad** `sharp.extend()` oleh
  `(sectionH − FIGMA_H)/2` (Philosophy 33/33, WhatWeDo 32/31, Domains 42/42) warna
  `#050507`; Projects 910 (tidak di-pad). Assertion geometry `verify.mjs` diupdate
  (top Philosophy 903, WhatWeDo 1806, Domains 2709, Projects 3612, CTA 4522).

## About Us — full-screen sections + image hero (5 October 2026)

- **Standar baru** diterapkan ke `/about` (`1439:4184`): hero = **gambar background**
  - `100svh`; section konten = `min-height: 100svh` + center. Work order:
    `docs/page-fullscreen-migration-plan.md`.
- **Hero About** (`1439:4185`, 1440×903): sumber user
  `assets/hero gambar/Hero Section - About Us.png` (5760×3612) → di-crop center ke
  1440×903 → `public/images/about/hero-bg.webp` (q85) + `hero-bg-2x.webp`
  (2880×1806, q82), digenerate `scripts/generate-about-assets.mjs`
  (`npm run assets:about`). Gambar **tidak memuat teks**; heading/subtitle tetap
  HTML. Video (`hero-bg.{webm,mp4}`, `hero-poster.webp`) + `hero-bg-mobile.webp`
  **dihapus** (tak lagi dipakai); `HeroVideo.astro`/`hero-video.ts` tetap ada untuk
  Partners/HoF. Reference lama `assets/about-us/hero/About-Hero-Revisi-1x.png`
  masih valid (art non-teks MAE ~1.5–1.9); section 1440×903 tak berubah, tanpa pad.
- **Section About**: `VisiMisi.astro` (canvas baru `.visi-misi-canvas` membungkus
  konten + tarot; tarot `left:948px; top:181px` relatif canvas), `Philosophy.astro`
  (`is-about` kini `100svh` + center, scope `:not(.is-about)` → semua varian, seam
  gradient ke Ecosystem dijaga), `OurEcosystem.astro` (`min-height:100svh` +
  `justify-content:center`), `OurTeam.astro` (`100svh` + center; konten 1536 > 903
  jadi tetap 1536). Referensi PNG di-pad `sharp.extend()`: VisiMisi 31/32
  (840→903), Philosophy 33/33 (837→903), Ecosystem 14/15 (874→903) warna `#050507`.
- **Assertion geometry `verify.mjs`** (viewport About 1440×903): Hero tetap 903;
  VisiMisi 903 (vision y 111.3, mission 356.5, tarot 292.3); Philosophy 903
  (canvas y 33, content y 238); Ecosystem 903 (header 94.5, pipeline 382.5,
  baseline 807.5, lineBottoms 791); Team 1536. Seam guard Philosophy↔Ecosystem
  `≤16` (baris 902). Loop pipeline (h 900): lineEnds 789, baselineY 806.
  Semua 7 gate + seo PASS.

## Recruitment page — Available Roles (2 October 2026)

- Section node **`1436:3564`** ("Available Roles Section Revisi Card", 1440 × 843, `padding: 80px`, gap: 58px), frame page Recruitment `1436:3505`, file `JYUzJK1hFqaEwL6DpdDvjp`.
  Reference: `assets/assets recruitment page/available roles/Recruitment-AvailableRoles-Revisi-1x.png` (1440 × 843) & `Recruitment-AvailableRoles-Revisi-2x.png` (2880 × 1686).
  Isolated nodes: `Recruitment-AvailableRoles-Heading-2x.png` (`1436:3566`).
- Layout & Spacing (Strict 8-Point Grid):
  - Section desktop: 1440 × 843px, padding 80px, background `#050507`.
  - Header Frame 2496 (`1436:3565`): 1280 × 115px at `x: 80, y: 80`, gap `24px` between heading and subtitle:
    - Heading `1436:3566`: "Available Roles", **Bluu Next Bold 700 56px / 67px** (token `--font-display`), linear gradient `linear-gradient(181deg, #FFFFFF 15%, #999999 42%, #FFFFFF 79%)` (`background-clip: text`, global Figma `Gradient Heading`), text-align left at `x: 80, y: 80, w: 1280, h: 67`. Ink width 387px matching reference ±0.5px.
    - Subtitle `1436:3567`: "Select a role to view full details, requirements, and apply.", Manrope Medium 500 18px / 27px, color `#ffffff`, single-line text at `x: 80, y: 168, w: 1280, h: 27`.
  - Gap Header-to-Grid: **`58px`** (top of grid = 80 + 115 + 58 = 253px).
  - Card Grid Frame 2605 (`1436:3568`): 1280 × 510.375px at `x: 80, y: 253`, layout 2 rows × 3 columns, vertical gap `40px`, horizontal gap `20px`:
    - Row 1 Frame 2603 (`1436:3569`): `x: 80, y: 253`, 3 cards each 413.33 × 235.17px (`Card Role 1` Data Intelligence, `card role 2` Core AI & Engineering, `card role 3` Language & Reasoning).
    - Row 2 Frame 2604 (`1436:3603`): `x: 80, y: 528.1875`, 3 cards each 413.33 × 235.17px (`card role 4` Vision & Multimodal, `card role 5` Product & Software, `card role 6` Growth & Community).
    - Card styling: `aspect-ratio: 413 / 235`, `border-radius: 4.843cqw` (20px), `background: rgba(255, 255, 255, 0.15)` (#2a2a2c), 1px glass rim `linear-gradient(135deg, #ede8ff 0%, #2e276c 50%, #ede8ff 100%)` via `::after` ring + `mask-composite: exclude` (hover `135deg #fff -> #6c3bff -> #fff`).
    - Internal metrics: `padding: 4.358cqw 6.78cqw` (18px 28px).
    - Head Frame 2592: title Manrope Bold 700 26/39 white, gap 16px (`3.874cqw`), summary Manrope Regular 400 16/24 `#ede8ff`.
    - Foot Frame 2593: 1px divider + "View Details" (Manrope Medium 500 16/32) + 20px arrow icon.
    - Glow backdrop: `public/images/recruitment/role-glow.webp`, base `opacity: 0.85` so the reduced-motion (static) render matches the reference / the animation's 0% frame; interactive hover pointer tracking (`--gx/--gy`), static under `prefers-reduced-motion`.
- Measurements & Precision:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 843.375, top: 2558 }`
    - heading: `{ x: 80, y: 80, width: 1280, height: 67 }`
    - copy: `{ x: 80, y: 168, width: 1280, height: 27 }`
    - list: `{ x: 80, y: 253, width: 1280, height: 510.375 }`
    - rows: 6 cards matching `[253, 528.1875]` and `[80, 513.328, 946.656]` with width `413.33px` and height `235.17px`.
  - Audit 3 Oct 2026 (strict per-section): reference re-export `Recruitment-AvailableRoles-Revisi-1x.png` MAE **0.000** vs node (not stale). Fixes: heading fill `180deg/80%` → global `181deg/79%`; `.role-glow` base opacity `0.85` (reduce render was opacity 1, glow read ~6–11 too bright at the bottom-right corner; card1 BR now ref `134,103,229` vs act `133,109,212`).
  - Section MAE **8.329/255** full (header band 2.497, card grid 10.203). Per-card 14–17 MAE is **irreducible** cross-renderer residual: Figma text engine places Bluu Next ink ~1px lower and the 1px glass rim renders ~1px higher than the DOM box (section screenshot origin rounds) — the protocol says do NOT chase this by shifting position. Card glow/background and geometry match.
  - All verification gates PASS: build (0 error), verify.mjs (exit 0, browserErrors []), responsive audit (468/468 PASS), navbar audit (PASS), verify:vt (PASS), audit:spacing (PASS), format:check (PASS), seo:audit (PASS).

## Detail Roles Pages (/recruitment/roles/[id]) — Frame Height 1280px, Bluu Next Bold 700 & 8pt Spacing (2 October 2026)

- Frame nodes Figma (file `JYUzJK1hFqaEwL6DpdDvjp`, 1440 × 1280px, padding 80px):
  - Data Intelligence: node `774:17392` (1440 × 1280, padding 80px)
  - Core AI & Engineering: node `733:15781` (1440 × 1280, padding 80px)
  - Language & Reasoning: node `760:14975` (1440 × 1280, padding 80px)
  - Vision & Multimodal: node `760:15276` (1440 × 1280, padding 80px)
  - Product & Software: node `760:15347` (1440 × 1280, padding 80px)
  - Growth & Community: node `760:15439` (1440 × 1280, padding 80px)
- Perintah / Callout Gembala:
  - "Penyesuaian Height (tinggi card) menjadi 1280px untuk ALL Detile Roles / HoDS"
  - Seluruh frame halaman diseragamkan ke **1440 × 1280px**.
- Typography & Spacing:
  - Hero Card H1 Title: Updated to **Bluu Next Bold 700 48px / 57.6px** (token `--font-display`), gradient `linear-gradient(270deg, #fff, #ede8ff)`.
  - Strict 8-Point Grid: `.role-detail-inner` `padding: 80px`, `min-height: 1280px`, `gap: 56px`. Removed old `centered` vertical justification so layout is strictly top-aligned matching Figma.
  - Back link: `x: 80, y: 80`.
  - Hero card: `x: 80, y: 135` (for Data & Core with gap 28px in Frame 2526) and `x: 80, y: 163` (for Language, Vision, Product, Growth with gap 56px).
  - Role sections gap: `56px`. Block gap: `24px` (title to copy).
  - Contact box Frame 2256 (`347 × 134px`): sits with gap 56px at `x: 80`.
  - WhatsApp Direct Link & Micro-interactions:
    - Contact box diubah menjadi interactive anchor `<a>` yang mengarah langsung ke `https://wa.me/6285171516704?text=...` (nomor WhatsApp Zidan Amikul: `+62 851-7151-6704`).
    - Pesan otomatis spesifik per role (misal: "Halo Kak Zidan Amikul, saya ingin bertanya mengenai recruitment role DATA INTELLIGENCE di Data Sorcerers.").
    - Hover lift: `transform: translateY(-2px)`, glow violet `box-shadow: 0 8px 24px -4px rgb(108 59 255 / 40%)`, background pendar `rgb(98 80 255 / 20%)`, border specular ring highlight, logo zoom `scale(1.12)`, dan Web Audio SFX cues (`data-sfx="click"`, `data-sfx-hover="hover"`).
    - Reduced motion fallback (tetap statis pixel-exact saat reduce diaktifkan).
- Measurements & Precision:
  - `verify.mjs` assertions verified for all 6 routes (`/recruitment/roles/{data,core,language,vision,product,growth}`):
    - Container: `1440 × 1280` exact.
    - Back link: `{ x: 80, y: 80 }` exact.
    - Hero Card: `{ x: 80, y: 135/163, width: 1280, height: 279 }` exact.
    - Contact box: y matches measured Figma coordinates within ±2px.
    - Apply button: `y: cardY + 58` exact.

## Recruitment page — Selection Timeline (2 October 2026)

- Section node **`1436:3637`** ("TIMELINE", 1440 × 812px / 815px, `padding: 80px`, gap: **56px**), frame page Recruitment `1436:3505`, file `JYUzJK1hFqaEwL6DpdDvjp`.
  - URL Figma: `https://www.figma.com/design/JYUzJK1hFqaEwL6DpdDvjp/Web-Community-DS?node-id=1436-3637`
  - Reference: `assets/assets recruitment page/selection timeline/Recruitment-SelectionTimeline-Revisi-1x.png` (1440 × 812) & `Recruitment-SelectionTimeline-Revisi-2x.png` (2880 × 1624).
  - Isolated heading: `Recruitment-SelectionTimeline-Heading-2x.png` (`1436:3638`).
- Layout & Spacing (Strict 8-Point Grid):
  - Section container: 1440 × 812px, padding `80px` (`80px 80px 80px 80px`), background `#050507`.
  - Gap header ke tabel timeline: **`56px`** (`7 × 8px` — strict kelipatan 8, mengoreksi nilai lama 58px).
  - Heading Frame `1436:3638`: "Selection Timeline", **Bluu Next Bold 700 56px / 67.2px** (token `--font-display`), gradient linear 181deg `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`. Ink glyphs sit **1px lower** than a plain CSS render → wrapped in `.tl-heading-text { position: relative; top: 1px }` (visual nudge only; `h2` box geometry unchanged).
  - Timeline Table Container Frame `1436:3639`: width 1280px.
    - Table Head Frame `1436:3640`: 1280 × 78px, padding `18px 32px`, border-radius `20px 20px 0 0`, background `rgba(108, 59, 255, 0.25)`, 1px glass rim.
      - Phase: Manrope Bold 700 26px / 39px LEFT, color `#ffffff`.
      - Date: container width 568px, Manrope Bold 700 26px / 39px **LEFT** (PNG is source of truth — MCP `textAlignHorizontal: CENTER` is wrong; reference header Date sits at x761, identical to the body rows), color `#ffffff`.
    - Table Body Frame `1436:3645`: 1280 × 451px, padding `18px 32px`, border-radius `0 0 20px 20px`, gap `18px`, background `rgba(255, 255, 255, 0.15)`, 1px glass rim.
      - 6 rows: OPEN RECRUITMENT, APPLICATION, FOUNDATION SCREENING, HOODS INTERVIEW, TRIAL / CHALLENGE, MEMBER.
      - Separator 1px, Figma fades to **white non-premultiplied** → emulated with `background: linear-gradient(90deg, #9b7bff, #ffffff)` + `mask-image: linear-gradient(90deg, #000, transparent)` (a straight `→ transparent` stop premultiplies and keeps the violet RGB, ~12 MAE/row → 1.2).
      - Text: Manrope Medium 500 26px / 39px (Phase di kiri, Date di kiri lebar 568px).
  - **Rim gradient is horizontal, not 135deg.** The reference top and bottom rims are pixel-identical per x (bright at both ends, darkest at x720 = table centre) → true fill is `linear-gradient(90deg, #ede8ff 0%, #2e276c 50%, #ede8ff 100%)` over the 1280 table. MCP's `135deg` string is lossy (bottom rim centre read 96 vs ref 48). The junction is 1px higher than a naive stack: header `::after` bottom ring is 2px (`padding: 1px 1px 2px 1px`) and body `::after` has no top ring (`padding: 0 1px 1px 1px`) → junction at ref rows 279-280.
- Measurements & Precision:
  - `verify.mjs` assertions verified:
    - section: `{ width: 1440, height: 812.203125, top: 3401.375 }`
    - heading: `{ x: 80, y: 80, width: 1280, height: 67.203125 }`
    - head: `{ x: 80, y: 203.203125, width: 1280, height: 78 }`
    - body: `{ x: 80, y: 281.203125, width: 1280, height: 451 }`
    - rows: 6 rows exact at `[299.2, 374.2, 449.2, 524.2, 599.2, 674.2]` with height `39px`.
  - Section MAE: **`4.3059/255` → `2.093/255`** vs reference `Recruitment-SelectionTimeline-Revisi-1x.png` (audit 3 Oct 2026: heading `181deg/79%`, header Date left-aligned, rim `90deg`, junction 2px/0px, separator white-fade mask). Residual = Manrope/Bluu Next cross-renderer AA (irreducible) + 1px heading glyph-height AA.
  - All 7 gates PASS: build (0 error), verify.mjs (exit 0), navbar audit (PASS), verify:vt (PASS), responsive audit (468/468 PASS), audit:spacing (PASS), format:check (PASS) + seo:audit (PASS).

## Homepage — CTA Recruitment Section (2 October 2026)

- Section node **`1430:2162`** ("CTA Recruicment Section", 1440 × 554, `padding: 80px`), frame page Homepage `1430:2040`, file `JYUzJK1hFqaEwL6DpdDvjp`.
  Reference: `assets/assets home page/cta/Home-CTA-Revisi-1x.png` (1440 × 554) & `Home-CTA-Revisi-2x.png` (2880 × 1108).
  Isolated nodes: `Home-CTA-Header-2x.png` (`1430:2164`), `Home-CTA-Title-2x.png` (`1430:2168`).
- Layout & Spacing (Strict 8-Point Grid):
  - Section desktop: 1440 × 554px, padding 80px.
  - Card Panel Frame 2393 (`1430:2163`): 1280 × 394px at `x: 80, y: 80`, padding `64px 80px`, gap `48px` to action button.
    Fills: `rgba(98, 80, 255, 0.10)`, border radius 20px, 1px glass rim `linear-gradient(135deg, #e0dcff, #504677 48%, #e0dcff)`.
  - Header Frame 2300 (`1430:2164`): 1118 × 173px, gap `24px`:
    - Frame 2298 (`1430:2165`): 1118 × 101px, gap `8px` between eyebrow and title.
      - Eyebrow CTA `1430:2166`: "Recruitment" (Manrope Regular 12/18, padding `4px 12px`, border-radius 32px, `rgba(255,255,255,0.15)` with Figma `GLASS` effect). Sits at `x: 673.4, y: 145, w: 93.2, h: 26`.
      - Heading `1430:2168`: "Ready to Become a Sorcery?", **Bluu Next Bold 700 56px / 67px** (token `--font-display`), linear gradient per line `linear-gradient(180deg, #FFFFFF 15%, #999999 42%, #FFFFFF 80%)` (`background-clip: text`), text-align center. Sits at `x: 161, y: 179, w: 1118, h: 67`.
    - Copy Text `1430:2169`: "Join a community where your learning can become experimentation, your ideas can become projects, and your work can create real impact.", Manrope Regular 400 16/24, color `#ffffff`, 586 × 48px at `x: 427, y: 270`.
  - Action Button Frame 2299 (`1430:2170`): 201 × 43px centered at `x: 619.5, y: 366`:
    - Primary button (`<Button variant="community">Join the Community</Button>`): radial gradient `#6C3BFF (0%) -> #9B7BFF (50%) -> #6C3BFF (100%)`, specular inner shadows, hover `#2F196F`.
    - Glow backdrop Frame 2392 (`1430:2172`): `left: 268.83px, top: 270px, 1000 × 271px`.
- Measurements & Precision:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 554, top: 4309 }`
    - elements:
      - `.recruitment-panel`: `{ x: 80, y: 80, width: 1280, height: 394 }`
      - `.eyebrow`: `{ x: 673.4, y: 145, width: 93.2, height: 26 }`
      - `h2`: `{ x: 161, y: 179, width: 1118, height: 67 }`
      - `.recruitment-copy p`: `{ x: 427, y: 270, width: 586, height: 48 }`
      - `.recruitment-actions`: `{ x: 619.5, y: 366, width: 200.9, height: 43 }`
  - Section MAE: **`3.1427`** (evaluated against `Home-CTA-Revisi-1x.png`).
  - Regional MAE: Button & glow **2.3200**, Header **4.9498**, Copy **6.3726**, Outer padding **0.0000**.
  - All verification gates PASS: build (0 error), verify.mjs (exit 0), responsive audit (468/468 PASS), navbar audit (PASS), verify:vt (PASS).

## Homepage — Our Project Section (2 October 2026)

- Section node **`1430:2146`** ("Our Project Section", 1440 × 910, `padding: 80px`, gap: 82px), frame page Homepage `1430:2040`, file `JYUzJK1hFqaEwL6DpdDvjp`.
  Reference: `assets/assets home page/our project/Home-Project-Revisi-1x.png` (1440 × 910) & `Home-Project-Revisi-2x.png` (2880 × 1820).
  Isolated nodes: `Home-Project-Header-2x.png` (`1430:2147`), `Home-Project-Title-2x.png` (`1430:2150`).
- Layout & Spacing (Strict 8-Point Grid):
  - Section desktop: 1440 × 910px, padding 80px, background `#050507`.
  - Header Frame 2295 (`1430:2147`): 1280 × 101px at `x: 80, y: 80`, gap `8px` between eyebrow and title:
    - Eyebrow CTA `1430:2148`: "Our Project" (Manrope Regular 12/18, padding `4px 12px`, border-radius 32px, `rgba(255,255,255,0.15)` with Figma `GLASS` effect). Sits at `x: 80, y: 80, w: 86.6, h: 26`.
    - Heading `1430:2150`: "What Our Sorcery Create", **Bluu Next Bold 700 56px / 67px** (token `--font-display`), linear gradient per line `linear-gradient(180deg, #FFFFFF 15%, #999999 42%, #FFFFFF 80%)` (`background-clip: text`), text-align left. Sits at `x: 80, y: 114, w: 647.7, h: 67`. Ink width 646px matching reference ±0.5px.
  - Gap Header-to-Stage: **`82px`** (top of stage = 80 + 101 + 82 = 263px).
  - 3D Coverflow Stage Frame 2296 (`1430:2151`): 1280 × 567px at `x: 80, y: 263`.
    - Active center card Frame 2264 (`1430:2153`): 549 × 567px centered at `x: 445.5, y: 263`.
    - Image area: 549 × 349px (`y: 0 to 349`).
    - Tags: Manrope Regular 12/18 in `#6C3BFF` pills at `y: 305px`.
    - Title: Manrope Bold 700 26/39 white at `x: 53, y: 384`.
    - Description: Manrope Regular 400 16/24 white 451 × 72px at `x: 53, y: 437` (3 lines).
    - Reduced motion fallback: static pixel-exact composition with decorative underglow disabled under reduce.
- Measurements & Precision:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 910, top: 3399 }`
    - elements:
      - `.eyebrow`: `{ x: 80, y: 80, width: 86.6, height: 26 }`
      - `h2`: `{ x: 80, y: 114, width: 647.7, height: 67 }`
      - `.project-card.is-active`: `{ x: 445.5, y: 263, width: 549, height: 567 }`
  - Section MAE: **`5.0764`** (evaluated against `Home-Project-Revisi-1x.png`).
  - Regional MAE: Card Image **2.9047**, Card Tags **6.0592**, Card Text **5.9010**, Header **6.6790**, Bottom space **0.0000**.
  - All verification gates PASS: build (0 error), verify.mjs (exit 0), responsive audit (468/468 PASS), navbar audit (PASS), verify:vt (PASS).

- Section node **`1436:3506`** ("About Us Hero Section", 1440 × 866, `padding: 0 80px`), frame page Recruitment `1436:3505`, file `JYUzJK1hFqaEwL6DpdDvjp`.
  Reference: `assets/assets recruitment page/hero section/Recruitment-Hero-Revisi-1x.png` (1440 × 866) & `Recruitment-Hero-Revisi-2x.png` (2880 × 1732).
  Isolated nodes: `Recruitment-Hero-Header1-2x.png` (`1436:3508`), `Recruitment-Hero-Header2-2x.png` (`1436:4043`), `Recruitment-Button-Set-2x.png` (`1436:3502`).
- Content Frame 2733 (`1436:4047`): 1280 × 310 at `x: 80, y: 278`, vertical gap `48px` to button:
  - Hero Content Frame (`1436:3507`): 1280 × 219, vertical gap `16px` between heading and description.
  - Heading Frame 2732 (`1436:4044`): 900 × 176 at `x: 270, y: 278`, vertical gap `4px` between 2 lines:
    - Line 1 (`1436:3508`): "Your Next Chapter", **Bluu Next Bold 700 72px / 86px** (token `--font-display`), linear gradient per line `linear-gradient(180deg, #FFFFFF 15%, #999999 42%, #FFFFFF 80%)` (`background-clip: text`), text-align center. Ink width 621px (CSS) matching reference ±0.5px.
    - Line 2 (`1436:4043`): "Start here", **Bluu Next Bold 700 72px / 86px** (token `--font-display`), linear gradient per line `linear-gradient(180deg, #FFFFFF 15%, #999999 42%, #FFFFFF 80%)`, text-align center. Ink width 330.5px (CSS).
  - Hero Description (`1436:3509`): "Join Data Sorcerers and turn your curiosity into capability, experiments, research, and real-world projects.", Manrope Medium 500 18px / 27px, color `#EDE8FF`, 900 × 27px at `x: 270, y: 470`. Letter-spacing `-0.176px` ensures single-line rendering without premature word wrapping.
  - Vertical spacing: `h1` at y=278 (height 176), gap `16px`, description at y=470 (height 27), gap `48px`, button at y=545 (height 43, ends at 588). Symmetrical vertical centering: top space 278px, bottom space 278px (`278 + 310 + 278 = 866px`).
- Button Component Set `Apply Noww Button` (`1436:3502`):
  - Size: 120 × 43px (with "Apply Now" text), padding `8px 16px`, border-radius `20px`, font Manrope Medium 500 18px / 27px white. Sits at `x: 660, y: 545`.
  - Primary default (`1436:3501`): radial gradient `#6C3BFF` (0%) -> `#9B7BFF` (50%) -> `#6C3BFF` (100%), specular inner shadows `inset 0 2px 1.2px rgb(255 255 255 / 50%), inset -2px -2px 1.4px #bca6ff, inset -2px -2px 4px rgb(188 166 255 / 90%)`.
  - Primary hover (`1436:3499`): background smoothly transitions to solid `#2F196F` (`rgba(47, 25, 111, 1)`).
  - Secondary default (`1436:3498`): solid `#1A1A1A` (`rgba(26, 26, 26, 1)`), 12px blur, inner shadows.
  - Secondary hover (`1436:3500`): background solid `#4C3B7E` (`rgba(76, 59, 126, 1)`).
- Measurements & Verification:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 866, top: 0 }`
    - h1: `{ x: 270, y: 278, width: 900, height: 176 }`
    - copy: `{ x: 270, y: 470, width: 900, height: 27 }`
    - button: `{ x: 660, y: 545, width: 120, height: 43 }`
  - Responsive audit: 18 routes × 26 widths (468/468) **ALL PASS**.
  - Navbar audit: **ALL PASS**.
  - ClientRouter (VT): **ALL PASS**, pageerrors: none.

## Detail HoDS Pages (/hods/[id]) — Frame Height 1280px & Spacing (2 October 2026)

- Frame nodes Figma (file `JYUzJK1hFqaEwL6DpdDvjp`, page `Design`):
  - Data Intelligence: node `864:18857` (1440 × 1280, padding 80px)
  - Core AI & Engineering: node `864:18904` (1440 × 1280, padding 80px)
  - Language & Reasoning: node `864:18959` (1440 × 1280, padding 80px). Reference: `assets/assets home page/hods/detail/HoDS-Detail-Language-1x.png` (1440 × 1280) & `HoDS-Detail-Language-2x.png` (2880 × 2560).
  - Vision & Multimodal: node `864:19013` (1440 × 1280, padding 80px)
  - Product & Software: node `864:19024` (1440 × 1280, padding 80px)
  - Growth & Community: node `864:19035` (1440 × 1280, padding 80px)
- Perintah / Callout Gembala (Sat Sep 26 2026):
  - "Penyesuaian Height (tinggi card) menjadi 1280px untuk ALL Detile HoDS"
  - Seluruh frame halaman di Figma diseragamkan ke **1440 × 1280px**.
- Layout & Spacing:
  - Container `.hods-detail-inner`: `width: 100%; max-width: 1440px; min-height: 1280px; padding: 80px; gap: 56px;`
  - Back Link (`Frame 2391`): `151 × 27px` at `x: 80, y: 80`. Gap ke hero card: `56px`.
  - Hero Card (`card detile role (HoDS)`): `1280 × 279px` at `x: 80, y: 163` (`80 + 27 + 56 = 163`). Gap ke role-body (tabs): `56px`.
  - Content Tabs (`Frame 2491`): at `x: 80, y: 498` (`163 + 279 + 56 = 498`). Height `32px`, `gap: 8px` antar button.
  - Hero title (`864:18900` data / `864:19238` language): **Bluu Next Bold 700 48/57.6** (`--font-display`), gradient `270deg #fff → #ede8ff`, **Title Case** (mis. "Data Intelligence", "Language & Reasoning" — bukan uppercase). `.role-copy` di `(42, 85)` (Figma `864:18898`), gap title→deskripsi `14px`. Mapping judul di `src/data/hods.ts` diselaraskan Title Case dengan `src/data/domains.ts` (revisi 3 Oct 2026; sebelumnya `--font-heading`/Nasalization 400 uppercase).
  - Role Body gap: `32px` antara tabs dan panels.
  - Block gap: `16px` antara title H2 (`Manrope Bold 700 26/39`) dan description/bullets (`Manrope Medium 500 18/27`).
  - Panel gap: `42px` antar block.
  - Bullets: `gap: 8px` antar baris (Figma `798:2745`, **revisi 3 Oct 2026** — sebelumnya `13px`), tiap baris `gap: 23px` dot→teks (`798:2746`), dot `6×6` gradient `135deg`.
  - Mobile (`@media (max-width: 900px)`): `.hods-detail-inner` `min-height: 0; gap: 40px; padding: calc(40px + env(safe-area-inset-top, 0px)) 24px 40px;` dan `.hods-detail` `min-height: 100vh / 100lvh;`.
- Measurements & Precision:
  - `verify.mjs` assertions (diuji pada seluruh 6 rute `/hods/{data,core,language,vision,product,growth}`):
    - Container: `1440 × 1280` exact.
    - Back link: `{ x: 80, y: 80 }` exact.
    - Hero Card: `{ x: 80, y: 163, width: 1280, height: 279 }` exact.
    - Tabs: `{ x: 80, y: 498, width: 1280, height: 32 }` exact.
    - Heading: `font-family` mengandung **Bluu Next**, `font-weight: 700` (revisi 3 Oct 2026).
  - Reference PNG `/hods/language` (`HoDS-Detail-Language-1x/2x.png`) **diregenerasi dari Figma node `864:18959`** (3 Oct 2026) — export lama masih memakai judul uppercase Nasalization + art lama.
  - Regional MAE on `/hods/language` (reduce, 1440, vs reference baru):
    - Top (y 0–163): **0.2225**
    - Content (y 442–800): **0.5262**
    - Bottom space (y 800–1280): **0.7981**
    - Card (y 163–442, ilustrasi detail): **7.4359** (sisa resampler/kompresi webp, bukan offset — bbox tinta identik).
    - Full: **2.0956**
  - Responsive audit: 18 routes × 26 widths (468/468) **ALL PASS**.
  - ClientRouter (VT): **ALL PASS**, pageerrors: none.

## Homepage — House of Data Sorcerers (HoDS) / Choose Your Domain (2 October 2026)

- Section node **`1430:2138`** ("House of Data Sorcerers Section", frame `1430:2040`, file `JYUzJK1hFqaEwL6DpdDvjp`),
  1440 × 819, `padding: 80px`. Reference: `assets/assets home page/hods/Home-HoDS-Revisi-1x.png`
  (1440 × 819) & `Home-HoDS-Revisi-2x.png` (2880 × 1638). Sub-nodes: `Home-HoDS-Header-2x.png` (`1430:2139`),
  `Home-HoDS-Eyebrow-2x.png` (`1430:2141`), `Home-HoDS-Title-2x.png` (`1430:2143`).
- Typography & Header Group:
  - Header Frame 2284 (`1430:2139`), 1280 × 149 at `x: 80, y: 80`.
  - Frame 2283 (`1430:2140`), 1280 × 101, gap: 8px:
    - Eyebrow CTA `1430:2141`: "House of Data Sorcerers" (Manrope Regular 12/18, padding `4px 12px`, border-radius 32px,
      `rgba(255,255,255,0.15)` with Figma `GLASS` effect `box-shadow: inset 0 1px 1px rgb(255 255 255 / 40%)`). Sits at `x: 640.5, y: 80, w: 159, h: 26`.
    - Eyebrow to title gap: **`8px`** (was 14px in old layout).
    - Heading `1430:2143`: "Choose Your Domain", **Bluu Next Bold 700**, size **56px**, line-height **67.2px**,
      letter-spacing `0`, gradient `linear-gradient(181deg, #FFFFFF 15%, #999999 42%, #FFFFFF 79%)` (`background-clip: text`). Sits at `x: 451, y: 114, w: 538, h: 67`.
  - Heading to subtitle gap: **`24px`**.
  - Subtitle `1430:2144`: "Every Sorcerer specializes. Find your domain and go deep with a community of experts.", Manrope Regular 16/24, letter-spacing -0.176px, white, sits at `x: 80, y: 205, w: 1280, h: 24`.
- Card Rail & Domain Cards:
  - Header to rail gap: **`74px`** (y = 80 + 149 + 74 = 303).
  - Rail Frame 2509 (`1430:2145`): 1280 × 436 at `x: 80, y: 303`. Gap between cards: **`32px`** (reduced from 40px per Gembala note "spacing antar card dan ukuran card berubah").
  - 6 Domain Cards resized to **405px × 436px** (previously 394px / 399.98px):
    - Card 0 (Data Intelligence): `x: 80, y: 303, width: 405, height: 436`
    - Card 1 (Core AI & Engineering): `x: 517, y: 303, width: 405, height: 436`
    - Card 2 (Language & Reasoning): `x: 954, y: 303, width: 405, height: 436`
    - Card 3 (Vision & Multimodal): `x: 1391, y: 303, width: 405, height: 436`
    - Card 4 (Product & Software): `x: 1828, y: 303, width: 405, height: 436`
    - Card 5 (Growth & Community): `x: 2265, y: 303, width: 405, height: 436`
  - Card text box (`Frame 2726`–`2731`): `top: 27px, left: 42px` (Card 5 `left: 32px`), `width: 322px`, gap between title & desc: **`8px`**.
    - Title: Manrope Bold 700 22/33 white.
    - Description: Manrope Regular 400 16/24 white.
  - Card border & rim: `border-radius: 20px 0;`, 1px gradient rim `linear-gradient(135deg, #fff, rgb(var(--tint)) 50%, #fff)`.
  - Attract-mode step scroll and keyboard navigation (ArrowLeft/ArrowRight with step=437px, Home, End) preserved.
- Measurements & Precision:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 819, top: 2580 }`
    - header: `{ x: 80, y: 80, width: 1280, height: 149 }`
    - eyebrow: `{ x: 640.5, y: 80, width: 159, height: 26 }`
    - heading: `{ x: 451, y: 114, width: 538, height: 67 }`
    - cards: 6 cards at exact coordinates `[ 80, 517, 954, 1391, 1828, 2265 ]`, `y: 303, width: 405, height: 436`.
  - Geometry diff: **0.0px** across all elements.
  - Section MAE: **`2.4051`** (evaluated against `Home-HoDS-Revisi-1x.png`).
  - Responsive audit: 18 routes × 26 widths (468/468) **ALL PASS**.
  - ClientRouter (VT): **ALL PASS**, pageerrors: none.

## Homepage — What We Do (2 October 2026)

- Section node **`1430:2089`** ("What We Do Section", frame `1430:2040`, file `JYUzJK1hFqaEwL6DpdDvjp`),
  1440 × 840, `padding: 80px`. Reference: `assets/assets home page/what we do/Home-WhatWeDo-Revisi-1x.png`
  (1440 × 840) & `Home-WhatWeDo-Revisi-2x.png` (2880 × 1680).
- Typography & Heading:
  - Central heading group `1430:2419` (`Frame 2724`), 1280 × 172 at `x: 80, y: 334`.
  - Eyebrow pill `1430:2113`: `What We Do` (Manrope Regular 12/18, padding `4px 8px`, border-radius 32px,
    `rgba(255,255,255,0.15)` with Figma `GLASS` effect). Sits at `x: 678, y: 334, w: 84, h: 26`.
  - Eyebrow to title gap: **`8px`** (was 14px in old layout).
  - Title `1430:2420` (`Frame 2725`): **Bluu Next Bold 700**, size **56px**, line-height **67.2px**,
    letter-spacing `0`. Two lines: "Four Pillars" (`1430:2115`) and "of Innovation" (`1430:2418`), `gap: 4px`.
  - Gradient per line: `linear-gradient(181deg, #FFFFFF 15%, #999999 42%, #FFFFFF 79%)` (`background-clip: text`).
- Four Pillars Cards:
  - All four cards resized to **391px × 254px** (previously 311px / 309px):
    - Pillar 01 (LEARNING): `x: 80, y: 80, width: 391, height: 254`
    - Pillar 02 (EXPERIMENTATION): `x: 969, y: 80, width: 391, height: 254`
    - Pillar 03 (RESEARCH): `x: 80, y: 506, width: 391, height: 254`
    - Pillar 04 (BUILD): `x: 969, y: 506, width: 391, height: 254`
  - Strict 8pt grid & vertical layout:
    - Top row (cards 1 & 2): `y = 80 to 334` (height 254px).
    - Center row (heading group): `y = 334 to 506` (height 172px).
    - Bottom row (cards 3 & 4): `y = 506 to 760` (height 254px).
    - Section height: `80 + 254 + 172 + 254 + 80 = 840px`.
  - Card typography:
    - Number (01..04): Manrope Regular 16/24, letter-spacing -0.176px, `#EDE8FF`.
    - Title: **Manrope Bold 700 26px / 39px** (was Nasalization 24/36), letter-spacing 0, white.
    - Description: Manrope Regular 16/24, letter-spacing -0.176px, white.
    - Number to title gap: `0px` (Frame 2272). Title to description gap: `16px`.
    - Internal text box `Frame 2273`: 325 × 151px, centered horizontally (`left: 33px`) and vertically (`top: 51.5px`).
  - Card decoration & rim:
    - `border-radius: 20px 0;`
    - Card background: `rgba(255, 255, 255, 0.15)`.
    - Card 1px rim: `linear-gradient(135deg, #E0DCFF 0%, #2E276C 50%, #CBC5FF 100%)`.
    - Card glow: `card-glow.svg` at `left: -237.4px, top: 101.6px, width: 1230.8px, height: 357px`.
- Measurements & Precision:
  - `verify.mjs` assertions:
    - section: `{ width: 1440, height: 840, top: 1740 }`
    - eyebrow: `{ x: 678, y: 334, width: 84, height: 26 }`
    - heading: `{ x: 80, y: 369, width: 1280, height: 138 }`
    - cards: 4 cards at exact coordinates `[ {80, 80}, {969, 80}, {80, 506}, {969, 506} ]`
  - Geometry diff: **0.0px** across all elements.
  - Section MAE: **`2.5790`** (evaluated against `Home-WhatWeDo-Revisi-1x.png`).
  - Responsive audit: 18 routes × 26 widths (468/468) **ALL PASS**.

## Homepage — Our Philosophy (1–2 October 2026)

- Section node **`1430:2052`** ("Philosophy Section", frame `1430:2040`, file `JYUzJK1hFqaEwL6DpdDvjp`),
  1440 × 837, `padding 80px`, `#050507`. Reference: `assets/assets home page/ourphilosophy/Home-Philosophy-Revisi-1x.png`
  (1440 × 837) & `Home-Philosophy-Revisi-2x.png` (2880 × 1674).
- Heading & Typography:
  - Font moved to **Bluu Next Bold 700**, size **56px**, line-height **67px**, letter-spacing: `0%` (`0em`),
    2 lines (`We Don't  Just Learn AI` & `We Build With It`), `gap: 4px`.
  - Gradient per line: `linear-gradient(181deg, #FFFFFF 15%, #999999 42%, #FFFFFF 79%)` (`background-clip: text`).
  - Eyebrow pill `1430:2056`: `Our Philosphy` (Manrope Regular 12/18, padding `4px 8px`, border-radius 32px, bg `rgba(255,255,255,0.15)`).
- Spacing 8-point grid strictly implemented:
  - Content column (`1430:2054`): `591px` wide at `x: 766px, y: 205px` (`@media (min-width: 1400px)`).
  - Eyebrow to heading gap: **`8px`** (was 14px).
  - Heading to principles grid gap: **`48px`** (was 74px).
  - Principles item icon-to-font gap: **`24px`** (was 20px, strictly obeying Gembala's note).
  - Principle title to description gap: **`8px`**.
  - Principles grid: 2 columns × 3 rows, `column-gap: 92px`, `row-gap: 30px`, width `591px`, height `248px`.
  - Principles items: LEARN (63×64), SHIP (59×60), EXPERIMENT (63×64), IMPACT (63×64), RESEARCH / BUILD (59×60). Titles Manrope Bold 18/27 & descriptions Manrope Regular 14/21 white.
- Artwork & Glow:
  - Retains composite sorcerer illustration (`public/images/philosophy/sorcerer-{1x,2x}.{avif,webp}`) and reduced-motion static fallback.
  - Background glow: ellipse `1430:2053` at `x: 1195, y: 648`, 280 × 280, `#6C3BFF blur(175px)`.
- Isolation & Parity:
  - About Us variant (`variant="about"`) strictly isolated so it retains its full-bleed gradient and layout without regression.
  - Intermediate & mobile viewports use fluid clamp font-size with wrapping to eliminate any clipping at 320–1399px.
- Measurements & Precision:
  - `verify.mjs` geometry assertion: `heading: { x: 766, y: 239, width: 591, height: 138 }`, `principles: { x: 766, y: 425, width: 591, height: 248 }`.
  - Ink bounding boxes match Figma reference: Line 1 `w=587` (exact ±0.0px), Line 2 `w=425` (exact ±0.0px), Grid ink `x=[770, 1379] y=[429, 694]` (exact ±0.0px).
  - Mean Absolute Error (MAE): Full section **2.568**, Principles Grid **2.72**, Illustration **1.99**.
  - Responsive audit: 18 routes × 26 widths (468/468) **ALL PASS**.

## Contact page (1 October 2026)

- Route `/contact` (Figma page `1445:5065`, file `JYUzJK1hFqaEwL6DpdDvjp`);
  hero node **`1445:5066`** (1440 × 954, `padding 240px 80px 120px`, `gap 160`,
  `#050507`). A centered row (`gap 32`) holds a **587px left column**
  (`space-between`) and a **661px form panel**.
- Left column: "Contact Us" pill (`rgba(255,255,255,.15)`, radius 32, `4/12`,
  Manrope 400 12/18), **Bluu Next Bold 56 / 67** gradient title "Get in touch",
  Manrope Medium 18/27 copy, then three **info cards** (587 × 74, `padding 12px
20px`, radius 20, `rgba(255,255,255,.12)`, `gap 18`): 61 × 45 icon (each icon
  rect exported as a render — `icon-{email,whatsapp,office}.webp`), title
  Manrope Bold 16/24 white, value Manrope 400 16/24 `#ADADAD`, and a 37px
  `rgba(255,255,255,.15)` arrow disc (inline 10px SVG, `stroke #fff`). The cards
  are **not links** (no destinations were supplied — do not invent URLs).
- Form panel (661 × 594, `padding 20px 32px`, radius 20, `rgba(255,255,255,.12)`,
  `gap 32`): four fields (`gap 16`) — label Manrope Bold 16/24 white, input
  `padding 16px 14px`, radius 20, `rgba(255,255,255,.20)`, placeholder
  `#A3A3A3`; the Message control is a 135px textarea. Submit = full-width
  200px pill using the Join-Us radial gradient + inset shadows, Manrope Medium
  18/27. It is a real `<form>`/`<input>`/`<textarea>` (no endpoint wired yet).
- **Submit hover (6 Oct 2026).** The Submit button was inert; it now follows the
  site's violet-pill convention like `.community`/`.apply`: on hover the fill
  swaps to solid **`#2F196F`**, a soft violet outer glow
  (`0 12px 28px -10px rgb(108 59 255 / 60%)`) fades in, and the button lifts
  `translateY(-2px)` (press returns to `0`). `:focus-visible` gets a `#9B7BFF`
  2px outline; `data-sfx="click"` + `data-sfx-hover="hover"` wire the sound cues.
  Transitions are gated `@media (hover: hover) and (prefers-reduced-motion:
no-preference)`; `prefers-reduced-motion: reduce` sets `transition: none`. The
  base fill/geometry are untouched, so the `reduce` render stays pixel-exact
  (contactHero MAE **2.757**, unchanged).
- Purple swirl: the node `1445:5067` render placed absolutely at `-131/−92`
  (801 × 600) → `public/images/contact/hero-art.webp`; `npm run
assets:contact` regenerates it and the icons.
- **Figma GLASS effect (precision pass 1 Oct 2026).** The pill `1445:5072`, info
  cards `1445:5077` and form panel `1445:5098` use Figma's **GLASS** effect
  (`GET /v1/files/<key>/nodes` → `effects:[{type:"GLASS"}]`; `figma_get_figma_data`
  hides it). It renders a 1px specular rim + backdrop blur, NOT a stroke. Emulated
  with an `::after` ring + `mask-composite: exclude` (a real `border` would shrink
  the content box) and alpha calibrated from pixels (`37% → 11% @52% → 28%` over
  the fill). The input fields `1445:5102` and arrow discs `1445:5082` are **not**
  glass (plain `.20`/`.15` fill) — do not add a rim to them.
- **Contact hero reverted to Figma-exact (6 Oct 2026).** The #9 full-screen
  migration had replaced the artwork with a full-bleed background baked from
  `assets/hero gambar/contact page.png` → `/images/contact/hero-bg.webp`. User
  asked to match Figma exactly and **not** be full-screen, so the hero is back to
  the node `1445:5066` composition: the artwork `1445:5067`
  (`Contact-Hero-Art-2x.png`, re-verified **byte-identical** to a fresh Figma node
  export, MAE 0.000) is placed at `−131/−92`, **801 × 600**, over `#050507`; the
  section is a fixed **954** (`min-height: 954px`, no `100svh`), row at y240.
  `assets/hero gambar/contact page.png` is **not** used (it is a similar but
  differently-framed image — MAE ~16 vs the node — so it cannot be "exactly like
  Figma"). `hero-bg.webp` removed; `generate-hero-bg.mjs` no longer bakes Contact
  (the other five heroes keep their `hero-bg.*`). `generate-contact-assets.mjs`
  re-emits `hero-art.webp` (801, q88) + `hero-art-2x.webp` (1602, q86). `verify.mjs`
  asserts `art` = `.hero-art` `{−131,−92,801×600}`. **MAE 14.73 → 2.757** (the
  glass-pass level). 7 gate + seo ALL PASS.
- `verify.mjs` asserts the `contactHero` geometry (section 1440 × 954, row
  80/240/1280 × 594, left 587, form 661, art −131/−92/801 × 600, cards
  564/662/760 × 74, overflow 0) and diffs vs `Contact-Hero-1x.png`. MAE after the
  glass pass **3.00 → 2.76** (cards ~5.1 → ~3.4, form 1.35 → 1.11); the _navbar
  excluded_ content MAE is **~1.28** (the reference PNG includes the navbar, which
  `verify.mjs` hides). `responsive-audit` covers `/contact` (18 routes × 26 widths
  = 468) and the sitemap has 18 URLs.

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

- **REVISED (approved + implemented 3 Oct 2026).** The card was made **identical**
  to the homepage "Our Project / What Our Sorcery Create" card
  (`src/components/Projects.astro`, node `1430:2146`): active card **549×567**,
  `.hof-project-inner` fill `rgb(98 80 255 / 10%)`, 1px rim
  `linear-gradient(135deg, #e0dcff, #332959 52%, #332959 75%, #e0dcff)`,
  image `top .176% / 106.921676% × 61.552028% / opacity .8`, tags + copy, and the
  `.hof-project-card::before` radial violet glow. This **intentionally supersedes
  the PNG above** for the card art — the reference + `verify.mjs` assertions were
  regenerated in the same commit. The `.hof-project-card` class name is kept.
- Section node **`1439:4655`** ("Project highlights"), now **1440 × 1014**,
  `padding 80`, `gap 19`, `#050507`. Header `1439:4661` (803 wide, `gap 24`):
  a "Project Highlight" pill (`rgba(255,255,255,.15)`, radius 32, `4px 12px`,
  Manrope 400 12/18), title **Bluu Next Bold 56 / 67** gradient ("See What Our
  Sorcerers Create") and a Manrope Medium 18/27 subtitle. The old decorative
  **bow-tie glow** (`1439:4656`) was **removed** — the homepage has no
  stage-level glow, only the card's radial glow.
- Stage `.projects-stage` **1280 × 567** at `80/339`; the card is the homepage
  **549 × 567** flat card: `.hof-project-inner` fill `rgb(98 80 255 / 10%)`,
  1px rim `linear-gradient(135deg, #e0dcff, #332959 52%, #332959 75%, #e0dcff)`
  via `::after` + `mask-composite: exclude` (never a real border), image
  `top .176% / 106.921676% × 61.552028% / opacity .8`, tags (top `53.79%`,
  left `10.02%`, gap 16, `#6c3bff` pills) and copy (left `9.56%`, top `67.72%`,
  h3 Manrope 700 26/39, p 400 16/24). The active card shows the homepage radial
  glow (`.hof-project-card::before`, `rgb(108 59 255 / 68%)`, `bottom -26`,
  blur 24) — hidden under `reduce`, exactly like the homepage. Class stays
  `hof-project-card` (`verify.mjs`'s `setNavbarHidden` hides
  `.project-card:not(.is-active)`).
- **Coverflow ported from `Projects.astro`** (JS inline transforms, no slot
  classes): `base = min(1, stageW*0.9/549)`, `sideOffset = 549*0.838`,
  `step = 549*0.62`, `rotateY ±24`, `depth = -110*d`, side
  `blur(6+(d-1)*3) brightness(.72)`; ≤520px a single-card sliding track.
  **4 slides** from `src/data/projects.ts` (shared with the homepage) and
  **4 dots** (`.projects-dots`, 9px, `rgb(255 255 255 / 25%)`, active
  `#9b7bff`). Arrows `.project-arrow` (52px, stage sides `80/596.5` and
  `1308/596.5`; ≤1050 below the stage) drive the carousel; keyboard ←/→ (when
  the section is centred) and drag/swipe work; `astro:page-load` re-init +
  `AbortController` teardown on `astro:before-swap`.
- `npm run assets:hof` no longer writes `public/images/hof/projects/{shot,glow}.webp`
  (the card uses `public/images/projects/arutala-aksara.webp`, the shared Figma
  image); those served files + the glow/bar treatment were removed. The reference
  `assets/hall of frames/projects/HoF-Projects-1x.png` was **regenerated** from
  the new render (1440 × 1014) in the same commit. `verify.mjs` asserts the new
  `hofProjects` geometry (section 1440 × 1014, header 318.5/80/803 × 179, stage
  80/339/1280 × 567, centre 549 × 567 at 445.5/339, sides 346.4 × 367.4 at
  106.5/987, dots 66 × 9 at 687/925, arrows 52 × 52 at 80/596.5 & 1308/596.5,
  overflow 0) and `responsive-audit.mjs` skips
  `.hof-project-card:not(.is-active)` text.

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
- **Frame z-order fix (#11, 5 Oct 2026):** `.card-photo` `z-index:1`,
  `.card-frame` `z-index:0`, `.card-fade` `z-index:2`, `.card-meta` `z-index:3`.
  Before the explicit z-index the frame (later DOM sibling) painted **over** the
  portrait, so its line crossed the faces; now it sits behind (visible only
  through the cutout's transparent areas). MAE 2.008 → **1.973**.

## Hall of Frames — Featured Sorcerers detail modal (3 October 2026)

- Clicking a Featured card opens a native `<dialog>` detail card matching node
  **`1554:2824`** / panel **`1554:2897`**: **997 × 576** centered, `padding 88px
80px`, row, `gap 64`, radius 20, fill `rgba(5,5,7,0.5)`, GLASS rim (`::after`
  - `mask-composite: exclude`, top ≈22% white). Backdrop `1554:2896` = full-view
    `blur(7.7px)` + `rgba(217,217,217,0.01)`. Glow `1554:2898` served verbatim as
    `public/images/hof/detail/glow.svg` (positioned `-266.75/190.75`, 1470 × 728,
    clipped to the panel radius). Close `1554:2935` = 44 × 44 `#1A1A1A` + inset
    specular stack + `backdrop blur(6px)`, 18px `codicon:chrome-close` inline.
- Body `1554:2919` = 471 wide, gap 32; sections gap 16 ("Achievement" +
  "Contribution", Manrope 700 18/27). Three achievement bars (full width, 24
  tall, gap 12) with `linear-gradient(134deg,#fff 0%,#6c3bff 4–26%,transparent)`
  - 6px gradient dot; contribution Manrope 400 16/24. The card slot clones the
    clicked 302 × 400 card, so the art matches the section.
- **Bug A fix (6 Oct 2026):** JS `open()` cloned only `childNodes`, so class
  `is-lead` on the `<article>` was lost — the leader portrait appeared "memadat"
  (302×442 top −42 in modal vs 302×532 top −132 in grid). Fixed by toggling
  `is-lead` on `.fd-card` after `replaceChildren`:
  `cardSlot.classList.toggle('is-lead', article.classList.contains('is-lead'))`.
  Now `.fd-card` preserves the `is-lead` class and the leader photo matches the
  grid (302×532 top −132). Non-lead cards remain 302×442 top −42.
- **Bug B fix (6 Oct 2026):** Mobile `.fd-panel { overflow:auto; max-height:
calc(100dvh-48px) }` clipped the leader bleed (~115px above card vs panel
  padding-top 40px). Fixed by making `.fd-panel { overflow:visible;
max-height:none; margin-block:24px }` and moving scroll to the `<dialog>`:
  `.featured-detail[open] { place-items:start center; overflow-y:auto;
-webkit-overflow-scrolling:touch; padding:24px 0 max(24px,env(safe-area-inset-bottom)) }`.
  Portrait is fully visible, content scrolls, and the close button stays
  accessible.
- Content is placeholder (inline in `HallOfFramesFeatured.astro`; no data file).
  The dynamic list items use `:global(...)` because Astro scoped CSS does not
  reach JS-created nodes — without it the achievement bars do not paint.
- `scripts/generate-hof-assets.mjs` writes `detail/glow.svg`. `verify.mjs`
  asserts the dialog is hidden by default, the open geometry (panel 997 × 576
  centered at 720, card 302 × 400, body 471, 3 bars) and that Esc closes it;
  the closed-section diff vs `HoF-Featured-1x.png` is unchanged (MAE **2.008**).
- Life effects (gated `hover` + `prefers-reduced-motion: no-preference`): card
  lift + violet glow, panel pop-in, achievement-bar stagger, glow pulse, close
  rotate; sound cue on open/close (`data-sfx="click"`). Reduce stays exact.

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
  Frames" is a real link (`/hall-of-frames`) in `Navbar.astro` `destinations`
  ("Contact" too, at `/contact`; all navbar links are now live). A tab that is
  somehow not linked yet renders its active entry as an `aria-disabled` `<span>`,
  so the `active` class is applied to the disabled branch too — otherwise the
  current tab stayed `#707070` with no underline.
- Verification: `scripts/verify.mjs` asserts the hero/content/title/subtitle
  geometry (1440 × 903, 800 × 282, 80/102, 758 × 54), `overflow 0`, and diffs
  against `HoF-Hero-1x.png` (MAE 4.34). Build 18 pages, `verify.mjs` exit 0
  (`browserErrors: []`), responsive 320–3840 all clean (hero heroH
  903/760/100svh by breakpoint).
- **Full-screen migration (#9, 6 Oct 2026).** Video removed; hero art is now the
  supplied `assets/hero gambar/Hero Section - HoF.png` (5760 × 3612, text-free)
  baked by `npm run assets:heroes` to `/images/hof/hero-bg.webp` (1440 × 903) +
  `hero-bg-2x.webp`, section `min-height: 100svh` centred (`padding: 80px
var(--page-gutter)`). Content geometry unchanged (`320/310.5/800×282`); MAE
  4.34 → **4.11**. `verify.mjs` viewport for the hero is now 1440×903 (was 1400)
  and asserts no `.art-video`. Featured/Projects/Milestone gained
  `min-height:100svh` + centre — their content already exceeds the viewport, so
  heights stay 1241/1014/987 (MAE 2.14 / 0.20 / 1.49).

## Homepage hero — font & spacing revision (1 October 2026)

- **Figma frame `1430:2040` "Home Page Revisi Font & Spacing"**, hero section
  `1430:2041` (1440 × 903, `padding 80`, content vertically centred). Navbar
  instance `1430:2051`, hero buttons `1430:2048`. Reference renders exported with
  `figma_download_figma_images` to
  `assets/assets home page/hero section/Home-Hero-Revisi.png` (1×) and
  `*-2x.png`, plus the isolated text/button/navbar nodes used for measurement.
- **Headline**: Figma switched the display face from Nasalization to **Bluu Next
  Bold 700**, **72 / 86**, two lines `gap 4`, gradient painted per line
  (`linear-gradient(181deg, #fff 15%, #999 42%, #fff 79%)`). Bluu Next
  is **SIL OFL 1.1**, so it is now bundled: `public/fonts/bluu-next-700.woff2`
  (20 KB) + `BluuNext-OFL.txt`, declared at weight 700 (single cut, avoids faux
  bold) and exposed as the `--font-display` token. `--font-heading` (Nasalization)
  is untouched so other pages keep their current look until their own revision.
- **Koreksi gradient (3 Oct 2026)**: heading homepage dipindah ke gradient global
  Figma `Gradient Heading` **`181deg #fff 15% / #999 42% / #fff 79%`**
  (sebelumnya `211.54deg 32.8/49.8/73.04`). Fit ulang dari PNG: ink-MAE heading
  hero **13.7 → 7.7**. Berlaku juga untuk `Philosophy`, `WhatWeDo`, `Domains`,
  `Projects`, dan CTA home (`Recruitment.astro`).
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
  heights (hero 659 after the 3 Oct revision; Our Partners / Why still
  1075/670 pending their revision), card sizes (240×116, 309.5×189), 3 group
  pills and 20 cards at 1440.

## Partners — Hero revision (3 October 2026)

- New Figma file `JYUzJK1hFqaEwL6DpdDvjp`, page `1439:4787`, section
  **`1439:4788`** ("Hero Section - Partners", 1440 × 659, column, `align-items:
center`, `padding: 242px 80px 160px`, `gap: 8px`, IMAGE fill `e79b1f65…`).
  The old `assets/partners page/` exports (`RntmRWAgLrh5utgzcjrUik`) are hints
  only; the new node is the source of truth.
- **Content**: CTA pill `1439:4789` 228 × 26 at (606, 242), `padding: 4px 12px`,
  radius 32, `rgba(255,255,255,.15)`; text `1439:4790` Manrope 400 12/18 #fff
  "Create · Collaborate · Make an impact". Heading `1439:4791` **Bluu Next Bold
  700 80/102** (`--font-display`) 1280 × 223 at (80, 276); ink bbox **789 × 180 at
  (326, 295)**, wrapping to 2 lines ("Let's Build Something" / "Meaningful
  Together.") — measured from the exported text node with `sharp`.
- **Gradient**: MCP reports a single `Gradient Heading` on one text node, so the
  `181deg #fff 15% / #999 42% / #fff 79%` fill spans the whole 223px box, **not
  per line**. Fitting from the render: a per-line variant measured heading MAE
  **10.17** vs **7.56** for the single block, so the block gradient is kept
  (`background-clip: text` on the `h1`, spans `display: block`).
- **Artwork**: raw `imageRef e79b1f65…` downloaded to
  `assets/partners/hero/hero-fill-raw.png` (4096 × 1892) and baked as-is (SOP §5,
  `fit: cover`); `generate-partners-assets.mjs` now reads this raw instead of the
  older `Hero Section - Partners1.png`. `hero-bg.webp` (1440 × 665) + `-2x`.
  Background region MAE **1.204/255**.
- **Geometry (Chromium, reduced motion, 1440)**: section 1440 × 659; content
  1280 × 257 at (80, 242); pill 227.9 × 26 at (606.1, 242); title 1280 × 223 at
  (80, 276); `80px` / `102px` Bluu Next. Asserts added in `scripts/verify.mjs`.
- **MAE**: full-section **4.128/255** (the reference PNG includes the navbar
  instance, hidden by `verify.mjs`), **2.730** below the navbar band, heading
  7.561 (AA edges over the bright nebula), pill 16.5 (12px cross-renderer
  rasterisation). All 6 gates + `seo:audit` PASS. Reference
  `assets/partners/hero/Partners-Hero-1x.png`.
- **Full-screen migration (#9, 6 Oct 2026).** Video removed; hero art is now
  `assets/hero gambar/Hero Section - Partners.png` (5760 × 2636, text-free) baked
  by `npm run assets:heroes` to `/images/partners/hero-bg.webp` (1440 × 659) +
  `hero-bg-2x.webp`, section `min-height: 100svh` centred (`padding: 80px`).
  Figma content is **not** vertically centred (242 top / 160 bottom), so the
  reference is padded **asymmetrically** 81/163 to keep the (now centred at 323)
  content aligned; `verify.mjs` asserts hero height 903, content `80/323/1280×257`,
  title `80/357/1280×223`, static `.art-bg` and no `.art-video`. MAE rises to
  **12.67** (newer art than the stored reference; no threshold). Our Partners 3.05,
  Why DS 2.88 (padded 123/124), Footer 5.93.
- **Mobile hero variant (6 Oct 2026).** The wide 1440 × 659 art crops to an
  almost-empty centre slice on phones (only a sliver of one hand). Added a
  `<picture>` `<source media="(max-width: 600px)">` that serves a **portrait crop
  centred on where the two hands' fingers meet** (source px
  `left 1866 / top 0 / 1498 × 2636` from the 5760 × 2636 PNG) as
  `public/images/partners/hero-bg-mobile.webp` (480 × 845) + `-2x` (960) + `-3x`
  (1440), baked by `npm run assets:heroes` (its config now takes a `mobile` crop).
  Desktop (≥601px) keeps `hero-bg.webp`; verified unchanged at 1440. Result: the
  joined fingers stay visible on mobile without being full desktop.
- **Navbar mobile menu (6 Oct 2026).** The desktop active-underline was stretched
  (`width:100%`) inside the row-flex mobile row and read as a stray line; the
  mobile menu now hides `.mobile-menu .nav-underline` (the violet fill/hover is the
  state cue). Desktop underline untouched (`navbar-audit` still exact at 1440).

## Partners — Our Partners revision (3 October 2026)

- New Figma file `JYUzJK1hFqaEwL6DpdDvjp`, page `1439:4787`, section
  **`1439:4793`** ("Our Partners Section", 1440 × 1071, column, `padding: 80px`,
  `gap: 100px`, fill `#050507`). The old `1297:3541` (1075) export is a hint.
- **Groups**: `1439:4794` Industry (10 cards, 2 rows), `1439:4863` Academia (5),
  `1439:4900` Community (5); each group is a column `gap: 42px`. Header row
  `gap: 20px` = pill (`1439:4796` etc., `padding: 4px 16px`, radius 20, radial
  `circle at 8% 19% #6C3BFF 0% → #3C2188 98%`, inset `0 -1px 1.9px rgba(255,
255,255,.25)`, **Manrope 500 18/27**) + line wrapper `padding: 10px` holding a
  1px `90deg #9B7BFF → transparent` rule.
- **Grid**: column **and** row `gap: 16px` (was 20) → cards **243.2 × 116** (was
  240), radius 20, `rgba(255,255,255,.15)`. The card artwork is unchanged
  (`partner-card-bg.webp`, new node MAE 2.33); the placeholder logo is now
  **centred** (`left/top: 50%`, translate −50%, width 32.07% → 78 × 84) instead
  of the old left/top offsets. No heading exists, so no font change.
- **Geometry (Chromium, reduced motion, 1440)**: section 1440 × 1071; groups
  80 → 325/193/193 with gap 100; cards 243.2 × 116 (pitch 259.2, gap 16). Asserts
  updated in `scripts/verify.mjs`. Section MAE **2.860/255** (header/pill row
  2.62, Academia card row 6.82, bg 2.86). Reference
  `assets/partners/our-partners/OurPartners-1x.png`.

## Partners — Why DS revision (3 October 2026)

- New Figma file `JYUzJK1hFqaEwL6DpdDvjp`, page `1439:4787`, section
  **`1439:4937`** ("Why DS section", 1440 × 656, column, `padding: 80px`,
  `align-items: center`, `gap: 48px`, fill `#050507`). Header `1439:4938`
  (fixed 263, `gap: 8`): pill "Why Data Sorcerers?" (`1439:4939`, Manrope 400
  12/18, `rgba(255,255,255,.15)`, radius 32) + heading `1439:4941`
  **Bluu Next Bold 700 80/102** 1280 × 229 at (80, 114), wrapping to "More Than
  A Network" / "A Building Partner"; single `181deg #fff 15% / #999 42% / #fff
79%` gradient across the 2-line node (not per line).
- **Cards**: `1439:4942` row `gap 16`, four fixed **309.5 × 185** frames at
  x `77 / 402.5 / 728 / 1053.5` (row width 1286, centred). Card `padding 28`,
  `gap 16`, `rgba(255,255,255,.15)`, 1px `135deg #EDE8FF → #2E276C → #EDE8FF`
  rim, radius 20. Icon row `gap 16`: 58 × 63 icon + Manrope 700 26/39 title;
  desc Manrope 400 16/24 `#EDE8FF`.
- **Glow**: raw IMAGE-SVG `1439:4949` (710.51 × 336.07 at `(-145.16, 50.11)`),
  exported and used verbatim (`why-glow.webp`, fitted placement `(-184, -18)` on
  the card → expressed as percentages). **Icons**: the four features are crops of
  one sprite (`imageRef 36308539…`, `imageTransform` `[[0.2143,0,tx],[0,0.4606,
0.2369]]`, tx `0.0255 / 0.2656 / 0.5021 / 0.7533`); `generate-partners-assets.mjs`
  now `extract`s each crop and resizes to 58 × 63 (`why-*.webp`, 2×) — the old
  placeholder icons were replaced. Icon node diff MAE 3.19, alpha bbox identical.
- **Geometry (Chromium, reduced motion, 1440)**: section 1440 × 656; header
  1280 × 263 at (80, 80); pill 139.8 × 26 at (650.1, 80); title 1280 × 229 at
  (80, 114); grid 1286 × 185 at (77, 391); card 309.5 × 185. Asserts in
  `scripts/verify.mjs`. Section MAE **3.216/255** (heading 4.87, pill 16.4,
  cards 8.57, bg 0.000). Reference `assets/partners/why-ds/WhyDS-1x.png`.

## Partners — Footer (3 October 2026)

- Page node `1439:4983` (1440 × 556) is **pixel-identical** to the recruitment
  footer export (`Recruitment-Footer-Revisi-1x.png`, MAE **0.060**) — the shared
  `Footer.astro` already matches. `verify.mjs` now also diffs the Partners page
  footer against `assets/partners/footer/Partners-Footer-1x.png` → MAE
  **5.873/255** (on par with the homepage 5.838). **Partners page complete.**

## About Us — Hero (2 October 2026)

- Figma file `JYUzJK1hFqaEwL6DpdDvjp`, page `1439:4184`, section **`1439:4185`**
  ("Hero Section - About Us", 1440 × 903, column, `padding: 80px`,
  `justify-content: center`, `gap: 16px`). Fill = IMAGE `34bc68…` = the same raw
  artwork as the old `assets/assets about us/hero/raw-hero-bg.png`
  (4096 × 2594, pixel-identical; served as `public/images/about/hero-bg.webp`
  - `-2x`/mobile variants, `object-fit: cover`).
- Content frame `1439:4186` (1280 × 287.4, hug, column, `gap: 16px`, centered)
  at `(80, 307.8)`:
  - Headline `1439:4187` (`width: 1124`, Bluu Next **Bold 700**, `80 / 95.2px`,
    `letter-spacing: -0.88px`, center) at `(158, 307.8)`, 1124 × 190.4.
    Fill `Gradient Heading` = `linear-gradient(181deg, #fff 15%, #999 42%, #fff 79%)`.
    The text wraps to **2 lines as "Architecting the Future of AI" / "& Data
    Innovation."** (a single Figma text node — the gradient spans the whole node,
    but per-line `background-clip: text` is used since each visual line reads the
    same here; verified MAE-equivalent). The MCP string (`15% / 42% / 79%`) was
    cross-checked against the REST API: `gradientStops` 0.3103/0.4537/0.6498 on a
    handle line from y −0.4427 → 1.4583 map to box-relative 14.7% / 42.0% / 79.3%,
    i.e. the MCP string is correct for this node.
  - Subtitle `1439:4188` (`width: 680`, Manrope **Medium 500**, `18 / 27px`,
    `#fff`, center) at `(380, 514.2)`, 680 × 81 (3 lines), effect
    `DROP_SHADOW 0 4 20 rgba(0,0,0,1)` → `text-shadow: 0 4px 20px #000`.
- `AboutHero.astro` revised from `--font-heading` (Nasalization) to
  **`--font-display` (Bluu Next Bold 700)**. Navbar instance `1439:4189` is part
  of the hero PNG; `verify.mjs` hides `.navbar`, so the hero MAE is reported with
  and without the navbar band.
- Reference: `assets/about-us/hero/About-Hero-Revisi-1x.png` (+ `-2x`, plus the
  separate headline/subtitle text nodes and the raw image fill). Chromium geometry
  diff **0.0px** (section 1440 × 903; content `(80, 307.8, 1280, 287.4)`; headline
  `(158, 307.8, 1124, 190.4)`; subtitle `(380, 514.2, 680, 81)`).
  Section MAE **4.6874/255** full (**3.7902** below the navbar band; headline
  region 10.84 = cross-renderer glyph edge AA over the bright nebula, subtitle
  5.43). All 6 gates pass.

## About Us — Vision & Mission (2 October 2026)

- Figma page `1439:4184`, section **`1439:4190`** ("visi misi section",
  1440 × 840, column, `padding: 80px`, `gap: 100px`). Background = the shared
  **`<Starfield />`** living sky (same tiles/drift as What We Do / Who Should
  Join / FAQ), overriding the Figma IMAGE fill `ff47b4…`. Base colour `#050507`
  (matches the section fill); the old baked plate
  `public/images/about/visi-misi-bg.webp` (+ `-2x`) is **no longer served**
  (`assets/about-us/visi-misi/visi-misi-bg-raw.png` kept as reference only).
- Vision block `1439:4191` (1280 × 145.2) at `(80, 80)`: heading `1439:4193`
  ("OUR VISION", 586 × 67, Bluu Next **Bold 700** 56 / 67.2, gradient
  `181deg #fff 15% / #999 42% / #fff 79%`) + body `1439:4194` (906 × 54,
  Manrope Medium 500 18 / 27 `#fff`), `gap: 24px`.
- Mission block `1439:4195` (1280 × 435.2) at `(80, 325.2)`: heading `1439:4197`
  ("OUR MISION", same style), body `1439:4198` (828 × 54), list `1439:4199`
  (797 × 266, `gap: 16px`). Six rows (`1439:4200`…`1439:4215`): height 31,
  `padding: 2px 16px`, `gap: 10px`, widths `713 / 733 / 746 / 775 / 786 / 797`.
  Row fill = `linear-gradient(134deg per MCP, but the real handles at
p0(-0.036,0)→p1(1,1)` are near-horizontal)`. **The MCP string is lossy here**:
fitting the rendered pixels gives an effective CSS gradient of
`linear-gradient(100deg, #fff -3.5%, #6c3bff 3.6%, #6c3bff 56.7%,
  rgba(108,59,255,0) 100%)`(bar-strip MAE 0.59). The number spans use`linear-gradient(180deg, #9b7bff, #fff)`.
- Tarot artwork `1439:4218` (356 × 430) at `(1028, 261)` served from the HD 4×
  source `assets/assets about us/visi misi/hd tarrot card Assets-1.png`
  (1424 × 1720) as `tarot-cards.webp` / `-2x` / `-3x` (q90/88/86, alpha kept) by
  `npm run assets:about`.
- `VisiMisi.astro` uses **`--font-display` (Bluu Next Bold 700)** headings and
  the shared `<Starfield />` background (the baked starfield plate was removed
  3 Oct 2026 at the client's request: "living stars like What We Do").
- Reference `assets/about-us/visi-misi/VisiMisi-Revisi-1x.png` (+ `-2x`, plus
  separate heading/body text nodes). Chromium geometry exact (section
  1440 × 840.40625; vision `(80, 80, 1280, 145.2)`; mission
  `(80, 325.2, 1280, 435.2)`; list `(80, 494.4, 797, 266)`; tarot
  `(1028, 261, 356, 430)`). Section MAE **~5.85/255** vs the old reference — the
  background is intentionally the living Starfield now (static pattern differs;
  reduced-motion shows only the Starfield base tile). Text/list/tarot regions are
  unchanged vs the previous **1.910** (vision 3.11, list 3.35, tarot 1.16). All 6
  gates pass.

## About Us — Philosophy (2 October 2026, background-blend revision 3 Oct 2026)

- New Figma page `1439:4184`, section **`1439:4219`** ("Philosophy Section",
  1440 × 837). The fill is now a **gradient** (Figma handles
  `p0(0.553,0.545) → p1(0.798,1.681)`, stops `#050507 → #6c3bff`) so the section
  **blends into Our Ecosystem** (`1439:4258`) below. Fitted from the node PNG:
  `linear-gradient(159.7deg, #050507 54.82%, #6c3bff 133.76%)` (fit
  **MAE 0.554** on pure-background pixels; MCP's normalised `168deg` is lossy, as
  documented in the SOP). Painted on the **section** (not the canvas) to mirror
  Our Ecosystem's section-level gradient — the seam stays continuous
  (max channel Δ **9** at 1440/1920/2560, identical to the reference's own
  left-edge delta). The About node has **no** standalone bottom-right glow
  ellipse (the home node `1430:2053` does), so
  `.philosophy.is-about .canvas::before { display: none }`.
- **Homepage Philosophy (`1430:2052`) is unchanged** — flat `#050507` + glow
  (fresh export MAE **0.000**). Do not merge the two variants again.
- `Philosophy.astro`: the `about` variant uses the same layout/artwork as home
  but the section carries the gradient and the home glow is hidden. The uncapped
  wide-screen `zoom` on the canvas is retained.
- Reference `assets/about-us/philosophy/Philosophy-Revisi-1x.png` regenerated from
  node `1439:4219`. Chromium geometry exact (section 1440 × 837; content
  `(766, 205, 591, 468)`; principles `(766, 425, 591, 248)`). Section MAE
  **2.041/255** (bottom-right region 0.88). All 6 gates pass.
- Content frame `1439:4221` (591 × 468) at `(766, 205)`, `gap: 48px`: eyebrow
  `1439:4223` "Our Philosphy" (93 × 26, glass pill), heading `1439:4226`/`4227`
  ("We Don't Just Learn AI" / "We Build With It", Bluu Next **Bold 700**
  56 / 67.2, `gap: 4px`), principles grid `1439:4228` (591 × 248, grid
  `30px 92px`) with 5 items (LEARN / SHIP / EXPERIMENT / IMPACT / RESEARCH
  BUILD). Artwork = the same sorcerer + glow as the homepage.
- **TODO (NEXT) — glow responsif + karakter tepi.** Gradient masih dipasang di
  `<section>` sementara konten di-`zoom`; di lebar >1440 pita ungu bergeser
  (cuma sudut) dan `.illustration` ikut membesar alih-alih menempel tepi. Rencana
  - acceptance: **`docs/about-us-glow-plan.md`**. Baseline 1440 (MAE **2.041**)
    tidak boleh berubah.

## About Us — Our Ecosystem (2 October 2026)

- New Figma page `1439:4184`, section **`1439:4258`** ("Our Ecosystem Section",
  1440 × 874, column, `padding: 80px`, `gap: 116px`). Fill gradient handles
  `p0(0.471,0.426) #050507 → p1(0.798,−0.735) #6c3bff` map to CSS
  `linear-gradient(24.87deg, #050507 52.9%, #6c3bff 132.9%)` — the previous
  `24.75deg 53% / 133%` is within rounding, so it is retained.
- Header `1439:4259` (931 × 172) at `(254.5, 80)`, `padding: 10px`: eyebrow
  `1439:4262` "Our Ecosystem" (100 × 26, GLASS, `margin-bottom: 8px`) + heading
  `1439:4264` "From Community to Impact" (Bluu Next **Bold 700** 56 / **67px**,
  gradient `181deg #fff 15% / #999 42% / #fff 79%`) + subtitle `1439:4265`
  (911 × 27, Manrope 500 18 / 27). The heading **line-height is 67px, not
  67.2** — Figma reports `lineHeightPx 67.2` but the node bbox is 67; using 67
  keeps the header at exactly 172 (and the pipeline at 368). With 67.2 the
  section MAE read 3.45, with 67 it is 2.22.
- Pipeline `1439:4266` (1280 × 426) at `(80, 368)`, `gap: 18px`: 5 bottom-aligned
  columns (`188/175/188/175/175`, connector heights `188/116/188/116/217`),
  bottoms at y 776, baseline Line 11 at y 794. Step number Manrope 700 56 / 54,
  fill gradient `180deg #6c3bff 20.8% → rgba(5,5,7,0) 75%`; step title **Manrope
  500 18 / 27** (was 700 in the old design); description Manrope 400 14 / 21.
- Reference `assets/about-us/ecosystem/Ecosystem-Revisi-1x.png`. Chromium
  geometry exact (section 1440 × 874; header `(254.5, 80, 931, 172)`; pipeline
  `(80, 368, 1280, 426)`; line bottoms 776). Section MAE **2.221/255**
  (header 4.18, pipeline 3.20). All 6 gates pass.
- **TODO (NEXT) — glow responsif.** Gradient di `<section>` melebar saat >1440
  (pita ungu bergeser, seam rusak). Rencana + acceptance:
  **`docs/about-us-glow-plan.md`**. Baseline 1440 (MAE **2.221**) tidak boleh
  berubah; seam dengan Philosophy tetap Δ ≤ 9.

## About Us — Our Team revision: HoDS carousel (5 October 2026)

- Figma section **`1688:2933`** ("Our Team Section") + component set
  **`1594:5145`** ("Component per HoDS"). Reference export
  `assets/about-us/team/OurTeam-New-1x.png` (1440 × **1562**). Master Work Plan:
  `docs/our-team-hods-plan.md`.
- Section: `padding 80px`, header→groups `gap 48px`, fill `#050507`. Header
  `1688:2934`/`2935` (eyebrow `1688:2937` "Our Team" + heading `1688:2939` "The
  Sorcerers Behind It All", Bluu Next 700 56/67 gradient 181°). Groups frame
  `1688:2940` = **1287 wide centered** (→ x 76.5).
- Group 1 `1688:2941` (**"Leader Team"**, title Bluu Next 700 56 gradient):
  2 cards `302 × 400` gap 24, centered → x 406 / 732.
- Group 2 `1688:2978` (**"House of Data Sorcerers"** — kode betulkan ejaan Figma
  "Hause" → "House" 5 Oct 2026; reference regenerated): instance `1594:5144`. Top frame `gap 16`: chips row (arrow 37 + 3×
  chip 300×49 gap 16 + arrow 37 = 1038, centered) + 2 dots `6×6` gap 8; then
  `gap 72` to a 4-card row `302 × 400` gap 24, **left-aligned** → x 76.5 /
  402.5 / 728.5 / 1054.5.
- **6 variants** (Data, Core, Language, Vision, Product, Growth); chips paged
  **3 at a time** (2 pages); arrows cycle the active HoDS (wrap); dots show the
  page. Selected chip tint + card bottom fade = the domain tint (Figma `-12deg`
  chip string is lossy → fitted `90deg` dark→light from the PNG; fade
  `180deg rgb(tint/0) → dark`, Core keeps the mid-stop `30% @ 50%`). Card info
  `x42 w217` gap 7; role `#D8D1D1`. Growth #4 = **"Join Now!"** card
  (`1598:5506`, "?" 120/102 gradient white→violet) → links `/recruitment`.
- Components: `TeamCard.astro` (card) + `OurTeam.astro` (section + carousel JS,
  `AbortController` + `astro:page-load`/`astro:before-swap`, reduce = instant).
  Data in `src/data/team.ts` (`leaderTeam` + `hodsTeams`). `verify.mjs` asserts
  the full geometry + default panel + chip-click carousel state; reference has
  no pad (1562 > viewport). `responsive-audit.mjs` excludes the deliberate
  `.hods-chips-viewport` pager. Section MAE **3.305/255** (header 3.49, leader
  cards 2.94, chips 6.82, hods cards 5.93 — residual = cross-renderer glyph AA +
  the 0.5px container offset). 7 gate + seo ALL PASS.
- **Card glow / rim revision (fix #4, 5 Oct 2026).** REST node `1594:4370`:
  `effects:[{type:"GLASS"}]` (no DROP_SHADOW/radial); the visible "glow" is the
  bottom fade + GLASS rim. `fade()` now emits a **real tint stop at 35% @ 35%**
  (`rgb(tint/0%) → rgb(tint/35%) 35% → dark`), because CSS interpolates
  gradients premultiplied and a plain `tint 0% → dark` collapses to a flat dark
  veil. Data dark `#0f0001 → #170002`. `TeamCard.astro` rim `::after`
  `180deg rgba(255,255,255,.35)→.06` → `180deg .25→.02`. Fitted per visible
  variant (Core leader + Data HoDS) by in-browser A/B. Section MAE
  **3.503 → 2.774/255 (−20.8%)**.
- **HoDS portrait bleed (#12, 5 Oct 2026).** User: kartu "House of Data
  Sorcerers" jangan terpotong, "dibikin kayak Hall of Frames". Figma reference
  **meng-clip** kartu (leader & HoDS) — jadi ini **deviasi sengaja**. Hanya
  **HoDS** yang di-unclip (`.hods-panel :global(.team-card){overflow:visible}`),
  leader tetap clip (bleed 132px akan menabrak judul). `.team-cards--hods` dapat
  `padding-top:48px; margin-top:-48px` supaya `overflow-x:auto` (yang meng-clip
  cross-axis) tetap memberi ruang bleed 42px. Geometri kartu tetap y=1082;
  clearance 30px dari dots. Section MAE ~2.64.

## About Us — Our Team (2 October 2026, superseded 5 Oct 2026)

- New Figma page `1439:4184`, section **`1439:4305`** ("Our Team Section",
  1440 × 1536, column, `padding: 80px`, `gap: 80px`, fill `#050507`). Header
  `1439:4306` (1280 × 101): eyebrow `1439:4307` "Our Team" + heading `1439:4309`
  "The Sorcerers Behind It All" (Bluu Next **Bold 700** 56 / **67px** — Figma
  bbox 67; gradient `181deg`). Total = 80 + 101 + 80 + 1195 + 80 = 1536.
- `team 2` instance `1439:4310` (1280 × 1195, `gap: 80`): group Leader
  (`…;1260:17189`, 2 cards) + group Data Intelligence (`…;1260:17194`,
  5 cards) + "see more" button. Group label = 8px gradient dot + Nasalization
  400 32 / 48 (`--font-heading`, falls back to sans off the dev machine).
- Card `card orang` (302 × 400, radius 10): `rgba(255,255,255,.1)` + GLASS rim;
  decorative frame `…;1260:16765` "Mask group" (295 × 277 at 3,13) exported as
  `card-frame.webp`; portrait `…;1260:16768` / `…;1260:16785` uses a Figma
  `imageTransform` crop — baked to the node sizes (`public/images/team/{marchel,
zidan-rose}.webp`, 302 × 532 / 302 × 442); fade `…;1260:16769`
  (302 × 153, bottom) fitted to `linear-gradient(180deg, rgba(108,59,255,0),
rgba(108,59,255,.3) 50%, #0e0626)`; info frame `…;1260:16770` (222 × 94 at
  40,284): name Manrope 700 22 / 33, 1px divider `rgba(255,255,255,.3)`, role
  Manrope 400 16 / 24, two 16px social icons. Placeholder member data lives in
  `src/data/team.ts` (7 entries; the design only ships 2 unique portraits and
  placeholder names — swap for real data, do not invent URLs).
- "See More" button `…;1260:16901` (component `1248:15694`, 141 × 43, radius
  200, **GLASS**): fill `#1A1A1A` + a "liquid" child `rgba(217,217,217,.1)` and
  a bottom-right specular rim (reference rim reads ~226 bottom-right / ~117
  top-left). Emulated in `OurTeam.astro` with `background:#1a1a1a`, a `::before`
  radial sheen over `rgba(217,217,217,.1)` and inset shadows
  (`-2px -2px 3px rgba(255,255,255,1)`, `2px 2px 3px rgba(255,255,255,.28)`,
  `0 0 0 1px rgba(153,153,153,.55)`) + `backdrop-filter: blur(6px)`. The earlier
  `#161616` + top-left radial highlight read far too dark (interior ~22 vs the
  reference ~46; button-region MAE ~29). New component `OurTeam.astro`.
  Generator additions in `scripts/generate-about-assets.mjs`
  (`npm run assets:about`).
- Reference `assets/about-us/team/OurTeam-Revisi-1x.png` (a fresh export of node
  `1439:4305` is pixel-identical, MAE 0.000). Chromium geometry exact (section
  1440 × 1536; header `(80, 80, 1280, 101)`; groups `(80, 261, 1280, 1072)`;
  card `(80, 357, 302, 400)`; button `(649.8, 1413, 140.5, 43)`). Section MAE
  **2.770/255** after the button fix (was 2.828 with the dark button); the button
  region is ~17.85, bounded by the Manrope text cross-renderer AA floor (~22.6).
  All gates pass.

## About Us — Footer (2 October 2026)

- Section `1439:4311` in page `1439:4184` is the shared `Footer.astro` component
  instance (`765:17071`), 1440 × 556. It renders identically to the homepage and
  recruitment footers (already verified there). Reference
  `assets/about-us/footer/About-Footer-Revisi-1x.png`; `verify.mjs` asserts
  `{ width: 1440, height: 556 }` and diffs it (MAE **6.38/255**, in line with the
  homepage 5.84 / recruitment 7.71 — residual is the hero/artwork-independent
  cross-renderer text offset documented in §Footer).

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
- **Responsive glow + character fix (4 Oct 2026).** Canvas zoom `calc(100vw / 1440px)` removed from both Philosophy About and Our Ecosystem. The gradient stays **section-level** (full-bleed) so the purple band stretches predictably across the viewport at any width; the artwork anchors via `left: calc((1440px - 100cqw) / 2)` (≥1441px) so it stays 861px and hugs the left section edge, matching the Home variant. verify.mjs assertions updated — zoom is 1, canvas is 1440px centered, art at {0,861}. Seam delta 0 at 1440.
- **Philosophy gradient re-fitted (3 Oct 2026).** The team updated node
  `1439:4219` in the new file to a gradient (handles `p0(0.553,0.545) →
p1(0.798,1.681)`) so About Philosophy blends into Our Ecosystem. The current
  CSS is `linear-gradient(159.7deg, #050507 54.82%, #6c3bff 133.76%)` (fit
  MAE 0.554), painted on the **section** (not the canvas) to mirror the
  Ecosystem section-level fill; the home glow (`canvas::before`) is hidden for
  the About variant. All wide-screen `zoom`/containment assertions still pass.
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

- Figma node: `765:17071` (component) / `1436:3699` (recruitment instance);
  reference: `assets/assets recruitment page/footer/Recruitment-Footer-Revisi-1x.png`
  (1440 × 556) + `…-2x.png`. The shared `Footer.astro` is used by all six pages.
- Frame: 1440 × 556 at 1×; padding `80px 80px 28px`; column gap 60.
- Row 1 is `1280 × 314`. Brand column at x=80: brand lockup 206 wide
  (**Bluu Next Bold 700 32/38.4**, gradient `linear-gradient(270deg, #fff, #EDE8FF)`;
  Manrope Regular 16/24 tagline; lockup gap 8), a 17.5/28.44 `#fff` three-line
  statement (copy gap 24), then two 48 × 48 social buttons (0.75px `#fff` border,
  24px white icons). Navigation column at x=652.73 and Contact column at x=1096.33;
  each header is Manrope Bold 16/24, gap 32 to the list, and each list uses a 16px gap.
- Row 2: 1px divider `rgb(203 197 255 / 30%)` at y=454.13, then the legal bar at
  y=475.13 — copyright "© DATA SORCERERS 2026. All right reserved" at x=80
  (matches the PNG copy), Manrope Regular 16/24. Terms/Privacy/Cookies are
  **right-aligned** (approved mentor revision on 23 Sep 2026, superseding the
  older PNG's left-grouped links at x≈640); the 30px gap between them is retained
  from that approved revision (the PNG's left-grouped gaps measure ≈33–37px, so it
  is not directly comparable).
- **Scroll-up arrow revision (#10, 5 Oct 2026).** The Figma arrow `1564:3289`
  (37 × 37, `rgba(255,255,255,.15)`, hover violet, `href="#"` → scroll top) is
  now rendered **inside `.bottom`** as `position: absolute; right: 0; bottom:
calc(100% + 8px)` (`.bottom { position: relative }`) so it sits **above the
  divider/landed legal row** — per user request. The earlier `position: fixed` +
  `IntersectionObserver` floating version (#8) was reverted. Doesn't affect the
  footer geometry (absolute, out of flow).
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
- Visual validation compares the revised PNG, asserts the 1440 × 556 frame,
  column x positions (80 / 652.73 / 1096.33), the divider (y 453.69 ± 1.5) and
  legal bar (y 474.69 ± 1.5), and checks text containment from 320px through
  1920px. Homepage footer MAE **5.84/255** (brand region 3.0; the right-aligned
  legal links diverge from the PNG by design, plus anti-aliased text over the
  bright landscape); recruitment footer MAE **7.71 → 7.66/255** (audit 3 Oct 2026;
  same component, but the fractional page position adds the documented 1px
  sub-pixel offset). **Audit 3 Oct 2026 (Section 9): no code change** — Figma fill
  (`imageRef 89bb3b26…`, 4096×1576) dicocokkan dengan bake kita (MAE ~4 = resampling
  tekstur landscape, irreducible); region ter-align brand 2.7 / nav 3.8 / contact
  5.0; socials & legal lebih tinggi karena duduk di atas tekstur terang. Diff utama
  = legal links right-aligned (disengaja) + backdrop resampling + sub-pixel origin.
- **Revision (2 Oct 2026).** The Figma footer was updated: brand name
  Nasalization → **Bluu Next Bold 700 32/38.4**; brand lockup gap 14 → 8, brand
  copy gap 26 → 24, nav/contact gap 34 → 32; description `#CBC5FF` → `#fff`;
  social borders + `instagram.svg`/`linkedin.svg` fills `#CBC5FF` → `#fff`;
  copyright "All rights reserved" → "All right reserved" (per PNG). Top row is
  now `1280 × 314` and the divider moved 463.69 → 454.13.
- The Recruitment page reuses this same `Footer.astro` component (its
  `footer.txt` points at the same Figma node `765:17071` / instance `1436:3699`
  and the same 1440 × 556 reference).

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
  against the reference PNG (MAE **1.60/255**; residual is font/glass
  rasterization and the reference's embedded navbar band), and checks horizontal
  overflow and clipped hero text from 320px to 1920px.

- **Hero precision revision (3 Oct 2026).** Strict per-section audit of node
  `1436:3506` found the static fallback was stale and repaired three issues:
  - **Artwork.** The node now carries a **1672 × 941 IMAGE fill**
    (`imageRef eb3f5f4e…`) cropped by its `imageTransform`
    (`scaleX .8975 / tx .05126`, `scaleY .9590`) and stretched to 1440 × 866.
    The raw fill is vendored as
    `assets/assets recruitment page/hero section/recruitment-hero-fill-raw.png`
    and baked (crop `86,0,1500,902` → resize 1440 × 866) by
    `scripts/generate-backgrounds.mjs` → `public/images/backgrounds/recruitment.webp`.
    The old `assets/background/hd/recruitment.png` (1586 × 992) was a different
    image (background MAE 8.4 → **1.28** with the correct crop).
  - **Overlay.** The `.artwork::after` dark gradient is **not in the node**
    (the reference background is pixel-identical to the raw crop, e.g. at
    x=200 the rows match 12/12, 45/45, 51/51). Removed — keeping it cost ~3 MAE.
  - **Copy tracking.** The description had `letter-spacing: -0.176px`, but the
    Figma style `Typography/Manrope - Body/B-1` has **no** letter-spacing; it
    shrank the line ~20px (ink 862 vs 882). Removed → copy-region MAE
    16.6 → 3.3.
  - Heading fill aligned to the global Figma `181deg #fff 15% / #999 42% /
#fff 79%` (was `180deg … 80%`; heading band 2.92 → 2.73).
  - Net: full-section MAE **11.909 → 1.600** (below-nav 1.412); geometry
    unchanged (`h1 270/278/900×176`, copy `270/470/900×27`, button
    `660/545/120×43`). Note: the node's `Navbar` instance means the reference's
    top 110px is the navbar while `verify.mjs` screenshots the section alone, so
    that band reads ~2.9 regardless.
  - The animated `recruitment-hero1.mp4` layer is a different scene (small
    planet + starfield) and is unchanged; it only plays at
    `(prefers-reduced-motion: no-preference) and (min-width: 601px)`.
  - **Full-screen migration (#9, 6 Oct 2026).** The video, particle canvas and
    plate tweens were removed. The hero is now the supplied art
    `assets/hero gambar/Gambar Hero recruitment.png` (5756 × 3600, text-free)
    baked by `npm run assets:heroes` (`scripts/generate-hero-bg.mjs`) to
    `/images/recruitment/hero-bg.webp` (1440 × 866, q88) + `hero-bg-2x.webp`
    (2880 × 1732, q86) + `hero-bg-3x.webp` (4320 × 2598, q84), `object-fit: cover`,
    section `min-height: 100svh`
    (`padding: 80px var(--page-gutter)`, centred). Copy is unchanged. The stored
    reference `Recruitment-Hero-Revisi-1x.png` is an older render, so the MAE vs
    it rises (~10, no threshold) — same situation as About Us. `verify.mjs`
    asserts height 903 (viewport 1440×903), h1 `270/296.5/900×176`, copy
    `270/488.5/900×27`, button `660/563.5/120×43`, static `.art-bg` present and
    no `<video>`/`<canvas>`; the reference is padded `sharp.extend()` 18/19.

## Recruitment page — Who Should Join

- Figma node: `1436:3512` (subnodes `1436:3513` header, `1436:3514` heading, `1436:3515` copy, `1436:3516` HoDS rail); references:
  `assets/assets recruitment page/who sould join section/Recruitment-WhoShouldJoin-Revisi-{1x,2x}.png`, 1440 × 789 (1x) & 2880 × 1578 (2x), plus header export `Recruitment-WhoShouldJoin-Header-1x.png` (1280 × 119).
- Frame: 1440 × 789, `padding: 80px 80px 80px 80px`, column, `gap: 74px` (header to rail).
- Heading (revisi 2 Oct 2026): "Who Should Join?", Bluu Next Bold 700 (`--font-display`), 56 / 67.2 (line-height 68px), centered in 1280px box at `(80, 80)`, fill `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)` (`-webkit-background-clip: text`).
- Copy: "We welcome passionate individuals across technical, creative, and operational domains.", Manrope Medium 500 (`--font-body`), 18 / 27px, `#ffffff`, centered in 1280px box at `(80, 172)`, `margin-top: 24px`.
- Card rail: the **same** cards as the homepage's House of Data Sorcerers section (`DomainCard` + `domains.ts`) — six 405 × 436 cards with a 32px gap, first at x=80, y=273. Shared `DomainRail.astro` used by both `Domains.astro` and `WhoShouldJoin.astro`, so the cards stay pixel-identical to the homepage. Arrows on sides (desktop) / below (mobile ≤1050px).
- Card links: the cards open the HoDS detail pages with a recruitment origin (`/hods/{id}?from=recruitment`), so that page's back link returns to `/recruitment#who-should-join` ("Back to Who Should Join").
- Background: **shared living sky** — `src/components/Starfield.astro`, base tile + `far`/`near` drift (`public/images/starfield/`).
- Measured layout at 1440: section `1440 × 789` at y=866; heading `(80, 80, 1280 × 68)`; copy `(80, 172, 1280 × 27)`; cards at x 80 / 517 / 954 / 1391, y 273, 405 × 436.
- Verification: `scripts/verify.mjs` asserts the section, heading, copy and card boxes exactly, diffs against `Recruitment-WhoShouldJoin-Revisi-1x.png` (MAE 2.8430/255), and checks overflow and text across widths.
- **Audit revision (3 Oct 2026):** reference re-exported from node `1436:3512`
  and confirmed **MAE 0.000** vs the stored PNG (not stale). Heading fill aligned
  to the global Figma `181deg … / #fff 79%` (was `180deg …80%`; header region MAE
  1.75 → 1.73, i.e. the angle is immaterial for this single line but the value must
  match the law). Remaining section MAE 2.836 = cross-renderer font AA on the
  gradient card titles + the intentional living `<Starfield />` (bg band 0.85);
  no structural shift (per-column/per-row diff is diffuse). Geometry and 8pt
  unchanged; 7 gates + SEO PASS.
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

- Figma node: `1436:3517`; reference
  `assets/assets recruitment page/what you will do/Recruitment-WhatYouWillDo-Revisi-1x.png`,
  1440 × 903 (2× at `Recruitment-WhatYouWillDo-Revisi-2x.png`). The section sits at
  recruitment y=1655.
- Frame: 1440 × 903, `padding: 80px` (strict 8-point grid), vertical column,
  centered, `gap: 20px`.
- Background: the **shared living sky** — `src/components/Starfield.astro`, same
  base tile + `far`/`near` drift as the home "Four Pillars of Innovation" section
  (`public/images/starfield/`). The component is `position: absolute; inset: 0;
overflow: hidden; z-index: -1`, so nothing about the section geometry changes.
- Header Frame 2734 (`1436:4048`): 1280 × 118px at (80, 80), vertical column,
  `gap: 24px`.
  - Heading (`1436:3518`): "What You Will Do", Bluu Next Bold 700, 56 / 67px
    (`--font-display`), gradient `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`,
    centered in 1280px box.
  - Subtitle (`1436:3519`): "Life inside the Data Sorcerers ecosystem", Manrope
    Medium 500, 18 / 27px, `#ffffff`, centered.
- Gap header ke body: **20px** (Body sits at y=218).
- Body Frame 2542 (`1436:3520`): a fixed 1312 × 625 collage at (64, 218) holding:
  - two tarot card artworks — `card-1` (356 × 430 at 983, 218) and `card-2`
    (295.39 × 361.78 at 129, 434), exported from the supplied PNGs to lossless
    WebP at 1×/2× under `public/images/what-you-will-do/`;
  - a decorative connector vector (`connector.svg`, 1312 × 531 at 64, 313);
  - eight HTML/CSS label pills inside the 1125 × 409 "Content" frame (at 94, 130
    of the Body; absolute 158, 348), in diagonal pairs at x 158 / 380 / 600 / 821
    and y 348 / 395 / 450 / 497 / 552 / 599 / 654 / 701 (following strict 8-point
    grid: 16px intra-pair gap, 24px inter-pair gap). Each is 462 × 31 (label 2 is
    461 in Figma) with a
    `linear-gradient(134deg, #fff 0%, #6c3bff 8%, #6c3bff X%, transparent)`
    (X = 58 / 58 / – / – / 30 / 30 / 46 / 46%), a 6px gradient dot and Manrope
    Medium 18 / 27 text: LEARN WITH OTHERS, PRACTICE YOUR SKILLS, WORK ON
    EXPERIMENTS, CONTRIBUTE TO PROJECTS, PARTICIPATE IN RESEARCH, SHARE
    KNOWLEDGE, BUILD YOUR PORTOFOLIO, COLLABORATE ACROSS DISCIPLINES.
- Below 1320px the collage becomes a stacked column of the eight labels (cards
  and connector hidden) — an adaptation, since no mobile reference exists.
- Section MAE: **1.84/255** vs exported node reference
  `Recruitment-WhatYouWillDo-Revisi-1x.png` (audit 3 Oct 2026; node re-export MAE
  0.000, heading fill aligned to the global `181deg/79%`).
- Verification: `scripts/verify.mjs` asserts the section, heading, body, all
  eight labels, both cards and the connector exactly, diffs against the
  reference, and checks overflow and text from 320px to 1920px. All 6 verification
  gates PASS.

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

- Figma node: `1436:3675` (Frame 2495 di page `1436:3505`); referensi:
  `assets/assets recruitment page/faq section/Recruitment-Faq-Revisi-1x.png` (1440 × 983)
  dan `Recruitment-Faq-Revisi-2x.png` (2880 × 1966). Heading 2x:
  `assets/assets recruitment page/faq section/faq-title-2x.png`.
- Frame: 1440 × 983px, `padding 80px`, gap vertikal **`56px`** (`7 × 8px` — Strict 8-Point
  Grid, mengoreksi nilai lama 58px). Background: living sky starfield via
  `src/components/Starfield.astro` (inert & pixel-exact saat `prefers-reduced-motion: reduce`).
- Heading: "FAQ" (`1436:3676`), **Bluu Next Bold 700 56px / 67.2px** (`--font-display`),
  uppercase, gradient linear 181deg `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`,
  di `(80, 80, 1280 × 67.2)`. Ink width terukur: 103.5px, ink height 46px.
- List Container Frame 2546 (`1436:3677`): width 1280px at `(80, 203.2)`, height 700px,
  gap `32px` (`4 × 8px`), padding `0`.
- 6 Accordion Items (`1436:3678` s/d `1436:3683`):
  - Items 1–4: `1280 × 77px` di y = `[203.2, 312.2, 421.2, 530.2]`.
  - Items 5–6: `1280 × 116px` di y = `[639.2, 787.2]` (2 baris teks).
  - Background `rgba(255, 255, 255, 0.15)`, border-radius 20px, 1px glass rim specular
    **`linear-gradient(90deg, #ede8ff 0%, #2e276c 50%, #ede8ff 100%)`** (audit 3 Oct 2026:
    MCP `135deg` lossy; ref top & bottom rims identik per-x — top x720 = `46,39,108` = 90deg-50%)
    via pseudo `::after` dengan `mask-composite: exclude` (mencegah border mengecilkan content box).
  - Pertanyaan Manrope Medium 500 26/39px putih, padding `19px 32px`.
  - Chevron down 24×24px (`public/images/recruitment/chevron-down.svg`) rotasi 180° saat terbuka.
- Answers: Manrope Medium 18/27px (`.faq-a`), padding `0 32px 19px`, margin `24px 0 0`.
  Toggle dianimasikan via JS height transition (320ms) dengan fallback instan pada reduce motion.
  Sound SFX cues: `data-sfx-hover="hover"` dan `ds:sfx` event `{ cue: 'open' | 'close' }`.
- Verifikasi: `scripts/verify.mjs` asserts section `{ width: 1440, height: 983.2, top: 4213.578125 }`,
  heading `{ x: 80, y: 80, width: 1280, height: 67.2 }`, list `{ x: 80, y: 203.2, width: 1280, height: 700 }`,
  dan 6 items y offset exact. Section MAE: **7.7518 → 7.803/255** (audit 3 Oct 2026, rim `90deg`).
  **MAE didominasi artefak screenshot, bukan bug CSS:** section top `4213.578` fraksional → Playwright
  membulatkan screenshot bounds ke luar 1px → seluruh konten tergeser sub-pixel `0.578px`; diff heatmap
  hanya menampilkan **outline** glyph/rim (bukan fill) = sub-pixel shift, region bebas-teks MAE 0.4–2.8,
  dan perbandingan ter-align (crop top:1) ~5.04. Sisa = AA font lintas-renderer irreducible.
  Downstream section tops (`.snippets` 5196.78, `.cta` 6093.78, `.footer` 6613.78) terkalibrasi presisi.
  Semua 7 gate + seo ALL PASS.

## Recruitment page — Snippets

- Figma node: **`1436:3684`** ("Frame 2502", revisi 2 Oct 2026); reference
  `assets/assets recruitment page/snippets section/Recruitment-Snippets-Revisi-1x.png`
  (1440 × 897) + `…-2x.png` (2880 × 1794). The section sits at homepage
  y=5196.78.
- Frame: 1440 × 897, `padding 40px 80px`, `gap 56` (strict 8-point grid,
  mengoreksi 58 lama), `#050507`.
- Heading: "Snippets of Life at data sorcerers", **Bluu Next Bold 700,
  56 / 67** (`--font-display` — audit 3 Oct 2026: `67.2` → `67`, Figma bbox /
  kickoff convention → section tepat 897 = tinggi reference PNG), **center**,
  gradient per baris `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`,
  (80, 40, 1280 × 67). Ink width terukur 840.75px. The content is centred on
  wide viewports.
- Gallery ("galeryy ds", instance `1436:3686`), 1280 wide at y=163: a hero
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
- Verification (revisi/audit 3 Oct 2026): `scripts/verify.mjs` asserts section
  `{ width: 1440, height: 897, top: 5196.78125 }`, heading
  `{ x: 80, y: 40, width: 1280, height: 67 }`, gallery/hero `y: 163`, and all
  five thumb boxes at `y: 754`. It diffs against `Recruitment-Snippets-Revisi-1x.png`
  (section MAE **8.63/255** — tak berubah karena **didominasi artefak screenshot**:
  section top `5196.781` fraksional + thumbnail 2 & 4 di x setengah-piksel `338.5/855.5`
  → tekstur foto tergeser sub-pixel; aligned MAE ≈ **3.03**, thumbnail 1/3/5 ≈ 3 vs
  2/4 ≈ 10–14; isi foto identik), hides the `.snippet-arrow` overlay, and checks overflow
  from 320px to 1920px. Downstream tops −0.2 (`.cta` 6093.78125, `.footer`
  6613.78125). Semua 7 gate + seo ALL PASS.

## Recruitment page — CTA

- Figma node: section `1436:3687` ("CTA Recruicment Section", revisi 2 Oct 2026),
  panel `1438:4072`; reference
  `assets/assets recruitment page/cta section/Recruitment-Cta-Revisi-1x.png`,
  1440 × 520 (+ `…-2x.png`). The section sits at recruitment y=6093.78 and is
  1440 × 520.
- Section: `padding 80`, `#050507`. Panel: 1280 × 360 at (80, 80), `height:
360px` + `justify-content: center` (content 230px di celah 232px → y145, persis
  render), `padding 64px 80px`, `gap 48`, `rgba(98,80,255,.1)`, 1px
  **`linear-gradient(110deg, #e0dcff 0%, #2e276c 50%, #e0dcff 100%)`** rim via
  ring `::after` + mask (audit 3 Oct 2026: MCP `135deg` lossy — sweep angle fit
  dari PNG, top-rim MAE 6.9 → 0.6), `border-radius 20px`, `overflow: hidden`. The
  panel is capped at `max-width: 1280px` and centred.
- Heading: "Ready to Become a Sorcery?" (Title Case), **Bluu Next Bold 700,
  56 / 67.2** (`--font-display`), center, gradient
  `linear-gradient(181deg, #ffffff 15%, #999999 42%, #ffffff 79%)`. Ink terukur
  710.25 × 52 di y158.
- Copy: "Join a community where your learning can become experimentation, your
  ideas can become projects, and your work can create real impact." Manrope
  Regular 400, 16 / 24, `letter-spacing -0.176px`, width 586, center (586 × 48
  di (427, 236)).
- Button: "Join the Community" (`Button` `variant="community"`), 201 × 43.
- Decorative glow: Figma `IMAGE-SVG` `1438:4081`, 1000.33 × 271.5 at (269.84, 271) inside the panel (abs 349.83, 351). It reuses the homepage CTA treatment
  (`public/images/recruitment/glow.svg`, rotated -2.23deg and oversized inside a
  1000.331 × 271.502 frame). Shares the one-way `cta-glow-sweep` (left → right,
  6.5s linear), paused via `.cta.is-idle` when off-screen.
- Verification: `scripts/verify.mjs` asserts section `{1440, 520, top 6093.78125}`,
  panel `{80, 80, 1280, 360}`, actions `{619.55, 332.09, 200.89, 43}`, glow
  `{349.83, 351, 1000.33, 271.5}`, heading `y145` and copy `(427, 236)`, then
  diffs the full section against the reference (section MAE **2.25/255** — tak
  berubah karena **didominasi artefak screenshot**: section top `6093.781`
  fraksional → konten tergeser sub-pixel; aligned MAE ≈ **1.11** setelah rim
  `110deg`) and checks overflow 320→1920px. Downstream `.footer` top →
  **6613.78125**. Semua 7 gate + seo ALL PASS.

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

## Hero background videos (3 Oct 2026)

Semua hero memakai `<video>` looping sebagai background dengan fallback gambar
statis. Aturan keras + Master Work Plan: **`docs/hero-video-plan.md`** dan
`docs/pixel-precision-sop.md` §10.

| Halaman        | Node        | Sumber mentah (`assets/`)                                                                                         | Output diserve                                                      | Status  |
| -------------- | ----------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------- |
| Home           | `1430:2041` | `assets home page/hero section/hero.mp4` (1280×720,10s)                                                           | `public/images/hero/hero-bg.{webm,mp4}` + `hero-poster.webp`        | DONE    |
| Recruitment    | `1436:3506` | `assets recruitment page/hero section/Animating_static_planetary_space…_1080p_20261003170119.mp4` (1920×1080,10s) | `public/images/recruitment/hero-bg.{webm,mp4}` + `hero-poster.webp` | DONE    |
| About Us       | `1439:4185` | `assets about us/hero/Animating_sorcerer_image_ambient…_1080p_20261003164943.mp4`                                 | `public/images/about/hero-bg.{webm,mp4}` + poster                   | DONE    |
| Hall of Frames | `1439:4507` | `hall of frames/hero/Sorcerer_in_chamber_with_electri…_20261003212122.mp4`                                        | `public/images/hof/hero-bg.{webm,mp4}` + poster                     | DONE    |
| Partners       | `1439:4788` | `partners/hero/Arcane_hands_establishing_magica…_1080p_20261003172522.mp4`                                        | `public/images/partners/hero-bg.{webm,mp4}` + poster                | DONE    |
| Contact        | `1445:5066` | —                                                                                                                 | `public/images/contact/hero-bg.{webm,mp4}` + poster                 | PENDING |

**About Us hero video (3 Oct 2026).** Node `1439:4185` now has a looping artwork
layer in `AboutHero.astro`, rendered by `HeroVideo.astro` and mounted through
`src/scripts/hero-video.ts`. Source: `assets/assets about us/hero/Animating_sorcerer_image_ambient…_1080p_20261003164943.mp4`
(1920×1080, 24 fps, 8 s). `node scripts/generate-hero-videos.mjs about` makes a
7 s circular loop with a 1 s tail-to-head dissolve, removes audio, sharpens the
image, and writes `hero-bg.webm` (AV1 CRF 50, 1.01 MiB), `hero-bg.mp4` (H.264
CRF 33, 0.98 MiB), and `hero-poster.webp` (0.20 MiB) under
`public/images/about/`. The 1× export fetched from the current Figma node
differs from the stored `About-Hero-Revisi-1x.png` by MAE 5.178: the Figma
navbar is now on About Us and the title rendering differs. The established
static fallback, hero geometry, typography, and stored verification reference
remain unchanged for this video pass. At reduce and ≤600px, the video is not
loaded; desktop motion plays only while visible and the tab is active. The
reduced-motion screenshot is byte-identical to the pre-video render (MAE 0);
MAE against the stored hero reference remains 4.6874.

**Hall of Frames hero video (3 Oct 2026; source refreshed 3 Oct 2026).** Node
`1439:4507` uses the shared
`HeroVideo.astro` and `hero-video.ts` runtime. Source:
`assets/hall of frames/hero/Sorcerer_in_chamber_with_electri…_20261003212122.mp4`
(1920×1080, 24 fps, 8 s). `node scripts/generate-hero-videos.mjs hof` writes
a 7 s tail-to-head loop: AV1 WebM 0.30 MiB, H.264 MP4 0.35 MiB, poster 0.08 MiB.
Encoded frame sharpness is 1.23× the source; seam first-vs-last MAE is
2.55. The current Figma export differs from the stored `HoF-Hero-1x.png` by
MAE 3.627, mostly navbar/title rendering. Static fallback and reference remain
the approved baseline for this video-only pass. The reduced-motion screenshot
is byte-identical to the pre-video render (MAE 0), and the stored-reference
MAE remains 4.3377. All seven gates and SEO pass; 468/468 responsive cases pass.

**Partners hero video (3 Oct 2026).** Node `1439:4788` uses the shared
`HeroVideo.astro` and `hero-video.ts` runtime. Source:
`assets/partners/hero/Arcane_hands_establishing_magica…_1080p_20261003172522.mp4`
(1920×1080, 24 fps, 8 s). `node scripts/generate-hero-videos.mjs partners`
writes a 7 s tail-to-head loop: AV1 WebM 0.54 MiB, H.264 MP4 0.47 MiB, poster
0.10 MiB. Encoded frame 0 MAE is 1.29 against source t=1 s; seam first-vs-last
MAE is 2.14. The current Figma export differs from stored `Partners-Hero-1x.png`
by MAE 5.985, mainly navbar/title rendering. The static fallback/reference
remain the baseline for this video-only pass. The reduced-motion screenshot is
byte-identical to the pre-video render (MAE 0); stored-reference MAE remains
4.1285. All seven gates and SEO pass; 468/468 responsive cases pass.

**Recruitment hero source upgrade (3 Oct 2026).** Generator
`scripts/generate-recruitment-hero-video.mjs` kini membaca
`assets/assets recruitment page/hero section/Animating_static_planetary_space…_1080p_20261003170119.mp4`
(1920×1080, 24 fps, 10 s), menggantikan `recruitment-hero1.mp4`. Sumber baru
lebih tajam pada sampel t=1 s (sharpness 0.935 vs 0.746 pada resolusi asli).
Output loop 9 s crossfade: AV1 WebM 0.78 MiB, H.264 MP4 1.00 MiB, poster 0.05
MiB. Frame tengah hasil encode MAE 0.84/0.88 terhadap sumber baru setelah
disamakan ke 1920×1080; frame awal/akhir WebM MAE 1.30. Resolusi asli tetap
1080p; 2560×1440 pada output adalah upscale untuk layar besar, bukan detail
native tambahan. Gambar statis `recruitment.webp` tetap fallback untuk reduce
dan ≤600px; assertion geometri di `verify.mjs` tetap sama. Browser desktop
memutar WebM 2560×1440; reduce dan 390px tidak meminta berkas video. Screenshot
reduce sebelum/sesudah MAE 0. Tujuh gate + SEO lulus; responsive 468/468.
MAE statis terhadap PNG referensi tetap 1.600/255.

**Recruitment hero sharpening pass (3 Oct 2026).** Screenshot user memperlihatkan
permukaan planet lembut. Frame hasil encode sebelum revisi hampir sama dengan
sumber (MAE ~0.84/255), jadi kenaikan bitrate saja tidak menyelesaikannya.
Generator kini menerapkan FFmpeg `cas=strength=0.6:planes=1` pada sumber 1080p,
baru `scale=2560:1440:flags=lanczos` dan `unsharp=5:5:0.25:5:5:0.0`. Sampel
tekstur planet pada t=4 s naik dari sharpness 0.718 ke 0.795 (+10.8%) tanpa
rim putih berlebihan. AV1 CRF 42 menghasilkan WebM 895,194 byte (0.85 MiB),
x264 CRF 31 menghasilkan MP4 945,818 byte (0.90 MiB), dan poster 60,238 byte.
Sumber tetap 1080p; filter ini memperjelas detail yang sudah ada, tanpa
menciptakan detail asli baru. Seam loop WebM frame pertama/terakhir MAE 1.232;
fallback reduce MAE 0 terhadap baseline, dan 7 gate + SEO lulus (responsive
468/468). Browser desktop memutar output baru pada viewport 1349×633.

Catatan: nama file sumber punya karakter unicode `…` (quote path-nya).
Sumber 1920×1080, 24fps, H.264; audio dibuang pada output. Budget encode webm ≤0.9MB /
mp4 ≤1.1MB per hero (lihat plan §3). Reference screenshot `verify.mjs` di-capture
dalam `reduce` → video tersembunyi → MAE statis **tidak berubah**.

## CMS B0 — content snapshot (6 Oct 2026)

Data-only migration; artwork provenance and reference PNGs remain unchanged.
Projects now read `src/data/cms-snapshot.json`; exports retain the original four
records byte-for-byte in their content. Validation uses `astro/zod` with fixed
slots and unique IDs. Plan/results: `docs/cms-b0-plan.md`.

Team content now reads the snapshot. Domain chip/fade, group order, Join Now
slot and portrait artwork selectors remain local design configuration.

Role content now reads the snapshot. Clean baked card artwork and the existing
`centered`/`tight` layout configuration stay local; role route order is locked.

Partners content now reads the snapshot. Category slot counts 10/5/5 and baked
Why DS icon paths stay local. The existing shared placeholder logo API remains;
per-organisation logo rendering will be introduced in B3.
