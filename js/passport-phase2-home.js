(() => {
  'use strict';

  const restoreAgenda = () => {
    const agenda = document.querySelector('#agenda .agenda');
    if (!agenda) return;

    agenda.querySelectorAll('.event[data-passport-agenda-overflow="1"]').forEach(event => {
      event.hidden = false;
      delete event.dataset.passportAgendaOverflow;
    });

    document.querySelectorAll('.passport-phase2-agenda-more').forEach(node => node.remove());
    delete agenda.dataset.passportPhase2;
  };

  const installStyle = () => {
    if (document.getElementById('passport-phase2-home-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-phase2-home-style';
    style.textContent = `
      /* Home density: keep valid HTML visible and make secondary modules earn their space. */
      .quick-grid{gap:14px}
      .quick-grid .quick-card,.quick-grid .card{padding:18px}
      #dicas .cards{grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
      #dicas .card{min-height:0}
      #agenda .agenda{gap:10px}
      #agenda .event{min-height:0}
      @media(max-width:1050px){#dicas .cards{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:700px){
        .quick-grid{gap:10px}
        .quick-grid .quick-card,.quick-grid .card{padding:14px}
        #dicas .cards{grid-template-columns:1fr;gap:10px}
      }
    `;
    document.head.appendChild(style);
  };

  const boot = () => {
    installStyle();
    restoreAgenda();

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      restoreAgenda();
      if (attempts > 20) window.clearInterval(timer);
    }, 150);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
