(() => {
  const ASAAS='https://www.asaas.com/c/dwbjyv79vyrfj4ry';
  const PAYPAL='https://www.paypal.com/ncp/payment/WK4CLBGVD2Y4C';
  const CSS='/css/passport-support.css?v=1';

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

  const boot=()=>{
    ensureCss();
    removeLegacy();
    let section=document.getElementById('apoie');
    if(section){
      section.className='passport-support-global';
      section.innerHTML=markup();
      section.dataset.passportSupport='global';
      return;
    }
    section=document.createElement('section');
    section.id='apoie';
    section.className='passport-support-global';
    section.dataset.passportSupport='global';
    section.innerHTML=markup();
    const footer=document.querySelector('footer');
    footer?.parentNode ? footer.parentNode.insertBefore(section,footer) : document.body.appendChild(section);
  };

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
