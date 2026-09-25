import { useMemo, useState } from "react";

export default function Sidebar({ buildings, loadedCount, totalCount, selectedId, onSelect }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      buildings.filter((b) =>
        b.name.toLowerCase().includes(query.toLowerCase())
      ),
    [buildings, query]
  );

  return (
    <div className="sidebar">
      <input
        className="search-input"
        placeholder="Search buildings..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loadedCount < totalCount && (
        <p className="sidebar-empty">
          Loading buildings… ({loadedCount}/{totalCount})
        </p>
      )}
      <ul className="building-list">
        {filtered.map((b) => (
          <li key={b.id}>
            <button
              className={
                b.id === selectedId ? "building-btn active" : "building-btn"
              }
              onClick={() => onSelect(b.id)}
            >
              <span>{b.name}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
