#!/usr/bin/env python3
"""Connect the real Passport Store catalog to editorial entities.

Never invents SKU, price, stock or image. Reads data/store_inventory*.json only.
Stamp rockwear already lives in those chunks; audio stubs in /produto/ are
preserved as a separate Passport line.
"""
from __future__ import annotations

import json
import re
import unicodedata
import html as html_lib
from pathlib import Path
from typing import Any
from passport_store_pricing import CARD_INSTALLMENTS, conditions_from_passport_price, from_stamp_public

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "store_inventory.json"
SEARCH_DIR = ROOT / "data" / "store-search"
ENTITY_MAP = ROOT / "data" / "store-entity-map.json"
PRODUCT_DIR = ROOT / "loja" / "p"
SITE = "https://passportradio.online"
ASAAS = "https://www.asaas.com/c/shpb8gbiswnw4t2n"
WA = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"

ARTIST_ALIASES = {
    "ac/dc": "AC/DC", "acdc": "AC/DC",
    "pink floyd": "Pink Floyd",
    "iron maiden": "Iron Maiden",
    "metallica": "Metallica",
    "black sabbath": "Black Sabbath",
    "nirvana": "Nirvana",
    "ramones": "Ramones",
    "guns n roses": "Guns N' Roses", "guns n' roses": "Guns N' Roses",
    "led zeppelin": "Led Zeppelin",
    "rolling stones": "Rolling Stones",
    "the rolling stones": "Rolling Stones",
    "kiss": "Kiss",
    "slayer": "Slayer",
    "megadeth": "Megadeth",
    "sepultura": "Sepultura",
    "slipknot": "Slipknot",
    "ozzy": "Ozzy Osbourne", "ozzy osbourne": "Ozzy Osbourne",
    "rush": "Rush",
    "queen": "Queen",
    "beatles": "The Beatles", "the beatles": "The Beatles",
    "oasis": "Oasis",
    "machine head": "Machine Head",
    "mastodon": "Mastodon",
    "yes": "Yes",
    "nightwish": "Nightwish",
    "angra": "Angra",
    "kid abelha": "Kid Abelha",
    "gojira": "Gojira",
    "ghost": "Ghost",
    "tool": "Tool",
    "the cure": "The Cure",
    "joy division": "Joy Division",
    "foo fighters": "Foo Fighters",
    "green day": "Green Day",
    "system of a down": "System Of A Down",
    "judas priest": "Judas Priest",
    "motorhead": "Motörhead",
    "motörhead": "Motörhead",
    "deep purple": "Deep Purple",
    "scorpions": "Scorpions",
    "pantera": "Pantera",
    "the doors": "The Doors",
    "the who": "The Who",
    "bob marley": "Bob Marley",
    "david bowie": "David Bowie",
}


def fold(value: Any) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()


def load_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text("utf-8"))
    except json.JSONDecodeError:
        return fallback


def load_products() -> list[dict[str, Any]]:
    manifest = load_json(MANIFEST, {})
    rows: list[dict[str, Any]] = []
    seen: set[str] = set()
    chunks = manifest.get("chunks") or []
    for rel in chunks:
        payload = load_json(ROOT / str(rel).lstrip("/"), {})
        for item in payload.get("products") or []:
            pid = str(item.get("id") or "")
            if not pid or pid in seen:
                continue
            seen.add(pid)
            rows.append(item)
    return rows


def usable_image(product: dict[str, Any]) -> bool:
    image = str(product.get("image") or "")
    return image.startswith("/images/") or image.startswith("https://")


def is_publishable(product: dict[str, Any]) -> bool:
    if product.get("publish") is False:
        return False
    if str(product.get("category") or "").strip() == "Vale Presente":
        return False
    price = product.get("price")
    try:
        ok_price = float(price) > 0
    except (TypeError, ValueError):
        ok_price = False
    return bool(ok_price and usable_image(product))


def artist_of(product: dict[str, Any]) -> str:
    explicit = str(product.get("artist") or product.get("banda") or product.get("theme") or "").strip()
    if explicit:
        return ARTIST_ALIASES.get(fold(explicit), explicit)
    hay = fold(product.get("name") or "")
    for key, label in sorted(ARTIST_ALIASES.items(), key=lambda x: -len(x[0])):
        if re.search(rf"\b{re.escape(key)}\b", hay):
            return label
    return ""


def classify(product: dict[str, Any]) -> dict[str, Any]:
    category = str(product.get("category") or "Loja")
    name = str(product.get("name") or "")
    folded = fold(f"{category} {name}")
    kind = "acessorio"
    if "camiseta" in folded:
        kind = "camiseta"
    elif "tenis" in folded or "tênis" in folded:
        kind = "tenis"
    elif "bandeira" in folded:
        kind = "bandeira"
    elif "copo" in folded or "caneca" in folded:
        kind = "copo"
    elif "vale" in folded:
        kind = "vale"
    gender = ""
    if "feminino" in folded or "feminina" in folded:
        gender = "feminino"
    elif "infantil" in folded:
        gender = "infantil"
    elif "masculino" in folded or "masculina" in folded:
        gender = "masculino"
    return {
        "kind": kind,
        "gender": gender,
        "artist": artist_of(product),
        "publishable": is_publishable(product),
        "cataloged": True,
    }


def lineage_of(product: dict[str, Any]) -> str:
    explicit = str(product.get("lineage") or "")
    if explicit:
        return explicit
    pid = str(product.get("id") or "")
    if pid.startswith("tenis-p1"):
        return "passport_ten_p1"
    if pid.startswith("shoe-size"):
        return "passport_historical_tenis"
    image = str(product.get("image") or "")
    if "stamp.jetassets" in image or product.get("stamp_url"):
        return "stamp"
    return "passport"


def apply_pricing(product: dict[str, Any]) -> dict[str, Any]:
    """Compute Passport/Pix/boleto/card from the correct base. Never invent Stamp prices."""
    lin = lineage_of(product)
    if lin in {"stamp", "stamp_preexisting"} and product.get("stamp_price"):
        priced = from_stamp_public(product.get("stamp_price"))
        if priced:
            return priced
    if lin in {"stamp", "stamp_preexisting"} and product.get("price") and not product.get("stamp_price"):
        # preexisting Passport row that already stored a Passport price, no live Stamp
        return conditions_from_passport_price(product.get("price")) or {}
    return conditions_from_passport_price(product.get("price")) or {}


def enrich(product: dict[str, Any]) -> dict[str, Any]:
    extra = classify(product)
    image = str(product.get("image") or "")
    lin = lineage_of(product)
    priced = apply_pricing(product)
    price = priced.get("price", product.get("price"))
    pix = priced.get("pix_price", product.get("pix_price"))
    boleto = priced.get("boleto_price", product.get("boleto_price"))
    inst = priced.get("max_installments") or CARD_INSTALLMENTS
    row = {
        "id": str(product.get("id") or ""),
        "sku": str(product.get("sku") or product.get("id") or ""),
        "name": str(product.get("name") or ""),
        "category": str(product.get("category") or ""),
        "type": extra["kind"],
        "gender": extra["gender"] or product.get("gender") or "",
        "artist": extra["artist"],
        "price": price,
        "pix_price": pix,
        "boleto_price": boleto,
        "regular_price": product.get("regular_price") or product.get("stamp_list_price") or product.get("stamp_price") or price,
        "stamp_price": product.get("stamp_price"),
        "stamp_url": product.get("stamp_url") or "",
        "card_installment": priced.get("card_installment"),
        "image": image,
        "in_stock": bool(product.get("in_stock", True)),
        "max_installments": inst,
        "variant": product.get("variant") or "",
        "url": f"/loja/p/{product.get('id')}.html",
        "publishable": extra["publishable"] and lin != "passport_ten_p1",
        "lineage": lin,
        "pricing_rule": priced.get("pricing_rule") or product.get("pricing_rule") or "",
        "source": (
            "stamp.jetassets" if "stamp.jetassets" in image else
            ("passport-local" if image.startswith("/images/") else "passport")
        ),
        "norm": fold(" ".join([
            str(product.get("name") or ""),
            str(product.get("category") or ""),
            extra["artist"],
            extra["kind"],
            str(product.get("sku") or ""),
            extra["gender"],
            lin,
        ])),
    }
    return row


_CACHE: list[dict[str, Any]] | None = None


def catalog(refresh: bool = False) -> list[dict[str, Any]]:
    global _CACHE
    if refresh:
        _CACHE = None
    if _CACHE is None:
        _CACHE = [enrich(p) for p in load_products()]
    return _CACHE


def products_for_entities(names: list[str], limit: int = 4) -> list[dict[str, Any]]:
    wanted = {fold(n) for n in names if fold(n)}
    aliases = {fold(k): fold(v) for k, v in ARTIST_ALIASES.items()}
    expanded = set(wanted)
    for key, val in aliases.items():
        if key in wanted or val in wanted:
            expanded.add(key)
            expanded.add(val)
    out = []
    for item in catalog():
        if not item["publishable"]:
            continue
        artist = fold(item.get("artist") or "")
        if artist and artist in expanded:
            out.append(item)
        if len(out) >= limit:
            break
    return out


def search_store(query: str, items: list[dict[str, Any]] | None = None, page: int = 1, per_page: int = 24) -> dict[str, Any]:
    tokens = [t for t in fold(query).split() if t]
    pool = items if items is not None else [x for x in catalog() if x["publishable"]]
    if not tokens:
        return {"query": query, "total": 0, "page": 1, "pages": 0, "items": []}
    scored = []
    for item in pool:
        hay = item.get("norm") or ""
        name = fold(item.get("name") or "")
        artist = fold(item.get("artist") or "")
        score = 0
        miss = False
        for token in tokens:
            if token in name:
                score += 8
            elif token in artist:
                score += 7
            elif token in hay:
                score += 3
            else:
                miss = True
                break
        if miss or not score:
            continue
        scored.append((score, item))
    scored.sort(key=lambda x: (-x[0], str(x[1].get("name") or "")))
    total = len(scored)
    pages = max(1, (total + per_page - 1) // per_page) if total else 0
    page = max(1, min(page, pages or 1))
    start = (page - 1) * per_page
    return {
        "query": query,
        "total": total,
        "page": page,
        "pages": pages,
        "items": [x[1] for x in scored[start:start + per_page]],
    }


def inventory_report() -> dict[str, Any]:
    rows = catalog()
    cats: dict[str, int] = {}
    kinds: dict[str, int] = {}
    artists: dict[str, int] = {}
    publishable = [x for x in rows if x["publishable"]]
    unmaterialized = []
    for item in rows:
        cats[item["category"] or "?"] = cats.get(item["category"] or "?", 0) + 1
        kinds[item["type"]] = kinds.get(item["type"], 0) + 1
        if item["artist"]:
            artists[item["artist"]] = artists.get(item["artist"], 0) + 1
        if not item["publishable"]:
            reason = []
            if not item["image"]:
                reason.append("sem_imagem")
            if not item["price"]:
                reason.append("sem_preco")
            if item["category"] == "Vale Presente":
                reason.append("vale_presente_oculto_na_vitrine")
            unmaterialized.append({
                "id": item["id"],
                "name": item["name"],
                "reason": ",".join(reason) or "nao_publicavel",
            })
    return {
        "cataloged": len(rows),
        "publishable": len(publishable),
        "published_on_vitrine": len(publishable),
        "with_valid_image": sum(1 for x in rows if x["image"]),
        "stamp_cdn_images": sum(1 for x in rows if x["source"] == "stamp.jetassets"),
        "local_images": sum(1 for x in rows if x["source"] == "passport-local"),
        "lineage": {
            "stamp": sum(1 for x in rows if x.get("lineage") == "stamp"),
            "stamp_preexisting": sum(1 for x in rows if x.get("lineage") == "stamp_preexisting"),
            "passport_ten_p1": sum(1 for x in rows if x.get("lineage") == "passport_ten_p1"),
            "passport_historical_tenis": sum(1 for x in rows if x.get("lineage") == "passport_historical_tenis"),
            "passport": sum(1 for x in rows if x.get("lineage") == "passport"),
        },
        "ten_p1_unpublished": sum(1 for x in rows if x.get("lineage") == "passport_ten_p1"),
        "historical_tenis_with_local_images": sum(1 for x in rows if x.get("lineage") == "passport_historical_tenis" and x.get("source") == "passport-local"),
        "categories": cats,
        "types": kinds,
        "artists_linked": artists,
        "unmaterialized": unmaterialized,
        "produto_html_line": [
            "cuvave-cube-baby", "jbl-cinema-sb595", "jbl-tune-520bt", "jbl-wave-beam-2",
            "raveo-harmony", "raveo-turner", "soundcore-p20i", "strinberg-sb240c",
            "tagima-millenium-6", "thomaz-teg340",
        ],
        "pricing": {
            "stamp_public_times": 0.80,
            "pix_off_passport": 0.05,
            "boleto": "passport_at_sight",
            "card_installments": CARD_INSTALLMENTS,
            "example_stamp_100": from_stamp_public(100),
        },
        "stamp_note": (
            "STAMP_SOURCE is the live crawl of stamp.com.br. "
            "TEN-P1 (48) are Passport historical without image — not Stamp pending. "
            "43 recovered tennis keep local images. "
            "New Stamp SKUs enter only with observed photo + public price. "
            "Passport price = Stamp public × 0.80; Pix = 5% off Passport; boleto = Passport; card up to 6x."
        ),
    }


def related_products(product: dict[str, Any], limit: int = 4) -> list[dict[str, Any]]:
    pid = str(product.get("id") or "")
    artist = fold(product.get("artist") or "")
    kind = fold(product.get("type") or "")
    out: list[dict[str, Any]] = []
    for item in catalog():
        if not item["publishable"] or item["id"] == pid:
            continue
        if artist and fold(item.get("artist") or "") == artist:
            out.append(item)
        elif kind and fold(item.get("type") or "") == kind and len(out) < 2:
            out.append(item)
        if len(out) >= limit:
            break
    return out


def _esc(value: Any) -> str:
    return html_lib.escape(str(value or ""), quote=True)


def _money_br(value: Any) -> str:
    try:
        return f"R$ {float(value):.2f}".replace(".", ",")
    except (TypeError, ValueError):
        return ""


def render_product_page(product: dict[str, Any]) -> str:
    name = product["name"]
    price = product.get("price") or 0
    money = _money_br(price)
    pix = product.get("pix_price")
    pix_line = _money_br(pix) if pix else ""
    boleto = product.get("boleto_price") or price
    inst = int(product.get("max_installments") or CARD_INSTALLMENTS)
    installment = product.get("card_installment")
    if installment is None and price:
        try:
            installment = round(float(price) / inst, 2)
        except (TypeError, ValueError, ZeroDivisionError):
            installment = None
    artist = product.get("artist") or ""
    artist_html = ""
    if artist:
        from editorial_blog_catalog import slugify
        artist_html = (
            f'<p class="pp-product-entity">No acervo: <a href="/blog/e/{_esc(slugify(artist))}.html">{_esc(artist)}</a> · '
            f'<a href="/loja.html?entity={_esc(artist)}">mais produtos deste nome</a></p>'
        )
    related = related_products(product)
    rel_html = "".join(
        f'<a class="pp-product" href="{_esc(r["url"])}"><img src="{_esc(r["image"])}" alt="{_esc(r["name"])}" width="160" height="160" loading="lazy">'
        f'<strong>{_esc(r["name"])}</strong><span>{_esc(_money_br(r.get("price")))}</span></a>'
        for r in related
    )
    stock = "disponível" if product.get("in_stock") else "sob consulta"
    sku = product.get("sku") or product.get("id")
    schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "image": product.get("image"),
        "sku": sku,
        "brand": {"@type": "Brand", "name": "Passport Store"},
        "offers": {
            "@type": "Offer",
            "priceCurrency": "BRL",
            "price": str(price),
            "availability": "https://schema.org/InStock" if product.get("in_stock") else "https://schema.org/PreOrder",
            "url": SITE + product["url"],
        },
    }
    import json as _json
    pix_html = f"<p class=\"pp-pix\">Pix {_esc(pix_line)} <small>5% off o preço Passport</small></p>" if pix_line else ""
    inst_html = (
        f"<p class=\"pp-installments\">Cartão em até {inst}x de {_esc(_money_br(installment))} sem inventar juros nesta página. "
        f"Boleto à vista {_esc(_money_br(boleto))}.</p>"
    )
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{_esc(name)} | Loja Passport Radio</title>
<meta name="description" content="{_esc(name)} na Loja Passport. Pix, boleto e cartão em até {inst}x.">
<link rel="canonical" href="{SITE}{product["url"]}">
<link rel="stylesheet" href="/css/passport-tokens-v6.css?v=20260908z">
<link rel="stylesheet" href="/css/passport-shell-v6.css?v=20260908z">
<link rel="stylesheet" href="/css/passport-store-v6.css?v=20260918r">
<link rel="stylesheet" href="/css/passport-blog.css?v=20260918s">
<script type="application/ld+json">{_json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="pp-body pp-station">
<header class="pp-topbar"><div class="pp-topbar-in">
<a class="pp-brand" href="/index.html"><img src="/images/passport-radio-definitive.jpg" alt="Passport Radio" width="38" height="38"><span class="pp-brand-txt"><b>PASSPORT RADIO</b></span></a>
<nav class="pp-top-actions"><a href="/loja.html">Loja</a><a href="/loja.html#pp-store-cart">Carrinho</a><a href="/blog.html">Blog</a></nav>
</div></header>
<main class="pp-product-page">
<nav class="blog-crumbs"><a href="/loja.html">Loja</a> · <span>{_esc(product.get("category") or "")}</span></nav>
<article class="pp-product-detail" id="pp-detail">
<img src="{_esc(product.get("image"))}" alt="{_esc(name)}" width="640" height="640">
<div>
<span class="pp-env__kicker">PASSPORT STORE · {_esc(product.get("category") or "")}</span>
<h1>{_esc(name)}</h1>
<p class="pp-price">{_esc(money)}</p>
{pix_html}
{inst_html}
<p>SKU {_esc(sku)}. Estoque: {_esc(stock)}. Preço e imagem saem do catálogo observado.</p>
{artist_html}
<p>
<button type="button" class="pp-btn pp-btn--ink" data-add-cart="{_esc(product["id"])}" data-sku="{_esc(sku)}" data-name="{_esc(name)}" data-price="{_esc(price)}" data-pix="{_esc(pix or "")}">Adicionar ao carrinho</button>
<a class="pp-btn pp-btn--red" href="{ASAAS}" target="_blank" rel="noopener">Checkout Asaas</a>
<a class="pp-btn pp-btn--ghost" href="{WA}" target="_blank" rel="noopener">Passport Radio Channel</a>
</p>
<p class="pp-cart-note">O Asaas desta casa não recebe SKU automaticamente. O carrinho local monta o pedido; O canal oficial mantém o público conectado à Passport Radio.</p>
</div>
</article>
<section id="pp-store-cart" class="pp-store-cart" aria-label="Carrinho"></section>
<section class="pp-related-store"><h2>Na mesma prateleira</h2><div class="pp-store-grid">{rel_html}</div></section>
</main>
<script src="/js/passport-store-search.js?v=20260918s" defer></script>
</body></html>
'''


def write_product_pages(rows: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    PRODUCT_DIR.mkdir(parents=True, exist_ok=True)
    pool = [x for x in (rows or catalog()) if x.get("publishable")]
    wanted: set[str] = set()
    for item in pool:
        name = f"{item['id']}.html"
        (PRODUCT_DIR / name).write_text(render_product_page(item), "utf-8")
        wanted.add(name)
    for stale in PRODUCT_DIR.glob("*.html"):
        if stale.name not in wanted:
            stale.unlink()
    urls = [("/loja.html", "daily", "0.8")] + [(f"/loja/p/{x['id']}.html", "weekly", "0.5") for x in pool]
    parts = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for loc, freq, pri in urls:
        parts.append(f"<url><loc>{SITE}{loc}</loc><changefreq>{freq}</changefreq><priority>{pri}</priority></url>")
    parts.append("</urlset>\n")
    (ROOT / "sitemap-loja.xml").write_text("\n".join(parts), "utf-8")
    robots = ROOT / "robots.txt"
    text = robots.read_text("utf-8") if robots.exists() else "User-agent: *\nAllow: /\n"
    line = f"Sitemap: {SITE}/sitemap-loja.xml"
    if line not in text:
        if not text.endswith("\n"):
            text += "\n"
        robots.write_text(text + line + "\n", "utf-8")
    return {"product_pages": len(wanted)}


def write_store_index() -> dict[str, Any]:
    rows = catalog(refresh=True)
    SEARCH_DIR.mkdir(parents=True, exist_ok=True)
    compact = [{
        "id": x["id"], "sku": x["sku"], "name": x["name"], "category": x["category"],
        "type": x["type"], "artist": x["artist"], "price": x["price"],
        "pix_price": x.get("pix_price"), "boleto_price": x.get("boleto_price"),
        "max_installments": x.get("max_installments"),
        "image": x["image"], "url": x["url"], "publishable": x["publishable"],
        "in_stock": x["in_stock"], "gender": x["gender"], "norm": x["norm"],
        "lineage": x.get("lineage"),
    } for x in rows]
    (SEARCH_DIR / "index.json").write_text(
        json.dumps({"items": compact, "count": len(compact)}, ensure_ascii=False) + "\n",
        "utf-8",
    )
    by_artist: dict[str, list[str]] = {}
    for item in rows:
        if item["artist"] and item["publishable"]:
            by_artist.setdefault(item["artist"], []).append(item["id"])
    ENTITY_MAP.write_text(json.dumps({"artists": by_artist, "count": len(by_artist)}, ensure_ascii=False, indent=2) + "\n", "utf-8")
    report = inventory_report()
    (ROOT / "data" / "store-inventory-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8"
    )
    pages = write_product_pages(rows)
    return {
        "indexed": len(rows),
        "artists": len(by_artist),
        "publishable": report["publishable"],
        "product_pages": pages["product_pages"],
    }


if __name__ == "__main__":
    print(json.dumps(write_store_index(), ensure_ascii=False, indent=2))
