import { Star } from 'lucide-react'

export function StarRating({
  rating = 0,
  max = 5,
  size = 16,
  interactive = false,
  onChange,
  className = ''
}) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating)
        const partial = !filled && i < rating

        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            disabled={!interactive}
            className={
              interactive
                ? 'cursor-pointer hover:scale-110 transition-transform'
                : 'cursor-default'
            }
          >
            <Star
              size={size}
              className={
                filled
                  ? 'text-amber-400 fill-amber-400'
                  : partial
                    ? 'text-amber-300 fill-amber-200'
                    : 'text-gray-300 fill-gray-100'
              }
            />
          </button>
        )
      })}
    </div>
  )
}

export function RatingBar({ label, count, total, color = 'bg-amber-400' }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-gray-600 w-8 shrink-0">
        {label}★
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-6 shrink-0 text-right">
        {count}
      </span>
    </div>
  )
}
