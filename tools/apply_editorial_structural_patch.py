#!/usr/bin/env python3
"""One-shot structural migration for Operation Global 1200/800.

This script is intentionally strict: every replacement must match exactly once.
It only touches the three editorial Python files named by the operation.
"""
from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f"{label}: expected exactly one match, found {count}")
    return text.replace(old, new, 1)


root = Path(__file__).resolve().parents[1]

# --- Base Editorial Engine: make the approved limits and renderer native. ---
engine_path = root / "tools/editorial_engine.py"
engine = engine_path.read_text("utf-8")
engine = replace_once(
    engine,
    "MAX_SOURCE_CHARS = 18_000\n",
    "MAX_SOURCE_CHARS = 18_000\n"
    "PUBLICATION_HARD_CAP = 800\n"
    "RESERVOIR_HARD_CAP = 1200\n"
    "MAX_BATCH_HARD_CAP = 10\n"
    "GLOBAL_ACCEPT_LANGUAGE = (\n"
    "    \"pt-BR,pt;q=1.0,en-US;q=0.95,en;q=0.95,es;q=0.9,fr;q=0.85,de;q=0.8,\"\n"
    "    \"it;q=0.8,ja;q=0.75,ko;q=0.75,zh-CN;q=0.75,zh-TW;q=0.7,ar;q=0.7,\"\n"
    "    \"tr;q=0.65,ru;q=0.65,*;q=0.2\"\n"
    ")\n",
    "engine constants",
)
engine = replace_once(
    engine,
    'def tokens(value: str) -> set[str]:\n    words = re.findall(r"[a-z0-9]{3,}", norm_ascii(value))\n    return {w for w in words if w not in STOPWORDS}\n',
    'def tokens(value: str) -> set[str]:\n    normalized = unicodedata.normalize("NFKC", value or "").lower()\n    words = re.findall(r"[^\\W_]+", normalized, flags=re.UNICODE)\n    return {w for w in words if len(w) >= 2 and w not in STOPWORDS}\n',
    "engine unicode tokens",
)
engine = replace_once(
    engine,
    '"Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.7,en;q=0.6",',
    '"Accept-Language": GLOBAL_ACCEPT_LANGUAGE,',
    "engine accept-language",
)
engine = replace_once(
    engine,
    "<div class=\"pe-closing\"><small>PASSPORT RADIO · EDITORIAL</small><p>{esc(article.get('closing'))}</p></div></article><aside",
    "<div class=\"pe-closing\"><small>PASSPORT RADIO · EDITORIAL</small><p>{esc(article.get('closing'))}</p></div>"
    "<div class=\"pe-closing pe-nomad-signature\"><small>— MR. NOMAD</small><p>Every Song Is A Destination. Aguardo meus Nômades na Passport Radio.</p></div>"
    "</article><aside",
    "native Mr Nomad renderer",
)
engine = replace_once(
    engine,
    'ap.add_argument("--force-batch", type=int, default=-1, help="manual override; 0 means no generation")',
    'ap.add_argument("--force-batch", type=int, default=-1, help="-1 uses 24h pacing; 0-10 is a manual override")',
    "engine force help",
)
engine = replace_once(
    engine,
    '    if target < 1 or target > capacity or capacity > 200:\n        raise SystemExit(f"invalid target/capacity: target={target} capacity={capacity}; hard cap is 200/day")\n',
    '    if target < 1 or target > PUBLICATION_HARD_CAP or target > capacity or capacity < 1 or capacity > RESERVOIR_HARD_CAP:\n'
    '        raise SystemExit(\n'
    '            f"invalid target/capacity: target={target} capacity={capacity}; "\n'
    '            f"public hard stop is {PUBLICATION_HARD_CAP}/day and reservoir hard cap is {RESERVOIR_HARD_CAP}/day"\n'
    '        )\n'
    '    if max_batch < 1 or max_batch > MAX_BATCH_HARD_CAP:\n'
    '        raise SystemExit(f"invalid max_batch={max_batch}; hard cap is {MAX_BATCH_HARD_CAP}/cycle")\n'
    '    if args.force_batch < -1 or args.force_batch > MAX_BATCH_HARD_CAP:\n'
    '        raise SystemExit(f"invalid force_batch={args.force_batch}; expected -1..{MAX_BATCH_HARD_CAP}")\n',
    "engine native hard caps",
)
engine_path.write_text(engine, "utf-8")

# --- Base Tunnel: remove the old 50/10/16/120 clamps structurally. ---
tunnel_path = root / "tools/editorial_tunnel.py"
tunnel = tunnel_path.read_text("utf-8")
tunnel = replace_once(
    tunnel,
    "- selects a balanced Top 20 editorial queue;",
    "- selects a balanced worldwide editorial reservoir;",
    "tunnel doc",
)
tunnel = replace_once(
    tunnel,
    "DEFAULT_TIMEOUT = 12\n",
    "DEFAULT_TIMEOUT = 12\n"
    "DAILY_RESERVOIR_HARD_CAP = 1200\n"
    "PER_SOURCE_HARD_CAP = 24\n"
    "WORKERS_HARD_CAP = 32\n"
    "RADAR_HARD_CAP = 2400\n"
    "GLOBAL_ACCEPT_LANGUAGE = (\n"
    "    \"pt-BR,pt;q=1.0,en-US;q=0.95,en;q=0.95,es;q=0.9,fr;q=0.85,de;q=0.8,\"\n"
    "    \"it;q=0.8,ja;q=0.75,ko;q=0.75,zh-CN;q=0.75,zh-TW;q=0.7,ar;q=0.7,\"\n"
    "    \"tr;q=0.65,ru;q=0.65,*;q=0.2\"\n"
    ")\n",
    "tunnel constants",
)
tunnel = replace_once(
    tunnel,
    '"Accept-Language": "en-US,en;q=0.8,pt-BR;q=0.7,pt;q=0.6",',
    '"Accept-Language": GLOBAL_ACCEPT_LANGUAGE,',
    "tunnel accept-language",
)
tunnel = replace_once(tunnel, "per_source = max(1, min(10, args.per_source))", "per_source = max(1, min(PER_SOURCE_HARD_CAP, args.per_source))", "per-source cap")
tunnel = replace_once(tunnel, "worker_count = max(1, min(16, args.workers))", "worker_count = max(1, min(WORKERS_HARD_CAP, args.workers))", "worker cap")
tunnel = replace_once(tunnel, "selected = choose_daily(clustered, max(1, min(50, args.daily_limit)))", "selected = choose_daily(clustered, max(1, min(DAILY_RESERVOIR_HARD_CAP, args.daily_limit)))", "reservoir cap")
tunnel = replace_once(tunnel, '"items": [article_to_dict(a) for a in clustered[:120]],', '"items": [article_to_dict(a) for a in clustered[:RADAR_HARD_CAP]],', "radar cap")
tunnel = replace_once(tunnel, '"target": args.daily_limit,', '"target": max(1, min(DAILY_RESERVOIR_HARD_CAP, args.daily_limit)),', "reported target")
tunnel_path.write_text(tunnel, "utf-8")

# --- Global Tunnel: base limits are now native; delete bytecode mutation. ---
global_path = root / "tools/editorial_tunnel_global.py"
global_text = global_path.read_text("utf-8")
start = global_text.find("\ndef raise_base_limits() -> None:\n")
end_marker = "\n\nraise_base_limits()\n"
end = global_text.find(end_marker, start)
if start < 0 or end < 0:
    raise RuntimeError("global tunnel bytecode patch block not found")
global_text = global_text[:start] + "\n" + global_text[end + len(end_marker):]
global_path.write_text(global_text, "utf-8")

print("Structural editorial patch applied successfully")
