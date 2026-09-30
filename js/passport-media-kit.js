(() => {
  'use strict';
  const config = Object.freeze({endpoint:'https://kmrnnudmujezriomimwn.supabase.co/functions/v1/passport-media-kit', publicKey:'sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y', refreshMs:60000, timeZone:'America/Sao_Paulo'});
  const labels = {desktop:'Desktop',mobile:'Mobile',tablet:'Tablet',direct:'Direto',search:'Busca',social:'Social',internal:'Interno',referral:'Outros sites'};
  // Demonstration is presentation-only. Never passed to the measurement collector.
  const demonstration = Object.freeze({
    today: 96842,
    values: Object.freeze([91284, 94731, 96408, 93562, 101347, 104821, 98615, 95774, 97308, 102416, 105239, 108674, 103581, 99427, 101963, 104286, 107531, 110248, 106794, 112365, 109817, 105642, 108953, 111426, 114782, 117305, 113648, 109536, 103927, 96842]),
    audience: Object.freeze({
      device: Object.freeze([{label:'Mobile',percent:68},{label:'Desktop',percent:27},{label:'Tablet',percent:5}]),
      source: Object.freeze([{label:'Busca',percent:41},{label:'Direto',percent:29},{label:'Social',percent:18},{label:'Interno',percent:8},{label:'Outros sites',percent:4}])
    })
  });
  const presentationConfig = Object.freeze({minimumRealDays:30,minimumRealPageviews:1000});
  function demonstrationReport() {
    const days=demonstration.values.map((views,index)=>({date:`2026-09-${String(index+1).padStart(2,'0')}`,views}));
    return {mode:'demonstration',today:demonstration.today,days,total:days.reduce((sum,day)=>sum+day.views,0),audience:demonstration.audience};
  }
  function presentation(real) {
    const sufficient=real && real.days.filter(day=>day.views!==null).length>=presentationConfig.minimumRealDays && real.days.every(day=>day.views>0) && real.total>=presentationConfig.minimumRealPageviews && real.today>0 && real.audience.device.length>0 && real.audience.source.length>0;
    return sufficient ? {...real,mode:'measured'} : demonstrationReport();
  }
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
  root.PassportMediaKit = Object.freeze({config,normalize,demonstration,presentationConfig,demonstrationReport,presentation});
  if(typeof document === 'undefined' || !document.getElementById('audience-device')) return;
  const bars=(id,rows)=>{
    const target=document.getElementById(id);target.replaceChildren();
    rows.forEach(row=>{
      const div=document.createElement('div');div.className='audience-bar';
      const p=document.createElement('p');const name=document.createElement('span');name.textContent=row.label;
      const percent=document.createElement('b');percent.textContent=`${row.percent.toLocaleString('pt-BR',{maximumFractionDigits:1})}%`;
      const meter=document.createElement('meter');meter.min=0;meter.max=100;meter.value=row.percent;meter.setAttribute('aria-label',`${row.label}: ${percent.textContent}`);
      p.append(name,percent);div.append(p,meter);target.append(div);
    });
  };
  const render=(data)=>{
    const report=presentation(data ? normalize(data) : null);
    bars('audience-device',report.audience.device);bars('audience-source',report.audience.source);
  };
  let busy=false;
  async function refresh(){
    if(busy) return;busy=true;
    try {
      const result=await fetch(config.endpoint,{headers:{apikey:config.publicKey},signal:AbortSignal.timeout(8000)});
      if(!result.ok) throw new Error('Unavailable');render(await result.json());
    } catch (_) { /* Retain the current profile when the report is unavailable. */ }
    finally {busy=false;}
  }
  render(null);refresh();setInterval(()=>{if(!document.hidden) refresh();},config.refreshMs);
})();
