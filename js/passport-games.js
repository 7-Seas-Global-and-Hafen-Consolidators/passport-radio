/* One mosaic engine. Game definitions, questions and media are data, never renderer branches. */
const board = document.querySelector('#games-board');
const dialog = document.querySelector('#games-question');
const feedback = document.querySelector('#games-feedback');
const memory = new Map();
let catalog, game, round, trigger;
const prefix = 'passport.games.v1.';
const shuffle = values => {
  const out = [...values];
  for (let i=out.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [out[i],out[j]]=[out[j],out[i]]; }
  return out;
};
function read(key) { try { return localStorage.getItem(prefix+key) ?? memory.get(key); } catch { return memory.get(key); } }
function write(key,value) {
  memory.set(key,value);
  try { localStorage.setItem(prefix+key,value); return true; }
  catch { document.querySelector('#games-storage').textContent='O navegador não permitiu salvar. Seu progresso continua nesta sessão.'; return false; }
}
function fresh(previous=[]) {
  let pool=shuffle(game.questions), chosen=[],media=new Set(),lastFamily;
  // Prefer unused questions and different scenes; each photograph appears once per round.
  pool.sort((a,b)=>Number(previous.includes(a.id))-Number(previous.includes(b.id)));
  while(chosen.length<game.roundSize && pool.length) {
    let index=pool.findIndex(q=>!media.has(q.media)&&q.scene!==lastFamily);
    if(index<0) index=pool.findIndex(q=>!media.has(q.media));
    if(index<0) break;
    const [q]=pool.splice(index,1); chosen.push(q);media.add(q.media);lastFamily=q.scene;
  }
  return {version:game.version,id:crypto.randomUUID(),questions:chosen.map(q=>q.id),options:Object.fromEntries(chosen.map(q=>[q.id,shuffle(q.options)])),won:[]};
}
function valid(value) {
  return value?.version===game.version && typeof value.id==='string' && Array.isArray(value.questions) && value.questions.length===game.roundSize && new Set(value.questions).size===game.roundSize && value.questions.every(id=>game.questions.some(q=>q.id===id)) && Array.isArray(value.won) && new Set(value.won).size===value.won.length && value.won.every(id=>value.questions.includes(id)) && value.questions.every(id=>{const q=game.questions.find(q=>q.id===id),options=value.options?.[id];return Array.isArray(options)&&options.length===q.options.length&&new Set(options).size===options.length&&options.every(o=>q.options.includes(o))});
}
function save() { write(game.id,JSON.stringify(round)); }
function questions() { return round.questions.map(id=>game.questions.find(q=>q.id===id)); }
function render(newId) {
  board.replaceChildren();
  document.querySelector('#games-title').textContent=game.title;
  document.querySelector('#games-deck').textContent=game.deck;
  const complete=round.won.length===round.questions.length;
  document.querySelector('#games-progress').textContent=complete?'MOSAICO COMPLETO':`${round.won.length} DE ${round.questions.length} IMAGENS CONQUISTADAS`;
  document.querySelector('#games-completion').textContent=complete?'Você conquistou todas as imagens desta rodada. A próxima mistura está no botão abaixo.':'';
  questions().forEach((q,index)=>{
    const b=document.createElement('button');b.type='button';b.className='games-cell';b.dataset.question=q.id;
    if(round.won.includes(q.id)) {
      b.classList.add('is-won');b.setAttribute('aria-label',`${q.label}, conquistada`);
      const img=document.createElement('img');const media=catalog.media[q.media];
      img.src=media.src;img.alt=media.alt;img.width=media.width;img.height=media.height;img.loading='lazy';img.decoding='async';img.style.objectFit=media.fit||'contain';img.style.objectPosition=media.position||'center';
      img.addEventListener('error',()=>{document.querySelector('#games-storage').textContent=`Falha ao carregar ${q.label}. Sua conquista permanece salva.`},{once:true});
      const label=document.createElement('span');label.className='games-cell-label';label.textContent=q.label;b.append(img,label);
      b.setAttribute('aria-disabled','true');if(q.id===newId)b.classList.add('is-revealing');
    } else {
      b.setAttribute('aria-label',`Posição ${index+1}: responder pergunta`);
      const n=document.createElement('span');n.className='games-cell-number';n.textContent=String(index+1).padStart(2,'0');
      const hint=document.createElement('span');hint.className='games-cell-hint';hint.textContent='REVELAR';b.append(n,hint);b.addEventListener('click',()=>ask(q,b));
    }
    board.append(b);
  });
}
function ask(q,button) {
  trigger=button;feedback.textContent='';document.querySelector('#games-question-title').textContent=q.prompt;
  const answers=document.querySelector('#games-answers');answers.replaceChildren();
  for(const option of round.options[q.id]) {
    const b=document.createElement('button');b.type='button';b.textContent=option;
    b.addEventListener('click',()=>{
      if(option!==q.answer) {feedback.textContent='Essa não. A célula continua esperando a resposta certa.';return;}
      if(!round.won.includes(q.id))round.won.push(q.id);
      save();dialog.close();render(q.id);
      board.querySelector(`[data-question="${q.id}"]`).focus();
    });answers.append(b);
  }
  dialog.showModal();
}
dialog.addEventListener('close',()=>{if(trigger?.isConnected)trigger.focus()});
document.querySelector('#games-close').addEventListener('click',()=>dialog.close());
function select(id) {
  game=catalog.games.find(g=>g.id===id)||catalog.games[0];
  let stored;try {stored=JSON.parse(read(game.id)||'null');}catch{}
  round=valid(stored)?stored:fresh();save();write('selected',game.id);
  document.querySelectorAll('[data-game]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.game===game.id)));
  render();
}
document.querySelector('#games-new').addEventListener('click',()=>{
  const previous=round.questions;round=fresh(previous);save();render();board.querySelector('button').focus();
});
async function start() {
  const response=await fetch('/data/jogos/catalog.json');if(!response.ok)throw Error('Catálogo indisponível');catalog=await response.json();
  for(const g of catalog.games){const b=document.createElement('button');b.type='button';b.textContent=g.title;b.dataset.game=g.id;b.addEventListener('click',()=>select(g.id));document.querySelector('#games-select').append(b)}
  select(read('selected'));
}
start().catch(()=>{document.querySelector('#games-storage').textContent='Não foi possível carregar os jogos. Recarregue a página para tentar novamente.'});
