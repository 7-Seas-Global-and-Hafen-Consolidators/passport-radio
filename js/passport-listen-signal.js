/* PASSPORT LISTEN SIGNAL — extraído de portal-home.js
   Mantém CounterAPI heartbeat sem o restante do legado.
   Carregar na Home se quiser preservar métrica de ouvintes.
*/
(() => {
  "use strict";
  const namespace = "passportradio.online";
  const action = "listen";
  const key = "signal";
  const endpoint = `https://counterapi.com/api/${namespace}/${action}/${key}`;
  const readEndpoint = `${endpoint}?readOnly=true&timeline=15m&unique=true`;
  const HEARTBEAT_MS = 4 * 60 * 1000;
  let lastHeartbeat = 0;

  const anyMediaPlaying = () =>
    Array.from(document.querySelectorAll("audio,video")).some(
      (media) => !media.paused && !media.ended && media.readyState > 1
    );

  const sendHeartbeat = () => {
    const now = Date.now();
    if (now - lastHeartbeat < 30000) return;
    lastHeartbeat = now;
    fetch(`${endpoint}?trackOnly=true`, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      credentials: "omit"
    }).catch(() => {});
  };

  const readListeners = async () => {
    try {
      const response = await fetch(readEndpoint, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        credentials: "omit"
      });
      if (!response.ok) return;
      const data = await response.json();
      const value = Number(data && data.value);
      if (!Number.isFinite(value)) return;
      document.querySelectorAll("[data-passport-listeners]").forEach((node) => {
        node.textContent = value.toLocaleString("pt-BR");
      });
    } catch (_) {}
  };

  document.addEventListener(
    "play",
    (event) => {
      if (!(event.target instanceof HTMLMediaElement)) return;
      sendHeartbeat();
      window.setTimeout(readListeners, 700);
    },
    true
  );

  window.setInterval(() => {
    if (!document.hidden && anyMediaPlaying()) {
      sendHeartbeat();
      window.setTimeout(readListeners, 700);
    }
  }, HEARTBEAT_MS);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && anyMediaPlaying()) {
      sendHeartbeat();
      window.setTimeout(readListeners, 700);
    }
  });
})();
