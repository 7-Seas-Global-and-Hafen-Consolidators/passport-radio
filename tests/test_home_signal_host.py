#!/usr/bin/env python3
"""Static contract for the Qwen v9 Home single-signal selection host."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
APP = (ROOT / "assets/index-DgBCruM8.js").read_text(encoding="utf-8")
TUNNEL = (ROOT / "js/tunnel-player.js").read_text(encoding="utf-8")
PLAYLISTS = (ROOT / "js/tunnel-playlists.js").read_text(encoding="utf-8")
DISCO = (ROOT / "js/world-disco-deutschland-tunnel.js").read_text(encoding="utf-8")
WORLD = (ROOT / "js/world-radio-player.js").read_text(encoding="utf-8")
BUS = (ROOT / "js/passport-bus.js").read_text(encoding="utf-8")

if 'src="/assets/index-DgBCruM8.js"' not in HOME:
    raise SystemExit("Home does not load the Qwen v9 application")

for token in (
    'className:"pb-door__groups"',
    'className:"pb-door__subs"',
    'Object.entries(td).map',
    'nd.map(T=>',
    'dn.children("world")',
    'dn.select(v,T,Ne.indexOf(T))',
    'select(v,x,m){',
    'Wa(),ct=v,Ii=x',
    'PassportBus',
    'id:"passport-player"',
):
    if token not in APP:
        raise SystemExit(f"Qwen v9 single-signal selection missing: {token}")

parents = ("continuous:", '"live-rare":', "world:", '"80s":', "novelas:", "globo:")
for token in parents:
    if token not in APP:
        raise SystemExit(f"Qwen v9 parent missing: {token}")
individuals = ('label:"MPB"', 'label:"Jovem Guarda"', 'label:"Rock Brasil"',
               'label:"Hits"', 'label:"Disco"', 'label:"Soul"',
               'label:"Flash House"', 'label:"Reggae"', 'label:"Nostalgia"',
               'label:"50s & 60s"')
for token in individuals:
    if token not in APP:
        raise SystemExit(f"Qwen v9 individual signal missing: {token}")

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

print("OK Qwen v9 six parent contexts, ten individual signals and single selection path")
print("OK Live & Rare, World Dial, Disco and Bus motor markers")
