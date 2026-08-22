/*
  PASSPORT RADIO
  LIVE CHANNEL ENGINE
  ===================

  Segundo motor de áudio da Passport Radio.

  PLAYER 1:
  portal-home.js
  -> arquivos MP3 locais

  PLAYER 2:
  passport-live.js
  -> canais contínuos de rádio ao vivo

  Os dois motores permanecem separados.
*/

(() => {
  "use strict";

  const CHANNELS = {
    metal: {
      label: "METAL",
      country: "us",
      alias: "metalmanialive",
      stationId: "131956",
      stream: "1"
    },

    unplugged: {
      label: "UNPLUGGED",
      country: "us",
      alias: "unpluggedlive",
      stationId: "151148",
      stream: "1"
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
    const status = document.getElementById("passport-live-status");

    if (status) {
      status.textContent = text;
    }
  }

  function setChannelLabel(text) {
    const label = document.getElementById("passport-live-channel-name");

    if (label) {
      label.textContent = text;
    }
  }

  function buildPlayer() {
    const host = document.getElementById("passport-live-radio");

    if (!host) {
      console.warn("[Passport Live] área do player não encontrada.");
      return;
    }

    host.innerHTML = `
      <section class="passport-live-panel">

        <div class="passport-live-head">
          <span class="passport-live-dot"></span>

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

        <div
          id="passport-orb-player"
          class="orbP passport-orb-player"
        >

          <audio
            id="passport-live-audio"
            preload="none"
          ></audio>

          <button
            id="passport-live-play"
            type="button"
            class="orb_play passport-live-play"
            title="Ouvir ao vivo"
            country="us"
            alias="metalmanialive"
            stream="1"
          >
            ▶
          </button>

          <span
            id="passport-live-status"
            class="orbPtt"
            loading="CONECTANDO"
            playing="NO AR"
            error="SINAL INDISPONÍVEL"
            not_supported="NAVEGADOR NÃO COMPATÍVEL"
            external="OUVIR"
            geo_blocked="INDISPONÍVEL"
          >
            PRONTO
          </span>

        </div>

      </section>
    `;

    installChannelButtons();

    console.log(
      "[Passport Live] motor criado.",
      CHANNELS
    );
  }

  function installChannelButtons() {
    const buttons =
      document.querySelectorAll("[data-live-channel]");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const channelKey =
          button.dataset.liveChannel;

        selectChannel(channelKey);

        buttons.forEach((item) => {
          item.classList.toggle(
            "is-active",
            item === button
          );
        });
      });
    });
  }

  function selectChannel(channelKey) {
    const config = CHANNELS[channelKey];

    if (!config) {
      console.warn(
        "[Passport Live] canal inexistente:",
        channelKey
      );

      return;
    }

    currentChannel = channelKey;

    stopLive();

    const playButton =
      document.getElementById("passport-live-play");

    if (!playButton) return;

    playButton.setAttribute(
      "country",
      config.country
    );

    playButton.setAttribute(
      "alias",
      config.alias
    );

    playButton.setAttribute(
      "stream",
      config.stream
    );

    setChannelLabel(config.label);
    setStatus("PRONTO");

    /*
      O Online Radio Box inicializa o player
      a partir dos atributos acima.

      Ao mudar de canal, reconstruímos apenas
      a área do widget para forçar uma nova
      inicialização limpa.
    */

    rebuildOrbPlayer(config);

    console.log(
      "[Passport Live] canal selecionado:",
      config
    );
  }

  function rebuildOrbPlayer(config) {
    const oldPlayer =
      document.getElementById("passport-orb-player");

    if (!oldPlayer) return;

    oldPlayer.innerHTML = `
      <audio
        id="passport-live-audio"
        preload="none"
      ></audio>

      <button
        id="passport-live-play"
        type="button"
        class="orb_play passport-live-play"
        title="Ouvir ao vivo"
        country="${config.country}"
        alias="${config.alias}"
        stream="${config.stream}"
      >
        ▶
      </button>

      <span
        id="passport-live-status"
        class="orbPtt"
        loading="CONECTANDO"
        playing="NO AR"
        error="SINAL INDISPONÍVEL"
        not_supported="NAVEGADOR NÃO COMPATÍVEL"
        external="OUVIR"
        geo_blocked="INDISPONÍVEL"
      >
        PRONTO
      </span>
    `;

    initOnlineRadioBox();
  }

  function initOnlineRadioBox() {
    if (!window.orbp_w) {
      window.orbp_w = {
        lang: "en-us"
      };
    }

    window.orbp_w.cmd =
      window.orbp_w.cmd || [];

    window.orbp_w.apiUrl =
      "https://onlineradiobox.com";

    window.orbp_w.cmd.push(() => {
      try {
        window.orbp_w.init(
          "passport-orb-player"
        );
      } catch (error) {
        console.error(
          "[Passport Live] erro ao iniciar canal:",
          error
        );
      }
    });

    loadOrbScript();
  }

  function loadOrbScript() {
    const existing =
      document.querySelector(
        'script[data-passport-orb="true"]'
      );

    if (existing) {
      /*
        Script já existe.
        Executamos a fila novamente.
      */

      if (
        window.orbp_w &&
        typeof window.orbp_w.init === "function"
      ) {
        try {
          window.orbp_w.init(
            "passport-orb-player"
          );
        } catch (error) {}
      }

      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://ecdn.onlineradiobox.com/js/pwidget2.min.235ca64e.js";

    script.async = true;

    script.dataset.passportOrb =
      "true";

    script.onload = () => {
      console.log(
        "[Passport Live] Online Radio Box carregado."
      );
    };

    script.onerror = () => {
      console.error(
        "[Passport Live] falha ao carregar Online Radio Box."
      );

      setStatus(
        "SINAL INDISPONÍVEL"
      );
    };

    document.head.appendChild(script);
  }

  function installMutualExclusion() {
    document.addEventListener(
      "play",
      (event) => {
        const target = event.target;

        if (!(target instanceof HTMLMediaElement)) {
          return;
        }

        if (target.id === "passport-live-audio") {
          stopArchive();
        }

        if (target.id === "audio") {
          stopLive();
        }
      },
      true
    );
  }

  function boot() {
    buildPlayer();
    installMutualExclusion();
    initOnlineRadioBox();

    console.log(
      "[Passport Live] inicialização concluída.",
      currentChannel
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      boot
    );
  } else {
    boot();
  }
})();
