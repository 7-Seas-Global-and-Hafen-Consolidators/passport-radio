#!/usr/bin/env python3
"""Deterministic, fail-closed runner for Passport Newsroom safety canaries."""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
import editorial_story_enricher as enricher  # noqa: E402

MAX_CASES = 5
URL_RE = re.compile(r"^/editorial/.+\.html$")
EXPECTED = {"EMBED", "NO_VIDEO"}


def git_blob_sha(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def canonical_hash(obj: object) -> str:
    raw = json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()


def abort(message: str) -> None:
    raise SystemExit(f"CANARY_ABORT: {message}")


def load_and_validate(manifest_path: Path, feed_path: Path):
    if not manifest_path.is_file() or ROOT not in manifest_path.resolve().parents:
        abort("manifest must be a committed repository file")
    manifest = json.loads(manifest_path.read_text("utf-8"))
    cases = manifest.get("cases")
    if not isinstance(cases, list) or not 1 <= len(cases) <= MAX_CASES:
        abort("manifest must contain 1..5 cases")
    urls = [str(c.get("url") or "") for c in cases]
    if len(set(urls)) != len(urls):
        abort("duplicate canary URL")
    for case in cases:
        url = str(case.get("url") or "")
        if not URL_RE.fullmatch(url) or "*" in url:
            abort(f"invalid exact editorial URL: {url}")
        if case.get("expected") not in EXPECTED:
            abort(f"invalid expected outcome for {url}")
        if case.get("expected") == "EMBED" and not re.fullmatch(r"[A-Za-z0-9_-]{11}", str(case.get("expected_video_id") or "")):
            abort(f"EMBED case requires exact expected_video_id: {url}")
    feed_bytes = feed_path.read_bytes()
    actual_blob = git_blob_sha(feed_bytes)
    if manifest.get("feed_snapshot_hash") != actual_blob:
        abort(f"feed snapshot mismatch: expected {manifest.get('feed_snapshot_hash')} got {actual_blob}")
    feed = json.loads(feed_bytes.decode("utf-8"))
    items = feed if isinstance(feed, list) else feed.get("items", [])
    by_url = {str(i.get("url") or ""): i for i in items}
    missing = [u for u in urls if u not in by_url]
    if missing:
        abort("URL absent from frozen feed: " + ", ".join(missing))
    for url in urls:
        if not (ROOT / url.lstrip("/")).is_file():
            abort(f"article file absent: {url}")
    return manifest, cases, by_url, actual_blob


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--feed", default="data/editorial-feed.json")
    ap.add_argument("--run-id", default="local")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--validate-only", action="store_true")
    args = ap.parse_args()
    manifest_path = (ROOT / args.manifest).resolve()
    feed_path = (ROOT / args.feed).resolve()
    manifest, cases, by_url, feed_hash = load_and_validate(manifest_path, feed_path)
    manifest_hash = canonical_hash(manifest)
    if args.validate_only:
        print(json.dumps({"status":"valid","cases":len(cases),"manifest_hash":manifest_hash,"feed_snapshot_hash":feed_hash}))
        return 0

    audit = enricher.audit_path(args.run_id)
    audit.parent.mkdir(parents=True, exist_ok=True)
    with audit.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps({"record":"CANARY_MANIFEST","run_id":args.run_id,"manifest":str(manifest_path.relative_to(ROOT)),"manifest_hash":manifest_hash,"feed_snapshot_hash":feed_hash,"cases":cases}, ensure_ascii=False) + "\n")

    results = []
    for case in cases:
        url = case["url"]
        item = by_url[url]
        changed, outcome = enricher.enrich_page(ROOT / url.lstrip("/"), item, args.run_id, args.dry_run)
        observed = "EMBED" if outcome in {"EMBED", "DRY_RUN_EMBED"} else outcome
        selected = None
        lines = audit.read_text("utf-8").splitlines()
        for line in reversed(lines):
            rec = json.loads(line)
            if rec.get("article") == url:
                selected = rec.get("selected_video")
                break
        passed = observed == case["expected"]
        if case["expected"] == "EMBED":
            passed = passed and selected == case["expected_video_id"]
        results.append({"url":url,"expected":case["expected"],"expected_video_id":case.get("expected_video_id"),"observed":observed,"selected_video":selected,"pass":passed})

    summary = {"status":"PASS" if all(r["pass"] for r in results) else "FAIL","mode":"deterministic-canary","manifest_hash":manifest_hash,"feed_snapshot_hash":feed_hash,"results":results,"audit":str(audit.relative_to(ROOT))}
    print(json.dumps(summary, ensure_ascii=False))
    return 0 if summary["status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
