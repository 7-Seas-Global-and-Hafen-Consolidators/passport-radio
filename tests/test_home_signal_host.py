#!/usr/bin/env python3
"""Static contracts for the Home single-signal host."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
HOUSES = (ROOT / "js/passport-home-houses.js").read_text(encoding="utf-8")
HOUSES_CSS = (ROOT / "css/passport-home-houses.css").read_text(encoding="utf-8")
DOORS = (ROOT / "css/passport-four-doors.css").read_text(encoding="utf-8")
JOURNEY = (ROOT / "js/passport-home-journey.js").read_text(encoding="utf-8")
INFO = (ROOT / "js/passport-now-info.js").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")
TUNNEL = (ROOT / "js/tunnel-player.js").read_text(encoding="utf-8")
PLAYLISTS = (ROOT / "js/tunnel-playlists.js").read_text(encoding="utf-8")
DISCO = (ROOT / "js/world-disco-deutschland-tunnel.js").read_text(encoding="utf-8")
WORLD = (ROOT / "js/world-radio-player.js").read_text(encoding="utf-8")
BUS = (ROOT / "js/passport-bus.js").read_text(encoding="utf-8")
CONT = (ROOT / "js/continuous-signals-home.js").read_text(encoding="utf-8")

HOUSE_FILES = [
    "/radio-continuous.html",
    "/radio-live-rare.html",
    "/radio-80s.html",
    "/radio-soul.html",
    "/radio-mpb.html",
    "/radio-hits.html",
    "/radio-rock-brasil.html",
    "/radio-50s-60s.html",
    "/radio-flash-house.html",
    "/radio-world-disco-deutschland.html",
    "/radio-world-tunnel-reggae.html",
    "/radio-novelas.html",
    "/globo-de-ouro-player.html",
    "/radio-mundo-player.html",
    "/radio-jovem-guarda.html",
    "/radio-nostalgia-passport.html",
]

houses = re.findall(r'data-house="([^"]+)"', HOME)
if len(houses) < 16:
    raise SystemExit(f"Home house count regressed: {len(houses)}")
for path in HOUSE_FILES:
    if path not in houses:
        raise SystemExit(f"Missing house selector: {path}")

if 'id="passport-casa-host"' not in HOME:
    raise SystemExit("Home is missing #passport-casa-host")
if "casa-host-stage" not in HOME:
    raise SystemExit("Home is missing .casa-host-stage")

if "stage.appendChild(frame)" not in HOUSES:
    raise SystemExit("Iframe is not mounted on the host stage")
if 'card.querySelector(".casa-stage").appendChild(frame)' in HOUSES:
    raise SystemExit("Iframe is still mounted inside the pill")
if "teardownFrame();" not in HOUSES:
    raise SystemExit("Switch path is missing teardownFrame")
activate = HOUSES.split("function activate(card)", 1)[-1].split("function deactivate", 1)[0]
if activate.find("teardownFrame();") < 0 or activate.find("createFrame(card)") < 0:
    raise SystemExit("activate() must teardown then create")
if activate.find("teardownFrame();") > activate.find("createFrame(card)"):
    raise SystemExit("unmount A must happen before mount B")
if "Math.min(1100" in HOUSES:
    raise SystemExit("Home still writes child scrollHeight onto the iframe")
if "passport-house-height" in HOUSES:
    raise SystemExit("Home still listens for unbounded house height")

if "flex:0 0 100%" in DOORS and "casa[open]{flex:0 0 100%" in DOORS.replace(" ", ""):
    raise SystemExit("Open pill still expands to 100% width")
if "order:-1" in DOORS and ".casa[open]{flex:0 0 100%;order:-1" in DOORS.replace(" ", ""):
    raise SystemExit("Open pill still jumps to order:-1")
if "host--simple" not in HOUSES_CSS or "host--media" not in HOUSES_CSS or "host--world" not in HOUSES_CSS:
    raise SystemExit("Host presentation variants are missing")
if "height:1100px" in HOUSES_CSS or "height:100vh" in HOUSES_CSS:
    raise SystemExit("Host uses a forbidden universal height")

if "passport-casa-host" not in JOURNEY:
    raise SystemExit("Programação shortcut no longer reveals the host")

if 'host.dataset.house === card.dataset.house' not in INFO:
    raise SystemExit("now-info cannot see the house document in the host")

if "left:-10000px" not in TUNNEL:
    raise SystemExit("Live & Rare hidden YouTube offset was disturbed")
if "PASSPORT_TUNNEL_PLAYLISTS" not in PLAYLISTS:
    raise SystemExit("Live & Rare catalog marker missing")
if "0n-disco.radionetz.de" not in DISCO:
    raise SystemExit("World Disco stream was disturbed")
if "prepareHls" not in WORLD:
    raise SystemExit("World Dial HLS motor was disturbed")
if "function claim" not in BUS:
    raise SystemExit("PassportBus claim disappeared")
if 'id="passport-player"' not in HOME or 'id="audio"' not in HOME:
    raise SystemExit("Sticky player markup missing")
if "vu-panel" not in HOME or "vu-fill" not in HOME:
    raise SystemExit("K-7 VU markup missing")
if "height:56px" not in HOME:
    raise SystemExit("Sticky height contract missing")

forbidden_motors = [
    "js/world-disco-deutschland-tunnel.js",
    "js/tunnel-player.js",
    "js/tunnel-playlists.js",
    "js/world-radio-player.js",
    "js/passport-bus.js",
    "js/continuous-signals-home.js",
    "js/passport-live.js",
]
# This test file does not mutate those motors; the CI diff is the authority.
for token in ["new Audio(", "Hls.", "cueVideoById"]:
    if token in HOUSES:
        raise SystemExit(f"House host layer must not grow a motor: {token}")

if "node --check js/passport-home-houses.js" not in CI:
    raise SystemExit("CI does not syntax-check passport-home-houses.js")
if "tests/test_home_signal_host.py" not in CI:
    raise SystemExit("CI does not run host static contracts")

print("OK Home single-signal host contracts")
print(f"OK selectors: {len(houses)}")
print("OK host present, iframe mounts on host, teardown before create")
print("OK Home no longer applies child scrollHeight")
print("OK motors/catalog/sticky/K-7 markers intact")
