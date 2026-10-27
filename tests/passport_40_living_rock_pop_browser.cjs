/* Actual Home with isolated browser. Reports never include playback addresses. */
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':'playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/living-collection-rock-pop-20261027/evidence');fs.mkdirSync(out,{recursive:true});
let sessionReport;
const inventory=require('../data/passport-radio-inventory.json'),mobile=process.argv.includes('--mobile'),mode=mobile?'mobile':'desktop';
const candidates={rock:['rockx:12','passport-add-20261012-radio-33','passport-nrj-249'],pop:['80s:0','passport-add-20261012-radio-36','passport-nrj-29']};
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(req.url.split('?')[0].endsWith('/'))file+='index.html';if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.woff2':'font/woff2','.ttf':'font/ttf','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(b);});});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||'/tmp/passport-headless/chrome-headless-shell-linux64/chrome-headless-shell',args:['--no-sandbox','--single-process','--no-zygote'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'127.0.0.1,localhost'}:undefined});
 const context=await browser.newContext({ignoreHTTPSErrors:true,isMobile:mobile,hasTouch:mobile,viewport:{width:mobile?390:1440,height:1000}}),page=await context.newPage();
 const hosts=new Set(['127.0.0.1','localhost','fonts.googleapis.com','fonts.gstatic.com']);
 for(const id of Object.values(candidates).flat())hosts.add(new URL(inventory.records.find(r=>r.id===id).stream).hostname);
 const allowed=req=>{const u=new URL(req.url());return hosts.has(u.hostname)||(req.resourceType()==='media'&&req.redirectedFrom()&&allowed(req.redirectedFrom()));};
 // Use the repository's actual institutional font files for deterministic screenshots.
 // No font or advertising requests need to leave this isolated test browser.
 const fontRoot=`http://127.0.0.1:${server.address().port}/fonts/passport-footer/`;
 const fontFaces=[['Instrument Sans',400,'01689ad055025ff1.ttf'],['Instrument Sans',500,'a7bcb84cb01f6e33.ttf'],['Instrument Sans',600,'5e39a358a65a72b6.ttf'],['Instrument Sans',700,'d25efe5b0dcf3b36.ttf'],['Bodoni Moda',700,'b8d14dc4cf4c0d27.ttf'],['Source Serif 4',400,'f01900495012279f.ttf']].map(([family,weight,file])=>`@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;src:url('${fontRoot}${file}') format('truetype');}`).join('');
 await context.route('**/*',route=>new URL(route.request().url()).hostname==='fonts.googleapis.com'?route.fulfill({contentType:'text/css',body:fontFaces}):allowed(route.request())?route.continue():route.abort());
 const report=sessionReport={status:'in_progress',mode,physicalDevice:false,fontFixture:'institutional font files already in repository',layouts:[],audio:{},animations:{},attempts:[],errors:[]};page.on('pageerror',e=>report.errors.push(e.message.replace(/https?:\/\/\S+/g,'[redigido]')));
 await page.goto(`http://127.0.0.1:${server.address().port}/`,{waitUntil:'domcontentloaded'});
 await page.locator('[data-radio-id="passport-new-wave"]:not([disabled])').waitFor({timeout:60000});
 report.fonts=await page.evaluate(()=>Promise.all(['600 14px "Instrument Sans"','700 30px "Bodoni Moda"','400 15px "Source Serif 4"'].map(f=>document.fonts.load(f).then(a=>({font:f,loaded:a.length>0&&a.every(x=>x.status==='loaded')})))));assert(report.fonts.every(f=>f.loaded));
 const family=n=>page.locator('#passport-radio-family-'+n);
 for(const [number,label]of [[2,'rock'],[3,'pop']]){
  const section=family(number);await section.locator('img').first().scrollIntoViewIfNeeded();await section.locator('.living-equipment-photo').screenshot({path:path.join(out,`${label}-equipment-${mode}.png`)});
 }
 if(process.argv.includes('--headers')){await browser.close();server.close();console.log('header prototypes captured');return;}
 if(process.argv.includes('--capture-only')){
  const cp=require('node:child_process');
  for(const width of [1440,768,390]){
   await page.setViewportSize({width,height:1000});
   for(const number of [2,3])for(const image of await family(number).locator('.living-radio-cover').all())await image.scrollIntoViewIfNeeded();
   await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
   const boxes=await page.evaluate(()=>[2,3].map(n=>{const section=document.getElementById('passport-radio-family-'+n),header=section.querySelector('header'),b=section.getBoundingClientRect(),h=header.getBoundingClientRect();return {label:n===2?'rock':'pop',section:[b.left+scrollX,b.top+scrollY,b.width,b.height],header:[h.left+scrollX,h.top+scrollY,h.width,h.height]};}));
   const full=path.join('/tmp',`phase3-full-${width}.png`);await page.screenshot({path:full,fullPage:true});
   cp.execFileSync('python',['-c',`from PIL import Image
import json,sys
im=Image.open(sys.argv[1]).convert('RGB')
for b in json.loads(sys.argv[2]):
 for kind in ['section','header']:
  x,y,w,h=b[kind];crop=im.crop((round(x),round(y),round(x+w),round(y+h)));name=b['label']+('-header' if kind=='header' else '')+'-'+sys.argv[3]+'.webp';crop.save(sys.argv[4]+'/'+name,'WEBP',quality=92,method=6)`,full,JSON.stringify(boxes),String(width),out]);
  }
  console.log('full-page pixel crops captured');await browser.close();server.close();return;
 }
 assert.equal(await page.locator('[data-radio-id]').count(),412);assert.equal(await page.locator('.living-radio-card').count(),262);
 assert.equal(await page.locator('audio').evaluateAll(a=>a.filter(x=>!x.paused).length),0);
 for(const number of [2,3]){
  const rows=inventory.records.filter(r=>r.section===number),cards=await family(number).locator('[data-radio-id]').evaluateAll(bs=>bs.map(b=>({id:b.dataset.radioId,name:b.getAttribute('aria-label'),family:b.dataset.family,index:b.dataset.index,type:b.type})));assert.equal(cards.length,number===2?46:123);
  assert.deepEqual(cards,rows.map(r=>({id:r.id,name:r.name,family:r.family,index:String(r.index),type:'button'})));
 }
 for(const width of mobile?[360,390,430,768]:[1024,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const [number,label]of [[2,'rock'],[3,'pop']]){
   const section=family(number);
   for(const img of await section.locator('.living-radio-cover').all())await img.scrollIntoViewIfNeeded();
   await section.locator('header').scrollIntoViewIfNeeded();
   await page.waitForFunction(n=>[...document.querySelectorAll(`#passport-radio-family-${n} .living-radio-cover`)].every(i=>i.complete&&i.naturalWidth===512),number,{timeout:20000});
   const layout=await section.evaluate(el=>{const grid=el.querySelector('.passport-radio-grid'),header=el.querySelector('header'),photo=el.querySelector('.living-equipment-photo'),copy=el.querySelector('.living-category-copy'),p=photo.getBoundingClientRect(),h=header.getBoundingClientRect(),c=copy.getBoundingClientRect();return {section:el.id,width:innerWidth,columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,catalog:document.getElementById('passport-radio-catalog').getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth+1,hidden:[...document.querySelectorAll('[data-radio-id]')].filter(b=>!b.getClientRects().length).length,header:{height:h.height,equipment:[p.width,p.height],inside:p.left>=h.left-1&&p.right<=h.right+1&&p.top>=h.top-1&&p.bottom<=h.bottom+1,overlap:p.left<c.right-1&&p.right>c.left+1&&p.top<c.bottom-1&&p.bottom>c.top+1},cards:[...el.querySelectorAll('[data-radio-id]')].map(b=>{const im=b.querySelector('img'),a=im.getBoundingClientRect(),t=b.querySelector('.living-radio-copy').getBoundingClientRect(),w=b.querySelector('.living-radio-waves').getBoundingClientRect(),q=b.getBoundingClientRect();return {id:b.dataset.radioId,name:b.getAttribute('aria-label'),image:[im.naturalWidth,im.naturalHeight,a.width,a.height],font:parseFloat(getComputedStyle(b.querySelector('.living-radio-name')).fontSize),radius:parseFloat(getComputedStyle(b).borderRadius),height:q.height,clipped:b.scrollHeight>b.clientHeight+1||b.scrollWidth>b.clientWidth+1,overlap:a.left<t.right-1&&a.right>t.left+1&&a.top<t.bottom-1&&a.bottom>t.top+1||w.left<t.right-1&&w.right>t.left+1&&w.top<t.bottom-1&&w.bottom>t.top+1};})};});
   assert.equal(layout.columns,width<=600?2:width<=1024?3:4);assert(!layout.overflow);assert.equal(layout.hidden,0);assert(layout.catalog<=1320);assert(layout.header.inside);assert(!layout.header.overlap);
   for(const c of layout.cards){assert.deepEqual(c.image,[512,512,68,68]);assert.equal(c.font,14);assert.equal(c.radius,12);assert(c.height>=100);assert(!c.clipped,c.name);assert(!c.overlap,c.name);}
   report.layouts.push(layout);fs.writeFileSync(path.join(out,`results-${mode}.json`),JSON.stringify(report,null,2));
   if([1440,768,390].includes(width))await section.screenshot({path:path.join(out,`${label}-${width}.png`)});
   else await section.locator('header').screenshot({path:path.join(out,`${label}-header-${width}.png`)});
  }
 }
 await page.setViewportSize({width:mobile?390:1440,height:1000});
 const playback=()=>page.evaluate(()=>{const list=[...document.querySelectorAll('audio')],a=list.find(x=>!x.paused);return {active:list.filter(x=>!x.paused).length,id:a?.id,time:a?.currentTime,decoded:a?.webkitAudioDecodedByteCount,volume:a?.volume,muted:a?.muted};});
 async function play(label){
  for(const id of candidates[label]){
   const row=inventory.records.find(r=>r.id===id);const target=page.locator(`[data-radio-id="${id}"] .living-radio-cover`);if(mobile)await target.tap();else await target.click();
   try{await page.waitForFunction(expected=>[...document.querySelectorAll('audio')].some(a=>!a.paused&&a.currentTime>1&&a.webkitAudioDecodedByteCount>0&&(a.currentSrc===expected||a.src===expected)),row.stream,{timeout:20000});const s=await playback();assert.equal(s.active,1);assert(!s.muted);const selected=await page.evaluate(()=>{const s=window.PassportContinuity.getState();return {family:s.family,index:s.index};});assert.equal(selected.family,row.family);assert.equal(String(selected.index),String(row.index));report.audio[label]={station:id,...s};return;}
   catch(e){report.attempts.push({station:id,reason:String(e).replace(/https?:\/\/\S+/g,'[redigido]'),state:await playback()});fs.writeFileSync(path.join(out,`results-${mode}.json`),JSON.stringify(report,null,2));}
  }
  throw Error('No confirmed playback for '+label);
 }
 await play('rock');await play('pop');
 await page.locator('#passport-player .play-btn').click();assert.equal((await playback()).active,0);await page.locator('#passport-player .play-btn').click();await page.waitForFunction(()=>[...document.querySelectorAll('audio')].some(a=>!a.paused&&a.currentTime>0));
 const volume=page.locator('#pb-vol-range');await volume.focus();await volume.press('Home');for(let i=0;i<8;i++)await volume.press('ArrowRight');assert.equal((await playback()).volume,.4);
 await page.evaluate(()=>{window.phase3Audio=[...document.querySelectorAll('audio')].find(a=>!a.paused);});
 report.audio.beforeNavigation=await playback();await page.locator('.pb-nav a[href="/noticias.html"]').first().click();await page.waitForTimeout(1000);report.audio.news=await page.evaluate(()=>({same:window.phase3Audio.isConnected,paused:window.phase3Audio.paused,time:window.phase3Audio.currentTime,active:[...document.querySelectorAll('audio')].filter(a=>!a.paused).length,volume:window.phase3Audio.volume}));assert(report.audio.news.same&&!report.audio.news.paused);assert.equal(report.audio.news.active,1);await page.locator('.pb-nav a[href="/"]').first().click();await page.waitForTimeout(1000);report.audio.home=await playback();assert.equal(report.audio.home.active,1);assert.equal(report.audio.home.volume,.4);assert(report.audio.home.time>report.audio.news.time);
 for(const [number,label]of [[2,'rock'],[3,'pop']]){
  const art=family(number).locator('.living-performance-art');await art.scrollIntoViewIfNeeded();await page.waitForFunction(n=>document.querySelector(`#passport-radio-family-${n} .living-performance-art`).dataset.motion==='running',number);
  const before=await playback(),box=await art.locator('img').boundingBox(),frames=[];
  for(let i=0;i<(mobile?8:20);i++){
   if(i)await page.waitForTimeout(100);
   frames.push(await art.evaluate(el=>({time:performance.now(),motion:el.dataset.motion,reels:[...el.querySelectorAll('.living-tape-reel')].map(x=>getComputedStyle(x).transform),hits:[...el.querySelectorAll('.living-kick')].map(x=>Number(getComputedStyle(x).opacity))})));
   if(!mobile)await art.screenshot({path:path.join(out,`${label}-motion-${String(i).padStart(2,'0')}.png`)});
  }
  const after=await playback();assert.equal(after.active,1);assert(after.time>before.time);assert(after.decoded>before.decoded);assert.deepEqual(await art.locator('img').boundingBox(),box);
  if(number===2){assert(frames.some(f=>f.hits.some(x=>x>0)));assert.equal(await art.locator('.living-kick').count(),2);}
  else{assert.equal(await art.locator('.living-tape-reel').count(),4);for(let i=0;i<4;i++)assert(new Set(frames.map(f=>f.reels[i])).size>1);assert.equal(await art.locator('.living-rec').textContent(),'REC');}
  report.animations[label]={frames,audioBefore:before,audioAfter:after};
  await page.emulateMedia({reducedMotion:'reduce'});assert(await art.locator(number===2?'.living-kick':'.living-tape-reel').evaluateAll(xs=>xs.every(x=>getComputedStyle(x).animationName==='none')));await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.living-earth').scrollIntoViewIfNeeded();await page.waitForFunction(n=>document.querySelector(`#passport-radio-family-${n} .living-performance-art`).dataset.motion==='paused',number);report.animations[label].offscreenPaused=true;
 }
 const globe=page.locator('.living-earth');const initial=await globe.getAttribute('data-rotation');await page.waitForTimeout(600);assert.notEqual(await globe.getAttribute('data-rotation'),initial);report.worldGlobePreserved=true;
 const disco=page.locator('.living-disco-ball');const previous=Number(await disco.getAttribute('data-render-frames'));await disco.scrollIntoViewIfNeeded();await page.waitForFunction(p=>Number(document.querySelector('.living-disco-ball').dataset.renderFrames)>p,previous);report.danceSpherePreserved=true;
 const search=page.locator('.passport-radio-search input');await search.fill('Rock Legends');assert.equal(await page.locator('.passport-radio-match').count(),1);assert.equal(await page.locator('[data-radio-id]:visible').count(),412);await search.fill('');report.searchPreserved=true;
 assert.equal(report.errors.length,0);report.status='passed';fs.writeFileSync(path.join(out,`results-${mode}.json`),JSON.stringify(report,null,2));console.log(JSON.stringify({mode,layouts:report.layouts.length,rock:46,pop:123,radios:401,audio:report.audio,attempts:report.attempts,errors:report.errors}));await browser.close();server.close();
})().catch(e=>{if(sessionReport){sessionReport.status='failed';sessionReport.failure=String(e).replace(/https?:\/\/\S+/g,'[redigido]');fs.writeFileSync(path.join(out,`results-${mode}.json`),JSON.stringify(sessionReport,null,2));}console.error(String(e).replace(/https?:\/\/\S+/g,'[redigido]'));server.close();process.exit(1);});
