(() => {
  const STORAGE_KEY = 'passportPromoEntriesV1';
  const form = document.querySelector('#promo-entry-form');
  const codeField = document.querySelector('#participation-code');
  const confirmation = document.querySelector('#promo-confirmation');
  const entriesList = document.querySelector('#my-entries-list');
  const tabButtons = [...document.querySelectorAll('[data-listener-tab]')];
  const eventsPanel = document.querySelector('#listener-events-panel');
  const entriesPanel = document.querySelector('#listener-entries-panel');

  const getEntries = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  };

  const saveEntries = (entries) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (_) {}
  };

  const generateCode = () => {
    if (window.crypto && window.crypto.getRandomValues) {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return String(10000000 + (value[0] % 90000000));
    }
    return String(Math.floor(10000000 + Math.random() * 90000000));
  };

  const escapeHtml = (value = '') => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const renderEntries = () => {
    if (!entriesList) return;
    const entries = getEntries();

    if (!entries.length) {
      entriesList.innerHTML = '<div class="account-empty"><strong>Nenhuma inscrição salva ainda.</strong><span>As inscrições confirmadas neste navegador aparecerão aqui.</span></div>';
      return;
    }

    entriesList.innerHTML = entries.map((entry) => `
      <article class="entry-card">
        <div class="entry-card__top"><span>${escapeHtml(entry.campaign)}</span><b>CONFIRMADA</b></div>
        <div class="entry-card__code">${escapeHtml(entry.code)}</div>
        <div class="entry-card__details">
          <span><small>Participante</small>${escapeHtml(entry.name)}</span>
          <span><small>Instagram</small>${escapeHtml(entry.instagram)}</span>
          <span><small>Inscrição</small>${escapeHtml(entry.date)}</span>
        </div>
      </article>`).join('');
  };

  const selectListenerTab = (tab) => {
    if (!eventsPanel || !entriesPanel) return;
    const showEntries = tab === 'entries';
    eventsPanel.hidden = showEntries;
    entriesPanel.hidden = !showEntries;
    eventsPanel.classList.toggle('is-active', !showEntries);
    entriesPanel.classList.toggle('is-active', showEntries);
    tabButtons.forEach((button) => {
      const active = button.dataset.listenerTab === tab;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    if (showEntries) renderEntries();
  };

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => selectListenerTab(button.dataset.listenerTab));
  });

  if (new URLSearchParams(window.location.search).get('tab') === 'entries') {
    selectListenerTab('entries');
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submit = form.querySelector('button[type="submit"]');
      const code = generateCode();
      codeField.value = code;
      submit.disabled = true;
      submit.textContent = 'Registrando...';
      confirmation.hidden = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) throw new Error('formspree');

        const data = new FormData(form);
        const entry = {
          campaign: data.get('campaign') || 'PR-0001 — Fone Bluetooth 5.3',
          code,
          name: data.get('name') || '',
          email: data.get('email') || '',
          instagram: data.get('instagram') || '',
          date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date())
        };

        const entries = getEntries();
        entries.unshift(entry);
        saveEntries(entries.slice(0, 50));

        confirmation.innerHTML = `
          <span>INSCRIÇÃO CONFIRMADA</span>
          <strong>Seu código: ${escapeHtml(code)}</strong>
          <p>${escapeHtml(entry.campaign)}</p>
          <button type="button" id="show-my-entry">Ver minhas inscrições</button>`;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        form.reset();
        codeField.value = '';

        document.querySelector('#show-my-entry')?.addEventListener('click', () => {
          window.location.href = 'promocoes.html?tab=entries#area-ouvinte';
        });
      } catch (_) {
        confirmation.innerHTML = '<span>ERRO NO ENVIO</span><strong>A inscrição não foi enviada.</strong><p>Tente novamente.</p>';
        confirmation.hidden = false;
      } finally {
        submit.disabled = false;
        submit.textContent = 'Quero participar';
      }
    });
  }

  renderEntries();
})();
