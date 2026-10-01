import { Router } from 'express';
import { mealDbService } from '../services/mealdb.js';

const router = Router();

/**
 * GET /api/meals
 * Query params (all optional):
 *   q          — search term
 *   category   — filter by category
 *   area       — filter by cuisine
 *   ingredient — filter by main ingredient
 *   random     — if "true", return one random meal
 */
router.get('/', async (req, res, next) => {
  try {
    const { q, category, area, ingredient, random } = req.query;

    if (random === 'true') {
      const meal = await mealDbService.random();
      if (!meal) return res.status(404).json({ error: { message: 'No random meal available.' } });
      return res.json({ data: [meal], meta: { mode: 'random' } });
    }

    if (q && q.trim().length >= 2) {
      const meals = await mealDbService.search(q.trim());
      return res.json({ data: meals, meta: { mode: 'search', query: q.trim() } });
    }

    if (category || area || ingredient) {
      const meals = await mealDbService.filter({ category, area, ingredient });
      return res.json({ data: meals, meta: { mode: 'filter', category, area, ingredient } });
    }

    // Default: return a spread of meals across popular categories.
    const [beef, chicken, dessert, seafood] = await Promise.all([
      mealDbService.filter({ category: 'Beef' }),
      mealDbService.filter({ category: 'Chicken' }),
      mealDbService.filter({ category: 'Dessert' }),
      mealDbService.filter({ category: 'Seafood' })
    ]);

    const mixed = [...beef, ...chicken, ...dessert, ...seafood]
      .sort(() => Math.random() - 0.5)
      .slice(0, 24);

    res.json({ data: mixed, meta: { mode: 'discover' } });
  } catch (err) {
    next(err);
  }
});

/** GET /api/meals/:id — full recipe. */
router.get('/:id', async (req, res, next) => {
  try {
    const meal = await mealDbService.getById(req.params.id);
    if (!meal) {
      return res.status(404).json({ error: { message: `Meal ${req.params.id} was not found.` } });
    }
    res.json({ data: meal });
  } catch (err) {
    next(err);
  }
});

export default router;
