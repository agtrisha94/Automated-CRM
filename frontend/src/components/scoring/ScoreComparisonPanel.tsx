/**
 * Score Comparison Panel
 * 3-column layout comparing scores across RULE, LR, and RF models
 */
import { ScoreBadge, Card } from '@/components/ui'
import { SCORE_CATEGORY_TAILWIND } from '@/constants/colors'
import { AgreementBadge } from './AgreementBadge'
import { LatencyBadge } from './LatencyBadge'
import type { CompareResult } from '@/types/Scoring.types'

interface ScoreComparisonPanelProps {
  /**
   * The comparison result from scoring service
   */
  compareResult?: CompareResult | null
  /**
   * Loading state while comparison is running
   */
  isLoading?: boolean
  /**
   * Error message if comparison failed
   */
  error?: string | null
}

export function ScoreComparisonPanel({ compareResult, isLoading = false, error }: ScoreComparisonPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3" />
            <p className="text-gray-600 text-sm">Running score comparison...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 bg-red-50 border border-red-200">
        <p className="text-red-600 text-sm">Error: {error}</p>
      </Card>
    )
  }

  if (!compareResult) {
    return (
      <Card className="p-6">
        <p className="text-gray-500 text-sm">Select a lead to view score comparison</p>
      </Card>
    )
  }

  const { ruleScore, mlScore, rfScore, ruleCategory, mlCategory, rfCategory, agreement, ruleLatencyMs, mlLatencyMs, rfLatencyMs } = compareResult

  return (
    <div className="space-y-4">
      {/* Agreement Badge */}
      <AgreementBadge agreement={agreement ?? false} />

      {/* 3-Column Comparison */}
      <div className="grid grid-cols-3 gap-3">
        <ScoreColumn title="Rule-Based" score={ruleScore} category={ruleCategory} latency={ruleLatencyMs} />
        <ScoreColumn title="Logistic Regression" score={mlScore} category={mlCategory} latency={mlLatencyMs} />
        <ScoreColumn title="Random Forest" score={rfScore} category={rfCategory} latency={rfLatencyMs} />
      </div>

      {/* Latency Details */}
      <LatencyBadge ruleMs={ruleLatencyMs} lrMs={mlLatencyMs} rfMs={rfLatencyMs} />
    </div>
  )
}

function ScoreColumn({
  title,
  score,
  category,
  latency,
}: {
  title: string
  score?: number | null
  category?: string
  latency?: number
}) {
  if (score === null || score === undefined) {
    return (
      <Card className="p-4 text-center">
        <p className="text-xs font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-gray-400 text-sm">N/A</p>
      </Card>
    )
  }

  const categoryKey = (category?.toUpperCase() || 'COLD') as 'HOT' | 'WARM' | 'COLD'
  const bgColor = SCORE_CATEGORY_TAILWIND[categoryKey] || SCORE_CATEGORY_TAILWIND.COLD

  return (
    <Card className={`p-4 text-center ${bgColor}`}>
      <p className="text-xs font-medium mb-2">{title}</p>
      <div className="mb-3">
        <ScoreBadge score={score} category={categoryKey} />
      </div>
      {latency !== undefined && <p className="text-xs text-gray-600">{latency}ms</p>}
    </Card>
  )
}
