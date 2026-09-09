/* PASSPORT RADIO · ROCK BRASIL TUNNEL™
   Motor isolado · Player V2 ou cabine unificada
   Stream validado: https://s03.svrdedicado.org:7298/stream
   Shoutcast DNAS · audio/aacp · 128kbps · HTTPS
*/
(() => {
  "use strict";

  const STREAM_URL = "https://s03.svrdedicado.org:7298/stream";
  const AUDIO_ID = "passportBRRockAudio";
  const PLAY_ID = "passportBRRockPlay";
  const STATUS_ID = "passportBRRockStatus";

  const host = document.getElementById("ppv2EngineBay") || document.getElementById("engineBay");
  if (!host) return;

  document
    .querySelectorAll(
      "#passportBRRockAudio,#passportBRRockPlay,#passportBRRockStatus,[data-passport-brrock-engine]"
    )
    .forEach((node) => {
      if (node instanceof HTMLMediaElement) {
        try {
          node.pause();
          node.removeAttribute("src");
          node.load();
        } catch (_) {}
      }
      try {
        node.remove();
      } catch (_) {}
    });

  const engine = document.createElement("div");
  engine.dataset.passportBrrockEngine = "current";
  engine.hidden = true;
  engine.innerHTML =
    `<button id="${PLAY_ID}" type="button" aria-label="Reproduzir Rock Brasil Tunnel™">▶</button>` +
    `<strong id="${STATUS_ID}">READY</strong>` +
    `<audio id="${AUDIO_ID}" preload="none"></audio>`;
  host.appendChild(engine);

  const audio = document.getElementById(AUDIO_ID);
  const play = document.getElementById(PLAY_ID);
  const status = document.getElementById(STATUS_ID);
  if (!audio || !play || !status) return;

  let wantsPlayback = false;
  let retryTimer = 0;
  let retries = 0;

  function setStatus(value) { status.textContent = value; }
  function clearRetry() { if (retryTimer) clearTimeout(retryTimer); retryTimer = 0; }
  function pauseOthers() {
    document.querySelectorAll("audio").forEach((element) => {
      if (element !== audio && !element.paused) try { element.pause(); } catch (_) {}
    });
  }
  function armSource() { audio.src = STREAM_URL; audio.load(); }
  async function openSocket() {
    if (!wantsPlayback) return;
    setStatus("CONNECTING");
    pauseOthers();
    try { audio.pause(); } catch (_) {}
    armSource();
    try { await audio.play(); retries = 0; }
    catch (error) { console.warn("[Rock Brasil Tunnel] play()", error); scheduleRetry(1500); }
  }
  function scheduleRetry(delay) {
    if (!wantsPlayback) return;
    clearRetry(); retries += 1; setStatus("OFFLINE");
    if (retries > 8) { wantsPlayback = false; play.textContent = "▶"; return; }
    retryTimer = window.setTimeout(() => { if (wantsPlayback) openSocket(); }, delay || 2000);
  }
  function stop() {
    wantsPlayback = false; clearRetry(); retries = 0;
    try { audio.pause(); audio.removeAttribute("src"); audio.load(); } catch (_) {}
    setStatus("READY"); play.textContent = "▶";
  }
  function start() {
    if (wantsPlayback && !audio.paused) return;
    wantsPlayback = true; play.textContent = "Ⅱ"; openSocket();
  }
  play.addEventListener("click", () => { if (wantsPlayback && !audio.paused) stop(); else start(); });
  audio.addEventListener("playing", () => { if (!wantsPlayback) return; clearRetry(); retries = 0; setStatus("ON AIR"); play.textContent = "Ⅱ"; });
  audio.addEventListener("pause", () => { if (!wantsPlayback) return; play.textContent = "▶"; if (status.textContent !== "OFFLINE" && status.textContent !== "CONNECTING") setStatus("READY"); });
  audio.addEventListener("waiting", () => { if (wantsPlayback) setStatus("CONNECTING"); });
  audio.addEventListener("error", () => { if (wantsPlayback) scheduleRetry(2000); });
  audio.addEventListener("stalled", () => { if (wantsPlayback && audio.paused) setStatus("CONNECTING"); });

  window.PassportBRRockTunnel = { play: start, stop, isActive: () => wantsPlayback && !audio.paused, audio, playButton: play, statusEl: status };
  setStatus("READY");
})();
