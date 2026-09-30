const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');
const source = fs.readFileSync('js/passport-editorial-copy.js', 'utf8');
const path = '/historias/musica.html';
const canonical = 'https://www.passportradio.online' + path;

// A small DOM contract fixture exercises the actual copy handler, without network or audio.
function fixture(options = {}) {
  const root = { contains: node => node === end, querySelectorAll: () => options.crosses ? [{}] : [] };
  const start = { nodeType: 1, closest: selector => selector.startsWith('.pe-prose') ? root : options.startExcluded ? {} : null };
  const end = { nodeType: 1, closest: () => options.endExcluded ? {} : null };
  const range = { startContainer: start, endContainer: options.outside ? {} : end, intersectsNode: () => true };
  const selection = { isCollapsed: !!options.collapsed, rangeCount: options.multiple ? 2 : 1, getRangeAt: () => range, toString: () => options.text ?? 'A música atravessa o tempo.\n' };
  let handler, installed = 0, prevented = false, copied;
  const document = {
    body: { classList: { contains: () => !options.nonArticle } },
    activeElement: { nodeType: 1, closest: () => options.field ? {} : null },
    querySelector: selector => selector === '.pe-prose' ? options.nonArticle ? null : root :
      selector.includes('canonical') ? { getAttribute: () => options.canonical ?? canonical } :
      options.og ? { getAttribute: () => options.og } : null,
    addEventListener: (name, fn) => { assert.equal(name, 'copy'); handler = fn; installed++; }
  };
  const context = { document, window: { getSelection: () => selection }, location: { pathname: path }, URL };
  vm.runInNewContext(source, context);
  vm.runInNewContext(source, context);
  const event = {
    defaultPrevented: !!options.alreadyHandled,
    target: { nodeType: 1, closest: () => options.control ? {} : null },
    clipboardData: options.noClipboard ? null : { setData: (type, text) => {
      if (options.denied) throw new Error('denied');
      assert.equal(type, 'text/plain'); copied = text;
    } },
    preventDefault: () => { prevented = true; }
  };
  if (handler) handler(event);
  return { copied, prevented, installed };
}

test('preserves selected text including its trailing newline, appends exact story canonical once', () => {
  assert.deepEqual(fixture(), { copied: 'A música atravessa o tempo.\n\n\nLeia a matéria completa na Passport Radio:\n' + canonical, prevented: true, installed: 1 });
});
test('valid equivalent og:url is used only if canonical is unusable and matches this story', () => {
  assert.equal(fixture({canonical: 'https://www.passportradio.online/', og: canonical}).copied.endsWith(canonical), true);
});
for (const url of ['https://www.passportradio.online/', 'https://www.passportradio.online/noticias.html', 'https://evil.example' + path, 'javascript:alert(1)', 'https://user:secret@www.passportradio.online' + path, 'https://www.passportradio.online:444' + path, canonical + '#player', '']) {
  test('rejects incorrect canonical: ' + url, () => assert.equal(fixture({canonical:url}).prevented, false));
}
for (const name of ['nonArticle','field','control','startExcluded','endExcluded','outside','crosses','collapsed','multiple','alreadyHandled','noClipboard','denied']) {
  test('native copy preserved for ' + name, () => assert.equal(fixture({[name]:true}).prevented, false));
}
for (const text of ['https://www.passportradio.online/noticias.html', 'www.example.org', '/radio.html', 'mailto:editor@example.org', '   ']) {
  test('deliberate URL/empty selection stays native: ' + text, () => assert.equal(fixture({text}).prevented, false));
}
