(() => {
  const stories = [
    {title:'Por que os Ramones acabaram — e como viraram o DNA do punk 50 anos depois?',short:'Ramones: 50 anos depois, o fracasso comercial virou o DNA do punk.',deck:'Eles venderam pouco no começo, brigaram por anos e encerraram a banda em 1996. Cinquenta anos depois do primeiro álbum, Green Day, Rancid, Blink-182 e CJ Ramone tocaram aquelas músicas juntos.',url:'/editorial/2026/08/31/por-que-os-ramones-acabaram-e-como-viraram-o-dna-do-punk.html',image:'https://img.youtube.com/vi/iB6mMyYNdAA/hqdefault.jpg',alt:'Ramones ao vivo no CBGB em Nova York',meta:'DESTAQUE · Mr. Nomad · Ramones · 31/08/2026'},
    {title:'Por que Osees deixou San Francisco — e por que voltou à cidade em 2026?',short:'Osees voltou a San Francisco em 2026 — e encarou a cidade que ajudou a criar a banda.',url:'/editorial/2026/08/31/por-que-osees-deixou-san-francisco-e-por-que-voltou-em-2026.html',image:'https://img.youtube.com/vi/TYiYf-30HkQ/maxresdefault.jpg',alt:'Osees ao vivo',meta:'Mr. Nomad · Osees'},
    {title:'Por que Babyshambles acabou — e como Pete Doherty reuniu a banda sem Patrick Walden?',short:'Babyshambles: onze anos depois, a reunião chegou com uma ausência impossível de esconder.',url:'/editorial/2026/08/30/por-que-babyshambles-acabou-e-como-pete-doherty-reuniu-banda-sem-patrick-walden.html',image:'https://img.youtube.com/vi/bN9KEW7h-f0/maxresdefault.jpg',alt:'Babyshambles ao vivo',meta:'Mr. Nomad · Babyshambles'},
    {title:'Por que Weezer voltou ao Blue Album para criar o Gold Album?',short:'Weezer voltou a 1994 para descobrir o que ainda existe entre quatro músicos e uma guitarra.',url:'/editorial/2026/08/30/por-que-weezer-voltou-ao-blue-album-para-criar-gold-album.html',image:'https://img.youtube.com/vi/e_Ruon4JQzM/maxresdefault.jpg',alt:'Weezer ao vivo',meta:'Mr. Nomad · Weezer'}
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