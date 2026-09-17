(() => {
  "use strict";
  const STORAGE_KEY = "passportPromoEntriesV2";
  const form = document.querySelector("#promo-entry-form");
  const codeField = document.querySelector("#participation-code");
  const confirmation = document.querySelector("#promo-confirmation");
  const entriesList = document.querySelector("#my-entries-list");
  const tabButtons = [...document.querySelectorAll("[data-listener-tab]")];
  const panels = {
    events: document.querySelector("#listener-events-panel"),
    results: document.querySelector("#listener-results-panel"),
    entries: document.querySelector("#listener-entries-panel")
  };

  const getEntries = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  };
  const saveEntries = (entries) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); } catch (_) {}
  };
  const escapeHtml = (value) => String(value || "").replace(/[&<>"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;"
  })[char]);
  const generateCode = (prefix = "PR-UCI") => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return `${prefix}-${Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
  };

  function renderEntries() {
    if (!entriesList) return;
    const entries = getEntries();
    entriesList.innerHTML = entries.length
      ? entries.map((entry) => `<article class="entry-card"><div class="entry-card__top"><span>${escapeHtml(entry.campaign_name)}</span><b>CONFIRMADA</b></div><div class="entry-card__code">${escapeHtml(entry.code)}</div><div class="entry-card__details"><span><small>Prêmio</small>${escapeHtml(entry.prize)}</span><span><small>Inscrição</small>${escapeHtml(entry.date)}</span><span><small>Status</small>${escapeHtml(entry.status)}</span><span><small>Resultado</small>${escapeHtml(entry.result_date)}</span></div></article>`).join("")
      : "<div class=\"account-empty\"><strong>Nenhuma inscrição salva ainda.</strong><span>Inscrições confirmadas neste navegador aparecerão aqui.</span></div>";
  }

  function selectTab(tab) {
    if (!panels[tab]) tab = "events";
    Object.entries(panels).forEach(([name, panel]) => {
      if (!panel) return;
      const active = name === tab;
      panel.hidden = !active;
      panel.classList.toggle("is-active", active);
    });
    tabButtons.forEach((button) => {
      const active = button.dataset.listenerTab === tab;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", String(active));
    });
    if (tab === "entries") renderEntries();
  }

  tabButtons.forEach((button) => button.addEventListener("click", () => selectTab(button.dataset.listenerTab)));
  const requestedTab = new URLSearchParams(location.search).get("tab");
  if (requestedTab) selectTab(requestedTab);

  function shareCampaign(code = "") {
    const url = location.href;
    const text = `Participe da promoção UCI da Passport Radio${code ? ` · meu código: ${code}` : ""}: ${url}`;
    if (navigator.share) return navigator.share({ title: "Promoção UCI · Passport Radio", text, url });
    if (navigator.clipboard) return navigator.clipboard.writeText(text);
    return Promise.resolve();
  }

  document.querySelectorAll("[data-share-campaign]").forEach((button) => button.addEventListener("click", () => {
    shareCampaign().then(() => {
      button.textContent = "LINK COPIADO";
      setTimeout(() => { button.textContent = "COMPARTILHAR PROMOÇÃO"; }, 1800);
    }).catch(() => {});
  }));

  if (form) form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const code = generateCode(form.dataset.codePrefix || "PR-UCI");
    const now = new Date();
    const data = new FormData(form);
    codeField.value = code;
    data.set("participant_code", code);
    data.set("submitted_at", now.toISOString());
    submit.disabled = true;
    submit.textContent = "REGISTRANDO...";
    confirmation.hidden = true;
    try {
      const response = await fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`formspree ${response.status}`);
      const entry = {
        campaign_id: data.get("campaign_id"), campaign_name: data.get("campaign_name"), prize: data.get("prize"), code,
        date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(now),
        status: "Aguardando resultado", result_date: data.get("result_date")
      };
      saveEntries([entry, ...getEntries()].slice(0, 50));
      confirmation.innerHTML = `<span>INSCRIÇÃO CONFIRMADA</span><strong>Código: ${escapeHtml(code)}</strong><p>Guarde este código. Resultado em <strong>${escapeHtml(entry.result_date)}</strong>.</p><div class="confirmation-actions"><button type="button" data-share-confirmation>COMPARTILHAR E INDICAR</button><a href="promocoes.html?tab=entries#area-ouvinte">VER MINHAS INSCRIÇÕES</a></div>`;
      confirmation.hidden = false;
      form.reset();
      codeField.value = "";
      confirmation.querySelector("[data-share-confirmation]")?.addEventListener("click", () => shareCampaign(code));
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "promo_registration_success", campaign_id: entry.campaign_id, code });
    } catch (_) {
      confirmation.innerHTML = "<span>ERRO NO ENVIO</span><strong>A inscrição não foi enviada.</strong><p>Tente novamente em alguns instantes.</p>";
      confirmation.hidden = false;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "promo_registration_failure", campaign_id: data.get("campaign_id") });
    } finally {
      submit.disabled = false;
      submit.textContent = "PARTICIPAR E GERAR CÓDIGO";
    }
  });

  renderEntries();
})();
