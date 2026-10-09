const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
function node(tag){return {tagName:tag.toUpperCase(),children:[],dataset:{},events:{},hidden:false,textContent:'',value:'',setAttribute(k,v){this[k]=v},append(...v){this.children.push(...v)},addEventListener(k,v){this.events[k]=v},classList:{add(){},contains(){return false}}};}
const entries=Array.from({length:100},(_,i)=>({textContent:i<3?'Águia '+i:'Banda '+i,hidden:false,dataset:{}}));
const cloud={querySelectorAll:()=>entries,parentElement:node('section')};
const main={tools:null,querySelector:()=>null,querySelectorAll:s=>s==='a[href^="/blog/e/"]'?entries:s==='.blog-entity-cloud'?[cloud]:[],prepend(n){this.tools=n}};
const doc={URL:'https://passport.test/blog/arquivo/letras.html?pagina=999',body:node('body'),head:node('head'),createElement:node,querySelector:s=>s==='main'?main:null,querySelectorAll:()=>[],defaultView:{history:{state:null,replaceState(){}}}};
const win={addEventListener(){}};const context={window:win,top:win,document:doc,URL,fetch:async()=>({ok:true,json:async()=>({nodes:[],edges:[]})}),MutationObserver:class{observe(){}}};vm.createContext(context);
vm.runInContext(fs.readFileSync('js/passport-artist-navigation.js','utf8'),context);
setImmediate(()=>{
 try{
  const tools=main.tools;assert(tools);
  const label=tools.children.find(n=>n.tagName==='LABEL'),input=label.children[0];
  const pages=tools.children.find(n=>n['aria-label']==='Paginação do A–Z');
  const [previous,pageLabel,next]=pages.children;
  assert.equal(entries.filter(a=>!a.hidden).length,4);assert.equal(next.disabled,true);assert.equal(pageLabel.textContent,'Página 3 de 3');
  previous.events.click();assert.equal(entries.filter(a=>!a.hidden).length,48);
  input.value='aguia';input.events.input();assert.equal(entries.filter(a=>!a.hidden).length,3);assert.equal(previous.disabled,true);assert.equal(next.disabled,true);
  input.value='inexistente';input.events.input();assert.equal(entries.filter(a=>!a.hidden).length,0);assert.equal(cloud.hidden,true);
  input.value='';input.events.input();assert.equal(entries.filter(a=>!a.hidden).length,48);assert.equal(cloud.hidden,false);
  console.log('PASS: pagination clamping, 48 destinations, accent search, empty results, filter reset');
 }catch(e){console.error(e);process.exitCode=1;}
});
