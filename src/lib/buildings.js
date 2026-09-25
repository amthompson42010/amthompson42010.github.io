// Static manifest for the Cesium/glTF pipeline (Option B). Each building was
// exported from its ArcGIS geodatabase MultiPatch feature class, converted to
// COLLADA, then merged into one Draco-compressed GLB with per-feature nodes
// positioned in local ENU meters relative to an "origin" point. Placing that
// origin at its real-world lon/lat/alt via Cesium.Transforms.eastNorthUpToFixedFrame
// puts every feature at its exact correct geographic position.
//
// originLon/Lat/Alt and feature counts came straight out of the merge
// pipeline's companion <Building>.json files - see project docs for how
// these were produced (ArcGIS MultipatchToCollada -> pycollada -> pygltflib
// -> gltf-pipeline Draco compression).
//
// `floors` is the ordered (by real elevation, low to high) list of "real"
// building stories (BldgLevel_IsBuildingStory = 1), used only to order the
// floor-switcher buttons - the actual visibility filtering at runtime reads
// each node's own `extras.floor` tag baked into the GLB.
export const BUILDINGS = [
  {
    id: "AdamsHall",
    name: "Adams Hall",
    file: "/models/AdamsHall.glb",
    origin: { lon: -85.70361131427741, lat: 32.42993506021061, alt: 9.333299999998417 },
    features: 17480,
    floors: [
      "Level 1 - Fallout Shelter",
      "Level 1 - Housing Office",
      "Level 1 - Mechanical",
      "Level 1 - Intermediate",
      "Level 1 - Upper",
      "Level 2 - Lower",
      "Level 2 - Intermediate",
      "Level 2 - Upper",
      "Level 3 - Lower",
      "Level 3 - Upper",
      "Level 4",
      "Level 5",
      "TOP OF ROOF",
    ],
  },
  {
    id: "OliviaDavidsonHall",
    name: "Olivia Davidson Hall",
    file: "/models/OliviaDavidsonHall.glb",
    origin: { lon: -85.70407917708947, lat: 32.43112011180603, alt: 7.902700000006007 },
    features: 14463,
    floors: [
      "Basement Level",
      "Level 1 - Mech Slab",
      "Level 1",
      "Level 2.0",
      "STAIR 2 - LEVEL 2.1",
      "Level 2.2",
      "Level 3",
      "Level 4",
      "TOP OF ROOF",
    ],
  },
  {
    id: "KresgeCenter",
    name: "Kresge Center",
    file: "/models/KresgeCenter.glb",
    origin: { lon: -85.70851229901163, lat: 32.43090124138768, alt: 10.0 },
    features: 2259,
    floors: [
      "Basement",
      "L1",
      "Lower L2",
      "Upper L2",
      "Lower L3",
      "Upper L3",
      "Lower Roof",
      "Upper Roof",
      "Roof Over Lobby",
    ],
  },
  {
    id: "WilcoxE",
    name: "Wilcox E",
    file: "/models/WilcoxE.glb",
    origin: { lon: -85.70954137374227, lat: 32.430366600712915, alt: 2.7397000000055414 },
    features: 604,
    floors: ["Level 1", "Level 2", "Roof Plan"],
  },
  {
    id: "PhysicalPlant",
    name: "Physical Plant",
    file: "/models/PhysicalPlant.glb",
    origin: { lon: -85.70185121504767, lat: 32.42979151292087, alt: 20.335500000001048 },
    features: 1301,
    floors: ["L1", "L2", "L3"],
  },
];
