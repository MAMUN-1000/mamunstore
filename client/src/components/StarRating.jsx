import { useState } from 'react';
import { Star } from 'lucide-react';

const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const StarRating = ({
  rating = 0,
  onChange = null,
  interactive = false,
  size = 'md',
  showLabel = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };

  const starClass = sizeClasses[size] || sizeClasses.md;
  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={() => interactive && setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            className={`${
              interactive
                ? 'cursor-pointer p-0.5 hover:scale-115 transition-transform focus:outline-none'
                : 'cursor-default'
            }`}
            title={interactive ? `${star} - ${RATING_LABELS[star]}` : `${rating} out of 5 stars`}
          >
            <Star
              className={`${starClass} transition-colors ${
                star <= activeRating
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-200 fill-slate-50'
              }`}
            />
          </button>
        ))}
      </div>

      {showLabel && activeRating > 0 && (
        <span className="text-xs font-semibold text-slate-700 animate-fadeIn">
          {RATING_LABELS[activeRating] || `${activeRating} Stars`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
