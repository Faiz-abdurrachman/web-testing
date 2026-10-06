import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import { normalizeProjectImage } from '../server/cms-media.mjs';
const root = new URL('../', import.meta.url);
const snapshot = JSON.parse(
  await readFile(new URL('src/data/cms-snapshot.json', root)),
);
const groups = [
  { id: 'leader', title: 'Leader Team', members: snapshot.team.leaderTeam },
  ...snapshot.team.hodsTeams,
];
const original = groups.flatMap((g) =>
  g.members.map((m, i) => ({
    ...m,
    id: g.id + '-' + (i + 1),
    group: g.id,
    order: i + 1,
  })),
);
const png = await sharp({
  create: { width: 302, height: 442, channels: 4, background: '#9b7bff' },
})
  .png()
  .toBuffer();
const media = await normalizeProjectImage(png, 'image/png', 'team');
const output = new URL('artifacts/cms-team/', root);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    let records = structuredClone(original),
      revision = 'initial',
      partial = true,
      conflict = false,
      unauthorized = false,
      saved = 0,
      uploads = 0,
      retry = 0,
      accept = true;
    page.on('dialog', (d) => (accept ? d.accept() : d.dismiss()));
    const state = () => ({
      members: records,
      revision,
      groups: groups.map(({ id, title }) => ({ id, title })),
      photoPresets: [
        ...new Set(['marchel', 'zidan-rose', ...records.map((m) => m.photo)]),
      ],
      minMembers: 1,
      maxMembers: 8,
      publicationPending: false,
    });
    const publication = () => [
      { target: 'testing', accepted: true },
      { target: 'production', accepted: !partial },
    ];
    await page.route('http://team-admin.test/**', async (route) => {
      const request = route.request(),
        url = new URL(request.url());
      if (url.pathname === '/api/admin/team') {
        let result;
        const body =
          request.method() === 'POST'
            ? request.postDataJSON()
            : { operation: 'load' };
        if (unauthorized)
          result = { ok: false, error: { code: 'UNAUTHORIZED' } };
        else if (body.operation === 'load')
          result = { ok: true, data: state() };
        else if (body.operation === 'retry') {
          retry++;
          result = { ok: true, data: { publication: publication() } };
        } else if (conflict)
          result = { ok: false, error: { code: 'CONFLICT' } };
        else {
          saved++;
          const member = body.payload.member;
          let id = member?.id;
          if (body.operation === 'add') {
            id = 'mock-' + saved;
            records.push({ ...member, id });
          } else if (body.operation === 'save')
            records = records.map((m) => (m.id === id ? member : m));
          else {
            id = body.payload.id;
            records = records.filter((m) => m.id !== id);
          }
          revision = 'saved-' + saved;
          result = {
            ok: true,
            data: { ...state(), affectedId: id, publication: publication() },
          };
        }
        return route.fulfill({ json: { ...result, csrf: 'mock-csrf' } });
      }
      if (url.pathname === '/api/admin/media') {
        assert.equal(url.searchParams.get('collection'), 'team');
        if (request.method() === 'POST') {
          uploads++;
          return route.fulfill({
            json: { ok: true, data: { image: media.image } },
          });
        }
        return route.fulfill({
          contentType: 'image/webp',
          body: Buffer.from(media.data, 'base64'),
        });
      }
      if (url.pathname === '/api/admin/auth/logout')
        return route.fulfill({ json: { ok: true } });
      try {
        const path =
          url.pathname === '/'
            ? 'admin/team/index.html'
            : url.pathname.slice(1);
        const body = await readFile(new URL('dist/' + path, root));
        const types = {
          html: 'text/html',
          js: 'text/javascript',
          css: 'text/css',
          webp: 'image/webp',
          png: 'image/png',
          woff2: 'font/woff2',
        };
        return route.fulfill({
          body,
          contentType:
            types[path.split('.').at(-1)] || 'application/octet-stream',
        });
      } catch {
        return route.fulfill({ status: 404 });
      }
    });
    await page.goto('http://team-admin.test/');
    await page.locator('#workspace').waitFor({ state: 'visible' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.project-choice').count(), 25);
    await page.locator('#name').fill('<b>Literal name</b>');
    await page.locator('#save').click();
    await page
      .getByText('Perubahan tersimpan, tetapi', { exact: false })
      .waitFor();
    assert.equal(await page.locator('.project-choice b').count(), 0);
    assert.equal(saved, 1);
    partial = false;
    await page.locator('#retry').click();
    await page.getByText('Penerbitan dimulai', { exact: false }).waitFor();
    assert.equal(retry, 1);
    assert.equal(saved, 1);
    await page.locator('#image-upload').setInputFiles({
      name: 'portrait.png',
      mimeType: 'image/png',
      buffer: png,
    });
    await page.getByText('Foto siap.', { exact: false }).waitFor();
    assert.equal(uploads, 1);
    assert.equal(saved, 1);
    await page.locator('#save').click();
    await page.getByText('Penerbitan dimulai', { exact: false }).waitFor();
    assert.equal(records[0].photo, media.image);
    await page.locator('#add').click();
    await page.locator('#group').selectOption('data');
    await page.locator('#name').fill('New member');
    await page.locator('#role').fill('Role');
    await page.locator('#order').fill('2');
    await page.locator('#save').click();
    await page.getByText('Penerbitan dimulai', { exact: false }).waitFor();
    assert.equal(records.length, 26);
    accept = false;
    await page.locator('#delete').click();
    assert.equal(records.length, 26);
    accept = true;
    await page.locator('#delete').click();
    await page.getByText('Penerbitan dimulai', { exact: false }).waitFor();
    assert.equal(records.length, 25);
    conflict = true;
    await page.locator('#name').fill('Keep pending');
    await page.locator('#save').click();
    await page.getByText('Team sudah berubah.', { exact: false }).waitFor();
    assert.equal(await page.locator('#name').inputValue(), 'Keep pending');
    accept = false;
    await page.locator('#reload').click();
    assert.equal(await page.locator('#name').inputValue(), 'Keep pending');
    accept = true;
    conflict = false;
    await page.locator('#reload').click();
    await page
      .locator('#status')
      .filter({ hasText: 'Pilih anggota yang ingin diubah.' })
      .waitFor();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false);
    await page.locator('#name').focus();
    assert.equal(
      await page
        .locator('#name')
        .evaluate((e) => getComputedStyle(e).outlineStyle),
      'solid',
    );
    await page.screenshot({
      path: new URL('admin-' + width + '.png', output).pathname,
      fullPage: true,
    });
    unauthorized = true;
    await page.locator('#reload').evaluate((e) => (e.hidden = false));
    await page.locator('#reload').click();
    await page
      .getByText('Masuk dengan akun Google owner', { exact: false })
      .waitFor();
    assert.equal(await page.locator('#workspace').isVisible(), false);
    assert.deepEqual(errors, []);
    report.push({ width, result: 'PASS', saved, uploads, retry });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  new URL('admin-report.json', output),
  JSON.stringify(report, null, 2),
);
console.log(
  'Team admin browser PASS: 4 widths, CRUD/upload/conflict/retry/expiry.',
);
