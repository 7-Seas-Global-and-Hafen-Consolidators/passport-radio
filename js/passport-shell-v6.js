/* PASSPORT SHELL v6.2-rescue */
(() => {
  "use strict";
  const CLEAR = ["overflow", "overflowX", "overflowY", "transform", "filter", "willChange", "contain"];
  function liftShell() {
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
    document.body.style.willChange = "";
  }
  function floatContext() {
    const float = document.querySelector(".passport-support-float");
    if (!float || !("IntersectionObserver" in window)) return;
    const targets = [document.getElementById("apoie"), document.querySelector(".pp-footer"), document.querySelector(".player")].filter(Boolean);
    if (!targets.length) return;
    let vis = 0;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) vis++; else vis = Math.max(0, vis - 1); });
      document.body.dataset.float = vis > 0 ? "off" : "on";
    }, { threshold: 0.08 });
    targets.forEach((t) => io.observe(t));
  }
  function playerHook() {
    const a = document.getElementById("audio") || document.querySelector(".player audio");
    if (!a) return;
    if (!document.querySelector(".player .pp-vu")) {
      const vu = document.createElement("span");
      vu.className = "pp-vu"; vu.setAttribute("aria-hidden", "true");
      vu.innerHTML = "<i></i><i></i><i></i><i></i>";
      const st = document.querySelector(".player .status");
      if (st) st.insertAdjacentElement("beforebegin", vu);
    }
    const set = () => { document.body.dataset.playing = a.paused ? "0" : "1"; };
    a.addEventListener("play", set); a.addEventListener("pause", set); a.addEventListener("ended", set); set();
  }
  function boot() { liftShell(); floatContext(); playerHook(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
