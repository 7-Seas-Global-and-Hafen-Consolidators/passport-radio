const SITE = 'https://passportradio.online';
const INBOX = 'passportradio.online@gmail.com';
const TAB = 'Moderação';

function prepararPlanilha() {
  const properties = PropertiesService.getScriptProperties();
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const existing = properties.getProperty('COMMENTS_SHEET_ID');
    if (existing) {
      console.log(SpreadsheetApp.openById(existing).getUrl());
      return;
    }
    const book = SpreadsheetApp.create('Passport Radio — Moderação de comentários');
    const sheet = book.getSheets()[0].setName(TAB);
    sheet.appendRow(['ID', 'Recebido em', 'Matéria', 'Apelido', 'Comentário', 'Moderação', 'Aviso Gmail']);
    sheet.setFrozenRows(1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['PENDENTE', 'APROVADO', 'REJEITADO'], true).setAllowInvalid(false).build();
    sheet.getRange('F2:F').setDataValidation(rule);
    properties.setProperty('COMMENTS_SHEET_ID', book.getId());
    console.log(book.getUrl());
  } finally {
    lock.releaseLock();
  }
}

function doPost(event) {
  const fields = event && event.parameter || {};
  const id = String(fields.requestId || '');
  const validId = /^[0-9a-f-]{36}$/.test(id);
  let received = false;
  if (validId) {
    try {
      received = registrar(fields, id);
    } catch (error) {
      console.error('Falha no recebimento de comentário.');
    }
  }
  const message = JSON.stringify({ type: 'passport-comment', id: validId ? id : '', received });
  return HtmlService.createHtmlOutput(
    '<!doctype html><meta charset="utf-8"><script>window.top.postMessage(' +
    message + ', ' + JSON.stringify(SITE) + ');</script>'
  ).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function registrar(fields, id) {
  const nickname = String(fields.nickname || '').trim();
  const comment = String(fields.comment || '').trim();
  const path = String(fields.article || '');
  const articlePattern = /^\/(?:blog\/w\/|editorial\/\d{4}\/\d{2}\/\d{2}\/)[a-z0-9-]+\.html$/;
  if (fields.website || !nickname || nickname.length > 60 || comment.length < 2 ||
      comment.length > 2000 || path.length > 240 || !articlePattern.test(path)) return false;

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  let sheet;
  try {
    const bookId = PropertiesService.getScriptProperties().getProperty('COMMENTS_SHEET_ID');
    sheet = SpreadsheetApp.openById(bookId).getSheetByName(TAB);
    const last = sheet.getLastRow();
    if (last > 1 && sheet.getRange(2, 1, last - 1, 1).createTextFinder(id).matchEntireCell(true).findNext()) return true;
    // Bound bursts on the anonymous endpoint without collecting IPs or email addresses.
    const cache = CacheService.getScriptCache();
    const minute = 'comments-' + Math.floor(Date.now() / 60000);
    const count = Number(cache.get(minute) || 0);
    if (count >= 10) return false;
    cache.put(minute, String(count + 1), 120);
    // Apostrophes force visitor input to remain literal text in Sheets.
    sheet.appendRow([id, new Date(), SITE + path, "'" + nickname, "'" + comment, 'PENDENTE', 'PENDENTE']);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }
  let notification = 'ENVIADO';
  try {
    if (MailApp.getRemainingDailyQuota() < 1) {
      notification = 'COTA ESGOTADA';
    } else {
      MailApp.sendEmail(INBOX, 'Passport Radio — comentário para moderar',
        'Há um comentário pendente na planilha privada.\nMatéria: ' + SITE + path + '\nID: ' + id);
    }
  } catch (error) {
    notification = 'FALHOU';
  }
  try {
    const entry = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1)
      .createTextFinder(id).matchEntireCell(true).findNext();
    if (entry) sheet.getRange(entry.getRow(), 7).setValue(notification);
  } catch (error) {
    console.error('Não foi possível atualizar o status do aviso.');
  }
  return true;
}

// Public read endpoint: no pending/rejected rows or moderation metadata leave Sheets.
function doGet(event) {
  const parameters = event && event.parameter || {};
  const article = String(parameters.article || '');
  const callback = String(parameters.callback || '');
  const validArticle = /^\/(?:blog\/w\/|editorial\/\d{4}\/\d{2}\/\d{2}\/)[a-z0-9-]+\.html$/.test(article);
  const validCallback = /^PassportApprovedComments_[a-f0-9]{32}$/.test(callback);
  let payload = { type: 'passport-approved-comments', article, comments: [] };
  if (!validArticle || (callback && !validCallback)) {
    payload = { type: 'passport-approved-comments', article: '', comments: [], unavailable: true };
  } else {
    try { payload.comments = lerComentariosAprovados(article); }
    catch (_) { payload.unavailable = true; }
  }
  // Escape script-breaking characters without changing the reader's text.
  const json = JSON.stringify(payload).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return ContentService.createTextOutput(validCallback ? callback + '(' + json + ');' : json)
    .setMimeType(validCallback ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function lerComentariosAprovados(article) {
  const id = PropertiesService.getScriptProperties().getProperty('COMMENTS_SHEET_ID');
  const sheet = SpreadsheetApp.openById(id).getSheetByName(TAB);
  const last = sheet.getLastRow();
  if (last < 2) return [];
  const seen = new Set();
  const published = [];
  sheet.getRange(2, 1, last - 1, 6).getValues().forEach(row => {
    if (row[5] !== 'APROVADO' || row[2] !== SITE + article) return;
    const commentId = String(row[0] || '');
    const nickname = String(row[3] || '');
    const comment = String(row[4] || '');
    const date = new Date(row[1]);
    if (!/^[0-9a-f-]{36}$/.test(commentId) || seen.has(commentId) || !nickname || !comment || !Number.isFinite(date.getTime())) return;
    seen.add(commentId);
    published.push({ id: commentId, nickname, comment, submittedAt: date.toISOString() });
  });
  return published.sort((a, b) => a.submittedAt.localeCompare(b.submittedAt) || a.id.localeCompare(b.id));
}
