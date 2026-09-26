import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Navbar scroll-transition audit. `responsive-audit.mjs` runs in reduced motion
// and never scrolls, so it cannot see the `is-scrolled` / `is-condensed` states.
// This one runs with motion enabled, drives the bar up and down at every
// breakpoint (including the 760/761, 1050/1051, 1300/1301 and ~1356 hug edges)
// and asserts:
//   - the state classes toggle, and at the top the glass panel is fully hidden;
//   - the floating capsule contains every bar item (no clipped logo/CTA/menu);
//   - nothing overflows the viewport in the scrolled state;
//   - reduced motion still toggles the state but with all transitions off.
// It also records long tasks and frame deltas during the morph (report-only —
// headless software rendering is noisy, use the numbers as relative signals).
//
// Usage: PREVIEW_URL=http://localhost:4321 node scripts/navbar-audit.mjs
const BASE = process.env.PREVIEW_URL || 'http://localhost:4321';
const WIDTHS = [
  320, 360, 390, 480, 600, 760, 761, 820, 900, 1024, 1050, 1051, 1200, 1300,
  1301, 1366, 1440, 1600, 1920, 2560,
];
const ROUTES = ['/'];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

const failures = [];
const rows = [];

const probe = (page) =>
  page.evaluate(() => {
    const nav = document.querySelector('.navbar');
    if (!nav) return { missing: true };
    const navRect = nav.getBoundingClientRect();
    const before = getComputedStyle(nav, '::before');
    const inner = getComputedStyle(nav.querySelector('.navbar-inner'));
    const px = (v) => parseFloat(v) || 0;
    const capsule = {
      top: navRect.top + px(before.top),
      bottom: navRect.top + (navRect.height - px(before.bottom)),
      left: navRect.left + px(before.left),
      right: navRect.left + (navRect.width - px(before.right)),
    };
    const children = [];
    for (const sel of [
      '.brand',
      '.desktop-menu nav',
      '.mobile-menu summary',
      '.navbar .button.white',
    ]) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const st = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      if (st.display === 'none' || st.visibility === 'hidden') continue;
      if (el.offsetParent === null || rect.width === 0 || rect.height === 0)
        continue;
      children.push({
        sel,
        top: +rect.top.toFixed(1),
        bottom: +rect.bottom.toFixed(1),
        left: +rect.left.toFixed(1),
        right: +rect.right.toFixed(1),
      });
    }
    return {
      isScrolled: nav.classList.contains('is-scrolled'),
      isCondensed: nav.classList.contains('is-condensed'),
      panelOpacity: before.opacity,
      panelBlur: before.backdropFilter || before.webkitBackdropFilter || 'none',
      panelRadius: +px(before.borderRadius).toFixed(0),
      innerMaxWidth: Math.round(parseFloat(inner.maxWidth)),
      docOverflow: document.documentElement.scrollWidth - innerWidth,
      capsule: {
        top: +capsule.top.toFixed(1),
        bottom: +capsule.bottom.toFixed(1),
        left: +capsule.left.toFixed(1),
        right: +capsule.right.toFixed(1),
      },
      children,
    };
  });

async function morph(page, target) {
  await page.evaluate(
    (t) =>
      new Promise((resolve) => {
        window.__f = [];
        let last = performance.now();
        const from = window.scrollY;
        const start = last;
        const step = (now) => {
          window.__f.push(now - last);
          last = now;
          const p = Math.min((now - start) / 700, 1);
          window.scrollTo(0, from + (t - from) * p);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      }),
    target,
  );
  return page.evaluate(() => {
    const f = window.__f.slice(2).sort((a, b) => a - b);
    const p95 = +(f[Math.floor(0.95 * (f.length - 1))] || 0).toFixed(1);
    return { max: +Math.max(...f).toFixed(1), p95, long: window.__lt || [] };
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const route of ROUTES) {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
    });
    await context.addInitScript(() => {
      try {
        sessionStorage.setItem('ds:splash', '1');
      } catch (e) {}
      window.__lt = [];
      try {
        new PerformanceObserver((l) => {
          for (const e of l.getEntries())
            window.__lt.push(Math.round(e.duration));
        }).observe({ entryTypes: ['longtask'] });
      } catch (e) {}
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') pageErrors.push(m.text());
    });

    await page.goto(`${BASE}${route}`, { waitUntil: 'load', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await sleep(350);

    const top = await probe(page);
    if (top.missing) {
      failures.push(`${route} missing .navbar`);
      await context.close();
      continue;
    }
    if (top.isScrolled || top.isCondensed)
      failures.push(`${route}@${width}: classes set at the top`);
    if (top.panelOpacity !== '0')
      failures.push(
        `${route}@${width}: panel visible at top (${top.panelOpacity})`,
      );

    const down = await morph(page, 700);
    await sleep(1100);
    const scrolled = await probe(page);

    if (!scrolled.isScrolled)
      failures.push(`${route}@${width}: is-scrolled missing after scroll`);
    if (!scrolled.isCondensed)
      failures.push(`${route}@${width}: is-condensed missing after scroll`);
    if (scrolled.panelOpacity !== '1')
      failures.push(`${route}@${width}: panel not opaque when scrolled`);
    if (!/blur\(/.test(scrolled.panelBlur))
      failures.push(`${route}@${width}: panel has no backdrop blur`);
    if (scrolled.panelRadius < 100)
      failures.push(
        `${route}@${width}: panel not a capsule (${scrolled.panelRadius})`,
      );
    if (scrolled.docOverflow > 1)
      failures.push(
        `${route}@${width}: document overflows by ${scrolled.docOverflow}`,
      );
    for (const child of scrolled.children) {
      const out = {
        top: +Math.max(0, scrolled.capsule.top - child.top).toFixed(1),
        bottom: +Math.max(0, child.bottom - scrolled.capsule.bottom).toFixed(1),
        left: +Math.max(0, scrolled.capsule.left - child.left).toFixed(1),
        right: +Math.max(0, child.right - scrolled.capsule.right).toFixed(1),
      };
      if (Object.values(out).some((v) => v > 1))
        failures.push(
          `${route}@${width}: ${child.sel} escapes the capsule ${JSON.stringify(out)}`,
        );
    }
    if (width >= 1440) {
      const brand = scrolled.children.find((c) => c.sel === '.brand');
      if (brand) {
        const gap = +(brand.left - scrolled.capsule.left).toFixed(1);
        if (Math.abs(gap - 24) > 2)
          failures.push(`${route}@${width}: capsule hug gap ${gap} (want 24)`);
      }
    }

    const up = await morph(page, 0);
    await sleep(1100);
    const back = await probe(page);
    if (back.isScrolled || back.isCondensed)
      failures.push(`${route}@${width}: classes stuck after scrolling back`);

    rows.push({
      route,
      width,
      downMax: down.max,
      downP95: down.p95,
      downLong: down.long,
      upMax: up.max,
      upP95: up.p95,
      upLong: up.long,
      pageErrors,
    });
    await context.close();
  }
}

// Reduced motion must still toggle the state, just instantly.
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('ds:splash', '1');
    } catch (e) {}
  });
  const page = await context.newPage();
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.evaluate(() => scrollTo(0, 700));
  await sleep(150);
  const reduce = await page.evaluate(() => {
    const nav = document.querySelector('.navbar');
    const inner = document.querySelector('.navbar-inner');
    return {
      isScrolled: nav.classList.contains('is-scrolled'),
      innerTransition: getComputedStyle(inner).transitionDuration,
      panelTransition: getComputedStyle(nav, '::before').transitionDuration,
    };
  });
  await context.close();
  if (!reduce.isScrolled) failures.push('reduce@1440: is-scrolled missing');
  if (reduce.innerTransition !== '0s')
    failures.push(`reduce@1440: inner transition ${reduce.innerTransition}`);
  if (reduce.panelTransition !== '0s')
    failures.push(`reduce@1440: panel transition ${reduce.panelTransition}`);
  rows.push({ route: '/', width: 1440, reducedMotion: reduce });
}

await browser.close();
await mkdir('artifacts', { recursive: true });
await writeFile(
  'artifacts/navbar-audit.json',
  JSON.stringify({ widths: WIDTHS, routes: ROUTES, rows, failures }, null, 2),
);

console.log(
  `Navbar audit: ${ROUTES.length} route(s) × ${WIDTHS.length} widths + reduced-motion.`,
);
for (const r of rows) {
  if (r.reducedMotion) continue;
  console.log(
    `  ${String(r.width).padStart(4)}  morph↓ max=${String(r.downMax).padStart(5)} p95=${String(r.downP95).padStart(5)}` +
      ` long=${JSON.stringify(r.downLong)}  morph↑ max=${String(r.upMax).padStart(5)} p95=${String(r.upP95).padStart(5)} long=${JSON.stringify(r.upLong)}`,
  );
}
if (failures.length === 0) {
  console.log(
    'ALL PASS — states toggle, capsule contains every item, no overflow, reduced motion instant.',
  );
} else {
  console.log(`FAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ${f}`);
}
process.exit(failures.length === 0 ? 0 : 1);
