// GAS source; scripts/generate-gas-bootstrap.mjs appends the baseline seed.
const CMS_TABLES = {
  projects: ['id', 'title', 'tags', 'description', 'image'],
  team: ['id', 'group', 'groupTitle', 'name', 'role', 'photo', 'order'],
  roles: [
    'id',
    'title',
    'tagline',
    'chips',
    'deadline',
    'about',
    'requirements',
    'contact',
    'whatsapp',
  ],
  hods: ['id', 'title', 'description', 'tabs'],
  domains: ['id', 'title', 'description', 'labels'],
  partners: ['id', 'type', 'order', 'label', 'image', 'title', 'description'],
  milestones: ['id', 'year', 'title', 'description', 'image'],
  settings: ['key', 'value'],
};
const CMS_DOMAIN_IDS = [
  'data',
  'core',
  'language',
  'vision',
  'product',
  'growth',
];

function setupCms() {
  const owner = cmsOwner_();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const properties = PropertiesService.getScriptProperties();
    if (!properties.getProperty('OWNER_EMAIL'))
      properties.setProperty('OWNER_EMAIL', owner);
    if (!properties.getProperty('ADMIN_EMAILS'))
      properties.setProperty('ADMIN_EMAILS', JSON.stringify([owner]));
    if (!properties.getProperty('EXPORT_TOKEN'))
      properties.setProperty(
        'EXPORT_TOKEN',
        Utilities.getUuid().replace(/-/g, '') +
          Utilities.getUuid().replace(/-/g, ''),
      );

    let sheetId = properties.getProperty('SPREADSHEET_ID');
    let spreadsheet;
    if (sheetId) spreadsheet = SpreadsheetApp.openById(sheetId);
    else {
      spreadsheet = SpreadsheetApp.create('Data Sorcerers CMS');
      sheetId = spreadsheet.getId();
      properties.setProperty('SPREADSHEET_ID', sheetId);
    }
    if (!properties.getProperty('DRIVE_FOLDER_ID')) {
      const folder = DriveApp.createFolder('Data Sorcerers CMS Media');
      properties.setProperty('DRIVE_FOLDER_ID', folder.getId());
    }
    const seedRows = cmsSeedRows_(CMS_SEED);
    Object.keys(CMS_TABLES).forEach((name) => {
      const headers = CMS_TABLES[name];
      let sheet = spreadsheet.getSheetByName(name);
      if (!sheet) sheet = spreadsheet.insertSheet(name);
      if (sheet.getLastRow() === 0) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.setFrozenRows(1);
      }
      cmsCheckHeaders_(sheet, headers);
      if (sheet.getLastRow() === 1 && seedRows[name].length) {
        const values = seedRows[name].map((record) =>
          headers.map((field) => cmsSheetCell_(record[field])),
        );
        const range = sheet.getRange(2, 1, values.length, headers.length);
        range.setNumberFormat('@');
        range.setValues(values);
      }
    });
    SpreadsheetApp.flush();
    properties.setProperty('CMS_SCHEMA_VERSION', '1');
    // Do not log tokens, account identifiers, folder IDs or deployment URLs.
    console.log(
      'CMS setup complete. Open Script Properties for configuration.',
    );
    return { ok: true, collections: Object.keys(CMS_TABLES) };
  } finally {
    lock.releaseLock();
  }
}

function doGet(event) {
  try {
    const params = event && event.parameter ? event.parameter : {};
    const expected =
      PropertiesService.getScriptProperties().getProperty('EXPORT_TOKEN');
    if (!expected || !cmsTokenEquals_(params.token, expected))
      return cmsJson_({ error: { code: 'UNAUTHORIZED' } });
    if (params.action !== 'export' && params.action !== 'list')
      return cmsJson_({ error: { code: 'UNKNOWN_ACTION' } });
    const snapshot = cmsReadSnapshot_();
    if (params.action === 'export') return cmsJson_(snapshot);
    const readable = [
      'projects',
      'team',
      'roles',
      'hods',
      'domains',
      'partners',
    ];
    if (readable.indexOf(params.collection) === -1)
      return cmsJson_({ error: { code: 'UNKNOWN_COLLECTION' } });
    return cmsJson_({
      collection: params.collection,
      data: snapshot[params.collection],
    });
  } catch (_error) {
    return cmsJson_({ error: { code: 'INVALID_CMS_DATA' } });
  }
}

function doPost() {
  return cmsJson_({ error: { code: 'READ_ONLY' } });
}

function cmsOwner_() {
  const active = Session.getActiveUser().getEmail().toLowerCase();
  const effective = Session.getEffectiveUser().getEmail().toLowerCase();
  const stored =
    PropertiesService.getScriptProperties().getProperty('OWNER_EMAIL');
  if (!active || active !== effective || (stored && active !== stored))
    throw new Error('Owner authorization required.');
  return active;
}

function cmsTokenEquals_(provided, expected) {
  if (typeof provided !== 'string' || provided.length !== expected.length)
    return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++)
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  return mismatch === 0;
}

function cmsJson_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function cmsSheetCell_(value) {
  const text = value === undefined ? '' : String(value);
  // Sheets interprets a leading equals sign as a formula even with setValues.
  return /^[=+'\-@]/.test(text) ? "'" + text : text;
}

function cmsCheckHeaders_(sheet, expected) {
  if (sheet.getLastColumn() !== expected.length)
    throw new Error('Unexpected Sheet columns.');
  const actual = sheet.getRange(1, 1, 1, expected.length).getValues()[0];
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error('Unexpected Sheet headers.');
}

function cmsReadSnapshot_() {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty('CMS_SCHEMA_VERSION') !== '1')
    throw new Error('CMS setup required.');
  const id = properties.getProperty('SPREADSHEET_ID');
  if (!id) throw new Error('CMS setup required.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const spreadsheet = SpreadsheetApp.openById(id);
    const tables = {};
    ['projects', 'team', 'roles', 'hods', 'domains', 'partners'].forEach(
      (name) => {
        const sheet = spreadsheet.getSheetByName(name);
        if (!sheet || !sheet.getLastRow())
          throw new Error('Missing CMS collection.');
        const headers = CMS_TABLES[name];
        cmsCheckHeaders_(sheet, headers);
        const values =
          sheet.getLastRow() > 1
            ? sheet
                .getRange(2, 1, sheet.getLastRow() - 1, headers.length)
                .getValues()
            : [];
        tables[name] = values
          .filter((row) => row.some((cell) => cell !== ''))
          .map((row) => {
            const record = {};
            headers.forEach((key, index) => {
              if (typeof row[index] !== 'string')
                throw new Error('CMS cells must be plain text.');
              record[key] = row[index];
            });
            return record;
          });
      },
    );
    return cmsSnapshotFromRows_(tables);
  } finally {
    lock.releaseLock();
  }
}

function cmsSeedRows_(snapshot) {
  const tables = { milestones: [], settings: [] };
  tables.projects = snapshot.projects.map((record) => ({
    ...record,
    tags: JSON.stringify(record.tags),
  }));
  tables.roles = snapshot.roles.map((record) => ({
    ...record,
    chips: JSON.stringify(record.chips),
    requirements: JSON.stringify(record.requirements),
  }));
  tables.hods = snapshot.hods.map((record) => ({
    ...record,
    tabs: JSON.stringify(record.tabs),
  }));
  tables.domains = snapshot.domains.map((record) => ({
    ...record,
    labels: JSON.stringify(record.labels),
  }));
  tables.team = [];
  [
    { id: 'leader', title: '', members: snapshot.team.leaderTeam },
    ...snapshot.team.hodsTeams,
  ].forEach((group) =>
    group.members.forEach((member, index) =>
      tables.team.push({
        id: group.id + '-' + (index + 1),
        group: group.id,
        groupTitle: group.title,
        ...member,
        order: String(index + 1),
      }),
    ),
  );
  tables.partners = [
    {
      id: 'default-logo',
      type: 'logo',
      order: '0',
      image: snapshot.partners.partnerLogo,
    },
    ...snapshot.partners.partnerCategories.map((category, index) => ({
      id: 'category-' + (index + 1),
      type: 'category',
      order: String(index + 1),
      label: category.label,
    })),
    ...snapshot.partners.whyPartners.map((record, index) => ({
      id: 'why-' + (index + 1),
      type: 'why',
      order: String(index + 1),
      ...record,
    })),
  ];
  return tables;
}

function cmsSorted_(records) {
  const seen = new Set();
  return records
    .slice()
    .sort((a, b) => Number(a.order) - Number(b.order))
    .map((record) => {
      const order = Number(record.order);
      if (
        !/^[1-9]\d*$/.test(record.order) ||
        !Number.isSafeInteger(order) ||
        seen.has(order)
      )
        throw new Error('Invalid CMS order.');
      seen.add(order);
      return record;
    });
}

function cmsSnapshotFromRows_(tables) {
  Object.keys(tables).forEach((name) => {
    if (name === 'milestones' || name === 'settings') return;
    const seen = new Set();
    tables[name].forEach((record) => {
      if (!record.id || seen.has(record.id))
        throw new Error('Invalid CMS record ID.');
      seen.add(record.id);
    });
  });
  const ordered = (records) => {
    if (records.length !== CMS_DOMAIN_IDS.length)
      throw new Error('Invalid domain slots.');
    return CMS_DOMAIN_IDS.map((id) => {
      const record = records.find((item) => item.id === id);
      if (!record) throw new Error('Missing domain route.');
      return record;
    });
  };
  if (
    tables.team.some(
      (record) => ['leader', ...CMS_DOMAIN_IDS].indexOf(record.group) === -1,
    )
  )
    throw new Error('Unknown team group.');
  const members = (group) =>
    cmsSorted_(tables.team.filter((record) => record.group === group));
  const memberContent = (record) => ({
    name: record.name,
    role: record.role,
    photo: record.photo,
  });
  const categories = cmsSorted_(
    tables.partners.filter((record) => record.type === 'category'),
  );
  const why = cmsSorted_(
    tables.partners.filter((record) => record.type === 'why'),
  );
  const logos = tables.partners.filter((record) => record.type === 'logo');
  if (
    logos.length !== 1 ||
    tables.partners.some(
      (record) => ['category', 'why', 'logo'].indexOf(record.type) === -1,
    )
  )
    throw new Error('Invalid partner records.');
  return {
    schemaVersion: 1,
    projects: tables.projects.map((record) => ({
      id: record.id,
      title: record.title,
      tags: JSON.parse(record.tags),
      description: record.description,
      image: record.image,
    })),
    team: {
      leaderTeam: members('leader').map(memberContent),
      hodsTeams: CMS_DOMAIN_IDS.map((id) => {
        const rows = members(id);
        if (
          !rows.length ||
          rows.some((record) => record.groupTitle !== rows[0].groupTitle)
        )
          throw new Error('Invalid team group title.');
        return {
          id,
          title: rows[0].groupTitle,
          members: rows.map(memberContent),
        };
      }),
    },
    roles: ordered(tables.roles).map((record) => {
      const role = {
        id: record.id,
        title: record.title,
        tagline: record.tagline,
        chips: JSON.parse(record.chips),
        deadline: record.deadline,
        about: record.about,
        requirements: JSON.parse(record.requirements),
        contact: record.contact,
      };
      if (record.whatsapp) role.whatsapp = record.whatsapp;
      return role;
    }),
    hods: ordered(tables.hods).map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      tabs: JSON.parse(record.tabs),
    })),
    domains: ordered(tables.domains).map((record) => ({
      id: record.id,
      title: record.title,
      description: record.description,
      labels: JSON.parse(record.labels),
    })),
    partners: {
      partnerCategories: categories.map((record) => ({ label: record.label })),
      partnerLogo: logos[0].image,
      whyPartners: why.map((record) => ({
        title: record.title,
        description: record.description,
      })),
    },
  };
}
