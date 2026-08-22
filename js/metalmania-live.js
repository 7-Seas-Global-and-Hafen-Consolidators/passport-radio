/*
  PASSPORT RADIO
  METALMANIA LIVE BRIDGE
  ======================

  Estação:
  MetalMania Live

  Online Radio Box alias:
  us.metalmanialive

  Station ID observado:
  131956

  Este módulo mantém o experimento de rádio ao vivo
  separado do player/playlist legado da Passport.
*/

(() => {
  "use strict";

  const CONFIG = {
    country: "us",
    alias: "metalmanialive",
    stationId: "131956",
    stream: "1"
  };

  function boot() {
    const host = document.getElementById("passport-live-radio");

    if (!host) {
      console.warn("[Passport Live] container não encontrado.");
      return;
    }

    host.innerHTML = `
      <section class="passport-live-station">
        <div class="passport-live-status">
          <span class="passport-live-dot"></span>
          <span>AO VIVO</span>
        </div>

        <div class="passport-live-copy">
          <strong id="passport-live-title">
            METALMANIA LIVE
          </strong>

          <small id="passport-live-meta">
            Heavy Metal · Hard Rock · Live
          </small>
        </div>

        <div
          id="orb_player_passport"
          class="orbP"
          data-player="passport"
        >
          <audio
            id="passport-live-audio"
            preload="none"
          ></audio>

          <button
            type="button"
            class="orb_play"
            title="Listen live"
            country="${CONFIG.country}"
            alias="${CONFIG.alias}"
            stream="${CONFIG.stream}"
          >
            ▶
          </button>

          <span
            class="orbPtt"
            loading="CONECTANDO"
            playing="NO AR"
            error="SINAL INDISPONÍVEL"
          ></span>
        </div>
      </section>
    `;

    console.log(
      "[Passport Live] MetalMania preparada:",
      CONFIG
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
