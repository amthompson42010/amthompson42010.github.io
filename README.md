# Tuskegee University — 3D Campus Viewer

A custom React app for viewing the Tuskegee campus 3D model, built with
**CesiumJS** rendering glTF models exported straight from the ArcGIS
geodatabase — no ArcGIS Online publishing, hosting, or sign-in required. It
gives:

- A branded, minimal UI
- A searchable sidebar listing every building, with click-to-fly-to
- A custom floor switcher per building, driven by per-component floor tags
  baked directly into each model's geometry
- A legend for the BIM category colors
- A "tour" mode that automatically flies between buildings

## Why Cesium instead of ArcGIS Online

The original plan published Scene1 to ArcGIS Online as a hosted Web Scene,
but that path turned out to be slow (each layer becomes its own hosted
Feature Service + Scene Service) and added ArcGIS Online item management
overhead for something that's really just "show these 5 buildings and let
me cycle floors." Instead, this app:

1. Exports each building's `*_MultiPatch` feature class straight from the
   geodatabase to COLLADA (`arcpy.conversion.MultipatchToCollada`) — this
   also exports each feature's exact real-world anchor point (lon/lat/alt).
2. Merges the thousands of per-feature COLLADA files into one glTF per
   building, positioning every feature in local ENU meters relative to a
   chosen origin point, and baking each feature's `BIMCategory` and
   `BldgLevel_Desc` (floor) into that node's `extras`.
3. Compresses each glTF with Draco (via `gltf-pipeline`) — the 5 buildings
   went from ~660MB combined down to ~67MB.
4. Loads the compressed `.glb` files here, in the browser, with Cesium,
   positioning each one at its real-world origin via
   `Cesium.Transforms.eastNorthUpToFixedFrame` — so buildings land at their
   correct geographic location on a real basemap, no ArcGIS Online needed.

The 5 buildings' `.glb` files already live in `public/models/`. If you
regenerate them (new geometry, a schema change, adding Counseling Center,
etc.), just overwrite the files there with the same names — nothing else
needs to change unless a building's origin point moves (update
`src/lib/buildings.js`).

## 1. Install and run

```
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## 2. Build for deployment

```
npm run build
```

This produces a static `dist/` folder you can host anywhere (a static file
host, S3, GitHub Pages, etc.) — it's a plain client-side app with no
server-side dependency; it just needs internet access once to fetch Cesium
from its CDN and OpenStreetMap basemap tiles.

## How the floor switcher works

The merge pipeline (`merge_collada_to_glb.py`) bakes each feature's
`BIMCategory` and `BldgLevel_Desc` (floor) straight into that feature's glTF
node as `extras`. `src/lib/gltfMeta.js` reads the small JSON header of each
`.glb` client-side (no extra network round trip — the same file Cesium
loads) to build a `floor -> [nodeNames]` lookup. `src/hooks/useCesiumBuildings.js`
turns that into a `setFloor(floorName | null)` function per building;
`src/components/FloorSwitcher.jsx` calls it, which toggles each node's
`.show` property via Cesium's `model.getNode(name)` API — `null` means "All
Floors" (show everything), and choosing a floor hides everything not
tagged with that floor, plus a small `HIDE_CATEGORIES` list in
`src/config.js` (Topography, Site, Planting, etc. — things that aren't tied
to one story and would just clutter an isolated-floor view even if
untagged).

The order the floor buttons appear in comes from each building's real
elevation (`BldgLevel_Elev`), precomputed into `src/lib/buildings.js` — it's
static data because it only needs to be computed once from the source
attribute CSVs, not recalculated at runtime.

Counseling Center isn't in this viewer yet — it was excluded from the
original ArcGIS Web Scene publish because it was never run through the
same floor-consolidation pipeline as the other 5 buildings (83 raw,
un-consolidated layers). It would need the same `MultipatchToCollada` →
merge → Draco pipeline run against its geodatabase feature class before it
could be added here the same way.

## Why Cesium is loaded from a CDN, not npm

Instead of `npm install cesium` (the npm package ships ~80MB unpacked,
mostly prebuilt static assets), this app loads Cesium at runtime from a CDN
via `src/lib/cesiumLoader.js` — the same reasoning `src/lib/arcgisEsm.js`
used for the ArcGIS SDK in an earlier version of this app, and actually
Cesium's own documented "static hosting" deployment method. If you'd rather
bundle it through npm (for fully offline use, for example), `npm install
cesium`, copy its `Build/Cesium/{Workers,Assets,ThirdParty,Widgets}`
folders into `public/cesium/`, set `window.CESIUM_BASE_URL = "/cesium/"`
before importing, and import `cesium` normally instead of using
`loadCesium()`.

## No Cesium ion account needed

This viewer deliberately avoids Cesium ion (Cesium's default hosted
imagery/terrain, which needs a free account + access token): the basemap is
plain OpenStreetMap tiles (`Cesium.OpenStreetMapImageryProvider`, no key
needed) and the ground is a smooth WGS84 ellipsoid
(`Cesium.EllipsoidTerrainProvider`, no real elevation data). Buildings still
land at their correct real-world altitude regardless, since that's baked
into each model's own placement transform — this only affects what the bare
ground/terrain looks like around them. If you want real elevation and
higher-resolution imagery later, sign up for a free Cesium ion token at
https://ion.cesium.com, set `Cesium.Ion.defaultAccessToken` in
`src/components/SceneViewer.jsx`, and swap in
`await Cesium.createWorldTerrainAsync()` / `Cesium.createWorldImageryAsync()`.

## Notes

- `public/models/*.glb` total ~67MB. If you put this project in git, that's
  a fair amount to track directly — consider Git LFS if the repo will be
  shared/cloned often.
- The first load fetches Cesium (~a few MB) plus each building's `.glb`
  from wherever it's hosted, so a slow connection will show the "Loading
  buildings… (n/5)" sidebar message for a bit, especially for Adams Hall and
  Olivia Davidson Hall (~30MB each, the largest two).
