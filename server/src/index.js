import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import mealsRouter from './routes/meals.js';
import categoriesRouter from './routes/categories.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.disable('x-powered-by');
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

/** Health check — the frontend pings this to show "API online" in the header. */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
    upstream: 'https://www.themealdb.com/api/json/v1/1'
  });
});

app.use('/api/meals', mealsRouter);
app.use('/api/categories', categoriesRouter);

/** In production, serve the built React SPA from the same container. */
const clientDist = process.env.CLIENT_DIST || path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));
  // SPA fallback — any non-API route returns index.html.
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

/** 404 for unknown API routes. */
app.use((req, res) => {
  res.status(404).json({ error: { message: `Route ${req.method} ${req.originalUrl} not found.` } });
});

/** Central error handler — upstream errors surface as 502/504. */
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err.message);
  res.status(status).json({
    error: {
      message: err.message || 'Something went wrong. Please try again.'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🍽️  Food API listening on http://0.0.0.0:${PORT}`);
  console.log(`   Upstream: TheMealDB (free test key "1")`);
});
