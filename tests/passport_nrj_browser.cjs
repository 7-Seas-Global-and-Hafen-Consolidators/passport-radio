const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
const control=require('../docs/nrj-catalog-20261012/catalog-control.json');
const out='reports/nrj-191';fs.mkdirSync(out,{recursive:true});
const report={structuralCatalog:{previous:160,added:191,total:401,programSelectors:11},checks:[],layouts:[],streamProbes:[],playback:[]};
async function probe(row){const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);try{const response=await fetch(row.stream,{signal:abort.signal,headers:{Range:'bytes=0-511','User-Agent':'PassportRadio-CatalogValidation/1.0'}});const type=response.headers.get('content-type')||'';const reader=response.body?.getReader();let bytes=0;while(reader&&bytes<512){const next=await reader.read();if(next.done)break;bytes+=next.value.length;}if(reader)await reader.cancel();return{sourceId:row.source_id,id:row.passport_id,status:response.status,type,bytes,ok:response.ok&&bytes>0&&!/text\/html|application\/json/.test(type)};}catch(error){return{sourceId:row.source_id,id:row.passport_id,ok:false,error:error.name+': '+error.message};}finally{clearTimeout(timer);}}
(async()=>{
 let cursor=0;await Promise.all(Array.from({length:8},async()=>{while(cursor<control.channels.length){const row=control.channels[cursor++];report.streamProbes.push(await probe(row));}}));
 report.streamProbes.sort((a,b)=>Number(a.sourceId)-Number(b.sourceId));
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--autoplay-policy=user-gesture-required']});
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});const early=[];
 page.on('request',request=>{if(/nrjaudio\.fm/.test(request.url()))early.push(request.url());});
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.PassportAudioRuntime?.ready,null,{timeout:60000});
 const catalog=page.locator('#passport-radio-catalog');await catalog.waitFor();
 assert.equal(await catalog.locator('[data-radio-id]').count(),412);assert.equal(await catalog.locator('h2').textContent(),'NOSSAS RÁDIOS');
 assert.equal(await catalog.locator('.passport-radio-count').textContent(),'401 rádios. Todos os estilos. Escolha sua frequência.');
 assert.equal(early.length,0,'no NRJ stream connections on load');assert(await page.locator('audio,video').evaluateAll(es=>es.every(a=>a.paused)));
 assert.equal(await page.locator('#passport-player').count(),1);const audioCount=await page.locator('audio').count();
 report.checks.push('401 radios + 11 existing selectors; zero autoplay; zero early NRJ connections; one universal player');
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  const layout=await catalog.evaluate(el=>({width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth+1,columns:getComputedStyle(el.querySelector('.passport-radio-grid')).gridTemplateColumns.split(' ').length,hidden:[...el.querySelectorAll('[data-radio-id]')].filter(b=>!b.getClientRects().length).length,clipped:[...el.querySelectorAll('[data-radio-id]')].filter(b=>b.scrollHeight>b.clientHeight+1||b.scrollWidth>b.clientWidth+1).map(b=>b.textContent),font:getComputedStyle(el.querySelector('.passport-radio-card')).fontSize,heights:[...el.querySelectorAll('[data-radio-id]')].map(b=>b.getBoundingClientRect().height)}));
  assert(!layout.overflow);assert.equal(layout.hidden,0);assert.equal(layout.clipped.length,0);assert.equal(layout.columns,width<360?2:width<=600?3:width<=800?4:width<=1024?7:8);report.layouts.push(layout);
  if([390,1280].includes(width))await catalog.screenshot({path:`${out}/catalog-${width}.png`});
 }
 const search=page.getByRole('searchbox',{name:'Localizar rádio sem ocultar canais'});await search.fill('Select');assert.equal(await catalog.locator('[data-radio-id]').count(),412);assert(await catalog.locator('[data-radio-id]').evaluateAll(es=>es.every(e=>e.getClientRects().length)));await search.fill('');report.checks.push('search highlights only; all categories/cards remain open');
 await page.setViewportSize({width:1280,height:900});
 const samples=['1772','4','68','60','139','1156'];
 for(const identity of samples){const row=control.channels.find(r=>r.source_id===identity);try{
  await page.locator(`[data-radio-id="${row.passport_id}"]`).click();
  await page.waitForFunction(()=>{const a=document.querySelector('#world-audio');return a&&!a.paused&&a.currentTime>1;},null,{timeout:20000});
  assert.equal(await page.locator('#world-audio').getAttribute('src'),row.stream);assert.equal(await page.locator('audio').count(),audioCount);assert.equal(await page.locator('audio').evaluateAll(es=>es.filter(a=>!a.paused).length),1);
  assert.equal(await page.locator(`[data-radio-id="${row.passport_id}"]`).getAttribute('aria-pressed'),'true');report.playback.push({sourceId:identity,name:row.passport_name,ok:true});
 }catch(error){report.playback.push({sourceId:identity,name:row.passport_name,ok:false,error:error.message});await page.evaluate(()=>window.PassportContinuity?.pause());}}
 const played=report.playback.filter(r=>r.ok);if(played.length){const row=control.channels.find(r=>r.source_id===played.at(-1).sourceId);await page.locator(`[data-radio-id="${row.passport_id}"]`).click();await page.waitForFunction(()=>{const a=document.querySelector('#world-audio');return a&&!a.paused&&a.currentTime>1;},null,{timeout:20000});
  const time=await page.locator('#world-audio').evaluate(a=>{a.dataset.nrjRegression='retained';return a.currentTime;});
  await page.locator('.pb-nav').getByRole('link',{name:/^Arquivo$/i}).click();await page.waitForURL('**/editorial.html');
  assert(await page.locator('#world-audio').evaluate((a,t)=>a.dataset.nrjRegression==='retained'&&!a.paused&&a.currentTime>=t,time));
  await page.locator('.pb-nav').getByRole('link',{name:/^Home$/i}).click();await page.waitForURL('http://127.0.0.1:4173/');assert.equal(await catalog.locator('[data-radio-id]').count(),412);
  report.checks.push('real stream retains same audio/time through Arquivo and back; no second active audio');
 }else{report.checks.push('continuity live check BLOCKED: no sampled stream played');}
 await page.evaluate(()=>window.PassportContinuity?.pause());
 if(report.streamProbes.some(r=>!r.ok)||report.playback.some(r=>!r.ok))throw Error('External stream failures recorded individually; see results.json');
 }finally{await browser.close();}
 fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify({checks:report.checks,streams:report.streamProbes.filter(x=>x.ok).length,playback:report.playback}));
})().catch(error=>{report.error=error.message;fs.writeFileSync(out+'/results.json',JSON.stringify(report,null,2));console.error(error.message);process.exitCode=1;});
