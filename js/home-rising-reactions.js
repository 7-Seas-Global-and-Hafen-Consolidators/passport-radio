(() => {
  'use strict';

  if (document.documentElement.dataset.passportRisingReactions === '1') return;
  document.documentElement.dataset.passportRisingReactions = '1';

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  const style = document.createElement('style');
  style.id = 'passport-rising-reactions-style';
  style.textContent = `
    .passport-rising-reactions{position:fixed;right:clamp(10px,2vw,28px);bottom:clamp(18px,4vh,48px);width:76px;height:min(44vh,390px);pointer-events:none;z-index:48;overflow:visible;contain:layout style}
    .passport-rising-reaction{position:absolute;right:0;bottom:0;display:grid;place-items:center;width:42px;height:42px;border-radius:999px;background:rgba(9,11,14,.86);border:1px solid rgba(255,255,255,.18);box-shadow:0 8px 28px rgba(0,0,0,.28);font-size:21px;line-height:1;opacity:0;will-change:transform,opacity;animation:passportReactionRise var(--passport-reaction-duration,4.6s) cubic-bezier(.18,.72,.25,1) forwards}
    @keyframes passportReactionRise{0%{opacity:0;transform:translate3d(0,18px,0) scale(.78) rotate(-4deg)}14%{opacity:.96;transform:translate3d(var(--passport-reaction-drift,0px),0,0) scale(1.06) rotate(2deg)}72%{opacity:.88}100%{opacity:0;transform:translate3d(calc(var(--passport-reaction-drift,0px) * -1),calc(-1 * var(--passport-reaction-rise,260px)),0) scale(1.2) rotate(var(--passport-reaction-rotate,8deg))}}
    @media(max-width:700px){.passport-rising-reactions{right:8px;bottom:18px;width:56px;height:34vh}.passport-rising-reaction{width:36px;height:36px;font-size:18px}}
    @media(prefers-reduced-motion:reduce){.passport-rising-reactions{display:none!important}}
  `;
  document.head.appendChild(style);

  const zone = document.createElement('div');
  zone.className = 'passport-rising-reactions';
  zone.setAttribute('aria-hidden', 'true');
  document.body.appendChild(zone);

  const reactions = ['❤️','🔥','🤘','🎵','🎸','🎧'];
  let timer = 0;
  let running = true;

  const emit = (symbol) => {
    if (!running || document.visibilityState !== 'visible') return;
    const bubble = document.createElement('span');
    bubble.className = 'passport-rising-reaction';
    bubble.textContent = symbol || reactions[Math.floor(Math.random() * reactions.length)];
    bubble.style.setProperty('--passport-reaction-drift', `${Math.round(Math.random() * 34 - 17)}px`);
    bubble.style.setProperty('--passport-reaction-rise', `${220 + Math.round(Math.random() * 110)}px`);
    bubble.style.setProperty('--passport-reaction-rotate', `${Math.round(Math.random() * 20 - 10)}deg`);
    bubble.style.setProperty('--passport-reaction-duration', `${(4.1 + Math.random() * 1.7).toFixed(2)}s`);
    zone.appendChild(bubble);
    bubble.addEventListener('animationend', () => bubble.remove(), { once: true });
    window.setTimeout(() => bubble.remove(), 6500);
  };

  const schedule = () => {
    window.clearTimeout(timer);
    if (!running) return;
    const delay = 1500 + Math.random() * 2600;
    timer = window.setTimeout(() => {
      emit();
      if (Math.random() < .18) window.setTimeout(() => emit(), 280 + Math.random() * 420);
      schedule();
    }, delay);
  };

  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running) schedule(); else window.clearTimeout(timer);
  });

  window.PassportReactions = Object.freeze({ emit });
  window.setTimeout(() => emit('❤️'), 900);
  schedule();
})();
