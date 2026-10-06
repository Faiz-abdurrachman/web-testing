// Generates the served Contact page artwork from the raw sources in
// `assets/contact/`. Run with `npm run assets:contact`.
//
// Source of truth (see docs/assets.md §Contact):
// - Contact-Icon-{Email,Whatsapp,Office}-2x.png → the three info-card icons.
//   (The old swirl `Contact-Hero-Art-2x.png` is no longer served: fix-9 #9
//   replaced the hero with the full-bleed `assets/hero gambar/contact page.png`
//   baked by `npm run assets:heroes`.)
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const src = 'assets/contact/hero';
const out = 'public/images/contact';

await mkdir(out, { recursive: true });

const webp = (input, output, width, quality) =>
  sharp(input)
    .resize({ width })
    .webp({ quality, effort: 5 })
    .toFile(path.join(out, output));

await Promise.all([
  webp(path.join(src, 'Contact-Icon-Email-2x.png'), 'icon-email.webp', 61, 90),
  webp(
    path.join(src, 'Contact-Icon-Email-2x.png'),
    'icon-email-2x.webp',
    122,
    88,
  ),
  webp(
    path.join(src, 'Contact-Icon-Whatsapp-2x.png'),
    'icon-whatsapp.webp',
    61,
    90,
  ),
  webp(
    path.join(src, 'Contact-Icon-Whatsapp-2x.png'),
    'icon-whatsapp-2x.webp',
    122,
    88,
  ),
  webp(
    path.join(src, 'Contact-Icon-Office-2x.png'),
    'icon-office.webp',
    61,
    90,
  ),
  webp(
    path.join(src, 'Contact-Icon-Office-2x.png'),
    'icon-office-2x.webp',
    122,
    88,
  ),
]);

console.log(`Contact artwork written to ${out}/`);
