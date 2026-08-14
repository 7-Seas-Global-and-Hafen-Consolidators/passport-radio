(() => {
  'use strict';

  /* =========================================================
     PASSPORT RADIO APP
     Navigation + Real Audio Player + PWA
     ========================================================= */

  const views = [...document.querySelectorAll('.view')];
  const navButtons = [...document.querySelectorAll('[data-view]')];

  const title = document.getElementById('viewTitle');
  const dockPlay = document.getElementById('dockPlay');
  const status = document.getElementById('playerStatus');
  const installButton = document.getElementById('installButton');

  const dockTitle =
    document.getElementById('dockTitle') ||
    document.querySelector('.track-copy strong');

  const dockMeta =
    document.getElementById('dockMeta') ||
    document.querySelector('.track-copy span');

  let deferredPrompt = null;
  let currentTrackIndex = 0;

  /* =========================================================
     VIEWS
     ========================================================= */

  const labels = {
    home: 'Início',
    live: 'Ao Vivo',
    explore: 'Explorar',
    stories: 'Histórias',
    archive: 'Arquivos'
  };

  function openView(name) {
    views.forEach(view => {
      view.classList.toggle(
        'is-visible',
        view.id === `view-${name}`
      );
    });

    navButtons.forEach(button => {
      button.classList.toggle(
        'is-active',
        button.dataset.view === name
      );
    });

    if (title) {
      title.textContent = labels[name] || 'Passport Radio';
    }

    history.replaceState(null, '', `#${name}`);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  navButtons.forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      openView(button.dataset.view);
    });
  });

  document.querySelectorAll('[data-jump]').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      openView(button.dataset.jump);
    });
  });


  /* =========================================================
     PASSPORT AUDIO LIBRARY
     ========================================================= */

  const tracks = [

    {
      title: "Alice Cooper — School's Out",
      meta: "Hellfest 2022 · Live & Rare",
      src: "/ALICE COOPER 'School's Out' - Live At Hellfest 2022 - Full Show Exclusively Available On 'Road'.mp3"
    },

    {
      title: "Alice Cooper — Feed My Frankenstein",
      meta: "Hellfest 2022 · Live & Rare",
      src: "/ALICE COOPER - Feed My Frankenstein (Live At Hellfest 2022).mp3"
    },

    {
      title: "David Bowie — Heroes",
      meta: "Live · Passport Archive",
      src: "/David Bowie - Heroes (live).mp3"
    },

    {
      title: "David Gilmour — Comfortably Numb",
      meta: "Live At Pompeii · Passport Archive",
      src: "/David Gilmour - Comfortably Numb (Live At Pompeii).mp3"
    },

    {
      title: "Depeche Mode — Enjoy The Silence",
      meta: "Live in Berlin · Passport Archive",
      src: "/Depeche Mode - Enjoy The Silence (Live in Berlin).mp3"
    },

    {
      title: "Huey Lewis & The News — Stuck With You",
      meta: "Live · Passport Archive",
      src: "/Huey Lewis & The News - Stuck With You (live).mp3"
    },

    {
      title: "Huey Lewis & The News — The Power Of Love",
      meta: "BBC2 · 1987",
      src: "/Huey Lewis And The News - The Power Of Love (Live) - BBC2 - Monday 31st August 1987.mp3"
    },

    {
      title: "Liam Gallagher — Stand By Me",
      meta: "Reading 2021 · Live",
      src: "/Liam Gallagher - Stand By Me (Reading 2021).mp3"
    },

    {
      title: "Lynyrd Skynyrd feat. Brent Smith — Simple Man",
      meta: "Live · Passport Archive",
      src: "/Lynyrd Skynyrd - _Simple Man_ (Feat. Brent Smith of Shinedown) - Official Live Video.mp3"
    },

    {
      title: "Simply Red — Holding Back The Years",
      meta: "Symphonica In Rosso",
      src: "/Simply Red - Holding Back The Years (Symphonica In Rosso).mp3"
    },

    {
      title: "Sinéad O'Connor — Nothing Compares 2 U",
      meta: "Live in Europe · 1990",
      src: "/Sinéad O'Connor - Nothing Compares 2 U (Live in Europe 1990).mp3"
    },

    {
      title: "Supertramp — It's Raining Again",
      meta: "Munich · 1983",
      src: "/Supertramp - It's Raining Again (Live in Munich - 1983).mp3"
    },

    {
      title: "Supertramp — The Logical Song",
      meta: "Munich · 1983",
      src: "/Supertramp - The Logical Song (Live In Munich 1983).mp3"
    },

    {
      title: "The Verve — Bittersweet Symphony",
      meta: "Glastonbury · 2008",
      src: "/The Verve - Bittersweet Symphony (Glastonbury 2008).mp3"
    },

    {
      title: "Tina Turner — The Best",
      meta: "Wembley · 2000",
      src: "/Tina Turner - The Best - Live Wembley (2000).mp3"
    },

    {
      title: "Dee Snider — Wacken",
      meta: "Passport Radio · Live & Rare",
      src: "/audio/primeiro-voo.mp3.mp3"
    },

    {
      title: "Passport Archive 002",
      meta: "Arquivo sonoro · Passport Radio",
      src: "/audio/segundo-voo.mp3"
    },

    {
      title: "Passport Archive 003",
      meta: "Arquivo sonoro · Passport Radio",
      src: "/audio/quarto-voo.mp3"
    },

    {
      title: "Passport Archive 004",
      meta: "Arquivo sonoro · Passport Radio",
      src: "/audio/setimo-voo.mp3"
    },

    {
      title: "Passport Archive 005",
      meta: "Arquivo sonoro · Passport Radio",
      src: "/audio/oitavo-voo.mp3"
    }

  ];


  /* =========================================================
     CREATE REAL AUDIO ENGINE
     ========================================================= */

  const audio = new Audio();

  audio.preload = 'metadata';

  audio.volume = 1;

  audio.src = tracks[currentTrackIndex].src;


  /* =========================================================
     PLAYER UI
     ========================================================= */

  function updatePlayerUI() {

    const track = tracks[currentTrackIndex];

    if (dockTitle) {
      dockTitle.textContent = track.title;
    }

    if (dockMeta) {
      dockMeta.textContent = track.meta;
    }

    if (dockPlay) {

      if (audio.paused) {

        dockPlay.textContent = '▶';

        dockPlay.setAttribute(
          'aria-label',
          'Tocar'
        );

      } else {

        dockPlay.textContent = '❚❚';

        dockPlay.setAttribute(
          'aria-label',
          'Pausar'
        );

      }
    }

    if (status) {

      status.textContent =
        audio.paused
          ? 'Player pronto'
          : 'Tocando agora';

    }


    /* -----------------------------------------
       Highlight archive track if such buttons
       exist in the app
       ----------------------------------------- */

    document
      .querySelectorAll('[data-track]')
      .forEach(element => {

        const index =
          Number(element.dataset.track);

        element.classList.toggle(
          'is-active',
          index === currentTrackIndex
        );

      });

  }


  /* =========================================================
     LOAD TRACK
     ========================================================= */

  function loadTrack(index, autoplay = true) {

    currentTrackIndex =
      (index + tracks.length) %
      tracks.length;

    const track =
      tracks[currentTrackIndex];

    audio.src = track.src;

    audio.load();

    updatePlayerUI();

    if (autoplay) {

      audio
        .play()
        .catch(error => {

          console.error(
            'Passport Audio:',
            error
          );

          if (status) {
            status.textContent =
              'Clique novamente para iniciar';
          }

          updatePlayerUI();

        });

    }

  }


  /* =========================================================
     PLAY / PAUSE
     ========================================================= */

  function togglePlay() {

    if (audio.paused) {

      audio
        .play()
        .catch(error => {

          console.error(
            'Não foi possível iniciar o áudio:',
            error
          );

          if (status) {
            status.textContent =
              'Áudio indisponível';
          }

        });

    } else {

      audio.pause();

    }

  }


  /* =========================================================
     NEXT TRACK
     ========================================================= */

  function playNext() {

    loadTrack(
      currentTrackIndex + 1,
      true
    );

  }


  /* =========================================================
     PREVIOUS TRACK
     ========================================================= */

  function playPrevious() {

    if (audio.currentTime > 4) {

      audio.currentTime = 0;

      return;

    }

    loadTrack(
      currentTrackIndex - 1,
      true
    );

  }


  /* =========================================================
     MAIN DOCK BUTTON
     ========================================================= */

  if (dockPlay) {

    dockPlay.addEventListener(
      'click',
      togglePlay
    );

  }


  /* =========================================================
     HERO PLAY BUTTONS
     ========================================================= */

  document
    .querySelectorAll(
      '[data-action="play-demo"]'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        event => {

          event.preventDefault();

          togglePlay();

        }
      );

    });


  /* =========================================================
     OPTIONAL PLAYER CONTROLS
     ========================================================= */

  document
    .querySelectorAll(
      '[data-action="next"]'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        playNext
      );

    });


  document
    .querySelectorAll(
      '[data-action="previous"]'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        playPrevious
      );

    });


  /* =========================================================
     ARCHIVE TRACK BUTTONS
     ========================================================= */

  document
    .querySelectorAll('[data-track]')
    .forEach(button => {

      button.addEventListener(
        'click',
        event => {

          event.preventDefault();

          const index =
            Number(button.dataset.track);

          if (
            Number.isInteger(index) &&
            tracks[index]
          ) {

            loadTrack(
              index,
              true
            );

          }

        }
      );

    });


  /* =========================================================
     AUDIO EVENTS
     ========================================================= */

  audio.addEventListener(
    'play',
    updatePlayerUI
  );

  audio.addEventListener(
    'pause',
    updatePlayerUI
  );


  /* -----------------------------------------
     AUTOMATIC NEXT TRACK
     ----------------------------------------- */

  audio.addEventListener(
    'ended',
    playNext
  );


  /* =========================================================
     ERROR HANDLING
     If one MP3 is unavailable, DON'T destroy
     the player. Skip to the next track.
     ========================================================= */

  let failedTrackIndex = -1;

  audio.addEventListener(
    'error',
    () => {

      console.error(
        'Arquivo de áudio indisponível:',
        tracks[currentTrackIndex].src
      );

      if (status) {
        status.textContent =
          'Arquivo indisponível · procurando próxima faixa';
      }

      if (
        failedTrackIndex !==
        currentTrackIndex
      ) {

        failedTrackIndex =
          currentTrackIndex;

        setTimeout(
          playNext,
          800
        );

      }

    }
  );


  audio.addEventListener(
    'canplay',
    () => {

      failedTrackIndex = -1;

      updatePlayerUI();

    }
  );


  /* =========================================================
     KEYBOARD
     SPACE = PLAY / PAUSE
     ALT + RIGHT = NEXT
     ALT + LEFT = PREVIOUS
     ========================================================= */

  document.addEventListener(
    'keydown',
    event => {

      const target =
        event.target;

      const typing =
        target &&
        (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable
        );

      if (typing) return;


      if (event.code === 'Space') {

        event.preventDefault();

        togglePlay();

      }


      if (
        event.code === 'ArrowRight' &&
        event.altKey
      ) {

        playNext();

      }


      if (
        event.code === 'ArrowLeft' &&
        event.altKey
      ) {

        playPrevious();

      }

    }
  );


  /* =========================================================
     PWA INSTALL
     ========================================================= */

  window.addEventListener(
    'beforeinstallprompt',
    event => {

      event.preventDefault();

      deferredPrompt = event;

      if (installButton) {
        installButton.hidden = false;
      }

    }
  );


  if (installButton) {

    installButton.addEventListener(
      'click',
      async () => {

        if (!deferredPrompt) {

          /*
           Some browsers do not expose
           beforeinstallprompt.
          */

          return;

        }

        deferredPrompt.prompt();

        await deferredPrompt.userChoice;

        deferredPrompt = null;

        installButton.hidden = true;

      }
    );

  }


  window.addEventListener(
    'appinstalled',
    () => {

      deferredPrompt = null;

      if (installButton) {
        installButton.hidden = true;
      }

    }
  );


  /* =========================================================
     INITIAL VIEW
     ========================================================= */

  const initial =
    location.hash.replace('#', '');

  if (labels[initial]) {

    openView(initial);

  }


  /* =========================================================
     SERVICE WORKER
     ========================================================= */

  if ('serviceWorker' in navigator) {

    window.addEventListener(
      'load',
      () => {

        navigator
          .serviceWorker
          .register(
            './service-worker.js'
          )
          .catch(error => {

            console.error(
              'Passport Service Worker:',
              error
            );

          });

      }
    );

  }


  /* =========================================================
     INITIAL PLAYER STATE
     ========================================================= */

  updatePlayerUI();


  /* =========================================================
     DEBUG / PASSPORT ENGINE
     Useful in browser console
     ========================================================= */

  window.PassportPlayer = {

    play() {

      if (audio.paused) {
        return audio.play();
      }

    },

    pause() {

      audio.pause();

    },

    next() {

      playNext();

    },

    previous() {

      playPrevious();

    },

    track(index) {

      if (tracks[index]) {
        loadTrack(index, true);
      }

    },

    get current() {

      return {
        index: currentTrackIndex,
        track: tracks[currentTrackIndex],
        playing: !audio.paused,
        time: audio.currentTime,
        duration: audio.duration
      };

    },

    audio,

    tracks

  };

})();
