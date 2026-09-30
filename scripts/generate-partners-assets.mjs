// Generates the served Partners page artwork from the raw sources in
// `assets/partners page/`. Run with `npm run assets:partners`.
//
// Sources of truth (see docs/assets.md §Partners):
// - Hero Section - Partners1.png → the "Let's Build Something" hero backdrop
// - Frame 2655.png               → the empty partner card (base + violet glow)
// - ChatGPT Image ... 2*.png     → the four feature icons (transparent)
// - Logo_transparan (1) 4.png    → the placeholder partner logo
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = 'assets/partners page';
const out = 'public/images/partners';

const hero = path.join(src, 'Hero Section - Partners1.png');
const card = path.join(src, 'Frame 2655.png');
const logo = path.join(src, 'Logo_transparan (1) 4.png');

const icons = {
  'why-talent': 'ChatGPT Image Sep 27, 2026, 06_43_09 PM 2.png',
  'why-research': 'ChatGPT Image Sep 27, 2026, 06_43_09 PM 2-1.png',
  'why-innovation': 'ChatGPT Image Sep 27, 2026, 06_43_09 PM 2-2.png',
  'why-community': 'ChatGPT Image Sep 27, 2026, 06_43_09 PM 2-3.png',
};

await mkdir(out, { recursive: true });

const webp = (input, output, opts = {}) =>
  sharp(input)
    .webp({ quality: 88, effort: 5, ...opts })
    .toFile(path.join(out, output));

await Promise.all([
  // Hero backdrop: 1440×665 frame, so 1x/2x land exactly on the reference art.
  sharp(hero)
    .resize({ width: 1440 })
    .webp({ quality: 86, effort: 5 })
    .toFile(path.join(out, 'hero-bg.webp')),
  sharp(hero)
    .resize({ width: 2880 })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(out, 'hero-bg-2x.webp')),
  // Card 240×116 @3x keeps the glow smooth on retina; it is the reference art
  // (the Figma swoosh export did not reproduce the full gradient).
  sharp(card)
    .resize({ width: 720 })
    .webp({ quality: 90, effort: 5 })
    .toFile(path.join(out, 'partner-card-bg.webp')),
  webp(logo, 'partner-logo.webp'),
  ...Object.entries(icons).map(([name, file]) =>
    webp(path.join(src, file), `${name}.webp`),
  ),
]);

console.log(`Partners artwork written to ${out}/`);
