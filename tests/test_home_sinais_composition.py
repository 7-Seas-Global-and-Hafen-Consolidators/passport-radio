#!/usr/bin/env python3
"""Static contracts: Home SINAIS composition by proximity. Motors untouched."""
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
DOORS = (ROOT / "css/passport-four-doors.css").read_text(encoding="utf-8")
CI = (ROOT / ".github/workflows/build.yml").read_text(encoding="utf-8")

ORDER = [
    "/radio-continuous.html",
    "/radio-live-rare.html",
    "/radio-mundo-player.html",
    "/radio-mpb.html",
    "/radio-jovem-guarda.html",
    "/radio-rock-brasil.html",
    "/radio-hits.html",
    "/radio-world-disco-deutschland.html",
    "/radio-soul.html",
    "/radio-flash-house.html",
    "/radio-world-tunnel-reggae.html",
    "/radio-nostalgia-passport.html",
    "/radio-80s.html",
    "/radio-50s-60s.html",
    "/radio-novelas.html",
    "/globo-de-ouro-player.html",
]

houses = re.findall(r'data-house="([^"]+)"', HOME)
if houses != ORDER:
    raise SystemExit(f"SINAIS order drifted:\n{houses}\n!=\n{ORDER}")

clusters = HOME.count('<div class="casas-cluster')
if clusters != 6:
    raise SystemExit(f"expected 6 visual clusters, got {clusters}")
if "casas-cluster--own" not in HOME:
    raise SystemExit("independent experiences cluster missing")
if "casas-cluster--solo" not in HOME:
    raise SystemExit("reggae breath cluster missing")
if HOME.count('id="passport-casa-host"') != 1:
    raise SystemExit("host must remain a single node")
block = HOME.split('id="passport-casas"', 1)[-1].split("passport-casa-host", 1)[0]
for label in ("INTERNACIONAL", "RETRO", "ESPECIAIS", "GRUPO 1", "GRUPO 2", ">BRASIL<"):
    if label in block:
        raise SystemExit(f"visible category label is forbidden: {label}")
if "<h3" in block:
    raise SystemExit("cluster titles must not appear as headings")

if ":nth-child(1){--hc:" in DOORS.replace(" ", ""):
    raise SystemExit("rainbow nth-child pill colors returned")
if "casas-cluster" not in DOORS:
    raise SystemExit("four-doors does not compose clusters")
if "box-shadow:0 0 10px color-mix" in DOORS:
    raise SystemExit("carnival pill glow returned")
if ".casa[open] summary" not in DOORS:
    raise SystemExit("active state is not styled")
if "pp-vinyl" not in HOME or HOME.count("pp-vinyl-disc") < 16:
    raise SystemExit("mini-vinyl collection missing")
if 'id="pp-persist"' not in HOME:
    raise SystemExit("persist dock missing")
if "passport-persist-nav.js" not in HOME:
    raise SystemExit("persist nav is not wired")
if "tests/test_home_sinais_composition.py" not in CI:
    raise SystemExit("CI does not run SINAIS composition contracts")

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

print("OK SINAIS composition contracts")
print("OK order:", " → ".join(Path(h).stem for h in houses))
print("OK 6 clusters, 1 host, no category titles")
print("OK rainbow pills removed")
if base:
    print(f"OK protected files empty vs {base}")
