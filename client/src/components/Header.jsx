export default function Header({ theme, onToggleTheme, apiOnline, favoritesCount, showFavorites, onToggleFavorites }) {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo" aria-hidden="true">🔥</span>
        <div>
          <h1 className="header__title">Fork &amp; Fire</h1>
          <p className="header__subtitle">
            Real recipes from TheMealDB ·{' '}
            <span className={`dot ${apiOnline ? 'dot--online' : 'dot--offline'}`} />
            {apiOnline ? 'API online' : 'API unreachable'}
          </p>
        </div>
      </div>

      <div className="header__actions">
        <button
          type="button"
          className={`btn btn--ghost ${showFavorites ? 'is-active' : ''}`}
          onClick={onToggleFavorites}
          aria-pressed={showFavorites}
        >
          ♥ <span>Favorites</span>
          {favoritesCount > 0 && <span className="badge-count">{favoritesCount}</span>}
        </button>

        <button
          type="button"
          className="btn btn--icon"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
