import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const snapshot = JSON.parse(
  await readFile(new URL('src/data/cms-snapshot.json', root)),
);
const design = await readFile(new URL('src/data/hods.ts', root), 'utf8');
const labels = [...design.matchAll(/label: '([^']+)'/g)].map(
  (match) => match[1],
);
assert.equal(labels.length, 21);
const origin = process.env.PREVIEW_URL || 'http://localhost:4331';
const output = new URL('artifacts/cms-pass5/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const results = [];
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const [entry, section, from, href, backLabel] of [
      ['/', '#domains', null, '/#domains', 'Back to HoDS'],
      [
        '/recruitment/',
        '#who-should-join',
        'recruitment',
        '/recruitment#who-should-join',
        'Back to Who Should Join',
      ],
    ]) {
      await page.goto(origin + entry, { waitUntil: 'networkidle' });
      let labelOffset = 0;
      let tabsChecked = 0;
      let blocksChecked = 0;
      let bulletsChecked = 0;
      for (const h of snapshot.hods) {
        const card = page.locator(`${section} .domain-card.${h.id}`);
        await card.scrollIntoViewIfNeeded();
        await card.click();
        await page.waitForURL(
          (url) => url.pathname.replace(/\/$/, '') === `/hods/${h.id}`,
        );
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.fonts.ready);
        assert.equal(new URL(page.url()).searchParams.get('from'), from);
        assert.equal(
          await page.locator('.role-copy h1').textContent(),
          h.title,
        );
        assert.equal(
          await page.locator('.role-copy p').textContent(),
          h.description,
        );
        const art = page.locator('.hods-detail .role-art');
        assert.equal(
          await art.getAttribute('src'),
          `/images/hods/card-${h.id}.webp`,
        );
        await art.evaluate(async (img) => {
          await img.decode();
          assertImage(img);
          function assertImage(i) {
            if (!i.naturalWidth) throw Error('Undecoded artwork');
          }
        });
        const tabs = page.locator('.hods-detail [role=tab]');
        assert.deepEqual(
          await tabs.allTextContents(),
          labels.slice(labelOffset, labelOffset + h.tabs.length),
        );
        labelOffset += h.tabs.length;
        const checkState = async (selected, keyboard = false) => {
          const state = await page.locator('.hods-detail').evaluate((root) => ({
            tabs: [...root.querySelectorAll('[role=tab]')].map((tab) => ({
              selected: tab.getAttribute('aria-selected'),
              tabindex: tab.tabIndex,
              active: tab.classList.contains('active'),
              controls: tab.getAttribute('aria-controls'),
              focused: tab === document.activeElement,
            })),
            panels: [...root.querySelectorAll('[role=tabpanel]')].map(
              (panel) => ({ id: panel.id, hidden: panel.hidden }),
            ),
          }));
          for (let i = 0; i < h.tabs.length; i++) {
            assert.equal(state.tabs[i].selected, String(i === selected));
            assert.equal(state.tabs[i].tabindex, i === selected ? 0 : -1);
            assert.equal(state.tabs[i].active, i === selected);
            assert.equal(state.panels[i].hidden, i !== selected);
            assert.equal(state.tabs[i].controls, state.panels[i].id);
          }
          if (keyboard) assert(state.tabs[selected].focused);
        };
        for (let t = 0; t < h.tabs.length; t++) {
          await tabs.nth(t).click();
          await checkState(t);
          const panel = page.locator(`#panel-${h.id}-${t}`);
          assert(await panel.isVisible());
          const content = await panel.locator('.block').evaluateAll((blocks) =>
            blocks.map((block) => {
              const title = block.querySelector('h2').textContent;
              const list = block.querySelector('.bullets');
              return list
                ? {
                    title,
                    bullets: [
                      ...list.querySelectorAll('li > span:last-child'),
                    ].map((item) => item.textContent),
                  }
                : { title, text: block.querySelector('.body').textContent };
            }),
          );
          assert.deepEqual(content, h.tabs[t].sections);
          assert(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
          );
          tabsChecked++;
          blocksChecked += content.length;
          bulletsChecked += content.reduce(
            (count, s) => count + (s.bullets?.length || 0),
            0,
          );
        }
        // Every arrow transition and both wrap directions, including focus state.
        await tabs.nth(0).focus();
        for (let t = 1; t <= h.tabs.length; t++) {
          await page.keyboard.press('ArrowRight');
          await checkState(t % h.tabs.length, true);
        }
        await page.keyboard.press('ArrowLeft');
        await checkState(h.tabs.length - 1, true);
        for (let t = h.tabs.length - 2; t >= 0; t--) {
          await page.keyboard.press('ArrowLeft');
          await checkState(t, true);
        }
        const back = page.locator('.hods-detail .back');
        assert.equal(await back.getAttribute('href'), href);
        assert.equal(await back.locator('span').textContent(), backLabel);
        await back.click();
        await page.waitForURL((url) => url.hash === section);
        await page.waitForLoadState('networkidle');
        assert(await page.locator(section).isVisible());
      }
      assert.equal(tabsChecked, 21);
      assert.equal(blocksChecked, 55);
      assert.equal(bulletsChecked, 8);
      results.push({
        width,
        entry,
        routes: 6,
        tabs: tabsChecked,
        blocks: blocksChecked,
        bullets: bulletsChecked,
        exactContentAndDesignLabels: true,
        clickKeyboardAriaFocusHidden: true,
        entryBackViewTransitions: true,
      });
      console.log(
        `PASS Hods ${width} ${entry}: 6 routes, 21 tabs, 55 blocks, 8 bullets, content/keyboard/back`,
      );
    }
    assert.deepEqual(errors, []);
    await context.close();
  }
  await writeFile(
    new URL('hods-browser.json', output),
    JSON.stringify(
      { origin, results, pageErrors: [], checkedAt: new Date().toISOString() },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
