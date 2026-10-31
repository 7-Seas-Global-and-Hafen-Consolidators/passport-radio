/* Institutional footer only. Existing page, framework and audio nodes retain ownership. */
(() => {
  'use strict';
  if(!document.querySelector('script[data-passport-global-loader]')){const language=document.createElement('script');language.type='module';language.src='/js/passport-global/index.mjs';language.dataset.passportGlobalLoader='1';document.head.append(language);}
  if (window.PassportUniversalFooter) { window.PassportUniversalFooter.mount(); return; }
  const groups = [
    ['EXPLORE', [['Home','/'],['Notícias','/noticias.html'],['Arquivo','/editorial.html'],['Agenda','/agenda.html'],['Bandas','/bandas/index.html'],['Vídeos','/videos.html'],['Desafios','/jogos.html'],['Podcast & Broadcast','/radio.html'],['Rádio 24H','/radio.html']]],
    ['PARTICIPE', [['Participe','/divulgar-bandas.html'],['Envie sua história','/blog/envie-sua-historia.html'],['Divulgue sua banda','/divulgar-bandas.html'],['Promoções','/promocoes.html']]],
    ['A PASSPORT', [['Loja','/loja.html'],['Anuncie','/anuncie.html'],['Apoie','/doe.html'],['Contato','/contato.html'],['contato@passportradio.online','mailto:contato@passportradio.online']]],
    ['ACOMPANHE', [['WhatsApp','https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k'],['Telegram','https://t.me/+FKto2N185cs4OGU0'],['Reddit','https://www.reddit.com/user/Passportradio_26/'],['X','https://x.com/PassportRadio'],['YouTube','https://www.youtube.com/@PassportRadio-Official'],['Kwai','https://www.kwai.com/@passportradio.online'],['TikTok','https://www.tiktok.com/@passportradio.online'],['Instagram','https://www.instagram.com/passport.radio.online/'],['E-mail','mailto:contato@passportradio.online']]]
  ];
  // Local SVG marks: no third-party image or CSS-mask request is needed.
  const social = {
    WhatsApp:'whatsapp', Telegram:'telegram', Reddit:'reddit', X:'x',
    YouTube:'youtube', Kwai:'kwai', TikTok:'tiktok', Instagram:'instagram', 'E-mail':'email'
  };
  const socialLink = ([label,href]) => {
    const external = href.startsWith('https:') ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a class="puf-social-link" href="${href}"${external} aria-label="${label}" title="${label}"><img class="puf-social-icon" src="/images/social/${social[label]}.svg" width="24" height="24" alt="" aria-hidden="true"><span class="puf-social-label">${label}</span></a>`;
  };
  const socialLinks = groups[3][1];
  function mountHeaderSocial() {
    // Only institutional chrome outside the page's content and playback UI.
    const excluded = 'main,article,footer,.player,.player-dock,[id*="player"],[class*="player-"],.pe-prose,.mn-prose';
    const header = [...document.querySelectorAll('header,.topbar,.mn-head,.top')].find(node =>
      !node.closest(excluded) && (
        node.matches('.pb-mast,.news-mast,.participe-paper-mast,.mast,.site-header,.hub-head,.editorial-paper-header,.archive-mast,.promo-paper-mast,.podcast-mast,.ba-mast,.pp-topbar,.pp-top-masthead') ||
        node.querySelector('.brand,.pe-brand,.mn-brand,.story-brand,.editorial-paper-wordmark') ||
        [...node.querySelectorAll('a,h1')].some(el => /^passport\s*radio$/i.test(el.textContent.trim()))
      ));
    if (!header) return;
    const mast = header.querySelector('.editorial-paper-mast,.hub-shell') || header;
    const years = mast.querySelector('.pb-mast__years,.news-mast__years,.participe-paper-mast__years,.editorial-paper-years,.archive-mast__years,.promo-paper-mast__years,.podcast-mast__years') ||
      [...mast.children].find(node => /^(?:1\s*9\s*9\s*8)\s*[·–—-]\s*(?:2\s*0\s*2\s*6)$/.test(node.textContent.trim()));
    let box = header.querySelector('[data-passport-header-social]');
    if (!box) {
      const email = header.querySelector('a[href^="mailto:"]');
      const links = socialLinks.map(([label,href]) => [label,label === 'E-mail' && email ? email.getAttribute('href') : href]);
      box = document.createElement('div');
      box.dataset.passportHeaderSocial='1';
      box.className='passport-header-social';
      box.setAttribute('aria-label','Redes sociais e e-mail da Passport Radio');
      box.innerHTML=links.map(socialLink).join('');
    }
    // Retire only legacy social/contact icons in this masthead, never page content.
    for (const node of header.querySelectorAll('.pb-mast__social')) {
      if (!node.hidden) { node.hidden=true; node.dataset.passportLegacySocial='1'; }
    }
    const domains = ['whatsapp.com','wa.me','t.me','reddit.com','x.com','twitter.com','youtube.com','www.kwai.com','www.tiktok.com'];
    for (const link of header.querySelectorAll('a[href]')) {
      if (link.closest('[data-passport-header-social]')) continue;
      const url = new URL(link.href,location.href);
      if (url.protocol === 'mailto:' || domains.some(domain => url.hostname === domain || url.hostname.endsWith('.'+domain))) {
        if (!link.hidden) { link.hidden=true; link.dataset.passportLegacySocial='1'; }
      }
    }
    // Follow the dates when present. Other templates use their existing brand area.
    const brand = mast.querySelector('.brand,.pe-brand,.mn-brand,.story-brand,.editorial-paper-wordmark,.news-mast__logo,.participe-paper-mast__logo,.pb-mast__logo') ||
      [...mast.querySelectorAll('a')].find(el => /passport\s*radio/i.test(el.textContent.trim()) || /passport/i.test(el.getAttribute('aria-label') || ''));
    const brandArea = brand && brand.parentElement !== mast ? [...mast.children].find(node => node.contains(brand)) : brand;
    const anchor = years || brandArea;
    if (anchor && anchor.parentElement && !anchor.parentElement.closest('nav')) {
      if (anchor.nextElementSibling !== box) anchor.after(box);
    } else if (box.parentElement !== mast) mast.prepend(box);
  }
  const brands = [['visa','Visa'],['mastercard','Mastercard'],['elo','Elo'],['amex','American Express'],['hipercard','Hipercard'],['diners','Diners Club']];
  const anchor = ([label,href]) => `<a href="${href}"${href.startsWith('https:')?' target="_blank" rel="noopener noreferrer"':''}>${label}</a>`;
  // Boleto/card symbols copied from the approved Home bundle; no replacement artwork.
  const boleto = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  const card = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>';
  const markup = `<div id="passport-universal-footer-content" data-universal-footer-content>
    <div class="puf-identity"><a class="puf-wordmark" href="/" aria-label="Passport Radio — Home">Passport <em>Radio</em></a><p>Primeiro a história. Depois a música.</p></div>
    <nav class="puf-navigation" aria-label="Navegação institucional do rodapé">${groups.map(([title,links])=>`<section class="puf-group"><h2>${title}</h2>${links.map(title==='ACOMPANHE'?socialLink:anchor).join('')}</section>`).join('')}</nav>
    <div class="puf-payments" aria-label="Meios de pagamento">
      <div class="puf-methods"><span><img src="/images/payments/pix.png" alt="" width="16" height="16">PIX</span><span>${boleto}BOLETO</span><span>${card}CARTÃO</span><span><img src="/images/payments/caixa.png" alt="" width="20" height="16">CAIXA</span></div>
      <div class="puf-brands" aria-label="Bandeiras de cartão">${brands.map(([file,label])=>`<img src="/images/payments/${file}.png" alt="${label}" decoding="async">`).join('')}</div>
      <div class="puf-provider"><a href="https://link.mercadopago.com.br/passportradio" target="_blank" rel="noopener noreferrer" aria-label="Pagar com Mercado Pago"><img src="/images/payments/mercado-pago.svg" alt="Mercado Pago" width="70" decoding="async"></a></div>
    </div>
    <div class="puf-legal"><p>© 1998–2026 Passport Radio · Todos os direitos reservados.</p><nav aria-label="Informações legais">${[['Política de Privacidade','/politica-de-privacidade.html'],['Termos de Uso','/termos.html'],['Política de Cookies','/cookies.html'],['Contato','/contato.html']].map(anchor).join('')}</nav></div>
  </div>`;
  let queued = false;
  function mount() {
    if (!document.body) return;
    const footers = [...document.querySelectorAll('footer')].filter(node=>!node.closest('article,.player,.player-dock,[id*="player"],[class*="player-"],.pe-prose,.mn-prose'));
    const mediaOnly = /^\/(?:app\/|radio-|player-|passport-player|adapter-lab)/.test(location.pathname) || /-player\.html$/.test(location.pathname);
    if (!footers.length && !mediaOnly && document.querySelector('main') && !document.querySelector('meta[http-equiv="refresh" i]')) {
      const footer=document.createElement('footer');document.body.append(footer);footers.push(footer);
    }
    if (!footers.length) return; // Widget/player-only documents do not gain an institutional shell.
    const host = footers.find(node=>node.hasAttribute('data-passport-universal-footer')) || footers[0];
    if (!document.querySelector('link[data-passport-universal-footer-style]')) {
      const css=document.createElement('link');css.rel='stylesheet';css.href='/css/passport-universal-footer.css?v=20261023c';css.dataset.passportUniversalFooterStyle='1';document.head.append(css);
    }
    host.dataset.passportUniversalFooter='1';
    mountHeaderSocial();
    if (!host.querySelector(':scope > [data-universal-footer-content]')) host.insertAdjacentHTML('beforeend',markup);
    for (const footer of footers) if(footer!==host&&!footer.hasAttribute('data-retired-institutional-footer')) {footer.dataset.retiredInstitutionalFooter='1';footer.hidden=true;footer.setAttribute('aria-hidden','true');}
    // Old payment strips are footer presentation only; checkout/payment controls are excluded.
    for(const strip of document.querySelectorAll('.payment-footer-trust,[data-payment-footer-trust],.pp-payment-trust')) {
      if(strip.closest('[data-universal-footer-content]')||strip.hasAttribute('data-retired-payment-footer'))continue;
      strip.dataset.retiredPaymentFooter='1';strip.hidden=true;strip.setAttribute('aria-hidden','true');
    }
  }
  const schedule=()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;mount();});};
  window.PassportUniversalFooter=Object.freeze({mount});
  function start(){mount();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}
  window.addEventListener('passport:editorial-rendered',schedule);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
