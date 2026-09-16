#!/usr/bin/env node
/* Playwright: Live & Rare motor contracts with a mocked YT.Player.
   Does not hit YouTube. Does not touch other signals. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8766;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml"
};

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      const rel = url === "/" ? "/radio-live-rare.html" : url;
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const MOCK = `(() => {
  window.YT = window.YT || {};
  window.YT.PlayerState = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };
  class FakePlayer {
    constructor(id, opts) {
      this.opts = opts;
      this.state = -1;
      this.list = [];
      this.idx = 0;
      this.data = { title: "", video_id: "" };
      this.cues = [];
      window.__ytPlayers = (window.__ytPlayers || 0) + 1;
      window.__lastPlayer = this;
      setTimeout(() => opts.events && opts.events.onReady && opts.events.onReady({ target: this }), 0);
    }
    cuePlaylist(cfg) {
      this.cues.push({ kind: "playlist", list: cfg.list });
      this.list = ["vidA", "vidB", "vidC"];
      this.idx = 0;
      this.data = { title: "Mock Playlist Track", video_id: "vidA" };
      this.state = 5;
      setTimeout(() => this.opts.events.onStateChange({ data: 5, target: this }), 0);
    }
    cueVideoById(cfg) {
      this.cues.push({ kind: "video", videoId: cfg.videoId });
      this.list = [];
      this.idx = 0;
      this.data = { title: "Mock Direct Video", video_id: cfg.videoId };
      this.state = 5;
      setTimeout(() => this.opts.events.onStateChange({ data: 5, target: this }), 0);
    }
    playVideo() {
      this.state = 1;
      this.opts.events.onStateChange({ data: 1, target: this });
    }
    pauseVideo() {
      this.state = 2;
      this.opts.events.onStateChange({ data: 2, target: this });
    }
    nextVideo() { this.idx = Math.min(this.idx + 1, Math.max(this.list.length - 1, 0)); this.playVideo(); }
    previousVideo() { this.idx = Math.max(this.idx - 1, 0); this.playVideo(); }
    playVideoAt(n) { this.idx = n; this.playVideo(); }
    getPlayerState() { return this.state; }
    getPlaylist() { return this.list; }
    getPlaylistIndex() { return this.idx; }
    getVideoData() { return this.data; }
    getDuration() { return 180; }
    getCurrentTime() { return 12; }
    unMute() {}
    setVolume() {}
    seekTo() {}
  }
  window.YT.Player = FakePlayer;
  if (typeof window.onYouTubeIframeAPIReady === "function") window.onYouTubeIframeAPIReady();
})();`;

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  console.log(`${ok ? "OK" : "NO"}  ${name}${detail ? " — " + detail : ""}`);
}

const server = await serve();
const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"]
});
try {
  const page = await browser.newPage();
  await page.addInitScript(MOCK);
  await page.goto(`http://127.0.0.1:${PORT}/radio-live-rare.html`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  const engines = await page.locator("#passport-tunnel-engine").count();
  record("single engine node", engines === 1, String(engines));

  const players = await page.evaluate(() => window.__ytPlayers || 0);
  record("single YT.Player", players === 1, String(players));

  const catalogN = await page.evaluate(() => (window.PASSPORT_TUNNEL_PLAYLISTS || []).length);
  record("catalog loaded", catalogN >= 200, String(catalogN));

  const first = await page.evaluate(() => window.PASSPORT_TUNNEL_PLAYLISTS[0]);
  record("catalog starts sequential (not source-rotated)", !!first && first.group === "The Midnight Special", JSON.stringify(first && first.group));

  await page.waitForTimeout(400);
  const ready = await page.locator("#tunnelStatus").textContent();
  record("first source cues to READY", (ready || "").trim() === "READY", ready);

  const firstCue = await page.evaluate(() => (window.__lastPlayer && window.__lastPlayer.cues[0]) || null);
  record("first cue is playlist (Midnight artist list)", !!(firstCue && firstCue.kind === "playlist"), JSON.stringify(firstCue));

  await page.click("#tunnelPlay");
  await page.waitForTimeout(100);
  const playing = await page.locator("#tunnelStatus").textContent();
  record("play", (playing || "").trim() === "PLAYING", playing);

  await page.click("#tunnelPlay");
  await page.waitForTimeout(100);
  const paused = await page.locator("#tunnelStatus").textContent();
  record("pause", (paused || "").trim() === "PAUSED", paused);

  await page.click("#tunnelPlay");
  await page.click("#tunnelNext");
  await page.waitForTimeout(100);
  const afterNext = await page.evaluate(() => window.__lastPlayer && window.__lastPlayer.idx);
  record("next advances inside playlist", afterNext === 1, String(afterNext));

  await page.click("#tunnelPrev");
  await page.waitForTimeout(100);
  const afterPrev = await page.evaluate(() => window.__lastPlayer && window.__lastPlayer.idx);
  record("previous returns inside playlist", afterPrev === 0, String(afterPrev));

  const beforeJump = await page.locator("#tunnelDiagnostic").textContent();
  await page.click("#tunnelNextPlaylist");
  await page.waitForTimeout(300);
  const afterJump = await page.locator("#tunnelDiagnostic").textContent();
  record("next playlist is sequential catalog+1", /playlist 2\//.test(afterJump || ""), `${beforeJump} -> ${afterJump}`);

  await page.click("#tunnelPrevPlaylist");
  await page.waitForTimeout(300);
  const back = await page.locator("#tunnelDiagnostic").textContent();
  record("previous playlist returns to catalog 1", /playlist 1\//.test(back || ""), back);

  await page.evaluate(() => {
    const p = window.__lastPlayer;
    if (p && p.opts && p.opts.events && p.opts.events.onStateChange) p.opts.events.onStateChange({ data: 0, target: p });
  });
  await page.waitForTimeout(200);
  const afterEnded = await page.evaluate(() => window.__lastPlayer && window.__lastPlayer.state);
  record("ENDED advances", afterEnded === 1, String(afterEnded));

  await page.evaluate(() => {
    const p = window.__lastPlayer;
    if (p && p.opts && p.opts.events && p.opts.events.onError) p.opts.events.onError({ data: 150, target: p });
  });
  await page.waitForTimeout(800);
  const skipped = await page.locator("#tunnelStatus").textContent();
  record("error skip does not crash", !!(skipped && skipped.trim()), skipped);

  const rotation = await page.evaluate(() => {
    const src = document.querySelector("script[src*='tunnel-player.js']");
    return fetch(src.src).then((r) => r.text()).then((t) => ({
      rotation: /rotatingPlaylistIndex|sourceGroups/.test(t),
      cueVideo: t.includes("cueVideoById"),
      sequential: t.includes("loadPlaylist(playlistIndex + 1")
    }));
  });
  record("player source has no rotation policy", rotation.rotation === false, JSON.stringify(rotation));
  record("player source still cues videos", rotation.cueVideo === true);
  record("player source still advances sequentially", rotation.sequential === true);

  const failed = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    failed.forEach((f) => console.error("FAIL", f.name, f.detail || ""));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server.close();
}
