// Dedicated recruitment intake. Never install into CMS Export/Admin projects.
function doGet() {
  return recruitmentJson_({ ok: false, error: { code: 'METHOD_NOT_ALLOWED' } });
}
function doPost(e) {
  let lock;
  try {
    const properties = PropertiesService.getScriptProperties();
    const token = properties.getProperty('RECRUITMENT_GAS_TOKEN');
    const sheetId = properties.getProperty('RECRUITMENT_SHEET_ID');
    if (
      !token ||
      token.length < 32 ||
      !sheetId ||
      properties.getProperty('RECRUITMENT_OPEN') !== 'true'
    )
      throw new Error('CLOSED');
    const raw = e && e.postData && e.postData.contents;
    if (typeof raw !== 'string' || raw.length > 32768)
      throw new Error('INVALID_INPUT');
    const body = JSON.parse(raw);
    if (body.token !== token) throw new Error('UNAUTHORIZED');
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.id || '',
      )
    )
      throw new Error('INVALID_INPUT');
    const fields = validateApplication(body.fields);
    const hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      JSON.stringify(fields),
      Utilities.Charset.UTF_8,
    )
      .map(function (byte) {
        return ('0' + ((byte + 256) % 256).toString(16)).slice(-2);
      })
      .join('');
    lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const sheet =
      SpreadsheetApp.openById(sheetId).getSheetByName('applications');
    const columns = ['receipt', 'content_hash', 'received_at'].concat(
      APPLICATION_FIELDS,
    );
    if (
      !sheet ||
      JSON.stringify(sheet.getRange(1, 1, 1, columns.length).getValues()[0]) !==
        JSON.stringify(columns)
    )
      throw new Error('CONFIGURATION');
    if (sheet.getLastRow() > 1) {
      const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues();
      const prior = rows.find(function (row) {
        return row[0] === body.id;
      });
      if (prior) {
        if (prior[1] !== hash) throw new Error('ID_CONFLICT');
        return recruitmentJson_({ ok: true, receipt: body.id });
      }
    }
    const row = [body.id, hash, new Date().toISOString()].concat(
      APPLICATION_FIELDS.map(function (name) {
        const value = Array.isArray(fields[name])
          ? JSON.stringify(fields[name])
          : fields[name];
        return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
      }),
    );
    sheet
      .getRange(sheet.getLastRow() + 1, 1, 1, columns.length)
      .setNumberFormat('@')
      .setValues([row]);
    SpreadsheetApp.flush();
    return recruitmentJson_({ ok: true, receipt: body.id });
  } catch (error) {
    const codes = [
      'CLOSED',
      'INVALID_INPUT',
      'UNAUTHORIZED',
      'ID_CONFLICT',
      'CONFIGURATION',
    ];
    return recruitmentJson_({
      ok: false,
      error: {
        code: codes.includes(error.message) ? error.message : 'SERVER_ERROR',
      },
    });
  } finally {
    if (lock) lock.releaseLock();
  }
}
function recruitmentJson_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
// Run manually once in the NEW recruitment project, with private Sheet ID set.
// Does not create a Sheet, modify CMS or replace any existing rows.
function prepareRecruitmentSheet() {
  const id = PropertiesService.getScriptProperties().getProperty(
    'RECRUITMENT_SHEET_ID',
  );
  if (!id) throw new Error('CONFIGURATION');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const spreadsheet = SpreadsheetApp.openById(id);
    const sheet =
      spreadsheet.getSheetByName('applications') ||
      spreadsheet.insertSheet('applications');
    if (sheet.getLastRow() !== 0) throw new Error('SHEET_NOT_EMPTY');
    const headers = ['receipt', 'content_hash', 'received_at'].concat(
      APPLICATION_FIELDS,
    );
    sheet
      .getRange(1, 1, 1, headers.length)
      .setNumberFormat('@')
      .setValues([headers]);
    sheet.setFrozenRows(1);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
}
