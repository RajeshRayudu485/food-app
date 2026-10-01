import { useEffect, useRef, useState } from 'react';
import { foodApi } from '../api/client.js';

const INITIAL = { meals: [], meta: null, loading: true, error: null };

/**
 * Fetches meals based on the active query object.
 * Cancels in-flight requests when the query changes.
 */
export function useMeals(query, refreshToken = 0) {
  const [state, setState] = useState(INITIAL);
  const key = JSON.stringify(query);
  const lastKey = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const isNewQuery = lastKey.current !== key;
    lastKey.current = key;

    setState((prev) => ({
      ...prev,
      loading: true,
      error: isNewQuery ? null : prev.error
    }));

    foodApi
      .listMeals(query, controller.signal)
      .then((res) => {
        setState({ meals: res.data, meta: res.meta, loading: false, error: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setState((prev) => ({ ...prev, loading: false, error: err.message }));
      });

    return () => controller.abort();
    // `query` is fully represented by its serialized `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, refreshToken]);

  return state;
}

/** Fetches categories and areas once on mount. */
export function useTaxonomies() {
  const [state, setState] = useState({ categories: [], areas: [], loading: true });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      foodApi.categories(controller.signal),
      foodApi.areas(controller.signal)
    ])
      .then(([catRes, areaRes]) => {
        setState({ categories: catRes.data, areas: areaRes.data, loading: false });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Failed to load taxonomies', err);
          setState({ categories: [], areas: [], loading: false });
        }
      });

    return () => controller.abort();
  }, []);

  return state;
}
