// Historical snapshots exclude exactly the one approved Asia Rock addition.
// No production read, transport or file is changed by this test-only adapter.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const asiaBase='d070f26a9e40918950e66a1a0abbac936747c336';
const reference=(p,revision=asiaBase)=>cp.execFileSync('git',['show',`${revision}:${p}`],{maxBuffer:30*1024*1024});
const raw=p=>fs.existsSync(p)?fs.readFileSync(p):reference(p,'HEAD');
function historical(p,buffer){
 if(!['data/passport-radio-inventory.json','js/world-radio-player.js'].includes(p))return buffer;
 let source=buffer.toString();
 if(p==='data/passport-radio-inventory.json'){
  const data=JSON.parse(source),matches=data.records.filter(r=>r.id==='passport-asia-rock');
  assert.equal(matches.length,1,'exactly one approved addition');assert.equal(data.radioCount,402);assert.equal(data.programSelectorCount,11);assert.equal(data.records.length,413);
  const at=source.indexOf('"id": "passport-asia-rock"'),start=source.lastIndexOf('    {\n',at),end=source.indexOf('    },\n',at)+7;
  assert.equal(JSON.parse(source.slice(start,end).trim().replace(/,$/,'' )).id,'passport-asia-rock');
  source=(source.slice(0,start)+source.slice(end)).replace('"radioCount": 402','"radioCount": 401');
 }else if(p==='js/world-radio-player.js'){
  const addition=/,\n\{"id":"passport-asia-rock"[^\n]+\}(?=\n\];)/g,matches=[...source.matchAll(addition)];
  assert.equal(matches.length,1,'only the appended Asia Rock station is excluded');
  const station=JSON.parse(matches[0][0].slice(2));assert.equal(station.name,'Asia Rock™');assert.equal(station.passportGroup,2);
  source=source.replace(addition,'');
 }
 return Buffer.from(source);
}
const read=(p,encoding)=>{const b=historical(p,raw(p));return encoding?b.toString(encoding):b;};
// Whole-file comparison ensures normalization cannot hide ANY other inventory or engine change.
for(const p of ['data/passport-radio-inventory.json','js/world-radio-player.js'])assert.deepEqual(read(p),reference(p),p+' differs beyond the approved addition');
const current=JSON.parse(raw('data/passport-radio-inventory.json')),prior=JSON.parse(reference('data/passport-radio-inventory.json'));
assert.equal(prior.radioCount,401);assert.equal(prior.programSelectorCount,11);assert.deepEqual(current.records.filter(r=>r.id!=='passport-asia-rock'),prior.records);
const row=current.records.find(r=>r.id==='passport-asia-rock');assert.equal(row.index,313);assert.equal(row.family,'world');assert.equal(row.section,2);
module.exports={read,reference,asiaBase};
