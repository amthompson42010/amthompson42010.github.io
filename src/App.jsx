import { useMemo, useState } from "react";
import SceneViewer from "./components/SceneViewer";
import Sidebar from "./components/Sidebar";
import FloorSwitcher from "./components/FloorSwitcher";
import LayerPanel from "./components/LayerPanel";
import Inspector from "./components/Inspector";
import TourControls from "./components/TourControls";
import Header from "./components/Header";
import ZoomControl from "./components/ZoomControl";
import { useCesiumBuildings } from "./hooks/useCesiumBuildings";
import { usePicking } from "./hooks/usePicking";
import { flyToBuilding } from "./lib/cameraFlyTo";
import { flyToTopDown, exitTopDown } from "./lib/cameraTopDown";
import { HIDE_CATEGORIES } from "./config";
import "./App.css";

export default function App() {
  const [sceneView, setSceneView] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [topDown, setTopDown] = useState(false);
  const [pick, setPick] = useState(null);
  const [hidden, setHidden] = useState(() => new Set(HIDE_CATEGORIES));

  const { buildings, loadedCount, totalCount } = useCesiumBuildings(sceneView?.viewer);
  usePicking(sceneView?.viewer, sceneView?.Cesium, buildings, setPick);

  const selectedBuilding = buildings.find((b) => b.id === selectedId) || null;

  // union of categories actually present across every loaded building, for
  // the layer panel - toggling one applies it to all buildings at once
  // (this is a scene-wide layer tree, not a per-building one)
  const categories = useMemo(() => {
    const set = new Set();
    for (const b of buildings) for (const c of b.categories) set.add(c);
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [buildings]);

  function selectAndFlyTo(id) {
    setSelectedId(id);
    setPick(null);
    const building = buildings.find((b) => b.id === id);
    if (!building || !sceneView) return;
    if (topDown) {
      flyToTopDown(sceneView.viewer, sceneView.Cesium, building);
    } else {
      flyToBuilding(sceneView.viewer, sceneView.Cesium, building);
    }
  }

  function toggleTopDown() {
    if (!sceneView || !selectedBuilding) return;
    const next = !topDown;
    setTopDown(next);
    if (next) {
      flyToTopDown(sceneView.viewer, sceneView.Cesium, selectedBuilding);
    } else {
      exitTopDown(sceneView.viewer);
      flyToBuilding(sceneView.viewer, sceneView.Cesium, selectedBuilding);
    }
  }

  function toggleCategory(category, visible) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (visible) next.delete(category);
      else next.add(category);
      return next;
    });
    for (const b of buildings) b.setCategoryVisible(category, visible);
  }

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <aside className="left-column">
          <Sidebar
            buildings={buildings}
            loadedCount={loadedCount}
            totalCount={totalCount}
            selectedId={selectedId}
            onSelect={selectAndFlyTo}
          />
          <LayerPanel categories={categories} hidden={hidden} onToggle={toggleCategory} />
        </aside>

        <div className="main-view">
          <SceneViewer onReady={setSceneView} />
          {sceneView && (
            <div className="overlay-panels">
              <TourControls buildings={buildings} onSelect={selectAndFlyTo} />
              <FloorSwitcher
                building={selectedBuilding}
                topDown={topDown}
                onToggleTopDown={toggleTopDown}
              />
            </div>
          )}
          {sceneView && (
            <ZoomControl viewer={sceneView.viewer} Cesium={sceneView.Cesium} topDown={topDown} />
          )}
        </div>

        <aside className="right-column">
          <Inspector pick={pick} onClose={() => setPick(null)} />
        </aside>
      </div>
    </div>
  );
}
