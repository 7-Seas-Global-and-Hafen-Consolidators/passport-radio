#!/usr/bin/env python3
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

import newsroom_editorial_confidence as c

SCORE=0.68
CONF=0.80

def ev(meta,item): return c.evaluate(meta,item,score_threshold=SCORE,confidence_threshold=CONF)

def main():
    item={"title":"Band X announces new album in 2026","deck":"New album announcement","published_at":"2026-08-30","entities":["Band X"]}
    r=ev({"title":"Band X new album","channel":"XYZ MUSIC","published_at":"2026-08-30"},item)
    assert r["authority"] <= .40, r
    assert r["authority_reason"] == "generic_channel_word_only", r

    r=ev({"title":"Band X announces new album 2026","channel":"Band X Official","published_at":"2026-08-29"},item)
    assert r["authority"] >= .84 and r["temporal_class"] == "current_window", r

    r=ev({"title":"Band X live","channel":"Band X Official","published_at":"2014-01-01"},item)
    assert "historical_without_event_context" in r["vetoes"], r

    multi={"title":"Artist Alpha and Artist Beta announce collaboration","deck":"Artist Alpha joins Artist Beta for new single","published_at":"2026-08-30","entities":["Artist Alpha","Artist Beta"]}
    r=ev({"title":"Artist Alpha new single","channel":"Artist Alpha Official","published_at":"2026-08-30"},multi)
    assert "multi_entity_context_missing" in r["vetoes"], r
    r=ev({"title":"Artist Alpha + Artist Beta new single collaboration","channel":"Artist Alpha Official","published_at":"2026-08-30"},multi)
    assert "multi_entity_context_missing" not in r["vetoes"], r

    poly={"title":"Polyphia anuncia novo álbum Be Not Afraid","deck":"Novo álbum em outubro","published_at":"2026-08-28","entities":["Polyphia","Rise Records"],"_article_context":"O videoclipe de POWER IN THE BLOOD foi gravado no Rio de Janeiro para a fase Be Not Afraid.","_media_terms":["Be Not Afraid","POWER IN THE BLOOD"]}
    q=c.build_query(poly)
    assert "Polyphia" in q and "POWER IN THE BLOOD" in q and "Be Not Afraid" in q, q
    assert c.central_entities(poly)==["Polyphia"], c.central_entities(poly)
    full=ev({"title":"Polyphia - POWER IN THE BLOOD (Official Music Video)","channel":"Polyphia","published_at":"","description":""},poly)
    promo=ev({"title":"BE NOT AFRAID 10/23. New song POWER IN THE BLOOD out now.","channel":"Polyphia","published_at":"","description":""},poly)
    assert full["media_class"]=="music_video" and full["confidence"]>=CONF, full
    assert promo["media_class"]=="promo_clip" and full["media_priority"]>promo["media_priority"], (full,promo)

    coc={"title":"Corrosion of Conformity e The Sword anunciam turnê conjunta","deck":"Corrosion of Conformity e The Sword unem forças em novembro","published_at":"2026-08-25","entities":["Corrosion of Conformity","The Sword","Good God / Baad Man"],"_article_context":"Corrosion of Conformity segue o ciclo de Good God / Baad Man durante a turnê conjunta.","_media_terms":["Good God / Baad Man"]}
    r=ev({"title":"Corrosion of Conformity - Gimme Some Moore","channel":"Nuclear Blast Records","published_at":"2026-02-11","description":"From Good God / Baad Man"},coc)
    assert "multi_entity_context_missing" in r["vetoes"], r

    assert r["thresholds"] == {"score":SCORE,"confidence":CONF}, r
    print("newsroom_media_golden: PASS")

if __name__ == "__main__": main()
