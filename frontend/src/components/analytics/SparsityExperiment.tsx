/**
 * Sparsity Experiment Component
 * Shows progress of long-running sparsity test and results
 */
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, Button } from '@/components/ui'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface SparsityExperimentProps {
  data: AnalyticsPayload | null
  progress: number
  loading: boolean
  onStart: () => void
}

export function SparsityExperiment({ data, progress, loading, onStart }: SparsityExperimentProps) {
  const isRunning = loading && progress < 100

  const chartData = (data?.sparsity || []).map((point) => ({
    datasetSize: point.datasetSize,
    ruleMean: point.ruleMean,
    lrMean: point.lrMean,
    rfMean: point.rfMean,
    ruleStd: point.ruleStd,
    lrStd: point.lrStd,
    rfStd: point.rfStd,
  }))

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Sparsity Experiment</h3>
        <Button onClick={onStart} disabled={isRunning} variant={isRunning ? 'secondary' : 'primary'}>
          {isRunning ? 'Running...' : 'Start Experiment'}
        </Button>
      </div>

      {/* Progress Bar */}
      {isRunning && (
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-medium text-gray-600">{progress}%</span>
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="datasetSize" 
              label={{ value: 'Dataset Size', position: 'insideBottomRight', offset: -5 }} 
              type="number"
            />
            <YAxis 
              domain={[0, 100]} 
              label={{ value: 'Accuracy %', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ruleMean"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={2}
              name="Rule-Based"
            />
            <Line
              type="monotone"
              dataKey="lrMean"
              stroke="#8b5cf6"
              dot={false}
              strokeWidth={2}
              name="Logistic Regression"
            />
            <Line
              type="monotone"
              dataKey="rfMean"
              stroke="#ef4444"
              dot={false}
              strokeWidth={2}
              name="Random Forest"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Click "Start Experiment" to run sparsity analysis (15-20 seconds)
        </div>
      )}
    </Card>
  )
}
