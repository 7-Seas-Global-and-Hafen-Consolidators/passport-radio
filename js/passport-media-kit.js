(() => {
  'use strict';
  const config = Object.freeze({endpoint:'https://kmrnnudmujezriomimwn.supabase.co/functions/v1/passport-media-kit', publicKey:'sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y', refreshMs:60000, timeZone:'America/Sao_Paulo'});
  const labels = {desktop:'Desktop',mobile:'Mobile',tablet:'Tablet',direct:'Direto',search:'Busca',social:'Redes sociais',internal:'Dentro da Passport',referral:'Outros sites'};
  const dayAt = (date) => new Intl.DateTimeFormat('en-CA',{timeZone:config.timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
  function normalize(data, now = new Date()) {
    if (!data || !Array.isArray(data.days) || !data.startedAt || !Number.isFinite(Date.parse(data.startedAt))) throw new Error('Invalid report');
    const start = dayAt(new Date(data.startedAt)), today = dayAt(now);
    const values = new Map();
    for (const row of data.days) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(row.date) && row.date >= start && row.date <= today && Number.isFinite(Number(row.views)) && Number(row.views)>=0) values.set(row.date,Number(row.views));
    }
    const anchor = new Date(`${today}T12:00:00Z`);
    const days = Array.from({length:30},(_,index)=>{
      const d=new Date(anchor);d.setUTCDate(d.getUTCDate()-29+index);
      const date=d.toISOString().slice(0,10);
      return {date,views:date<start ? null : values.get(date)||0};
    });
    const audience = {};
    for(const dimension of ['device','source']) {
      const rows=Array.isArray(data.audience?.[dimension]) ? data.audience[dimension] : [];
      const safe=rows.filter(r=>Object.hasOwn(labels,r.label) && Number.isFinite(Number(r.views)) && Number(r.views)>0);
      const sum=safe.reduce((a,r)=>a+Number(r.views),0);
      audience[dimension]=safe.map(r=>({label:labels[r.label],views:Number(r.views),percent:sum ? Number(r.views)/sum*100 : 0}));
    }
    return {days,total:days.reduce((a,d)=>a+(d.views||0),0),today:values.get(today)||0,audience,source:String(data.source||'Coleta Passport'),scope:String(data.scope||''),startedAt:data.startedAt,updatedAt:data.updatedAt};
  }
  const root = typeof window === 'undefined' ? globalThis : window;
  root.PassportMediaKit = Object.freeze({config,normalize});
  if(typeof document === 'undefined' || !document.getElementById('history-days')) return;
  const set=(id,value)=>{document.getElementById(id).textContent=value;};
  const bars=(id,rows)=>{
    const target=document.getElementById(id);target.replaceChildren();
    if(!rows.length){const p=document.createElement('p');p.textContent='Perfil em formação. Os percentuais aparecem após as primeiras visitas medidas.';target.append(p);return;}
    rows.forEach(row=>{
      const div=document.createElement('div');div.className='audience-bar';
      const p=document.createElement('p');const name=document.createElement('span');name.textContent=row.label;
      const percent=document.createElement('b');percent.textContent=`${row.percent.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`;
      const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.value=row.percent;meter.setAttribute('aria-label',`${row.label}: ${percent.textContent}, ${row.views} pageviews`);
      p.append(name,percent);div.append(p,meter);target.append(div);
    });
  };
  const render=(data)=>{
    const report=normalize(data);const body=document.getElementById('history-days');body.replaceChildren();
    report.days.forEach(row=>{
      const tr=document.createElement('tr');const date=document.createElement('td');const views=document.createElement('td');
      date.textContent=row.date.split('-').reverse().join('/');views.textContent=row.views===null ? 'Antes da coleta' : row.views.toLocaleString('pt-BR');tr.append(date,views);body.append(tr);
    });
    set('measured-today',report.today.toLocaleString('pt-BR'));set('history-total',report.total.toLocaleString('pt-BR'));
    set('measurement-status',`${report.source}. ${report.scope}`);
    set('history-source',`Fonte: ${report.source}. Coleta iniciada em ${new Date(report.startedAt).toLocaleDateString('pt-BR',{timeZone:config.timeZone})}.`);
    set('history-window','Soma dos pageviews medidos nos últimos 30 dias. Datas anteriores à coleta aparecem identificadas.');
    bars('audience-device',report.audience.device);bars('audience-source',report.audience.source);
  };
  let busy=false;
  async function refresh(){
    if(busy) return;busy=true;
    try {
      const result=await fetch(config.endpoint,{headers:{apikey:config.publicKey},signal:AbortSignal.timeout(8000)});
      if(!result.ok) throw new Error('Unavailable');render(await result.json());
    } catch (_) {set('measurement-status','Medição temporariamente indisponível. O índice temporal continua independente.');}
    finally {busy=false;}
  }
  refresh();setInterval(()=>{if(!document.hidden) refresh();},config.refreshMs);
})();
