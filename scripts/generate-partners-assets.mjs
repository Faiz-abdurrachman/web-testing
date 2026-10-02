// Generates the served Partners page artwork from the raw sources in
// `assets/partners page/`. Run with `npm run assets:partners`.
//
// Sources of truth (see docs/assets.md §Partners):
// - assets/partners/hero/hero-fill-raw.png → the raw IMAGE fill of the new
//   Figma Hero node 1439:4788 (imageRef e79b1f65…) = "Let's Build Something"
//   backdrop, used verbatim (SOP §5). The old assets/partners page/ exports are
//   hints only.
// - Frame 2655.png               → the empty partner card (base + violet glow)
// - assets/partners/why-ds/icon-sprite-raw.png → the Why-DS icon sprite
//   (imageRef 36308539…), cropped per node imageTransform.
// - Logo_transparan (1) 4.png    → the placeholder partner logo
// - assets/partners/why-ds/why-glow-2x.png → the raw Why-DS card glow IMAGE-SVG
//   (node 1439:4949), used verbatim per SOP §5.
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = 'assets/partners page';
const out = 'public/images/partners';

const hero = 'assets/partners/hero/hero-fill-raw.png';
const whyGlow = 'assets/partners/why-ds/why-glow-2x.png';
const whyIconSprite = 'assets/partners/why-ds/icon-sprite-raw.png';
const card = path.join(src, 'Frame 2655.png');
const logo = path.join(src, 'Logo_transparan (1) 4.png');

// The four Why-DS icons are crops of one sprite (imageRef 36308539…). The
// imageTransform [[sx,0,tx],[0,sy,ty]] means extract(tx*W, ty*H, sx*W, sy*H)
// then resize to the 58×63 node (2× here for retina).
const iconSx = 0.21426671743392944;
const iconTy = 0.23692601919174194;
const iconSy = 0.4606482684612274;
const iconCrops = {
  'why-talent': 0.025507941842079163,
  'why-research': 0.2656344473361969,
  'why-innovation': 0.5020667314529419,
  'why-community': 0.7532760500907898,
};

await mkdir(out, { recursive: true });

const webp = (input, output, opts = {}) =>
  sharp(input)
    .webp({ quality: 88, effort: 5, ...opts })
    .toFile(path.join(out, output));

await Promise.all([
  // Hero backdrop: 1440×665 frame, so 1x/2x land exactly on the reference art.
  sharp(hero)
    .resize({ width: 1440 })
    .webp({ quality: 86, effort: 5 })
    .toFile(path.join(out, 'hero-bg.webp')),
  sharp(hero)
    .resize({ width: 2880 })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(out, 'hero-bg-2x.webp')),
  // Card 240×116 @3x keeps the glow smooth on retina; it is the reference art
  // (the Figma swoosh export did not reproduce the full gradient).
  sharp(card)
    .resize({ width: 720 })
    .webp({ quality: 90, effort: 5 })
    .toFile(path.join(out, 'partner-card-bg.webp')),
  // Why-DS card glow (IMAGE-SVG 1439:4949): 792×413 at 1x, 2x for retina.
  sharp(whyGlow)
    .resize({ width: 792 })
    .webp({ quality: 90, effort: 5 })
    .toFile(path.join(out, 'why-glow.webp')),
  sharp(whyGlow)
    .resize({ width: 1584 })
    .webp({ quality: 88, effort: 5 })
    .toFile(path.join(out, 'why-glow-2x.webp')),
  webp(logo, 'partner-logo.webp'),
  ...Object.entries(iconCrops).map(([name, tx]) => {
    const meta = sharp(whyIconSprite).metadata();
    return meta.then((m) =>
      sharp(whyIconSprite)
        .extract({
          left: Math.round(tx * m.width),
          top: Math.round(iconTy * m.height),
          width: Math.round(iconSx * m.width),
          height: Math.round(iconSy * m.height),
        })
        .resize(116, 126, { fit: 'fill' })
        .webp({ quality: 90, effort: 5 })
        .toFile(path.join(out, `${name}.webp`)),
    );
  }),
]);

console.log(`Partners artwork written to ${out}/`);
