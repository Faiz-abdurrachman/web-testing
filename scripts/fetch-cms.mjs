import { syncCmsSnapshot } from './cms-client.mjs';

const snapshotUrl = new URL('../src/data/cms-snapshot.json', import.meta.url);

try {
  const mode = await syncCmsSnapshot({ snapshotPath: snapshotUrl });
  console.log(`[cms] Snapshot validated (${mode} mode).`);
} catch (error) {
  console.error(`[cms] ${error.message}`);
  process.exitCode = 1;
}
