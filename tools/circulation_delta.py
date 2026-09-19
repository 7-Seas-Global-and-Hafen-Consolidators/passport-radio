#!/usr/bin/env python3
"""Build a durable circulation delta from every Blog article revision since the last processed commit."""
from __future__ import annotations
import argparse, hashlib, json, subprocess
from pathlib import Path

def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], text=True).strip()

def load(path: Path) -> dict:
    try: return json.loads(path.read_text("utf-8"))
    except Exception: return {}

def main() -> int:
    ap=argparse.ArgumentParser()
    ap.add_argument("--state", required=True)
    ap.add_argument("--output", required=True)
    args=ap.parse_args()
    state_path=Path(args.state); state=load(state_path)
    head=git("rev-parse","HEAD")
    cursor=str(state.get("cursor") or "").strip()
    if cursor:
        try: git("cat-file","-e",cursor+"^{commit}")
        except subprocess.CalledProcessError: cursor=""
    if cursor:
        names=git("diff","--name-only",cursor+".."+head,"--","blog/w/*.html").splitlines()
    else:
        # First activation: circulate the current materialized corpus once.
        names=git("ls-files","blog/w/*.html").splitlines()
    items=[]
    for name in sorted(set(x.strip() for x in names if x.strip())):
        p=Path(name)
        if not p.exists(): continue
        body=p.read_bytes()
        items.append({
            "slug":p.stem,
            "path":name,
            "revision":hashlib.sha256(body).hexdigest()[:20],
        })
    Path(args.output).parent.mkdir(parents=True,exist_ok=True)
    Path(args.output).write_text(json.dumps({"from":cursor or None,"to":head,"items":items},indent=2)+"\n","utf-8")
    print(f"Circulation delta: {len(items)} article revisions ({cursor or 'bootstrap'}..{head})")
    return 0
if __name__=="__main__": raise SystemExit(main())
