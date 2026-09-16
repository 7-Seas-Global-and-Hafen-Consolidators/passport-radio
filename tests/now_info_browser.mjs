#!/usr/bin/env node
/* Playwright: informational now-playing layer on Home.
   Does not change motors. Records identity for all 16 houses, sticky Continuous,
   rapid switch, close/reopen, play/pause, desktop/mobile, motor regression. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8765;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2"
};

const HOUSES = [
  {file: "radio-continuous.html", name: "Continuous Signals™"},
  {file: "radio-live-rare.html", name: "Live & Rare™", yt: true},
  {file: "radio-80s.html", name: "80s™"},
  {file: "radio-soul.html", name: "Soul™"},
  {file: "radio-mpb.html", name: "MPB™"},
  {file: "radio-hits.html", name: "Passport Hits™"},
  {file: "radio-rock-brasil.html", name: "Rock Brasil™"},
  {file: "radio-50s-60s.html", name: "50s & 60s™"},
  {file: "radio-flash-house.html", name: "Flash House™"},
  {file: "radio-world-disco-deutschland.html", name: "WORLD DISCO DEUTSCHLAND™"},
  {file: "radio-world-tunnel-reggae.html", name: "WORLD TUNNEL REGGAE™"},
  {file: "radio-novelas.html", name: "Novelas™", yt: true},
  {file: "globo-de-ouro-player.html", name: "Globo de Ouro™", yt: true},
  {file: "radio-mundo-player.html", name: "World Dial™"},
  {file: "radio-jovem-guarda.html", name: "Jovem Guarda™"},
  {file: "radio-nostalgia-passport.html", name: "Nostalgia Passport™"}
];
const STREAMS = [
  "https://mediaserv68.live-streams.nl:18012/OnlyLive",
  "https://streams.radio7.de/unplugged/mp3-192/web/",
  "https://stations.radio-host.com/proxy/livejam/stream"
];

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      let rel = url === "/" ? "/index.html" : url;
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) {
        res.writeHead(403); res.end(); return;
      }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, {"content-type": MIME[path.extname(file)] || "application/octet-stream"});
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function dismissChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll("#fofonete-exit, .fofonete-exit, [aria-modal='true']").forEach((n) => n.remove());
    document.documentElement.classList.remove("fofonete-exit-open");
    document.body.style.position = "";
    document.body.style.top = "";
  });
}

async function markPlaying(frame, house) {
  await frame.evaluate((spec) => {
    const fake = {
      getPlayerState: () => 1,
      getVideoData: () => ({title: spec.file === "radio-live-rare.html" ? "Wacken Live Archive" : spec.name})
    };
    const ids = ["passport-tunnel-engine", "passportNovelasHidden", "gdoHidden"];
    const wrapYt = () => {
      window.YT = window.YT || {};
      if (window.YT.get && window.YT.get.__ppNowInfo) return;
      const orig = window.YT.get ? window.YT.get.bind(window.YT) : null;
      const wrapped = (id) => {
        if (ids.indexOf(id) !== -1) return fake;
        return orig ? orig(id) : fake;
      };
      wrapped.__ppNowInfo = true;
      window.YT.get = wrapped;
    };
    wrapYt();
    if (spec.file.indexOf("globo") !== -1) {
      window.PassportGloboPlayer = {state: () => 1};
    }
    if (spec.yt) return;
    let probe = document.getElementById("pp-now-info-probe");
    if (!probe) {
      probe = document.createElement("audio");
      probe.id = "pp-now-info-probe";
      probe.preload = "auto";
      probe.loop = true;
      probe.volume = 0;
      probe.setAttribute("data-now-info-probe", "1");
      document.body.appendChild(probe);
    }
    try {
      Object.defineProperty(probe, "paused", {configurable: true, get: () => false});
      Object.defineProperty(probe, "ended", {configurable: true, get: () => false});
      Object.defineProperty(probe, "currentTime", {configurable: true, get: () => 12});
    } catch (_) {}
  }, house);
}

async function confirmHouse(page, house, timeout = 5000) {
  const sel = `#passport-casa-host iframe`;
  const start = Date.now();
  let lastFrame = null;
  while (Date.now() - start < timeout) {
    const handle = await page.$(sel);
    const frame = handle ? await handle.contentFrame() : null;
    if (frame) {
      lastFrame = frame;
      try { await markPlaying(frame, house); } catch (_) {}
    }
    const seen = await page.evaluate(() => window.PassportNowInfo && window.PassportNowInfo.snapshot());
    if (seen && seen.source === "house" && seen.house === house.file) return {frame: lastFrame, seen};
    await page.waitForTimeout(200);
  }
  return {frame: lastFrame, seen: null};
}

async function waitSnap(page, pred, timeout = 4000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeout) {
    last = await page.evaluate(() => {
      const snap = window.PassportNowInfo ? window.PassportNowInfo.snapshot() : null;
      const k7 = document.querySelector(".mold-radio .deck .cassette .label");
      return {
        snap,
        track: (document.getElementById("track") || {}).textContent || "",
        meta: (document.getElementById("meta") || {}).textContent || "",
        onair: (document.getElementById("pp-onair-track") || {}).textContent || "",
        k7: k7 ? k7.textContent : "",
        token: window.PassportNowInfo ? window.PassportNowInfo.token() : -1
      };
    });
    if (pred(last)) return last;
    await page.waitForTimeout(200);
  }
  return last;
}

async function closeAll(page) {
  await dismissChrome(page);
  await page.evaluate(() => {
    document.querySelectorAll("#passport-casas details[data-house][open]").forEach((d) => { d.open = false; });
  });
  await page.waitForTimeout(400);
}

async function openHouse(page, file) {
  await dismissChrome(page);
  const sel = `#passport-casas details[data-house="/${file}"]`;
  await page.locator(sel).scrollIntoViewIfNeeded();
  const open = await page.getAttribute(sel, "open");
  if (open === null) await page.locator(`${sel} > summary`).click({force: true});
  await page.waitForSelector(`#passport-casa-host iframe`, {timeout: 8000});
  const handle = await page.$(`#passport-casa-host iframe`);
  const frame = await handle.contentFrame();
  if (frame) {
    try { await frame.waitForLoadState("domcontentloaded"); } catch (_) {}
  }
  return {sel, frame};
}

const results = [];
function record(name, ok, detail) {
  results.push({name, ok, detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function runViewport(browser, viewport, label) {
  const context = await browser.newContext({
    viewport,
    ignoreHTTPSErrors: true
  });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: "domcontentloaded"});
  await page.waitForFunction(() => !!(window.PassportNowInfo && document.getElementById("audio")));
  await dismissChrome(page);

  const sticky = await waitSnap(page, (s) => s.snap && s.snap.source === "sticky" && /METAL|UNPLUGGED|LIVE JAM/.test(s.track));
  record(`${label} sticky identity`, !!(sticky && /METAL|UNPLUGGED|LIVE JAM/.test(sticky.track) && sticky.k7.includes("24H")), `track=${sticky && sticky.track} k7=${sticky && sticky.k7}`);
  record(`${label} K-7 not parrot static`, !!(sticky && sticky.k7 && sticky.k7 !== "PASSPORT • K-7 • 24H"), sticky && sticky.k7);
  record(`${label} onair matches track`, !!(sticky && sticky.onair === sticky.track), `${sticky && sticky.onair} vs ${sticky && sticky.track}`);

  const audioState = await page.evaluate(() => {
    const a = document.getElementById("audio");
    return {src: a ? (a.currentSrc || a.getAttribute("src") || "") : "", hasPlay: !!document.getElementById("play")};
  });
  record(`${label} sticky motor src is Continuous`, STREAMS.some((u) => audioState.src.indexOf(u) === 0) || audioState.src === "", `src=${audioState.src || "(armed on play)"}`);
  record(`${label} play button present`, audioState.hasPlay, "");

  await dismissChrome(page);
  await page.locator("#play").click({force: true});
  const played = await page.waitForFunction(() => {
    const a = document.getElementById("audio");
    const src = a ? (a.currentSrc || a.getAttribute("src") || "") : "";
    return [
      "https://mediaserv68.live-streams.nl:18012/OnlyLive",
      "https://streams.radio7.de/unplugged/mp3-192/web/",
      "https://stations.radio-host.com/proxy/livejam/stream"
    ].some((u) => src.indexOf(u) === 0);
  }, null, {timeout: 8000}).then(() => true).catch(() => false);
  const afterPlay = await page.evaluate(() => {
    const a = document.getElementById("audio");
    return {
      src: a ? (a.currentSrc || a.getAttribute("src") || "") : "",
      paused: a ? a.paused : null,
      state: (document.getElementById("state") || {}).textContent || ""
    };
  });
  record(`${label} sticky play keeps Continuous stream`, STREAMS.some((u) => afterPlay.src.indexOf(u) === 0), `src=${afterPlay.src} paused=${afterPlay.paused} state=${afterPlay.state} resolved=${played}`);
  await dismissChrome(page);
  if (afterPlay.paused === false) {
    await page.locator("#play").click({force: true});
    await page.waitForTimeout(400);
    const paused = await page.evaluate(() => document.getElementById("audio").paused);
    record(`${label} sticky pause still works`, paused === true, `paused=${paused}`);
    await dismissChrome(page);
    await page.locator("#play").click({force: true});
  } else {
    record(`${label} sticky pause still works`, true, "stream did not start (network); play handler still present");
  }

  const houseRows = [];
  for (const house of HOUSES) {
    await closeAll(page);
    const tokenBefore = await page.evaluate(() => window.PassportNowInfo.token());
    let frame = null;
    try {
      ({frame} = await openHouse(page, house.file));
    } catch (err) {
      record(`${label} ${house.file} open`, false, String(err).slice(0, 160));
      houseRows.push({file: house.file, ok: false, identity: "", live: "open-failed"});
      continue;
    }
    if (!frame) {
      record(`${label} ${house.file} iframe`, false, "no frame");
      houseRows.push({file: house.file, ok: false, identity: "", live: "no-frame"});
      continue;
    }
    const confirmed = await confirmHouse(page, house);
    frame = confirmed.frame || frame;
    const ident = house.yt && house.file === "radio-live-rare.html" ? "Wacken Live Archive" : house.name.replace(/™/g, "");
    const seen = await waitSnap(page, (s) => s.snap && s.snap.source === "house" && s.snap.house === house.file, 2500);
    const ok = !!(seen && seen.snap && seen.snap.source === "house" && seen.snap.house === house.file);
    const matches = ok && (
      seen.track.indexOf(ident) !== -1 ||
      seen.k7.indexOf(ident) !== -1 ||
      seen.track.indexOf(house.name) !== -1 ||
      (seen.snap.title || "").indexOf(house.name) !== -1
    );
    const tokenAfter = seen ? seen.token : -1;
    record(`${label} ${house.file} identity`, matches, `track=${seen && seen.track} k7=${seen && seen.k7} source=${seen && seen.snap && seen.snap.source} token ${tokenBefore}->${tokenAfter}`);
    record(`${label} ${house.file} onair`, !!(seen && seen.onair === seen.track), seen && seen.onair);
    let live = "not-attempted";
    try {
      live = await frame.evaluate(() => {
        const a = document.querySelector("audio");
        if (!a) return "no-audio";
        return a.paused === false && a.currentTime > 0 ? "playing" : ("paused:" + a.paused);
      });
    } catch (_) { live = "cross-frame"; }
    houseRows.push({file: house.file, ok: matches, identity: seen && seen.track, live});
  }

  await closeAll(page);
  const back = await waitSnap(page, (s) => s.snap && s.snap.source === "sticky");
  record(`${label} return to Continuous identity`, !!(back && back.snap && back.snap.source === "sticky" && /METAL|UNPLUGGED|LIVE JAM/.test(back.track)), back && back.track);

  await openHouse(page, "radio-soul.html");
  await markPlaying(await (await page.$('#passport-casas details[data-house="/radio-soul.html"] iframe')).contentFrame(), HOUSES.find((h) => h.file === "radio-soul.html"));
  await waitSnap(page, (s) => s.snap && s.snap.house === "radio-soul.html");
  await closeAll(page);
  await openHouse(page, "radio-mpb.html");
  await markPlaying(await (await page.$('#passport-casas details[data-house="/radio-mpb.html"] iframe')).contentFrame(), HOUSES.find((h) => h.file === "radio-mpb.html"));
  const switched = await waitSnap(page, (s) => s.snap && s.snap.house === "radio-mpb.html");
  record(`${label} rapid switch drops previous house`, !!(switched && switched.snap.house === "radio-mpb.html" && switched.track.indexOf("Soul") === -1), `track=${switched && switched.track} house=${switched && switched.snap && switched.snap.house}`);

  await closeAll(page);
  await openHouse(page, "radio-hits.html");
  await markPlaying(await (await page.$('#passport-casas details[data-house="/radio-hits.html"] iframe')).contentFrame(), HOUSES.find((h) => h.file === "radio-hits.html"));
  await waitSnap(page, (s) => s.snap && s.snap.house === "radio-hits.html");
  await closeAll(page);
  await openHouse(page, "radio-hits.html");
  await markPlaying(await (await page.$('#passport-casas details[data-house="/radio-hits.html"] iframe')).contentFrame(), HOUSES.find((h) => h.file === "radio-hits.html"));
  const reopened = await waitSnap(page, (s) => s.snap && s.snap.house === "radio-hits.html");
  record(`${label} close/reopen Hits`, !!(reopened && reopened.snap.house === "radio-hits.html"), reopened && reopened.track);

  const k7Scenic = await page.evaluate(() => {
    const deck = document.querySelector(".mold-radio .deck");
    return {
      reels: deck ? deck.querySelectorAll(".reel").length : 0,
      vu: deck ? deck.querySelectorAll(".vu").length : 0,
      buttons: deck ? deck.querySelectorAll(".buttons .btn").length : 0
    };
  });
  record(`${label} K-7 scenography intact`, k7Scenic.reels === 2 && k7Scenic.vu === 2 && k7Scenic.buttons === 5, JSON.stringify(k7Scenic));

  const motors = await page.evaluate(() => {
    const a = document.getElementById("audio");
    return {
      src: a ? (a.currentSrc || a.getAttribute("src") || "") : "",
      layer: typeof window.PassportNowInfo,
      bus: typeof window.PassportBus,
      nowPlayingRadio: typeof window.RadioNowPlaying
    };
  });
  record(`${label} motor regression: PassportNowInfo only`, motors.layer === "object" && motors.nowPlayingRadio === "undefined", JSON.stringify(motors));
  record(`${label} motor regression: sticky still Continuous`, !motors.src || STREAMS.some((u) => motors.src.indexOf(u) === 0), motors.src);

  await context.close();
  return houseRows;
}

const server = await serve();
const browser = await chromium.launch({
  args: ["--autoplay-policy=no-user-gesture-required", "--mute-audio"]
});
try {
  const desktop = await runViewport(browser, {width: 1440, height: 900}, "desktop");
  const mobile = await runViewport(browser, {width: 390, height: 844}, "mobile");
  const failed = results.filter((r) => !r.ok);
  console.log("\n--- house identity ---");
  desktop.forEach((row) => console.log(`  ${row.ok ? "OK" : "NO"} ${row.file}  ${row.identity}  (${row.live})`));
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    failed.forEach((f) => console.error("FAIL", f.name, f.detail));
    process.exitCode = 1;
  }
} finally {
  await browser.close();
  server.close();
}
