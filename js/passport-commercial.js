(() => {
  "use strict";

  const PIX_KEY = "passportradio.online@gmail.com";
  const COMMERCIAL_EMAIL = "passportradio.online@gmail.com";
  const FREE_TEST_DAYS = 5;
  const FREE_FORMATS = ["top", "rectangle", "strip"];
  const PERIOD_DISCOUNT_PCT = [0,0,0,0,0,0,3.41,3.92,4.42,4.91,5.38,5.84,6.28,6.72,7.14,7.55,7.95,8.33,8.71,9.07,9.43,9.78,10.11,10.44,10.75,11.06,11.36,11.65,11.94,12.21,12.48,12.74,12.99,13.24,13.48,13.71,13.94,14.15,14.37,14.57,14.78,14.97,15.16,15.35,15.53,15.7,15.87,16.04,16.2,16.35,16.5,16.65,16.8,16.93,17.07,17.2,17.33,17.45,17.57,17.69,17.81,17.92,18.02,18.13,18.23,18.33,18.43,18.52,18.61,18.7,18.79,18.87,18.95,19.03,19.11,19.18,19.25,19.32,19.39,19.46,19.52,19.59,19.65,19.71,19.76,19.82,19.87,19.93,19.98,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20];
  const FORMATS = {
    top: { name: "Banner topo · 728×90", price: 84.5, place: "Circulação", fixed: false },
    rectangle: { name: "Retângulo · 300×250", price: 64.5, place: "Leitura", fixed: false },
    strip: { name: "Strip no rio", price: 49.5, place: "Entre matérias", fixed: false },
    sponsored: { name: "Publieditorial", price: 1399.5, place: "Peça identificada", fixed: true }
  };
  const ADVERTISERS = {
    none: { extraPct: 0, label: "Anunciante sem desconto extra" },
    banda: { extraPct: 10, label: "Banda nacional (desconto extra 10%)" },
    antigo: { extraPct: 10, label: "Anunciante constante (desconto extra 10%)" }
  };

  const round2 = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  const money = (value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(round2(value));
  const periodPctFor = (days) => {
    const index = Number(days) - 1;
    if (!Number.isInteger(index) || index < 0 || index >= PERIOD_DISCOUNT_PCT.length) return 0;
    return PERIOD_DISCOUNT_PCT[index];
  };

  function quote(formatKey, days, advertiserKey) {
    const item = FORMATS[formatKey] || FORMATS.top;
    const advertiser = ADVERTISERS[advertiserKey] || ADVERTISERS.none;
    const period = item.fixed ? 1 : Math.max(1, Math.min(160, Number(days) || 1));
    const periodPct = item.fixed ? 0 : periodPctFor(period);
    const freeEligible = !item.fixed && FREE_FORMATS.includes(formatKey) && period === FREE_TEST_DAYS;
    const extraPct = freeEligible ? 0 : advertiser.extraPct;
    const normal = round2(item.fixed ? item.price : item.price * period);
    const periodDiscount = round2(normal * (periodPct / 100));
    const afterPeriod = round2(normal - periodDiscount);
    const extraDiscount = round2(afterPeriod * (extraPct / 100));
    const afterExtra = round2(afterPeriod - extraDiscount);
    const freeDiscount = freeEligible ? afterExtra : 0;
    const total = freeEligible ? 0 : afterExtra;
    return {
      formatKey,
      name: item.name,
      place: item.place,
      fixed: !!item.fixed,
      daily: item.price,
      days: period,
      periodPct,
      extraPct,
      advertiser: advertiser.label,
      freeEligible,
      freeTestDays: FREE_TEST_DAYS,
      normal,
      periodDiscount,
      extraDiscount,
      freeDiscount,
      economia: round2(normal - total),
      total
    };
  }

  function setLine(id, text, value) {
    const node = document.getElementById(id);
    if (!node) return;
    node.textContent = text;
    if (value !== undefined) node.dataset.value = String(value);
  }

  function bind() {
    const form = document.querySelector("#ad-calculator");
    if (!form) return;
    const format = form.querySelector("#ad-format");
    const days = form.querySelector("#ad-days");
    const advertiser = form.querySelector("#ad-advertiser");
    const contact = document.querySelector("#ad-contact");
    const freeRow = document.querySelector("[data-quote-free]");
    if (days && !days.options.length) {
      PERIOD_DISCOUNT_PCT.forEach((pct, index) => {
        const n = index + 1;
        const option = document.createElement("option");
        option.value = String(n);
        option.textContent = n === 1
          ? `1 dia (desconto período ${pct}%)`
          : `${n} dias (desconto período ${pct}%)`;
        if (n === FREE_TEST_DAYS) option.textContent += " · teste grátis nos banners";
        days.appendChild(option);
      });
      days.value = "1";
    }

    function render() {
      const q = quote(format.value, days.value, advertiser ? advertiser.value : "none");
      days.disabled = q.fixed;
      if (advertiser) advertiser.disabled = false;
      if (freeRow) freeRow.hidden = !q.freeEligible;
      setLine("ad-line-format", q.name);
      setLine("ad-line-period", q.fixed ? "Peça identificada (sem diária)" : `${q.days} ${q.days === 1 ? "dia" : "dias"}`);
      setLine("ad-line-normal", money(q.normal), q.normal.toFixed(2));
      setLine("ad-line-period-discount", q.fixed ? "Não se aplica" : `${money(q.periodDiscount)} (${String(q.periodPct).replace(".", ",")}%)`, q.periodDiscount.toFixed(2));
      setLine("ad-line-extra", q.freeEligible ? "Não se aplica no teste grátis" : `${money(q.extraDiscount)} (${q.extraPct}%)`, q.extraDiscount.toFixed(2));
      setLine("ad-line-free", q.freeEligible ? `${money(q.freeDiscount)} (100%)` : money(0), q.freeDiscount.toFixed(2));
      setLine("ad-line-save", money(q.economia), q.economia.toFixed(2));
      const total = document.getElementById("ad-total");
      if (total) {
        total.textContent = money(q.total);
        total.dataset.value = q.total.toFixed(2);
      }
      const summary = document.getElementById("ad-summary");
      if (summary) {
        summary.textContent = q.freeEligible
          ? `${q.name} · teste de ${q.freeTestDays} dias grátis · total ${money(0)}.`
          : q.fixed
            ? `${q.name} · valor por peça identificada${q.extraPct ? ` · extra ${q.extraPct}%` : ""}.`
            : `${q.name} em ${q.place.toLowerCase()} por ${q.days} ${q.days === 1 ? "dia" : "dias"}.`;
      }
      if (contact) {
        const subject = `Anuncie Passport Radio — ${q.name}`;
        const body = [
          "Olá, Passport Radio.",
          "",
          "Quero anunciar:",
          `Formato: ${q.name}`,
          `Posição: ${q.place}`,
          `Período: ${q.fixed ? "peça identificada" : `${q.days} dia(s)`}`,
          `Valor normal: ${money(q.normal)}`,
          `Desconto período: ${money(q.periodDiscount)} (${q.periodPct}%)`,
          `Desconto extra: ${money(q.extraDiscount)} (${q.extraPct}%)`,
          q.freeEligible ? `Teste ${q.freeTestDays} dias grátis: ${money(q.freeDiscount)}` : "",
          `Economia: ${money(q.economia)}`,
          `Total: ${money(q.total)}`,
          "",
          "Objetivo da campanha:",
          "Materiais/arte:",
          "Contato:"
        ].filter((line, index, arr) => line !== "" || arr[index - 1] !== "").join("\r\n");
        contact.href = `mailto:${COMMERCIAL_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "commercial_quote_updated", format: q.formatKey, days: q.days, extraPct: q.extraPct, value: q.total, free: q.freeEligible });
    }

    format.addEventListener("change", render);
    days.addEventListener("change", render);
    if (advertiser) advertiser.addEventListener("change", render);
    render();
  }

  const api = {
    PIX_KEY,
    COMMERCIAL_EMAIL,
    FREE_TEST_DAYS,
    FREE_FORMATS,
    PERIOD_DISCOUNT_PCT,
    FORMATS,
    ADVERTISERS,
    quote,
    money
  };
  const root = typeof window !== "undefined" ? window : globalThis;
  root.PassportCommercial = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
    else bind();
  }
})();
