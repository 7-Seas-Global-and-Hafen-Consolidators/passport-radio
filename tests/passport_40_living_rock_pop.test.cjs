/* Phase 3: exact preservation plus presentation-only coverage for both real sections. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base='14daec637ff970bd0b505276cc944be8d189bedc';
const bytes=p=>fs.existsSync(p)?require('./editorial_presentation_preservation.cjs').read(p):cp.execFileSync('git',['show',`HEAD:${p}`],{maxBuffer:20*1024*1024});
const old=p=>cp.execFileSync('git',['show',`${base}:${p}`],{maxBuffer:20*1024*1024});
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const inventory=JSON.parse(bytes('data/passport-radio-inventory.json')),rows=[...inventory.records.filter(r=>r.section===2),...inventory.records.filter(r=>r.section===3)];
const manifest=()=>JSON.parse(bytes('docs/living-collection-rock-pop-20261027/artwork-manifest.json'));
test('Phase 3: 401 radios and actual 46 Rock + 123 Pop records retain every byte, name, order and stream',()=>{
 assert.equal(inventory.radioCount,401);assert.equal(inventory.programSelectorCount,11);assert.equal(inventory.records.filter(r=>r.section===2).length,46);assert.equal(inventory.records.filter(r=>r.section===3).length,123);assert.equal(rows.length,169);
 for(const p of ['data/passport-radio-inventory.json','js/world-radio-player.js','js/passport-bus.js','js/passport-audio-mutex.js','js/passport-audio-continuity.js','js/passport-persist-nav.js','assets/index-DgBCruM8.js','index.html','noticias.html','js/passport-universal-footer.js','js/passport-videos.js','js/passport-living-earth.js','js/passport-living-disco.js'])assert.equal(digest(bytes(p)),digest(old(p)),p);
});
test('Phase 3: approved World Dial and Dance imagery/evidence remain intact',()=>{
 const paths=['docs/living-collection-world-dial-20261027','docs/living-collection-dance-20261027'];
 for(const folder of [...paths]){const m=JSON.parse(bytes(folder+'/artwork-manifest.json'));paths.push(...m.artworks.map(a=>a.image.slice(1)));if(paths.length>500)throw Error('invalid preservation list');}
 assert.equal(cp.execFileSync('git',['diff','--name-only',base,'--',...paths,'images/radio/living-collection/earth-blue-marble.jpg'],{encoding:'utf8'}).trim(),'');
});
test('Phase 3: selection, search, category order and approved header code are unchanged',()=>{
 const now=bytes('js/passport-radio-grid.js').toString(),before=old('js/passport-radio-grid.js').toString();
 for(const expression of [/button.addEventListener\('click',[\s\S]*?\n        \}\);/,/const locate = \(\) => \{[\s\S]*?\n    \};/,/const sections = .*;/,/\[1,2,3,11,4,5,6,7,8,9,10\]/,/      if \(number === 8\) \{[\s\S]*?\n      \}/,/      if \(number === 1\) \{[\s\S]*?\n      \}/,/const tv = [\s\S]*?catalog.append\(tv\);/])assert.equal(now.match(expression)[0],before.match(expression)[0]);
 assert(bytes('css/passport-radio-grid.css').toString().startsWith(old('css/passport-radio-grid.css').toString()));
 assert(now.includes('if (number === 8 || number === 1 || number === 2 || number === 3 || phase4Sections[number])'));
});
test('Phase 3: all 169 stable IDs have one distinct local photograph in the real section order',()=>{
 const m=manifest();assert.equal(m.actual_count,169);assert.deepEqual(m.artworks.map(a=>[a.id,a.name,a.section]),rows.map(r=>[r.id,r.name,r.section]));
 for(const key of ['id','image','sha256','visual_hash'])assert.equal(new Set(m.artworks.map(a=>a[key])).size,169,key);
 assert(m.minimum_visual_hash_distance>0);
 for(const a of m.artworks){assert.equal(a.image,`/images/radio/living-collection/${a.id}.webp`);assert(a.subject&&a.unique_artwork);assert(!('stream'in a||'origin'in a||'source'in a));}
 const named={'passport-nrj-1957':'Linkin Park','passport-nrj-29':'Michael Jackson','passport-nrj-2341':'Katseye','passport-nrj-975':'Shakira','passport-nrj-2376':'Miley Cyrus','passport-nrj-446':'Miley Cyrus','passport-nrj-1109':'Taylor Swift','passport-nrj-1906':'Lady Gaga','passport-nrj-2377':'Dua Lipa','passport-nrj-2383':'Vianney (singer)','passport-nrj-2393':'Marine Delplace','passport-nrj-2384':'Eva (French singer)','passport-nrj-2392':'Miki (French singer)','passport-nrj-2382':'Adèle Castillon'};
 for(const [id,subject]of Object.entries(named))assert.equal(m.artworks.find(a=>a.id===id).subject,subject,id);
});
test('Phase 3: all photos are profiled 512px square WebP; both photographic equipment cutouts retain alpha',()=>{
 for(const a of manifest().artworks){const b=bytes(a.image.slice(1));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(digest(b),a.sha256,a.id);assert.equal(b.length,a.bytes);assert(b.length<=102400,a.id);
 let dimensions,profile=false;for(let p=12;p+8<b.length;){const type=b.toString('ascii',p,p+4),n=b.readUInt32LE(p+4);if(type==='VP8X')dimensions=[b.readUIntLE(p+12,3)+1,b.readUIntLE(p+15,3)+1];if(type==='ICCP')profile=true;p+=8+n+(n%2);}assert.deepEqual(dimensions,[512,512],a.id);assert(profile,a.id);}
 for(const file of ['rock-monumental-kit.webp','pop-sharp-gf777.webp']){const b=bytes('images/radio/living-collection/'+file);assert.equal(b.toString('ascii',8,12),'WEBP');assert((b[20]&16)!==0,'alpha '+file);}
});
test('Phase 3: equipment animation contains no playback, network or catalogue operations',()=>{
 const script=bytes('js/passport-living-performance.js').toString().replace(/\/\*[\s\S]*?\*\//g,'');
 assert(!/\bAudio\b|<audio|createElement\(['"]audio|PassportBus|PassportAudio|engine\.|\bfetch\(|https?:\/\//i.test(script));assert(script.includes('IntersectionObserver'));
 const css=bytes('css/passport-radio-grid.css').toString();assert(css.includes('prefers-reduced-motion:reduce'));assert(css.includes('.living-kick-left'));assert(css.includes('.living-kick-right'));
});
