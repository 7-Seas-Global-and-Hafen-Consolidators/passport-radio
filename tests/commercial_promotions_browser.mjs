#!/usr/bin/env node
/* Anuncie calculator + Promoções motor. Playwright. */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 8776;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
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
        res.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

const fail = (msg) => { throw new Error(msg); };
const money = (n) => Number(n).toFixed(2);

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const shotDir = path.join(ROOT, "tests");
  try {
    await page.goto(`http://127.0.0.1:${PORT}/anuncie.html`, { waitUntil: "networkidle" });
    const daysCount = await page.locator("#ad-days option").count();
    if (daysCount !== 160) fail(`expected 160 periods, got ${daysCount}`);
    const emailOk = await page.locator("text=passportradio.online@gmail.com").count();
    if (!emailOk) fail("PIX/email not visible");
    const qr = page.locator("img.commercial-pix-qr");
    if (await qr.getAttribute("src") !== "/images/anuncie/pix-chave-email.png") fail("QR is not local");
    if ((await qr.getAttribute("data-pix-payload")) !== "passportradio.online@gmail.com") fail("QR payload attr");
    if ((await page.locator("img.commercial-pix-qr").evaluate((img) => img.naturalWidth)) < 32) fail("QR did not render");

    const read = async () => page.evaluate(() => ({
      total: document.getElementById("ad-total").dataset.value,
      normal: document.getElementById("ad-line-normal").dataset.value,
      period: document.getElementById("ad-line-period-discount").dataset.value,
      extra: document.getElementById("ad-line-extra").dataset.value,
      free: document.getElementById("ad-line-free").dataset.value,
      save: document.getElementById("ad-line-save").dataset.value,
      freeShown: !document.querySelector("[data-quote-free]").hidden
    }));

    const setQuote = async (format, days, advertiser) => {
      await page.selectOption("#ad-format", format);
      if (format !== "sponsored") await page.selectOption("#ad-days", String(days));
      await page.selectOption("#ad-advertiser", advertiser);
      await page.waitForTimeout(30);
      return read();
    };

    let q = await setQuote("top", 1, "none");
    if (q.total !== "84.50") fail(`1 day banner ${q.total}`);

    q = await setQuote("top", 5, "none");
    if (q.normal !== "422.50" || q.total !== "0.00" || !q.freeShown) fail(`FREE banner ${JSON.stringify(q)}`);

    q = await setQuote("rectangle", 5, "none");
    if (q.normal !== "322.50" || q.total !== "0.00") fail(`FREE rectangle ${JSON.stringify(q)}`);

    q = await setQuote("strip", 5, "none");
    if (q.normal !== "247.50" || q.total !== "0.00") fail(`FREE strip ${JSON.stringify(q)}`);

    q = await setQuote("sponsored", 5, "none");
    if (q.total !== "1399.50" || q.freeShown) fail(`publieditorial FREE leak ${JSON.stringify(q)}`);

    q = await setQuote("top", 7, "none");
    if (q.total !== "571.33") fail(`7-day auto discount ${q.total}`);

    q = await setQuote("top", 30, "none");
    if (q.total !== "2225.48") fail(`30-day auto discount ${q.total}`);

    q = await setQuote("top", 30, "banda");
    if (q.total !== "2002.93") fail(`extra 10% ${q.total}`);

    q = await setQuote("top", 90, "none");
    if (q.total !== "6084.00") fail(`90-day cap ${q.total}`);

    await page.screenshot({ path: path.join(shotDir, "anuncie-quote.png"), fullPage: true });

    await page.goto(`http://127.0.0.1:${PORT}/promocoes.html`, { waitUntil: "networkidle" });
    const titles = await page.locator(".promo-campaign-card h2").allTextContents();
    for (const need of ["Se Eu Fosse Você 3", "Queen Budapest", "Street Fighter", "Caneca Passport Radio", "Camiseta Passport Radio"]) {
      if (!titles.some((t) => t.includes(need))) fail(`listing missing ${need}: ${titles}`);
    }
    const prizes = await page.locator(".promo-campaign-card p").allTextContents();
    const uciPrizes = prizes.filter((p) => p.includes("1 par de ingressos UCI Cinemas"));
    if (uciPrizes.length < 3) fail(`UCI ticket prize missing on cinema campaigns: ${prizes}`);

    await page.click('[data-listener-tab="results"]');
    const results = await page.locator("#listener-results-panel").innerText();
    if (!results.includes("JOSÉ SILVA SOUZA")) fail("Fone Retrô result missing");
    await page.screenshot({ path: path.join(shotDir, "promocoes-listing.png"), fullPage: true });

    await page.goto(`http://127.0.0.1:${PORT}/promocao-uci-cinema.html`, { waitUntil: "networkidle" });
    const form = page.locator("#promo-entry-form");
    if ((await form.getAttribute("action")) !== "https://formspree.io/f/xaenylvg") fail("UCI form action");
    if ((await page.locator(".campaign-prize").getAttribute("src")) !== "/images/promocoes/uci-cinemas.png") fail("UCI image not used");
    const qText = await page.locator("label").allTextContents();
    if (!qText.some((t) => t.includes("cineminha"))) fail("UCI question missing");

    let submits = 0;
    await page.route("https://formspree.io/f/xaenylvg", async (route) => {
      submits += 1;
      const body = route.request().postData() || "";
      if (!body.includes("participant_code") || !body.includes("campaign_id")) fail("form payload incomplete");
      await route.fulfill({ status: 200, contentType: "application/json", body: "{\"ok\":true}" });
    });
    await page.fill("input[name=name]", "Ana Tester");
    await page.fill("input[name=email]", "ana@example.com");
    await page.fill("textarea[name=creative_answer]", "Levaria meu irmão.");
    await page.check("input[name=rules]");
    await page.click("button[type=submit]");
    await page.waitForSelector("#promo-confirmation:not([hidden])");
    const conf = await page.locator("#promo-confirmation").innerText();
    if (!conf.includes("INSCRIÇÃO RECEBIDA") || conf.includes("INSCRIÇÃO CONFIRMADA")) fail(`language ${conf}`);
    if (!conf.includes("PR-UCI-")) fail("code not shown");
    await page.click("button[type=submit]").catch(() => {});
    if (submits !== 1) fail(`double submit leaked (${submits})`);

    await page.unroute("https://formspree.io/f/xaenylvg");
    await page.goto(`http://127.0.0.1:${PORT}/promocao-uci-cinema.html?ref=PR-UCI-ABC123`, { waitUntil: "networkidle" });
    await page.route("https://formspree.io/f/xaenylvg", async (route) => {
      const body = route.request().postData() || "";
      if (!body.includes("PR-UCI-ABC123") || !body.includes("referral_code")) fail(`referral not posted: ${body}`);
      await route.fulfill({ status: 500, body: "nope" });
    });
    await page.fill("input[name=name]", "Erro Tester");
    await page.fill("input[name=email]", "erro@example.com");
    await page.fill("textarea[name=creative_answer]", "x");
    await page.check("input[name=rules]");
    await page.click("button[type=submit]");
    await page.waitForSelector("#promo-confirmation:not([hidden])");
    const err = await page.locator("#promo-confirmation").innerText();
    if (!err.includes("ERRO")) fail("error path missing");
    const entries = await page.evaluate(() => localStorage.getItem("passportPromoEntriesV3"));
    if (entries && entries.includes("Erro Tester")) fail("error saved as received entry");

    await page.goto(`http://127.0.0.1:${PORT}/promocao-caneca-passport.html`, { waitUntil: "networkidle" });
    const caneca = await page.content();
    if (!caneca.includes("QUAL MÚSICA NÃO PODERIA FALTAR")) fail("caneca question missing on page");
    if (!caneca.includes("whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k")) fail("caneca WhatsApp link missing");
    if (!caneca.includes("t.me/+pXv3uwqOY8lkZGZk")) fail("caneca Telegram link missing");
    if (!caneca.includes("/images/promocoes/caneca-rush-fly-by-night.webp")) fail("caneca image not local");
    if (caneca.includes("R$") && /caneca/i.test(caneca) && /R\$\s*\d/.test(caneca)) {
      const prizeBlock = await page.locator(".campaign-prize-detail").innerText();
      if (/R\$/.test(prizeBlock)) fail("caneca prize shows price");
    }

    await page.goto(`http://127.0.0.1:${PORT}/promocao-camiseta-passport.html`, { waitUntil: "networkidle" });
    const shirt = await page.content();
    if (!shirt.includes("QUAL BANDA VOCÊ CARREGARIA")) fail("camiseta question missing");
    if (!shirt.includes("/images/promocoes/camiseta-metallica-black-album.jpg")) fail("camiseta image not local");

    await page.goto(`http://127.0.0.1:${PORT}/promocao-queen-budapest.html`, { waitUntil: "networkidle" });
    const queen = await page.locator(".campaign-prize-detail").innerText();
    if (!queen.includes("1 par de ingressos UCI Cinemas")) fail("queen prize");
    if ((await page.locator("body").innerText()).includes("Experiência Queen Budapest")) fail("old queen prize returned");

    await page.goto(`http://127.0.0.1:${PORT}/promocao-street-fighter.html`, { waitUntil: "networkidle" });
    const street = await page.locator(".campaign-prize-detail").innerText();
    if (!street.includes("1 par de ingressos UCI Cinemas")) fail("street prize");

    console.log("OK commercial browser");
    console.log("OK 160 periods, FREE 5-day, extra 10%, local QR");
    console.log("OK campaigns, Formspree xaenylvg, referral, language");
  } finally {
    await browser.close();
    server.close();
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
