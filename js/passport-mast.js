/* Cabeçalho único. Branco, marca, busca, seções. Não mexe em preço, SKU nem stream. */
(function () {
  if (!document.querySelector('link[href*="passport-house.css"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/passport-house.css?v=20260925rs";
    document.head.appendChild(link);
  }
  if (!document.querySelector('script[src*="passport-musical-door.js"]')) {
    var door = document.createElement("script");
    door.src = "/js/passport-musical-door.js?v=20260925rs";
    door.defer = true;
    document.body.appendChild(door);
  }
  if (document.getElementById("pr-mast")) {
    document.body.classList.add("pr-housed");
    return;
  }

  var path = location.pathname;
  function current(href) {
    if (path === href || path === href.replace(/^\//, "")) return ' aria-current="page"';
    return "";
  }
  var mast = document.createElement("div");
  mast.id = "pr-mast";
  mast.innerHTML =
    '<div class="pr-util">' +
      '<a href="/historias/contar-historias-que-dao-vontade-de-ouvir.html">Sobre</a>' +
      '<a href="/anuncie.html">Anunciar</a>' +
      '<a href="/participe.html">Enviar colaborações</a>' +
      '<a href="/divulgar-bandas.html">Divulgar bandas</a>' +
      '<a href="/doe.html">Apoiar</a>' +
      '<a href="/contato.html">Falar conosco</a>' +
      '<a href="https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k">WhatsApp</a>' +
      '<a href="https://t.me/+FKto2N185cs4OGU0">Telegram</a>' +
    "</div>" +
    '<div class="pr-head">' +
      '<a class="pr-word" href="/">Passport<small>Radio</small></a>' +
      '<button class="pr-menu-btn" type="button" aria-expanded="false" aria-controls="pr-red">Menu</button>' +
      '<nav class="pr-sections" id="pr-red" aria-label="Seções">' +
        '<a href="/noticias.html"' + current("/noticias.html") + ">Notícias</a>" +
        '<a href="/agenda.html"' + current("/agenda.html") + ">Agenda</a>" +
        '<a href="/editorial.html"' + current("/editorial.html") + ">Arquivo</a>" +
        '<a href="/blog/arquivo/"' + current("/blog/arquivo/") + ">Seções</a>" +
        '<a href="/blog/arquivo/letras.html"' + current("/blog/arquivo/letras.html") + ">Bandas e artistas</a>" +
        '<a href="/radio.html"' + current("/radio.html") + ">Ouvir</a>" +
        '<a href="/loja.html"' + current("/loja.html") + ">Loja</a>" +
      "</nav>" +
    "</div>" +
    '<form class="pr-search" action="/blog/busca.html" method="get" role="search">' +
      '<input type="search" name="q" placeholder="Buscar no acervo" aria-label="Buscar no acervo">' +
      "<button type=\"submit\">Buscar</button>" +
    "</form>";
  document.body.insertBefore(mast, document.body.firstChild);
  document.body.classList.add("pr-housed");

  var btn = mast.querySelector(".pr-menu-btn");
  var nav = mast.querySelector(".pr-sections");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();
