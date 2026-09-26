import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.PREVIEW_URL || 'http://localhost:4331';
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const ids = ['data', 'core', 'language', 'vision', 'product', 'growth'];
const errors = [],
  images = [];
await mkdir('artifacts/feedback', { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 903 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => errors.push(e.message));
  const ready = async () => {
    await page.evaluate(() => document.fonts.ready);
  };
  for (const route of ['/', '/recruitment']) {
    await page.goto(base + route);
    await ready();
    const rail = page.locator('.domain-rail');
    await rail.scrollIntoViewIfNeeded();
    const geometry = await rail.evaluate((r) => {
      const b = r.getBoundingClientRect();
      const cards = [...r.children].map((e) => e.getBoundingClientRect());
      return {
        left: b.left,
        right: innerWidth - b.right,
        visible: cards.filter(
          (c) => c.left >= b.left - 1 && c.right <= b.right + 1,
        ).length,
      };
    });
    assert.equal(geometry.visible, 3);
    assert.equal(geometry.left, geometry.right);
    for (const [index, id] of ids.entries()) {
      await rail.evaluate((r, i) => {
        r.scrollLeft =
          i *
          (r.children[0].getBoundingClientRect().width +
            parseFloat(getComputedStyle(r).gap));
      }, index);
      await page.locator(`.domain-card.${id}`).click();
      await page.waitForURL(`**/hods/${id}*`);
      assert.equal(
        new URL(page.url()).search,
        route === '/' ? '' : '?from=recruitment',
      );
      assert.equal(
        await page.locator('.back').getAttribute('href'),
        route === '/' ? '/#domains' : '/recruitment#who-should-join',
      );
      await page.locator('.back').click();
      await page.waitForURL(
        route === '/' ? '**/#domains' : '**/recruitment#who-should-join',
      );
      await ready();
    }
    await rail.evaluate((r) => (r.scrollLeft = 0));
    await rail.scrollIntoViewIfNeeded();
    const rect = await rail.boundingBox();
    await page.mouse.move(rect.x + 600, rect.y + 100);
    await page.mouse.down();
    await page.mouse.move(rect.x + 160, rect.y + 100, { steps: 15 });
    await page.mouse.up();
    assert.equal(new URL(page.url()).pathname, route);
    assert.ok(
      await rail.evaluate((r) => r.scrollLeft > 100),
      'drag should scroll without navigating',
    );
    await rail.focus();
    await page.keyboard.press('Home');
    await page.keyboard.press('End');
    assert.ok(
      await rail.evaluate(
        (r) => Math.abs(r.scrollWidth - r.clientWidth - r.scrollLeft) < 2,
      ),
    );
  }
  await page.goto(base + '/recruitment');
  await ready();
  for (const id of ids) {
    await page.locator(`.role-row[href$="/${id}"]`).click();
    await page.waitForURL(`**/recruitment/roles/${id}`);
    assert.equal(await page.locator('h1').count(), 1);
    assert.equal(
      await page.locator('.back').getAttribute('href'),
      '/recruitment#available-roles',
    );
    await page.locator('.back').click();
    await page.waitForURL('**/recruitment#available-roles');
  }
  for (const route of ['/', '/recruitment']) {
    await page.goto(base + route);
    await ready();
    await page.locator('.footer').scrollIntoViewIfNeeded();
    assert.ok(
      await page
        .locator('.legal')
        .evaluate(
          (e) =>
            Math.abs(
              e.getBoundingClientRect().right -
                e.querySelector('.legal-links').getBoundingClientRect().right,
            ) < 1,
        ),
    );
  }
  // Real touch taps must retain anchor navigation as well as mouse clicks.
  const touch = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'reduce',
  });
  const mobile = await touch.newPage();
  for (const route of ['/', '/recruitment']) {
    await mobile.goto(base + route);
    await mobile.evaluate(() => document.fonts.ready);
    for (const [index, id] of ids.entries()) {
      await mobile.locator('.domain-rail').evaluate((rail, i) => {
        rail.scrollLeft =
          i * (rail.children[0].getBoundingClientRect().width + 24);
      }, index);
      await mobile.locator(`.domain-card.${id}`).tap();
      await mobile.waitForURL(`**/hods/${id}*`);
      await mobile.locator('.back').tap();
      await mobile.waitForURL(
        route === '/' ? '**/#domains' : '**/recruitment#who-should-join',
      );
    }
  }
  await touch.close();
  for (const dpr of [1, 2]) {
    const context = await browser.newContext({
      deviceScaleFactor: dpr,
      reducedMotion: 'reduce',
    });
    const p = await context.newPage();
    for (const [width, height] of [
      [390, 844],
      [1366, 768],
      [1920, 1080],
      [3840, 2160],
    ]) {
      await p.setViewportSize({ width, height });
      for (const route of ['/', '/recruitment']) {
        await p.goto(base + route);
        await p.evaluate(() => document.fonts.ready);
        const img = p.locator(
          route === '/' ? '.artwork .art-bg' : '.recruitment-hero .artwork img',
        );
        await img.evaluate((i) => i.decode());
        images.push({
          route,
          width,
          height,
          dpr,
          ...(await img.evaluate((i) => ({
            source: i.currentSrc,
            naturalWidth: i.naturalWidth,
            naturalHeight: i.naturalHeight,
            renderWidth: i.clientWidth,
            renderHeight: i.clientHeight,
          }))),
        });
        assert.ok(
          await p
            .locator(route === '/' ? '.hero' : '.recruitment-hero')
            .evaluate(
              (e) => e.clientHeight <= innerHeight + 1 || innerWidth < 600,
            ),
          'desktop hero must fit viewport',
        );
        await p.screenshot({
          path: `artifacts/feedback/${route === '/' ? 'home' : 'recruitment'}-${width}-${dpr}x.png`,
        });
      }
    }
    await context.close();
  }
  await page.goto(base + '/recruitment');
  await ready();
  await page.addStyleTag({ content: '.navbar,.skip-link{visibility:hidden}' });
  await page
    .locator('.available-roles')
    .screenshot({ path: 'artifacts/feedback/available-roles.png' });
  await page.goto(base + '/');
  await ready();
  await page.addStyleTag({ content: '.navbar,.skip-link{visibility:hidden}' });
  await page
    .locator('.domains')
    .screenshot({ path: 'artifacts/feedback/hods-desktop.png' });
  await page.goto(base + '/recruitment/roles/core');
  await ready();
  await page.locator('.role-art').evaluate((i) => i.decode());
  await page.screenshot({ path: 'artifacts/feedback/core.png' });
  assert.deepEqual(errors, []);
  await writeFile(
    'artifacts/feedback/report.json',
    JSON.stringify({ images, errors }, null, 2),
  );
  console.log(
    'PASS: card clicks, drag, keyboard, back links, three-card bounds, footer, hero viewport and DPR screenshots',
  );
} finally {
  await browser.close();
}
