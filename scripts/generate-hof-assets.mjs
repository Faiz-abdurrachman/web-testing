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
const featuredSrc = 'assets/hall of frames/featured';
const projectsSrc = 'assets/hall of frames/projects';
const milestoneSrc = 'assets/hall of frames/milestone';
const out = 'public/images/hof';
const featuredOut = path.join(out, 'featured');
const projectsOut = path.join(out, 'projects');
const milestoneOut = path.join(out, 'milestone');
const bg = path.join(src, 'HoF-Hero-Bg-raw.png');

await mkdir(featuredOut, { recursive: true });
await mkdir(projectsOut, { recursive: true });
await mkdir(milestoneOut, { recursive: true });

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
const projectWebp = webpIn(projectsOut);
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
  // Project highlights: the browser-mockup screenshot is the raw image fill;
  // the bow-tie glow is the exported (blur-baked) IMAGE-SVG node 1439:4656.
  projectWebp(
    path.join(projectsSrc, 'HoF-Project-Shot-raw.png'),
    'shot.webp',
    933,
    88,
  ),
  projectWebp(
    path.join(projectsSrc, 'HoF-Project-Shot-raw.png'),
    'shot-2x.webp',
    1799,
    86,
  ),
  // Blur-baked glow: very soft/low-frequency, so a single downscaled asset is
  // visually identical and far lighter than the 3514px export.
  projectWebp(
    path.join(projectsSrc, 'HoF-Projects-Glow-2x.png'),
    'glow.webp',
    1200,
    70,
  ),
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

console.log(`Hall of Frames artwork written to ${out}/`);
