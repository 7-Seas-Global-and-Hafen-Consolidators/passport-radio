#!/usr/bin/env python3
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

import newsroom_placement_proposal as p


def decision(selected="VIDEO000001", *, temporality="current_window", year=2026, runners=True):
    candidates=[
        {"video_id":selected,"title":"Band X - New Fire (Official Music Video)","channel":"Band X","published_at":"2026-08-30","video_year":year,"temporal_class":temporality,"media_class":"music_video","media_priority":1.0,"score":.91,"confidence":.90,"authority":1.0,"event_specificity":.9,"vetoes":[]},
    ]
    if runners:
        candidates += [
            {"video_id":"VIDEO000002","title":"Band X teaser","channel":"Band X","media_class":"promo_clip","media_priority":.35,"score":.78,"confidence":.76,"event_specificity":.7,"vetoes":[]},
            {"video_id":"VIDEO000003","title":"Band X reaction","channel":"Fan TV","score":.62,"confidence":0,"event_specificity":.5,"vetoes":["reaction"]},
        ]
    return {"query":"Band X New Fire","candidates":candidates,"selected_video":selected,"score":.91,"confidence":.90,"reason_selected":"evidence_backed_editorial_match","media_class":"music_video","media_terms":["New Fire"],"thresholds":{"score":.68,"confidence":.80,"ambiguity_margin":.12}}


def item():
    return {"title":"Band X lança New Fire","deck":"Novo clipe oficial","url":"/editorial/band-x.html","_media_terms":["New Fire"]}


def main():
    text="A banda confirmou o novo ciclo. New Fire ganhou videoclipe oficial. O lançamento abre a próxima fase."
    proposal=p.build_proposal(item(),decision(),text)
    assert proposal["media_id"]=="youtube:VIDEO000001", proposal
    assert proposal["placement"]["anchor_text"]=="New Fire ganhou videoclipe oficial.", proposal["placement"]
    assert proposal["placement"]["anchor_offset"]>0, proposal["placement"]
    assert len(proposal["runners_up"])==2, proposal["runners_up"]
    assert proposal["provenance"]["temporality"]=="current", proposal["provenance"]
    assert proposal["playback"]=={"autoplay":False,"reciprocal_interlock":True}
    assert proposal["nomad_bridge"]==""

    result=p.advance_to_reviewable(item(),decision(),text)
    assert result["state"]=="REVIEWABLE", result
    assert result["g2"]["report"]["why_this"].startswith("Essa mídia porque"), result

    no_runners=p.advance_to_reviewable(item(),decision(runners=False),text)
    assert no_runners["state"]=="PROPOSED", no_runners
    assert no_runners["g1"]["reason_code"]=="RUNNERS_UP_MISSING", no_runners

    unknown=p.build_proposal(item(),decision(temporality="date_unknown",year=None),text)
    assert unknown["provenance"]["temporality"]=="unknown", unknown
    assert unknown["placement"]["media_role"]=="illustration", unknown
    assert "data não confirmada" in unknown["placement"]["caption"], unknown

    historical=p.build_proposal(item(),decision(temporality="historical_archive",year=1998),text)
    assert historical["provenance"]["temporality"]=="historical", historical
    assert historical["provenance"]["year"]==1998, historical
    assert historical["provenance"]["context"]=="historical_archive", historical

    print("newsroom_placement_proposal: PASS")


if __name__=="__main__":
    main()
