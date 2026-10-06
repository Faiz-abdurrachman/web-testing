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
const output = new URL('artifacts/cms-team/', root);
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
  server.listen(4333, '127.0.0.1', resolve);
});
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = [];
try {
  const { normalizeProjectImage } = await import('../server/cms-media.mjs');
  const sharp = (await import('sharp')).default;
  const media = await normalizeProjectImage(
    await sharp({
      create: { width: 302, height: 442, channels: 4, background: '#9b7bff' },
    })
      .png()
      .toBuffer(),
    'image/png',
    'team',
  );
  const mediaFile = new URL('public' + media.image, root);
  await mkdir(new URL('./', mediaFile), { recursive: true });
  await writeFile(mediaFile, Buffer.from(media.data, 'base64'));
  try {
    for (const count of [1, 2, 5, 8]) {
      const fixture = structuredClone(baseline);
      fixture.team.leaderTeam = Array.from({ length: count }, (_, i) => ({
        ...baseline.team.leaderTeam[i % 2],
        ...(i === count - 1
          ? {
              photo: media.image,
              name: 'A long member name '.repeat(4),
              role: 'A long member role '.repeat(4),
            }
          : {}),
      }));
      fixture.team.hodsTeams.forEach(
        (g) =>
          (g.members = Array.from({ length: count }, (_, i) => ({
            ...g.members[i % g.members.length],
            ...(i === count - 1 ? { photo: media.image } : {}),
          }))),
      );
      await writeFile(snapshotPath, JSON.stringify(fixture));
      await build(count);
      for (const width of [320, 390, 768, 1440]) {
        const page = await browser.newPage({
          viewport: { width, height: 903 },
          reducedMotion: 'reduce',
        });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto('http://127.0.0.1:4333/about/', { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        const checkRow = async (selector, expected) => {
          const row = page.locator(selector);
          await row.scrollIntoViewIfNeeded();
          assert.equal(await row.locator('.team-card').count(), expected);
          for (const direction of [0, 1]) {
            await row.evaluate(
              (r, direction) => (r.scrollLeft = direction ? r.scrollWidth : 0),
              direction,
            );
            const last = row
              .locator('.team-card')
              .nth(direction ? expected - 1 : 0);
            const metrics = await last.evaluate(async (card) => {
              const imgs = [...card.querySelectorAll('img')];
              imgs.forEach((i) => (i.loading = 'eager'));
              await Promise.race([
                Promise.all(imgs.map((i) => i.decode())),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Image decode timeout')),
                    10000,
                  ),
                ),
              ]);
              const r = card.getBoundingClientRect(),
                row = card.parentElement.getBoundingClientRect();
              const copy = [
                ...card.querySelectorAll('.team-name,.team-role'),
              ].map((e) => e.getBoundingClientRect());
              return {
                w: r.width,
                h: r.height,
                reachable: r.right > row.left && r.left < row.right,
                copyContained: copy.every((c) => c.bottom <= r.bottom + 1),
                overflow: document.documentElement.scrollWidth > innerWidth,
              };
            });
            assert.equal(metrics.w, 302);
            assert.equal(metrics.h, 400);
            assert(metrics.reachable);
            assert(metrics.copyContained);
            assert.equal(metrics.overflow, false);
          }
        };
        await checkRow('.team-cards--leader', count);
        for (let i = 0; i < 6; i++) {
          await page.locator('[data-hods-chip="' + i + '"]').evaluate((e) => {
            if (e instanceof HTMLElement) e.click();
          });
          await page.waitForFunction(
            (i) =>
              document
                .querySelector('[data-hods-panel="' + i + '"]')
                .classList.contains('is-active'),
            i,
          );
          await checkRow(
            '.hods-panel.is-active .team-cards',
            count + (i === 5 ? 1 : 0),
          );
        }
        assert.equal(
          await page.locator('.team-card--join').getAttribute('href'),
          '/recruitment',
        );
        if (width === 1440) {
          await page.locator('[data-hods-prev]').click();
          assert.equal(
            await page
              .locator('[data-hods-panel="4"]')
              .evaluate((e) => e.classList.contains('is-active')),
            true,
          );
          await page.evaluate(() => {
            const a = document.createElement('a');
            a.href = '/';
            document.body.append(a);
            a.click();
          });
          await page.waitForURL('http://127.0.0.1:4333/');
          await page.evaluate(() => {
            const a = document.createElement('a');
            a.href = '/about/';
            document.body.append(a);
            a.click();
          });
          await page.waitForURL('http://127.0.0.1:4333/about/');
          await page.locator('[data-hods-next]').click();
          assert.equal(
            await page
              .locator('[data-hods-panel="1"]')
              .evaluate((e) => e.classList.contains('is-active')),
            true,
          );
        }
        await page.locator('.our-team').screenshot({
          path: new URL('fixture-' + count + '-' + width + '.png', output)
            .pathname,
        });
        assert.deepEqual(errors, []);
        report.push({ count, width, groups: 7, result: 'PASS' });
        await page.close();
      }
      console.log('Team fixture ' + count + ': 7 groups × 4 widths PASS');
    }
  } finally {
    await (await import('node:fs/promises')).unlink(mediaFile);
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
console.log('Team renderer PASS: 112 group cases; baseline restored.');
