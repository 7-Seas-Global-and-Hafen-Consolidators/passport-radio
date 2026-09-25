#!/usr/bin/env python3
"""Rebuild the public Bandas & Artistas index and entity hubs.

Reads the letter pages that already exist, applies the display-name rules
already in this repository, and writes a dense index plus honest hubs.
Does not delete blog/e or blog/w. Does not invent a spaced name the corpus
and the alias table do not already support. Does not touch prices or radios.
"""
from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
import sys
sys.path.insert(0, str(ROOT / "tools"))

import editorial_blog_store as store
import whiplash_materialize as mill

LETTERS = ROOT / "blog" / "arquivo"
HUBS = ROOT / "blog" / "e"
OUT_JSON = ROOT / "data" / "bandas-artistas.json"
LINK_RE = re.compile(r'<a href="(/blog/e/([^"]+)\.html)">([^<]*?)<small>(\d+)</small>')
CARD_RE = re.compile(r'<a class="blog-card[^"]*" href="([^"]+)">.*?<h2>(.*?)</h2>', re.S)
HUB_MARK = "neste acervo."

# Extração que o próprio mill tratou como entidade. A página permanece.
EXCLUDED = {
    "a-cena", "agenda", "albunsquemarcaram", "cds", "melhores", "voce", "você",
    "formatos", "epocas", "paises", "autores", "temas", "hoje",
}

SHELL_HEAD = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500;6..72,650;6..72,700&family=Source+Sans+3:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/passport-generation.css?v=20260925az">
<link rel="stylesheet" href="/css/passport-archive-ia.css?v=20260925az">
</head>
<body class="az-body" {body_attr}>
<header class="pp-topbar"><div class="pp-topbar-in">
<a class="pp-brand" href="/"><img src="/images/passport-radio-definitive.jpg" alt="Passport Radio" width="48" height="48"><span class="pp-brand-txt"><b>Passport Radio</b></span></a>
<form class="pg-nav-search" action="/blog/busca.html" method="get" role="search">
<label class="pg-sr" for="top-q">Buscar</label>
<input id="top-q" type="search" name="q" placeholder="Buscar histórias, bandas, artistas">
<button type="submit">Buscar</button>
</form>
<a class="pg-header-listen" href="/radio.html">Ouvir</a>
</div></header>
<nav class="pp-nav" aria-label="Seções"><div class="pp-nav-in">
<a href="/radio.html">Ouvir</a>
<a href="/noticias.html">Notícias</a>
<a href="/blog.html">Histórias</a>
<a href="/editorial.html">Arquivo</a>
<a href="/blog/arquivo/letras.html" aria-current="page">Bandas & Artistas</a>
<a href="/participe.html">Participe</a>
<a href="/loja.html">Loja</a>
<a href="/anuncie.html">Anuncie</a>
</div></nav>
"""

SHELL_FOOT = """
<footer class="pp-footer"><div class="pp-footer-bottom">© 2026 Passport Radio · <a href="/privacidade.html">Privacidade</a> · <a href="/contato.html">Contato</a> · <a href="/participe.html">Participe</a></div></footer>
<script src="/js/passport-musical-door.js?v=20260925az" defer></script>
{extra_script}
</body>
</html>
"""


def fold_key(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").lower())


def classify_name(label: str, slug: str) -> dict:
    raw = " ".join((label or "").split())
    key = fold_key(raw) or fold_key(slug)
    excluded = slug in EXCLUDED or key in EXCLUDED or raw.lower() in {"a cena", "agenda", "cds", "melhores", "você", "voce"}
    known = {fold_key(alias) for alias in mill.ALIASES}
    if key in mill.ALIASES:
        display = mill.ALIASES[key]
        evidence = "alias"
        review = "published"
    else:
        pretty = mill.pretty_artist(raw) if raw else raw
        if pretty and pretty != raw:
            display = pretty
            evidence = "token-split"
            review = "published"
        elif " " in raw or "/" in raw or "&" in raw:
            display = raw
            evidence = "index-label"
            review = "published"
        else:
            display = raw or slug
            evidence = "unspaced-slug"
            review = "published" if key in known else "needs_review"
    letter = "#"
    for ch in display:
        if ch.isalpha():
            letter = ch.upper()
            break
        if ch.isdigit():
            letter = "#"
            break
    return {
        "slug": slug,
        "displayName": display,
        "canonicalName": raw or slug,
        "type": "excluded" if excluded else "artist",
        "evidence": "extraction-junk" if excluded else evidence,
        "reviewState": "excluded" if excluded else review,
        "letter": letter,
    }


def read_letters() -> list[dict]:
    found: dict[str, dict] = {}
    for path in sorted(LETTERS.glob("letra-*.html")):
        text = path.read_text(encoding="utf-8", errors="replace")
        for href, slug, label, count in LINK_RE.findall(text):
            if slug in found:
                found[slug]["articleCount"] = max(found[slug]["articleCount"], int(count))
                continue
            row = classify_name(html.unescape(label), slug)
            row["articleCount"] = int(count)
            row["href"] = href
            found[slug] = row
    rows = list(found.values())
    rows.sort(key=lambda row: (row["displayName"].casefold(), row["slug"]))
    return rows


def index_page(letter: str | None) -> str:
    title = "Bandas & Artistas | Passport Radio" if not letter else f"Letra {letter} | Passport Radio"
    attr = "" if not letter else f'data-letra="{letter}"'
    body = SHELL_HEAD.format(
        title=title,
        desc="Índice de bandas e artistas da Passport Radio, com a contagem real de matérias.",
        canonical="https://passportradio.online/blog/arquivo/letras.html" if not letter else f"https://passportradio.online/blog/arquivo/letra-{letter.lower()}.html",
        body_attr=attr,
    )
    body += """
<main class="az-shell">
<nav class="az-crumbs" aria-label="Trilha"><a href="/">Home</a> · <a href="/editorial.html">Arquivo</a> · Bandas & Artistas</nav>
<div class="az-layout">
<aside class="az-side" aria-label="Circulação">
<h2>Acervo</h2>
<a href="/blog/arquivo/">Arquivo</a>
<a href="/blog/arquivo/autores.html">Autores</a>
<a href="/blog/arquivo/formatos.html">Formatos</a>
<a href="/blog/arquivo/epocas.html">Épocas</a>
<a href="/blog/arquivo/temas.html">Temas</a>
<a href="/noticias.html">Notícias</a>
<a href="/participe.html">Participe</a>
<a href="/divulgar-bandas.html">Divulgue uma banda</a>
<div id="az-top"></div>
</aside>
<div>
<span class="az-kicker">Acervo</span>
<h1>Bandas & Artistas</h1>
<p class="az-lead">O índice do que a Passport já publicou. Cada linha é um nome e o número de matérias desse nome. Sem biografia inventada.</p>
<form id="az-form" class="az-search" role="search">
<label class="pg-sr" for="az-q">Buscar banda ou artista</label>
<input id="az-q" type="search" placeholder="Buscar banda ou artista" autocomplete="off">
<button type="submit">Buscar</button>
</form>
<nav id="az-letters" class="az-letters" aria-label="Letras"></nav>
<div id="az-app"></div>
</div>
<aside class="az-context" aria-label="Participação">
<h2>Sua história</h2>
<p>Quem estava lá pode completar o arquivo. O envio não publica sozinho.</p>
<a href="/blog/envie-sua-historia.html">Conte uma história</a>
<a href="/participe.html">Corrija um nome</a>
<a href="/contato.html">Fale com a redação</a>
<a href="/loja.html">Loja</a>
</aside>
</div>
</main>
"""
    body += SHELL_FOOT.format(extra_script='<script src="/js/passport-bandas.js?v=20260925az" defer></script>')
    return body


def hub_page(row: dict, articles: list[tuple[str, str]], products: list[dict]) -> str:
    name = row["displayName"]
    n = len(articles) if articles else int(row.get("articleCount") or 0)
    if n == 1:
        count_line = "1 matéria na Passport Radio."
    else:
        count_line = f"{n} matérias na Passport Radio."
    if row["type"] == "excluded":
        lead = "Este nome não entra no índice de bandas. As matérias ligadas a ele continuam no arquivo."
    elif row["reviewState"] == "needs_review":
        lead = count_line + " O cadastro ainda não separa este nome. Não inventamos a forma que o arquivo não traz."
    else:
        lead = count_line
    items = "\n".join(
        f'<li><a href="{html.escape(href, quote=True)}">{html.escape(title)}</a></li>'
        for href, title in articles
    ) or "<li>Nenhuma matéria listada neste hub.</li>"
    product_html = ""
    if products and row["type"] != "excluded":
        links = "\n".join(
            f'<li><a href="{html.escape(item.get("url") or "", quote=True)}">{html.escape(item.get("name") or "Produto")}</a></li>'
            for item in products
            if item.get("url")
        )
        if links:
            product_html = f'<h2>Na loja</h2><ul class="hub-list hub-products">{links}</ul>'
    slug = row["slug"]
    page = SHELL_HEAD.format(
        title=f"{name} | Passport Radio",
        desc=f"{name}. {count_line}",
        canonical=f"https://passportradio.online/blog/e/{slug}.html",
        body_attr="",
    )
    page += f"""
<main class="az-shell">
<nav class="az-crumbs" aria-label="Trilha"><a href="/">Home</a> · <a href="/blog/arquivo/letras.html">Bandas & Artistas</a> · {html.escape(name)}</nav>
<div class="az-layout">
<aside class="az-side" aria-label="Circulação">
<h2>Acervo</h2>
<a href="/blog/arquivo/letras.html">Bandas & Artistas</a>
<a href="/blog/arquivo/">Arquivo</a>
<a href="/blog/busca.html?q={html.escape(name, quote=True)}">Buscar este nome</a>
<a href="/noticias.html">Notícias</a>
<a href="/participe.html">Participe</a>
</aside>
<div>
<span class="az-kicker">{"Revisão" if row["type"] == "excluded" else "Banda e artista"}</span>
<h1 class="hub-name">{html.escape(name)}</h1>
<p class="az-lead">{html.escape(lead)}</p>
<ul class="hub-list">{items}</ul>
{product_html}
</div>
<aside class="az-context" aria-label="Participação">
<h2>Complete o arquivo</h2>
<p class="hub-note">Se falta uma história, uma correção ou uma foto, o envio fica com a redação. Não publica direto.</p>
<a href="/blog/envie-sua-historia.html?entity={html.escape(slug, quote=True)}">Conte uma história</a>
<a href="/participe.html">Corrija</a>
<a href="mailto:passportradio.online@gmail.com?subject=Corre%C3%A7%C3%A3o%20de%20nome">E-mail da redação. Abre o seu e-mail.</a>
</aside>
</div>
</main>
"""
    page += SHELL_FOOT.format(extra_script="")
    return page


def catalog_groups() -> dict[str, list[tuple[str, str]]]:
    grouped: dict[str, list[tuple[str, str]]] = {}
    with (ROOT / "data" / "blog-catalog.jsonl").open(encoding="utf-8") as handle:
        for line in handle:
            if not line.strip():
                continue
            row = json.loads(line)
            url = row.get("url") or ""
            title = " ".join(str(row.get("title") or "").split())
            if not url or not title:
                continue
            for name in row.get("entities") or []:
                name = " ".join(str(name).split())
                if not name:
                    continue
                grouped.setdefault(name, [])
                if all(url != item[0] for item in grouped[name]):
                    grouped[name].append((url, title))
    return grouped


def slug_lookup(rows: list[dict]) -> dict[str, str]:
    found: dict[str, str] = {}
    for row in rows:
        found[fold_key(row["slug"])] = row["slug"]
        found[fold_key(row.get("displayName") or "")] = row["slug"]
        found[fold_key(row.get("canonicalName") or "")] = row["slug"]
    for path in HUBS.glob("*.html"):
        found.setdefault(fold_key(path.stem), path.stem)
    return found


def attach_catalog(rows: list[dict]) -> list[dict]:
    groups = catalog_groups()
    lookup = slug_lookup(rows)
    by_slug = {row["slug"]: row for row in rows}
    for name, articles in groups.items():
        slug = lookup.get(fold_key(name))
        if not slug:
            import editorial_blog_catalog as catalog
            slug = catalog.slugify(name)
        label = name
        fresh = classify_name(label, slug)
        fresh["href"] = f"/blog/e/{slug}.html"
        fresh["articleCount"] = len(articles)
        fresh["articles"] = articles
        by_slug[slug] = fresh
    for row in by_slug.values():
        row.setdefault("articles", [])
        if not row["articles"]:
            row["articleCount"] = int(row.get("articleCount") or 0)
    return list(by_slug.values())


def product_index() -> dict[str, list[dict]]:
    grouped: dict[str, list[dict]] = {}
    try:
        items = [item for item in store.catalog() if item.get("publishable")]
    except Exception:
        return grouped
    for item in items:
        key = store.fold(item.get("artist") or "")
        if not key:
            continue
        grouped.setdefault(key, [])
        if len(grouped[key]) < 4:
            grouped[key].append(item)
    return grouped


PAGE_RE = re.compile(r"^(.+)-p(\d+)$")


def pointer_page(slug: str, parent_slug: str | None, parent_name: str | None) -> str:
    if parent_slug and parent_name:
        title = parent_name
        lead = (
            "Esta URL era uma fatia antiga do índice. Não é outra banda. "
            f"As matérias de {parent_name} estão no hub."
        )
        href = f"/blog/e/{parent_slug}.html"
        link = f'<p><a href="{html.escape(href, quote=True)}">Abrir {html.escape(parent_name)}</a></p>'
        canonical = f"https://passportradio.online/blog/e/{parent_slug}.html"
    else:
        title = "Índice antigo"
        lead = "Esta URL era uma fatia antiga do índice. Não é uma banda. O índice atual está em Bandas & Artistas."
        link = '<p><a href="/blog/arquivo/letras.html">Abrir Bandas & Artistas</a></p>'
        canonical = "https://passportradio.online/blog/arquivo/letras.html"
    page = SHELL_HEAD.format(
        title=f"{title} | Passport Radio",
        desc=lead,
        canonical=canonical,
        body_attr="",
    )
    page += f"""
<main class="az-shell">
<nav class="az-crumbs" aria-label="Trilha"><a href="/">Home</a> · <a href="/blog/arquivo/letras.html">Bandas & Artistas</a></nav>
<div class="az-layout">
<aside class="az-side" aria-label="Circulação">
<h2>Acervo</h2>
<a href="/blog/arquivo/letras.html">Bandas & Artistas</a>
<a href="/blog/arquivo/">Arquivo</a>
<a href="/noticias.html">Notícias</a>
</aside>
<div>
<span class="az-kicker">Arquivo</span>
<h1 class="hub-name">{html.escape(title)}</h1>
<p class="az-lead">{html.escape(lead)}</p>
{link}
</div>
<aside class="az-context" aria-label="Participação">
<h2>Complete o arquivo</h2>
<a href="/participe.html">Corrija um nome</a>
<a href="/blog/envie-sua-historia.html">Conte uma história</a>
</aside>
</div>
</main>
"""
    page += SHELL_FOOT.format(extra_script="")
    return page


def repair_pagination_pages() -> int:
    """Old /blog/e/nome-p2.html slices are not bands. Point them at the hub."""
    by_slug = {}
    if OUT_JSON.exists():
        saved = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        for row in saved.get("entities", []) + saved.get("excluded", []):
            by_slug[row["slug"]] = row.get("displayName") or row["slug"]
    fixed = 0
    for path in HUBS.glob("*.html"):
        match = PAGE_RE.match(path.stem)
        if not match:
            continue
        parent = match.group(1)
        parent_name = by_slug.get(parent)
        parent_file = HUBS / f"{parent}.html"
        if parent_file.exists() and parent_name:
            path.write_text(pointer_page(path.stem, parent, parent_name), encoding="utf-8")
        elif parent_file.exists():
            path.write_text(pointer_page(path.stem, parent, parent), encoding="utf-8")
        else:
            path.write_text(pointer_page(path.stem, None, None), encoding="utf-8")
        fixed += 1
    return fixed


def main() -> None:
    rows = read_letters()
    if len(rows) < 1000 and OUT_JSON.exists():
        saved = json.loads(OUT_JSON.read_text(encoding="utf-8"))
        rows = saved.get("entities", []) + saved.get("excluded", [])
    if len(rows) < 1000:
        raise SystemExit(f"índice curto demais: {len(rows)}")
    rows = attach_catalog(rows)
    public = [row for row in rows if row["type"] == "artist"]
    excluded = [row for row in rows if row["type"] == "excluded"]
    public.sort(key=lambda row: (row["displayName"].casefold(), row["slug"]))
    payload_entities = []
    for row in public:
        payload_entities.append({key: row[key] for key in row if key != "articles"})
    payload_excluded = []
    for row in excluded:
        payload_excluded.append({key: row[key] for key in row if key != "articles"})
    OUT_JSON.write_text(json.dumps({
        "source": "data/blog-catalog.jsonl + blog/arquivo/letra-*.html",
        "mutatedArticles": False,
        "deleted": False,
        "counts": {
            "indexed": len(public),
            "excluded": len(excluded),
            "needsReview": sum(1 for row in public if row["reviewState"] == "needs_review"),
        },
        "entities": payload_entities,
        "excluded": payload_excluded,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    (LETTERS / "letras.html").write_text(index_page(None), encoding="utf-8")
    for letter in "abcdefghijklmnopqrstuvwxyz":
        (LETTERS / f"letra-{letter}.html").write_text(index_page(letter.upper()), encoding="utf-8")
    products = product_index()
    rewritten = 0
    for row in public + excluded:
        articles = row.get("articles") or []
        keys = {store.fold(row["displayName"]), store.fold(row.get("canonicalName") or ""), store.fold(row["slug"])}
        found = []
        for key in keys:
            found.extend(products.get(key, []))
        dedup = []
        seen = set()
        for item in found:
            url = item.get("url")
            if not url or url in seen:
                continue
            seen.add(url)
            dedup.append(item)
            if len(dedup) == 4:
                break
        if not articles:
            continue
        path = HUBS / f"{row['slug']}.html"
        path.write_text(hub_page(row, articles, dedup), encoding="utf-8")
        rewritten += 1
    pointers = repair_pagination_pages()
    print(json.dumps({
        "indexed": len(public),
        "excluded": len(excluded),
        "hubs": rewritten,
        "needsReview": sum(1 for row in public if row["reviewState"] == "needs_review"),
        "paginationPointers": pointers,
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
