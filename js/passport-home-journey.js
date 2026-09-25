/* PASSPORT HOME JOURNEY — layout orchestration only; no audio ownership. */
(() => {
  "use strict";
  function openHouse(path) {
    const house = document.querySelector(`#passport-casas details[data-house="${path}"]`);
    if (!house) return;
    house.open = true;
    const host = document.getElementById("passport-casa-host");
    (host || house).scrollIntoView({behavior:"smooth", block:"start"});
  }
  function boot() {
    const ticker = document.querySelector(".pp-ticker");
    const houses = document.getElementById("passport-casas");
    const wrap = document.querySelector(".pp-wrap");
    if (ticker && houses) ticker.insertAdjacentElement("afterend", houses);
    document.querySelector(".pp-featured")?.remove();
    document.querySelector(".pp-feed-head")?.remove();

    if (wrap && !document.querySelector(".journey-business")) {
      wrap.insertAdjacentHTML("afterend", `
        <section class="journey-business">
          <article class="journey-business__store"><span>PASSPORT STORE · ENCARTE</span><h2>Produto, história e identidade.</h2><p>Peças escolhidas pela casa, sem transformar a rádio num depósito de vitrines.</p><a href="loja.html">ABRIR A LOJA →</a></article>
          <article><span>MÍDIA PASSPORT</span><h2>Anuncie.</h2><p>Bandas, shows, festivais, lojas e marcas dentro de uma publicação musical viva.</p><a href="anuncie.html">VER FORMATOS →</a></article>
          <article><span>AJUDE A PASSPORT</span><h2>Mantenha a casa no ar.</h2><p>Histórias, arquivo, pesquisa e rádio independente continuam porque alguém ajuda.</p><a href="https://www.asaas.com/c/shpb8gbiswnw4t2n" target="_blank" rel="noopener">AJUDAR AGORA →</a></article>
        </section>
        <section class="journey-continue"><span>OUTRAS PORTAS</span><nav>
          <a href="editorial.html"><b>ARQUIVO</b>Histórias fora da capa</a>
          <a href="blog/arquivo/letras.html"><b>BANDAS</b>Artistas de A a Z</a>
          <a href="participe.html"><b>PARTICIPE</b>Envio não publica</a>
          <a href="loja.html"><b>LOJA</b>Catálogo real</a>
          <a href="anuncie.html"><b>ANUNCIE</b>Formatos e preços</a>
          <a href="minha-passport.html"><b>CONTA</b>Minha Passport</a>
        </nav></section>
      `);
    }

    document.addEventListener("click", (event) => {
      const houseLink = event.target.closest("[data-open-existing-house]");
      if (houseLink) {
        event.preventDefault();
        openHouse(houseLink.dataset.openExistingHouse);
        return;
      }
      const fofonete = event.target.closest("[data-open-fofonete]");
      if (fofonete) {
        const dock = document.getElementById("fofonete-dock");
        if (dock) dock.click();
        else document.getElementById("ajude")?.scrollIntoView({behavior:"smooth"});
      }
    });
    reanchor();
  }
  function reanchor() {
    const hash = window.location.hash;
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (el) el.scrollIntoView({behavior: "auto", block: "start"});
  }
  document.addEventListener("passport:journey-ready", reanchor);
  window.addEventListener("load", reanchor);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, {once:true});
  else boot();
})();
