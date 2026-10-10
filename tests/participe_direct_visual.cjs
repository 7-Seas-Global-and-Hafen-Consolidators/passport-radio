const {chromium}=require('playwright');const fs=require('fs');const http=require('http');const path=require('path');const assert=require('assert/strict');
(async()=>{const root=process.cwd();const server=http.createServer((req,res)=>{let file=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(!file.startsWith(root)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}const ext=path.extname(file);res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'})[ext]||'application/octet-stream');fs.createReadStream(file).pipe(res)}).listen(8765);
const browser=await chromium.launch();fs.mkdirSync('docs/participe-direct-20261010',{recursive:true});const results=[];
for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){const page=await browser.newPage({viewport:{width,height}});await page.goto('http://localhost:8765/divulgar-bandas.html');await page.waitForTimeout(1200);
assert.equal(await page.locator('form,input,textarea,select').count(),0);
assert.equal(await page.locator('a[href="mailto:passportradio.online@gmail.com"]').count()>0,true);
assert.equal(await page.locator('a[href="https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"]').count()>0,true);
assert.equal(await page.locator('a[href="https://t.me/+FKto2N185cs4OGU0"]').count()>0,true);
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
assert.equal(await page.locator('img[src="/images/participe/mike-marrs.png"]').evaluate(i=>i.complete&&i.naturalWidth>0),true);
await page.locator('#manda').screenshot({path:'docs/participe-direct-20261010/'+name+'.png'});
await page.goto('http://localhost:8765/privado/blog-aberto.html');assert.equal(await page.locator('form,input,script').count(),0);
results.push({name,width,height,formAbsent:true,linksCorrect:true,noOverflow:true,originalImageLoaded:true,panelRetired:true});await page.close();}
fs.writeFileSync('docs/participe-direct-20261010/visual-results.json',JSON.stringify(results,null,2)+'\n');await browser.close();server.close();})().catch(e=>{console.error(e);process.exit(1)});
