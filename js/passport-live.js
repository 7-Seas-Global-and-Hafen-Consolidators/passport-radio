/*
  PASSPORT RADIO
  LIVE CHANNEL ENGINE
  ===================

  PLAYER 1:
  portal-home.js
  -> arquivos MP3 locais

  PLAYER 2:
  passport-live.js
  -> stream ao vivo
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
      stream: ""
    }
  };

  let currentChannel = "metal";

  function getArchiveAudio() {
    return document.getElementById("audio");
  }

  function getLiveAudio() {
    return document.getElementById("passport-live-audio");
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
            <small>PASSPORT LIVE</small>

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

        </div>

        <div class="passport-live-controls">

          <button
            id="passport-live-play"
            type="button"
            class="passport-live-play"
            aria-label="Ouvir ao vivo"
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

    selectChannel("metal", false);
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
            false
          );

          buttons.forEach((item) => {
            item.classList.toggle(
              "is-active",
              item === button
            );
          });
        }
      );
    });
  }

  function installPlayerControls() {
    const play =
      document.getElementById(
        "passport-live-play"
      );

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
        play.textContent = "Ⅱ";
        setStatus("NO AR");
      }
    );

    live.addEventListener(
      "pause",
      () => {
        play.textContent = "▶";
        setStatus("PAUSADO");
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
      "error",
      () => {
        play.textContent = "▶";

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
      return;
    }

    currentChannel =
      channelKey;

    const live =
      getLiveAudio();

    if (!live) {
      return;
    }

    const wasPlaying =
      !live.paused;

    live.pause();

    live.removeAttribute("src");
    live.load();

    setChannelLabel(
      config.label
    );

    if (!config.stream) {
      setStatus(
        "AGUARDANDO STREAM"
      );

      return;
    }

    live.src =
      config.stream;

    live.load();

    setStatus(
      "PRONTO"
    );

    if (
      autoplay ||
      wasPlaying
    ) {
      stopArchive();

      live.play().catch(
        (error) => {
          console.error(
            "[Passport Live] autoplay falhou:",
            error
          );

          setStatus(
            "CLIQUE NO PLAY"
          );
        }
      );
    }

    console.log(
      "[Passport Live] canal:",
      channelKey,
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
      "[Passport Live] pronto.",
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
