import { useEffect, useRef, useState } from "react";
import { loadCesium } from "../lib/cesiumLoader";
import { getCampusRectangleDegrees } from "../lib/campusView";

// Sets up a plain CesiumJS Viewer - no Cesium ion account/token needed:
// OpenStreetMap tiles for imagery (free, no key) and a smooth WGS84
// ellipsoid for terrain (no real elevation data, but our buildings each
// carry their own correct real-world altitude baked into their placement
// transform, so this only affects what the bare ground looks like, not
// whether buildings are positioned correctly). A free Cesium ion token can
// be dropped in later (Cesium.Ion.defaultAccessToken) for real-world terrain
// and higher-res imagery if wanted.
export default function SceneViewer({ onReady }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let viewer;
    let cancelled = false;

    async function init() {
      try {
        const Cesium = await loadCesium();
        if (cancelled) return;

        viewer = new Cesium.Viewer(containerRef.current, {
          baseLayerPicker: false,
          baseLayer: new Cesium.ImageryLayer(new Cesium.OpenStreetMapImageryProvider()),
          terrainProvider: new Cesium.EllipsoidTerrainProvider(),
          geocoder: false,
          homeButton: false,
          sceneModePicker: false,
          navigationHelpButton: false,
          animation: false,
          timeline: false,
          fullscreenButton: false,
          infoBox: false,
          selectionIndicator: false,
          shadows: false,
          msaaSamples: 4,
        });
        viewer.scene.globe.depthTestAgainstTerrain = true;

        // A fixed studio-style light + ambient occlusion were tried here to
        // match the ArcGIS reference's evenly-lit look, but on this
        // pipeline's geometry - lots of unwelded, overlapping/coincident
        // surfaces from independently-triangulated BIM features (a wall
        // flush against a floor, ductwork tight against a ceiling, small
        // roof-level facets) - a single hard directional light with no fill
        // light plus screen-space ambient occlusion produced a patchy,
        // blotchy-dark look instead (confirmed via a user screenshot: whole
        // roof read as near-black with only faint edges visible, in the
        // orthographic top-down view especially). Reverted.
        //
        // The patchiness persisted even after that revert, though - the
        // remaining common factor is `shadows: true` (present since the very
        // first version of this viewer, unrelated to the normals/AO work).
        // Cesium's shadow map follows the real solar position for whatever
        // time someone opens the app; self-shadowing from the many small
        // standing objects on these buildings' roofs (AC units, curbs,
        // parapets, vents) at anything but a straight-overhead sun angle
        // casts long shadows across the surrounding flat roof - especially
        // damaging in the orthographic top-down "floor plan" view, where the
        // camera looks straight down at exactly that roofline. This reads as
        // a dark, blotchy mess for the same reason it wasn't as obvious
        // before the normals fix: once real per-vertex normals gave direct
        // light a visible shading gradient to work with, the contrast
        // between lit and self-shadowed areas became far more visible.
        // Turned shadows off entirely rather than trying to tune around it.
        // MSAA (pure anti-aliasing, unrelated to either lighting or shadows)
        // is kept.

        // Cesium's starting view is the whole globe - point the camera at
        // the campus immediately (independent of the building models still
        // loading) using each building's known origin, rather than leaving
        // the viewer showing planet Earth until something else moves the
        // camera.
        const rect = getCampusRectangleDegrees();
        viewer.camera.setView({
          destination: Cesium.Rectangle.fromDegrees(rect.west, rect.south, rect.east, rect.north),
        });

        if (cancelled) {
          viewer.destroy();
          return;
        }
        onReady({ viewer, Cesium });
      } catch (e) {
        console.error(e);
        if (!cancelled) setError(e.message || String(e));
      }
    }

    init();

    return () => {
      cancelled = true;
      if (viewer && !viewer.isDestroyed()) viewer.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="scene-container">
      <div ref={containerRef} className="scene-view" />
      {error && (
        <div className="scene-error">
          <h2>Couldn't load the 3D viewer</h2>
          <p>{error}</p>
          <p>
            This viewer loads CesiumJS from a CDN at runtime, so it needs an
            internet connection the first time it opens.
          </p>
        </div>
      )}
    </div>
  );
}
