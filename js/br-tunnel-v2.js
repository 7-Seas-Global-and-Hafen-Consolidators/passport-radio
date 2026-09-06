/* PASSPORT RADIO · BR TUNNEL™ V2
   Standalone Brazilian rock tunnel. Owns its row, panel and audio lifecycle.
   It does not participate in the legacy tunnel-panel observer.
*/
(() => {
  "use strict";

  if (!document.body.classList.contains("live-page")) return;

  const hub = document.getElementById("passportTunnels");
  const directory = hub?.querySelector(".tunnel-directory");
  const stage = hub?.querySelector(".tunnel-stage-shell");
  if (!hub || !directory || !stage) return;

  const STREAM = "https://14923.live.streamtheworld.com/CIDADEROCKBRASILAAC";
  const ID = "passportBRv2";

  // Remove any stale BR DOM left by an older cached implementation.
  directory.querySelectorAll('[data-tunnel-target="passportBR"],[data-tunnel-target="passportBRv2"]').forEach(el => el.remove());
  hub.querySelectorAll("#passportBR,#passportBRv2").forEach(el => el.remove());

  const row = document.createElement("button");
  row.type = "button";
  row.className = "tunnel-directory__row";
  row.dataset.brTunnelV2 = "1";
  row.setAttribute("aria-controls", ID);
  row.setAttribute("aria-expanded", "false");
  row.innerHTML = `
    <span class="tunnel-directory__number">07</span>
    <strong class="tunnel-directory__title">BR Tunnel™</strong>
    <span class="tunnel-directory__format">Rock brasileiro · clássicos · 80s · 90s · 2000 · nova cena</span>
    <span class="tunnel-directory__state">24 HOURS</span>
    <span class="tunnel-directory__action">Abrir player</span>`;
  directory.appendChild(row);

  const panel = document.createElement("section");
  panel.id = ID;
  panel.className = "passport-br-section";
  panel.hidden = true;
  panel.setAttribute("aria-hidden", "true");
  panel.innerHTML = `
    <div class="live-shell">
      <div style="padding:34px 0 40px">
        <span class="live-kicker">PASSPORT RADIO™ · 24 HOURS · BRAZIL</span>
        <h2 style="margin:.25em 0 .18em;font-size:clamp(3rem,9vw,7rem);line-height:.86">BR<br>Tunnel™</h2>
        <p style="max-width:720px">Rock brasileiro atravessando gerações: clássicos, 80s, 90s, 2000 e novas cenas em sinal contínuo.</p>
        <div style="margin-top:24px;border:1px solid #d8d8d8;background:#fff;padding:20px;max-width:760px">
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
            <button type="button" data-br-play aria-label="Tocar BR Tunnel" style="width:58px;height:58px;border-radius:50%;border:0;background:#e10600;color:#fff;font-size:1.25rem;cursor:pointer">▶</button>
            <div style="min-width:220px;flex:1">
              <small style="display:block;font-weight:800;letter-spacing:.12em;text-transform:uppercase">BR Tunnel™ · 24H</small>
              <strong data-br-status style="display:block;margin-top:5px;font-size:1.1rem">Pronto para tocar</strong>
              <span style="display:block;margin-top:3px;color:#666;font-size:.82rem">Rock Brasil · sinal contínuo</span>
            </div>
          </div>
          <audio data-br-audio preload="none"></audio>
        </div>
        <span class="handwritten" style="display:block;margin-top:20px">do Brasil, alto e sem pedir licença.</span>
      </div>
    </div>`;
  stage.appendChild(panel);

  const audio = panel.querySelector("[data-br-audio]");
  const play = panel.querySelector("[data-br-play]");
  const status = panel.querySelector("[data-br-status]");
  const rowState = row.querySelector(".tunnel-directory__state");
  let open = false;

  const pauseEverythingElse = () => {
    document.querySelectorAll("audio,video").forEach(media => {
      if (media !== audio && !media.paused) {
        try { media.pause(); } catch (_) {}
      }
    });
  };

  const closeLegacyPanels = () => {
    hub.querySelectorAll("[data-passport-tunnel-panel]").forEach(other => {
      other.querySelectorAll("audio,video").forEach(media => {
        if (!media.paused) try { media.pause(); } catch (_) {}
      });
      other.hidden = true;
      other.setAttribute("aria-hidden", "true");
    });
    directory.querySelectorAll(".tunnel-directory__row").forEach(otherRow => {
      if (otherRow !== row) {
        otherRow.classList.remove("is-active");
        otherRow.setAttribute("aria-expanded", "false");
      }
    });
  };

  const show = () => {
    closeLegacyPanels();
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    row.classList.add("is-active");
    row.setAttribute("aria-expanded", "true");
    row.querySelector(".tunnel-directory__action").textContent = "Fechar player";
    open = true;
    requestAnimationFrame(() => panel.scrollIntoView({ behavior: "smooth", block: "nearest" }));
  };

  const hide = () => {
    if (!audio.paused) audio.pause();
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    row.classList.remove("is-active");
    row.setAttribute("aria-expanded", "false");
    row.querySelector(".tunnel-directory__action").textContent = "Abrir player";
    rowState.textContent = "24 HOURS";
    open = false;
  };

  row.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();
    open ? hide() : show();
  });

  play.addEventListener("click", async event => {
    event.preventDefault();
    event.stopPropagation();
    if (!audio.paused) {
      audio.pause();
      return;
    }
    pauseEverythingElse();
    if (!audio.src) audio.src = STREAM;
    status.textContent = "Conectando…";
    try {
      await audio.play();
    } catch (_) {
      status.textContent = "Sinal indisponível agora · tente novamente";
      play.textContent = "▶";
      play.setAttribute("aria-label", "Tocar BR Tunnel");
      rowState.textContent = "24 HOURS";
    }
  });

  audio.addEventListener("playing", () => {
    play.textContent = "Ⅱ";
    play.setAttribute("aria-label", "Pausar BR Tunnel");
    status.textContent = "ON AIR · ROCK BRASILEIRO";
    rowState.textContent = "ON AIR";
  });

  audio.addEventListener("pause", () => {
    play.textContent = "▶";
    play.setAttribute("aria-label", "Tocar BR Tunnel");
    if (status.textContent.startsWith("ON AIR")) status.textContent = "Pausado";
    rowState.textContent = "24 HOURS";
  });

  audio.addEventListener("error", () => {
    play.textContent = "▶";
    status.textContent = "Sinal indisponível agora · tente novamente";
    rowState.textContent = "24 HOURS";
  });
})();
