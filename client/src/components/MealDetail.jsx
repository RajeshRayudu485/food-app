import { useEffect, useState } from 'react';
import { foodApi } from '../api/client.js';
import { youtubeId } from '../utils/format.js';

export default function MealDetail({ mealId, onClose, isFavorite, onToggleFavorite }) {
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    foodApi
      .getMeal(mealId, controller.signal)
      .then((res) => setMeal(res.data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [mealId]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const vid = meal ? youtubeId(meal.youtube) : null;

  return (
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal__panel modal__panel--wide" role="dialog" aria-modal="true" aria-label={meal?.name || 'Recipe'}>
        <button type="button" className="modal__close" onClick={onClose} aria-label="Close recipe">✕</button>

        {loading && (
          <div className="detail__loading">
            <div className="spinner spinner--lg" />
            <p>Loading recipe…</p>
          </div>
        )}

        {error && (
          <div className="detail__error">
            <p>{error}</p>
            <button type="button" className="btn btn--ghost" onClick={onClose}>Close</button>
          </div>
        )}

        {meal && !loading && (
          <div className="detail">
            <div className="detail__hero">
              <img src={`${meal.thumbnail}/large`} alt={meal.name} className="detail__image" />
            </div>

            <div className="detail__content">
              <div className="detail__head">
                <div>
                  <h2 className="detail__title">{meal.name}</h2>
                  <div className="detail__meta">
                    {meal.category && <span className="badge badge--accent">{meal.category}</span>}
                    {meal.area && <span className="badge">{meal.area}</span>}
                    {meal.tags.map((t) => (
                      <span key={t} className="badge">{t}</span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  className={`btn btn--ghost detail__fav ${isFavorite ? 'is-active' : ''}`}
                  onClick={() => onToggleFavorite(meal.id)}
                >
                  {isFavorite ? '♥ Saved' : '♡ Save'}
                </button>
              </div>

              <div className="detail__columns">
                <section className="detail__section">
                  <h3>🧂 Ingredients</h3>
                  <ul className="ingredients">
                    {meal.ingredients.map((ing, i) => (
                      <li key={`${ing.name}-${i}`} className="ingredient">
                        <img
                          className="ingredient__thumb"
                          src={`https://www.themealdb.com/images/ingredients/${encodeURIComponent(ing.name)}-small.png`}
                          alt=""
                          loading="lazy"
                          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                        <span className="ingredient__name">{ing.name}</span>
                        {ing.measure && <span className="ingredient__measure">{ing.measure}</span>}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="detail__section">
                  <h3>📋 Instructions</h3>
                  <ol className="steps">
                    {meal.instructions.map((step, i) => (
                      <li key={i} className="step">{step}</li>
                    ))}
                  </ol>
                </section>
              </div>

              <div className="detail__links">
                {vid && (
                  <a className="btn btn--primary" href={meal.youtube} target="_blank" rel="noopener noreferrer">
                    ▶ Watch on YouTube
                  </a>
                )}
                {meal.source && (
                  <a className="btn btn--ghost" href={meal.source} target="_blank" rel="noopener noreferrer">
                    🔗 Original source
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
