#!/usr/bin/env node
/* Playwright: Home embed compact. Chrome off in frame, PLAY visible, standalone intact. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8771;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2"
};
const HOUSES = [
  {file: "radio-continuous.html", play: "#passport-live-play", extra: ".passport-live-channels", volume: true, count: [".passport-live-channel", 6]},
  {file: "radio-live-rare.html", play: "#tunnelPlay", extra: ".tunnel-stage", volume: false},
  {file: "radio-80s.html", play: "#passport80sPlay", extra: ".passport80s-picker", volume: true, count: [".passport80s-station", 6]},
  {file: "radio-soul.html", play: "#passportSoulPlay", volume: true},
  {file: "radio-mpb.html", play: "#passportMPBPlay", volume: true},
  {file: "radio-hits.html", play: "#passportHitsPlay", volume: true},
  {file: "radio-rock-brasil.html", play: "#passportBRRockPlay", volume: true},
  {file: "radio-50s-60s.html", play: "#passport5060Play", volume: true},
  {file: "radio-flash-house.html", play: "#passportFlashHousePlay", volume: true},
  {file: "radio-world-disco-deutschland.html", play: "#passportWorldDiscoDeutschlandPlay", volume: true},
  {file: "radio-world-tunnel-reggae.html", play: "#passportWorldTunnelReggaePlay", volume: true},
  {file: "radio-novelas.html", play: "#novelasPlay", extra: "#novelasDeck", volume: false, count: ["#novelasDeck button", 9]},
  {file: "globo-de-ouro-player.html", play: "#gdoPlay", extra: "#gdoHidden", volume: false},
  {file: "radio-mundo-player.html", play: "#world-play", extra: "#world-stations", volume: false},
  {file: "radio-jovem-guarda.html", play: "#passportJovemGuardaPlay", volume: true},
  {file: "radio-nostalgia-passport.html", play: "#passportNostalgiaPlay", volume: true}
];

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const url = decodeURIComponent((req.url || "/").split("?")[0]);
      const rel = url === "/" ? "/index.html" : url;
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, {"content-type": MIME[path.extname(file)] || "application/octet-stream"});
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function dismiss(page) {
  await page.evaluate(() => {
    document.querySelectorAll("#fofonete-exit,.fofonete-exit,[aria-modal='true']").forEach((n) => n.remove());
  });
}

async function openHouse(page, file) {
  await dismiss(page);
  const target = `/${file}`;
  await page.evaluate((t) => {
    const card = document.querySelector(`#passport-casas details[data-house="${t}"]`);
    if (card) card.open = true;
  }, target);
  await page.waitForFunction((t) => {
    const host = document.getElementById("passport-casa-host");
    return !!(host && host.dataset.house === t && host.querySelector("iframe"));
  }, target, {timeout: 8000});
  await page.waitForTimeout(400);
}

const results = [];
function record(name, ok, detail) {
  results.push({name, ok, detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function frameEval(page, fn, arg) {
  const handle = await page.$("#passport-casa-host iframe");
  const frame = handle && await handle.contentFrame();
  if (!frame) return null;
  return frame.evaluate(fn, arg);
}

const server = await serve();
const browser = await chromium.launch({headless: true, args: ["--autoplay-policy=no-user-gesture-required"]});
try {
  for (const viewport of [{width: 1280, height: 800, label: "desktop"}, {width: 390, height: 844, label: "mobile"}]) {
    const context = await browser.newContext({viewport, ignoreHTTPSErrors: true});
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: "domcontentloaded"});
    await page.waitForSelector("#passport-casa-host", {state: "attached"});
    for (const house of HOUSES) {
      await openHouse(page, house.file);
      const snap = await frameEval(page, ({play, extra, volume, count}) => {
        const vis = (sel) => {
          const n = document.querySelector(sel);
          if (!n) return false;
          const r = n.getBoundingClientRect();
          const g = getComputedStyle(n);
          return g.display !== "none" && g.visibility !== "hidden" && r.width > 0 && r.height > 0;
        };
        const playEl = document.querySelector(play);
        const pr = playEl ? playEl.getBoundingClientRect() : null;
        const clientH = document.documentElement.clientHeight;
        const inView = !!(pr && pr.y >= -1 && pr.y + Math.min(pr.height, 20) <= clientH + 2);
        const engine = document.querySelector(".tunnel-engine");
        const engineCss = engine ? getComputedStyle(engine) : null;
        const volEl = document.getElementById("houseVolume");
        const volR = volEl ? volEl.getBoundingClientRect() : null;
        const volIn = !!(volEl && getComputedStyle(volEl).display !== "none" && volR.width > 0 && volR.y + 8 <= clientH + 4);
        return {
          html: document.documentElement.className,
          head: vis(".house-head"),
          note: vis(".house-note"),
          frameNote: vis(".pp-signal-frame-note"),
          stop: vis("#houseStop"),
          eightiesHead: vis(".passport80s-section__head"),
          soulTitle: vis(".passport-soul-title"),
          wdHead: vis(".wd-head"),
          gdoBrand: vis(".gdo__brand"),
          playVisible: vis(play),
          playInView: inView,
          extraOk: extra ? (extra === "#gdoHidden" ? !!document.getElementById("gdoHidden") : vis(extra)) : true,
          volumeOk: volume ? volIn : true,
          countOk: count ? document.querySelectorAll(count[0]).length >= count[1] : true,
          countGot: count ? document.querySelectorAll(count[0]).length : 0,
          engineLeft: engineCss ? engineCss.left : "",
          enginePos: engineCss ? engineCss.position : ""
        };
      }, {play: house.play, extra: house.extra || "", volume: !!house.volume, count: house.count || null});
      const outer = await page.evaluate(() => ({
        iframes: document.querySelectorAll("#passport-casa-host iframe, #passport-casas .casa-stage iframe").length,
        opens: document.querySelectorAll("#passport-casas details[data-house][open]").length
      }));
      const okChrome = snap && !snap.head && !snap.note && !snap.frameNote && !snap.stop && !snap.eightiesHead && !snap.soulTitle && !snap.wdHead && !snap.gdoBrand;
      const okPlay = snap && snap.playVisible && snap.playInView;
      const okExtra = snap && snap.extraOk;
      const okVol = snap && snap.volumeOk;
      const okCount = snap && snap.countOk;
      const okFrame = outer.iframes === 1 && outer.opens === 1;
      const okClass = snap && snap.html.indexOf("pp-signal-frame") !== -1;
      record(`${viewport.label} ${house.file} compact`, okChrome && okPlay && okExtra && okVol && okCount && okFrame && okClass,
        `chrome=${okChrome} play=${okPlay} extra=${okExtra} vol=${okVol} count=${okCount}/${snap && snap.countGot} iframes=${outer.iframes} class=${snap && snap.html}`);
      if (house.file === "radio-live-rare.html") {
        record(`${viewport.label} Live & Rare engine offscreen`,
          snap && snap.engineLeft === "-10000px" && snap.enginePos === "fixed",
          `left=${snap && snap.engineLeft} pos=${snap && snap.enginePos}`);
        const consoleOk = await frameEval(page, () => {
          const ids = ["tunnelPlay", "tunnelPrev", "tunnelNext", "tunnelPrevPlaylist", "tunnelNextPlaylist"];
          return ids.every((id) => {
            const n = document.getElementById(id);
            if (!n) return false;
            const r = n.getBoundingClientRect();
            const g = getComputedStyle(n);
            return g.display !== "none" && r.width > 0 && r.y + 8 <= document.documentElement.clientHeight + 4;
          });
        });
        record(`${viewport.label} Live & Rare console in view`, !!consoleOk, "");
      }
    }

    const sequence = [
      "radio-world-disco-deutschland.html",
      "radio-mpb.html",
      "radio-live-rare.html",
      "radio-mundo-player.html",
      "radio-continuous.html",
      "radio-nostalgia-passport.html"
    ];
    for (const file of sequence) {
      await openHouse(page, file);
      const seq = await page.evaluate((t) => ({
        iframes: document.querySelectorAll("#passport-casa-host iframe, #passport-casas .casa-stage iframe").length,
        house: document.getElementById("passport-casa-host")?.dataset.house || "",
        opens: document.querySelectorAll("#passport-casas details[data-house][open]").length
      }), file);
      record(`${viewport.label} seq ${file} one iframe`, seq.iframes === 1 && seq.opens === 1 && seq.house.indexOf(file) !== -1,
        JSON.stringify(seq));
    }
    await page.evaluate(() => {
      const btn = document.getElementById("passport-casa-host-close");
      if (btn) btn.click();
    });
    await page.waitForTimeout(250);
    const closed = await page.evaluate(() => ({
      iframes: document.querySelectorAll("#passport-casa-host iframe, #passport-casas .casa-stage iframe").length,
      opens: document.querySelectorAll("#passport-casas details[data-house][open]").length
    }));
    record(`${viewport.label} close clears`, closed.iframes === 0 && closed.opens === 0, JSON.stringify(closed));
    const pageErrors = errors.filter((e) => !/favicon|youtube|ytimg|autoplay|play\(\)|compute-pressure|AbortError/i.test(e));
    record(`${viewport.label} no new page errors`, pageErrors.length === 0, pageErrors.slice(0, 4).join(" | "));
    await context.close();
  }

  const stand = await browser.newContext({viewport: {width: 1280, height: 800}});
  const sp = await stand.newPage();
  const standHouses = [
    {file: "radio-nostalgia-passport.html", need: ".house-head"},
    {file: "radio-world-disco-deutschland.html", need: ".house-head"},
    {file: "radio-live-rare.html", need: ".house-head"},
    {file: "radio-mundo-player.html", need: ".wd-head"},
    {file: "radio-soul.html", need: ".house-head"},
    {file: "radio-flash-house.html", need: ".house-head"},
    {file: "radio-world-tunnel-reggae.html", need: ".house-head"},
    {file: "globo-de-ouro-player.html", need: "h1"}
  ];
  for (const item of standHouses) {
    await sp.goto(`http://127.0.0.1:${PORT}/${item.file}`, {waitUntil: "domcontentloaded"});
    await sp.waitForTimeout(400);
    const s = await sp.evaluate((need) => {
      const vis = (sel) => {
        const n = document.querySelector(sel);
        if (!n) return false;
        const r = n.getBoundingClientRect();
        const g = getComputedStyle(n);
        return g.display !== "none" && r.height > 0;
      };
      return {
        html: document.documentElement.className,
        need: vis(need),
        head: vis(".house-head"),
        note: vis(".house-note"),
        framed: document.documentElement.classList.contains("pp-signal-frame"),
        standalone: document.documentElement.classList.contains("pp-signal-standalone")
      };
    }, item.need);
    const ok = s.standalone && !s.framed && s.need;
    record(`standalone ${item.file}`, ok, JSON.stringify(s));
  }
  await stand.close();
} finally {
  await browser.close();
  server.close();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
