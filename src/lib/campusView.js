import { BUILDINGS } from "./buildings";

// Bounding rectangle (in degrees) around every building's origin point, with
// a small padding margin - used to set the camera's initial view on load.
// Cesium's default starting view is the whole globe, so without this the
// app opens zoomed all the way out to space.
export function getCampusRectangleDegrees(paddingDeg = 0.004) {
  const lons = BUILDINGS.map((b) => b.origin.lon);
  const lats = BUILDINGS.map((b) => b.origin.lat);
  return {
    west: Math.min(...lons) - paddingDeg,
    south: Math.min(...lats) - paddingDeg,
    east: Math.max(...lons) + paddingDeg,
    north: Math.max(...lats) + paddingDeg,
  };
}
