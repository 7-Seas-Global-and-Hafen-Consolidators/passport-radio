#!/usr/bin/env python3
"""Replace the retired WhatsApp Business/message destination in public Blog HTML.

This migration is intentionally narrow: it only rewrites the known retired
Passport WhatsApp URL and its public follow label. Share-to-WhatsApp links
(https://wa.me/?text=...) are not touched.
"""
from pathlib import Path

OLD = "https://wa.me/message/NZS7ZW4QHQVBG1"
NEW = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"
OLD_LABEL = ">WhatsApp oficial</a>"
NEW_LABEL = ">Passport Radio Channel</a>"

ROOTS = (Path("blog"),)
EXTRA = (Path("blog.html"),)

changed = 0
for root in ROOTS:
    if not root.exists():
        continue
    for path in root.rglob("*.html"):
        text = path.read_text("utf-8")
        if OLD not in text:
            continue
        updated = text.replace(OLD, NEW).replace(OLD_LABEL, NEW_LABEL)
        if updated != text:
            path.write_text(updated, "utf-8")
            changed += 1

for path in EXTRA:
    if path.exists():
        text = path.read_text("utf-8")
        if OLD in text:
            updated = text.replace(OLD, NEW).replace(OLD_LABEL, NEW_LABEL)
            if updated != text:
                path.write_text(updated, "utf-8")
                changed += 1

print(f"WhatsApp Channel migration: {changed} HTML file(s) updated")
