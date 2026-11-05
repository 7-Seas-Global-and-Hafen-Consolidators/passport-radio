const assert=require('node:assert/strict');
const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../js/passport-blog-comments.js'),'utf8');
function eligible(url){const u=new URL(url,'https://passportradio.online');const window={addEventListener(){}};vm.runInNewContext(source.replace('  function mount() {','  window.eligibleForTest = isBlogArticle;\n  function mount() {'),{window,location:u,URLSearchParams,document:{readyState:'loading',addEventListener(){}}});return window.eligibleForTest();}
const shared='/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html';
assert.equal(eligible('/blog.html'),false);assert.equal(eligible('/noticias.html'),false);
assert.equal(eligible(shared),false);assert.equal(eligible(shared+'?passport-area=news'),false);
assert.equal(eligible(shared+'?passport-area=blog'),true);
assert.equal(eligible('/blog/w/000001-led-zeppelin.html'),true);
assert.equal(eligible('/blog/w/000001-led-zeppelin.html?passport-area=news'),true);
console.log('PASS: Blog articles and explicit Blog context accepted; News and direct editorial entries excluded.');
