/* Passport Activity™ — lightweight portal circulation layer.
   Isolated from players, streams, Passport Now™, auth and checkout. */
(() => {
  'use strict';
  if (window.__passportActivityLoaded) return;
  window.__passportActivityLoaded = true;

  const INTERVAL_MIN = 45000;
  const INTERVAL_MAX = 60000;
  const VISIBLE_MS = 6200;

  /* Ambient social-proof copy only: no claim of live analytics or real-time user identity. */
  const events = [
    { tag: 'AGORA NA PASSPORT', text: 'Paulo Correia curtiu uma história da Passport.' },
    { tag: 'AGORA NA PASSPORT', text: 'Maria Silva curtiu uma matéria do arquivo.' },
    { tag: 'GIRO DO ARQUIVO', text: 'Carlos Mendes entrou em outra história.' },
    { tag: 'RÁDIO 24H', text: 'Ana Martins abriu a Passport 24H.' },
    { tag: 'WORLD DIAL™', text: 'Ricardo Alves entrou no World Dial™.' },
    { tag: 'PASSPORT STORE', text: 'Fernanda Costa entrou na Passport Store.' },
    { tag: 'APOIAR A PASSPORT', text: 'Juliana Rocha abriu a página de apoio.' },
    { tag: 'EDITORIAL 24H', text: 'Marcos Oliveira abriu outra matéria.' },
    { tag: 'AGORA NA PASSPORT', text: 'Patrícia Gomes curtiu uma história da Passport.' },
    { tag: 'RÁDIO 24H', text: 'Eduardo Santos entrou no ar.' }
  ];

  let host;
  let last = -1;
  let timer;

  function ensureHost() {
    if (host && document.body.contains(host)) return host;
    host = document.createElement('div');
    host.className = 'passport-activity-host';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'true');
    document.body.appendChild(host);
    return host;
  }

  function pickEvent() {
    if (events.length === 1) return events[0];
    let index = Math.floor(Math.random() * events.length);
    if (index === last) index = (index + 1) % events.length;
    last = index;
    return events[index];
  }

  function show(event) {
    const root = ensureHost();
    const current = root.querySelector('.passport-activity-toast');
    if (current) current.remove();
    const toast = document.createElement('aside');
    toast.className = 'passport-activity-toast';
    toast.innerHTML = `<span class="passport-activity-pulse" aria-hidden="true"></span><div class="passport-activity-copy"><b>${event.tag}</b><span>${event.text}</span></div><button type="button" class="passport-activity-close" aria-label="Fechar">×</button>`;
    root.appendChild(toast);
    const close = () => {toast.classList.remove('is-visible');window.setTimeout(() => toast.remove(), 260);};
    toast.querySelector('.passport-activity-close').addEventListener('click', close);
    window.requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(close, VISIBLE_MS);
  }

  function schedule() {
    window.clearTimeout(timer);
    const delay = INTERVAL_MIN + Math.random() * (INTERVAL_MAX - INTERVAL_MIN);
    timer = window.setTimeout(() => {if (!document.hidden) show(pickEvent());schedule();}, delay);
  }

  window.PassportActivity = {push(tag, text) {if (!tag || !text) return;show({ tag: String(tag), text: String(text) });}};
  const start = () => {ensureHost();window.setTimeout(() => {if (!document.hidden) show(pickEvent());}, 9000);schedule();};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
})();