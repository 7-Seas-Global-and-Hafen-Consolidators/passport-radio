const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const cp=require('node:child_process');
const read=p=>fs.readFileSync(p,'utf8');
const baseline=JSON.parse(read('docs/passport-clips-tv-20261011/before.json'));
test('protected radio, video, podcast, broadcast, footer and Home files are identical',()=>{
  for(const [path,hash] of Object.entries(baseline.protected))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),hash,path);
  const old=cp.execFileSync('git',['show',baseline.base+':js/passport-radio-grid.js'],{encoding:'utf8'});
  assert.equal(read('js/passport-radio-grid.js'),old.replace("tv.href = '/videos.html#passport-clips-tv'","tv.href = '/clips-tv.html'"));
  const oldVideos=cp.execFileSync('git',['show',baseline.base+':videos.html'],{encoding:'utf8'});
  assert.equal(read('videos.html'),oldVideos.replace('<link rel="stylesheet" href="/css/passport-clips-tv.css">\n<script src="/js/passport-clips-tv.js" defer></script>\n',''));
});
test('11 approved TV channels with unique identities, original first and exact supplied URLs',()=>{
  const c=JSON.parse(read('data/passport-clips-channels.json')).channels;assert.equal(c.length,11);
  assert.equal(new Set(c.map(x=>x.id)).size,11);assert.equal(new Set(c.map(x=>x.stream)).size,11);
  const old=cp.execFileSync('git',['show',baseline.base+':js/passport-clips-tv.js'],{encoding:'utf8'});
  assert.equal(c[0].stream,old.match(/const SOURCE = '([^']+)'/)[1]);
  assert.deepEqual(c.map(x=>x.name),['Passport Clips TV™','80s Flashback','90s Throwback','Rock On','Just Chill','Siempre Latino','Hits','Nuevo Latino','Classic Country','Celebrates','Hits UK']);
  for(const x of c)assert.equal(new URL(x.stream).protocol,'https:');
  for(const excluded of ['Classic Jams','Groove','Rap Game','Hip-Hop','Country Today','Gothic','Unplugged'])assert(!c.some(x=>x.name.includes(excluded)));
});
test('new page is indexable, accessible, separate from videoteca and uses canonical shared footer',()=>{
 const html=read('clips-tv.html');assert(html.includes('https://passportradio.online/clips-tv.html'));assert(!/noindex|autoplay/.test(html));
 assert(html.includes('TODAS AS TELAS. TODOS OS CLIPES.'));assert(html.includes('/js/passport-universal-footer.js'));assert(html.includes('preload="none"'));assert(html.includes('/videos.html'));assert(html.includes('/blog/arquivo/letras.html'));
 assert.equal((html.match(/<video\b/g)||[]).length,1);assert(!html.includes('passport-videos.js'));
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 assert(!read('videos.html').includes('/js/passport-clips-tv.js'));
});
