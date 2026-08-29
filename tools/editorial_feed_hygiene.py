#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any

ALLOWED_CATEGORIES = {
    "brasil", "brazilian_rock", "rock", "classic_rock", "hard_rock",
    "hard_rock_metal", "metal", "punk_hardcore", "progressive_rock",
    "alternative_rock", "alternative_gothic", "pop_poprock",
    "country_americana", "instruments", "middle_east", "levant",
    "palestine", "lebanon", "jordan", "iran", "iraq", "east_africa",
    "horn_of_africa", "sudan", "south_sudan", "uganda", "ethiopia",
    "eritrea", "somalia", "african_music", "diaspora"
}

TITLE_FIXES = {
    "Quando Dolly Parton Finalmente Aceitou Ser Rock and Roll":
        "Quando Dolly Parton finalmente aceitou ser rock and roll",
    "A Genialidade Que O Country Fingiu Não Ver":
        "A genialidade que o country fingiu não ver",
}

TEXT_REPLACEMENTS = (
    ("Novo álbum de instrumental rock", "Novo álbum de rock instrumental"),
    ("rockstar", "estrela do rock"),
    ("Rockstar", "Estrela do rock"),
)

CATEGORY_RULES: list[tuple[str, tuple[str, ...]]] = [
    ("country_americana", (
        "dolly parton", "jolene", "country", "americana", "nashville",
        "willie nelson", "johnny cash", "patsy cline", "emmylou harris",
    )),
    ("punk_hardcore", (
        "punk", "hardcore", "ratos de porão", "cólera", "ramones",
        "dead kennedys", "bad brains", "black flag", "sex pistols",
    )),
    ("progressive_rock", (
        "progressive rock", "rock progressivo", "marillion", "king crimson",
        "yes", "rush", "genesis", "gentle giant", "camel", "elp",
    )),
    ("alternative_gothic", (
        "gothic", "gótico", "gótica", "the mission", "sisters of mercy",
        "bauhaus", "siouxsie", "fields of the nephilim",
    )),
    ("hard_rock", (
        "kiss", "thin lizzy", "humble pie", "ac/dc", "aerosmith",
        "van halen", "guns n’ roses", "guns n' roses", "whitesnake",
        "deep purple", "motörhead", "motorhead",
    )),
    ("metal", (
        "heavy metal", "thrash metal", "metallica", "megadeth", "slayer",
        "iron maiden", "judas priest", "sepultura", "angra", "nightwish",
        "black sabbath", "pantera", "anthrax",
    )),
    ("alternative_rock", (
        "soundgarden", "pearl jam", "alice in chains", "nirvana",
        "temple of the dog", "faith no more", "living colour", "grunge",
    )),
    ("brazilian_rock", (
        "rock brasileiro", "made in brazil", "joelho de porco", "golpe de estado",
        "kid abelha", "titãs", "legião urbana", "barão vermelho", "capital inicial",
    )),
]

GENERIC_ENTITIES = {
    "passport radio", "mr. nomad", "rock and roll hall of fame", "rockstar"
}


def clean_text(value: Any) -> str:
    text = str(value or "")
    text = text.replace("\u00a0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\s+([,.;:!?])", r"\1", text)
    return text.strip()


def clean_url(value: Any) -> str:
    return re.sub(r"\s+", "", str(value or "")).strip()


def normalize_ptbr(text: str) -> str:
    out = clean_text(text)
    for old, new in TEXT_REPLACEMENTS:
        out = out.replace(old, new)
    return out


def category_for(item: dict[str, Any]) -> str:
    current = clean_text(item.get("category")).lower()
    title = clean_text(item.get("title"))
    deck = clean_text(item.get("deck"))
    entities = " ".join(clean_text(x) for x in (item.get("entities") or []))
    haystack = f"{title} {deck} {entities}".casefold()

    brazil_tokens = (
        "gilberto gil", "secos & molhados", "secos e molhados", "ratos de porão",
        "cólera", "angra", "made in brazil", "joelho de porco", "golpe de estado",
        "kid abelha", "léo jaime", "leo jaime", "rock brasileiro"
    )
    if any(token.casefold() in haystack for token in brazil_tokens):
        if any(token in haystack for token in ("rock", "punk", "metal", "guitarra", "banda")):
            return "brazilian_rock"
        return "brasil"

    for category, tokens in CATEGORY_RULES:
        if any(token.casefold() in haystack for token in tokens):
            return category

    if current == "instruments":
        focus = ("guitarra", "baixo", "bateria", "amplificador", "pedal", "captador", "instrumento", "riff", "timbre")
        if any(token in haystack for token in focus):
            return current

    return current if current in ALLOWED_CATEGORIES else "rock"


def item_day(item: dict[str, Any]) -> str:
    raw = clean_text(item.get("published_at"))
    return raw[:10] if re.fullmatch(r"\d{4}-\d{2}-\d{2}.*", raw) else "unknown"


def dominant_entity(item: dict[str, Any]) -> str:
    for entity in item.get("entities") or []:
        value = clean_text(entity)
        if value and value.casefold() not in GENERIC_ENTITIES:
            return value.casefold()
    title = clean_text(item.get("title"))
    return title.casefold()[:80]


def hygienize(payload: dict[str, Any], max_items: int, max_entity_per_day: int) -> tuple[dict[str, Any], dict[str, int]]:
    raw_items = payload.get("items") if isinstance(payload, dict) else []
    items = raw_items if isinstance(raw_items, list) else []
    seen_urls: set[str] = set()
    entity_daily: Counter[tuple[str, str]] = Counter()
    cleaned: list[dict[str, Any]] = []
    stats = Counter()

    for raw in items:
        if not isinstance(raw, dict):
            stats["malformed_removed"] += 1
            continue
        item = dict(raw)
        url = clean_url(item.get("url"))
        title = clean_text(item.get("title"))
        if not url or not title:
            stats["malformed_removed"] += 1
            continue
        if url in seen_urls:
            stats["duplicate_urls_removed"] += 1
            continue
        seen_urls.add(url)

        fixed_title = TITLE_FIXES.get(title, normalize_ptbr(title))
        fixed_deck = normalize_ptbr(item.get("deck", ""))
        if fixed_title != title or fixed_deck != clean_text(item.get("deck", "")):
            stats["ptbr_touched"] += 1
        item["title"] = fixed_title
        item["deck"] = fixed_deck
        item["url"] = url

        old_category = clean_text(item.get("category")).lower()
        new_category = category_for(item)
        item["category"] = new_category
        if new_category != old_category:
            stats["categories_corrected"] += 1

        key = (item_day(item), dominant_entity(item))
        entity_daily[key] += 1
        if entity_daily[key] > max_entity_per_day:
            stats["topic_overflow_removed"] += 1
            continue

        cleaned.append(item)
        if len(cleaned) >= max_items:
            stats["capacity_trimmed"] += max(0, len(items) - len(cleaned))
            break

    next_payload = dict(payload or {})
    next_payload["version"] = max(2, int(next_payload.get("version", 2) or 2))
    next_payload["updated_at"] = dt.datetime.now(dt.timezone(dt.timedelta(hours=-3))).isoformat()
    next_payload["items"] = cleaned
    stats["before"] = len(items)
    stats["after"] = len(cleaned)
    return next_payload, dict(stats)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--feed", default="data/editorial-feed.json")
    ap.add_argument("--max-items", type=int, default=300)
    ap.add_argument("--max-entity-per-day", type=int, default=4)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    path = Path(args.feed)
    payload = json.loads(path.read_text("utf-8"))
    next_payload, stats = hygienize(payload, max(20, args.max_items), max(1, args.max_entity_per_day))
    print(json.dumps(stats, ensure_ascii=False, sort_keys=True))
    if args.apply and next_payload != payload:
        path.write_text(json.dumps(next_payload, ensure_ascii=False, indent=2) + "\n", "utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
