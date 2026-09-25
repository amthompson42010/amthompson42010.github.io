import { useEffect, useRef } from "react";

// Wires a left-click handler on the Cesium viewer that resolves a click to
// (building, node, category, floor) for the asset inspector.
//
// Cesium's scene.pick() on one of our merged-group Model nodes returns
// `{ model, node, primitive }` (verified against the installed Cesium
// 1.145.0 minified bundle: `lxe` builds exactly this shape whenever the
// model has no custom `pickObject` set, which ours don't). `node` is the
// glTF runtime node - it carries a `.name` matching the node names this
// pipeline bakes into each merged group (`grp_<index>_<category>_<floor>`),
// which is exactly what `building.getNodeInfo(name)` (useCesiumBuildings.js)
// looks up.
//
// Resolution is at the merged-group level for most categories - features
// were merged by (floor, category, color) during export
// (merge_collada_to_glb.py), and our plain GLBs carry no EXT_mesh_features
// batch IDs that would let Cesium's ModelFeature API resolve further within
// a merged group. So a click on a wall reports "this is part of the Walls
// on Floor 2", not "this one specific wall panel". HVAC/electrical
// categories (Ducts, DuctFitting, AirTerminals, MechanicalEquipment,
// LightingFixtures, SpecialtyEquipment) are the exception: the merge
// pipeline keeps those as one node per original feature specifically so
// they resolve to an individual element (`info.oid` is set) rather than a
// whole-floor blob.
export function usePicking(viewer, Cesium, buildings, onPick) {
  const buildingsRef = useRef(buildings);
  buildingsRef.current = buildings;
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!viewer || !Cesium) return;

    function handleClick(movement) {
      const picked = viewer.scene.pick(movement.position);
      if (!picked || !picked.model || !picked.node?.name) {
        onPickRef.current(null);
        return;
      }
      const building = buildingsRef.current.find((b) => b.model === picked.model);
      if (!building) {
        onPickRef.current(null);
        return;
      }
      const nodeName = picked.node.name;
      const info = building.getNodeInfo(nodeName);
      onPickRef.current({
        buildingId: building.id,
        buildingName: building.name,
        nodeName,
        category: info?.category ?? null,
        floor: info?.floor ?? null,
        oid: info?.oid ?? null,
      });
    }

    viewer.screenSpaceEventHandler.setInputAction(handleClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    return () => {
      if (!viewer.isDestroyed()) {
        viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
      }
    };
  }, [viewer, Cesium]);
}
