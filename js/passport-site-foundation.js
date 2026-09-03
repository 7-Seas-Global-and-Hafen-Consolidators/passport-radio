(()=>{
  'use strict';

  const PASSPORT={
    whatsapp:'https://wa.me/48732099369?text=Ol%C3%A1%20Passport%20Radio!',
    telegram:'https://t.me/+447594716370',
    email:'passport@passportradio.online'
  };
  const CONSENT_KEY='passport_cookie_consent_v1';

  function normalizeContacts(){
    document.querySelectorAll('a[href]').forEach(link=>{
      const href=link.getAttribute('href')||'';
      if(/^https?:\/\/(?:wa\.me|api\.whatsapp\.com)\//i.test(href)) link.href=PASSPORT.whatsapp;
      if(/^https?:\/\/t\.me\//i.test(href)) link.href=PASSPORT.telegram;
      if(/^mailto:/i.test(href) && /passport/i.test(href)) link.href=`mailto:${PASSPORT.email}`;
    });
  }

  function consent(){try{return JSON.parse(localStorage.getItem(CONSENT_KEY)||'null');}catch(_){return null;}}
  function save(value){
    const record={choice:value,updatedAt:new Date().toISOString()};
    try{localStorage.setItem(CONSENT_KEY,JSON.stringify(record));}catch(_){}
    document.documentElement.dataset.passportConsent=value;
    window.dispatchEvent(new CustomEvent('passport:consent',{detail:record}));
    return record;
  }

  function style(){
    if(document.getElementById('passport-consent-style')) return;
    const el=document.createElement('style'); el.id='passport-consent-style';
    el.textContent=`#passport-cookie-consent{position:fixed;left:18px;right:18px;bottom:18px;z-index:2147483000;max-width:1040px;margin:auto;background:#111;color:#fff;border:1px solid #333;box-shadow:0 18px 60px rgba(0,0,0,.32);padding:18px 20px;font:500 14px/1.55 Inter,Arial,sans-serif}#passport-cookie-consent strong{display:block;font-size:16px;margin-bottom:5px}#passport-cookie-consent p{margin:0;color:#ddd}#passport-cookie-consent a{color:#fff;text-decoration:underline}#passport-cookie-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}#passport-cookie-actions button{border:1px solid #fff;background:#fff;color:#111;padding:9px 14px;font:800 12px/1 Inter,Arial,sans-serif;cursor:pointer}#passport-cookie-actions button[data-choice=essential]{background:transparent;color:#fff}#passport-cookie-actions a{display:inline-flex;align-items:center;padding:8px 4px}#passport-cookie-settings{position:fixed;left:12px;bottom:12px;z-index:2147482000;border:1px solid #bbb;background:#fff;color:#111;padding:7px 9px;font:700 10px/1 Inter,Arial,sans-serif;cursor:pointer;box-shadow:0 4px 18px rgba(0,0,0,.12)}@media(max-width:640px){#passport-cookie-consent{left:10px;right:10px;bottom:10px;padding:16px}#passport-cookie-settings{left:8px;bottom:8px}}`;
    document.head.appendChild(el);
  }

  function openBanner(){
    style();
    document.getElementById('passport-cookie-consent')?.remove();
    const box=document.createElement('section'); box.id='passport-cookie-consent'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Preferências de cookies');
    box.innerHTML=`<strong>Sua privacidade na Passport</strong><p>Usamos cookies essenciais para o site funcionar e, com sua permissão, tecnologias de medição e publicidade. Você pode aceitar todos ou manter apenas os essenciais. Leia nossa <a href="/privacidade.html">Política de Privacidade</a> e a <a href="/cookies.html">Política de Cookies</a>.</p><div id="passport-cookie-actions"><button type="button" data-choice="all">ACEITAR TODOS</button><button type="button" data-choice="essential">SÓ ESSENCIAIS</button><a href="/cookies.html">PREFERÊNCIAS</a></div>`;
    document.body.appendChild(box);
    box.querySelectorAll('button[data-choice]').forEach(btn=>btn.addEventListener('click',()=>{save(btn.dataset.choice);box.remove();mountSettings();}));
  }

  function mountSettings(){
    style();
    if(document.getElementById('passport-cookie-settings')) return;
    const btn=document.createElement('button'); btn.id='passport-cookie-settings'; btn.type='button'; btn.textContent='COOKIES'; btn.addEventListener('click',openBanner); document.body.appendChild(btn);
  }

  function init(){
    normalizeContacts();
    const current=consent();
    if(current?.choice) document.documentElement.dataset.passportConsent=current.choice;
    else openBanner();
    mountSettings();
  }
  window.PassportSite={contacts:PASSPORT,getConsent:consent,setConsent:save,openCookiePreferences:openBanner};
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
