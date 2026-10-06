import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cmsSnapshotSchema } from '../src/data/cms-schema.mjs';

const root = new URL('../', import.meta.url);
const snapshot = cmsSnapshotSchema.parse(
  JSON.parse(
    await readFile(new URL('src/data/cms-snapshot.json', root), 'utf8'),
  ),
);
const source = await readFile(new URL('cms/gas/export.js', root), 'utf8');
const media = await readFile(new URL('cms/gas/media.js', root), 'utf8');
const output = new URL('artifacts/cms-gas/', root);
await mkdir(output, { recursive: true });
await writeFile(
  new URL('Code.gs', output),
  `${source}\n${media}\n\nconst CMS_SEED = ${JSON.stringify(snapshot, null, 2)};\n`,
);
await writeFile(
  new URL('appsscript.json', output),
  await readFile(new URL('cms/gas/appsscript.json', root)),
);
console.log(
  'GAS installer generated in artifacts/cms-gas/ (no secrets included).',
);
