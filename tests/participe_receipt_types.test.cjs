const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
function fixture(type,success=true){
 const result={dataset:{},textContent:''},button={},receipt={hidden:true,focus(){this.focused=true},scrollIntoView(){this.scrolled=true}};
 const form={dataset:{},querySelector:s=>s==='.ba-result'?result:button,reset(){this.resetDone=true}};
 const calls=[];const session={access_token:'fixture-only',user:{id:'fixture'}};
 const account={session,client:{auth:{getUser:async()=>({data:{user:session.user}}),getSession:async()=>({data:{session}})}}};
 const context={console,FormData:class{constructor(){this.fields=new Map([['participation_type',type]])}set(k,v){this.fields.set(k,v)}get(k){return this.fields.get(k)}},CustomEvent:class{},window:{PassportAccount:account,dispatchEvent(){}},document:{readyState:'loading',addEventListener(){},getElementById:id=>id==='participe-receipt'?receipt:null,querySelectorAll:()=>[]},fetch:async(url,options)=>{calls.push(options.body.get('participation_type'));return {ok:success,json:async()=>success?{ok:true,message:'Recebido.'}:{ok:false,message:'Falha real de gravação.'}}}};
 const source=fs.readFileSync('js/passport-blog-submit.js','utf8').replace('  function bind(form, action) {','  window.__testSend = send;\n  function bind(form, action) {');vm.runInNewContext(source,context);
 return {form,receipt,result,calls,send:()=>context.window.__testSend({preventDefault(){}},form,'submit')};
}
for(const type of ['materia','banda','programa'])test(`saved ${type}: visible persistent receipt, focus, original type`,async()=>{const f=fixture(type);await f.send();assert.equal(f.receipt.hidden,false);assert(f.receipt.focused&&f.receipt.scrolled&&f.form.resetDone);assert.deepEqual(f.calls,[type]);assert.equal(f.result.textContent,'');});
test('true server error never shows gratitude',async()=>{const f=fixture('programa',false);await f.send();assert(f.receipt.hidden);assert(!f.form.resetDone);assert.equal(f.result.textContent,'Falha real de gravação.');});
test('concurrent repeated clicks submit only once',async()=>{const f=fixture('banda');await Promise.all([f.send(),f.send()]);assert.equal(f.calls.length,1);});
