import { CATEGORY_COLORS, LEGEND_CATEGORIES } from "../lib/categoryColors";

// A plain, static swatch legend - there's no ArcGIS renderer to read colors
// from anymore, so this mirrors the actual material colors baked into each
// GLB (sampled from the source Revit/BIM symmetry during the merge step).
export default function LegendPanel() {
  return (
    <div className="panel legend-panel">
      <h4>Categories</h4>
      <ul className="legend-list">
        {LEGEND_CATEGORIES.map((cat) => (
          <li key={cat} className="legend-item">
            <span className="legend-swatch" style={{ background: CATEGORY_COLORS[cat] }} />
            <span>{cat}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
