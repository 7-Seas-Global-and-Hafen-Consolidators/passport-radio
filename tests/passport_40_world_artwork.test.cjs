const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const base='a607f91421d037df15285401d4625bdac06e46e8',rows=require('../data/passport-radio-inventory.json').records.filter(r=>r.section===8);
const bytes=p=>fs.existsSync(p)?fs.readFileSync(p):cp.execFileSync('git',['show',`HEAD:${p}`],{maxBuffer:4*1024*1024});
const manifest=JSON.parse(bytes('docs/living-collection-world-dial-20261027/artwork-manifest.json'));
test('World artwork: exact 42 real IDs in original order, unchanged names and one unique local cover each',()=>{
 assert.equal(manifest.count,42);assert.equal(manifest.artworks.length,42);assert.deepEqual(manifest.artworks.map(x=>[x.id,x.name]),rows.map(x=>[x.id,x.name]));
 for(const key of ['id','image','sha256','visual_hash'])assert.equal(new Set(manifest.artworks.map(x=>x[key])).size,42,key);
 for(const art of manifest.artworks){assert.equal(art.image,`/images/radio/living-collection/${art.id}.webp`);assert(art.theme&&art.unique_artwork);}
 assert(manifest.minimum_visual_hash_distance>=12);
});
test('World artwork: all 42 sources are real 512-square profiled WebP under 100 KiB',()=>{
 for(const art of manifest.artworks){const b=bytes(art.image.slice(1));assert.equal(b.toString('ascii',0,4),'RIFF',art.id);assert.equal(b.toString('ascii',8,12),'WEBP',art.id);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),art.sha256,art.id);assert.equal(b.length,art.bytes);assert(b.length<=102400,art.id);
  let dimensions,profile=false;for(let p=12;p+8<b.length;){const type=b.toString('ascii',p,p+4),n=b.readUInt32LE(p+4);if(type==='VP8X')dimensions=[b.readUIntLE(p+12,3)+1,b.readUIntLE(p+15,3)+1];if(type==='ICCP')profile=true;p+=8+n+(n%2);}assert.deepEqual(dimensions,[512,512],art.id);assert(profile,art.id);assert.equal(art.color_space,'sRGB');assert(art.quality>=82&&art.quality<=88);}
});
test('World artwork: photographic globe and full radio inventory remain byte-identical to pilot',()=>{
 for(const p of ['js/passport-living-earth.js','images/radio/living-collection/earth-blue-marble.jpg','data/passport-radio-inventory.json','js/world-radio-player.js'])assert.deepEqual(bytes(p),cp.execFileSync('git',['show',`${base}:${p}`],{maxBuffer:4*1024*1024}),p);
});
