// View Transitions + sound-cue verification.
//
// `scripts/verify.mjs` uses full `page.goto` calls, so it never exercises the
// client-side navigation added by Astro's <ClientRouter />. This script drives
// in-page link clicks instead and checks the things that only break with a swap:
//
//   - the JS context and the Web Audio context survive navigation (no reload);
//   - runtime <html> classes (splash-done / nav-warm) are re-applied after swap;
//   - components re-init on the new DOM (FAQ accordion, Snippets + DomainRail
//     carousels, Projects, Navbar scroll state);
//   - an internal link plays exactly one `transition` cue (no data-sfx double),
//     modifiers are not intercepted, and a cross-document hash link lands right.
//
// Run against a static preview (recommended) with the server already up:
//   npm run build && npx astro preview --port 4333
//   PREVIEW_URL=http://localhost:4333 node scripts/verify-vt.mjs
//
// Override the browser with CHROMIUM_PATH. Exits non-zero on any failed
// assertion or page error.

import { chromium } from '@playwright/test';

const BASE = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const results = [];
const errors = [];
let failed = 0;

const assert = (name, ok, extra = '') => {
  if (!ok) failed++;
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});

// Warm session (no splash) + sound on, so the cue assertions can run.
const warm = async (context) => {
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('ds:splash', '1');
      localStorage.setItem('ds:sound', 'on');
    } catch {}
  });
};

// `exposeFunction` may only be registered once per page, so the binding is
// created first and `spyPlays` just re-points the engine at it after each load.
const attachCueLog = async (page) => {
  const log = [];
  await page.exposeFunction('__dsRecordCue', (cue) => log.push(cue));
  return log;
};
const spyPlays = (page) =>
  page.evaluate(() => {
    const s = window.__dsSound;
    if (s) s.play = (cue) => window.__dsRecordCue(cue);
  });

// --- 1. Client-side navigation keeps context and re-inits components. --------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await warm(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`nav: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 8000 });
  const cueLog = await attachCueLog(page);
  await spyPlays(page);
  await page.evaluate(() => {
    window.__vtToken = { t: 1 };
  });

  await page.click('a.nav-link[href="/recruitment"]');
  await page.waitForSelector('.recruitment-hero', { timeout: 8000 });

  assert(
    'nav: lands on /recruitment',
    page.url().replace(/\/$/, '').endsWith('/recruitment'),
    page.url(),
  );
  assert(
    'nav: JS context persisted (no full reload)',
    await page.evaluate(() => window.__vtToken?.t === 1),
  );
  assert(
    'nav: <html> keeps splash-done after swap',
    await page.evaluate(() =>
      document.documentElement.classList.contains('splash-done'),
    ),
  );
  assert(
    'nav: <html> keeps nav-warm after swap',
    await page.evaluate(() =>
      document.documentElement.classList.contains('nav-warm'),
    ),
  );

  // FAQ accordion re-wired on the new page.
  const faq = page.locator('details.faq-item').first();
  await faq.scrollIntoViewIfNeeded();
  await faq.locator('summary').click();
  await page.waitForTimeout(450);
  assert(
    'nav: FAQ re-init (panel opens)',
    await faq.evaluate((el) => el.open === true),
  );

  // Snippets carousel re-wired on the new page.
  const track = page.locator('[data-gallery] [data-track]').first();
  await track.scrollIntoViewIfNeeded();
  const before = await track.evaluate((el) => el.style.transform);
  await page.locator('[data-gallery] [data-next]').first().click();
  await page.waitForTimeout(700);
  const after = await track.evaluate((el) => el.style.transform);
  assert(
    'nav: Snippets re-init (track moves)',
    before !== after,
    `${before} -> ${after}`,
  );

  // Who Should Join rail re-wired.
  await page.evaluate(() =>
    document.getElementById('who-should-join')?.scrollIntoView(),
  );
  await page.waitForTimeout(900);
  const rail = page.locator('.who-should-join .domain-rail').first();
  const railBefore = await rail.evaluate((el) => el.scrollLeft);
  await page
    .locator('.who-should-join .rail-arrow[data-dir="1"]')
    .first()
    .click();
  await page.waitForTimeout(700);
  const railAfter = await rail.evaluate((el) => el.scrollLeft);
  assert(
    'nav: WhoShouldJoin rail re-init (scrolls)',
    railAfter > railBefore,
    `${railBefore} -> ${railAfter}`,
  );

  // Navbar scroll state still works after a swap.
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(200);
  assert(
    'nav: navbar is-scrolled after swap',
    await page.evaluate(() =>
      document.querySelector('.navbar')?.classList.contains('is-scrolled'),
    ),
  );

  // Back home in the same context; exactly one transition cue per nav.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.click('a.nav-link[href="/"]');
  await page.waitForSelector('.hero', { timeout: 8000 });
  assert(
    'back: lands on /',
    page.url().replace(/\/$/, '') === BASE.replace(/\/$/, ''),
    page.url(),
  );
  assert(
    'back: JS context persisted',
    await page.evaluate(() => window.__vtToken?.t === 1),
  );

  cueLog.length = 0;
  await page.click('a.nav-link[href="/recruitment"]');
  await page.waitForSelector('.recruitment-hero', { timeout: 8000 });
  assert(
    'cue: exactly one transition cue for an internal link',
    cueLog.filter((c) => c === 'transition').length === 1,
    `cues=${JSON.stringify(cueLog)}`,
  );

  // Role card (data-sfx="open") must not double the cue.
  await page.goto(`${BASE}/recruitment`, { waitUntil: 'load' });
  await page.waitForSelector('.recruitment-hero', { timeout: 8000 });
  cueLog.length = 0;
  await spyPlays(page);
  await page.locator('a[href^="/recruitment/roles/"]').first().click();
  await page.waitForURL(/\/recruitment\/roles\//, { timeout: 8000 });
  const roleCues = cueLog.filter((c) => ['transition', 'open'].includes(c));
  assert(
    'card: one transition cue, no open double',
    roleCues.length === 1 && roleCues[0] === 'transition',
    `cues=${JSON.stringify(cueLog)}`,
  );

  await context.close();
}

// --- 2. A modified click is not intercepted (keeps the normal cue). ----------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await warm(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`modifier: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 8000 });
  const cueLog = await attachCueLog(page);
  await spyPlays(page);
  const [popup] = await Promise.all([
    page
      .context()
      .waitForEvent('page', { timeout: 2500 })
      .catch(() => null),
    page.click('a.nav-link[href="/recruitment"]', { modifiers: ['Control'] }),
  ]);
  await page.waitForTimeout(300);
  assert(
    'modifier: no transition cue',
    !cueLog.includes('transition'),
    `cues=${JSON.stringify(cueLog)}`,
  );
  assert(
    'modifier: normal select cue still plays',
    cueLog.includes('select'),
    `cues=${JSON.stringify(cueLog)}`,
  );
  if (popup) await popup.close();
  await context.close();
}

// --- 3. Reduced motion: client nav still works and re-inits instantly. -------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(() => {
    try {
      sessionStorage.setItem('ds:splash', '1');
    } catch {}
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`reduce: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 8000 });
  await page.click('a.nav-link[href="/recruitment"]');
  await page.waitForSelector('.recruitment-hero', { timeout: 8000 });
  assert(
    'reduce: client nav lands on /recruitment',
    page.url().replace(/\/$/, '').endsWith('/recruitment'),
    page.url(),
  );
  const faq = page.locator('details.faq-item').first();
  await faq.scrollIntoViewIfNeeded();
  await faq.locator('summary').click();
  await page.waitForTimeout(150);
  assert(
    'reduce: FAQ re-init instant',
    await faq.evaluate((el) => el.open === true),
  );
  await context.close();
}

// --- 4. Cross-document hash link lands on the right section. -----------------
{
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await warm(context);
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`hash: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: 'load' });
  await page.waitForSelector('.hero', { timeout: 8000 });
  await page.evaluate(() =>
    document.getElementById('domains')?.scrollIntoView(),
  );
  await page.waitForTimeout(1000);
  const card = page.locator('.domain-card').first();
  await card.waitFor({ state: 'visible', timeout: 8000 });
  await card.click();
  await page.waitForSelector('.hods-detail', { timeout: 8000 });
  assert(
    'hash: card nav reached /hods/*',
    /\/hods\//.test(page.url()),
    page.url(),
  );
  await page.locator('.hods-detail .back').first().click();
  await page.waitForURL(/\/#domains$/, { timeout: 8000 });
  await page.waitForTimeout(400);
  const top = await page.evaluate(() => {
    const el = document.getElementById('domains');
    return el ? el.getBoundingClientRect().top : null;
  });
  assert(
    'hash: Back lands on #domains (top ≈ scroll-margin)',
    top !== null && top > -5 && top < 200,
    `top=${top}`,
  );
  await context.close();
}

await browser.close();

console.log(results.join('\n'));
console.log(
  errors.length ? `\npageerrors:\n${errors.join('\n')}` : '\npageerrors: none',
);
if (failed || errors.length) process.exitCode = 1;
