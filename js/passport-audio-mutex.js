/* PASSPORT RADIO · Cirurgia A · mutex de transporte
   Um som. Release-before-start. Não reescreve engine. */
(function () {
  "use strict";
  var owner = null;
  var gen = 0;

  function pauseAllHtml5(keep) {
    document.querySelectorAll("audio,video").forEach(function (m) {
      if (m === keep) return;
      try { if (!m.paused) m.pause(); } catch (_) {}
    });
  }

  function pauseYouTubeLocal() {
    var tp = document.getElementById("tunnelPlay");
    if (tp && (tp.textContent || "").trim() === "Ⅱ") {
      try { tp.click(); } catch (_) {}
    }
    if (window.PassportNovelasTunnel && typeof window.PassportNovelasTunnel.stop === "function") {
      try { window.PassportNovelasTunnel.stop(); } catch (_) {}
    }
    var frame = document.getElementById("ppv2GloboFrame");
    try {
      var doc = frame && frame.contentDocument;
      var btn = doc && doc.getElementById("gdoPlay");
      var st = doc && doc.getElementById("gdoStatus");
      if (btn && st && (st.textContent || "").indexOf("ON AIR") !== -1) btn.click();
    } catch (_) {}
  }

  function pauseWorld() {
    var a = document.getElementById("world-audio");
    try { if (a && !a.paused) a.pause(); } catch (_) {}
    var stop = document.getElementById("world-stop");
    if (stop) try { stop.click(); } catch (_) {}
  }

  function pauseApi() {
    if (window.PassportBRRockTunnel && typeof window.PassportBRRockTunnel.stop === "function") {
      try { window.PassportBRRockTunnel.stop(); } catch (_) {}
    }
  }

  function release(exceptKeepAudio) {
    gen += 1;
    pauseApi();
    pauseYouTubeLocal();
    pauseWorld();
    pauseAllHtml5(exceptKeepAudio);
    owner = null;
    return gen;
  }

  function claim(id, keepAudio) {
    var token = release(keepAudio);
    owner = id;
    return token;
  }

  window.PPMutex = {
    release: release,
    claim: claim,
    owner: function () { return owner; },
    gen: function () { return gen; }
  };
})();