# Globo de Ouro Tunnel™ · 1973–1990

## Signal contract

Audio-only archival signal. No video or iframe is rendered in Passport Radio.

Each media item is a complete historical block when available:

`presenter → applause/vignette → artist → song → closing/applause`

Do not split presenter from the artist they introduce.

## Library layout

- 1973/
- 1974/
- 1975/
- 1976/
- 1977/
- 1978/
- 1979/
- 1980/
- 1981/
- 1982/
- 1983/
- 1984/
- 1985/
- 1986/
- 1987/
- 1988/
- 1989/
- 1990/

Naming: `YYYY-NNN-artist-title.mp3`.

## Broadcast

Recommended origin: AzuraCast / Liquidsoap / Icecast. The Passport frontend consumes one stable external MP3 mount URL. Media is not stored in the GitHub Pages repository.

Runtime endpoint:

`window.PASSPORT_GLOBO_DE_OURO_STREAM = "https://<radio-origin>/<mount>.mp3"`

The isolated engine is `/js/globo-de-ouro-tunnel.js` and exposes `window.PassportGloboOuroTunnel.setStream(url)` for runtime configuration.

## Rotation

Shuffle complete blocks, not loose songs. Prefer full-library shuffle rounds, with future scheduling rules to avoid adjacent repeats of the same artist/year. Keep a fallback audio source at the broadcast origin so the mount remains continuous.

## Protected scope

Existing Passport tunnel engines, Live & Rare™, Continuous Signals™, player interlocks and existing audio URLs are not replaced by this engine.
