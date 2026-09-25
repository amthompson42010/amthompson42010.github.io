// Simple +/- zoom buttons. Cesium's default mouse-wheel/pinch zoom is
// already enabled on the viewer, but with every other built-in navigation
// widget turned off (baseLayerPicker, homeButton, navigationHelpButton,
// etc. - see SceneViewer.jsx) there's no visible, discoverable zoom
// control on screen, which is easy to miss on a trackpad.
//
// `camera.zoomIn`/`zoomOut` just move the camera position along its view
// vector (confirmed against the installed Cesium 1.145.0 bundle) - that
// works fine for the normal perspective 3D view, but has NO visible effect
// in the orthographic top-down view (lib/cameraTopDown.js), since an
// orthographic projection's apparent scale depends only on
// `frustum.width`, not camera distance. So this scales `frustum.width`
// directly whenever the top-down view is active, and falls back to the
// normal camera move otherwise.
export default function ZoomControl({ viewer, Cesium, topDown }) {
  if (!viewer) return null;

  function isOrthographic() {
    return topDown && Cesium && viewer.camera.frustum instanceof Cesium.OrthographicFrustum;
  }

  function currentHeight() {
    const cartographic = viewer.camera.positionCartographic;
    const height = cartographic && Number.isFinite(cartographic.height) ? cartographic.height : 500;
    return Math.max(height, 5);
  }

  function zoomIn() {
    if (isOrthographic()) {
      viewer.camera.frustum.width *= 0.7;
      return;
    }
    viewer.camera.zoomIn(currentHeight() * 0.4);
  }

  function zoomOut() {
    if (isOrthographic()) {
      viewer.camera.frustum.width /= 0.7;
      return;
    }
    viewer.camera.zoomOut(currentHeight() * 0.5);
  }

  return (
    <div className="zoom-control">
      <button onClick={zoomIn} title="Zoom in" aria-label="Zoom in">
        +
      </button>
      <button onClick={zoomOut} title="Zoom out" aria-label="Zoom out">
        −
      </button>
    </div>
  );
}
