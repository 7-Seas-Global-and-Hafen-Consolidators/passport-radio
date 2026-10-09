const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const classes=new Set(),events={},nodes=[],transportCalls=[];let measured=185,resize;
const root={inert:false,getBoundingClientRect:()=>({height:measured}),querySelector:s=>s==='.player-bar'?approvedPlayer:null};
const approvedPlayer={identity:'original universal facade'},catalog={identity:'complete original catalog'};
const body={classList:{toggle:(k,on)=>on?classes.add(k):classes.delete(k),contains:k=>classes.has(k)},style:{overflow:''},append:n=>nodes.push(n)};
const document={title:'Home',body,head:{append:n=>nodes.push(n)},getElementById:k=>k==='root'?root:null,querySelector:()=>null,addEventListener(){},createElement:t=>({tag:t,style:{},addEventListener:(k,f)=>{if(k==='load')events.load=f},contentDocument:{title:'Blog',addEventListener(){}},contentWindow:{location:{href:'',replace(url){this.href=url}}},focus(){}})};
const location={pathname:'/',href:'https://passport.test/',origin:'https://passport.test',assign(){throw Error('unexpected full document navigation')}};
const window={addEventListener:(k,f)=>events[k]=f,PassportContinuity:{attachControls:()=>transportCalls.push('duplicate controls'),detachControls(){}}};
const context={window,document,location,top:window,URL,history:{pushState(){}},ResizeObserver:class{constructor(cb){resize=cb}observe(){}},fetch:()=>{throw Error('unexpected fetch')}};vm.createContext(context);
vm.runInContext(fs.readFileSync('js/passport-persist-nav.js','utf8'),context);
(async()=>{
 await window.PassportPersistNav.go('/blog.html');const frame=nodes.find(n=>n.id==='pp-nav-page');assert(frame);assert.equal(root.inert,false);assert.equal(frame.style.top,'185px');assert.equal(frame.style.height,'calc(100dvh - 185px)');events.load();assert.deepEqual(transportCalls,[]);
 measured=270;resize();assert.equal(frame.style.top,'270px');
 await window.PassportPersistNav.go('/blog/e/accept.html');assert.equal(frame.contentWindow.location.href,'https://passport.test/blog/e/accept.html');assert.equal(nodes.filter(n=>n.tag==='iframe').length,1);assert.equal(root.querySelector('.player-bar'),approvedPlayer);assert.equal(catalog.identity,'complete original catalog');
 await window.PassportPersistNav.home();assert.equal(frame.hidden,true);assert.equal(root.inert,false);assert.equal(classes.size,0);assert.equal(frame.style.top,'0px');assert.deepEqual(transportCalls,[]);
 console.log('PASS: original facade reachable, measured reader bounds, one reader, Home return, no duplicate continuity controls');
})().catch(e=>{console.error(e);process.exit(1)});
