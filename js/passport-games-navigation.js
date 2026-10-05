/* Adds only Jogos and Vídeos destinations to existing principal navigation. */
(() => {
  const install = () => {
    document.querySelectorAll('nav').forEach(nav => {
      if (nav.closest('footer')) return;
      const links = [...nav.querySelectorAll('a[href]')];
      const path = a => new URL(a.href, location.href).pathname;
      const blog = links.find(a => path(a) === '/blog.html');
      const store = links.find(a => path(a) === '/loja.html');
      if (!blog || !store || !links.some(a => ['/','/index.html','/noticias.html'].includes(path(a)))) return;
      let anchor = links.find(a => path(a) === '/jogos.html') || blog;
      for (const [href,label] of [['/jogos.html','Jogos'],['/videos.html','Vídeos']]) {
        const existing = [...nav.querySelectorAll('a[href]')].find(a => path(a) === href);
        if (existing) { anchor = existing; continue; }
        const a = document.createElement('a'); a.href = href; a.textContent = label;
        a.className = blog.className;
        const item = anchor.closest('li');
        if (item && item.parentElement.closest('nav') === nav) {
          const li = document.createElement('li'); li.append(a); item.after(li);
        } else anchor.after(a);
        anchor = a;
      }
    });
  };
  install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
