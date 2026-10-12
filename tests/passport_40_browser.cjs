const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const inventory=require('../data/passport-radio-inventory.json');
const out='reports/passport-40';fs.mkdirSync(out,{recursive:true});
const report={checks:[],failures:[],networkErrors:[],testedAt:new Date().toISOString()};
async function dismissCookies(page){const button=page.getByRole('button',{name:'ACEITAR COOKIES',exact:true});if(await button.isVisible())await button.click();}
async function check(name,fn){if(process.env.PASSPORT_40_ONLY==='catalog'&&!/^(all 401|responsive)/.test(name))return;if(process.env.PASSPORT_40_ONLY==='radio'&&!name.startsWith('real new radio'))return;try{const detail=await fn();report.checks.push({name,status:'PASS',detail});}catch(e){report.failures.push({name,status:'FAIL',error:String(e)});}}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=user-gesture-required']});
 const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
 page.on('pageerror',e=>report.networkErrors.push(String(e)));
 page.on('console',m=>{if(m.type()==='warning'&&m.text().includes('Stream bloqueado'))report.networkErrors.push(m.text());});
 page.on('requestfailed',r=>{if(r.url().includes('centova4')&&process.env.PASSPORT_40_ONLY==='radio')report.networkErrors.push(r.url()+' '+r.failure()?.errorText);});
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.PassportAudioRuntime?.ready,null,{timeout:60000});
 await page.locator('#passport-radio-catalog').waitFor();await dismissCookies(page);
 await check('all 401 radios and 11 project selectors visible; no duplicate cards; no autoplay',async()=>{
  assert.equal(await page.locator('[data-radio-id]').count(),412);
  assert.equal(await page.locator('#passport-player').count(),1);
  const d=await page.evaluate(()=>({audible:[...document.querySelectorAll('audio,video')].filter(a=>!a.paused).length,ids:[...document.querySelectorAll('[data-radio-id]')].map(x=>x.dataset.radioId),hidden:document.querySelector('.pb-door').getBoundingClientRect().height}));
  assert.equal(d.audible,0);assert.equal(d.ids.length,new Set(d.ids).size);assert.equal(d.hidden,0);return d;
 });
 await check('all new radio cards select correct streams through universal player',async()=>{
  await page.route('https://centova4.transmissaodigital.com:**/stream',r=>r.abort());
  try{for(const row of inventory.records.filter(r=>r.new)){
   const requested=page.waitForRequest(request=>request.url()===row.stream);
   await page.locator(`[data-radio-id="${row.id}"]`).click();
   const d=await page.evaluate(()=>({src:document.querySelector('#world-audio').src,label:document.querySelector('#track').textContent,state:window.PassportContinuity.getState()}));
   assert.equal((await requested).url(),row.stream,row.name);assert.equal(d.label,row.name);assert.equal(d.state.index,row.index);assert.equal(d.state.family,'world');
  }
  }finally{await page.unroute('https://centova4.transmissaodigital.com:**/stream');}return {mapped:39,method:'real card clicks; abort only upstream audio requests to avoid repeating stream acquisition'};
 });
 await check('responsive 360/390/480/768/1280 and original World alphabets',async()=>{
  const result=[];
  for(const width of [360,390,480,768,1280]){await page.setViewportSize({width,height:900});
   const d=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('[data-radio-id]')].length,columns:getComputedStyle(document.querySelector('.passport-radio-grid')).gridTemplateColumns.split(' ').length,clipped:[...document.querySelectorAll('[data-radio-id]')].filter(b=>b.scrollWidth>b.clientWidth+2).map(b=>b.textContent)}));
   assert.ok(d.document<=width+1,JSON.stringify(d));assert.equal(d.cards,412);assert.equal(d.clipped.length,0);result.push(d);await page.screenshot({path:`${out}/home-${width}.png`,fullPage:true});
  }
  for(const row of inventory.records.filter(r=>r.family==='world'&&!r.new))assert.equal(await page.locator(`[data-radio-id="${row.id}"] span`).last().textContent(),row.name);
  return result;
 });
 if(process.env.PASSPORT_40_ONLY==='catalog'){await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failures.length)process.exitCode=1;return;}
 await page.setViewportSize({width:1280,height:900});
 await check('real new radio playback, pause, volume and previous/next',async()=>{
  await page.locator('[data-radio-id="passport-flash-house-classics"]').click();
  await page.waitForFunction(()=>{const a=document.querySelector('#world-audio');return !a.paused&&a.currentTime>1},null,{timeout:45000});
  await page.locator('#pb-vol-range').focus();await page.locator('#pb-vol-range').press('Home');for(let i=0;i<8;i++)await page.locator('#pb-vol-range').press('ArrowRight');assert.equal(await page.locator('#world-audio').evaluate(a=>a.volume),0.4);
  await page.getByRole('button',{name:'Pausar',exact:true}).click();assert.equal(await page.locator('#world-audio').evaluate(a=>a.paused),true);
  await page.getByRole('button',{name:'Tocar',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#world-audio').paused);
  await page.getByRole('button',{name:'Próximo',exact:true}).click();assert.equal(await page.locator('#track').textContent(),'Live Sessions™');
  await page.getByRole('button',{name:'Anterior',exact:true}).click();assert.equal(await page.locator('#track').textContent(),'Flash House Classics™');
  return await page.locator('#world-audio').evaluate(a=>({src:a.src,time:a.currentTime,volume:a.volume}));
 });
 if(process.env.PASSPORT_40_ONLY==='radio'){await page.screenshot({path:`${out}/radio-real-1280.png`,fullPage:false});await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failures.length)process.exitCode=1;return;}
 await check('existing Hits continuous audio: Home → Arquivo → automatic article → Home',async()=>{
  await page.locator('[data-radio-id="hits:main"]').click();await page.waitForFunction(()=>{const a=document.querySelector('#passportHitsAudio');return !a.paused&&a.currentTime>1},null,{timeout:45000});
  await page.locator('#pb-vol-range').focus();await page.locator('#pb-vol-range').press('Home');for(let i=0;i<8;i++)await page.locator('#pb-vol-range').press('ArrowRight');
  await page.evaluate(()=>{document.querySelector('#passportHitsAudio').dataset.qaTransport='retained'});
  const before=await page.locator('#passportHitsAudio').evaluate(a=>a.currentTime);
  await page.locator('.pb-nav').getByRole('link',{name:'Arquivo',exact:true}).click();await page.waitForURL('**/editorial.html');await page.waitForSelector('#passport-editorial-outlet main');
  // A fixture link exercises real navigation without asserting an unrelated archive indexing feature.
  await page.evaluate(()=>{const a=document.createElement('a');a.href='/editorial/2026/10/09/a-forca-implacavel-de-badmotorfinger-na-historia-do-rock-7f648f963d.html';a.textContent='QA — matéria automática';document.querySelector('#passport-editorial-outlet main').append(a);});
  await page.getByRole('link',{name:'QA — matéria automática',exact:true}).click();await page.waitForURL('**/a-forca-implacavel-de-badmotorfinger-na-historia-do-rock-7f648f963d.html');
  const actual=await page.locator('#passportHitsAudio').evaluate(a=>({same:a.dataset.qaTransport==='retained',time:a.currentTime,paused:a.paused,volume:a.volume}));assert.ok(actual.same);assert.ok(actual.time>before);assert.equal(actual.paused,false);assert.equal(actual.volume,0.4);
  await page.locator('.pb-nav').getByRole('link',{name:'Home',exact:true}).click();await page.waitForURL('http://127.0.0.1:4173/');await page.locator('#passport-radio-catalog').waitFor();assert.equal(await page.locator('[data-radio-id]').count(),412);return actual;
 });
 await check('editorial content and original images retained',async()=>{
  if(new URL(page.url()).pathname!=='/'){await page.locator('.pb-nav').getByRole('link',{name:'Home',exact:true}).click();await page.waitForURL('http://127.0.0.1:4173/');}
  assert.equal(await page.locator('.pb-lead').count(),1);assert.equal(await page.locator('.pb-recruit').count(),1);assert.ok(await page.locator('#pp-feed h3').count()>0);
  await page.locator('.pb-lead img').waitFor();await page.waitForFunction(()=>document.querySelector('.pb-lead img').complete);assert.ok(await page.locator('.pb-lead img').evaluate(a=>a.naturalWidth>0));
  return {lead:await page.locator('.pb-lead h1').textContent(),newImages:0};
 });
 await page.goto('http://127.0.0.1:4173/videos.html');await page.waitForSelector('#videos-grid .videos-card',{timeout:30000});
 const preservedVideoCards=await page.locator('#videos-grid .videos-card').count();
 await page.goto('http://127.0.0.1:4173/clips-tv.html');await page.locator('#passport-clips-tv').waitFor();
 await check('TV no autoplay; original video catalogue preserved',async()=>{
  assert.equal(await page.locator('#passport-clips-tv video').evaluate(v=>v.paused),true);assert.equal(await page.locator('#passport-clips-tv video').getAttribute('src'),null);
  return {cards:preservedVideoCards,tv:1};
 });
 await check('real TV HLS playback, radio/TV mutex, volume, pause and fullscreen capability',async()=>{
  await page.getByRole('button',{name:'ASSISTIR À PASSPORT CLIPS TV™',exact:true}).click();
  await page.waitForFunction(()=>{const v=document.querySelector('#passport-clips-tv video');return !v.paused&&v.currentTime>1&&v.videoWidth>0},null,{timeout:60000});
  const data=await page.locator('#passport-clips-tv video').evaluate(v=>({time:v.currentTime,width:v.videoWidth,height:v.videoHeight,controls:v.controls,volume:v.volume,fullscreen:!!v.requestFullscreen,autoplay:v.autoplay}));
  assert.equal(data.autoplay,false);assert.equal(data.controls,true);assert.equal(data.fullscreen,true);
  assert.equal(await page.evaluate(()=>[...document.querySelectorAll('audio')].filter(a=>!a.paused).length),0);
  await page.evaluate(()=>document.querySelector('#passport-clips-tv video').pause());assert.equal(await page.locator('#passport-clips-tv video').evaluate(v=>v.paused),true);
  await page.getByRole('button',{name:'RETOMAR PASSPORT CLIPS TV™',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('#passport-clips-tv video').paused);
  await dismissCookies(page);await page.getByRole('button',{name:'RETOMAR RÁDIO',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#passport-clips-tv video').paused);return data;
 });
 for(const width of [390,1280]){await page.setViewportSize({width,height:900});await page.locator('#passport-clips-tv').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/tv-${width}.png`,fullPage:false});}
 await browser.close();fs.writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(report.failures.length)process.exitCode=1;
})().catch(e=>{report.failures.push({name:'harness',error:String(e)});fs.writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));console.error(e);process.exitCode=1;});
