const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const cp = require('node:child_process');
(async()=>{
 const base=JSON.parse(cp.execFileSync('git',['show','a8f1dcac3841fc03c26ced5693b3958b1668b427:data/passport-videos.json'],{maxBuffer:8e6}));
 const now=JSON.parse(fs.readFileSync('data/passport-videos.json'));
 assert.deepEqual(now.videos.slice(0,base.videos.length),base.videos);
 assert.deepEqual(now.collections,base.collections);
 assert.equal(now.videos.length,base.videos.length+3);
 const ids=['XLrsurnMjKc','3KW4sPXJh5I','GqUgSWT-5CA'];
 for(const id of ids){assert.equal(now.videos.filter(v=>v.id===id).length,1);assert.equal(now.videos.find(v=>v.id===id).thumbnail,`https://img.youtube.com/vi/${id}/hqdefault.jpg`);}
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--no-sandbox']});
 fs.mkdirSync('reports/videos-three',{recursive:true});const results=[];
 try{
 for(const width of [360,390,1280]){
  const page=await browser.newPage({viewport:{width,height:900}});
  await page.goto('http://127.0.0.1:4173/videos.html');
  await page.waitForFunction(()=>document.querySelectorAll('.videos-card').length===24);
  assert.equal(await page.locator('.videos-media iframe').count(),0);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  const titles=await page.locator('.videos-card h2').allTextContents();
  assert(titles.indexOf('The Mission')<titles.indexOf('BTS'));
  await page.screenshot({path:`reports/videos-three/general-${width}.png`,fullPage:true});
  for(const artist of ['The Mission','BTS']){
   await page.locator('#videos-search').fill(artist);
   const card=page.locator('.videos-card').filter({has:page.locator('img[src*="'+(artist==='BTS'?ids[1]:ids[0])+'"]')});
   assert.equal(await card.count(),1);
   await card.locator('.videos-preview').click();
   try{await card.locator('iframe').waitFor({timeout:25000});results.push({width,artist,embed:'iframe created; playback not independently proved'});}catch(_){results.push({width,artist,embed:await card.locator('.videos-player-status').textContent()});}
  }
  await page.locator('#videos-search').fill('');
  await page.locator('#videos-collection').selectOption('bbc');
  await page.locator('#videos-search').fill('a-ha');
  const aha=page.locator('.videos-card').filter({has:page.locator('img[src*="GqUgSWT-5CA"]')});
  assert.equal(await aha.count(),1);
  await aha.locator('.videos-preview').click();
  assert.match(await aha.locator('.videos-player-status').textContent(),/não permite reprodução incorporada/);
  assert.equal(await aha.locator('iframe').count(),0);
  await page.screenshot({path:`reports/videos-three/bbc-${width}.png`,fullPage:true});
  results.push({width,overflow:false,bbcPlacement:true,ahaEmbedDenied:true,noAutoplay:true});
  await page.close();
 }
 }finally{await browser.close();}
 fs.writeFileSync('reports/videos-three/results.json',JSON.stringify({oldRecords:base.videos.length,newRecords:now.videos.length,oldRecordsUnchanged:true,results},null,2));
 console.log(JSON.stringify(results));
})();
