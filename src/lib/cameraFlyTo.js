// Flies the Cesium camera to frame a loaded building. Prefers the model's
// own bounding sphere (tightest framing), but that getter can throw from
// deep inside Cesium's internals if read before the model's internal scene
// graph has finished its first update pass (confirmed in practice: "Cannot
// read properties of undefined (reading 'boundingSphere')" thrown from
// Cesium.js itself, not from this file, when clicking a building right
// after it loads). Rather than depend on that timing, this always has a
// reliable fallback: the building's own known real-world origin, which
// requires nothing from Cesium/the model at all.
export function flyToBuilding(viewer, Cesium, building, { duration = 2 } = {}) {
  if (!viewer || !Cesium || !building) return;

  if (building.model && building.model.ready) {
    try {
      const sphere = building.model.boundingSphere;
      if (sphere && Number.isFinite(sphere.radius) && sphere.radius > 0) {
        viewer.camera.flyToBoundingSphere(sphere, {
          duration,
          offset: new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(-30),
            Cesium.Math.toRadians(-35),
            sphere.radius * 2.5
          ),
        });
        return;
      }
    } catch (e) {
      console.warn(`flyToBuilding: boundingSphere unavailable for ${building.name}, falling back to origin`, e);
    }
  }

  const { lon, lat, alt } = building.origin;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt + 150),
    orientation: {
      heading: Cesium.Math.toRadians(0),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0,
    },
    duration,
  });
}
