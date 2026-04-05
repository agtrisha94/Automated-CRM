/**
 * Feature Importance Chart
 * Horizontal bar chart showing top features contributing to lead score
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'
import { getFeatureLabel } from '@/constants/features'

interface FeatureImportanceChartProps {
  /**
   * Feature importances object { featureKey: importance, ... }
   * Values should be 0-1 or 0-100 (auto-detected)
   */
  importances?: Record<string, number>
  /**
   * Maximum number of features to display (default: 9)
   */
  maxFeatures?: number
}

export function FeatureImportanceChart({ importances = {}, maxFeatures = 9 }: FeatureImportanceChartProps) {
  if (!importances || Object.keys(importances).length === 0) {
    return (
      <Card className="p-4">
        <p className="text-gray-500 text-sm">No feature importance data available</p>
      </Card>
    )
  }

  // Convert to array and sort by importance descending
  const data = Object.entries(importances)
    .map(([featureKey, importance]) => ({
      featureKey,
      label: getFeatureLabel(featureKey),
      importance: typeof importance === 'number' ? importance : 0,
    }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxFeatures)

  // Normalize to 0-100 if max is > 1
  const maxImportance = Math.max(...data.map((d) => d.importance), 1)
  const normalizedData = data.map((d) => ({
    ...d,
    importancePercent: (d.importance / maxImportance) * 100,
  }))

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-4">Feature Importance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={normalizedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} />
          <YAxis dataKey="label" type="category" width={190} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => `${(value as number).toFixed(1)}%`}
            contentStyle={{ backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
          />
          <Bar dataKey="importancePercent" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
