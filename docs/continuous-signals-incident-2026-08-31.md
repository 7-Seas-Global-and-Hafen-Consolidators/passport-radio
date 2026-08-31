# Continuous Signals incident — 2026-08-31

Observed symptom: Passport Live displayed `ERRO AO CONECTAR` when attempting METAL.

Protected channel identities and primary endpoints were preserved:

- METAL — `https://stations.radio-host.com/proxy/metalmanialive/stream`
- UNPLUGGED — `https://stations.radio-host.com/proxy/unpluggedlive/stream`
- LIVE JAM — `https://stations.radio-host.com/proxy/livejam/stream`

Recovery hardens the browser playback path rather than replacing stations: explicit reload, one cache-busted reconnect attempt, stale-attempt cancellation, user-pause protection, and preservation of the archive/live mutual exclusion.

No World Dial, Tunnel, Live & Rare, Flash House, or other player is changed by this incident patch.
