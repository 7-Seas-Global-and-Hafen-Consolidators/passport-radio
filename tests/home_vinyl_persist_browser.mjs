#!/usr/bin/env node
/* Vinyl collection + persist same-instance. Playwright. */
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
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".woff2": "font/woff2"
};

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

const HOUSES = [
  "radio-continuous.html","radio-live-rare.html","radio-mundo-player.html",
  "radio-mpb.html","radio-jovem-guarda.html","radio-rock-brasil.html",
  "radio-hits.html","radio-world-disco-deutschland.html","radio-soul.html",
  "radio-flash-house.html","radio-world-tunnel-reggae.html","radio-nostalgia-passport.html",
  "radio-80s.html","radio-50s-60s.html","radio-novelas.html","globo-de-ouro-player.html"
];

const results = [];
function record(name, ok, detail) {
  results.push({name, ok, detail});
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

async function snap(page) {
  return page.evaluate(() => {
    const host = document.getElementById("passport-casa-host");
    const frame = host && host.querySelector("iframe");
    const vinyls = document.querySelectorAll("#passport-casas details.pp-vinyl[data-house]");
    const opens = document.querySelectorAll("#passport-casas details[data-house][open]");
    return {
      vinyls: vinyls.length,
      opens: opens.length,
      hostHidden: !host || host.hidden,
      hostHouse: host ? host.dataset.house || "" : "",
      iframes: document.querySelectorAll("#passport-casa-host iframe").length,
      token: frame ? frame.dataset.ppPersist || "" : "",
      born: frame ? frame.dataset.ppBorn || "" : "",
      away: document.body.classList.contains("pp-nav-away"),
      url: location.pathname,
      title: document.title,
      persistBar: !!(document.getElementById("pp-persist-bar") && !document.getElementById("pp-persist-bar").hidden),
      playingClass: [...vinyls].some((v) => v.classList.contains("is-playing")),
      selected: [...vinyls].filter((v) => v.open).map((v) => v.dataset.name)
    };
  });
}

async function openHouse(page, file) {
  const target = `/${file}`;
  const sel = `#passport-casas details[data-house="${target}"]`;
  await page.locator(`${sel} > summary`).scrollIntoViewIfNeeded();
  const already = await page.evaluate((t) => {
    const host = document.getElementById("passport-casa-host");
    const card = document.querySelector(`#passport-casas details[data-house="${t}"]`);
    return !!(host && card && card.open && host.dataset.house === t && host.querySelector("iframe"));
  }, target);
  if (!already) {
    try {
      await page.locator(`${sel} > summary`).click({force: true, timeout: 2500});
    } catch (_) {}
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
  }, target, {timeout: 12000});
}

async function clickPlay(page) {
  const frame = page.frameLocator("#passport-casa-host iframe");
  const candidates = [
    "#passportMPBPlay","#passportSoulPlay","#passportHitsPlay","#world-play",
    "#passport-live-play","#passport80sPlay","#novelasPlay","#gdoPlay",
    "#tunnelPlay","#passportWorldDiscoDeutschlandPlay","#passportFlashHousePlay",
    "#passportWorldTunnelReggaePlay","#passportJovemGuardaPlay","#passportNostalgiaPlay",
    "#passportBRRockPlay","#passport5060Play"
  ];
  for (const c of candidates) {
    const loc = frame.locator(c);
    if (await loc.count()) {
      try { await loc.first().click({timeout: 2500}); return true; } catch (_) {}
    }
  }
  return false;
}

const server = await serve();
const browser = await chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"]
});
try {
  const context = await browser.newContext({viewport: {width: 1280, height: 800}, ignoreHTTPSErrors: true});
  const page = await context.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/`, {waitUntil: "domcontentloaded"});
  await page.waitForSelector("#passport-casas details.pp-vinyl");

  let s = await snap(page);
  record("boot 16 vinyls", s.vinyls === 16, `n=${s.vinyls}`);
  record("boot host hidden", s.hostHidden && s.iframes === 0, `hidden=${s.hostHidden} iframes=${s.iframes}`);

  for (const file of HOUSES) {
    await openHouse(page, file);
    s = await snap(page);
    record(`open ${file}`, s.iframes === 1 && s.hostHouse.endsWith(file) && s.opens === 1, `iframes=${s.iframes} open=${s.opens} house=${s.hostHouse}`);
  }

  await openHouse(page, "radio-mpb.html");
  await page.waitForTimeout(800);
  const beforePlay = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    let audioPlaying = false;
    try {
      const audio = frame && frame.contentDocument && frame.contentDocument.querySelector("audio");
      audioPlaying = !!(audio && audio.paused === false);
    } catch (_) {}
    return audioPlaying;
  });
  record("select is not play", beforePlay === false, `playing=${beforePlay}`);
  const played = await page.evaluate(() => {
    if (window.PassportHouses) { window.PassportHouses.togglePlay(); return true; }
    return false;
  });
  await page.waitForTimeout(1500);
  const before = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    let audioPlaying = false;
    try {
      const audio = frame.contentDocument.querySelector("audio");
      audioPlaying = !!(audio && audio.paused === false);
    } catch (_) {}
    return {
      token: frame && frame.dataset.ppPersist,
      node: frame,
      audioPlaying,
      id: frame && frame.dataset.ppBorn
    };
  });
  record("MPB play click", played, "");
  const token0 = before.token;
  const born0 = before.id;
  record("MPB instance stamped", !!(token0 && born0), `token=${token0}`);

  await page.evaluate(() => window.PassportPersistNav.go("/noticias.html"));
  await page.waitForTimeout(800);
  s = await snap(page);
  const afterNews = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    let audioPlaying = false;
    try {
      const audio = frame && frame.contentDocument.querySelector("audio");
      audioPlaying = !!(audio && audio.paused === false);
    } catch (_) {}
    return {
      token: frame && frame.dataset.ppPersist,
      born: frame && frame.dataset.ppBorn,
      connected: !!(frame && frame.isConnected),
      audioPlaying,
      sameRef: frame === window.__ppHouseFrame
    };
  });
  record("noticias persist overlay", s.away && s.url.indexOf("noticias") !== -1, `url=${s.url} away=${s.away}`);
  record("same iframe token after noticias", afterNews.token === token0 && afterNews.born === born0 && afterNews.connected, `tok ${afterNews.token} vs ${token0}`);
  record("same frame node", afterNews.sameRef === true, `sameRef=${afterNews.sameRef}`);
  record("playback after noticias", afterNews.audioPlaying === true || before.audioPlaying === false, `playing=${afterNews.audioPlaying} prior=${before.audioPlaying}`);

  await page.evaluate(() => window.PassportPersistNav.go("/blog.html"));
  await page.waitForTimeout(600);
  s = await snap(page);
  const afterBlog = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    return {token: frame && frame.dataset.ppPersist, born: frame && frame.dataset.ppBorn, url: location.pathname};
  });
  record("blog persist", s.away && afterBlog.url.indexOf("blog") !== -1 && afterBlog.token === token0, `url=${afterBlog.url}`);

  await page.goBack();
  await page.waitForTimeout(400);
  await page.goBack();
  await page.waitForTimeout(400);
  await page.goForward();
  await page.waitForTimeout(400);
  const hist = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    return {url: location.pathname, token: frame && frame.dataset.ppPersist, title: document.title};
  });
  record("history keeps instance", hist.token === token0, `url=${hist.url} token=${hist.token}`);

  await page.evaluate(() => window.PassportPersistNav.home());
  await page.waitForTimeout(500);
  s = await snap(page);
  const homeAgain = await page.evaluate(() => {
    const frame = document.querySelector("#passport-casa-host iframe");
    return {away: document.body.classList.contains("pp-nav-away"), token: frame && frame.dataset.ppPersist, open: document.querySelector('#passport-casas details[data-house="/radio-mpb.html"]').open};
  });
  record("return home same house", !homeAgain.away && homeAgain.token === token0 && homeAgain.open, `away=${homeAgain.away} open=${homeAgain.open}`);

  await page.evaluate(() => window.PassportHouses && window.PassportHouses.deactivate());
  await page.waitForTimeout(300);
  s = await snap(page);
  record("stop clears iframe", s.iframes === 0 && s.opens === 0 && s.hostHidden, `iframes=${s.iframes} open=${s.opens}`);

  await openHouse(page, "radio-soul.html");
  await page.waitForTimeout(300);
  await openHouse(page, "radio-mpb.html");
  s = await snap(page);
  record("switch still one iframe", s.iframes === 1 && s.hostHouse.indexOf("radio-mpb") !== -1, `iframes=${s.iframes} house=${s.hostHouse}`);
  await page.evaluate(() => window.PassportHouses && window.PassportHouses.deactivate());
  const residual = await page.evaluate(() => ({
    iframes: document.querySelectorAll("iframe").length,
    hostFrames: document.querySelectorAll("#passport-casa-host iframe").length,
    audio: [...document.querySelectorAll("audio")].filter((a) => !a.paused && a.id !== "audio").length
  }));
  record("no residual house iframe", residual.hostFrames === 0, `hostFrames=${residual.hostFrames} iframes=${residual.iframes}`);

  const standalone = await context.newPage();
  await standalone.goto(`http://127.0.0.1:${PORT}/radio-mpb.html`, {waitUntil: "domcontentloaded"});
  const stand = await standalone.evaluate(() => document.documentElement.className);
  record("standalone class", stand.indexOf("pp-signal-standalone") !== -1, stand);

  await openHouse(page, "radio-mundo-player.html");
  await page.waitForTimeout(1400);
  const worldInner = await page.evaluate(() => {
    const doc = document.querySelector("#passport-casa-host iframe")?.contentDocument;
    if (!doc) return {n: 0};
    const nodes = doc.querySelectorAll("#world-stations .station, .wd-stations .station");
    const st = nodes[0];
    const before = st ? getComputedStyle(st, "::before") : null;
    return {n: nodes.length, radius: before && before.borderRadius, w: before && before.width};
  });
  record("world internal vinyls", worldInner.n > 3 && String(worldInner.radius).indexOf("50%") !== -1, JSON.stringify(worldInner));

  await openHouse(page, "radio-continuous.html");
  await page.waitForTimeout(1000);
  const contInner = await page.evaluate(() => {
    const doc = document.querySelector("#passport-casa-host iframe")?.contentDocument;
    if (!doc) return {n: 0};
    const nodes = doc.querySelectorAll(".passport-live-channel");
    const before = nodes[0] ? getComputedStyle(nodes[0], "::before") : null;
    return {n: nodes.length, radius: before && before.borderRadius};
  });
  record("continuous internal vinyls", contInner.n === 6 && String(contInner.radius).indexOf("50%") !== -1, JSON.stringify(contInner));

  await openHouse(page, "radio-80s.html");
  await page.waitForTimeout(1000);
  const eightiesInner = await page.evaluate(() => {
    const doc = document.querySelector("#passport-casa-host iframe")?.contentDocument;
    if (!doc) return {n: 0};
    const nodes = doc.querySelectorAll(".passport80s-station");
    const before = nodes[0] ? getComputedStyle(nodes[0], "::before") : null;
    return {n: nodes.length, radius: before && before.borderRadius, play: !!doc.getElementById("passport80sPlay")};
  });
  record("80s internal vinyls", eightiesInner.n > 2 && eightiesInner.play && String(eightiesInner.radius).indexOf("50%") !== -1, JSON.stringify(eightiesInner));

  await openHouse(page, "radio-novelas.html");
  await page.waitForTimeout(1000);
  const novelasInner = await page.evaluate(() => {
    const doc = document.querySelector("#passport-casa-host iframe")?.contentDocument;
    if (!doc) return {n: 0};
    const nodes = doc.querySelectorAll("#novelasDeck button");
    const before = nodes[0] ? getComputedStyle(nodes[0], "::before") : null;
    return {n: nodes.length, radius: before && before.borderRadius};
  });
  record("novelas internal vinyls", novelasInner.n === 9 && String(novelasInner.radius).indexOf("50%") !== -1, JSON.stringify(novelasInner));

  await openHouse(page, "radio-live-rare.html");
  await page.waitForTimeout(1000);
  const liveInner = await page.evaluate(() => {
    const doc = document.querySelector("#passport-casa-host iframe")?.contentDocument;
    if (!doc) return {};
    return {
      play: !!doc.getElementById("tunnelPlay"),
      prev: !!doc.getElementById("tunnelPrev"),
      next: !!doc.getElementById("tunnelNext")
    };
  });
  record("live rare console", !!(liveInner.play && liveInner.prev && liveInner.next), JSON.stringify(liveInner));
  await page.evaluate(() => window.PassportHouses && window.PassportHouses.deactivate());

} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
