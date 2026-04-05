/**
 * AccuracyTable Component
 * Displays model performance metrics: F1, AUC-ROC, Precision, Recall, Latency
 */
import { Card, Badge } from '@/components/ui'

interface ModelMetrics {
  f1: number
  precision: number
  recall: number
  aucRoc: number
  avgLatencyMs: number
}

interface AccuracyTableProps {
  metrics: {
    rules: ModelMetrics
    lr: ModelMetrics
    rf: ModelMetrics
  }
}

export function AccuracyTable({ metrics }: AccuracyTableProps) {
  const models = [
    { name: 'Rule-Based', key: 'rules', color: 'bg-blue-50' },
    { name: 'Logistic Regression', key: 'lr', color: 'bg-purple-50' },
    { name: 'Random Forest', key: 'rf', color: 'bg-emerald-50' },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Model</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">F1 Score</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Precision</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Recall</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">AUC-ROC</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Latency</th>
            </tr>
          </thead>
          <tbody>
            {models.map((model) => {
              const data = metrics[model.key as keyof typeof metrics]
              return (
                <tr key={model.key} className={`${model.color} border-b`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{model.name}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="success">{(data.f1 * 100).toFixed(1)}%</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="info">{(data.precision * 100).toFixed(1)}%</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="info">{(data.recall * 100).toFixed(1)}%</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant="success">{(data.aucRoc * 100).toFixed(1)}%</Badge>
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-600">{data.avgLatencyMs}ms</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
