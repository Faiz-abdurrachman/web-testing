import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Lightweight scroll-jank audit: for each top-level section it scrolls through
// it once and records frame intervals + main-thread long tasks (>50ms). This is
// the regression guard for the "Four Pillars" starfield work — before the tile
// conversion, entering `.what-we-do` logged a 100–200ms task; it should stay at
// 0 now.
//
// Numbers come from headless Chromium (often software-rendered), so treat them
// as *relative* between runs, not as real-device FPS. Fail the run by setting a
// budget, e.g. `PERF_MAX_TASK=120 node scripts/perf-audit.mjs` (ms). Without it
// the script only reports.
//
// Usage: PREVIEW_URL=http://localhost:4333 node scripts/perf-audit.mjs
const BASE = process.env.PREVIEW_URL || 'http://localhost:4321';
const CHROMIUM = process.env.CHROMIUM_PATH || '/usr/bin/chromium';
const MAX_TASK = Number(process.env.PERF_MAX_TASK || 0);

const SECTIONS = [
  '.hero',
  '.philosophy',
  '.what-we-do',
  '.domains',
  '.projects',
  '.recruitment',
  '.footer',
];

await mkdir('artifacts', { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROMIUM,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});

const results = [];
const browserErrors = [];

try {
  for (const selector of SECTIONS) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'no-preference',
    });
    await context.addInitScript(() => sessionStorage.setItem('ds:splash', '1'));
    const page = await context.newPage();
    page.on('pageerror', (e) =>
      browserErrors.push(`${selector}: ${e.message}`),
    );

    try {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(700);

      const data = await page.evaluate(async (sel) => {
        const section = document.querySelector(sel);
        if (!section) return null;
        const rect = section.getBoundingClientRect();
        const top = rect.top + scrollY;
        const start = Math.max(0, top - innerHeight);
        const end = top + section.offsetHeight;

        const tasks = [];
        try {
          new PerformanceObserver((list) => {
            for (const e of list.getEntries())
              tasks.push(Math.round(e.duration));
          }).observe({ type: 'longtask' });
        } catch {}

        const frames = [];
        let last = performance.now();
        let running = true;
        const tick = (now) => {
          frames.push(now - last);
          last = now;
          if (running) requestAnimationFrame(tick);
        };
        requestAnimationFrame((t) => {
          last = t;
          requestAnimationFrame(tick);
        });

        const total = end - start;
        const steps = 60;
        for (let i = 0; i <= steps; i++) {
          scrollTo(0, start + (total * i) / steps);
          await new Promise((r) =>
            requestAnimationFrame(() => setTimeout(r, 16)),
          );
        }
        running = false;
        await new Promise((r) => setTimeout(r, 150));

        const sorted = [...frames].sort((a, b) => a - b);
        const pct = (p) => sorted[Math.floor(sorted.length * p)] ?? 0;
        return {
          height: section.offsetHeight,
          frames: frames.length,
          avg: +(frames.reduce((a, b) => a + b, 0) / frames.length).toFixed(1),
          p90: +pct(0.9).toFixed(1),
          worst: +Math.max(...frames).toFixed(0),
          janky: frames.filter((f) => f > 32).length,
          longestTask: tasks.length ? Math.max(...tasks) : 0,
        };
      }, selector);

      if (data) results.push({ selector, ...data });
    } catch (error) {
      browserErrors.push(`${selector}: ${error.message}`);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

await writeFile(
  'artifacts/perf-audit.json',
  JSON.stringify({ results, browserErrors, maxTask: MAX_TASK }, null, 2),
);

console.log('section'.padEnd(14), 'frames  avg   p90  worst  janky  task');
for (const r of results) {
  console.log(
    r.selector.padEnd(14),
    String(r.frames).padStart(6),
    String(r.avg).padStart(5),
    String(r.p90).padStart(5),
    String(r.worst).padStart(6),
    String(r.janky).padStart(6),
    String(r.longestTask).padStart(5),
  );
}

const overBudget = MAX_TASK
  ? results.filter((r) => r.longestTask > MAX_TASK)
  : [];
const failed = browserErrors.length > 0 || overBudget.length > 0;

if (browserErrors.length) console.log('Browser errors:', browserErrors);
if (overBudget.length) {
  console.log(
    `Over ${MAX_TASK}ms task budget: ${overBudget
      .map((r) => `${r.selector}=${r.longestTask}ms`)
      .join(', ')}`,
  );
}
if (!failed) {
  console.log(
    'Report written to artifacts/perf-audit.json' +
      (MAX_TASK ? ` (all tasks ≤ ${MAX_TASK}ms).` : ' (report-only).'),
  );
}
process.exit(failed ? 1 : 0);
