/**
 * ScoreBadge Component
 * Color-coded badge for HOT/WARM/COLD categories
 */
import { SCORE_CATEGORY_TAILWIND } from '@/constants'
import type { ScoreCategory } from '@/types/Scoring.types'

export interface ScoreBadgeProps {
  category: ScoreCategory
  score?: number
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ category, score, size = 'md' }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-2 text-sm',
    lg: 'px-4.5 py-2.5 text-base',
  }

  const label = {
    HOT: 'Hot',
    WARM: 'Warm',
    COLD: 'Cold',
  }[category]

  return (
    <div className={`inline-flex items-center gap-2 font-bold rounded-full border-2 shadow-sm ${SCORE_CATEGORY_TAILWIND[category]} ${sizeClasses[size]}`}>
      <span className="w-2.5 h-2.5 rounded-full bg-current opacity-75" />
      <span>{label}</span>
      {score !== undefined && <span className="font-mono opacity-85 ml-1">{score.toFixed(0)}</span>}
    </div>
  )
}
