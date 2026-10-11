# Approved stream replacement

Base: ab46567bd27980b634ec666ee444885718158ca3
Branch: fix/passport-kpop-approved-streams-20261011

Removed only 23 SeoulFM records. Added six unique approved direct streams. Total: 154 preserved + 6 = 160 radios. Big B KPOP was not duplicated: existing ID `kr` / 한국 음악 라디오 already uses exactly that URL and remains unchanged. K-Pop Now and K-Pop Mix remain in the Korean family; Japan Hits is in World Dial; Global Pop, Gold Hits, Top Hits are in Pop, Décadas & Nostalgia. Existing CSS and grid are unchanged.

Removed the unused Korean-only HLS opt-in condition; the existing transport is byte-identical to the validated 154-channel version. Existing non-Korean HLS support remains. No universal player, Bus, interlock, continuity, TV or content changes.

Validation: three focused preservation tests pass; all six added streams decode two seconds of actual non-silent audio (FFmpeg; this alone is not browser integration proof). Browser workflow performs one bounded round through the existing universal player, pause/resume, exclusivity and desktop/mobile overflow. No original-service research, preview creation or merge.
