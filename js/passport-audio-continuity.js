/* Passport continuity: document-to-document intent, through the existing Home facade. */
(() => {
  'use strict';
  if (window.PassportContinuity) return;
  const KEY = 'passport.audio.continuity.v1';
  const HOME = location.pathname === '/' || location.pathname === '/index.html';
  let state = null, runtime = null, ready = false, restoring = false, unloading = false, leavingExternal = false;
  let controls, status, toggle, volume, choosingDoor=false;
  const read = () => {
    try {
      const s = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!s) return null;
      if (s.version !== 1 || typeof s.family !== 'string' || !/^[a-z0-9-]{1,24}$/.test(s.family) ||
          !Number.isFinite(s.volume) || s.volume < 0 || s.volume > 1 || typeof s.playing !== 'boolean' ||
          (s.index !== null && (!Number.isInteger(s.index) || s.index < 0 || s.index > 400)) ||
          (s.archive !== null && !/^[A-Za-z0-9_-]{11}$/.test(s.archive))) throw Error('state');
      return {version:1,family:s.family,index:s.index,playing:s.playing,volume:s.volume,archive:s.archive};
    } catch (_) { try { sessionStorage.removeItem(KEY); } catch (_) {} return null; }
  };
  state = read();
  const save = () => { if (state) try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} };
  const label = () => state && runtime ? runtime.label(state.family, state.index) : 'Passport Radio';
  const notify = (restored=false) => {
    const actual = ready && runtime.state().playing;
    const detail = {family:state?.family,volume:state?.volume ?? .8,title:choosingDoor?'Passport Radio':label(),playing:!!actual,restore:restored};
    window.dispatchEvent(new CustomEvent('passport:audio-state', {detail}));
    if (controls) {
      status.textContent = detail.title + (actual ? ' · NO AR' : state?.playing ? ' · aguardando reprodução' : ' · pausado');
      toggle.textContent = state?.playing ? 'PAUSAR RÁDIO' : 'RETOMAR RÁDIO';
      toggle.setAttribute('aria-pressed', String(!!state?.playing));
      volume.value = String(detail.volume);
    }
  };
  const suspend = () => {
    if (state) { state.playing = false; save(); }
    runtime?.pause(); notify();
  };
  const restore = () => {
    if (!ready || !state) return;
    choosingDoor=false;
    if (!runtime.valid(state.family, state.index)) {
      state = null; try { sessionStorage.removeItem(KEY); } catch (_) {} return;
    }
    runtime.engine.volume(state.volume);
    if (state.playing && state.family === 'globo' && document.getElementById('gdoPlay')?.disabled) {
      const button=document.getElementById('gdoPlay');
      const observer=new MutationObserver(()=>{if(!button.disabled){observer.disconnect();clearTimeout(timeout);restore();}});
      const timeout=setTimeout(()=>observer.disconnect(),15000);
      observer.observe(button,{attributes:true,attributeFilter:['disabled']});notify();return;
    }
    if (state.playing) {
      // The archive engine owns its program sequence; never silently replace a later program with the first.
      if (state.family === 'globo' && state.archive && window.PassportGloboPlayer?.current() !== state.archive) {
        state.playing = false; save(); notify(); return;
      }
      restoring = true;
      try { runtime.engine.select(state.family, label(), state.index ?? undefined); }
      finally { restoring = false; }
    }
    notify(true);
  };
  const mountControls = () => {
    if (HOME || !state || controls) return;
    const footer = [...document.querySelectorAll('footer')].find(f => !f.closest('article,.player')) || document.querySelector('main');
    if (!footer) return;
    controls = document.createElement('div'); controls.className = 'passport-continuity-controls';
    controls.setAttribute('aria-label', 'Rádio selecionada');
    status = document.createElement('span'); status.setAttribute('aria-live','polite');
    toggle = document.createElement('button'); toggle.type = 'button';
    volume = document.createElement('input'); volume.type = 'range'; volume.min = '0'; volume.max = '1'; volume.step = '.05';
    volume.setAttribute('aria-label','Volume da rádio');
    toggle.addEventListener('click', () => state.playing ? suspend() : (state.playing = true, save(), restore()));
    volume.addEventListener('input', () => runtime.engine.volume(Number(volume.value)));
    controls.append(status,toggle,volume); footer.appendChild(controls); notify();
  };
  const connect = () => {
    if (runtime || !window.PassportAudioRuntime) return;
    runtime = window.PassportAudioRuntime;
    if(state && !runtime.valid(state.family,null)){state=null;try{sessionStorage.removeItem(KEY);}catch(_){}}
    const engine = runtime.engine, init = engine.init.bind(engine), select = engine.select.bind(engine);
    const playPause = engine.playPause.bind(engine), setVolume = engine.volume.bind(engine), parent = engine.parent.bind(engine);
    engine.init = async callback => {
      await init((title,playing) => { callback(title,playing); if (ready) notify(); });
      ready = true; restore(); mountControls(); notify();
    };
    engine.select = (family,title,index) => {
      if (!runtime.valid(family,index ?? null)) return;
      choosingDoor=false;
      if (!restoring) {
        state = {version:1,family,index:index ?? null,playing:true,volume:runtime.state().volume,archive:null}; save();
      }
      select(family,title,index); notify();
    };
    engine.playPause = () => {
      if (!state) { playPause(); return; }
      if (state.playing) suspend();
      else { state.playing = true; save(); restore(); }
    };
    engine.volume = value => {
      if (!Number.isFinite(value) || value < 0 || value > 1) return;
      setVolume(value); if (state && ready && !restoring) { state.volume = value; save(); } notify();
    };
    engine.parent = () => { choosingDoor=true;parent(); if (state) { state.playing = false; save(); } notify(); };
    if (HOME && runtime.ready) { ready=true;restore();notify(); }
    if (!HOME) engine.init(() => {}).catch(() => { if (state) { state.playing = false; save(); } notify(); });
  };
  const footers = () => {
    document.querySelectorAll('footer a[href="/privacidade.html"]').forEach(a=>{a.href='/politica-de-privacidade.html';});
    const candidates = [...document.querySelectorAll('footer .pb-footer__bottom,footer .pp-footer-bottom,footer .participe-paper-footer-bottom,footer .apoio-paper-footer-bottom,footer .anuncie-footer-bottom,footer small,footer p,footer div,footer span')];
    const line = candidates.find(e => /©|Todos os direitos reservados/.test(e.textContent) && !e.querySelector('div,p,small'));
    if (!line || line.closest('footer').querySelector('a[href="/politica-de-privacidade.html"]')) return;
    const a = document.createElement('a'); a.href = '/politica-de-privacidade.html'; a.textContent = 'Política de Privacidade';
    a.style.color='inherit'; a.style.fontSize='inherit'; line.append(' · ',a);
  };
  const start = () => {
    const css = document.createElement('link'); css.rel='stylesheet'; css.href='/css/passport-audio-continuity.css'; document.head.append(css);
    footers();
    const observer = new MutationObserver(() => { footers(); mountControls(); });
    observer.observe(document.body,{childList:true,subtree:true});
    if (HOME) connect();
    else if (state) {
      // Existing radio documents own their own host. Do not instantiate a competing bay there.
      if (document.body.classList.contains('passport-house') || /\/(?:radio[^/]*|globo-de-ouro-player)\.html$/.test(location.pathname)) return;
      window.PassportContinuityHost = true;
      const script = document.createElement('script'); script.type='module'; script.src='/assets/index-DgBCruM8.js';
      script.addEventListener('error', () => { if (state) {state.playing=false;save();} }); document.head.append(script);
    }
  };
  window.addEventListener('passport:audio-runtime',connect);
  window.addEventListener('passport:audio-ready',()=>{if(runtime&&!ready){ready=true;restore();notify();}});
  window.addEventListener('pagehide', () => {
    unloading = true;
    if (leavingExternal && state) state.playing=false;
    if (state?.family === 'globo') state.archive = window.PassportGloboPlayer?.current() || state.archive;
    save();
  },true);
  window.addEventListener('pageshow', event => { unloading=false; if (event.persisted) {state=read();restore();} });
  document.addEventListener('click',event => {
    const a=event.target.closest?.('a[href]');
    if (!a || a.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey || event.button) return;
    try { const u=new URL(a.href,location.href);leavingExternal = /^https?:$/.test(u.protocol) && u.origin!==location.origin; } catch (_) {}
  },true);
  // The existing Bus already yields to another native audio element. Preserve that stopped intent too.
  document.addEventListener('play',event=>{
    if(ready && state?.playing && event.target instanceof HTMLAudioElement && !event.target.closest('#qwen-engine-bay')){
      state.playing=false;save();
    }
  },true);
  window.PassportContinuity = Object.freeze({key:KEY,getState:() => state ? {...state} : null,pause:suspend});
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true}); else start();
})();
