(() => {
  "use strict";
  const ENTRY_KEY = "passportPromoEntriesV3";
  const ENT = {"&": "\u0026amp;", "<": "\u0026lt;", ">": "\u0026gt;", '"': "\u0026quot;"};
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"]/g, (char) => ENT[char]);
  const isDateOnly = (value) => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  const formatDate = (value) => {
    if (!value) return "a confirmar";
    const dateOnly = isDateOnly(value);
    const instant = dateOnly ? `${value}T12:00:00-03:00` : value;
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: dateOnly ? undefined : "short",
      timeZone: "America/Sao_Paulo"
    }).format(new Date(instant));
  };
  const getEntries = () => { try { return JSON.parse(localStorage.getItem(ENTRY_KEY) || "[]"); } catch (_) { return []; } };
  const saveEntries = (entries) => { try { localStorage.setItem(ENTRY_KEY, JSON.stringify(entries)); } catch (_) {} };
  const statusFor = (campaign, nowMs) => {
    if (campaign.winner) return "RESULTADO PUBLICADO";
    if (!campaign.open_at || !campaign.close_at) return "EM BREVE";
    const now = nowMs == null ? Date.now() : nowMs;
    const open = Date.parse(campaign.open_at);
    const close = Date.parse(campaign.close_at);
    const draw = campaign.draw_at ? Date.parse(campaign.draw_at) : NaN;
    const result = campaign.result_at ? Date.parse(campaign.result_at) : NaN;
    if (now < open) return "EM BREVE";
    if (now <= close) return "ATIVA";
    if (!Number.isNaN(draw) && now < draw) return "INSCRIÇÕES ENCERRADAS";
    if (!Number.isNaN(result) && now < result) return "AGUARDANDO SORTEIO";
    return "AGUARDANDO RESULTADO";
  };
  const registrationOpen = (campaign, nowMs) => {
    if (campaign.winner) return false;
    if (!campaign.open_at || !campaign.close_at) return false;
    const now = nowMs == null ? Date.now() : nowMs;
    return now >= Date.parse(campaign.open_at) && now <= Date.parse(campaign.close_at);
  };
  const datesFor = (campaign) => [
    campaign.open_at ? `Abertura: ${formatDate(campaign.open_at)}` : "",
    campaign.close_at ? `Encerramento: ${formatDate(campaign.close_at)}` : "",
    campaign.draw_at ? `Sorteio: ${formatDate(campaign.draw_at)}` : "",
    campaign.result_at ? `Resultado: ${formatDate(campaign.result_at)}` : "",
    campaign.premiere_at ? `Exibição UCI: ${formatDate(campaign.premiere_at)}` : ""
  ].filter(Boolean);
  const generateCode = (prefix) => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return `${prefix}-${Array.from({length:6}, () => chars[Math.floor(Math.random() * chars.length)]).join("")}`;
  };
  const officialChannels = (campaign, config) => {
    const requirements = campaign.requirements || {};
    if (!requirements.whatsapp && !requirements.telegram) return "";
    const links = [];
    if (requirements.whatsapp && config.official_whatsapp) links.push(`<a href="${escapeHtml(config.official_whatsapp)}" target="_blank" rel="noopener">WhatsApp oficial</a>`);
    if (requirements.telegram && config.official_telegram) links.push(`<a href="${escapeHtml(config.official_telegram)}" target="_blank" rel="noopener">Telegram oficial</a>`);
    if (!links.length) return "";
    return `<p class="promo-official-channels">Canais oficiais desta campanha. A declaração de cumprimento não é verificação automática de follow. ${links.join(" ")}</p>`;
  };
  function share(campaign, referralCode = "") {
    const url = new URL(campaign.detail_url || location.pathname, location.origin);
    if (referralCode) url.searchParams.set("ref", referralCode);
    const text = `${campaign.share_text || campaign.title} · ${url}`;
    if (navigator.share) return navigator.share({title:campaign.title, text, url: url.toString()});
    return navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.resolve();
  }
  function campaignCard(campaign) {
    const open = registrationOpen(campaign);
    return `<article class="promo-campaign-card">
      <a class="promo-campaign-card__media" href="${escapeHtml(campaign.detail_url || "promocoes.html")}"><img src="${escapeHtml(campaign.prize_image || "/images/passport-radio-definitive.jpg")}" alt="${escapeHtml(campaign.prize_alt || campaign.prize)}"></a>
      <div class="promo-campaign-card__body"><span class="promo-status">${statusFor(campaign)} · ${escapeHtml(campaign.id)}</span><p class="promo-campaign-card__type">${escapeHtml(campaign.type)}</p>
      <h2>${escapeHtml(campaign.title)}</h2><p>Prêmio: <strong>${escapeHtml(campaign.prize)}</strong>.</p>
      <div class="promo-campaign-card__facts">${datesFor(campaign).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>
      <a class="promo-action" href="${escapeHtml(campaign.detail_url || "promocoes.html")}">${open ? "VER PROMOÇÃO E PARTICIPAR →" : "VER CAMPANHA →"}</a></div></article>`;
  }
  function renderEntries() {
    const host = document.querySelector("#my-entries-list");
    if (!host) return;
    const entries = getEntries();
    host.innerHTML = entries.length ? entries.map((entry) => `<article class="entry-card"><div class="entry-card__top"><span>${escapeHtml(entry.campaign)}</span><b>RECEBIDA</b></div><div class="entry-card__code">${escapeHtml(entry.code)}</div><div class="entry-card__details"><span><small>Participante</small>${escapeHtml(entry.name)}</span><span><small>Inscrição</small>${escapeHtml(entry.date)}</span><span><small>Status</small>${escapeHtml(entry.status)}</span></div></article>`).join("") : "<div class=\"account-empty\"><strong>Nenhuma inscrição salva ainda.</strong><span>Inscrições recebidas neste navegador aparecem aqui. Recebida não significa apta ao sorteio.</span></div>";
  }
  function bindTabs() {
    const buttons = [...document.querySelectorAll("[data-listener-tab]")];
    const panels = {events:document.querySelector("#listener-events-panel"), results:document.querySelector("#listener-results-panel"), entries:document.querySelector("#listener-entries-panel")};
    const select = (tab) => {
      Object.entries(panels).forEach(([name, panel]) => { if (panel) { const active = name === tab; panel.hidden = !active; panel.classList.toggle("is-active", active); } });
      buttons.forEach((button) => { const active = button.dataset.listenerTab === tab; button.classList.toggle("is-active", active); button.setAttribute("aria-selected", String(active)); });
      if (tab === "entries") renderEntries();
    };
    buttons.forEach((button) => button.addEventListener("click", () => select(button.dataset.listenerTab)));
    select(new URLSearchParams(location.search).get("tab") || "events");
  }
  function campaignForm(campaign, endpoint, config) {
    const requirements = campaign.requirements || {};
    const social = (requirements.whatsapp ? '<label class="rules"><input required type="checkbox" name="whatsapp_opt_in" value="true">Declaro que acompanho o canal oficial de WhatsApp desta campanha.</label>' : "") + (requirements.telegram ? '<label class="rules"><input required type="checkbox" name="telegram_opt_in" value="true">Declaro que acompanho o canal oficial de Telegram desta campanha.</label>' : "");
    const referral = requirements.referral ? `<label>Código de indicação (se houver)<input name="referral_input" placeholder="${escapeHtml(campaign.campaign_code_prefix)}-XXXXXX"></label>${requirements.minimum_referrals ? `<p class="form-note">Mínimo informado no regulamento: ${requirements.minimum_referrals} indicações. Sem apuração automática de amigos.</p>` : `<p class="form-note">A indicação é requisito. A quantidade mínima ainda não foi definida; o formulário não exige um número inventado de amigos. Se a URL trouxer ?ref=, o código é capturado.</p>`}` : "";
    return `<form id="promo-entry-form" class="pr-promo-form passport-form" action="${escapeHtml(endpoint)}" method="post">
      <input type="hidden" name="_subject" value="Inscrição ${escapeHtml(campaign.title)} — Passport Radio"><input type="hidden" name="campaign_id" value="${escapeHtml(campaign.id)}"><input type="hidden" name="campaign_name" value="${escapeHtml(campaign.title)}"><input type="hidden" name="prize" value="${escapeHtml(campaign.prize)}"><input type="hidden" name="result_date" value="${escapeHtml(formatDate(campaign.result_at))}"><input type="hidden" name="participant_code"><input type="hidden" name="referral_code"><input type="hidden" name="whatsapp_declared" value="false"><input type="hidden" name="telegram_declared" value="false">
      <label>Nome completo<input required name="name" autocomplete="name"></label><label>E-mail<input required type="email" name="email" autocomplete="email"></label><label>Instagram (opcional)<input name="instagram"></label>
      ${campaign.question ? `<label>${escapeHtml(campaign.question)}<textarea required name="creative_answer" rows="4"></textarea></label>` : ""}${officialChannels(campaign, config)}${social}${referral}
      <label class="rules"><input required type="checkbox" name="rules" value="accepted">Li e aceito o regulamento e autorizo contato sobre esta inscrição. Participar não me torna automaticamente apto ao sorteio.</label><button type="submit" class="passport-btn-red">PARTICIPAR E GERAR CÓDIGO</button></form>`;
  }
  function bindForm(campaign, config) {
    const form = document.querySelector("#promo-entry-form");
    if (!form) return;
    const capturedRef = new URLSearchParams(location.search).get("ref") || "";
    form.elements.referral_code.value = capturedRef;
    if (capturedRef && form.elements.referral_input && !form.elements.referral_input.value) form.elements.referral_input.value = capturedRef;
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submit = form.querySelector("button[type=submit]"), confirmation = document.querySelector("#promo-confirmation"), data = new FormData(form), participantCode = generateCode(campaign.campaign_code_prefix);
      if (submit.disabled) return;
      const typedRef = String(data.get("referral_input") || "").trim();
      data.set("participant_code", participantCode);
      data.set("submitted_at", new Date().toISOString());
      data.set("referral_code", typedRef || capturedRef);
      data.set("whatsapp_declared", String(!!data.get("whatsapp_opt_in")));
      data.set("telegram_declared", String(!!data.get("telegram_opt_in")));
      submit.disabled = true; submit.textContent = "REGISTRANDO...";
      try {
        const response = await fetch(form.action, {method:"POST", body:data, headers:{Accept:"application/json"}});
        if (!response.ok) throw new Error(String(response.status));
        const entry = {campaign:campaign.title, code:participantCode, name:data.get("name"), date:new Intl.DateTimeFormat("pt-BR", {dateStyle:"medium", timeStyle:"short"}).format(new Date()), status:"Inscrição recebida · aguardando resultado"};
        saveEntries([entry, ...getEntries()].slice(0,50));
        confirmation.innerHTML = `<span>INSCRIÇÃO RECEBIDA</span><strong>Código: ${escapeHtml(participantCode)}</strong><p>Participar não significa aptidão automática ao sorteio. Guarde o código e acompanhe o resultado nesta página.</p><div class="confirmation-actions"><button type="button">COMPARTILHAR E INDICAR</button><a href="promocoes.html?tab=entries#area-ouvinte">MINHAS INSCRIÇÕES</a></div>`;
        confirmation.hidden = false; confirmation.querySelector("button").onclick = () => share(campaign, participantCode); form.reset(); form.elements.referral_code.value = capturedRef; submit.textContent = "INSCRIÇÃO ENVIADA"; window.dataLayer?.push({event:"promo_registration_success", campaign_id:campaign.id});
      } catch (_) {
        confirmation.innerHTML = "<span>ERRO NO ENVIO</span><strong>A inscrição não foi enviada.</strong><p>Nada foi gravado como inscrição recebida. Tente novamente em alguns instantes.</p>"; confirmation.hidden = false; submit.disabled = false; submit.textContent = "PARTICIPAR E GERAR CÓDIGO"; window.dataLayer?.push({event:"promo_registration_failure", campaign_id:campaign.id});
      }
    });
  }
  function closedCopy(campaign) {
    const status = statusFor(campaign);
    if (status === "EM BREVE") return `<p>Inscrições a partir de ${escapeHtml(formatDate(campaign.open_at))}. Participar, quando aberto, não significa aptidão automática ao sorteio.</p>`;
    if (status === "RESULTADO PUBLICADO") return `<p>Resultado publicado nesta página.</p>`;
    return "<p>As inscrições desta campanha estão encerradas. Acompanhe o sorteio e o resultado nesta página. Inscrição recebida não significa aptidão automática ao sorteio.</p>";
  }
  function renderDetail(campaign, config) {
    const host = document.querySelector("[data-promo-detail]");
    if (!host) return;
    document.title = `${campaign.title} | Promoções Passport Radio`;
    const open = registrationOpen(campaign);
    const pendingQuestion = (!open && campaign.question) ? `<p class="campaign-copy">Pergunta desta campanha: <strong>${escapeHtml(campaign.question)}</strong></p>` : "";
    const product = campaign.product_url ? `<a href="${escapeHtml(campaign.product_url)}">VER PRODUTO NA LOJA →</a>` : "";
    host.innerHTML = `<a class="campaign-back" href="promocoes.html">← TODAS AS PROMOÇÕES</a><header class="campaign-header"><span class="promo-kicker">${escapeHtml(campaign.id)} · ${statusFor(campaign)}</span><h1>${escapeHtml(campaign.title)}</h1><div class="campaign-dates">${datesFor(campaign).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div></header><img class="campaign-prize" src="${escapeHtml(campaign.prize_image || "/images/passport-radio-definitive.jpg")}" alt="${escapeHtml(campaign.prize_alt || campaign.prize)}"><div class="campaign-layout"><div><p class="campaign-copy">A Passport Radio apresenta esta campanha. Prêmio: <strong>${escapeHtml(campaign.prize)}</strong>. Acompanhe as datas e o resultado nesta página.</p>${pendingQuestion}<section class="campaign-prize-detail"><span>PRÊMIO</span><strong>${escapeHtml(campaign.prize)}</strong>${product}</section>${officialChannels(campaign, config)}<section class="campaign-rules" id="regulamento"><h2>REGULAMENTO</h2><ol>${(campaign.rules || []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join("")}</ol></section></div><aside class="campaign-participation"><span>PARTICIPAÇÃO</span><h2>${open ? "ENTRAR E PARTICIPAR" : statusFor(campaign)}</h2>${open ? campaignForm(campaign, config.form_endpoint, config) : closedCopy(campaign)}<div id="promo-confirmation" hidden aria-live="polite"></div></aside></div><section class="campaign-share"><span>COMPARTILHAR</span><h2>ESPALHE A CAMPANHA</h2><p>Compartilhe a página oficial da promoção. O link de indicação usa <code>?ref=</code> após uma inscrição recebida.</p><div class="campaign-share__actions"><button type="button" data-share-campaign>COMPARTILHAR</button><a data-share-wa target="_blank" rel="noopener">WHATSAPP</a><a href="promocoes.html?tab=entries#area-ouvinte">MINHAS INSCRIÇÕES →</a></div></section><nav class="campaign-links"><a href="promocoes.html">VOLTAR ÀS PROMOÇÕES</a><a href="anuncie.html">PATROCINE UMA CAMPANHA →</a></nav>`;
    host.querySelector("[data-share-campaign]")?.addEventListener("click", () => share(campaign));
    const whatsapp = host.querySelector("[data-share-wa]"); if (whatsapp) whatsapp.href = `https://wa.me/?text=${encodeURIComponent(`${campaign.share_text || campaign.title} · ${new URL(campaign.detail_url, location.origin)}`)}`;
    bindForm(campaign, config);
  }
  const root = typeof window !== "undefined" ? window : globalThis;
  root.PassportPromocoes = { statusFor, registrationOpen, datesFor, formatDate };
  if (typeof document === "undefined" || typeof fetch !== "function") return;
  fetch("/data/promocoes.json", {cache:"no-store"}).then((response) => response.json()).then((config) => {
    const campaigns = config.campaigns || [], listing = document.querySelector("[data-promo-listing]");
    if (listing) listing.innerHTML = campaigns.filter((campaign) => !campaign.winner).map(campaignCard).join("");
    const results = document.querySelector("[data-promo-results]");
    if (results) results.innerHTML = campaigns.filter((campaign) => campaign.winner).map((campaign) => `<article class="promo-result-card"><span>RESULTADO PUBLICADO · ${escapeHtml(campaign.id)}</span><h2>${escapeHtml(campaign.title)}</h2><p>Ganhador: <strong>${escapeHtml(campaign.winner)}</strong></p></article>`).join("");
    bindTabs(); const slug = document.querySelector("[data-promo-detail]")?.dataset.campaignSlug; const campaign = campaigns.find((item) => item.slug === slug); if (campaign) renderDetail(campaign, config);
  }).catch(() => { const listing = document.querySelector("[data-promo-listing]"); if (listing) listing.innerHTML = "<p>Não foi possível carregar as campanhas agora.</p>"; });
  renderEntries();
})();
