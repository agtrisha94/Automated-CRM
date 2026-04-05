/**
 * Score Distribution Pie Chart
 * Shows percentage of leads in each score category (HOT/WARM/COLD)
 */
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'
import { SCORE_CATEGORY_COLORS } from '@/constants/colors'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface ScoreDistributionPieProps {
  data: AnalyticsPayload | null
  loading: boolean
}

export function ScoreDistributionPie({ data, loading }: ScoreDistributionPieProps) {
  if (loading || !data?.byScoreCategory) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      </Card>
    )
  }

  const chartData = [
    {
      name: 'HOT',
      value: data.byScoreCategory.HOT || 0,
      color: SCORE_CATEGORY_COLORS.HOT,
    },
    {
      name: 'WARM',
      value: data.byScoreCategory.WARM || 0,
      color: SCORE_CATEGORY_COLORS.WARM,
    },
    {
      name: 'COLD',
      value: data.byScoreCategory.COLD || 0,
      color: SCORE_CATEGORY_COLORS.COLD,
    },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
