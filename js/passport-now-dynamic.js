(() => {
  'use strict';

  /* PASSPORT NOW™ — kinetic visual counters.
     These are presentation indexes, not audience analytics. */
  const STORAGE_KEY = 'passport_now_visual_counters_v1';
  const START = [102, 1824, 14];
  const MIN_STEP = [2, 18, 1];
  const MAX_STEP = [11, 74, 4];
  const TICK_MIN = 6500;
  const TICK_MAX = 14500;

  const format = (value) => Number(value).toLocaleString('pt-BR');
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const animateNumber = (node, nextValue) => {
    if (!node || !Number.isFinite(nextValue)) return;
    const previous = Number(node.dataset.passportValue || node.textContent.replace(/\D/g, '') || 0);
    node.dataset.passportValue = String(nextValue);

    const started = performance.now();
    const duration = 720;
    const from = Number.isFinite(previous) ? previous : 0;

    const tick = (now) => {
      const progress = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = format(Math.round(from + (nextValue - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const loadValues = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (Array.isArray(saved) && saved.length === 3 && saved.every(Number.isFinite)) {
        return saved.map((value, i) => Math.max(START[i], value));
      }
    } catch (_) {}
    return [...START];
  };

  const saveValues = (values) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(values)); } catch (_) {}
  };

  const install = () => {
    const metrics = document.querySelector('.passport-now-home__metrics');
    if (!metrics || metrics.dataset.passportDynamic === '1') return;
    metrics.dataset.passportDynamic = '1';

    const cards = [...metrics.querySelectorAll('.passport-now-home__metric')];
    if (cards.length < 3) return;

    const strongs = cards.map(card => card.querySelector('strong'));
    const labels = cards.map(card => card.querySelector('span'));
    const labelText = ['PASSPORT PULSE™', 'ROTAÇÕES DO SINAL', 'DESTINATIONS INDEX™'];

    labels.forEach((label, i) => {
      if (label) label.textContent = labelText[i];
    });

    const values = loadValues();
    strongs.forEach((node, i) => {
      if (!node) return;
      node.textContent = format(values[i]);
      node.dataset.passportValue = String(values[i]);
    });

    const rise = () => {
      values.forEach((value, i) => {
        values[i] = value + randomInt(MIN_STEP[i], MAX_STEP[i]);
        animateNumber(strongs[i], values[i]);
      });
      saveValues(values);
      window.setTimeout(rise, randomInt(TICK_MIN, TICK_MAX));
    };

    window.setTimeout(rise, randomInt(1800, 4200));
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();
