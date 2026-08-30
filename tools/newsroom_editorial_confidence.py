#!/usr/bin/env python3
"""Pure editorial-confidence signals for Passport Newsroom media selection."""
from __future__ import annotations
import html, re, unicodedata

RECOGNIZED_MEDIA=("npr","kexp","bbc")
GENERIC_AUTHORITY_WORDS=("music","festival")
WHAT_TERMS=("album","single","tour","turne","turnê","festival","event","evento","show","concert","live","interview","entrevista","announcement","announces","anuncia","lanca","lança","retorno","reunion","kickoff","hall","fame","rockstar")
HARD_VETO_PATTERNS={"reaction":r"\breact(?:ion|s|ing)?\b","fan_edit":r"\bfan[ -]?edit\b|\bfancam\b","ai_cover":r"\bai[ -]?cover\b|\bdeepfake\b","tribute":r"\btribute\b|\btributo\b","tutorial":r"\btutorial\b|\blesson\b|\bkaraoke\b|\btab(?:s)?\b","sped_or_slowed":r"\bsped[ -]?up\b|\bslowed(?:\s*\+\s*reverb)?\b"}
SOFT_PENALTY_PATTERNS={"cover":r"\bcover\b","review":r"\breview\b|\banalysis\b","compilation":r"\bcompilation\b|\bgreatest hits\b|\bbest of\b","lyrics":r"\blyric(?:s)?\b","full_album":r"\bfull album\b"}

def clean(v): return re.sub(r"\s+"," ",html.unescape(str(v or ""))).strip()
def norm(v): return re.sub(r"[^a-z0-9]+"," ",unicodedata.normalize("NFKD",clean(v)).encode("ascii","ignore").decode("ascii").casefold()).strip()
def tokens(v): return {x for x in norm(v).split() if len(x)>=3}
def entities(item): return [clean(x) for x in (item.get("entities") or []) if clean(x)]
def headline_text(item): return " ".join([clean(item.get("title")),clean(item.get("deck"))])
def story_text(item): return " ".join([headline_text(item),clean(item.get("_article_context"))," ".join(clean(x) for x in (item.get("_media_terms") or []) if clean(x))])

def central_entities(item):
    # Centrality must come from title/deck. Background names in body copy do not
    # silently become mandatory co-subjects for media matching.
    text=norm(headline_text(item)); out=[]
    for e in entities(item):
        if norm(e) and norm(e) in text: out.append(e)
    return out[:4] or entities(item)[:1]

def media_terms(item):
    out=[]
    for raw in item.get("_media_terms") or []:
        value=clean(raw)
        if 3<=len(value)<=100 and value.casefold() not in {x.casefold() for x in out}: out.append(value)
    return out[:6]

def editorial_what(item):
    text=norm(story_text(item)); named=media_terms(item); found=[t for t in WHAT_TERMS if norm(t) in text]; years=re.findall(r"\b(?:19|20)\d{2}\b",text)
    return list(dict.fromkeys(named+found+years))[:10]

def build_query(item):
    central=central_entities(item); who=central[:2]; named=media_terms(item)[:2]; generic=[x for x in editorial_what(item) if x not in named][:3]
    parts=who+named+generic
    return " ".join(parts) if parts else clean(item.get("title"))

def _entity_match(entity,haystack):
    en,hn=norm(entity),norm(haystack)
    if not en:return 0.0
    if en in hn:return 1.0
    et=tokens(entity); return len(et & tokens(haystack))/max(1,len(et))

def entity_evidence(item,candidate_context,channel):
    es=entities(item); central=central_entities(item); joined=f"{candidate_context} {channel}"
    matches=[{"entity":e,"match":round(_entity_match(e,joined),4),"central":e in central} for e in es[:6]]
    central_matches=[m for m in matches if m["central"]]; strong=[m for m in central_matches if m["match"]>=.90]
    cross_required=len(central)>=2; cross_ok=(len(strong)>=2) if cross_required else bool(strong)
    return {"central_entities":central,"matches":matches,"strong_count":len(strong),"cross_required":cross_required,"cross_ok":cross_ok}

def authority_evidence(item,candidate_context,channel,info):
    cn=norm(channel); es=entities(item)
    if any(norm(e) and (norm(e)==cn or norm(e) in cn) for e in es): return 1.0,"entity_channel_identity"
    if "vevo" in cn and info["strong_count"]>=1:return .92,"vevo_with_entity"
    if any(h in cn for h in ("records","recordings")) and info["strong_count"]>=1:return .86,"label_with_entity"
    if "official" in cn and info["strong_count"]>=1:return .84,"official_with_entity"
    if any(h in cn for h in RECOGNIZED_MEDIA) and info["strong_count"]>=1:return .78,"recognized_media_with_entity"
    if any(h in cn for h in GENERIC_AUTHORITY_WORDS):return (.40,"generic_channel_word_only") if info["strong_count"] else (.20,"generic_channel_unlinked")
    if info["strong_count"]>=1:return .50,"identity_without_authority_proof"
    return 0.0,"no_authority_evidence"

def temporal_evidence(item,published_at):
    m=re.search(r"\b((?:19|20)\d{2})\b",clean(published_at))
    if not m:return .55,"date_unknown",None
    vy=int(m.group(1)); am=re.search(r"\b((?:19|20)\d{2})\b",clean(item.get("published_at")))
    if not am:return .55,"article_date_unknown",vy
    delta=int(am.group(1))-vy
    if -1<=delta<=1:return 1.0,"current_window",vy
    if 0<=delta<=3:return .72,"near_context",vy
    return .32,"historical_archive",vy

def event_specificity(item,candidate_context):
    cn=norm(candidate_context); named=media_terms(item); named_matches=[w for w in named if norm(w) and norm(w) in cn]
    if named:
        ratio=len(named_matches)/len(named)
        return min(1.0,.35+.65*ratio),named_matches
    wanted=editorial_what(item); matched=[w for w in wanted if norm(w) in cn]
    if not wanted:return .55,[]
    return min(1.0,.35+len(matched)/len(wanted)),matched

def evaluate(meta,item,*,score_threshold,confidence_threshold):
    title,channel,description=clean(meta.get("title")),clean(meta.get("channel")),clean(meta.get("description")); context=f"{title} {description}"; joined=norm(f"{context} {channel}")
    vetoes=[n for n,p in HARD_VETO_PATTERNS.items() if re.search(p,joined,re.I)]; penalties=[n for n,p in SOFT_PENALTY_PATTERNS.items() if re.search(p,joined,re.I)]
    info=entity_evidence(item,context,channel); identity=max([m["match"] for m in info["matches"] if m["central"]] or [0.0]); authority,authority_reason=authority_evidence(item,context,channel,info)
    temporal,temporal_class,video_year=temporal_evidence(item,meta.get("published_at")); specificity,what_matches=event_specificity(item,context)
    article_tokens=tokens(story_text(item)); video_tokens=tokens(context); relevance=min(1.0,(len(article_tokens & video_tokens)/max(1,min(len(article_tokens),14)))*1.8)
    if info["cross_required"] and not info["cross_ok"]:vetoes.append("multi_entity_context_missing")
    if temporal_class=="historical_archive" and specificity<.70:vetoes.append("historical_without_event_context")
    score=.32*identity+.23*authority+.18*relevance+.15*specificity+.12*temporal-.10*len(penalties); score=max(0.0,min(1.0,score)); confidence=score
    if authority<.78:confidence*=.82
    if temporal_class=="date_unknown":confidence*=.90
    if penalties:confidence*=max(.45,1-.15*len(penalties))
    if vetoes:confidence=0.0
    positive=[]
    if identity>=.90:positive.append("strong_identity")
    if authority>=.78:positive.append("authority_evidence")
    if specificity>=.70:positive.append("event_specificity")
    if temporal>=.72:positive.append("temporal_fit")
    if info["cross_ok"]:positive.append("entity_context_ok")
    return {**meta,"identity":round(identity,4),"authority":round(authority,4),"authority_reason":authority_reason,"relevance":round(relevance,4),"event_specificity":round(specificity,4),"event_matches":what_matches,"temporal_score":round(temporal,4),"temporal_class":temporal_class,"video_year":video_year,"entity_evidence":info,"score":round(score,4),"confidence":round(max(0.0,min(1.0,confidence)),4),"positive_matches":positive,"penalties":penalties,"vetoes":list(dict.fromkeys(vetoes)),"thresholds":{"score":score_threshold,"confidence":confidence_threshold}}
