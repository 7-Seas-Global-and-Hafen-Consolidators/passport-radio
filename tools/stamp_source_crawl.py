#!/usr/bin/env python3
"""Live Stamp source inventory.

Reads stamp.com.br sitemap, then fetches unique product pages and records
only what the public HTML actually contains: URL, id, name, price, image,
breadcrumbs, variants. Never invents a SKU or a price.

Usage:
  python tools/stamp_source_crawl.py
  python tools/stamp_source_crawl.py --limit 40
"""
from __future__ import annotations

import argparse
import datetime as dt
import html as html_lib
import json
import re
import ssl
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SITEMAP = "https://www.stamp.com.br/sitemap.xml"
UA = (
    "Mozilla/5.0 (compatible; PassportRadioInventory/1.0; "
    "+https://passportradio.online/contato.html)"
)
OUT_DIR = ROOT / "data"
REPORTS = ROOT / "reports"
CTX = ssl.create_default_context()

PRODUCT_RE = re.compile(
    r"https://www\.stamp\.com\.br/produto/([^/<\"'\s]+)/(\d+)",
    re.I,
)
PRICE_RE = re.compile(
    r'itemprop="price"\s+content="([\d.]+)"[^>]*id="preco"|id="preco"[^>]*itemprop="price"\s+content="([\d.]+)"',
    re.I,
)
PRICE_FALLBACK = re.compile(
    r'id="preco"[^>]*data-preco-inicial="([\d.,]+)"|class="preco"[^>]*>\s*R\$\s*([\d.,]+)',
    re.I,
)
OLD_PRICE_RE = re.compile(r'id="preco-antigo"[^>]*>\s*R\$\s*([\d.,]+)', re.I)
TITLE_RE = re.compile(r"<title[^>]*>(.*?)</title>", re.I | re.S)
H1_RE = re.compile(r"<h1[^>]*>(.*?)</h1>", re.I | re.S)
IMG_RE = re.compile(r"https://stamp\.jetassets\.com\.br/produto/[^\"'\s]+", re.I)
BREADCRUMB_RE = re.compile(
    r'"@type"\s*:\s*"ListItem".*?"name"\s*:\s*"(.*?)"',
    re.I | re.S,
)
SKU_RE = re.compile(r"(?:idSku|IdSku)=(\d+)", re.I)
TAG_RE = re.compile(r"<[^>]+>")


def fetch(url: str, timeout: int = 25) -> tuple[int, str]:
    req = Request(url, headers={"User-Agent": UA, "Accept": "text/html,application/xml;q=0.9,*/*;q=0.8"})
    try:
        with urlopen(req, timeout=timeout, context=CTX) as resp:
            status = getattr(resp, "status", 200) or 200
            body = resp.read().decode("utf-8", "replace")
            return int(status), body
    except Exception as exc:
        return 0, f"{type(exc).__name__}: {exc}"


def clean(text: str) -> str:
    text = html_lib.unescape(TAG_RE.sub(" ", text or ""))
    return re.sub(r"\s+", " ", text).strip()


def parse_money(raw: str) -> float | None:
    text = (raw or "").strip().replace("R$", "").replace(" ", "")
    if not text:
        return None
    if "," in text and "." in text:
        text = text.replace(".", "").replace(",", ".")
    elif "," in text:
        text = text.replace(",", ".")
    try:
        value = float(text)
    except ValueError:
        return None
    if value <= 0:
        return None
    return round(value, 2)


def parse_sitemap(xml: str) -> dict[str, Any]:
    locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", xml)
    products: dict[str, dict[str, Any]] = {}
    variants = 0
    categories: list[str] = []
    grupos: list[str] = []
    other: list[str] = []
    for loc in locs:
        loc = loc.strip()
        match = PRODUCT_RE.search(loc)
        if match:
            slug, pid = match.group(1), match.group(2)
            sku_match = SKU_RE.search(loc)
            sku = sku_match.group(1) if sku_match else ""
            if sku:
                variants += 1
            row = products.get(pid)
            if row is None:
                products[pid] = {
                    "id": pid,
                    "slug": slug,
                    "url": f"https://www.stamp.com.br/produto/{slug}/{pid}",
                    "skus": [sku] if sku else [],
                }
            else:
                if sku and sku not in row["skus"]:
                    row["skus"].append(sku)
            continue
        if "/categoria/" in loc:
            categories.append(loc)
        elif "/grupo/" in loc:
            grupos.append(loc)
        else:
            other.append(loc)
    return {
        "sitemap_urls": len(locs),
        "unique_products": products,
        "variant_urls": variants,
        "categories": sorted(set(categories)),
        "grupos": sorted(set(grupos)),
        "other": other,
    }


def parse_product(pid: str, slug: str, url: str, html: str) -> dict[str, Any]:
    title_m = TITLE_RE.search(html)
    h1_m = H1_RE.search(html)
    name = clean(h1_m.group(1) if h1_m else "") or clean(title_m.group(1) if title_m else slug.replace("-", " "))
    price = None
    pm = PRICE_RE.search(html)
    if pm:
        price = parse_money(pm.group(1) or pm.group(2) or "")
    if price is None:
        fb = PRICE_FALLBACK.search(html)
        if fb:
            price = parse_money(fb.group(1) or fb.group(2) or "")
    old = None
    om = OLD_PRICE_RE.search(html)
    if om:
        old = parse_money(om.group(1))
    images = []
    seen = set()
    for img in IMG_RE.findall(html):
        img = img.split("?")[0]
        if img in seen:
            continue
        seen.add(img)
        images.append(img)
    preferred = ""
    for img in images:
        if img.endswith("_H.jpg") or "_H." in img:
            preferred = img
            break
    if not preferred and images:
        preferred = images[0]
    crumbs = [html_lib.unescape(x) for x in BREADCRUMB_RE.findall(html)]
    skus = sorted(set(SKU_RE.findall(html)))
    category = ""
    gender = ""
    if crumbs:
        # Breadcrumb after Home: Bandas / Masculino / Metallica
        useful = [c for c in crumbs if c.lower() not in {"home", "início", "inicio"}]
        if useful:
            category = useful[0]
        hay = " ".join(useful).lower()
        if "feminino" in hay:
            gender = "feminino"
        elif "infantil" in hay or "teen" in hay:
            gender = "infantil"
        elif "masculino" in hay:
            gender = "masculino"
    kind = "acessorio"
    low = (name + " " + slug).lower()
    if "camiseta" in low:
        kind = "camiseta"
    elif "regata" in low:
        kind = "regata"
    elif "bandeira" in low:
        kind = "bandeira"
    elif "boné" in low or "bone" in low:
        kind = "bone"
    elif "copo" in low or "caneca" in low:
        kind = "copo"
    elif "vale" in low:
        kind = "vale"
    elif "tenis" in low or "tênis" in low:
        kind = "tenis"
    return {
        "id": pid,
        "slug": slug,
        "url": url,
        "name": name,
        "stamp_price": price,
        "stamp_list_price": old,
        "image": preferred,
        "images": images[:8],
        "breadcrumbs": crumbs,
        "category": category,
        "gender": gender,
        "kind": kind,
        "skus": skus,
        "has_image": bool(preferred),
        "has_price": bool(price),
        "eligible": bool(preferred and price),
    }


def crawl(limit: int = 0, workers: int = 12) -> dict[str, Any]:
    started = time.time()
    status, xml = fetch(SITEMAP, timeout=60)
    if status != 200 or "<loc>" not in xml:
        return {
            "ok": False,
            "error": f"sitemap fetch failed status={status}",
            "body_preview": xml[:400],
            "crawled_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        }
    parsed = parse_sitemap(xml)
    products = parsed["unique_products"]
    ids = sorted(products.keys(), key=lambda x: int(x) if x.isdigit() else x)
    if limit and limit > 0:
        ids = ids[:limit]
    rows: list[dict[str, Any]] = []
    errors: list[dict[str, str]] = []
    visited = 0

    def one(pid: str) -> dict[str, Any]:
        meta = products[pid]
        st, body = fetch(meta["url"])
        if st != 200 or "id=\"preco\"" not in body and 'itemprop="price"' not in body and "<title" not in body:
            return {"error": True, "id": pid, "url": meta["url"], "status": st, "detail": body[:180]}
        row = parse_product(pid, meta["slug"], meta["url"], body)
        row["sitemap_skus"] = meta.get("skus") or []
        return row

    with ThreadPoolExecutor(max_workers=max(1, workers)) as pool:
        futs = {pool.submit(one, pid): pid for pid in ids}
        for fut in as_completed(futs):
            visited += 1
            result = fut.result()
            if result.get("error"):
                errors.append({
                    "id": str(result.get("id")),
                    "url": str(result.get("url")),
                    "status": str(result.get("status")),
                    "detail": str(result.get("detail") or "")[:180],
                })
            else:
                rows.append(result)

    rows.sort(key=lambda r: int(r["id"]) if str(r["id"]).isdigit() else 0)
    eligible = [r for r in rows if r.get("eligible")]
    summary = {
        "ok": True,
        "source": "https://www.stamp.com.br/",
        "crawled_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "duration_s": round(time.time() - started, 1),
        "sitemap_urls": parsed["sitemap_urls"],
        "stamp_source_total": len(products),
        "stamp_source_variants": parsed["variant_urls"],
        "stamp_source_categories": len(parsed["categories"]),
        "stamp_source_grupos": len(parsed["grupos"]),
        "pages_visited": visited,
        "products_parsed": len(rows),
        "products_with_image": sum(1 for r in rows if r.get("has_image")),
        "products_with_price": sum(1 for r in rows if r.get("has_price")),
        "products_eligible": len(eligible),
        "fetch_errors": len(errors),
        "categories": parsed["categories"],
        "grupos": parsed["grupos"],
        "errors": errors[:80],
        "products": rows,
    }
    return summary


def write_artifacts(payload: dict[str, Any]) -> dict[str, str]:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    REPORTS.mkdir(parents=True, exist_ok=True)
    full_path = OUT_DIR / "stamp-source-inventory.json"
    full_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", "utf-8")
    compact = dict(payload)
    compact["products"] = [
        {
            "id": p.get("id"),
            "url": p.get("url"),
            "name": p.get("name"),
            "stamp_price": p.get("stamp_price"),
            "stamp_list_price": p.get("stamp_list_price"),
            "image": p.get("image"),
            "category": p.get("category"),
            "gender": p.get("gender"),
            "kind": p.get("kind"),
            "eligible": p.get("eligible"),
            "skus": (p.get("skus") or [])[:12],
        }
        for p in (payload.get("products") or [])
    ]
    report_path = REPORTS / "stamp-source-inventory.json"
    report_path.write_text(json.dumps(compact, ensure_ascii=False, indent=2) + "\n", "utf-8")
    summary_path = REPORTS / "stamp-source-summary.json"
    summary = {k: v for k, v in compact.items() if k != "products"}
    summary["sample"] = compact["products"][:12]
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", "utf-8")
    return {
        "inventory": str(full_path.relative_to(ROOT)),
        "report": str(report_path.relative_to(ROOT)),
        "summary": str(summary_path.relative_to(ROOT)),
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0)
    parser.add_argument("--workers", type=int, default=12)
    args = parser.parse_args()
    payload = crawl(limit=args.limit, workers=args.workers)
    paths = write_artifacts(payload)
    brief = {k: payload.get(k) for k in (
        "ok", "stamp_source_total", "stamp_source_variants",
        "stamp_source_categories", "pages_visited", "products_parsed",
        "products_eligible", "products_with_image", "products_with_price",
        "fetch_errors", "duration_s", "error",
    ) if k in payload or payload.get(k) is not None}
    brief["paths"] = paths
    print(json.dumps(brief, ensure_ascii=False, indent=2))
    return 0 if payload.get("ok") else 1


if __name__ == "__main__":
    raise SystemExit(main())
