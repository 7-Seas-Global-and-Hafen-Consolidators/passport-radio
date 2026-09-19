#!/usr/bin/env python3
"""Contracts for Anuncie calculator + Promoções campaigns. Radio motors stay untouched."""
from __future__ import annotations

import json
import re
import struct
import subprocess
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JS = (ROOT / "js/passport-commercial.js").read_text(encoding="utf-8")
PROMO_JS = (ROOT / "js/promocoes.js").read_text(encoding="utf-8")
ANUNCIE = (ROOT / "anuncie.html").read_text(encoding="utf-8")
PROMO_HTML = (ROOT / "promocoes.html").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")
CONFIG = json.loads((ROOT / "data/promocoes.json").read_text(encoding="utf-8"))

COMMERCIAL_FILES = [
    ROOT / "anuncie.html",
    ROOT / "promocoes.html",
    ROOT / "js/passport-commercial.js",
    ROOT / "js/promocoes.js",
    ROOT / "data/promocoes.json",
    ROOT / "css/passport-commercial-pages.css",
    ROOT / "promocao-uci-cinema.html",
    ROOT / "promocao-queen-budapest.html",
    ROOT / "promocao-street-fighter.html",
    ROOT / "promocao-caneca-passport.html",
    ROOT / "promocao-camiseta-passport.html",
]

PROTECTED = [
    "js/passport-bus.js",
    "js/passport-persist-nav.js",
    "js/passport-home-houses.js",
    "js/continuous-signals-home.js",
    "js/passport-live.js",
    "index.html",
    "radio.html",
    "doe.html",
    "loja.html",
    "js/passport-commerce.js",
]

# Real Whiplash period discounts extracted from the live Anuncie form (1..160).
WHIPLASH_PERIOD_PCT = [
    0,0,0,0,0,0,3.41,3.92,4.42,4.91,5.38,5.84,6.28,6.72,7.14,7.55,7.95,8.33,8.71,9.07,
    9.43,9.78,10.11,10.44,10.75,11.06,11.36,11.65,11.94,12.21,12.48,12.74,12.99,13.24,
    13.48,13.71,13.94,14.15,14.37,14.57,14.78,14.97,15.16,15.35,15.53,15.7,15.87,16.04,
    16.2,16.35,16.5,16.65,16.8,16.93,17.07,17.2,17.33,17.45,17.57,17.69,17.81,17.92,
    18.02,18.13,18.23,18.33,18.43,18.52,18.61,18.7,18.79,18.87,18.95,19.03,19.11,19.18,
    19.25,19.32,19.39,19.46,19.52,19.59,19.65,19.71,19.76,19.82,19.87,19.93,19.98,20,
] + [20] * 70

IMMUTABLE = {"top": 84.5, "rectangle": 64.5, "strip": 49.5, "sponsored": 1399.5}
EMAIL = "passportradio.online@gmail.com"
WA = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"
TG = "https://t.me/+FKto2N185cs4OGU0"


def fail(msg: str) -> None:
    raise SystemExit(msg)


def round2(value: float) -> float:
    return round(value + 1e-12, 2)


def expected_quote(daily: float, days: int, extra_pct: float, free: bool, fixed: bool) -> dict:
    normal = round2(daily if fixed else daily * days)
    period_pct = 0 if fixed else WHIPLASH_PERIOD_PCT[days - 1]
    extra = 0 if free else extra_pct
    period_discount = round2(normal * (period_pct / 100))
    after_period = round2(normal - period_discount)
    extra_discount = round2(after_period * (extra / 100))
    after_extra = round2(after_period - extra_discount)
    free_discount = after_extra if free else 0
    total = 0 if free else after_extra
    return {
        "normal": normal,
        "periodPct": period_pct,
        "periodDiscount": period_discount,
        "extraDiscount": extra_discount,
        "freeDiscount": free_discount,
        "total": total,
        "economia": round2(normal - total),
    }


def png_idat_ok(path: Path) -> None:
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        fail(f"{path} is not a PNG")
    pos = 8
    idats = []
    while pos + 12 <= len(data):
        length = struct.unpack(">I", data[pos : pos + 4])[0]
        kind = data[pos + 4 : pos + 8]
        chunk = data[pos + 8 : pos + 8 + length]
        pos += 12 + length
        if kind == b"IDAT":
            idats.append(chunk)
        if kind == b"IEND":
            break
    try:
        zlib.decompress(b"".join(idats))
    except zlib.error as exc:
        fail(f"{path} PNG stream is broken: {exc}")


def node_quotes(cases: list[dict]) -> list[dict]:
    script = r"""
const fs = require("fs");
const vm = require("vm");
const cases = JSON.parse(process.argv[1]);
const ctx = { window: {}, document: { querySelector: () => null, readyState: "complete", addEventListener() {} }, Intl };
vm.runInNewContext(fs.readFileSync("js/passport-commercial.js", "utf8"), ctx);
const C = ctx.window.PassportCommercial;
const out = cases.map((item) => {
  const q = C.quote(item.format, item.days, item.advertiser);
  return { ...item, result: q, periodLen: C.PERIOD_DISCOUNT_PCT.length, prices: {
    top: C.FORMATS.top.price, rectangle: C.FORMATS.rectangle.price,
    strip: C.FORMATS.strip.price, sponsored: C.FORMATS.sponsored.price
  }, pix: C.PIX_KEY, email: C.COMMERCIAL_EMAIL };
});
process.stdout.write(JSON.stringify({ table: ctx.window.PassportCommercial.PERIOD_DISCOUNT_PCT, out }));
"""
    raw = subprocess.check_output(
        ["node", "-e", script, json.dumps(cases)],
        cwd=ROOT,
        text=True,
    )
    return json.loads(raw)


# --- Anuncie / Whiplash periods ---
match = re.search(r"const PERIOD_DISCOUNT_PCT = \[([^\]]+)\];", JS)
if not match:
    fail("period table missing from passport-commercial.js")
parsed = [float(part) for part in match.group(1).split(",") if part.strip() != ""]
if len(parsed) != 160:
    fail(f"period table must have 160 days, got {len(parsed)}")
if parsed != [float(x) for x in WHIPLASH_PERIOD_PCT]:
    fail("JS period table does not match extracted Whiplash percents")
if re.search(r'option value="7".*option value="15".*option value="30"', ANUNCIE, re.S):
    fail("invented 1/7/15/30 period options returned")
if "id=\"ad-days\"" not in ANUNCIE:
    fail("period select missing")
if "id=\"ad-advertiser\"" not in ANUNCIE:
    fail("extra 10% advertiser select missing")
if "teste de 5 dias grátis" not in ANUNCIE.lower() and "teste de 5 dias grátis" not in ANUNCIE:
    if "5 dias grátis" not in ANUNCIE:
        fail("5-day free test is not disclosed on Anuncie")
if "após confirmação do atendimento" in ANUNCIE:
    fail("copy still delays discount until atendimento")
if "api.qrserver.com" in ANUNCIE:
    fail("external QR dependency still on Anuncie")
if EMAIL not in ANUNCIE or "passport.radio@gmail.com" in ANUNCIE:
    fail("commercial email contract broken on Anuncie")
if "/images/anuncie/pix-chave-email.png" not in ANUNCIE:
    fail("local PIX QR asset not wired")
if f'data-pix-payload="{EMAIL}"' not in ANUNCIE:
    fail("PIX payload attribute missing")

qr_path = ROOT / "images/anuncie/pix-chave-email.png"
png_idat_ok(qr_path)
try:
    import cv2
    import numpy as np
    from PIL import Image

    arr = np.array(Image.open(qr_path).convert("RGB"))
    value, _, _ = cv2.QRCodeDetector().detectAndDecode(arr)
    if value != EMAIL:
        fail(f"QR decoded to {value!r}, expected {EMAIL}")
except Exception as exc:
    # CI has no OpenCV; local run must still have a decodable PNG stream.
    if "cv2" not in str(exc) and "No module" not in str(type(exc)):
        # If OpenCV is present and decode failed, that is a hard error.
        if "cv2" in globals() or "QR" in str(exc):
            fail(f"QR decode failed: {exc}")

cases = [
    {"format": "top", "days": 1, "advertiser": "none", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 5, "advertiser": "none", "free": True, "fixed": False, "daily": 84.5},
    {"format": "rectangle", "days": 5, "advertiser": "none", "free": True, "fixed": False, "daily": 64.5},
    {"format": "strip", "days": 5, "advertiser": "none", "free": True, "fixed": False, "daily": 49.5},
    {"format": "sponsored", "days": 5, "advertiser": "none", "free": False, "fixed": True, "daily": 1399.5},
    {"format": "top", "days": 7, "advertiser": "none", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 15, "advertiser": "none", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 30, "advertiser": "none", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 30, "advertiser": "banda", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 90, "advertiser": "none", "free": False, "fixed": False, "daily": 84.5},
    {"format": "top", "days": 5, "advertiser": "banda", "free": True, "fixed": False, "daily": 84.5},
]
payload = node_quotes(cases)
if payload["table"] != [float(x) for x in WHIPLASH_PERIOD_PCT]:
    fail("runtime period table diverged")
for item, row in zip(cases, payload["out"]):
    got = row["result"]
    exp = expected_quote(item["daily"], item["days"], 10 if item["advertiser"] != "none" else 0, item["free"], item["fixed"])
    for key in ("normal", "periodPct", "periodDiscount", "extraDiscount", "freeDiscount", "total", "economia"):
        if abs(float(got[key]) - float(exp[key])) > 0.009:
            fail(f"quote mismatch {item}: {key} got {got[key]} expected {exp[key]}")

# 5-day FREE published accounts
free_map = {row["format"]: row["result"] for row in payload["out"] if row["days"] == 5 and row["advertiser"] == "none"}
if free_map["top"]["normal"] != 422.5 or free_map["top"]["total"] != 0:
    fail(f"banner 5-day FREE broken: {free_map['top']}")
if free_map["rectangle"]["normal"] != 322.5 or free_map["rectangle"]["total"] != 0:
    fail(f"rectangle 5-day FREE broken: {free_map['rectangle']}")
if free_map["strip"]["normal"] != 247.5 or free_map["strip"]["total"] != 0:
    fail(f"strip 5-day FREE broken: {free_map['strip']}")
if free_map["sponsored"]["total"] != 1399.5 or free_map["sponsored"]["freeEligible"]:
    fail("publieditorial must stay out of automatic FREE test")

prices = payload["out"][0]["prices"]
if prices != IMMUTABLE:
    fail(f"immutable Passport prices changed: {prices}")
# 55% structural reduction is NOT reapplied to the four Passport prices.
if abs(135 * 0.45 - 60.75) > 1e-9:
    fail("Whiplash 55% matrix arithmetic changed")
if IMMUTABLE["top"] == 60.75:
    fail("banner was overwritten with 55% of Whiplash TAMANHO 3")
if IMMUTABLE["sponsored"] == 900:
    fail("publieditorial was overwritten with 55% of Whiplash R$2000 package")

# --- Promoções ---
if CONFIG["form_endpoint"] != "https://formspree.io/f/xaenylvg":
    fail("Formspree endpoint is not xaenylvg")
if CONFIG["commercial_email"] != EMAIL:
    fail("commercial email missing from campaign config")
if CONFIG.get("official_whatsapp") != WA or CONFIG.get("official_telegram") != TG:
    fail("official WhatsApp/Telegram links missing from config")
campaigns = {item["id"]: item for item in CONFIG["campaigns"]}
required_ids = ["PR-0002", "PR-0005", "PR-0004", "PR-0006", "PR-0007", "PR-0001"]
if list(campaigns) != required_ids and set(required_ids) - set(campaigns):
    fail(f"campaign set incomplete: {sorted(campaigns)}")

uci = campaigns["PR-0002"]
if uci["prize"] != "1 par de ingressos UCI Cinemas":
    fail("UCI prize changed")
if uci["question"] != "Quem você gostaria de convidar para pegar um cineminha com você?":
    fail("UCI question changed")
if uci["prize_image"] != "/images/promocoes/uci-cinemas.png":
    fail("UCI image not internalized")
if uci["campaign_code_prefix"] != "PR-UCI":
    fail("UCI prefix changed")
if uci["open_at"] != "2026-09-01T00:00:00-03:00" or uci["close_at"] != "2026-09-30T23:59:00-03:00":
    fail("UCI open/close changed")
if uci["draw_at"] != "2026-10-01T12:00:00-03:00" or uci["result_at"] != "2026-10-02T12:00:00-03:00":
    fail("UCI draw/result not set")
if uci.get("calendar_pending"):
    fail("UCI calendar_pending returned")

queen = campaigns["PR-0005"]
sf = campaigns["PR-0004"]
if queen["prize"] != "1 par de ingressos UCI Cinemas" or sf["prize"] != "1 par de ingressos UCI Cinemas":
    fail("Queen/Street Fighter prize must be 1 par de ingressos UCI Cinemas")
if queen.get("winner") or sf.get("winner"):
    fail("future campaigns must not invent winners")
if queen.get("premiere_at") != "2026-10-07" or sf.get("premiere_at") != "2026-10-15":
    fail("UCI exhibition dates for Queen/Street Fighter changed")
if queen.get("calendar_pending") or sf.get("calendar_pending"):
    fail("calendar_pending must be removed now that dates exist")
if queen["open_at"] != "2026-09-18T00:00:00-03:00" or queen["close_at"] != "2026-10-03T23:59:00-03:00":
    fail("Queen open/close mismatch")
if queen["draw_at"] != "2026-10-04T12:00:00-03:00" or queen["result_at"] != "2026-10-05T12:00:00-03:00":
    fail("Queen draw/result mismatch")
if "QUAL MÚSICA DO QUEEN VOCÊ ESCOLHERIA" not in queen["question"]:
    fail("Queen question missing")
if sf["open_at"] != "2026-09-22T00:00:00-03:00" or sf["close_at"] != "2026-10-10T23:59:00-03:00":
    fail("Street Fighter open/close mismatch")
if sf["draw_at"] != "2026-10-11T12:00:00-03:00" or sf["result_at"] != "2026-10-12T12:00:00-03:00":
    fail("Street Fighter draw/result mismatch")
if "QUAL PERSONAGEM DE STREET FIGHTER" not in sf["question"]:
    fail("Street Fighter question missing")

caneca = campaigns["PR-0006"]
camiseta = campaigns["PR-0007"]
if caneca["product_id"] != "5786215" or caneca["prize"] != "Caneca Rush Fly By Night":
    fail("caneca is not the real store product")
if "QUAL MÚSICA NÃO PODERIA FALTAR" not in caneca["question"]:
    fail("caneca question missing")
if not caneca["requirements"]["whatsapp"] or not caneca["requirements"]["telegram"] or not caneca["requirements"]["referral"]:
    fail("caneca requirements missing")
if caneca["prize_image"].startswith("http"):
    fail("caneca image still hotlinked")
if caneca["open_at"] != "2026-09-25T00:00:00-03:00" or caneca["close_at"] != "2026-10-15T23:59:00-03:00":
    fail("caneca calendar mismatch")
if caneca["draw_at"] != "2026-10-16T12:00:00-03:00" or caneca["result_at"] != "2026-10-17T12:00:00-03:00":
    fail("caneca draw/result mismatch")
if caneca.get("calendar_pending"):
    fail("caneca calendar_pending returned")
if caneca["requirements"].get("minimum_referrals") is not None:
    fail("minimum_referrals was invented")
if camiseta["product_id"] != "2876812" or camiseta.get("sku") != "1727018":
    fail("camiseta is not the real store product")
if "QUAL BANDA VOCÊ CARREGARIA" not in camiseta["question"]:
    fail("camiseta question missing")
if camiseta["prize_image"].startswith("http"):
    fail("camiseta image still hotlinked")
if camiseta["open_at"] != "2026-10-01T00:00:00-03:00" or camiseta["close_at"] != "2026-10-22T23:59:00-03:00":
    fail("camiseta calendar mismatch")
if camiseta["draw_at"] != "2026-10-23T12:00:00-03:00" or camiseta["result_at"] != "2026-10-24T12:00:00-03:00":
    fail("camiseta draw/result mismatch")
if camiseta.get("calendar_pending"):
    fail("camiseta calendar_pending returned")
if camiseta["requirements"]["whatsapp"] or camiseta["requirements"]["telegram"] or camiseta["requirements"]["referral"]:
    fail("camiseta social requirements were invented")

fone = campaigns["PR-0001"]
if fone.get("winner") != "JOSÉ SILVA SOUZA":
    fail("Fone Retrô winner was removed or changed")

# catalog proof
inv3 = json.loads((ROOT / "data/store_inventory_03.json").read_text(encoding="utf-8"))
inv1 = json.loads((ROOT / "data/store_inventory_01.json").read_text(encoding="utf-8"))
caneca_cat = next(p for p in inv3["products"] if str(p.get("id")) == "5786215")
cam_cat = next(p for p in inv1["products"] if str(p.get("id")) == "2876812")
if caneca_cat.get("name") != "Caneca Rush Fly By Night" or not caneca_cat.get("in_stock"):
    fail("caneca catalog proof failed")
if cam_cat.get("name") != "Camiseta Metallica Black Album" or cam_cat.get("sku") != "1727018" or not cam_cat.get("in_stock"):
    fail("camiseta catalog proof failed")

for rel in (
    "images/promocoes/uci-cinemas.png",
    "images/promocoes/caneca-rush-fly-by-night.webp",
    "images/promocoes/camiseta-metallica-black-album.jpg",
    "images/anuncie/pix-chave-email.png",
):
    path = ROOT / rel
    if not path.is_file() or path.stat().st_size < 800:
        fail(f"missing or tiny prize/QR asset: {rel}")
png_idat_ok(ROOT / "images/promocoes/uci-cinemas.png")
webp = (ROOT / "images/promocoes/caneca-rush-fly-by-night.webp").read_bytes()
if webp[:4] != b"RIFF" or webp[8:12] != b"WEBP":
    fail("caneca webp is not a real image")
jpeg = (ROOT / "images/promocoes/camiseta-metallica-black-album.jpg").read_bytes()
if jpeg[:3] != b"\xff\xd8\xff":
    fail("camiseta jpeg is not a real image")

# motor + language
if "data/promocoes.json" not in PROMO_JS:
    fail("promotions motor is not config-driven")
if "INSCRIÇÃO CONFIRMADA" in PROMO_JS:
    fail("confirmation language still overclaims aptidão")
if "INSCRIÇÃO RECEBIDA" not in PROMO_JS:
    fail("received-not-apt language missing")
if "apto" not in PROMO_JS:
    fail("aptidão disclaimer missing")
if "referral_code" not in PROMO_JS or "?ref=" not in PROMO_JS and "searchParams.set(\"ref\"" not in PROMO_JS:
    fail("referral capture/share missing")
if "official_whatsapp" not in PROMO_JS or "official_telegram" not in PROMO_JS:
    fail("official channel renderer missing")
if "submit.disabled" not in PROMO_JS:
    fail("double submit guard missing")
if "if (!response.ok)" not in PROMO_JS:
    fail("success must require response.ok")

for path in COMMERCIAL_FILES:
    text = path.read_text(encoding="utf-8")
    if "xoeqnvjg" in text:
        fail(f"old Formspree id is functionally present in {path.name}")
    if "passport.radio@gmail.com" in text:
        fail(f"old commercial email still in {path.name}")
    if "api.qrserver.com" in text:
        fail(f"external QR still in {path.name}")

# pages exist and point at the motor
for name, slug in {
    "promocao-uci-cinema.html": "se-eu-fosse-voce-3-uci",
    "promocao-queen-budapest.html": "queen-budapest",
    "promocao-street-fighter.html": "street-fighter-premiere",
    "promocao-caneca-passport.html": "caneca-passport-radio",
    "promocao-camiseta-passport.html": "camiseta-passport-radio",
}.items():
    html = (ROOT / name).read_text(encoding="utf-8")
    if f'data-campaign-slug="{slug}"' not in html:
        fail(f"{name} slug mismatch")
    if "js/promocoes.js" not in html:
        fail(f"{name} does not use the shared motor")

if "data-promo-listing" not in PROMO_HTML:
    fail("listing host missing")

if "calendar_pending" in json.dumps(CONFIG):
    fail("calendar_pending still present in campaign config")
if "statusFor" not in PROMO_JS or "registrationOpen" not in PROMO_JS:
    fail("calendar status motor missing")
if "INSCRIÇÕES ENCERRADAS" not in PROMO_JS or "AGUARDANDO SORTEIO" not in PROMO_JS:
    fail("status labels missing from motor")

status_script = r"""
const fs = require("fs");
const vm = require("vm");
const payload = JSON.parse(process.argv[1]);
const ctx = { window: {}, document: undefined, fetch: undefined, Intl };
vm.runInNewContext(fs.readFileSync("js/promocoes.js", "utf8"), ctx);
const api = ctx.window.PassportPromocoes;
const config = JSON.parse(fs.readFileSync("data/promocoes.json", "utf8"));
const byId = Object.fromEntries(config.campaigns.map((c) => [c.id, c]));
const out = payload.cases.map((item) => ({
  id: item.id,
  at: item.at,
  status: api.statusFor(byId[item.id], Date.parse(item.at)),
  open: api.registrationOpen(byId[item.id], Date.parse(item.at)),
}));
process.stdout.write(JSON.stringify(out));
"""

status_cases = [
    # UCI
    {"id": "PR-0002", "at": "2026-08-31T12:00:00-03:00", "status": "EM BREVE", "open": False},
    {"id": "PR-0002", "at": "2026-09-01T00:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0002", "at": "2026-09-17T16:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0002", "at": "2026-09-30T23:59:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0002", "at": "2026-10-01T00:00:00-03:00", "status": "INSCRIÇÕES ENCERRADAS", "open": False},
    {"id": "PR-0002", "at": "2026-10-01T12:00:00-03:00", "status": "AGUARDANDO SORTEIO", "open": False},
    {"id": "PR-0002", "at": "2026-10-02T12:00:00-03:00", "status": "AGUARDANDO RESULTADO", "open": False},
    # Queen 18/09 → 03/10 → 04/10 → 05/10
    {"id": "PR-0005", "at": "2026-09-17T23:59:00-03:00", "status": "EM BREVE", "open": False},
    {"id": "PR-0005", "at": "2026-09-18T00:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0005", "at": "2026-10-03T23:59:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0005", "at": "2026-10-04T00:00:00-03:00", "status": "INSCRIÇÕES ENCERRADAS", "open": False},
    {"id": "PR-0005", "at": "2026-10-04T12:00:00-03:00", "status": "AGUARDANDO SORTEIO", "open": False},
    {"id": "PR-0005", "at": "2026-10-05T12:00:00-03:00", "status": "AGUARDANDO RESULTADO", "open": False},
    # Street Fighter 22/09 → 10/10 → 11/10 → 12/10
    {"id": "PR-0004", "at": "2026-09-21T12:00:00-03:00", "status": "EM BREVE", "open": False},
    {"id": "PR-0004", "at": "2026-09-22T00:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0004", "at": "2026-10-10T23:59:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0004", "at": "2026-10-11T00:00:00-03:00", "status": "INSCRIÇÕES ENCERRADAS", "open": False},
    {"id": "PR-0004", "at": "2026-10-11T12:00:00-03:00", "status": "AGUARDANDO SORTEIO", "open": False},
    {"id": "PR-0004", "at": "2026-10-12T12:00:00-03:00", "status": "AGUARDANDO RESULTADO", "open": False},
    # Caneca 25/09 → 15/10 → 16/10 → 17/10
    {"id": "PR-0006", "at": "2026-09-24T12:00:00-03:00", "status": "EM BREVE", "open": False},
    {"id": "PR-0006", "at": "2026-09-25T00:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0006", "at": "2026-10-15T23:59:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0006", "at": "2026-10-16T00:00:00-03:00", "status": "INSCRIÇÕES ENCERRADAS", "open": False},
    {"id": "PR-0006", "at": "2026-10-16T12:00:00-03:00", "status": "AGUARDANDO SORTEIO", "open": False},
    {"id": "PR-0006", "at": "2026-10-17T12:00:00-03:00", "status": "AGUARDANDO RESULTADO", "open": False},
    # Camiseta 01/10 → 22/10 → 23/10 → 24/10
    {"id": "PR-0007", "at": "2026-09-30T12:00:00-03:00", "status": "EM BREVE", "open": False},
    {"id": "PR-0007", "at": "2026-10-01T00:00:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0007", "at": "2026-10-22T23:59:00-03:00", "status": "ATIVA", "open": True},
    {"id": "PR-0007", "at": "2026-10-23T00:00:00-03:00", "status": "INSCRIÇÕES ENCERRADAS", "open": False},
    {"id": "PR-0007", "at": "2026-10-23T12:00:00-03:00", "status": "AGUARDANDO SORTEIO", "open": False},
    {"id": "PR-0007", "at": "2026-10-24T12:00:00-03:00", "status": "AGUARDANDO RESULTADO", "open": False},
    # Fone Retrô published result
    {"id": "PR-0001", "at": "2026-08-20T12:00:00-03:00", "status": "RESULTADO PUBLICADO", "open": False},
    {"id": "PR-0001", "at": "2026-09-17T12:00:00-03:00", "status": "RESULTADO PUBLICADO", "open": False},
]
got_status = json.loads(subprocess.check_output(
    ["node", "-e", status_script, json.dumps({"cases": status_cases})],
    cwd=ROOT,
    text=True,
))
for expected, actual in zip(status_cases, got_status):
    if actual["status"] != expected["status"] or actual["open"] != expected["open"]:
        fail(f"status {expected['id']} @ {expected['at']}: got {actual} expected {expected['status']} open={expected['open']}")

# rules must carry calendar, not leftover "a confirmar" placeholders on dated campaigns
for item in (uci, queen, sf, caneca, camiseta):
    blob = " ".join(item.get("rules") or [])
    if "Abertura das inscrições" not in blob or "Encerramento das inscrições" not in blob:
        fail(f"{item['id']} regulation missing abertura/encerramento")
    if "Sorteio:" not in blob or "Resultado:" not in blob:
        fail(f"{item['id']} regulation missing sorteio/resultado")
    if item.get("winner"):
        continue
if "Exibição UCI em 07/10/2026" not in " ".join(queen["rules"]):
    fail("Queen exhibition missing from regulation")
if "Exibição UCI em 15/10/2026" not in " ".join(sf["rules"]):
    fail("Street Fighter exhibition missing from regulation")

# radio/home must not be part of this surgery
commercial_blob = "\n".join(path.read_text(encoding="utf-8") for path in COMMERCIAL_FILES)
for token in (
    "PassportBus",
    "passport-persist-nav",
    "passport-casa-host",
    "pp-persist",
    "new Audio(",
    "passport-live.js",
    "continuous-signals-home",
    "tunnel-player",
):
    if token in commercial_blob:
        fail(f"commercial scope imported protected radio token: {token}")
if "js/promocoes.js" not in CI or "js/passport-commercial.js" not in CI:
    fail("CI does not syntax-check commercial JS")
if "tests/test_commercial_promotions.py" not in CI:
    fail("CI does not run commercial contracts")

print("OK commercial periods 1-160 match Whiplash")
print("OK 5-day FREE: 422.50/322.50/247.50 → 0; publieditorial excluded")
print("OK immutable Passport prices; 55% not reapplied")
print("OK PIX key QR is local")
print("OK five campaigns + Fone Retrô José Silva Souza")
print("OK Formspree xaenylvg; xoeqnvjg absent from commercial scope")
print("OK catalog products 5786215 / 2876812")
print("OK commercial scope does not import radio motors")
print("OK campaign calendars, questions and automatic status transitions")
