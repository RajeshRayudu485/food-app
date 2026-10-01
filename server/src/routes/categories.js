import { Router } from 'express';
import { mealDbService } from '../services/mealdb.js';

const router = Router();

/** GET /api/categories — all meal categories. */
router.get('/', async (_req, res, next) => {
  try {
    const categories = await mealDbService.categories();
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

/** GET /api/categories/areas — all cuisines/areas. */
router.get('/areas', async (_req, res, next) => {
  try {
    const areas = await mealDbService.areas();
    res.json({ data: areas });
  } catch (err) {
    next(err);
  }
});

export default router;
