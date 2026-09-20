# Data Sorcerers

Homepage hero preview built with Astro, strict TypeScript, and scoped CSS.

## Run locally

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open http://localhost:4321. `npm run build` checks types and builds the static
site into `dist/`; `npm run preview` serves that build.

## Scope

Implemented: desktop navbar, hero artwork, live HTML heading and paragraph,
CSS buttons, and a responsive mobile navigation menu. Home links to `/`.
Other navigation destinations and CTA URLs have not been supplied; they are
explicitly unavailable in this preview rather than linking to missing pages.
Pass an `href` to `Button.astro` when a destination is ready.

The desktop visual target is `assets/hero section/Hero Section.png`, exported
at 4× from a 1440 × 903 Figma frame. Mobile is an adaptation, because no mobile
reference was supplied. `assets/` remains the original reference collection.

## Fonts

Manrope is bundled under the SIL Open Font License. Nasalization uses an
installed local font for the preview; it is **not bundled as a webfont**.
An exact match on other devices requires a licensed Nasalization webfont.
See [asset notes](docs/assets.md).

## Project structure

- `src/components/`: Navbar, Hero, and shared Button.
- `src/layouts/`: HTML document, metadata, and font preload links.
- `src/styles/global.css`: fonts, design tokens, reset, and focus styles.
- `src/pages/index.astro`: homepage composition.
- `public/`: locally served images and licensed fonts.

## Validation

```sh
npm run build
npm run format:check
node scripts/verify.mjs
```

Run the dev server before the visual verification script. It uses Chromium at
`/usr/bin/chromium` (override with `CHROMIUM_PATH`) and writes desktop/mobile
screenshots, a reference overlay, a difference image, and measurements into
`artifacts/`. It also checks font availability, mobile menu interaction,
horizontal overflow, and browser errors.
