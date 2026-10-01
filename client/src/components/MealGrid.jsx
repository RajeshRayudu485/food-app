import MealCard from './MealCard.jsx';
import Skeleton from './Skeleton.jsx';
import EmptyState from './EmptyState.jsx';

export default function MealGrid({ meals, loading, error, favorites, onToggleFavorite, onOpen, onRetry, onClear }) {
  if (loading) return <Skeleton count={8} />;

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Couldn't load recipes"
        message={error}
        action={
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Try again
          </button>
        }
      />
    );
  }

  if (meals.length === 0) {
    return (
      <EmptyState
        icon="🍳"
        title="No recipes found"
        message="Try a different search term or clear the filters."
        action={
          onClear ? (
            <button type="button" className="btn btn--ghost" onClick={onClear}>
              Clear filters
            </button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid">
      {meals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          isFavorite={favorites.includes(meal.id)}
          onToggleFavorite={onToggleFavorite}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}
