import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Navbar audit. `responsive-audit.mjs` runs in reduced motion and never scrolls,
// so it cannot see the `is-scrolled` backing. This one runs with motion enabled,
// drives the bar up and down at every breakpoint (including the 1050/1051 edge)
// and asserts:
//   - the Figma resting state: no backing at the top, exact 1440 geometry
//     (logo 80/24, space-between gaps of 195px, menu 743, "Join Us" CTA 93×43,
//     active tab underlined by a 1px line matching the label width);
//   - the scrolled state only adds a solid backing (no capsule, no morph);
//   - the right menu shows for the breakpoint and nothing overflows;
//   - reduced motion still toggles the state with all transitions off.
// It also records long tasks and frame deltas during the scroll (report-only —
// headless software rendering is noisy, use the numbers as relative signals).
//
// Usage: PREVIEW_URL=http://localhost:4331 node scripts/navbar-audit.mjs
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
    const px = (v) => parseFloat(v) || 0;
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return {
        x: +r.x.toFixed(1),
        y: +r.y.toFixed(1),
        w: +r.width.toFixed(1),
        h: +r.height.toFixed(1),
        right: +r.right.toFixed(1),
        bottom: +r.bottom.toFixed(1),
      };
    };
    const active = nav.querySelector('.desktop-nav a.nav-link.active');
    const underline = active?.querySelector('.nav-underline');
    const label = active?.querySelector('.nav-label');
    const desktopNav = nav.querySelector('.desktop-nav');
    const desktopCta = nav.querySelector('.desktop-cta');
    const mobile = nav.querySelector('.mobile-menu');
    const navGroup = desktopNav;
    const button = desktopCta?.querySelector('.button');
    const vis = (el) => {
      if (!el) return false;
      const st = getComputedStyle(el);
      return st.display !== 'none' && st.visibility !== 'hidden';
    };
    return {
      isScrolled: nav.classList.contains('is-scrolled'),
      navHeight: +navRect.height.toFixed(2),
      beforeOpacity: getComputedStyle(nav, '::before').opacity,
      afterOpacity: getComputedStyle(nav, '::after').opacity,
      docOverflow: document.documentElement.scrollWidth - innerWidth,
      desktopVisible: vis(desktopNav) && vis(desktopCta),
      mobileVisible: vis(mobile),
      brand: box(nav.querySelector('.brand')),
      navGroup: navGroup ? box(navGroup) : null,
      button: button ? box(button) : null,
      activeText: active?.textContent.trim() ?? null,
      underline: underline ? box(underline) : null,
      label: label ? box(label) : null,
    };
  });

async function glide(page, target) {
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
const close = (a, b, tol = 1) => Math.abs(a - b) <= tol;
// The scroll listener is rAF-throttled and the backing fades over 0.3s, so wait
// for both the class and the transitioned opacity instead of a fixed sleep.
const settle = (page, scrolled) =>
  page
    .waitForFunction(
      (want) => {
        const nav = document.querySelector('.navbar');
        if (!nav) return false;
        if (nav.classList.contains('is-scrolled') !== want) return false;
        return getComputedStyle(nav, '::after').opacity === (want ? '1' : '0');
      },
      scrolled,
      { timeout: 2500 },
    )
    .catch(() => {});

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
    if (top.isScrolled)
      failures.push(`${route}@${width}: is-scrolled set at the top`);
    if (top.afterOpacity !== '0')
      failures.push(
        `${route}@${width}: backing visible at top (${top.afterOpacity})`,
      );
    if (top.beforeOpacity !== '1')
      failures.push(
        `${route}@${width}: top gradient missing (${top.beforeOpacity})`,
      );

    const expectedDesktop = width > 1050;
    if (top.desktopVisible !== expectedDesktop)
      failures.push(
        `${route}@${width}: desktop menu visible=${top.desktopVisible} (want ${expectedDesktop})`,
      );
    if (top.mobileVisible !== !expectedDesktop)
      failures.push(
        `${route}@${width}: mobile menu visible=${top.mobileVisible} (want ${!expectedDesktop})`,
      );

    if (expectedDesktop) {
      if (!top.button || !top.navGroup)
        failures.push(`${route}@${width}: desktop pieces missing`);
      else {
        if (top.button.right > width + 1)
          failures.push(
            `${route}@${width}: CTA overflows (${top.button.right} > ${width})`,
          );
        if (top.brand.x < 0)
          failures.push(
            `${route}@${width}: logo overflows left (${top.brand.x})`,
          );
      }
    } else if (!top.mobileVisible) {
      failures.push(`${route}@${width}: no menu visible`);
    }

    // Exact Figma geometry at the reference width.
    if (width === 1440) {
      if (!close(top.navHeight, 106.8, 0.5))
        failures.push(`1440: navbar height ${top.navHeight} (want 106.8)`);
      if (!close(top.brand.x, 80) || !close(top.brand.y, 24))
        failures.push(
          `1440: logo at ${top.brand.x}/${top.brand.y} (want 80/24)`,
        );
      if (!close(top.brand.w, 54) || !close(top.brand.h, 58.8))
        failures.push(
          `1440: logo ${top.brand.w}×${top.brand.h} (want 54×58.8)`,
        );
      if (!top.button) failures.push('1440: CTA missing in desktop');
      else {
        if (!close(top.button.right, 1360))
          failures.push(`1440: CTA right ${top.button.right} (want 1360)`);
        if (!close(top.button.w, 93, 0.6))
          failures.push(`1440: CTA width ${top.button.w} (want 93)`);
        if (!close(top.button.h, 43, 0.6))
          failures.push(`1440: CTA height ${top.button.h} (want 43)`);
      }
      if (top.navGroup && top.button) {
        if (!close(top.navGroup.w, 743, 1))
          failures.push(`1440: menu width ${top.navGroup.w} (want 743)`);
        const gapLogoNav = top.navGroup.x - top.brand.right;
        if (!close(gapLogoNav, 195, 1))
          failures.push(
            `1440: logo→menu gap ${gapLogoNav.toFixed(1)} (want ~195)`,
          );
        const gapNavCta = top.button.x - top.navGroup.right;
        if (!close(gapNavCta, 195, 1))
          failures.push(
            `1440: menu→CTA gap ${gapNavCta.toFixed(1)} (want ~195)`,
          );
      }
      if (!top.underline || !top.label)
        failures.push('1440: active tab has no underline');
      else {
        if (!close(top.underline.w, top.label.w, 0.6))
          failures.push(
            `1440: underline ${top.underline.w} vs label ${top.label.w}`,
          );
        if (!close(top.underline.h, 1, 0.5))
          failures.push(`1440: underline height ${top.underline.h} (want 1)`);
      }
    }

    const down = await glide(page, 700);
    await settle(page, true);
    const scrolled = await probe(page);
    if (!scrolled.isScrolled)
      failures.push(`${route}@${width}: is-scrolled missing after scroll`);
    if (scrolled.afterOpacity !== '1')
      failures.push(`${route}@${width}: backing not opaque when scrolled`);
    if (scrolled.beforeOpacity !== '0')
      failures.push(`${route}@${width}: top gradient still on when scrolled`);
    if (scrolled.docOverflow > 1)
      failures.push(
        `${route}@${width}: document overflows by ${scrolled.docOverflow}`,
      );

    const up = await glide(page, 0);
    await settle(page, false);
    const back = await probe(page);
    if (back.isScrolled)
      failures.push(
        `${route}@${width}: is-scrolled stuck after scrolling back`,
      );
    if (back.afterOpacity !== '0')
      failures.push(`${route}@${width}: backing stuck after scrolling back`);

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
    const navLink = document.querySelector('.desktop-nav .nav-link');
    return {
      isScrolled: nav.classList.contains('is-scrolled'),
      navTransition: getComputedStyle(nav).transitionDuration,
      linkTransition: getComputedStyle(navLink).transitionDuration,
      backingTransition: getComputedStyle(nav, '::after').transitionDuration,
    };
  });
  await context.close();
  if (!reduce.isScrolled) failures.push('reduce@1440: is-scrolled missing');
  for (const [name, value] of Object.entries({
    navbar: reduce.navTransition,
    link: reduce.linkTransition,
    backing: reduce.backingTransition,
  })) {
    if (value !== '0s')
      failures.push(`reduce@1440: ${name} transition ${value}`);
  }
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
    `  ${String(r.width).padStart(4)}  glide↓ max=${String(r.downMax).padStart(5)} p95=${String(r.downP95).padStart(5)}` +
      ` long=${JSON.stringify(r.downLong)}  glide↑ max=${String(r.upMax).padStart(5)} p95=${String(r.upP95).padStart(5)} long=${JSON.stringify(r.upLong)}`,
  );
}
if (failures.length === 0) {
  console.log(
    'ALL PASS — Figma geometry exact at 1440, backing toggles, no overflow, reduced motion instant.',
  );
} else {
  console.log(`FAILURES (${failures.length}):`);
  for (const f of failures) console.log(`  ${f}`);
}
process.exit(failures.length === 0 ? 0 : 1);
