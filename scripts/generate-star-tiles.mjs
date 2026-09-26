import { chromium } from '@playwright/test';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { starfieldPatterns } from './starfield-patterns.mjs';

// The What We Do section paints three huge star layers as dozens of CSS
// `radial-gradient`s. Re-evaluating those gradients while the layers raster is
// what makes scrolling into the section hitch. Here we rasterise each periodic
// tile once, in the same engine (Chromium), so the served images are
// pixel-faithful to the original gradients — the page then just blits a small
// repeating texture instead of evaluating 8–42 gradients per tile.
//
// Run with: npm run assets:starfield
const CHROMIUM = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const OUT_DIR = 'public/images/starfield';

await mkdir(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

try {
  for (const [name, { size, image }] of Object.entries(starfieldPatterns)) {
    const [width, height] = size
      .split(' ')
      .map((token) => Math.round(Number.parseFloat(token)));
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.setContent(
      `<!doctype html><html><head><style>
        html,body{margin:0;padding:0;background:transparent}
        .tile{width:${width}px;height:${height}px;background-color:transparent;
          background-image:${image};
          background-size:${size};background-repeat:repeat}
      </style></head><body><div class="tile"></div></body></html>`,
      { waitUntil: 'load' },
    );
    const file = `${OUT_DIR}/starfield-${name}.png`;
    await page.screenshot({ path: file, omitBackground: true });
    await context.close();

    const meta = await sharp(file).metadata();
    assert.equal(meta.width, width, `${name} tile width`);
    assert.equal(meta.height, height, `${name} tile height`);
    assert.ok(meta.hasAlpha, `${name} tile must keep alpha`);
    console.log(
      `starfield-${name}.png ${meta.width}x${meta.height} (${size}, ` +
        `${(image.match(/radial-gradient/g) || []).length} gradients)`,
    );
  }
} finally {
  await browser.close();
}
