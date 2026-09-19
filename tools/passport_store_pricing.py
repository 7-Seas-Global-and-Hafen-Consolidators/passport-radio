#!/usr/bin/env python3
"""Central Passport Store pricing.

Stamp public price is the observed base.
Passport price = Stamp × 0.80 (20% below the public Stamp price).
Pix = 5% off the Passport price.
Boleto = Passport price at sight.
Card = up to 6 installments on the Passport price.

Money is Decimal, rounded to centavos with ROUND_HALF_UP.
Never invent a Stamp price: if the observed public price is missing, do not
compute a Passport price from thin air.
"""
from __future__ import annotations

from decimal import Decimal, ROUND_HALF_UP, InvalidOperation
from typing import Any

CENT = Decimal("0.01")
STAMP_TO_PASSPORT = Decimal("0.80")
PIX_FACTOR = Decimal("0.95")
CARD_INSTALLMENTS = 6


def money(value: Any) -> Decimal | None:
    if value is None or value == "":
        return None
    if isinstance(value, Decimal):
        raw = value
    else:
        text = str(value).strip()
        if not text:
            return None
        text = text.replace("R$", "").replace(" ", "")
        if "," in text and "." in text:
            text = text.replace(".", "").replace(",", ".")
        elif "," in text:
            text = text.replace(",", ".")
        try:
            raw = Decimal(text)
        except (InvalidOperation, ValueError):
            return None
    if raw < 0:
        return None
    return raw.quantize(CENT, rounding=ROUND_HALF_UP)


def as_float(value: Decimal | None) -> float | None:
    if value is None:
        return None
    return float(value)


def from_stamp_public(stamp_public: Any) -> dict[str, Any] | None:
    base = money(stamp_public)
    if base is None or base == 0:
        return None
    passport = money(base * STAMP_TO_PASSPORT)
    if passport is None:
        return None
    pix = money(passport * PIX_FACTOR)
    installment = money(passport / CARD_INSTALLMENTS)
    return {
        "stamp_price": as_float(base),
        "price": as_float(passport),
        "pix_price": as_float(pix),
        "boleto_price": as_float(passport),
        "max_installments": CARD_INSTALLMENTS,
        "card_installment": as_float(installment),
        "pricing_rule": "stamp_public_x_0.80",
    }


def conditions_from_passport_price(passport_price: Any) -> dict[str, Any] | None:
    """Apply Pix/boleto/card to an already-Passport historical price (no Stamp)."""
    passport = money(passport_price)
    if passport is None or passport == 0:
        return None
    pix = money(passport * PIX_FACTOR)
    installment = money(passport / CARD_INSTALLMENTS)
    return {
        "price": as_float(passport),
        "pix_price": as_float(pix),
        "boleto_price": as_float(passport),
        "max_installments": CARD_INSTALLMENTS,
        "card_installment": as_float(installment),
        "pricing_rule": "passport_historical_conditions",
    }


def example_100() -> dict[str, Any]:
    row = from_stamp_public(Decimal("100.00"))
    assert row is not None
    assert row["price"] == 80.0
    assert row["pix_price"] == 76.0
    assert row["boleto_price"] == 80.0
    assert row["max_installments"] == 6
    return row
