/* Cabeçalho único da casa. Não mexe em áudio, preço, SKU nem no corpo da matéria. */
(function () {
  if (document.getElementById("pr-mast")) {
    document.body.classList.add("pr-housed");
    return;
  }
  if (!document.querySelector('link[href*="passport-house.css"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/passport-house.css?v=20260925house";
    document.head.appendChild(link);
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
    "</div>" +
    '<div class="pr-logo">' +
      '<a class="pr-word" href="/">Passport<small>Radio</small></a>' +
      '<p class="pr-since">Desde 1998. Depois de uma interrupção, no ar de novo em 2026.</p>' +
    "</div>" +
    '<form class="pr-search" action="/blog/busca.html" method="get" role="search">' +
      '<input type="search" name="q" placeholder="buscar no acervo" aria-label="Buscar">' +
      "<button type=\"submit\">Buscar</button>" +
      '<span class="pr-social">' +
        '<a href="https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k" aria-label="WhatsApp">WA</a>' +
        '<a href="https://t.me/+FKto2N185cs4OGU0" aria-label="Telegram">TG</a>' +
        '<a href="/radio.html" aria-label="Rádios">RÁDIO</a>' +
      "</span>" +
    "</form>" +
    '<button class="pr-menu-btn" type="button" aria-expanded="false" aria-controls="pr-red">Menu</button>' +
    '<nav class="pr-red" id="pr-red" aria-label="Seções">' +
      '<a href="/noticias.html"' + current("/noticias.html") + ">Notícias e novidades</a>" +
      '<a href="/agenda.html"' + current("/agenda.html") + ">Agenda de shows</a>" +
      '<a href="/editorial.html"' + current("/editorial.html") + ">Arquivo</a>" +
      '<a href="/blog/arquivo/"' + current("/blog/arquivo/") + ">Seções</a>" +
      '<a href="/blog/arquivo/letras.html"' + current("/blog/arquivo/letras.html") + ">Bandas e artistas</a>" +
      '<a href="/radio.html"' + current("/radio.html") + ">Ouvir</a>" +
      '<a href="/loja.html"' + current("/loja.html") + ">Loja</a>" +
    "</nav>";
  document.body.insertBefore(mast, document.body.firstChild);
  document.body.classList.add("pr-housed");

  var btn = mast.querySelector(".pr-menu-btn");
  var nav = mast.querySelector(".pr-red");
  if (btn && nav) {
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  if (!document.querySelector(".pr-ribbon")) {
    var left = document.createElement("a");
    left.className = "pr-ribbon pr-ribbon-l";
    left.href = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k";
    left.textContent = "Novidades no WhatsApp";
    var right = document.createElement("a");
    right.className = "pr-ribbon pr-ribbon-r";
    right.href = "/anuncie.html";
    right.textContent = "Anuncie na Passport";
    document.body.appendChild(left);
    document.body.appendChild(right);
  }
})();
