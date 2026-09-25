import { useEffect, useState } from "react";

// Floor stepper: prev/next arrows, a level label, and pip dots - replaces
// the earlier flat row of floor-name buttons, matching the reference
// digital-twin-viewer's floor stepper UX. Index -1 means "All Floors".
export default function FloorSwitcher({ building, topDown, onToggleTopDown }) {
  const [index, setIndex] = useState(-1);

  useEffect(() => {
    if (building) building.setFloor(null);
    setIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [building && building.id]);

  if (!building) return null;

  const steps = ["All Floors", ...building.floors];
  const label = steps[index + 1];

  function goTo(i) {
    const clamped = Math.max(-1, Math.min(building.floors.length - 1, i));
    setIndex(clamped);
    building.setFloor(clamped === -1 ? null : building.floors[clamped]);
  }

  return (
    <div className="panel floor-switcher">
      <div className="floor-switcher-header">
        <h3>{building.name}</h3>
        <button
          className={topDown ? "view-toggle-btn active" : "view-toggle-btn"}
          onClick={onToggleTopDown}
          title={topDown ? "Switch to 3D view" : "Switch to top-down floor plan view"}
        >
          {topDown ? "3D View" : "Top View"}
        </button>
      </div>

      <div className="floor-stepper">
        <button
          className="stepper-arrow"
          onClick={() => goTo(index - 1)}
          disabled={index <= -1}
          aria-label="Previous floor"
        >
          ‹
        </button>
        <div className="stepper-label">{label}</div>
        <button
          className="stepper-arrow"
          onClick={() => goTo(index + 1)}
          disabled={index >= building.floors.length - 1}
          aria-label="Next floor"
        >
          ›
        </button>
      </div>

      {steps.length > 1 && (
        <div className="stepper-pips">
          {steps.map((s, i) => (
            <button
              key={s}
              className={i - 1 === index ? "pip active" : "pip"}
              onClick={() => goTo(i - 1)}
              title={s}
              aria-label={s}
            />
          ))}
        </div>
      )}
    </div>
  );
}
