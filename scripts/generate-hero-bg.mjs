// Full-screen hero backgrounds (fix-9 #9 + HD pass). Bakes the user-supplied
// art in `assets/hero gambar/` to `public/images/<page>/<base>.webp` at 1×, 2×
// and 3× so the heroes stay sharp on retina and 4K displays. The source images
// carry no text — heading/subtitle/buttons stay real HTML on top (see
// docs/page-fullscreen-migration-plan.md).
//
// A variant is skipped when it would upscale the source by more than ~15%, so
// we never serve a blurry upscale (e.g. a 1600px source stops at 1×).
//
// Contact is NOT a full-bleed hero: its artwork is the fixed 801×600 Figma node
// 1445:5067 placed at −131/−92 (see generate-contact-assets.mjs).
//
// Run: `npm run assets:heroes`.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// page → [source, frame width, frame height, output dir, file base]
const heroes = {
  home: [
    'assets/hero gambar/Gambar Hero Section homepage.png',
    1440,
    903,
    'public/images/hero',
    'background',
  ],
  about: [
    'assets/hero gambar/Hero Section - About Us.png',
    1440,
    903,
    'public/images/about',
    'hero-bg',
  ],
  recruitment: [
    'assets/hero gambar/Gambar Hero recruitment.png',
    1440,
    866,
    'public/images/recruitment',
    'hero-bg',
  ],
  partners: [
    'assets/hero gambar/Hero Section - Partners.png',
    1440,
    659,
    'public/images/partners',
    'hero-bg',
  ],
  hof: [
    'assets/hero gambar/Hero Section - HoF.png',
    1440,
    903,
    'public/images/hof',
    'hero-bg',
  ],
};

const variants = [
  { suffix: '', scale: 1, quality: 88 },
  { suffix: '-2x', scale: 2, quality: 86 },
  { suffix: '-3x', scale: 3, quality: 84 },
];

for (const [page, [src, width, height, dir, base]] of Object.entries(heroes)) {
  await mkdir(dir, { recursive: true });
  const meta = await sharp(src).metadata();
  for (const { suffix, scale, quality } of variants) {
    const w = width * scale;
    // Never upscale the source by more than ~15% (that would look soft).
    if (w > meta.width * 1.15) continue;
    const h = Math.round((w / width) * height);
    const out = `${dir}/${base}${suffix}.webp`;
    await sharp(src)
      .resize(w, h, { fit: 'cover', position: 'centre' })
      .webp({ quality, effort: 6 })
      .toFile(out);
    console.log(`${page}: ${base}${suffix}.webp ${w}×${h} q${quality}`);
  }
}
