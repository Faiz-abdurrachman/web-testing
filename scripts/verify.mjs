import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 903 },
  deviceScaleFactor: 1,
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
try {
  await page.goto(process.env.PREVIEW_URL || 'http://localhost:4321', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => document.fonts.ready);
  const desktop = await page.evaluate(async () => {
    const headingFonts = await document.fonts.load('80px Nasalization');
    return {
      nasalizationLoaded:
        headingFonts.length > 0 &&
        headingFonts.every((font) => font.status === 'loaded'),
      elements: Object.fromEntries(
        [
          '.hero',
          '.navbar',
          'h1',
          '.copy p',
          '.actions',
          '.brand',
          '.desktop-menu',
        ].map((selector) => {
          const element = document.querySelector(selector);
          const { x, y, width, height } = element.getBoundingClientRect();
          return [
            selector,
            { x, y, width, height, font: getComputedStyle(element).font },
          ];
        }),
      ),
    };
  });
  assert.equal(
    desktop.nasalizationLoaded,
    true,
    'Install the local Nasalization font or provide its licensed webfont before visual validation.',
  );
  await page.screenshot({ path: 'artifacts/hero-desktop.png', fullPage: true });
  const reference = await sharp('assets/hero section/Hero Section.png')
    .resize(1440, 903)
    .removeAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp('artifacts/hero-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(actual.length, reference.length);
  const difference = Buffer.alloc(actual.length);
  const overlay = Buffer.alloc(actual.length);
  let total = 0;
  for (let i = 0; i < actual.length; i++) {
    const delta = Math.abs(actual[i] - reference[i]);
    total += delta;
    difference[i] = Math.min(255, delta * 4);
    overlay[i] = Math.round((actual[i] + reference[i]) / 2);
  }
  const raw = { width: 1440, height: 903, channels: 3 };
  await sharp(difference, { raw }).png().toFile('artifacts/hero-diff.png');
  await sharp(overlay, { raw }).png().toFile('artifacts/hero-overlay.png');
  const sizes = [320, 390, 768, 1024, 1440, 1920];
  const responsive = [];
  for (const width of sizes) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Horizontal overflow at ${width}px`,
    );
    responsive.push(dimensions);
    if (width === 390) {
      await page.screenshot({
        path: 'artifacts/hero-mobile.png',
        fullPage: true,
      });
      await page.locator('summary').click();
      assert.equal(await page.locator('.mobile-menu').getAttribute('open'), '');
      await page.screenshot({
        path: 'artifacts/mobile-menu.png',
        fullPage: true,
      });
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('.mobile-menu').getAttribute('open'),
        null,
      );
    }
  }
  assert.deepEqual(errors, []);
  const report = {
    desktop,
    responsive,
    meanAbsoluteChannelDifference: total / actual.length,
    browserErrors: errors,
  };
  await writeFile(
    'artifacts/verification.json',
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
