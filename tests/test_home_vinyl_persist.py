#!/usr/bin/env python3
"""Qwen v9 Home controls plus unchanged internal vinyl/navigation contracts."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
APP = (ROOT / "assets/index-DgBCruM8.js").read_text(encoding="utf-8")
NAV = (ROOT / "js/passport-persist-nav.js").read_text(encoding="utf-8")
VINYL = (ROOT / "css/passport-vinyl.css").read_text(encoding="utf-8")
INTERNAL = (ROOT / "css/passport-vinyl-internal.css").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")

if 'src="/assets/index-DgBCruM8.js"' not in HOME:
    raise SystemExit("Qwen v9 Home application missing")
for token in ('className:"player-bar"', 'className:"pb-door__groups"',
              'className:"pb-door__subs"', 'onClick:()=>ur(-1)',
              'onClick:()=>ur(1)', 'dn.select(Ie.key,Ie.name,Ie.index)'):
    if token not in APP:
        raise SystemExit(f"Qwen v9 Home signal/navigation missing: {token}")
if re.search(r"\blocalStorage\b|\bsessionStorage\b", NAV):
    raise SystemExit("persist nav must not fake playback with storage")
if "history.pushState" not in NAV:
    raise SystemExit("persist nav must use history")
if "fetch(" not in NAV:
    raise SystemExit("persist nav must fetch internal pages")
if "pp-nav-away" not in VINYL:
    raise SystemExit("off-home persist dock styles missing")
if "prefers-reduced-motion" not in VINYL:
    raise SystemExit("reduced motion missing on vinyls")
if "#world-stations .station" not in INTERNAL:
    raise SystemExit("World Dial internal vinyls missing")
if ".passport-live-channel" not in INTERNAL:
    raise SystemExit("Continuous internal vinyls missing")
if ".passport80s-station" not in INTERNAL:
    raise SystemExit("80s internal vinyls missing")
if "#novelasDeck button" not in INTERNAL:
    raise SystemExit("Novelas internal vinyls missing")
if "tests/test_home_vinyl_persist.py" not in CI:
    raise SystemExit("CI does not run vinyl persist contracts")
if "node --check js/passport-persist-nav.js" not in CI:
    raise SystemExit("CI does not syntax-check persist nav")

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
        r = subprocess.run(["git", "rev-parse", "--verify", ref], cwd=ROOT, capture_output=True)
        if r.returncode == 0:
            return ref
    return None

base = _base_ref()
if base:
    diff = subprocess.check_output(["git", "diff", base, "--"] + protected, cwd=ROOT, text=True)
    if diff.strip():
        raise SystemExit("PROTECTED MOTOR/HABITAT DIFF IS NOT EMPTY")

print("OK Qwen v9 Home signal navigation, internal vinyl and persist script contracts")
if base:
    print(f"OK protected motors empty vs {base}")
