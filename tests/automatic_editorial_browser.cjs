/* Hosted Chromium against the real public transport. Only the proposed article
   and integration files are served from this checkout; no news is published. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium} = require(path.join(process.env.EDITORIAL_PLAYWRIGHT, 'node_modules/playwright'));
const saved = JSON.parse(fs.readFileSync('tests/fixtures/automatic-editorial-preservation.json','utf8'));
const origin = 'https://passportradio.online';
const files = new Set(['/'+saved.article_path,'/js/passport-persist-nav.js','/js/passport-automatic-editorial.js','/css/passport-automatic-editorial.css']);
const report = {test:'native automatic editorial', acquisitions:0, generations:0, publications:0, checks:[]};
const record = (name,evidence={}) => { report.checks.push({name,result:'PASS',...evidence}); console.log(JSON.stringify(report.checks.at(-1))); };
async function context(browser, viewport) {
  const ctx = await browser.newContext({viewport});
  await ctx.route('**/*',async route => {
    const url = new URL(route.request().url());
    if (['passportradio.online','www.passportradio.online'].includes(url.hostname) && files.has(url.pathname)) {
      const file = url.pathname.slice(1);
      await route.fulfill({status:200,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync(file)});
    } else await route.continue();
  });
  return ctx;
}
async function snapshot(page) {
  return page.evaluate(() => [...document.querySelectorAll('audio')].filter(a=>!a.paused).map(a=>({id:a.id,src:a.currentSrc,time:a.currentTime,ready:a.readyState,volume:a.volume})));
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
  assert.equal(await page.locator('footer img[src="/images/payments/caixa.png"]').count(),1);
  assert(!footer.includes('Rock sem fronteiras'),'Retired footer slogan');
  await page.locator('.fofonete-dock').waitFor();
  assert.equal(await page.locator('.fofonete-dock').evaluate(node=>getComputedStyle(node).position),'fixed');
  assert.equal(await page.locator('.passport-support-float').evaluate(node=>getComputedStyle(node).display),'none','Duplicate support anchor');
  await page.waitForFunction(() => [...document.querySelectorAll('main img')].every(i=>i.complete && i.naturalWidth>0));
  assert.equal(await page.locator('main img').getAttribute('src'),saved.image);
  const geometry = await page.evaluate(() => ({width:innerWidth,scroll:document.documentElement.scrollWidth,article:document.querySelector('main .article').getBoundingClientRect().width,red:getComputedStyle(document.querySelector('.pb-mast__logo')).color,titleFont:getComputedStyle(document.querySelector('main h1')).fontFamily,bodyFont:getComputedStyle(document.querySelector('#article-text p')).fontFamily}));
  assert(geometry.scroll<=geometry.width+1,'Horizontal overflow');
  assert(geometry.article<=760.5,'Approved reading width');
  assert.equal(geometry.red,'rgb(196, 30, 58)');
  assert(geometry.titleFont.includes('Bodoni Moda'));
  assert(geometry.bodyFont.includes('Source Serif 4'));
  assert.equal(await page.locator('main audio,main video[autoplay],main iframe[src*="autoplay=1"]').count(),0);
  record(label,geometry);
  const cookies = page.getByRole('button',{name:'ACEITAR COOKIES',exact:true});
  if (await cookies.count()) await cookies.click();
  await page.screenshot({path:`test-results/${label}.png`,fullPage:true});
}
(async()=>{
  fs.mkdirSync('test-results',{recursive:true});
  const browser = await chromium.launch({executablePath:process.env.EDITORIAL_CHROME||'/usr/bin/google-chrome',args:['--autoplay-policy=document-user-activation-required']});
  try {
    const ctx = await context(browser,{width:1280,height:900});
    const page = await ctx.newPage();
    await page.goto(origin+'/',{waitUntil:'domcontentloaded'});
    await page.getByRole('link',{name:'Hits',exact:true}).click();
    const hits = await playing(page,'passportHitsAudio');
    const transport = await page.locator('#passportHitsAudio').elementHandle();
    const timeOrigin = await page.evaluate(()=>performance.timeOrigin);
    await page.locator('.pb-nav a[href="/editorial.html"]').click();
    await page.getByRole('link',{name:'A Força Implacável de Badmotorfinger na História do Rock',exact:true}).click();
    await presentation(page,'desktop');
    const next = await playing(page,'passportHitsAudio');
    assert.equal(next.src,hits.src);assert(next.time>hits.time);
    assert(await page.evaluate(a=>a===document.getElementById('passportHitsAudio'),transport),'Transport node replaced');
    assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin,'Document reloaded');
    record('Hits Home → Arquivo → Badmotorfinger',{before:hits,after:next,sameDocument:true,sameTransport:true});
    await page.getByRole('link',{name:'MPB',exact:true}).click();
    const mpb = await playing(page,'passportMPBAudio');
    const mpbTransport = await page.locator('#passportMPBAudio').elementHandle();
    assert(await page.locator('#passportHitsAudio').evaluate(a=>a.paused));
    await page.locator('.pb-nav a[href="/"]').click();
    await page.waitForFunction(()=>location.pathname==='/');
    const mpbAfter = await playing(page,'passportMPBAudio');
    assert(mpbAfter.time>mpb.time);assert.equal(mpbAfter.src,mpb.src);
    assert(await page.evaluate(a=>a===document.getElementById('passportMPBAudio'),mpbTransport));
    assert.equal(await page.evaluate(()=>performance.timeOrigin),timeOrigin);
    record('Explicit Hits → MPB mutex and return Home',{before:mpb,after:mpbAfter,sameDocument:true,sameTransport:true});
    await page.getByRole('button',{name:'Pausar',exact:true}).click();
    assert.equal((await snapshot(page)).length,0);
    await ctx.close();
    const fresh = await context(browser,{width:390,height:844});
    const direct = await fresh.newPage();
    await direct.goto(origin+'/'+saved.article_path,{waitUntil:'domcontentloaded'});
    await presentation(direct,'mobile-direct-entry');
    await direct.waitForFunction(()=>window.PassportAudioRuntime?.ready);
    assert.equal((await snapshot(direct)).length,0,'Fresh article starts audio');
    record('Fresh direct entry has no autoplay');
    await direct.getByRole('link',{name:'Hits',exact:true}).click();
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
  } finally { await browser.close(); fs.writeFileSync('test-results/editorial-browser.json',JSON.stringify(report,null,2)); }
})().catch(error=>{console.error(error);process.exitCode=1;});
