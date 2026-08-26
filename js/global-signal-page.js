(() => {
  const P = window.PassportGlobalSignals;
  const app = document.getElementById('app');
  const id = new URLSearchParams(location.search).get('id') || '';
  if (!P || !app) return;

  const stamp = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : new Intl.DateTimeFormat('pt-BR', { dateStyle:'long', timeStyle:'short' }).format(d);
  };

  const show = (item, all = []) => {
    if (!item) {
      app.innerHTML = '<section class="signal-empty"><strong>Este Signal não passou pela validação editorial.</strong><a href="/#passport-editorial-home">← Voltar ao Radar</a></section>';
      return;
    }

    document.title = `${P.decode(item.title)} | Passport Signal`;
    const related = all
      .filter((x) => x.id !== item.id && P.safePT(x.title, '', 'pt') && P.musicRelevant(x))
      .slice(0, 8);
    const summary = P.decode(item.summary || '');

    app.innerHTML = `
      <section class="signal-head">
        <div class="kicker"><span>PASSPORT SIGNAL · RADAR EDITORIAL MUNDIAL</span><span>${P.esc(item.region || 'GLOBAL')}</span></div>
        <span class="signal-type">NOTÍCIA RÁPIDA</span>
        <h1>${P.esc(item.title)}</h1>
        ${summary ? `<p class="deck">${P.esc(summary)}</p>` : ''}
        <div class="meta">
          <span>${P.esc(item.genre || 'MÚSICA')}</span><span>PT-BR</span>${item.date ? `<span>${P.esc(stamp(item.date))}</span>` : ''}
        </div>
      </section>

      <section class="signal-layout">
        <article class="signal-brief">
          <div class="brief-label">O QUE ACONTECEU</div>
          <p class="brief-copy">${summary ? P.esc(summary) : 'O Radar Editorial Mundial detectou esta atualização. Novos dados podem substituir este brief conforme o túnel recebe novas informações.'}</p>

          <div class="signal-facts">
            <div><small>REGIÃO</small><strong>${P.esc(item.region || 'Global')}</strong></div>
            <div><small>GÊNERO</small><strong>${P.esc(item.genre || 'Música')}</strong></div>
            <div><small>FORMATO</small><strong>Passport Signal</strong></div>
            <div><small>STATUS</small><strong>Radar 24H</strong></div>
          </div>

          <div class="signal-note">
            <strong>Passport Signal</strong>
            <p>Este é um boletim rápido do Radar Editorial Mundial. As pautas selecionadas para aprofundamento recebem uma matéria completa nas Histórias Premium do Mr. Nomad.</p>
          </div>

          <div class="signal-actions">
            <a class="signal-btn signal-btn--red" href="/#passport-editorial-home">VOLTAR ÀS NOTÍCIAS →</a>
            <a class="signal-btn" href="/editorial.html">HISTÓRIAS PREMIUM →</a>
          </div>
        </article>

        <aside class="signal-side">
          <div class="rail-title">ÚLTIMOS SIGNALS</div>
          ${related.length ? related.map((x) => `
            <a class="rel" href="/signal.html?id=${encodeURIComponent(x.id)}">
              <small>${P.esc(x.region || 'GLOBAL')}</small>
              <strong>${P.esc(x.title)}</strong>
            </a>`).join('') : '<div class="rail-empty">Novos Signals estão entrando no Radar.</div>'}
        </aside>
      </section>`;
  };

  const stored = P.readStored();
  const cached = stored.find((x) => String(x.id) === String(id));
  if (cached) show(cached, stored);

  P.loadRaw().then(async (r) => {
    const target = r.items.find((x) => String(x.id) === String(id));
    if (!target) { if (!cached) show(null, stored); return; }

    const main = await P.translate(target);
    if (!main) { if (!cached) show(null, stored); return; }

    const candidates = r.items.filter((x) => x.id !== target.id).slice(0, 18);
    const translated = await Promise.allSettled(candidates.map(P.translate));
    const related = translated
      .filter((x) => x.status === 'fulfilled' && x.value)
      .map((x) => x.value)
      .filter((x) => P.safePT(x.title, '', 'pt') && P.musicRelevant(x))
      .slice(0, 8);

    const all = [main, ...related];
    P.remember(all);
    show(main, all);
  }).catch(() => { if (!cached) show(null, stored); });
})();
