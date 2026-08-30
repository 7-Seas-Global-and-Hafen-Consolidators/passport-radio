(() => {
  'use strict';

  const removeDuplicateQuickGrid = () => {
    const quick = document.querySelector('.quick-grid');
    const section = quick?.closest('section');
    if (section && !section.id) section.remove();
  };

  const compactArchiveCards = () => {
    const cards = [...document.querySelectorAll('#dicas .cards .card')];
    cards.slice(3).forEach(card => card.remove());
  };

  const compactAgenda = () => {
    const agenda = document.querySelector('#agenda .agenda');
    if (!agenda || agenda.dataset.passportPhase2 === '1') return;

    const events = [...agenda.querySelectorAll('.event')];
    if (events.length <= 4) {
      agenda.dataset.passportPhase2 = '1';
      return;
    }

    const overflow = events.slice(4);
    overflow.forEach(event => {
      event.hidden = true;
      event.dataset.passportAgendaOverflow = '1';
    });

    const wrap = document.createElement('div');
    wrap.className = 'passport-phase2-agenda-more';
    wrap.innerHTML = '<button type="button" class="btn" data-passport-agenda-more aria-expanded="false">VER AGENDA COMPLETA ↓</button>';
    agenda.insertAdjacentElement('afterend', wrap);

    const button = wrap.querySelector('[data-passport-agenda-more]');
    button?.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      overflow.forEach(event => { event.hidden = expanded; });
      button.setAttribute('aria-expanded', String(!expanded));
      button.textContent = expanded ? 'VER AGENDA COMPLETA ↓' : 'MOSTRAR MENOS ↑';
    });

    agenda.dataset.passportPhase2 = '1';
  };

  const installStyle = () => {
    if (document.getElementById('passport-phase2-home-style')) return;
    const style = document.createElement('style');
    style.id = 'passport-phase2-home-style';
    style.textContent = `
      .passport-phase2-agenda-more{display:flex;justify-content:flex-end;margin-top:18px}
      .passport-phase2-agenda-more .btn{cursor:pointer}
      #agenda .event[data-passport-agenda-overflow="1"][hidden]{display:none!important}
      #dicas .cards{grid-template-columns:repeat(3,minmax(0,1fr))}
      @media(max-width:900px){#dicas .cards{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  };

  const boot = () => {
    installStyle();
    removeDuplicateQuickGrid();
    compactArchiveCards();
    compactAgenda();

    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      compactAgenda();
      if (document.querySelector('#agenda .agenda[data-passport-phase2="1"]') || attempts > 20) {
        window.clearInterval(timer);
      }
    }, 150);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, {once:true});
  } else {
    boot();
  }
})();
