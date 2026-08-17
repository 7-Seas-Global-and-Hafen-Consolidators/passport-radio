/*
  PASSPORT RADIO
  GLOBAL PLAYER ENGINE
  --------------------
  Persists playback state between Passport Radio pages.
  Does not modify page colors, layout or editorial content.
*/

(() => {
  "use strict";

  const STORAGE_KEY = "passportRadioGlobalPlayer";

  function saveState(audio) {
    if (!audio || !audio.src) return;

    const state = {
      src: audio.currentSrc || audio.src,
      currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
      volume: audio.volume,
      muted: audio.muted,
      playing: !audio.paused && !audio.ended,
      savedAt: Date.now()
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function readState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function findAudio() {
    return document.querySelector("audio");
  }

  function restoreState(audio) {
    const state = readState();

    if (!audio || !state || !state.src) return;

    const absoluteCurrentSrc = audio.currentSrc || audio.src;

    /*
      Restore only when this page is using the same audio source.
      This prevents the script from replacing playlists or tracks.
    */
    if (
      absoluteCurrentSrc &&
      new URL(absoluteCurrentSrc, location.href).href !==
      new URL(state.src, location.href).href
    ) {
      return;
    }

    audio.volume =
      typeof state.volume === "number" ? state.volume : audio.volume;

    audio.muted = !!state.muted;

    const elapsed =
      state.playing && state.savedAt
        ? Math.max(0, (Date.now() - state.savedAt) / 1000)
        : 0;

    const targetTime = Math.max(
      0,
      Number(state.currentTime || 0) + elapsed
    );

    const applyTime = () => {
      try {
        if (
          Number.isFinite(audio.duration) &&
          audio.duration > 0
        ) {
          audio.currentTime = Math.min(
            targetTime,
            Math.max(0, audio.duration - 0.25)
          );
        } else {
          audio.currentTime = targetTime;
        }
      } catch (e) {}

      if (state.playing) {
        const promise = audio.play();

        if (promise && typeof promise.catch === "function") {
          promise.catch(() => {
            /*
              Browser autoplay policy may require one user interaction.
              Playback state remains saved.
            */
          });
        }
      }
    };

    if (audio.readyState >= 1) {
      applyTime();
    } else {
      audio.addEventListener("loadedmetadata", applyTime, { once: true });
    }
  }

  function install() {
    const audio = findAudio();

    if (!audio) return;

    restoreState(audio);

    const save = () => saveState(audio);

    audio.addEventListener("play", save);
    audio.addEventListener("pause", save);
    audio.addEventListener("volumechange", save);
    audio.addEventListener("seeked", save);
    audio.addEventListener("ended", save);

    setInterval(() => {
      if (!audio.paused) saveState(audio);
    }, 1000);

    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") save();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install);
  } else {
    install();
  }
})();
