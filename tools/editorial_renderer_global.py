#!/usr/bin/env python3
"""Public HTML renderer for Passport Editorial Engine™ Global.

The discovery firewall is preserved: only Passport-authored editorial fields are
rendered. Mr. Nomad is part of the template itself, never injected as an HTML
post-processing step.
"""
from __future__ import annotations

import json
from typing import Any

import editorial_engine as base

NOMAD_SIGNATURE_HTML = (
    '<div class="pe-closing pe-nomad-signature">'
    '<small>— MR. NOMAD</small>'
    '<p>Every Song Is A Destination. Aguardo meus Nômades na Passport Radio.</p>'
    '</div>'
)


def render_article(article: dict[str, Any], url_path: str, related: list[dict[str, Any]]) -> str:
    title = article["title"]
    desc = article["meta_description"] or article["deck"]
    published = article["published_at"][:10]
    category = article["category"]
    fmt = article["format"].replace("_", " ")
    canonical = base.SITE + url_path

    sections_html = []
    for idx, section in enumerate(article.get("sections", []), 1):
        paragraphs = "\n".join(f"<p>{base.esc(p)}</p>" for p in section.get("paragraphs", []))
        sections_html.append(
            f'<span class="chapter">{idx:02d} · {base.esc(section.get("heading"))}</span>'
            f'<h2>{base.esc(section.get("heading"))}</h2>{paragraphs}'
        )

    related_html = ""
    if related:
        cards = "".join(
            f'<a href="{base.esc(item.get("url"))}"><small>{base.esc(item.get("category"))}</small>'
            f'<strong>{base.esc(item.get("title"))}</strong></a>'
            for item in related
        )
        related_html = f'<section class="related"><span>CONTINUE NA PASSPORT</span><div>{cards}</div></section>'

    schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle" if article["format"] == "FLASH" else "Article",
        "headline": title,
        "description": desc,
        "image": base.SITE + base.DEFAULT_LOGO,
        "author": {"@type": "Organization", "name": base.PUBLIC_AUTHOR},
        "publisher": {"@type": "Organization", "name": base.PUBLIC_PUBLISHER},
        "mainEntityOfPage": canonical,
        "datePublished": published,
        "dateModified": published,
        "inLanguage": "pt-BR",
    }

    return f'''<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{base.esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="theme-color" content="#f7f5f0">
<title>{base.esc(title)} | Passport Radio</title><link rel="canonical" href="{base.esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="Passport Radio"><meta property="og:title" content="{base.esc(title)}"><meta property="og:description" content="{base.esc(desc)}"><meta property="og:url" content="{base.esc(canonical)}"><meta property="og:image" content="{base.SITE + base.DEFAULT_LOGO}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{base.esc(title)}"><meta name="twitter:description" content="{base.esc(desc)}"><meta name="twitter:image" content="{base.SITE + base.DEFAULT_LOGO}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/editorial-engine.css?v=20260825"><link rel="stylesheet" href="/css/passport-legal-footer.css?v=202608241345">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
<div class="pe-topbar">PASSPORT RADIO · {base.esc(fmt)} · {base.esc(category)}</div>
<header class="pe-header"><div class="pe-shell"><a class="pe-brand" href="/"><img src="{base.DEFAULT_LOGO}" alt="Passport Radio"><strong>PASSPORT RADIO</strong></a><nav><a href="/">AGORA</a><a href="/editorial.html">EDITORIAL</a><a href="/radio.html">AO VIVO</a><a href="/destinos.html">ARQUIVOS</a><a href="/loja.html">LOJA</a></nav></div></header>
<main><section class="pe-hero"><div class="pe-shell"><span class="pe-kicker">{base.esc(article['kicker'])}</span><h1>{base.esc(title)}</h1><p>{base.esc(article['deck'])}</p><div class="pe-stamp"><b>PASSPORT RADIO</b><span>{base.esc(published)}</span></div></div></section>
<div class="pe-shell pe-layout"><article class="pe-prose"><p class="pe-lead">{base.esc(article['deck'])}</p>{''.join(sections_html)}<div class="pe-closing"><small>PASSPORT RADIO · EDITORIAL</small><p>{base.esc(article.get('closing'))}</p></div>{NOMAD_SIGNATURE_HTML}</article><aside class="pe-side"><div><small>PASSPORT RADIO</small><strong>Primeiro a história.<br>Depois a música.</strong><a href="/radio.html">ENTRAR NO AR →</a></div></aside></div>{related_html}</main>
<footer class="pe-footer"><div class="pe-shell"><strong>PASSPORT RADIO</strong><span>Every Song Is A Destination.</span></div></footer><script src="/js/passport-legal-footer.js?v=202608241345" defer></script></body></html>'''
