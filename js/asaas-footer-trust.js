(()=>{
'use strict';
if(document.querySelector('[data-asaas-footer-trust]'))return;
const footer=document.querySelector('footer');if(!footer)return;
const wrap=document.createElement('div');wrap.className='asaas-footer-trust';wrap.dataset.asaasFooterTrust='1';
const brands=['visa','mastercard','elo','diners','discover','amex','cabal','banescard','credz','sorocred','credsystem','jcb'];
const brandHtml=brands.map(name=>`<img src="https://atlas.asaas.com/v48.12.0/assets/images/card-brands/${name}.svg" alt="${name}" loading="lazy" decoding="async">`).join('');
wrap.innerHTML=`<div class="asaas-footer-trust__inner"><div class="asaas-footer-trust__methods" aria-label="Formas de pagamento"><strong>PIX</strong><i></i><strong>BOLETO</strong><i></i><strong>CARTÃO</strong><i></i><strong>PARCELAMENTO EM ATÉ 48X</strong></div><div class="asaas-footer-trust__brands" aria-label="Bandeiras de cartão">${brandHtml}</div><div class="asaas-footer-trust__provider"><span>Pagamentos processados com</span><img class="asaas-footer-trust__logo" src="https://www.asaas.com/assets/logo/asaas-blue-bec7e1ca4a3d931d56007e2d69de916a.svg" alt="Asaas" loading="lazy" decoding="async"></div></div>`;
footer.insertAdjacentElement('beforebegin',wrap);
})();
