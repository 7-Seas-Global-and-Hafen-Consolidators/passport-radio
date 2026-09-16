#!/usr/bin/env node
/* Playwright: Home single-signal host. One house, one iframe, no height pile-up. */
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
  {file: "radio-continuous.html", name: "Continuous Signals™", variant: "host--simple"},
  {file: "radio-live-rare.html", name: "Live & Rare™", variant: "host--media"},
  {file: "radio-80s.html", name: "80s™", variant: "host--simple"},
  {file: "radio-soul.html", name: "Soul™", variant: "host--simple"},
  {file: "radio-mpb.html", name: "MPB™", variant: "host--simple"},
  {file: "radio-hits.html", name: "Passport Hits™", variant: "host--simple"},
  {file: "radio-rock-brasil.html", name: "Rock Brasil™", variant: "host--simple"},
  {file: "radio-50s-60s.html", name: "50s & 60s™", variant: "host--simple"},
  {file: "radio-flash-house.html", name: "Flash House™", variant: "host--simple"},
  {file: "radio-world-disco-deutschland.html", name: "WORLD DISCO DEUTSCHLAND™", variant: "host--simple"},
  {file: "radio-world-tunnel-reggae.html", name: "WORLD TUNNEL REGGAE™", variant: "host--simple"},
  {file: "radio-novelas.html", name: "Novelas™", variant: "host--media"},
  {file: "globo-de-ouro-player.html", name: "Globo de Ouro™", variant: "host--media"},
  {file: "radio-mundo-player.html", name: "World Dial™", variant: "host--world"},
  {file: "radio-jovem-guarda.html", name: "Jovem Guarda™", variant: "host--simple"},
  {file: "radio-nostalgia-passport.html", name: "Nostalgia Passport™", variant: "host--simple"}
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

async function dismissChrome(page) {
  await page.evaluate(() => {
    document.querySelectorAll("#fofonete-exit,.fofonete-exit,[aria-modal='true']").forEach((n) => n.remove());
    document.documentElement.classList.remove("fofonete-exit-open");
    document.body.style.position = "";
    document.body.style.top = "";
  });
}

async function snapshot(page) {
  return page.evaluate(() => {
    const host = document.getElementById("passport-casa-host");
    const casas = document.getElementById("passport-casas");
    const sticky = document.getElementById("passport-player");
    const vu = document.querySelector(".deck .vu-panel");
    const frames = [...document.querySelectorAll("#passport-casa-host iframe, #passport-casas .casa-stage iframe")];
    const stageFrames = [...document.querySelectorAll(".casa-stage iframe")];
    const opens = [...document.querySelectorAll("#passport-casas details[data-house][open]")];
    const pills = document.querySelectorAll("#passport-casas details[data-house]").length;
    const hr = host ? host.getBoundingClientRect() : null;
    const cr = casas ? casas.getBoundingClientRect() : null;
    const ir = frames[0] ? frames[0].getBoundingClientRect() : null;
    const sr = sticky ? sticky.getBoundingClientRect() : null;
    const iframeSrc = frames[0] ? (frames[0].getAttribute("src") || "") : "";
    return {
      pills,
      openCount: opens.length,
      openNames: opens.map((d) => d.dataset.name),
      iframeCount: frames.length,
      stageIframes: stageFrames.length,
      hostHidden: host ? host.hidden : true,
      hostHouse: host ? host.dataset.house || "" : "",
      hostClass: host ? host.className : "",
      hostH: hr ? Math.round(hr.height) : 0,
      hostW: hr ? Math.round(hr.width) : 0,
      casasH: cr ? Math.round(cr.height) : 0,
      iframeH: ir ? Math.round(ir.height) : 0,
      iframeW: ir ? Math.round(ir.width) : 0,
      iframeSrc,
      iframeInHost: !!(frames[0] && host && host.contains(frames[0])),
      stickyY: sr ? Math.round(sr.y) : -1,
      stickyH: sr ? Math.round(sr.height) : -1,
      stickyZ: sticky ? getComputedStyle(sticky).zIndex : "",
      vu: !!(vu && getComputedStyle(vu).display !== "none")
    };
  });
}

async function openHouse(page, file) {
  await dismissChrome(page);
  const target = `/${file}`;
  const sel = `#passport-casas details[data-house="${target}"]`;
  await page.locator(sel).scrollIntoViewIfNeeded();
  const already = await page.evaluate((t) => {
    const host = document.getElementById("passport-casa-host");
    const card = document.querySelector(`#passport-casas details[data-house="${t}"]`);
    return !!(host && card && card.open && host.dataset.house === t && host.querySelector("iframe"));
  }, target);
  if (!already) {
    await page.locator(`${sel} > summary`).click({force: true});
    const switched = await page.evaluate((t) => {
      const host = document.getElementById("passport-casa-host");
      return !!(host && host.dataset.house === t);
    }, target);
    if (!switched) {
      await page.evaluate((t) => {
        const card = document.querySelector(`#passport-casas details[data-house="${t}"]`);
        if (card) card.open = true;
      }, target);
    }
  }
  await page.waitForFunction((t) => {
    const host = document.getElementById("passport-casa-host");
    return !!(host && host.dataset.house === t && host.querySelector("iframe"));
  }, target, {timeout: 8000});
  await page.waitForTimeout(200);
  return snapshot(page);
}

async function closeHost(page) {
  await dismissChrome(page);
  const visible = await page.evaluate(() => {
    const btn = document.getElementById("passport-casa-host-close");
    return !!(btn && btn.offsetParent !== null);
  });
  if (visible) await page.click("#passport-casa-host-close");
  else {
    await page.evaluate(() => {
      document.querySelectorAll("#passport-casas details[data-house][open]").forEach((d) => { d.open = false; });
    });
  }
  await page.waitForTimeout(300);
  return snapshot(page);
}

const results = [];
function record(name, ok, detail) {
  results.push({name, ok, detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function runViewport(browser, viewport, label) {
  const context = await browser.newContext({viewport, ignoreHTTPSErrors: true});
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: "domcontentloaded"});
  await page.waitForSelector("#passport-casa-host", {state: "attached"});
  await dismissChrome(page);

  const closed = await snapshot(page);
  record(`${label} 16 selectors`, closed.pills === 16, `pills=${closed.pills}`);
  record(`${label} zero iframe at boot`, closed.iframeCount === 0 && closed.stageIframes === 0, `iframes=${closed.iframeCount}`);
  record(`${label} sticky 56 top`, closed.stickyY === 0 && closed.stickyH === 56, `y=${closed.stickyY} h=${closed.stickyH} z=${closed.stickyZ}`);
  record(`${label} VU present`, closed.vu === true, "");

  const disco = await openHouse(page, "radio-world-disco-deutschland.html");
  record(`${label} Disco one iframe`, disco.iframeCount === 1 && disco.iframeInHost && disco.stageIframes === 0, `iframes=${disco.iframeCount} inHost=${disco.iframeInHost} stage=${disco.stageIframes}`);
  record(`${label} Disco one open`, disco.openCount === 1, `open=${disco.openCount} ${disco.openNames.join(",")}`);
  record(`${label} Disco host simple`, disco.hostClass.indexOf("host--simple") !== -1 && disco.hostH <= 420, `class=${disco.hostClass} h=${disco.hostH} casas=${disco.casasH}`);
  record(`${label} Disco not a 1100 slab`, disco.iframeH <= 400 && disco.hostH <= 420, `iframeH=${disco.iframeH} hostH=${disco.hostH} casasH=${disco.casasH}`);

  const mpb = await openHouse(page, "radio-mpb.html");
  record(`${label} Disco→MPB still one iframe`, mpb.iframeCount === 1 && mpb.hostHouse.indexOf("radio-mpb.html") !== -1, `iframes=${mpb.iframeCount} house=${mpb.hostHouse} open=${mpb.openCount}`);
  record(`${label} MPB unmounted Disco`, mpb.openNames.join(",") === "MPB™", `open=${mpb.openNames.join(",")}`);

  const disco2 = await openHouse(page, "radio-world-disco-deutschland.html");
  record(`${label} MPB→Disco still one iframe`, disco2.iframeCount === 1 && disco2.hostHouse.indexOf("world-disco") !== -1, `iframes=${disco2.iframeCount} house=${disco2.hostHouse}`);

  const heights = [];
  for (const house of HOUSES) {
    const snap = await openHouse(page, house.file);
    heights.push(snap.casasH);
    const okFrame = snap.iframeCount === 1 && snap.iframeInHost && snap.stageIframes === 0;
    const okOpen = snap.openCount === 1;
    const okVar = snap.hostClass.indexOf(house.variant) !== -1;
    const okCap = snap.casasH < 1600 && snap.hostH <= 580;
    record(`${label} ${house.name} host`, okFrame && okOpen && okVar && okCap,
      `iframes=${snap.iframeCount} open=${snap.openCount} hostH=${snap.hostH} casasH=${snap.casasH} class=${snap.hostClass} src=${snap.iframeSrc}`);
  }
  const piled = heights.some((h, i) => i > 0 && h > heights[0] + 250);
  record(`${label} no cumulative height`, !piled, `casasH sequence=${heights.join("→")}`);

  const afterClose = await closeHost(page);
  record(`${label} close clears iframe`, afterClose.iframeCount === 0 && afterClose.openCount === 0, `iframes=${afterClose.iframeCount} open=${afterClose.openCount}`);

  const rare = await openHouse(page, "radio-live-rare.html");
  record(`${label} Live & Rare media host`, rare.hostClass.indexOf("host--media") !== -1 && rare.iframeCount === 1, `class=${rare.hostClass} h=${rare.hostH}`);
  const world = await openHouse(page, "radio-mundo-player.html");
  record(`${label} World Dial world host`, world.hostClass.indexOf("host--world") !== -1 && world.iframeCount === 1, `class=${world.hostClass} h=${world.hostH} iframeH=${world.iframeH}`);

  const pageErrors = errors.filter((e) => !/favicon|youtube|ytimg|autoplay|play\(\)|compute-pressure/i.test(e));
  record(`${label} no new page errors`, pageErrors.length === 0, pageErrors.slice(0, 4).join(" | "));

  await context.close();
}

const server = await serve();
const browser = await chromium.launch({headless: true});
try {
  await runViewport(browser, {width: 1280, height: 800}, "desktop");
  await runViewport(browser, {width: 390, height: 844}, "mobile");
} finally {
  await browser.close();
  server.close();
}
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
