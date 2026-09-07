/* PASSPORT SHELL v6 — normalizador de shell em TODAS as páginas.
   1) Header no meio da página: causa = topbar sticky dentro de parent mid-DOM.
      Correção definitiva: topbar vira PRIMEIRO filho de <body> (sticky escopado ao body)
      + nenhum ancestral com transform/filter (isolation no CSS).
   2) Float Apoie context-aware: some quando #apoie ou footer estão visíveis (1 observer).
   3) body[data-playing] para o VU do player — listeners passivos, motor intocado.
   4) Sweep defensivo: remove cargas v5 mortas se algum HTML legado ainda referenciar.
   5) Legal footer: injeta .pp-footer-legal dentro do <footer> (mata body::after). */
(() => {
  "use strict";
  /* 4 — V5 fora da carga final, mesmo em cache/HTML antigo */
  document.querySelectorAll('link[href*="passport-home-v5"],script[src*="passport-home-v5"]').forEach((n) => n.remove());

  function fixHeader() {
    const bar = document.querySelector(".pp-topbar");
    if (bar && document.body.firstElementChild !== bar) {
      const skip = document.querySelector(".pp-skip");
      document.body.insertBefore(bar, skip ? skip.nextSibling : document.body.firstChild);
    }
    /* nav logo após o header */
    const nav = document.querySelector(".pp-nav");
    if (bar && nav && nav.previousElementSibling !== bar) bar.insertAdjacentElement("afterend", nav);
  }
  function legalFooter() {
    const f = document.querySelector(".pp-footer");
    if (!f || f.querySelector(".pp-footer-legal")) return;
    const d = document.createElement("div");
    d.className = "pp-footer-legal";
    d.textContent = "© 2026 Passport Radio™. Todos os direitos reservados. Conteúdo, curadoria, textos originais, pesquisa, identidade visual e design: Passport Radio™. Obras musicais, fonogramas, imagens e marcas de terceiros permanecem de propriedade de seus respectivos titulares. Passport Radio™ é uma marca independente. Operação comercial e pagamentos: Passport Radio.";
    f.appendChild(d);
  }
  function floatContext() {
    const float = document.querySelector(".passport-support-float");
    if (!float || !("IntersectionObserver" in window)) return;
    const targets = [document.getElementById("apoie"), document.querySelector(".pp-footer")].filter(Boolean);
    if (!targets.length) return;
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      document.body.dataset.float = seen.size > 0 ? "off" : "on";
    }, { threshold: 0.08 });
    targets.forEach((t) => io.observe(t));
  }
  function playerHook() {
    const a = document.getElementById("audio") || document.querySelector(".player audio");
    if (!a) return;
    if (!document.querySelector(".player .pp-vu")) {
      const vu = document.createElement("span"); vu.className = "pp-vu"; vu.setAttribute("aria-hidden", "true");
      vu.innerHTML = "<i></i><i></i><i></i><i></i>";
      const st = document.querySelector(".player .status");
      (st || document.querySelector(".player")).insertAdjacentElement("beforebegin", vu);
    }
    const set = () => { document.body.dataset.playing = a.paused ? "0" : "1"; };
    a.addEventListener("play", set); a.addEventListener("pause", set); a.addEventListener("ended", set); set();
  }
  function boot() { fixHeader(); legalFooter(); floatContext(); playerHook(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();