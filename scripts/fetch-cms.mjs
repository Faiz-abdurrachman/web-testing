import { setDefaultResultOrder } from 'node:dns';
import { syncCmsSnapshot } from './cms-client.mjs';

// Prefer IPv4 for Google hosts; native Node 22 failed with the default DNS order.
setDefaultResultOrder('ipv4first');

const snapshotUrl = new URL('../src/data/cms-snapshot.json', import.meta.url);

try {
  const mode = await syncCmsSnapshot({ snapshotPath: snapshotUrl });
  console.log(`[cms] Snapshot validated (${mode} mode).`);
} catch (error) {
  console.error(`[cms] ${error.message}`);
  process.exitCode = 1;
}
