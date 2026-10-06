// Separate private GAS project. Public export code must never include this file.
const ADMIN_PROJECT_MIN = 1;
const ADMIN_PROJECT_MAX = 8;
const ADMIN_PROJECT_HEADERS = ['id', 'title', 'tags', 'description', 'image'];

function doGet() {
  try {
    adminAuthorize_();
    return HtmlService.createHtmlOutputFromFile('Index').setTitle(
      'Data Sorcerers — Editor',
    );
  } catch (_error) {
    return HtmlService.createHtmlOutput(
      '<p>Akses ditolak. Gunakan akun Google owner CMS.</p>',
    );
  }
}

function doPost() {
  return ContentService.createTextOutput('Akses ditolak.');
}

function setupAdmin() {
  return adminResult_(() => {
    const active = Session.getActiveUser().getEmail().toLowerCase();
    const effective = Session.getEffectiveUser().getEmail().toLowerCase();
    if (!active || active !== effective) adminFail_('UNAUTHORIZED');
    const properties = PropertiesService.getScriptProperties();
    const owner = properties.getProperty('OWNER_EMAIL');
    if (owner && owner !== active) adminFail_('UNAUTHORIZED');
    const sheetId = properties.getProperty('SPREADSHEET_ID');
    const folderId = properties.getProperty('DRIVE_FOLDER_ID');
    if (!sheetId || !folderId) adminFail_('CONFIGURATION');
    if (
      DriveApp.getFileById(sheetId).getOwner().getEmail().toLowerCase() !==
        active ||
      DriveApp.getFolderById(folderId).getOwner().getEmail().toLowerCase() !==
        active
    )
      adminFail_('UNAUTHORIZED');
    adminHooks_();
    adminReadProjects_();
    properties.setProperty('OWNER_EMAIL', active);
    if (!properties.getProperty('ADMIN_EMAILS'))
      properties.setProperty('ADMIN_EMAILS', JSON.stringify([active]));
    adminAuthorize_();
    console.log('Admin setup complete. Deploy with access Only myself.');
    return { ready: true };
  });
}

function adminLoadProjects() {
  return adminResult_(() => {
    adminAuthorize_();
    return adminState_();
  });
}

function adminSaveProject(request) {
  return adminMutateProjects_('save', request);
}

function adminAddProject(request) {
  return adminMutateProjects_('add', request);
}

function adminDeleteProject(request) {
  return adminMutateProjects_('delete', request);
}

function adminMutateProjects_(operation, request) {
  return adminResult_(() => {
    adminAuthorize_();
    adminHooks_();
    const keys = operation === 'delete' ? 'id,revision' : 'project,revision';
    if (
      !request ||
      typeof request !== 'object' ||
      Array.isArray(request) ||
      Object.keys(request).sort().join(',') !== keys ||
      typeof request.revision !== 'string'
    )
      adminFail_('INVALID_INPUT');
    if (
      operation === 'delete' &&
      (typeof request.id !== 'string' ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(request.id))
    )
      adminFail_('INVALID_INPUT');
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let state;
    try {
      const projects = adminReadProjects_();
      if (adminRevision_(projects) !== request.revision) adminFail_('CONFLICT');
      let affectedId;
      if (operation === 'delete') {
        const index = projects.findIndex((item) => item.id === request.id);
        if (index < 0) adminFail_('NOT_FOUND');
        if (projects.length <= ADMIN_PROJECT_MIN) adminFail_('MINIMUM');
        projects.splice(index, 1);
        affectedId = request.id;
      } else {
        let input = request.project;
        if (operation === 'add') {
          if (projects.length >= ADMIN_PROJECT_MAX) adminFail_('LIMIT');
          if (
            !input ||
            typeof input !== 'object' ||
            Array.isArray(input) ||
            Object.keys(input).sort().join(',') !==
              'description,image,tags,title'
          )
            adminFail_('INVALID_INPUT');
          input = {
            ...input,
            id: 'project-' + Utilities.getUuid().toLowerCase(),
          };
          if (projects.some((item) => item.id === input.id))
            adminFail_('COLLISION');
        }
        const project = adminValidateProject_(input);
        affectedId = project.id;
        if (operation === 'add') projects.push(project);
        else {
          const index = projects.findIndex((item) => item.id === project.id);
          if (index < 0) adminFail_('NOT_FOUND');
          projects[index] = project;
        }
      }
      adminValidateProjects_(projects);
      const sheet = adminSheet_();
      const height = Math.max(projects.length, sheet.getLastRow() - 1);
      const values = Array.from({ length: height }, (_, index) =>
        ADMIN_PROJECT_HEADERS.map((field) =>
          projects[index]
            ? adminCell_(
                field === 'tags'
                  ? JSON.stringify(projects[index].tags)
                  : projects[index][field],
              )
            : '',
        ),
      );
      const range = sheet.getRange(2, 1, height, ADMIN_PROJECT_HEADERS.length);
      range.setNumberFormat('@');
      range.setValues(values);
      PropertiesService.getScriptProperties().setProperty(
        'PUBLICATION_PENDING',
        'true',
      );
      SpreadsheetApp.flush();
      state = { ...adminState_(projects), affectedId };
    } finally {
      lock.releaseLock();
    }
    let publication;
    try {
      publication = adminPublish_();
    } catch (_error) {
      publication = ['testing', 'production'].map((target) => ({
        target,
        accepted: false,
      }));
    }
    return {
      ...state,
      saved: true,
      publicationPending: publication.some((item) => !item.accepted),
      publication,
    };
  });
}

function adminRetryPublication() {
  return adminResult_(() => {
    adminAuthorize_();
    return { publication: adminPublish_() };
  });
}

function adminResult_(run) {
  try {
    return { ok: true, data: run() };
  } catch (error) {
    const allowed = [
      'UNAUTHORIZED',
      'CONFIGURATION',
      'INVALID_INPUT',
      'INVALID_DATA',
      'CONFLICT',
      'NOT_FOUND',
      'MINIMUM',
      'LIMIT',
      'COLLISION',
    ];
    return {
      ok: false,
      error: {
        code:
          allowed.indexOf(error.adminCode) >= 0
            ? error.adminCode
            : 'SERVER_ERROR',
      },
    };
  }
}

function adminFail_(code) {
  const error = new Error('Admin operation failed.');
  error.adminCode = code;
  throw error;
}

function adminAuthorize_() {
  const properties = PropertiesService.getScriptProperties();
  const owner = properties.getProperty('OWNER_EMAIL');
  const active = Session.getActiveUser().getEmail().toLowerCase();
  const effective = Session.getEffectiveUser().getEmail().toLowerCase();
  let admins;
  try {
    admins = JSON.parse(properties.getProperty('ADMIN_EMAILS') || 'null');
  } catch (_error) {
    adminFail_('UNAUTHORIZED');
  }
  // This first deployment supports one owner. A second admin needs a tested identity flow.
  if (
    !owner ||
    !active ||
    active !== owner ||
    effective !== owner ||
    !Array.isArray(admins) ||
    admins.indexOf(active) < 0
  )
    adminFail_('UNAUTHORIZED');
}

function adminSheet_() {
  const id =
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) adminFail_('CONFIGURATION');
  const sheet = SpreadsheetApp.openById(id).getSheetByName('projects');
  if (
    !sheet ||
    sheet.getLastColumn() !== ADMIN_PROJECT_HEADERS.length ||
    JSON.stringify(
      sheet.getRange(1, 1, 1, ADMIN_PROJECT_HEADERS.length).getValues()[0],
    ) !== JSON.stringify(ADMIN_PROJECT_HEADERS)
  )
    adminFail_('INVALID_DATA');
  return sheet;
}

function adminReadProjects_() {
  const sheet = adminSheet_();
  const height = sheet.getLastRow() - 1;
  if (height < ADMIN_PROJECT_MIN || height > 1000) adminFail_('INVALID_DATA');
  const records = sheet
    .getRange(2, 1, height, ADMIN_PROJECT_HEADERS.length)
    .getValues()
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      if (row.some((cell) => typeof cell !== 'string'))
        adminFail_('INVALID_DATA');
      let tags;
      try {
        tags = JSON.parse(row[2]);
      } catch (_error) {
        adminFail_('INVALID_DATA');
      }
      return adminValidateProject_({
        id: row[0],
        title: row[1],
        tags,
        description: row[3],
        image: row[4],
      });
    });
  return adminValidateProjects_(records);
}

function adminValidateProjects_(records) {
  if (records.length < ADMIN_PROJECT_MIN || records.length > ADMIN_PROJECT_MAX)
    adminFail_('INVALID_DATA');
  const seen = new Set();
  records.forEach((record) => {
    adminValidateProject_(record);
    if (seen.has(record.id)) adminFail_('INVALID_DATA');
    seen.add(record.id);
  });
  return records;
}

function adminValidateProject_(project) {
  if (
    !project ||
    typeof project !== 'object' ||
    Array.isArray(project) ||
    Object.keys(project).sort().join(',') !==
      'description,id,image,tags,title' ||
    typeof project.id !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.id) ||
    !Array.isArray(project.tags) ||
    project.tags.length !== 2 ||
    ADMIN_IMAGE_PRESETS.indexOf(project.image) < 0
  )
    adminFail_('INVALID_INPUT');
  const validText = (value) =>
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.length <= 20000;
  if (
    !validText(project.title) ||
    !validText(project.description) ||
    !project.tags.every(validText)
  )
    adminFail_('INVALID_INPUT');
  return {
    id: project.id,
    title: project.title,
    tags: project.tags.slice(),
    description: project.description,
    image: project.image,
  };
}

function adminCell_(value) {
  return /^[=+'\-@]/.test(value) ? "'" + value : value;
}

function adminRevision_(projects) {
  return Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    JSON.stringify(projects),
    Utilities.Charset.UTF_8,
  )
    .map((byte) => ('0' + ((byte + 256) % 256).toString(16)).slice(-2))
    .join('');
}

function adminState_(projects) {
  const records = projects || adminReadProjects_();
  return {
    projects: records,
    revision: adminRevision_(records),
    imagePresets: ADMIN_IMAGE_PRESETS,
    minProjects: ADMIN_PROJECT_MIN,
    maxProjects: ADMIN_PROJECT_MAX,
    publicationPending:
      PropertiesService.getScriptProperties().getProperty(
        'PUBLICATION_PENDING',
      ) === 'true',
  };
}

function adminHooks_() {
  const properties = PropertiesService.getScriptProperties();
  const hooks = ['TESTING', 'PRODUCTION'].map((name) => {
    const url = properties.getProperty('DEPLOY_HOOK_' + name);
    if (
      !url ||
      !/^https:\/\/api\.vercel\.com\/v1\/integrations\/deploy\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(
        url,
      )
    )
      adminFail_('CONFIGURATION');
    return { target: name.toLowerCase(), url };
  });
  if (hooks[0].url.split('/')[6] === hooks[1].url.split('/')[6])
    adminFail_('CONFIGURATION');
  return hooks;
}

function adminPublish_() {
  // Validate both before sending either; never return hook URLs or raw responses.
  const hooks = adminHooks_();
  const results = hooks.map((hook) => {
    let accepted = false;
    try {
      const response = UrlFetchApp.fetch(hook.url, {
        method: 'post',
        followRedirects: false,
        muteHttpExceptions: true,
      });
      const status = response.getResponseCode();
      const body = JSON.parse(response.getContentText());
      accepted =
        status >= 200 &&
        status < 300 &&
        !!body.job &&
        typeof body.job.id === 'string';
    } catch (_error) {
      /* Publication can be retried without repeating the Sheet edit. */
    }
    return { target: hook.target, accepted };
  });
  PropertiesService.getScriptProperties().setProperty(
    'PUBLICATION_PENDING',
    String(results.some((item) => !item.accepted)),
  );
  return results;
}
