const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('js/passport-store-v6.js','utf8'),before=fs.readFileSync('tests/fixtures/store/v6-before.js','utf8');
const manifest=JSON.parse(fs.readFileSync('data/store_inventory.json'));const products=manifest.chunks.flatMap(u=>JSON.parse(fs.readFileSync(u.slice(1))).products);
const visible=products.filter(p=>p.publish!==false&&String(p.category||'').trim()!=='Vale Presente'&&typeof p.image==='string'&&(p.image.startsWith('/images/')||/^https:\/\//.test(p.image))&&Number.isFinite(Number(p.price))&&p.price>0);
const categories=[...new Set(visible.map(p=>p.category))];
async function fixture(code=source,paper=true,earlySearch){
 const elements={};for(const id of ['pp-store-grid','pp-store-bar-slot','pp-store-pagination','pp-store-page-status','pp-store-search-results','store-q'])elements[id]={innerHTML:'',textContent:'',value:'',hidden:false,listeners:{},addEventListener(n,f){this.listeners[n]=f},focus(){this.focused=true},scrollIntoView(){this.scrolled=true},insertAdjacentHTML(){}};
 const chips=['',...categories].map(cat=>({dataset:{cat},setAttribute(n,v){this[n]=v}}));const bar={addEventListener(n,f){this[n]=f}};let ready;
 const document={readyState:'loading',body:{classList:{contains:()=>paper}},getElementById:id=>elements[id]||null,querySelector:s=>s==='.pp-store-bar'&&elements['pp-store-bar-slot'].innerHTML?bar:null,querySelectorAll:()=>chips,addEventListener(n,f){if(n==='DOMContentLoaded')ready=f}};
 const location={search:'',hash:'',pathname:'/loja.html'};const window={location,addEventListener(){}};
 vm.runInNewContext(code,{document,window,location,URLSearchParams,console,fetch:async u=>({ok:true,json:async()=>JSON.parse(fs.readFileSync(u.slice(1),'utf8'))})});
 if(earlySearch)window.passportStoreView.search(...earlySearch);await ready();
 return{elements,window,location,chips,clickPage(n,disabled=false){elements['pp-store-pagination'].listeners.click({target:{closest:()=>({dataset:{page:String(n)},disabled})}})},clickCategory(cat){bar.click({target:{closest:()=>chips.find(x=>x.dataset.cat===cat)}})}};
}
function cards(html){return [...html.matchAll(/<a class="pp-product"[\s\S]*?<\/a>/g)].map(m=>({id:m[0].match(/data-id="([^"]*)"/)[1],href:m[0].match(/href="([^"]*)"/)[1],image:m[0].match(/<img src="([^"]*)"/)[1],name:m[0].match(/<strong>(.*?)<\/strong>/)[1],price:m[0].match(/<span class="pp-price">(.*?)<\/span>/)[1],payments:m[0].match(/<span class="pp-installments">(.*?)<\/span>/)?.[1]}))}
test('all commercial inputs and original product bytes are unchanged outside the exact footer loader',()=>{
 const baseline=JSON.parse(fs.readFileSync('tests/fixtures/store/commercial-baseline.json'));const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
 for(const[p,h]of Object.entries(baseline.data))assert.equal(sha(fs.readFileSync(p)),h,p);
 const files=fs.readdirSync('loja/p').filter(p=>p.endsWith('.html')).map(p=>'loja/p/'+p).sort();assert.equal(files.length,baseline.product_pages_count);
 const footerLoader=Buffer.from('<script src="/js/passport-universal-footer.js?v=20261010" data-passport-universal-footer defer></script>\n');
 const originalProductBytes=p=>{
  const bytes=fs.readFileSync(p),at=bytes.indexOf(footerLoader);
  if(at===-1)return bytes;
  assert.equal(bytes.indexOf(footerLoader,at+footerLoader.length),-1,p+' duplicate footer loader');
  assert.equal(bytes.subarray(at+footerLoader.length,at+footerLoader.length+7).toString().toLowerCase(),'</body>',p+' footer loader position');
  return Buffer.concat([bytes.subarray(0,at),bytes.subarray(at+footerLoader.length)]);
 };
 assert.equal(sha(files.map(p=>p+':'+sha(originalProductBytes(p))).join('\n')),baseline.product_pages_sha256);
 assert.equal(products.length,933);assert.equal(visible.length,882);
});
test('all 37 pages preserve every original card, destination, price and image in original order',async()=>{
 const original=await fixture(before,false),current=await fixture();const expected=cards(original.elements['pp-store-grid'].innerHTML),actual=[];
 for(let page=1;page<=37;page++){if(page>1)current.clickPage(page);const rows=cards(current.elements['pp-store-grid'].innerHTML);assert.equal(rows.length,page===37?18:24);actual.push(...rows);}
 assert.deepEqual(actual,expected);assert.equal(actual.length,882);
 assert.equal(current.location.pathname,'/loja.html');assert.equal(current.location.search,'');
});
test('previous, next, numeric context and invalid boundaries',async()=>{
 const f=await fixture();f.clickPage(0);assert.match(f.elements['pp-store-page-status'].textContent,/Página 1 de 37/);
 f.clickPage(2);assert.match(f.elements['pp-store-page-status'].textContent,/Página 2 de 37/);f.clickPage(1);
 f.clickPage(18);for(const n of [1,16,17,18,19,20,37])assert.ok(f.elements['pp-store-pagination'].innerHTML.includes(`data-page="${n}"`));
 assert.ok(f.elements['pp-store-pagination'].innerHTML.includes('aria-current="page"'));
 f.clickPage(37);f.clickPage(38);assert.match(f.elements['pp-store-page-status'].textContent,/Página 37 de 37/);f.clickPage(36);assert.match(f.elements['pp-store-page-status'].textContent,/Página 36 de 37/);
 assert.equal(f.elements['pp-store-grid'].focused,true);assert.equal(f.elements['pp-store-grid'].scrolled,true);
});
test('all ten exact category filters reset to page 1 and paginate their own results; Tudo restores 882',async()=>{
 const f=await fixture();for(const cat of categories){f.clickPage(2);f.clickCategory(cat);const expected=visible.filter(p=>p.category===cat);assert.match(f.elements['pp-store-page-status'].textContent,new RegExp(`de ${expected.length} produtos · Página 1 de ${Math.ceil(expected.length/24)}`));assert.equal(cards(f.elements['pp-store-grid'].innerHTML).length,Math.min(24,expected.length));}
 f.clickCategory('');assert.match(f.elements['pp-store-page-status'].textContent,/de 882 produtos · Página 1 de 37/);assert.equal(cards(f.elements['pp-store-grid'].innerHTML).length,24);
});
test('search provider survives early/late load, paginates after filtering and resets pagination',async()=>{
 const rows=visible.filter(p=>p.category==='Camiseta');const render=p=>`<a class="pp-product" data-id="${p.id}"><strong>${p.name}</strong></a>`;
 for(const early of [false,true]){const f=await fixture(source,true,early?[()=>rows,render,{}]:undefined);if(!early)f.window.passportStoreView.search(()=>rows,render,{});assert.match(f.elements['pp-store-page-status'].textContent,/de 652 produtos · Página 1 de 28/);f.clickPage(18);f.window.passportStoreView.search(()=>rows.slice(0,1),render,{});assert.match(f.elements['pp-store-page-status'].textContent,/1 de 1 produtos · Página 1 de 1/);assert.equal(f.elements['pp-store-pagination'].hidden,true);f.window.passportStoreView.search(()=>[],render,{});assert.equal(f.elements['pp-store-page-status'].textContent,'0 produtos');}
});
test('cart, checkout, search matching, CEP and non-store behavior stay under their original owners',async()=>{
 const current=fs.readFileSync('js/passport-store-search.js','utf8'),old=fs.readFileSync('tests/fixtures/store/search-before.js','utf8');
 assert.equal(current.slice(current.indexOf('  const CART_KEY'),current.indexOf('  function paintResults')),old.slice(old.indexOf('  const CART_KEY'),old.indexOf('  function paintResults')));
 assert.equal(current.slice(current.indexOf('    const q = new URLSearchParams(location.search);\n    const pid')),old.slice(old.indexOf('    const q = new URLSearchParams(location.search);\n    const pid')));
 const f=await fixture(source,false);assert.equal(f.window.passportStoreView,undefined);assert.equal(cards(f.elements['pp-store-grid'].innerHTML).length,882);
});
