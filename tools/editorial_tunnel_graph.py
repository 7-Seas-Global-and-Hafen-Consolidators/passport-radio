#!/usr/bin/env python3
"""Passport Editorial Graph™ — production-safe Tunnel integration.

This launcher keeps the resilient worldwide discovery/scoring/selection pipeline
unchanged and enriches only its private JSON output with topic intelligence.
No source limits, publication limits, crawling rules or site/player code change.
"""
from __future__ import annotations

from typing import Any

import editorial_tunnel_resilient as resilient
import editorial_tunnel as base
import editorial_topic_intelligence as intelligence

_ORIGINAL_ARTICLE_TO_DICT = base.article_to_dict


def article_to_dict_with_topic_intelligence(
    article: base.Article, include_internal: bool = True
) -> dict[str, Any]:
    payload = _ORIGINAL_ARTICLE_TO_DICT(article, include_internal=include_internal)
    return intelligence.enrich_dict(article, payload)


# base.main() resolves this function at runtime, so both editorial-radar.json and
# editorial-daily.json receive the enrichment without changing selection logic.
base.article_to_dict = article_to_dict_with_topic_intelligence


def main() -> int:
    return resilient.main()


if __name__ == "__main__":
    raise SystemExit(main())
