import { chromium } from '@playwright/test';
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 903 },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce',
});
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('response', (response) => {
  if (response.status() >= 400)
    errors.push(`${response.status()} ${response.url()}`);
});
// The sound orb is overlay UI that is not part of any reference PNG; hide it on
// every document (its own style tag survives navigations) so diffs stay clean.
await page.addInitScript(() => {
  const style = document.createElement('style');
  style.textContent = '.sound-toggle{visibility:hidden !important}';
  if (document.head) document.head.appendChild(style);
  else
    document.addEventListener(
      'DOMContentLoaded',
      () => document.head?.appendChild(style),
      { once: true },
    );
});
// The navbar is fixed, so hide it while screenshotting the sections below the
// hero; their reference PNGs do not contain it. Geometry stays measurable.
const setNavbarHidden = (hidden) =>
  page.evaluate((value) => {
    const selectors = [
      '.navbar',
      '.rail-arrow',
      '.project-arrow',
      '.project-dots',
      '.project-card:not(.is-active)',
      '.snippet-arrow',
      '.splash',
      '.sound-toggle',
    ].join(',');
    document.querySelectorAll(selectors).forEach((element) => {
      element.style.visibility = value ? 'hidden' : '';
    });
  }, hidden);
try {
  await page.goto(process.env.PREVIEW_URL || 'http://localhost:4321', {
    waitUntil: 'networkidle',
  });
  await page.evaluate(() => {
    document.querySelectorAll('img[loading=lazy]').forEach((image) => {
      image.loading = 'eager';
    });
    return document.fonts.ready;
  });
  const desktop = await page.evaluate(async () => {
    const headingFonts = await document.fonts.load('700 72px "Bluu Next"');
    return {
      headingFontLoaded:
        headingFonts.length > 0 &&
        headingFonts.every((font) => font.status === 'loaded'),
      elements: Object.fromEntries(
        [
          '.hero',
          '.navbar',
          'h1',
          '.copy p',
          '.actions',
          '.brand',
          '.desktop-nav',
        ].map((selector) => {
          const element = document.querySelector(selector);
          const { x, y, width, height } = element.getBoundingClientRect();
          return [
            selector,
            { x, y, width, height, font: getComputedStyle(element).font },
          ];
        }),
      ),
    };
  });
  assert.equal(
    desktop.headingFontLoaded,
    true,
    'The bundled Bluu Next display font must load before visual validation.',
  );
  await page
    .locator('.hero')
    .screenshot({ path: 'artifacts/hero-desktop.png' });
  await setNavbarHidden(true);
  const reference = await sharp(
    'assets/assets home page/hero section/Home-Hero-Revisi.png',
  )
    .resize(1440, 903)
    .removeAlpha()
    .raw()
    .toBuffer();
  const actual = await sharp('artifacts/hero-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(actual.length, reference.length);
  const difference = Buffer.alloc(actual.length);
  const overlay = Buffer.alloc(actual.length);
  let total = 0;
  for (let i = 0; i < actual.length; i++) {
    const delta = Math.abs(actual[i] - reference[i]);
    total += delta;
    difference[i] = Math.min(255, delta * 4);
    overlay[i] = Math.round((actual[i] + reference[i]) / 2);
  }
  const raw = { width: 1440, height: 903, channels: 3 };
  await sharp(difference, { raw }).png().toFile('artifacts/hero-diff.png');
  await sharp(overlay, { raw }).png().toFile('artifacts/hero-overlay.png');
  await page.locator('.philosophy').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('700 56px "Bluu Next"');
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page
    .locator('.philosophy')
    .screenshot({ path: 'artifacts/philosophy-desktop.png' });
  const philosophyReference = await sharp(
    'assets/assets home page/ourphilosophy/Home-Philosophy-Revisi-1x.png',
  )
    .resize(1440, 837)
    .removeAlpha()
    .raw()
    .toBuffer();
  const philosophyActual = await sharp('artifacts/philosophy-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(philosophyActual.length, philosophyReference.length);
  const philosophyDifference = Buffer.alloc(philosophyActual.length);
  const philosophyOverlay = Buffer.alloc(philosophyActual.length);
  let philosophyTotal = 0;
  for (let i = 0; i < philosophyActual.length; i++) {
    const delta = Math.abs(philosophyActual[i] - philosophyReference[i]);
    philosophyTotal += delta;
    philosophyDifference[i] = Math.min(255, delta * 4);
    philosophyOverlay[i] = Math.round(
      (philosophyActual[i] + philosophyReference[i]) / 2,
    );
  }
  const philosophyRaw = { width: 1440, height: 837, channels: 3 };
  await sharp(philosophyDifference, { raw: philosophyRaw })
    .png()
    .toFile('artifacts/philosophy-diff.png');
  await sharp(philosophyOverlay, { raw: philosophyRaw })
    .png()
    .toFile('artifacts/philosophy-overlay.png');
  const philosophyGeometry = await page
    .locator('.philosophy')
    .evaluate((section) => {
      const sectionRect = section.getBoundingClientRect();
      const relativeBox = (selector) => {
        const rect = section.querySelector(selector).getBoundingClientRect();
        return {
          x: rect.x - sectionRect.x,
          y: rect.y - sectionRect.y,
          width: rect.width,
          height: rect.height,
        };
      };
      return {
        width: sectionRect.width,
        height: sectionRect.height,
        top: sectionRect.top + scrollY,
        heading: relativeBox('h2'),
        principles: relativeBox('.principles'),
      };
    });
  assert.deepEqual(philosophyGeometry, {
    width: 1440,
    height: 837,
    top: 903,
    heading: { x: 766, y: 239, width: 591, height: 138 },
    principles: { x: 766, y: 425, width: 591, height: 248 },
  });
  await page.screenshot({
    path: 'artifacts/homepage-desktop.png',
    fullPage: true,
  });
  await page.locator('.what-we-do').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page
    .locator('.what-we-do')
    .screenshot({ path: 'artifacts/what-we-do-desktop.png' });
  const pillarsGeometry = await page
    .locator('.what-we-do')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const rel = (sel) => {
        const el = section.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return {
          x: Math.round((b.x - rect.x) * 10) / 10,
          y: Math.round((b.y - rect.y) * 10) / 10,
          width: Math.round(b.width * 10) / 10,
          height: Math.round(b.height * 10) / 10,
        };
      };
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + scrollY),
        eyebrow: rel('.eyebrow'),
        heading: rel('h2'),
        cards: [...section.querySelectorAll('.pillar')].map((card) => {
          const box = card.getBoundingClientRect();
          return {
            x: Math.round(box.x - rect.x),
            y: Math.round(box.y - rect.y),
            width: Math.round(box.width),
            height: Math.round(box.height),
          };
        }),
      };
    });
  assert.deepEqual(pillarsGeometry, {
    width: 1440,
    height: 840,
    top: 1740,
    eyebrow: { x: 678, y: 334, width: 84, height: 26 },
    heading: { x: 80, y: 369, width: 1280, height: 138 },
    cards: [
      { x: 80, y: 80, width: 391, height: 254 },
      { x: 969, y: 80, width: 391, height: 254 },
      { x: 80, y: 506, width: 391, height: 254 },
      { x: 969, y: 506, width: 391, height: 254 },
    ],
  });
  const pillarsReference = await sharp(
    'assets/assets home page/what we do/Home-WhatWeDo-Revisi-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const pillarsActual = await sharp('artifacts/what-we-do-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(pillarsReference.length, pillarsActual.length);
  const pillarsDiff = Buffer.alloc(pillarsActual.length);
  const pillarsOverlay = Buffer.alloc(pillarsActual.length);
  let pillarsTotal = 0;
  for (let i = 0; i < pillarsActual.length; i++) {
    const delta = Math.abs(pillarsActual[i] - pillarsReference[i]);
    pillarsTotal += delta;
    pillarsDiff[i] = Math.min(255, delta * 4);
    pillarsOverlay[i] = Math.round(
      (pillarsActual[i] + pillarsReference[i]) / 2,
    );
  }
  const pillarsRaw = { width: 1440, height: 840, channels: 3 };
  await sharp(pillarsDiff, { raw: pillarsRaw })
    .png()
    .toFile('artifacts/what-we-do-diff.png');
  await sharp(pillarsOverlay, { raw: pillarsRaw })
    .png()
    .toFile('artifacts/what-we-do-overlay.png');
  await page.locator('.domains').scrollIntoViewIfNeeded();
  await page.evaluate(() =>
    Promise.all([...document.images].map((image) => image.decode())),
  );
  await page
    .locator('.domains')
    .screenshot({ path: 'artifacts/domains-desktop.png' });
  const domainGeometry = await page.locator('.domains').evaluate((section) => {
    const box = section.getBoundingClientRect();
    const header = section
      .querySelector('.header-inner')
      .getBoundingClientRect();
    const eyebrow = section.querySelector('.eyebrow').getBoundingClientRect();
    const heading = section.querySelector('h2').getBoundingClientRect();
    return {
      width: box.width,
      height: box.height,
      top: box.top + scrollY,
      header: {
        x: header.x - box.x,
        y: header.y - box.y,
        width: header.width,
        height: header.height,
      },
      eyebrow: {
        x: eyebrow.x - box.x,
        y: eyebrow.y - box.y,
        width: eyebrow.width,
        height: eyebrow.height,
      },
      heading: {
        x: heading.x - box.x,
        y: heading.y - box.y,
        width: heading.width,
        height: heading.height,
      },
      cards: [...section.querySelectorAll('.domain-card')].map((card) => {
        const rect = card.getBoundingClientRect();
        return {
          x: rect.x - box.x,
          y: rect.y - box.y,
          width: rect.width,
          height: rect.height,
        };
      }),
    };
  });
  assert.deepEqual(domainGeometry, {
    width: 1440,
    height: 819,
    top: 2580,
    header: {
      x: 80,
      y: 80,
      width: 1280,
      height: 149,
    },
    eyebrow: {
      x: 640.5,
      y: 80,
      width: 159,
      height: 26,
    },
    heading: {
      x: 451,
      y: 114,
      width: 538,
      height: 67,
    },
    cards: Array.from({ length: 6 }, (_, i) => ({
      x: 80 + i * 437,
      y: 303,
      width: 405,
      height: 436,
    })),
  });
  const domainReference = await sharp(
    'assets/assets home page/hods/Home-HoDS-Revisi-1x.png',
  )
    .resize(1440, 819)
    .removeAlpha()
    .raw()
    .toBuffer();
  const domainActual = await sharp('artifacts/domains-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(domainReference.length, domainActual.length);
  let domainTotal = 0;
  const domainDiff = Buffer.alloc(domainActual.length),
    domainOverlay = Buffer.alloc(domainActual.length);
  for (let i = 0; i < domainActual.length; i++) {
    const delta = Math.abs(domainActual[i] - domainReference[i]);
    domainTotal += delta;
    domainDiff[i] = Math.min(255, delta * 4);
    domainOverlay[i] = Math.round((domainActual[i] + domainReference[i]) / 2);
  }
  const domainRaw = { width: 1440, height: 819, channels: 3 };
  await sharp(domainDiff, { raw: domainRaw })
    .png()
    .toFile('artifacts/domains-diff.png');
  await sharp(domainOverlay, { raw: domainRaw })
    .png()
    .toFile('artifacts/domains-overlay.png');
  const rail = page.locator('.domain-rail');
  await rail.focus();
  await page.keyboard.press('End');
  assert.ok(
    await rail.evaluate(
      (element) =>
        Math.abs(
          element.scrollWidth - element.clientWidth - element.scrollLeft,
        ) < 1,
    ),
    'All domains reachable by keyboard',
  );
  await page
    .locator('.domains')
    .screenshot({ path: 'artifacts/domains-last-cards.png' });
  await page.keyboard.press('Home');
  assert.equal(await rail.evaluate((element) => element.scrollLeft), 0);
  await page.keyboard.press('ArrowRight');
  assert.equal(await rail.evaluate((element) => element.scrollLeft), 437);
  await page.keyboard.press('Home');
  await rail.evaluate((element) => element.blur());
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: 'artifacts/homepage-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.projects').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('700 56px "Bluu Next"');
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page
    .locator('.projects')
    .screenshot({ path: 'artifacts/projects-desktop.png' });
  const projectsGeometry = await page
    .locator('.projects')
    .evaluate((section) => {
      const box = section.getBoundingClientRect();
      const round = (n) => Math.round(n * 10) / 10;
      return {
        width: Math.round(box.width),
        height: Math.round(box.height),
        top: Math.round(box.top + scrollY),
        elements: Object.fromEntries(
          ['.eyebrow', 'h2', '.project-card.is-active'].map((selector) => {
            const r = section.querySelector(selector).getBoundingClientRect();
            return [
              selector,
              {
                x: round(r.x - box.x),
                y: round(r.y - box.y),
                width: round(r.width),
                height: round(r.height),
              },
            ];
          }),
        ),
      };
    });
  assert.deepEqual(projectsGeometry, {
    width: 1440,
    height: 910,
    top: 3399,
    elements: {
      '.eyebrow': { x: 80, y: 80, width: 86.6, height: 26 },
      h2: { x: 80, y: 114, width: 647.7, height: 67 },
      '.project-card.is-active': {
        x: 445.5,
        y: 263,
        width: 549,
        height: 567,
      },
    },
  });
  const projectsReference = await sharp(
    'assets/assets home page/our project/Home-Project-Revisi-1x.png',
  )
    .resize(1440, 910)
    .removeAlpha()
    .raw()
    .toBuffer();
  const projectsActual = await sharp('artifacts/projects-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(projectsReference.length, projectsActual.length);
  const projectsDifference = Buffer.alloc(projectsActual.length),
    projectsOverlay = Buffer.alloc(projectsActual.length);
  let projectsTotal = 0;
  for (let i = 0; i < projectsActual.length; i++) {
    const delta = Math.abs(projectsActual[i] - projectsReference[i]);
    projectsTotal += delta;
    projectsDifference[i] = Math.min(255, delta * 4);
    projectsOverlay[i] = Math.round(
      (projectsActual[i] + projectsReference[i]) / 2,
    );
  }
  const projectsRaw = { width: 1440, height: 910, channels: 3 };
  await sharp(projectsDifference, { raw: projectsRaw })
    .png()
    .toFile('artifacts/projects-diff.png');
  await sharp(projectsOverlay, { raw: projectsRaw })
    .png()
    .toFile('artifacts/projects-overlay.png');
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: 'artifacts/homepage-desktop.png',
    fullPage: true,
  });
  await page.locator('.recruitment').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('700 56px "Bluu Next"');
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page
    .locator('.recruitment')
    .screenshot({ path: 'artifacts/recruitment-desktop.png' });
  const recruitmentGeometry = await page
    .locator('.recruitment')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const round = (n) => Math.round(n * 10) / 10;
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        top: Math.round(rect.top + scrollY),
        elements: Object.fromEntries(
          [
            '.recruitment-panel',
            '.eyebrow',
            'h2',
            '.recruitment-copy p',
            '.recruitment-actions',
          ].map((selector) => {
            const box = section.querySelector(selector).getBoundingClientRect();
            return [
              selector,
              {
                x: round(box.x - rect.x),
                y: round(box.y - rect.y),
                width: round(box.width),
                height: round(box.height),
              },
            ];
          }),
        ),
      };
    });
  assert.deepEqual(recruitmentGeometry, {
    width: 1440,
    height: 554,
    top: 4309,
    elements: {
      '.recruitment-panel': { x: 80, y: 80, width: 1280, height: 394 },
      '.eyebrow': { x: 673.4, y: 145, width: 93.2, height: 26 },
      h2: { x: 161, y: 179, width: 1118, height: 67 },
      '.recruitment-copy p': { x: 427, y: 270, width: 586, height: 48 },
      '.recruitment-actions': { x: 619.5, y: 366, width: 200.9, height: 43 },
    },
  });
  const recruitmentReference = await sharp(
    'assets/assets home page/cta/Home-CTA-Revisi-1x.png',
  )
    .resize(1440, 554)
    .removeAlpha()
    .raw()
    .toBuffer();
  const recruitmentActual = await sharp('artifacts/recruitment-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(recruitmentReference.length, recruitmentActual.length);
  let recruitmentTotal = 0;
  const recruitmentDiff = Buffer.alloc(recruitmentActual.length),
    recruitmentOverlay = Buffer.alloc(recruitmentActual.length);
  for (let i = 0; i < recruitmentActual.length; i++) {
    const delta = Math.abs(recruitmentActual[i] - recruitmentReference[i]);
    recruitmentTotal += delta;
    recruitmentDiff[i] = Math.min(255, delta * 4);
    recruitmentOverlay[i] = Math.round(
      (recruitmentActual[i] + recruitmentReference[i]) / 2,
    );
  }
  const recruitmentRaw = { width: 1440, height: 554, channels: 3 };
  await sharp(recruitmentDiff, { raw: recruitmentRaw })
    .png()
    .toFile('artifacts/recruitment-diff.png');
  await sharp(recruitmentOverlay, { raw: recruitmentRaw })
    .png()
    .toFile('artifacts/recruitment-overlay.png');
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  const footerSource = await page
    .locator('.footer .backdrop img')
    .evaluate((image) => image.currentSrc);
  assert.ok(
    footerSource.endsWith('/images/backgrounds/footer-1440.webp'),
    'Desktop footer must select the 1440w WebP at DPR 1',
  );
  await page
    .locator('.footer')
    .screenshot({ path: 'artifacts/footer-desktop.png' });
  const footerGeometry = await page.locator('.footer').evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const relative = (element) => {
      const box = element.getBoundingClientRect();
      return {
        x: box.x - rect.x,
        y: box.y - rect.y,
        width: box.width,
        height: box.height,
      };
    };
    return {
      width: rect.width,
      height: rect.height,
      columns: [...section.querySelectorAll('.top > *')].map(relative),
      divider: relative(section.querySelector('.divider')),
      legal: relative(section.querySelector('.legal')),
    };
  });
  assert.equal(footerGeometry.width, 1440, 'Footer width must be 1440px');
  assert.equal(footerGeometry.height, 556, 'Footer height must be 556px');
  assert.ok(
    Math.abs(footerGeometry.columns[0].x - 80) < 1 &&
      Math.abs(footerGeometry.columns[1].x - 652.73) < 1 &&
      Math.abs(footerGeometry.columns[2].x - 1096.33) < 1,
    'Footer columns must align with the Figma reference',
  );
  assert.ok(
    Math.abs(footerGeometry.divider.y - 453.69) < 1.5 &&
      Math.abs(footerGeometry.legal.y - 474.69) < 1.5,
    'Footer divider and legal bar must match the Figma reference',
  );
  const footerReference = await sharp(
    'assets/assets recruitment page/footer/Recruitment-Footer-Revisi-1x.png',
  )
    .resize(1440, 556)
    .removeAlpha()
    .raw()
    .toBuffer();
  const footerActual = await sharp('artifacts/footer-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(footerReference.length, footerActual.length);
  let footerTotal = 0;
  const footerDiff = Buffer.alloc(footerActual.length),
    footerOverlay = Buffer.alloc(footerActual.length);
  for (let i = 0; i < footerActual.length; i++) {
    const delta = Math.abs(footerActual[i] - footerReference[i]);
    footerTotal += delta;
    footerDiff[i] = Math.min(255, delta * 4);
    footerOverlay[i] = Math.round((footerActual[i] + footerReference[i]) / 2);
  }
  const footerRaw = { width: 1440, height: 556, channels: 3 };
  await sharp(footerDiff, { raw: footerRaw })
    .png()
    .toFile('artifacts/footer-diff.png');
  await sharp(footerOverlay, { raw: footerRaw })
    .png()
    .toFile('artifacts/footer-overlay.png');
  await setNavbarHidden(false);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: 'artifacts/homepage-desktop.png',
    fullPage: true,
  });
  const sizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const responsive = [];
  for (const width of sizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Horizontal overflow at ${width}px`,
    );
    responsive.push(dimensions);
    const recruitmentIssues = await page
      .locator('.recruitment')
      .evaluate((section) =>
        [...section.querySelectorAll('h2,p,button')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const textBox = range.getBoundingClientRect();
            return (
              box.left < 0 ||
              box.right > innerWidth ||
              textBox.left < box.left - 1 ||
              textBox.right > box.right + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      recruitmentIssues,
      [],
      `Recruitment text clipped at ${width}px`,
    );
    const projectIssues = await page
      .locator('.projects')
      .evaluate((section) => {
        dispatchEvent(new Event('resize'));
        const issues = [];
        const active = section.querySelector('.project-card.is-active');
        const card = active.getBoundingClientRect();
        const heading = section.querySelector('h2');
        if (
          heading.scrollWidth > heading.clientWidth + 1 ||
          heading.getBoundingClientRect().right > innerWidth
        )
          issues.push('Heading clipped');
        for (const element of active.querySelectorAll(
          'h3,.project-copy p,.project-tags',
        )) {
          const box = element.getBoundingClientRect();
          if (box.left < 0 || box.right > innerWidth)
            issues.push('Text clipped');
          if (element.matches('.project-copy p') && box.bottom > card.bottom)
            issues.push('Description exceeds card');
        }
        return issues;
      });
    assert.deepEqual(projectIssues, [], `Projects layout at ${width}px`);
    const domainIssues = await page
      .locator('.domains')
      .evaluate((section) =>
        [...section.querySelectorAll('.domain-card')].flatMap((card) =>
          [...card.querySelectorAll('h3,p')]
            .filter((text) => text.scrollWidth > text.clientWidth + 1)
            .map((text) => text.textContent),
        ),
      );
    assert.deepEqual(domainIssues, [], `Domain text overflows at ${width}px`);
    await rail.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });
    assert.ok(
      await rail.evaluate(
        (element) =>
          Math.abs(
            element.scrollWidth - element.clientWidth - element.scrollLeft,
          ) < 1,
      ),
      `Last domain reachable at ${width}px`,
    );
    await rail.evaluate((element) => {
      element.scrollLeft = 0;
    });
    const clippedText = await page.locator('.philosophy').evaluate((section) =>
      [...section.querySelectorAll('h2, h3, p')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return (
            rect.left < 0 ||
            rect.right > innerWidth ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent),
    );
    assert.deepEqual(clippedText, [], `Clipped philosophy text at ${width}px`);
    const pillarsIssues = await page
      .locator('.what-we-do')
      .evaluate((section) => {
        const problems = [];
        const cards = [...section.querySelectorAll('.pillar')];
        for (const card of cards) {
          const box = card.getBoundingClientRect();
          const copy = card
            .querySelector('.pillar-copy')
            .getBoundingClientRect();
          if (
            copy.bottom > box.bottom ||
            copy.left < box.left ||
            copy.right > box.right
          )
            problems.push('Card copy clipped');
          for (const text of card.querySelectorAll('h3, p')) {
            if (
              text.scrollWidth > text.clientWidth + 1 ||
              text.getBoundingClientRect().width > copy.width + 1
            )
              problems.push('Text overflows card');
          }
        }
        const boxes = [...cards, section.querySelector('.section-heading')].map(
          (element) => element.getBoundingClientRect(),
        );
        for (let i = 0; i < boxes.length; i++)
          for (let j = i + 1; j < boxes.length; j++) {
            const a = boxes[i],
              b = boxes[j];
            if (
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1
            )
              problems.push('Cards or heading overlap');
          }
        return problems;
      });
    assert.deepEqual(pillarsIssues, [], `What We Do layout at ${width}px`);
    const footerIssues = await page.locator('.footer').evaluate((section) =>
      [...section.querySelectorAll('h2,p,li,.brand-name,.legal-links span')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < -1 ||
            box.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent),
    );
    assert.deepEqual(footerIssues, [], `Footer text clipped at ${width}px`);
    if (width === 390) {
      const mobileFooterSource = await page
        .locator('.footer .backdrop img')
        .evaluate((image) => image.currentSrc);
      assert.ok(
        mobileFooterSource.endsWith('/images/backgrounds/footer-mobile.webp'),
        'Phone footer must select the portrait WebP',
      );
    }
    const illustrationLeft = await page
      .locator('.philosophy .illustration')
      .evaluate((image) => image.getBoundingClientRect().left);
    assert.ok(
      Math.abs(illustrationLeft) < 1,
      `Philosophy artwork must meet the left edge at ${width}px`,
    );
    if (width === 390) {
      await page.screenshot({
        path: 'artifacts/homepage-mobile.png',
        fullPage: true,
      });
      await page
        .locator('.philosophy')
        .screenshot({ path: 'artifacts/philosophy-mobile.png' });
      await page.evaluate(() => scrollTo(0, 0));
      await page.locator('summary').click();
      assert.equal(await page.locator('.mobile-menu').getAttribute('open'), '');
      await page.screenshot({
        path: 'artifacts/mobile-menu.png',
        fullPage: true,
      });
      await page.keyboard.press('Escape');
      assert.equal(
        await page.locator('.mobile-menu').getAttribute('open'),
        null,
      );
    }
  }
  // Recruitment page — hero section (its reference PNG includes the navbar).
  await page.goto(
    `${process.env.PREVIEW_URL || 'http://localhost:4321'}/recruitment`,
    { waitUntil: 'networkidle' },
  );
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await page.evaluate(() => scrollTo(0, 0));
  await page
    .locator('.recruitment-hero')
    .screenshot({ path: 'artifacts/recruitment-hero-desktop.png' });
  const recruitHeroGeometry = await page
    .locator('.recruitment-hero')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        h1: relative('h1'),
        copy: relative('p'),
        button: relative('button'),
      };
    });
  assert.deepEqual(recruitHeroGeometry, {
    width: 1440,
    height: 866,
    top: 0,
    h1: { x: 270, y: 278, width: 900, height: 176 },
    copy: { x: 270, y: 470, width: 900, height: 27 },
    button: { x: 660, y: 545, width: 120, height: 43 },
  });
  assert.equal(
    await page.locator('.desktop-nav .nav-link.active').textContent(),
    'Recruitment',
    'Recruitment must be the active navigation link on its page',
  );
  const recruitHeroReference = await sharp(
    'assets/assets recruitment page/hero section/Recruitment-Hero-Revisi-1x.png',
  )
    .resize(1440, 866)
    .removeAlpha()
    .raw()
    .toBuffer();
  const recruitHeroActual = await sharp(
    'artifacts/recruitment-hero-desktop.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(recruitHeroReference.length, recruitHeroActual.length);
  const recruitHeroDiff = Buffer.alloc(recruitHeroActual.length);
  const recruitHeroOverlay = Buffer.alloc(recruitHeroActual.length);
  let recruitHeroTotal = 0;
  for (let i = 0; i < recruitHeroActual.length; i++) {
    const delta = Math.abs(recruitHeroActual[i] - recruitHeroReference[i]);
    recruitHeroTotal += delta;
    recruitHeroDiff[i] = Math.min(255, delta * 4);
    recruitHeroOverlay[i] = Math.round(
      (recruitHeroActual[i] + recruitHeroReference[i]) / 2,
    );
  }
  const recruitHeroRaw = { width: 1440, height: 866, channels: 3 };
  await sharp(recruitHeroDiff, { raw: recruitHeroRaw })
    .png()
    .toFile('artifacts/recruitment-hero-diff.png');
  await sharp(recruitHeroOverlay, { raw: recruitHeroRaw })
    .png()
    .toFile('artifacts/recruitment-hero-overlay.png');
  const recruitSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const recruitResponsive = [];
  for (const width of recruitSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Recruitment horizontal overflow at ${width}px`,
    );
    recruitResponsive.push(dimensions);
    const recruitHeroIssues = await page
      .locator('.recruitment-hero')
      .evaluate((section) =>
        [...section.querySelectorAll('h1, p, button')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const textBox = range.getBoundingClientRect();
            return (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              textBox.left < box.left - 1 ||
              textBox.right > box.right + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      recruitHeroIssues,
      [],
      `Recruitment hero text clipped at ${width}px`,
    );
  }
  // Recruitment page — Who Should Join (reuses the homepage HoDS card rail).
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.evaluate(() => scrollTo(0, 0));
  await setNavbarHidden(true);
  const whoShouldJoinGeometry = await page
    .locator('.who-should-join')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        heading: relative('h2'),
        copy: relative('header p'),
        cards: [...section.querySelectorAll('.domain-card')]
          .slice(0, 4)
          .map((card) => {
            const box = card.getBoundingClientRect();
            return {
              x: box.x - rect.x,
              y: box.y - rect.y,
              width: box.width,
              height: box.height,
            };
          }),
      };
    });
  assert.deepEqual(whoShouldJoinGeometry, {
    width: 1440,
    height: 789,
    top: 866,
    heading: { x: 80, y: 80, width: 1280, height: 68 },
    copy: { x: 80, y: 172, width: 1280, height: 27 },
    cards: [80, 517, 954, 1391].map((x) => ({
      x,
      y: 273,
      width: 405,
      height: 436,
    })),
  });
  await page.locator('.who-should-join').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await page
    .locator('.who-should-join')
    .screenshot({ path: 'artifacts/who-should-join-desktop.png' });
  const whoShouldJoinReference = await sharp(
    'assets/assets recruitment page/who sould join section/Recruitment-WhoShouldJoin-Revisi-1x.png',
  )
    .resize(1440, 789)
    .removeAlpha()
    .raw()
    .toBuffer();
  const whoShouldJoinActual = await sharp(
    'artifacts/who-should-join-desktop.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(whoShouldJoinReference.length, whoShouldJoinActual.length);
  const whoShouldJoinDiff = Buffer.alloc(whoShouldJoinActual.length);
  const whoShouldJoinOverlay = Buffer.alloc(whoShouldJoinActual.length);
  let whoShouldJoinTotal = 0;
  for (let i = 0; i < whoShouldJoinActual.length; i++) {
    const delta = Math.abs(whoShouldJoinActual[i] - whoShouldJoinReference[i]);
    whoShouldJoinTotal += delta;
    whoShouldJoinDiff[i] = Math.min(255, delta * 4);
    whoShouldJoinOverlay[i] = Math.round(
      (whoShouldJoinActual[i] + whoShouldJoinReference[i]) / 2,
    );
  }
  const whoShouldJoinRaw = { width: 1440, height: 789, channels: 3 };
  await sharp(whoShouldJoinDiff, { raw: whoShouldJoinRaw })
    .png()
    .toFile('artifacts/who-should-join-diff.png');
  await sharp(whoShouldJoinOverlay, { raw: whoShouldJoinRaw })
    .png()
    .toFile('artifacts/who-should-join-overlay.png');
  const whoShouldJoinSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const whoShouldJoinResponsive = [];
  for (const width of whoShouldJoinSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Who Should Join horizontal overflow at ${width}px`,
    );
    whoShouldJoinResponsive.push(dimensions);
    const whoShouldJoinIssues = await page
      .locator('.who-should-join')
      .evaluate((section) =>
        [...section.querySelectorAll('h2, header p')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(element);
            const textBox = range.getBoundingClientRect();
            return (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              textBox.left < box.left - 1 ||
              textBox.right > box.right + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      whoShouldJoinIssues,
      [],
      `Who Should Join text clipped at ${width}px`,
    );
  }
  // The Who Should Join cards open the HoDS detail pages, tagged so their back
  // link returns to the recruitment page. The recruitment role detail pages
  // (/recruitment/roles/{id}) are still built and verified below.
  const baseUrl = process.env.PREVIEW_URL || 'http://localhost:4321';
  const rolePages = [
    {
      id: 'data',
      reference: 'Detile Roles - DATA INTELLIGENCE.png',
      cardY: 135,
      backY: 80,
      contactY: 909,
    },
    {
      id: 'core',
      reference: 'Detile Roles - DATA INTELLIGENCE-1.png',
      cardY: 135,
      backY: 80,
      contactY: 869,
    },
    {
      id: 'language',
      reference: 'Detile Roles - LANGUANGE & REASONING.png',
      cardY: 163,
      backY: 80,
      contactY: 937,
    },
    {
      id: 'vision',
      reference: 'Detile Roles - VISION & MULTIMODEL.png',
      cardY: 163,
      backY: 80,
      contactY: 937,
    },
    {
      id: 'product',
      reference: 'Detile Roles - PRODUCT & SOFTWARE.png',
      cardY: 163,
      backY: 80,
      contactY: 1018,
    },
    {
      id: 'growth',
      reference: 'Detile Roles - GROWTH & COMMUNITY.png',
      cardY: 163,
      backY: 80,
      contactY: 978,
    },
  ];
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  const roleHrefs = await page
    .locator('.who-should-join .domain-card')
    .evaluateAll((cards) => cards.map((card) => card.getAttribute('href')));
  assert.deepEqual(
    roleHrefs,
    rolePages.map((role) => `/hods/${role.id}?from=recruitment`),
    'Who Should Join cards must link to the HoDS detail pages with a recruitment origin',
  );
  const backLink = (locator) =>
    locator.evaluate((anchor) => ({
      href: anchor.getAttribute('href'),
      label: anchor.querySelector('span')?.textContent?.trim(),
    }));
  await page.goto(`${baseUrl}/hods/data?from=recruitment`, {
    waitUntil: 'networkidle',
  });
  assert.deepEqual(
    await backLink(page.locator('.hods-detail .back')),
    { href: '/recruitment#who-should-join', label: 'Back to Who Should Join' },
    'HoDS back link returns to recruitment when opened from there',
  );
  await page.goto(`${baseUrl}/hods/data`, { waitUntil: 'networkidle' });
  assert.deepEqual(
    await backLink(page.locator('.hods-detail .back')),
    { href: '/#domains', label: 'Back to HoDS' },
    'HoDS back link defaults to the homepage',
  );
  for (const domain of rolePages) {
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.goto(`${baseUrl}/hods/${domain.id}`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map(async (image) => {
          image.loading = 'eager';
          await image.decode().catch(() => {});
        }),
      );
    });
    const hodsGeometry = await page
      .locator('.hods-detail')
      .evaluate((section) => {
        const rect = section.getBoundingClientRect();
        const relative = (selector) => {
          const box = section.querySelector(selector)?.getBoundingClientRect();
          return box
            ? {
                x: box.x - rect.x,
                y: box.y - rect.y,
                width: box.width,
                height: box.height,
              }
            : null;
        };
        return {
          width: rect.width,
          height: rect.height,
          back: relative('.back'),
          card: relative('.role-card'),
          tabs: relative('.tabs'),
        };
      });
    assert.equal(hodsGeometry.width, 1440, `HoDS ${domain.id} width`);
    assert.equal(hodsGeometry.height, 1280, `HoDS ${domain.id} height`);
    assert.deepEqual(
      {
        x: hodsGeometry.card.x,
        y: hodsGeometry.card.y,
        width: hodsGeometry.card.width,
        height: hodsGeometry.card.height,
      },
      { x: 80, y: 163, width: 1280, height: 279 },
      `HoDS ${domain.id} card box`,
    );
    assert.equal(hodsGeometry.back.x, 80, `HoDS ${domain.id} back link x`);
    assert.equal(hodsGeometry.back.y, 80, `HoDS ${domain.id} back link y`);
    assert.equal(hodsGeometry.tabs.x, 80, `HoDS ${domain.id} tabs x`);
    assert.equal(hodsGeometry.tabs.y, 498, `HoDS ${domain.id} tabs y`);
    await page
      .locator('.hods-detail')
      .screenshot({ path: `artifacts/hods-detail-${domain.id}.png` });
  }
  const roleReport = {};
  const roleSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  for (const role of rolePages) {
    await page.setViewportSize({ width: 1440, height: 1400 });
    await page.goto(`${baseUrl}/recruitment/roles/${role.id}`, {
      waitUntil: 'networkidle',
    });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images].map(async (image) => {
          image.loading = 'eager';
          await image.decode().catch(() => {});
        }),
      );
    });
    await page.evaluate(() => scrollTo(0, 0));
    const roleGeometry = await page
      .locator('.role-detail')
      .evaluate((section) => {
        const rect = section.getBoundingClientRect();
        const relative = (selector) => {
          const box = section.querySelector(selector).getBoundingClientRect();
          return {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
          };
        };
        return {
          width: rect.width,
          height: rect.height,
          back: relative('.back'),
          card: relative('.role-card'),
          apply: relative('.apply'),
          contact: relative('.contact'),
        };
      });
    assert.equal(roleGeometry.width, 1440, `Role ${role.id} width`);
    assert.equal(roleGeometry.height, 1280, `Role ${role.id} height`);
    assert.deepEqual(
      {
        x: roleGeometry.card.x,
        y: roleGeometry.card.y,
        width: roleGeometry.card.width,
        height: roleGeometry.card.height,
      },
      { x: 80, y: role.cardY, width: 1280, height: 279 },
      `Role ${role.id} card box`,
    );
    assert.equal(roleGeometry.back.y, role.backY, `Role ${role.id} back link`);
    assert.ok(
      Math.abs(roleGeometry.contact.y - role.contactY) < 1.5,
      `Role ${role.id} contact box`,
    );
    assert.ok(
      Math.abs(roleGeometry.apply.y - (role.cardY + 58)) < 1.5,
      `Role ${role.id} apply button`,
    );
    await page
      .locator('.role-detail')
      .screenshot({ path: `artifacts/recruitment-role-${role.id}.png` });
    const roleReference = await sharp(
      `assets/assets recruitment page/who sould join section/detail role/${role.reference}`,
    )
      .resize(1440, 1280)
      .removeAlpha()
      .raw()
      .toBuffer();
    const roleActual = await sharp(`artifacts/recruitment-role-${role.id}.png`)
      .removeAlpha()
      .raw()
      .toBuffer();
    assert.equal(
      roleReference.length,
      roleActual.length,
      `Role ${role.id} size`,
    );
    let roleTotal = 0;
    const roleDiff = Buffer.alloc(roleActual.length);
    const roleOverlay = Buffer.alloc(roleActual.length);
    for (let i = 0; i < roleActual.length; i++) {
      const delta = Math.abs(roleActual[i] - roleReference[i]);
      roleTotal += delta;
      roleDiff[i] = Math.min(255, delta * 4);
      roleOverlay[i] = Math.round((roleActual[i] + roleReference[i]) / 2);
    }
    const roleRaw = { width: 1440, height: 1280, channels: 3 };
    await sharp(roleDiff, { raw: roleRaw })
      .png()
      .toFile(`artifacts/recruitment-role-${role.id}-diff.png`);
    await sharp(roleOverlay, { raw: roleRaw })
      .png()
      .toFile(`artifacts/recruitment-role-${role.id}-overlay.png`);
    const roleResponsive = [];
    for (const width of roleSizes) {
      await page.setViewportSize({ width, height: 900 });
      await page.evaluate(() => scrollTo(0, 0));
      const dimensions = await page.evaluate(() => ({
        viewport: innerWidth,
        content: document.documentElement.scrollWidth,
      }));
      assert.ok(
        dimensions.content <= dimensions.viewport,
        `Role ${role.id} horizontal overflow at ${width}px`,
      );
      roleResponsive.push(dimensions);
      const roleIssues = await page
        .locator('.role-detail')
        .evaluate((section) =>
          [
            ...section.querySelectorAll(
              'h1, h2, p, .chip-label, .deadline span, .bullet-text, .contact-person span',
            ),
          ]
            .filter(
              (element) =>
                element.getBoundingClientRect().left < -1 ||
                element.getBoundingClientRect().right > innerWidth + 1 ||
                element.scrollWidth > element.clientWidth + 1,
            )
            .map((element) => element.textContent),
        );
      assert.deepEqual(
        roleIssues,
        [],
        `Role ${role.id} text clipped at ${width}px`,
      );
    }
    roleReport[role.id] = {
      geometry: roleGeometry,
      meanAbsoluteChannelDifference: roleTotal / roleActual.length,
      responsive: roleResponsive,
    };
  }
  // Recruitment page — What You Will Do (header + 1312x625 collage).
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const whatYouWillDoGeometry = await page
    .locator('.what-you-will-do')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        heading: relative('h2'),
        body: relative('.wyd-body'),
        content: relative('.content'),
        labels: [...section.querySelectorAll('.label')].map((label) => {
          const box = label.getBoundingClientRect();
          return {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
          };
        }),
        card1: relative('.card-1'),
        card2: relative('.card-2'),
        connector: relative('.connector'),
      };
    });
  assert.deepEqual(whatYouWillDoGeometry, {
    width: 1440,
    height: 903,
    top: 1655,
    heading: { x: 80, y: 80, width: 1280, height: 67 },
    body: { x: 64, y: 218, width: 1312, height: 625 },
    content: { x: 158, y: 348, width: 1125, height: 409 },
    labels: [
      { x: 158, y: 348, width: 462, height: 31 },
      { x: 158, y: 395, width: 461, height: 31 },
      { x: 380, y: 450, width: 462, height: 31 },
      { x: 380, y: 497, width: 462, height: 31 },
      { x: 600, y: 552, width: 462, height: 31 },
      { x: 600, y: 599, width: 462, height: 31 },
      { x: 821, y: 654, width: 462, height: 31 },
      { x: 821, y: 701, width: 462, height: 31 },
    ],
    card1: { x: 983, y: 218, width: 356, height: 430 },
    card2: { x: 129, y: 434, width: 295.375, height: 361.765625 },
    connector: { x: 64, y: 313, width: 1312, height: 531 },
  });
  await page.locator('.what-you-will-do').scrollIntoViewIfNeeded();
  await page
    .locator('.what-you-will-do')
    .screenshot({ path: 'artifacts/what-you-will-do-desktop.png' });
  const whatYouWillDoReference = await sharp(
    'assets/assets recruitment page/what you will do/Recruitment-WhatYouWillDo-Revisi-1x.png',
  )
    .resize(1440, 903)
    .removeAlpha()
    .raw()
    .toBuffer();
  const whatYouWillDoActual = await sharp(
    'artifacts/what-you-will-do-desktop.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(whatYouWillDoReference.length, whatYouWillDoActual.length);
  let whatYouWillDoTotal = 0;
  const whatYouWillDoDiff = Buffer.alloc(whatYouWillDoActual.length);
  const whatYouWillDoOverlay = Buffer.alloc(whatYouWillDoActual.length);
  for (let i = 0; i < whatYouWillDoActual.length; i++) {
    const delta = Math.abs(whatYouWillDoActual[i] - whatYouWillDoReference[i]);
    whatYouWillDoTotal += delta;
    whatYouWillDoDiff[i] = Math.min(255, delta * 4);
    whatYouWillDoOverlay[i] = Math.round(
      (whatYouWillDoActual[i] + whatYouWillDoReference[i]) / 2,
    );
  }
  const whatYouWillDoRaw = { width: 1440, height: 903, channels: 3 };
  await sharp(whatYouWillDoDiff, { raw: whatYouWillDoRaw })
    .png()
    .toFile('artifacts/what-you-will-do-diff.png');
  await sharp(whatYouWillDoOverlay, { raw: whatYouWillDoRaw })
    .png()
    .toFile('artifacts/what-you-will-do-overlay.png');
  const whatYouWillDoSizes = [320, 390, 768, 1024, 1320, 1440, 1680, 1920];
  const whatYouWillDoResponsive = [];
  for (const width of whatYouWillDoSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `What You Will Do horizontal overflow at ${width}px`,
    );
    whatYouWillDoResponsive.push(dimensions);
    const whatYouWillDoIssues = await page
      .locator('.what-you-will-do')
      .evaluate((section) =>
        [...section.querySelectorAll('h2, p, .label-text')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              element.scrollWidth > element.clientWidth + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      whatYouWillDoIssues,
      [],
      `What You Will Do text clipped at ${width}px`,
    );
  }
  // Recruitment page — Available Roles (six rows linking to the role pages).
  await page.setViewportSize({ width: 1440, height: 910 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const availableRolesGeometry = await page
    .locator('.available-roles')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        heading: relative('h2'),
        copy: relative('header p'),
        list: relative('.role-list'),
        rows: [...section.querySelectorAll('.role-row')].map((row) => {
          const box = row.getBoundingClientRect();
          return {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
          };
        }),
      };
    });
  assert.deepEqual(availableRolesGeometry, {
    width: 1440,
    height: 843.375,
    top: 2558,
    heading: { x: 80, y: 80, width: 1280, height: 67 },
    copy: { x: 80, y: 168, width: 1280, height: 27 },
    list: { x: 80, y: 253, width: 1280, height: 510.375 },
    rows: [253, 528.1875].flatMap((y) =>
      [80, 513.328125, 946.65625].map((x, col) => ({
        x,
        y,
        width: col === 2 ? 413.34375 : 413.328125,
        height: col === 2 ? 235.1875 : 235.171875,
      })),
    ),
  });
  assert.deepEqual(
    await page
      .locator('.available-roles .role-row')
      .evaluateAll((rows) => rows.map((row) => row.getAttribute('href'))),
    ['data', 'core', 'language', 'vision', 'product', 'growth'].map(
      (id) => `/recruitment/roles/${id}`,
    ),
    'Available Roles rows must link to the role detail pages',
  );
  const roleDividerScale = () =>
    page
      .locator('.available-roles .role-divider')
      .evaluateAll((dividers) =>
        dividers.map(
          (divider) => getComputedStyle(divider, '::after').transform,
        ),
      );
  assert.deepEqual(
    await roleDividerScale(),
    Array(6).fill('matrix(0, 0, 0, 1, 0, 0)'),
    'All Available Roles dividers must be hidden at rest',
  );
  for (const index of [0, 3]) {
    await page.locator('.available-roles .role-row').nth(index).hover();
    assert.equal(
      (await roleDividerScale())[index],
      'matrix(1, 0, 0, 1, 0, 0)',
      `Available Roles row ${index + 1} must show its divider on hover`,
    );
  }
  await page.mouse.move(0, 0);
  await page.locator('.available-roles').scrollIntoViewIfNeeded();
  await page
    .locator('.available-roles')
    .screenshot({ path: 'artifacts/available-roles-desktop.png' });
  // The 26 Sep 2026 redesign (Figma 1184:1475 / 1218:1385, ref
  // assets/assets recruitment page/available roles/Card Role *.png) drives the
  // card; its text is rebuilt in HTML/CSS with the site fonts, so this checks
  // the new geometry and containment rather than a pixel diff.
  const availableRolesSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const availableRolesResponsive = [];
  for (const width of availableRolesSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Available Roles horizontal overflow at ${width}px`,
    );
    availableRolesResponsive.push(dimensions);
    const availableRolesIssues = await page
      .locator('.available-roles')
      .evaluate((section) =>
        [
          ...section.querySelectorAll(
            'h2, p, .role-name, .role-summary, .role-link',
          ),
        ]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              element.scrollWidth > element.clientWidth + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      availableRolesIssues,
      [],
      `Available Roles text clipped at ${width}px`,
    );
    const availableRolesOverflow = await page
      .locator('.available-roles .role-card')
      .evaluateAll((cards) =>
        cards
          .filter((card) => card.scrollHeight > card.clientHeight + 1)
          .map((card) => card.querySelector('.role-name')?.textContent),
      );
    assert.deepEqual(
      availableRolesOverflow,
      [],
      `Available Roles card content overflows at ${width}px`,
    );
  }
  // Use a consistent desktop viewport: hero height now follows viewport height.
  // Recruitment page — Selection Timeline (header row + six phase rows).
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const selectionTimelineGeometry = await page
    .locator('.selection-timeline')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        heading: relative('h2'),
        head: relative('.tl-head'),
        body: relative('.tl-body'),
        rows: [...section.querySelectorAll('.tl-row')].map((row) => {
          const box = row.getBoundingClientRect();
          return { x: box.x - rect.x, y: box.y - rect.y, height: box.height };
        }),
      };
    });
  assert.deepEqual(selectionTimelineGeometry, {
    width: 1440,
    height: 812.203125,
    top: 3401.375,
    heading: { x: 80, y: 80, width: 1280, height: 67.203125 },
    head: { x: 80, y: 203.203125, width: 1280, height: 78 },
    body: { x: 80, y: 281.203125, width: 1280, height: 451 },
    rows: [
      299.203125, 374.203125, 449.203125, 524.203125, 599.203125, 674.203125,
    ].map((y) => ({
      x: 112,
      y,
      height: 39,
    })),
  });
  await page.locator('.selection-timeline').scrollIntoViewIfNeeded();
  await page
    .locator('.selection-timeline')
    .screenshot({ path: 'artifacts/selection-timeline-desktop.png' });
  const selectionTimelineReference = await sharp(
    'assets/assets recruitment page/selection timeline/Recruitment-SelectionTimeline-Revisi-1x.png',
  )
    .resize(1440, 812)
    .flatten({ background: '#050507' })
    .removeAlpha()
    .raw()
    .toBuffer();
  const selectionTimelineActual = await sharp(
    'artifacts/selection-timeline-desktop.png',
  )
    // Fractional section origins round screenshot bounds outward by one pixel.
    .extract({ left: 0, top: 0, width: 1440, height: 812 })
    .flatten({ background: '#050507' })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(
    selectionTimelineReference.length,
    selectionTimelineActual.length,
  );
  let selectionTimelineTotal = 0;
  const selectionTimelineDiff = Buffer.alloc(selectionTimelineActual.length);
  const selectionTimelineOverlay = Buffer.alloc(selectionTimelineActual.length);
  for (let i = 0; i < selectionTimelineActual.length; i++) {
    const delta = Math.abs(
      selectionTimelineActual[i] - selectionTimelineReference[i],
    );
    selectionTimelineTotal += delta;
    selectionTimelineDiff[i] = Math.min(255, delta * 4);
    selectionTimelineOverlay[i] = Math.round(
      (selectionTimelineActual[i] + selectionTimelineReference[i]) / 2,
    );
  }
  const selectionTimelineRaw = { width: 1440, height: 812, channels: 3 };
  await sharp(selectionTimelineDiff, { raw: selectionTimelineRaw })
    .png()
    .toFile('artifacts/selection-timeline-diff.png');
  await sharp(selectionTimelineOverlay, { raw: selectionTimelineRaw })
    .png()
    .toFile('artifacts/selection-timeline-overlay.png');
  const selectionTimelineSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const selectionTimelineResponsive = [];
  for (const width of selectionTimelineSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Selection Timeline horizontal overflow at ${width}px`,
    );
    selectionTimelineResponsive.push(dimensions);
    const selectionTimelineIssues = await page
      .locator('.selection-timeline')
      .evaluate((section) =>
        [...section.querySelectorAll('h2, .phase, .date-col')]
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return (
              box.left < -1 ||
              box.right > innerWidth + 1 ||
              element.scrollWidth > element.clientWidth + 1
            );
          })
          .map((element) => element.textContent),
      );
    assert.deepEqual(
      selectionTimelineIssues,
      [],
      `Selection Timeline text clipped at ${width}px`,
    );
  }
  // Recruitment page — FAQ (heading + six closed accordion items).
  await page.setViewportSize({ width: 1440, height: 983 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await document.fonts.load('700 56px "Bluu Next"');
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const faqGeometry = await page.locator('.faq').evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const relative = (selector) => {
      const box = section.querySelector(selector).getBoundingClientRect();
      return {
        x: box.x - rect.x,
        y: box.y - rect.y,
        width: box.width,
        height: box.height,
      };
    };
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top + scrollY,
      heading: relative('h2'),
      list: relative('.faq-list'),
      items: [...section.querySelectorAll('.faq-item')].map((item) => {
        const box = item.getBoundingClientRect();
        return { y: box.y - rect.y, height: box.height };
      }),
    };
  });
  assert.deepEqual(faqGeometry, {
    width: 1440,
    height: 983.203125,
    top: 4213.578125,
    heading: { x: 80, y: 80, width: 1280, height: 67.203125 },
    list: { x: 80, y: 203.203125, width: 1280, height: 700 },
    items: [
      { y: 203.203125, height: 77 },
      { y: 312.203125, height: 77 },
      { y: 421.203125, height: 77 },
      { y: 530.203125, height: 77 },
      { y: 639.203125, height: 116 },
      { y: 787.203125, height: 116 },
    ],
  });
  await page.locator('.faq').scrollIntoViewIfNeeded();
  await page.locator('.faq').screenshot({ path: 'artifacts/faq-desktop.png' });
  const faqReference = await sharp(
    'assets/assets recruitment page/faq section/Recruitment-Faq-Revisi-1x.png',
  )
    .resize(1440, 983)
    .removeAlpha()
    .raw()
    .toBuffer();
  const faqActual = await sharp('artifacts/faq-desktop.png')
    // Fractional section origins round screenshot bounds outward by one pixel.
    .extract({ left: 0, top: 0, width: 1440, height: 983 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(faqReference.length, faqActual.length);
  let faqTotal = 0;
  const faqDiff = Buffer.alloc(faqActual.length);
  const faqOverlay = Buffer.alloc(faqActual.length);
  for (let i = 0; i < faqActual.length; i++) {
    const delta = Math.abs(faqActual[i] - faqReference[i]);
    faqTotal += delta;
    faqDiff[i] = Math.min(255, delta * 4);
    faqOverlay[i] = Math.round((faqActual[i] + faqReference[i]) / 2);
  }
  const faqRaw = { width: 1440, height: 983, channels: 3 };
  await sharp(faqDiff, { raw: faqRaw }).png().toFile('artifacts/faq-diff.png');
  await sharp(faqOverlay, { raw: faqRaw })
    .png()
    .toFile('artifacts/faq-overlay.png');
  const faqSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const faqResponsive = [];
  for (const width of faqSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `FAQ horizontal overflow at ${width}px`,
    );
    faqResponsive.push(dimensions);
    const faqIssues = await page.locator('.faq').evaluate((section) =>
      [...section.querySelectorAll('h2, .faq-q, .faq-a')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < -1 ||
            box.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent),
    );
    assert.deepEqual(faqIssues, [], `FAQ text clipped at ${width}px`);
  }
  // Recruitment page — Snippets (heading + hero photo + five thumbnails).
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const snippetsGeometry = await page
    .locator('.snippets')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      const relative = (selector) => {
        const box = section.querySelector(selector).getBoundingClientRect();
        return {
          x: box.x - rect.x,
          y: box.y - rect.y,
          width: box.width,
          height: box.height,
        };
      };
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        heading: relative('h2'),
        gallery: relative('.gallery'),
        hero: relative('.gallery-hero'),
        thumbs: [...section.querySelectorAll('.thumb')].map((thumb) => {
          const box = thumb.getBoundingClientRect();
          return {
            x: box.x - rect.x,
            y: box.y - rect.y,
            width: box.width,
            height: box.height,
          };
        }),
      };
    });
  assert.deepEqual(snippetsGeometry, {
    width: 1440,
    height: 897.203125,
    top: 5196.78125,
    heading: { x: 80, y: 40, width: 1280, height: 67.203125 },
    gallery: { x: 80, y: 163.203125, width: 1280, height: 694 },
    hero: { x: 80, y: 163.203125, width: 1280, height: 556 },
    thumbs: [80, 338.5, 597, 855.5, 1114].map((x) => ({
      x,
      y: 754.203125,
      width: 246,
      height: 103,
    })),
  });
  await page.locator('.snippets').scrollIntoViewIfNeeded();
  await page
    .locator('.snippets')
    .screenshot({ path: 'artifacts/snippets-desktop.png' });
  const snippetsReference = await sharp(
    'assets/assets recruitment page/snippets section/Recruitment-Snippets-Revisi-1x.png',
  )
    .resize(1440, 897)
    .removeAlpha()
    .raw()
    .toBuffer();
  const snippetsActual = await sharp('artifacts/snippets-desktop.png')
    // Fractional section origins round screenshot bounds outward by one pixel.
    .extract({ left: 0, top: 0, width: 1440, height: 897 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(snippetsReference.length, snippetsActual.length);
  let snippetsTotal = 0;
  const snippetsDiff = Buffer.alloc(snippetsActual.length);
  const snippetsOverlay = Buffer.alloc(snippetsActual.length);
  for (let i = 0; i < snippetsActual.length; i++) {
    const delta = Math.abs(snippetsActual[i] - snippetsReference[i]);
    snippetsTotal += delta;
    snippetsDiff[i] = Math.min(255, delta * 4);
    snippetsOverlay[i] = Math.round(
      (snippetsActual[i] + snippetsReference[i]) / 2,
    );
  }
  const snippetsRaw = { width: 1440, height: 897, channels: 3 };
  await sharp(snippetsDiff, { raw: snippetsRaw })
    .png()
    .toFile('artifacts/snippets-diff.png');
  await sharp(snippetsOverlay, { raw: snippetsRaw })
    .png()
    .toFile('artifacts/snippets-overlay.png');
  const snippetsSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const snippetsResponsive = [];
  for (const width of snippetsSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `Snippets horizontal overflow at ${width}px`,
    );
    snippetsResponsive.push(dimensions);
    const snippetsIssues = await page.locator('.snippets').evaluate((section) =>
      [...section.querySelectorAll('h2')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < -1 ||
            box.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent),
    );
    assert.deepEqual(snippetsIssues, [], `Snippets text clipped at ${width}px`);
  }
  // Recruitment page — CTA (panel with heading, copy, button and glow).
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  await page.evaluate(() => scrollTo(0, 0));
  const ctaGeometry = await page.locator('.cta').evaluate((section) => {
    const rect = section.getBoundingClientRect();
    const relative = (selector) => {
      const box = section.querySelector(selector).getBoundingClientRect();
      return {
        x: box.x - rect.x,
        y: box.y - rect.y,
        width: box.width,
        height: box.height,
      };
    };
    return {
      width: rect.width,
      height: rect.height,
      top: rect.top + scrollY,
      panel: relative('.cta-panel'),
      heading: relative('h2'),
      copy: relative('p'),
      actions: relative('.cta-actions'),
      glow: relative('.glow-frame'),
    };
  });
  assert.deepEqual(
    {
      width: ctaGeometry.width,
      height: ctaGeometry.height,
      top: ctaGeometry.top,
      panel: ctaGeometry.panel,
      actions: ctaGeometry.actions,
      glow: ctaGeometry.glow,
    },
    {
      width: 1440,
      height: 520,
      top: 6093.984375,
      panel: { x: 80, y: 80, width: 1280, height: 360 },
      actions: { x: 619.546875, y: 332.09375, width: 200.890625, height: 43 },
      glow: { x: 349.828125, y: 351, width: 1000.328125, height: 271.5 },
    },
  );
  assert.ok(
    Math.abs(ctaGeometry.heading.y - 145) < 1.5 &&
      Math.abs(ctaGeometry.copy.x - 427) < 1.5 &&
      Math.abs(ctaGeometry.copy.y - 236) < 1.5,
    'CTA heading and copy must match the Figma reference',
  );
  await page.locator('.cta').scrollIntoViewIfNeeded();
  await page.locator('.cta').screenshot({ path: 'artifacts/cta-desktop.png' });
  const ctaReference = await sharp(
    'assets/assets recruitment page/cta section/Recruitment-Cta-Revisi-1x.png',
  )
    .resize(1440, 520)
    .removeAlpha()
    .raw()
    .toBuffer();
  const ctaActual = await sharp('artifacts/cta-desktop.png')
    // Fractional section origins round screenshot bounds outward by one pixel.
    .extract({ left: 0, top: 0, width: 1440, height: 520 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(ctaReference.length, ctaActual.length);
  let ctaTotal = 0;
  const ctaDiff = Buffer.alloc(ctaActual.length);
  const ctaOverlay = Buffer.alloc(ctaActual.length);
  for (let i = 0; i < ctaActual.length; i++) {
    const delta = Math.abs(ctaActual[i] - ctaReference[i]);
    ctaTotal += delta;
    ctaDiff[i] = Math.min(255, delta * 4);
    ctaOverlay[i] = Math.round((ctaActual[i] + ctaReference[i]) / 2);
  }
  const ctaRaw = { width: 1440, height: 520, channels: 3 };
  await sharp(ctaDiff, { raw: ctaRaw }).png().toFile('artifacts/cta-diff.png');
  await sharp(ctaOverlay, { raw: ctaRaw })
    .png()
    .toFile('artifacts/cta-overlay.png');
  const ctaSizes = [320, 390, 768, 1024, 1440, 1680, 1920];
  const ctaResponsive = [];
  for (const width of ctaSizes) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const dimensions = await page.evaluate(() => ({
      viewport: innerWidth,
      content: document.documentElement.scrollWidth,
    }));
    assert.ok(
      dimensions.content <= dimensions.viewport,
      `CTA horizontal overflow at ${width}px`,
    );
    ctaResponsive.push(dimensions);
    const ctaIssues = await page.locator('.cta').evaluate((section) =>
      [...section.querySelectorAll('h2, p')]
        .filter((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left < -1 ||
            box.right > innerWidth + 1 ||
            element.scrollWidth > element.clientWidth + 1
          );
        })
        .map((element) => element.textContent),
    );
    assert.deepEqual(ctaIssues, [], `CTA text clipped at ${width}px`);
  }
  // Recruitment page — shared footer (same component as the homepage).
  await page.setViewportSize({ width: 1440, height: 903 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map(async (image) => {
        image.loading = 'eager';
        await image.decode().catch(() => {});
      }),
    );
  });
  await setNavbarHidden(true);
  const recruitFooterGeometry = await page
    .locator('.footer')
    .evaluate((footer) => {
      const rect = footer.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
      };
    });
  assert.deepEqual(recruitFooterGeometry, {
    width: 1440,
    height: 556,
    top: 6613.984375,
  });
  await page.locator('.footer').scrollIntoViewIfNeeded();
  await page
    .locator('.footer')
    .screenshot({ path: 'artifacts/recruitment-footer-desktop.png' });
  const recruitFooterReference = await sharp(
    'assets/assets recruitment page/footer/Recruitment-Footer-Revisi-1x.png',
  )
    .resize(1440, 556)
    .removeAlpha()
    .raw()
    .toBuffer();
  const recruitFooterActual = await sharp(
    'artifacts/recruitment-footer-desktop.png',
  )
    // Fractional section origins round screenshot bounds outward by one pixel.
    .extract({ left: 0, top: 0, width: 1440, height: 556 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(recruitFooterReference.length, recruitFooterActual.length);
  let recruitFooterTotal = 0;
  for (let i = 0; i < recruitFooterActual.length; i++) {
    recruitFooterTotal += Math.abs(
      recruitFooterActual[i] - recruitFooterReference[i],
    );
  }
  assert.deepEqual(errors, []);
  await page.goto(`${baseUrl}/about`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await setNavbarHidden(true);
  const ecosystemGeometry = await page.evaluate(() => {
    const section = document.querySelector('.ecosystem');
    const sectionBox = section.getBoundingClientRect();
    const relativeBox = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round((box.x - sectionBox.x) * 10) / 10,
        y: Math.round((box.y - sectionBox.y) * 10) / 10,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
      };
    };
    return {
      section: { width: sectionBox.width, height: sectionBox.height },
      header: relativeBox('.ecosystem-header'),
      pipeline: relativeBox('.pipeline-container'),
      baseline: relativeBox('.baseline'),
      lineBottoms: [...document.querySelectorAll('.ecosystem .step-line')].map(
        (line) =>
          Math.round(line.getBoundingClientRect().bottom - sectionBox.y),
      ),
    };
  });
  assert.deepEqual(ecosystemGeometry, {
    section: { width: 1440, height: 880 },
    header: { x: 254.5, y: 80, width: 931, height: 178 },
    pipeline: { x: 80, y: 374, width: 1280, height: 426 },
    baseline: { x: 80, y: 799, width: 1280, height: 2 },
    lineBottoms: [782, 782, 782, 782, 782],
  });
  await page.locator('.ecosystem').screenshot({
    path: 'artifacts/about-ecosystem-desktop.png',
  });
  await page.setViewportSize({ width: 1920, height: 900 });
  const aboutWide = await page.evaluate(() => {
    const ecosystem = document.querySelector('.ecosystem');
    const philosophy = document.querySelector('.philosophy.is-about');
    const lines = [...ecosystem.querySelectorAll('.step-line')];
    return {
      bodyZoom: Number(getComputedStyle(document.body).zoom),
      canvasZoom: Number(
        getComputedStyle(ecosystem.querySelector('.canvas')).zoom,
      ),
      sectionWidth: ecosystem.getBoundingClientRect().width,
      philosophyWidth: philosophy.getBoundingClientRect().width,
      canvasWidth: ecosystem.querySelector('.canvas').getBoundingClientRect()
        .width,
      clientWidth: document.documentElement.clientWidth,
      lineEnds: lines.map((line) =>
        Math.round(line.getBoundingClientRect().bottom),
      ),
      philosophyCanvasZoom: Number(
        getComputedStyle(philosophy.querySelector('.canvas')).zoom,
      ),
      philosophyCanvasWidth: philosophy
        .querySelector('.canvas')
        .getBoundingClientRect().width,
      philosophyIllustration: (() => {
        const box = philosophy
          .querySelector('.illustration')
          .getBoundingClientRect();
        return { left: Math.round(box.left), right: Math.round(box.right) };
      })(),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.equal(aboutWide.bodyZoom, 1);
  assert.ok(Math.abs(aboutWide.canvasZoom - 1920 / 1440) < 0.01);
  assert.equal(aboutWide.sectionWidth, aboutWide.clientWidth);
  assert.equal(aboutWide.philosophyWidth, aboutWide.clientWidth);
  assert.equal(aboutWide.canvasWidth, aboutWide.clientWidth);
  assert.equal(new Set(aboutWide.lineEnds).size, 1);
  // The Philosophy background now lives on its zoomed canvas, so the artwork
  // and glow scale together instead of the artwork drifting off the left edge.
  assert.ok(Math.abs(aboutWide.philosophyCanvasZoom - 1920 / 1440) < 0.01);
  assert.equal(aboutWide.philosophyCanvasWidth, aboutWide.clientWidth);
  assert.ok(Math.abs(aboutWide.philosophyIllustration.left) < 1);
  assert.ok(
    aboutWide.philosophyIllustration.right <= aboutWide.clientWidth + 1,
  );
  assert.ok(aboutWide.overflow <= 1);
  // Past 2880px the zoom must stay uncapped, otherwise a gutter appears at the
  // edges (the original bug: the canvas froze at 2x and showed #050507 bars).
  await page.setViewportSize({ width: 3200, height: 900 });
  const aboutUltraWide = await page.evaluate(() => {
    const box = document
      .querySelector('.philosophy.is-about .canvas')
      .getBoundingClientRect();
    return {
      left: Math.round(box.left),
      right: Math.round(box.right),
      clientWidth: document.documentElement.clientWidth,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.equal(aboutUltraWide.left, 0);
  assert.equal(aboutUltraWide.right, aboutUltraWide.clientWidth);
  assert.ok(aboutUltraWide.overflow <= 1);
  for (const [width, expectedDisplay] of [
    [1050, 'grid'],
    [1051, 'flex'],
    [1284, 'flex'],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    const pipelineFit = await page.evaluate(() => {
      const section = document
        .querySelector('.ecosystem')
        .getBoundingClientRect();
      const row = document.querySelector('.ecosystem .steps-row');
      const box = row.getBoundingClientRect();
      const lines = [...document.querySelectorAll('.ecosystem .step-line')];
      const baseline = document.querySelector('.ecosystem .baseline');
      return {
        display: getComputedStyle(row).display,
        contained: box.left >= section.left && box.right <= section.right,
        lineEnds: lines.map((line) =>
          Math.round(line.getBoundingClientRect().bottom - section.top),
        ),
        baselineY: Math.round(
          baseline.getBoundingClientRect().top - section.top,
        ),
        overflow: document.documentElement.scrollWidth - innerWidth,
      };
    });
    assert.equal(pipelineFit.display, expectedDisplay);
    assert.equal(pipelineFit.contained, true);
    if (expectedDisplay === 'flex') {
      assert.deepEqual(pipelineFit.lineEnds, [782, 782, 782, 782, 782]);
      assert.equal(pipelineFit.baselineY, 799);
    }
    assert.ok(pipelineFit.overflow <= 1);
  }

  // Partners page — section heights and card geometry vs the reference PNGs.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${baseUrl}/partners`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const partnersGeometry = await page.evaluate(() => {
    const box = (selector) => {
      const rect = document.querySelector(selector).getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    };
    const card = document.querySelector('.why-card').getBoundingClientRect();
    const partner = document
      .querySelector('.partner-card')
      .getBoundingClientRect();
    return {
      hero: box('.partners-hero'),
      our: box('.our-partners'),
      why: box('.why-partners'),
      whyCard: {
        width: Math.round(card.width * 10) / 10,
        height: Math.round(card.height * 10) / 10,
      },
      partnerCard: {
        width: Math.round(partner.width),
        height: Math.round(partner.height),
      },
      groupPills: document.querySelectorAll('.group-pill').length,
      partnerCards: document.querySelectorAll('.partner-card').length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(partnersGeometry, {
    hero: { width: 1440, height: 665 },
    our: { width: 1440, height: 1075 },
    why: { width: 1440, height: 670 },
    whyCard: { width: 309.5, height: 189 },
    partnerCard: { width: 240, height: 116 },
    groupPills: 3,
    partnerCards: 20,
    overflow: 0,
  });

  // Hall of Frames hero — geometry + diff vs the Figma node 1439:4507 export.
  await page.setViewportSize({ width: 1440, height: 1400 });
  await page.goto(`${baseUrl}/hall-of-frames`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 80px "Bluu Next"'));
  await setNavbarHidden(true);
  const hofHeroGeometry = await page.evaluate(() => {
    const box = (selector) => {
      const el = document.querySelector(selector);
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
      };
    };
    return {
      hero: box('.hof-hero'),
      content: box('.hero-content'),
      title: box('#hof-hero-title'),
      subtitle: box('.hof-hero p'),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(hofHeroGeometry, {
    hero: {
      x: 0,
      y: 0,
      width: 1440,
      height: 903,
      fontSize: '16px',
      lineHeight: 'normal',
    },
    content: {
      x: 320,
      y: 310.5,
      width: 800,
      height: 282,
      fontSize: '16px',
      lineHeight: 'normal',
    },
    title: {
      x: 320,
      y: 310.5,
      width: 800,
      height: 204,
      fontSize: '80px',
      lineHeight: '102px',
    },
    subtitle: {
      x: 341,
      y: 538.5,
      width: 758,
      height: 54,
      fontSize: '18px',
      lineHeight: '27px',
    },
    overflow: 0,
  });
  await page
    .locator('.hof-hero')
    .screenshot({ path: 'artifacts/hof-hero-desktop.png' });
  const hofHeroReference = await sharp(
    'assets/hall of frames/hero/HoF-Hero-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const hofHeroActual = await sharp('artifacts/hof-hero-desktop.png')
    .extract({ left: 0, top: 0, width: 1440, height: 903 })
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(hofHeroReference.length, hofHeroActual.length);
  let hofHeroTotal = 0;
  for (let i = 0; i < hofHeroActual.length; i++) {
    hofHeroTotal += Math.abs(hofHeroActual[i] - hofHeroReference[i]);
  }

  // Hall of Frames — Featured Sorcerers (node 1439:4512) geometry + diff.
  await page.goto(`${baseUrl}/hall-of-frames`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 56px "Bluu Next"'));
  await setNavbarHidden(true);
  const hofFeaturedGeometry = await page.evaluate(() => {
    const section = document.querySelector('.hof-featured');
    const sb = section.getBoundingClientRect();
    const rel = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round((box.x - sb.x) * 10) / 10,
        y: Math.round((box.y - sb.y) * 10) / 10,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
      };
    };
    return {
      section: { width: Math.round(sb.width), height: Math.round(sb.height) },
      header: rel('.featured-header'),
      grid: rel('.featured-grid'),
      card1: rel('.featured-card'),
      card2: rel('.featured-card:nth-child(2)'),
      frame: rel('.featured-card .card-frame'),
      cards: document.querySelectorAll('.featured-card').length,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(hofFeaturedGeometry, {
    section: { width: 1440, height: 1241 },
    header: { x: 336, y: 80, width: 768, height: 135 },
    grid: { x: 80, y: 295, width: 1280, height: 866 },
    card1: { x: 80, y: 295, width: 302, height: 400 },
    card2: { x: 406, y: 295, width: 302, height: 400 },
    frame: { x: 83, y: 308, width: 295, height: 277 },
    cards: 8,
    overflow: 0,
  });
  await page
    .locator('.hof-featured')
    .screenshot({ path: 'artifacts/hof-featured-desktop.png' });
  const hofFeaturedReference = await sharp(
    'assets/hall of frames/featured/HoF-Featured-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const hofFeaturedActual = await sharp('artifacts/hof-featured-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(hofFeaturedReference.length, hofFeaturedActual.length);
  let hofFeaturedTotal = 0;
  for (let i = 0; i < hofFeaturedActual.length; i++) {
    hofFeaturedTotal += Math.abs(
      hofFeaturedActual[i] - hofFeaturedReference[i],
    );
  }

  // Hall of Frames — Project highlights (node 1439:4655) geometry + diff.
  await page.goto(`${baseUrl}/hall-of-frames`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 56px "Bluu Next"'));
  await setNavbarHidden(true);
  await page.locator('.hof-projects').scrollIntoViewIfNeeded();
  // Images are lazy/decoded late; wait so the screenshot is not mid-load.
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.hof-projects img')].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  await page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('.hof-projects img')].map((img) =>
        img.decode().catch(() => {}),
      ),
    ),
  );
  const hofProjectsGeometry = await page.evaluate(() => {
    const section = document.querySelector('.hof-projects');
    const sb = section.getBoundingClientRect();
    const rel = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round((box.x - sb.x) * 10) / 10,
        y: Math.round((box.y - sb.y) * 10) / 10,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
      };
    };
    return {
      section: { width: Math.round(sb.width), height: Math.round(sb.height) },
      header: rel('.projects-header'),
      stage: rel('.projects-stage'),
      center: rel('.hof-project-card.is-center'),
      left: rel('.hof-project-card.is-left'),
      right: rel('.hof-project-card.is-right'),
      dots: rel('.projects-dots'),
      arrowPrev: rel('.project-arrow.prev'),
      arrowNext: rel('.project-arrow.next'),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(hofProjectsGeometry, {
    section: { width: 1440, height: 1181 },
    header: { x: 318.5, y: 80, width: 803, height: 179 },
    stage: { x: 80, y: 339, width: 1280, height: 730 },
    center: { x: 254, y: 339, width: 933, height: 730 },
    left: { x: 80, y: 399, width: 800, height: 625.9 },
    right: { x: 560, y: 406, width: 800, height: 625.9 },
    dots: { x: 695.5, y: 1088, width: 49, height: 13 },
    arrowPrev: { x: 80, y: 678, width: 52, height: 52 },
    arrowNext: { x: 1308, y: 678, width: 52, height: 52 },
    overflow: 0,
  });
  await page
    .locator('.hof-projects')
    .screenshot({ path: 'artifacts/hof-projects-desktop.png' });
  const hofProjectsReference = await sharp(
    'assets/hall of frames/projects/HoF-Projects-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const hofProjectsActual = await sharp('artifacts/hof-projects-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(hofProjectsReference.length, hofProjectsActual.length);
  let hofProjectsTotal = 0;
  for (let i = 0; i < hofProjectsActual.length; i++) {
    hofProjectsTotal += Math.abs(
      hofProjectsActual[i] - hofProjectsReference[i],
    );
  }

  // Hall of Frames — Community Milestone (node 1439:4699) geometry + diff.
  await page.goto(`${baseUrl}/hall-of-frames`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 56px "Bluu Next"'));
  await setNavbarHidden(true);
  await page.locator('.hof-milestone').scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.hof-milestone img')].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  await page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('.hof-milestone img')].map((img) =>
        img.decode().catch(() => {}),
      ),
    ),
  );
  const hofMilestoneGeometry = await page.evaluate(() => {
    const section = document.querySelector('.hof-milestone');
    const sb = section.getBoundingClientRect();
    const rel = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round((box.x - sb.x) * 10) / 10,
        y: Math.round((box.y - sb.y) * 10) / 10,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
      };
    };
    return {
      section: { width: Math.round(sb.width), height: Math.round(sb.height) },
      header: rel('.milestone-header'),
      list: rel('.milestone-list'),
      rail: rel('.milestone-rail'),
      rows: [...document.querySelectorAll('.milestone-row')].map((row) => {
        const box = row.getBoundingClientRect();
        return {
          y: Math.round((box.y - sb.y) * 10) / 10,
          height: Math.round(box.height * 10) / 10,
        };
      }),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(hofMilestoneGeometry, {
    section: { width: 1440, height: 987 },
    header: { x: 80, y: 100, width: 1108, height: 162 },
    list: { x: 80, y: 342, width: 1280, height: 545 },
    rail: { x: 210, y: 363, width: 14, height: 414 },
    rows: [
      { y: 342, height: 143 },
      { y: 543, height: 143 },
      { y: 744, height: 143 },
    ],
    overflow: 0,
  });
  await page
    .locator('.hof-milestone')
    .screenshot({ path: 'artifacts/hof-milestone-desktop.png' });
  const hofMilestoneReference = await sharp(
    'assets/hall of frames/milestone/HoF-Milestone-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const hofMilestoneActual = await sharp('artifacts/hof-milestone-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(hofMilestoneReference.length, hofMilestoneActual.length);
  let hofMilestoneTotal = 0;
  for (let i = 0; i < hofMilestoneActual.length; i++) {
    hofMilestoneTotal += Math.abs(
      hofMilestoneActual[i] - hofMilestoneReference[i],
    );
  }

  // Contact hero (node 1445:5066) geometry + diff.
  await page.goto(`${baseUrl}/contact`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => document.fonts.load('700 56px "Bluu Next"'));
  await setNavbarHidden(true);
  await page.locator('.contact-hero').scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    [...document.querySelectorAll('.contact-hero img')].every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );
  await page.evaluate(() =>
    Promise.all(
      [...document.querySelectorAll('.contact-hero img')].map((img) =>
        img.decode().catch(() => {}),
      ),
    ),
  );
  const contactHeroGeometry = await page.evaluate(() => {
    const section = document.querySelector('.contact-hero');
    const sb = section.getBoundingClientRect();
    const rel = (selector) => {
      const box = document.querySelector(selector).getBoundingClientRect();
      return {
        x: Math.round((box.x - sb.x) * 10) / 10,
        y: Math.round((box.y - sb.y) * 10) / 10,
        width: Math.round(box.width * 10) / 10,
        height: Math.round(box.height * 10) / 10,
      };
    };
    return {
      section: { width: Math.round(sb.width), height: Math.round(sb.height) },
      art: rel('.hero-art'),
      row: rel('.hero-row'),
      left: rel('.hero-left'),
      form: rel('.contact-form'),
      cards: [...document.querySelectorAll('.info-card')].map((card) => {
        const box = card.getBoundingClientRect();
        return {
          y: Math.round((box.y - sb.y) * 10) / 10,
          height: Math.round(box.height * 10) / 10,
        };
      }),
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
  assert.deepEqual(contactHeroGeometry, {
    section: { width: 1440, height: 954 },
    art: { x: -131, y: -92, width: 801, height: 600 },
    row: { x: 80, y: 240, width: 1280, height: 594 },
    left: { x: 80, y: 240, width: 587, height: 594 },
    form: { x: 699, y: 240, width: 661, height: 594 },
    cards: [
      { y: 564, height: 74 },
      { y: 662, height: 74 },
      { y: 760, height: 74 },
    ],
    overflow: 0,
  });
  await page
    .locator('.contact-hero')
    .screenshot({ path: 'artifacts/contact-hero-desktop.png' });
  const contactHeroReference = await sharp(
    'assets/contact/hero/Contact-Hero-1x.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  const contactHeroActual = await sharp('artifacts/contact-hero-desktop.png')
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(contactHeroReference.length, contactHeroActual.length);
  let contactHeroTotal = 0;
  for (let i = 0; i < contactHeroActual.length; i++) {
    contactHeroTotal += Math.abs(
      contactHeroActual[i] - contactHeroReference[i],
    );
  }
  assert.deepEqual(errors, []);

  const report = {
    aboutEcosystem: { geometry: ecosystemGeometry, wide: aboutWide },
    partners: { geometry: partnersGeometry },
    hofHero: {
      geometry: hofHeroGeometry,
      meanAbsoluteChannelDifference: hofHeroTotal / hofHeroActual.length,
    },
    hofFeatured: {
      geometry: hofFeaturedGeometry,
      meanAbsoluteChannelDifference:
        hofFeaturedTotal / hofFeaturedActual.length,
    },
    hofProjects: {
      geometry: hofProjectsGeometry,
      meanAbsoluteChannelDifference:
        hofProjectsTotal / hofProjectsActual.length,
    },
    hofMilestone: {
      geometry: hofMilestoneGeometry,
      meanAbsoluteChannelDifference:
        hofMilestoneTotal / hofMilestoneActual.length,
    },
    contactHero: {
      geometry: contactHeroGeometry,
      meanAbsoluteChannelDifference:
        contactHeroTotal / contactHeroActual.length,
    },
    recruitment: {
      geometry: recruitmentGeometry,
      meanAbsoluteChannelDifference:
        recruitmentTotal / recruitmentActual.length,
    },
    projects: {
      geometry: projectsGeometry,
      meanAbsoluteChannelDifference: projectsTotal / projectsActual.length,
    },
    domains: {
      geometry: domainGeometry,
      meanAbsoluteChannelDifference: domainTotal / domainActual.length,
    },
    whatWeDo: {
      geometry: pillarsGeometry,
      meanAbsoluteChannelDifference: pillarsTotal / pillarsActual.length,
    },
    footer: {
      geometry: footerGeometry,
      meanAbsoluteChannelDifference: footerTotal / footerActual.length,
    },
    desktop,
    responsive,
    meanAbsoluteChannelDifference: total / actual.length,
    philosophy: {
      geometry: philosophyGeometry,
      meanAbsoluteChannelDifference: philosophyTotal / philosophyActual.length,
    },
    recruitmentPage: {
      geometry: recruitHeroGeometry,
      meanAbsoluteChannelDifference:
        recruitHeroTotal / recruitHeroActual.length,
      responsive: recruitResponsive,
    },
    recruitmentWhoShouldJoin: {
      geometry: whoShouldJoinGeometry,
      meanAbsoluteChannelDifference:
        whoShouldJoinTotal / whoShouldJoinActual.length,
      responsive: whoShouldJoinResponsive,
    },
    recruitmentRoles: roleReport,
    recruitmentWhatYouWillDo: {
      geometry: whatYouWillDoGeometry,
      meanAbsoluteChannelDifference:
        whatYouWillDoTotal / whatYouWillDoActual.length,
      responsive: whatYouWillDoResponsive,
    },
    recruitmentAvailableRoles: {
      geometry: availableRolesGeometry,
      meanAbsoluteChannelDifference: null,
      responsive: availableRolesResponsive,
    },
    recruitmentSelectionTimeline: {
      geometry: selectionTimelineGeometry,
      meanAbsoluteChannelDifference:
        selectionTimelineTotal / selectionTimelineActual.length,
      responsive: selectionTimelineResponsive,
    },
    recruitmentFaq: {
      geometry: faqGeometry,
      meanAbsoluteChannelDifference: faqTotal / faqActual.length,
      responsive: faqResponsive,
    },
    recruitmentSnippets: {
      geometry: snippetsGeometry,
      meanAbsoluteChannelDifference: snippetsTotal / snippetsActual.length,
      responsive: snippetsResponsive,
    },
    recruitmentCta: {
      geometry: ctaGeometry,
      meanAbsoluteChannelDifference: ctaTotal / ctaActual.length,
      responsive: ctaResponsive,
    },
    recruitmentFooter: {
      geometry: recruitFooterGeometry,
      meanAbsoluteChannelDifference:
        recruitFooterTotal / recruitFooterActual.length,
    },
    browserErrors: errors,
  };
  await writeFile(
    'artifacts/verification.json',
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
