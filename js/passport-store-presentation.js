/* Shared Store presentation: real existing brand assets, no commercial rules. */
(()=>{'use strict';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const logo=(file,label,cls='')=>`<img class="${cls}" src="/images/payments/${file}" alt="${label}" decoding="async">`;
 const brands=()=>[['visa','Visa'],['mastercard','Mastercard'],['elo','Elo'],['amex','American Express'],['hipercard','Hipercard'],['diners','Diners Club']].map(([f,a])=>logo(f+'.png',a)).join('');
 const lock=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>`;
 function payments(p){return `<div class="ps-price-lines"><span><b>Pix</b> ${p.pix_price?money(p.pix_price):'valor no pedido'}</span><span><b>Cartão</b> condições no Mercado Pago</span><span><b>Boleto</b> ${p.boleto_price?money(p.boleto_price):'valor no pedido'}</span></div>`;}
 function trust(){return `<a class="ps-security-seals" aria-label="Consultar segurança do domínio Passport Radio no Google Safe Browsing" href="https://transparencyreport.google.com/safe-browsing/search?url=passportradio.online" target="_blank" rel="noopener"><img src="/images/security/store-security-reference.png" alt="Site seguro — SSL certificado; Site seguro Google — clique para verificar" decoding="async"></a><div class="ps-trust-payment">${logo('mercado-pago.svg','Mercado Pago')}<span>Processador de pagamento</span></div><div class="ps-trust-methods">${logo('pix.png','Pix')}${brands()}${logo('caixa.png','CAIXA — Débito Virtual, conforme aceitação do Mercado Pago')}</div>`;}

 function mount(){document.querySelectorAll('[data-store-trust]').forEach(e=>e.innerHTML=trust());document.querySelectorAll('[data-mp-logo]').forEach(e=>e.innerHTML=logo('mercado-pago.svg','Mercado Pago'));document.querySelectorAll('[data-card-brands]').forEach(e=>e.innerHTML=brands());document.querySelectorAll('[data-caixa-logo]').forEach(e=>e.innerHTML=logo('caixa.png','CAIXA'));document.querySelectorAll('[data-pix-logo]').forEach(e=>e.innerHTML=logo('pix.png','Pix'));document.querySelectorAll('[data-secure-connection]').forEach(e=>e.innerHTML=`${lock}<span>Conexão HTTPS</span>`);}
 window.PassportStorePresentation={escape,money,payments,trust,mount};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
