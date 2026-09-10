/* PASSPORT RADIO · PAINEL DE DECISÃO · ZERO STREAM URL */
(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  let active = "live-rare", started = 0, timer = 0;
  const SIGNALS = {
    "live-rare": { label: "LIVE & RARE™", play: "tunnelPlay", special: true },
    "80s": { label: "80s TUNNEL™", play: "passport80sPlay", audio: "passport80sAudio" },
    soul: { label: "SOUL TUNNEL™", play: "passportSoulPlay", audio: "passportSoulAudio" },
    mpb: { label: "MPB TUNNEL™", play: "passportMPBPlay", audio: "passportMPBAudio" },
    hits: { label: "PASSPORT HITS™", play: "passportHitsPlay", audio: "passportHitsAudio" },
    "5060": { label: "50s & 60s TUNNEL™", play: "passport5060Play", audio: "passport5060Audio" },
    brrock: { label: "ROCK BRASIL TUNNEL™", play: "passportBRRockPlay", audio: "passportBRRockAudio" },
    flash: { label: "FLASH HOUSE TUNNEL™", play: "passportFlashPlay", audio: "passportFlashHouseAudio" },
    metal: { label: "METAL WARRIORS", live: "metalwarriors", audio: "passport-live-audio" },
    unplugged: { label: "UNPLUGGED", live: "unplugged", audio: "passport-live-audio" },
    gothic: { label: "GOTHIC PASSPORT™", live: "gothic", audio: "passport-live-audio" },
    livejam: { label: "LIVE JAM", live: "livejam", audio: "passport-live-audio" },
    novelas: { label: "NOVELAS TUNNEL™", play: "novelasPlay", special: true },
    world: { label: "WORLD DIAL™", route: "/radio-mundo.html" },
    globo: { label: "GLOBO DE OURO", route: "/globo-de-ouro-player.html" }
  };
  function isPlaying(id) {
    const s = SIGNALS[id]; if (!s) return false;
    if (s.audio) { const a = $(s.audio); return !!a && !a.paused; }
    if (id === "live-rare") { const b = $("tunnelPlay"); return !!b && (b.textContent || "").trim() === "Ⅱ"; }
    if (id === "novelas") { const b = $("novelasPlay"); return !!b && (b.textContent || "").trim() === "PAUSE"; }
    return false;
  }
  function booted(id) {
    const s = SIGNALS[id]; if (!s) return false;
    if (s.route) return true;
    if (s.live) return !!$("passport-live-play") && !!document.querySelector(`[data-live-channel="${s.live}"]`);
    return !!$(s.play);
  }
  function stopSpecial(id) {
    if (id === "live-rare") { const b = $("tunnelPlay"); if (b && (b.textContent || "").trim() === "Ⅱ") b.click(); }
    if (id === "novelas") { const b = $("novelasPlay"); if (b && (b.textContent || "").trim() === "PAUSE") b.click(); }
  }
  function registerSpecials() {
    if (!window.PassportBus) return;
    window.PassportBus.register("live-rare", () => stopSpecial("live-rare"));
    window.PassportBus.register("novelas", () => stopSpecial("novelas"));
  }
  function paint() {
    const s = SIGNALS[active]; if (!s) return; const on = isPlaying(active);
    if ($("signal")) $("signal").textContent = s.label;
    if ($("status")) { $("status").textContent = on ? "ON AIR" : "CALADA"; $("status").className = on ? "live" : ""; }
    if ($("ledOn")) $("ledOn").className = "led" + (on ? " on" : "");
    if ($("source")) $("source").textContent = on ? "ATIVO" : "—";
    document.querySelectorAll("[data-signal]").forEach(b => b.classList.toggle("active", b.dataset.signal === active));
    if (on && !timer) { started = Date.now(); timer = setInterval(() => { const sec = Math.floor((Date.now() - started) / 1000); if ($("airtime")) $("airtime").textContent = [Math.floor(sec / 3600), Math.floor((sec % 3600) / 60), sec % 60].map(n => String(n).padStart(2, "0")).join(":"); }, 1000); }
    if (!on && timer) { clearInterval(timer); timer = 0; if ($("airtime")) $("airtime").textContent = "00:00:00"; }
  }
  function fire(id) {
    const s = SIGNALS[id]; if (!s || !booted(id)) return;
    if (s.route) { window.PassportBus && window.PassportBus.silence(); location.href = s.route; return; }
    active = id;
    if (s.special && window.PassportBus) window.PassportBus.claim(id, null);
    if (s.live) { const chip = document.querySelector(`[data-live-channel="${s.live}"]`); if (chip) chip.click(); }
    else { const b = $(s.play); if (b) b.click(); }
    setTimeout(paint, 40);
  }
  function stop() { if (window.PassportBus) window.PassportBus.silence(); setTimeout(paint, 40); }
  function renderSignals() {
    const d = $("signalsDrawer"); if (!d) return;
    d.innerHTML = Object.entries(SIGNALS).filter(([id]) => booted(id)).map(([id, s]) => `<button type="button" data-all-signal="${id}">${s.label}</button>`).join("");
    d.onclick = e => { const b = e.target.closest("[data-all-signal]"); if (b) fire(b.dataset.allSignal); };
  }
  if ($("quick")) $("quick").addEventListener("click", e => { const b = e.target.closest("[data-signal]"); if (b) fire(b.dataset.signal); });
  if ($("play")) $("play").onclick = () => fire(active);
  if ($("stop")) $("stop").onclick = stop;
  if ($("mute")) $("mute").onclick = () => { const on = $("mute").dataset.on !== "1"; $("mute").dataset.on = on ? "1" : "0"; $("mute").textContent = on ? "UNMUTE" : "MUTE"; document.querySelectorAll("audio").forEach(a => a.muted = on); };
  if ($("volume")) $("volume").oninput = e => { const v = Number(e.target.value); document.querySelectorAll("audio").forEach(a => a.volume = v); };
  if ($("signalsBtn")) $("signalsBtn").onclick = () => { $("signalsDrawer").hidden = !$("signalsDrawer").hidden; };
  if ($("playedBtn")) $("playedBtn").hidden = true;
  document.addEventListener("play", e => { if (!(e.target instanceof HTMLMediaElement)) return; const found = Object.entries(SIGNALS).find(([, s]) => s.audio === e.target.id); if (found) active = found[0]; setTimeout(paint, 0); }, true);
  document.addEventListener("pause", () => setTimeout(paint, 0), true);
  setTimeout(() => { registerSpecials(); renderSignals(); paint(); }, 700);
})();
