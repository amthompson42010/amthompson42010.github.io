// A straight-down, north-up "floor plan" camera mode - switches Cesium's
// camera to an orthographic projection (no perspective distortion, so
// distances/angles in the view are directly comparable to a real floor
// plan or to the basemap underneath) and points it straight down at the
// selected building.
//
// IMPORTANT ORDERING GOTCHA (root cause of the "zoom is always too far
// out, changing padding does nothing" bug): `camera.setView()`, when given
// a plain Cartesian3 `destination` while the camera is orthographic,
// silently recomputes `frustum.width` itself from the camera's height
// above the destination (mimicking what a perspective FOV would show at
// that height) - verified against the installed Cesium 1.145.0 bundle.
// So if `frustum.width` is set *before* `setView`, `setView` throws that
// value away and substitutes its own (much larger, since our camera sits
// hundreds of meters up for a clean top-down shot). This previously made
// the `padding` constant a no-op in practice - lowering it from 1.3 to 1.0
// changed nothing on screen because `setView` clobbered whichever value
// was set. Fix: call `setView` FIRST to position/orient the camera, THEN
// switch to orthographic and set `frustum.width` LAST, so nothing after it
// can override our value.
export function flyToTopDown(viewer, Cesium, building, { padding = 1.1 } = {}) {
  if (!viewer || !Cesium || !building) return;

  // Same defensive pattern as cameraFlyTo.js: model.boundingSphere can
  // throw before the model's internal scene graph has settled, so this
  // falls back to a generous fixed radius (comfortably fits any of these
  // buildings) rather than depending on it.
  let radius = 60;
  if (building.model && building.model.ready) {
    try {
      const sphere = building.model.boundingSphere;
      if (sphere && Number.isFinite(sphere.radius) && sphere.radius > 0) {
        radius = sphere.radius;
      }
    } catch (e) {
      console.warn(`flyToTopDown: boundingSphere unavailable for ${building.name}, using default radius`, e);
    }
  }

  const { lon, lat, alt } = building.origin;
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, alt + radius * 4 + 200),
    orientation: {
      heading: Cesium.Math.toRadians(0), // north up, matching a real floor plan
      pitch: Cesium.Math.toRadians(-90), // straight down
      roll: 0,
    },
  });

  viewer.camera.switchToOrthographicFrustum();

  // `frustum.width` is the horizontal extent only; the vertical extent is
  // `width / aspectRatio`. On a landscape (wider-than-tall) viewport,
  // aspectRatio > 1, so sizing purely off the diameter would crop the top
  // and bottom of the building. Scale by aspectRatio (when > 1) so the
  // full bounding-sphere diameter fits in BOTH dimensions, not just width.
  const aspect =
    viewer.camera.frustum.aspectRatio ||
    viewer.canvas.clientWidth / viewer.canvas.clientHeight ||
    1;
  const diameter = radius * 2 * padding;
  viewer.camera.frustum.width = diameter * Math.max(1, aspect);
}

export function exitTopDown(viewer) {
  if (!viewer) return;
  viewer.camera.switchToPerspectiveFrustum();
}
