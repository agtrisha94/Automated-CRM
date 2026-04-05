/**
 * Cost-Benefit Analysis Chart
 * Scatter plot showing latency vs accuracy trade-off between models
 */
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'

interface CostBenefitData {
  model: string
  latency: number
  accuracy: number
  color: string
}

interface CostBenefitAnalysisProps {
  ruleMetrics?: { latency: number; accuracy: number }
  lrMetrics?: { latency: number; accuracy: number }
  rfMetrics?: { latency: number; accuracy: number }
  loading: boolean
}

export function CostBenefitAnalysis({
  ruleMetrics,
  lrMetrics,
  rfMetrics,
  loading,
}: CostBenefitAnalysisProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Model Trade-off: Latency vs Accuracy</h3>
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      </Card>
    )
  }

  const data: CostBenefitData[] = []

  if (ruleMetrics) {
    data.push({
      model: 'Rule-Based',
      latency: ruleMetrics.latency,
      accuracy: ruleMetrics.accuracy,
      color: '#3b82f6',
    })
  }
  if (lrMetrics) {
    data.push({
      model: 'Logistic Regression',
      latency: lrMetrics.latency,
      accuracy: lrMetrics.accuracy,
      color: '#8b5cf6',
    })
  }
  if (rfMetrics) {
    data.push({
      model: 'Random Forest',
      latency: rfMetrics.latency,
      accuracy: rfMetrics.accuracy,
      color: '#ef4444',
    })
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Model Trade-off: Latency vs Accuracy</h3>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="latency"
              name="Latency (ms)"
              label={{ value: 'Latency (ms)', position: 'insideBottomRight', offset: -5 }}
            />
            <YAxis
              type="number"
              dataKey="accuracy"
              name="Accuracy"
              domain={[0, 1]}
              label={{ value: 'Accuracy', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => {
                if (name === 'accuracy') return [(value as number).toFixed(2), name]
                return [value, name]
              }}
            />
            <Scatter name="Rule-Based" data={data.filter((d) => d.model === 'Rule-Based')} fill="#3b82f6" />
            <Scatter name="Logistic Regression" data={data.filter((d) => d.model === 'Logistic Regression')} fill="#8b5cf6" />
            <Scatter name="Random Forest" data={data.filter((d) => d.model === 'Random Forest')} fill="#ef4444" />
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          No metrics available
        </div>
      )}
    </Card>
  )
}
