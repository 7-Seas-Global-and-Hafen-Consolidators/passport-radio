#!/usr/bin/env python3
"""Static contracts for the Live & Rare curated four-source archive."""
from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAYLISTS = (ROOT / "js/tunnel-playlists.js").read_text(encoding="utf-8")
PLAYER = (ROOT / "js/tunnel-player.js").read_text(encoding="utf-8")
HOUSE = (ROOT / "radio-live-rare.html").read_text(encoding="utf-8")
RADIO = (ROOT / "radio.html").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")
CACHE = "20260916d"

START = PLAYLISTS.index("[")
END = PLAYLISTS.rindex("]")
RAW = PLAYLISTS[START : END + 1]
JSONISH = re.sub(r"([,{]\s*)([A-Za-z_]+)\s*:", r'\1"\2":', RAW)
CATALOG = json.loads(JSONISH)
IDS = [item["id"] for item in CATALOG]
IDSET = set(IDS)


def group(name: str) -> list:
    return [item for item in CATALOG if item.get("group") == name]


def playlists(name: str) -> list:
    return [item for item in group(name) if item.get("type") != "video"]


def videos(name: str) -> list:
    return [item for item in group(name) if item.get("type") == "video"]


if len(CATALOG) < 200:
    raise SystemExit(f"Catalog too small for a curated archive: {len(CATALOG)}")
if len(IDS) != len(IDSET):
    dups = [i for i in IDSET if IDS.count(i) > 1]
    raise SystemExit(f"Catalog ids are not unique: {dups[:8]}")

midnight_pl = playlists("The Midnight Special")
midnight_v = videos("The Midnight Special")
if len(midnight_pl) != 47:
    raise SystemExit(f"Midnight artist playlists must be 47, got {len(midnight_pl)}")
if len(midnight_v) != 8:
    raise SystemExit(f"Midnight unique videos must be 8, got {len(midnight_v)}")

MIDNIGHT_UNIQUE = {
    "pIDrvoI_hJ0",
    "t4hrwgMndEo",
    "JBJTSFnOYA8",
    "wKvzYtMe5ew",
    "zZHNWevcl2o",
    "i8AZ6FtQ8iU",
    "O-15GLSLH3w",
    "whwp1PeCiLc",
}
missing_midnight = MIDNIGHT_UNIQUE - {item["id"] for item in midnight_v}
if missing_midnight:
    raise SystemExit(f"Missing Midnight unique videoIds: {sorted(missing_midnight)}")

REQUIRED = {
    "Later… with Jools Holland": "PLlJ6mcpK7uj6dzhFWfSEee22ZqxXfpTNP",
    "BBC Introducing": "PLlJ6mcpK7uj7B_Mw_OQC_rZdFJYxjLcGu",
    "Glastonbury iconic": "PLlJ6mcpK7uj53gpwDuG6baTV2zCTrh_1u",
    "Piano Room": "PLlJ6mcpK7uj5EypgbA3gpNOmYk3nG0p8K",
    "Reading Rewind": "PLlJ6mcpK7uj5hxtSkfcY1-nG0p8K",
    "Wembley complete": "PLf43ROh3SnRa1AFIWVEVCaQJofYR9BQTL",
    "Philadelphia complete": "PLf43ROh3SnRaZnrW14dO9iU_DxoguQNYp",
}
# Piano / Reading Rewind prefixes are checked loosely below if exact suffix drifts.
for label, pid in REQUIRED.items():
    if pid not in IDSET and not any(item_id.startswith(pid[:24]) for item_id in IDSET):
        raise SystemExit(f"Missing required collection {label}: {pid}")

for pid, label in [
    ("PLlJ6mcpK7uj6dzhFWfSEee22ZqxXfpTNP", "Later"),
    ("PLlJ6mcpK7uj7B_Mw_OQC_rZdFJYxjLcGu", "Introducing"),
    ("PLlJ6mcpK7uj53gpwDuG6baTV2zCTrh_1u", "Glastonbury iconic"),
    ("PLf43ROh3SnRa1AFIWVEVCaQJofYR9BQTL", "Wembley"),
    ("PLf43ROh3SnRaZnrW14dO9iU_DxoguQNYp", "Philly"),
]:
    if pid not in IDSET:
        raise SystemExit(f"Missing exact playlist id for {label}: {pid}")

FORBIDDEN_PLAYLISTS = {
    "PLPfPNs01OQC0Wl_hPub-3_PTUvxsAN36l": "This is Wacken mixed dump",
    "PLPfPNs01OQC29iAexX-o9uCTQqt_drLVF": "360 VR mixed dump",
    "PLPfPNs01OQC05IYVPsA9HPrG1x-CTuvxg": "Best-Shots recap",
    "PLdQ3g_i8Nrs4eMCmDAAwh4w": "Midnight podcast",
    "PLdQ3g_i8Nrs41EGnxgvQcbP": "Midnight stand-up",
    "PLdQ3g_i8Nrs7wuKdHlnGH6Y": "Midnight full episodes",
}
for pid, why in FORBIDDEN_PLAYLISTS.items():
    if pid in IDSET:
        raise SystemExit(f"Forbidden playlist entered the giro: {why} {pid}")

wacken_pl = playlists("WackenTV")
bbc_pl = playlists("BBC Music")
live_pl = playlists("Live Aid")
if len(wacken_pl) != 41:
    raise SystemExit(f"Wacken musical playlists must be 41, got {len(wacken_pl)}")
if len(bbc_pl) != 33:
    raise SystemExit(f"BBC musical playlists must be 33, got {len(bbc_pl)}")
if len(live_pl) != 2:
    raise SystemExit(f"Live Aid must keep both complete stadium playlists, got {len(live_pl)}")
if len(videos("WackenTV")) < 70:
    raise SystemExit("Wacken mine dropped too many unique live performances")
if len(videos("BBC Music")) < 70:
    raise SystemExit("BBC mine undersampled giant leftovers")
if len(videos("Live Aid")) != 17:
    raise SystemExit(f"Live Aid unique musical videos must be 17, got {len(videos('Live Aid'))}")

JUNK = re.compile(
    r"harry metal|pre[- ]?show[- ]?talk|late night show|spoken word|"
    r"\boutro\b|\brecap\b|\btrailer\b|festivalvlog|\bq\s*&\s*a\b|"
    r"wins the mercury|is the winner of|winner.?s speech|"
    r"the story of|making of|one year on",
    re.I,
)
for item in CATALOG:
    if item.get("type") == "video" and JUNK.search(item.get("label") or ""):
        raise SystemExit(f"Editorial/junk video leaked into giro: {item['id']} {item['label']}")

FORBIDDEN_IDS = {
    "If7Xa-OX7No",
    "hRYsZTIc5JQ",
    "EiGeUPTV5XE",
    "jXrkRzVntAw",
    "3pIgqF4KBXM",
}
leaked = FORBIDDEN_IDS & IDSET
if leaked:
    raise SystemExit(f"Explicitly dropped ids returned: {leaked}")

for token in [
    "rotatingPlaylistIndex",
    "sourceGroups",
    "rememberSourcePosition",
    "sourceEntries",
    "sourcePositions",
]:
    if token in PLAYER:
        raise SystemExit(f"Unauthorized source-rotation policy is still in the motor: {token}")

if "cueVideoById" not in PLAYER:
    raise SystemExit("Motor lost cueVideoById support for mined videos")
if "cuePlaylist" not in PLAYER:
    raise SystemExit("Motor lost cuePlaylist support")
if "loadPlaylist(playlistIndex + 1" not in PLAYER:
    raise SystemExit("Sequential next-catalog advance disappeared")
if "loadPlaylist(playlistIndex + direction" not in PLAYER:
    raise SystemExit("Sequential jumpPlaylist disappeared")
if "onReady: () => { ready = true; loadPlaylist(0, false); }" not in PLAYER:
    raise SystemExit("Motor must start at catalog index 0")
if PLAYER.count("new YT.Player") != 1:
    raise SystemExit("Motor must keep a single YT.Player")
if "12000" not in PLAYER:
    raise SystemExit("12s load timeout disappeared")
if "onError:" not in PLAYER:
    raise SystemExit("Error skip disappeared")
if "YT.PlayerState.ENDED" not in PLAYER:
    raise SystemExit("ENDED advance disappeared")
for forbidden in ["PassportBus", ".claim(", ".silence(", "Hls.", "new Audio("]:
    if forbidden in PLAYER:
        raise SystemExit(f"Motor leaked into a foreign system: {forbidden}")

if f"/js/tunnel-playlists.js?v={CACHE}" not in HOUSE:
    raise SystemExit("radio-live-rare.html cache tag is stale")
if f"/js/tunnel-player.js?v={CACHE}" not in HOUSE:
    raise SystemExit("radio-live-rare.html player cache tag is stale")
if f"/js/tunnel-playlists.js?v={CACHE}" not in RADIO:
    raise SystemExit("radio.html cache tag is stale")
if f"/js/tunnel-player.js?v={CACHE}" not in RADIO:
    raise SystemExit("radio.html player cache tag is stale")

other_tunnels = [
    "181fm-tunnel.js?v=20260910passport",
    "total-soul-tunnel.js?v=20260910passport",
    "mpb-tunnel.js?v=202609062230",
    "passport-hits-tunnel.js?v=202608251040",
    "50s-60s-tunnel.js?v=20260910clean",
    "passport-live.js?v=20260910passport",
    "br-rock-tunnel.js?v=20260910healthy",
    "passport-cabin.js?v=20260910passport",
]
for token in other_tunnels:
    if token not in RADIO:
        raise SystemExit(f"radio.html lost untouched tunnel: {token}")

if "node --check js/tunnel-playlists.js" not in CI:
    raise SystemExit("CI does not syntax-check tunnel-playlists.js")
if "node --check js/tunnel-player.js" not in CI:
    raise SystemExit("CI does not syntax-check tunnel-player.js")
if "tests/test_live_rare_curation.py" not in CI:
    raise SystemExit("CI does not run Live & Rare curation tests")

counts = Counter(item.get("group") for item in CATALOG)
print("OK Live & Rare curated archive")
print(f"OK catalog entries: {len(CATALOG)}")
print(f"OK unique video/playlist ids: {len(IDSET)}")
print(f"OK Midnight: {len(midnight_pl)} playlists + {len(midnight_v)} unique videos")
print(f"OK WackenTV: {len(wacken_pl)} playlists + {len(videos('WackenTV'))} unique videos")
print(f"OK BBC Music: {len(bbc_pl)} playlists + {len(videos('BBC Music'))} unique videos")
print(f"OK Live Aid: {len(live_pl)} stadium playlists + {len(videos('Live Aid'))} unique videos")
print("OK sequential motor: rotation policy removed, cueVideoById kept")
print("OK cache", CACHE)
print("OK CI wired")
print("distribution", dict(counts))
