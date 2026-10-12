/* Shared Store presentation: real existing brand assets, no commercial rules. */
(()=>{'use strict';
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
 const logo=(file,label,cls='')=>`<img class="${cls}" src="/images/payments/${file}" alt="${label}" decoding="async">`;
 const brands=()=>[['visa','Visa'],['mastercard','Mastercard'],['elo','Elo'],['amex','American Express'],['hipercard','Hipercard'],['diners','Diners Club']].map(([f,a])=>logo(f+'.png',a)).join('');
 const lock=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>`;
 function payments(p){return `<div class="ps-price-lines"><span><b>Pix</b> ${p.pix_price?money(p.pix_price):'valor no pedido'}</span><span><b>Cartão</b> condições no Mercado Pago</span><span><b>Boleto</b> ${p.boleto_price?money(p.boleto_price):'valor no pedido'}</span></div>`;}
 function trust(){return `<div class="ps-trust-connection">${lock}<div><strong>Conexão protegida</strong><span>Seus dados são enviados por HTTPS.</span></div></div><div class="ps-trust-payment">${logo('mercado-pago.svg','Mercado Pago')}<span>Processador de pagamento</span></div><div class="ps-trust-methods">${logo('pix.png','Pix')}${brands()}</div><a class="ps-google-check" href="https://transparencyreport.google.com/safe-browsing/search?url=passportradio.online" target="_blank" rel="noopener"><img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" width="92" height="30"><span>Consultar segurança do site</span></a>`;}
 function mount(){document.querySelectorAll('[data-store-trust]').forEach(e=>e.innerHTML=trust());document.querySelectorAll('[data-mp-logo]').forEach(e=>e.innerHTML=logo('mercado-pago.svg','Mercado Pago'));document.querySelectorAll('[data-card-brands]').forEach(e=>e.innerHTML=brands());document.querySelectorAll('[data-pix-logo]').forEach(e=>e.innerHTML=logo('pix.png','Pix'));document.querySelectorAll('[data-secure-connection]').forEach(e=>e.innerHTML=`${lock}<span>Conexão HTTPS</span>`);}
 window.PassportStorePresentation={escape,money,payments,trust,mount};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
