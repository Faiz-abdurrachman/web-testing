import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import sharp from 'sharp';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  normalizeProjectImage,
  verifyProjectMedia,
  MEDIA_INPUT_LIMIT,
} from '../server/cms-media.mjs';
import { syncCmsSnapshot } from '../scripts/cms-client.mjs';
import { createAdminHandler, SCOPES } from '../server/cms-admin.mjs';
const baseline = JSON.parse(
  await readFile(new URL('../src/data/cms-snapshot.json', import.meta.url)),
);
const source = await readFile(
  new URL('../cms/gas/admin/server.js', import.meta.url),
  'utf8',
);
const shared = await readFile(
  new URL('../cms/gas/media.js', import.meta.url),
  'utf8',
);
const raster = (format = 'png') =>
  sharp({
    create: { width: 64, height: 48, channels: 3, background: '#9b7bff' },
  })
    .toFormat(format)
    .toBuffer();

const teamRpc = (snapshot = baseline) => {
  const members = [];
  const groups = [];
  for (const ht of snapshot.team.hodsTeams) {
    groups.push({ id: ht.id, title: ht.title });
    for (const [i, m] of ht.members.entries()) {
      members.push({
        id: ht.id + '-' + (i + 1),
        group: ht.id,
        name: m.name,
        role: m.role,
        photo: m.photo,
        order: i + 1,
      });
    }
  }
  for (const [i, m] of snapshot.team.leaderTeam.entries()) {
    members.push({
      id: 'leader-' + (i + 1),
      group: 'leader',
      name: m.name,
      role: m.role,
      photo: m.photo,
      order: i + 1,
    });
  }
  groups.unshift({ id: 'leader', title: '' });
  return {
    members,
    groups,
    revision: 'a'.repeat(64),
    photoPresets: ['marchel', 'zidan-rose'],
    minMembers: 1,
    maxMembers: 8,
    minGroups: 7,
    publicationPending: false,
    affectedId: null,
  };
};

test('media normalizes raster uploads, bounds pixels/bytes and verifies hash and decode', async () => {
  for (const format of ['png', 'jpeg', 'webp']) {
    const media = await normalizeProjectImage(
      await raster(format),
      'image/' + format,
    );
    assert.match(media.image, /^\/images\/cms\/projects\/[a-f0-9]{64}\.webp$/);
    const bytes = await verifyProjectMedia(media, media.image);
    assert.equal((await sharp(bytes).metadata()).format, 'webp');
    await assert.rejects(
      verifyProjectMedia(
        { ...media, data: Buffer.from('wrong').toString('base64') },
        media.image,
      ),
    );
    await assert.rejects(
      verifyProjectMedia(media, '/images/cms/projects/../bad.webp'),
    );
  }
  for (const [bytes, mime] of [
    [Buffer.from('<svg/>'), 'image/png'],
    [await raster(), 'image/jpeg'],
    [Buffer.alloc(MEDIA_INPUT_LIMIT + 1), 'image/png'],
    [Buffer.from('bad'), 'text/html'],
  ])
    await assert.rejects(normalizeProjectImage(bytes, mime));
  const large = await sharp({
    create: { width: 5000, height: 4000, channels: 3, background: '#fff' },
  })
    .png()
    .toBuffer();
  await assert.rejects(normalizeProjectImage(large, 'image/png'));
  const raw = Buffer.alloc(64 * 96 * 3, 200);
  raw.fill(50, 64 * 48 * 3);
  const animated = await sharp(raw, {
    raw: { width: 64, height: 96, channels: 3, pageHeight: 48 },
  })
    .webp()
    .toBuffer();
  assert.equal((await sharp(animated).metadata()).pages, 2);
  await assert.rejects(normalizeProjectImage(animated, 'image/webp'));
});

test('prebuild caches verified private media before atomic snapshot write, refetches corrupt cache, preserves snapshot on failure', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'ds-cms-media-'));
  try {
    const media = await normalizeProjectImage(await raster(), 'image/png');
    const changed = structuredClone(baseline);
    changed.projects[0].image = media.image;
    const snapshotPath = join(dir, 'snapshot.json');
    await writeFile(snapshotPath, JSON.stringify(baseline));
    let bad = true,
      mediaCalls = 0;
    const options = {
      snapshotPath,
      mediaRoot: join(dir, 'public'),
      env: {
        CMS_API_URL: 'https://script.google.com/macros/s/test/exec',
        CMS_API_TOKEN: 'PRIVATE-test',
        SUPABASE_URL: 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY: 'placeholder',
        SUPABASE_SERVICE_ROLE_KEY: 'private-build-test',
      },
      fetchImpl: async (url, requestOptions) => {
        const href = typeof url === 'string' ? url : url.href;
        if (href.includes('/rest/v1/rpc/'))
          assert.equal(
            requestOptions.headers.Authorization,
            'Bearer placeholder',
          );
        if (href.includes('/rest/v1/rpc/cms_load_projects'))
          return Response.json(changed);
        if (href.includes('/rest/v1/rpc/cms_load_team'))
          return Response.json(teamRpc());
        if (href.includes('/rest/v1/rpc/cms_load_partners'))
          return Response.json({ partners: baseline.partners });
        if (href.includes('/rest/v1/rpc/cms_load_hods'))
          return Response.json({ hods: baseline.hods });
        if (href.includes('/rest/v1/rpc/cms_load_domains'))
          return Response.json({ domains: baseline.domains });
        if (href.includes('/rest/v1/rpc/cms_load_roles'))
          return Response.json({ roles: baseline.roles });
        if (href.includes('/storage/v1/object/cms-media/')) {
          assert.equal(
            requestOptions.headers.Authorization,
            'Bearer private-build-test',
          );
          mediaCalls++;
          return bad
            ? new Response(null, { status: 404 })
            : new Response(Buffer.from(media.data, 'base64'));
        }
        const parsed = new URL(href);
        if (parsed.searchParams.get('action') === 'media') {
          mediaCalls++;
          return Response.json(
            bad ? { error: { code: 'INVALID_CMS_DATA' } } : media,
          );
        }
        return Response.json(changed);
      },
    };
    await assert.rejects(
      syncCmsSnapshot({
        ...options,
        env: { ...options.env, SUPABASE_SERVICE_ROLE_KEY: undefined },
      }),
      /Media fetch requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/,
    );
    assert.equal(mediaCalls, 0);
    await assert.rejects(
      syncCmsSnapshot(options),
      /media (fetch or validation failed|fetch failed)/,
    );
    assert.deepEqual(JSON.parse(await readFile(snapshotPath)), baseline);
    bad = false;
    await syncCmsSnapshot(options);
    assert.deepEqual(JSON.parse(await readFile(snapshotPath)), changed);
    const cached = join(dir, 'public', media.image.slice(1));
    assert.equal(
      createHash('sha256')
        .update(await readFile(cached))
        .digest('hex'),
      media.image.split('/').at(-1).slice(0, 64),
    );
    const count = mediaCalls;
    await syncCmsSnapshot(options);
    assert.equal(mediaCalls, count);
    await writeFile(cached, 'corrupt');
    await syncCmsSnapshot(options);
    assert.equal(mediaCalls, count + 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

function gasHarness() {
  let identity = 'owner@example.test',
    folderOwner = identity;
  const files = new Map();
  let writes = 0;
  const props = new Map(
    Object.entries({
      OWNER_EMAIL: identity,
      ADMIN_EMAILS: JSON.stringify([identity]),
      DRIVE_FOLDER_ID: 'PRIVATE-folder',
      EXPORT_TOKEN: 'PRIVATE-export',
    }),
  );
  const folder = {
    getOwner: () => ({ getEmail: () => folderOwner }),
    getFilesByName: (name) => {
      let done = false;
      return {
        hasNext: () => !done && files.has(name),
        next: () => {
          done = true;
          return files.get(name);
        },
      };
    },
    createFile: (blob) => {
      writes++;
      files.set(blob.name, {
        getMimeType: () => 'image/webp',
        getSize: () => blob.bytes.length,
        isTrashed: () => false,
        getBlob: () => ({ getBytes: () => blob.bytes }),
      });
    },
  };
  const context = vm.createContext({
    ADMIN_IMAGE_PRESETS: [...new Set(baseline.projects.map((p) => p.image))],
    Session: {
      getActiveUser: () => ({ getEmail: () => identity }),
      getEffectiveUser: () => ({ getEmail: () => identity }),
    },
    PropertiesService: {
      getScriptProperties: () => ({ getProperty: (key) => props.get(key) }),
    },
    DriveApp: { getFolderById: () => folder },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: {
      DigestAlgorithm: { SHA_256: 'sha256' },
      Charset: { UTF_8: 'utf8' },
      computeDigest: (_a, bytes) => [
        ...createHash('sha256')
          .update(
            typeof bytes === 'string'
              ? bytes
              : Buffer.from(bytes.map((b) => (b + 256) % 256)),
          )
          .digest(),
      ],
      base64Decode: (value) => [...Buffer.from(value, 'base64')],
      base64Encode: (bytes) =>
        Buffer.from(bytes.map((b) => (b + 256) % 256)).toString('base64'),
      newBlob: (bytes, _mime, name) => ({ bytes, name }),
    },
  });
  vm.runInContext(source + '\n' + shared + '\n' + teamSource, context);
  return {
    context,
    files,
    props,
    deny: () => {
      identity = 'other@example.test';
    },
    wrongFolder: () => {
      folderOwner = 'other@example.test';
    },
    writes: () => writes,
  };
}

test('GAS upload/read are owner-only, folder-bound, hash-checked and deduplicated without Sheet/hooks', async () => {
  const media = await normalizeProjectImage(await raster(), 'image/png');
  const h = gasHarness();
  assert.equal(h.context.adminUploadProjectImage(media).ok, true);
  assert.equal(h.context.adminUploadProjectImage(media).ok, true);
  assert.equal(h.writes(), 1);
  assert.equal(
    h.context.adminValidateProject_({
      ...baseline.projects[0],
      image: media.image,
    }).image,
    media.image,
  );
  assert(
    h.context
      .adminState_([{ ...baseline.projects[0], image: media.image }])
      .imagePresets.includes(media.image),
  );
  assert.equal(
    h.context.adminReadProjectImage({ image: media.image }).data.media.data,
    media.data,
  );
  assert.equal(
    h.context.adminUploadProjectImage({
      ...media,
      image: '/images/cms/projects/' + 'a'.repeat(64) + '.webp',
    }).error.code,
    'INVALID_INPUT',
  );
  assert.equal(
    h.context.adminReadProjectImage({ image: '../PRIVATE-folder' }).error.code,
    'INVALID_INPUT',
  );
  const bad = gasHarness();
  bad.wrongFolder();
  assert.equal(bad.context.adminUploadProjectImage(media).ok, false);
  assert.equal(bad.writes(), 0);
  h.deny();
  assert.equal(
    h.context.adminUploadProjectImage(media).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(
    h.context.adminReadProjectImage({ image: media.image }).error.code,
    'UNAUTHORIZED',
  );
  assert.equal(h.writes(), 1);
});

test('read-only export media requires token and a current project reference, never arbitrary Drive IDs', async () => {
  const media = await normalizeProjectImage(await raster(), 'image/png');
  const h = gasHarness();
  h.context.adminUploadProjectImage(media);
  vm.runInContext(
    await readFile(new URL('../cms/gas/export.js', import.meta.url), 'utf8'),
    h.context,
  );
  h.context.cmsJson_ = (value) => value;
  h.context.cmsReadSnapshot_ = () => baseline;
  assert.equal(
    h.context.doGet({ parameter: { action: 'media', image: media.image } })
      .error.code,
    'UNAUTHORIZED',
  );
  const params = {
    action: 'media',
    token: 'PRIVATE-export',
    image: media.image,
  };
  assert.equal(
    h.context.doGet({ parameter: params }).error.code,
    'UNKNOWN_MEDIA',
  );
  h.context.cmsReadSnapshot_ = () => ({
    ...baseline,
    projects: [{ ...baseline.projects[0], image: media.image }],
  });
  assert.equal(h.context.doGet({ parameter: params }).data, media.data);
  assert.equal(
    h.context.doGet({ parameter: { ...params, image: 'PRIVATE-file-id' } })
      .error.code,
    'UNKNOWN_MEDIA',
  );
  assert.equal(h.context.doPost().error.code, 'READ_ONLY');
});

test('native media route enforces session/CSRF, normalizes bytes before fixed owner RPC and serves verified private preview', async () => {
  const origin = 'https://admin.example.test';
  const png = await raster();
  const expected = await normalizeProjectImage(png, 'image/png');
  const env = {
    NODE_ENV: 'production',
    CMS_ADMIN_ORIGIN: origin,
    CMS_ADMIN_SESSION_SECRET: Buffer.alloc(32).toString('base64'),
    CMS_ADMIN_GOOGLE_CLIENT_ID: 'private-client',
    CMS_ADMIN_GOOGLE_CLIENT_SECRET: 'private-secret',
    CMS_ADMIN_API_DEPLOYMENT_ID: 'private-deployment',
    SUPABASE_URL: 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: 'placeholder-anon',
    SUPABASE_SERVICE_ROLE_KEY: 'placeholder',
    SUPABASE_ACCESS_TOKEN: 'placeholder',
  };
  const data = {
    projects: baseline.projects,
    revision: 'a'.repeat(64),
    imagePresets: baseline.projects.map((p) => p.image),
    minProjects: 1,
    maxProjects: 8,
    publicationPending: false,
  };
  const calls = [];
  const handle = createAdminHandler({
    env,
    fetchImpl: async (url, options) => {
      const href = String(url);
      if (href.includes('/auth/v1/token'))
        return Response.json({
          access_token: 'private-access',
          refresh_token: 'private-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: { id: '11111111-1111-1111-1111-111111111111' },
        });
      if (href.includes('/auth/v1/user'))
        return Response.json({
          id: '11111111-1111-1111-1111-111111111111',
          email: 'owner@example.test',
        });
      if (href.includes('cms_verify_admin'))
        return Response.json({ ok: true, email: 'owner@example.test' });
      if (href.includes('cms_rate_limit'))
        return Response.json({ ok: true, limited: false });
      if (typeof url === 'string' && url.includes('/rest/v1/rpc/'))
        return Response.json(data);
      if (typeof url === 'string' && url.includes('/storage/v1/'))
        return new Response(Buffer.from(expected.data, 'base64'), {
          headers: { 'Content-Type': 'image/webp' },
        });
      if (url.endsWith('/token'))
        return Response.json({
          access_token: 'private-token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: SCOPES.join(' '),
        });
      const rpc = JSON.parse(options.body);
      calls.push(rpc);
      let rpcData = {
        projects: baseline.projects,
        revision: 'a'.repeat(64),
        imagePresets: [baseline.projects[0].image],
        minProjects: 1,
        maxProjects: 8,
      };
      if (rpc.function === 'adminUploadProjectImage') {
        assert.deepEqual(rpc.parameters[0], expected);
        rpcData = { image: expected.image };
      }
      if (rpc.function === 'adminReadProjectImage')
        rpcData = { media: expected };
      return Response.json({
        done: true,
        response: { result: { ok: true, data: rpcData } },
      });
    },
  });
  const req = (path, options) => new Request(origin + path, options);
  assert.equal(
    (
      await handle(
        req('/api/admin/media', { method: 'POST', body: png }),
        'media',
      )
    ).status,
    401,
  );
  const loginResponse = await handle(
    req('/api/admin/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.test', password: 'pw' }),
    }),
    'login',
  );
  const cookie = loginResponse.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  const loaded = await (
    await handle(req('/projects', { headers: { Cookie: cookie } }), 'projects')
  ).json();
  const headers = {
    Cookie: cookie,
    Origin: origin,
    'X-CSRF-Token': loaded.csrf,
    'Content-Type': 'image/png',
  };
  assert.equal(
    (
      await handle(
        req('/media', {
          method: 'POST',
          headers: { Cookie: cookie },
          body: png,
        }),
        'media',
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handle(
        req('/media', { method: 'POST', headers, body: '<svg/>' }),
        'media',
      )
    ).status,
    400,
  );
  const uploaded = await (
    await handle(req('/media', { method: 'POST', headers, body: png }), 'media')
  ).json();
  assert.equal(uploaded.data.image, expected.image);
  const preview = await handle(
    req('/media?image=' + encodeURIComponent(expected.image), {
      headers: { Cookie: cookie },
    }),
    'media',
  );
  assert.equal(preview.headers.get('Content-Type'), 'image/webp');
  assert.deepEqual(
    Buffer.from(await preview.arrayBuffer()),
    Buffer.from(expected.data, 'base64'),
  );
  // Upload projects sekarang ke Supabase Storage, bukan GAS RPC
  assert.equal(
    calls.filter((c) => c.function === 'adminUploadProjectImage').length,
    0,
  );
});

const teamSource = await readFile(
  new URL('../cms/gas/admin/team.js', import.meta.url),
  'utf8',
);
test('Team photos use separate namespace, private owner upload/read and active-reference export; cache before snapshot', async () => {
  const media = await normalizeProjectImage(
    await raster(),
    'image/png',
    'team',
  );
  assert.match(media.image, /^\/images\/cms\/team\/[a-f0-9]{64}\.webp$/);
  const h = gasHarness();
  assert.equal(h.context.adminUploadProjectImage(media).ok, false);
  assert.equal(h.context.adminUploadTeamImage(media).ok, true);
  assert.equal(h.context.adminUploadTeamImage(media).ok, true);
  assert.equal(h.writes(), 1);
  assert.equal(
    h.context.adminReadProjectImage({ image: media.image }).ok,
    false,
  );
  assert.equal(
    h.context.adminReadTeamImage({ image: media.image }).data.media.data,
    media.data,
  );
  vm.runInContext(
    await readFile(new URL('../cms/gas/export.js', import.meta.url), 'utf8'),
    h.context,
  );
  h.context.cmsJson_ = (v) => v;
  h.context.cmsReadSnapshot_ = () => structuredClone(baseline);
  const params = {
    action: 'media',
    token: h.props.get('EXPORT_TOKEN'),
    image: media.image,
  };
  assert.equal(
    h.context.doGet({ parameter: params }).error.code,
    'UNKNOWN_MEDIA',
  );
  const snapshot = structuredClone(baseline);
  snapshot.team.leaderTeam[0].photo = media.image;
  h.context.cmsReadSnapshot_ = () => snapshot;
  assert.equal(h.context.doGet({ parameter: params }).data, media.data);
  const dir = await mkdtemp(join(tmpdir(), 'ds-team-cache-'));
  try {
    const path = join(dir, 'snapshot.json');
    await writeFile(path, JSON.stringify(baseline));
    const options = {
      snapshotPath: path,
      mediaRoot: join(dir, 'public'),
      env: {
        CMS_API_URL: 'https://script.google.com/macros/s/test/exec',
        CMS_API_TOKEN: 'test-token',
        SUPABASE_URL: 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY: 'placeholder',
        SUPABASE_SERVICE_ROLE_KEY: 'private-build-test',
      },
      fetchImpl: async (url, requestOptions) => {
        const href = typeof url === 'string' ? url : url.href;
        if (href.includes('/rest/v1/rpc/'))
          assert.equal(
            requestOptions.headers.Authorization,
            'Bearer placeholder',
          );
        if (href.includes('/rest/v1/rpc/cms_load_projects'))
          return Response.json(snapshot);
        if (href.includes('/rest/v1/rpc/cms_load_team'))
          return Response.json(teamRpc(snapshot));
        if (href.includes('/rest/v1/rpc/cms_load_partners'))
          return Response.json({ partners: baseline.partners });
        if (href.includes('/rest/v1/rpc/cms_load_hods'))
          return Response.json({ hods: baseline.hods });
        if (href.includes('/rest/v1/rpc/cms_load_domains'))
          return Response.json({ domains: baseline.domains });
        if (href.includes('/rest/v1/rpc/cms_load_roles'))
          return Response.json({ roles: snapshot.roles });
        if (href.includes('/storage/v1/object/cms-media/')) {
          assert.equal(
            requestOptions.headers.Authorization,
            'Bearer private-build-test',
          );
          return new Response(Buffer.from(media.data, 'base64'));
        }
        return Response.json(
          new URL(href).searchParams.get('action') === 'media'
            ? media
            : snapshot,
        );
      },
    };
    await syncCmsSnapshot(options);
    assert.deepEqual(
      await readFile(join(dir, 'public', media.image.slice(1))),
      Buffer.from(media.data, 'base64'),
    );
    await writeFile(join(dir, 'public', media.image.slice(1)), 'corrupt');
    options.fetchImpl = async (url) => {
      const href = typeof url === 'string' ? url : url.href;
      if (href.includes('/rest/v1/rpc/cms_load_projects'))
        return Response.json(snapshot);
      if (href.includes('/rest/v1/rpc/cms_load_team'))
        return Response.json(teamRpc(snapshot));
      if (href.includes('/rest/v1/rpc/cms_load_partners'))
        return Response.json({ partners: baseline.partners });
      if (href.includes('/rest/v1/rpc/cms_load_hods'))
        return Response.json({ hods: baseline.hods });
      if (href.includes('/rest/v1/rpc/cms_load_domains'))
        return Response.json({ domains: baseline.domains });
      if (href.includes('/rest/v1/rpc/cms_load_roles'))
        return Response.json({ roles: snapshot.roles });
      if (href.includes('/storage/v1/object/cms-media/'))
        return new Response(null, { status: 404 });
      return Response.json(
        new URL(href).searchParams.get('action') === 'media' ? {} : snapshot,
      );
    };
    await assert.rejects(
      syncCmsSnapshot(options),
      /media (fetch or validation failed|fetch failed)/,
    );
    assert.deepEqual(JSON.parse(await readFile(path)), snapshot);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  h.deny();
  assert.equal(
    h.context.adminReadTeamImage({ image: media.image }).error.code,
    'UNAUTHORIZED',
  );
});

test('native Team media route enforces session/CSRF, normalizes bytes before fixed owner RPC and serves verified private preview', async () => {
  const origin = 'https://admin.example.test';
  const png = await raster();
  const expected = await normalizeProjectImage(png, 'image/png', 'team');
  const env = {
    NODE_ENV: 'production',
    CMS_ADMIN_ORIGIN: origin,
    CMS_ADMIN_SESSION_SECRET: Buffer.alloc(32).toString('base64'),
    CMS_ADMIN_GOOGLE_CLIENT_ID: 'private-client',
    CMS_ADMIN_GOOGLE_CLIENT_SECRET: 'private-secret',
    CMS_ADMIN_API_DEPLOYMENT_ID: 'private-deployment',
    SUPABASE_URL: 'https://placeholder.supabase.co',
    SUPABASE_ANON_KEY: 'placeholder-anon',
    SUPABASE_SERVICE_ROLE_KEY: 'placeholder',
    SUPABASE_ACCESS_TOKEN: 'placeholder',
  };
  const data = {
    projects: baseline.projects,
    revision: 'a'.repeat(64),
    imagePresets: baseline.projects.map((p) => p.image),
    minProjects: 1,
    maxProjects: 8,
    publicationPending: false,
  };
  const calls = [];
  const handle = createAdminHandler({
    env,
    fetchImpl: async (url, options) => {
      const href = String(url);
      if (href.includes('/auth/v1/token'))
        return Response.json({
          access_token: 'private-access',
          refresh_token: 'private-refresh',
          token_type: 'bearer',
          expires_in: 3600,
          user: { id: '11111111-1111-1111-1111-111111111111' },
        });
      if (href.includes('/auth/v1/user'))
        return Response.json({
          id: '11111111-1111-1111-1111-111111111111',
          email: 'owner@example.test',
        });
      if (href.includes('cms_verify_admin'))
        return Response.json({ ok: true, email: 'owner@example.test' });
      if (href.includes('cms_rate_limit'))
        return Response.json({ ok: true, limited: false });
      if (typeof url === 'string' && url.includes('/rest/v1/rpc/'))
        return Response.json(data);
      if (typeof url === 'string' && url.includes('/storage/v1/')) {
        if (options.method === 'POST') {
          assert.deepEqual(
            Buffer.from(options.body),
            Buffer.from(expected.data, 'base64'),
          );
          calls.push({ storageUpload: url });
        }
        return new Response(Buffer.from(expected.data, 'base64'), {
          headers: { 'Content-Type': 'image/webp' },
        });
      }
      if (url.endsWith('/token'))
        return Response.json({
          access_token: 'private-token',
          token_type: 'Bearer',
          expires_in: 3600,
          scope: SCOPES.join(' '),
        });
      const rpc = JSON.parse(options.body);
      calls.push(rpc);
      let rpcData = {
        projects: baseline.projects,
        revision: 'a'.repeat(64),
        imagePresets: [baseline.projects[0].image],
        minProjects: 1,
        maxProjects: 8,
      };
      if (rpc.function === 'adminUploadTeamImage') {
        assert.deepEqual(rpc.parameters[0], expected);
        rpcData = { image: expected.image };
      }
      if (rpc.function === 'adminReadTeamImage') rpcData = { media: expected };
      return Response.json({
        done: true,
        response: { result: { ok: true, data: rpcData } },
      });
    },
  });
  const req = (path, options) => new Request(origin + path, options);
  assert.equal(
    (
      await handle(
        req('/api/admin/media', { method: 'POST', body: png }),
        'media',
      )
    ).status,
    401,
  );
  const loginResponse = await handle(
    req('/api/admin/auth/login', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.test', password: 'pw' }),
    }),
    'login',
  );
  const cookie = loginResponse.headers
    .getSetCookie()
    .map((c) => c.split(';')[0])
    .join('; ');
  const loaded = await (
    await handle(req('/projects', { headers: { Cookie: cookie } }), 'projects')
  ).json();
  const headers = {
    Cookie: cookie,
    Origin: origin,
    'X-CSRF-Token': loaded.csrf,
    'Content-Type': 'image/png',
  };
  assert.equal(
    (
      await handle(
        req('/media?collection=team', {
          method: 'POST',
          headers: { Cookie: cookie },
          body: png,
        }),
        'media',
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await handle(
        req('/media?collection=team', {
          method: 'POST',
          headers,
          body: '<svg/>',
        }),
        'media',
      )
    ).status,
    400,
  );
  const uploaded = await (
    await handle(
      req('/media?collection=team', { method: 'POST', headers, body: png }),
      'media',
    )
  ).json();
  assert.equal(uploaded.data.image, expected.image);
  const preview = await handle(
    req('/media?collection=team&image=' + encodeURIComponent(expected.image), {
      headers: { Cookie: cookie },
    }),
    'media',
  );
  assert.equal(preview.headers.get('Content-Type'), 'image/webp');
  assert.deepEqual(
    Buffer.from(await preview.arrayBuffer()),
    Buffer.from(expected.data, 'base64'),
  );
  assert.equal(
    calls.filter((c) => c.storageUpload?.includes('/cms-media/team/')).length,
    1,
  );
});
