(() => {
  const views = [...document.querySelectorAll('.view')];
  const navButtons = [...document.querySelectorAll('[data-view]')];
  const title = document.getElementById('viewTitle');
  const dockPlay = document.getElementById('dockPlay');
  const status = document.getElementById('playerStatus');
  const installButton = document.getElementById('installButton');
  let deferredPrompt = null;
  let playing = false;

  const labels = {
    home: 'Início',
    live: 'Ao Vivo',
    explore: 'Explorar',
    stories: 'Histórias',
    archive: 'Arquivos'
  };

  function openView(name) {
    views.forEach(v => v.classList.toggle('is-visible', v.id === `view-${name}`));
    navButtons.forEach(b => b.classList.toggle('is-active', b.dataset.view === name));
    title.textContent = labels[name] || 'Passport Radio';
    history.replaceState(null, '', `#${name}`);
    window.scrollTo({top:0, behavior:'smooth'});
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => openView(btn.dataset.view));
  });

  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => openView(btn.dataset.jump));
  });

  function toggleDemo() {
    playing = !playing;
    dockPlay.textContent = playing ? '❚❚' : '▶';
    dockPlay.setAttribute('aria-label', playing ? 'Pausar' : 'Tocar');
    status.textContent = playing ? 'Demonstração visual ativa' : 'Player pronto';
  }

  dockPlay.addEventListener('click', toggleDemo);
  document.querySelectorAll('[data-action="play-demo"]').forEach(btn => btn.addEventListener('click', toggleDemo));

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installButton.hidden = true;
  });

  const initial = location.hash.replace('#','');
  if (labels[initial]) openView(initial);

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').catch(console.error);
    });
  }
})();

