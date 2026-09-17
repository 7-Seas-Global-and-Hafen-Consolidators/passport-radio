(() => {
  "use strict";
  const form = document.querySelector("#ad-calculator");
  if (!form) return;
  const format = form.querySelector("#ad-format"), days = form.querySelector("#ad-days"), total = document.querySelector("#ad-total"), summary = document.querySelector("#ad-summary"), contact = document.querySelector("#ad-contact");
  const commercialEmail = "passportradio.online@gmail.com";
  const formats = {top:{name:"Banner topo · 728×90",price:84.5,place:"Circulação"},rectangle:{name:"Retângulo · 300×250",price:64.5,place:"Leitura"},strip:{name:"Strip no rio",price:49.5,place:"Entre matérias"},sponsored:{name:"Publieditorial",price:1399.5,place:"Peça identificada",fixed:true}};
  const money = (value) => new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(value);
  function render() {
    const item = formats[format.value], period = Number(days.value), value = item.fixed ? item.price : item.price * period;
    days.disabled = !!item.fixed; total.textContent = money(value);
    summary.textContent = item.fixed ? `${item.name} · valor por peça identificada.` : `${item.name} em ${item.place.toLowerCase()} por ${period} ${period === 1 ? "dia" : "dias"}.`;
    const subject = `Anuncie Passport Radio — ${item.name}`;
    const body = `Olá, Passport Radio.\r\n\r\nQuero anunciar:\r\nFormato: ${item.name}\r\nPosição: ${item.place}\r\nPeríodo: ${item.fixed ? "peça identificada" : `${period} dia(s)`}\r\nOrçamento estimado: ${money(value)}\r\n\r\nObjetivo da campanha:\r\nMateriais/arte:\r\nContato:`;
    contact.href = `mailto:${commercialEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.dataLayer = window.dataLayer || []; window.dataLayer.push({event:"commercial_quote_updated",format:format.value,days:period,value});
  }
  format.addEventListener("change", render); days.addEventListener("change", render); render();
})();
