import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TimeRelevance } from '@/types/Scoring.types'

interface TimeRelevanceBadgeProps {
  timeRelevance?: TimeRelevance
}

/**
 * Displays time-based relevance metrics for a lead.
 * 
 * Shows:
 * - Days since created (lead age)
 * - Days since last activity (recency)
 * - Recency score (0-100 exponential decay)
 * - Engagement velocity (events per day)
 * - Activity freshness classification
 */
export function TimeRelevanceBadge({ timeRelevance }: TimeRelevanceBadgeProps) {
  if (!timeRelevance) {
    return (
      <Card className="bg-gray-50 p-4 border border-gray-200">
        <p className="text-sm text-gray-500">No time relevance data available</p>
      </Card>
    )
  }

  const getFreshnessColor = (freshness: string) => {
    switch (freshness?.toLowerCase()) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300'
      case 'warm':
        return 'bg-amber-100 text-amber-800 border-amber-300'
      case 'stale':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getFreshnessIcon = (freshness: string) => {
    switch (freshness?.toLowerCase()) {
      case 'active':
        return '🔥'
      case 'warm':
        return '⚠️'
      case 'stale':
        return '❄️'
      default:
        return '❓'
    }
  }

  return (
    <Card className="bg-blue-50 border-blue-200 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm text-blue-900">Time Relevance Factors</h4>
          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
            ⏱️ Temporal
          </span>
        </div>

        {/* Time metrics grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Days since created */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Lead Age</p>
            <p className="text-lg font-semibold text-gray-800">
              {timeRelevance.daysSinceCreated !== undefined && timeRelevance.daysSinceCreated !== null
                ? `${timeRelevance.daysSinceCreated.toFixed(1)}d`
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days since created</p>
          </div>

          {/* Days since activity */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Last Activity</p>
            <p className="text-lg font-semibold text-gray-800">
              {timeRelevance.daysSinceActivity !== undefined && timeRelevance.daysSinceActivity !== null
                ? `${timeRelevance.daysSinceActivity.toFixed(1)}d`
                : 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Days since last interaction</p>
          </div>

          {/* Recency score */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Recency Score</p>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-800">
                {timeRelevance.recencyScore.toFixed(1)}
              </p>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-linear-to-r from-emerald-500 to-blue-500 h-2 rounded-full"
                  style={{ width: `${Math.min(100, timeRelevance.recencyScore)}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Exponential decay (0-100)</p>
          </div>

          {/* Engagement velocity */}
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <p className="text-xs text-gray-600 mb-1">Engagement Velocity</p>
            <p className="text-lg font-semibold text-gray-800">
              {timeRelevance.engagementVelocity.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Events per day</p>
          </div>
        </div>

        {/* Activity freshness status */}
        <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-2">
          <p className="text-xs text-gray-600">Activity Status</p>
          <Badge
            className={`${getFreshnessColor(timeRelevance.activityFreshness)} border text-sm font-semibold`}
          >
            {getFreshnessIcon(timeRelevance.activityFreshness)} {timeRelevance.activityFreshness}
          </Badge>
          <p className="text-xs text-gray-500 mt-2">
            {timeRelevance.activityFreshness?.toLowerCase() === 'active'
              ? 'Very recent activity - highly engaged lead'
              : timeRelevance.activityFreshness?.toLowerCase() === 'warm'
                ? 'Recent activity - moderately engaged'
                : timeRelevance.activityFreshness?.toLowerCase() === 'stale'
                  ? 'No recent activity - potential re-engagement opportunity'
                  : 'Activity status unknown'}
          </p>
        </div>

        {/* Key insights */}
        <div className="bg-white rounded-lg p-3 border border-blue-100 space-y-2">
          <p className="text-xs font-semibold text-gray-700">Key Insights</p>
          <ul className="text-xs text-gray-600 space-y-1">
            {timeRelevance.recencyScore > 80 && (
              <li>✓ Lead has very recent activity - high engagement signal</li>
            )}
            {timeRelevance.engagementVelocity > 1 && (
              <li>✓ High engagement velocity - lead is very active</li>
            )}
            {timeRelevance.daysSinceCreated && timeRelevance.daysSinceCreated < 7 && (
              <li>✓ Fresh lead - recently entered the pipeline</li>
            )}
            {timeRelevance.activityFreshness?.toLowerCase() === 'stale' && (
              <li>⚠ Lead is stale - may need nurturing campaign</li>
            )}
            {!timeRelevance.daysSinceActivity && (
              <li>ℹ No activity recorded yet - new lead or no interactions</li>
            )}
          </ul>
        </div>
      </div>
    </Card>
  )
}
