import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Layered hero (Option B): a clean plate plus an isolated sorcerer cutout, both
// exported as full-frame 1583x993 art so `object-fit: cover` keeps them aligned
// at every viewport. Placement was measured from the reference hero art:
//   character height 355px of 993 (35.7%), feet at 86% height, centred at 60.5%.
const PACK = 'assets/background/hero/data-sorcerers-hero-production-pack';
const ART_W = 1583;
const ART_H = 993;
const CHAR_H = 355;
const CHAR_CX = 0.605;
const CHAR_FEET = 0.86;
const REFLECTION_OPACITY = 0.32;
const REFLECTION_BLUR = 3;

await mkdir('public/images/hero', { recursive: true });

const bg = await sharp(`${PACK}/background/background_clean.png`)
  .resize(ART_W, ART_H, { fit: 'fill' })
  .png()
  .toBuffer();

const char = await sharp(`${PACK}/character/sorcerer_primary.png`)
  .trim({ threshold: 1 })
  .resize({ height: CHAR_H })
  .png()
  .toBuffer();
const cm = await sharp(char).metadata();
assert.equal(
  cm.height,
  CHAR_H,
  'character height must match the measured 355px',
);
assert.equal(cm.channels, 4, 'character cutout must keep its alpha channel');

const left = Math.round(CHAR_CX * ART_W - cm.width / 2);
const top = Math.round(CHAR_FEET * ART_H - cm.height);
assert.ok(left >= 0 && top >= 0, 'character must sit inside the art frame');

// Mirror the cutout into the water to match the reference reflection.
const reflRaw = await sharp(char)
  .flip()
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let i = 3; i < reflRaw.data.length; i += 4)
  reflRaw.data[i] = Math.round(reflRaw.data[i] * REFLECTION_OPACITY);
const reflection = await sharp(reflRaw.data, {
  raw: { width: reflRaw.info.width, height: reflRaw.info.height, channels: 4 },
})
  .blur(REFLECTION_BLUR)
  .png()
  .toBuffer();

const figure = await sharp({
  create: {
    width: ART_W,
    height: ART_H,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: reflection, left, top: top + cm.height },
    { input: char, left, top },
  ])
  .png()
  .toBuffer();

await sharp(bg)
  .webp({ quality: 86, effort: 6 })
  .toFile('public/images/hero/background.webp');
await sharp(figure)
  .webp({ lossless: true, effort: 6 })
  .toFile('public/images/hero/figure.webp');

for (const [name, file, hasAlpha] of [
  ['background.webp', 'public/images/hero/background.webp', false],
  ['figure.webp', 'public/images/hero/figure.webp', true],
]) {
  const meta = await sharp(file).metadata();
  assert.equal(meta.width, ART_W, `${name} width`);
  assert.equal(meta.height, ART_H, `${name} height`);
  assert.equal(meta.hasAlpha, hasAlpha, `${name} alpha flag`);
}
console.log(
  `hero layers written (char ${cm.width}x${cm.height} left=${left} top=${top}, reflection ${REFLECTION_OPACITY})`,
);
