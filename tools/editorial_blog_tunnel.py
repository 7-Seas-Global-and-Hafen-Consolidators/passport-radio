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
import html
import json
import os
import re
import ssl
import sys
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlparse
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
import editorial_blog_catalog as catalog

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


def persist_queue(radar_items: list[dict[str, Any]], queue_path: Path, generated_at: str, queue_size: int = 400) -> dict[str, Any]:
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
        "truncated": 0,
    }


def _hot_window(config: dict[str, Any]) -> int:
    window = int(config.get("hot_window") or 400)
    return max(1, min(window, 5000))


def sync_hot_queue(queue: dict[str, Any], config: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    """Replenish the hot working window from the durable archive. Never drops unread archive rows."""
    cursor_path = ROOT / "data/blog-tunnel-cursor.json"
    cursor_payload = load_json(cursor_path, {"version": 1, "channel": CHANNEL, "offsets": {}})
    cursor = {str(k): int(v) for k, v in (cursor_payload.get("offsets") or {}).items()}
    items, cursor, drain = discovery.replenish_hot_queue(
        list(queue.get("items") or []),
        cursor,
        window=_hot_window(config),
        live_share=float(config.get("hot_live_share", 0.5)),
        published_tail=int(config.get("hot_published_tail", 200)),
    )
    stamp = now_sp().isoformat()
    queue["version"] = 1
    queue["channel"] = CHANNEL
    queue["updated_at"] = stamp
    queue["hot_window"] = _hot_window(config)
    queue["items"] = items
    save_json(cursor_path, {
        "version": 1,
        "channel": CHANNEL,
        "updated_at": stamp,
        "offsets": cursor,
        "drain": {k: v for k, v in drain.items() if k != "cursor"},
    })
    return queue, drain



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
        queue_size=_hot_window(config),
    )
    archive = discovery.upsert_archive(list(packet.get("items") or []), packet.get("generated_at") or "")
    queue_path = ROOT / "data/blog-tunnel-queue.json"
    queue = load_json(queue_path, {"version": 1, "channel": CHANNEL, "items": []})
    queue, drain = sync_hot_queue(queue, config)
    save_json(queue_path, queue)
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
        "drain": drain,
        "hot_queue": {
            "size": len(queue.get("items") or []),
            "queued": sum(1 for x in (queue.get("items") or []) if x.get("status") == "queued"),
            "window": _hot_window(config),
        },
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
    "video", "hammer", "whiplash", "bryan", "ada", "leon", "nunca", "weapons",
    "pinkfloyd", "ironmaiden",
}
SHORT_BANDS = {"yes", "tool", "rush", "kiss", "can", "free", "cream", "war", "a-ha"}
FORMULA_TITLE = re.compile(r"^o que .+ deixa no ar agora\.?$", re.I)


def entity_guess(pack: dict[str, Any], candidate: dict[str, Any], graph: dict[str, Any] | None = None) -> list[str]:
    names: list[str] = []

    def add(value: str) -> None:
        value = base.clean(value)
        if not value or len(value) < 3:
            return
        low = value.lower()
        if low in GENERIC_ENTITY or low in catalog.ENTITY_STOP:
            return
        if fold_name(value) in catalog.ENTITY_STOP:
            return
        if value not in names:
            names.append(value)

    known = {base.clean(x).lower() for x in list(candidate.get("entities") or []) + list(candidate.get("entities_hint") or []) if x}
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
        if slug and len(slug) > 3 and (" " in slug or slug.lower() in known or slug.lower() in SHORT_BANDS):
            add(slug.title())
    titled = re.findall(r"\b([A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+(?:\s+[A-ZÁÉÍÓÚÀÃÕÄÖÜ][\wÁÉÍÓÚÀÃÕÄÖÜäöüß'’.-]+){0,3})\b", str(candidate.get("title") or ""))
    for token in titled:
        first = token.split()[0].lower()
        if first in {"die", "der", "das", "und", "im", "ein", "eine"}:
            continue
        if " " not in token and token.lower() not in known and token.lower() not in SHORT_BANDS:
            continue
        if token.lower() not in GENERIC_ENTITY:
            add(token)
    return names[:10]


def fold_name(value: str) -> str:
    return catalog.fold(value)


def _is_german(text: str) -> bool:
    raw = str(text or "")
    low = f" {raw.lower()} "
    if any(ch in raw.lower() for ch in "äöüß"):
        return True
    marks = (
        " der ", " die ", " das ", " und ", " mit ", " von ", " für ", " nicht ",
        " ein ", " eine ", " im ", " auf ", " den ", " dem ", " folge ", " zur ",
        " zum ", " nach ", " sich ", " nun ", " oder ", " weniger ", " versuchen ",
        " wagt ", " mehr ", " einem ", " einer ", " wurde ", " werden ",
    )
    return sum(1 for m in marks if m in low) >= 2


def _is_ptbr(text: str) -> bool:
    low = f" {str(text or '').lower()} "
    marks = (" que ", " do ", " da ", " de ", " para ", " com ", " uma ", " não ", " no ", " na ", " os ", " as ", " pelo ", " pela ")
    return sum(1 for m in marks if m in low) >= 2 and not _is_german(text)


def _pt_public(text: str) -> str:
    text = base.clean(text)
    if not text or _is_german(text):
        return ""
    if not _is_ptbr(text) and re.search(r"[äöüß]", text.lower()):
        return ""
    text = re.sub(r"(?i)\s*clique e entenda\.?$", "", text).strip()
    return text


def _passport_title(subject: str, signal: str, summary: str, source_title: str) -> str:
    signal = base.clean(signal)
    summary = base.clean(summary)
    source_title = base.clean(source_title)

    def ok(title: str) -> bool:
        title = base.clean(title)
        if not title or len(title) < 12:
            return False
        if FORMULA_TITLE.match(title):
            return False
        low_t = title.lower()
        if "deixa no ar agora" in low_t or "guarda nesta escuta" in low_t:
            return False
        if _is_german(title):
            return False
        if base.SequenceMatcher(None, base.norm_ascii(title), base.norm_ascii(source_title)).ratio() > 0.72:
            return False
        if base.SequenceMatcher(None, base.norm_ascii(title), base.norm_ascii(signal)).ratio() > 0.78:
            return False
        return True

    low = f"{signal} {summary} {source_title}".lower()
    names = re.findall(r"\b([A-ZÁÉÍÓÚ][\w'’.-]+(?:\s+[A-ZÁÉÍÓÚ][\w'’.-]+){0,2})\b", f"{signal} {source_title}")
    who = next((n for n in names if n.lower() != subject.lower() and n.lower() not in GENERIC_ENTITY), "")
    filmish = any(x in low for x in ("resident evil", "raccoon", "filme", " cinema", "horror", "herói", "heroi"))
    albumish = any(x in low for x in ("álbum", "album", "disco")) and not filmish
    showish = any(x in low for x in ("show", "palco", "turnê", "turne", "festival"))

    candidates: list[str] = []
    if filmish:
        if "raccoon" in low or "resident" in low:
            candidates.append(f"{subject} recoloca Raccoon City no centro com um herói falho")
        else:
            candidates.append(f"{subject} e o filme que recoloca a história no ecrã")
    if "parceria" in low or "compusemos" in low:
        candidates.append(f"{subject} e a parceria que o próprio autor descreve")
    if "escreveu" in low or "compôs" in low or "compos" in catalog.fold(low):
        candidates.append(f"{who or subject} e a canção de {subject} que nasceu depois da noite" if who else f"{subject} e a canção que nasceu depois da noite")
    if "inspira" in low:
        candidates.append(f"{subject} e a faixa que atravessou outras bandas")
    if "emociona" in low:
        candidates.append(f"{subject} e a canção que ainda pega o próprio autor")
    if "preferid" in low:
        candidates.append(f"As faixas de {subject} que outro músico guarda")
    if "show que mudou" in low or "mudou para sempre" in low:
        candidates.append(f"O palco que reorganizou a vida em torno de {subject}")
    if "mensagem" in low or "escondida" in low:
        candidates.append(f"O detalhe escondido no clássico de {subject}")
    if "anos 60" in low or "anos 70" in low or "anos 80" in low or "modelo" in low:
        candidates.append(f"{who or subject} e a faixa de época que modelou {subject}")
    if "gravou" in low or "trilha" in low:
        candidates.append(f"{subject} e a faixa que entrou em outra história")
    if "relembr" in low or "onipresente" in low:
        candidates.append(f"{subject} e a memória que os músicos ainda carregam")
    if "explica" in low or "detalhe" in low:
        candidates.append(f"{subject} e o detalhe que os fãs ainda discutem")
    if "entrevista" in low or "interview" in low or "podcast" in low or "microfone" in low:
        candidates.append(f"{subject} no microfone e o que essa conversa ainda move")
    if albumish:
        candidates.append(f"O disco de {subject} que ainda muda o mapa")
    if signal and _is_ptbr(signal) and not _is_german(signal):
        rest = re.sub(re.escape(subject), "", signal, flags=re.I)
        rest = re.sub(r"(?i)^review:\s*", "", rest)
        rest = re.sub(r"\s+", " ", rest).strip(" -–—:,.")
        if rest and len(rest) > 18 and not rest.lower().startswith("review"):
            rest = rest[0].lower() + rest[1:] if rest[:1].isupper() and (len(rest) < 2 or rest[1:2].islower()) else rest
            candidates.append(f"{subject}: {rest}")
    if showish and not filmish:
        candidates.append(f"{subject} e o palco que ainda reorganiza a rota")
    candidates.append(f"{subject} e o giro que recoloca o nome no mapa")
    candidates.append(f"A história de {subject} que a Passport escolheu guardar")
    for cand in candidates:
        cand = re.sub(r"\s+", " ", cand).strip()[:110]
        if ok(cand):
            return cand
    fallback = f"A história de {subject} que a Passport escolheu guardar"
    return fallback[:110]


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
    signal_raw = base.clean((title_fact or {}).get("value") or original_title)
    summary_raw = base.clean((summary_fact or {}).get("value") or "")
    hay = f"{signal_raw} {summary_raw}".lower()
    filmish = any(x in hay for x in ("resident evil", "raccoon", "filme", " cinema", "horror"))
    showish = any(x in hay for x in ("show", "palco", "turnê", "turne", "festival"))

    def public_line(value: str) -> str:
        text = _pt_public(value)
        text = re.sub(r"(?i)^review:\s*", "", text).strip()
        text = re.sub(r'[“”"«»]', "", text).strip()
        if _is_german(text):
            return ""
        return text

    public_signal = public_line(signal_raw)
    public_summary = public_line(summary_raw)
    public_quote = ""
    for stmt in statements:
        piece = public_line(stmt.get("value") or "")
        if piece and len(piece) > 24:
            public_quote = piece[:220]
            break
    if not public_quote and public_summary and _is_ptbr(public_summary):
        public_quote = public_summary[:220]
    title = _passport_title(subject, signal_raw, summary_raw, original_title)
    if FORMULA_TITLE.match(title) or "guarda nesta escuta" in title.lower():
        title = f"A história de {subject} que a Passport escolheu guardar"
    event = ""
    signal_for_event = public_signal
    if signal_for_event and re.fullmatch(r"[A-Z0-9 :().,\-']+", signal_for_event.rstrip(".")):
        signal_for_event = public_summary or signal_for_event
    if signal_for_event:
        event = signal_for_event.rstrip(".") + "."
    elif public_summary:
        event = public_summary[:220].rstrip(".") + "."
    if public_signal and 12 < len(public_signal) < 180 and not re.fullmatch(r"[A-Z0-9 :().,\-']+", public_signal.rstrip(".")):
        deck = public_signal.rstrip(".") + "."
    elif public_summary:
        deck = public_summary[:180].rstrip(".") + "."
    elif filmish:
        deck = (title if title and "guarda nesta escuta" not in title.lower() else f"{subject} recoloca a história no ecrã.").rstrip(".") + "."
    elif others:
        deck = f"{subject}, com {cast}."
    else:
        deck = f"{subject} entra no acervo da Passport por um episódio concreto."
    if filmish:
        heading_a, heading_b, heading_c = "O recorte", "Quem atravessa a tela", "O que fica depois da sessão"
        p1 = (
            f"{subject} entra nesta página por um filme concreto. {event} "
            "A Passport não trata cinema como nota de agência: segura o recorte que o pacote de fatos sustenta "
            "e larga o restante. Sem inventar still, palco ou declaração que o pacote não carrega."
        )
        p3 = (
            f"Esta página existe para que {subject} continue encontrável quando a sessão do dia passar. "
            "Quem chegou pelo filme pode sair por um nome, um disco da mesma casa ou outra matéria do acervo."
        )
    elif showish:
        heading_a, heading_b, heading_c = "O palco", "Quem estava no meio", "O que o palco ainda deve"
        p1 = (
            f"{subject} volta ao mapa por um palco concreto. {event} "
            "A Passport conta quem estava lá e o que o episódio ainda pede, sem inflar a biografia."
        )
        p3 = (
            f"Esta página existe para que o palco de {subject} continue encontrável. "
            "Quem chegou pelo show pode sair por um disco, uma faixa ou outra matéria do mesmo acervo."
        )
    else:
        heading_a, heading_b, heading_c = "O episódio", "Os nomes", "O que permanece no acervo"
        p1 = (
            f"{event or (subject + ' volta ao mapa por um episódio concreto.')} "
            "A Passport segura o que o pacote de fatos deixa cravar: nomes, relações e o movimento que recoloca a história. "
            "Sem inflar biografia e sem copiar o recorte de outra redação."
        )
        p3 = (
            f"Esta página existe para que {subject} continue encontrável quando o giro do dia passar. "
            "Quem chegou por um nome pode sair por um disco, um palco ou outra matéria do mesmo acervo."
        )
    quote_bit = (
        f"Uma fala que o pacote sustenta permanece no texto: {public_quote.rstrip('.')}."
        if public_quote else
        "As falas só entram quando o pacote de fatos as segura; o resto fica fora."
    )
    p2 = (
        f"No centro estão {subject} e {cast}. {quote_bit} "
        "Os nomes, as relações e as datas que o pacote sustenta ficam; o que não se sustenta some. "
        "A matéria existe para abrir caminho, não para substituir o catálogo de outra redação."
    )
    p3 += (
        " A casa não simula urgência de feed; registra o que importa o bastante para ser relido. "
        "Por isso a publicação não apaga a matéria quando ela sai da capa: o acervo continua no arquivo, na busca e nas entidades."
    )
    closing = (
        f"A Passport deixa {subject} no mapa do Blog para que a história continue encontrável, "
        "com o rádio aberto e sem pressa de transformar memória em pauta descartável."
    )
    refs1 = [f["fact_id"] for f in (title_fact, summary_fact, *date_facts[:2], *statements[:2]) if f][:8]
    refs2 = [f["fact_id"] for f in (*date_facts[:3], *statements[:3]) if f]
    refs3 = [f["fact_id"] for f in (title_fact, *statements[:4]) if f]
    refs1 = [x for x in refs1 if x] or ([facts[0]["fact_id"]] if facts else [])
    refs2 = [x for x in refs2 if x] or refs1
    refs3 = [x for x in refs3 if x] or refs1
    category = base.clean(candidate.get("primary_category") or pack.get("primary_category") or "music")
    if category in {"continental_europe", "brasil"}:
        category = "music"
    if filmish:
        category = "cultura"
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


def _paragraphs_html(section: dict[str, Any], entities: list[str]) -> str:
    chunks = []
    for raw in section.get("paragraphs") or []:
        text = raw.get("text") if isinstance(raw, dict) else str(raw or "")
        chunks.append(f"<p>{_link_entities(base.esc(text), entities)}</p>")
    return "\n".join(chunks)


def _link_entities(escaped_text: str, entities: list[str]) -> str:
    used: set[str] = set()
    out = escaped_text
    for name in entities:
        name = base.clean(name)
        if len(name) < 3 or name.lower() in catalog.ENTITY_STOP:
            continue
        key = name.lower()
        if key in used:
            continue
        pattern = re.compile(re.escape(html.escape(name, quote=False)), re.I)
        if not pattern.search(out):
            continue
        href = f"/blog/e/{catalog.slugify(name)}.html"
        out, n = pattern.subn(f'<a class="blog-body-link" href="{href}">{html.escape(name)}</a>', out, count=1)
        if n:
            used.add(key)
    return out


def _share_html(canonical: str, title: str) -> str:
    encoded = quote(canonical)
    text = quote(f"{title} — {canonical}")
    return (
        '<aside class="blog-share"><span>Compartilhar</span>'
        f'<a href="https://wa.me/?text={text}" target="_blank" rel="noopener">WhatsApp</a>'
        f'<a href="https://t.me/share/url?url={encoded}&text={quote(title)}" target="_blank" rel="noopener">Telegram</a>'
        f'<button type="button" data-copy-link="{base.esc(canonical)}">Copiar link</button>'
        "</aside>"
    )


def _collab_html(article: dict[str, Any], catalog_item: dict[str, Any] | None) -> str:
    seed = dict(catalog_item or {})
    seed["entities"] = article.get("entities") or seed.get("entities") or []
    seed["family"] = seed.get("family") or catalog.family_of(article)
    cta = catalog.collab_cta(seed)
    return (
        '<section class="blog-collab-strip">'
        "<h2>Você estava lá?</h2>"
        f'<p>{base.esc(cta["text"])}</p>'
        f'<p><a href="{base.esc(cta["href"])}">{base.esc(cta["label"])} →</a></p>'
        "</section>"
    )


def _store_rail_html(entities: list[str]) -> str:
    try:
        from editorial_blog_store import products_for_entities
        products = products_for_entities(entities, limit=3)
    except Exception:
        products = []
    if not products:
        return ""
    cards = "".join(
        f'<a class="blog-store-card" href="{base.esc(p["url"])}"><strong>{base.esc(p["name"])}</strong></a>'
        for p in products
    )
    return f'<div class="blog-store-rail"><span>Na Loja Passport</span>{cards}</div>'


def render_blog_article(
    article: dict[str, Any],
    url_path: str,
    related: list[dict[str, Any]],
    media: dict[str, Any],
    neighbors: dict[str, Any] | None = None,
    catalog_item: dict[str, Any] | None = None,
) -> str:
    public = constitution._public_article_copy(article)
    title = public["title"]
    desc = public.get("meta_description") or public["deck"]
    published = str(article.get("published_at") or "")[:10]
    modified = str(article.get("modified_at") or article.get("published_at") or published)[:10]
    canonical = SITE + url_path
    author = article.get("author") or PUBLIC_AUTHOR
    entities = [base.clean(x) for x in (article.get("entities") or []) if base.clean(x)]
    sections = []
    extras = list((media.get("photos") or [])[1:6])
    videos = list((media.get("videos") or [])[1:3])
    for idx, section in enumerate(public.get("sections") or []):
        heading = base.esc(section.get("heading"))
        body = _paragraphs_html(section, entities)
        extra = ""
        if idx == 1 and extras:
            photo = extras[0]
            extra = (
                f'<figure class="blog-photo"><img src="{base.esc(photo.get("url"))}" alt="{base.esc(photo.get("alt") or title)}" loading="lazy" width="1200" height="675">'
                f'<figcaption>{base.esc(photo.get("credit") or photo.get("alt") or "")}</figcaption></figure>'
            )
        if idx == 2 and videos:
            vid = videos[0]
            if vid.get("embed_url"):
                extra += (
                    f'<div class="blog-embed"><iframe src="{base.esc(vid["embed_url"])}" title="{base.esc(vid.get("title") or title)}" '
                    'loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe></div>'
                )
        sections.append(f"<h2>{heading}</h2>\n{body}{extra}")
    related_html = ""
    if related:
        cards = "".join(
            f'<a class="blog-related__card" href="{base.esc(i.get("url"))}"><small>{base.esc(i.get("family") or i.get("category") or "BLOG")}</small><strong>{base.esc(i.get("title"))}</strong></a>'
            for i in related if i.get("url") and i.get("url") != url_path
        )
        related_html = f'<section class="blog-related"><span>Continue no acervo</span><div>{cards}</div></section>'
    rail_cards = "".join(
        f'<a class="blog-related__card" href="{base.esc(i.get("url"))}"><strong>{base.esc(i.get("title"))}</strong></a>'
        for i in (related or [])[:4]
    )
    about = [{"@type": "Thing", "name": n} for n in entities[:8]]
    hero = (media.get("hero_photo") or {}).get("url") or ""
    image = SITE + hero if str(hero).startswith("/") else (hero or SITE + "/images/passport-radio-definitive.jpg")
    schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": title,
        "description": desc,
        "image": image,
        "author": {"@type": "Person" if author == "Mr. Nomad" else "Organization", "name": author},
        "publisher": {"@type": "Organization", "name": "Passport Radio", "logo": {"@type": "ImageObject", "url": SITE + "/images/passport-radio-definitive.jpg"}},
        "mainEntityOfPage": canonical,
        "datePublished": published,
        "dateModified": modified,
        "inLanguage": "pt-BR",
        "about": about,
        "isPartOf": {"@type": "Blog", "name": "Blog Passport Radio", "url": SITE + "/blog.html"},
    }
    stamp = dt.date.fromisoformat(published).strftime("%d %b %Y").upper() if published else ""
    hist = (catalog_item or {}).get("historical_period") or ""
    hist_html = f'<span class="blog-period">Época da história: {base.esc(hist)}</span>' if hist else ""
    media_html = _media_html(media, title)
    story_id = base.clean(article.get("story_angle_id") or article.get("story_id"))
    entity_chips = "".join(
        f'<a href="/blog/e/{catalog.slugify(n)}.html">{base.esc(n)}</a>'
        for n in entities[:10] if n.lower() not in catalog.ENTITY_STOP
    )
    nav = neighbors or {}
    prev_item, next_item = nav.get("prev"), nav.get("next")
    prevnext = '<nav class="blog-prevnext">'
    if prev_item:
        prevnext += f'<a rel="prev" href="{base.esc(prev_item.get("url"))}"><small>Anterior</small>{base.esc(prev_item.get("title"))}</a>'
    else:
        prevnext += "<span></span>"
    if next_item:
        prevnext += f'<a rel="next" href="{base.esc(next_item.get("url"))}"><small>Próxima</small>{base.esc(next_item.get("title"))}</a>'
    prevnext += "</nav>"
    crumbs = (
        '<nav class="blog-crumbs" aria-label="Trilha">'
        '<a href="/blog.html">Blog</a> · '
        f'<a href="/blog/arquivo/">{base.esc((catalog_item or {}).get("family") or "arquivo")}</a> · '
        f"<span>{base.esc(title)}</span></nav>"
    )
    fmt = base.esc(article.get("kicker") or "PASSPORT RADIO · BLOG")
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
<meta property="article:published_time" content="{base.esc(published)}"><meta property="article:modified_time" content="{base.esc(modified)}">
<meta property="article:author" content="{base.esc(author)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600;6..96,700&family=Instrument+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/editorial-engine.css?v=20260825">
<link rel="stylesheet" href="/css/passport-blog.css?v=20260918r">
<script type="application/ld+json">{json.dumps(schema, ensure_ascii=False)}</script>
</head>
<body class="pp-article pp-blog-article">
<div class="pe-topbar">PASSPORT RADIO · BLOG</div>
<header class="pe-header"><div class="pe-shell"><a class="pe-brand" href="/"><strong>PASSPORT RADIO</strong></a>
<form class="blog-search" role="search" method="get" action="/blog/busca.html">
<label class="blog-search__label" for="blog-q">Buscar no Blog</label>
<input id="blog-q" name="q" type="search" placeholder="Buscar no acervo" autocomplete="off">
<button type="submit">Buscar</button>
</form>
<nav><a href="/">AGORA</a><a href="/blog.html">BLOG</a><a href="/blog/arquivo/">ACERVO</a><a href="/radio.html">OUVIR</a><a href="/loja.html">LOJA</a></nav></div></header>
<main class="blog-layout">
<div>
{crumbs}
<section class="pe-hero"><div class="pe-shell">
<span class="pe-kicker">{fmt}</span>
<h1>{base.esc(title)}</h1>
<p>{base.esc(article.get("deck"))}</p>
<div class="pe-stamp"><b><a href="/blog/a/{catalog.slugify(author)}.html">{base.esc(author)}</a></b><span>Publicado {base.esc(stamp)}</span>{hist_html}</div>
</div></section>
<article class="pe-prose">
{media_html}
{''.join(sections)}
<div class="pe-closing"><small>PASSPORT RADIO · BLOG</small><p>{base.esc(article.get("closing"))}</p></div>
{_collab_html(article, catalog_item)}
{_share_html(canonical, title)}
<p class="blog-listen"><a href="/radio.html">OUVIR NA PASSPORT</a></p>
{prevnext}
</article>
{related_html}
<section class="passport-discussion" id="discussao" data-passport-discussion="live" data-story-url="{base.esc(url_path)}">
<h2>Discussão</h2>
<p class="blog-discussion__status">Carregando a conversa da Conta Passport…</p>
</section>
</div>
<aside class="blog-rail" aria-label="Neste acervo">
<span>Neste acervo</span>
<div class="blog-entities">{entity_chips}</div>
{_store_rail_html(entities)}
{rail_cards}
<p><a href="/blog/arquivo/">Arquivo completo →</a></p>
<p><a href="/blog/envie-sua-historia.html">Envie sua história →</a></p>
</aside>
</main>
<footer class="pp-footer"><div class="pp-footer-bottom">© 2026 Passport Radio · <a href="/privacidade.html">Política de Privacidade</a> · <a href="/termos.html">Termos de Uso</a> · <a href="/cookies.html">Política de Cookies</a></div></footer>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
<script src="/js/passport-blog-search.js?v=20260918r" defer></script>
<script src="/js/passport-blog-discussion.js?v=20260918r" defer></script>
<script>
document.addEventListener("click", function (ev) {{
  var btn = ev.target.closest("[data-copy-link]");
  if (!btn || !navigator.clipboard) return;
  navigator.clipboard.writeText(btn.getAttribute("data-copy-link")).then(function () {{
    btn.textContent = "Link copiado";
  }});
}});
</script>
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
    queue, drain_before = sync_hot_queue(queue, config)
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
        "drain": drain_before,
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
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
            report["skipped"].append({"title": title, "reason": "source_firewall_injection"})
            continue
        if len(pack.get("facts") or []) < int(config.get("minimum_fact_pack_facts", 2)):
            item["status"] = "skipped"
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
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
            item["status"] = "skipped"
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
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
                item["status"] = "queued"
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
        catalog_now = catalog.load_catalog()
        related = catalog.related_rank(
            {"url": url_path, "title": article["title"], "entities": article.get("entities") or [], "format": article.get("format"), "published_at": article["published_at"], "author": PUBLIC_AUTHOR},
            catalog_now + feed,
            limit=6,
        )
        related = [x for x in related if x.get("url") and x.get("url") not in {url_path, COVER_URL}]
        neighbors = catalog.neighbors({"url": url_path, "published_at": article["published_at"]}, catalog_now + [{"url": url_path, "title": article["title"], "published_at": article["published_at"]}])
        html_text = render_blog_article(article, url_path, related, media, neighbors)
        low_html = html_text.lower()
        if article.get("author") != "Mr. Nomad" and "mr. nomad" in low_html:
            item["status"] = "skipped"
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
            report["skipped"].append({"title": article["title"], "reason": "renderer_contract"})
            continue
        if "<audio" in low_html:
            item["status"] = "skipped"
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
            report["skipped"].append({"title": article["title"], "reason": "audio_embed"})
            continue
        if "noticias.html" in html_text:
            item["status"] = "skipped"
            discovery.mark_archive_status(item.get("urls") or [], "skipped")
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
        catalog.upsert_catalog({
            **public_item,
            "image_alt": (media.get("hero_photo") or {}).get("alt") or article["title"],
            "image_credit": (media.get("hero_photo") or {}).get("credit") or "",
            "has_video": bool(media.get("hero_video")),
            "has_image": bool(public_item.get("image")),
            "body_excerpt": article.get("deck") or "",
            "format_hint": item.get("format_hint") or "",
        })
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
    queue, drain_after = sync_hot_queue(queue, config)
    leftover_count = sum(1 for x in queue.get("items") or [] if x.get("status") == "queued")
    report["left_in_queue"] = leftover_count
    report["drain"] = drain_after
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
        surfaces = catalog.write_surfaces()
        report["catalog"] = surfaces
        ping = catalog.ping_indexnow(new_paths)
        report["indexnow"] = ping
        if "/blog.html" not in new_paths:
            new_paths.append("/blog.html")
        base.update_sitemap(ROOT, new_paths, day)
    save_json(output_dir / "engine-report.json", report)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return report


def rewrite_formulaic_published() -> dict[str, Any]:
    """Keep canonical URLs; replace formulaic titles/bodies from stored fact packs."""
    packs: dict[str, dict[str, Any]] = {}
    for path in (ROOT / "build" / "blog-tunnel").glob("fact-pack-*.json"):
        pack = load_json(path, {})
        angle = str(pack.get("story_angle_id") or "")
        if angle:
            packs[angle] = pack
    ledger_path = ROOT / "data/blog-published.json"
    feed_path = ROOT / "data/blog-feed.json"
    queue_path = ROOT / "data/blog-tunnel-queue.json"
    state = load_json(ledger_path, {"ledger": []})
    feed_payload = load_json(feed_path, {"items": []})
    queue = load_json(queue_path, {"items": []})
    catalog_now = catalog.load_catalog()
    by_url = {str(x.get("url")): x for x in catalog_now}
    rewritten = []
    provenance_urls: set[str] = set()
    for entry in state.get("ledger") or []:
        title = str(entry.get("title") or "")
        url_path = str(entry.get("url") or "")
        angle = str(entry.get("story_angle_id") or "")
        if not url_path or not angle or angle not in packs:
            continue
        generic = True  # always refresh published HTML from current writer + catalog links
        if not generic:
            continue
        pack = packs[angle]
        for prov in pack.get("provenance") or []:
            if prov.get("url"):
                provenance_urls.add(str(prov["url"]))
        signal = next((f.get("value") for f in pack.get("facts") or [] if f.get("type") == "signal_title"), title)
        summary = next((f.get("value") for f in pack.get("facts") or [] if f.get("type") == "signal_summary"), "")
        row = by_url.get(url_path) or {}
        candidate = {
            "title": signal,
            "description": summary,
            "format_hint": row.get("format_hint") or "news",
            "entities": [x for x in (entry.get("entities") or row.get("entities") or []) if str(x).lower() not in catalog.ENTITY_STOP],
            "url": next((p.get("url") for p in pack.get("provenance") or [] if p.get("url")), ""),
            "primary_category": pack.get("primary_category") or "music",
        }
        article = constitution.safe_article(write_from_fact_pack(candidate, pack), candidate)
        article["author"] = PUBLIC_AUTHOR
        article["published_at"] = entry.get("published_at") or article.get("published_at")
        article["story_angle_id"] = angle
        article["entities"] = candidate["entities"] or article.get("entities") or []
        media = {
            "photos": [{"url": row.get("image"), "alt": article["title"], "credit": row.get("image_credit")}] if row.get("image") else [],
            "videos": [],
            "hero_photo": {"url": row.get("image"), "alt": article["title"], "credit": row.get("image_credit")} if row.get("image") else {},
            "hero_video": {},
        }
        related = catalog.related_rank({"url": url_path, **article}, catalog_now, limit=6)
        neighbors = catalog.neighbors({"url": url_path, "published_at": article["published_at"]}, catalog_now)
        html_text = render_blog_article(article, url_path, related, media, neighbors, row)
        target = ROOT / url_path.lstrip("/")
        if target.exists():
            target.write_text(html_text, "utf-8")
        catalog.upsert_catalog({
            **row,
            "title": article["title"],
            "deck": article["deck"],
            "entities": article.get("entities") or [],
            "body_excerpt": article.get("deck") or "",
            "body_index": " ".join(
                (p.get("text") if isinstance(p, dict) else str(p))
                for s in (article.get("sections") or [])
                for p in (s.get("paragraphs") or [])
            )[:1200],
            "format_hint": candidate.get("format_hint") or row.get("format_hint") or "",
            "family": catalog.family_of({**row, "title": article["title"], "format_hint": candidate.get("format_hint")}),
        })
        entry["title"] = article["title"]
        entry["entities"] = article.get("entities") or []
        for item in feed_payload.get("items") or []:
            if item.get("url") == url_path:
                item["title"] = article["title"]
                item["deck"] = article["deck"]
                item["entities"] = article.get("entities") or []
        rewritten.append({"url": url_path, "title": article["title"]})
    for item in queue.get("items") or []:
        urls = set(item.get("urls") or [])
        if urls & provenance_urls or item.get("story_angle_id") in packs:
            if item.get("published_url") or (urls & provenance_urls):
                item["status"] = "published"
                if not item.get("published_url"):
                    match = next((e.get("url") for e in state.get("ledger") or [] if e.get("story_angle_id") == item.get("story_angle_id")), "")
                    if match:
                        item["published_url"] = match
    save_json(ledger_path, state)
    save_json(feed_path, feed_payload)
    save_json(queue_path, queue)
    surfaces = catalog.write_surfaces()
    return {"rewritten": rewritten, "surfaces": surfaces}


def main() -> int:
    ap = argparse.ArgumentParser(description="Passport Global Blog Tunnel™ V1")
    ap.add_argument("command", choices=["discover", "generate", "run", "archive-stats", "surfaces", "rewrite-formulaic"], nargs="?", default="run")
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
    if args.command == "rewrite-formulaic":
        print(json.dumps(rewrite_formulaic_published(), ensure_ascii=False, indent=2))
        return 0
    if args.command == "surfaces":
        catalog.seed_from_feed()
        print(json.dumps(catalog.write_surfaces(), ensure_ascii=False, indent=2))
        return 0
    if args.command in {"discover", "run"}:
        discover(Path(args.sources), out / "discovery", args.mode, args.max_age_hours, args.workers, config)
    if args.command in {"generate", "run"}:
        generate(args.max_generate, args.apply, out)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
