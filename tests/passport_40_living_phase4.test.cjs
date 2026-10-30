/* Phase 4 verifies presentation against the consolidated Phase 3 base. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base='f96f5868fc57f3ed5ef132666ea7ba012b260c35',doc='docs/living-collection-phase4-20261027';
const bytes=p=>fs.existsSync(p)?require('./editorial_presentation_preservation.cjs').read(p):cp.execFileSync('git',['show',`HEAD:${p}`],{maxBuffer:30*1024*1024});
const old=p=>cp.execFileSync('git',['show',`${base}:${p}`],{maxBuffer:30*1024*1024});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex'),manifest=()=>JSON.parse(bytes(doc+'/artwork-manifest.json'));
const inventory=JSON.parse(bytes('data/passport-radio-inventory.json')),order=[11,4,5,6,7,9],rows=order.flatMap(n=>inventory.records.filter(r=>r.section===n));
test('Phase 4: exact 150 entries, 401 radios, identifiers and all protected behaviour preserved',()=>{
 assert.equal(inventory.radioCount,401);assert.equal(inventory.programSelectorCount,11);assert.deepEqual(order.map(n=>inventory.records.filter(r=>r.section===n).length),[22,48,10,11,42,17]);assert.equal(rows.length,150);
 for(const p of ['data/passport-radio-inventory.json','js/world-radio-player.js','js/passport-bus.js','js/passport-audio-mutex.js','js/passport-audio-continuity.js','js/passport-persist-nav.js','assets/index-DgBCruM8.js','index.html','noticias.html','js/passport-universal-footer.js','js/passport-videos.js','js/passport-living-earth.js','js/passport-living-disco.js','js/passport-living-performance.js'])assert.equal(sha(bytes(p)),sha(old(p)),p);
});
test('Phase 4: all three approved collections and their artwork remain byte-identical',()=>{
 const folders=['docs/living-collection-world-dial-20261027','docs/living-collection-dance-20261027','docs/living-collection-rock-pop-20261027'];const paths=[...folders];
 for(const folder of folders)for(const a of JSON.parse(bytes(folder+'/artwork-manifest.json')).artworks)paths.push(a.image.slice(1));
 assert.equal(cp.execFileSync('git',['diff','--name-only',base,'--',...paths,'images/radio/living-collection/earth-blue-marble.jpg'],{encoding:'utf8'}).trim(),'');
});
test('Phase 4: 150 individually sourced profiled WebP photographs map to exact existing records',()=>{
 const m=manifest();assert.equal(m.actual_count,150);assert.equal(m.artworks.length,150);assert.deepEqual(m.artworks.map(a=>[a.id,a.name,a.section]),rows.map(r=>[r.id,r.name,r.section]));
 for(const key of ['id','image','sha256','visual_hash'])assert.equal(new Set(m.artworks.map(a=>a[key])).size,150,key);
 for(const a of m.artworks){assert.equal(a.image,`/images/radio/living-collection/${a.id}.webp`);assert(a.subject&&a.unique_artwork&&a.provenance.page);assert(!('stream'in a||'origin'in a));assert(!/X-Amz-|[?&](token|signature|key)=/i.test(JSON.stringify(a)));const b=bytes(a.image.slice(1));assert.equal(b.length,a.bytes);assert(b.length>512&&b.length<=102400,a.id);assert.equal(sha(b),a.sha256,a.id);assert.equal(b.toString('ascii',8,12),'WEBP');let dim,icc=false;for(let p=12;p+8<b.length;){const t=b.toString('ascii',p,p+4),n=b.readUInt32LE(p+4);if(t==='VP8X')dim=[b.readUIntLE(p+12,3)+1,b.readUIntLE(p+15,3)+1];if(t==='ICCP')icc=true;p+=8+n+(n%2);}assert.deepEqual(dim,[512,512],a.id);assert(icc,a.id);}
 const artist={'passport-nrj-1156':'BTS','passport-nrj-1034':'Drake (musician)','passport-nrj-51':'Rihanna','specialx:2':'The Warning (band)','specialx:5':'Accept (band)','specialx:6':'Pink Floyd','artistsx:5':'Queen (band)','live-rare:0':'The Cars'};
 for(const [id,subject]of Object.entries(artist))assert.equal(m.artworks.find(a=>a.id===id).subject,subject,id);
 const soap=['A Gata Comeu','Roque Santeiro','Vale Tudo','Tieta','O Rei do Gado','Mulheres de Areia','A Próxima Vítima','O Clone','Laços de Família'];soap.forEach((s,i)=>assert(m.artworks.find(a=>a.id==='novelas:'+i).subject.includes(s)));
});
test('Phase 4: exact shared click handler, names, category order, search and previous header markup preserved',()=>{
 const now=bytes('js/passport-radio-grid.js').toString(),before=old('js/passport-radio-grid.js').toString();
 for(const re of [/button.addEventListener\('click',[\s\S]*?\n        \}\);/,/const locate = \(\) => \{[\s\S]*?\n    \};/,/const sections = .*;/,/\[1,2,3,11,4,5,6,7,8,9,10\]/,/      if \(number === 8\) \{[\s\S]*?\n      \}/,/      if \(number === 1\) \{[\s\S]*?\n      \}/,/      if \(number === 2 \|\| number === 3\) \{[\s\S]*?\n      \}/])assert.equal(now.match(re)[0],before.match(re)[0]);
 assert(bytes('css/passport-radio-grid.css').toString().startsWith(old('css/passport-radio-grid.css').toString()));assert(now.includes('|| phase4Sections[number])'));
});
test('Phase 4: six isolated photographic equipment resources and silent motion respect visibility and reduced motion',()=>{
 for(const key of ['kpop-stage','soul-bass','brasil-instruments','jazz-piano','live-stage','signals-dish']){const b=bytes(`images/radio/living-collection/phase4-${key}.webp`);assert.equal(b.toString('ascii',8,12),'WEBP');assert(b[20]&16,'alpha '+key);}
 const css=bytes('css/passport-radio-grid.css').toString().split('/* Living Collection™ — Phase 4:')[1];assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('data-motion=running'));for(const token of ['living-string-note','living-piano-note','living-stage-light','living-pandeiro-note','living-reception-pulse'])assert(css.includes(token));assert(!/\.gif|base64|<audio|PassportBus|\.play\(/i.test(css));
});
