import sharp from 'sharp';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import assert from 'node:assert/strict';

const DIST = 'dist';

const walk = async (dir) => {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push(path);
  }
  return out;
};

const files = await walk(DIST);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
assert.ok(
  htmlFiles.length >= 14,
  `expected 14+ pages, found ${htmlFiles.length}`,
);

const metasOf = (html) =>
  [...html.matchAll(/<meta\s+([^>]+?)\/?>/g)].map((m) => {
    const attrs = {};
    for (const a of m[1].matchAll(/([a-zA-Z:-]+)="([^"]*)"/g))
      attrs[a[1]] = a[2];
    return attrs;
  });
const decode = (s) =>
  (s ?? '')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'");

const issues = [];
const titles = new Map();
let origin = null;

for (const file of htmlFiles) {
  const route = '/' + relative(DIST, file).replace(/index\.html$/, '');
  const html = await readFile(file, 'utf8');
  const metas = metasOf(html);
  const meta = (key, value) =>
    decode(metas.find((m) => m[key] === value)?.content ?? null);
  const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim());

  if (!title) issues.push(`${route}: missing <title>`);
  else if (titles.has(title))
    issues.push(`${route}: duplicate title (also ${titles.get(title)})`);
  else titles.set(title, route);

  const description = meta('name', 'description');
  if (!description) issues.push(`${route}: missing meta description`);
  else if (description.length < 50 || description.length > 200)
    issues.push(`${route}: description length ${description.length}`);

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical) issues.push(`${route}: missing canonical`);
  else if (!/^https:\/\//.test(canonical))
    issues.push(`${route}: canonical not absolute (${canonical})`);
  origin ??= new URL(canonical).origin;

  if (canonical && origin && !canonical.startsWith(origin))
    issues.push(`${route}: canonical wrong origin (${canonical})`);

  for (const key of [
    'og:type',
    'og:title',
    'og:description',
    'og:url',
    'og:image',
    'og:image:width',
    'og:image:height',
    'og:image:alt',
    'twitter:card',
    'twitter:title',
    'twitter:description',
    'twitter:image',
  ]) {
    if (!meta('property', key) && !meta('name', key))
      issues.push(`${route}: missing ${key}`);
  }
  const ogUrl = meta('property', 'og:url');
  if (ogUrl && canonical && ogUrl !== canonical)
    issues.push(`${route}: og:url (${ogUrl}) != canonical (${canonical})`);
  if (meta('name', 'twitter:card') !== 'summary_large_image')
    issues.push(`${route}: twitter:card should be summary_large_image`);
  if (meta('property', 'og:image:width') !== '1200')
    issues.push(`${route}: og:image:width != 1200`);
  if (meta('property', 'og:image:height') !== '630')
    issues.push(`${route}: og:image:height != 630`);

  const ld = [
    ...html.matchAll(
      /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
    ),
  ];
  if (!ld.length) issues.push(`${route}: missing JSON-LD`);
  for (const block of ld) {
    try {
      JSON.parse(block[1]);
    } catch {
      issues.push(`${route}: invalid JSON-LD`);
    }
  }
}

// OG image exists in dist and is 1200×630
const ogPath = join(DIST, 'og/og-default.jpg');
if (!existsSync(ogPath)) issues.push('dist/og/og-default.jpg missing');
else {
  const meta = await sharp(ogPath).metadata();
  if (meta.width !== 1200 || meta.height !== 630)
    issues.push(
      `og-default.jpg is ${meta.width}x${meta.height}, expected 1200x630`,
    );
  const size = (await stat(ogPath)).size;
  if (size > 1_000_000) issues.push(`og-default.jpg too large (${size} bytes)`);
}

// robots.txt + sitemap
const robotsPath = join(DIST, 'robots.txt');
if (!existsSync(robotsPath)) issues.push('dist/robots.txt missing');
else {
  const robots = await readFile(robotsPath, 'utf8');
  if (!/User-agent: \*/i.test(robots)) issues.push('robots.txt: no user-agent');
  if (!/Sitemap: https:\/\//.test(robots))
    issues.push('robots.txt: missing absolute Sitemap');
}

const sitemapIndex = join(DIST, 'sitemap-index.xml');
if (!existsSync(sitemapIndex)) issues.push('dist/sitemap-index.xml missing');
const sitemap0 = files.find((f) => /sitemap-\d+\.xml$/.test(f));
if (!sitemap0) issues.push('no sitemap-N.xml');
else {
  const xml = await readFile(sitemap0, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  if (locs.length !== 14)
    issues.push(`sitemap has ${locs.length} urls, expected 14`);
  for (const loc of locs) {
    if (!loc.startsWith(origin))
      issues.push(`sitemap url wrong origin: ${loc}`);
    const rel = loc.slice(origin.length).replace(/^\//, '');
    const target = join(DIST, rel, 'index.html');
    const targetDirect = join(DIST, rel || 'index.html');
    if (!existsSync(target) && !existsSync(targetDirect))
      issues.push(`sitemap url has no page: ${loc}`);
  }
}

if (issues.length) {
  console.log(`SEO AUDIT FAILED (${issues.length}):`);
  for (const i of issues) console.log('  - ' + i);
  process.exit(1);
}
console.log(
  `SEO AUDIT PASS — ${htmlFiles.length} pages, canonical origin ${origin}, robots + sitemap + OG image OK.`,
);
