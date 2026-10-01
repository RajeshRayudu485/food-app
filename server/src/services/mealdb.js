const BASE = 'https://www.themealdb.com/api/json/v1/1';
const TIMEOUT_MS = 8000;

/**
 * TheMealDB returns ingredients/measures as strIngredient1..20 / strMeasure1..20.
 * This helper flattens them into a clean array and drops empty entries.
 */
function extractIngredients(raw) {
  const ingredients = [];

  for (let i = 1; i <= 20; i += 1) {
    const name = raw[`strIngredient${i}`]?.trim();
    const measure = raw[`strMeasure${i}`]?.trim();

    if (name) {
      ingredients.push({ name, measure: measure || '' });
    }
  }

  return ingredients;
}

/**
 * Normalizes a raw TheMealDB meal object into a shape the frontend owns.
 */
function normalizeMeal(raw) {
  if (!raw) return null;

  return {
    id: raw.idMeal,
    name: raw.strMeal,
    category: raw.strCategory || 'Uncategorized',
    area: raw.strArea || 'International',
    instructions: (raw.strInstructions || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
    thumbnail: raw.strMealThumb,
    tags: raw.strTags
      ? raw.strTags.split(',').map((t) => t.trim()).filter(Boolean)
      : [],
    youtube: raw.strYoutube || null,
    source: raw.strSource || null,
    ingredients: extractIngredients(raw)
  };
}

async function fetchFromMealDB(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, { signal: controller.signal });

    if (!res.ok) {
      const error = new Error(`TheMealDB responded with ${res.status}`);
      error.status = 502;
      throw error;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const error = new Error('TheMealDB request timed out. Please try again.');
      error.status = 504;
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export const mealDbService = {
  /** Search meals by name. Returns [] when no matches. */
  async search(query) {
    const data = await fetchFromMealDB('/search.php', { s: query });
    return (data.meals ?? []).map(normalizeMeal);
  },

  /** Filter meals by category, area, or main ingredient. */
  async filter({ category, area, ingredient }) {
    const params = {};
    if (category) params.c = category;
    if (area) params.a = area;
    if (ingredient) params.i = ingredient;

    const data = await fetchFromMealDB('/filter.php', params);

    // filter.php returns a light payload (id, name, thumb) — normalize it.
    return (data.meals ?? []).map((m) => ({
      id: m.idMeal,
      name: m.strMeal,
      thumbnail: m.strMealThumb,
      category: category || '',
      area: area || '',
      ingredients: [],
      instructions: [],
      tags: []
    }));
  },

  /** Full recipe for a single meal. */
  async getById(id) {
    const data = await fetchFromMealDB('/lookup.php', { i: id });
    return normalizeMeal(data.meals?.[0] ?? null);
  },

  /** One random meal — great for a "Surprise me" button. */
  async random() {
    const data = await fetchFromMealDB('/random.php');
    return normalizeMeal(data.meals?.[0] ?? null);
  },

  /** All categories (Beef, Dessert, Seafood, …). */
  async categories() {
    const data = await fetchFromMealDB('/categories.php');
    return (data.categories ?? []).map((c) => ({
      id: c.idCategory,
      name: c.strCategory,
      thumbnail: c.strCategoryThumb,
      description: (c.strCategoryDescription || '').slice(0, 140)
    }));
  },

  /** List of areas/cuisines (Italian, Mexican, Japanese, …). */
  async areas() {
    const data = await fetchFromMealDB('/list.php', { a: 'list' });
    return (data.meals ?? []).map((m) => m.strArea).filter(Boolean).sort();
  }
};
