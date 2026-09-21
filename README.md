# Data Sorcerers

Homepage preview with Hero, Our Philosophy, What We Do, House of Data Sorcerers, and Our Project, built with Astro,
strict TypeScript, and scoped CSS.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:4321. `npm run build` checks types and builds the static
site into `dist/`; `npm run preview` serves that build.

## Deploy

Static Astro output, so it deploys to Vercel with the committed `vercel.json`
(`framework: astro`, `npm ci`, `npm run build`, output `dist`). Import the
GitHub repository in Vercel; no environment variables are required. Node 22 is
pinned through `engines.node`. `.vercelignore` keeps the large `assets/`
reference folder out of the upload.

The bundled fonts cover the body text. The Nasalization heading font is not
bundled (see [asset notes](docs/assets.md)), so deployed previews render the
headings with the fallback until a licensed webfont is added.

## Scope

Implemented: desktop navbar, hero artwork, live HTML headings and copy,
CSS buttons, a responsive mobile navigation menu, and the Our Philosophy
section with its original illustration, five icons, and two-column principles.
The navbar is a fixed, full-width bar whose content is locked to the 1440px
Figma frame and centered on wider screens; once the page scrolls it gains a
backdrop blur and a translucent panel.
What We Do adds four HTML/CSS cards around a centered heading, with original
star artwork and exported decorative glow assets.
HODS adds six HTML/CSS domain cards in a horizontal scrolling row. Swipe or
use a trackpad; focus the row and use arrow keys or Home/End on a keyboard.
Home links to `/`.
Other navigation destinations and CTA URLs have not been supplied; they are
explicitly unavailable in this preview rather than linking to missing pages.
Pass an `href` to `Button.astro` when a destination is ready.

The desktop visual target is `assets/assets home page/hero section/Hero Section.png`, exported
at 4× from a 1440 × 903 Figma frame. Mobile is an adaptation, because no mobile
reference was supplied. Our Philosophy follows
`assets/assets home page/ourphilosophy/Philosophy Section(1).png`, a 4× export of a 1440 × 837
frame. Open `/#our-philosophy` to jump to it. `assets/` remains the original
reference collection.

What We Do follows `assets/assets home page/what we do/What We Do Section.png`, a 4× export of
a 1440 × 844 frame. Open `/#what-we-do` to jump to it.

HODS follows `assets/assets home page/hods/House of Data Sorcerers Section.png`, a 4× export
of a 1440 × 826 frame. Open `/#domains` to jump to it. Cards are 394 × 436px,
spaced 40px apart on desktop; the next card intentionally enters at the right edge.

Our Project follows `assets/assets home page/our project/Our Project Section.png` (1440 × 917
at 1×) for the card, heading, and spacing, and presents the work as a 3D
coverflow: the highlighted project sits centered on the Figma grid while the
left and right projects sit at the reference's side-panel positions, tilted and
blurred. Navigate with the arrows, the dots, drag/swipe, or the arrow keys. Four
placeholder projects live in `src/data/projects.ts` — swap them for real
content. Open `/#projects`.

Recruitment CTA follows `assets/assets home page/cta/CTA Recruicment Section.png` (1440 × 577
at 1×). Open `/#recruitment`. Its two buttons remain unavailable until
their actual destinations are supplied, consistent with the hero preview.

The Recruitment page (`/recruitment`) starts with its hero, following
`assets/assets recruitment page/hero section/About Us Hero Section.png` (1440 ×
866 at 3×; the reference includes the navbar). It reuses the shared Navbar with
Recruitment active and adds a dark "secondary" button variant for "Apply Now".
Its "Who Should Join?" section follows
`assets/assets recruitment page/who sould join section/Who Should Join
Section.png` (1440 × 789 at 4×) and reuses the homepage's HoDS card rail, now
extracted into a shared `DomainRail.astro`. Each card opens the HoDS detail
page (`/hods/{id}?from=recruitment`), and that page's back link returns to
`/recruitment#who-should-join` instead of the homepage. Role detail pages
(`/recruitment/roles/{id}`, built from `src/data/roles.ts` and
`assets/assets recruitment page/who sould join section/detail role/…`, 1440 ×
1280 at 4×) are implemented but not linked yet. "What You Will Do" follows
`assets/assets recruitment page/what you will do/What You Will Do Section.png`
(1440 × 903 at 4×): a header plus a 1312 × 625 collage of two tarot-card
artworks, a decorative connector SVG and eight HTML/CSS label pills. "Available
Roles" follows
`assets/assets recruitment page/available roles section/Available Roles
Section.png` (1440 × 910 at 4×): a left-aligned heading and copy plus six role
rows that link to the `/recruitment/roles/{id}` pages. "Selection Timeline"
follows
`assets/assets recruitment page/selection timeline section/TIMELINE.png`
(1440 × 815 at 4×): a heading plus a Phase/Date table of six recruitment phases.
Remaining sections and the footer are still to come.

Footer follows `assets/assets home page/footer/Footer.png` (1440 × 556 at 1×), the Figma node
`765:17071`. It carries the supplied background image, the brand lockup, the
social icons, the Navigation and Contact columns, and the legal bar. Text,
borders, the divider, and the social buttons are HTML/CSS; the two social
glyphs and the background are original Figma exports. Open `/#` and scroll to
the bottom. Social, Navigation, Terms, Privacy, and Cookies destinations have
not been supplied, so they remain explicitly unavailable in this preview.

## Fonts

Manrope is bundled under the SIL Open Font License. Nasalization uses an
installed local font for the preview; it is **not bundled as a webfont**.
An exact match on other devices requires a licensed Nasalization webfont.
See [asset notes](docs/assets.md).

## Project structure

- `src/components/`: Navbar, Hero, Philosophy, WhatWeDo, Domains, DomainCard, DomainRail, Projects, Recruitment, RecruitmentHero, WhoShouldJoin, WhatYouWillDo, AvailableRoles, SelectionTimeline, RoleDetail, Footer, and shared Button.
- `src/data/domains.ts`: domain copy and topic labels.
- `src/layouts/`: HTML document, metadata, and font preload links.
- `src/styles/global.css`: fonts, design tokens, reset, and focus styles.
- `src/pages/index.astro`: homepage composition.
- `src/pages/recruitment.astro`: Recruitment page (hero so far).
- `public/`: locally served images and licensed fonts.

## Validation

```sh
npm run build
npm run format:check
node scripts/verify.mjs
```

Run the dev server before the visual verification script. It uses Chromium at
`/usr/bin/chromium` (override with `CHROMIUM_PATH`) and writes desktop/mobile
screenshots, reference overlays, difference images, and measurements into
`artifacts/`. It also checks exact desktop section geometry, font availability,
mobile menu interaction, text clipping, horizontal overflow, and browser errors.
