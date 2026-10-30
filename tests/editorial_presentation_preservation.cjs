// Strip only the explicitly tested editorial helper registration for historical transport comparisons.
const fs=require('node:fs'),assert=require('node:assert/strict');
exports.read=(p,encoding)=>{
 let value=fs.readFileSync(p,encoding);
 if(p==='js/passport-persist-nav.js'){
  const source=value.toString(),addition=",'passport-editorial-layout'";
  assert.equal(source.split(addition).length,2,'exactly one editorial helper registration');
  const normalized=source.replace(addition,'');value=encoding?normalized:Buffer.from(normalized);
 }
 return value;
};
