# Home radio mural — compact presentation

Base main: 5f35e6227fbbfcbbc431bb790e52200f6573db0d (after PR #546).
Branch: style/home-radio-compact-20261011. PR #547. No merge.
Application commit: 41f5ddd45de6ea57547aa691b018caa5145548e0.

Only application changes: js/passport-radio-grid.js and css/passport-radio-grid.css. The catalogue is titled NOSSAS RÁDIOS; its subtitle uses inventory.radioCount. Existing selection callback, state synchronization, event subscriptions and TV door are unchanged. Inventory, IDs, names, streams, musical family order and all 11 project selectors are unchanged. No shared player, Bus, interlock, continuity, TV, footer, payment or editorial changes.

Cards target 34px minimum height, naturally growing for full names. Gap 4px; 3 columns through 600px; 4 through 800px; 5 through 1024px; 6 on desktop. New rules scoped to #passport-radio-catalog. Existing masthead and TV rules retain their behavior. Search only highlights; Enter focuses the first match without playback; family links only navigate to anchors. No cards hidden.

One browser round passed at 320, 360, 390, 480, 768, 1024 and 1280px: all 171 selectors present and visible, identical order, no clipped names or horizontal overflow. Median card height 34px at 390px and above; narrow screens grow for full names (38.8px median at 320/360px). Selected two existing radios through the unchanged universal player; active state, single active audio and editorial navigation continuity passed. No per-stream audit. No autoplay.

Two local preservation tests PASS. Main build PASS. Browser run: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38157001220
Screenshots: https://github.com/7-Seas-Global-and-Hafen-Consolidators/passport-radio/actions/runs/38157001220/artifacts/11709195388
Preview (existing owner-only audience preserved): https://passport-kpop-preview-20261011.mr-nomad.chatgpt.site
Site source commit: 1c496ffa75abb1da010d4c02b2e4b5db687a4e1a.

Old acquisition workflows excluded for this visual branch; documentation-only updates reuse the completed browser evidence. Detailed measured results: results.json. All other departments remain unchanged.
