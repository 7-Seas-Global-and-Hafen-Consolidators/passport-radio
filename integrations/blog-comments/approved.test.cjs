const test=require('node:test');const assert=require('node:assert/strict');const vm=require('node:vm');const fs=require('node:fs');
const code=fs.readFileSync(__dirname+'/Code.gs','utf8');
const article='/editorial/2026/10/07/kurt-cobain-lennon-mccartney-beatles.html';
const other='/blog/w/000001-led-zeppelin.html';
function setup(){
 const rows=[];let reads=0;
 const context={Date,console,PropertiesService:{getScriptProperties:()=>({getProperty:()=> 'private'})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>({getLastRow:()=>rows.length+1,getRange:(r,c,n,cols)=>{assert.equal(cols,6);reads++;return{getValues:()=>rows};}})})},ContentService:{MimeType:{JAVASCRIPT:'js',JSON:'json'},createTextOutput:text=>({setMimeType:mime=>({text,mime})})}};
 vm.createContext(context);vm.runInContext(code,context);
 const add=(id,status='APROVADO',route=article,comment='Texto completo\nsegunda linha')=>rows.push([id,new Date('2026-11-05T12:30:00Z'),'https://passportradio.online'+route,'Apelido',comment,status,'private Gmail']);
 return{rows,add,context,read:(a=article,callback='')=>context.doGet({parameter:{article:a,callback}}),reads:()=>reads};
}
const ids=Array.from({length:6},(_,i)=>'00000000-0000-4000-8000-'+String(i).padStart(12,'0'));
test('only approved rows for the requested article; no private columns or duplicates',()=>{const f=setup();f.add(ids[0]);f.add(ids[1],'PENDENTE');f.add(ids[2],'REJEITADO');f.add(ids[3],'APROVADO',other);f.add(ids[0]);const p=JSON.parse(f.read().text);assert.equal(p.comments.length,1);assert.equal(p.comments[0].comment,'Texto completo\nsegunda linha');assert.equal(p.comments[0].nickname,'Apelido');assert.equal(p.comments[0].submittedAt,'2026-11-05T12:30:00.000Z');assert.doesNotMatch(JSON.stringify(p),/PENDENTE|REJEITADO|private|Gmail|Moderação/);});
test('a moderation change appears on the next read and rejection withdraws it',()=>{const f=setup();f.add(ids[0],'PENDENTE');assert.equal(JSON.parse(f.read().text).comments.length,0);f.rows[0][5]='APROVADO';assert.equal(JSON.parse(f.read().text).comments.length,1);f.rows[0][5]='REJEITADO';assert.equal(JSON.parse(f.read().text).comments.length,0);});
test('invalid routes and callbacks never read the sheet; callback text cannot inject code',()=>{const f=setup();f.add(ids[0]);for(const [a,c]of [['/noticias.html',''],[article,'alert(1)//'],['https://evil.example','']]){assert.equal(JSON.parse(f.read(a,c).text).unavailable,true);}assert.equal(f.reads(),0);});
test('JSONP retains full text and escapes closing script tags and line separators',()=>{const f=setup();const text='</script><img src=x onerror=alert(1)>\u2028'+('x'.repeat(4000));f.add(ids[0],'APROVADO',article,text);const callback='PassportApprovedComments_'+'a'.repeat(32);const r=f.read(article,callback);assert.equal(r.mime,'js');assert.doesNotMatch(r.text,/<\/script>/);const p=JSON.parse(r.text.slice(callback.length+1,-2));assert.equal(p.comments[0].comment,text);});
