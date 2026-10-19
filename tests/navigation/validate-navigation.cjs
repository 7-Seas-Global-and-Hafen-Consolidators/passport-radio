/* Focused navigation QA. Requires Playwright in the test environment, not in the site. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {chromium} = require('playwright');
const root = path.resolve(__dirname, '../..');
const article = '/editorial/2026/10/10/brian-may-esclarece-boatos-e-nega-ter-anunciado-o-fim-definitivo-das-turnes-do-queen-82a3ea32cb.html';
const samples = ['/', '/noticias.html', '/agenda.html', '/editorial.html', '/blog.html', '/jogos.html', '/clips-tv.html', '/radio.html', '/loja.html', '/anuncie.html', '/bandas/index.html', '/blog/arquivo/letras.html', '/blog/e/10000maniacs.html', '/loja/p/2752375.html', article];
const types = {html:'text/html', css:'text/css', js:'text/javascript', json:'application/json', png:'image/png', jpg:'image/jpeg', svg:'image/svg+xml'};
(async () => {
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://local').pathname;
    const file = path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type', types[file.split('.').pop()] || 'application/octet-stream');res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const browser = await chromium.launch({headless:true, ...(process.env.PASSPORT_QA_BROWSER ? {executablePath:process.env.PASSPORT_QA_BROWSER} : {}), args:['--no-sandbox']});
  const rows = [];
  const bootstrap = process.env.PASSPORT_QA_BOOTSTRAP === '1';
  try {
    for (const route of samples.filter(route=>(!process.env.PASSPORT_QA_ROUTE||route===process.env.PASSPORT_QA_ROUTE)&&(!bootstrap||['/','/agenda.html','/blog/e/10000maniacs.html','/loja/p/2752375.html'].includes(route)))) {
      console.log('Checking',route);
      const page = await browser.newPage({viewport:{width:1440,height:1000}});
      // Isolate this UI test: no commercial helpers, remote requests or media playback.
      page.on('pageerror',e=>console.error(route,e.message));
      const allow = new Set(['/assets/index-DgBCruM8.js','/js/passport-universal-footer.js','/js/passport-automatic-editorial.js','/js/passport-radio-grid.js','/js/passport-audio-continuity.js','/js/passport-persist-nav.js']);
      if(bootstrap) allow.add('/js/passport-games-navigation.js');
      await page.route('**/*', r => {
        const u = new URL(r.request().url());
        if (u.origin !== origin || r.request().resourceType() === 'media') return r.abort();
        if (r.request().resourceType() === 'script' && !allow.has(u.pathname)) return r.abort();
        return r.continue();
      });
      await page.goto(origin + route, {waitUntil:'domcontentloaded'});
      await page.waitForSelector('header');
      if (route === '/' || route === article) await page.waitForSelector('.pb-nav');
      await page.waitForTimeout(200);
      await page.evaluate(() => {
        window.__navigationBefore = {
          nodes:[...document.querySelectorAll('audio,video,iframe,#passport-player,[data-radio-id]')],
          attrs:[...document.querySelectorAll('audio,video,iframe,#passport-player,[data-radio-id]')].map(n=>n.outerHTML),
          main:document.querySelector('main'),
          text:document.querySelector('main')?.innerHTML,
          header:document.querySelector('header'),
          height:document.querySelector('header').getBoundingClientRect().height,
          anchor:document.querySelector('nav[aria-label="Seções"] a[href="/blog.html"]')
        };
      });
      if(!bootstrap) await page.addScriptTag({path:path.join(root, 'js/passport-games-navigation.js')});
      await page.waitForSelector('nav[data-passport-navigation]');
      await page.waitForFunction(() => [...document.styleSheets].some(s=>s.href?.includes('/css/passport-navigation.css')));
      const check = await page.evaluate(() => {
        const nav = document.querySelector('nav[data-passport-navigation]'), expected = PassportNavigation.destinations;
        const links = [...nav.querySelectorAll('a')];
        const before = window.__navigationBefore;
        return {
          route:location.pathname,
          expected:expected.length,
          destinations:expected.map(([href,label])=>({href,label,count:links.filter(a=>a.getAttribute('href')===href&&a.textContent===label).length})),
          active:links.filter(a=>a.getAttribute('aria-current')==='page').map(a=>a.getAttribute('href')),
          originalAnchorPreserved:!before.anchor||before.anchor.isConnected&&links.includes(before.anchor),
          mediaPreserved:before.nodes.every((n,i)=>n.isConnected&&n.outerHTML===before.attrs[i]),
          mainPreserved:before.main===document.querySelector('main')&&before.text===document.querySelector('main')?.innerHTML,
          mastheadPreserved:before.header===document.querySelector('header')&&before.height===document.querySelector('header').getBoundingClientRect().height,
          autoplay:[...document.querySelectorAll('audio,video')].some(n=>n.autoplay),
          bootstrapPresent:[...document.scripts].some(s=>s.src.includes('/js/passport-games-navigation.js'))
        };
      });
      assert.equal(check.expected,17);check.destinations.forEach(d=>assert.equal(d.count,1,route+' '+d.label));
      assert.equal(check.active.length,1,route+' current section');
      for(const name of ['originalAnchorPreserved','mediaPreserved','mainPreserved','mastheadPreserved','bootstrapPresent']) assert(check[name],route+' '+name);
      assert.equal(check.autoplay,false);
      for(const width of [1440,768,390]) {
        await page.setViewportSize({width,height:1000});
        const layout=await page.evaluate(()=>{
          const nav=document.querySelector('nav[data-passport-navigation]'), box=nav.getBoundingClientRect();
          const links=[...nav.querySelectorAll('a')];
          return {width:innerWidth,height:box.height,allVisible:links.every(a=>{const r=a.getBoundingClientRect(),s=getComputedStyle(a);return r.width>0&&r.height>0&&r.left>=-1&&r.right<=innerWidth+1&&r.top>=box.top-1&&r.bottom<=box.bottom+1&&s.visibility!=='hidden'&&s.display!=='none'}),navOverflow:nav.scrollWidth>nav.clientWidth+1};
        });
        assert(layout.allVisible,route+' links clipped at '+width);assert(!layout.navOverflow,route+' menu overflow at '+width);
        rows.push({route,...layout,active:check.active[0],mediaPreserved:check.mediaPreserved,mainPreserved:check.mainPreserved,mastheadPreserved:check.mastheadPreserved});
      }
      // Repeat mounting and an editorial event: no duplicate links/observers or replaced anchors.
      await page.evaluate(()=>{PassportNavigation.mount();window.dispatchEvent(new Event('passport:editorial-rendered'));});
      await page.waitForFunction(()=>{const links=[...document.querySelector('nav[data-passport-navigation]').querySelectorAll('a')];return PassportNavigation.destinations.every(([href])=>links.filter(a=>a.getAttribute('href')===href).length===1);});
      const repeated = await page.evaluate(()=>{const links=[...document.querySelector('nav[data-passport-navigation]').querySelectorAll('a')];const expected=PassportNavigation.destinations;return {counts:expected.map(([href])=>links.filter(a=>a.getAttribute('href')===href).length),total:links.length,extra:links.filter(a=>!expected.some(([href])=>a.getAttribute('href')===href)).length};});
      repeated.counts.forEach(count=>assert.equal(count,1));assert.equal(repeated.total,17+repeated.extra);
      await page.close();
    }
    const files = new Set(execFileSync('git',['ls-tree','-r','--name-only','HEAD'],{cwd:root,encoding:'utf8'}).split('\n'));
    const nav = fs.readFileSync(path.join(root,'js/passport-games-navigation.js'),'utf8');
    const destinations = [...nav.slice(nav.indexOf('const destinations ='),nav.indexOf('const excluded')).matchAll(/\['(\/[^']*)', '[^']+'\]/g)].map(m=>m[1]);
    assert.equal(destinations.length,17);
    for(const href of destinations) assert(files.has(href.split('#')[0]==='/'?'index.html':href.split('#')[0].slice(1)),href+' missing file');
    assert(fs.readFileSync(path.join(root,'js/passport-radio-grid.js'),'utf8').includes("catalog.id = 'passport-radio-catalog'"));
    fs.writeFileSync(path.join(root,'docs/navigation-unified-20261019/validation.json'),JSON.stringify({scope:'Local navigation only; remote/media/commercial scripts blocked. Not a playback or Netlify test.',base:'66c51d4ce62776667964978023c4b709283f9bfd',bootstrap,passed:true,layouts:rows.length,samples:rows},null,2)+'\n');
    console.log(JSON.stringify({passed:true,pages:rows.length/3,bootstrap,layouts:rows.length,destinations:17,linksExist:true,sourceContentAndMediaNodesPreserved:true}));
  } finally {await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
