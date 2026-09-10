/* Passport Radio · Mutex v7 · UM SOM, release-before-start, sem órfão */
(function (global) {
  'use strict';
  function M() { this.q = Promise.resolve(); this.gen = 0; this.owner = null; this.lis = []; }
  M.prototype.on = function (fn) { this.lis.push(fn); };
  M.prototype._emit = function (ev, p) { this.lis.forEach(function (f) { try { f(ev, p); } catch (e) {} }); };
  M.prototype._silence = function () {
    var cur = this.owner; this.owner = null;
    if (cur && cur.handle && cur.handle.silence) { try { cur.handle.silence(); } catch (e) {} }
    this._emit('silence', cur ? cur.id : null);
    return Promise.resolve();
  };
  M.prototype.acquire = function (id, handle, startFn) {
    var self = this, gen = ++this.gen;
    var out = this.q.then(function () {
      if (gen !== self.gen) return Promise.reject({ mute: true });
      return self._silence().then(function () {
        if (gen !== self.gen) throw { mute: true };
        self.owner = { id: id, gen: gen, handle: handle };
        self._emit('acquire', { id: id, gen: gen });
        return startFn();
      });
    });
    this.q = out.then(function (v) { return v; }, function (e) { if (e && e.mute) return; throw e; });
    return out;
  };
  M.prototype.release = function () { var self = this; ++this.gen; this.q = this.q.then(function () { return self._silence(); }); return this.q; };
  global.PPMutex = new M();
})(window);
