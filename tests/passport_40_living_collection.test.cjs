const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process');
// Only the new editorial helper is normalized; all transport bytes remain compared.
const preservedPresentationRead=(p,encoding)=>{
 let value=fs.readFileSync(p,encoding);
 if(p==='js/passport-persist-nav.js'){
  const source=value.toString(),addition=",'passport-editorial-layout'";
  assert.equal(source.split(addition).length,2,'exactly one editorial helper registration');
  const normalized=source.replace(addition,'');value=encoding?normalized:Buffer.from(normalized);
 }
 return value;
};
const base='db5322f53ea69c367dff6d3c268a01ba66e1a234';
const old=p=>cp.execFileSync('git',['show',`${base}:${p}`],{encoding:'utf8',maxBuffer:12*1024*1024});
const read=p=>preservedPresentationRead(p,'utf8');
test('Living Collection: all 401 radios, 11 selectors, streams, engines and editorial shell preserved',()=>{
 for(const p of ['data/passport-radio-inventory.json','js/world-radio-player.js','js/passport-bus.js','js/passport-audio-mutex.js','js/passport-audio-continuity.js','js/passport-persist-nav.js','assets/index-DgBCruM8.js','index.html','noticias.html','js/passport-universal-footer.js'])assert.equal(read(p),old(p),p);
 const inv=JSON.parse(read('data/passport-radio-inventory.json'));assert.equal(inv.radioCount,401);assert.equal(inv.programSelectorCount,11);assert.equal(inv.records.filter(r=>r.section===8).length,42);
});
test('Living Collection: whole-card selection delegates byte-for-byte to the existing universal selector',()=>{
 const expression=/button.addEventListener\('click',[\s\S]*?\n        \}\);/;
 assert.equal(read('js/passport-radio-grid.js').match(expression)[0],old('js/passport-radio-grid.js').match(expression)[0]);
 const expression2=/const locate = \(\) => \{[\s\S]*?\n    \};/;
 assert.equal(read('js/passport-radio-grid.js').match(expression2)[0],old('js/passport-radio-grid.js').match(expression2)[0]);
});
test('Living Collection: original category order and non-pilot styling preserved',()=>{
 const before=old('js/passport-radio-grid.js'),after=read('js/passport-radio-grid.js');
 for(const expression of [/const sections = .*;/,/\[1,2,3,11,4,5,6,7,8,9,10\]/,/const tv = [\s\S]*?catalog.append\(tv\);/])assert.equal(after.match(expression)[0],before.match(expression)[0]);
 assert.equal(read('css/passport-radio-grid.css').split('/* Living Collection™')[0],old('css/passport-radio-grid.css'));
});
