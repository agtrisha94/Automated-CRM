/**
 * Score History Timeline
 * Line chart showing how a lead's score has changed over time
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'
import { SCORE_CATEGORY_COLORS } from '@/constants/colors'

interface ScoreHistoryPoint {
  timestamp: string | number
  ruleScore?: number
  lrScore?: number
  rfScore?: number
}

interface ScoreHistoryTimelineProps {
  /**
   * Array of score history points over time
   */
  data?: ScoreHistoryPoint[]
  /**
   * Whether to show all 3 models or just active mode
   */
  showAllModels?: boolean
  /**
   * Active scoring mode (for single-line display)
   */
  activeMode?: 'RULE' | 'LR' | 'RF'
}

export function ScoreHistoryTimeline({
  data = [],
  showAllModels = true,
  activeMode = 'RULE',
}: ScoreHistoryTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-gray-500 text-sm">No score history available</p>
      </Card>
    )
  }

  // Format timestamp for display
  const formattedData = data.map((point) => ({
    ...point,
    timeLabel:
      typeof point.timestamp === 'string'
        ? new Date(point.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : `Point ${point.timestamp}`,
  }))

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">Score History</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timeLabel" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} label={{ value: 'Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
            formatter={(value) => `${(value as number).toFixed(0)}`}
          />
          {showAllModels ? (
            <>
              <Legend />
              {formattedData.some((d) => d.ruleScore !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="ruleScore"
                  stroke={SCORE_CATEGORY_COLORS.COLD}
                  name="Rule-Based"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              )}
              {formattedData.some((d) => d.lrScore !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="lrScore"
                  stroke={SCORE_CATEGORY_COLORS.WARM}
                  name="Logistic Regression"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              )}
              {formattedData.some((d) => d.rfScore !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="rfScore"
                  stroke={SCORE_CATEGORY_COLORS.HOT}
                  name="Random Forest"
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              )}
            </>
          ) : (
            <>
              <Legend />
              {activeMode === 'RULE' && (
                <Line
                  type="monotone"
                  dataKey="ruleScore"
                  stroke={SCORE_CATEGORY_COLORS.COLD}
                  name="Rule-Based"
                  dot={{ r: 3 }}
                />
              )}
              {activeMode === 'LR' && (
                <Line
                  type="monotone"
                  dataKey="lrScore"
                  stroke={SCORE_CATEGORY_COLORS.WARM}
                  name="Logistic Regression"
                  dot={{ r: 3 }}
                />
              )}
              {activeMode === 'RF' && (
                <Line
                  type="monotone"
                  dataKey="rfScore"
                  stroke={SCORE_CATEGORY_COLORS.HOT}
                  name="Random Forest"
                  dot={{ r: 3 }}
                />
              )}
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
