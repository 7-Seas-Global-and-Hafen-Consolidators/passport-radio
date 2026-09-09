/* PASSPORT SHELL — só esconde/mostra. Zero innerHTML na Home. */
(() => {
  "use strict";
  const VIEWS = ["home", "loja", "agenda", "promocoes", "anuncie"];
  function box(key) { return document.getElementById("pp-view-" + key); }
  function show(key) {
    VIEWS.forEach((k) => {
      const el = box(k);
      if (!el) return;
      const on = k === key;
      el.classList.toggle("pp-view-off", !on);
      el.hidden = !on;
    });
    document.querySelectorAll("[data-pp-route]").forEach((a) => {
      a.setAttribute("aria-current", a.dataset.ppRoute === key ? "page" : "false");
    });
    document.body.dataset.ppRoute = key;
    if (key === "loja" && !document.querySelector('script[src*="passport-store-v6"]')) {
      const s = document.createElement("script");
      s.src = "/js/passport-store-v6.js?v=20260909shell";
      s.defer = true;
      document.head.appendChild(s);
    }
    if (key === "agenda") fillAgenda();
    window.scrollTo(0, 0);
  }
  function fillAgenda() {
    const g = document.getElementById("pp-grade");
    const bus = window.PassportBarBus;
    if (g && bus) {
      g.innerHTML = bus.list().filter((s) => s.enabled !== false)
        .map((s) => "<li><b>" + s.label + "</b> · " + (s.now || "no ar") + "</li>").join("");
    }
    const boxEl = document.getElementById("pp-agenda-ev");
    if (!boxEl || boxEl.dataset.loaded) return;
    fetch("/data/promocoes.json", { cache: "no-store" }).then((r) => r.ok ? r.json() : null).then((d) => {
      if (!d || !boxEl) return;
      boxEl.dataset.loaded = "1";
      const ev = (d.campaigns || []).filter((c) => c.close_at || c.result_at).slice(0, 6);
      boxEl.innerHTML = ev.length ? ev.map((c) => {
        const dt = new Date(c.close_at || c.result_at);
        return "<div class=\"pp-ev\"><div class=\"d\"><b>" + String(dt.getDate()).padStart(2, "0") +
          "</b></div><div><strong>" + (c.title || "") + "</strong><div class=\"pp-note\">" +
          (c.prize || "") + "</div></div></div>";
      }).join("") : "<p class=\"pp-note\">Sem campanhas com data agora.</p>";
    }).catch(() => {});
  }
  function boot() {
    document.addEventListener("click", (e) => {
      const a = e.target.closest("[data-pp-route]");
      if (!a) return;
      e.preventDefault();
      const key = a.dataset.ppRoute;
      show(key);
      try { history.pushState({ view: key }, "", key === "home" ? "/" : "/" + key); } catch (_) {}
    });
    window.addEventListener("popstate", (e) => {
      show((e.state && e.state.view) || "home");
    });
    const q = new URLSearchParams(location.search).get("view");
    if (q && VIEWS.indexOf(q) !== -1) show(q);
    else show("home");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
