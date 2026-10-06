// Build real snapshot fixtures; always restore the original snapshot and baseline dist.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { promisify } from 'node:util';
const run = promisify(execFile);
const root = new URL('../', import.meta.url);
const snapshotPath = new URL('src/data/cms-snapshot.json', root);
const original = await readFile(snapshotPath, 'utf8');
const baseline = JSON.parse(original);
const output = new URL('artifacts/cms-growth/', root);
await mkdir(output, { recursive: true });
const env = { ...process.env };
delete env.CMS_API_URL;
delete env.CMS_API_TOKEN;
const build = async (label) => {
  const result = await run('npm', ['run', 'build'], {
    cwd: root,
    env,
    maxBuffer: 4 * 1024 * 1024,
  });
  await writeFile(
    new URL(`build-${label}.log`, output),
    result.stdout + result.stderr,
  );
};
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    if (path.includes('..')) throw new Error('Invalid path');
    if (!extname(path)) path = path.replace(/\/$/, '') + '/index.html';
    const body = await readFile(join(root.pathname, 'dist', path));
    const types = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2',
    };
    res.writeHead(200, {
      'Content-Type': types[extname(path)] || 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(4332, '127.0.0.1', resolve);
});
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = [];
try {
  for (const count of [1, 2, 5, 8]) {
    const fixture = structuredClone(baseline);
    fixture.projects = Array.from({ length: count }, (_, i) => ({
      ...baseline.projects[i % 4],
      id: 'fixture-' + i,
    }));
    await writeFile(snapshotPath, JSON.stringify(fixture));
    await build(count);
    for (const width of [320, 390, 768, 1050, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 903 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      for (const [route, section, stage, card, dots] of [
        ['/', '.projects', '.project-stage', '.project-card', '.project-dots'],
        [
          '/hall-of-frames/',
          '.hof-projects',
          '.projects-stage',
          '.hof-project-card',
          '.projects-dots',
        ],
      ]) {
        await page.goto('http://127.0.0.1:4332' + route, {
          waitUntil: 'networkidle',
        });
        await page.evaluate(() => document.fonts.ready);
        await page.locator(section).scrollIntoViewIfNeeded();
        await page.waitForFunction(
          (selector) => document.querySelector(selector)?.style.height,
          stage,
        );
        const scope = page.locator(section);
        assert.equal(await scope.locator(card).count(), count);
        assert.equal(await scope.locator(dots + ' .dot').count(), count);
        const check = async (index) => {
          assert.equal(
            await scope.locator(card + '.is-active').getAttribute('data-index'),
            String(index),
          );
          assert.equal(
            await scope
              .locator(dots + ' [aria-selected="true"]')
              .getAttribute('data-index'),
            String(index),
          );
          const metrics = await scope.evaluate(
            (el, { card, stage }) => {
              const active = el.querySelector(card + '.is-active');
              const r = active.getBoundingClientRect();
              const s = el.querySelector(stage).getBoundingClientRect();
              const copy = active.querySelector('.project-copy');
              return {
                overflow: document.documentElement.scrollWidth > innerWidth,
                center: Math.abs(
                  (r.left + r.right) / 2 - (s.left + s.right) / 2,
                ),
                width: r.width,
                height: r.height,
                stageHeight: s.height,
                copyBottom: copy.getBoundingClientRect().bottom,
                bottom: r.bottom,
                dotsInside: [...el.querySelectorAll('.dot')].every((dot) => {
                  const d = dot.getBoundingClientRect();
                  return d.left >= 0 && d.right <= innerWidth;
                }),
              };
            },
            { card, stage },
          );
          assert.equal(metrics.overflow, false);
          assert(metrics.center <= 1, JSON.stringify(metrics));
          assert(
            metrics.copyBottom <= metrics.bottom + 1,
            JSON.stringify(metrics),
          );
          assert(metrics.dotsInside);
          if (width === 1440) {
            assert.equal(metrics.width, 549);
            assert.equal(metrics.height, 567);
          }
          if (width <= 520)
            assert(Math.abs(metrics.height - metrics.stageHeight) <= 1);
        };
        await check(0);
        assert.equal(
          await scope.locator('.project-arrow.next').isDisabled(),
          count === 1,
        );
        if (count > 1) {
          await scope.locator('.project-arrow.next').click();
          await check(1);
          await scope.locator(stage).focus();
          await page.keyboard.press('ArrowLeft');
          await check(0);
          for (let i = 0; i < count; i++) {
            await scope
              .locator(dots + ' .dot')
              .nth(i)
              .click();
            await check(i);
          }
          await scope.locator(stage).focus();
          await page.keyboard.press('ArrowRight');
          await check(0);
          await scope
            .locator(stage)
            .dispatchEvent('pointerdown', { clientX: 240 });
          await scope
            .locator(stage)
            .dispatchEvent('pointerup', { clientX: 160 });
          await check(1);
        }
        await page.screenshot({
          path: new URL(
            `${count}-${width}-${route === '/' ? 'home' : 'hof'}.png`,
            output,
          ).pathname,
        });
        assert.deepEqual(errors, []);
        report.push({ count, width, route, result: 'PASS' });
      }
      if (width === 1440 && count > 1) {
        for (const [route, section, stage, card] of [
          ['/', '.projects', '.project-stage', '.project-card'],
          [
            '/hall-of-frames/',
            '.hof-projects',
            '.projects-stage',
            '.hof-project-card',
          ],
          ['/', '.projects', '.project-stage', '.project-card'],
        ]) {
          await page.evaluate((route) => {
            const link = document.createElement('a');
            link.href = route;
            document.body.append(link);
            link.click();
          }, route);
          await page.waitForURL('http://127.0.0.1:4332' + route);
          await page.waitForFunction(
            (selector) => document.querySelector(selector)?.style.height,
            stage,
          );
          await page.locator(section).scrollIntoViewIfNeeded();
          await page.locator(section + ' .project-arrow.next').click();
          assert.equal(
            await page.locator(card + '.is-active').getAttribute('data-index'),
            '1',
          );
        }
      }
      await page.close();
    }
    console.log(`Projects fixture ${count}: both consumers × 5 widths PASS`);
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  await writeFile(snapshotPath, original);
  await build('baseline');
}
await writeFile(
  new URL('renderer-report.json', output),
  JSON.stringify(report, null, 2),
);
console.log('Projects growth renderer PASS: 40 cases; baseline restored.');
