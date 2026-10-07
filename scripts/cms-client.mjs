import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { cmsSnapshotSchema } from '../src/data/cms-schema.mjs';
import { MEDIA_PATH, verifyProjectMedia } from '../server/cms-media.mjs';

async function supabaseFetch(supabaseUrl, supabaseKey, rpcName, fetchImpl) {
  const url = supabaseUrl.replace(/\/+$/, '') + '/rest/v1/rpc/' + rpcName;
  const response = await (fetchImpl || fetch)(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseKey,
      Authorization: 'Bearer ' + supabaseKey,
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) {
    throw new Error(
      'Supabase RPC ' + rpcName + ' failed: HTTP ' + response.status,
    );
  }
  return response.json();
}

export const CMS_MAX_BYTES = 1024 * 1024;
export const CMS_TIMEOUT_MS = 60000;

export function validateCmsSnapshot(value) {
  const result = cmsSnapshotSchema.safeParse(value);
  if (!result.success) {
    const paths = result.error.issues.map(
      (issue) => issue.path.join('.') || '<root>',
    );
    throw new Error(`Invalid CMS snapshot fields: ${paths.join(', ')}`);
  }
  return result.data;
}

function parseSnapshot(text) {
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('CMS snapshot JSON is malformed.');
  }
  return validateCmsSnapshot(value);
}

function googleUrl(value, exportEndpoint = false) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Invalid CMS endpoint URL.');
  }
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    !['script.google.com', 'script.googleusercontent.com'].includes(
      url.hostname,
    ) ||
    (exportEndpoint &&
      (url.hostname !== 'script.google.com' ||
        url.search ||
        !/^\/macros\/s\/[a-zA-Z0-9_-]+\/exec$/.test(url.pathname)))
  )
    throw new Error(
      'CMS endpoint must be a Google Apps Script HTTPS /exec URL.',
    );
  return url;
}

async function responseText(response) {
  const advertised = Number(response.headers.get('content-length'));
  if (advertised > CMS_MAX_BYTES)
    throw new Error('CMS export exceeds the size limit.');
  if (!response.body) throw new Error('CMS export response is empty.');
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > CMS_MAX_BYTES)
        throw new Error('CMS export exceeds the size limit.');
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function fetchCmsSnapshotOnce({
  apiUrl,
  apiToken,
  fetchImpl = fetch,
  timeoutMs = CMS_TIMEOUT_MS,
  action = 'export',
  image,
}) {
  let url = googleUrl(apiUrl, true);
  const endpointFingerprint = createHash('sha256')
    .update(url.href)
    .digest('hex')
    .slice(0, 12);
  const started = Date.now();
  url.searchParams.set('action', action);
  if (image) url.searchParams.set('image', image);
  url.searchParams.set('token', apiToken);
  // Request a fresh ContentService redirect on every attempt.
  url.searchParams.set('cms_request', randomUUID());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    let response;
    let redirects = 0;
    for (; redirects <= 3; redirects++) {
      response = await fetchImpl(url, {
        redirect: 'manual',
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      });
      if (![301, 302, 303, 307, 308].includes(response.status)) break;
      const location = response.headers.get('location');
      await response.body?.cancel();
      if (!location || redirects === 3)
        throw new Error('Invalid CMS export redirect.');
      url = googleUrl(new URL(location, url));
    }
    if (!response.ok) {
      await response.body?.cancel();
      const error = new Error(
        `CMS export HTTP status ${response.status} at ${url.hostname} (redirects=${redirects}, elapsed=${Math.round((Date.now() - started) / 1000)}s, endpoint=${endpointFingerprint}).`,
      );
      if (
        response.status === 404 &&
        redirects > 0 &&
        url.hostname === 'script.googleusercontent.com'
      )
        error.code = 'CMS_REDIRECT_NOT_FOUND';
      throw error;
    }
    if (
      !/^application\/json(?:\s*;|$)/i.test(
        response.headers.get('content-type') || '',
      )
    )
      throw new Error(
        'CMS export must return JSON; check the read API deployment access.',
      );
    const text = await responseText(response);
    if (action === 'media') {
      try {
        return JSON.parse(text);
      } catch {
        throw new Error('CMS media JSON is malformed.');
      }
    }
    return parseSnapshot(text);
  } catch (error) {
    if (controller.signal.aborted)
      throw Object.assign(new Error('CMS export timed out.'), {
        code: 'CMS_TIMEOUT',
      });
    // Fetch errors can contain the full URL and token: report a fixed message.
    if (error instanceof TypeError)
      throw new Error('CMS export network request failed.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchCmsSnapshot(options) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await fetchCmsSnapshotOnce(options);
    } catch (error) {
      if (
        !['CMS_TIMEOUT', 'CMS_REDIRECT_NOT_FOUND'].includes(error.code) ||
        attempt === 1
      )
        throw error;
    }
  }
}

export async function syncCmsSnapshot({
  snapshotPath,
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = CMS_TIMEOUT_MS,
  mediaRoot = new URL('../public/', import.meta.url),
}) {
  const apiUrl = env.CMS_API_URL;
  const apiToken = env.CMS_API_TOKEN;
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_ANON_KEY;
  if (!apiUrl && !apiToken) {
    const snapshot = parseSnapshot(await readFile(snapshotPath, 'utf8'));
    await cacheProjectMedia({ snapshot, mediaRoot });
    return 'local';
  }
  if (!apiUrl || !apiToken)
    throw new Error(
      'Configure both CMS_API_URL and CMS_API_TOKEN, or neither for local mode.',
    );
  const snapshot = await fetchCmsSnapshot({
    apiUrl,
    apiToken,
    fetchImpl,
    timeoutMs,
  });

  if (apiUrl && apiToken) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'CMS projects migration requires SUPABASE_URL and SUPABASE_ANON_KEY',
      );
    }

    const sp = await supabaseFetch(
      supabaseUrl,
      supabaseKey,
      'cms_load_projects',
      fetchImpl,
    );
    snapshot.projects = sp.projects;

    validateCmsSnapshot(snapshot);
  }

  await cacheProjectMedia({
    snapshot,
    mediaRoot,
    apiUrl,
    apiToken,
    fetchImpl,
    timeoutMs,
  });
  const target =
    snapshotPath instanceof URL
      ? snapshotPath
      : pathToFileURL(resolve(snapshotPath));
  const temp = new URL(`.cms-${randomUUID()}.tmp`, target);
  try {
    await writeFile(temp, `${JSON.stringify(snapshot, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600,
    });
    await rename(temp, target);
  } finally {
    await unlink(temp).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
  }
  return 'remote';
}

export async function cacheProjectMedia({
  snapshot,
  mediaRoot,
  apiUrl,
  apiToken,
  fetchImpl = fetch,
  timeoutMs = CMS_TIMEOUT_MS,
}) {
  const images = [
    ...new Set(
      [
        ...snapshot.projects.map((p) => p.image),
        ...snapshot.team.leaderTeam.map((m) => m.photo),
        ...snapshot.team.hodsTeams.flatMap((g) =>
          g.members.map((m) => m.photo),
        ),
      ]
        .map((image) => image)
        .filter((image) => MEDIA_PATH.test(image)),
    ),
  ];
  for (const image of images) {
    const target = new URL(
      image.slice(1),
      mediaRoot instanceof URL
        ? mediaRoot
        : pathToFileURL(resolve(mediaRoot) + '/'),
    );
    try {
      const bytes = await readFile(target);
      await verifyProjectMedia(
        { image, mimeType: 'image/webp', data: bytes.toString('base64') },
        image,
      );
      continue;
    } catch {
      /* Refetch a missing or corrupt cache entry; never silently use stale bytes. */
    }
    if (!apiUrl || !apiToken)
      throw new Error(
        'CMS project media cache is missing or invalid. Configure remote CMS access.',
      );
    let bytes;
    try {
      const media = await fetchCmsSnapshot({
        apiUrl,
        apiToken,
        fetchImpl,
        timeoutMs,
        action: 'media',
        image,
      });
      bytes = await verifyProjectMedia(media, image);
    } catch {
      throw new Error('CMS project media fetch or validation failed.');
    }
    await mkdir(new URL('./', target), { recursive: true });
    const temp = new URL(`.media-${randomUUID()}.tmp`, target);
    try {
      await writeFile(temp, bytes, { flag: 'wx', mode: 0o644 });
      await rename(temp, target);
    } finally {
      await unlink(temp).catch((error) => {
        if (error.code !== 'ENOENT') throw error;
      });
    }
  }
}
