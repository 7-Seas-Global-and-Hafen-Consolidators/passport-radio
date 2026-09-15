/* PASSPORT CATALUNYA™ · isolated HLS house. */
(() => {
  "use strict";
  const host = document.getElementById("passportCatalunyaPlayer");
  if (!host || document.getElementById("passportCatalunyaAudio")) return;
  const stream = "https://mdstrm.com/audio/65afe517d47dc208abd053d2/live.m3u8";
  const hlsMime = "application/vnd.apple.mpegurl";
  const hlsCdn = "https://cdn.jsdelivr.net/npm/hls.js@1.7.0/dist/hls.min.js";
  host.innerHTML = '<div class="house-tools"><button id="passportCatalunyaPlay" type="button" aria-label="Reprodueix PASSPORT CATALUNYA™">▶ REPRODUEIX</button><span id="passportCatalunyaStatus" role="status">SENYAL EN DIRECTE · A PUNT</span></div><audio id="passportCatalunyaAudio" preload="none"></audio>';
  const audio = document.getElementById("passportCatalunyaAudio");
  const play = document.getElementById("passportCatalunyaPlay");
  const status = document.getElementById("passportCatalunyaStatus");
  let hls = null;
  let loader = null;
  const nativeHls = () => !!audio.canPlayType(hlsMime);
  const destroyHls = () => { if (hls) { hls.destroy(); hls = null; } };
  const loadHls = () => {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (loader) return loader;
    loader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = hlsCdn;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = () => window.Hls ? resolve(window.Hls) : reject(new Error("HLS unavailable"));
      script.onerror = () => reject(new Error("HLS unavailable"));
      document.head.appendChild(script);
    }).catch(error => { loader = null; throw error; });
    return loader;
  };
  const prepareHls = async () => {
    if (nativeHls()) { audio.src = stream; return; }
    const Hls = await loadHls();
    if (!Hls.isSupported()) throw new Error("HLS unsupported");
    destroyHls();
    await new Promise((resolve, reject) => {
      const instance = new Hls({ enableWorker: true });
      hls = instance;
      let settled = false;
      const finish = (fn, value) => { if (!settled) { settled = true; fn(value); } };
      instance.on(Hls.Events.MEDIA_ATTACHED, () => instance.loadSource(stream));
      instance.on(Hls.Events.MANIFEST_PARSED, () => finish(resolve));
      instance.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          destroyHls();
          finish(reject, new Error(data.details || "HLS fatal"));
        }
      });
      instance.attachMedia(audio);
    });
  };
  const unavailable = () => {
    destroyHls();
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    play.textContent = "▶ REPRODUEIX";
    status.textContent = "NO DISPONIBLE · TORNA-HI A PROVAR";
  };
  const start = async () => {
    try {
      window.PassportBus.claim();
      if (!audio.getAttribute("src") && !hls) {
        status.textContent = "CARREGANT…";
        await prepareHls();
      }
      await audio.play();
    } catch (_) { unavailable(); }
  };
  play.addEventListener("click", () => audio.paused ? start() : audio.pause());
  audio.addEventListener("playing", () => {
    play.textContent = "❚❚ PAUSA";
    status.textContent = "EN DIRECTE";
  });
  audio.addEventListener("pause", () => {
    if (!audio.error) {
      play.textContent = "▶ REPRODUEIX";
      status.textContent = "PAUSAT";
    }
  });
  audio.addEventListener("waiting", () => { status.textContent = "CARREGANT…"; });
  audio.addEventListener("stalled", () => { status.textContent = "CARREGANT…"; });
  audio.addEventListener("error", unavailable);
})();