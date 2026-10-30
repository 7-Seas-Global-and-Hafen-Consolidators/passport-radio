/* Chromium against this checkout and real external radio audio. No production publish. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/playwright':path.join(process.env.EDITORIAL_PLAYWRIGHT, 'node_modules/playwright'));
const http=require('node:http'),crypto=require('node:crypto'),cp=require('node:child_process');
const saved = JSON.parse(fs.readFileSync('tests/fixtures/automatic-editorial-preservation.json','utf8'));
let origin;
const root=path.resolve(__dirname,'..');
const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(file.endsWith(path.sep))file+='index.html';if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}fs.readFile(file,(error,body)=>{if(error){try{body=cp.execFileSync('git',['show','HEAD:'+path.relative(root,file).split(path.sep).join('/')],{cwd:root,maxBuffer:20*1024*1024,stdio:['ignore','pipe','ignore']});}catch{res.writeHead(404);return res.end();}}res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(body)});});
const files = new Set(['/'+saved.article_path,'/js/passport-persist-nav.js','/js/passport-automatic-editorial.js','/css/passport-automatic-editorial.css']);
const report = {test:'native automatic editorial', acquisitions:0, generations:0, publications:0, checks:[],diagnostics:[],imageReadiness:[]};
const record = (name,evidence={}) => { report.checks.push({name,result:'PASS',...evidence}); console.log(JSON.stringify(report.checks.at(-1))); };
async function context(browser, viewport) {
  const ctx = await browser.newContext({viewport,ignoreHTTPSErrors:true});
  ctx.on('page',p=>{p.on('pageerror',e=>report.diagnostics.push(e.message.replace(/https?:\/\/\S+/g,'[URL]')));p.on('console',m=>{if(m.type()==='error')report.diagnostics.push(m.text().replace(/https?:\/\/\S+/g,'[URL]'))});});
  const fonts=[['Instrument Sans',400,'01689ad055025ff1.ttf'],['Instrument Sans',600,'5e39a358a65a72b6.ttf'],['Instrument Sans',700,'d25efe5b0dcf3b36.ttf'],['Bodoni Moda',700,'b8d14dc4cf4c0d27.ttf'],['Source Serif 4',400,'f01900495012279f.ttf']].map(([family,w,f])=>`@font-face{font-family:'${family}';font-weight:${w};src:url('${origin}/fonts/passport-footer/${f}');}`).join('');
  await ctx.route('**/*',route=>{const u=new URL(route.request().url());if(u.hostname==='fonts.googleapis.com')return route.fulfill({body:fonts,contentType:'text/css'});if(u.hostname==='127.0.0.1'||['media','xhr','fetch'].includes(route.request().resourceType()))return route.continue();return route.abort();});
  return ctx;
}
async function snapshot(page) {
  const rows=await page.evaluate(() => [...document.querySelectorAll('audio')].filter(a=>!a.paused).map(a=>({id:a.id,src:a.currentSrc,time:a.currentTime,ready:a.readyState,volume:a.volume})));
  return rows.map(({src,...row})=>({...row,sourceHash:crypto.createHash('sha256').update(src).digest('hex')}));
}
async function playing(page,id) {
  await page.waitForFunction(id => {
    const a = document.getElementById(id);
    return a && !a.paused && a.readyState>=3 && a.currentTime>1;
  },id,{timeout:60000});
  const rows = await snapshot(page);
  assert.equal(rows.length,1,'Exactly one real stream must be active');
  assert.equal(rows[0].id,id);
  return rows[0];
}
async function articleReady(page) {
  await page.locator('#passport-editorial-outlet main[data-passport-automatic-article] h1').waitFor();
  await page.waitForFunction(() => !!document.querySelector('[data-passport-automatic] .passport-support-float'));
}
async function presentation(page,label) {
  await articleReady(page);
  assert.equal(await page.locator('header.pb-mast').count(),1);
  assert.equal(await page.locator('footer.pb-footer').count(),1);
  const links = await page.locator('.pb-nav a').evaluateAll(nodes=>nodes.map(a=>a.getAttribute('href')));
  for (const href of ['/','/noticias.html','/agenda.html','/editorial.html','/bandas/index.html','/blog.html','/jogos.html','/videos.html','/radio.html','/loja.html','/divulgar-bandas.html','/promocoes.html','/anuncie.html','/doe.html']) assert(links.includes(href),href);
  const footer = await page.locator('footer.pb-footer').innerText();
  for (const text of ['1998–2026','Política de Privacidade','Termos de Uso','Política de Cookies','Contato','PIX','BOLETO','CARTÃO']) assert(footer.includes(text),text);
  assert.equal(await page.locator('footer a[href="https://link.mercadopago.com.br/passportradio"]').count()>=1,true);
  assert.equal(await page.locator('footer.pb-footer .puf-methods img[src="/images/payments/caixa.png"]').count(),1);
  assert(!footer.includes('Rock sem fronteiras'),'Retired footer slogan');
  await page.locator('.fofonete-dock').waitFor();
  assert.equal(await page.locator('.fofonete-dock').evaluate(node=>getComputedStyle(node).position),'static');
  assert.equal(await page.locator('.passport-support-float').evaluate(node=>getComputedStyle(node).display),'none','Duplicate support anchor');
  const imageStates = () => page.locator('main img').evaluateAll(images=>images.map(i=>({src:i.getAttribute('src'),complete:i.complete,naturalWidth:i.naturalWidth,loading:i.loading})));
  report.imageReadiness.push({label,phase:'before',images:await imageStates()});
  // Full-page evidence must request off-screen lazy photos before waiting for every image.
  await page.locator('main img').evaluateAll(images=>images.forEach(i=>{i.loading='eager';}));
  try {
    await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(i=>i.complete && i.naturalWidth>0));
  } catch(error) {
    const images=(await imageStates()).filter(i=>!i.complete||i.naturalWidth===0);
    report.imageReadiness.push({label,phase:'timeout',images});
    console.error(JSON.stringify({label,blockedImages:images}));
    throw error;
  }
  report.imageReadiness.push({label,phase:'loaded',images:await imageStates()});
  assert.equal(await page.locator('main .hero img').first().getAttribute('src'),saved.image);
  const geometry = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,article:document.querySelector('#article-text p').getBoundingClientRect().width,logo:getComputedStyle(document.querySelector('.pb-mast__logo'),'::before').backgroundImage,titleFont:getComputedStyle(document.querySelector('main h1')).fontFamily,bodyFont:getComputedStyle(document.querySelector('#article-text p')).fontFamily}));
  assert(geometry.scroll<=geometry.width+1,'Horizontal overflow');
  assert(geometry.article<=760.5,'Approved reading width');
  assert(geometry.logo.includes('passport-radio-masthead-2026.svg'),'Approved SVG masthead');
  assert(/Bodoni Moda|Passport Editorial Display/.test(geometry.titleFont));
  assert(/Source Serif 4|Passport Editorial Text/.test(geometry.bodyFont));
  assert.equal(await page.locator('main audio,main video[autoplay],main iframe[src*="autoplay=1"]').count(),0);
  record(label,geometry);
  const cookies = page.getByRole('button',{name:'ACEITAR COOKIES',exact:true});
  if (await cookies.count()) await cookies.click();
  await page.screenshot({path:`test-results/${label}.png`,fullPage:true});
}
(async()=>{
  fs.mkdirSync('test-results',{recursive:true});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));origin='http://127.0.0.1:'+server.address().port;
  const launchOptions = {executablePath:process.env.EDITORIAL_CHROME||'/usr/bin/google-chrome',args:['--no-sandbox',...(process.env.CI?[]:['--single-process','--no-zygote']),'--autoplay-policy=document-user-activation-required'],proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY,bypass:'localhost,127.0.0.1'}:undefined};let browser=await chromium.launch(launchOptions);
  try {
    if(!process.argv.includes('--mobile-only')){
    const ctx = await context(browser,{width:1280,height:900});
    const page = await ctx.newPage();
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.PassportAudioRuntime?.ready,null,{timeout:120000});
    await page.getByRole('button',{name:'Hits',exact:true}).click();
    const hits = await playing(page,'passportHitsAudio');
    const transport = await page.locator('#passportHitsAudio').elementHandle();
    const timeOrigin = await page.evaluate(()=>performance.timeOrigin);
    await page.locator('.pb-nav a[href="/editorial.html"]').click();
    await page.getByRole('link',{name:'A Força Implacável de Badmotorfinger na História do Rock',exact:true}).click();
    await presentation(page,'desktop');
    const next = await playing(page,'passportHitsAudio');
    assert.equal(next.sourceHash,hits.sourceHash);assert(next.time>hits.time);
    assert(await page.evaluate(a=>a===document.getElementById('passportHitsAudio'),transport),'Transport node replaced');
    assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin,'Document reloaded');
    record('Hits Home → Arquivo → Badmotorfinger',{before:hits,after:next,sameDocument:true,sameTransport:true});
    await page.locator('a.mp-row').filter({hasText:/^MPB$/}).click();
    const mpb = await playing(page,'passportMPBAudio');
    const mpbTransport = await page.locator('#passportMPBAudio').elementHandle();
    assert(await page.locator('#passportHitsAudio').evaluate(a=>a.paused));
    await page.locator('.pb-nav a[href="/"]').click();
    await page.waitForFunction(()=>location.pathname==='/');
    const mpbAfter = await playing(page,'passportMPBAudio');
    assert(mpbAfter.time>mpb.time);assert.equal(mpbAfter.sourceHash,mpb.sourceHash);
    assert(await page.evaluate(a=>a===document.getElementById('passportMPBAudio'),mpbTransport));
    assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin);
    record('Explicit Hits → MPB mutex and return Home',{before:mpb,after:mpbAfter,sameDocument:true,sameTransport:true});
    await page.getByRole('button',{name:'Pausar',exact:true}).click();
    assert.equal((await snapshot(page)).length,0);
    await ctx.close();}
    await browser.close();browser=await chromium.launch(launchOptions);
    const fresh = await context(browser,{width:390,height:844});
    const direct = await fresh.newPage();
    await direct.goto(origin+'/'+saved.article_path,{waitUntil:'domcontentloaded'});
    await presentation(direct,'mobile-direct-entry');
    await direct.waitForFunction(()=>window.PassportAudioRuntime?.ready,null,{timeout:120000});
    assert.equal((await snapshot(direct)).length,0,'Fresh article starts audio');
    record('Fresh direct entry has no autoplay');
    await direct.locator('a.mp-row').filter({hasText:/^Hits$/}).click();
    const directHits = await playing(direct,'passportHitsAudio');
    const directNode = await direct.locator('#passportHitsAudio').elementHandle();
    const directOrigin = await direct.evaluate(()=>performance.timeOrigin);
    await direct.locator('.pb-nav a[href="/"]').click();
    await direct.waitForFunction(()=>location.pathname==='/');
    const directAfter = await playing(direct,'passportHitsAudio');
    assert(directAfter.time>directHits.time);
    assert(await direct.evaluate(a=>a===document.getElementById('passportHitsAudio'),directNode));
    assert.equal(await direct.evaluate(()=>performance.timeOrigin),directOrigin);
    record('Mobile direct article → Home continuity',{before:directHits,after:directAfter,sameDocument:true,sameTransport:true});
    await fresh.close();
  } finally { await browser.close(); server.close(); fs.writeFileSync('test-results/editorial-browser.json',JSON.stringify(report,null,2)); }
})().catch(error=>{server.close();console.error(error);console.error(JSON.stringify({diagnostics:report.diagnostics}));process.exitCode=1;});
