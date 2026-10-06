// Team content only. Group/card design stays in the static site.
const ADMIN_TEAM_HEADERS = [
  'id',
  'group',
  'groupTitle',
  'name',
  'role',
  'photo',
  'order',
];
const ADMIN_TEAM_GROUPS = [
  'leader',
  'data',
  'core',
  'language',
  'vision',
  'product',
  'growth',
];
const ADMIN_TEAM_TITLES = [
  '',
  'Data Intelligence',
  'Core AI & Engineering',
  'Language & Reasoning',
  'Vision & Multimodal',
  'Product & Software',
  'Growth & Community',
];

function adminTeamSheet_() {
  const id =
    PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (!id) adminFail_('CONFIGURATION');
  const sheet = SpreadsheetApp.openById(id).getSheetByName('team');
  if (
    !sheet ||
    sheet.getLastColumn() !== 7 ||
    JSON.stringify(sheet.getRange(1, 1, 1, 7).getValues()[0]) !==
      JSON.stringify(ADMIN_TEAM_HEADERS)
  )
    adminFail_('INVALID_DATA');
  return sheet;
}
function adminValidateMember_(member) {
  if (
    !member ||
    typeof member !== 'object' ||
    Array.isArray(member) ||
    Object.keys(member).sort().join(',') !== 'group,id,name,order,photo,role' ||
    typeof member.id !== 'string' ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(member.id) ||
    !ADMIN_TEAM_GROUPS.includes(member.group) ||
    !Number.isInteger(member.order) ||
    member.order < 1 ||
    member.order > 8
  )
    adminFail_('INVALID_INPUT');
  for (const key of ['name', 'role'])
    if (
      typeof member[key] !== 'string' ||
      !member[key].trim() ||
      member[key].length > 80 ||
      /[\r\n]/.test(member[key])
    )
      adminFail_('INVALID_INPUT');
  if (!['marchel', 'zidan-rose'].includes(member.photo)) {
    if (
      typeof member.photo !== 'string' ||
      !/^\/images\/cms\/team\/[a-f0-9]{64}\.webp$/.test(member.photo)
    )
      adminFail_('INVALID_INPUT');
    cmsMediaFile_(member.photo);
  }
  return {
    id: member.id,
    group: member.group,
    name: member.name,
    role: member.role,
    photo: member.photo,
    order: member.order,
  };
}
function adminValidateTeam_(records) {
  const seen = new Set();
  records.forEach((member) => {
    adminValidateMember_(member);
    if (seen.has(member.id)) adminFail_('INVALID_DATA');
    seen.add(member.id);
  });
  ADMIN_TEAM_GROUPS.forEach((group) => {
    const members = records.filter((m) => m.group === group);
    if (members.length < 1) adminFail_('MINIMUM');
    if (members.length > 8) adminFail_('LIMIT');
    if (new Set(members.map((m) => m.order)).size !== members.length)
      adminFail_('INVALID_INPUT');
  });
  return records;
}
function adminReadTeam_() {
  const sheet = adminTeamSheet_();
  const height = sheet.getLastRow() - 1;
  if (height < 7 || height > 1000) adminFail_('INVALID_DATA');
  const records = sheet
    .getRange(2, 1, height, 7)
    .getValues()
    .filter((row) => row.some((v) => v !== ''))
    .map((row) => {
      if (
        row.some((v) => typeof v !== 'string') ||
        !/^[1-8]$/.test(row[6]) ||
        row[2] !== ADMIN_TEAM_TITLES[ADMIN_TEAM_GROUPS.indexOf(row[1])]
      )
        adminFail_('INVALID_DATA');
      return adminValidateMember_({
        id: row[0],
        group: row[1],
        name: row[3],
        role: row[4],
        photo: row[5],
        order: Number(row[6]),
      });
    });
  return adminValidateTeam_(records);
}
function adminTeamState_(members) {
  const records = members || adminReadTeam_();
  return {
    members: records,
    revision: adminRevision_(records),
    groups: ADMIN_TEAM_GROUPS.map((id, i) => ({
      id,
      title: i ? ADMIN_TEAM_TITLES[i] : 'Leader Team',
    })),
    photoPresets: Array.from(
      new Set(['marchel', 'zidan-rose', ...records.map((m) => m.photo)]),
    ),
    minMembers: 1,
    maxMembers: 8,
    publicationPending:
      PropertiesService.getScriptProperties().getProperty(
        'PUBLICATION_PENDING',
      ) === 'true',
  };
}
function adminLoadTeam() {
  return adminResult_(() => {
    adminAuthorize_();
    return adminTeamState_();
  });
}
function adminAddMember(request) {
  return adminMutateTeam_('add', request);
}
function adminSaveMember(request) {
  return adminMutateTeam_('save', request);
}
function adminDeleteMember(request) {
  return adminMutateTeam_('delete', request);
}
function adminUploadTeamImage(request) {
  return adminUploadImage_(request, 'team');
}
function adminReadTeamImage(request) {
  return adminReadImage_(request, 'team');
}
function adminMutateTeam_(operation, request) {
  return adminResult_(() => {
    adminAuthorize_();
    adminHooks_();
    if (
      !request ||
      typeof request !== 'object' ||
      Array.isArray(request) ||
      Object.keys(request).sort().join(',') !==
        (operation === 'delete' ? 'id,revision' : 'member,revision') ||
      typeof request.revision !== 'string'
    )
      adminFail_('INVALID_INPUT');
    const lock = LockService.getScriptLock();
    lock.waitLock(30000);
    let state;
    try {
      const members = adminReadTeam_();
      if (adminRevision_(members) !== request.revision) adminFail_('CONFLICT');
      let affectedId;
      if (operation === 'delete') {
        if (typeof request.id !== 'string') adminFail_('INVALID_INPUT');
        const index = members.findIndex((m) => m.id === request.id);
        if (index < 0) adminFail_('NOT_FOUND');
        affectedId = request.id;
        const oldGroup = members[index].group;
        members.splice(index, 1);
        adminTeamReorder_(members, oldGroup);
      } else {
        let input = request.member;
        if (operation === 'add') {
          if (
            !input ||
            Object.keys(input).sort().join(',') !==
              'group,name,order,photo,role'
          )
            adminFail_('INVALID_INPUT');
          input = {
            ...input,
            id: 'member-' + Utilities.getUuid().toLowerCase(),
          };
          if (members.some((m) => m.id === input.id)) adminFail_('COLLISION');
        }
        const member = adminValidateMember_(input);
        if (
          members.filter((m) => m.group === member.group && m.id !== member.id)
            .length >= 8
        )
          adminFail_('LIMIT');
        affectedId = member.id;
        let oldGroup;
        if (operation === 'add') members.push(member);
        else {
          const index = members.findIndex((m) => m.id === member.id);
          if (index < 0) adminFail_('NOT_FOUND');
          oldGroup = members[index].group;
          members[index] = member;
        }
        if (oldGroup && oldGroup !== member.group)
          adminTeamReorder_(members, oldGroup);
        adminTeamReorder_(members, member.group, member.id, member.order);
      }
      adminValidateTeam_(members);
      const sheet = adminTeamSheet_();
      const height = Math.max(members.length, sheet.getLastRow() - 1);
      const values = Array.from({ length: height }, (_, i) =>
        members[i]
          ? [
              members[i].id,
              members[i].group,
              ADMIN_TEAM_TITLES[ADMIN_TEAM_GROUPS.indexOf(members[i].group)],
              members[i].name,
              members[i].role,
              members[i].photo,
              String(members[i].order),
            ].map(adminCell_)
          : Array(7).fill(''),
      );
      const range = sheet.getRange(2, 1, height, 7);
      range.setNumberFormat('@');
      range.setValues(values);
      PropertiesService.getScriptProperties().setProperty(
        'PUBLICATION_PENDING',
        'true',
      );
      SpreadsheetApp.flush();
      state = { ...adminTeamState_(members), affectedId };
    } finally {
      lock.releaseLock();
    }
    let publication;
    try {
      publication = adminPublish_();
    } catch {
      publication = ['testing', 'production'].map((target) => ({
        target,
        accepted: false,
      }));
    }
    return {
      ...state,
      saved: true,
      publicationPending: publication.some((p) => !p.accepted),
      publication,
    };
  });
}

function adminTeamReorder_(members, group, insertedId, position) {
  const ordered = members
    .filter((m) => m.group === group && m.id !== insertedId)
    .sort((a, b) => a.order - b.order);
  if (insertedId)
    ordered.splice(
      Math.min(position - 1, ordered.length),
      0,
      members.find((m) => m.id === insertedId),
    );
  ordered.forEach((m, i) => (m.order = i + 1));
}
