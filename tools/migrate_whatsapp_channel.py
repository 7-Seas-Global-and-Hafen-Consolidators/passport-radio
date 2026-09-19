#!/usr/bin/env python3
from pathlib import Path

OLD = "https://wa.me/message/NZS7ZW4QHQVBG1"
NEW = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"
LABEL_OLD = ">WhatsApp oficial</a>"
LABEL_NEW = ">Passport Radio Channel</a>"

def targets():
    yield from Path("blog").rglob("*.html")
    p=Path("blog.html")
    if p.exists(): yield p

changed=0
for path in targets():
    text=path.read_text("utf-8")
    if OLD not in text:
        continue
    text=text.replace(OLD,NEW).replace(LABEL_OLD,LABEL_NEW)
    path.write_text(text,"utf-8")
    changed += 1

# Hard fail: the retired Business/message link must never survive materialization.
survivors=[str(p) for p in targets() if OLD in p.read_text("utf-8")]
if survivors:
    raise SystemExit("legacy WhatsApp link survived: "+", ".join(survivors[:20]))
print(f"WhatsApp Channel migration: {changed} files; legacy survivors: 0")
