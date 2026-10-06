// Native static admin browser with mocked HTTP transport; real Google identity tested separately.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import { normalizeProjectImage } from '../server/cms-media.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const html = await readFile(
  new URL('../dist/admin/index.html', import.meta.url),
  'utf8',
);
const projects = JSON.parse(
  await readFile(
    new URL('../src/data/cms-snapshot.json', import.meta.url),
    'utf8',
  ),
).projects;
const output = new URL('../artifacts/cms-native/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = [];
const uploadPng = await sharp({
  create: { width: 64, height: 48, channels: 3, background: '#9b7bff' },
})
  .png()
  .toBuffer();
const uploadedMedia = await normalizeProjectImage(uploadPng, 'image/png');
try {
  for (const width of [320, 390, 768, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    let acceptDialog = true;
    page.on('dialog', (dialog) =>
      acceptDialog ? dialog.accept() : dialog.dismiss(),
    );
    await page.route('http://cms-admin.test/**', async (route) => {
      const pathname = new URL(route.request().url()).pathname;
      if (pathname === '/api/admin/media')
        return route.fulfill({
          body: Buffer.from(uploadedMedia.data, 'base64'),
          contentType: 'image/webp',
        });
      if (pathname === '/')
        return route.fulfill({ body: html, contentType: 'text/html' });
      const types = {
        js: 'text/javascript',
        css: 'text/css',
        woff2: 'font/woff2',
        png: 'image/png',
      };
      try {
        const body = await readFile(
          new URL('../dist' + pathname, import.meta.url),
        );
        await route.fulfill({
          body,
          contentType:
            types[pathname.split('.').at(-1)] || 'application/octet-stream',
        });
      } catch {
        await route.fulfill({ status: 404 });
      }
    });
    await page.addInitScript(
      ({ projects, uploadedImage }) => {
        let revision = 'initial';
        let records = structuredClone(projects);
        window.adminMock = {
          saves: 0,
          uploads: 0,
          retries: 0,
          failSave: false,
          partial: true,
        };
        const state = () => ({
          projects: structuredClone(records),
          revision,
          imagePresets: [
            ...new Set(
              [...projects, ...records].map((project) => project.image),
            ),
          ],
          publicationPending: false,
          minProjects: 1,
          maxProjects: 8,
        });
        window.google = {
          script: {
            run: {
              withSuccessHandler(success) {
                return {
                  withFailureHandler() {
                    const call = (name, payload) =>
                      setTimeout(() => {
                        let result;
                        if (name === 'load')
                          result = { ok: true, data: state() };
                        else if (['save', 'add', 'delete'].includes(name)) {
                          window.adminMock.saves++;
                          if (window.adminMock.failSave)
                            result = { ok: false, error: { code: 'CONFLICT' } };
                          else {
                            if (name === 'add')
                              records.push({
                                ...structuredClone(payload.project),
                                id: 'mock-' + window.adminMock.saves,
                              });
                            else if (name === 'delete')
                              records = records.filter(
                                (project) => project.id !== payload.id,
                              );
                            else
                              records = records.map((project) =>
                                project.id === payload.project.id
                                  ? structuredClone(payload.project)
                                  : project,
                              );
                            revision = 'saved-' + window.adminMock.saves;
                            result = {
                              ok: true,
                              data: {
                                ...state(),
                                saved: true,
                                affectedId:
                                  name === 'add'
                                    ? records.at(-1).id
                                    : payload.project?.id,
                                publication: [
                                  { target: 'testing', accepted: true },
                                  {
                                    target: 'production',
                                    accepted: !window.adminMock.partial,
                                  },
                                ],
                              },
                            };
                          }
                        } else {
                          window.adminMock.retries++;
                          result = {
                            ok: true,
                            data: {
                              publication: [
                                { target: 'testing', accepted: true },
                                { target: 'production', accepted: true },
                              ],
                            },
                          };
                        }
                        success(result);
                      }, 100);
                    return {
                      adminLoadProjects: () => call('load'),
                      adminSaveProject: (payload) => call('save', payload),
                      adminAddProject: (payload) => call('add', payload),
                      adminDeleteProject: (payload) => call('delete', payload),
                      adminRetryPublication: () => call('retry'),
                    };
                  },
                };
              },
            },
          },
        };
        window.adminMock.expired = false;
        window.fetch = async (url, options = {}) => {
          if (window.adminMock.expired)
            return Response.json(
              { ok: false, error: { code: 'UNAUTHORIZED' } },
              { status: 401 },
            );
          if (url.includes('/media')) {
            if (options.headers['X-CSRF-Token'] !== 'mock-csrf')
              throw new Error('Missing media CSRF');
            window.adminMock.uploads++;
            return Response.json({
              ok: true,
              data: { image: uploadedImage },
              csrf: 'mock-csrf',
            });
          }
          if (url.includes('logout')) return Response.json({ ok: true });
          const body = options.body
            ? JSON.parse(options.body)
            : { operation: 'load' };
          if (
            options.method === 'POST' &&
            options.headers['X-CSRF-Token'] !== 'mock-csrf'
          )
            throw new Error('Missing CSRF');
          const names = {
            load: 'adminLoadProjects',
            save: 'adminSaveProject',
            add: 'adminAddProject',
            delete: 'adminDeleteProject',
            retry: 'adminRetryPublication',
          };
          const result = await new Promise((resolve) => {
            const runner = window.google.script.run
              .withSuccessHandler(resolve)
              .withFailureHandler();
            runner[names[body.operation]](body.payload);
          });
          return Response.json({ ...result, csrf: 'mock-csrf' });
        };
      },
      { projects, uploadedImage: uploadedMedia.image },
    );
    await page.goto('http://cms-admin.test/');
    await page.locator('#workspace').waitFor({ state: 'visible' });
    assert.equal(await page.locator('.project-choice').count(), 4);
    await page.evaluate(() => document.fonts.ready);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      fonts: [...document.fonts].map((font) => ({
        family: font.family,
        status: font.status,
      })),
    }));
    assert.equal(metrics.overflow, false);
    assert(
      metrics.fonts
        .filter(
          (font) => font.family.includes('Bluu') || font.family === 'Manrope',
        )
        .every((font) => font.status === 'loaded'),
    );
    await page.screenshot({
      path: new URL(`editor-${width}.png`, output).pathname,
      fullPage: true,
    });
    await page.locator('#image-upload').setInputFiles({
      name: 'invalid.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg/>'),
    });
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('maksimal 2 MB'),
    );
    assert.equal(await page.evaluate(() => window.adminMock.uploads), 0);
    await page.locator('#image-upload').setInputFiles({
      name: 'valid.png',
      mimeType: 'image/png',
      buffer: uploadPng,
    });
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('Gambar siap'),
    );
    assert.equal(
      await page.locator('#image').inputValue(),
      uploadedMedia.image,
    );
    assert.equal(await page.evaluate(() => window.adminMock.uploads), 1);
    assert.equal(await page.evaluate(() => window.adminMock.saves), 0);
    await page.waitForFunction(
      () =>
        document.getElementById('image-preview').complete &&
        document.getElementById('image-preview').naturalWidth > 0,
    );
    await page.screenshot({
      path: new URL(`upload-${width}.png`, output).pathname,
      fullPage: true,
    });
    await page.locator('#title').fill('<img src=x onerror=alert(1)>');
    await page.locator('#save').click();
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('belum berhasil'),
    );
    assert.equal(await page.locator('#project-list img').count(), 0);
    assert.equal(
      await page.locator('.project-choice').first().textContent(),
      '<img src=x onerror=alert(1)>',
    );
    assert.equal(await page.locator('#retry').isVisible(), true);
    await page.locator('#retry').click();
    await page.waitForFunction(() =>
      document
        .getElementById('status')
        .textContent.includes('Penerbitan dimulai'),
    );
    assert.equal(await page.evaluate(() => window.adminMock.saves), 1);
    assert.equal(await page.evaluate(() => window.adminMock.retries), 1);
    await page.evaluate(() => {
      window.adminMock.failSave = true;
    });
    await page.locator('#title').fill('Unsaved conflict edit');
    await page.locator('#save').click();
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('sudah berubah'),
    );
    assert.equal(
      await page.locator('#title').inputValue(),
      'Unsaved conflict edit',
    );
    assert.equal(await page.locator('#reload').isVisible(), true);
    await page.locator('#reload').click();
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('Pilih project'),
    );
    assert.equal(
      await page.locator('#title').inputValue(),
      '<img src=x onerror=alert(1)>',
    );
    await page.locator('#title').focus();
    await page.keyboard.press('Tab');
    assert.equal(
      await page.evaluate(() => document.activeElement.id),
      'description',
    );
    await page.evaluate(() => {
      window.adminMock.failSave = false;
      window.adminMock.partial = false;
    });
    await page.locator('#add').click();
    assert.equal(await page.locator('#title').inputValue(), '');
    assert.equal(await page.locator('#delete').isDisabled(), true);
    await page.locator('#title').fill('New project');
    await page.locator('#description').fill('New description');
    await page.locator('#tag-one').fill('One');
    await page.locator('#tag-two').fill('Two');
    await page.locator('#save').click();
    await page.waitForFunction(
      () => document.querySelectorAll('.project-choice').length === 5,
    );
    assert.equal(await page.locator('#title').inputValue(), 'New project');
    acceptDialog = false;
    await page.locator('#delete').click();
    assert.equal(await page.locator('.project-choice').count(), 5);
    acceptDialog = true;
    await page.locator('#delete').click();
    await page.waitForFunction(
      () => document.querySelectorAll('.project-choice').length === 4,
    );
    for (let i = 0; i < 3; i++) {
      await page.locator('#delete').click();
      await page.waitForFunction(
        (count) =>
          document.querySelectorAll('.project-choice').length === count,
        3 - i,
      );
    }
    assert.equal(await page.locator('#delete').isDisabled(), true);
    for (let i = 0; i < 7; i++) {
      await page.locator('#add').click();
      await page.locator('#title').fill('Growth ' + i);
      await page.locator('#description').fill('Description');
      await page.locator('#tag-one').fill('One');
      await page.locator('#tag-two').fill('Two');
      await page.locator('#save').click();
      await page.waitForFunction(
        (count) =>
          document.querySelectorAll('.project-choice').length === count,
        i + 2,
      );
    }
    assert.equal(await page.locator('#add').isDisabled(), true);
    await page.evaluate(() => {
      window.adminMock.failSave = true;
    });
    await page.locator('#delete').click();
    await page.waitForFunction(() =>
      document.getElementById('status').textContent.includes('sudah berubah'),
    );
    assert.equal(await page.locator('.project-choice').count(), 8);
    assert.equal(await page.locator('#title').inputValue(), 'Growth 6');
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.evaluate(() => {
      window.adminMock.expired = true;
      window.adminMock.failSave = false;
    });
    await page.locator('#title').fill('Keep expired draft');
    await page.locator('#save').click();
    await page.locator('#workspace').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#login').isVisible(), true);
    assert.equal(
      await page.locator('#title').inputValue(),
      'Keep expired draft',
    );
    await page.evaluate(() => {
      window.adminMock.expired = false;
    });
    await page.locator('#reload').click();
    await page.locator('#workspace').waitFor({ state: 'visible' });
    await page.locator('#logout').click();
    await page.locator('#workspace').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#login').isVisible(), true);
    await page.screenshot({
      path: new URL(`login-${width}.png`, output).pathname,
      fullPage: true,
    });
    assert.deepEqual(errors, []);
    report.push({
      width,
      overflow: false,
      fontsLoaded: true,
      savePartialRetryConflictKeyboard: 'PASS',
      addDeleteMinMaxLogoutExpiry: 'PASS',
      uploadValidationPreviewSave: 'PASS',
    });
    await page.close();
  }
} finally {
  await browser.close();
}
await writeFile(
  new URL('browser-report.json', output),
  JSON.stringify(report, null, 2),
);
console.log(
  'Native admin browser PASS: 4 widths, fonts, save/retry, conflicts, escaping and keyboard. Mock HTTP only; real upload acceptance remains separate.',
);
