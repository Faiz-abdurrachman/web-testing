import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const base = process.env.PREVIEW_URL || 'http://localhost:4333';
await mkdir('artifacts/splash', { recursive: true });
const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    const context = await browser.newContext({
      viewport,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.locator('.splash').waitFor({ state: 'visible' });
    await page.waitForTimeout(900);
    assert.deepEqual(
      await page
        .locator('.splash img')
        .evaluateAll((nodes) => nodes.map((el) => el.getAttribute('src'))),
      ['/images/logo.png'],
    );
    assert(
      await page
        .locator('.splash-scene')
        .evaluate((el) =>
          [...el.querySelectorAll('*')].every(
            (node) => !getComputedStyle(node).backgroundImage.includes('url('),
          ),
        ),
      'scene must be native, not a raster background',
    );
    assert.deepEqual(
      await page
        .locator('.seal-outer circle')
        .evaluateAll((nodes) =>
          nodes.map((el) => Number(el.getAttribute('r'))),
        ),
      [182, 206, 216, 245, 250, 259],
    );
    const nativeBefore = await page
      .locator('.splash-atmosphere')
      .evaluate((canvas) => canvas.toDataURL());
    const rotationBefore = await page
      .locator('.seal-turn')
      .evaluate((el) => getComputedStyle(el).transform);
    for (const selector of ['.splash-word', '.splash-sub']) {
      const box = await page.locator(selector).boundingBox();
      assert(
        box && box.x >= 0 && box.x + box.width <= viewport.width,
        `${selector} containment`,
      );
      assert(
        await page
          .locator(selector)
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
        `${selector} text overflow`,
      );
    }
    const arc = page.locator('.splash-progress');
    const before = await arc.evaluate((el) =>
      Number(el.style.strokeDashoffset),
    );
    await page.mouse.click(5, 5);
    assert(
      await page
        .locator('html')
        .evaluate((el) => el.classList.contains('splash-armed')),
      'early click must not bypass minimum',
    );
    await page.waitForTimeout(100);
    const after = await arc.evaluate((el) => Number(el.style.strokeDashoffset));
    assert.notEqual(
      await page
        .locator('.seal-turn')
        .evaluate((el) => getComputedStyle(el).transform),
      rotationBefore,
      'ring rotates independently',
    );
    assert.notEqual(
      await page
        .locator('.splash-atmosphere')
        .evaluate((canvas) => canvas.toDataURL()),
      nativeBefore,
      'procedural atmosphere evolves',
    );
    assert(after <= before, 'progress must never run backwards');
    await page.waitForFunction(
      () => document.documentElement.classList.contains('splash-done'),
      {},
      { timeout: 12000 },
    );
    await page.locator('.splash').waitFor({ state: 'detached' });
    assert.equal(
      await page.evaluate(() => document.documentElement.style.overflow),
      '',
    );
    await page.reload({ waitUntil: 'domcontentloaded' });
    assert.equal(await page.locator('.splash').count(), 0, 'once per session');
    assert.deepEqual(errors, []);
    await context.close();
    // Capture in a separate context so screenshot/font waits cannot race
    // the real 3s/6s preloader tested above. Production timing is untouched.
    const visual = await browser.newContext({
      viewport,
      reducedMotion: 'no-preference',
    });
    const shot = await visual.newPage();
    await shot.route(base + '/', async (route) => {
      const response = await route.fetch();
      const body = (await response.text())
        .replace('var MIN = 3000;', 'var MIN = 30000;')
        .replace('var MAX = 6000;', 'var MAX = 30000;');
      await route.fulfill({ response, body });
    });
    await shot.goto(base, { waitUntil: 'load' });
    await shot.waitForTimeout(1000);
    const screenshot = await shot.screenshot();
    await sharp(screenshot)
      .resize({ width: 760, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toFile(`artifacts/splash/${viewport.width}.jpg`);
    await visual.close();
    console.log(`PASS splash ${viewport.width}×${viewport.height}`);
  }
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  assert.equal(
    await page.locator('.splash').count(),
    0,
    'reduced motion skips splash',
  );
  await context.close();
  console.log('PASS reduced motion');
} finally {
  await browser.close();
}
