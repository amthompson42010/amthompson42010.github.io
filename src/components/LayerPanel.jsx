import { CATEGORY_COLORS } from "../lib/categoryColors";

// Interactive layer toggle tree - replaces the old static color-swatch
// Legend panel. Each row is a real on/off switch (not just a color key),
// applied across every loaded building via `onToggle`, plus the swatch so
// this still doubles as a legend.
export default function LayerPanel({ categories, hidden, onToggle }) {
  if (categories.length === 0) return null;

  return (
    <div className="panel layer-panel">
      <h4>Layers</h4>
      <ul className="layer-list">
        {categories.map((cat) => (
          <li key={cat} className="layer-item">
            <label>
              <input
                type="checkbox"
                checked={!hidden.has(cat)}
                onChange={(e) => onToggle(cat, e.target.checked)}
              />
              <span className="layer-swatch" style={{ background: CATEGORY_COLORS[cat] || "#7f7f7f" }} />
              <span className="layer-name">{cat}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
