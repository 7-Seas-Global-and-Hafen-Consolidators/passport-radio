/* Run against a preview serving the PR files, not the production main branch.
   PASSPORT_QA_BASE_URL=http://localhost:8765 PASSPORT_CHROMIUM=/path/to/chromium node this-file
   Requires Playwright (or PASSPORT_PLAYWRIGHT_MODULE pointing to its installation). */
const {chromium}=require(process.env.PASSPORT_PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const base=process.env.PASSPORT_QA_BASE_URL;if(!base)throw Error('Set PASSPORT_QA_BASE_URL to the branch preview');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PASSPORT_CHROMIUM?{executablePath:process.env.PASSPORT_CHROMIUM}:{}),args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(new URL('/',base).href,{waitUntil:'domcontentloaded'});await page.waitForSelector('.player-bar');await page.waitForFunction(()=>!!window.PassportPersistNav);
 await page.evaluate(()=>{window.qaPlayer=document.querySelector('.player-bar');window.qaCatalog=document.querySelector('.pb-door');window.qaBay=document.querySelector('#qwen-engine-bay')});
 for(const route of ['/blog.html','/blog/arquivo/letras.html','/blog/e/accept.html','/blog/w/007745-10000maniacs.html','/blog/busca.html']){
  await page.evaluate(r=>window.PassportPersistNav.go(r),route);await page.waitForSelector('#passport-editorial-outlet main');
  const result=await page.evaluate(()=>({main:document.querySelectorAll('main').length,header:document.querySelectorAll('header.pb-mast').length,footer:document.querySelectorAll('footer').length,player:document.querySelectorAll('.player-bar').length,home:document.querySelectorAll('.pb-front,.pb-feed,.pb-recruit,.pb-channels').length,reader:document.querySelectorAll('#pp-nav-page').length,samePlayer:window.qaPlayer===document.querySelector('.player-bar'),sameCatalog:window.qaCatalog===document.querySelector('.pb-door'),sameBay:window.qaBay===document.querySelector('#qwen-engine-bay')}));
  assert.deepEqual(result,{main:1,header:1,footer:1,player:1,home:0,reader:0,samePlayer:true,sameCatalog:true,sameBay:true});
 }
 await page.evaluate(()=>window.PassportPersistNav.home());await page.waitForSelector('.pb-front');assert.equal(await page.evaluate(()=>window.qaPlayer===document.querySelector('.player-bar')),true);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 for(const route of ['/blog/w/007745-10000maniacs.html','/blog/arquivo/','/blog/arquivo/autores.html','/blog/arquivo/paises.html','/blog/arquivo/temas.html','/blog/arquivo/epocas.html','/blog/arquivo/formatos.html','/blog/e/accept.html']){
  await mobile.goto(new URL(route,base).href,{waitUntil:'domcontentloaded'});await mobile.waitForSelector('#passport-editorial-outlet main');await mobile.waitForFunction(()=>getComputedStyle(document.querySelector('.pb-mast__logo')).color==='rgb(196, 30, 58)');
  assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS institutional outlet and direct mobile families; external audio playback excluded');
})().catch(e=>{console.error(e);process.exitCode=1});
