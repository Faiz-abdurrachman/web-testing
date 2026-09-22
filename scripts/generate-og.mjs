import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

const HERO = 'assets/assets home page/hero section/Gambar Hero Section.png';
const HEADLINE =
  'assets/assets home page/hero section/SORCERY IN DATA MAGIC IN AI.png';
const LOGO = 'public/images/logo.png';
const BG = '#050507';

await mkdir('public/og', { recursive: true });

// --- Open Graph card (1200 × 630) -----------------------------------------
const W = 1200;
const H = 630;

const overlay = Buffer.from(
  `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lr" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="${BG}" stop-opacity="0.94"/>
        <stop offset="0.55" stop-color="${BG}" stop-opacity="0.4"/>
        <stop offset="1" stop-color="${BG}" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="bt" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.4" stop-color="${BG}" stop-opacity="0"/>
        <stop offset="1" stop-color="${BG}" stop-opacity="0.9"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#lr)"/>
    <rect width="${W}" height="${H}" fill="url(#bt)"/>
  </svg>`,
);

const hero = await sharp(HERO)
  .resize(W, H, { fit: 'cover', position: 'center' })
  .toBuffer();

const logo = await sharp(LOGO).resize({ width: 68 }).toBuffer();

const headline = await sharp(HEADLINE).resize({ width: 820 }).toBuffer();

await sharp({ create: { width: W, height: H, channels: 3, background: BG } })
  .composite([
    { input: hero, top: 0, left: 0 },
    { input: overlay, top: 0, left: 0 },
    { input: logo, top: 54, left: 64 },
    { input: headline, top: 388, left: 64 },
  ])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('public/og/og-default.jpg');

// --- Favicons / touch icon ------------------------------------------------
const iconBuffer = async (size) => {
  const mark = await sharp(LOGO)
    .resize({
      width: Math.round(size * 0.72),
      height: Math.round(size * 0.72),
      fit: 'inside',
    })
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
};

const icons = {
  'public/favicon.png': 32,
  'public/apple-touch-icon.png': 180,
  'public/icon-192.png': 192,
  'public/icon-512.png': 512,
};
const buffers = {};
for (const [file, size] of Object.entries(icons)) {
  const buffer = await iconBuffer(size);
  buffers[file] = buffer;
  await writeFile(file, buffer);
}

// Minimal PNG-in-ICO container (browsers and Windows Vista+ accept it).
const icoPng = await iconBuffer(48);
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(48, 0);
entry.writeUInt8(48, 1);
entry.writeUInt8(0, 2);
entry.writeUInt8(0, 3);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(icoPng.length, 8);
entry.writeUInt32LE(22, 12);
await writeFile('public/favicon.ico', Buffer.concat([header, entry, icoPng]));

// --- Web app manifest ------------------------------------------------------
const manifest = {
  name: 'Data Sorcerers',
  short_name: 'Data Sorcerers',
  description:
    'An AI & Data Innovation Community where people learn, experiment, research, and build meaningful technology together.',
  start_url: '/',
  display: 'standalone',
  background_color: BG,
  theme_color: BG,
  icons: [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};
await writeFile(
  'public/site.webmanifest',
  JSON.stringify(manifest, null, 2) + '\n',
);

console.log(
  'Generated public/og/og-default.jpg, favicons and site.webmanifest',
);
