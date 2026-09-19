#!/usr/bin/env python3
"""Queue new/revitalized Passport Blog stories for the local WhatsApp Channel bridge."""
from __future__ import annotations
import argparse, json, urllib.parse
from pathlib import Path

SITE = "https://passportradio.online"

def rows(path: Path):
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line=line.strip()
            if line:
                yield json.loads(line)

def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument("command", choices=["queue-changed"])
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--outbox", required=True)
    ap.add_argument("--delta", required=True)
    args=ap.parse_args()

    delta=json.loads(Path(args.delta).read_text("utf-8"))
    revisions={
        str(item.get("slug") or "").strip(): str(item.get("revision") or "").strip()
        for item in delta.get("items", [])
        if str(item.get("slug") or "").strip() and str(item.get("revision") or "").strip()
    }

    catalog={}
    for row in rows(Path(args.catalog)):
        slug=str(row.get("slug") or row.get("id") or "").strip()
        if slug:
            catalog[slug]=row

    path=Path(args.outbox)
    try:
        existing=json.loads(path.read_text("utf-8")).get("items", [])
    except Exception:
        existing=[]
    by_id={str(item.get("id")):item for item in existing if item.get("id")}

    for slug in sorted(revisions):
        row=catalog.get(slug)
        if not row:
            continue
        title=str(row.get("title") or "").strip()
        if not title:
            continue
        raw_url=str(row.get("url") or "").strip()
        url=raw_url if raw_url.startswith("http") else SITE + (
            raw_url if raw_url.startswith("/") else "/blog/w/"+slug+".html"
        )
        tracked=url + ("&" if "?" in url else "?") + urllib.parse.urlencode({
            "utm_source":"whatsapp",
            "utm_medium":"channel",
            "utm_campaign":"editorial",
        })
        item_id=f"{slug}@{revisions[slug]}"
        by_id[item_id]={
            "id":item_id,
            "title":title,
            "url":tracked,
            "text":f"{title}\n\n{tracked}",
            "source":"blog-change",
        }

    queued=list(by_id.values())
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps({"version":1,"items":queued},ensure_ascii=False,indent=2)+"\n","utf-8")
    print(f"WhatsApp Channel outbox: {len(queued)} durable items ({len(revisions)} revisions in delta)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
