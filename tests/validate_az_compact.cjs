const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),cp=require('child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/az-compact-pagination-20261010');fs.mkdirSync(out,{recursive:true});
const base=process.env.AZ_BASE_SHA||'e3e2bc49d24e6f224943a7aaa11adcaf9c12860f';
const original=f=>cp.execFileSync('git',['show',base+':'+f],{cwd:root,maxBuffer:32*1024*1024}).toString();
const script=fs.readFileSync(path.join(root,'js/passport-artist-navigation.js'),'utf8'),oldScript=original('js/passport-artist-navigation.js');
function fn(s,name){const begin=s.indexOf('  function '+name+'(');const end=s.indexOf('\n  function ',begin+1);return s.slice(begin,end);}
assert.equal(fn(script,'pictures'),fn(oldScript,'pictures'));assert.equal(fn(script,'cards'),fn(oldScript,'cards'));
assert.equal(fs.readFileSync(path.join(root,'css/passport-az-cards.css'),'utf8'),original('css/passport-az-cards.css'));
for(const f of ['data/blog-artist-media.json','data/blog-artist-names.json','data/blog-az-index.json','data/blog-artist-navigation.json','js/passport-universal-footer.js','js/passport-audio-continuity.js'])assert.equal(fs.readFileSync(path.join(root,f),'utf8'),original(f),f);
const docPath=n=>n===1?'blog/arquivo/letras.html':`blog/arquivo/letras/${n}.html`;
const strip=s=>s.replace(/<nav class="passport-az-static-pages"[^>]*>.*?<\/nav>/s,'').replace(/<section class="passport-az-themes".*?<\/section>/s,'').replaceAll('20261010-compact','20261010-az24');
for(let n=1;n<=110;n++){
 const f=docPath(n),s=fs.readFileSync(path.join(root,f),'utf8'),old=original(f);assert.equal(strip(s),strip(old),f);
 const themes=s.match(/<section class="passport-az-themes".*?<\/section>/s)[0],oldThemes=old.match(/<section class="passport-az-themes".*?<\/section>/s)[0];
 const facts=s=>[...s.matchAll(/href="([^"]+)"[^>]*>.*?<small>(\d+)<\/small>/g)].map(m=>[m[1],m[2]]);assert.deepEqual(facts(themes),facts(oldThemes));
 const p=s.match(/<nav class="passport-az-static-pages"[^>]*>.*?<\/nav>/s)[0];assert(([...p.matchAll(/<a /g)]).length<=9);assert(p.includes(`Página ${n} de 110`));assert(p.includes(`aria-current="page">${n}</a>`));
}
const media=JSON.parse(fs.readFileSync(path.join(root,'data/blog-artist-media.json'))),catalog=JSON.parse(fs.readFileSync(path.join(root,'data/blog-az-index.json')));
const types={'.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost');const f=path.join(root,decodeURIComponent(u.pathname)==='/'?'index.html':decodeURIComponent(u.pathname));if(!f.startsWith(root)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${server.address().port}`,browser=await chromium.launch();const checks=[];
try{for(const javaScriptEnabled of [false,true])for(const width of [1440,390])for(const n of [1,2,55,110]){
 const context=await browser.newContext({javaScriptEnabled,viewport:{width,height:1000}});const page=await context.newPage();
 await page.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin!==origin)return r.abort();if(/\.(mp3|m3u8|aac|ogg)(\?|$)/i.test(u.pathname))return r.abort();return r.continue();});
 await page.goto(origin+'/'+docPath(n),{waitUntil:'domcontentloaded'});
 if(javaScriptEnabled){await page.waitForFunction(()=>document.querySelector('.passport-az-results')?.textContent.includes('destinos')&&document.querySelector('.passport-az-static-pages')?.hidden);await page.waitForFunction(()=>document.querySelector('[data-universal-footer-content]'));}
 await page.locator('.passport-az-themes').scrollIntoViewIfNeeded();await page.locator('.blog-entity-cloud').scrollIntoViewIfNeeded();
 const shots=page.locator('.blog-entity-cloud img');for(let i=0;i<await shots.count();i++)await shots.nth(i).scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.querySelectorAll('.blog-entity-cloud img')].every(i=>i.complete));
 const result=await page.evaluate(()=>{
 const visible=e=>!!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0;
 const pagers=[...document.querySelectorAll('.passport-az-static-pages,.passport-az-pagination')].filter(visible);
 const pager=pagers[0],themes=document.querySelector('.passport-az-themes');
 return {pagers:pagers.length,status:pager?.textContent,current:pager?.querySelector('[aria-current="page"]')?.textContent,numbers:[...pager.querySelectorAll('a')].filter(a=>/^\d+$/.test(a.textContent)).map(a=>a.textContent),overflow:document.documentElement.scrollWidth>innerWidth+1,paths:[...document.querySelectorAll('.blog-entity-cloud>a')].map(a=>new URL(a.href).pathname),photos:[...document.querySelectorAll('.blog-entity-cloud>a:has(img)')].map(a=>({href:new URL(a.href).pathname,src:new URL(a.querySelector('img').src).pathname,credit:a.querySelector('.passport-az-credit')?.textContent,source:a.dataset.photoSource,license:a.dataset.photoLicense,loaded:a.querySelector('img').naturalWidth>0})),themeLabels:[...themes.querySelectorAll('a')].map(a=>({href:new URL(a.href).pathname,label:a.textContent})),footer:document.querySelectorAll('[data-universal-footer-content]').length,duplicateTools:document.querySelectorAll('.passport-artist-nav nav[aria-label="Caminhos do acervo"]').length};});
 assert.equal(result.pagers,1);assert.equal(Number(result.current),n);assert(result.status.includes(`Página ${n} de 110`));assert(result.numbers.length<=7);assert(!result.overflow);assert(result.themeLabels.find(x=>x.href.endsWith('/albunsquemarcaram.html')).label.startsWith('Álbuns que marcaram'));
 if(javaScriptEnabled){assert.equal(result.footer,1);assert.equal(result.duplicateTools,1);assert.deepEqual(result.paths,catalog.artists.slice((n-1)*24,n*24).map(x=>x.href));for(const p of result.photos){const m=media[p.href];assert.equal(p.src,m.image);assert.equal(p.credit,m.credit||undefined);assert.equal(p.source,m.source);assert.equal(p.license,m.license_url);assert(p.loaded,p.src);}const expected=result.paths.filter(x=>media[x]?.image);assert.equal(result.photos.length,expected.length);}
 else{const oldPaths=[...original(docPath(n)).match(/<div class="blog-entity-cloud">.*?<\/div>/s)[0].matchAll(/href="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(result.paths,oldPaths);}
 await page.locator('main').screenshot({path:path.join(out,`page-${n}-${width}-${javaScriptEnabled?'js':'html'}.png`)});
 // Follow a real adjacent link in HTML mode; JS uses existing in-place controls.
 const target=n===110?109:n+1;
 if(javaScriptEnabled){await page.locator('.passport-az-pagination button').filter({hasText:n===110?'Anterior':'Próxima'}).click();await page.waitForFunction(v=>document.querySelector('.passport-az-pagination [aria-current="page"]')?.textContent===String(v),target);}
 else{await page.locator('.passport-az-static-pages a').filter({hasText:new RegExp('^'+(n===110?'Anterior':'Próxima')+'$')}).click();assert(new URL(page.url()).pathname.endsWith('/'+target+'.html'));}
 checks.push({page:n,width,javaScriptEnabled,...result,navigationTo:target,navigation:'PASS'});console.log('PASS',n,width,javaScriptEnabled?'JS':'HTML',result.photos.length,'photos');await context.close();
 }
 fs.writeFileSync(path.join(out,'VALIDATION.json'),JSON.stringify({base,static_documents:110,original_data_records:catalog.artists.length+catalog.themes.length,functions_pictures_cards:'byte-identical',card_styles:'byte-identical',media_and_metadata:'unchanged',checks},null,2));
}catch(e){fs.writeFileSync(path.join(out,'PARTIAL.json'),JSON.stringify(checks,null,2));throw e;}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
