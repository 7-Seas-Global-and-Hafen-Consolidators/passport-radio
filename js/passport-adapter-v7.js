/* Passport Radio · Adapter v7 · religa os engines EXISTENTES, não recria nada */
(function (global) {
  'use strict';
  var REG = null, bay = null, cur = null, boundEl = null, boundIframe = null, loaded = {};
  var lis = [];
  function on(fn) { lis.push(fn); }
  function emit(ev, p) { lis.forEach(function (f) { try { f(ev, p); } catch (e) {} }); }
  function allAudio() { return Array.prototype.slice.call(document.querySelectorAll('audio')); }
  function allIframes() { return bay ? Array.prototype.slice.call(bay.querySelectorAll('iframe')) : []; }
  function silenceAll() {
    allAudio().forEach(function (a) { try { a.pause(); } catch (e) {} });
    allIframes().forEach(function (fr) {
      try { fr.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'); } catch (e) {}
      try { fr.parentNode.removeChild(fr); } catch (e) {}
    });
    boundEl = null; boundIframe = null;
    emit('paused', null);
  }
  function loadScript(src, cb) {
    if (loaded[src]) { cb && cb(); return; }
    loaded[src] = 1;
    var s = document.createElement('script'); s.src = src;
    s.onload = function () { cb && cb(); };
    s.onerror = function () { emit('engine-error', { src: src }); };
    document.head.appendChild(s);
  }
  function loadEngines(cb) {
    var list = (REG && REG.engineScripts) || [], i = 0;
    (function next() { if (i >= list.length) { cb && cb(); return; } loadScript(list[i++], next); })();
  }
  function bindPlayingEl() {
    boundEl = null;
    allAudio().forEach(function (a) { if (a.id !== 'pp-bus' && !a.paused) boundEl = a; });
  }
  function play(sig) {
    return global.PPMutex.acquire(sig.id, { silence: silenceAll }, function () {
      cur = sig; boundEl = null; boundIframe = null;
      emit('state', { state: 'LOADING', signal: sig });
      return new Promise(function (res) {
        var h = sig.hook || {};
        if (h.type === 'iframe') {
          var fr = document.createElement('iframe');
          fr.src = h.url; fr.allow = 'autoplay'; fr.title = sig.name;
          bay.appendChild(fr); boundIframe = fr;
          setTimeout(function () { emit('state', { state: 'PLAYING', signal: sig }); res(); }, 600);
          return;
        }
        if (h.type === 'global') {
          try {
            var parts = h.global.split('.'), g = global;
            for (var i = 0; i < parts.length - 1; i++) g = g[parts[i]];
            g[parts[parts.length - 1]]();
          } catch (e) { emit('engine-error', { id: sig.id }); }
          setTimeout(function () { bindPlayingEl(); emit('state', { state: 'PLAYING', signal: sig }); res(); }, 500);
          return;
        }
        var btn = h.id ? document.getElementById(h.id) : null;
        if (!btn && h.chip) {
          var chip = document.querySelector('[data-live-channel="' + h.chip + '"]');
          if (chip) { chip.click(); btn = document.getElementById('passport-live-play'); }
        }
        if (!btn && h.autodiscover) {
          btn = document.querySelector('[id*="' + h.autodiscover.split('|')[0] + '" i]');
        }
        if (btn) { try { btn.click(); } catch (e) {} }
        setTimeout(function () {
          bindPlayingEl();
          emit('state', { state: (boundEl && !boundEl.paused) ? 'PLAYING' : 'STANDBY', signal: sig });
          res();
        }, 600);
      });
    }).catch(function (e) { if (e && e.mute) return; emit('state', { state: 'ERROR', signal: sig }); });
  }
  function pause() {
    if (boundEl) { try { boundEl.pause(); } catch (e) {} }
    if (boundIframe) {
      try { boundIframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*'); } catch (e) {}
      try { boundIframe.parentNode.removeChild(boundIframe); } catch (e) {}
      boundIframe = null;
    }
    emit('paused', cur);
  }
  function resume() { if (cur) play(cur); }
  function init(cfg, cb) {
    REG = cfg;
    bay = document.getElementById('pp-bay');
    if (!bay) { bay = document.createElement('div'); bay.id = 'pp-bay'; document.body.appendChild(bay); }
    loadEngines(cb);
  }
  global.PPAdapter = { init: init, play: play, pause: pause, resume: resume, silence: silenceAll, on: on, reg: function () { return REG; } };
})(window);
