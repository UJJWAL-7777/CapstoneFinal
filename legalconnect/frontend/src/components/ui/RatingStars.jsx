import { Star } from 'lucide-react';

export default function RatingStars({ rating = 0, max = 5, size = 'sm', showValue = false, onChange }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' };
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type={onChange ? 'button' : undefined}
          onClick={onChange ? () => onChange(star) : undefined}
          disabled={!onChange}
          className={`${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          aria-label={onChange ? `Rate ${star} stars` : `${star} out of ${max}`}
        >
          <Star
            className={`${sizes[size]} transition-colors ${
              star <= rating ? 'fill-brass-400 text-brass-400' : 'fill-none text-line'
            }`}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-ink-soft">{Number(rating).toFixed(1)}</span>
      )}
    </div>
  );
}
