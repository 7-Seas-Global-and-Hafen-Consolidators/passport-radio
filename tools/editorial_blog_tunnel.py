#!/usr/bin/env python3
"""Passport Global Blog Tunnel™ V1.

Channel adapter over the existing Editorial mill.

WHIPLASH + METAL HAMMER DE
  → continuous discovery (RSS, sitemap, REST, indexes)
  → persistent queue (entire eligible archive can sit here)
  → Fact Pack / merge / entities / media
  → original PT-BR writing
  → quality gate
  → Blog only (/blog/YYYY/MM/DD/slug.html)

Never publishes to noticias.html, Home, or the old news feed.
Black Sabbath is not a filter. Publication cap is independent of discovery.
Backfill is the same machine with --mode backfill.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import ssl
import sys
from pathlib import Path
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
TOOLS = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS))

import editorial_blog_discovery as discovery
import editorial_engine as base
import editorial_engine_constitution as constitution
import editorial_quality_gate as quality_gate
from editorial_fact_pack import build_fact_pack, merge_fact_packs
from editorial_media_resolver import library_payload, resolve_media, upsert_library
from editorial_tunnel import title_similarity

SITE = "https://passportradio.online"
CHANNEL = "blog"
PUBLIC_AUTHOR = "Passport Radio"
COVER_URL = "/historias/contar-historias-que-dao-vontade-de-ouvir.html"
XAI_URL = "https://api.x.ai/v1/chat/completions"
PROTECTED_SURFACES = (
    "noticias.html",
    "index.html",
    "radio.html",
    "data/editorial-feed.json",
    "js/editorial-home.js",
    "js/passport-news.js",
    "js/passport-live.js",
    ".github/workflows/editorial-engine.yml",
    ".github/workflows/editorial-tunnel.yml",
)
STORY_DNA = (
    "DNA EDITORIAL PASSPORT PARA O BLOG: escreva matéria nova em português brasileiro. "
    "Nunca tradução integral, nunca tradução parágrafo a parágrafo, nunca título literal. "
    "Material em alemão ou outra língua serve só para fatos: datas, nomes, bandas, discos, "
    "músicas, shows, lugares, declarações e relações. Autor público: Passport Radio. "
    "Nunca assine Mr. Nomad. Não cite veículo de descoberta. "
    "Não invente números, entrevistas ou datas que não estejam no FACT_PACK. "
)

FORMAT_TO_PASSPORT = {
    "news": "STORY",
    "story": "STORY",
    "special": "STORY",
    "interview": "STORY",
    "review": "STORY",
    "show": "LIVE_SIGNAL",
    "festival": "LIVE_SIGNAL",
    "tour": "LIVE_SIGNAL",
    "video": "FLASH",
    "curiosity": "FLASH",
}


def load_json(path: Path, fallback: Any) -> Any:
    return base.load_json(path, fallback)


def save_json(path: Path, value: Any) -> None:
    base.save_json(path, value)


def now_sp() -> dt.datetime:
    return base.now_sp()


def _candidate_urls(item: dict[str, Any]) -> list[str]:
    urls: list[str] = []
    if item.get("url"):
        urls.append(str(item.get("url")))
    for origin in item.get("origins") or []:
        if isinstance(origin, dict) and origin.get("url"):
            urls.append(str(origin.get("url")))
    clean: list[str] = []
    seen: set[str] = set()
    for url in urls:
        url = url.strip()
        if not url or url in seen or not discovery.allowed_url(url):
            continue
        seen.add(url)
        clean.append(url)
    return clean


def persist_queue(radar_items: list[dict[str, Any]], queue_path: Path, generated_at: str, queue_size: int = 100000) -> dict[str, Any]:
    queue = load_json(queue_path, {"version": 1, "channel": CHANNEL, "items": []})
    items: list[dict[str, Any]] = list(queue.get("items") or [])
    by_url: dict[str, dict[str, Any]] = {}
    for row in items:
        for url in row.get("urls") or []:
            by_url[str(url)] = row
    discovered = 0
    merged = 0
    blocked = 0
    for raw in radar_items:
        if not isinstance(raw, dict):
            continue
        urls = _candidate_urls(raw)
        if not urls:
            continue
        title = base.clean(raw.get("title"))
        desc = base.clean(raw.get("description"))
        existing = None
        for url in urls:
            if url in by_url:
                existing = by_url[url]
                break
        if existing is None:
            for row in items:
                if title and title_similarity(title, str(row.get("title") or "")) >= 0.62:
                    existing = row
                    break
        if discovery.is_blocked_scope(title, desc):
            blocked += 1
            if existing is not None and existing.get("status") == "queued":
                existing["status"] = "rejected_scope"
            elif existing is None:
                items.append({
                    "cluster_id": discovery.cluster_id_for(urls, title),
                    "status": "rejected_scope",
                    "reason": "funk_pancadao_organic_block",
                    "title": title,
                    "urls": urls,
                    "origins": raw.get("origins") or [{"url": urls[0]}],
                    "candidate": raw,
                    "discovered_at": generated_at,
                    "format_hint": raw.get("format_hint") or "story",
                })
            continue
        if existing is None:
            row = {
                "cluster_id": discovery.cluster_id_for(urls, title),
                "status": "queued",
                "title": title,
                "urls": urls,
                "origins": raw.get("origins") or [{"url": u} for u in urls],
                "candidate": raw,
                "discovered_at": generated_at,
                "published_url": None,
                "format_hint": raw.get("format_hint") or "story",
                "entities_hint": raw.get("entities") or [],
            }
            items.append(row)
            for url in urls:
                by_url[url] = row
            discovered += 1
            continue
        merged += 1
        for url in urls:
            if url not in existing.get("urls", []):
                existing.setdefault("urls", []).append(url)
            by_url[url] = existing
        origins = list(existing.get("origins") or [])
        known = {str(x.get("url")) for x in origins if isinstance(x, dict)}
        for origin in raw.get("origins") or []:
            if isinstance(origin, dict) and origin.get("url") and origin["url"] not in known:
                origins.append(origin)
                known.add(origin["url"])
        existing["origins"] = origins
        if existing.get("status") not in {"published", "rejected_scope"}:
            existing["candidate"] = raw
            existing["title"] = existing.get("title") or title
            existing["format_hint"] = existing.get("format_hint") or raw.get("format_hint")
            hints = list(existing.get("entities_hint") or [])
            for ent in raw.get("entities") or []:
                if ent not in hints:
                    hints.append(ent)
            existing["entities_hint"] = hints[:16]
    if len(items) > queue_size:
        published = [x for x in items if x.get("status") == "published"]
        rest = [x for x in items if x.get("status") != "published"]
        items = published[-max(1000, queue_size // 5):] + rest[-(queue_size - len(published[-max(1000, queue_size // 5):])):]
    queue["version"] = 1
    queue["channel"] = CHANNEL
    queue["updated_at"] = generated_at
    queue["items"] = items
    save_json(queue_path, queue)
    return {
        "queue_size": len(items),
        "newly_queued": discovered,
        "merged_into_clusters": merged,
        "blocked_scope": blocked,
        "queued": sum(1 for x in items if x.get("status") == "queued"),
        "published": sum(1 for x in items if x.get("status") == "published"),
        "rejected_scope": sum(1 for x in items if x.get("status") == "rejected_scope"),
    }


def discover(sources: Path, output_dir: Path, mode: str, max_age_hours: int, workers: int, config: dict[str, Any]) -> dict[str, Any]:
    output_dir.mkdir(parents=True, exist_ok=True)
    payload = load_json(sources, {})
    source_rows = discovery.load_sources(payload)
    caps = dict(((config.get("discovery") or {}).get(mode) or {}))
    packet = discovery.discover_sources(
        source_rows,
        mode=mode,
        max_age_hours=max_age_hours,
        workers=workers,
        caps=caps,
    )
    save_json(output_dir / "blog-radar.json", packet)
    stats = persist_queue(
        list(packet.get("items") or []),
        ROOT / "data/blog-tunnel-queue.json",
        packet.get("generated_at") or now_sp().isoformat(),
        queue_size=int(config.get("queue_size", 100000)),
    )
    archive = discovery.upsert_archive(list(packet.get("items") or []), packet.get("generated_at") or "")
    archive_overview = discovery.archive_stats()
    health = packet.get("source_health") or []
    healthy = [h for h in health if h.get("ok")]
    failed = [h for h in health if not h.get("ok")]
    summary = {
        "status": "HEALTHY" if healthy else "DEGRADED",
        "mode": mode,
        "sources": len(health) or 2,
        "healthy_sources": len(healthy),
        "failed_sources": [x.get("name") for x in failed],
        "source_health": health,
        "discovered_urls": packet.get("discovered_url_count", 0),
        "queue": stats,
        "archive": archive_overview,
        "archive_upsert": archive,
    }
    save_json(output_dir / "blog-discover-report.json", summary)
    if not packet.get("items") and not healthy:
        raise SystemExit("discovery failed on every source")
    return summary


def fetch_html(url: str, timeout: int = 15) -> str:
    if not url or urlparse(url).scheme not in {"http", "https"}:
        return ""
    req = Request(url, headers={
        "User-Agent": discovery.USER_AGENT,
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "Accept-Language": base.GLOBAL_ACCEPT_LANGUAGE,
    })
    ctx = ssl.create_default_context()
    try:
        with urlopen(req, timeout=timeout, context=ctx) as resp:
            raw = resp.read(2_000_000)
            charset = resp.headers.get_content_charset() or "utf-8"
            return raw.decode(charset, errors="replace")
    except Exception:
        return ""


def _origin_packs(item: dict[str, Any], config: dict[str, Any], editorial_day: str) -> tuple[dict[str, Any], dict[str, Any], dict[str, str]]:
    candidate = dict(item.get("candidate") or item)
    bodies: dict[str, str] = {}
    packs: list[dict[str, Any]] = []
    resolved_media = {"photos": [], "videos": []}
    failures: list[str] = []
    for url in item.get("urls") or _candidate_urls(candidate):
        try:
            html_text = fetch_html(url)
        except Exception as exc:
            failures.append(f"{url}:{type(exc).__name__}")
            continue
        bodies[url] = html_text
        visible = ""
        if html_text:
            parser = base.VisibleTextParser()
            try:
                parser.feed(html_text)
                visible = parser.result()
            except Exception:
                visible = ""
        if not visible:
            try:
                visible = base.fetch_source_text(url)
            except Exception:
                visible = ""
        local_candidate = dict(candidate)
        local_candidate["url"] = url
        pack = build_fact_pack(
            local_candidate,
            visible,
            editorial_day,
            max_source_chars=int(config.get("source_firewall_max_chars", 7000)),
        )
        packs.append(pack)
        media = resolve_media(html_text, url, candidate)
        resolved_media["photos"].extend(media.get("photos") or [])
        resolved_media["videos"].extend(media.get("videos") or [])
    if not packs and failures:
        raise RuntimeError("all_origins_failed:" + ";".join(failures[:4]))
    merged = merge_fact_packs(packs) if packs else build_fact_pack(candidate, "", editorial_day)
    seen_p: set[str] = set()
    photos = []
    for photo in resolved_media["photos"]:
        if photo.get("id") in seen_p:
            continue
        seen_p.add(photo.get("id"))
        photos.append(photo)
    seen_v: set[str] = set()
    videos = []
    for video in resolved_media["videos"]:
        if video.get("id") in seen_v:
            continue
        seen_v.add(video.get("id"))
        videos.append(video)
    videos.sort(key=lambda x: (bool(x.get("live_performance")), x.get("score") or 0), reverse=True)
    media = {
        "photos": photos[:8],
        "videos": videos[:4],
        "hero_photo": photos[0] if photos else None,
        "hero_video": videos[0] if videos else None,
    }
    return merged, media, bodies


def _call_xai(candidate: dict[str, Any], source_text: str, config: dict[str, Any]) -> dict[str, Any]:
    api_key = os.environ.get("XAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("XAI_API_KEY is not configured")
    instructions, input_text = constitution.build_prompt(candidate, source_text, config)
    instructions = STORY_DNA + instructions
    payload = {
        "model": str(config.get("model") or "grok-4.5"),
        "messages": [
            {"role": "system", "content": instructions},
            {"role": "user", "content": input_text},
        ],
        "temperature": 0.4,
        "max_tokens": int(config.get("max_output_tokens", 5000)),
    }
    req = Request(
        XAI_URL,
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "User-Agent": discovery.USER_AGENT,
        },
    )
    ctx = ssl.create_default_context()
    with urlopen(req, timeout=int(config.get("api_timeout_seconds", 120)), context=ctx) as resp:
        body = json.loads(resp.read().decode("utf-8"))
    text = (((body.get("choices") or [{}])[0].get("message") or {}).get("content") or "")
    if not text:
        raise RuntimeError("xAI returned empty content")
    return base.parse_json_text(text)


def _allowed_facts(pack: dict[str, Any]) -> list[dict[str, Any]]:
    out = []
    for fact in pack.get("facts") or []:
        if not fact.get("allowed_for_generation", True):
            continue
        if fact.get("status") in {"CONFLICTED", "INFERRED"}:
            continue
        out.append(fact)
    return out


def _kg_names(graph: dict[str, Any]) -> list[str]:
    names = []
    for row in graph.get("entities") or []:
        if not isinstance(row, dict):
            continue
        if row.get("type") not in {"artist", "band", "album", "song", "festival", "city"}:
            continue
        name = base.clean(row.get("name"))
        if name:
            names.append(name)
        for alias in row.get("aliases") or []:
            alias = base.clean(alias)
            if alias:
                names.append(alias)
    return names


GENERIC_ENTITY = {
    "news", "review", "metal", "rock", "blog", "passport", "album", "filme", "film",
    "disco", "show", "live", "podcast", "folge", "woche", "konzert", "festival",
    "new", "nova", "novo", "the", "and", "und", "der", "die", "das", "mit", "von",
    "im", "ist", "ein", "eine", "review", "interview", "especial", "curiosidade",
    "video", "hammer", "whiplash",
}


def entity_guess(pack: dict[str, Any], candidate: dict[str, Any], graph: dict[str, Any] | None = None) -> list[str]:
    names: list[str] = []

    def add(value: str) -> None:
        value = base.clean(value)
        if not value or len(value) < 3:
            return
        if value.lower() in GENERIC_ENTITY:
            return
        if value not in names:
            names.append(value)

    for raw in candidate.get("entities") or []:
        add(str(raw))
    for raw in candidate.get("entities_hint") or []:
        add(str(raw))
    blob = f"{candidate.get('title','')} {candidate.get('description','')}"
    for name in _kg_names(graph or {}):
        if name.lower() in blob.lower():
            add(name)
    for fact in _allowed_facts(pack):
        if fact.get("type") in {"entity", "person", "band", "artist"}:
            add(str(fact.get("value") or ""))
    for url in [str(candidate.get("url") or "")] + [str(o.get("url") or "") for o in (candidate.get("origins") or []) if isinstance(o, dict)]:
        slug = urlparse(url).path.rstrip("/").split("/")[-1]
        slug = re.sub(r"^\d+-", "", slug)
        slug = re.sub(r"-\d+$", "", slug)
        slug = slug.replace(".html", "").replace("-", " ")
        if slug and len(slug) > 3:
            add(slug.title())
    titled = re.findall(r"\b([A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+(?:\s+[A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+){0,3})\b", str(candidate.get("title") or ""))
    for token in titled:
        if token.lower() not in GENERIC_ENTITY:
            add(token)
    return names[:10]


def write_from_fact_pack(candidate: dict[str, Any], pack: dict[str, Any], graph: dict[str, Any] | None = None) -> dict[str, Any]:
    """Original PT-BR draft from facts. Never a translation of the source article."""
    facts = _allowed_facts(pack)
    title_fact = next((f for f in facts if f.get("type") == "signal_title"), None)
    summary_fact = next((f for f in facts if f.get("type") == "signal_summary"), None)
    date_facts = [f for f in facts if f.get("type") in {"date", "signal_date"}]
    statements = [f for f in facts if f.get("type") == "source_statement"]
    entities = entity_guess(pack, candidate, graph)
    subject = entities[0] if entities else "A cena"
    others = [n for n in entities[1:6] if n]
    cast = ", ".join(others) if others else "os nomes que atravessam essa página"
    original_title = base.clean(candidate.get("title"))
    fmt_hint = str(candidate.get("format_hint") or pack.get("recommended_format") or "story")
    passport_fmt = FORMAT_TO_PASSPORT.get(fmt_hint, "STORY")
    date_hint = ""
    if date_facts:
        date_hint = base.clean(date_facts[0].get("value") or date_facts[0].get("evidence") or "")
    title = f"O que {subject} deixa no ar agora"
    if base.SequenceMatcher(None, base.norm_ascii(title), base.norm_ascii(original_title)).ratio() > 0.72:
        title = f"Uma nova dobra na história de {subject}"
    deck = (
        f"{subject} reaparece no radar da Passport por um movimento concreto. "
        "A casa conta o que se pode cravar e devolve o resto para a escuta."
    )
    heading_a = "O que se pode cravar"
    heading_b = "Quem atravessa essa história"
    heading_c = "Por que isso pede uma escuta"
    p1 = (
        f"{subject} não chega aqui como nota solta. "
        f"Há um acontecimento recente que recoloca o nome no mapa"
        f"{(' em ' + date_hint) if date_hint and len(date_hint) < 24 else ''}. "
        "A Passport trata o episódio como história: o que mudou, quem está no meio e o que isso pede do ouvinte. "
        "Sem inflar biografia, sem inventar palco que não aconteceu, sem copiar o recorte de agência. "
        "O texto segura só o que o pacote de fatos deixa cravar e larga o resto. "
        "Quando a pauta é um giro de notícia, a casa pergunta o que permanece depois do clique. "
        "Quando é disco, pergunta o que a escuta ganha. Quando é palco, pergunta quem estava lá e o que o palco ainda deve."
    )
    p2 = (
        f"No centro estão {subject} e {cast}. "
        "Os nomes, as relações e as datas que o pacote de fatos sustenta ficam no texto; o que não se sustenta some. "
        "Se a pauta é disco, o disco é a porta. Se é show, o palco. Se é fala, a fala vira contexto, não transcrição. "
        "A matéria existe para abrir caminho, não para substituir o catálogo de outra redação. "
        "A Passport não precisa do tom de urgente para reconhecer importância. "
        "Um nome antigo que volta, um disco que reaparece, uma declaração que desloca o mapa: "
        "tudo isso cabe no Blog se puder ser contado com calma e devolver o leitor para a música. "
        "O arquivo desta casa cresce assim, história por história, sem fingir que viu o que não viu."
    )
    p3 = (
        "No fim, a Passport guarda o fato e devolve o ouvinte para a música. "
        f"Quem chegou por {subject} pode sair por um disco, uma faixa ao vivo ou um nome ao lado. "
        "Every Song Is A Destination: primeiro a história, depois o play. "
        "A casa não simula urgência de feed; ela registra o que importa o bastante para ser relido. "
        "Há leitores que entram pelo acontecimento e saem por uma canção que já conheciam. "
        "Há quem faça o caminho inverso. Os dois movimentos valem, desde que a página não se feche em si mesma. "
        "O Blog existe para essa travessia: da frase à escuta, do nome ao disco, do fato à vontade de ouvir de novo."
    )
    closing = (
        f"A Passport deixa {subject} no mapa do Blog e espera o ouvinte do outro lado da frase, "
        "com o rádio aberto e sem pressa de transformar memória em pauta descartável."
    )
    refs1 = [f["fact_id"] for f in (title_fact, summary_fact) if f][:8]
    refs2 = [f["fact_id"] for f in (*date_facts[:3], *statements[:3]) if f]
    refs3 = [f["fact_id"] for f in (title_fact, *statements[:4]) if f]
    refs1 = [x for x in refs1 if x] or ([facts[0]["fact_id"]] if facts else [])
    refs2 = [x for x in refs2 if x] or refs1
    refs3 = [x for x in refs3 if x] or refs1
    category = base.clean(candidate.get("primary_category") or pack.get("primary_category") or "music")
    if category in {"continental_europe", "brasil"}:
        category = "music"
    return {
        "title": title,
        "deck": deck,
        "kicker": f"PASSPORT RADIO · BLOG · {category.upper()}",
        "format": passport_fmt if passport_fmt in base.FORMAT_MIN_WORDS else "STORY",
        "category": category,
        "meta_description": deck[:155],
        "entities": entities or [subject],
        "keywords": entities[:8],
        "sections": [
            {"heading": heading_a, "paragraphs": [{"text": p1, "fact_refs": refs1[:8]}]},
            {"heading": heading_b, "paragraphs": [{"text": p2, "fact_refs": refs2[:8]}]},
            {"heading": heading_c, "paragraphs": [{"text": p3, "fact_refs": refs3[:8]}]},
        ],
        "closing": closing,
        "_writer": "fact_pack_original",
    }


def generate_article(candidate: dict[str, Any], pack: dict[str, Any], visible_text: str, config: dict[str, Any], graph: dict[str, Any] | None = None) -> dict[str, Any]:
    candidate = dict(candidate)
    candidate["_fact_pack"] = pack
    candidate["_event_id"] = pack.get("event_id")
    candidate["_story_angle_id"] = pack.get("story_angle_id")
    errors: list[str] = []
    draft = None
    try:
        draft = _call_xai(candidate, visible_text, config)
        draft["_writer"] = "xai"
    except Exception as exc:
        errors.append(f"xai:{type(exc).__name__}:{exc}")
        try:
            draft = constitution.call_openai(candidate, visible_text, config)
            draft["_writer"] = "mill_provider"
        except Exception as exc2:
            errors.append(f"mill:{type(exc2).__name__}:{exc2}")
            draft = write_from_fact_pack(candidate, pack, graph)
    article = constitution.safe_article(draft, candidate)
    article["_writer"] = draft.get("_writer")
    article["_generation_errors"] = errors
    article["author"] = PUBLIC_AUTHOR
    if not article.get("entities"):
        article["entities"] = entity_guess(pack, candidate, graph)
    return article


def _media_html(media: dict[str, Any], title: str) -> str:
    chunks: list[str] = []
    video = media.get("hero_video") or {}
    photo = media.get("hero_photo") or {}
    if video.get("embed_url") and video.get("platform") in {"youtube", "vimeo"}:
        label = base.esc(video.get("title") or title)
        live = ' data-live="1"' if video.get("live_performance") else ""
        chunks.append(
            f'<div class="blog-embed"{live}><iframe src="{base.esc(video["embed_url"])}" title="{label}" '
            f'loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>'
        )
    if photo.get("url"):
        credit = photo.get("credit") or ""
        cap = f"<figcaption>{base.esc(credit)}</figcaption>" if credit else ""
        chunks.append(
            f'<figure class="blog-photo"><img src="{base.esc(photo["url"])}" alt="{base.esc(photo.get("alt") or title)}" loading="eager">{cap}</figure>'
        )
    return "".join(chunks)


def render_blog_article(article: dict[str, Any], url_path: str, related: list[dict[str, Any]], media: dict[str, Any]) -> str:
    public = constitution._public_article_copy(article)
    title = public["title"]
    desc = public.get("meta_description") or public["deck"]
    published = str(article.get("published_at") or "")[:10]
    canonical = SITE + url_path
    sections = []
    for section in public.get("sections") or []:
        paragraphs = "\n".join(f"<p>{base.esc(p)}</p>" for p in section.get("paragraphs") or [])
        sections.append(f"<h2>{base.esc(section.get('heading'))}</h2>\n{paragraphs}")
    related_html = ""
    if related:
        cards = "".join(
            f'<a class="blog-related__card" href="{base.esc(i.get("url"))}"><small>{base.esc(i.get("category") or "BLOG")}</small><strong>{base.esc(i.get("title"))}</strong></a>'
            for i in related
        )
        related_html = f'<section class="blog-related"><span>CONTINUE NO BLOG</span><div>{cards}</div></section>'
    about = [{"@type": "Thing", "name": n} for n in (article.get("entities") or [])[:8]]
    hero = (media.get("hero_photo") or {}).get("url") or ""
    if str(hero).startswith("/"):
        image = SITE + hero
    elif hero:
        image = hero
    else:
        image = SITE + "/images/passport-radio-definitive.jpg"
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": desc,
        "image": image,
        "author": {"@type": "Organization", "name": PUBLIC_AUTHOR},
        "publisher": {"@type": "Organization", "name": "Passport Radio", "logo": {"@type": "ImageObject", "url": SITE + "/images/passport-radio-definitive.jpg"}},
        "mainEntityOfPage": canonical,
        "datePublished": published,
        "dateModified": published,
        "inLanguage": "pt-BR",
        "about": about,
    }
    stamp = dt.date.fromisoformat(published).strftime("%d %b %Y").upper() if published else ""
    media_html = _media_html(media, title)
    story_id = base.clean(article.get("story_angle_id"))
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{base.esc(title)} | Passport Radio</title>
<meta name="description" content="{base.esc(desc)}">
<link rel="canonical" href="{base.esc(canonical)}">
<meta name="passport:channel" content="blog">
<meta name="passport:story-id" content="{base.esc(story_id)}">
<meta property="og:type" content="article"><meta property="og:locale" content="pt_BR"><meta property="og:site_name" content="Passport Radio">
<meta property="og:title" content="{base.esc(title)}"><meta property="og:description" content="{base.esc(desc)}">
<meta property="og:url" content="{base.esc(canonical)}"><meta property="og:image" content="{base.esc(schema['image'])}">
<meta property="article:published_time" content="{base.esc(published)}"><meta property="article:author" content="{PUBLIC_AUTHOR}">
<meta name="twitter:card" content="summary_large_image">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600;6..96,700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/editorial-engine.css?v=20260825">
<link rel="stylesheet" href="/css/passport-blog.css?v=20260918b">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="pp-article pp-blog-article">
<div class="pe-topbar">PASSPORT RADIO · BLOG</div>
<header class="pe-header"><div class="pe-shell"><a class="pe-brand" href="/"><strong>PASSPORT RADIO</strong></a><nav><a href="/">AGORA</a><a href="/blog.html">BLOG</a><a href="/radio.html">OUVIR</a></nav></div></header>
<main>
<section class="pe-hero"><div class="pe-shell">
<span class="pe-kicker">{base.esc(article.get("kicker") or "PASSPORT RADIO · BLOG")}</span>
<h1>{base.esc(title)}</h1>
<p>{base.esc(article.get("deck"))}</p>
<div class="pe-stamp"><b>{PUBLIC_AUTHOR}</b><span>{base.esc(stamp)}</span></div>
</div></section>
<article class="pe-prose">
{media_html}
{''.join(sections)}
<div class="pe-closing"><small>PASSPORT RADIO · BLOG</small><p>{base.esc(article.get("closing"))}</p></div>
<p class="blog-listen"><a href="/radio.html">OUVIR NA PASSPORT</a></p>
<p><strong><a href="/blog.html">→ Voltar ao Blog Passport Radio</a></strong></p>
</article>
</main>
{related_html}
<section class="passport-discussion" aria-label="Discussão futura" data-passport-discussion="reserved"><h2>Discussão</h2><p>Esta história reservará espaço para participação de contas Passport autenticadas. Nenhum comentário, contagem ou perfil é simulado nesta página.</p></section>
<footer class="pp-footer"><div class="pp-footer-bottom">© 2026 Passport Radio · <a href="/privacidade.html">Política de Privacidade</a> · <a href="/termos.html">Termos de Uso</a> · <a href="/cookies.html">Política de Cookies</a></div></footer>
</body></html>
'''


def expand_knowledge_graph(graph: dict[str, Any], article: dict[str, Any], url_path: str, media: dict[str, Any]) -> dict[str, Any]:
    types = list(graph.get("entity_types") or [])
    for extra in ("photo", "video", "article"):
        if extra not in types:
            types.append(extra)
    graph["entity_types"] = types
    entities = list(graph.get("entities") or [])
    relations = list(graph.get("relations") or [])
    by_id = {str(x.get("id")): x for x in entities if isinstance(x, dict)}

    def upsert(eid: str, etype: str, name: str, extra: dict[str, Any] | None = None) -> None:
        row = by_id.get(eid) or {"id": eid, "type": etype, "name": name, "aliases": []}
        row["type"] = etype
        row["name"] = name or row.get("name")
        if extra:
            row.update(extra)
        by_id[eid] = row

    def rel(kind: str, src: str, dst: str) -> None:
        if not src or not dst:
            return
        item = {"type": kind, "from": src, "to": dst}
        if item not in relations:
            relations.append(item)

    slug = base.slugify(article.get("title") or url_path)
    article_id = f"article:blog-{slug}"
    upsert(article_id, "article", article.get("title") or "", {"url": url_path, "author": PUBLIC_AUTHOR})
    for name in article.get("entities") or []:
        key = base.slugify(name)
        if not key:
            continue
        guessed = "band" if any(ch.isupper() for ch in name) else "artist"
        low = name.lower()
        if low in {"birmingham", "londres", "london", "são paulo", "sao paulo"}:
            guessed = "city"
        eid = f"{guessed}:{key}"
        if eid not in by_id:
            for existing in by_id.values():
                if base.norm_ascii(existing.get("name") or "") == base.norm_ascii(name):
                    eid = existing["id"]
                    break
        upsert(eid, by_id.get(eid, {}).get("type") or guessed, name)
        rel("about", article_id, eid)
    photo = media.get("hero_photo") or {}
    if photo.get("id"):
        upsert(photo["id"], "photo", photo.get("alt") or article.get("title") or "", {"url": photo.get("url")})
        rel("depicts", photo["id"], article_id)
    video = media.get("hero_video") or {}
    if video.get("id"):
        upsert(video["id"], "video", video.get("title") or article.get("title") or "", {"url": video.get("url"), "embed": video.get("embed_url")})
        rel("features", video["id"], article_id)
    graph["entities"] = list(by_id.values())
    graph["relations"] = relations
    graph["version"] = max(2, int(graph.get("version") or 2))
    return graph


def _priority(item: dict[str, Any]) -> int:
    """Recency + method richness. No artist allowlist."""
    score = int((item.get("candidate") or {}).get("total_score") or 0)
    methods = {str((o or {}).get("method") or "") for o in (item.get("origins") or []) if isinstance(o, dict)}
    score += 15 * len(methods)
    published = str((item.get("candidate") or {}).get("published") or "")
    parsed = discovery.parse_datetime(published)
    if parsed:
        age_h = max(0, (dt.datetime.now(dt.timezone.utc) - parsed).total_seconds() / 3600)
        score += max(0, int(200 - age_h))
    fmt = str(item.get("format_hint") or "")
    if fmt in {"interview", "review", "special"}:
        score += 20
    return score


def generate(max_generate: int, apply: bool, output_dir: Path) -> dict[str, Any]:
    config = load_json(ROOT / "data/blog-tunnel-engine.json", {})
    queue_path = ROOT / "data/blog-tunnel-queue.json"
    ledger_path = ROOT / "data/blog-published.json"
    feed_path = ROOT / "data/blog-feed.json"
    media_path = ROOT / "data/blog-media-library.json"
    graph_path = ROOT / "data/knowledge-graph.json"
    queue = load_json(queue_path, {"items": []})
    state = load_json(ledger_path, {"ledger": []})
    feed_payload = load_json(feed_path, {"items": []})
    library = load_json(media_path, {"items": []})
    graph = load_json(graph_path, {"entities": [], "relations": []})
    ledger: list[dict[str, Any]] = list(state.get("ledger") or [])
    feed: list[dict[str, Any]] = list(feed_payload.get("items") or [])
    known_urls = {str(x.get("url")) for x in ledger if x.get("url")}
    known_clusters = {str(x.get("cluster_id")) for x in ledger if x.get("cluster_id")}
    known_stories = {str(x.get("story_angle_id")) for x in ledger if x.get("story_angle_id")}
    known_hashes = {str(x.get("source_hash")) for x in ledger if x.get("source_hash")}

    queued = [x for x in queue.get("items") or [] if x.get("status") == "queued"]
    queued.sort(key=_priority, reverse=True)
    picked = queued[: max(0, max_generate)]
    leftover = queued[max(0, max_generate):]
    day = constitution.editorial_day()
    output_dir.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {
        "channel": CHANNEL,
        "editorial_day": day,
        "queued_before": len(queued),
        "generation_budget": max_generate,
        "left_in_queue": len(leftover),
        "generated": [],
        "skipped": [],
        "idempotent_hits": [],
        "source_failures": [],
    }
    new_paths: list[str] = []

    for item in picked:
        title = base.clean(item.get("title"))
        hashes = [base.source_hash(u) for u in (item.get("urls") or [])]
        if item.get("cluster_id") in known_clusters or item.get("published_url") in known_urls:
            report["idempotent_hits"].append(title)
            item["status"] = "published"
            continue
        if any(h in known_hashes for h in hashes):
            report["idempotent_hits"].append(title)
            item["status"] = "published"
            continue
        try:
            pack, media, bodies = _origin_packs(item, config, day)
        except Exception as exc:
            report["source_failures"].append({"title": title, "error": f"{type(exc).__name__}: {exc}"})
            continue
        if any(str(x).startswith("injection_pattern:") for x in pack.get("firewall_flags") or []):
            item["status"] = "skipped"
            report["skipped"].append({"title": title, "reason": "source_firewall_injection"})
            continue
        if len(pack.get("facts") or []) < int(config.get("minimum_fact_pack_facts", 2)):
            item["status"] = "skipped"
            report["skipped"].append({"title": title, "reason": "insufficient_evidence"})
            continue
        if pack.get("story_angle_id") in known_stories:
            report["idempotent_hits"].append(title)
            item["status"] = "published"
            continue
        visible_chunks = []
        for html_text in bodies.values():
            parser = base.VisibleTextParser()
            try:
                parser.feed(html_text or "")
                visible_chunks.append(parser.result())
            except Exception:
                pass
        visible = "\n\n".join(x for x in visible_chunks if x)
        candidate = dict(item.get("candidate") or {})
        candidate["format_hint"] = item.get("format_hint") or candidate.get("format_hint")
        candidate["entities_hint"] = item.get("entities_hint") or candidate.get("entities") or []
        candidate["_fact_pack"] = pack
        candidate["_event_id"] = pack.get("event_id")
        candidate["_story_angle_id"] = pack.get("story_angle_id")
        article = generate_article(candidate, pack, visible, config, graph)
        article["batch_id"] = "blog-v1"
        article["editorial_day"] = day
        article["author"] = PUBLIC_AUTHOR
        if "mr. nomad" in base.norm_ascii(constitution.public_text(article)):
            report["skipped"].append({"title": title, "reason": "nomad_signature_blocked"})
            continue
        if base.too_similar(article["title"], article["event_key"], ledger, int(config.get("cooldown_days", 45))):
            report["skipped"].append({"title": article["title"], "reason": "duplicate_after_generation"})
            item["status"] = "queued"
            continue
        production_errors = constitution.validate_article(article, candidate, config)
        gate = quality_gate.evaluate(article, pack, config)
        needs_fallback = bool(production_errors) or (
            str((config.get("quality_gate") or {}).get("mode")) == "enforce"
            and gate.get("decision") != "WOULD_PUBLISH"
        )
        if needs_fallback:
            article = constitution.safe_article(write_from_fact_pack(candidate, pack, graph), candidate)
            article["author"] = PUBLIC_AUTHOR
            article["_writer"] = "fact_pack_original"
            production_errors = constitution.validate_article(article, candidate, config)
            gate = quality_gate.evaluate(article, pack, config)
            if production_errors or (
                str((config.get("quality_gate") or {}).get("mode")) == "enforce"
                and gate.get("decision") != "WOULD_PUBLISH"
            ):
                report["skipped"].append({
                    "title": article.get("title") or title,
                    "reason": "; ".join(production_errors or gate.get("reasons") or ["unknown"]),
                    "decision": gate.get("decision"),
                })
                continue
        stamp = now_sp()
        article["published_at"] = stamp.isoformat()
        slug = base.slugify(article["title"])
        url_path = f"/blog/{day.replace('-', '/')}/{slug}.html"
        if url_path in known_urls:
            report["idempotent_hits"].append(article["title"])
            item["status"] = "published"
            item["published_url"] = url_path
            continue
        related = [x for x in base.related_items(constitution._public_article_copy(article), feed) if x.get("url") != COVER_URL]
        html_text = render_blog_article(article, url_path, related, media)
        low_html = html_text.lower()
        if "mr. nomad" in low_html or "<audio" in low_html:
            report["skipped"].append({"title": article["title"], "reason": "renderer_contract"})
            continue
        if "noticias.html" in html_text:
            report["skipped"].append({"title": article["title"], "reason": "noticias_leak"})
            continue
        rel = Path(url_path.lstrip("/"))
        (output_dir / rel).parent.mkdir(parents=True, exist_ok=True)
        (output_dir / rel).write_text(html_text, "utf-8")
        if apply:
            target = ROOT / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(html_text, "utf-8")
        public_item = {
            "title": article["title"],
            "deck": article["deck"],
            "url": url_path,
            "category": article.get("category") or "music",
            "format": article.get("format") or "STORY",
            "published_at": article["published_at"],
            "entities": article.get("entities") or [],
            "author": PUBLIC_AUTHOR,
            "channel": CHANNEL,
            "story_id": pack.get("story_angle_id"),
            "image": (media.get("hero_photo") or {}).get("url") or "",
        }
        feed.insert(0, public_item)
        feed = feed[: int(config.get("feed_size", 400))]
        entry = {
            "title": article["title"],
            "url": url_path,
            "published_at": article["published_at"],
            "editorial_day": day,
            "category": article.get("category"),
            "format": article.get("format"),
            "entities": article.get("entities") or [],
            "event_key": article.get("event_key"),
            "event_id": pack.get("event_id"),
            "story_angle_id": pack.get("story_angle_id"),
            "cluster_id": item.get("cluster_id"),
            "fingerprint": base.fingerprint(article["title"]),
            "source_hash": hashes[0] if hashes else "",
            "source_hashes": hashes,
            "author": PUBLIC_AUTHOR,
            "channel": CHANNEL,
            "status": "PUBLISHED",
        }
        ledger.append(entry)
        known_urls.add(url_path)
        known_clusters.add(str(item.get("cluster_id")))
        known_stories.add(str(pack.get("story_angle_id")))
        known_hashes.update(hashes)
        item["status"] = "published"
        item["published_url"] = url_path
        item["story_angle_id"] = pack.get("story_angle_id")
        discovery.mark_archive_published(item.get("urls") or [], url_path, article["title"])
        new_paths.append(url_path)
        library = upsert_library(library, library_payload(media), article.get("entities") or [])
        graph = expand_knowledge_graph(graph, article, url_path, media)
        report["generated"].append({
            "title": article["title"],
            "url": url_path,
            "writer": article.get("_writer"),
            "event_id": pack.get("event_id"),
            "cluster_id": item.get("cluster_id"),
            "origins": item.get("urls"),
            "photos": len(media.get("photos") or []),
            "videos": len(media.get("videos") or []),
            "gate": gate.get("decision"),
        })
        save_json(output_dir / f"fact-pack-{base.slugify(article['title'])[:40]}.json", pack)

    leftover_count = sum(1 for x in queue.get("items") or [] if x.get("status") == "queued")
    report["left_in_queue"] = leftover_count
    report["published_total"] = len(report["generated"])
    next_state = {
        "version": 1,
        "channel": CHANNEL,
        "updated_at": now_sp().isoformat(),
        "ledger": ledger[-int(config.get("ledger_size", 100000)):],
    }
    next_feed = {
        "version": 1,
        "channel": CHANNEL,
        "updated_at": now_sp().isoformat(),
        "author": PUBLIC_AUTHOR,
        "cover_mode": "human",
        "cover_url": COVER_URL,
        "items": feed,
    }
    library["updated_at"] = now_sp().isoformat()
    library["channel"] = CHANNEL
    save_json(output_dir / "blog-published.next.json", next_state)
    save_json(output_dir / "blog-feed.next.json", next_feed)
    save_json(output_dir / "engine-report.json", report)
    save_json(queue_path, queue)
    if apply and report["generated"]:
        save_json(ledger_path, next_state)
        save_json(feed_path, next_feed)
        save_json(media_path, library)
        save_json(graph_path, graph)
        if "/blog.html" not in new_paths:
            new_paths.append("/blog.html")
        base.update_sitemap(ROOT, new_paths, day)
    save_json(output_dir / "engine-report.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


def main() -> int:
    ap = argparse.ArgumentParser(description="Passport Global Blog Tunnel™ V1")
    ap.add_argument("command", choices=["discover", "generate", "run", "archive-stats"], nargs="?", default="run")
    ap.add_argument("--sources", default=str(ROOT / "data/editorial-sources-blog-v1.json"))
    ap.add_argument("--output-dir", default=str(ROOT / "build/blog-tunnel"))
    ap.add_argument("--mode", choices=["continuous", "backfill"], default="continuous")
    ap.add_argument("--max-age-hours", type=int, default=168)
    ap.add_argument("--workers", type=int, default=2)
    ap.add_argument("--max-generate", type=int, default=2)
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    out = Path(args.output_dir)
    config = load_json(ROOT / "data/blog-tunnel-engine.json", {})
    if args.command == "archive-stats":
        print(json.dumps(discovery.archive_stats(), ensure_ascii=False, indent=2))
        return 0
    if args.command in {"discover", "run"}:
        discover(Path(args.sources), out / "discovery", args.mode, args.max_age_hours, args.workers, config)
    if args.command in {"generate", "run"}:
        generate(args.max_generate, args.apply, out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
