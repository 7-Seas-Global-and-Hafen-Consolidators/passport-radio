(() => {
  "use strict";

  const FEED = [
    { hat: "CAPA", t: "Anos 80 · Vol. 2", href: "/anos-80-volume-2-musicas-memoria-brasileira.html" },
    { hat: "MEMÓRIA", t: "Festa PLOC", href: "/editorial/2026/09/03/festa-ploc-musicas-anos-80-nostalgia-shows-ao-vivo.html" },
    { hat: "BASTIDORES", t: "The Mission", href: "/editorial/2026/08/27/the-mission-historia-integrantes-wayne-hussey-craig-adams.html" },
    { hat: "ARQUIVO", t: "Agenda da casa", href: "/agenda.html" },
    { hat: "RÁDIO", t: "Rádio 24H", href: "/radio.html" },
    { hat: "MUNDO", t: "World Dial", href: "/radio-mundo.html" },
    { hat: "CASA", t: "Anuncie na Passport", href: "/anuncie.html" },
    { hat: "LOJA", t: "Vitrine", href: "/loja.html" },
    { hat: "APOIO", t: "Asaas / banca", href: "https://www.asaas.com/c/shpb8gbiswnw4t2n" },
    { hat: "HOME", t: "Home em operação", href: "/index-95x.html" }
  ];

  let shown = 8;

  function paintFeed() {
    const box = document.getElementById("pp-feed");
    if (!box) return;
    box.innerHTML = FEED.slice(0, shown).map((item) =>
      `<article class="pp-news-item"><small>${item.hat}</small><a href="${item.href}">${item.t}</a></article>`
    ).join("");
  }

  function gate() {
    const el = document.getElementById("pp-gate");
    if (!el) return;
    if (sessionStorage.getItem("pp-gate-ok") === "1") return;
    el.hidden = false;
    let n = 15;
    const sec = document.getElementById("pp-gate-sec");
    const tick = window.setInterval(() => {
      n -= 1;
      if (sec) sec.textContent = String(n);
      if (n <= 0) {
        window.clearInterval(tick);
        closeGate();
      }
    }, 1000);
    document.getElementById("pp-gate-apoie")?.addEventListener("click", closeGate);
    function closeGate() {
      window.clearInterval(tick);
      sessionStorage.setItem("pp-gate-ok", "1");
      el.hidden = true;
    }
  }

  function listen() {
    document.querySelectorAll("[data-pp-action='ouvir-ao-vivo']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const play = document.getElementById("passport-live-play");
        if (play) play.click();
        else window.location.href = "/radio.html";
      });
    });
  }

  function burger() {
    const b = document.getElementById("pp-burger");
    const nav = document.getElementById("pp-core-nav");
    if (!b || !nav) return;
    b.addEventListener("click", () => nav.classList.toggle("is-open"));
  }

  function more() {
    document.getElementById("pp-btn-more-feed")?.addEventListener("click", () => {
      shown = Math.min(FEED.length, shown + 10);
      paintFeed();
    });
  }

  function init() {
    gate();
    paintFeed();
    more();
    burger();
    window.setTimeout(listen, 80);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
