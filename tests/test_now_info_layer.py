#!/usr/bin/env python3
"""Static contracts for the Home informational now-playing layer."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
INFO = (ROOT / "js/passport-now-info.js").read_text(encoding="utf-8")
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
HOUSES = (ROOT / "js/passport-home-houses.js").read_text(encoding="utf-8")
BUS = (ROOT / "js/passport-bus.js").read_text(encoding="utf-8")
CONT = (ROOT / "js/continuous-signals-home.js").read_text(encoding="utf-8")
NOW = (ROOT / "js/radio-now-playing.js").read_text(encoding="utf-8")
PORTAL = (ROOT / "js/passport-portal-v3.js").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")

FORBIDDEN = [
    ".play(",
    ".pause(",
    ".load(",
    "playVideo",
    "pauseVideo",
    "unMute",
    "mute()",
    ".claim(",
    ".silence(",
    "Hls.",
    "new Audio(",
    "audio.src",
    "removeAttribute('src')",
    'removeAttribute("src")',
]
for token in FORBIDDEN:
    if token.lower() in INFO.lower():
        raise SystemExit(f"Informational layer must not control playback: {token}")

if "PassportBus" in INFO:
    raise SystemExit("Informational layer must not touch PassportBus")

for scenic in [".reel", "vu-fill", "vu-panel", "mold-vustrip"]:
    if scenic in INFO:
        raise SystemExit(f"Informational layer must not touch K-7 scenography: {scenic}")

if "/js/passport-now-info.js" not in HOME:
    raise SystemExit("Home does not load passport-now-info.js")

if HOME.index("/js/passport-home-houses.js") > HOME.index("/js/passport-now-info.js"):
    raise SystemExit("now-info must load after home-houses")

if "radio-now-playing.js" in HOME:
    raise SystemExit("radio-now-playing.js must not be wired on Home")

if "passport-now-info" in HOUSES or "passport-now-info" in BUS or "passport-now-info" in CONT:
    raise SystemExit("Informational layer leaked into a motor/bus/house file")

houses = len(re.findall(r'data-house="', HOME))
if houses < 16:
    raise SystemExit(f"Home house count regressed: {houses}")

for token in ['id="track"', 'id="meta"', 'class="cassette"', 'id="audio"', 'id="play"']:
    if token not in HOME:
        raise SystemExit(f"Home lost sticky/K-7 contract: {token}")

if "mirror()" not in PORTAL:
    raise SystemExit("portal-v3 mirror disappeared")

if "cassette .label" not in INFO:
    raise SystemExit("K-7 label is not painted by the informational layer")

if "bump()" not in INFO or "token" not in INFO:
    raise SystemExit("House-switch token isolation is missing")

STREAMS = [
    "https://mediaserv68.live-streams.nl:18012/OnlyLive",
    "https://streams.radio7.de/unplugged/mp3-192/web/",
    "https://stations.radio-host.com/proxy/livejam/stream",
]
for url in STREAMS:
    if url not in CONT:
        raise SystemExit(f"Continuous motor lost stream: {url}")
    if url not in INFO:
        raise SystemExit(f"Informational layer lost sticky identity stream: {url}")

for label in ["METAL", "UNPLUGGED", "LIVE JAM"]:
    if label not in INFO or label not in CONT:
        raise SystemExit(f"Sticky identity label missing: {label}")

if "node --check js/passport-now-info.js" not in CI:
    raise SystemExit("CI does not syntax-check passport-now-info.js")
if "tests/test_now_info_layer.py" not in CI:
    raise SystemExit("CI does not run now-info static contracts")

if "getPlayerState() !== 1" not in INFO:
    raise SystemExit("YouTube confirmation must be read-only getPlayerState===1")

print("OK now-info static contracts")
print(f"OK Home houses: {houses}")
print("OK informational layer has no playback controls")
print("OK motors/bus/houses not coupled to now-info")
print("OK sticky stream identity matches Continuous motor")
print("OK CI wires now-info checks")
