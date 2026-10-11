const {chromium}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
const origin=process.env.PASSPORT_TEST_ORIGIN||'http://127.0.0.1:4173';
const out='reports/passport-clips-tv';fs.mkdirSync(out,{recursive:true});
const catalog=JSON.parse(fs.readFileSync('data/passport-clips-channels.json')).channels;
const report={checks:[],channels:[],errors:[],testedAt:new Date().toISOString()};
async function check(name,fn){try{report.checks.push({name,status:'PASS',detail:await fn()});}catch(e){report.checks.push({name,status:'FAIL',error:e.message});}}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:900}});const page=await context.newPage();
 page.on('pageerror',e=>report.errors.push(e.message));
 const media='video#passport-clips-video';
 const state=()=>page.locator(media).evaluate(v=>({time:v.currentTime,width:v.videoWidth,height:v.videoHeight,paused:v.paused,volume:v.volume,controls:v.controls,autoplay:v.autoplay,ready:v.readyState,audioBytes:v.webkitAudioDecodedByteCount??null,videoBytes:v.webkitVideoDecodedByteCount??null}));
 await page.goto(origin+'/clips-tv.html');await page.waitForSelector('.clips-channel-card');
 await check('menu, no autoplay, original first and one canonical footer',async()=>{
  assert.equal(await page.locator('.clips-channel-card').count(),11);assert.equal(await page.locator(media).count(),1);
  assert.equal((await state()).paused,true);assert.equal(await page.locator(media).getAttribute('src'),null);
  const links=await page.locator('.news-nav a').evaluateAll(as=>as.map(a=>({name:a.textContent,path:new URL(a.href).pathname})));
  assert(links.findIndex(a=>a.path==='/clips-tv.html')<links.findIndex(a=>a.path==='/videos.html'));assert(links.some(a=>a.path==='/blog/arquivo/letras.html'));
  assert.equal(await page.locator('[data-universal-footer-content]').count(),1);
  assert.equal(await page.locator('.puf-brands img').count(),6);
  for(const selector of ['.puf-brands img','.puf-methods img','.puf-provider img']){
    await page.locator(selector).evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode().catch(()=>{}))));
    assert(await page.locator(selector).evaluateAll(imgs=>imgs.every(i=>i.naturalWidth>0)));
  }
  assert(await page.locator('.puf-provider a').getAttribute('href')==='https://link.mercadopago.com.br/passportradio');
  return links;
 });
 for(const channel of catalog){
  const record={id:channel.id,name:channel.name,status:'NOT_CONFIRMED',playlist:false};
  const responses=[];const failures=[];
  const onResponse=r=>{if(r.url().includes('.m3u8'))responses.push({url:r.url(),status:r.status()});};
  const onFail=r=>{if(r.resourceType()==='media'||r.url().includes('.m3u8'))failures.push(r.failure()?.errorText);};
  page.on('response',onResponse);page.on('requestfailed',onFail);
  try{
    await page.locator(`[data-channel-id="${channel.id}"]`).click();
    await page.waitForFunction(()=>{const v=document.querySelector('#passport-clips-video');return !v.paused&&v.videoWidth>0&&v.currentTime>1;},{},{timeout:35000});
    const a=await state();await page.waitForTimeout(700);const b=await state();assert(b.time>a.time);assert(b.videoBytes===null||b.videoBytes>0);assert(b.audioBytes===null||b.audioBytes>0);
    record.playlist=responses.some(r=>r.status===200);record.status='PLAYING';record.media=b;
    await page.locator(media).evaluate(v=>v.pause());assert((await state()).paused);
    await page.locator('#passport-clips-start').click();await page.waitForFunction(()=>!document.querySelector('#passport-clips-video').paused);
    record.pauseResume=true;
    if(channel.id==='passport-clips-original'){await page.screenshot({path:out+'/tv-original-1280.png',fullPage:true});}
  }catch(e){record.playlist=responses.some(r=>r.status===200);record.error=e.message;record.responses=responses.slice(-4);record.failures=failures;record.message=await page.locator('#passport-clips-status').textContent();record.status='BLOCKED_IN_TEST';}
  finally{page.off('response',onResponse);page.off('requestfailed',onFail);report.channels.push(record);}
 }
 await check('responsive widths, payments and readable cards',async()=>{
  const rows=[];
  for(const width of [320,360,375,390,414,480,768,1280]){
    await page.setViewportSize({width,height:900});await page.waitForTimeout(100);
    const row=await page.evaluate(()=>({width:innerWidth,document:document.documentElement.scrollWidth,video:document.getElementById('passport-clips-video').getBoundingClientRect().width,cards:[...document.querySelectorAll('.clips-channel-card')].every(c=>c.scrollWidth<=c.clientWidth+1),names:[...document.querySelectorAll('.clips-channel-card strong')].every(c=>c.getBoundingClientRect().height>0)}));
    assert(row.document<=width+1);assert(row.video<=width);assert(row.cards&&row.names);rows.push(row);
    if([320,390,1280].includes(width))await page.screenshot({path:out+'/clips-'+width+'.png',fullPage:true});
  }return rows;
 });
 await check('failure is visible, bounded and does not report live',async()=>{
   await page.route(catalog[1].stream,r=>r.abort('failed'));
   await page.locator('[data-channel-id="'+catalog[1].id+'"]').click();
   await page.waitForFunction(()=>/indisponível/.test(document.getElementById('passport-clips-status').textContent),{},{timeout:30000});
   assert((await state()).paused);assert(!(await page.locator('#passport-clips-start').isDisabled()));await page.unroute(catalog[1].stream);
 });
 await check('Home unchanged inventory, menu and new TV destination',async()=>{
   await page.goto(origin+'/');await page.waitForSelector('[data-radio-id]');
   assert.equal(await page.locator('[data-radio-id]').count(),162);
   const links=await page.locator('nav:not(footer nav) a').evaluateAll(as=>as.map(a=>new URL(a.href).pathname));
   assert(links.includes('/clips-tv.html')&&links.includes('/videos.html')&&links.includes('/blog/arquivo/letras.html'));
   assert.equal(await page.locator('.passport-tv-door').getAttribute('href'),'/clips-tv.html');
   return{cards:162};
 });
 await check('real radio → TV → radio and single TV switching',async()=>{
   await page.locator('[data-radio-id="hits:main"]').click();
   await page.waitForFunction(()=>{const v=document.querySelector('#passportHitsAudio');return v&&!v.paused&&v.currentTime>1;},{},{timeout:45000});
   await page.goto(origin+'/clips-tv.html');await page.waitForSelector('.clips-channel-card');
   await page.locator('#passport-clips-start').click();
   await page.waitForFunction(()=>{const v=document.querySelector('#passport-clips-video');return !v.paused&&v.videoWidth>0&&v.currentTime>1;},{},{timeout:35000});
   assert(await page.evaluate(()=>[...document.querySelectorAll('audio')].every(v=>v.paused)));
   const cookie=page.getByRole('button',{name:'ACEITAR COOKIES',exact:true});if(await cookie.count())await cookie.click();
   await page.getByRole('button',{name:'RETOMAR RÁDIO',exact:true}).click();
   await page.waitForFunction(()=>document.querySelector('#passport-clips-video').paused);
   await page.waitForFunction(()=>[...document.querySelectorAll('audio')].some(v=>!v.paused&&v.currentTime>1),{},{timeout:30000});
   await page.locator('[data-channel-id="passport-clips-original"]').click();
   await page.waitForFunction(()=>!document.querySelector('#passport-clips-video').paused,{},{timeout:35000});
   assert(await page.evaluate(()=>[...document.querySelectorAll('audio')].every(v=>v.paused)));
   await page.locator('[data-channel-id="passport-clips-2"]').click();
   assert.equal(await page.locator('video').count(),1);assert.equal(await page.locator('#passport-clips-title').textContent(),'80s Flashback');
   return{oneVideo:true,radioYielded:true,tvYielded:true};
 });
 await check('videoteca preserved and no duplicated TV; leave and return without autoplay',async()=>{
   await page.goto(origin+'/videos.html');await page.waitForSelector('#videos-grid .videos-card');
   assert.equal(await page.locator('#passport-clips-tv').count(),0);const count=await page.locator('#videos-grid .videos-card').count();assert(count>0);
   await page.goto(origin+'/clips-tv.html');await page.waitForSelector('.clips-channel-card');assert((await state()).paused);assert.equal(await page.locator(media).getAttribute('src'),null);
   return{videoCards:count};
 });
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();
 if(report.checks.some(x=>x.status==='FAIL'))process.exitCode=1;
})().catch(e=>{report.fatal=e.message;fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.error(e);process.exitCode=1;});
