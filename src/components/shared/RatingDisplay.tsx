import { Star } from 'lucide-react'

interface RatingDisplayProps {
  avgRating: number
  reviewCount: number
  size?: 'sm' | 'md'
}

const RatingDisplay = ({ avgRating, reviewCount, size = 'sm' }: RatingDisplayProps) => {
  const hasNoReviews = reviewCount === 0

  if (hasNoReviews) {
    return (
      <div className="inline-flex items-center gap-1.5 bg-muted border border-border text-muted-foreground text-xs font-semibold px-3 py-1.5 rounded-full">
        Inga omdömen ännu
      </div>
    )
  }

  const starSize = size === 'sm' ? 14 : 16

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={starSize}
            className={i < Math.round(avgRating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}
          />
        ))}
      </div>
      <span className={`text-muted-foreground ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {avgRating.toFixed(1)} ({reviewCount})
      </span>
    </div>
  )
}

export default RatingDisplay
