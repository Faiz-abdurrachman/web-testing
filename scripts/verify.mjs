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
    const headingFonts = await document.fonts.load('80px Nasalization');
    return {
      nasalizationLoaded:
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
          '.desktop-menu',
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
    desktop.nasalizationLoaded,
    true,
    'Install the local Nasalization font or provide its licensed webfont before visual validation.',
  );
  await page
    .locator('.hero')
    .screenshot({ path: 'artifacts/hero-desktop.png' });
  await setNavbarHidden(true);
  const reference = await sharp(
    'assets/assets home page/hero section/Hero Section.png',
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
    await Promise.all([...document.images].map((image) => image.decode()));
  });
  await page
    .locator('.philosophy')
    .screenshot({ path: 'artifacts/philosophy-desktop.png' });
  const philosophyReference = await sharp(
    'assets/assets home page/ourphilosophy/Philosophy Section(1).png',
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
    heading: { x: 855, y: 190, width: 471, height: 204 },
    principles: { x: 855, y: 468, width: 471, height: 248 },
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
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        cards: [...section.querySelectorAll('.pillar')].map((card) => {
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
  assert.deepEqual(pillarsGeometry, {
    width: 1440,
    height: 844,
    top: 1740,
    cards: [
      { x: 160, y: 80, width: 311, height: 254 },
      { x: 971, y: 80, width: 309, height: 254 },
      { x: 160, y: 510, width: 309, height: 254 },
      { x: 970, y: 510, width: 310, height: 254 },
    ],
  });
  const pillarsReference = await sharp(
    'assets/assets home page/what we do/What We Do Section.png',
  )
    .resize(1440, 844)
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
  const pillarsRaw = { width: 1440, height: 844, channels: 3 };
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
    return {
      width: box.width,
      height: box.height,
      top: box.top + scrollY,
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
    height: 826,
    top: 2584,
    cards: Array.from({ length: 6 }, (_, i) => ({
      x: 80 + i * 434,
      y: 310,
      width: 394,
      height: 436,
    })),
  });
  const domainReference = await sharp(
    'assets/assets home page/hods/House of Data Sorcerers Section.png',
  )
    .resize(1440, 826)
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
  const domainRaw = { width: 1440, height: 826, channels: 3 };
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
  assert.equal(await rail.evaluate((element) => element.scrollLeft), 434);
  await page.keyboard.press('Home');
  await rail.evaluate((element) => element.blur());
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: 'artifacts/homepage-desktop.png',
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.locator('.projects').scrollIntoViewIfNeeded();
  await page
    .locator('.projects')
    .screenshot({ path: 'artifacts/projects-desktop.png' });
  const projectsGeometry = await page
    .locator('.projects')
    .evaluate((section) => {
      const box = section.getBoundingClientRect();
      return {
        width: box.width,
        height: box.height,
        top: box.top + scrollY,
        elements: Object.fromEntries(
          ['h2', '.project-card.is-active'].map((selector) => {
            const r = section.querySelector(selector).getBoundingClientRect();
            return [
              selector,
              {
                x: r.x - box.x,
                y: r.y - box.y,
                width: r.width,
                height: r.height,
              },
            ];
          }),
        ),
      };
    });
  assert.deepEqual(projectsGeometry, {
    width: 1440,
    height: 917,
    top: 3410,
    elements: {
      h2: { x: 80, y: 120, width: 751.296875, height: 68 },
      '.project-card.is-active': {
        x: 445.5,
        y: 270,
        width: 549,
        height: 567,
      },
    },
  });
  const projectsReference = await sharp(
    'assets/assets home page/our project/Our Project Section.png',
  )
    .resize(1440, 917)
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
  const projectsRaw = { width: 1440, height: 917, channels: 3 };
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
  await page
    .locator('.recruitment')
    .screenshot({ path: 'artifacts/recruitment-desktop.png' });
  const recruitmentGeometry = await page
    .locator('.recruitment')
    .evaluate((section) => {
      const rect = section.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top + scrollY,
        elements: Object.fromEntries(
          [
            '.recruitment-panel',
            'h2',
            '.recruitment-copy p',
            '.recruitment-actions',
          ].map((selector) => {
            const box = section.querySelector(selector).getBoundingClientRect();
            return [
              selector,
              {
                x: box.x - rect.x,
                y: box.y - rect.y,
                width: box.width,
                height: box.height,
              },
            ];
          }),
        ),
      };
    });
  assert.deepEqual(recruitmentGeometry, {
    width: 1440,
    height: 577,
    top: 4327,
    elements: {
      '.recruitment-panel': { x: 80, y: 80, width: 1280, height: 417 },
      h2: { x: 81, y: 193, width: 1278, height: 68 },
      '.recruitment-copy p': { x: 427, y: 281, width: 586, height: 48 },
      '.recruitment-actions': { x: 515, y: 373, width: 410, height: 51 },
    },
  });
  const recruitmentReference = await sharp(
    'assets/assets home page/cta/CTA Recruicment Section.png',
  )
    .resize(1440, 577)
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
  const recruitmentRaw = { width: 1440, height: 577, channels: 3 };
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
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
  });
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
    Math.abs(footerGeometry.divider.y - 463.69) < 1 &&
      Math.abs(footerGeometry.legal.y - 484.69) < 1,
    'Footer divider and legal bar must match the Figma reference',
  );
  const footerReference = await sharp(
    'assets/assets home page/footer/Footer.png',
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
      [...document.images].map((image) => image.decode().catch(() => {})),
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
    h1: { x: 270, y: 247.5, width: 900, height: 196 },
    copy: { x: 270, y: 477.5, width: 900, height: 27 },
    button: { x: 659.21875, y: 567.5, width: 121.546875, height: 51 },
  });
  assert.equal(
    await page.locator('.desktop-menu .nav-link.active').textContent(),
    'Recruitment',
    'Recruitment must be the active navigation link on its page',
  );
  const recruitHeroReference = await sharp(
    'assets/assets recruitment page/hero section/About Us Hero Section.png',
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
    cards: [80, 514, 948, 1382].map((x) => ({
      x,
      y: 273,
      width: 394,
      height: 436,
    })),
  });
  await page.locator('.who-should-join').scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
    );
  });
  await page
    .locator('.who-should-join')
    .screenshot({ path: 'artifacts/who-should-join-desktop.png' });
  const whoShouldJoinReference = await sharp(
    'assets/assets recruitment page/who sould join section/Who Should Join Section.png',
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
      cardY: 210.5,
      backY: 155.5,
      contactY: 990.5,
    },
    {
      id: 'core',
      reference: 'Detile Roles - DATA INTELLIGENCE-1.png',
      cardY: 135,
      backY: 80,
      contactY: 875,
    },
    {
      id: 'language',
      reference: 'Detile Roles - LANGUANGE & REASONING.png',
      cardY: 165,
      backY: 80,
      contactY: 945,
    },
    {
      id: 'vision',
      reference: 'Detile Roles - VISION & MULTIMODEL.png',
      cardY: 165,
      backY: 80,
      contactY: 945,
    },
    {
      id: 'product',
      reference: 'Detile Roles - PRODUCT & SOFTWARE.png',
      cardY: 165,
      backY: 80,
      contactY: 1026,
    },
    {
      id: 'growth',
      reference: 'Detile Roles - GROWTH & COMMUNITY.png',
      cardY: 165,
      backY: 80,
      contactY: 986,
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
    { href: '/recruitment#who-should-join', label: 'Back to Open Roles' },
    'HoDS back link returns to recruitment when opened from there',
  );
  await page.goto(`${baseUrl}/hods/data`, { waitUntil: 'networkidle' });
  assert.deepEqual(
    await backLink(page.locator('.hods-detail .back')),
    { href: '/#domains', label: 'Back to HoDS' },
    'HoDS back link defaults to the homepage',
  );
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
        [...document.images].map((image) => image.decode().catch(() => {})),
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
      [...document.images].map((image) => image.decode().catch(() => {})),
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
    heading: { x: 80, y: 80, width: 1280, height: 68 },
    body: { x: 64, y: 215, width: 1312, height: 625 },
    content: { x: 158, y: 345, width: 1125, height: 409 },
    labels: [
      [158, 462],
      [158, 461],
      [380, 462],
      [380, 462],
      [600, 462],
      [600, 462],
      [821, 462],
      [821, 462],
    ].map(([x, width], index) => ({
      x,
      y: 345 + index * 54,
      width,
      height: 31,
    })),
    card1: { x: 983, y: 215, width: 356, height: 430 },
    card2: { x: 129, y: 431, width: 295.375, height: 361.765625 },
    connector: { x: 64, y: 310, width: 1312, height: 531 },
  });
  await page.locator('.what-you-will-do').scrollIntoViewIfNeeded();
  await page
    .locator('.what-you-will-do')
    .screenshot({ path: 'artifacts/what-you-will-do-desktop.png' });
  const whatYouWillDoReference = await sharp(
    'assets/assets recruitment page/what you will do/What You Will Do Section.png',
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
      [...document.images].map((image) => image.decode().catch(() => {})),
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
    height: 910,
    top: 2558,
    heading: { x: 80, y: 80, width: 1280, height: 68 },
    copy: { x: 80, y: 168, width: 1280, height: 27 },
    list: { x: 80, y: 253, width: 1280, height: 577 },
    rows: [253, 353, 453, 553, 653, 753].map((y) => ({
      x: 80,
      y,
      width: 1280,
      height: 77,
    })),
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
  await page.locator('.available-roles').scrollIntoViewIfNeeded();
  await page
    .locator('.available-roles')
    .screenshot({ path: 'artifacts/available-roles-desktop.png' });
  const availableRolesReference = await sharp(
    'assets/assets recruitment page/available roles section/Available Roles Section.png',
  )
    .resize(1440, 910)
    .removeAlpha()
    .raw()
    .toBuffer();
  const availableRolesActual = await sharp(
    'artifacts/available-roles-desktop.png',
  )
    .removeAlpha()
    .raw()
    .toBuffer();
  assert.equal(availableRolesReference.length, availableRolesActual.length);
  let availableRolesTotal = 0;
  const availableRolesDiff = Buffer.alloc(availableRolesActual.length);
  const availableRolesOverlay = Buffer.alloc(availableRolesActual.length);
  for (let i = 0; i < availableRolesActual.length; i++) {
    const delta = Math.abs(
      availableRolesActual[i] - availableRolesReference[i],
    );
    availableRolesTotal += delta;
    availableRolesDiff[i] = Math.min(255, delta * 4);
    availableRolesOverlay[i] = Math.round(
      (availableRolesActual[i] + availableRolesReference[i]) / 2,
    );
  }
  const availableRolesRaw = { width: 1440, height: 910, channels: 3 };
  await sharp(availableRolesDiff, { raw: availableRolesRaw })
    .png()
    .toFile('artifacts/available-roles-diff.png');
  await sharp(availableRolesOverlay, { raw: availableRolesRaw })
    .png()
    .toFile('artifacts/available-roles-overlay.png');
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
        [...section.querySelectorAll('h2, p, .role-name')]
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
  }
  // Recruitment page — Selection Timeline (header row + six phase rows).
  await page.setViewportSize({ width: 1440, height: 815 });
  await page.goto(`${baseUrl}/recruitment`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {})),
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
    height: 815,
    top: 3468,
    heading: { x: 80, y: 80, width: 1280, height: 68 },
    head: { x: 80, y: 206, width: 1280, height: 78 },
    body: { x: 80, y: 284, width: 1280, height: 451 },
    rows: [302, 377, 452, 527, 602, 677].map((y) => ({
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
    'assets/assets recruitment page/selection timeline section/TIMELINE.png',
  )
    .resize(1440, 815)
    .removeAlpha()
    .raw()
    .toBuffer();
  const selectionTimelineActual = await sharp(
    'artifacts/selection-timeline-desktop.png',
  )
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
  const selectionTimelineRaw = { width: 1440, height: 815, channels: 3 };
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
  assert.deepEqual(errors, []);
  const report = {
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
      meanAbsoluteChannelDifference:
        availableRolesTotal / availableRolesActual.length,
      responsive: availableRolesResponsive,
    },
    recruitmentSelectionTimeline: {
      geometry: selectionTimelineGeometry,
      meanAbsoluteChannelDifference:
        selectionTimelineTotal / selectionTimelineActual.length,
      responsive: selectionTimelineResponsive,
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
