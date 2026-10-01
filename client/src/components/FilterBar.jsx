export default function FilterBar({ categories, areas, active, onChange, onClear, hasActiveFilters }) {
  return (
    <div className="filterbar">
      <div className="filterbar__group">
        <span className="filterbar__label">Category</span>
        <div className="chips">
          <button
            type="button"
            className={`chip ${!active.category ? 'is-active' : ''}`}
            onClick={() => onChange({ category: '', area: '', ingredient: '' })}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`chip ${active.category === cat.name ? 'is-active' : ''}`}
              onClick={() => onChange({ category: cat.name, area: '', ingredient: '' })}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="filterbar__group">
        <span className="filterbar__label">Cuisine</span>
        <select
          className="select"
          value={active.area}
          onChange={(e) => onChange({ area: e.target.value, category: '', ingredient: '' })}
          aria-label="Filter by cuisine"
        >
          <option value="">Any cuisine</option>
          {areas.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button type="button" className="btn btn--ghost" onClick={onClear}>
          ✕ <span>Clear filters</span>
        </button>
      )}
    </div>
  );
}
