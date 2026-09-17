#!/usr/bin/env python3
"""Static contracts: Home embed compact via html.pp-signal-frame. Motors untouched."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
HABITAT = (ROOT / "css/passport-signal-habitat.css").read_text(encoding="utf-8")
HOUSES_JS = (ROOT / "js/passport-home-houses.js").read_text(encoding="utf-8")
HOUSES_CSS = (ROOT / "css/passport-home-houses.css").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")
TUNNEL = (ROOT / "js/tunnel-player.js").read_text(encoding="utf-8")
PLAYLISTS = (ROOT / "js/tunnel-playlists.js").read_text(encoding="utf-8")
WORLD = (ROOT / "js/world-radio-player.js").read_text(encoding="utf-8")
BUS = (ROOT / "js/passport-bus.js").read_text(encoding="utf-8")
DISCO = (ROOT / "js/world-disco-deutschland-tunnel.js").read_text(encoding="utf-8")
LIVE = (ROOT / "js/passport-live.js").read_text(encoding="utf-8")
STICKY = (ROOT / "js/continuous-signals-home.js").read_text(encoding="utf-8")
HOME = (ROOT / "index.html").read_text(encoding="utf-8")

if "html.pp-signal-frame .house-head" not in HABITAT:
    raise SystemExit("embed compact does not hide .house-head")
if "html.pp-signal-frame .house-note" not in HABITAT:
    raise SystemExit("embed compact does not hide .house-note")
if "html.pp-signal-frame .pp-signal-frame-note" not in HABITAT:
    raise SystemExit("embed compact does not hide frame-note")
if "html.pp-signal-frame #houseStop" not in HABITAT:
    raise SystemExit("embed compact does not hide redundant PARAR")
if "html.pp-signal-frame .eighties-layout .passport80s-section__head" not in HABITAT:
    raise SystemExit("embed compact does not strip Disco/Flash/Reggae eighties head")
if "passportWorldTunnelReggae" not in HABITAT:
    raise SystemExit("Reggae hidden panel is not revealed in the frame")
if "html.pp-signal-frame .passport-soul-title" not in HABITAT:
    raise SystemExit("Soul editorial title still shows in the frame")
if "html.pp-signal-frame .gdo__brand" not in HABITAT:
    raise SystemExit("Globo brand still shows in the frame")
if "html.pp-signal-frame.pp-world-dial .wd-head" not in HABITAT:
    raise SystemExit("World Dial heading still shows in the frame")
if "html.pp-signal-frame .tunnel-stage" not in HABITAT:
    raise SystemExit("Live & Rare tunnel-stage is not addressed in the frame")
if ".tunnel-engine" in HABITAT and "left:-10000" in HABITAT:
    raise SystemExit("habitat CSS must not rewrite .tunnel-engine offset")

if "html.pp-signal-standalone .house-head" not in HABITAT:
    raise SystemExit("standalone house-head styling disappeared")
if "html.pp-signal-standalone body.passport-house" not in HABITAT:
    raise SystemExit("standalone house padding contract missing")

standalone_head_block = HABITAT.split("html.pp-signal-standalone .house-head", 1)[1].split("}", 1)[0]
if "display:none" in standalone_head_block:
    raise SystemExit("standalone house-head was hidden")

if "#houseVolume" not in HABITAT:
    raise SystemExit("volume keep-path missing from embed CSS")

if "host--simple" not in HOUSES_CSS or "host--media" not in HOUSES_CSS or "host--world" not in HOUSES_CSS:
    raise SystemExit("host variants missing")
if "height:1100px" in HOUSES_CSS or "height:100vh" in HOUSES_CSS:
    raise SystemExit("forbidden universal host height")

if "left:-10000px" not in TUNNEL:
    raise SystemExit("Live & Rare hidden YouTube offset was disturbed")
if "PASSPORT_TUNNEL_PLAYLISTS" not in PLAYLISTS:
    raise SystemExit("Live & Rare catalog marker missing")
if "prepareHls" not in WORLD:
    raise SystemExit("World Dial HLS motor was disturbed")
if "function claim" not in BUS:
    raise SystemExit("PassportBus claim disappeared")
if "0n-disco.radionetz.de" not in DISCO:
    raise SystemExit("World Disco stream was disturbed")
if "GOTHIC PASSPORT" not in LIVE:
    raise SystemExit("Continuous 6-channel motor was disturbed")
if "id=\"audio\"" not in HOME.replace("'", '"') and 'id="audio"' not in HOME:
    raise SystemExit("sticky #audio missing")
if "vu-panel" not in HOME:
    raise SystemExit("K-7 VU missing")
if "continuous-signals-home.js" not in HOME:
    raise SystemExit("sticky continuous script missing")

protected = [
    "js/passport-live.js",
    "js/continuous-signals-home.js",
    "js/tunnel-player.js",
    "js/tunnel-playlists.js",
    "js/181fm-tunnel.js",
    "js/total-soul-tunnel.js",
    "js/mpb-tunnel.js",
    "js/passport-hits-tunnel.js",
    "js/br-rock-tunnel.js",
    "js/50s-60s-tunnel.js",
    "js/flash-house-tunnel.js",
    "js/world-disco-deutschland-tunnel.js",
    "js/world-tunnel-reggae.js",
    "js/novelas-tunnel.js",
    "js/globo-de-ouro-player.js",
    "js/jovem-guarda-tunnel.js",
    "js/nostalgia-passport-tunnel.js",
    "js/world-radio-player.js",
    "js/passport-bus.js",
]

def _git_ref_exists(ref):
    return subprocess.run(
        ["git", "rev-parse", "--verify", ref],
        cwd=ROOT, capture_output=True, text=True
    ).returncode == 0

base = None
for ref in ("origin/main", "main"):
    if _git_ref_exists(ref):
        base = ref
        break
if base:
    diff = subprocess.check_output(
        ["git", "diff", base, "--"] + protected,
        cwd=ROOT,
        text=True,
    )
    if diff.strip():
        raise SystemExit("PROTECTED MOTOR DIFF IS NOT EMPTY")

houses = [
    "radio-continuous.html",
    "radio-live-rare.html",
    "radio-80s.html",
    "radio-soul.html",
    "radio-mpb.html",
    "radio-hits.html",
    "radio-rock-brasil.html",
    "radio-50s-60s.html",
    "radio-flash-house.html",
    "radio-world-disco-deutschland.html",
    "radio-world-tunnel-reggae.html",
    "radio-novelas.html",
    "globo-de-ouro-player.html",
    "radio-mundo-player.html",
    "radio-jovem-guarda.html",
    "radio-nostalgia-passport.html",
]
for name in houses:
    html = (ROOT / name).read_text(encoding="utf-8")
    if "passport-signal-habitat.css?v=20260916embed" not in html:
        raise SystemExit(f"{name} is not on embed habitat cache")

if "tests/test_home_embed_compact.py" not in CI:
    raise SystemExit("CI does not run embed compact contracts")

print("OK Home embed compact contracts")
print("OK pp-signal-frame hides standalone chrome")
print("OK standalone head remains")
print("OK protected motors have marker contracts" + (f" and empty diff vs {base}" if base else " (git base skipped)"))
print("OK Live & Rare offscreen engine marker intact")
