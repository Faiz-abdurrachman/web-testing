import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRecruitmentHandler } from '../server/recruitment.mjs';
const base = process.env.PREVIEW_URL || 'http://localhost:4332';
const widths = [
  320, 360, 375, 390, 414, 480, 600, 760, 768, 820, 900, 1024, 1050, 1051, 1100,
  1200, 1280, 1300, 1366, 1440, 1600, 1680, 1920, 2560, 3440, 3840,
];
await mkdir('artifacts/recruitment', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
});
const report = { flows: [], responsiveCases: 0, errors: [] };
const complete = async (page, step) => {
  await page.evaluate((number) => {
    const panel = document.querySelector(`[data-step-panel="${number}"]`);
    const groups = new Set();
    for (const input of panel.querySelectorAll(
      'input[required],textarea[required]',
    )) {
      if (input.type === 'radio') {
        if (!groups.has(input.name)) {
          input.checked = true;
          groups.add(input.name);
        }
      } else if (input.type === 'checkbox') input.checked = true;
      else
        input.value =
          input.type === 'email'
            ? 'fixture@example.test'
            : input.type === 'tel'
              ? '+628123456789'
              : 'Test application';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, step);
};
const measure = async (page) => {
  const data = await page.evaluate(() => {
    const overflow = document.documentElement.scrollWidth - innerWidth;
    const offscreen = [];
    for (const element of document.querySelectorAll(
      'main h1,main h2,main h3,main p,main button,main .pill-content',
    )) {
      if (!element.checkVisibility()) continue;
      const rect = element.getBoundingClientRect();
      if (rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1))
        offscreen.push(element.className || element.tagName);
    }
    return { overflow, offscreen };
  });
  assert.ok(data.overflow <= 1, JSON.stringify(data));
  assert.deepEqual(data.offscreen, []);
};
try {
  for (const width of [320, 390, 768, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    page.on('pageerror', (e) => report.errors.push(e.message));
    const saved = new Map();
    let calls = 0;
    let failFirst = true;
    let accepting = true;
    const receipts = [];
    const handle = createRecruitmentHandler({
      env: {
        RECRUITMENT_OPEN: 'true',
        SUPABASE_URL: 'https://fixtureproject.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY:
          'fixture-service-role-key-not-real-credential-000000',
        CMS_ADMIN_ORIGIN: new URL(base).origin,
      },
      fetchImpl: async (_, init) => {
        calls++;
        const body = JSON.parse(init.body);
        receipts.push(body.p_receipt);
        saved.set(body.p_receipt, body.p_fields);
        if (failFirst) {
          failFirst = false;
          throw Error('ambiguous upstream timeout after save');
        }
        return Response.json({
          receipt: body.p_receipt,
          status: 'inserted',
        });
      },
    });
    await page.route('**/api/recruitment/application', async (route) => {
      const req = route.request();
      if (req.method() === 'GET')
        return route.fulfill({ json: { ok: true, accepting } });
      const result = await handle(
        new Request(req.url(), {
          method: req.method(),
          headers: req.headers(),
          body: req.postData(),
        }),
      );
      await route.fulfill({
        status: result.status,
        body: await result.text(),
        headers: { 'content-type': 'application/json' },
      });
    });
    await page.goto(`${base}/recruitment/apply?role=data`);
    await page.waitForFunction(
      () => !document.querySelector('#btn-submit-application').disabled,
    );
    assert.equal(
      await page.locator('[name="primary_hods"]:checked').inputValue(),
      'data',
    );
    await page.locator('[data-step="4"]').click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '1',
    );
    assert.equal(
      await page.locator('[name="full_name"]').getAttribute('aria-invalid'),
      'true',
    );
    await complete(page, 1);
    await page.locator('[name="email"]').fill('invalid');
    await page
      .locator('[data-step-panel="1"] [data-action="next-step"]')
      .click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '1',
    );
    await page.locator('[name="email"]').fill('fixture@example.test');
    await page
      .locator('[name="current_status"][value="University Student"]')
      .locator('..')
      .click();
    await page
      .locator('[name="learning_methods"][value="Self-learning"]')
      .locator('..')
      .click();
    await page
      .locator('[name="learning_methods"][value="Books / Articles"]')
      .locator('..')
      .click();
    await page
      .locator('[data-step-panel="1"] [data-action="next-step"]')
      .click();
    await page
      .locator('[name="foundation_skills"][value="Python"]')
      .locator('..')
      .click();
    await page
      .locator('[name="foundation_skills"][value="SQL"]')
      .locator('..')
      .click();
    await page
      .locator('[name="specific_area"][value="Data Science"]')
      .locator('..')
      .click();
    assert.equal(
      await page
        .locator('[name="specific_area"][value="Data Science"]')
        .evaluate((input) => getComputedStyle(input).opacity),
      '0',
    );
    assert.equal(
      await page
        .locator('[name="specific_area"][value="Data Science"]')
        .locator('..')
        .locator('.pill-content')
        .evaluate((span) => getComputedStyle(span).borderRadius),
      '200px',
    );
    await page.waitForTimeout(450);
    await page.reload();
    assert.equal(
      await page.locator('[name="current_status"]:checked').inputValue(),
      'University Student',
    );
    assert.deepEqual(
      await page
        .locator('[name="learning_methods"]:checked')
        .evaluateAll((inputs) => inputs.map((i) => i.value)),
      ['Self-learning', 'Books / Articles'],
    );
    assert.deepEqual(
      await page
        .locator('[name="foundation_skills"]:checked')
        .evaluateAll((inputs) => inputs.map((i) => i.value)),
      ['Python', 'SQL'],
    );
    assert.equal(
      await page.locator('[name="specific_area"]:checked').inputValue(),
      'Data Science',
    );
    await page.locator('[data-step="4"]').click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '3',
    );
    await complete(page, 3);
    await page.locator('[name="portfolio_link"]').fill('javascript:alert(1)');
    await page
      .locator('[data-step-panel="3"] [data-action="next-step"]')
      .click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '3',
    );
    await page
      .locator('[name="portfolio_link"]')
      .fill('https://example.test/portfolio');
    await page
      .locator('[data-step-panel="3"] [data-action="next-step"]')
      .click();
    await complete(page, 4);
    await page.waitForFunction(
      () => !document.querySelector('#btn-submit-application').disabled,
    );
    // Full responsive matrix for each populated step, preserving values.
    for (const targetWidth of widths) {
      await page.setViewportSize({ width: targetWidth, height: 900 });
      for (const step of [1, 2, 3, 4]) {
        await page.locator(`[data-step="${step}"]`).click();
        assert.equal(
          await page
            .locator('.form-step.is-active')
            .getAttribute('data-step-panel'),
          String(step),
        );
        await measure(page);
        report.responsiveCases++;
      }
    }
    await page.setViewportSize({ width, height: 900 });
    for (const step of [1, 2, 3, 4]) {
      await page.locator(`[data-step="${step}"]`).click();
      await page.screenshot({
        path: `artifacts/recruitment/form-${width}-step${step}.png`,
      });
    }
    await page.locator('#btn-submit-application').click();
    await page.waitForFunction(() =>
      document
        .querySelector('#application-status')
        .textContent.includes('belum terkonfirmasi'),
    );
    assert.equal(saved.size, 1);
    assert.equal(calls, 1);
    assert.equal(await page.locator('#success-screen').isVisible(), false);
    await page.reload();
    await page.waitForFunction(
      () => !document.querySelector('#btn-submit-application').disabled,
    );
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '4',
    );
    assert.equal(await page.locator('[name="full_name"]').isDisabled(), true);
    await page.locator('#btn-submit-application').click();
    await page.locator('#success-screen').waitFor({ state: 'visible' });
    assert.equal(calls, 2);
    assert.equal(saved.size, 1);
    assert.equal(receipts[0], receipts[1]);
    assert.equal(
      await page.evaluate(() =>
        localStorage.getItem('ds_recruitment_application_draft'),
      ),
      null,
    );
    await page.waitForTimeout(450);
    assert.equal(
      await page.evaluate(() =>
        localStorage.getItem('ds_recruitment_application_draft'),
      ),
      null,
    );
    // Closed status and blocked browser storage must not break input/navigation.
    accepting = false;
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw Error('blocked');
      };
      Storage.prototype.getItem = () => {
        throw Error('blocked');
      };
    });
    await page.goto(`${base}/recruitment/apply?role=vision`);
    assert.equal(
      await page.locator('#btn-submit-application').isDisabled(),
      true,
    );
    assert.equal(
      await page.locator('[name="primary_hods"]:checked').inputValue(),
      'vision',
    );
    await complete(page, 1);
    await page
      .locator('[data-step-panel="1"] [data-action="next-step"]')
      .click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '2',
    );
    report.flows.push({
      width,
      validation: true,
      draft: true,
      idempotentRetry: true,
      closed: true,
      storageUnavailable: true,
    });
    await context.close();
  }
  // Every existing role destination and repeated real client-router navigation.
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: 'reduce',
  });
  page.on('pageerror', (e) => report.errors.push(e.message));
  await page.route('**/api/recruitment/application', (r) =>
    r.fulfill({ json: { ok: true, accepting: false } }),
  );
  for (const id of [
    'data',
    'core',
    'language',
    'vision',
    'product',
    'growth',
  ]) {
    await page.goto(`${base}/recruitment/roles/${id}`);
    const link = page.locator('.button.apply');
    assert.equal(
      await link.getAttribute('href'),
      `/recruitment/apply?role=${id}`,
    );
    await link.click();
    await page.waitForURL(
      (url) =>
        url.pathname.replace(/\/$/, '') === '/recruitment/apply' &&
        url.searchParams.get('role') === id,
    );
    await page.waitForFunction(
      (role) =>
        document.querySelector('[name="primary_hods"]:checked')?.value === role,
      id,
    );
    await complete(page, 1);
    await page
      .locator('[data-step-panel="1"] [data-action="next-step"]')
      .click();
    assert.equal(
      await page
        .locator('.form-step.is-active')
        .getAttribute('data-step-panel'),
      '2',
    );
  }
  await page.close();
  assert.deepEqual(report.errors, []);
  await writeFile(
    'artifacts/recruitment/browser.json',
    JSON.stringify(report, null, 2),
  );
  console.log(
    `Recruitment PASS: ${report.flows.length} flows; ${report.responsiveCases} panel/width cases; six role destinations/client navigation; no page errors.`,
  );
} finally {
  await browser.close();
}
