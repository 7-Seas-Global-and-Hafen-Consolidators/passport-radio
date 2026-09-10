/* Passport Radio · Cabine v7 · UMA cabine, UM som, TOCADAS só com dado real */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var session = {};   /* log real de sessão por sinal */
  var cur = null;

  function log(sig) {
    if (!sig) return;
    session[sig.id] = session[sig.id] || [];
    session[sig.id].unshift({ t: new Date(), name: sig.name });
    session[sig.id] = session[sig.id].slice(0, 10);
    renderTocadas();
  }
  function renderTocadas() {
    var btn = $('#pp-tocadas-btn'), panel = $('#pp-tocadas'), list = $('#pp-tocadas-list');
    if (!btn || !panel || !list) return;
    var entries = cur && session[cur.id] ? session[cur.id] : [];
    btn.style.display = entries.length ? '' : 'none';   /* sem histórico real = botão some */
    list.innerHTML = entries.map(function (e) {
      return '<li>' + e.t.toLocaleTimeString('pt-BR') + ' · ' + e.name + '</li>';
    }).join('');
  }
  function renderDrawer(reg) {
    var groups = { continuous: 'CONTINUOUS SIGNALS', tuneis: 'TÚNEIS PASSPORT', arquivo: 'ARQUIVO' };
    var box = $('#pp-sinais-list'); if (!box) return;
    box.innerHTML = Object.keys(groups).map(function (g) {
      var items = reg.signals.filter(function (s) { return s.group === g; });
      if (!items.length) return '';
      return '<h4>' + groups[g] + '</h4>' + items.map(function (s) {
        return '<button class="pp-sig" data-sid="' + s.id + '"><strong>' + s.name + '</strong><span>▶</span></button>';
      }).join('');
    }).join('') +
    '<h4>WORLD DIAL</h4><button class="pp-sig" data-sid="__world"><strong>🌍 WORLD DIAL · 18 ESTAÇÕES</strong><span>▶</span></button>';
    var sc = $('#pp-shortcuts');
    if (sc) {
      sc.innerHTML = (reg.shortcuts || []).map(function (id) {
        var s = reg.signals.filter(function (x) { return x.id === id; })[0];
        return s ? '<button class="pp-chip" data-sid="' + s.id + '">' + s.name + '</button>' : '';
      }).join('');
      sc.style.display = (reg.shortcuts && reg.shortcuts.length) ? '' : 'none';
    }
  }
  function openDrawer(o) { var d = $('#pp-drawer'); if (d) { d.classList.add('open'); } }
  function closeDrawer() { var d = $('#pp-drawer'); if (d) d.classList.remove('open'); }

  function renderEditorial() {
    fetch('rss.xml').then(function (r) { return r.text(); }).then(function (xml) {
      var doc = new DOMParser().parseFromString(xml, 'text/xml');
      var items = Array.prototype.slice.call(doc.querySelectorAll('item')).slice(0, 20);
      var box = $('#pp-editorial'); if (!box || !items.length) return;
      function card(it, cls) {
        var t = it.querySelector('title'), l = it.querySelector('link');
        return '<a class="' + cls + '" href="' + (l ? l.textContent : '#') + '"><strong>' + (t ? t.textContent : '') + '</strong></a>';
      }
      box.innerHTML = card(items[0], 'pp-ed-lead') +
        '<div class="pp-ed-4">' + items.slice(1, 5).map(function (i) { return card(i, 'pp-ed-card'); }).join('') + '</div>' +
        '<ol class="pp-ed-15">' + items.slice(5, 20).map(function (i) { return '<li>' + card(i, '') + '</li>'; }).join('') + '</ol>';
    }).catch(function () {
      var box = $('#pp-editorial');
      if (box) box.innerHTML = '<p class="pp-door">Redação indisponível agora · <a href="editorial.html">VER EDITORIAL →</a></p>';
    });
  }

  function init() {
    fetch('js/passport-registry.json').then(function (r) { return r.json(); }).then(function (reg) {
      window.PPAdapter.init(reg, function () {
        renderDrawer(reg);
        document.addEventListener('click', function (e) {
          if (e.target.closest('[data-ouvir]')) { openDrawer(); return; }
          if (e.target.closest('#pp-drawer-close')) { closeDrawer(); return; }
          var b = e.target.closest('[data-sid]');
          if (b) {
            var id = b.getAttribute('data-sid');
            if (id === '__world') { window.PPAdapter.play({ id: '__world', name: 'WORLD DIAL', hook: reg.world }); }
            else { var s = reg.signals.filter(function (x) { return x.id === id; })[0]; if (s) window.PPAdapter.play(s); }
            closeDrawer();
          }
          if (e.target.closest('#pp-tocadas-btn')) { var p = $('#pp-tocadas'); if (p) p.classList.toggle('open'); }
        });
        window.PPAdapter.on(function (ev, p) {
          if (ev === 'state' && p.state === 'PLAYING') { cur = p.signal; log(p.signal); }
          if (ev === 'state' || ev === 'paused') {
            var st = $('#pp-state'); if (st) st.textContent = p && p.state ? p.state : 'PAUSED';
            var nm = $('#pp-signal-name'); if (nm && p && p.signal) nm.textContent = p.signal.name;
          }
        });
        var pb = $('#pp-play');
        if (pb) pb.addEventListener('click', function () {
          if (window.PPAdapter.reg() && !cur) { openDrawer(); return; }
          if (pb.getAttribute('data-playing') === '1') { window.PPAdapter.pause(); pb.setAttribute('data-playing', '0'); pb.textContent = '▶'; }
          else { window.PPAdapter.resume(); pb.setAttribute('data-playing', '1'); pb.textContent = '⏸'; }
        });
      });
      renderEditorial();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
