#!/usr/bin/env python3
"""Static contracts for the Qwen v9 Home signal composition."""
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
APP = (ROOT / "assets/index-DgBCruM8.js").read_text(encoding="utf-8")
CSS = (ROOT / "assets/index-CcTsvlNy.css").read_text(encoding="utf-8")

if 'src="/assets/index-DgBCruM8.js"' not in HOME:
    raise SystemExit("Qwen v9 Home bundle missing")

PARENTS = (
    'continuous:"Continuous Signals"',
    '"live-rare":"Live & Rare"',
    'world:"World Dial"',
    '"80s":"80s"',
    'novelas:"Novelas"',
    'globo:"Globo de Ouro"',
)
INDIVIDUALS = (
    'label:"MPB"', 'label:"Jovem Guarda"', 'label:"Rock Brasil"',
    'label:"Hits"', 'label:"Disco"', 'label:"Soul"',
    'label:"Flash House"', 'label:"Reggae"', 'label:"Nostalgia"',
    'label:"50s & 60s"',
)
for group, tokens in (("parent", PARENTS), ("individual", INDIVIDUALS)):
    positions = [APP.find(token) for token in tokens]
    if -1 in positions or positions != sorted(positions):
        raise SystemExit(f"Qwen v9 {group} order/composition changed")

for token in ('className:"pb-door__groups"', 'className:"pb-door__subs"',
              'Object.entries(td).map', 'nd.map(T=>', 'dn.children("world")',
              'dn.select(v,T,Ne.indexOf(T))'):
    if token not in APP:
        raise SystemExit(f"Qwen v9 signal composition missing: {token}")
if '@media(max-width:480px){.pb-door{max-height:416px}}' not in CSS:
    raise SystemExit("Approved mobile signal block rule changed")

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
    "css/passport-signal-habitat.css",
]


def _base_ref():
    for ref in ("origin/main", "main"):
        r = subprocess.run(
            ["git", "rev-parse", "--verify", ref],
            cwd=ROOT,
            capture_output=True,
        )
        if r.returncode == 0:
            return ref
    return None


base = _base_ref()
if base:
    diff = subprocess.check_output(["git", "diff", base, "--"] + protected, cwd=ROOT, text=True)
    if diff.strip():
        raise SystemExit("PROTECTED MOTOR/HOST DIFF IS NOT EMPTY")

print("OK Qwen v9 SINAIS composition: six parents and ten individuals in visual order")
print("OK contextual children and dynamic World Dial")
if base:
    print(f"OK protected motor/host files empty vs {base}")
