import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Homepage hero plate. The art is the exact Figma image fill of the hero frame
// (node 1430:2041), exported with `figma_download_figma_images` to
//   assets/assets home page/hero section/Home-Hero-Plate.png
// It is the full scene (background + sorcerer baked in) and reproduces the
// reference render to ~2.7 MAE in the background regions, replacing the old
// layered `background.webp` + `figure.webp` reconstruction (which was ~24 MAE).
//
// Baked to 1583×993 — the 1440×903 frame aspect — so `object-fit: cover` in the
// hero never recrops or distorts. `fit: cover` mirrors the Figma FILL crop.
const SRC = 'assets/assets home page/hero section/Home-Hero-Plate.png';
const ART_W = 1583;
const ART_H = 993;

await mkdir('public/images/hero', { recursive: true });

await sharp(SRC)
  .resize(ART_W, ART_H, { fit: 'cover', position: 'centre' })
  .webp({ quality: 85, effort: 6 })
  .toFile('public/images/hero/background.webp');

const meta = await sharp('public/images/hero/background.webp').metadata();
assert.equal(meta.width, ART_W, 'background.webp width');
assert.equal(meta.height, ART_H, 'background.webp height');
assert.equal(meta.hasAlpha, false, 'background.webp must be opaque');
console.log(
  `hero plate written (${meta.width}x${meta.height}, q85, ${(
    (await sharp('public/images/hero/background.webp').toBuffer()).length / 1024
  ).toFixed(0)}KB)`,
);
