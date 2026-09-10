/* PASSPORT RADIO · CABINE = TELECOMMANDE
   Não cria <audio>. Não inventa stream de túnel.
   Clica o play do motor original. Mutex: um som.
   IDs da cabine real: #play #stop #mute #volume #signal #meta #status
*/
(() => {
  "use strict";

  const WORLD = [
    { id: "py", name: "Paraguay", src: "Rock & Pop 95.5 · Asunción", url: "https://cp9.serverse.com/proxy/rockandpop/stream" },
    { id: "fr", name: "France", src: "OÜI FM · Paris", url: "https://ouifm.ice.infomaniak.ch/ouifm-high.mp3" },
    { id: "it", name: "Italia", src: "Radio Company", url: "https://str01.fluidstream.net/company.mp3" },
    { id: "cz", name: "Česko", src: "HEY Radio", url: "https://icecast3.play.cz/hey-radio128.mp3" }
  ];

  const SIGNALS = {
    "live-rare": { label: "LIVE & RARE™", meta: "Arquivo underground", playId: "tunnelPlay", yt: true },
    "80s": { label: "80s TUNNEL™", meta: "181.FM", playId: "passport80sPlay", audioId: "passport80sAudio" },
    soul: { label: "SOUL TUNNEL™", meta: "Total Soul", playId: "passportSoulPlay", audioId: "passportSoulAudio" },
    mpb: { label: "MPB TUNNEL™", meta: "Rádio Só MPB", playId: "passportMPBPlay", audioId: "passportMPBAudio" },
    hits: { label: "PASSPORT HITS™", meta: "Pop · Top 40", playId: "passportHitsPlay", audioId: "passportHitsAudio" },
    continuous: { label: "CONTINUOUS SIGNALS™", meta: "Passport Live", playId: "passport-live-play", audioId: "passport-live-audio" },
    brrock: { label: "ROCK BRASIL TUNNEL™", meta: "Classic Rock BR", playId: "passportBRRockPlay", audioId: "passportBRRockAudio" },
    "5060": { label: "50s & 60s TUNNEL™", meta: "181.FM Good Time", playId: "passport5060Play", audioId: "passport5060Audio" },
    world: { label: "WORLD DIAL™", meta: "Atlas", audioId: "passportWorldAudio" }
  };

  const $ = (id) => document.getElementById(id);
  let active = "live-rare";
  let worldId = "py";
  let started = 0;
  let timer = 0;

  function worldNow() {
    return WORLD.find((w) => w.id === worldId) || WORLD[0];
  }

  function ytPlaying() {
    const b = $("tunnelPlay");
    return !!b && (b.textContent || "").trim() === "Ⅱ";
  }

  function mediaPlaying(id) {
    const a = $(id);
    return !!a && !a.paused;
  }

  function isOn(id) {
    const s = SIGNALS[id];
    if (!s) return false;
    if (s.yt) return ytPlaying();
    return s.audioId ? mediaPlaying(s.audioId) : false;
  }

  function stopHtml() {
    document.querySelectorAll("audio,video").forEach((el) => {
      if (!el.paused) try { el.pause(); } catch (_) {}
    });
  }

  function stopYt() {
    if (ytPlaying()) try { $("tunnelPlay").click(); } catch (_) {}
  }

  function paint() {
    const s = SIGNALS[active];
    if (!s || !$("signal")) return;
    const on = isOn(active);
    $("signal").textContent = s.label;
    $("status").textContent = on ? "ON AIR" : "CALADA";
    $("status").className = on ? "live" : "";
    if ($("ledOn")) $("ledOn").className = "led" + (on ? " on" : "");
    let meta = s.meta || "—";
    if (active === "world") meta = worldNow().name + " · " + worldNow().src;
    $("meta").textContent = meta;
    if ($("source")) $("source").textContent = on ? "ATIVO" : "—";
    document.querySelectorAll("[data-signal]").forEach((b) => {
      b.classList.toggle("active", b.dataset.signal === active);
    });
    const box = $("worldCountries");
    if (box) box.hidden = active !== "world";
    if (on && !timer) {
      started = Date.now();
      timer = setInterval(() => {
        const sec = Math.floor((Date.now() - started) / 1000);
        if ($("airtime")) {
          $("airtime").textContent = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60]
            .map((n) => String(n).padStart(2, "0"))
            .join(":");
        }
      }, 1000);
    }
    if (!on && timer) {
      clearInterval(timer);
      timer = 0;
      if ($("airtime")) $("airtime").textContent = "00:00:00";
    }
  }

  function clickWhenReady(id, tries) {
    const n = tries == null ? 20 : tries;
    const btn = $(id);
    if (btn) {
      btn.click();
      return true;
    }
    if (n <= 0) {
      console.warn("[cabin] botão do túnel ainda não existe:", id);
      return false;
    }
    setTimeout(() => clickWhenReady(id, n - 1), 150);
    return false;
  }

  function playActive() {
    const s = SIGNALS[active];
    if (!s) return;
    if (s.yt) {
      stopHtml();
      clickWhenReady(s.playId);
      return;
    }
    stopYt();
    if (active === "world") {
      const a = $("passportWorldAudio");
      if (!a) return;
      stopHtml();
      a.src = worldNow().url;
      a.play().catch((e) => console.warn("[cabin] world", e));
      return;
    }
    if (s.playId) clickWhenReady(s.playId);
  }

  function stopAll() {
    stopHtml();
    stopYt();
    setTimeout(paint, 80);
  }

  function select(id) {
    if (!SIGNALS[id]) return;
    active = id;
    paint();
    playActive();
    setTimeout(paint, 300);
  }

  function renderWorld() {
    const box = $("worldCountries");
    if (!box) return;
    box.innerHTML = WORLD.map((w) => '<button type="button" data-world="' + w.id + '">' + w.name + "</button>").join("");
    box.onclick = (e) => {
      const b = e.target.closest("[data-world]");
      if (!b) return;
      worldId = b.dataset.world;
      select("world");
    };
  }

  function renderSignals() {
    const drawer = $("signalsDrawer");
    if (!drawer) return;
    drawer.innerHTML = Object.entries(SIGNALS)
      .map(([k, s]) => '<button type="button" data-all-signal="' + k + '">' + s.label + "</button>")
      .join("");
    drawer.onclick = (e) => {
      const b = e.target.closest("[data-all-signal]");
      if (b) select(b.dataset.allSignal);
    };
  }

  if ($("quick")) {
    $("quick").addEventListener("click", (e) => {
      const b = e.target.closest("[data-signal]");
      if (b) select(b.dataset.signal);
    });
  }
  if ($("play")) $("play").onclick = () => playActive();
  if ($("stop")) $("stop").onclick = stopAll;
  if ($("mute")) {
    $("mute").onclick = () => {
      const muted = $("mute").dataset.on === "1";
      $("mute").dataset.on = muted ? "0" : "1";
      $("mute").textContent = muted ? "MUTE" : "UNMUTE";
      document.querySelectorAll("audio").forEach((a) => { a.muted = !muted; });
    };
  }
  if ($("volume")) {
    $("volume").oninput = (e) => {
      const v = Number(e.target.value);
      document.querySelectorAll("audio").forEach((a) => { a.volume = v; });
    };
  }
  if ($("signalsBtn")) $("signalsBtn").onclick = () => { $("signalsDrawer").hidden = !$("signalsDrawer").hidden; };
  if ($("playedBtn")) $("playedBtn").onclick = () => { $("playedDrawer").hidden = !$("playedDrawer").hidden; };

  document.addEventListener("play", () => setTimeout(paint, 0), true);
  document.addEventListener("pause", () => setTimeout(paint, 0), true);

  const yt = $("tunnelPlay");
  if (yt) {
    new MutationObserver(() => paint()).observe(yt, { childList: true, characterData: true, subtree: true });
  }

  renderWorld();
  renderSignals();
  paint();
  setInterval(paint, 800);
})();
