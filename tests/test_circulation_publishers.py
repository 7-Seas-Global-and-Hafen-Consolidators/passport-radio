#!/usr/bin/env python3
import json, subprocess, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SCRIPT=ROOT/"tools/whatsapp_channel_outbox.py"

with tempfile.TemporaryDirectory() as td:
    d=Path(td)
    catalog=d/"catalog.jsonl"
    delta=d/"delta.json"
    outbox=d/"outbox.json"
    catalog.write_text(json.dumps({"slug":"alpha","title":"Alpha","url":"/blog/w/alpha.html"})+"\n",encoding="utf-8")
    delta.write_text(json.dumps({"items":[{"slug":"alpha","revision":"rev1"}]}),encoding="utf-8")
    outbox.write_text(json.dumps({"version":1,"items":[{"id":"old@rev0","title":"Old","url":"x","text":"x"}]}),encoding="utf-8")
    subprocess.check_call(["python",str(SCRIPT),"queue-changed","--catalog",str(catalog),"--outbox",str(outbox),"--delta",str(delta)])
    data=json.loads(outbox.read_text("utf-8"))
    ids={x["id"] for x in data["items"]}
    assert ids=={"old@rev0","alpha@rev1"}, ids
    alpha=next(x for x in data["items"] if x["id"]=="alpha@rev1")
    assert "utm_source=whatsapp" in alpha["url"]
print("OK WhatsApp outbox consumes circulation delta and preserves pending items")
