(() => {
  const P = window.PassportGlobalSignals = window.PassportGlobalSignals || {};
  P.ENDPOINT = 'https://global-signals-production.up.railway.app/feed';
  P.STORAGE_KEY = 'passport-global-signals-ptbr-v5';
  P.TRANSLATION_KEY = 'passport-global-signals-translations-v5';
  P.TTL = 72 * 60 * 60 * 1000;

  P.decode = (v='') => {
    const t=document.createElement('textarea'); t.innerHTML=String(v);
    return t.value.replace(/<[^>]*>/g,' ').replace(/\]\]>/g,'').replace(/\s+/g,' ').trim();
  };
  P.esc = (v='') => String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  P.fold = (v='') => P.decode(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  P.norm = (v='') => {v=String(v).toLowerCase(); for(const x of ['pt','en','es','de','fr','it','ja','ko']) if(v.startsWith(x)) return x; if(v.startsWith('zh')) return 'zh-CN'; return 'auto';};
  P.foreign = (v='') => /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0400-\u04ff\u0600-\u06ff]/u.test(String(v));
  P.errorText = (v='') => /query length limit exceeded|max allowed query|translated\.net|mymemory warning|too many requests|rate limit|quota exceeded|invalid translation|service unavailable/i.test(String(v));
  P.polishTitle = (v='') => P.decode(v).replace(/^\s*(watch|listen)\s*:\s*/i,'').replace(/\s*:\s*(stream|watch|listen)\s*$/i,'').trim();

  P.rawify = (x,i=0) => ({
    id:P.decode(x.id||`signal-${i}`),
    title:P.decode(x.title),
    summary:P.decode(x.summary||x.description||x.deck||''),
    date:x.date||x.published_at||x.published||'',
    region:P.decode(x.region||'Global'),
    genre:P.decode(x.genre||'Música'),
    language:P.decode(x.language||'')
  });

  P.musicRelevant = (s) => {
    const body=P.fold(`${s.title} ${s.summary}`), genre=P.fold(s.genre);
    const genreMusic=/\b(rock|metal|punk|blues|jazz|soul|r&b|hip hop|hip-hop|rap|indie|alternative|hardcore|pop|mpb|music|musica|k-pop|j-pop|progressive)\b/.test(genre);
    const bodyMusic=/\b(musica|music|song|songs|track|tracks|album|albums|single|singles|ep|lp|band|bands|singer|singers|vocal|vocalist|guitar|guitarrista|drum|drummer|baterista|bass|bassist|baixista|tour|turne|concert|show|shows|festival|festivals|rock|metal|punk|blues|jazz|soul|rap|hip hop|hip-hop|k-pop|j-pop|indie|alternative|hardcore|vinyl|record|records|musician|musicians|musico|musicos|composer|orchestra|live|performance|playlist|remix|dj|banda|bandas|cantor|cantora|vocalista|disco|discos|faixa|faixas|album|albuns|cancao|cancoes)\b/.test(body);
    const noise=/\b(grand theft auto|gta vi|netflix|4k ultra hd|blu ray|blu-ray|movie|movies|film|cinema|television|tv series|video game|videogame|gaming|playstation|xbox|nintendo|harry potter|box office|trailer)\b/.test(body);
    if(noise&&!bodyMusic) return false;
    return genreMusic||bodyMusic;
  };

  P.safePT = (text,original='',source='auto') => {
    const out=P.decode(text); if(!out||P.errorText(out)||P.foreign(out)) return false;
    const src=P.norm(source);
    if(src!=='pt'&&P.decode(original)&&P.fold(out)===P.fold(original)) return false;
    const tokens=P.fold(out).match(/[a-z0-9]+/g)||[];
    if(src==='en'){
      const en=new Set(['the','and','with','from','after','before','into','over','under','new','announces','announce','reveals','reveal','releases','release','says','say','dies','dead','watch','their','this','that','will','for','of','to','in','on','at','by']);
      const pt=new Set(['de','da','do','das','dos','e','com','para','por','em','no','na','nos','nas','que','uma','um','seu','sua','apos','antes','novo','nova']);
      const ec=tokens.filter(t=>en.has(t)).length, pc=tokens.filter(t=>pt.has(t)).length;
      if(ec>=3&&ec>pc+1) return false;
    }
    if(src==='de'){
      const de=new Set(['der','die','das','und','mit','von','fur','auf','ein','eine','ist','sind','neue','neuer','nach']);
      if(tokens.filter(t=>de.has(t)).length>=3) return false;
    }
    return true;
  };

  P.cache = (() => {
    try{
      const c=JSON.parse(localStorage.getItem(P.TRANSLATION_KEY)||'{}')||{}, now=Date.now();
      Object.keys(c).forEach(k=>{if(!c[k]||now-Number(c[k].savedAt||0)>P.TTL) delete c[k]});
      return c;
    }catch{return{}}
  })();
  P.cacheKey = s => `${s.id}::${s.title}`;
  P.saveCache = () => {
    try{
      const entries=Object.entries(P.cache).sort((a,b)=>Number(b[1].savedAt||0)-Number(a[1].savedAt||0)).slice(0,500);
      localStorage.setItem(P.TRANSLATION_KEY,JSON.stringify(Object.fromEntries(entries)));
    }catch{}
  };
  P.remember = items => {try{localStorage.setItem(P.STORAGE_KEY,JSON.stringify({savedAt:Date.now(),items:items.slice(0,240)}))}catch{}};
  P.readStored = () => {try{const x=JSON.parse(localStorage.getItem(P.STORAGE_KEY)||'{}');return Array.isArray(x.items)?x.items.filter(s=>s&&P.safePT(s.title,'','pt')&&P.musicRelevant(s)):[]}catch{return[]}};

  P.chunks = (text,max=340) => {
    let rest=P.decode(text), out=[]; if(!rest) return out;
    while(rest.length>max){
      let cut=Math.max(rest.lastIndexOf('. ',max),rest.lastIndexOf('! ',max),rest.lastIndexOf('? ',max),rest.lastIndexOf('; ',max));
      if(cut<max*.55) cut=rest.lastIndexOf(' ',max);
      if(cut<max*.45) cut=max;
      const punct=['.','!','?',';'].includes(rest[cut])?1:0, part=rest.slice(0,cut+punct).trim();
      if(part) out.push(part); rest=rest.slice(cut+punct).trim();
    }
    if(rest) out.push(rest); return out;
  };

  P.googleChunk = async (text,s) => {
    const c=new AbortController(), t=setTimeout(()=>c.abort(),9000);
    try{
      const sl=P.foreign(text)&&P.norm(s.language)==='pt'?'auto':P.norm(s.language);
      const q=new URLSearchParams({client:'gtx',sl,tl:'pt',dt:'t',q:text});
      const r=await fetch(`https://translate.googleapis.com/translate_a/single?${q}`,{cache:'no-store',credentials:'omit',mode:'cors',signal:c.signal});
      if(!r.ok) throw Error(r.status);
      const d=await r.json(), out=P.decode(Array.isArray(d&&d[0])?d[0].map(x=>Array.isArray(x)?x[0]||'':'').join(''):'');
      if(!out||P.errorText(out)) throw Error('invalid'); return out;
    }finally{clearTimeout(t)}
  };

  P.memoryChunk = async (text,s) => {
    const src=P.norm(s.language); if(src==='auto'||src==='pt'||text.length>380) throw Error('unsupported');
    const c=new AbortController(), t=setTimeout(()=>c.abort(),9000);
    try{
      const q=new URLSearchParams({q:text,langpair:`${src}|pt-BR`});
      const r=await fetch(`https://api.mymemory.translated.net/get?${q}`,{cache:'no-store',credentials:'omit',mode:'cors',signal:c.signal});
      if(!r.ok) throw Error(r.status);
      const d=await r.json(), out=P.decode(d&&d.responseData&&d.responseData.translatedText||'');
      if(!out||P.errorText(out)) throw Error('invalid'); return out;
    }finally{clearTimeout(t)}
  };

  P.tx = async (text,s) => {
    const done=[];
    for(const part of P.chunks(text)){
      let out=''; try{out=await P.googleChunk(part,s)}catch{out=await P.memoryChunk(part,s)}
      done.push(out);
    }
    return P.decode(done.join(' '));
  };

  P.translate = async (s) => {
    const src=P.norm(s.language), k=P.cacheKey(s), cc=P.cache[k];
    if(cc&&P.safePT(cc.title,s.title,src)) return {...s,title:P.polishTitle(cc.title),summary:P.safePT(cc.summary,s.summary,src)?cc.summary:'',language:'PT-BR'};
    let title=s.title, summary=s.summary||'';
    if(src!=='pt'||P.foreign(title)){try{title=await P.tx(title,s)}catch{return null}}
    title=P.polishTitle(title); if(!P.safePT(title,s.title,src)) return null;
    if(summary&&(src!=='pt'||P.foreign(summary))){try{summary=await P.tx(summary,s)}catch{summary=''}}
    if(summary&&!P.safePT(summary,s.summary,src)) summary='';
    P.cache[k]={title,summary:P.decode(summary),savedAt:Date.now()}; P.saveCache();
    return {...s,title,summary:P.decode(summary),language:'PT-BR'};
  };

  P.loadRaw = async () => {
    const r=await fetch(P.ENDPOINT,{cache:'no-store',credentials:'omit',mode:'cors',headers:{Accept:'application/json'}});
    if(!r.ok) throw Error(`Tunnel ${r.status}`);
    const d=await r.json(), seen=new Set(), items=[];
    (Array.isArray(d.items)?d.items:[]).forEach((x,i)=>{
      const s=P.rawify(x,i); if(!s.title||!P.musicRelevant(s)) return;
      const k=P.fold(s.title).replace(/[^a-z0-9]+/g,' ').trim(); if(!k||seen.has(k)) return; seen.add(k); items.push(s);
    });
    items.sort((a,b)=>(new Date(b.date).getTime()||0)-(new Date(a.date).getTime()||0));
    return {items,generatedAt:d.generated_at||d.updated_at||d.date||null};
  };
})();