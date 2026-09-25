// Most-common baked-in material color per Revit/BIM category, sampled across
// all 5 buildings' source geometry (same colors already baked into each
// GLB's materials from Pro's own symbology) - used only to draw the legend,
// since Cesium just renders whatever color is already in the glTF materials.
export const CATEGORY_COLORS = {
  Doors: "#f9f9f9",
  StairsRailing: "#7f7f7f",
  CurtainWallMullions: "#f4f4f4",
  Windows: "#f5f5f3",
  Walls: "#f9f9f9",
  Floors: "#c0c0c0",
  CurtainWallPanels: "#f5f5f3",
  Roofs: "#90918b",
  Rooms: "#ffffff",
  Ceilings: "#f9f9f9",
  ExteriorShell: "#7f7f7f",
  Stairs: "#d4d4d4",
  SpecialtyEquipment: "#bdbbb9",
  Furniture: "#7f7f7f",
  Casework: "#bca17c",
  StructuralColumns: "#c0c0c0",
  GenericModel: "#7f7f7f",
  Topography: "#c0c0c0",
  PlumbingFixtures: "#f4f4f4",
  StructuralFraming: "#7f7f7f",
  LightingFixtures: "#ffffff",
  MechanicalEquipment: "#ffffff",
  Planting: "#7f7f7f",
  AirTerminals: "#ffffff",
  DuctFitting: "#7f7f7f",
  Ramps: "#7f7f7f",
  Ducts: "#7f7f7f",
  Site: "#444444",
  Columns: "#7f7f7f",
};

// A shorter, curated set actually worth showing in the legend UI (the full
// 29-category list is a lot of near-identical grays) - the categories a
// viewer actually cares about distinguishing at a glance.
export const LEGEND_CATEGORIES = [
  "Walls",
  "Windows",
  "Doors",
  "Roofs",
  "Floors",
  "Stairs",
  "Casework",
  "Furniture",
  "StructuralColumns",
  "Topography",
];
