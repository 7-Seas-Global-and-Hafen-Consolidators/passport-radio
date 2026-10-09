/* Blog presentation shared by collections, indexes and articles.
   No content rewriting and no ownership of the radio transport. */
(() => {
  'use strict';
  if (window.PassportBlogShell) return;
  const mainLinks = [['/','Home'],['/noticias.html','Notícias'],['/agenda.html','Agenda'],['/editorial.html','Arquivo'],['/bandas/index.html','Bandas'],['/blog.html','Blog'],['/jogos.html','Jogos'],['/videos.html','Vídeos'],['/radio.html','Ouvir'],['/loja.html','Loja'],['/divulgar-bandas.html','Participe'],['/promocoes.html','Promoções'],['/anuncie.html','Anuncie'],['/doe.html','Apoie']];
  const archiveLinks = [['/blog.html','Capa'],['/blog/busca.html','Busca'],['/blog/arquivo/','Arquivo'],['/blog/arquivo/letras.html','A–Z'],['/blog/arquivo/autores.html','Autores'],['/blog/arquivo/paises.html','Países'],['/blog/arquivo/formatos.html','Formatos'],['/blog/arquivo/epocas.html','Épocas'],['/blog/arquivo/temas.html','Temas'],['/blog/arquivo/agenda.html','Agenda do acervo'],['/blog/arquivo/hoje.html','Hoje no acervo'],['/blog/envie-sua-historia.html','Envie sua história']];
  const anchors = list => list.map(([href,name])=>`<a href="${href}">${name}</a>`).join('');
  function script(src, marker) {
    if (document.querySelector(`script[${marker}],script[src^="${src}"]`)) return;
    const node=document.createElement('script');node.src=src;node.defer=true;node.setAttribute(marker,'');document.head.append(node);
  }
  function refreshReadingTime(main) {
    const prose=main.querySelector('.pe-prose,.mn-prose,article.prose,.blog-profile');
    if(!prose)return;
    const words=[...prose.querySelectorAll('p,li')]
      .filter(node=>!node.closest('details,figure,nav,.blog-collab-strip,.blog-share,.blog-follow,.blog-prevnext,.blog-listen')&&!node.querySelector('p,li')&&!node.matches('.blog-kicker,[data-passport-reading-time]'))
      .map(node=>node.textContent.trim()).join(' ').split(/\s+/u).filter(Boolean).length;
    if(!words)return;
    let reading=main.querySelector('[data-passport-reading-time]');
    if(!reading){
      const title=main.querySelector('h1');if(!title)return;
      reading=document.createElement('p');reading.dataset.passportReadingTime='1';
      reading.className='passport-blog-shell-reading';title.after(reading);
    }
    const text='🕒 Leitura: '+Math.ceil(words/200)+' '+(words<=200?'minuto':'minutos');
    if(reading.textContent!==text)reading.textContent=text;
    reading.dataset.passportWordCount=String(words);
  }
  function mount() {
    if (!/^\/blog(?:\.html|\/)/.test(location.pathname) || document.body.dataset.passportBlogShell) return;
    const body=document.body, main=body.querySelector('main');if(!main)return;
    body.dataset.passportBlogShell='1';body.dataset.editorialPaperChrome='1';
    const css=document.createElement('link');css.rel='stylesheet';css.href='/css/passport-blog-shell.css?v=20261008-global';document.head.append(css);
    const header=document.createElement('header');header.className='passport-blog-shell-header';
    header.innerHTML=`<a class="passport-blog-shell-logo" href="/" aria-label="Passport Radio — Home">Passport<em>Radio</em></a><p class="passport-blog-shell-years">1 9 9 8 · 2 0 2 6</p><nav class="passport-blog-shell-main-nav" aria-label="Seções">${anchors(mainLinks)}</nav>`;
    const search=body.querySelector('form.blog-search');
    if(search){search.classList.add('passport-blog-shell-search');header.append(search);}
    else {
      const form=document.createElement('form');form.method='get';form.action='/blog/busca.html';form.className='passport-blog-shell-search';form.setAttribute('role','search');
      form.innerHTML='<label for="passport-shell-query">Buscar no Blog</label><input id="passport-shell-query" name="q" type="search" placeholder="Artista, disco, país, ano…"><button type="submit">Buscar</button>';header.append(form);
    }
    // Only template chrome outside main is replaced. Article headers stay intact.
    [...body.children].filter(e=>e.matches('header,.pe-topbar,.news-rule-double,nav.pp-nav,nav.news-nav,nav.blog-doors')).forEach(e=>e.remove());
    body.prepend(header);
    const editorial=document.createElement('nav');editorial.className='passport-blog-shell-editorial';editorial.setAttribute('aria-label','Navegação editorial');editorial.innerHTML=anchors(archiveLinks);
    header.after(editorial);
    const edition=document.createElement('p');edition.className='passport-blog-shell-edition';
    edition.dataset.passportEdition='1';
    edition.innerHTML='<span>ACERVO PASSPORT RADIO</span><span>EDIÇÃO MR. NOMAD</span>';
    editorial.after(edition);
    // Preserve every destination present in the historical editorial menu.
    for(const menu of main.querySelectorAll('.blog-doors')) {
      for(const a of menu.querySelectorAll('a[href]')) if(![...editorial.querySelectorAll('a')].some(x=>x.getAttribute('href')===a.getAttribute('href')))editorial.append(a.cloneNode(true));
      menu.remove();
    }
    const oldFooters=[...body.querySelectorAll('footer')].filter(f=>!f.closest('main,article,[id*="player"]'));
    const footer=document.createElement('footer');footer.className='passport-blog-shell-footer';footer.id='ajude';
    footer.innerHTML=`<section class="passport-blog-shell-support"><h2>AJUDE A MANTER A PASSPORT RADIO NO AR</h2><p>Você escolhe quanto contribuir. Pix, boleto e cartão pelos meios já disponíveis no Mercado Pago.</p><a class="passport-blog-shell-donate" href="https://link.mercadopago.com.br/passportradio" target="_blank" rel="noopener">CONTRIBUIR COM A PASSPORT</a><p>Pix: <a href="mailto:passportradio.online@gmail.com">passportradio.online@gmail.com</a></p></section><a class="passport-blog-shell-footer-brand" href="/">Passport Radio</a><nav aria-label="Links institucionais">${anchors(mainLinks)}<a href="/blog/arquivo/letras.html">A–Z</a><a href="/blog/arquivo/">Arquivo do Blog</a></nav><nav aria-label="Canais oficiais"><a href="https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k" target="_blank" rel="noopener">WhatsApp oficial</a><a href="https://t.me/+FKto2N185cs4OGU0" target="_blank" rel="noopener">Telegram oficial</a></nav><p>© 1998–2026 Passport Radio · Todos os direitos reservados.</p><nav aria-label="Políticas e contato"><a href="/politica-de-privacidade.html">Política de Privacidade</a><a href="/termos.html">Termos de Uso</a><a href="/cookies.html">Política de Cookies</a><a href="/contato.html">Contato</a></nav>`;
    const destinations=new Set([...footer.querySelectorAll('a')].map(a=>a.getAttribute('href')));
    for(const old of oldFooters)for(const a of old.querySelectorAll('a[href]'))if(a.getAttribute('href')!=='/privacidade.html'&&!destinations.has(a.getAttribute('href'))){footer.querySelector('nav').append(a.cloneNode(true));destinations.add(a.getAttribute('href'));}
    oldFooters.forEach(f=>f.remove());body.append(footer);
    // Reuse the approved payment component and its nine original assets.
    const existing=body.querySelector('[data-payment-footer-trust]');if(existing)footer.querySelector('.passport-blog-shell-support').append(existing);
    script('/js/payment-footer-trust.js','data-passport-shell-payments');
    script('/js/passport-audio-continuity.js','data-passport-continuity');
    script('/js/passport-persist-nav.js','data-passport-shell-navigation');
    script('/js/passport-artist-navigation.js','data-passport-artist-navigation');
    refreshReadingTime(main);
    const prose=main.querySelector('.pe-prose,.mn-prose,article.prose,.blog-profile');
    if(prose)new MutationObserver(()=>refreshReadingTime(main)).observe(prose,{childList:true,subtree:true,characterData:true});
  }
  window.PassportBlogShell=Object.freeze({mount,refreshReadingTime});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();

