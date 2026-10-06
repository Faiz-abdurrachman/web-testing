// Full-screen hero backgrounds (fix-9 #9). Bakes the user-supplied art in
// `assets/hero gambar/` to `public/images/<page>/hero-bg.webp` (1×) and
// `hero-bg-2x.webp` (2×). The source images carry no text — heading/subtitle/
// buttons stay real HTML on top (see docs/page-fullscreen-migration-plan.md).
//
// Run: `npm run assets:heroes` (add pages here as the migration progresses).
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

// page → [source, frame width, frame height, output dir]
const heroes = {
  recruitment: [
    'assets/hero gambar/Gambar Hero recruitment.png',
    1440,
    866,
    'public/images/recruitment',
  ],
  partners: [
    'assets/hero gambar/Hero Section - Partners.png',
    1440,
    659,
    'public/images/partners',
  ],
};

for (const [page, [source, width, height, dir]] of Object.entries(heroes)) {
  await mkdir(dir, { recursive: true });
  const bake = (out, w, h, quality) =>
    sharp(source)
      .resize(w, h, { fit: 'cover', position: 'centre' })
      .webp({ quality, effort: 6 })
      .toFile(`${dir}/${out}`);
  await bake('hero-bg.webp', width, height, 85);
  await bake('hero-bg-2x.webp', width * 2, height * 2, 82);
  console.log(`${page}: hero-bg.webp ${width}×${height} + 2× written`);
}
