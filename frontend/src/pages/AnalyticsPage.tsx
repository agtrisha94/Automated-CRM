/**
 * AnalyticsPage
 * Dashboard with 6 charts showing leads distribution, trends, and sparsity experiment
 * Implemented in Phase 2.5
 */
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector, fetchAnalytics, runSparsityExperiment } from '@/store'
import {
  AnalyticsHeader,
  ScoreDistributionPie,
  LeadSourceBar,
  ConversionFunnel,
  ScoreTrendLine,
  SparsityExperiment,
  CostBenefitAnalysis,
} from '@/components/analytics'

export default function AnalyticsPage() {
  const dispatch = useAppDispatch()

  // Redux selectors
  const chartData = useAppSelector((state) => state.analytics.chartData)
  const loading = useAppSelector((state) => state.analytics.status === 'loading')
  const sparsityProgress = useAppSelector((state) => state.analytics.sparsityProgress)
  const sparsityLoading = useAppSelector((state) => state.analytics.sparsityLoading)

  // Fetch analytics on mount
  useEffect(() => {
    dispatch(fetchAnalytics())
  }, [dispatch])

  const handleStartSparsity = () => {
    dispatch(runSparsityExperiment())
  }

  return (
    <div className="p-8">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
        <p className="text-slate-600">
          Organization-wide metrics, distribution charts, and long-running experiments.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="mb-8">
        <AnalyticsHeader data={chartData} loading={loading} />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Top row: 2 main charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ScoreDistributionPie data={chartData} loading={loading} />
          <LeadSourceBar data={chartData} loading={loading} />
        </div>

        {/* Middle: Funnel and Trend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ConversionFunnel data={chartData} loading={loading} />
          <ScoreTrendLine data={chartData} loading={loading} />
        </div>

        {/* Bottom: Sparsity Experiment (full width) */}
        <SparsityExperiment
          data={chartData}
          progress={sparsityProgress}
          loading={sparsityLoading}
          onStart={handleStartSparsity}
        />

        {/* Cost-Benefit Analysis (full width) */}
        <CostBenefitAnalysis
          ruleMetrics={{
            latency: chartData?.ruleAvgLatencyMs || 11,
            accuracy: chartData?.ruleAccuracy || 0.74,
          }}
          lrMetrics={{
            latency: chartData?.lrAvgLatencyMs || 45,
            accuracy: chartData?.lrAccuracy || 0.78,
          }}
          rfMetrics={{
            latency: chartData?.rfAvgLatencyMs || 85,
            accuracy: chartData?.rfAccuracy || 0.81,
          }}
          loading={loading}
        />
      </div>
    </div>
  )
}
 