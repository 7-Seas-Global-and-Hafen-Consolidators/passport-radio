const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');
require('../js/passport-commercial.js');require('../js/passport-movement.js');require('../js/passport-media-kit.js');
const C=globalThis.PassportCommercial,M=globalThis.PassportMovement,K=globalThis.PassportMediaKit;
const round=n=>Math.round((n+Number.EPSILON)*100)/100;
test('all four authorized prices, all 160 periods, all advertiser categories',()=>{
  const prices={top:8.45,rectangle:6.45,strip:4.95,sponsored:55.98};
  for(const [format,price] of Object.entries(prices))for(let days=1;days<=160;days++)for(const [advertiser,extra] of Object.entries({none:0,banda:12.5,antigo:10})){
    const fixed=format==='sponsored';const n=fixed?1:days;const free=!fixed&&n===10;const normal=round(price*n);
    const period=Math.floor((Math.round(normal*100)*Math.round((fixed?0:C.PERIOD_DISCOUNT_PCT[n-1])*100)+5000)/10000)/100;
    const additional=Math.floor((Math.round((normal-period)*100)*Math.round((free?0:extra)*100)+5000)/10000)/100;
    const total=free?0:round(normal-period-additional);const q=C.quote(format,days,advertiser);
    assert.equal(q.daily,price);assert.equal(q.days,n);assert.equal(q.normal,normal);assert.equal(q.periodDiscount,period);assert.equal(q.extraDiscount,additional);assert.equal(q.freeEligible,free);assert.equal(q.total,total);assert.equal(q.economia,round(normal-total));
    assert.equal(q.freeTestDays,10);
  }
});
test('period discounts retained byte for byte from main fixture',()=>{
  const baseline=JSON.parse(fs.readFileSync('tests/fixtures/anuncie-period-discounts.json','utf8'));assert.deepEqual(C.PERIOD_DISCOUNT_PCT,baseline);
});
test('temporal movement: minutes, reload, new tab/session, no local storage',()=>{
  const t=Date.parse(M.config.baseTimestamp);assert.equal(M.valueAt(t),28000000);assert.equal(M.valueAt(t+600000),28000210);assert.equal(M.valueAt(t-10000),28000000);
  const contexts=[];for(let i=0;i<3;i++){const ctx={};vm.runInNewContext(fs.readFileSync('js/passport-movement.js','utf8'),ctx);contexts.push(ctx.PassportMovement.valueAt(t+600000));}assert.deepEqual(contexts,[28000210,28000210,28000210]);
  assert.ok(!fs.readFileSync('js/passport-movement.js','utf8').includes('localStorage'));
});
test('real report: thirty dates, valid zeroes, absent retrospective history',()=>{
  const report=K.normalize({startedAt:'2026-09-30T17:35:39Z',days:[],audience:{}},new Date('2026-09-30T18:00:00Z'));assert.equal(report.days.length,30);assert.equal(report.days.filter(r=>r.views===null).length,29);assert.equal(report.today,0);assert.equal(report.total,0);assert.deepEqual(report.audience.device,[]);
});
test('real report sums only window, percentages, safely ignores malformed rows',()=>{
  const report=K.normalize({startedAt:'2026-09-01T03:00:00Z',days:[{date:'2026-09-30',views:20},{date:'2026-09-29',views:5},{date:'2025-01-01',views:999},{date:'2026-09-28',views:-9}],audience:{device:[{label:'mobile',views:15},{label:'desktop',views:10},{label:'bad',views:10}],source:[]}},new Date('2026-09-30T18:00:00Z'));
  assert.equal(report.total,25);assert.equal(report.today,20);assert.equal(report.audience.device[0].percent,60);assert.throws(()=>K.normalize({days:[]}),/Invalid report/);
});
test('Anuncie imports only independent modules, preserves original audio',()=>{
  const html=fs.readFileSync('anuncie.html','utf8');assert.equal((html.match(/<audio /g)||[]).length,1);assert.match(html,/preload="none"/);assert.ok(!html.includes('autoplay'));for(const token of ['PassportBus','mutex','interlock','passport-live','radio-','Route 66','SEM NÚMEROS FANTASMAS'])assert.ok(!html.includes(token));
});

test('exact demonstration, calculated total and prescribed audience',()=>{
 const expected=[91284,94731,96408,93562,101347,104821,98615,95774,97308,102416,105239,108674,103581,99427,101963,104286,107531,110248,106794,112365,109817,105642,108953,111426,114782,117305,113648,109536,103927,96842];
 const d=K.demonstrationReport();assert.deepEqual(d.days.map(x=>x.views),expected);assert.equal(d.today,96842);assert.equal(d.total,expected.reduce((a,b)=>a+b,0));assert.equal(d.total,3128252);assert.equal(d.days[0].date,'2026-09-01');assert.equal(d.days[29].date,'2026-09-30');assert.deepEqual(d.audience.device.map(x=>x.percent),[68,27,5]);assert.deepEqual(d.audience.source.map(x=>x.percent),[41,29,18,8,4]);
});
test('demonstration stays separate from real readings and collector',()=>{
 const real=K.normalize({startedAt:'2026-09-30T17:35:39Z',days:[],audience:{}},new Date('2026-09-30T18:00:00Z'));const before=JSON.stringify(real);assert.equal(K.presentation(real).mode,'demonstration');assert.equal(JSON.stringify(real),before);assert.equal(K.presentation(null).total,3128252);
 const full={...real,days:Array.from({length:30},(_,i)=>({date:`2026-09-${String(i+1).padStart(2,'0')}`,views:100})),today:100,total:3000,audience:{device:[{label:'Mobile',percent:100,views:3000}],source:[{label:'Direto',percent:100,views:3000}]}};assert.equal(K.presentation(full).mode,'measured');assert.equal(K.presentation(full).total,3000);assert.equal(K.presentation({...full,today:0}).mode,'demonstration');
 const collector=fs.readFileSync('js/passport-measurement.js','utf8');assert.ok(!collector.includes('demonstration'));assert.ok(!collector.includes('96842'));
});
