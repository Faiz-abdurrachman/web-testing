// Generates the served About Us artwork from the raw sources in
// `assets/about-us/`. Run with `npm run assets:about`.
//
// Source of truth (see docs/assets.md §About Us):
// - visi-misi/visi-misi-bg-raw.png → the node 1439:4190 IMAGE fill (starfield
//   backing). Served as a 1440 × 840 cover crop + a 2× variant.
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

const cover = (input, output, width, height, quality) =>
  webp(
    input,
    about,
    output,
    { width, height, fit: 'cover', position: 'center' },
    quality,
  );

await Promise.all([
  cover(
    'assets/about-us/visi-misi/visi-misi-bg-raw.png',
    'visi-misi-bg.webp',
    1440,
    840,
    88,
  ),
  cover(
    'assets/about-us/visi-misi/visi-misi-bg-raw.png',
    'visi-misi-bg-2x.webp',
    2880,
    1680,
    86,
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
]);
