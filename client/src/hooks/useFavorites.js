import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'food-app:favorites';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(readStored);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggle = useCallback((id) => {
    setFavorites((current) =>
      current.includes(id) ? current.filter((f) => f !== id) : [...current, id]
    );
  }, []);

  const clear = useCallback(() => setFavorites([]), []);

  return { favorites, isFavorite, toggle, clear };
}
