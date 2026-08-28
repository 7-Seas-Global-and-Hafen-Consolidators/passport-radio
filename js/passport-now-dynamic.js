(() => {
  'use strict';

  const namespace = 'passportradio.online';
  const action = 'listen';
  const key = 'signal';
  const endpoint = `https://counterapi.com/api/${namespace}/${action}/${key}`;
  const liveEndpoint = `${endpoint}?readOnly=true&timeline=15m&unique=true`;
  const totalEndpoint = `${endpoint}?readOnly=true`;
  const POLL_MS = 30000;

  const format = (value) => Number(value).toLocaleString('pt-BR');

  const animateNumber = (node, nextValue) => {
    if (!node || !Number.isFinite(nextValue)) return;
    const previous = Number(node.dataset.passportValue || 0);
    if (previous === nextValue) {
      node.textContent = format(nextValue);
      return;
    }

    node.dataset.passportValue = String(nextValue);
    const started = performance.now();
    const duration = 650;
    const from = Number.isFinite(previous) ? previous : 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (nextValue - from) * eased);
      node.textContent = format(current);
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const getValue = async (url) => {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit'
    });
    if (!response.ok) throw new Error(`Passport Now ${response.status}`);
    const data = await response.json();
    const value = Number(data && data.value);
    if (!Number.isFinite(value)) throw new Error('Passport Now invalid value');
    return value;
  };

  const install = () => {
    const metrics = document.querySelector('.passport-now-home__metrics');
    if (!metrics || metrics.dataset.passportDynamic === '1') return;
    metrics.dataset.passportDynamic = '1';

    const cards = metrics.querySelectorAll('.passport-now-home__metric');
    if (cards.length < 3) return;

    cards[0].querySelector('strong')?.setAttribute('data-passport-live-now', '1');
    cards[0].querySelector('span') && (cards[0].querySelector('span').textContent = 'OUVINDO AGORA');

    const totalStrong = cards[1].querySelector('strong');
    const totalLabel = cards[1].querySelector('span');
    if (totalStrong) {
      totalStrong.textContent = '—';
      totalStrong.setAttribute('data-passport-listen-pulses', '1');
    }
    if (totalLabel) totalLabel.textContent = 'PULSOS DE ESCUTA';

    const sessionStrong = cards[2].querySelector('strong');
    const sessionLabel = cards[2].querySelector('span');
    if (sessionStrong) {
      sessionStrong.textContent = '0';
      sessionStrong.dataset.passportSessionStart = String(Date.now());
    }
    if (sessionLabel) sessionLabel.textContent = 'MINUTOS NESTA SESSÃO';

    const updateSession = () => {
      if (!sessionStrong) return;
      const started = Number(sessionStrong.dataset.passportSessionStart || Date.now());
      const minutes = Math.max(0, Math.floor((Date.now() - started) / 60000));
      animateNumber(sessionStrong, minutes);
    };

    const refresh = async () => {
      try {
        const [live, total] = await Promise.all([
          getValue(liveEndpoint),
          getValue(totalEndpoint)
        ]);
        animateNumber(cards[0].querySelector('strong'), live);
        animateNumber(totalStrong, total);
      } catch (_) {}
      updateSession();
    };

    refresh();
    window.setInterval(refresh, POLL_MS);
    window.setInterval(updateSession, 15000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
