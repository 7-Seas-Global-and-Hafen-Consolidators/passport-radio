const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

const code = fs.readFileSync(require('node:path').join(__dirname, 'Code.gs'), 'utf8');
const requestId = 'fcefe789-74b4-4c86-b3fc-96b093160e21';

function fixture(quota = 100, mailFails = false) {
  const rows = [['ID']];
  const mail = [];
  const cache = new Map();
  const sheet = {
    getLastRow: () => rows.length,
    appendRow: row => rows.push(row),
    getRange: (r, column) => ({
      setValue: value => { rows[r - 1][column - 1] = value; },
      createTextFinder: id => ({ matchEntireCell: () => ({
        findNext: () => {
          const index = rows.findIndex(row => row[0] === id);
          return index < 0 ? null : { getRow: () => index + 1 };
        }
      }) })
    })
  };
  const context = vm.createContext({
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => 'private-sheet' }) },
    CacheService: { getScriptCache: () => ({ get: key => cache.get(key), put: (key, v) => cache.set(key, v) }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: () => sheet }), flush() {} },
    MailApp: {
      getRemainingDailyQuota: () => quota,
      sendEmail: (...args) => {
        if (mailFails) throw new Error('provider unavailable');
        mail.push(args);
      }
    },
    HtmlService: {
      createHtmlOutput: html => ({ setXFrameOptionsMode: () => html }),
      XFrameOptionsMode: { ALLOWALL: 1 }
    }
  });
  vm.runInContext(code, context);
  const submit = (overrides = {}) => context.doPost({ parameter: {
    requestId, nickname: 'Leitor', comment: 'Ótima matéria', article: '/blog/w/000001-led-zeppelin.html', ...overrides
  } });
  return { rows, mail, submit };
}

test('stores pending submission, signals success and sends one Gmail notice across retries', () => {
  const f = fixture();
  assert.match(f.submit({ comment: '=1+1' }), /"received":true/);
  assert.match(f.submit({ comment: '=1+1' }), /"received":true/);
  assert.equal(f.rows.length, 2);
  assert.equal(f.rows[1][4], "'=1+1");
  assert.equal(f.rows[1][5], 'PENDENTE');
  assert.equal(f.rows[1][6], 'ENVIADO');
  assert.equal(f.mail.length, 1);
  assert.equal(f.mail[0][0], 'passportradio.online@gmail.com');
  assert.doesNotMatch(f.mail[0][2], /=1\+1/);
});

test('rejects non-article paths, bot field, invalid ID and oversized text', () => {
  const f = fixture();
  for (const invalid of [{ article: '//evil.example' }, { website: 'bot' }, { requestId: '</script>' }, { comment: 'a'.repeat(2001) }]) {
    const response = f.submit(invalid);
    assert.match(response, /"received":false/);
    assert.equal((response.match(/<\/script>/g) || []).length, 1);
  }
  assert.equal(f.rows.length, 1);
  assert.equal(f.mail.length, 0);
});

test('keeps comments pending when Gmail quota is exhausted or the notice fails', () => {
  for (const [f, expected] of [[fixture(0), 'COTA ESGOTADA'], [fixture(100, true), 'FALHOU']]) {
    assert.match(f.submit(), /"received":true/);
    assert.equal(f.rows[1][5], 'PENDENTE');
    assert.equal(f.rows[1][6], expected);
  }
});
