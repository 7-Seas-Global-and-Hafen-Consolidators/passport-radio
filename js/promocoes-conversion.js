/* PASSPORT RADIO · PROMOÇÕES ENGAGEMENT LAYER
   Adds campaign urgency/share/CTA without changing form submission or radio engines.
*/
(() => {
  "use strict";

  const deadline = new Date("2026-08-31T23:59:59-03:00");
  const now = new Date();
  const diffDays = Math.max(0, Math.ceil((deadline - now) / 86400000));
  const urgency = diffDays > 1 ? `FALTAM ${diffDays} DIAS` : diffDays === 1 ? "ÚLTIMO DIA AMANHÃ" : "ÚLTIMO DIA";

  const hero = document.querySelector(".promo-hero");
  if (hero && !document.querySelector(".promo-conversion-strip")) {
    const strip = document.createElement("section");
    strip.className = "promo-conversion-strip";
    strip.innerHTML = `
      <div class="promo-conversion-strip__inner">
        <div class="promo-conversion-strip__copy">
          <span class="promo-conversion-strip__flag">${urgency}</span>
          <div class="promo-conversion-strip__text">
            <strong>OUÇA A PASSPORT. CONCORRA AO FONE BLUETOOTH 5.4.</strong>
            <span>Inscrição aberta até 31/08/2026 · participação em poucos passos.</span>
          </div>
        </div>
        <a class="promo-conversion-strip__cta" href="promocao-fone-bluetooth.html">QUERO CONCORRER →</a>
      </div>`;
    hero.insertAdjacentElement("afterend", strip);
  }

  const detailGrid = document.querySelector(".campaign-detail__grid");
  if (detailGrid && !document.querySelector(".promo-punch")) {
    const punch = document.createElement("section");
    punch.className = "promo-punch";
    punch.innerHTML = `
      <small>${urgency} · INSCRIÇÕES ABERTAS</small>
      <strong>VOCÊ OUVE. VOCÊ PARTICIPA. VOCÊ PODE LEVAR.</strong>
      <p>Escute a Passport, publique seu print no Story, marque @passportradio.online e finalize sua inscrição.</p>`;
    detailGrid.insertAdjacentElement("beforebegin", punch);
  }

  const form = document.querySelector("#promo-entry-form");
  if (form && !document.querySelector(".promo-share-row")) {
    const row = document.createElement("div");
    row.className = "promo-share-row";
    const share = document.createElement("button");
    share.type = "button";
    share.className = "promo-share-button";
    share.textContent = "COMPARTILHAR PROMOÇÃO";
    share.addEventListener("click", async () => {
      const shareData = {
        title: "Ganhe um Fone Bluetooth 5.4 | Passport Radio",
        text: "Promoção Passport Radio: ouça, participe e concorra a um Fone Bluetooth 5.4.",
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          share.textContent = "LINK COPIADO";
          setTimeout(() => { share.textContent = "COMPARTILHAR PROMOÇÃO"; }, 1800);
        }
      } catch (_) {}
    });
    row.appendChild(share);
    form.insertAdjacentElement("afterend", row);
  }

  if (form && !document.querySelector(".promo-mobile-dock")) {
    const dock = document.createElement("div");
    dock.className = "promo-mobile-dock";
    dock.setAttribute("aria-label", "Ações da promoção");
    dock.innerHTML = `
      <a href="radio.html">OUVIR PRIMEIRO</a>
      <a href="#promo-entry-form">PARTICIPAR AGORA</a>`;
    document.body.appendChild(dock);
  }
})();
