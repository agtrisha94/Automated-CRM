/**
 * InterpretabilityGrid Component
 * Displays top features per model
 */
import { Card } from '@/components/ui'
import { getFeatureLabel } from '@/constants'

interface InterpretabilityGridProps {
  features: {
    rules: Array<{ name: string; importance: number }>
    lr: Array<{ name: string; importance: number }>
    rf: Array<{ name: string; importance: number }>
  }
}

export function InterpretabilityGrid({ features }: InterpretabilityGridProps) {
  const models = [
    { title: 'Rule-Based', features: features.rules, color: 'bg-blue-50' },
    { title: 'Logistic Regression', features: features.lr, color: 'bg-purple-50' },
    { title: 'Random Forest', features: features.rf, color: 'bg-emerald-50' },
  ]

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Features by Model</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {models.map((model) => (
          <div key={model.title} className={`${model.color} p-4 rounded-lg`}>
            <h4 className="font-semibold text-gray-900 mb-4">{model.title}</h4>
            <div className="space-y-3">
              {model.features.map((feature, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{getFeatureLabel(feature.name)}</p>
                    <div className="w-full bg-gray-200 rounded h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-green-400 h-2 rounded"
                        style={{ width: `${feature.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 ml-2">{(feature.importance * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
