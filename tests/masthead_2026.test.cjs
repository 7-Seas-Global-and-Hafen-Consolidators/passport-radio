/* Preservation contracts for the visual-only universal masthead. */
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),cp=require('child_process'),path=require('path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8'),base='d1d2291c950389b3cfe82dc00676cd6da251f879';
test('one local scalable vector, transparent and independent of fonts or remote resources',()=>{
 const svg=read('images/brand/passport-radio-masthead-2026.svg');assert.match(svg,/viewBox="0 0 1413 298"/);assert.match(svg,/<title[^>]*>Passport Radio<\/title>/);assert.match(svg,/#C41E3A/);assert.match(svg,/<pattern[^>]+id="hatch"/);assert.match(svg,/patternTransform="rotate/);assert((svg.match(/<path /g)||[]).length>=12);assert(!/<image|<foreignObject|<script|<text\b|data:|https?:|@font-face/i.test(svg.replace('xmlns="http://www.w3.org/2000/svg"','')));
 for(const ref of svg.matchAll(/href="([^"]+)"/g))assert(ref[1].startsWith('#'));
});
test('the existing shared footer styles remain byte-identical after one masthead import',()=>{
 const before=cp.execFileSync('git',['show',base+':css/passport-universal-footer.css'],{cwd:root,encoding:'utf8'});
 assert.equal(read('css/passport-universal-footer.css'),"@import url('/css/passport-masthead.css?v=20261028');\n"+before);
 const css=read('css/passport-masthead.css');assert.match(css,/passport-header-social/);assert.match(css,/max-width:767px/);assert.match(css,/max-width:1199px/);assert(!/\baudio\s*\{|#passport-player|#qwen-engine-bay/.test(css));
});
test('401 stations, streams, engine, navigation, articles and universal chrome logic unchanged',()=>{
 const inv=JSON.parse(read('data/passport-radio-inventory.json'));assert.equal(inv.radioCount,401);
 const protectedPaths=['data/','js/','assets/','index.html','noticias.html','editorial/','blog/','bandas/','loja.html','anuncie.html','doe.html','.github/','images/social/','images/payments/','images/radio/'];
 cp.execFileSync('git',['diff','--exit-code',base,'--',...protectedPaths],{cwd:root,stdio:'pipe'});
});
