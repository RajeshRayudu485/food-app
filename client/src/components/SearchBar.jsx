export default function SearchBar({ value, onChange, onRandom, loading }) {
  return (
    <div className="searchbar">
      <label className="search">
        <span className="search__icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          className="search__input"
          placeholder="Search recipes — try “chicken”, “pasta”, “curry”…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search recipes"
        />
        {value && (
          <button
            type="button"
            className="search__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </label>

      <button
        type="button"
        className="btn btn--primary"
        onClick={onRandom}
        disabled={loading}
        title="Fetch a random recipe"
      >
        🎲 <span>Surprise me</span>
      </button>
    </div>
  );
}
