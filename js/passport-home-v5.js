/* PASSPORT HOME V5 — additive DOM adapter only.
   NÃO escreve #pp-feed. Dono do feed = passport-portal-v3.js.
   O antigo módulo de dossiês foi removido para preservar o writer único.
*/
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const WA_OFFICIAL = "https://wa.me/message/NZS7ZW4QHQVBG1";
  const FOFONETE = {
    fiscal: "/images/grok_1788580858549.jpg",
    fechamento: "/images/grok_1788580833876.jpg",
    bateu: "/images/grok_1788580845386.jpg"
  };

  function onAir() {
    const ticker = $(".pp-ticker");
    if (!ticker || $(".v5-onair")) return;
    const s = document.createElement("section");
    s.className = "v5-onair";
    s.innerHTML =
      '<div class="v5-onair__in">' +
      '<span class="v5-onair__live"><i></i> PASSPORT ON AIR · 24H</span>' +
      '<span class="v5-onair__copy"><strong>Live & Rare™ · Tunnels™ · Continuous Signals™</strong>' +
      "<span>A história continua no ar.</span></span>" +
      '<a class="v5-onair__cta" href="radio.html">OUVIR →</a></div>';
    ticker.insertAdjacentElement("afterend", s);
  }

  function nav() {
    const actions = $(".pp-top-actions");
    if (actions && !actions.querySelector(".v5-support-top")) {
      const a = document.createElement("a");
      a.className = "v5-support-top";
      a.href = "#apoie";
      a.textContent = "APOIAR";
      actions.insertBefore(a, actions.querySelector(".pp-onair-btn"));
    }
    document.querySelectorAll(".pp-nav a").forEach((a) => {
      const t = a.textContent.trim();
      if (t === "LOJA") a.href = "loja.html";
      if (t === "APOIE") a.href = "#apoie";
    });
    // normaliza WhatsApp antigo em qualquer link da página tocado por este adapter
    document.querySelectorAll('a[href*="wa.me/48732099369"]').forEach((a) => {
      a.href = WA_OFFICIAL;
    });
  }

  function left() {
    const col = $(".pp-col-left");
    if (!col) return;
    [...col.querySelectorAll(".pp-box")].forEach((b) => {
      const h = b.querySelector(".pp-box-head")?.textContent.trim();
      if (h === "Destaques da Redação")
        b.querySelector(".pp-box-head").textContent = "EM DESTAQUE";
      if (h === "Clássicos da Casa")
        b.querySelector(".pp-box-head").textContent = "DOSSIÊS / HISTÓRIAS";
      if (h === "Você Perdeu")
        b.querySelector(".pp-box-head").textContent = "VOCÊ PERDEU";
      if (h === "Hubs de Crescimento")
        b.querySelector(".pp-box-head").textContent = "EXPLORE";
    });
    const hasParticipate = [...col.querySelectorAll(".pp-box-head")].some((h) =>
      /PARTICIPE/i.test(h.textContent || "")
    );
    if (!col.querySelector(".v5-send-pitch") && !hasParticipate) {
      const s = document.createElement("section");
      s.className = "pp-box v5-send-pitch";
      s.innerHTML =
        '<h2 class="pp-box-head">PARTICIPE</h2><ul class="pp-mini-list">' +
        '<li><a href="divulgar-bandas.html">ENVIAR PAUTA →</a></li>' +
        '<li><a href="minha-passport.html">MINHA PASSPORT →</a></li></ul>';
      col.appendChild(s);
    }
  }

  function fofoneteSupport(support) {
    if (!support || support.querySelector(".v5-fofonete")) return;
    const existing = [...support.querySelectorAll("a")].find((a) =>
      a.href.includes("asaas.com/c/shpb8gbiswnw4t2n")
    );
    const f = document.createElement("div");
    f.className = "v5-fofonete";
    f.innerHTML =
      '<img class="v5-fofonete__img" src="' +
      FOFONETE.fiscal +
      '" alt="Fofonete da Passport com caderno de contas" loading="lazy">' +
      '<div class="v5-fofonete__body"><b>EU FIZ AS CONTAS DE NOVO.</b>' +
      "<p>A Passport fica no ar com quem lê, ouve, compra e apoia.</p>" +
      '<a class="v5-fofonete__cta" href="https://www.asaas.com/c/shpb8gbiswnw4t2n" target="_blank" rel="noopener">APOIAR A PASSPORT →</a></div>';
    const head = support.querySelector(".pp-box-head");
    head ? head.insertAdjacentElement("afterend", f) : support.prepend(f);
    if (existing) existing.style.display = "none";
  }

  function right() {
    const col = $(".pp-col-right");
    if (!col) return;
    const support = $("#apoie") || [...col.querySelectorAll(".pp-box")].find((b) =>
      /Apoiar/i.test(b.querySelector(".pp-box-head")?.textContent || "")
    );
    if (support) fofoneteSupport(support);

    // WhatsApp oficial no contato da sidebar se existir texto genérico
    col.querySelectorAll("a").forEach((a) => {
      if (/wa\.me\/48732099369/i.test(a.href)) a.href = WA_OFFICIAL;
      if (/whatsapp/i.test(a.textContent) && !a.href.includes("wa.me"))
        a.href = WA_OFFICIAL;
    });
  }

  // Este adapter não toca #pp-feed.

  function boot() {
    onAir();
    nav();
    left();
    right();
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
