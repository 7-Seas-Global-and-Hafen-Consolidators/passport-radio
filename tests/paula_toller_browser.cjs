/* Targeted visual and real-audio evidence; no media mocks. Run from repository root. */
const {chromium}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright');
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/paula-toller-resgate-20261028');fs.mkdirSync(out,{recursive:true});
const article='/editorial/2026/10/28/paula-toller-cinco-discos-influencias-musicais.html';
const server=http.createServer((req,res)=>{let f=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(req.url.split('?')[0].endsWith('/'))f+='index.html';if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end();}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.ttf':'font/ttf','.svg':'image/svg+xml'})[path.extname(f)]||'application/octet-stream');res.end(b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const url='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.BROWSER_EXECUTABLE||chromium.executablePath(),args:['--no-sandbox','--single-process','--no-zygote'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'localhost,127.0.0.1'}:undefined});
const mobile=process.argv.includes('--mobile');const ctx=await browser.newContext({viewport:{width:mobile?390:1440,height:1000},isMobile:mobile,hasTouch:mobile,ignoreHTTPSErrors:true});
const fonts=[['Instrument Sans',400,'01689ad055025ff1.ttf'],['Instrument Sans',700,'d25efe5b0dcf3b36.ttf'],['Bodoni Moda',700,'b8d14dc4cf4c0d27.ttf'],['Source Serif 4',400,'f01900495012279f.ttf']].map(([family,w,file])=>`@font-face{font-family:'${family}';font-weight:${w};src:url('${url}/fonts/passport-footer/${file}');}`).join('');
const inventory=JSON.parse(fs.readFileSync('data/passport-radio-inventory.json'));
const hosts=new Set(['localhost','127.0.0.1','www.youtube-nocookie.com','www.youtube.com','i.ytimg.com','fonts.gstatic.com',...inventory.records.filter(r=>r.id==='passport-nrj-6').map(r=>new URL(r.stream).hostname)]);
await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.hostname==='fonts.googleapis.com')return r.fulfill({body:fonts,contentType:'text/css'});if(hosts.has(u.hostname)||r.request().resourceType()==='media')return r.continue();return r.abort();});
const page=await ctx.newPage(),report={base:cp.execSync('git rev-parse HEAD').toString().trim(),layouts:[],physicalDevice:false,videoPlayback:'Not tested end to end; official embedded players retained, no autoplay.',audio:{tested:false},errors:[]};page.on('pageerror',e=>report.errors.push(e.message.replace(/https?:\/\/\S+/g,'[URL]')));
await page.goto(url+article,{waitUntil:'domcontentloaded'});await page.waitForTimeout(800);await page.evaluate(()=>document.fonts.ready);await page.evaluate(()=>{for(const f of document.querySelectorAll('iframe'))f.loading='eager'});await page.evaluate(()=>Promise.all([...document.querySelectorAll('main img')].map(i=>{i.loading='eager';return i.decode()})));
for(const width of (mobile?[390]:[1440,1024,768,390,375,320])){
 await page.setViewportSize({width,height:1000});await page.waitForTimeout(180);
 await page.evaluate(()=>Promise.all([...document.querySelectorAll('main img')].map(i=>i.decode())));const v=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,h1:document.querySelectorAll('main h1').length,albums:document.querySelectorAll('.album-chapter').length,frames:[...document.querySelectorAll('.video')].map(e=>({w:e.clientWidth,h:e.clientHeight})),images:[...document.querySelectorAll('main img')].map(e=>({loaded:e.complete&&e.naturalWidth>0,width:e.clientWidth})),footer:document.querySelectorAll('[data-universal-footer-content]').length,height:document.querySelector('main').offsetHeight}));
 assert(v.scroll<=width);assert.equal(v.h1,1);assert.equal(v.albums,6);assert.equal(v.footer,1);assert(v.images.every(i=>i.loaded));assert(v.frames.every(f=>Math.abs(f.w/f.h-16/9)<.03));report.layouts.push(v);
 if([1440,768,390].includes(width)){
 await page.locator('.hero').screenshot({path:path.join(out,`inicio-${width}.png`)});
 for(let i=1;i<=6;i++){await page.locator('#disco-'+i).scrollIntoViewIfNeeded();await page.waitForTimeout(350);}await page.locator('.album-grid').screenshot({path:path.join(out,`discos-${width}.png`)});
 await page.locator('#ajude').screenshot({path:path.join(out,`rodape-${width}.png`)});
 await page.locator('.story-chapter').last().screenshot({path:path.join(out,`encerramento-${width}.png`)});
 }
}
await page.setViewportSize({width:1440,height:1000});for(let i=1;i<=6;i++){await page.locator('#disco-'+i).screenshot({path:path.join(out,`disco-${i}-1440.png`)});}report.embeds=await Promise.all(page.frames().filter(f=>f.url().includes('youtube')).map(async f=>({url:f.url(),text:(await f.locator('body').innerText().catch(()=>'' )).slice(0,180)})));const articleFooter=await page.locator('[data-universal-footer-content]').innerHTML();await page.goto(url+'/noticias.html',{waitUntil:'domcontentloaded'});await page.locator('a[href="'+article+'"]').first().waitFor({timeout:30000});const card=page.locator('.news-card').filter({has:page.locator('a[href="'+article+'"]')});assert.equal(await card.count(),1);
await page.getByRole('button',{name:/aceitar|aceito|concordo/i}).first().click({timeout:800}).catch(()=>{});const link=page.locator('a[href="'+article+'"]').first();await page.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(b=>/aceitar|aceito|concordo/i.test(b.textContent));b?.click()});const cardNode=link.locator('xpath=ancestor::*[contains(@class,"list-card") or contains(@class,"news-card")][1]');
for(const width of [1440,390]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);await cardNode.screenshot({path:path.join(out,`cartao-${width}.png`)});}
assert.equal(await page.locator('[data-universal-footer-content]').innerHTML(),articleFooter);report.footerIdenticalToNews=true;
fs.writeFileSync(path.join(out,mobile?'browser-results-mobile.json':'browser-results.json'),JSON.stringify(report,null,2));
// Test the actual persistent reader, using an existing working station and original controls.
try{
 await page.setViewportSize({width:1440,height:1000});await page.goto(url+'/',{waitUntil:'domcontentloaded'});await page.locator('[data-radio-id="passport-nrj-6"]:not([disabled])').waitFor({timeout:60000});await page.locator('[data-radio-id="passport-nrj-6"]').click();
 await page.waitForFunction(()=>[...document.querySelectorAll('audio')].some(a=>!a.paused&&a.currentTime>1&&a.webkitAudioDecodedByteCount>0),null,{timeout:25000});
 await page.evaluate(()=>window.paulaTestAudio=[...document.querySelectorAll('audio')].find(a=>!a.paused));
 const snap=()=>page.evaluate(()=>({time:window.paulaTestAudio.currentTime,same:window.paulaTestAudio.isConnected,paused:window.paulaTestAudio.paused,active:[...document.querySelectorAll('audio')].filter(a=>!a.paused).length,decoded:window.paulaTestAudio.webkitAudioDecodedByteCount}));
 report.audio.before=await snap();await page.locator('.pb-nav a[href="/noticias.html"]').first().click();await page.waitForTimeout(1000);report.audio.news=await snap();
 // Reader content is owned by the existing persistent navigator.
 const frames=page.frames();
 const reader=frames.find(f=>f.url().includes('/noticias.html'));if(!reader)throw Error('News reader frame not found');await reader.locator('a[href="'+article+'"]').first().click();await page.waitForTimeout(1000);report.audio.article=await snap();
 const art=page.frames().find(f=>f.url().includes('paula-toller-cinco'));if(!art)throw Error('Article reader frame not found');await art.locator('.story-return').click();await page.waitForTimeout(1000);report.audio.return=await snap();
 assert(report.audio.return.time>report.audio.before.time);assert([report.audio.news,report.audio.article,report.audio.return].every(a=>a.same&&!a.paused&&a.active===1));report.audio.tested=true;
}catch(e){report.audio.limitation=e.message.replace(/https?:\/\/\S+/g,'[URL]');}
fs.writeFileSync(path.join(out,mobile?'browser-results-mobile.json':'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close();server.close();
})().catch(e=>{console.error(e);process.exit(1)});
