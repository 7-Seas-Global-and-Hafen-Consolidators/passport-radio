const {chromium}=require('playwright'),assert=require('node:assert/strict'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..');const SHOTS=process.env.ANUNCIE_SHOTS||path.resolve(ROOT,'../review');
const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.mp3':'audio/mpeg','.json':'application/json'};
async function captureComplete(page,file){
  // Software renderer textures can wrap above 8192 px. Capture real viewport
  // tiles and join their pixels, without resizing or rebuilding the page.
  const dir=fs.mkdtempSync('/tmp/passport-shots-');const tiles=[];
  const height=await page.evaluate(()=>document.documentElement.scrollHeight);
  const width=page.viewportSize().width,viewHeight=page.viewportSize().height;
  for(let y=0;y<height;y+=viewHeight){
    await page.evaluate(y=>window.scrollTo(0,y),y);await page.waitForTimeout(150);
    const actual=await page.evaluate(()=>scrollY);const tile=path.join(dir,`${y}.png`);
    await page.screenshot({path:tile,fullPage:false});tiles.push({file:tile,y:actual});
  }
  require('child_process').execFileSync('python',['-c',"import json,sys; from PIL import Image; d=json.load(sys.stdin); out=Image.new('RGB',(d['width'],d['height']),'white'); [out.paste(Image.open(t['file']),(0,t['y'])) for t in d['tiles']]; out.save(d['file'])"],{input:JSON.stringify({width,height,tiles,file})});
  fs.rmSync(dir,{recursive:true});await page.evaluate(()=>window.scrollTo(0,0));
}
const server=http.createServer((req,res)=>{const file=path.join(ROOT,decodeURIComponent(req.url.split('?')[0]));fs.readFile(file,(e,data)=>{if(e){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(data);});});
(async()=>{
 await new Promise(r=>server.listen(8781,'127.0.0.1',r));
 const proxyUrl=process.env.HTTPS_PROXY ? new URL(process.env.HTTPS_PROXY) : null;
 const proxy=proxyUrl ? {server:proxyUrl.origin,bypass:'127.0.0.1,localhost',username:decodeURIComponent(proxyUrl.username),password:decodeURIComponent(proxyUrl.password)} : undefined;
 const browser=await chromium.launch({headless:true,proxy,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-zygote','--single-process']}: {})});
 const errors=[];let page;
 try{
  const ctx=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:1440,height:1000}});page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8781/anuncie.html');await page.waitForTimeout(1500);
  console.log('loaded page');assert.equal(await page.locator('#ad-days option').count(),160);
  assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'8.45');
  await page.selectOption('#ad-days','10');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'0.00');
  await page.selectOption('#ad-format','sponsored');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'55.98');assert.equal(await page.locator('#ad-days').isDisabled(),true);
  await page.selectOption('#ad-format','top');await page.selectOption('#ad-days','30');await page.selectOption('#ad-advertiser','banda');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'194.73');
  assert.match(decodeURIComponent(await page.locator('#ad-contact').getAttribute('href')),/12.5%/);
  await page.selectOption('#ad-advertiser','antigo');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'200.29');
  console.log('calculator passed');const first=await page.locator('#movement-index').innerText();await page.waitForTimeout(4200);const second=await page.locator('#movement-index').innerText();assert.ok(Number(second.replaceAll('.',''))>Number(first.replaceAll('.','')));
  await page.reload();assert.ok(Number((await page.locator('#movement-index').innerText()).replaceAll('.',''))>=Number(second.replaceAll('.','')));
  const tab=await ctx.newPage();await tab.goto('http://127.0.0.1:8781/anuncie.html');assert.ok(Math.abs(await page.evaluate(()=>PassportMovement.valueAt())-await tab.evaluate(()=>PassportMovement.valueAt()))<2);await tab.close();
  await page.waitForFunction(()=>document.querySelector('#history-days tr').children.length===2,null,{timeout:15000});assert.equal(await page.locator('#history-days tr').count(),30);
  assert.equal(await page.locator('#measured-today').innerText(),'96.842');assert.equal(await page.locator('#history-total').innerText(),'3.128.252');assert.equal(await page.locator('#audience-note').innerText(),'PERFIL DEMONSTRATIVO');assert.ok(!(await page.locator('body').innerText()).includes('Antes da coleta'));console.log('counter and demonstration passed');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.paused&&a.currentTime===0),true);
  await page.locator('#recado-toggle').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#recado-audio').paused);await page.waitForTimeout(400);
  assert.equal(await page.locator('#recado-toggle').getAttribute('aria-pressed'),'true');
  await page.click('#recado-toggle');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.paused),true);
  await page.click('#recado-stop');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.currentTime),0);
  await page.click('#recado-toggle');await page.waitForFunction(()=>document.querySelector('#recado-audio').duration>0);await page.evaluate(()=>{const a=document.querySelector('#recado-audio');a.currentTime=a.duration-0.2;});await page.waitForFunction(()=>document.querySelector('#recado-audio').ended);
  assert.equal(await page.locator('#recado-toggle').innerText(),'▶ OUÇA DE NOVO');await page.click('#recado-toggle');await page.waitForFunction(()=>!document.querySelector('#recado-audio').paused);await page.click('#recado-stop');
  console.log('audio passed');await page.click('#choose-trial');assert.equal(await page.locator('#ad-format').inputValue(),'strip');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'0.00');
  await page.evaluate(async()=>{window.scrollTo(0,0);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.waitForTimeout(300);await captureComplete(page,path.join(SHOTS,'anuncie-desktop.png'));
  for(const width of [320,375,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(300);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
   assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
   const img=page.locator('.campaign img');const box=await img.boundingBox();const ratio=await img.evaluate(i=>i.naturalWidth/i.naturalHeight);assert.ok(Math.abs(box.width/box.height-ratio)<.01);
   if(width===390){await page.evaluate(async()=>{window.scrollTo(0,0);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.waitForTimeout(300);await captureComplete(page,path.join(SHOTS,'anuncie-mobile.png'));}
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.ok(await page.locator('#movement-index').innerText()!=='—');
  // Empty/error source must preserve the configurator and produce no JS errors.
  await page.route('**/functions/v1/passport-media-kit',route=>route.fulfill({status:503,body:'{}'}));await page.reload();await page.waitForTimeout(300);assert.equal(await page.locator('#measurement-status').innerText(),'DADO DEMONSTRATIVO');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'8.45');
  assert.deepEqual(errors,[]);console.log('PASS desktop/mobile 320/375/390/768/1440; 30-day source; empty/error source; counter/reload/tab/reduced motion; audio play/pause/stop/end/replay/keyboard; calculator; all images; no overflow; no JS errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
