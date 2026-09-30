(() => {
  'use strict';
  if (window.__passportMeasurement) return;
  window.__passportMeasurement = true;
  const config = Object.freeze({endpoint:'https://kmrnnudmujezriomimwn.supabase.co/functions/v1/passport-media-kit', publicKey:'sb_publishable_LzwZUlVjSpvFXPZfMz6_DA_RRtNai3y'});
  window.PassportMeasurement = {config};
  if (!['passportradio.online','www.passportradio.online'].includes(location.hostname)) return;
  const accepted = () => { try { return localStorage.getItem('passport_cookie_consent_v2') === 'accepted'; } catch (_) { return false; } };
  let sent = false;
  const send = () => {
    if (sent || !accepted() || navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
    sent = true;
    let source = 'direct';
    try {
      if (document.referrer) {
        const host = new URL(document.referrer).hostname;
        source = /(^|\.)passportradio\.online$/.test(host) ? 'internal' : /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com)$/.test(host) ? 'search' : /(^|\.)(facebook\.com|instagram\.com|t\.co|x\.com|youtube\.com|t\.me|whatsapp\.com)$/.test(host) ? 'social' : 'referral';
      }
    } catch (_) {}
    const ua = navigator.userAgent;
    const device = /iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? 'tablet' : /Mobi|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    fetch(config.endpoint,{method:'POST',headers:{'Content-Type':'application/json',apikey:config.publicKey},body:JSON.stringify({path:location.pathname,source,device,consent:true}),keepalive:true}).catch(()=>{});
  };
  send();
  window.addEventListener('passport:consent',send);
  // ANUNCIE owns its consent controls: no global contact rewriting or old skin.
  if (document.body.classList.contains('anuncie-paper') && !accepted()) {
    const notice = document.createElement('div'); notice.className='anuncie-consent';
    const p=document.createElement('p');p.textContent='Autorizar medição anônima de visitas neste navegador?';
    const accept=document.createElement('button');accept.type='button';accept.textContent='AUTORIZAR';
    const refuse=document.createElement('button');refuse.type='button';refuse.textContent='AGORA NÃO';
    accept.addEventListener('click',()=>{try{localStorage.setItem('passport_cookie_consent_v2','accepted');}catch(_){}send();notice.remove();});
    refuse.addEventListener('click',()=>notice.remove());
    notice.append(p,accept,refuse);document.querySelector('footer').append(notice);
  }
})();
