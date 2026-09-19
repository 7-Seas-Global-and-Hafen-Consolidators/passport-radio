#!/usr/bin/env python3
from pathlib import Path

WHATSAPP = "https://whatsapp.com/channel/0029Vb8OD91BfxoBCBG36F0k"
TELEGRAM = "https://t.me/+FKto2N185cs4OGU0"
REPLACEMENTS = {
    "https://wa.me/message/NZS7ZW4QHQVBG1": WHATSAPP,
    "https://wa.me/48732099369?text=Ol%C3%A1%20Passport%20Radio!": WHATSAPP,
    "https://t.me/+pXv3uwqOY8lkZGZk": TELEGRAM,
    "https://t.me/+447594716370": TELEGRAM,
}
TEXT_EXT = {".html",".js",".mjs",".cjs",".py",".yml",".yaml",".json",".jsonl",".md",".txt",".xml"}
SKIP = {".git","node_modules",".passport-wa-auth"}

def targets():
    for p in Path(".").rglob("*"):
        if p.is_file() and p.suffix.lower() in TEXT_EXT and not any(part in SKIP for part in p.parts):
            yield p

changed=0
for path in targets():
    try: text=path.read_text("utf-8")
    except UnicodeDecodeError: continue
    new=text
    for old,replacement in REPLACEMENTS.items(): new=new.replace(old,replacement)
    if new != text:
        path.write_text(new,"utf-8"); changed += 1

survivors=[]
for path in targets():
    try: text=path.read_text("utf-8")
    except UnicodeDecodeError: continue
    for old in REPLACEMENTS:
        if old in text: survivors.append(f"{path}: {old}")
if survivors: raise SystemExit("retired channel links survived: "+", ".join(survivors[:30]))
print(f"Official channel migration: {changed} files; retired-link survivors: 0")
