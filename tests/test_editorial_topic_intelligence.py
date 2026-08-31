#!/usr/bin/env python3
from dataclasses import dataclass, field
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))

import editorial_topic_intelligence as intel


@dataclass
class Item:
    title: str
    description: str = ""
    total_score: int = 60
    trend_score: int = 60
    passport_score: int = 80
    archive_score: int = 30
    age_hours: float | None = 8
    already_covered: bool = False
    origins: list[dict[str, str]] = field(default_factory=list)


def test_multisource_heat():
    one = Item("Slipknot announces new chapter", origins=[{"source": "A", "url": "a"}])
    three = Item("Slipknot announces new chapter", origins=[
        {"source": "A", "url": "a"}, {"source": "B", "url": "b"}, {"source": "C", "url": "c"}
    ])
    assert intel.hot_score(three) > intel.hot_score(one)
    assert intel.source_count(three) == 3


def test_question_becomes_answer():
    item = Item("Por que Anders Colsefni saiu do Slipknot?", trend_score=55)
    assert intel.recommended_action(item) == intel.ACTION_ANSWER


def test_hot_covered_topic_becomes_update():
    item = Item(
        "Ramones tribute returns in 2026", total_score=76, trend_score=86, already_covered=True,
        origins=[{"source": "A", "url": "a"}, {"source": "B", "url": "b"}],
    )
    assert intel.recommended_action(item) == intel.ACTION_UPDATE


def test_archive_multisource_can_be_dossier():
    item = Item(
        "The history and legacy of Rush", total_score=74, archive_score=88,
        origins=[{"source": "A", "url": "a"}, {"source": "B", "url": "b"}],
    )
    assert intel.recommended_action(item) == intel.ACTION_DOSSIER


def test_enrichment_contract():
    item = Item("Ramones — 50 anos depois", origins=[{"source": "A", "url": "a"}])
    out = intel.enrich_dict(item, {"title": item.title})
    assert out["title"] == item.title
    assert out["topic_key"]
    assert out["entity_hint"]
    assert out["source_count"] == 1
    assert 0 <= out["hot_score"] <= 100
    assert out["editorial_action"] in {"SIGNAL", "ANSWER", "STORY", "DOSSIER", "UPDATE"}


if __name__ == "__main__":
    test_multisource_heat()
    test_question_becomes_answer()
    test_hot_covered_topic_becomes_update()
    test_archive_multisource_can_be_dossier()
    test_enrichment_contract()
    print("editorial_topic_intelligence: PASS")
