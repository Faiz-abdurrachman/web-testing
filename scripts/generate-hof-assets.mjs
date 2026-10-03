// Generates the served Hall of Frames artwork from the raw sources in
// `assets/hall of frames/`. Run with `npm run assets:hof`.
//
// Source of truth (see docs/assets.md §Hall of Frames):
// - HoF-Hero-Bg-raw.png → the raw Figma image-fill of the hero node 1439:4507.
//   It is baked as-is (FILL = object-fit: cover) instead of being rebuilt.
import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = 'assets/hall of frames/hero';
const featuredSrc = 'assets/hall of frames/featured';
const milestoneSrc = 'assets/hall of frames/milestone';
const detailSrc = 'assets/hall of frames/detail-card';
const out = 'public/images/hof';
const featuredOut = path.join(out, 'featured');
const milestoneOut = path.join(out, 'milestone');
const detailOut = path.join(out, 'detail');
const bg = path.join(src, 'HoF-Hero-Bg-raw.png');

await mkdir(featuredOut, { recursive: true });
await mkdir(milestoneOut, { recursive: true });
await mkdir(detailOut, { recursive: true });

const webp = (input, output, width, quality) =>
  sharp(input)
    .resize({ width })
    .webp({ quality, effort: 5 })
    .toFile(path.join(featuredOut, output));

const webpIn = (dir) => (input, output, width, quality) =>
  sharp(input)
    .resize({ width })
    .webp({ quality, effort: 5 })
    .toFile(path.join(dir, output));
const milestoneWebp = webpIn(milestoneOut);

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
  // Featured Sorcerers cards: portraits are the Figma-rendered rects (already
  // cropped as displayed), the frame is the exported "Mask group" overlay.
  webp(path.join(featuredSrc, 'HoF-Photo-1-2x.png'), 'photo-1.webp', 302, 86),
  webp(
    path.join(featuredSrc, 'HoF-Photo-1-2x.png'),
    'photo-1-2x.webp',
    604,
    84,
  ),
  webp(path.join(featuredSrc, 'HoF-Photo-2-2x.png'), 'photo-2.webp', 302, 86),
  webp(
    path.join(featuredSrc, 'HoF-Photo-2-2x.png'),
    'photo-2-2x.webp',
    604,
    84,
  ),
  webp(path.join(featuredSrc, 'HoF-Card-Frame-2x.png'), 'frame.webp', 295, 90),
  webp(
    path.join(featuredSrc, 'HoF-Card-Frame-2x.png'),
    'frame-2x.webp',
    590,
    88,
  ),
  // Bottom violet fade. The MCP `linear-gradient` string is lossy (the rendered
  // reference is markedly bluer), so the node's own render is used as overlay.
  webp(path.join(featuredSrc, 'HoF-Card-Fade-2x.png'), 'fade.webp', 302, 90),
  webp(path.join(featuredSrc, 'HoF-Card-Fade-2x.png'), 'fade-2x.webp', 604, 88),
  // Community Milestone rail: gradient line + three diamonds (node 1439:4709).
  milestoneWebp(
    path.join(milestoneSrc, 'HoF-Milestone-Line-2x.png'),
    'rail.webp',
    14,
    90,
  ),
  milestoneWebp(
    path.join(milestoneSrc, 'HoF-Milestone-Line-2x.png'),
    'rail-2x.webp',
    28,
    88,
  ),
]);

// Featured detail card glow (node 1554:2898): the exported IMAGE-SVG already
// carries its blur filter, so it is served verbatim (positioned by the panel).
await cp(
  path.join(detailSrc, 'detail-glow.svg'),
  path.join(detailOut, 'glow.svg'),
);

console.log(`Hall of Frames artwork written to ${out}/`);
