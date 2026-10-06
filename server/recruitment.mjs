import { validateApplication } from './recruitment-contract.mjs';
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers = {
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noindex, nofollow',
};
const json = (body, status = 200) => Response.json(body, { status, headers });
const error = (code, status) => json({ ok: false, error: { code } }, status);
function config(env) {
  const url = new URL(env.RECRUITMENT_GAS_URL || '');
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'script.google.com' ||
    !/^\/macros\/s\/[\w-]+\/exec$/.test(url.pathname) ||
    url.search ||
    url.hash ||
    url.username ||
    url.password ||
    url.port ||
    (env.RECRUITMENT_GAS_TOKEN || '').length < 32
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
  return { url: url.href, origin, token: env.RECRUITMENT_GAS_TOKEN };
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
    let body, fields;
    try {
      if (Number(request.headers.get('content-length') || 0) > 32768)
        return error('LIMIT', 413);
      // Bound streamed body before parsing, including requests without Content-Length.
      const reader = request.body?.getReader();
      let size = 0;
      const chunks = [];
      if (!reader) throw new Error();
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
    } catch {
      return error('INVALID_INPUT', 400);
    }
    try {
      const signal = AbortSignal.timeout(60000);
      let response = await fetchImpl(settings.url, {
        method: 'POST',
        redirect: 'manual',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: settings.token, id: body.id, fields }),
      });
      if ([302, 303].includes(response.status)) {
        const redirected = new URL(response.headers.get('location') || '');
        if (
          redirected.protocol !== 'https:' ||
          redirected.hostname !== 'script.googleusercontent.com' ||
          redirected.username ||
          redirected.password ||
          redirected.port
        )
          throw new Error();
        // Redirect GET must never carry the shared secret or applicant body.
        response = await fetchImpl(redirected.href, {
          method: 'GET',
          redirect: 'error',
          signal,
        });
      }
      if (!response.ok) throw new Error();
      const result = await readLimited(response);
      if (result.ok !== true || result.receipt !== body.id) {
        if (result?.error?.code === 'ID_CONFLICT')
          return error('ID_CONFLICT', 409);
        throw new Error();
      }
      return json({ ok: true, receipt: body.id });
    } catch {
      return error('UNCONFIRMED', 502);
    }
  };
}
