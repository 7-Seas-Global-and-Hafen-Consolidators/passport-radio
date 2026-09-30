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
