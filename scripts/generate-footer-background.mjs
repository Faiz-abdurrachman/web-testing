import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Footer backdrop. The supplied `footerhd.png` is the same composition as the
// old `assets/background/hd/footer.png` but a sharper, brighter render, so all
// paths now derive from it. Desktop keeps the full 2.59:1 landscape; phones get
// a portrait derivative (extended star sky + the landscape anchored at the
// bottom) because a wide landscape cannot cover a portrait footer without a
// ~4x zoom that turns it to mush at DPR 3. See docs/assets.md §Footer.
const SRC = 'assets/assets home page/footer/footerhd.png';
const OUT_DIR = 'public/images/backgrounds';

await mkdir(OUT_DIR, { recursive: true });

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// A `1 x rows` gradient flattened to `width`, with +/-1 dither to keep the very
// dark sky from banding once it is encoded to WebP.
function skyGradient(width, height, from, to) {
  const buf = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    const t = height === 1 ? 0 : y / (height - 1);
    const r = lerp(from[0], to[0], t);
    const g = lerp(from[1], to[1], t);
    const b = lerp(from[2], to[2], t);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const d = ((Math.random() * 3) | 0) - 1;
      buf[i] = Math.max(0, Math.min(255, r + d));
      buf[i + 1] = Math.max(0, Math.min(255, g + d));
      buf[i + 2] = Math.max(0, Math.min(255, b + d));
    }
  }
  return buf;
}

async function average(input, region) {
  const { data } = await sharp(input)
    .extract(region)
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return [data[0], data[1], data[2]];
}

// Lossy WebP with a mean-absolute-error guard, matching
// scripts/generate-backgrounds.mjs.
async function encode(input, output, { quality }) {
  const reference = await sharp(input).png().toBuffer();
  await sharp(reference)
    .webp({ quality, effort: 6, smartSubsample: true })
    .toFile(output);
  const a = await sharp(reference).ensureAlpha().raw().toBuffer();
  const b = await sharp(output).ensureAlpha().raw().toBuffer();
  assert.equal(a.length, b.length, `${output}: dimension mismatch`);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff += Math.abs(a[i] - b[i]);
  const mae = diff / a.length;
  assert.ok(mae < 5, `${output}: MAE ${mae.toFixed(2)} exceeds tolerance`);
  return mae;
}

// Desktop / tablet: the sharp full landscape.
{
  const mae = await encode(SRC, `${OUT_DIR}/footer.webp`, { quality: 88 });
  console.log(`footer: webp q88 (MAE ${mae.toFixed(2)})`);
}

// Phones: portrait canvas so `object-fit: cover` fits the width instead of
// zooming. The art is scaled to `MW * ZOOM` (ZOOM > 1 crops the sides a little
// so the landscape keeps presence) and centred at the bottom; the sky above is
// a gradient that meets the art's top colour, screened with the site's star
// tile so it reads as the same sky.
{
  const meta = await sharp(SRC).metadata();
  const artW = meta.width;
  const artH = meta.height; // 2017 x 780
  const MW = 1170; // 3x a 390px viewport
  const MH = 3450; // taller than any phone footer → `cover` + bottom anchor
  const ZOOM = 1.35;
  const scaledW = Math.round(MW * ZOOM);
  const landscapeH = Math.round((artH * scaledW) / artW);
  const skyH = MH - landscapeH;

  const landscape = await sharp(SRC)
    .resize({ width: scaledW })
    .extract({
      left: Math.round((scaledW - MW) / 2),
      top: 0,
      width: MW,
      height: landscapeH,
    })
    .png()
    .toBuffer();

  const seam = await average(SRC, { left: 0, top: 0, width: artW, height: 3 });
  const zenith = [
    Math.round(seam[0] * 0.25),
    Math.round(seam[1] * 0.25),
    Math.round(seam[2] * 0.35),
  ];
  const sky = await sharp(skyGradient(MW, skyH, zenith, seam), {
    raw: { width: MW, height: skyH, channels: 3 },
  })
    .png()
    .toBuffer();

  const mobile = await sharp({
    create: {
      width: MW,
      height: MH,
      channels: 3,
      background: { r: seam[0], g: seam[1], b: seam[2] },
    },
  })
    .composite([
      { input: sky, top: 0, left: 0 },
      {
        input: 'public/images/starfield/starfield-base.png',
        tile: true,
        blend: 'screen',
      },
      { input: landscape, top: skyH, left: 0 },
    ])
    .webp({ quality: 84, effort: 6, smartSubsample: true })
    .toFile(`${OUT_DIR}/footer-mobile.webp`);

  console.log(
    `footer-mobile: webp q84 ${mobile.width}x${mobile.height} ` +
      `(${(mobile.size / 1024).toFixed(1)}KB, landscape ${landscapeH}px)`,
  );
}
