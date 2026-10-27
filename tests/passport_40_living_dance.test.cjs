/* Stage 2 presentation regression: immutable inventory, audio and World Dial baseline. */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base='2a737231ad368f5c56026ad19817d977e52f7c09';
const bytes=p=>fs.existsSync(p)?fs.readFileSync(p):cp.execFileSync('git',['show',`HEAD:${p}`],{maxBuffer:12*1024*1024});
const old=p=>cp.execFileSync('git',['show',`${base}:${p}`],{maxBuffer:12*1024*1024});
const inventory=JSON.parse(bytes('data/passport-radio-inventory.json')),rows=inventory.records.filter(r=>r.section===1);
const manifest=()=>JSON.parse(bytes('docs/living-collection-dance-20261027/artwork-manifest.json'));
test('Dance: all 401 radios, 51 Dance identities, streams and protected systems unchanged',()=>{
 assert.equal(inventory.radioCount,401);assert.equal(inventory.programSelectorCount,11);assert.equal(rows.length,51);assert.equal(inventory.records.filter(r=>r.section===8).length,42);
 for(const p of ['data/passport-radio-inventory.json','js/world-radio-player.js','js/passport-bus.js','js/passport-audio-mutex.js','js/passport-audio-continuity.js','js/passport-persist-nav.js','assets/index-DgBCruM8.js','index.html','noticias.html','js/passport-universal-footer.js','js/passport-videos.js','js/passport-living-earth.js','images/radio/living-collection/earth-blue-marble.jpg'])assert.deepEqual(bytes(p),old(p),p);
});
test('Dance: World Dial covers and approved evidence are byte-identical',()=>{
 const world=JSON.parse(bytes('docs/living-collection-world-dial-20261027/artwork-manifest.json'));
 const paths=['docs/living-collection-world-dial-20261027',...world.artworks.map(a=>a.image.slice(1))];
 assert.equal(cp.execFileSync('git',['diff','--name-only',base,'--',...paths],{encoding:'utf8'}).trim(),'');

});
test('Dance: original click handler, search, World Dial header and existing styles preserved exactly',()=>{
 const js=bytes('js/passport-radio-grid.js').toString(),before=old('js/passport-radio-grid.js').toString();
 for(const expression of [/button.addEventListener\('click',[\s\S]*?\n        \}\);/,/const locate = \(\) => \{[\s\S]*?\n    \};/,/const sections = .*;/,/\[1,2,3,11,4,5,6,7,8,9,10\]/,/      if \(number === 8\) \{[\s\S]*?\n      \}/,/const tv = [\s\S]*?catalog.append\(tv\);/])assert.equal(js.match(expression)[0],before.match(expression)[0]);
 assert(bytes('css/passport-radio-grid.css').toString().startsWith(old('css/passport-radio-grid.css').toString()));
 assert(js.includes('if (number === 8 || number === 1)'));assert(js.includes('A pista nunca para.'));assert(js.includes('Dance, disco, house, eurodance e os clássicos das pistas.'));
});
test('Dance: exactly one distinct local cover per real ID in original order',()=>{
 const m=manifest();assert.equal(m.count,51);assert.deepEqual(m.artworks.map(a=>[a.id,a.name]),rows.map(r=>[r.id,r.name]));
 for(const key of ['id','image','sha256','visual_hash'])assert.equal(new Set(m.artworks.map(a=>a[key])).size,51,key);
 for(const a of m.artworks){assert.equal(a.image,`/images/radio/living-collection/${a.id}.webp`);assert(a.theme&&a.unique_artwork);}
 assert(m.minimum_visual_hash_distance>=10);
});
test('Dance: all cover sources are 512x512 sRGB WebP, quality 82–88, below 100 KiB',()=>{
 for(const a of manifest().artworks){const b=bytes(a.image.slice(1));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256,a.id);assert.equal(b.length,a.bytes);assert(b.length<=102400,a.id);
 let dimensions,profile=false;for(let p=12;p+8<b.length;){const type=b.toString('ascii',p,p+4),n=b.readUInt32LE(p+4);if(type==='VP8X')dimensions=[b.readUIntLE(p+12,3)+1,b.readUIntLE(p+15,3)+1];if(type==='ICCP')profile=true;p+=8+n+(n%2);}assert.deepEqual(dimensions,[512,512],a.id);assert(profile,a.id);assert.equal(a.color_space,'sRGB');assert(a.quality>=82&&a.quality<=88);}
});
