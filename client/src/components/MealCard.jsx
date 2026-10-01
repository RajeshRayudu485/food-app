import { truncate } from '../utils/format.js';

export default function MealCard({ meal, isFavorite, onToggleFavorite, onOpen }) {
  return (
    <article className="card" onClick={() => onOpen(meal.id)} tabIndex={0} role="button"
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(meal.id); } }}>
      <div className="card__image-wrap">
        <img
          className="card__image"
          src={`${meal.thumbnail}/medium`}
          alt={meal.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <button
          type="button"
          className={`card__fav ${isFavorite ? 'is-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(meal.id); }}
          aria-label={isFavorite ? `Remove ${meal.name} from favorites` : `Add ${meal.name} to favorites`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <div className="card__body">
        <h3 className="card__title">{meal.name}</h3>
        <div className="card__meta">
          {meal.category && <span className="badge badge--accent">{meal.category}</span>}
          {meal.area && <span className="badge">{meal.area}</span>}
        </div>
        {meal.tags?.length > 0 && (
          <p className="card__tags">{truncate(meal.tags.join(' · '), 50)}</p>
        )}
      </div>
    </article>
  );
}
