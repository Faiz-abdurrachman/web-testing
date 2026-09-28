import sharp from 'sharp';
import { copyFile, mkdir, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

// Re-encodes the heavy served WebP artwork to lossy quality. The first run
// copies each file to assets/image-src/<path> and every later run encodes from
// that pristine copy, so the script is repeatable without compounding loss.
// backgrounds/, roles/ and hero/ are owned by the generate-* scripts and skipped.
const PUB = 'public/images';
const SRC = 'assets/image-src';
const MIN_BYTES = 60 * 1024;

const groups = [
  { dir: 'recruitment', quality: 82 },
  { dir: 'footer', quality: 82 },
  { dir: 'what-you-will-do', quality: 82 },
  {
    dir: 'philosophy',
    quality: 82,
    resize: { 'glow.webp': 512, 'sorcerer-2x.webp': 1290 },
  },
  { dir: 'projects', quality: 82 },
  { dir: 'hods', quality: 85 },
];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith('.webp')) out.push(path);
  }
  return out;
}

let before = 0;
let after = 0;
for (const { dir, quality, resize = {} } of groups) {
  const root = join(PUB, dir);
  if (!existsSync(root)) continue;
  for (const file of await walk(root)) {
    const size = (await stat(file)).size;
    if (size < MIN_BYTES) continue;
    // Mid-density snippet variants are generated at the end of this script;
    // video posters are owned by the generate-*-video scripts.
    if (file.includes('-960.webp') || file.endsWith('hero-poster.webp'))
      continue;
    const rel = file.slice(PUB.length + 1);
    const pristine = join(SRC, rel);
    if (!existsSync(pristine)) {
      await mkdir(dirname(pristine), { recursive: true });
      await copyFile(file, pristine);
    }
    const pristineSize = (await stat(pristine)).size;
    const width = resize[basename(file)];
    const pipe = sharp(pristine);
    if (width) pipe.resize({ width, withoutEnlargement: true });
    await pipe.webp({ quality, effort: 6, smartSubsample: true }).toFile(file);
    let next = (await stat(file)).size;
    if (next >= pristineSize) {
      await copyFile(pristine, file);
      next = pristineSize;
      console.log(`${rel}: kept original ${(next / 1024).toFixed(0)}KB`);
    } else {
      console.log(
        `${rel}: ${(size / 1024).toFixed(0)}KB -> ${(next / 1024).toFixed(0)}KB (q${quality})`,
      );
    }
    before += size;
    after += next;
  }
}
console.log(
  `total: ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(1)}MB`,
);

// Mid-density Snippets hero variant (960w, q82) for phones at DPR 2. Encoded
// from the pristine 1280w source so repeated runs never compound loss; the
// carousel's honest `sizes` picks it instead of the 2560w `-2x` on small
// screens. The `-960` files are skipped by the loop above.
for (const n of [1, 2, 3, 4, 5]) {
  const src = join(SRC, 'recruitment', `snippet-hero-${n}.webp`);
  if (!existsSync(src)) continue;
  const out = join(PUB, 'recruitment', `snippet-hero-${n}-960.webp`);
  await sharp(src)
    .resize({ width: 960, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6, smartSubsample: true })
    .toFile(out);
  console.log(
    `snippet-hero-${n}-960.webp: ${((await stat(out)).size / 1024).toFixed(0)}KB`,
  );
}

// Logo is served on every page at ~54x59 from a 192x210 PNG; palette-quantising
// it cuts ~40KB to ~14KB with an opaque-pixel MAE of ~1.4 (invisible at display
// size). The pristine original is kept under assets/image-src/ for repeatability.
const LOGO = join(PUB, 'logo.png');
const LOGO_SRC = join(SRC, 'logo.png');
if (existsSync(LOGO)) {
  if (!existsSync(LOGO_SRC)) {
    await mkdir(dirname(LOGO_SRC), { recursive: true });
    await copyFile(LOGO, LOGO_SRC);
  }
  await sharp(LOGO_SRC)
    .png({ palette: true, compressionLevel: 9 })
    .toFile(LOGO);
  console.log(
    `logo.png: ${((await stat(LOGO)).size / 1024).toFixed(1)}KB (palette)`,
  );
}
