/**
 * LatencyChart Component
 * Bar chart comparing average latency across models
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'

interface LatencyChartProps {
  data: {
    ruleMs: number
    lrMs: number
    rfMs: number
  }
}

export function LatencyChart({ data }: LatencyChartProps) {
  const chartData = [
    {
      name: 'Latency',
      'Rule-Based': data.ruleMs,
      'Logistic Regression': data.lrMs,
      'Random Forest': data.rfMs,
    },
  ]

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Latency by Model</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis label={{ value: 'Milliseconds', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => `${value}ms`} />
          <Legend />
          <Bar dataKey="Rule-Based" fill="#3b82f6" />
          <Bar dataKey="Logistic Regression" fill="#8b5cf6" />
          <Bar dataKey="Random Forest" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
