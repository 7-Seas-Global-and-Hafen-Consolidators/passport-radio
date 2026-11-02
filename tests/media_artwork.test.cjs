const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync('js/passport-media-artwork.js','utf8');
function fixture({metadata=null,supported=true,framed=false}={}){
 const nodes=[],events={},documentEvents={};let assignments=0;
 const document={head:{append:n=>nodes.push(n)},querySelector:selector=>nodes.find(n=>selector===`link[rel="${n.rel}"]`)||null,createElement:()=>({}),addEventListener:(name,fn)=>documentEvents[name]=fn};
 class Metadata{constructor(values={}){this.title=values.title||'';this.artist=values.artist||'';this.album=values.album||'';this.artwork=values.artwork||[];}}
 const session={get metadata(){return metadata},set metadata(v){assignments++;metadata=v},setActionHandler(){throw Error('Artwork must not replace system playback actions')}};
 const window={addEventListener:(name,fn)=>events[name]=fn};window.top=framed?{}:window;
 const ctx={window,document,navigator:supported?{mediaSession:session}:{},MediaMetadata:supported?Metadata:undefined,URL,location:{origin:'https://passportradio.online'}};
 const run=()=>vm.runInNewContext(source,ctx);return {run,nodes,events,documentEvents,session,get assignments(){return assignments}};
}
test('official images declared without touching the page body or playback actions',()=>{const f=fixture();f.run();assert.equal(f.session.metadata.artwork.length,2);assert.deepEqual(Array.from(f.session.metadata.artwork,a=>a.sizes),['192x192','512x512']);assert(f.session.metadata.artwork.every(a=>a.src.startsWith('https://passportradio.online/images/brand/passport-radio-media-')&&a.type==='image/png'));assert.equal(f.nodes.length,2);assert(f.nodes.every(n=>n.href.endsWith('passport-radio-media-192-20261102.png')));});
test('repair only artwork; preserve existing title, artist, album and metadata object',()=>{const m={title:'Track title',artist:'Artist',album:'Album',artwork:[{src:'/images/passport-radio-definitive.jpg'}]},f=fixture({metadata:m});f.run();assert.equal(f.session.metadata,m);assert.equal(m.title,'Track title');assert.equal(m.artist,'Artist');assert.equal(m.album,'Album');assert.equal(f.assignments,0);assert(!JSON.stringify(m.artwork).includes('definitive'));});
test('a later radio change repairs a stale artwork without replacing metadata',()=>{const f=fixture();f.run();const m=f.session.metadata;m.artwork=[{src:'/images/passport-radio-definitive.jpg'}];f.events['passport:audio-state']({detail:{family:'world',playing:true}});assert.equal(f.session.metadata,m);assert.equal(m.artwork.length,2);assert.equal(f.assignments,1);});
test('loading twice is idempotent and unsupported browsers keep working',()=>{const f=fixture();f.run();f.run();assert.equal(f.nodes.length,2);assert.equal(f.assignments,1);const absent=fixture({supported:false});assert.doesNotThrow(absent.run);assert.equal(absent.nodes.length,2);});
test('embedded player documents do not compete for the parent media identity',()=>{const f=fixture({framed:true});f.run();assert.equal(f.nodes.length,0);assert.equal(f.assignments,0);});
