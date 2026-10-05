// Generates the served About Us artwork from the raw sources in
// `assets/about-us/`. Run with `npm run assets:about`.
//
// Source of truth (see docs/assets.md §About Us):
// - `assets/hero gambar/Hero Section - About Us.png` (5760 × 3612) → the
//   full-screen hero background (node 1439:4185 IMAGE fill), baked 1440 × 903
//   (1×) + 2880 × 1806 (2×). The image carries no text — copy stays HTML.
// - visi-misi/visi-misi-bg-raw.png → the old node 1439:4190 IMAGE fill. No
//   longer served: the live section now paints the shared `<Starfield />`.
// - `assets/assets about us/visi misi/hd tarrot card Assets-1.png` (1424 × 1720,
//   4× the 356 × 430 node) → the clean tarot artwork, served at 1× / 2× / 3×.
// - team/card-frame-2x.png → the node 1439:4310 card "Mask group" decoration
//   (295 × 277).
// - team/portrait-marchel.png / team/portrait-zidan-rose.png → the two card
//   portrait fills (placeholder members). The Figma imageTransform crops the
//   source before the STRETCH, so the visible region is baked at the node
//   sizes (302 × 532 and 302 × 442) + 2×.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const about = 'public/images/about';
const team = 'public/images/team';

await mkdir(about, { recursive: true });
await mkdir(team, { recursive: true });

const webp = (input, dir, output, resize, quality) =>
  sharp(input)
    .resize(resize)
    .webp({ quality, effort: 5 })
    .toFile(path.join(dir, output));

// Figma imageTransform [[sx,0,tx],[0,sy,ty]] → crop of the source.
const cropWebp = (input, output, sx, tx, sy, ty, outW, outH, quality) =>
  sharp(input)
    .metadata()
    .then(({ width, height }) => {
      const left = Math.round(tx * width);
      const top = Math.round(ty * height);
      const w = Math.round(sx * width);
      const h = Math.round(sy * height);
      return sharp(input)
        .extract({ left, top, width: w, height: h })
        .resize(outW, outH, { fit: 'fill' })
        .webp({ quality, effort: 5 })
        .toFile(path.join(team, output));
    });

await Promise.all([
  // Full-screen hero background (node 1439:4185 IMAGE fill).
  webp(
    'assets/hero gambar/Hero Section - About Us.png',
    about,
    'hero-bg.webp',
    { width: 1440, height: 903, fit: 'cover' },
    85,
  ),
  webp(
    'assets/hero gambar/Hero Section - About Us.png',
    about,
    'hero-bg-2x.webp',
    { width: 2880, height: 1806, fit: 'cover' },
    82,
  ),
  webp(
    'assets/about-us/team/card-frame-2x.png',
    team,
    'card-frame.webp',
    { width: 295, height: 277, fit: 'fill' },
    90,
  ),
  webp(
    'assets/about-us/team/card-frame-2x.png',
    team,
    'card-frame-2x.webp',
    { width: 590, height: 554, fit: 'fill' },
    88,
  ),
  cropWebp(
    'assets/about-us/team/portrait-marchel.png',
    'marchel.webp',
    0.45209581,
    0.29341319,
    0.79640722,
    0,
    302,
    532,
    90,
  ),
  cropWebp(
    'assets/about-us/team/portrait-marchel.png',
    'marchel-2x.webp',
    0.45209581,
    0.29341319,
    0.79640722,
    0,
    604,
    1064,
    88,
  ),
  cropWebp(
    'assets/about-us/team/portrait-zidan-rose.png',
    'zidan-rose.webp',
    0.76070529,
    0.13602015,
    0.83486247,
    0,
    302,
    442,
    90,
  ),
  cropWebp(
    'assets/about-us/team/portrait-zidan-rose.png',
    'zidan-rose-2x.webp',
    0.76070529,
    0.13602015,
    0.83486247,
    0,
    604,
    884,
    88,
  ),
  // Tarot artwork (node 1439:4218, 356 × 430) from the HD 4× source.
  webp(
    'assets/assets about us/visi misi/hd tarrot card Assets-1.png',
    about,
    'tarot-cards.webp',
    { width: 356, height: 430, fit: 'contain' },
    90,
  ),
  webp(
    'assets/assets about us/visi misi/hd tarrot card Assets-1.png',
    about,
    'tarot-cards-2x.webp',
    { width: 712, height: 860, fit: 'contain' },
    88,
  ),
  webp(
    'assets/assets about us/visi misi/hd tarrot card Assets-1.png',
    about,
    'tarot-cards-3x.webp',
    { width: 1068, height: 1290, fit: 'contain' },
    86,
  ),
]);
