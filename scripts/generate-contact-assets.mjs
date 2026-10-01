// Generates the served Contact page artwork from the raw sources in
// `assets/contact/`. Run with `npm run assets:contact`.
//
// Source of truth (see docs/assets.md §Contact):
// - Contact-Hero-Art-2x.png → the node 1445:5067 render (the purple swirl that
//   sits behind "Get in touch").
// - Contact-Icon-{Email,Whatsapp,Office}-2x.png → the three info-card icons.
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
  webp(path.join(src, 'Contact-Hero-Art-2x.png'), 'hero-art.webp', 801, 88),
  webp(path.join(src, 'Contact-Hero-Art-2x.png'), 'hero-art-2x.webp', 1602, 86),
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
