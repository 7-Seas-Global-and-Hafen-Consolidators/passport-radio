/* PASSPORT RADIO · habitat da casa nos 14 sinais.
   Motor intocado. Chrome só em página inteira. Iframe = carcaça da Home. */
(() => {
  "use strict";
  let framed = false;
  try { framed = window.self !== window.top; } catch (_) { framed = true; }
  const root = document.documentElement;
  root.classList.add(framed ? "pp-signal-frame" : "pp-signal-standalone");

  const SUPPORT = "https://www.asaas.com/c/shpb8gbiswnw4t2n";
  const YT_SIGNALS = { novelas: 1, globo: 1, "live-rare": 1, brrock: 1 };

  function markWorld() {
    if (document.body && document.body.classList.contains("wd-body")) {
      root.classList.add("pp-world-dial");
    }
  }

  function injectChrome() {
    if (framed) return;
    if (document.querySelector("[data-pp-signal-chrome]")) return;
    const header = document.createElement("header");
    header.className = "pp-signal-chrome";
    header.setAttribute("data-pp-signal-chrome", "1");
    header.setAttribute("role", "banner");
    header.innerHTML =
      '<a class="pp-signal-brand" href="/" target="_top">' +
      '<img src="/images/passport-radio-definitive.jpg" alt="Passport Radio" width="36" height="36">' +
      "<span><b>PASSPORT RADIO</b><small>Every Song Is A Destination</small></span></a>" +
      '<nav class="pp-signal-nav" aria-label="Portas da Passport">' +
      '<a href="/" target="_top">Home</a>' +
      '<a href="/noticias.html" target="_top">Notícias</a>' +
      '<a href="/editorial.html" target="_top">Arquivo</a>' +
      '<a href="/radio.html" target="_top">Ouvir</a>' +
      '<a href="/loja.html" target="_top">Loja</a>' +
      '<a href="/promocoes.html" target="_top">Promoções</a>' +
      '<a href="/anuncie.html" target="_top">Anuncie</a>' +
      '<a href="' + SUPPORT + '" target="_blank" rel="noopener">Ajude</a>' +
      "</nav>";
    document.body.insertBefore(header, document.body.firstChild);
    if (!document.querySelector("[data-pp-signal-foot]")) {
      const foot = document.createElement("footer");
      foot.className = "pp-signal-foot";
      foot.setAttribute("data-pp-signal-foot", "1");
      foot.innerHTML =
        '<a href="/" target="_top">Home</a> · <a href="/radio.html" target="_top">Ouvir</a> · ' +
        '<a href="/loja.html" target="_top">Loja</a> · <a href="' + SUPPORT + '" target="_blank" rel="noopener">Ajude</a>' +
        "<p>Passport Radio™ · Every Song Is A Destination.</p>";
      document.body.appendChild(foot);
    }
  }

  function frameNote() {
    if (!framed || !document.body) return;
    const sig = document.body.getAttribute("data-signal") || "";
    if (!YT_SIGNALS[sig]) return;
    if (document.querySelector("[data-pp-signal-frame-note]")) return;
    const p = document.createElement("p");
    p.className = "pp-signal-frame-note";
    p.setAttribute("data-pp-signal-frame-note", "1");
    p.textContent = "Se o navegador bloquear este quadro, use «Abrir em outra página». O motor de áudio não muda.";
    document.body.insertBefore(p, document.body.firstChild);
  }

  function revealNovelas() {
    if (!document.body || document.body.getAttribute("data-signal") !== "novelas") return;
    const panel = document.getElementById("passportNovelas");
    if (panel) {
      panel.hidden = false;
      panel.removeAttribute("hidden");
      panel.removeAttribute("aria-hidden");
    }
  }

  function loadFofonete() {
    if (framed) return;
    if ([...document.styleSheets].some(() => false)) { /* keep lint quiet */ }
    if (![...document.querySelectorAll("link[rel=stylesheet]")].some((l) => (l.href || "").includes("fofonete-exit-intent.css"))) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = "/css/fofonete-exit-intent.css?v=20260909g";
      document.head.appendChild(l);
    }
    if (![...document.scripts].some((s) => (s.src || "").includes("fofonete-exit-intent.js"))) {
      const s = document.createElement("script");
      s.src = "/js/fofonete-exit-intent.js?v=20260912p";
      s.defer = true;
      document.head.appendChild(s);
    }
  }

  function boot() {
    markWorld();
    injectChrome();
    frameNote();
    revealNovelas();
    loadFofonete();
    if (document.body && document.body.getAttribute("data-signal") === "novelas") {
      new MutationObserver(revealNovelas).observe(document.body, { childList: true, subtree: true });
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
