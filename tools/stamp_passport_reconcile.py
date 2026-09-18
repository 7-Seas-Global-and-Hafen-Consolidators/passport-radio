#!/usr/bin/env python3
"""Reconcile live Stamp inventory with Passport catalog.

Does not invent SKUs. Stamp products enter only with observed photo + public price.
TEN-P1 and historic tennis stay Passport historical genealogies.
"""
from __future__ import annotations

import datetime as dt
import json
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))

from passport_store_pricing import conditions_from_passport_price, from_stamp_public  # noqa: E402
from editorial_blog_store import ARTIST_ALIASES, artist_of, fold, load_json  # noqa: E402

CHUNK_STAMP_LIVE = ROOT / "data" / "store_inventory_09_stamp_live.json"
SOURCE = ROOT / "data" / "stamp-source-inventory.json"
MANIFEST = ROOT / "data" / "store_inventory.json"
REPORTS = ROOT / "reports"

KIND_CATEGORY = {
    "camiseta": "Camiseta",
    "regata": "Camiseta",
    "copo": "Copo",
    "bandeira": "Bandeira",
    "bone": "Boné",
    "vale": "Vale Presente",
    "tenis": "Tênis",
    "acessorio": "Acessório",
}


def lineage_of(product: dict[str, Any]) -> str:
    pid = str(product.get("id") or "")
    if pid.startswith("tenis-p1"):
        return "passport_ten_p1"
    if pid.startswith("shoe-size"):
        return "passport_historical_tenis"
    image = str(product.get("image") or "")
    if "stamp.jetassets" in image or product.get("stamp_url") or product.get("stamp_price"):
        return "stamp"
    return "passport"


def apply_stamp_price(product: dict[str, Any], source: dict[str, Any]) -> dict[str, Any]:
    priced = from_stamp_public(source.get("stamp_price"))
    if not priced:
        return product
    product = dict(product)
    product["stamp_price"] = priced["stamp_price"]
    product["stamp_list_price"] = source.get("stamp_list_price")
    product["stamp_url"] = source.get("url")
    product["price"] = priced["price"]
    product["pix_price"] = priced["pix_price"]
    product["boleto_price"] = priced["boleto_price"]
    product["max_installments"] = priced["max_installments"]
    product["card_installment"] = priced["card_installment"]
    product["pricing_rule"] = priced["pricing_rule"]
    product["lineage"] = "stamp"
    if source.get("image") and not product.get("image"):
        product["image"] = source["image"]
    elif source.get("image") and str(product.get("image") or "").startswith("https://stamp.jetassets"):
        product["image"] = source["image"]
    if source.get("skus") and not product.get("sku"):
        product["sku"] = source["skus"][0]
    return product


def apply_historical_conditions(product: dict[str, Any], lineage: str) -> dict[str, Any]:
    priced = conditions_from_passport_price(product.get("price"))
    product = dict(product)
    product["lineage"] = lineage
    if priced:
        product["pix_price"] = priced["pix_price"]
        product["boleto_price"] = priced["boleto_price"]
        product["max_installments"] = priced["max_installments"]
        product["card_installment"] = priced["card_installment"]
        product["pricing_rule"] = priced["pricing_rule"]
    return product


def stamp_to_passport_product(source: dict[str, Any]) -> dict[str, Any] | None:
    priced = from_stamp_public(source.get("stamp_price"))
    if not priced or not source.get("image"):
        return None
    kind = source.get("kind") or "acessorio"
    name = str(source.get("name") or "")
    row = {
        "id": str(source.get("id")),
        "name": name,
        "image": source.get("image"),
        "sku": (source.get("skus") or [""])[0],
        "slug": source.get("slug") or "",
        "category": KIND_CATEGORY.get(kind, source.get("category") or "Loja"),
        "in_stock": True,
        "lineage": "stamp",
        "stamp_url": source.get("url"),
        "stamp_price": priced["stamp_price"],
        "stamp_list_price": source.get("stamp_list_price"),
        "price": priced["price"],
        "pix_price": priced["pix_price"],
        "boleto_price": priced["boleto_price"],
        "max_installments": priced["max_installments"],
        "card_installment": priced["card_installment"],
        "pricing_rule": priced["pricing_rule"],
        "gender": source.get("gender") or "",
        "imported_from": "stamp.com.br",
        "imported_at": dt.datetime.now(dt.timezone.utc).date().isoformat(),
    }
    artist = artist_of(row)
    if artist:
        row["artist"] = artist
    else:
        # last-resort: tokens after product type that match known aliases
        hay = fold(name)
        for key, label in ARTIST_ALIASES.items():
            if key in hay:
                row["artist"] = label
                break
    return row


def reconcile() -> dict[str, Any]:
    source_payload = load_json(SOURCE, {})
    products = source_payload.get("products") or []
    by_id = {str(p.get("id")): p for p in products if p.get("id")}
    manifest = load_json(MANIFEST, {})
    chunks = list(manifest.get("chunks") or [])
    preexisting = 0
    updated_existing = 0
    newly = []
    ten_p1 = 0
    historic = 0
    stamp_already = 0
    seen_ids: set[str] = set()

    for rel in chunks:
        path = ROOT / str(rel).lstrip("/")
        if not path.exists() or path.name.endswith("09_stamp_live.json"):
            continue
        payload = load_json(path, {"products": []})
        rows = []
        for item in payload.get("products") or []:
            pid = str(item.get("id") or "")
            if not pid or pid in seen_ids:
                continue
            seen_ids.add(pid)
            preexisting += 1
            lin = lineage_of(item)
            if lin == "passport_ten_p1":
                ten_p1 += 1
                rows.append(apply_historical_conditions(item, lin))
                continue
            if lin == "passport_historical_tenis":
                historic += 1
                rows.append(apply_historical_conditions(item, lin))
                continue
            live = by_id.get(pid)
            if live and live.get("eligible"):
                stamp_already += 1
                rows.append(apply_stamp_price(item, live))
                updated_existing += 1
            else:
                # keep Passport row; apply payment conditions on current price
                item = dict(item)
                item["lineage"] = "stamp_preexisting" if str(item.get("image") or "").startswith("https://stamp.") else "passport"
                cond = conditions_from_passport_price(item.get("price"))
                if cond:
                    item.update({k: cond[k] for k in ("pix_price", "boleto_price", "max_installments", "card_installment", "pricing_rule")})
                rows.append(item)
        payload["products"] = rows
        path.write_text(json.dumps(payload, ensure_ascii=False) + "\n", "utf-8")

    for live in products:
        pid = str(live.get("id") or "")
        if not pid or pid in seen_ids:
            continue
        if not live.get("eligible"):
            continue
        row = stamp_to_passport_product(live)
        if not row:
            continue
        newly.append(row)
        seen_ids.add(pid)

    CHUNK_STAMP_LIVE.write_text(
        json.dumps({"chunk_id": "stamp-live-2026-09-18", "products": newly}, ensure_ascii=False) + "\n",
        "utf-8",
    )
    live_rel = "/data/store_inventory_09_stamp_live.json"
    if live_rel not in chunks:
        chunks.append(live_rel)
    manifest["chunks"] = chunks
    manifest["product_count"] = preexisting + len(newly)
    manifest["pricing_rule"] = "stamp_public_x_0.80_pix_5_card_6x"
    manifest["stamp_source_crawled_at"] = source_payload.get("crawled_at")
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", "utf-8")

    report = {
        "reconciled_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "stamp_source_total": source_payload.get("stamp_source_total"),
        "stamp_source_parsed": len(products),
        "stamp_source_eligible": sum(1 for p in products if p.get("eligible")),
        "stamp_source_variants": source_payload.get("stamp_source_variants"),
        "stamp_source_categories": source_payload.get("stamp_source_categories"),
        "passport_preexisting_total": preexisting,
        "stamp_already_present_in_passport": stamp_already,
        "stamp_newly_imported": len(newly),
        "passport_ten_p1": ten_p1,
        "passport_historical_tenis": historic,
        "passport_historical_only": ten_p1 + historic,
        "passport_final_total": preexisting + len(newly),
        "example_100": from_stamp_public(100),
        "note": (
            "TEN-P1 (48) remain Passport historical without image and are not Stamp pending. "
            "43 recovered tennis keep local images. New Stamp SKUs entered only with observed photo+price."
        ),
    }
    REPORTS.mkdir(parents=True, exist_ok=True)
    (REPORTS / "stamp-passport-reconciliation.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2) + "\n", "utf-8"
    )
    return report


if __name__ == "__main__":
    print(json.dumps(reconcile(), ensure_ascii=False, indent=2))
