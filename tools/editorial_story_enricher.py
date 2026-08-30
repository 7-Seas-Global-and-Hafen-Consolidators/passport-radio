#!/usr/bin/env python3
"""Passport Newsroom downstream media confidence gate. Precision over coverage."""
from __future__ import annotations
import argparse
from datetime import datetime, timezone
import html, json, os, re
from pathlib import Path
from urllib.parse import quote_plus
from urllib.request import Request, urlopen
from newsroom_editorial_confidence import build_query, clean, entities, evaluate

ROOT=Path(__file__).resolve().parents[1]
MARKER_VERSION="3.1"; BLOCK_START="<!-- PASSPORT_NEWSROOM_MEDIA_START:v3 -->"; BLOCK_END="<!-- PASSPORT_NEWSROOM_MEDIA_END -->"
UA="Mozilla/5.0 PassportNewsroom/3.1 (+https://www.passportradio.online/)"; MAX_CANDIDATES=8
CONFIDENCE_THRESHOLD=float(os.getenv("PASSPORT_NEWSROOM_CONFIDENCE_THRESHOLD","0.80")); SCORE_THRESHOLD=float(os.getenv("PASSPORT_NEWSROOM_SCORE_THRESHOLD","0.68")); AMBIGUITY_MARGIN=float(os.getenv("PASSPORT_NEWSROOM_AMBIGUITY_MARGIN","0.12"))

def fetch_json(url,timeout=12):
    try:
        with urlopen(Request(url,headers={"User-Agent":UA,"Accept-Language":"pt-BR,pt;q=0.9,en;q=0.8"}),timeout=timeout) as r:
            return json.loads(r.read(500_000).decode("utf-8","replace")) if getattr(r,"status",200)==200 else None
    except Exception:return None

def fetch_text(url,timeout=12):
    try:
        with urlopen(Request(url,headers={"User-Agent":UA,"Accept-Language":"pt-BR,pt;q=0.9,en;q=0.8"}),timeout=timeout) as r:
            return r.read(2_000_000).decode("utf-8","replace") if getattr(r,"status",200)==200 else ""
    except Exception:return ""

def fetch_bytes_ok(url,timeout=10):
    try:
        with urlopen(Request(url,headers={"User-Agent":UA,"Range":"bytes=0-2047"}),timeout=timeout) as r:
            data=r.read(2048); return getattr(r,"status",200) in (200,206) and str(r.headers.get("Content-Type") or "").lower().startswith("image/") and len(data)>200
    except Exception:return False

def search_youtube_candidates(query,timeout=15):
    body=fetch_text("https://www.youtube.com/results?search_query="+quote_plus(query),timeout); out=[]; seen=set()
    for vid in re.findall(r'"videoId":"([A-Za-z0-9_-]{11})"',body):
        if vid in seen:continue
        seen.add(vid); out.append(vid)
        if len(out)>=MAX_CANDIDATES:break
    return out

def _youtube_description(page):
    m=re.search(r'"shortDescription":"((?:\\.|[^"\\])*)"',page)
    if not m:return ""
    try:return clean(json.loads('"'+m.group(1)+'"'))
    except Exception:return ""

def _youtube_date(page):
    patterns=(r'"publishDate":"(\d{4}-\d{2}-\d{2})"',r'"uploadDate":"(\d{4}-\d{2}-\d{2})"',r'itemprop="datePublished"\s+content="(\d{4}-\d{2}-\d{2})"',r'itemprop="uploadDate"\s+content="(\d{4}-\d{2}-\d{2})"')
    for p in patterns:
        m=re.search(p,page)
        if m:return m.group(1)
    return ""

def youtube_metadata(video_id):
    watch=f"https://www.youtube.com/watch?v={video_id}"; data=fetch_json("https://www.youtube.com/oembed?format=json&url="+quote_plus(watch))
    if not data or not clean(data.get("title")) or not clean(data.get("author_name")):return None
    page=fetch_text(watch)
    return {"video_id":video_id,"title":clean(data.get("title")),"channel":clean(data.get("author_name")),"thumbnail_url":clean(data.get("thumbnail_url")),"published_at":_youtube_date(page),"description":_youtube_description(page)}

def primary_entity(item):
    es=entities(item); return es[0] if es else ""
def evaluate_candidate(meta,item):return evaluate(meta,item,score_threshold=SCORE_THRESHOLD,confidence_threshold=CONFIDENCE_THRESHOLD)

def choose_video(item):
    query=build_query(item); decision={"query":query,"candidates":[],"selected_video":None,"score":0.0,"confidence":0.0,"positive_matches":[],"penalties":[],"reason_selected":"","reason_rejected":"","thresholds":{"score":SCORE_THRESHOLD,"confidence":CONFIDENCE_THRESHOLD,"ambiguity_margin":AMBIGUITY_MARGIN}}
    if not entities(item):decision["reason_rejected"]="missing_specific_entity"; return decision
    ids=search_youtube_candidates(query)
    if not ids:decision["reason_rejected"]="no_candidates"; return decision
    evaluated=[]
    for vid in ids:
        meta=youtube_metadata(vid); evaluated.append(evaluate_candidate(meta,item) if meta else {"video_id":vid,"vetoes":["oembed_unavailable"],"score":0.0,"confidence":0.0})
    decision["candidates"]=evaluated; viable=[c for c in evaluated if not c.get("vetoes")]; viable.sort(key=lambda c:(c.get("confidence",0),c.get("score",0)),reverse=True)
    if not viable:decision["reason_rejected"]="all_candidates_vetoed"; return decision
    top=viable[0]; runner=viable[1] if len(viable)>1 else None; margin=top["confidence"]-(runner["confidence"] if runner else 0.0)
    decision.update({"score":top["score"],"confidence":top["confidence"],"positive_matches":top.get("positive_matches",[]),"penalties":top.get("penalties",[]),"temporal_class":top.get("temporal_class"),"event_specificity":top.get("event_specificity"),"authority_reason":top.get("authority_reason"),"entity_evidence":top.get("entity_evidence")})
    if top["score"]<SCORE_THRESHOLD:decision["reason_rejected"]="score_below_threshold"; return decision
    if top["confidence"]<CONFIDENCE_THRESHOLD:decision["reason_rejected"]="confidence_below_threshold"; return decision
    if runner and margin<AMBIGUITY_MARGIN:decision["reason_rejected"]="ambiguous_top_candidates"; return decision
    thumb=top.get("thumbnail_url") or f"https://i.ytimg.com/vi/{top['video_id']}/hqdefault.jpg"
    if not fetch_bytes_ok(thumb):decision["reason_rejected"]="thumbnail_unavailable"; return decision
    decision["selected_video"]=top["video_id"]; decision["reason_selected"]="evidence_backed_editorial_match"; return decision

def audit_path(run_id):
    p=ROOT/"build"/"newsroom-audit"; p.mkdir(parents=True,exist_ok=True); return p/f"{run_id}.jsonl"
def append_audit(run_id,item,url,decision,outcome):
    payload={"ts":datetime.now(timezone.utc).isoformat(),"run_id":run_id,"marker_version":MARKER_VERSION,"article":url,"title":clean(item.get("title")),"entities":entities(item),"query":decision.get("query"),"candidates":decision.get("candidates",[]),"selected_video":decision.get("selected_video"),"score":decision.get("score"),"confidence":decision.get("confidence"),"positive_matches":decision.get("positive_matches",[]),"penalties":decision.get("penalties",[]),"reason_selected":decision.get("reason_selected",""),"reason_rejected":decision.get("reason_rejected",""),"temporal_class":decision.get("temporal_class"),"event_specificity":decision.get("event_specificity"),"authority_reason":decision.get("authority_reason"),"entity_evidence":decision.get("entity_evidence"),"thresholds":decision.get("thresholds",{}),"outcome":outcome}
    with audit_path(run_id).open("a",encoding="utf-8") as fh:fh.write(json.dumps(payload,ensure_ascii=False)+"\n")

def enrich_page(path,item,run_id,dry_run=False):
    original=path.read_text("utf-8"); url="/"+str(path.relative_to(ROOT)).replace("\\","/")
    if BLOCK_START in original or "PASSPORT_NEWSROOM_ENRICHED_V2" in original:append_audit(run_id,item,url,{"query":"","reason_rejected":"already_enriched"},"SKIP"); return False,"SKIP"
    decision=choose_video(item); vid=decision.get("selected_video")
    if not vid:append_audit(run_id,item,url,decision,"NO_VIDEO"); return False,"NO_VIDEO"
    embed=f"https://www.youtube-nocookie.com/embed/{vid}"; title=clean(item.get("title")); block=f'''\n{BLOCK_START}\n<section class="pe-newsroom-media" data-passport-newsroom-version="{MARKER_VERSION}" data-passport-video="{vid}" aria-label="Arquivo audiovisual Passport Radio">\n  <div class="pe-newsroom-archive-label">ARQUIVO PASSPORT RADIO</div>\n  <div class="pe-newsroom-video">\n    <iframe src="{embed}" title="{html.escape(title,quote=True)} — Arquivo Passport Radio" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>\n  </div>\n</section>\n{BLOCK_END}\n'''; needle='<div class="pe-closing"><small>PASSPORT RADIO · EDITORIAL</small>'
    if needle not in original:decision.update({"selected_video":None,"reason_selected":"","reason_rejected":"closing_anchor_missing"}); append_audit(run_id,item,url,decision,"NO_VIDEO"); return False,"NO_VIDEO"
    css='''\n<style data-passport-newsroom-css="v3">\n.pe-newsroom-media{margin:54px 0;border-top:1px solid rgba(0,0,0,.14);padding-top:32px}.pe-newsroom-archive-label{margin:0 0 14px;font-size:.68rem;font-weight:900;letter-spacing:.14em;opacity:.62}.pe-newsroom-video{position:relative;width:100%;aspect-ratio:16/9;background:#000}.pe-newsroom-video iframe{position:absolute;inset:0;width:100%;height:100%;border:0}\n</style>\n'''; candidate=original.replace(needle,block+needle,1)
    if 'data-passport-newsroom-css="v3"' not in candidate:candidate=candidate.replace("</head>",css+"</head>",1)
    if candidate==original or BLOCK_START not in candidate:decision.update({"selected_video":None,"reason_selected":"","reason_rejected":"atomic_composition_failed"}); append_audit(run_id,item,url,decision,"NO_VIDEO"); return False,"NO_VIDEO"
    append_audit(run_id,item,url,decision,"DRY_RUN_EMBED" if dry_run else "EMBED")
    if dry_run:return False,"DRY_RUN_EMBED"
    path.write_text(candidate,"utf-8"); return True,"EMBED"

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--feed",default="data/editorial-feed.json"); ap.add_argument("--limit",type=int,default=5); ap.add_argument("--run-id",default="local"); ap.add_argument("--dry-run",action="store_true"); args=ap.parse_args()
    feed=json.loads((ROOT/args.feed).read_text("utf-8")); items=feed if isinstance(feed,list) else feed.get("items",[]); changed=[]; no_video=[]; skipped=[]; dry_embed=[]
    for item in items[:max(1,args.limit)]:
        url=str(item.get("url") or "")
        if not url.startswith("/editorial/") or not url.endswith(".html"):continue
        path=ROOT/url.lstrip("/")
        if not path.exists():continue
        did,outcome=enrich_page(path,item,args.run_id,args.dry_run)
        if did:changed.append(url)
        elif outcome=="NO_VIDEO":no_video.append(url)
        elif outcome=="SKIP":skipped.append(url)
        elif outcome=="DRY_RUN_EMBED":dry_embed.append(url)
    print(json.dumps({"status":"ok","mode":"dry-run" if args.dry_run else "canary","limit":args.limit,"enriched":len(changed),"pages":changed,"no_video":no_video,"dry_run_embed":dry_embed,"skipped":skipped,"audit":str(audit_path(args.run_id).relative_to(ROOT))},ensure_ascii=False)); return 0
if __name__=="__main__":raise SystemExit(main())
