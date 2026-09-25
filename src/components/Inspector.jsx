// Right-hand asset inspector: shows what was last clicked in the 3D view.
// Mirrors the reference digital-twin-viewer's inspector panel, at the
// resolution our data actually supports - see usePicking.js. Most
// categories resolve to a merged group (many original BIM elements sharing
// a floor/category/color); HVAC and electrical categories resolve to one
// specific element (pick.oid is set) since the merge pipeline keeps those
// individually clickable.
export default function Inspector({ pick, onClose }) {
  if (!pick) {
    return (
      <div className="panel inspector-panel inspector-empty">
        <h4>Asset Inspector</h4>
        <p className="inspector-hint">Click any part of a building to see its details here.</p>
      </div>
    );
  }

  const isIndividual = pick.oid != null;

  return (
    <div className="panel inspector-panel">
      <div className="inspector-header">
        <h4>Asset Inspector</h4>
        <button className="inspector-close" onClick={onClose} aria-label="Close inspector">
          ×
        </button>
      </div>
      <dl className="inspector-fields">
        <dt>Building</dt>
        <dd>{pick.buildingName}</dd>
        <dt>Category</dt>
        <dd>{pick.category || "Unknown"}</dd>
        <dt>Floor</dt>
        <dd>{pick.floor || "—"}</dd>
        {isIndividual ? (
          <>
            <dt>Element</dt>
            <dd>Individual feature (ID {pick.oid})</dd>
          </>
        ) : (
          <>
            <dt>Element group</dt>
            <dd>
              All {pick.category || "elements"} on {pick.floor || "this floor"} (grouped for
              performance - not individually selectable)
            </dd>
          </>
        )}
        <dt>Node</dt>
        <dd className="inspector-mono">{pick.nodeName}</dd>
      </dl>
      {isIndividual && (
        <p className="inspector-hint inspector-note">
          Detailed specs (manufacturer, size, voltage, etc.) aren't available yet - the
          current export only carries category, floor, and this element's ID. That's the
          next thing to add.
        </p>
      )}
    </div>
  );
}
