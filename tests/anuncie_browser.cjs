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
 fs.mkdirSync(SHOTS,{recursive:true});
 require('child_process').execFileSync('python',['-c',"import zxingcpp; from PIL import Image; im=Image.open('images/anuncie/pix-qr-original.png').convert('RGB'); assert im.size==(675,675); assert all(im.getpixel((x,y))==(255,255,255) for x in range(675) for y in range(675) if x<48 or y<48 or x>=627 or y>=627); r=zxingcpp.read_barcode(im); assert r; p=r.text; assert p.startswith('000201') and 'br.gov.bcb.pix' in p and 'passportradio.online@gmail.com' in p; crc=65535\nfor b in p[:-4].encode():\n crc ^= b<<8\n for _ in range(8): crc=((crc<<1)^0x1021)&65535 if crc&32768 else (crc<<1)&65535\nassert f'{crc:04X}'==p[-4:]"],{cwd:ROOT});
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
  assert.equal(await page.locator('#history-days').count(),0);assert.equal(await page.locator('.commercial-explanations > article').count(),4);
  assert.equal(await page.locator('.audience,.audience-grid,.audience-bar,meter,#audience-device,#audience-source').count(),0);
  assert.ok(!(await page.locator('body').innerText()).includes('QUEM ESTÁ AQUI'));
  assert.equal(await page.locator('.commercial-explanations').evaluate(el=>el.nextElementSibling.classList.contains('turn')),true);
  const text=await page.locator('body').innerText();for(const token of ['DEMONSTRATIVO','DEMONSTRATIVOS','Antes da coleta','MEDIÇÃO REAL EM ACUMULAÇÃO'])assert.ok(!text.includes(token));
  console.log('counter and audience removal passed');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.paused&&a.currentTime===0),true);
  await page.locator('#recado-toggle').focus();await page.keyboard.press('Enter');await page.waitForFunction(()=>!document.querySelector('#recado-audio').paused);await page.waitForTimeout(400);
  assert.equal(await page.locator('#recado-toggle').getAttribute('aria-pressed'),'true');
  await page.click('#recado-toggle');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.paused),true);
  await page.click('#recado-stop');assert.equal(await page.locator('#recado-audio').evaluate(a=>a.currentTime),0);
  await page.click('#recado-toggle');await page.waitForFunction(()=>document.querySelector('#recado-audio').duration>0);await page.evaluate(()=>{const a=document.querySelector('#recado-audio');a.currentTime=a.duration-0.2;});await page.waitForFunction(()=>document.querySelector('#recado-audio').ended);
  assert.equal(await page.locator('#recado-toggle').innerText(),'▶ OUÇA DE NOVO');await page.click('#recado-toggle');await page.waitForFunction(()=>!document.querySelector('#recado-audio').paused);await page.click('#recado-stop');
  console.log('audio passed');
  await ctx.grantPermissions(['clipboard-read','clipboard-write']);
  await page.click('#copy-pix');assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),'passportradio.online@gmail.com');assert.equal(await page.locator('#copy-pix').innerText(),'CHAVE COPIADA');
  await page.evaluate(async()=>{
    window.readPixClipboard=navigator.clipboard.readText.bind(navigator.clipboard);await navigator.clipboard.writeText('fallback-probe');const legacyCopy=document.execCommand.bind(document);
    window.copiedFallback=null;Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:()=>Promise.reject(new Error('Denied'))}});
    document.execCommand=(command)=>{window.copiedFallback={command,text:document.querySelector('textarea').value};return legacyCopy(command);};
  });
  await page.click('#copy-pix');assert.deepEqual(await page.evaluate(()=>window.copiedFallback),{command:'copy',text:'passportradio.online@gmail.com'});assert.equal(await page.locator('#pix-copy-status').innerText(),'CHAVE COPIADA');assert.equal(await page.evaluate(()=>window.readPixClipboard()),'passportradio.online@gmail.com');
  console.log('PIX Clipboard API and fallback passed');await page.evaluate(()=>{document.querySelector('#copy-pix').textContent='COPIAR CHAVE PIX';document.querySelector('#pix-copy-status').textContent='';});await page.click('#choose-trial');assert.equal(await page.locator('#ad-format').inputValue(),'strip');assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'0.00');
  await page.evaluate(async()=>{window.scrollTo(0,0);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.waitForTimeout(300);await captureComplete(page,path.join(SHOTS,'anuncie-desktop.png'));
  for(const width of [320,375,390,768,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(300);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
   assert.deepEqual(await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)),[]);
   const img=page.locator('.campaign img');const box=await img.boundingBox();const ratio=await img.evaluate(i=>i.naturalWidth/i.naturalHeight);assert.ok(Math.abs(box.width/box.height-ratio)<.01);
   const flow=await page.locator('.commercial-explanations').evaluate(el=>({gap:el.nextElementSibling.getBoundingClientRect().top-el.getBoundingClientRect().bottom,margin:parseFloat(getComputedStyle(el.nextElementSibling).marginTop)}));assert.equal(flow.gap,flow.margin);assert.equal(flow.gap,24);
   const counter=await page.locator('.movement-line').evaluate(el=>{const c=getComputedStyle(el),n=getComputedStyle(el.querySelector('strong'));return {font:parseFloat(c.fontSize),line:parseFloat(c.lineHeight),top:parseFloat(c.marginTop),bottom:parseFloat(c.marginBottom),weight:n.fontWeight,color:n.color,tag:el.tagName,height:el.getBoundingClientRect().height};});
   assert.equal(counter.font,width<=750?15:16);assert.ok(Math.abs(counter.line/counter.font-1.4)<.001);assert.ok(counter.top<=8&&counter.bottom<=8);assert.equal(counter.weight,'700');assert.equal(counter.color,'rgb(196, 30, 58)');assert.equal(counter.tag,'P');if(width>=390)assert.ok(counter.height<=counter.line+1);
   const qr=page.locator('.commercial-pix-qr');const qrBox=await qr.boundingBox();assert.equal(qrBox.width,180);assert.equal(qrBox.height,180);
   if(width===390||width===1440){
    const qrFile=path.join(SHOTS,`pix-rendered-${width}.png`);await qr.screenshot({path:qrFile});
    const decoded=require('child_process').execFileSync('python',['-c',"import sys,zxingcpp; from PIL import Image; r=zxingcpp.read_barcode(Image.open(sys.argv[1])); assert r; print(r.text)",qrFile],{encoding:'utf8'}).trim();assert.equal(decoded,'00020126520014br.gov.bcb.pix0130passportradio.online@gmail.com5204000053039865802BR5924PASSPORT RADIO INOVA SIM6009Sao Paulo62240520daqr372408545063307463048DDA');
   }
   if(width===390){await page.evaluate(async()=>{window.scrollTo(0,0);await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});await page.waitForTimeout(300);await captureComplete(page,path.join(SHOTS,'anuncie-mobile.png'));}
  }
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();assert.ok(await page.locator('#movement-index').innerText()!=='—');
  // Empty/error source must preserve the configurator and produce no JS errors.
  await page.route('**/functions/v1/passport-media-kit',route=>route.fulfill({status:503,body:'{}'}));await page.reload();await page.waitForTimeout(300);assert.equal(await page.locator('.audience-bar').count(),0);assert.equal(await page.locator('#ad-total').getAttribute('data-value'),'8.45');
  // Live page crosses São Paulo midnight without a reload or collection POST.
  const clockContext=await browser.newContext({ignoreHTTPSErrors:true});const clockPage=await clockContext.newPage();const posts=[];
  await clockPage.route('**/functions/v1/passport-media-kit',route=>{if(route.request().method()==='POST')posts.push(route.request().postData());return route.fulfill({status:503,body:'{}'});});
  await clockPage.clock.install({time:new Date('2026-09-30T23:59:58-03:00')});await clockPage.goto('http://127.0.0.1:8781/anuncie.html');
  assert.equal(await clockPage.locator('#movement-index').getAttribute('data-day'),'2026-09-30');await clockPage.clock.runFor(2000);
  assert.equal(await clockPage.locator('#movement-index').getAttribute('data-day'),'2026-10-01');assert.equal(await clockPage.locator('#movement-index').innerText(),'0');await clockPage.clock.runFor(15000);assert.ok(await clockPage.evaluate(()=>PassportMovement.valueAt())>0);assert.deepEqual(posts,[]);await clockPage.close();
  assert.deepEqual(errors,[]);console.log('PASS PIX decoded original/rendered 180px desktop/mobile, both copy paths, exact counter CSS, audience removed without gap, São Paulo live midnight and zero counter POSTs');console.log('PASS desktop/mobile 320/375/390/768/1440; audience removal; error source; counter/reload/tab/reduced motion; audio play/pause/stop/end/replay/keyboard; calculator; all images; no overflow; no JS errors');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
