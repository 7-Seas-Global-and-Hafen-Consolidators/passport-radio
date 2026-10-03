/* Editorial presentation only. Existing navigation, forms and controls keep their nodes. */
(() => {
  'use strict';
  const install = () => {
    const body = document.body;
    if (!body || !body.classList.contains('pp-article') || body.classList.contains('passport-participe-paper')) return;
    if (body.dataset.editorialPaperChrome) return;
    const header = [...body.querySelectorAll('header,.topbar,.mn-head,.top')].find(node => !node.closest('main,article,.pe-prose,.mn-prose') && (node.querySelector('.brand,.pe-brand,.mn-brand,.story-brand') || [...node.querySelectorAll('a')].some(a => /^Passport Radio$/i.test(a.textContent.trim()))));
    if (!header) return;
    const brand = header.querySelector('.brand,.pe-brand,.mn-brand,.story-brand') || [...header.querySelectorAll('a')].find(a => /^Passport Radio$/i.test(a.textContent.trim()));
    if (!brand || brand.closest('.player,[id*="player"]')) return;
    body.dataset.editorialPaperChrome = '1';
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/css/passport-editorial-paper-chrome.css?v=20261001';
    document.head.appendChild(css);
    header.classList.add('editorial-paper-header');
    const mast = document.createElement('div');
    mast.className = 'editorial-paper-mast';
    brand.classList.add('editorial-paper-wordmark');
    brand.replaceChildren(document.createTextNode('Passport'), Object.assign(document.createElement('em'), {textContent:'Radio'}));
    mast.appendChild(brand);
    const years = document.createElement('div');
    years.className = 'editorial-paper-years';
    years.textContent = '1 9 9 8 · 2 0 2 6';
    mast.appendChild(years);
    header.prepend(mast);
    const rule=document.createElement('div');rule.className='editorial-paper-rule-double';rule.setAttribute('aria-hidden','true');mast.after(rule);
    // This strip is template chrome; no article text or media is inside it.
    const strip = header.previousElementSibling?.matches('.pe-topbar,.mn-top') ? header.previousElementSibling : null;
    if (strip && !strip.querySelector('img,iframe,video,audio,button,input')) strip.remove();
    header.querySelectorAll('nav').forEach(nav => nav.classList.add('editorial-paper-nav'));
    if (!header.querySelector('nav')) {
      const nav = document.createElement('nav');
      nav.className = 'editorial-paper-nav';
      nav.setAttribute('aria-label','Seções');
      // Routes already present in the approved paper masthead. No existing href is changed.
      const links = [['/','Home'],['/noticias.html','Notícias'],['/agenda.html','Agenda'],['/editorial.html','Arquivo'],['/bandas/index.html','Bandas'],['/blog.html','Blog'],['/jogos.html','Jogos'],['/radio.html','Podcast & Broadcast'],['/loja.html','Loja'],['/divulgar-bandas.html','Participe'],['/promocoes.html','Promoções'],['/anuncie.html','Anuncie'],['/doe.html','Apoie']];
      links.forEach(([href,text]) => {const a=document.createElement('a');a.href=href;a.textContent=text;nav.appendChild(a)});
      header.appendChild(nav);
    }
    body.querySelectorAll('footer').forEach(footer => {
      if (footer.closest('[id*="fofonete"],[class*="fofonete"],[data-fofonete],.player,[id*="player"]')) return;
      footer.classList.add('editorial-paper-footer');
      const mark = [...footer.querySelectorAll('a,strong,div')].find(node => /^Passport Radio$/i.test(node.textContent.trim()) && !node.querySelector('img,iframe,video,audio'));
      if (mark) {mark.textContent='Passport Radio';mark.classList.add('editorial-paper-footer-wordmark');}
      else {
        const a=document.createElement('a');a.href='/';a.textContent='Passport Radio';a.className='editorial-paper-footer-wordmark';footer.prepend(a);
      }
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, {once:true});
  else install();
  // Dossier shells receive their editorial header synchronously from the existing renderer.
  if (document.querySelector('#mr-nomad-dossier') && !document.body.dataset.editorialPaperChrome) {
    const observer = new MutationObserver(() => {install();if(document.body.dataset.editorialPaperChrome)observer.disconnect()});
    observer.observe(document.querySelector('#mr-nomad-dossier'),{childList:true,subtree:true});
  }
})();

/* Shared document continuity and discreet privacy link. No catalog or page content is changed. */
(() => { if (document.querySelector('script[data-passport-continuity]')) return;
  const script=document.createElement('script');script.src='/js/passport-audio-continuity.js';script.defer=true;script.dataset.passportContinuity='1';document.head.appendChild(script);
})();

/* Principal navigation destination only; keep existing routes and order. */
(() => { if(document.querySelector('script[src="/js/passport-games-navigation.js"]')) return;const s=document.createElement('script');s.src='/js/passport-games-navigation.js';s.defer=true;document.head.append(s);})();
