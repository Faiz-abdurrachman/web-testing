import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cmsSnapshotSchema } from '../src/data/cms-schema.mjs';

const root = new URL('../', import.meta.url);
const snapshot = cmsSnapshotSchema.parse(
  JSON.parse(
    await readFile(new URL('src/data/cms-snapshot.json', root), 'utf8'),
  ),
);
const source = await readFile(new URL('cms/gas/admin/server.js', root), 'utf8');
const output = new URL('artifacts/cms-admin/', root);
await mkdir(output, { recursive: true });
await writeFile(
  new URL('Code.gs', output),
  `${source}\nconst ADMIN_IMAGE_PRESETS = ${JSON.stringify([...new Set(snapshot.projects.map((project) => project.image))])};\n`,
);
for (const name of ['Index.html', 'appsscript.json'])
  await writeFile(
    new URL(name, output),
    await readFile(new URL(`cms/gas/admin/${name}`, root)),
  );
console.log(
  'Private admin files generated in artifacts/cms-admin/ (no secrets included).',
);
