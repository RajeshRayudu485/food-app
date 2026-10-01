import { useCallback, useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import SearchBar from './components/SearchBar.jsx';
import FilterBar from './components/FilterBar.jsx';
import MealGrid from './components/MealGrid.jsx';
import MealDetail from './components/MealDetail.jsx';
import Toasts from './components/Toasts.jsx';
import { useMeals, useTaxonomies } from './hooks/useMeals.js';
import { useDebounce } from './hooks/useDebounce.js';
import { useFavorites } from './hooks/useFavorites.js';
import { useTheme } from './hooks/useTheme.js';
import { foodApi } from './api/client.js';

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const { favorites, toggle: toggleFavorite, clear: clearFavorites } = useFavorites();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ category: '', area: '', ingredient: '' });
  const [showFavorites, setShowFavorites] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [apiOnline, setApiOnline] = useState(true);
  const [toasts, setToasts] = useState([]);

  const debouncedSearch = useDebounce(search, 400);
  const { categories, areas } = useTaxonomies();

  const query = useMemo(() => {
    if (showFavorites) return {};
    if (debouncedSearch.trim().length >= 2) return { q: debouncedSearch.trim() };
    if (filters.category || filters.area || filters.ingredient) return filters;
    return {};
  }, [debouncedSearch, filters, showFavorites]);

  const { meals, loading, error } = useMeals(query, refreshToken);

  const visibleMeals = useMemo(() => {
    if (!showFavorites) return meals;
    return meals.filter((m) => favorites.includes(m.id));
  }, [meals, showFavorites, favorites]);

  const pushToast = useCallback((message, variant = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((list) => [...list.slice(-2), { id, message, variant }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  // Health ping.
  useEffect(() => {
    const controller = new AbortController();
    foodApi
      .health(controller.signal)
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));
    return () => controller.abort();
  }, [refreshToken]);

  const handleRandom = useCallback(async () => {
    setShowFavorites(false);
    setSearch('');
    setFilters({ category: '', area: '', ingredient: '' });
    setRefreshToken((n) => n + 1);
  }, []);

  const handleToggleFavorite = useCallback((id) => {
    toggleFavorite(id);
    const wasFav = favorites.includes(id);
    pushToast(wasFav ? 'Removed from favorites' : 'Added to favorites', wasFav ? 'info' : 'success');
  }, [favorites, toggleFavorite, pushToast]);

  const handleFilterChange = useCallback((patch) => {
    setShowFavorites(false);
    setSearch('');
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ category: '', area: '', ingredient: '' });
    setSearch('');
    setShowFavorites(false);
  }, []);

  const hasActiveFilters = Boolean(filters.category || filters.area || filters.ingredient || search);

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites((v) => {
      const next = !v;
      if (next && favorites.length === 0) {
        pushToast('No favorites yet — tap ♡ on any recipe', 'info');
      }
      return next;
    });
    setSearch('');
    setFilters({ category: '', area: '', ingredient: '' });
  }, [favorites.length, pushToast]);

  return (
    <div className="app">
      <div className="app__glow" aria-hidden="true" />

      <div className="app__inner">
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          apiOnline={apiOnline}
          favoritesCount={favorites.length}
          showFavorites={showFavorites}
          onToggleFavorites={handleToggleFavorites}
        />

        <main className="app__main">
          <SearchBar
            value={search}
            onChange={(v) => { setSearch(v); setShowFavorites(false); }}
            onRandom={handleRandom}
            loading={loading}
          />

          <FilterBar
            categories={categories}
            areas={areas}
            active={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {showFavorites && (
            <div className="favorites-banner">
              <span>Showing <strong>{visibleMeals.length}</strong> favorite{visibleMeals.length !== 1 ? 's' : ''}</span>
              {favorites.length > 0 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => { clearFavorites(); pushToast('Favorites cleared', 'info'); }}
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          <MealGrid
            meals={visibleMeals}
            loading={loading}
            error={error}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpen={setDetailId}
            onRetry={() => setRefreshToken((n) => n + 1)}
            onClear={handleClearFilters}
          />
        </main>

        <footer className="app__footer">
          <span>Fork &amp; Fire · Real recipe data from TheMealDB · Free &amp; open</span>
        </footer>
      </div>

      {detailId && (
        <MealDetail
          mealId={detailId}
          onClose={() => setDetailId(null)}
          isFavorite={favorites.includes(detailId)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
