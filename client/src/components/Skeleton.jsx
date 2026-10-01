export default function Skeleton({ count = 8 }) {
  return (
    <div className="grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="card card--skeleton">
          <div className="sk sk--image" />
          <div className="sk sk--line sk--lg" />
          <div className="sk sk--line sk--sm" />
          <div className="sk__footer">
            <div className="sk sk--pill" />
            <div className="sk sk--pill" />
          </div>
        </article>
      ))}
    </div>
  );
}
