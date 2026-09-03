(() => {
  const stories = [
    {title:'Você não lembrava dessa música. Até ela começar a tocar.',short:'Anos 80 Vol. 2: as músicas que o Brasil nunca esqueceu.',deck:'Whitney. Marvin. Men at Work. Foreigner. Dire Straits. Raul. Ritchie. E dezenas de portas para a mesma pergunta: quem estava tocando dentro das músicas que ficaram na sua vida?',url:'/anos-80-volume-2-musicas-memoria-brasileira.html',image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7d17kYvCxSm0orMpIvBHWo5KyHEFwAie36Zj2UFYxhg&s=10',alt:'Anos 80 — memória musical brasileira',meta:'DESTAQUE · Mr. Nomad · ANOS 80 · VOL. 2 · 03/09/2026'},
    {title:'Dream Theater tem só 11 músicas boas? Regis Tadeu disse isso. Agora escute a banda.',short:'Dream Theater: antes de contar músicas boas, conte quantos músicos você realmente ouviu.',deck:'Comfortably Numb, Another Day, Breaking All Illusions e Overture 1928 / Strange Déjà Vu.',url:'/editorial/2026/09/02/dream-theater-tem-so-11-musicas-boas-regis-tadeu.html',image:'https://whiplash.net/imagens_promo_22/dreamtheater_2021_por_rayon_richards_site_oficial.jpg',alt:'Dream Theater',meta:'Mr. Nomad · Music DNA · Dream Theater'},
    {title:'Festa PLOC: você cresceu. A pista não recebeu o memorando.',short:'Festa PLOC: a matéria virou a própria festa.',deck:'Balão Mágico, Paquitas, Ritchie, Madonna, Michael Jackson, Depeche Mode, Cyndi Lauper, Safety Dance e dezenas de performances ao vivo escolhidas a dedo.',url:'/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html',image:'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnrZNW--8LXtEZzArtZQIESVHH50_gn4PsQpZ6z_3SJw&s=10',alt:'Festa PLOC — músicas dos anos 80 e performances ao vivo',meta:'NOVO · Mr. Nomad · FESTA PLOC · LIVE DNA'},
    {title:'Por que Osees deixou San Francisco — e por que voltou à cidade em 2026?',short:'Osees voltou a San Francisco em 2026 — e encarou a cidade que ajudou a criar a banda.',url:'/editorial/2026/08/31/por-que-osees-deixou-san-francisco-e-por-que-voltou-em-2026.html',image:'https://img.youtube.com/vi/TYiYf-30HkQ/maxresdefault.jpg',alt:'Osees ao vivo',meta:'Mr. Nomad · Osees'}
  ];

  let lastSignature = '';

  const apply = () => {
    const [lead,...sideStories]=stories;
    const hero=document.querySelector('.hero-main > a');
    const side=Array.from(document.querySelectorAll('.hero-side .hero-item > a'));
    const breaking=document.querySelector('.breaking-track');
    const feature=document.querySelector('#noticias .feature > a');
    const signature=[hero?.getAttribute('href')||'',...side.map(slot=>slot.getAttribute('href')||''),feature?.getAttribute('href')||''].join('|');
    const expected=[lead.url,...sideStories.map(story=>story.url),lead.url].join('|');
    if(signature===expected&&lastSignature===expected)return;
    if(hero){hero.href=lead.url;hero.innerHTML=`<img src="${lead.image}" alt="${lead.alt}" referrerpolicy="no-referrer"><div class="hero-copy"><span class="eyebrow">${lead.meta}</span><h1>${lead.title}</h1><p>${lead.deck}</p></div>`;}
    sideStories.forEach((story,index)=>{const slot=side[index];if(!slot)return;slot.href=story.url;slot.innerHTML=`<img src="${story.image}" alt="${story.alt}" referrerpolicy="no-referrer"><div><small>${story.meta}</small><h2>${story.short}</h2></div>`;});
    if(breaking)breaking.innerHTML=stories.map(story=>story.title).join('&nbsp; · &nbsp;');
    if(feature){feature.href=lead.url;feature.innerHTML=`<img src="${lead.image}" alt="${lead.alt}" referrerpolicy="no-referrer"><div><small>${lead.meta}</small><h3>${lead.title}</h3><p>${lead.deck}</p></div>`;}
    lastSignature=expected;
  };

  const start=()=>{
    apply();
    [80,200,450,900,1600,2800].forEach(delay=>window.setTimeout(apply,delay));
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();