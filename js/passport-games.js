/* DESAFIOS PASSPORT. One engine, declarative games, isolated game storage.
   Audio is owned by the existing site infrastructure and is never accessed here. */
const $=selector=>document.querySelector(selector);
const memory=new Map(),cache=new Map();
const prefix='passport.games.desafios.v1.',legacyPrefix='passport.games.v1.';
let catalog,legacy,active,state,round,trigger,page=1,openToken=0;
const PAGE_SIZE=9;
const families=['Todos','Conhecimento','Visual','Memória','Perfil','Mosaicos','Em preparação'];
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const el=(tag,text,className)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(className)e.className=className;return e;};
const button=(text,fn,className='games-action')=>{const b=el('button',text,className);b.type='button';b.addEventListener('click',fn);return b;};
function read(key,p=prefix){try{return localStorage.getItem(p+key)??memory.get(p+key);}catch{return memory.get(p+key);}}
function write(key,value,p=prefix){memory.set(p+key,value);try{localStorage.setItem(p+key,value);}catch{$('#games-storage').textContent='Seu progresso está guardado nesta sessão; o navegador não permitiu salvá-lo.';}}
function parse(key,p=prefix){try{return JSON.parse(read(key,p)||'null');}catch{return null;}}
async function json(url){if(!cache.has(url))cache.set(url,fetch(url).then(async r=>{if(!r.ok)throw Error('Dados indisponíveis');return r.json();}).catch(e=>{cache.delete(url);throw e;}));return cache.get(url);}
const shuffle=values=>{const out=[...values];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
function route(id){history.replaceState(null,'',location.pathname+(id?'#'+id:''));}
function focusTitle(){const h=$('#challenge-title');h.focus();h.scrollIntoView({block:'start'});}
function image(data,parent){if(!data?.src)return;const img=el('img');img.src=data.src;img.alt=data.alt||'Imagem do resultado';img.className='challenge-image';img.decoding='async';img.addEventListener('error',()=>{$('#games-storage').textContent='A imagem desta pergunta não carregou. Sua rodada permanece salva.';},{once:true});parent.append(img);}
function list(){
 const query=normalize($('#challenge-search').value),family=$('#challenge-family').value,availability=$('#challenge-availability').value;
 const games=catalog.filter(g=>(family==='Todos'||g.family===family)&&(availability==='todos'||g.available===(availability==='prontos'))&&normalize(g.title+' '+g.description+' '+g.family).includes(query));
 const pages=Math.max(1,Math.ceil(games.length/PAGE_SIZE));page=Math.min(page,pages);$('#challenge-count').textContent=games.length+' desafios encontrados';const target=$('#challenge-cards');target.replaceChildren();
 for(const g of games.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE)){
  const card=el('article',undefined,'challenge-card'),type=el('p',g.family,'challenge-kicker'),h=el('h2',g.title),p=el('p',g.description),open=button(g.available?'JOGAR':'EM PREPARAÇÃO',()=>openGame(g.id));open.dataset.game=g.id;open.disabled=!g.available;open.setAttribute('aria-label',(g.available?'Jogar ':'Em preparação: ')+g.title);card.append(type,h,p,open);target.append(card);
 }
 if(!games.length)target.append(el('p','Nenhum desafio encontrado. Experimente outro nome ou família.'));
 const pagination=$('#challenge-pagination');pagination.replaceChildren();const previous=button('ANTERIORES',()=>{page--;list();$('#challenge-cards').scrollIntoView({block:'start'});});previous.disabled=page===1;const next=button('PRÓXIMOS',()=>{page++;list();$('#challenge-cards').scrollIntoView({block:'start'});});next.disabled=page===pages;pagination.append(previous,el('span',`Página ${page} de ${pages}`),next);
}
function portal(){openToken++;active=null;$('#challenge-play').hidden=true;$('#challenge-portal').hidden=false;route(null);list();$('#challenge-search').focus();}
function validProgress(s,g){return s?.version===g.versionHash&&Array.isArray(s.answers)&&s.answers.length<=g.questions.length&&s.answers.every((id,i)=>g.questions[i].options.some(o=>o.id===id))&&Number.isInteger(s.index)&&s.index>=0&&s.index<=s.answers.length&&s.index<=g.questions.length;}
function save(){write(active.id,JSON.stringify(state));}
// Pure result calculation: facts/weights live in JSON; ties are visible, never resolved randomly.
export function evaluate(g,answers){
 if(g.mode==='profile'){const scores=Object.fromEntries(g.results.map(r=>[r.id,0]));answers.forEach((id,i)=>{const o=g.questions[i]?.options.find(o=>o.id===id);for(const[k,v]of Object.entries(o?.weights||{}))if(k in scores)scores[k]+=v;});const max=Math.max(...Object.values(scores));return{scores,results:g.results.filter(r=>scores[r.id]===max)};}
 const score=answers.reduce((n,id,i)=>n+Number(!!g.questions[i]?.options.find(o=>o.id===id)?.correct),0);return{score,results:g.results.filter(r=>score>=r.min&&score<=r.max)};
}
async function openGame(id){
 const meta=catalog.find(g=>g.id===id);if(!meta?.available)return;const token=++openToken;$('#games-storage').textContent='';
 try{
  const game=meta.type==='mosaico'?(await json('/data/jogos/catalog.json')).games.find(g=>g.id===id):await json(meta.data);
  if(token!==openToken)return;active={...game,type:meta.type,mode:game.mode||'mosaic'};$('#challenge-portal').hidden=true;$('#challenge-play').hidden=false;route(id);
  if(active.mode==='mosaic'){legacy=await json('/data/jogos/catalog.json');if(token!==openToken)return;const stored=parse(id,legacyPrefix);round=validMosaic(stored)?stored:freshMosaic();write(id,JSON.stringify(round),legacyPrefix);write('selected',id,legacyPrefix);renderMosaic();}
  else{const stored=parse(id);state=validProgress(stored,active)?stored:{version:active.versionHash,index:0,answers:[]};save();renderQuestion();}
  focusTitle();
 }catch{$('#games-storage').textContent='Não foi possível abrir este desafio. Tente novamente.';}
}
function heading(title,progress){$('#challenge-title').textContent=title;$('#challenge-progress').textContent=progress;$('#challenge-content').replaceChildren();}
function renderQuestion(){
 if(state.index===active.questions.length){renderResult();return;}
 const q=active.questions[state.index],selected=state.answers[state.index],answered=selected!==undefined;
 heading(active.title,`Pergunta ${state.index+1} de ${active.questions.length}`);const target=$('#challenge-content');target.dataset.mechanic=q.type;
 target.append(el('h3',q.prompt,'challenge-prompt'));if(q.clue)target.append(el('blockquote',q.clue,'challenge-clue'));image(q.image,target);
 const choices=el('div',undefined,'challenge-options');choices.setAttribute('role','group');choices.setAttribute('aria-label','Alternativas');
 for(const option of q.options){const b=button(option.label,()=>{
  if(state.answers[state.index]!==undefined)return;state.answers.push(option.id);save();renderQuestion();$('#challenge-feedback').focus();
 },'challenge-option');b.dataset.option=option.id;b.disabled=answered;if(selected===option.id){b.classList.add('is-selected');b.append(el('span',' — sua escolha','choice-label'));}choices.append(b);}target.append(choices);
 if(answered){const o=q.options.find(o=>o.id===selected),correct=q.options.filter(o=>o.correct).map(o=>o.label).join(', '),feedback=el('p',active.mode==='profile'?'Escolha registrada.':o.correct?'Resposta certa!':'Não foi desta vez. Resposta: '+correct,'challenge-feedback');feedback.id='challenge-feedback';feedback.setAttribute('role','status');feedback.tabIndex=-1;target.append(feedback);if(q.explanation)target.append(el('p',q.explanation,'challenge-explanation'));
  target.append(button(state.index===active.questions.length-1?'VER RESULTADO':'PRÓXIMA PERGUNTA',()=>{state.index++;save();renderQuestion();focusTitle();}));}
}
function renderResult(){
 const outcome=evaluate(active,state.answers);heading(active.title,'Rodada concluída');const target=$('#challenge-content');target.dataset.mechanic='resultado';
 target.append(el('h3',active.mode==='profile'?(outcome.results.length>1?'Seus perfis':'Seu perfil'):`Você acertou ${outcome.score} de ${active.questions.length}.`,'challenge-prompt'));
 for(const r of outcome.results){const section=el('section',undefined,'challenge-result');section.append(el('h4',r.title),el('p',r.description));image(r.image,section);target.append(section);}
 if(active.mode==='profile'&&outcome.results.length>1)target.append(el('p','Suas escolhas chegaram à mesma pontuação em mais de um perfil.'));
 target.append(button('ESCOLHER OUTRO DESAFIO',portal));
}
function freshMosaic(previous=[]){
 let pool=shuffle(active.questions),chosen=[],media=new Set(),lastFamily;pool.sort((a,b)=>Number(previous.includes(a.id))-Number(previous.includes(b.id)));
 while(chosen.length<active.roundSize&&pool.length){let i=pool.findIndex(q=>!media.has(q.media)&&q.scene!==lastFamily);if(i<0)i=pool.findIndex(q=>!media.has(q.media));if(i<0)break;const[q]=pool.splice(i,1);chosen.push(q);media.add(q.media);lastFamily=q.scene;}
 return{version:active.version,id:crypto.randomUUID(),questions:chosen.map(q=>q.id),options:Object.fromEntries(chosen.map(q=>[q.id,shuffle(q.options)])),won:[]};
}
function validMosaic(s){return s?.version===active.version&&typeof s.id==='string'&&Array.isArray(s.questions)&&s.questions.length===active.roundSize&&new Set(s.questions).size===active.roundSize&&s.questions.every(id=>active.questions.some(q=>q.id===id))&&Array.isArray(s.won)&&new Set(s.won).size===s.won.length&&s.won.every(id=>s.questions.includes(id))&&s.questions.every(id=>{const q=active.questions.find(q=>q.id===id),opts=s.options?.[id];return Array.isArray(opts)&&opts.length===q.options.length&&new Set(opts).size===opts.length&&opts.every(o=>q.options.includes(o));});}
function renderMosaic(newId){
 const complete=round.won.length===round.questions.length;heading(active.title,complete?'MOSAICO COMPLETO':`${round.won.length} de ${round.questions.length} imagens conquistadas`);const target=$('#challenge-content');target.dataset.mechanic='mosaico';target.append(el('p',active.deck));const board=el('div',undefined,'games-board');board.id='games-board';board.tabIndex=-1;board.setAttribute('aria-label','Mosaico musical');
 round.questions.forEach((id,index)=>{const q=active.questions.find(q=>q.id===id),b=button('',()=>askMosaic(q,b),'games-cell');b.dataset.question=q.id;if(round.won.includes(id)){b.classList.add('is-won');b.disabled=true;b.setAttribute('aria-label',q.label+', conquistada');const media=legacy.media[q.media],img=el('img');img.src=media.src;img.alt=media.alt;img.width=media.width;img.height=media.height;img.loading='lazy';img.style.objectFit=media.fit||'contain';img.style.objectPosition=media.position||'center';b.append(img,el('span',q.label,'games-cell-label'));if(q.id===newId)b.classList.add('is-revealing');}else{b.setAttribute('aria-label',`Posição ${index+1}: responder pergunta`);b.append(el('span',String(index+1).padStart(2,'0'),'games-cell-number'),el('span','REVELAR','games-cell-hint'));}board.append(b);});target.append(board);if(complete)target.append(el('p','Mosaico completo! As imagens desta rodada são suas.'));
}
function askMosaic(q,b){trigger=b;$('#games-feedback').textContent='';$('#games-question-title').textContent=q.prompt;const answers=$('#games-answers');answers.replaceChildren();for(const option of round.options[q.id])answers.append(button(option,()=>{if(option!==q.answer){$('#games-feedback').textContent='Essa não. A posição continua esperando a resposta certa.';return;}if(!round.won.includes(q.id))round.won.push(q.id);write(active.id,JSON.stringify(round),legacyPrefix);$('#games-question').close();renderMosaic(q.id);$('#games-board').focus();},'challenge-option'));$('#games-question').showModal();}
function restart(){if(!active)return;if(active.mode==='mosaic'){round=freshMosaic(round.questions);write(active.id,JSON.stringify(round),legacyPrefix);renderMosaic();}else{state={version:active.versionHash,index:0,answers:[]};save();renderQuestion();}focusTitle();}
async function start(){
 const[newCatalog,old]=await Promise.all([json('/data/jogos/desafios-catalog.json'),json('/data/jogos/catalog.json')]);catalog=[...newCatalog.games,...old.games.map(g=>({id:g.id,title:g.title,description:g.deck,family:'Mosaicos',type:'mosaico',available:true}))];
 for(const f of families){const option=el('option',f);option.value=f;$('#challenge-family').append(option);}
 for(const selector of ['#challenge-search','#challenge-family','#challenge-availability'])$(selector).addEventListener(selector==='#challenge-search'?'input':'change',()=>{page=1;list();});
 $('#challenge-back').addEventListener('click',portal);$('#games-new').addEventListener('click',restart);$('#games-close').addEventListener('click',()=>$('#games-question').close());$('#games-question').addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus();});
 list();const id=location.hash.slice(1);if(catalog.some(g=>g.id===id&&g.available))openGame(id);
}
start().catch(()=>{$('#games-storage').textContent='Não foi possível carregar os desafios. Recarregue a página para tentar novamente.';});
