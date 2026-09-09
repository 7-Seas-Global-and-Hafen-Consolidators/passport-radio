/* PASSPORT SHELL v6 */
(() => {
  "use strict";
  document.querySelectorAll('link[href*="passport-home-v5"],script[src*="passport-home-v5"]').forEach((n) => n.remove());
  function fixHeader() {
    const bar = document.querySelector(".pp-topbar");
    if (bar && document.body.firstElementChild !== bar) {
      const skip = document.querySelector(".pp-skip");
      document.body.insertBefore(bar, skip ? skip.nextSibling : document.body.firstChild);
    }
    const nav = document.querySelector(".pp-nav");
    if (bar && nav && nav.previousElementSibling !== bar) bar.insertAdjacentElement("afterend", nav);
  }
  function legalFooter() {
    const f = document.querySelector(".pp-footer");
    if (!f || f.querySelector(".pp-footer-legal")) return;
    const d = document.createElement("div");
    d.className = "pp-footer-legal";
    d.textContent = "© 2026 Passport Radio™. Todos os direitos reservados.";
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
    const set = () => { document.body.dataset.playing = a.paused ? "0" : "1"; };
    a.addEventListener("play", set); a.addEventListener("pause", set); a.addEventListener("ended", set); set();
  }
  function boot() { fixHeader(); legalFooter(); floatContext(); playerHook(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();

(() => {
  "use strict";
  const CLEAR = ["overflow", "overflowX", "overflowY", "transform", "filter", "willChange", "contain"];
  function fix() {
    const bar = document.querySelector(".pp-topbar");
    const nav = document.querySelector(".pp-nav");
    if (!bar) return;
    if (document.body.firstElementChild !== bar) document.body.insertBefore(bar, document.body.firstElementChild);
    if (nav && bar.nextElementSibling !== nav) bar.insertAdjacentElement("afterend", nav);
    let n = bar.parentElement;
    while (n && n !== document.documentElement) {
      CLEAR.forEach((p) => { if (n.style && n.style[p]) n.style[p] = ""; });
      n = n.parentElement;
    }
    document.documentElement.style.overflowX = "clip";
    document.body.style.overflowX = "clip";
    document.body.style.transform = "";
    document.body.style.filter = "";
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fix, { once: true });
  else fix();
})();
