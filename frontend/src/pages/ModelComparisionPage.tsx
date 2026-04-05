/**
 * ModelComparisonPage
 * Research dashboard: model performance, accuracy metrics, confusion matrices, live score tester
 * Implemented in Phase 2.6
 */
import { useEffect, useState } from 'react'
import { Card, LoadingSpinner } from '@/components/ui'
import {
  AccuracyTable,
  LatencyChart,
  ConfusionMatricesGrid,
  InterpretabilityGrid,
  LiveScoreTester,
} from '@/components/research'
import { getMetrics, getConfusionMatrices, getFeatureImportances } from '@/api/services/research.service'
import type { ResearchMetrics, ConfusionMatricesData, FeatureImportances } from '@/types/Research.types'

export default function ModelComparisonPage() {
  const [metrics, setMetrics] = useState<ResearchMetrics | null>(null)
  const [matrices, setMatrices] = useState<ConfusionMatricesData | null>(null)
  const [features, setFeatures] = useState<FeatureImportances | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [metricsData, matricesData, featuresData] = await Promise.all([
          getMetrics(),
          getConfusionMatrices(),
          getFeatureImportances(),
        ])
        setMetrics(metricsData)
        setMatrices(matricesData)
        setFeatures(featuresData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load research data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <div className="text-red-800">
            <h3 className="font-semibold">Error loading research data</h3>
            <p className="text-sm">{error}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Model Comparison & Research</h1>
        <p className="text-gray-600">
          Validate model performance with accuracy metrics, confusion matrices, and live score testing.
        </p>
      </div>

      <div className="space-y-6">
        {/* Accuracy Metrics Table */}
        {metrics && <AccuracyTable metrics={metrics} />}

        {/* Latency Chart */}
        {metrics && (
          <LatencyChart
            data={{
              ruleMs: metrics.rules.avgLatencyMs,
              lrMs: metrics.lr.avgLatencyMs,
              rfMs: metrics.rf.avgLatencyMs,
            }}
          />
        )}

        {/* Confusion Matrices Grid */}
        {matrices && <ConfusionMatricesGrid matrices={matrices} />}

        {/* Feature Importances */}
        {features && <InterpretabilityGrid features={features} />}

        {/* Live Score Tester */}
        <LiveScoreTester />
      </div>
    </div>
  )
}
 
