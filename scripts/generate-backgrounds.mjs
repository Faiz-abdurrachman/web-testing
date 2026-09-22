import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
await mkdir('public/images/backgrounds', { recursive: true });
// Preserve the supplied pixels: no enlargement, downsampling, or lossy encoding.
for (const [source, name] of [
  ['hero', 'hero'],
  ['recruitment', 'recruitment'],
  ['footer', 'footer'],
  ['hitam bintang', 'stars'],
]) {
  const input = `assets/background/hd/${source}.png`;
  const output = `public/images/backgrounds/${name}.webp`;
  await sharp(input).webp({ lossless: true }).toFile(output);
  const original = await sharp(input).ensureAlpha().raw().toBuffer();
  const served = await sharp(output).ensureAlpha().raw().toBuffer();
  assert.ok(
    original.equals(served),
    `${name}: exported pixels must match the supplied source`,
  );
  console.log(`${name}: lossless pixel equality verified`);
}
// The old role exports contained titles/buttons. These are artwork-only fills.
for (const id of ['data', 'core', 'language', 'vision', 'product', 'growth']) {
  for (const width of [1280, 2560]) {
    await sharp(`public/images/hods/card-${id}.webp`)
      .resize({ width, withoutEnlargement: true })
      .webp({ lossless: true })
      .toFile(`public/images/roles/role-${id}-${width}.webp`);
  }
}
