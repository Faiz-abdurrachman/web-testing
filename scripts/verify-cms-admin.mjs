// Local HtmlService RPC mock: browser behavior only, not Google identity verification.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const html = await readFile(
  new URL('../cms/gas/admin/Index.html', import.meta.url),
  'utf8',
);
const projects = JSON.parse(
  await readFile(
    new URL('../src/data/cms-snapshot.json', import.meta.url),
    'utf8',
  ),
).projects;
const output = new URL('../artifacts/cms-admin/', import.meta.url);
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
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('dialog', (dialog) => dialog.accept());
    await page.route('http://cms-admin.test/', (route) =>
      route.fulfill({ body: html, contentType: 'text/html' }),
    );
    await page.addInitScript(
      ({ projects }) => {
        let revision = 'initial';
        let records = structuredClone(projects);
        window.adminMock = {
          saves: 0,
          retries: 0,
          failSave: false,
          partial: true,
        };
        const state = () => ({
          projects: structuredClone(records),
          revision,
          imagePresets: [...new Set(projects.map((project) => project.image))],
          publicationPending: false,
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
                        else if (name === 'save') {
                          window.adminMock.saves++;
                          if (window.adminMock.failSave)
                            result = { ok: false, error: { code: 'CONFLICT' } };
                          else {
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
                      adminRetryPublication: () => call('retry'),
                    };
                  },
                };
              },
            },
          },
        };
      },
      { projects },
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
    assert.deepEqual(errors, []);
    report.push({
      width,
      overflow: false,
      fontsLoaded: true,
      savePartialRetryConflictKeyboard: 'PASS',
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
  'CMS admin browser PASS: 4 widths, fonts, save/retry, conflicts, escaping and keyboard. Mock RPC only.',
);
