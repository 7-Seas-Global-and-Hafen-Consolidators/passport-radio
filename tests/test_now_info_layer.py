#!/usr/bin/env python3
"""Static contract for the approved Qwen v9 Home presentation and selection."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HOME = (ROOT / "index.html").read_text(encoding="utf-8")
BUNDLE = (ROOT / "assets/index-DgBCruM8.js").read_text(encoding="utf-8")
CSS = (ROOT / "assets/index-CcTsvlNy.css").read_text(encoding="utf-8")

for path in (ROOT / "assets/index-DgBCruM8.js", ROOT / "assets/index-CcTsvlNy.css"):
    if not path.is_file():
        raise SystemExit(f"Missing Qwen Home asset: {path}")

for token in (
    'src="/assets/index-DgBCruM8.js"',
    'href="/assets/index-CcTsvlNy.css"',
    'id="root"',
):
    if token not in HOME:
        raise SystemExit(f"Qwen Home shell lost: {token}")

for legacy in ("/js/passport-now-info.js", "cassette", "passport-home-houses.js"):
    if legacy in HOME:
        raise SystemExit(f"Old Home layer returned: {legacy}")

for token in (
    'className:"player-bar"',
    'className:"pb-door__groups"',
    'className:"pb-door__subs"',
    'id:"track"',
    'id:"meta"',
    'id:"pb-vol-range"',
    'children:"⏮"',
    'children:"⏭"',
    'onClick:()=>ur(-1)',
    'onClick:()=>ur(1)',
    'dn.select(Ie.key,Ie.name,Ie.index)',
    'dn.select(v,T,Ne.indexOf(T))',
    'dn.children("world")',
    'playPause(){',
    'volume(v){',
    'Wa=()=>',
    'PassportBus',
):
    if token not in BUNDLE:
        raise SystemExit(f"Qwen Home selection/player contract missing: {token}")

for token in (
    '@media(max-width:480px){.pb-door{max-height:416px}}',
    '.payment-footer-trust__flags',
):
    if token not in CSS:
        raise SystemExit(f"Qwen Home style contract missing: {token}")

print("OK Qwen v9 Home shell, player, selection, World Dial and mobile contracts")
