# Native Radio Territories

Public rule: territory doors use the audience's language first; Passport Radio remains the global brand.

Single source of truth: `data/radio-territories.json` defines the current territorial discovery doors rendered on the Home. JavaScript must not keep a second hardcoded territory list.

Current doors:
- `/radio-bolivia.html` — Spanish (Bolivia), with Aymara/Quechua discovery terms.
- `/radio-korea.html` — Korean.
- `/radio-turkiye.html` — Turkish.
- `/radio-china.html` — Simplified Chinese.
- `/radio-ukraine.html` — Ukrainian.
- `/radio-iran.html` — Persian (Iran), RTL.
- `/radio-venezuela.html` — Spanish (Venezuela).
- `/radio-east-africa.html` — Swahili-first multilingual East Africa.
- `/radio-mundo-player.html?station=pk` — Urdu-first Pakistan.
- `/radio-romania.html` — Romanian, including the Romanian diaspora corridor in southern Brazil.
- `/radio-mundo-player.html?station=fi` — Finnish.
- `/radio-mundo.html` — global directory.

Editorial-only territory pages:
- `/radio-afghanistan.html` — Dari/Pashto editorial and discovery page retained for language and cultural coverage. It is not presented as a current World Dial station.

Audio safety rule: this operation does not modify `radio.html`, World Dial/player scripts, protected player scripts, existing Tunnel players, Continuous Signals, Live & Rare, Flash House, streams or interlock. `data/radio-territories.json` is a discovery-source file and does not control audio integration.

Discovery rule: public names are plain/native search language, not invented campaign names. Internal Tunnel naming may remain an architecture concept but is not required in public H1/title. Native discovery vocabulary for every registered territory lives in `data/native-radio-search-terms.json`.
