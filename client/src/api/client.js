const BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request(path, { signal } = {}) {
  const res = await fetch(`${BASE}${path}`, { signal });

  const text = await res.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const error = new Error(
      payload?.error?.message || `Request failed with status ${res.status}`
    );
    error.status = res.status;
    throw error;
  }

  return payload;
}

export const foodApi = {
  health: (signal) => request('/health', { signal }),

  listMeals: ({ q, category, area, ingredient, random } = {}, signal) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (category) params.set('category', category);
    if (area) params.set('area', area);
    if (ingredient) params.set('ingredient', ingredient);
    if (random) params.set('random', 'true');
    const qs = params.toString();
    return request(`/meals${qs ? `?${qs}` : ''}`, { signal });
  },

  getMeal: (id, signal) => request(`/meals/${id}`, { signal }),

  categories: (signal) => request('/categories', { signal }),

  areas: (signal) => request('/categories/areas', { signal })
};
