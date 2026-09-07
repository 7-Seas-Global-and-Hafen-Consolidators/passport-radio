# Operation Home — Whiplash + Wikipedia + Passport

## Product direction

- Whiplash: editorial density and hierarchy.
- Wikipedia: discovery, archive depth and interlinking.
- Passport: editorial + radio/Tunnels as one navigable music universe.
- Do not reduce content; organize it.

## Protected babies — no-touch envelope

This operation MUST NOT modify player/radio engines, `audio.src`, station streams, World Dial engine/data, Tunnels/Continuous Signals engines, or Live & Rare playback logic.

Fofonete remains functionally preserved: same three image assets, support destination and existing state logic. Home changes may present or position the existing component but must not rewrite its engine/checkout behavior.

## Home ownership

- `passport-portal-v3.js`: sole owner of `#pp-feed` / River content.
- `passport-home-v5.js`: static Home DOM adapter only; it must not write `#pp-feed` or touch audio/player elements.
- Promo/store dynamic links are restricted at interaction time to relative, http(s), mailto and tel schemes.
- Native copy UX is restored without touching editorial rendering.

## Merge gate

Before merge: diff must show no player, stream, World Dial, Tunnel engine or Continuous Signals engine files changed.
