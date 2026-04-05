/**
 * Score Trend Line Chart
 * Shows average score over time
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface ScoreTrendLineProps {
  data: AnalyticsPayload | null
  loading: boolean
}

export function ScoreTrendLine({ data, loading }: ScoreTrendLineProps) {
  if (loading || !data?.scoreTrend?.length) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Score Trend Over Time</h3>
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      </Card>
    )
  }

  const chartData = (data.scoreTrend || []).map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    avgScore: point.avgScore,
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Score Trend Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgScore"
            stroke="#f59e0b"
            dot={false}
            strokeWidth={2}
            name="Avg Score"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
