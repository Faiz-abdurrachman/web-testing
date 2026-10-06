import { createHash } from 'node:crypto';
import {
  APPLICATION_FIELDS,
  validateApplication,
} from './recruitment-contract.mjs';

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const error = (code, status) => json({ ok: false, error: { code } }, status);

// Canonical serialization must stay stable: one key per contract field, in
// APPLICATION_FIELDS order. The database stores this hash so a manual retry
// with the same receipt and identical answers returns the same receipt.
export function canonicalContentHash(fields) {
  const ordered = {};
  for (const name of APPLICATION_FIELDS) ordered[name] = fields[name];
  return createHash('sha256').update(JSON.stringify(ordered)).digest('hex');
}

function config(env) {
  const url = new URL(env.SUPABASE_URL || '');
  if (
    url.protocol !== 'https:' ||
    !/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname) ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash ||
    (env.SUPABASE_SERVICE_ROLE_KEY || '').length < 40
  )
    throw new Error();
  const origin = new URL(env.CMS_ADMIN_ORIGIN || env.SITE_URL || '').origin;
  if (
    !origin.startsWith('https://') &&
    !(
      env.NODE_ENV !== 'production' &&
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    )
  )
    throw new Error();
  return {
    rpc: url.origin + '/rest/v1/rpc/submit_recruitment_application',
    key: env.SUPABASE_SERVICE_ROLE_KEY,
    origin,
  };
}

async function readLimited(response) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error();
  let size = 0;
  const chunks = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 8192) {
      await reader.cancel();
      throw new Error();
    }
    chunks.push(Buffer.from(value));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function createRecruitmentHandler({
  env = process.env,
  fetchImpl = fetch,
} = {}) {
  return async (request) => {
    let settings;
    try {
      settings = config(env);
    } catch {
      /* Closed until owner configuration exists. */
    }
    const accepting = env.RECRUITMENT_OPEN === 'true' && !!settings;
    if (request.method === 'GET') return json({ ok: true, accepting });
    if (request.method !== 'POST') return error('METHOD_NOT_ALLOWED', 405);
    if (!accepting) return error('CLOSED', 503);
    if (request.headers.get('origin') !== settings.origin)
      return error('FORBIDDEN', 403);
    if (
      !(request.headers.get('content-type') || '').startsWith(
        'application/json',
      )
    )
      return error('INVALID_INPUT', 400);
    let body, fields, hash;
    try {
      if (Number(request.headers.get('content-length') || 0) > 32768)
        return error('LIMIT', 413);
      // Bound the streamed body before parsing, including requests without
      // Content-Length.
      const reader = request.body?.getReader();
      if (!reader) throw new Error();
      let size = 0;
      const chunks = [];
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.length;
        if (size > 32768) {
          await reader.cancel();
          return error('LIMIT', 413);
        }
        chunks.push(Buffer.from(value));
      }
      body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (
        !UUID.test(body.id || '') ||
        Object.keys(body).some(
          (key) => !['id', 'fields', 'website'].includes(key),
        ) ||
        typeof body.website !== 'string' ||
        body.website
      )
        throw new Error();
      fields = validateApplication(body.fields);
      hash = canonicalContentHash(fields);
    } catch {
      return error('INVALID_INPUT', 400);
    }
    try {
      const response = await fetchImpl(settings.rpc, {
        method: 'POST',
        redirect: 'error',
        signal: AbortSignal.timeout(60000),
        headers: {
          'Content-Type': 'application/json',
          apikey: settings.key,
          Authorization: `Bearer ${settings.key}`,
        },
        body: JSON.stringify({
          p_receipt: body.id,
          p_hash: hash,
          p_fields: fields,
        }),
      });
      if (response.status === 400) {
        // PostgREST maps the function's P0001 raise to 400 with the message.
        const failed = await readLimited(response).catch(() => null);
        if (
          failed &&
          typeof failed.message === 'string' &&
          failed.message.includes('ID_CONFLICT')
        )
          return error('ID_CONFLICT', 409);
        throw new Error();
      }
      if (!response.ok) throw new Error();
      const result = await readLimited(response);
      if (
        (result.status === 'inserted' || result.status === 'duplicate') &&
        result.receipt === body.id
      )
        return json({ ok: true, receipt: body.id });
      throw new Error();
    } catch {
      return error('UNCONFIRMED', 502);
    }
  };
}
