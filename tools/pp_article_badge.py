#!/usr/bin/env python3
"""PASSPORT RADIO — 31c — pulseira body.pp-article + links de tinta/fontes."""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

ROOT = Path(".")
EXCLUDE = {
    "radio-mundo.html",
    "radio-mundo-player.html",
    "app/index.html",
    "contato.html",
    "destinos.html",
    "player-preview.html",
    "promocao-fone-bluetooth.html",
    "produto/cuvave-cube-baby.html",
    "produto/jbl-cinema-sb595.html",
    "produto/jbl-tune-520bt.html",
    "produto/jbl-wave-beam-2.html",
    "produto/raveo-harmony.html",
    "produto/raveo-turner.html",
    "produto/soundcore-p20i.html",
    "produto/strinberg-sb240c.html",
    "produto/tagima-millenium-6.html",
    "produto/thomaz-teg340.html",
}

BODY_RE = re.compile(r"<body\b([^>]*)>", re.I)
CLASS_RE = re.compile(r'\bclass=(["\'])(.*?)\1', re.I)
HEAD_CLOSE_RE = re.compile(r"</head>", re.I)

FONTS_HREF = "/css/passport-editorial-fonts.css?v=31c"
INK_HREF = "/css/passport-editorial-ink.css?v=31c"
LINKS = (
    f'<link rel="stylesheet" href="{FONTS_HREF}">\n'
    f'<link rel="stylesheet" href="{INK_HREF}">\n'
)


def norm(p: Path) -> str:
    s = str(p)
    if s.startswith("./"):
        s = s[2:]
    return s.replace("\\", "/")


def consumers() -> list[str]:
    found = []
    for p in ROOT.rglob("*.html"):
        if ".git" in p.parts:
            continue
        rel = norm(p)
        try:
            text = p.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        if "passport-legal-footer.css" in text:
            found.append(rel)
    return sorted(found)


def patch_body(html: str) -> str:
    m = BODY_RE.search(html)
    if not m:
        raise AssertionError("body tag not found")
    attrs = m.group(1)
    cm = CLASS_RE.search(attrs)
    if cm:
        quote = cm.group(1)
        classes = cm.group(2).split()
        if "pp-article" not in classes:
            classes.append("pp-article")
            new_attrs = CLASS_RE.sub(
                f"class={quote}{' '.join(classes)}{quote}", attrs, count=1
            )
        else:
            new_attrs = attrs
    else:
        new_attrs = ' class="pp-article"' + attrs
    return html[: m.start()] + f"<body{new_attrs}>" + html[m.end() :]


def patch_head(html: str) -> str:
    if "passport-editorial-fonts.css" in html:
        return html
    m = HEAD_CLOSE_RE.search(html)
    if not m:
        raise AssertionError("</head> not found")
    return html[: m.start()] + LINKS + html[m.start() :]


def apply_file(rel: str) -> bool:
    p = ROOT / rel
    original = p.read_text(encoding="utf-8")
    updated = patch_body(original)
    updated = patch_head(updated)
    if updated != original:
        p.write_text(updated, encoding="utf-8")
        return True
    return False


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    cons = consumers()
    missing = sorted(EXCLUDE - set(cons))
    assert not missing, f"EXCLUDE not in consumers: {missing}"
    extra = {"index.html", "radio-mundo.html", "radio-mundo-player.html"}
    targets = sorted(set(cons) - EXCLUDE)
    assert len(targets) == 161, f"targets={len(targets)} expected 161 consumers={len(cons)}"
    for forbidden in extra:
        assert forbidden not in targets, f"{forbidden} in targets"
    assert "index.html" not in cons or "index.html" in EXCLUDE or "index.html" not in targets

    if args.dry_run:
        print(f"mode=dry targets={len(targets)} modified=N")
        return 0

    modified = 0
    for rel in targets:
        if apply_file(rel):
            modified += 1

    out = ROOT / "tools" / "pp_article_targets.txt"
    out.write_text("\n".join(targets) + "\n", encoding="utf-8")
    print(f"mode=apply targets={len(targets)} modified={modified}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except AssertionError as e:
        print(f"ASSERT FAILED: {e}", file=sys.stderr)
        sys.exit(1)
