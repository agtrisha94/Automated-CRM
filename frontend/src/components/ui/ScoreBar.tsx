/**
 * ScoreBar Component
 * Horizontal gradient bar for score visualization (0-100)
 */
import { SCORE_CATEGORY_COLORS } from '@/constants'

export interface ScoreBarProps {
  score: number
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function ScoreBar({ score, size = 'md', showLabel = true }: ScoreBarProps) {
  // Clamp score to 0-100
  const normalizedScore = Math.max(0, Math.min(100, score))

  // Determine color based on score
  const color =
    normalizedScore < 40
      ? SCORE_CATEGORY_COLORS.COLD
      : normalizedScore < 70
        ? SCORE_CATEGORY_COLORS.WARM
        : SCORE_CATEGORY_COLORS.HOT

  const heightClass = size === 'sm' ? 'h-2' : 'h-3'

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-gray-200 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${normalizedScore}%`,
            backgroundColor: color,
          }}
        />
      </div>
      {showLabel && <span className="text-sm font-semibold text-gray-700 min-w-[3rem]">{normalizedScore}</span>}
    </div>
  )
}
