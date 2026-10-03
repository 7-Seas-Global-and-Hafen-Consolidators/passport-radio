/* Adds only the Jogos destination to existing principal navigation. */
(() => {
  const install = () => {
    document.querySelectorAll('nav').forEach(nav => {
      if (nav.closest('footer') || nav.querySelector('a[href="/jogos.html"]')) return;
      const links = [...nav.querySelectorAll('a[href]')];
      const path = a => new URL(a.href, location.href).pathname;
      const blog = links.find(a => path(a) === '/blog.html');
      const store = links.find(a => path(a) === '/loja.html');
      if (!blog || !store || !links.some(a => ['/','/index.html','/noticias.html'].includes(path(a)))) return;
      const a = document.createElement('a'); a.href = '/jogos.html'; a.textContent = 'Jogos';
      a.className = blog.className;
      const item = blog.closest('li');
      if (item && item.parentElement.closest('nav') === nav) {
        const li = document.createElement('li'); li.append(a); item.after(li);
      } else blog.after(a);
    });
  };
  install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();
