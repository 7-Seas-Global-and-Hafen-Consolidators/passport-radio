/* PASSPORT BAR BUS — Continuous dono de #play. Túnel = click no playId do motor. */
(() => {
  "use strict";
  const $ = (s) => document.querySelector(s);
  let ST = [], active = null, loaded = {};

  function isOn(st) {
    if (!st || !st.playId) return false;
    const el = document.getElementById(st.statusId || "passport80sStatus");
    const t = el ? (el.textContent || "") : "";
    return /ON AIR|TOCANDO|PLAYING|NO AR/i.test(t);
  }
  function clickId(id) {
    const b = document.getElementById(id);
    if (b) b.click();
    return !!b;
  }
  function waitId(id, tries) {
    return new Promise((res) => {
      let n = 0;
      const t = setInterval(() => {
        if (document.getElementById(id) || ++n > (tries || 40)) {
          clearInterval(t);
          res(document.getElementById(id));
        }
      }, 50);
    });
  }
  function loadScript(st) {
    if (!st.script || loaded[st.id]) return Promise.resolve();
    return new Promise((res) => {
      const s = document.createElement("script");
      s.src = st.script + "?v=20260909shell2";
      s.defer = true;
      s.addEventListener("load", () => { loaded[st.id] = 1; res(); }, { once: true });
      s.addEventListener("error", () => res(), { once: true });
      document.head.appendChild(s);
    });
  }
  async function playLegacy(st) {
    if (!st || st.enabled === false || !st.playId) return;
    const audio = document.getElementById("audio");
    if (audio && !audio.paused) audio.pause();
    if (active && active !== st && active.playId && isOn(active)) clickId(active.playId);
    await loadScript(st);
    await waitId(st.playId, 50);
    if (!isOn(st)) clickId(st.playId);
    active = st;
    const track = $("#track"), meta = $("#meta"), state = $("#state");
    if (track) track.textContent = st.label;
    if (meta) meta.textContent = st.now || "Passport Radio · Túnel";
    if (state) state.textContent = "NO AR";
  }
  function paintChips() {
    document.querySelectorAll("[data-st]").forEach((c) => {
      c.setAttribute("aria-pressed", String(c.dataset.st === (active ? active.id : "continuous")));
    });
  }
  async function boot() {
    try {
      const r = await fetch("/data/stations.json?v=20260909shell2", { cache: "no-store" });
      if (r.ok) ST = ((await r.json()).stations || []);
    } catch (e) { ST = []; }
    const box = $("#pp-chips");
    if (box) {
      ST.forEach((st) => {
        const b = document.createElement("button");
        b.type = "button"; b.className = "pp-chip"; b.dataset.st = st.id;
        b.textContent = st.enabled === false ? st.label + " · EM BREVE" : st.label;
        if (st.enabled === false) b.disabled = true;
        b.addEventListener("click", () => {
          if (st.adapter === "native") {
            if (active && active.playId && isOn(active)) clickId(active.playId);
            active = st;
            const p = document.getElementById("play");
            if (p) p.click();
          } else playLegacy(st);
          paintChips();
        });
        box.appendChild(b);
      });
    }
    active = ST.find((s) => s.adapter === "native") || null;
    paintChips();
    window.PassportBarBus = Object.freeze({ playLegacy, list: () => ST, current: () => active });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
