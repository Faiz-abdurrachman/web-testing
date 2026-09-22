import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const origin = process.env.PREVIEW_URL || 'http://localhost:4331';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
});
const errors = [];
const requests = [];
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: 'reduce',
});
page.on('pageerror', (e) => errors.push(e.message));
page.on('response', (r) => {
  if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
});
page.on('request', (r) => requests.push(r.url()));
const report = { widths: [], checks: [] };
try {
  await page.goto(origin);
  assert.equal(
    requests.some((url) => /hero-lab|\.glb/.test(url)),
    false,
    'homepage does not request 3D assets',
  );
  requests.length = 0;
  await page.goto(`${origin}/lab/hero-3d/`);
  assert.equal(
    await page.locator('meta[name="robots"]').getAttribute('content'),
    'noindex, nofollow',
  );
  assert.equal(
    requests.some((url) => /\.glb/.test(url)),
    false,
    'models wait for user intent',
  );
  await page
    .getByRole('button', { name: 'Compare models', exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('#status')
        .textContent.startsWith('Original geometry'),
    { timeout: 60000 },
  );
  assert.equal(await page.locator('.lab').getAttribute('data-mode'), 'compare');
  await page.screenshot({ path: 'artifacts/lab-compare.png' });
  for (const name of ['Side', 'Back', 'Front']) {
    await page.getByRole('button', { name, exact: true }).click();
    await page.screenshot({ path: `artifacts/lab-${name.toLowerCase()}.png` });
  }
  await page.getByRole('button', { name: 'World', exact: true }).click();
  await page.waitForFunction(() =>
    document
      .querySelector('#status')
      .textContent.startsWith('Move your pointer'),
  );
  assert.equal(await page.locator('#motion').isDisabled(), true);
  const still = await page.locator('canvas').screenshot();
  await page.waitForTimeout(250);
  assert.ok(
    still.equals(await page.locator('canvas').screenshot()),
    'reduced motion stays visually still',
  );
  await page.screenshot({ path: 'artifacts/lab-hero.png' });
  await page.selectOption('#model', 'hunyuan');
  await page.waitForFunction(() =>
    document
      .querySelector('#status')
      .textContent.startsWith('Move your pointer'),
  );
  await page.screenshot({ path: 'artifacts/lab-hero-hunyuan.png' });
  for (const width of [320, 375, 390, 768, 1050, 1440, 1920, 2560, 3840]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const mode of ['World', 'Compare models']) {
      await page.getByRole('button', { name: mode, exact: true }).click();
      await page.waitForFunction(
        () =>
          !document.querySelector('#status').textContent.startsWith('Loading'),
      );
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `overflow at ${width}/${mode}`,
      );
      const toolbar = await page.locator('.toolbar').boundingBox();
      assert.ok(toolbar.x >= 0 && toolbar.x + toolbar.width <= width + 1);
      if (width === 390)
        await page.screenshot({
          path: `artifacts/lab-mobile-${mode === 'World' ? 'hero' : 'compare'}.png`,
        });
    }
    report.widths.push(width);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'World', exact: true }).click();
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  assert.equal(
    await page.locator('#motion').getAttribute('aria-pressed'),
    'true',
  );
  await page
    .getByRole('button', { name: 'Resume motion', exact: true })
    .click();
  assert.equal(
    await page.locator('#motion').getAttribute('aria-pressed'),
    'false',
  );
  assert.deepEqual(errors, []);
  report.checks = [
    'homepage isolation',
    'click-to-load',
    'compare as first action',
    'front/side/back',
    'model switch',
    'reduced-motion static frame',
    'pause/resume',
    'responsive containment',
    'no browser errors',
  ];
  await writeFile(
    'artifacts/hero-lab-verification.json',
    JSON.stringify(report, null, 2),
  );
  console.log('Hero lab PASS', report);
} finally {
  await browser.close();
}
