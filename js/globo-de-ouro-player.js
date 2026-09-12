/* Globo de Ouro: the six existing archive programs, unchanged.
   Each archive ID gets its own YT.Player instance. Callbacks are bound to that
   instance/id and guarded by a generation token, so a late callback from an old
   player can never be attributed to the next archive entry. */
(() => {
  "use strict";
  const LIST = ["E5uyPR8Zb9A","zjxnOpUnRis","mgIl2h7rr7E","FwcHnyEPzEY","T-cindr--4c","lBBOTVtXftA"];
  const button = document.getElementById("gdoPlay");
  const status = document.getElementById("gdoStatus");
  const originalHost = document.getElementById("gdoHidden");
  const hostParent = originalHost.parentNode;
  let player = null, ready = false, current = -1, generation = 0, interacted = false;
  const attempted = [];
  const results = Object.create(null);

  button.disabled = true;
  status.textContent = "CARREGANDO PLAYER";

  function snapshotResults() {
    return JSON.parse(JSON.stringify(results));
  }

  function isCurrent(gen, id) {
    return gen === generation && current >= 0 && LIST[current] === id;
  }

  function makeHost() {
    const old = document.getElementById("gdoHidden");
    if (old) old.remove();
    const host = document.createElement("div");
    host.id = "gdoHidden";
    hostParent.insertBefore(host, hostParent.querySelector(".gdo__close"));
    return host;
  }

  function stop() {
    if (ready && player) player.pauseVideo();
    button.textContent = "▶";
    if (ready) status.textContent = "PAUSADO";
  }

  function exhausted() {
    return attempted.length === LIST.length && LIST.every(id => results[id] && results[id].outcome === "error");
  }

  function showExhausted() {
    status.textContent = "ARQUIVO INDISPONÍVEL (YT " + LIST.map(id => results[id].code).join("/") + ")";
    button.textContent = "▶";
    button.disabled = false;
  }

  function nextPending() {
    for (let i = 0; i < LIST.length; i++) if (!attempted.includes(LIST[i])) return i;
    return -1;
  }

  function settleError(gen, id, code) {
    if (!isCurrent(gen, id) || (results[id] && (results[id].outcome === "error" || results[id].outcome === "ended"))) return;
    results[id] = {outcome:"error", code};
    const n = nextPending();
    if (n === -1) {
      if (exhausted()) showExhausted();
      return;
    }
    select(n, interacted);
  }

  function select(index, shouldPlay) {
    const id = LIST[index];
    if (attempted.includes(id)) return;

    generation += 1;
    const gen = generation;
    current = index;
    attempted.push(id);
    ready = false;
    button.disabled = true;
    button.textContent = "▶";
    status.textContent = "FAIXA " + (index + 1) + "/" + LIST.length;

    const oldPlayer = player;
    player = null;
    if (oldPlayer) {
      try { oldPlayer.destroy(); } catch (_) {}
    }
    makeHost();

    try {
      const instance = new YT.Player("gdoHidden", {
        width:1,
        height:1,
        videoId:id,
        playerVars:{autoplay:0,controls:0,rel:0,playsinline:1},
        events:{
          onReady() {
            if (!isCurrent(gen, id)) { try { instance.destroy(); } catch (_) {} return; }
            player = instance;
            ready = true;
            button.disabled = false;
            status.textContent = "READY";
            if (shouldPlay) {
              try { instance.unMute(); instance.playVideo(); }
              catch (_) { settleError(gen, id, "throw"); }
            }
          },
          onStateChange(event) {
            if (!isCurrent(gen, id)) return;
            if (event.data === 1) {
              if (!window.PassportBus.allowed()) { stop(); return; }
              results[id] = {outcome:"playing"};
              button.textContent = "Ⅱ";
              status.textContent = "ON AIR";
              return;
            }
            if (event.data === 0) {
              results[id] = {outcome:"ended"};
              button.textContent = "▶";
              const n = nextPending();
              if (n !== -1) select(n, interacted);
              else status.textContent = "READY";
            }
          },
          onError(event) {
            settleError(gen, id, event && event.data);
          }
        }
      });
      player = instance;
    } catch (_) {
      settleError(gen, id, "throw");
    }
  }

  function create() {
    if (current !== -1) return;
    select(0, false);
  }

  window.PassportGloboPlayer = {
    stop,
    current: () => (current >= 0 ? LIST[current] : null),
    attempted: () => attempted.slice(),
    results: snapshotResults,
    state: () => (ready && player ? player.getPlayerState() : -1),
    time: () => (ready && player ? player.getCurrentTime() : 0)
  };

  button.addEventListener("click", () => {
    if (!ready || !player) return;
    interacted = true;
    if (player.getPlayerState() === 1) stop();
    else {
      try { player.unMute(); player.playVideo(); }
      catch (_) { settleError(generation, LIST[current], "throw"); }
    }
  });

  if (window.YT && window.YT.Player) create();
  else {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === "function") previous();
      create();
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.onerror = () => { status.textContent = "PLAYER INDISPONÍVEL"; };
    document.head.appendChild(script);
  }
})();
