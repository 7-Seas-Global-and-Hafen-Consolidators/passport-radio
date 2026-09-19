#!/usr/bin/env python3
"""Publish newly materialized Passport Blog stories to the official Telegram channel."""
from __future__ import annotations
import argparse, html, json, os, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path

SITE = "https://passportradio.online"
API = "https://api.telegram.org"

def rows(path: Path):
    with path.open(encoding="utf-8") as fh:
        for line in fh:
            line=line.strip()
            if line:
                yield json.loads(line)

def load_state(path: Path) -> set[str]:
    if not path.exists(): return set()
    try: return set(json.loads(path.read_text("utf-8")).get("published", []))
    except Exception: return set()

def send(token: str, chat_id: str, title: str, url: str) -> None:
    tracked=url + ("&" if "?" in url else "?") + urllib.parse.urlencode({
        "utm_source":"telegram","utm_medium":"channel","utm_campaign":"editorial"
    })
    text=f"<b>{html.escape(title)}</b>\n\n{html.escape(tracked)}"
    data=urllib.parse.urlencode({
        "chat_id":chat_id,"text":text,"parse_mode":"HTML",
        "disable_web_page_preview":"false"
    }).encode()
    req=urllib.request.Request(f"{API}/bot{token}/sendMessage", data=data)
    with urllib.request.urlopen(req, timeout=20) as r:
        payload=json.load(r)
    if not payload.get("ok"):
        raise RuntimeError("Telegram rejected publication")

def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument("command", choices=["publish-new"])
    ap.add_argument("--catalog", required=True)
    ap.add_argument("--state", required=True)
    ap.add_argument("--git-range", required=True)
    args=ap.parse_args()
    token=os.environ.get("TELEGRAM_BOT_TOKEN","").strip()
    chat=os.environ.get("TELEGRAM_CHAT_ID","").strip()
    if not token or not chat:
        print("Telegram credentials absent; publisher armed but not firing.", file=sys.stderr)
        return 0
    state_path=Path(args.state); done=load_state(state_path)
    out=subprocess.check_output(["git","diff","--name-only",args.git_range,"--","blog/w/*.html"], text=True)
    changed={Path(x).stem for x in out.splitlines() if x.strip()}
    fresh=[]
    for row in rows(Path(args.catalog)):
        slug=str(row.get("slug") or row.get("id") or "").strip()
        title=str(row.get("title") or "").strip()
        raw_url=str(row.get("url") or "").strip()
        if not slug or not title or slug in done or slug not in changed: continue
        url=raw_url if raw_url.startswith("http") else SITE + (raw_url if raw_url.startswith("/") else "/blog/w/"+slug+".html")
        send(token, chat, title, url)
        done.add(slug); fresh.append(slug)
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps({"published":sorted(done)},ensure_ascii=False,indent=2)+"\n","utf-8")
    print(f"Telegram published: {len(fresh)}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
