(() => {
  const ASAAS='https://www.asaas.com/c/dwbjyv79vyrfj4ry';
  const PAYPAL='https://www.paypal.com/ncp/payment/WK4CLBGVD2Y4C';
  const CSS='/css/passport-support.css?v=2';
  const WAIT_SECONDS=15;

  const ensureCss=()=>{
    if(document.querySelector('link[data-passport-support-css]')) return;
    const link=document.createElement('link');
    link.rel='stylesheet';
    link.href=CSS;
    link.dataset.passportSupportCss='1';
    document.head.appendChild(link);
  };

  const markup=()=>`<div class="passport-support-global__inner">
    <div class="passport-support-global__copy">
      <span class="passport-support-global__eyebrow">APOIE · PASSPORT RADIO</span>
      <h2>Mantenha a Passport no ar.</h2>
      <p>Histórias, arquivos, pesquisa e produção independente continuam porque alguém decide que cultura musical ainda merece espaço.</p>
    </div>
    <div class="passport-support-global__actions">
      <a class="passport-support-global__button passport-support-global__button--primary" href="${ASAAS}" target="_blank" rel="noopener">APOIAR VIA ASAAS ↗</a>
      <a class="passport-support-global__button passport-support-global__button--secondary" href="${PAYPAL}" target="_blank" rel="noopener">PAYPAL · ALTERNATIVA ↗</a>
      <small class="passport-support-global__choice">Você escolhe o valor e a forma de apoio.</small>
      <small class="passport-support-global__note">Recebimentos processados por GUIROPA WORLD INOVA SIMPLES (I.S.) · CNPJ 64.581.935/0001-91</small>
    </div>
  </div>`;

  const removeLegacy=()=>{
    document.getElementById('passport-support-float')?.remove();
    document.getElementById('passport-paypal-support')?.remove();
  };

  const adblockDetected=()=>{
    const bait=document.createElement('div');
    bait.className='adsbox ad-banner ad-unit advertisement adsbygoogle';
    bait.setAttribute('aria-hidden','true');
    bait.style.cssText='position:absolute!important;left:-10000px!important;top:-10000px!important;width:1px!important;height:1px!important;pointer-events:none!important;';
    document.body.appendChild(bait);
    const style=getComputedStyle(bait);
    const blocked=bait.offsetHeight===0||bait.offsetWidth===0||style.display==='none'||style.visibility==='hidden';
    bait.remove();
    return blocked;
  };

  const showAdblockModal=()=>{
    if(document.getElementById('passport-adblock-overlay')) return;
    const overlay=document.createElement('div');
    overlay.id='passport-adblock-overlay';
    overlay.className='passport-adblock-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-labelledby','passport-adblock-title');
    overlay.innerHTML=`<div class="passport-adblock-card">
      <div class="passport-adblock-character" aria-hidden="true"><img src="/images/sxwwj(1).jpg" alt="" loading="eager" decoding="async"></div>
      <div class="passport-adblock-copy">
        <span class="passport-adblock-eyebrow">PASSPORT RADIO · SINAL INDEPENDENTE</span>
        <h2 id="passport-adblock-title">Contribua para nos manter online</h2>
        <p>Parece que você está usando um bloqueador de anúncios. A publicidade ajuda a manter a Passport Radio gratuita, independente e no ar.</p>
        <a class="passport-adblock-primary" href="${ASAAS}" target="_blank" rel="noopener">APOIAR A PASSPORT ↗</a>
        <a class="passport-adblock-secondary" href="${PAYPAL}" target="_blank" rel="noopener">APOIAR VIA PAYPAL ↗</a>
        <button class="passport-adblock-continue" type="button" disabled>Continuar sem apoiar · ${WAIT_SECONDS}s</button>
      </div>
    </div>`;
    document.body.appendChild(overlay);
    document.documentElement.classList.add('passport-support-modal-open');
    const button=overlay.querySelector('.passport-adblock-continue');
    let remaining=WAIT_SECONDS;
    const timer=setInterval(()=>{
      remaining-=1;
      if(remaining<=0){
        clearInterval(timer);
        button.disabled=false;
        button.textContent='Continuar sem apoiar';
        return;
      }
      button.textContent=`Continuar sem apoiar · ${remaining}s`;
    },1000);
    button.addEventListener('click',()=>{
      if(button.disabled) return;
      clearInterval(timer);
      overlay.remove();
      document.documentElement.classList.remove('passport-support-modal-open');
      try{sessionStorage.setItem('passport-adblock-dismissed','1');}catch(_e){}
    });
  };

  const maybeShowAdblockModal=()=>{
    try{if(sessionStorage.getItem('passport-adblock-dismissed')==='1') return;}catch(_e){}
    window.setTimeout(()=>{if(adblockDetected()) showAdblockModal();},1200);
  };

  const boot=()=>{
    ensureCss();
    removeLegacy();
    let section=document.getElementById('apoie');
    if(section){
      section.className='passport-support-global';
      section.innerHTML=markup();
      section.dataset.passportSupport='global';
    }else{
      section=document.createElement('section');
      section.id='apoie';
      section.className='passport-support-global';
      section.dataset.passportSupport='global';
      section.innerHTML=markup();
      const footer=document.querySelector('footer');
      footer?.parentNode ? footer.parentNode.insertBefore(section,footer) : document.body.appendChild(section);
    }
    maybeShowAdblockModal();
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
