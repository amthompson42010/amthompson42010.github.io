import { useEffect, useRef, useState } from "react";
import { loadCesium } from "../lib/cesiumLoader";
import { parseGlbNodeExtras } from "../lib/gltfMeta";
import { BUILDINGS } from "../lib/buildings";
import { HIDE_CATEGORIES } from "../config";

const DEFAULT_HIDDEN = new Set(HIDE_CATEGORIES);

// Loads every building's GLB, places it at its real-world origin, and
// exposes per-building visibility controls that read the category/floor
// tags baked into each node's `extras` by the merge pipeline
// (merge_collada_to_glb.py):
//   - setFloor(floorName | null): isolate one floor, or show all of them
//   - setCategoryVisible(category, visible): show/hide a whole BIM category,
//     independent of (and combined with) the current floor selection
//   - getNodeInfo(nodeName): category/floor/isStory for a clicked node, for
//     the asset inspector
// Floor and category filters combine (a node shows only if its floor
// matches AND its category isn't hidden) rather than being two separate
// on/off switches layered awkwardly on top of each other.
//
// Categories start hidden per the same convention used everywhere else in
// this project (Topography/Site/Mass/Parking/Roads/Hardscape/Planting/
// Entourage are hidden by ArcGIS Scene1's own definition query and by the
// step65 export filter) - the layer panel lets the user turn them back on.
//
// Buildings are added to `buildings` state one at a time as each finishes
// loading, rather than waiting for all 5 (Adams Hall and Olivia Davidson
// Hall are ~10MB each), so the viewer fills in progressively.
export function useCesiumBuildings(viewer) {
  const [buildings, setBuildings] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!viewer) return;
    cancelledRef.current = false;
    setBuildings([]);
    setLoadedCount(0);

    async function loadOne(entry) {
      const Cesium = await loadCesium();

      const response = await fetch(entry.file);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${entry.file}: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const { nodesByFloor, allNodeNames, categoryByNode, oidByNode } = parseGlbNodeExtras(arrayBuffer);

      const originCartesian = Cesium.Cartesian3.fromDegrees(
        entry.origin.lon,
        entry.origin.lat,
        entry.origin.alt
      );
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(originCartesian);

      const model = await Cesium.Model.fromGltfAsync({
        url: entry.file,
        modelMatrix,
        // Real-time sun shadows caused a dark, patchy self-shadowing look on
        // roof-level equipment (see SceneViewer.jsx) - disabled to match the
        // viewer's own `shadows: false` setting.
        shadows: Cesium.ShadowMode.DISABLED,
      });
      if (cancelledRef.current) return null;

      viewer.scene.primitives.add(model);

      // floors actually present in this building's data, in the manifest's
      // real-elevation order (drops any manifest floor name with no nodes -
      // shouldn't happen, but keeps this robust to data drift)
      const floors = entry.floors.filter((f) => nodesByFloor.has(f));

      // unique categories actually present, alphabetical, for the layer panel
      const categories = [...new Set(categoryByNode.values())]
        .filter((c) => c)
        .sort((a, b) => a.localeCompare(b));

      let currentFloor = null; // null = all floors
      const hiddenCategories = new Set(DEFAULT_HIDDEN);

      function applyVisibility() {
        for (const [floor, names] of nodesByFloor.entries()) {
          const floorMatches = currentFloor === null || floor === currentFloor;
          for (const name of names) {
            const node = model.getNode(name);
            if (!node) continue;
            const cat = categoryByNode.get(name);
            node.show = floorMatches && !hiddenCategories.has(cat);
          }
        }
      }
      applyVisibility();

      function setFloor(floorName) {
        currentFloor = floorName;
        applyVisibility();
      }

      function setCategoryVisible(category, visible) {
        if (visible) hiddenCategories.delete(category);
        else hiddenCategories.add(category);
        applyVisibility();
      }

      function getNodeInfo(nodeName) {
        if (!allNodeNames.includes(nodeName)) return null;
        // node names are "grp_<index>_<category>_<floor>" for a merged
        // group, or "feat_<oid>_<category>_<floor>" for an individually-
        // clickable feature (see merge_collada_to_glb.py's
        // INDIVIDUAL_CLICK_CATEGORIES) - but everything returned here comes
        // from the parsed extras, not by parsing the name string.
        const oid = oidByNode.get(nodeName) ?? null;
        for (const [floor, names] of nodesByFloor.entries()) {
          if (names.includes(nodeName)) {
            return { category: categoryByNode.get(nodeName) ?? null, floor, oid };
          }
        }
        return { category: categoryByNode.get(nodeName) ?? null, floor: null, oid };
      }

      return {
        id: entry.id,
        name: entry.name,
        features: entry.features,
        origin: entry.origin,
        model,
        floors,
        categories,
        defaultHiddenCategories: DEFAULT_HIDDEN,
        setFloor,
        setCategoryVisible,
        getNodeInfo,
      };
    }

    (async () => {
      const results = await Promise.allSettled(
        BUILDINGS.map((entry) =>
          loadOne(entry).catch((e) => {
            console.error(`Failed to load ${entry.name}:`, e);
            throw e;
          })
        )
      );
      if (cancelledRef.current) return;

      // append in manifest order as each settles, rather than out-of-order
      // arrival, so the sidebar list stays stable
      const built = [];
      for (const r of results) {
        if (r.status === "fulfilled" && r.value) built.push(r.value);
      }
      setBuildings(built);
      setLoadedCount(built.length);
    })();

    return () => {
      cancelledRef.current = true;
    };
  }, [viewer]);

  return { buildings, loadedCount, totalCount: BUILDINGS.length };
}
