# Magazine Grid | Living Collection™ — World Dial pilot

Base: `db5322f53ea69c367dff6d3c268a01ba66e1a234` (`main`, after Dynamic 101).

Scope: the existing **42 World Dial stations**, driven by the original public inventory. The remaining categories retain their card markup, category order, names and selectors. All **401 radio records and 11 program selectors** remain present. The catalog container adopts the requested outer maximum of 1320 px. No station, name, category, route, index or stream was edited.

## Reference and art

Owner-approved reference: `image(20261027-142309).png`, SHA-256 `0f0761679788a9e4cb9ab7ef92386c633c2b932ef85ebf5f448d6430b9289aef`. Existing-home comparison: `image(20261027-141435).png`.

The seven thumbnail assets are direct crops of the approved World Dial artwork, not newly invented covers or claims about album artwork. France, Québec, China, Mexico, Catalunya and Japan use the matching territorial artwork; other stations use the approved World Dial cover. The mountain image in the reference is used for Japan, not attributed to Paraguay. Artwork is decorative and has empty alternative text; the full original station name remains its accessible label.

Earth surface: NASA Visible Earth **Blue Marble: Land Surface, Ocean Color, Sea Ice and Clouds**, imagery by Reto Stöckli / NASA GSFC. Source: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57735/land_ocean_ice_cloud_2048.jpg . Background: https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/ . The texture is stored locally; visitors make no new request to NASA.

## Pilot implementation

- World Dial: 4 / 3 / 2 columns, 16 px desktop/tablet gaps and 14 px mobile gaps.
- White cards: minimum 100 px, 12 px radius, 1 px #E5E5E5 border and subtle shadow.
- 68×68 thumbnails; full names in Instrument Sans, 14 px; red 16 px wave indicator. The native whole-card button and its original universal selection handler are retained. No separate play button, hiding filter, pagination or expansion.
- Bodoni Moda 30 / 23 px category lead; Source Serif 4 description. World Dial header: 160 / 120 px. Earth: 130 / 90 px. Category spacing around the pilot: 48 px.
- A camera-facing hemisphere is ray-cast into a canvas. Each pixel samples the NASA texture at its **rotated 3D longitude/latitude**, with spherical shading and edge alpha. This is not a spinning flat disk or emoji.
- Rotation period: **40,000 ms**, uniform 360°; 25 fps maximum, raster 196×196, only while the header is visible and the document is active. Reduced-motion preference stops animation; it does not affect any radio.
- Wave animation is enabled only when this station is selected and the existing runtime reports actual playback.
- Future records continue to come from the existing inventory loop; there is no hard-coded list controlling inclusion. Optional `row.artwork` can supply future artwork, otherwise the approved World Dial cover is used. No new audio interface is introduced.

The renderer and header classes form the visual structure for approved genre art. Rock, Pop/Nostalgia, Dance, Jazz/Clássica and K-Pop headers are **not redesigned in this World Dial pilot**. The editorial Home, news, navigation, footer and other card styles remain unchanged.

## Verification

`node --test tests/passport_40_inventory.test.cjs tests/passport_kpop_replacement.test.cjs`

The existing Passport 40 inventory suite now includes the pilot preservation assertions; no workflow or skip guard was changed. The historical Korean suite advances only its exact grid-presentation hash and compares the original CSS prefix separately. Audio-engine and inventory comparisons remain byte-for-byte.

Real-browser runner: `node tests/passport_40_living_collection_browser.cjs` and `node tests/passport_40_living_collection_browser.cjs --mobile`. Install Playwright outside the application; set `BROWSER_EXECUTABLE` if using a nonstandard Chromium executable. The runner serves the repository locally and uses real external radio sources. It records complete names, counts, dimensions, visibility, overflow, actual decoded audio, one active signal, play/pause/volume, persistent Home → Notícias → Home navigation, a second existing station, rotation pixel hashes and reduced motion.

Screenshots and measured results are in `evidence/`. Mobile means Chromium viewport/touch emulation, not a physical phone. No merge, deployment, main update or infrastructure change is part of this PR.

### Measured results

- **10/10 local preservation assertions passed**, no skips.
- **320, 375, 390, 768, 1024 and 1440 px** passed: exact requested column counts, 68 px thumbnails, 14 px names, 16 px indicators, 12 px radii, 100 px minimum card height, header/globe/title dimensions, no clipped or hidden cards and no page horizontal overflow.
- **412 rendered selectors = 401 radios + 11 programs**; all 42 World Dial names exactly match the unchanged inventory.
- Desktop globe: **365.69° in 40.632 s**, measured from timestamps and distinct captured pixel hashes. `period=40000`; motion-reduction check passed. The GIF uses actual browser captures at their measured intervals, not accelerated or generated rotation.
- Dynamic 101, desktop: native playback **1.937 → 42.483 s**, decoded audio **4,850 → 657,646 bytes**, one active audio element. Mobile: **1.017 → 3.216 s**, **16,324 → 51,255 bytes**. No simulated audio.
- Play/pause/resume and volume **0.4** passed in both browser modes.
- **Home → Notícias → Home:** same audio element remained connected and playing, selected station and volume preserved, one active audio.
- Existing Korean station also reproduced real audio after card selection: **31,974 decoded bytes**, one active audio, in both modes.
- No uncaught page errors. Physical mobile devices and Safari/iOS were not tested.

[Desktop preview](evidence/preview-desktop.png) · [Mobile preview](evidence/preview-mobile.png) · [Actual 40-second Earth rotation](evidence/earth-rotation-real.gif)

[Desktop full pilot](evidence/world-dial-1440.png) · [Mobile full pilot](evidence/world-dial-390.png) · [Desktop measurements](evidence/results-desktop.json) · [Mobile measurements](evidence/results-mobile.json)
