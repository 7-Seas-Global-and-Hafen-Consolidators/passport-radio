// Playwright + Chromium. Controlled HTTP media fixture only; no production engine mutation.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'../..');
const articles=JSON.parse(fs.readFileSync(path.join(__dirname,'article-manifest.json')));
const paths=articles.map(a=>a.route);
const mimes={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const child=require('node:child_process');const baseline=child.execFileSync('git',['show','635b975c35109fd71bb8b0ec8c799c3710f78a05:index.html']);
const server=http.createServer((req,res)=>{if(new URL(req.url,'http://localhost').pathname==='/__baseline_home.html'){res.writeHead(200,{'Content-Type':'text/html'});res.end(baseline);return;}let f=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':mimes[path.extname(f)]||'application/octet-stream'});res.end(e?'missing':b);});});
function wav(){const rate=8000,n=rate*120,b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(1000*Math.sin(i*2*Math.PI*220/rate)),44+i*2);return b;}
const fixture=wav();
(async()=>{
 await new Promise(r=>server.listen(8765,r));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=no-user-gesture-required'],headless:true});
 const report={scope:'Ten articles from persistent source; Home and audio systems unchanged.',method:'Original engines and selected stream URLs; media HTTP response replaced with WAV for transport verification. YouTube external responses replaced with test documents. Neither external radio-provider audio nor YouTube playback availability is certified.',pages:[],stations:[],feed:[],result:'RUNNING'};
 try{
  for(const family of ['mpb','hits','disco']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});
   let mediaRequests=0;
   await context.route('**/*',r=>{if(r.request().resourceType()==='media'){mediaRequests++;return r.fulfill({status:200,contentType:'audio/wav',body:fixture});}if(/youtube(?:-nocookie)?\.com/.test(r.request().url()))return r.request().resourceType()==='document'?r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Embed test fixture</title>'}):r.abort();return r.continue();});
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://localhost:8765/');await page.waitForFunction(()=>window.PassportAudioRuntime?.ready&&window.PassportPersistNav);
   // Explicit test-only selection represents a listener who already started the radio.
   await page.evaluate(family=>PassportAudioRuntime.engine.select(family,family),family);
   await page.waitForFunction(()=>[...document.querySelectorAll('#qwen-engine-bay audio')].some(a=>!a.paused&&a.currentTime>.5));
   await page.evaluate(()=>{
    window.__doc=document;window.__runtime=PassportAudioRuntime;window.__bay=document.getElementById('qwen-engine-bay');window.__radio=[...__bay.querySelectorAll('audio')].find(a=>!a.paused);window.__src=__radio.currentSrc;window.__events=[];
    for(const event of ['pause','emptied','loadstart','abort','ended'])__radio.addEventListener(event,()=>__events.push(event));
    window.__calls={select:0,init:0,playPause:0,pause:0};for(const method of Object.keys(__calls)){const obj=method==='pause'?PassportAudioRuntime:PassportAudioRuntime.engine,original=obj[method];if(original)obj[method]=function(...args){__calls[method]++;return original.apply(this,args);};}
   });
   const snap=()=>page.evaluate(()=>({sameDocument:document===__doc,sameRuntime:PassportAudioRuntime===__runtime,sameHost:document.getElementById('qwen-engine-bay')===__bay,sameAudio:__radio.isConnected&&[...__bay.querySelectorAll('audio')].includes(__radio),sameSource:__radio.currentSrc===__src,src:__radio.currentSrc,time:__radio.currentTime,paused:__radio.paused,state:PassportAudioRuntime.state(),chosen:PassportContinuity.getState(),events:[...__events],calls:{...__calls}}));
   const station={family,forward:[],reverse:[],paused:[],errors};report.stations.push(station);
   async function navigate(href,into,paused=false){
    const before=await snap(),requests=mediaRequests;
    const body=page.locator('#pp-nav-page').count().then(async count=>count&&await page.locator('#pp-nav-page').isVisible()?page.frameLocator('#pp-nav-page').locator('body'):page.locator('body'));
    await (await body).evaluate((body,href)=>{const a=body.ownerDocument.createElement('a');a.href=href;body.append(a);a.click();a.remove();},href);
    await page.waitForFunction(href=>document.querySelector('#pp-nav-page')?.contentDocument?.location.pathname===href&&document.querySelector('#pp-nav-page')?.contentDocument?.querySelector('.passport-continuity-controls'),href);
    await page.waitForTimeout(250);const after=await snap();
    assert.ok(after.sameDocument&&after.sameRuntime&&after.sameHost&&after.sameAudio&&after.sameSource);assert.equal(after.chosen.family,family);if(!paused)assert.equal(after.state.family,family);assert.equal(after.paused,paused);assert.equal(mediaRequests,requests);assert.ok(Object.values(after.calls).every(n=>n===0));assert.deepEqual(after.events,[]);if(!paused)assert.ok(after.time>before.time);else assert.ok(Math.abs(after.time-before.time)<.1);
    assert.equal(await page.frameLocator('#pp-nav-page').locator('#qwen-engine-bay').count(),0);
    into.push({href,before,after,newMediaRequests:mediaRequests-requests,noDuplicateHost:true,result:'PASS'});
   }
   if(family==='disco'){await page.evaluate(()=>PassportContinuity.pause());await page.waitForTimeout(50);await page.evaluate(()=>{__events=[];__calls={select:0,init:0,playPause:0,pause:0};});}
   await navigate(paths[1],station.forward,family==='disco');
   const before=await snap(),requests=mediaRequests;
   await page.frameLocator('#pp-nav-page').locator('body').evaluate(body=>{const a=body.ownerDocument.createElement('a');a.href='/';body.append(a);a.click();a.remove();});
   await page.waitForFunction(()=>document.querySelector('#pp-nav-page').hidden);await page.waitForTimeout(250);const after=await snap();
   assert.ok(after.sameDocument&&after.sameRuntime&&after.sameHost&&after.sameAudio&&after.sameSource);assert.equal(after.chosen.family,family);assert.equal(after.paused,family==='disco');assert.equal(mediaRequests,requests);assert.equal(after.chosen.volume,before.chosen.volume);assert.deepEqual(after.events,[]);assert.ok(Object.values(after.calls).every(n=>n===0));if(family!=='disco')assert.ok(after.time>before.time);
   station.returnHome={before,after,newMediaRequests:mediaRequests-requests,result:'PASS'};
   assert.deepEqual(errors,[]);station.result='PASS';await context.close();
  }
  report.result='PASS_TEN_ARTICLES';
 }catch(error){report.result='FAIL';report.error=String(error);process.exitCode=1;}
 finally{fs.writeFileSync(path.join(__dirname,'return-radio-qa.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,error:report.error,pages:report.pages.map(p=>({artist:p.artist,width:p.width,result:p.result})),stations:report.stations.map(s=>({family:s.family,result:s.result,forward:s.forward.length,reverse:s.reverse.length,paused:s.paused.length})),feed:report.feed,oasis:report.oasis}));await browser.close();server.close();}
})();
