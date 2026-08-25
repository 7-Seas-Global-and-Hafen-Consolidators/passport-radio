#!/usr/bin/env python3
"""Passport Editorial Engine™ — draft/publish engine for Passport Radio.

Consumes Passport Editorial Tunnel JSON, creates original Passport editorial pages,
keeps a compact anti-duplication ledger, updates the public editorial feed/sitemap,
and can apply a batch to a checked-out static site.

The public renderer never exposes discovery-source names, URLs, authors or source
images. Those inputs exist only during generation.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import ssl
import sys
import time
import unicodedata
from difflib import SequenceMatcher
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
USER_AGENT = "PassportEditorialEngine/1.0 (+https://www.passportradio.online/)"
API_URL = "https://api.openai.com/v1/responses"
SITE = "https://www.passportradio.online"
PUBLIC_AUTHOR = "Passport Radio"
PUBLIC_PUBLISHER = "Passport Radio"
DEFAULT_LOGO = "/images/passport-radio-definitive.jpg"
MAX_SOURCE_BYTES = 2_000_000
MAX_SOURCE_CHARS = 18_000

STOPWORDS = {
    "a","o","as","os","e","de","da","do","das","dos","em","na","no","nas","nos","para","por","com","um","uma",
    "the","a","an","and","of","in","on","for","to","with","from","is","are","was","were","new","news","novo","nova",
    "this","that","after","before","sobre","como","que","se","sua","seu","ao","aos"
}

DEFAULT_FORBIDDEN = [
    "segundo a ", "segundo o ", "de acordo com ", "via ", "fonte:", "fontes:",
    "publicado originalmente", "publicada originalmente", "em entrevista ao ",
    "em entrevista à ", "em entrevista para ", "according to ", "source:",
    "metal hammer", "louder", "whiplash", "rolling stone", "billboard", "nme",
    "kerrang", "blabbermouth", "loudwire", "stereogum", "pitchfork", "consequence",
    "metal injection", "metalsucks", "bravewords", "guitar world", "ultimate guitar"
]

FORMAT_MIN_WORDS = {"FLASH": 260, "STORY": 520, "MR_NOMAD": 850, "LIVE_SIGNAL": 360}
FORMAT_MAX_SECTIONS = {"FLASH": 3, "STORY": 5, "MR_NOMAD": 7, "LIVE_SIGNAL": 4}


class VisibleTextParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.skip = 0
        self.parts: list[str] = []
        self.in_article = 0
        self.article_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "form"}:
            self.skip += 1
        if tag == "article":
            self.in_article += 1

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "article" and self.in_article:
            self.in_article -= 1
        if tag in {"script", "style", "noscript", "svg", "nav", "footer", "form"} and self.skip:
            self.skip -= 1

    def handle_data(self, data: str) -> None:
        if self.skip:
            return
        text = clean(data)
        if len(text) < 2:
            return
        self.parts.append(text)
        if self.in_article:
            self.article_parts.append(text)

    def result(self) -> str:
        parts = self.article_parts if len(" ".join(self.article_parts)) > 700 else self.parts
        text = "\n".join(parts)
        text = re.sub(r"\n{3,}", "\n\n", text)
        return text[:MAX_SOURCE_CHARS]


def clean(value: Any) -> str:
    return re.sub(r"\s+", " ", html.unescape(str(value or ""))).strip()


def now_sp() -> dt.datetime:
    return dt.datetime.now(dt.timezone(dt.timedelta(hours=-3)))


def load_json(path: Path, fallback: Any) -> Any:
    try:
        return json.loads(path.read_text("utf-8"))
    except Exception:
        return fallback


def save_json(path: Path, value: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", "utf-8")


def norm_ascii(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return value.lower()


def tokens(value: str) -> set[str]:
    words = re.findall(r"[a-z0-9]{3,}", norm_ascii(value))
    return {w for w in words if w not in STOPWORDS}


def fingerprint(value: str) -> str:
    seq = " ".join(sorted(tokens(value)))
    return hashlib.sha256(seq.encode()).hexdigest()[:24]


def source_hash(url: str) -> str:
    return hashlib.sha256((url or "").strip().lower().encode()).hexdigest()[:24]


def slugify(value: str, max_len: int = 88) -> str:
    value = norm_ascii(value)
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    value = re.sub(r"-+", "-", value)
    return value[:max_len].rstrip("-") or f"passport-{int(time.time())}"


def jaccard(a: set[str], b: set[str]) -> float:
    if not a or not b:
        return 0.0
    return len(a & b) / max(1, len(a | b))


def too_similar(title: str, candidate_event: str, ledger: list[dict[str, Any]], cooldown_days: int) -> bool:
    t = tokens(title)
    n = now_sp()
    for item in ledger[-20000:]:
        published = item.get("published_at", "")
        try:
            age = n - dt.datetime.fromisoformat(published)
            if age.days > cooldown_days and item.get("event_key") != candidate_event:
                continue
        except Exception:
            pass
        old = str(item.get("title", ""))
        if item.get("fingerprint") == fingerprint(title):
            return True
        if candidate_event and candidate_event == item.get("event_key"):
            return True
        score = max(jaccard(t, tokens(old)), SequenceMatcher(None, norm_ascii(title), norm_ascii(old)).ratio())
        if score >= 0.78:
            return True
    return False


def fetch_source_text(url: str, timeout: int = 15) -> str:
    if not url or urlparse(url).scheme not in {"http", "https"}:
        return ""
    req = Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.7,en;q=0.6",
    })
    ctx = ssl.create_default_context()
    try:
        with urlopen(req, timeout=timeout, context=ctx) as resp:
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "html" not in ctype:
                return ""
            raw = resp.read(MAX_SOURCE_BYTES)
            charset = resp.headers.get_content_charset() or "utf-8"
            body = raw.decode(charset, errors="replace")
        parser = VisibleTextParser()
        parser.feed(body)
        return parser.result()
    except Exception:
        return ""


def extract_response_text(payload: dict[str, Any]) -> str:
    if isinstance(payload.get("output_text"), str):
        return payload["output_text"]
    chunks: list[str] = []
    for item in payload.get("output", []) or []:
        if not isinstance(item, dict):
            continue
        for part in item.get("content", []) or []:
            if isinstance(part, dict) and part.get("type") in {"output_text", "text"}:
                text = part.get("text")
                if isinstance(text, str):
                    chunks.append(text)
    return "\n".join(chunks).strip()


def parse_json_text(text: str) -> dict[str, Any]:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.I)
    text = re.sub(r"\s*```$", "", text)
    try:
        value = json.loads(text)
        if isinstance(value, dict):
            return value
    except Exception:
        pass
    start, end = text.find("{"), text.rfind("}")
    if start >= 0 and end > start:
        value = json.loads(text[start:end + 1])
        if isinstance(value, dict):
            return value
    raise ValueError("model did not return a JSON object")


def build_prompt(candidate: dict[str, Any], source_text: str, config: dict[str, Any]) -> tuple[str, str]:
    fmt = candidate.get("recommended_format") or "STORY"
    title = clean(candidate.get("title"))
    desc = clean(candidate.get("description"))
    category = clean(candidate.get("primary_category") or "music")
    published = clean(candidate.get("published"))
    today = now_sp().strftime("%d/%m/%Y")

    instructions = """Você é o motor editorial da PASSPORT RADIO. Escreva jornalismo musical original em português do Brasil, com voz editorial forte, limpa e cinematográfica. A publicação pública deve parecer nascida na Passport Radio. Nunca mencione veículo de descoberta, jornalista de origem, URL, 'fonte', 'via', 'segundo', 'de acordo com', nem genealogia da pauta. Não copie frases do material de apoio. Use-o apenas para fatos e contexto. Não invente entrevistas da Passport. Se um dado biográfico específico não puder ser confirmado, omita-o. Para pessoas relevantes, prefira nome completo, nome profissional, idade quando verificável, instrumento/função e projetos relacionados. Diferencie fato atual de contexto histórico. Títulos precisam ser novos, não tradução literal do título de entrada. Retorne SOMENTE JSON válido, sem markdown e sem comentários."""

    schema = {
        "title": "Título editorial novo",
        "deck": "Resumo de 1-2 frases",
        "kicker": f"PASSPORT RADIO · {category.upper()} · {today}",
        "format": fmt,
        "category": category,
        "meta_description": "até 155 caracteres",
        "entities": ["artistas/bandas/álbuns centrais"],
        "event_key": "chave curta e estável do acontecimento/ângulo",
        "keywords": ["termos de busca"],
        "sections": [{"heading": "subtítulo", "paragraphs": ["parágrafo", "parágrafo"]}],
        "closing": "fecho curto com identidade Passport"
    }
    input_text = f"""DATA DE HOJE: {today}
FORMATO SUGERIDO: {fmt}
CATEGORIA: {category}
SINAL DESCOBERTO (não citar publicamente):
TÍTULO: {title}
RESUMO: {desc}
DATA DO SINAL: {published or 'não informada'}
SCORES INTERNOS: trend={candidate.get('trend_score',0)} passport={candidate.get('passport_score',0)} archive={candidate.get('archive_score',0)}

MATERIAL DE APOIO FACTUAL (não reproduzir; não atribuir publicamente):
---
{source_text or '[sem corpo disponível; use apenas os metadados acima e fatos estáveis que puder confirmar]'}
---

OBJETIVO: produzir uma matéria Passport Radio completa, original e útil. O primeiro parágrafo precisa responder por que isso importa. Depois acrescente contexto histórico, nomes e funções relevantes quando confirmáveis. Evite enchimento e repetição. O formato {fmt} deve ter aproximadamente {FORMAT_MIN_WORDS.get(fmt,520)} a {FORMAT_MIN_WORDS.get(fmt,520)+500} palavras, salvo se não houver fatos suficientes. Máximo de {FORMAT_MAX_SECTIONS.get(fmt,5)} seções.

FORMATO JSON EXATO (mesmas chaves):
{json.dumps(schema, ensure_ascii=False)}"""
    return instructions, input_text


def call_openai(candidate: dict[str, Any], source_text: str, config: dict[str, Any]) -> dict[str, Any]:
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    model = os.environ.get("PASSPORT_EDITORIAL_MODEL", "").strip() or config.get("model", "gpt-5.6-luna")
    instructions, input_text = build_prompt(candidate, source_text, config)
    body: dict[str, Any] = {
        "model": model,
        "instructions": instructions,
        "input": input_text,
        "max_output_tokens": int(config.get("max_output_tokens", 6500)),
    }
    if config.get("web_search", True):
        body["tools"] = [{"type": "web_search"}]
    req = Request(API_URL, data=json.dumps(body).encode("utf-8"), method="POST", headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
    })
    ctx = ssl.create_default_context()
    with urlopen(req, timeout=int(config.get("api_timeout_seconds", 180)), context=ctx) as resp:
        payload = json.loads(resp.read().decode("utf-8"))
    return parse_json_text(extract_response_text(payload))


def public_text(article: dict[str, Any]) -> str:
    chunks = [article.get("title", ""), article.get("deck", ""), article.get("kicker", ""), article.get("meta_description", ""), article.get("closing", "")]
    for section in article.get("sections", []) or []:
        chunks.append(section.get("heading", ""))
        chunks.extend(section.get("paragraphs", []) or [])
    return "\n".join(clean(x) for x in chunks if x)


def validate_article(article: dict[str, Any], candidate: dict[str, Any], config: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    required = ["title", "deck", "meta_description", "sections", "event_key"]
    for key in required:
        if not article.get(key):
            errors.append(f"missing {key}")
    fmt = str(article.get("format") or candidate.get("recommended_format") or "STORY").upper()
    if fmt not in FORMAT_MIN_WORDS:
        article["format"] = "STORY"
        fmt = "STORY"
    text = public_text(article)
    low = norm_ascii(text)
    forbidden = config.get("public_forbidden_patterns", DEFAULT_FORBIDDEN)
    for pattern in forbidden:
        if norm_ascii(pattern) in low:
            errors.append(f"public source leak pattern: {pattern}")
            break
    if "http://" in low or "https://" in low or "www." in low:
        errors.append("public URL leak")
    words = re.findall(r"\b\w+\b", text, flags=re.UNICODE)
    minimum = int(config.get("minimum_words", {}).get(fmt, FORMAT_MIN_WORDS[fmt]))
    if len(words) < minimum:
        errors.append(f"too short: {len(words)} < {minimum}")
    sections = article.get("sections") or []
    if not isinstance(sections, list) or len(sections) > FORMAT_MAX_SECTIONS[fmt] + 2:
        errors.append("invalid section count")
    original = clean(candidate.get("title"))
    if SequenceMatcher(None, norm_ascii(original), norm_ascii(clean(article.get("title")))).ratio() > 0.88:
        errors.append("title too close to discovery headline")
    return errors


def safe_article(article: dict[str, Any], candidate: dict[str, Any]) -> dict[str, Any]:
    fmt = str(article.get("format") or candidate.get("recommended_format") or "STORY").upper()
    if fmt not in FORMAT_MIN_WORDS:
        fmt = "STORY"
    article["format"] = fmt
    article["title"] = clean(article.get("title"))[:180]
    article["deck"] = clean(article.get("deck"))[:420]
    article["meta_description"] = clean(article.get("meta_description"))[:160]
    article["category"] = clean(article.get("category") or candidate.get("primary_category") or "music")[:60]
    article["kicker"] = f"PASSPORT RADIO · {article['category'].upper()} · {now_sp().strftime('%d/%m/%Y')}"
    article["event_key"] = slugify(clean(article.get("event_key") or article["title"]), 100)
    article["entities"] = [clean(x)[:100] for x in (article.get("entities") or []) if clean(x)][:16]
    article["keywords"] = [clean(x)[:80] for x in (article.get("keywords") or []) if clean(x)][:16]
    sections = []
    for s in article.get("sections") or []:
        if not isinstance(s, dict):
            continue
        heading = clean(s.get("heading"))[:160]
        paragraphs = [clean(p) for p in (s.get("paragraphs") or []) if len(clean(p)) > 20]
        if heading and paragraphs:
            sections.append({"heading": heading, "paragraphs": paragraphs})
    article["sections"] = sections
    article["closing"] = clean(article.get("closing"))[:700]
    return article


def related_items(article: dict[str, Any], feed: list[dict[str, Any]], limit: int = 5) -> list[dict[str, Any]]:
    ents = {norm_ascii(x) for x in article.get("entities", []) if x}
    cat = article.get("category", "")
    scored: list[tuple[int, dict[str, Any]]] = []
    for item in feed:
        score = 0
        if item.get("category") == cat:
            score += 2
        item_ents = {norm_ascii(x) for x in item.get("entities", []) if x}
        score += 3 * len(ents & item_ents)
        if score:
            scored.append((score, item))
    scored.sort(key=lambda x: (x[0], x[1].get("published_at", "")), reverse=True)
    return [x[1] for x in scored[:limit]]


def esc(value: Any) -> str:
    return html.escape(clean(value), quote=True)


def render_article(article: dict[str, Any], url_path: str, related: list[dict[str, Any]]) -> str:
    title = article["title"]
    desc = article["meta_description"] or article["deck"]
    published = article["published_at"][:10]
    category = article["category"]
    fmt = article["format"].replace("_", " ")
    canonical = SITE + url_path
    sections_html = []
    for idx, s in enumerate(article.get("sections", []), 1):
        ps = "\n".join(f"<p>{esc(p)}</p>" for p in s.get("paragraphs", []))
        sections_html.append(f'<span class="chapter">{idx:02d} · {esc(s.get("heading"))}</span><h2>{esc(s.get("heading"))}</h2>{ps}')
    related_html = ""
    if related:
        cards = "".join(f'<a href="{esc(i.get("url"))}"><small>{esc(i.get("category"))}</small><strong>{esc(i.get("title"))}</strong></a>' for i in related)
        related_html = f'<section class="related"><span>CONTINUE NA PASSPORT</span><div>{cards}</div></section>'
    schema = {
        "@context": "https://schema.org",
        "@type": "NewsArticle" if article["format"] == "FLASH" else "Article",
        "headline": title,
        "description": desc,
        "image": SITE + DEFAULT_LOGO,
        "author": {"@type": "Organization", "name": PUBLIC_AUTHOR},
        "publisher": {"@type": "Organization", "name": PUBLIC_PUBLISHER},
        "mainEntityOfPage": canonical,
        "datePublished": published,
        "dateModified": published,
        "inLanguage": "pt-BR",
    }
    return f'''<!DOCTYPE html>
<html lang="pt-BR"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(desc)}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"><meta name="theme-color" content="#f7f5f0">
<title>{esc(title)} | Passport Radio</title><link rel="canonical" href="{esc(canonical)}">
<meta property="og:type" content="article"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="Passport Radio"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{esc(canonical)}"><meta property="og:image" content="{SITE + DEFAULT_LOGO}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(desc)}"><meta name="twitter:image" content="{SITE + DEFAULT_LOGO}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/editorial-engine.css?v=20260825"><link rel="stylesheet" href="/css/passport-legal-footer.css?v=202608241345">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script></head><body>
<div class="pe-topbar">PASSPORT RADIO · {esc(fmt)} · {esc(category)}</div>
<header class="pe-header"><div class="pe-shell"><a class="pe-brand" href="/"><img src="{DEFAULT_LOGO}" alt="Passport Radio"><strong>PASSPORT RADIO</strong></a><nav><a href="/">AGORA</a><a href="/editorial.html">EDITORIAL</a><a href="/radio.html">AO VIVO</a><a href="/destinos.html">ARQUIVOS</a><a href="/loja.html">LOJA</a></nav></div></header>
<main><section class="pe-hero"><div class="pe-shell"><span class="pe-kicker">{esc(article['kicker'])}</span><h1>{esc(title)}</h1><p>{esc(article['deck'])}</p><div class="pe-stamp"><b>PASSPORT RADIO</b><span>{esc(published)}</span></div></div></section>
<div class="pe-shell pe-layout"><article class="pe-prose"><p class="pe-lead">{esc(article['deck'])}</p>{''.join(sections_html)}<div class="pe-closing"><small>PASSPORT RADIO · EDITORIAL</small><p>{esc(article.get('closing'))}</p></div></article><aside class="pe-side"><div><small>PASSPORT RADIO</small><strong>Primeiro a história.<br>Depois a música.</strong><a href="/radio.html">ENTRAR NO AR →</a></div></aside></div>{related_html}</main>
<footer class="pe-footer"><div class="pe-shell"><strong>PASSPORT RADIO</strong><span>Every Song Is A Destination.</span></div></footer><script src="/js/passport-legal-footer.js?v=202608241345" defer></script></body></html>'''


def update_sitemap(root: Path, paths: list[str], date: str) -> None:
    p = root / "sitemap.xml"
    if not p.exists():
        return
    text = p.read_text("utf-8")
    additions = []
    for path in paths:
        loc = SITE.replace("www.", "") + path
        if loc in text or (SITE + path) in text:
            continue
        additions.append(f"  <url><loc>{loc}</loc><lastmod>{date}</lastmod></url>")
    if additions and "</urlset>" in text:
        text = text.replace("</urlset>", "\n" + "\n".join(additions) + "\n\n</urlset>")
        p.write_text(text, "utf-8")


def install_home_hook(root: Path) -> bool:
    p = root / "index.html"
    if not p.exists():
        return False
    text = p.read_text("utf-8")
    marker = "/js/editorial-home.js"
    if marker in text:
        return False
    hook = '\n<script src="/js/editorial-home.js?v=20260825" defer></script>\n'
    if "</body>" in text:
        text = text.replace("</body>", hook + "</body>")
        p.write_text(text, "utf-8")
        return True
    return False


def desired_batch(target: int, already_today: int, max_batch: int) -> int:
    now = now_sp()
    seconds = now.hour * 3600 + now.minute * 60 + now.second
    desired_now = max(1, int((target * seconds + 86399) // 86400))
    backlog = max(0, desired_now - already_today)
    return min(max_batch, backlog)


def public_feed_item(article: dict[str, Any], url_path: str) -> dict[str, Any]:
    return {"title": article["title"], "deck": article["deck"], "url": url_path, "category": article["category"], "format": article["format"], "published_at": article["published_at"], "entities": article.get("entities", [])[:8], "author": PUBLIC_AUTHOR}


def choose_candidates(selected: list[dict[str, Any]], ledger: list[dict[str, Any]], need: int, config: dict[str, Any]) -> list[dict[str, Any]]:
    if need <= 0:
        return []
    known_source_hashes = {x.get("source_hash") for x in ledger if x.get("source_hash")}
    chosen: list[dict[str, Any]] = []
    cat_counts: dict[str, int] = {}
    cooldown = int(config.get("cooldown_days", 45))
    for diversity in (True, False):
        for c in selected:
            if len(chosen) >= need:
                break
            if c in chosen or c.get("already_covered"):
                continue
            sh = source_hash(str(c.get("url", "")))
            if sh in known_source_hashes:
                continue
            title = clean(c.get("title"))
            if not title:
                continue
            preliminary_event = slugify(title, 100)
            shadow = ledger + [{"title": x.get("title", ""), "event_key": slugify(x.get("title", ""), 100), "published_at": now_sp().isoformat()} for x in chosen]
            if too_similar(title, preliminary_event, shadow, cooldown):
                continue
            cat = c.get("primary_category") or "music"
            if diversity and cat_counts.get(cat, 0) >= max(1, (need + 7) // 8):
                continue
            chosen.append(c)
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
        if len(chosen) >= need:
            break
    return chosen[:need]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--queue", required=True)
    ap.add_argument("--config", default=str(ROOT / "data/editorial-engine.json"))
    ap.add_argument("--state", default=str(ROOT / "data/editorial-published.json"))
    ap.add_argument("--feed", default=str(ROOT / "data/editorial-feed.json"))
    ap.add_argument("--output-dir", default=str(ROOT / "build/editorial-engine"))
    ap.add_argument("--daily-target", type=int, default=0)
    ap.add_argument("--capacity", type=int, default=0)
    ap.add_argument("--max-batch", type=int, default=0)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--force-batch", type=int, default=-1, help="manual override; 0 means no generation")
    args = ap.parse_args()

    config = load_json(Path(args.config), {})
    target = args.daily_target or int(config.get("daily_target", 70))
    capacity = args.capacity or int(config.get("daily_capacity", 200))
    max_batch = args.max_batch or int(config.get("max_batch", 6))
    if target < 1 or target > capacity or capacity > 200:
        raise SystemExit(f"invalid target/capacity: target={target} capacity={capacity}; hard cap is 200/day")

    queue = load_json(Path(args.queue), {})
    selected = queue.get("selected", []) if isinstance(queue, dict) else []
    state_path = Path(args.state)
    feed_path = Path(args.feed)
    state = load_json(state_path, {"version": 1, "ledger": []})
    ledger: list[dict[str, Any]] = state.get("ledger", []) if isinstance(state, dict) else []
    feed_payload = load_json(feed_path, {"version": 1, "items": []})
    feed: list[dict[str, Any]] = feed_payload.get("items", []) if isinstance(feed_payload, dict) else []

    today = now_sp().date().isoformat()
    already_today = sum(1 for x in ledger if str(x.get("published_at", "")).startswith(today))
    if args.force_batch >= 0:
        batch_size = min(args.force_batch, max_batch, capacity - already_today)
    else:
        batch_size = desired_batch(target, already_today, max_batch)
    batch_size = max(0, min(batch_size, target - already_today, capacity - already_today))

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {"generated_at": now_sp().isoformat(), "daily_target": target, "daily_capacity": capacity, "already_today": already_today, "requested_batch": batch_size, "queue_size": len(selected), "applied": bool(args.apply), "generated": [], "skipped": [], "status": "ok"}

    if batch_size <= 0:
        report["status"] = "on_pace"
        save_json(out / "engine-report.json", report)
        print(json.dumps(report, ensure_ascii=False))
        return 0

    if not os.environ.get("OPENAI_API_KEY", "").strip():
        report["status"] = "awaiting_openai_api_key"
        report["candidates"] = [{"title": clean(c.get("title")), "category": c.get("primary_category"), "score": c.get("total_score")} for c in choose_candidates(selected, ledger, batch_size, config)]
        save_json(out / "engine-report.json", report)
        print(json.dumps(report, ensure_ascii=False))
        return 0

    candidates = choose_candidates(selected, ledger, max(batch_size * 3, batch_size), config)
    new_paths: list[str] = []
    generated_articles: list[dict[str, Any]] = []

    for c in candidates:
        if len(generated_articles) >= batch_size:
            break
        try:
            context = fetch_source_text(str(c.get("url", "")))
            article = safe_article(call_openai(c, context, config), c)
            if too_similar(article["title"], article["event_key"], ledger, int(config.get("cooldown_days", 45))):
                report["skipped"].append({"title": article["title"], "reason": "duplicate_after_generation"})
                continue
            errors = validate_article(article, c, config)
            if errors:
                report["skipped"].append({"title": article.get("title") or clean(c.get("title")), "reason": "; ".join(errors)})
                continue
            stamp = now_sp()
            article["published_at"] = stamp.isoformat()
            date_path = stamp.strftime("%Y/%m/%d")
            slug = slugify(article["title"])
            url_path = f"/editorial/{date_path}/{slug}.html"
            rel = Path(url_path.lstrip("/"))
            related = related_items(article, feed)
            html_text = render_article(article, url_path, related)
            (out / rel).parent.mkdir(parents=True, exist_ok=True)
            (out / rel).write_text(html_text, "utf-8")
            if args.apply:
                target_path = ROOT / rel
                target_path.parent.mkdir(parents=True, exist_ok=True)
                target_path.write_text(html_text, "utf-8")

            item = public_feed_item(article, url_path)
            feed.insert(0, item)
            feed = feed[:int(config.get("feed_size", 500))]
            entry = {"title": article["title"], "url": url_path, "published_at": article["published_at"], "category": article["category"], "format": article["format"], "entities": article.get("entities", [])[:10], "event_key": article["event_key"], "fingerprint": fingerprint(article["title"]), "source_hash": source_hash(str(c.get("url", "")))}
            ledger.append(entry)
            new_paths.append(url_path)
            generated_articles.append(item)
            report["generated"].append({"title": article["title"], "url": url_path, "format": article["format"], "category": article["category"]})
        except Exception as exc:
            report["skipped"].append({"title": clean(c.get("title")), "reason": f"generation_error: {type(exc).__name__}: {exc}"})

    ledger = ledger[-int(config.get("ledger_size", 20000)):]
    state = {"version": 1, "updated_at": now_sp().isoformat(), "daily_capacity": capacity, "ledger": ledger}
    feed_payload = {"version": 1, "updated_at": now_sp().isoformat(), "author": PUBLIC_AUTHOR, "items": feed}

    save_json(out / "editorial-published.next.json", state)
    save_json(out / "editorial-feed.next.json", feed_payload)
    if args.apply and generated_articles:
        save_json(state_path, state)
        save_json(feed_path, feed_payload)
        update_sitemap(ROOT, new_paths, today)
        install_home_hook(ROOT)

    report["published_today_after"] = already_today + len(generated_articles)
    report["status"] = "generated" if generated_articles else "no_valid_articles"
    save_json(out / "engine-report.json", report)
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
