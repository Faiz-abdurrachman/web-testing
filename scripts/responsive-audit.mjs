import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.PREVIEW_URL || 'http://localhost:4321';
const IDS = ['data', 'core', 'language', 'vision', 'product', 'growth'];
const ROUTES = [
  '/',
  '/recruitment',
  ...IDS.map((id) => `/hods/${id}`),
  ...IDS.map((id) => `/recruitment/roles/${id}`),
];
const WIDTHS = [
  320, 360, 375, 390, 414, 480, 600, 760, 768, 820, 900, 1024, 1050, 1051, 1100,
  1200, 1280, 1300, 1366, 1440, 1600, 1680, 1920, 2560, 3440, 3840,
];

const measure = (page) =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - innerWidth;
    const issues = [];

    // 1. top-level sections that visually extend past the viewport
    for (const el of document.querySelectorAll('main > *, footer')) {
      const box = el.getBoundingClientRect();
      if (box.right > innerWidth + 1)
        issues.push(
          `overflow:${el.tagName.toLowerCase()}.${(el.className || '').toString().split(/\s+/)[0]}`,
        );
    }

    // 2. clipped text (not in a deliberate scroller / dimmed neighbour card)
    const textNodes = document.querySelectorAll(
      'main h1, main h2, main h3, main h4, main h5, main h6, main p, ' +
        'main li, main label, main a, main button, footer h2, footer p, ' +
        'footer li, footer a, footer span',
    );
    for (const el of textNodes) {
      if (!el.textContent || !el.textContent.trim()) continue;
      if (el.closest('.domain-rail')) continue;
      if (el.closest('.project-card:not(.is-active)')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const name = `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(/\s+/)[0] || ''}`;
      if (rect.right > innerWidth + 1 || rect.left < -1) {
        const ancestor = el.closest('main, footer');
        if (ancestor && ancestor.scrollWidth <= ancestor.clientWidth + 1)
          issues.push(`offscreen:${name}`);
        continue;
      }
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
          const box = parent.getBoundingClientRect();
          if (rect.right > box.right + 1 || rect.left < box.left - 1)
            issues.push(`clipped:${name}`);
          break;
        }
        parent = parent.parentElement;
      }
    }

    // 3. carousel arrows must never sit on top of the content they drive.
    //    The rail's side arrows legitimately overlay the scrolling cards (there
    //    is no gutter wide enough), so only the focused card and the gallery
    //    hero/thumbnails are checked.
    const overlapChecks = [
      ['.project-arrow.next', '.project-card.is-active'],
      ['.project-arrow.prev', '.project-card.is-active'],
      ['.snippet-arrow.next', '.gallery-hero'],
      ['.snippet-arrow.next', '.gallery-thumbs'],
    ];
    for (const [a, b] of overlapChecks) {
      const arrow = document.querySelector(a)?.getBoundingClientRect();
      if (!arrow) continue;
      for (const el of document.querySelectorAll(b)) {
        const box = el.getBoundingClientRect();
        const overlapX =
          Math.min(arrow.right, box.right) - Math.max(arrow.x, box.x);
        const overlapY =
          Math.min(arrow.bottom, box.bottom) - Math.max(arrow.y, box.y);
        if (overlapX > 6 && overlapY > 6) {
          issues.push(`overlap:${a}×${b}`);
          break;
        }
      }
    }

    // 4. navbar shows the right menu for the breakpoint (pages with a navbar)
    const desktop = document.querySelector('.desktop-menu');
    const mobile = document.querySelector('.mobile-menu');
    if (desktop && mobile) {
      const mobileExpected = innerWidth <= 1050;
      const desktopNone = getComputedStyle(desktop).display === 'none';
      const mobileNone = getComputedStyle(mobile).display === 'none';
      if (desktopNone !== mobileExpected)
        issues.push('navbar:desktop-menu-wrong');
      if (mobileNone !== !mobileExpected)
        issues.push('navbar:mobile-menu-wrong');
    }

    return { overflow, issues: [...new Set(issues)] };
  });

await mkdir('artifacts', { recursive: true });
const results = [];
const browserErrors = [];
let combos = 0;

for (const route of ROUTES) {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => browserErrors.push(`${route}: ${e.message}`));
    page.on('response', (r) => {
      if (r.status() >= 400)
        browserErrors.push(`${route}: ${r.status()} ${r.url()}`);
    });
    for (const width of WIDTHS) {
      try {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${BASE}${route}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });
        await page.evaluate(async () => {
          document.querySelectorAll('img[loading=lazy]').forEach((i) => {
            i.loading = 'eager';
          });
          await Promise.race([
            document.fonts.ready,
            new Promise((r) => setTimeout(r, 2000)),
          ]);
        });
        await page.evaluate(() => scrollTo(0, 0));
        const data = await measure(page);
        if (data.overflow > 1 || data.issues.length)
          results.push({
            route,
            width,
            overflow: data.overflow,
            issues: data.issues,
          });
        combos++;
      } catch (error) {
        browserErrors.push(`${route} @ ${width}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  process.stderr.write(`audited ${route}\n`);
}

await writeFile(
  'artifacts/responsive-audit.json',
  JSON.stringify({ combos, results, browserErrors }, null, 2),
);

console.log(
  `Checked ${ROUTES.length} routes × ${WIDTHS.length} widths = ${combos} combos.`,
);
if (results.length === 0 && browserErrors.length === 0) {
  console.log(
    'ALL PASS — no overflow, clipped text, card overlap, or wrong navbar mode.',
  );
} else {
  console.log(`ISSUES on ${results.length} route/width combos:`);
  for (const r of results)
    console.log(
      `  ${r.route} @ ${r.width}px → overflow=${r.overflow} ${JSON.stringify(r.issues)}`,
    );
}
if (browserErrors.length) console.log('Browser/errors:', browserErrors);
process.exit(results.length === 0 && browserErrors.length === 0 ? 0 : 1);
