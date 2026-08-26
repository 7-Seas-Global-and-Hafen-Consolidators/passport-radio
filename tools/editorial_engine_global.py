#!/usr/bin/env python3
"""Worldwide runtime for Passport Editorial Engine™.

Keeps the base engine's validation, deduplication, ledger, feed and source
firewall, while making the approved Global 1200 -> 800 operating limits
explicit and testable. Scheduled runs use 24-hour pacing; a manual force batch
is an explicit override only.
"""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import ssl
import unicodedata
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen

import editorial_engine as base

PUBLICATION_HARD_CAP = 800
RESERVOIR_HARD_CAP = 1200
MAX_BATCH_HARD_CAP = 10
NITRO_HARD_CAP = RESERVOIR_HARD_CAP
GLOBAL_ACCEPT_LANGUAGE = (
    "pt-BR,pt;q=1.0,en-US;q=0.95,en;q=0.95,es;q=0.9,fr;q=0.85,de;q=0.8,"
    "it;q=0.8,ja;q=0.75,ko;q=0.75,zh-CN;q=0.75,zh-TW;q=0.7,ar;q=0.7,"
    "tr;q=0.65,ru;q=0.65,*;q=0.2"
)


def tokens_unicode(value: str) -> set[str]:
    """Unicode-aware title tokens for multilingual deduplication."""
    normalized = unicodedata.normalize("NFKC", value or "").lower()
    words = re.findall(r"[^\W_]+", normalized, flags=re.UNICODE)
    return {word for word in words if len(word) >= 2 and word not in base.STOPWORDS}


def fetch_source_text_global(url: str, timeout: int = 15) -> str:
    """Fetch factual support text without preferring only pt/en responses."""
    if not url or urlparse(url).scheme not in {"http", "https"}:
        return ""
    req = Request(url, headers={
        "User-Agent": base.USER_AGENT,
        "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
        "Accept-Language": GLOBAL_ACCEPT_LANGUAGE,
    })
    ctx = ssl.create_default_context()
    try:
        with urlopen(req, timeout=timeout, context=ctx) as resp:
            ctype = (resp.headers.get("Content-Type") or "").lower()
            if "html" not in ctype:
                return ""
            raw = resp.read(base.MAX_SOURCE_BYTES)
            charset = resp.headers.get_content_charset() or "utf-8"
            body = raw.decode(charset, errors="replace")
        parser = base.VisibleTextParser()
        parser.feed(body)
        return parser.result()
    except Exception:
        return ""


def configure_base() -> None:
    """Install only multilingual helpers; no bytecode or HTML post-processing."""
    base.tokens = tokens_unicode
    base.fetch_source_text = fetch_source_text_global


def validate_operating_limits(target: int, capacity: int, max_batch: int, force_batch: int) -> None:
    if target < 1 or target > PUBLICATION_HARD_CAP:
        raise SystemExit(f"daily_target must be 1..{PUBLICATION_HARD_CAP}; got {target}")
    if capacity < target or capacity > RESERVOIR_HARD_CAP:
        raise SystemExit(
            f"capacity must be >= target and <= {RESERVOIR_HARD_CAP}; got target={target} capacity={capacity}"
        )
    if max_batch < 1 or max_batch > MAX_BATCH_HARD_CAP:
        raise SystemExit(f"max_batch must be 1..{MAX_BATCH_HARD_CAP}; got {max_batch}")
    if force_batch < -1 or force_batch > MAX_BATCH_HARD_CAP:
        raise SystemExit(f"force_batch must be -1..{MAX_BATCH_HARD_CAP}; got {force_batch}")


def compute_batch(
    target: int,
    capacity: int,
    already_today: int,
    max_batch: int,
    force_batch: int = -1,
) -> int:
    """Return this cycle's batch, preserving pacing and both hard stops."""
    if force_batch >= 0:
        batch_size = min(force_batch, max_batch, capacity - already_today)
    else:
        batch_size = base.desired_batch(target, already_today, max_batch)
    return max(0, min(batch_size, target - already_today, capacity - already_today))


def main() -> int:
    configure_base()

    ap = argparse.ArgumentParser()
    ap.add_argument("--queue", required=True)
    ap.add_argument("--config", default=str(base.ROOT / "data/editorial-engine.json"))
    ap.add_argument("--state", default=str(base.ROOT / "data/editorial-published.json"))
    ap.add_argument("--feed", default=str(base.ROOT / "data/editorial-feed.json"))
    ap.add_argument("--output-dir", default=str(base.ROOT / "build/editorial-engine"))
    ap.add_argument("--daily-target", type=int, default=0)
    ap.add_argument("--capacity", type=int, default=0)
    ap.add_argument("--max-batch", type=int, default=0)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--force-batch", type=int, default=-1, help="-1 uses 24h pacing; 0-10 is a manual override")
    args = ap.parse_args()

    config = base.load_json(Path(args.config), {})
    target = args.daily_target or int(config.get("daily_target", 800))
    capacity = args.capacity or int(config.get("daily_capacity", 1200))
    max_batch = args.max_batch or int(config.get("max_batch", 10))
    validate_operating_limits(target, capacity, max_batch, args.force_batch)

    queue = base.load_json(Path(args.queue), {})
    selected = queue.get("selected", []) if isinstance(queue, dict) else []
    state_path = Path(args.state)
    feed_path = Path(args.feed)
    state = base.load_json(state_path, {"version": 1, "ledger": []})
    ledger: list[dict[str, Any]] = state.get("ledger", []) if isinstance(state, dict) else []
    feed_payload = base.load_json(feed_path, {"version": 1, "items": []})
    feed: list[dict[str, Any]] = feed_payload.get("items", []) if isinstance(feed_payload, dict) else []

    today = base.now_sp().date().isoformat()
    already_today = sum(1 for item in ledger if str(item.get("published_at", "")).startswith(today))
    batch_size = compute_batch(target, capacity, already_today, max_batch, args.force_batch)

    out = Path(args.output_dir)
    out.mkdir(parents=True, exist_ok=True)
    report: dict[str, Any] = {
        "generated_at": base.now_sp().isoformat(),
        "daily_target": target,
        "daily_capacity": capacity,
        "already_today": already_today,
        "requested_batch": batch_size,
        "queue_size": len(selected),
        "applied": bool(args.apply),
        "generated": [],
        "skipped": [],
        "status": "ok",
    }

    if batch_size <= 0:
        report["status"] = "on_pace"
        base.save_json(out / "engine-report.json", report)
        print(json.dumps(report, ensure_ascii=False))
        return 0

    if not os.environ.get("OPENAI_API_KEY", "").strip():
        report["status"] = "awaiting_openai_api_key"
        report["candidates"] = [
            {
                "title": base.clean(candidate.get("title")),
                "category": candidate.get("primary_category"),
                "score": candidate.get("total_score"),
            }
            for candidate in base.choose_candidates(selected, ledger, batch_size, config)
        ]
        base.save_json(out / "engine-report.json", report)
        print(json.dumps(report, ensure_ascii=False))
        return 0

    candidates = base.choose_candidates(selected, ledger, max(batch_size * 3, batch_size), config)
    new_paths: list[str] = []
    generated_articles: list[dict[str, Any]] = []

    for candidate in candidates:
        if len(generated_articles) >= batch_size:
            break
        try:
            context = base.fetch_source_text(str(candidate.get("url", "")))
            article = base.safe_article(base.call_openai(candidate, context, config), candidate)
            if base.too_similar(
                article["title"], article["event_key"], ledger, int(config.get("cooldown_days", 45))
            ):
                report["skipped"].append({"title": article["title"], "reason": "duplicate_after_generation"})
                continue
            errors = base.validate_article(article, candidate, config)
            if errors:
                report["skipped"].append({
                    "title": article.get("title") or base.clean(candidate.get("title")),
                    "reason": "; ".join(errors),
                })
                continue

            stamp = base.now_sp()
            article["published_at"] = stamp.isoformat()
            date_path = stamp.strftime("%Y/%m/%d")
            slug = base.slugify(article["title"])
            url_path = f"/editorial/{date_path}/{slug}.html"
            rel = Path(url_path.lstrip("/"))
            related = base.related_items(article, feed)
            html_text = base.render_article(article, url_path, related)
            (out / rel).parent.mkdir(parents=True, exist_ok=True)
            (out / rel).write_text(html_text, "utf-8")
            if args.apply:
                target_path = base.ROOT / rel
                target_path.parent.mkdir(parents=True, exist_ok=True)
                target_path.write_text(html_text, "utf-8")

            item = base.public_feed_item(article, url_path)
            feed.insert(0, item)
            feed = feed[:int(config.get("feed_size", 500))]
            entry = {
                "title": article["title"],
                "url": url_path,
                "published_at": article["published_at"],
                "category": article["category"],
                "format": article["format"],
                "entities": article.get("entities", [])[:10],
                "event_key": article["event_key"],
                "fingerprint": base.fingerprint(article["title"]),
                "source_hash": base.source_hash(str(candidate.get("url", ""))),
            }
            ledger.append(entry)
            new_paths.append(url_path)
            generated_articles.append(item)
            report["generated"].append({
                "title": article["title"],
                "url": url_path,
                "format": article["format"],
                "category": article["category"],
            })
        except Exception as exc:
            report["skipped"].append({
                "title": base.clean(candidate.get("title")),
                "reason": f"generation_error: {type(exc).__name__}: {exc}",
            })

    ledger = ledger[-int(config.get("ledger_size", 20000)):]
    state = {
        "version": 1,
        "updated_at": base.now_sp().isoformat(),
        "daily_capacity": capacity,
        "ledger": ledger,
    }
    feed_payload = {
        "version": 1,
        "updated_at": base.now_sp().isoformat(),
        "author": base.PUBLIC_AUTHOR,
        "items": feed,
    }

    base.save_json(out / "editorial-published.next.json", state)
    base.save_json(out / "editorial-feed.next.json", feed_payload)
    if args.apply and generated_articles:
        base.save_json(state_path, state)
        base.save_json(feed_path, feed_payload)
        base.update_sitemap(base.ROOT, new_paths, today)
        base.install_home_hook(base.ROOT)

    report["published_today_after"] = already_today + len(generated_articles)
    report["status"] = "generated" if generated_articles else "no_valid_articles"
    base.save_json(out / "engine-report.json", report)
    print(json.dumps(report, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
