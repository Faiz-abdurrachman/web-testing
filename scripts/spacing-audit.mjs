// Strict 8-point grid audit (see docs/pixel-precision-sop.md §"Hukum Spacing").
//
// Fails when a component introduces a padding / gap / margin value that is not a
// multiple of 8 and is not in the documented exception table below. Fluid values
// (calc/clamp/var/env), container-query units (cqw/cqh), percentages, negatives
// and auto are layout techniques, not magic numbers, so they are out of scope.
//
// Run for one component (`node scripts/spacing-audit.mjs src/components/Foo.astro`)
// or for every component (default). Wire it into the per-section gate list.

import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const targets = process.argv.slice(2);
const files = targets.length
  ? targets
  : readdirSync('src/components')
      .filter((file) => file.endsWith('.astro'))
      .map((file) => path.join('src/components', file));

// Non-8 values proven from Figma frames / PNG measurements or from a documented
// rendering technique. Every entry must have a justification in
// docs/pixel-precision-sop.md §"Hukum Spacing" (exception table).
const EXCEPTIONS = new Map([
  [1, 'glass/ring 1px mask; hairline offsets'],
  [2, 'card title/value stack; glow offsets'],
  [3, 'calibrated glow/edge offset'],
  [4, 'eyebrow→heading and heading line gap (Figma)'],
  [5, 'inner hairline gap'],
  [6, 'dot / tag micro gap'],
  [7, 'team card info gap (Figma)'],
  [10, 'pill/tag padding (Figma)'],
  [12, 'pill/badge padding, card header gap (Figma)'],
  [13, 'card tag gap (Figma)'],
  [14, 'back-link gap, card title→copy (Figma)'],
  [15, 'card title baseline offset (calibrated)'],
  [18, 'info-card icon→text, FAQ item padding (Figma)'],
  [19, 'FAQ header/body padding (Figma)'],
  [20, 'card padding (Figma)'],
  [21, 'Available Roles header→subtitle (Figma 115 header)'],
  [22, 'card padding, FAQ gap (Figma)'],
  [23, 'bullets dot→text (Figma 798:2746)'],
  [26, 'scroll-container hover room / calibration'],
  [28, 'footer section gap (Figma)'],
  [30, 'Philosophy grid column gap (Figma)'],
  [31, 'Visi-Misi list bar height (Figma)'],
  [35, 'Snippets thumbnail gap (Figma)'],
  [36, 'pipeline connector gap (Figma)'],
  [42, 'header→grid (Partners), panel gap (Figma)'],
  [44, 'footer/why/HoF group gap (Figma)'],
  [52, 'Our Ecosystem pipeline gap (Figma)'],
  [58, 'section / timeline gap (Figma)'],
  [60, 'footer section gap (Figma)'],
  [66, 'rail→section margin / HoF row-gap (Figma)'],
  [74, 'header frame→rail (Figma)'],
  [82, 'Our Project header→carousel (Figma)'],
  [92, 'Philosophy grid row gap (Figma)'],
  [100, 'section header gap (Figma)'],
  [116, 'Our Ecosystem gap (Figma)'],
  [146, 'HoF Milestone year→content (Figma)'],
  [150, 'Philosophy mobile top padding (Figma)'],
  [242, 'Partners hero top padding (Figma)'],
  [855, 'Philosophy desktop content x (Figma)'],
]);

const DECL =
  /(?:^|[;{\s])(padding|padding-top|padding-right|padding-bottom|padding-left|gap|row-gap|column-gap|margin|margin-top|margin-right|margin-bottom|margin-left|margin-inline|margin-block)\s*:\s*([^;{}]+);/g;
const DYNAMIC =
  /calc\(|clamp\(|var\(|env\(|cqw|cqh|cqi|cqb|%|max\(|min\(|auto|-/;

let violations = 0;
for (const file of files) {
  let source;
  try {
    source = readFileSync(file, 'utf8');
  } catch {
    continue;
  }
  const start = source.indexOf('<style>');
  if (start === -1) continue;
  const style = source.slice(start);
  const found = [];
  for (const match of style.matchAll(DECL)) {
    const value = match[2].trim();
    if (DYNAMIC.test(value)) continue;
    for (const token of value.match(/\d*\.?\d+/g) ?? []) {
      const number = Number(token);
      if (number === 0) continue;
      if (Number.isInteger(number) && number % 8 === 0) continue;
      if (!Number.isInteger(number)) continue; // calibrated sub-pixel offset
      if (EXCEPTIONS.has(number)) continue;
      found.push(`${match[1]}: ${value}`);
    }
  }
  if (found.length) {
    violations += found.length;
    console.error(`FAIL ${file}`);
    for (const item of found) console.error(`  ${item}`);
  }
}

if (violations) {
  console.error(
    `\nStrict 8-point audit FAILED — ${violations} undocumented non-8 spacing value(s).`,
  );
  console.error(
    'Fix to the nearest multiple of 8 or justify the measurement (Figma node / PNG bbox) and add it to the exception table in docs/pixel-precision-sop.md.',
  );
  process.exit(1);
}
console.log(
  `Strict 8-point audit PASS — ${files.length} component(s), every padding/gap/margin is a multiple of 8 or a documented exception.`,
);
