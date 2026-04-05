/**
 * Score Tag
 * Reusable score display with category
 */
import { ScoreBadge } from '@/components/ui'

import type { ScoreCategory } from '@/types/Scoring.types'

interface ScoreTagProps {
  score: number
  category: ScoreCategory
}

export function ScoreTag({ score, category }: ScoreTagProps) {
  return (
    <div className="flex items-center gap-2">
      <ScoreBadge score={score} category={category} />
      <span className="text-xs text-gray-600">{score}/100</span>
    </div>
  )
}
