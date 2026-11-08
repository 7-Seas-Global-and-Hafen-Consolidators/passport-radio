// Historical snapshots exclude only the two approved neonatal additions.
// No production read, transport or file is changed by this test-only adapter.
const fs=require('node:fs'),cp=require('node:child_process'),assert=require('node:assert/strict');
const asiaBase='d070f26a9e40918950e66a1a0abbac936747c336';
const reference=(p,revision=asiaBase)=>cp.execFileSync('git',['show',`${revision}:${p}`],{maxBuffer:30*1024*1024});
const raw=p=>fs.existsSync(p)?fs.readFileSync(p):reference(p,'HEAD');
function historical(p,buffer){
 if(!['data/passport-radio-inventory.json','js/world-radio-player.js'].includes(p))return buffer;
 let source=buffer.toString();
 // Remove exactly Pinoy Power against its fixed complete baseline before Asia normalization.
 if(p==='data/passport-radio-inventory.json'){
  const data=JSON.parse(source);assert.equal(data.radioCount,403);assert.equal(data.programSelectorCount,11);assert.equal(data.records.length,414);
  assert.equal(data.records.filter(r=>r.id==='passport-pinoy-power').length,1);
  const at=source.indexOf('"id": "passport-pinoy-power"'),start=source.lastIndexOf('    {\n',at),end=source.indexOf('    },\n',at)+7;
  assert.equal(JSON.parse(source.slice(start,end).trim().replace(/,$/,'' )).id,'passport-pinoy-power');
  source=(source.slice(0,start)+source.slice(end)).replace('"radioCount": 403','"radioCount": 402');
 }else{
  const addition=/,\n\{"id":"passport-pinoy-power"[^\n]+\}(?=\n\];)/g,matches=[...source.matchAll(addition)];assert.equal(matches.length,1);
  const row=JSON.parse(matches[0][0].slice(2));assert.equal(row.name,'Pinoy Power™');assert.equal(row.passportGroup,2);source=source.replace(addition,'');
 }
 assert.deepEqual(Buffer.from(source),reference(p,'e86a1042fbf24ebe88c16582fd271204500faef3'),'only Pinoy Power may differ from the 402-radio baseline');
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
assert.equal(prior.radioCount,401);assert.equal(prior.programSelectorCount,11);assert.deepEqual(current.records.filter(r=>!['passport-asia-rock','passport-pinoy-power'].includes(r.id)),prior.records);
const row=current.records.find(r=>r.id==='passport-asia-rock');assert.equal(row.index,313);assert.equal(row.family,'world');assert.equal(row.section,2);
module.exports={read,reference,asiaBase};
