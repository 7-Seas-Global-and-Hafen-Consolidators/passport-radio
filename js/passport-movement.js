(() => {
  'use strict';
  // Independent temporal presentation index, never a count of measured audience.
  const config = Object.freeze({timeZone:'America/Sao_Paulo', referenceLow:92256, referenceHigh:198891});
  const formatter = new Intl.DateTimeFormat('en-CA', {timeZone:config.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
  function hash(text) {
    let h=2166136261;
    for(let i=0;i<text.length;i++) { h^=text.charCodeAt(i);h=Math.imul(h,16777619); }
    h^=h>>>16;h=Math.imul(h,0x7feb352d);h^=h>>>15;h=Math.imul(h,0x846ca68b);h^=h>>>16;
    return h>>>0;
  }
  const unit=(key)=>(hash(key)+0.5)/4294967296;
  let cached;
  function profileFor(date) {
    if(cached?.date===date) return cached;
    const normal=Math.sqrt(-2*Math.log(unit(`${date}:amplitude-a`)))*Math.cos(2*Math.PI*unit(`${date}:amplitude-b`));
    // Log-normal variation around the reference region; its bounds are NOT clamps.
    const closing=Math.round(Math.sqrt(config.referenceLow*config.referenceHigh)*Math.exp(0.28*normal));
    const shift=(unit(`${date}:shift`)-.5)*2;
    const peaks=[{at:9+shift,width:2.4,weight:.6+unit(`${date}:morning`)},{at:15-shift/2,width:3,weight:1.4+unit(`${date}:afternoon`)},{at:21+shift/2,width:2.3,weight:.8+unit(`${date}:evening`)}];
    const cumulative=[0];
    for(let minute=0;minute<1440;minute++) {
      const hour=(minute+.5)/60;
      const smooth=.16+peaks.reduce((sum,p)=>sum+p.weight*Math.exp(-.5*((hour-p.at)/p.width)**2),0);
      const ripple=1+.08*Math.sin(hour*(1.5+unit(`${date}:frequency`))+unit(`${date}:phase`)*Math.PI*2);
      const micro=.8+.4*unit(`${date}:minute:${minute}`);
      cumulative.push(cumulative[minute]+smooth*ripple*micro);
    }
    cached=Object.freeze({date,closing,shift,peaks:Object.freeze(peaks.map(Object.freeze)),cumulative:Object.freeze(cumulative)});
    return cached;
  }
  function stateAt(now=Date.now()) {
    const timestamp=Number(now);const parts=Object.fromEntries(formatter.formatToParts(new Date(timestamp)).map(p=>[p.type,p.value]));
    const date=`${parts.year}-${parts.month}-${parts.day}`;
    const seconds=Number(parts.hour)*3600+Number(parts.minute)*60+Number(parts.second)+(timestamp%1000)/1000;
    const profile=profileFor(date),minute=Math.floor(seconds/60),fraction=seconds/60-minute;
    // Monotonic microvariation inside each minute, rather than a clock-like +1 cadence.
    const strength=.2+.5*unit(`${date}:pulse:${minute}`);
    const progress=fraction-strength*Math.sin(2*Math.PI*fraction)/(2*Math.PI);
    const weight=profile.cumulative[minute]+(profile.cumulative[minute+1]-profile.cumulative[minute])*progress;
    return {date,seconds,closing:profile.closing,value:Math.floor(profile.closing*weight/profile.cumulative[1440])};
  }
  const valueAt=(now=Date.now())=>stateAt(now).value;
  const root=typeof window==='undefined'?globalThis:window;
  root.PassportMovement=Object.freeze({config,profileFor,stateAt,valueAt});
  if(typeof document==='undefined') return;
  const node=document.getElementById('movement-index');if(!node)return;
  let timer;
  function render() {
    clearTimeout(timer);
    const now=Date.now(),state=stateAt(now);
    node.textContent=state.value.toLocaleString('pt-BR');node.dataset.day=state.date;
    const cadence=550+Math.floor(unit(`${state.date}:tick:${Math.floor(now/500)}`)*1250);
    // Always schedule the day boundary, including while the page remains open.
    timer=setTimeout(render,Math.max(1,Math.min(cadence,(86400-state.seconds)*1000)));
  }
  render();document.addEventListener('visibilitychange',render);
})();
