// Loads CesiumJS straight from a CDN at runtime instead of installing the
// `cesium` npm package - same reasoning as src/lib/arcgisEsm.js used for the
// ArcGIS SDK: `cesium` on npm ships ~80MB unpacked (prebuilt Workers/,
// Assets/, ThirdParty/, Widgets/ static files alongside the JS), which is
// unnecessary weight in node_modules when the published package's own
// Build/Cesium output is already meant to be served as-is from a CDN - it's
// Cesium's own documented "static hosting" deployment method.
//
// Unlike the ArcGIS SDK, Cesium's CDN build is a classic (non-ESM) script
// that assigns `window.Cesium`, and it needs `window.CESIUM_BASE_URL` set
// *before* it runs so it knows where to fetch its Workers/Assets/ThirdParty
// files from (they're not bundled into Cesium.js itself). So this loads it
// via a plain <script> tag injected at runtime, after setting that global.
const CESIUM_VERSION = "1.145.0";
const CESIUM_BASE_URL = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;

let loadPromise = null;

function loadStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      if (window.Cesium) return resolve();
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error(`Failed to load Cesium from ${src}. Check your internet connection.`));
    document.head.appendChild(script);
  });
}

// Resolves to the global Cesium namespace once loaded. Safe to call multiple
// times - subsequent calls reuse the same in-flight/settled promise.
export function loadCesium() {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    window.CESIUM_BASE_URL = CESIUM_BASE_URL;
    loadStylesheet(`${CESIUM_BASE_URL}Widgets/widgets.css`);
    await loadScript(`${CESIUM_BASE_URL}Cesium.js`);
    if (!window.Cesium) {
      throw new Error("Cesium script loaded but window.Cesium is undefined.");
    }
    return window.Cesium;
  })();

  return loadPromise;
}
