// Uploaded image fixture against both existing public renderers; no snapshot mutation.
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
import { normalizeProjectImage } from '../server/cms-media.mjs';
const root = new URL('../', import.meta.url);
const output = new URL('artifacts/cms-media/', root);
await mkdir(output, { recursive: true });
const source = await sharp({
  create: { width: 1200, height: 800, channels: 3, background: '#6c3bff' },
})
  .png()
  .toBuffer();
const media = await normalizeProjectImage(source, 'image/png');
const server = createServer(async (req, res) => {
  try {
    let path = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname,
    );
    if (path.includes('..')) throw new Error('Invalid path');
    if (path === media.image) {
      res.writeHead(200, { 'Content-Type': 'image/webp' });
      res.end(Buffer.from(media.data, 'base64'));
      return;
    }
    if (!extname(path)) path = path.replace(/\/$/, '') + '/index.html';
    const body = await readFile(join(root.pathname, 'dist', path));
    res.writeHead(200, {
      'Content-Type':
        {
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.css': 'text/css',
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.woff2': 'font/woff2',
          '.svg': 'image/svg+xml',
        }[extname(path)] || 'application/octet-stream',
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    for (const [route, selector] of [
      ['/', '.project-card.is-active .project-image img'],
      ['/hall-of-frames/', '.hof-project-card.is-active .project-image img'],
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        reducedMotion: 'reduce',
      });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:${server.address().port}${route}`, {
        waitUntil: 'networkidle',
      });
      const image = page.locator(selector).first();
      await image.scrollIntoViewIfNeeded();
      await image.evaluate(async (img) => {
        await img.decode();
      });
      const before = await image.boundingBox();
      await image.evaluate((img, path) => {
        img.src = path;
      }, media.image);
      await image.evaluate(async (img) => {
        await img.decode();
      });
      const after = await image.boundingBox();
      assert.deepEqual(after, before);
      assert.equal(await image.evaluate((img) => img.naturalWidth), 1200);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: new URL(
          `${route === '/' ? 'home' : 'hof'}-media-${width}.png`,
          output,
        ).pathname,
      });
      report.push({
        route,
        width,
        decoded: true,
        geometryIdentical: true,
        overflow: false,
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}
await writeFile(
  new URL('renderer-report.json', output),
  JSON.stringify(report, null, 2) + '\n',
);
console.log(
  'Projects media renderer PASS: Home + HoF, 4 widths, decoded image, unchanged geometry, no overflow.',
);
