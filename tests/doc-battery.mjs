import { chromium } from "playwright";
import fs from "fs";

const base = process.env.BASE || "http://127.0.0.1:8080";
const out = "/workspace/screenshots";
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--autoplay-policy=no-user-gesture-required"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));

const result = { ok: true, notes: [], errors: [] };

function fail(msg) {
  result.ok = false;
  result.notes.push("FAIL " + msg);
}
function pass(msg) { result.notes.push("OK " + msg); }

await page.goto(base + "/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("#pr-house");
const home = await page.evaluate(() => {
  const brand = getComputedStyle(document.querySelector(".pr-brand"));
  const body = getComputedStyle(document.body);
  const buttons = [...document.querySelectorAll("#pr-babies [data-pr]")].map((b) => b.getAttribute("data-pr"));
  const text = document.body.innerText;
  return {
    houses: document.querySelectorAll("#pr-house").length,
    buttons: buttons.length,
    novelas: buttons.filter((id) => id.startsWith("novela:")).length,
    globo: buttons.filter((id) => id.startsWith("globo:")).length,
    world: buttons.filter((id) => id.startsWith("world:")).length,
    brandColor: brand.color,
    brandAlign: brand.textAlign,
    brandSize: parseFloat(brand.fontSize),
    bodyBg: body.backgroundColor,
    text,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    oldPlayer: getComputedStyle(document.getElementById("passport-player") || document.body).display
  };
});
if (home.houses !== 1) fail("casas " + home.houses); else pass("uma casa no documento");
if (home.buttons !== 61) fail("bebês " + home.buttons); else pass("61 bebês");
if (home.novelas !== 9 || home.globo !== 6) fail("novelas/globo " + home.novelas + "/" + home.globo); else pass("novelas 9 e globo 6 visíveis");
if (home.world !== 23) fail("mundo " + home.world); else pass("23 rádios do mundo");
if (home.brandAlign !== "center" || home.brandSize < 60) fail("marca " + home.brandAlign + " " + home.brandSize); else pass("marca central " + Math.round(home.brandSize) + "px");
if (!/255,\s*255,\s*255/.test(home.bodyBg)) fail("fundo " + home.bodyBg); else pass("fundo branco");
if (/WackenTV|BBC Music|Midnight Special|youtube\.com\/embed|PL74FzgX6Wbls/.test(home.text)) fail("cozinha visível"); else pass("cozinha fora do texto");
if (/e10600|224,\s*6,\s*0|225,\s*6,\s*0/.test(home.brandColor)) fail("vermelho " + home.brandColor); else pass("marca sem vermelho " + home.brandColor);
await page.screenshot({ path: out + "/doc-home-desktop.png" });

const audioBefore = await page.evaluate(() => document.getElementById("pr-audio"));
await page.click('[data-pr="mpb"]');
await page.waitForTimeout(800);
const mpb = await page.evaluate(() => {
  const audio = document.getElementById("pr-audio");
  return { src: audio.src, state: document.getElementById("pr-state").textContent, name: document.getElementById("pr-name").textContent, paused: audio.paused };
});
if (!mpb.src.includes("srv1.braudio.com.br:7008")) fail("src mpb " + mpb.src); else pass("MPB no motor original");
if (mpb.state === "No ar" && mpb.paused) fail("no ar falso"); else pass("estado MPB: " + mpb.state);
if (!/Passport MPB/.test(mpb.name)) fail("nome " + mpb.name); else pass(mpb.name);

await page.click('a[href="/live-aid-momento-mais-marcante-rock.html"]');
await page.waitForTimeout(600);
const nav = await page.evaluate(() => ({
  path: location.pathname,
  src: document.getElementById("pr-audio").src,
  houses: document.querySelectorAll("#pr-house").length,
  state: document.getElementById("pr-state").textContent
}));
if (!nav.path.includes("live-aid")) fail("nav " + nav.path); else pass("miolo trocou");
if (!nav.src.includes("braudio")) fail("som morreu " + nav.src); else pass("áudio sobreviveu à matéria");
if (nav.houses !== 1) fail("casa duplicada"); else pass("casa única depois da navegação");
await page.goBack();
await page.waitForTimeout(500);
const back = await page.evaluate(() => location.pathname);
if (back !== "/" && !back.endsWith("/index.html")) fail("voltar " + back); else pass("voltar");

await page.click('[data-pr="novela:0"]');
await page.waitForTimeout(400);
const novela = await page.evaluate(() => ({
  state: document.getElementById("pr-state").textContent,
  name: document.getElementById("pr-name").textContent,
  vol: document.getElementById("pr-volume").disabled,
  text: document.getElementById("pr-house").innerText,
  labelOn: window.PassportDoc.labelFor("yt-radio", 1),
  labelLive: window.PassportDoc.labelFor("yt-live", 1)
}));
if (novela.vol) fail("volume de novela desligado"); else pass("novela com volume");
if (novela.labelOn !== "No ar") fail("estado novela " + novela.labelOn); else pass("novela No ar quando toca");
if (novela.labelLive !== "Aberto") fail("live state " + novela.labelLive); else pass("Live & Rare abre, não finge no ar");
if (/PL74Fzg|youtube/i.test(novela.text)) fail("id de novela no texto"); else pass("novela sem cozinha no texto");
if (!/Novelas 01/.test(novela.name)) fail("nome novela " + novela.name); else pass(novela.name);

await page.click('[data-pr="globo:0"]');
await page.waitForTimeout(300);
const globo = await page.evaluate(() => ({
  name: document.getElementById("pr-name").textContent,
  vol: document.getElementById("pr-volume").disabled,
  on: window.PassportDoc.labelFor("yt-radio", 1)
}));
if (globo.vol || globo.on !== "No ar" || !/Globo de Ouro 01/.test(globo.name)) fail("globo " + JSON.stringify(globo));
else pass("globo como rádio");

await page.click('[data-pr="liverare"]');
await page.waitForTimeout(400);
const live = await page.evaluate(() => ({
  name: document.getElementById("pr-name").textContent,
  vol: document.getElementById("pr-volume").disabled,
  state: document.getElementById("pr-state").textContent,
  text: document.body.innerText
}));
if (!live.vol) fail("volume do live & rare ficou ativo"); else pass("volume do Live & Rare inativo");
if (live.state === "No ar") fail("live no ar falso"); else pass("Live & Rare estado " + live.state);
if (/WackenTV|BBC Music|Midnight Special/.test(live.text)) fail("cozinha depois do clique"); else pass("clique não abre a cozinha");

const families = [
  ["/agenda.html", "Tarja"],
  ["/blog/w/381329-madonna.html", "Madonna"],
  ["/loja.html", "Loja"],
  ["/editorial.html", "Arquivo"],
  ["/blog/arquivo/letras.html", "Bandas"],
  ["/participe.html", "história"],
  ["/blog/busca.html", "Buscar"],
  ["/frank-beard-zz-top-1949-2026.html", "Frank"]
];
for (const [path, needle] of families) {
  const res = await page.goto(base + path, { waitUntil: "domcontentloaded" });
  const info = await page.evaluate(() => ({
    house: !!document.getElementById("pr-house"),
    text: document.body.innerText.slice(0, 5000),
    bg: getComputedStyle(document.body).backgroundColor
  }));
  if (!res || !res.ok()) fail(path + " http");
  else if (!info.house) fail(path + " sem casa");
  else if (!info.text.includes(needle) && path.indexOf("busca") === -1 && path.indexOf("letras") === -1) fail(path + " sem " + needle);
  else pass(path);
  if (/Se falta foto|pede leitura|a nota não diz/.test(info.text)) fail(path + " fala de moinho");
}

const dark = await page.evaluate(() => {
  const hero = document.querySelector(".hero, .silence, .memorial");
  if (!hero) return "no-hero";
  return getComputedStyle(hero).backgroundColor;
});
pass("frank fundo " + dark);
if (dark !== "no-hero" && /0,\s*0,\s*0|8,\s*8,\s*8/.test(dark)) fail("bloco preto " + dark);

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(base + "/", { waitUntil: "domcontentloaded" });
const mobile = await page.evaluate(() => ({
  overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  brand: parseFloat(getComputedStyle(document.querySelector(".pr-brand")).fontSize),
  sections: getComputedStyle(document.querySelector(".pr-sections")).display
}));
await page.screenshot({ path: out + "/doc-home-mobile.png" });
if (mobile.overflow > 2) fail("scroll horizontal " + mobile.overflow); else pass("mobile sem scroll horizontal");
if (mobile.sections === "none") fail("nav mobile escondida"); else pass("nav mobile " + mobile.sections);
if (mobile.brand < 40) fail("marca mobile " + mobile.brand); else pass("marca mobile " + Math.round(mobile.brand));

await page.screenshot({ path: out + "/doc-home-mobile-top.png" });
await page.evaluate(() => document.getElementById("pr-main").scrollIntoView());
await page.screenshot({ path: out + "/doc-home-mobile-capa.png" });
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto(base + "/agenda.html", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: out + "/doc-agenda.png" });
await page.goto(base + "/loja.html", { waitUntil: "domcontentloaded" });
await page.screenshot({ path: out + "/doc-loja.png" });
await page.goto(base + "/frank-beard-zz-top-1949-2026.html", { waitUntil: "domcontentloaded" });
await page.evaluate(() => document.getElementById("pr-main").scrollIntoView());
await page.screenshot({ path: out + "/doc-frank.png" });
await page.goto(base + "/live-aid-momento-mais-marcante-rock.html", { waitUntil: "domcontentloaded" });
await page.evaluate(() => document.getElementById("pr-main").scrollIntoView());
await page.screenshot({ path: out + "/doc-materia.png" });

result.errors = errors.slice(0, 12);
if (errors.length) fail("erros de página " + errors.length);
fs.writeFileSync(out + "/doc-battery.json", JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
process.exit(result.ok ? 0 : 1);
