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
  320, 360, 375, 390, 414, 480, 600, 760, 768, 820, 900, 1024, 1050, 1100, 1200,
  1280, 1300, 1366, 1440, 1600, 1680, 1920, 2560,
];

const measure = (page) =>
  page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - innerWidth;
    const offenders = [];
    for (const el of document.querySelectorAll('main > *, footer')) {
      const box = el.getBoundingClientRect();
      if (box.right > innerWidth + 1 || el.scrollWidth > el.clientWidth + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          class: (el.className || '').toString().split(/\s+/)[0] || '',
          right: Math.round(box.right),
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
        });
      }
    }

    const clipped = [];
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
          clipped.push({
            el: name,
            why: 'outside viewport (not scrollable)',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            text: el.textContent.trim().slice(0, 40),
          });
        continue;
      }
      let parent = el.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (style.overflow === 'hidden' || style.overflowX === 'hidden') {
          const box = parent.getBoundingClientRect();
          if (rect.right > box.right + 1 || rect.left < box.left - 1)
            clipped.push({
              el: name,
              why: 'clipped by ancestor',
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              text: el.textContent.trim().slice(0, 40),
            });
          break;
        }
        parent = parent.parentElement;
      }
    }
    return { overflow, offenders, clipped };
  });

await mkdir('artifacts', { recursive: true });
const results = [];
const browserErrors = [];
let done = 0;

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
    page.on('pageerror', (error) =>
      browserErrors.push(`${route}: ${error.message}`),
    );
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
        if (data.overflow > 1 || data.clipped.length > 0)
          results.push({ route, width, ...data });
        done++;
      } catch (error) {
        browserErrors.push(`${route} @ ${width}: ${error.message}`);
      }
    }
  } finally {
    await browser.close();
  }
  process.stderr.write(`audited ${route} (${done} combos)\n`);
}

await writeFile(
  'artifacts/responsive-audit.json',
  JSON.stringify({ results, browserErrors }, null, 2),
);

if (results.length === 0) {
  console.log(
    `OK — no horizontal overflow or clipped text across ${ROUTES.length} routes × ${WIDTHS.length} widths.`,
  );
} else {
  console.log(`ISSUES on ${results.length} route/width combos:`);
  for (const r of results) {
    const parts = [];
    if (r.overflow > 1)
      parts.push(`overflow +${r.overflow}px ${JSON.stringify(r.offenders)}`);
    for (const c of r.clipped)
      parts.push(
        `clip[${c.el} · ${c.why} · ${c.left}..${c.right} · "${c.text}"]`,
      );
    console.log(`  ${r.route} @ ${r.width}px → ${parts.join(' | ')}`);
  }
}
if (browserErrors.length) console.log('Browser/errors:', browserErrors);
process.exit(results.length === 0 && browserErrors.length === 0 ? 0 : 1);
