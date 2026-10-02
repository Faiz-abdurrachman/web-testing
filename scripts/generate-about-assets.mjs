// Generates the served About Us artwork from the raw sources in
// `assets/about-us/`. Run with `npm run assets:about`.
//
// Source of truth (see docs/assets.md §About Us):
// - visi-misi/visi-misi-bg-raw.png → the node 1439:4190 IMAGE fill (starfield
//   backing). Served as a 1440 × 840 cover crop + a 2× variant.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const out = 'public/images/about';

await mkdir(out, { recursive: true });

const cover = (input, output, width, height, quality) =>
  sharp(input)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .webp({ quality, effort: 5 })
    .toFile(path.join(out, output));

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
]);
