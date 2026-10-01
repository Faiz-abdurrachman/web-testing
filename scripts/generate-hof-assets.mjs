// Generates the served Hall of Frames artwork from the raw sources in
// `assets/hall of frames/`. Run with `npm run assets:hof`.
//
// Source of truth (see docs/assets.md §Hall of Frames):
// - HoF-Hero-Bg-raw.png → the raw Figma image-fill of the hero node 1439:4507.
//   It is baked as-is (FILL = object-fit: cover) instead of being rebuilt.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = 'assets/hall of frames/hero';
const out = 'public/images/hof';
const bg = path.join(src, 'HoF-Hero-Bg-raw.png');

await mkdir(out, { recursive: true });

await Promise.all([
  // 1440×903 hero frame; the source is 3344×1882 so the 2x (cover to 2880×1806)
  // needs ~3210px wide to stay sharp.
  sharp(bg)
    .resize({ width: 1440 })
    .webp({ quality: 86, effort: 5 })
    .toFile(path.join(out, 'hero-bg.webp')),
  sharp(bg)
    .resize({ width: 3210 })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(out, 'hero-bg-2x.webp')),
]);

console.log(`Hall of Frames artwork written to ${out}/`);
