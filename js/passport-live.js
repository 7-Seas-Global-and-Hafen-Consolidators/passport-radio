/*
  PASSPORT RADIO
  LIVE CHANNEL ENGINE
  ===================

  PLAYER 1:
  portal-home.js
  -> arquivos MP3 locais

  PLAYER 2:
  passport-live.js
  -> canais de rádio ao vivo

  CANAIS:
  - METAL
  - UNPLUGGED
  - LIVE JAM
*/

(() => {
  "use strict";

  const CHANNELS = {
    metal: {
      label: "METAL",
      stream:
        "https://stations.radio-host.com/proxy/metalmanialive/stream"
    },

    unplugged: {
      label: "UNPLUGGED",
      stream:
        "https://stations.radio-host.com/proxy/unpluggedlive/stream"
    },

    livejam: {
      label: "LIVE JAM",
      stream:
        "https://stations.radio-host.com/proxy/livejam/stream"
    }
  };

  let currentChannel = "metal";

  function getArchiveAudio() {
    return document.getElementById("audio");
  }

  function getLiveAudio() {
    return document.getElementById("passport-live-audio");
  }

  function getLivePlayButton() {
    return document.getElementById("passport-live-play");
  }

  function stopArchive() {
    const archive = getArchiveAudio();

    if (archive && !archive.paused) {
      archive.pause();
    }
  }

  function stopLive() {
    const live = getLiveAudio();

    if (live && !live.paused) {
      live.pause();
    }
  }

  function setStatus(text) {
    const status =
      document.getElementById("passport-live-status");

    if (status) {
      status.textContent = text;
    }
  }

  function setChannelLabel(text) {
    const label =
      document.getElementById(
        "passport-live-channel-name"
      );

    if (label) {
      label.textContent = text;
    }
  }

  function updateActiveButton(channelKey) {
    const buttons =
      document.querySelectorAll(
        "[data-live-channel]"
      );

    buttons.forEach((button) => {
      button.classList.toggle(
        "is-active",
        button.dataset.liveChannel === channelKey
      );
    });
  }

  function buildPlayer() {
    const host =
      document.getElementById(
        "passport-live-radio"
      );

    if (!host) {
      console.warn(
        "[Passport Live] área do player não encontrada."
      );

      return;
    }

    host.innerHTML = `
      <section class="passport-live-panel">

        <div class="passport-live-head">

          <div>
            <small>
              PASSPORT LIVE
            </small>

            <strong id="passport-live-channel-name">
              METAL
            </strong>
          </div>

        </div>

        <div class="passport-live-channels">

          <button
            type="button"
            class="passport-live-channel is-active"
            data-live-channel="metal"
          >
            METAL
          </button>

          <button
            type="button"
            class="passport-live-channel"
            data-live-channel="unplugged"
          >
            UNPLUGGED
          </button>

          <button
            type="button"
            class="passport-live-channel"
            data-live-channel="livejam"
          >
            LIVE JAM
          </button>

        </div>

        <div class="passport-live-controls">

          <button
            id="passport-live-play"
            type="button"
            class="passport-live-play"
            aria-label="Ouvir ao vivo"
            title="Ouvir ao vivo"
          >
            ▶
          </button>

          <span id="passport-live-status">
            PRONTO
          </span>

        </div>

        <audio
          id="passport-live-audio"
          preload="none"
        ></audio>

      </section>
    `;

    installChannelButtons();
    installPlayerControls();

    selectChannel(
      "metal",
      false
    );
  }

  function installChannelButtons() {
    const buttons =
      document.querySelectorAll(
        "[data-live-channel]"
      );

    buttons.forEach((button) => {
      button.addEventListener(
        "click",
        () => {
          const channelKey =
            button.dataset.liveChannel;

          selectChannel(
            channelKey,
            true
          );
        }
      );
    });
  }

  function installPlayerControls() {
    const play =
      getLivePlayButton();

    const live =
      getLiveAudio();

    if (!play || !live) {
      return;
    }

    play.addEventListener(
      "click",
      async () => {
        if (!live.src) {
          setStatus(
            "CANAL SEM STREAM"
          );

          return;
        }

        if (!live.paused) {
          live.pause();
          return;
        }

        stopArchive();

        setStatus(
          "CONECTANDO"
        );

        try {
          await live.play();
        } catch (error) {
          console.error(
            "[Passport Live] erro ao tocar:",
            error
          );

          setStatus(
            "ERRO AO CONECTAR"
          );
        }
      }
    );

    live.addEventListener(
      "playing",
      () => {
        const playButton =
          getLivePlayButton();

        if (playButton) {
          playButton.textContent = "Ⅱ";
        }

        setStatus(
          "NO AR"
        );
      }
    );

    live.addEventListener(
      "pause",
      () => {
        const playButton =
          getLivePlayButton();

        if (playButton) {
          playButton.textContent = "▶";
        }

        setStatus(
          "PAUSADO"
        );
      }
    );

    live.addEventListener(
      "waiting",
      () => {
        setStatus(
          "CONECTANDO"
        );
      }
    );

    live.addEventListener(
      "stalled",
      () => {
        setStatus(
          "RECONECTANDO"
        );
      }
    );

    live.addEventListener(
      "canplay",
      () => {
        if (live.paused) {
          setStatus(
            "PRONTO"
          );
        }
      }
    );

    live.addEventListener(
      "error",
      () => {
        const playButton =
          getLivePlayButton();

        if (playButton) {
          playButton.textContent = "▶";
        }

        setStatus(
          "SINAL INDISPONÍVEL"
        );

        console.error(
          "[Passport Live] erro de áudio:",
          live.error
        );
      }
    );
  }

  function selectChannel(
    channelKey,
    autoplay
  ) {
    const config =
      CHANNELS[channelKey];

    if (!config) {
      console.warn(
        "[Passport Live] canal inexistente:",
        channelKey
      );

      return;
    }

    const live =
      getLiveAudio();

    if (!live) {
      return;
    }

    currentChannel =
      channelKey;

    const wasPlaying =
      !live.paused;

    live.pause();

    live.removeAttribute(
      "src"
    );

    live.load();

    setChannelLabel(
      config.label
    );

    updateActiveButton(
      channelKey
    );

    live.src =
      config.stream;

    live.load();

    setStatus(
      "PRONTO"
    );

    const shouldPlay =
      autoplay || wasPlaying;

    if (shouldPlay) {
      stopArchive();

      setStatus(
        "CONECTANDO"
      );

      live.play().catch(
        (error) => {
          console.error(
            "[Passport Live] erro ao trocar canal:",
            error
          );

          setStatus(
            "CLIQUE NO PLAY"
          );
        }
      );
    }

    console.log(
      "[Passport Live] canal selecionado:",
      config.label,
      config.stream
    );
  }

  function installMutualExclusion() {
    document.addEventListener(
      "play",
      (event) => {
        const target =
          event.target;

        if (
          !(
            target instanceof
            HTMLMediaElement
          )
        ) {
          return;
        }

        if (
          target.id ===
          "passport-live-audio"
        ) {
          stopArchive();
        }

        if (
          target.id ===
          "audio"
        ) {
          stopLive();
        }
      },
      true
    );
  }

  function boot() {
    buildPlayer();

    installMutualExclusion();

    console.log(
      "[Passport Live] motor iniciado.",
      currentChannel
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }
})();
