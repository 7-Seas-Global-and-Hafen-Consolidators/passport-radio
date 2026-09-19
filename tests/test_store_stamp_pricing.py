#!/usr/bin/env python3
"""Stamp live pricing, TEN-P1 genealogy, historic tennis, circulation."""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))

from passport_store_pricing import CARD_INSTALLMENTS, example_100, from_stamp_public
import editorial_blog_store as store
from passport_circulation import TELEGRAM_OFFICIAL, WHATSAPP_OFFICIAL, share_html, follow_html


def fail(msg: str) -> None:
    raise SystemExit("FAIL: " + msg)


def test_example_100() -> None:
    row = example_100()
    if row["price"] != 80.0 or row["pix_price"] != 76.0 or row["boleto_price"] != 80.0:
        fail(f"R$100 rule broken: {row}")
    if row["max_installments"] != 6:
        fail("card is not 6x")
    print("OK Stamp 100 → Passport 80 / Pix 76 / boleto 80 / 6x")


def test_cents_rounding() -> None:
    row = from_stamp_public("88.80")
    if not row or abs(row["price"] - 71.04) > 0.001:
        fail(f"88.80 * 0.80 should be 71.04, got {row}")
    if abs(row["pix_price"] - 67.49) > 0.001:
        fail(f"pix of 71.04 should be 67.49, got {row}")
    print("OK cent rounding")


def test_ten_p1_not_stamp_pending() -> None:
    rows = store.catalog(refresh=True)
    p1 = [x for x in rows if str(x["id"]).startswith("tenis-p1")]
    if len(p1) != 48:
        fail(f"TEN-P1 count {len(p1)}")
    if any(x.get("publishable") for x in p1):
        fail("TEN-P1 leaked into vitrine")
    if any(x.get("lineage") != "passport_ten_p1" for x in p1):
        fail("TEN-P1 lineage drifted")
    if any(x.get("stamp_url") for x in p1):
        fail("TEN-P1 tagged as Stamp")
    print("OK 48 TEN-P1 remain Passport historical unpublished")


def test_historic_tennis_local() -> None:
    rows = store.catalog()
    hist = [x for x in rows if str(x["id"]).startswith("shoe-size")]
    if len(hist) != 43:
        fail(f"historic tennis {len(hist)}")
    if any(not str(x.get("image") or "").startswith("/images/") for x in hist):
        fail("historic tennis lost local image")
    if any(x.get("lineage") != "passport_historical_tenis" for x in hist):
        fail("historic tennis lineage drifted")
    if not all(x.get("publishable") for x in hist):
        fail("historic tennis dropped from vitrine")
    print("OK 43 recovered tennis keep local images")


def test_stamp_live_source() -> None:
    src = json.loads((ROOT / "data" / "stamp-source-inventory.json").read_text("utf-8"))
    if int(src.get("stamp_source_total") or 0) < 500:
        fail(f"stamp source too small {src.get('stamp_source_total')}")
    eligible = [p for p in src.get("products") or [] if p.get("eligible")]
    if len(eligible) < 200:
        fail("too few eligible Stamp products")
    sample = next(p for p in eligible if p.get("kind") == "camiseta" and p.get("stamp_price"))
    priced = from_stamp_public(sample["stamp_price"])
    page = ROOT / "loja" / "p" / f"{sample['id']}.html"
    if not page.exists():
        fail(f"missing Passport product page for live Stamp {sample['id']}")
    html = page.read_text("utf-8")
    if "pp-pix" not in html and "Pix" not in html:
        fail("product page missing Pix")
    if "6x" not in html and "até 6" not in html:
        fail("product page missing 6x")
    rec = json.loads((ROOT / "reports" / "stamp-passport-reconciliation.json").read_text("utf-8"))
    if rec.get("passport_ten_p1") != 48:
        fail(f"reconciliation TEN-P1 {rec.get('passport_ten_p1')}")
    if rec.get("passport_historical_tenis") != 43:
        fail(f"reconciliation historic {rec.get('passport_historical_tenis')}")
    print("OK live Stamp source + Passport page + reconciliation counts",
          src.get("stamp_source_total"), "eligible", len(eligible), "new", rec.get("stamp_newly_imported"))


def test_entity_bridge() -> None:
    hits = store.products_for_entities(["Metallica"], limit=8)
    if not hits:
        fail("Metallica store bridge empty")
    print("OK entity bridge Metallica", len(hits))


def test_circulation() -> None:
    html = share_html("https://passportradio.online/blog/x.html", "Título") + follow_html()
    if "wa.me/?text=" not in html or "t.me/share/url" not in html:
        fail("share missing WhatsApp/Telegram")
    if TELEGRAM_OFFICIAL not in html:
        fail("official Telegram missing")
    if WHATSAPP_OFFICIAL not in html:
        fail("official WhatsApp missing")
    if WHATSAPP_OFFICIAL != "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k":
        fail("official WhatsApp must point to Passport Channel, not Business chat")
    if "data-copy-link" not in html:
        fail("copy link missing")
    mill = (ROOT / "tools" / "editorial_engine.py").read_text("utf-8")
    if "Every Song Is A Destination" in mill:
        fail("slogan still in editorial_engine.py")
    if "pe-nomad-signature" in mill:
        fail("automatic Nomad signature still in mill template")
    print("OK circulation + mill slogan dead")


def main() -> int:
    test_example_100()
    test_cents_rounding()
    test_ten_p1_not_stamp_pending()
    test_historic_tennis_local()
    test_stamp_live_source()
    test_entity_bridge()
    test_circulation()
    print("store_stamp_pricing: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
