const {test}=require('node:test'); const assert=require('node:assert/strict'); const fs=require('node:fs');
const html=fs.readFileSync('divulgar-bandas.html','utf8');
test('contatos diretos sem formulário ou autenticação',()=>{
assert.doesNotMatch(html,/<(?:form|input|textarea|select)\b/i);
assert.doesNotMatch(html,/passport-auth|passport-blog-submit|supabase-js|privado\/blog-aberto/);
for(const href of ['mailto:passportradio.online@gmail.com','https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k','https://t.me/+FKto2N185cs4OGU0']) assert.ok(html.includes('href="'+href+'"'));
for(const text of ['MANDA TUDÃO!','QUANDO OS OUTROS FECHAM AS PORTAS, NÓS ABRIMOS.','não garantem envio privado','/images/participe/mike-marrs.png','passport-universal-footer']) assert.ok(html.includes(text),text);
});
test('endpoint aposentado antes de acesso a dados ou autenticação',async()=>{
const src=fs.readFileSync('supabase/functions/blog-aberto/logic.js','utf8');const {dispatch}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
for(const action of ['submit','admin-session','admin-list','admin-approve','admin-reject','admin-attachment','admin-retry','admin-control']){
const ctx=new Proxy({}, {get(){throw Error('acesso indevido ao contexto');}});
assert.equal((await dispatch({action},new Request('https://example.com'),ctx)).status,410);
}
const controls=await dispatch({action:'public-controls'},null,{store:{getControls:async()=>({interactions_closed:false,comments_open:true,submissions_open:true,attachments_open:true})}});
assert.equal(controls.body.submissions,false);assert.equal(controls.body.attachments,false);assert.equal(controls.body.comments,true);
});
test('painel sem sessão, formulário ou dados privados',()=>{
const panel=fs.readFileSync('privado/blog-aberto.html','utf8'); assert.doesNotMatch(panel,/<(?:form|script|input|textarea)\b/i);assert.ok(panel.includes('mailto:passportradio.online@gmail.com'));
});
