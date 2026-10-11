const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),crypto=require('node:crypto');
const before=require('../docs/passport-40-20261011/before.json'),after=require('../data/passport-radio-inventory.json'),approved=require('../docs/passport-40-20261011/approved-additions.json');
test('112 existing radios and 11 program selectors survive unchanged; exactly 39 new radios',()=>{
 assert.equal(before.radioCount,112);assert.equal(after.radioCount,151);assert.equal(after.programSelectorCount,before.programSelectorCount);
 for(const old of before.records){const found=after.records.find(r=>r.id===old.id);assert.ok(found,old.id);assert.deepEqual(found,old);}
 const added=after.records.filter(r=>r.new);assert.equal(added.length,39);assert.equal(new Set(after.records.map(r=>r.id)).size,after.records.length);
 assert.equal(new Set(added.map(r=>r.name)).size,39);assert.equal(new Set(added.map(r=>r.stream)).size,39);
 for(const row of approved){const found=added.find(r=>r.id===row.id);assert.equal(found.name,row.name);assert.equal(found.stream,row.stream);assert.equal(found.section,row.passportGroup);assert.ok(!before.records.some(r=>r.name===row.name||r.stream===row.stream));}
});
test('protected engines, universal player, Bus, continuity, video, podcast and broadcast are byte-identical',()=>{
 for(const [p,hash] of Object.entries(before.hashes)){if(p==='js/world-radio-player.js')continue;assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),hash,p);}
 const old=cp.execFileSync('git',['show',`${before.base}:js/world-radio-player.js`],{encoding:'utf8'});const current=fs.readFileSync('js/world-radio-player.js','utf8');
 assert.equal(current.slice(current.indexOf('const $=')),old.slice(old.indexOf('const $=')),'World transport body changed');
 const originalArray=old.slice(old.indexOf('const stations='),old.indexOf('\n];'));
 assert.ok(current.startsWith(old.slice(0,old.indexOf('const stations='))+originalArray),'original station definitions/order changed');
});
test('generated public inventory matches actual engine catalogues',()=>{
 const actual=require('../docs/passport-40-20261011/inventory.cjs');assert.deepEqual(after.records,actual.records);
});
