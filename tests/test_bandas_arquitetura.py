#!/usr/bin/env python3
"""Bandas & Artistas: índice denso, nome sem invenção, hub sem biografia."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def fail(msg: str) -> None:
    raise SystemExit("FAIL: " + msg)


def main() -> None:
    data = json.loads((ROOT / "data/bandas-artistas.json").read_text(encoding="utf-8"))
    rows = {row["slug"]: row for row in data["entities"]}
    excluded = {row["slug"] for row in data["excluded"]}
    if "a-cena" not in excluded or "a-cena" in rows:
        fail("A cena ainda entra como banda")
    if "agenda" not in excluded or "albunsquemarcaram" not in excluded:
        fail("lixo de extração ainda indexado")
    for slug, forbidden in (
        ("10000maniacs", "10,000 Maniacs"),
        ("acefrehley", "Ace Frehley"),
    ):
        row = rows.get(slug)
        if not row:
            fail("faltou " + slug)
        if row["displayName"] == forbidden:
            fail("nome inventado: " + forbidden)
        if row["reviewState"] != "needs_review":
            fail(slug + " deveria ficar em revisão")
    metal = rows["metallica"]
    if metal["displayName"] != "Metallica" or metal["articleCount"] < 100:
        fail("metallica " + str(metal))
    if rows["angra"]["articleCount"] < 100:
        fail("angra curta")
    if rows["abba"]["articleCount"] < 1:
        fail("abba")
    page = (ROOT / "blog/arquivo/letras.html").read_text(encoding="utf-8")
    for needle in ("Bandas & Artistas", "az-letters", "passport-bandas.js", "passport-musical-door.js"):
        if needle not in page:
            fail("índice sem " + needle)
    hub = (ROOT / "blog/e/10000maniacs.html").read_text(encoding="utf-8")
    if "10,000 Maniacs" in hub or "Você tocou" in hub:
        fail("hub inventou nome ou biografia")
    if "1 matéria na Passport Radio" not in hub:
        fail("hub sem contagem")
    if "/blog/w/007745-10000maniacs.html" not in hub:
        fail("hub sem a matéria real")
    angra = (ROOT / "blog/e/angra.html").read_text(encoding="utf-8")
    if angra.count("/blog/w/") < 100:
        fail("hub de angra não lista o acervo")
    shard = (ROOT / "blog/e/angra-p2.html").read_text(encoding="utf-8")
    if "Angra P2" in shard or "Você tocou" in shard:
        fail("fatia antiga virou banda")
    if 'href="/blog/e/angra.html"' not in shard:
        fail("fatia antiga sem o hub")
    busca = (ROOT / "blog/busca.html").read_text(encoding="utf-8")
    if "data-search-root" not in busca or "Artista, matéria" not in busca:
        fail("busca sem tipos")
    door = (ROOT / "js/passport-blog-search.js").read_text(encoding="utf-8")
    if "bandas-artistas.json" not in door or "store-search/index.json" not in door:
        fail("busca não separa artista e produto")
    if "background:#eee" in page.lower() or "background: #eee" in page.lower():
        fail("superfície cinza")
    print("OK bandas index + hubs")


if __name__ == "__main__":
    main()
