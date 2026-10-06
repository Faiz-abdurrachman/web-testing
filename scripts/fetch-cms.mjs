import { readFile } from 'node:fs/promises';
import { cmsSnapshotSchema } from '../src/data/cms-schema.mjs';

const snapshotUrl = new URL('../src/data/cms-snapshot.json', import.meta.url);

try {
  if (process.env.CMS_API_URL || process.env.CMS_API_TOKEN)
    throw new Error(
      'Remote CMS is not connected in B0. Remove CMS environment variables for local snapshot mode; configure the export in B1.',
    );

  const snapshot = JSON.parse(await readFile(snapshotUrl, 'utf8'));
  const result = cmsSnapshotSchema.safeParse(snapshot);
  if (!result.success) {
    // Print field paths only: CMS values and credentials must stay private.
    const paths = result.error.issues.map((issue) => issue.path.join('.'));
    throw new Error(`Invalid CMS snapshot fields: ${paths.join(', ')}`);
  }
  console.log('[cms] Committed snapshot validated (local mode).');
} catch (error) {
  console.error(
    `[cms] ${error instanceof SyntaxError ? 'Snapshot JSON is malformed.' : error.message}`,
  );
  process.exitCode = 1;
}
