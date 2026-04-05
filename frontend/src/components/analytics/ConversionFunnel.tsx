/**
 * Conversion Funnel Chart
 * Shows lead progression through stages: NEW → CONTACTED → QUALIFIED → CONVERTED
 */
import { Card } from '@/components/ui'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface ConversionFunnelProps {
  data: AnalyticsPayload | null
  loading: boolean
}

export function ConversionFunnel({ data, loading }: ConversionFunnelProps) {
  if (loading || !data?.byStatus) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      </Card>
    )
  }

  const stages = [
    { label: 'New', value: data.byStatus.NEW || 0, percent: 100, color: 'bg-blue-500' },
    { label: 'Contacted', value: data.byStatus.CONTACTED || 0, color: 'bg-violet-500' },
    { label: 'Qualified', value: data.byStatus.QUALIFIED || 0, color: 'bg-emerald-500' },
    { label: 'Converted', value: data.byStatus.CONVERTED || 0, color: 'bg-emerald-600' },
  ]

  const total = data.totalLeads || 1
  const stagesWithPercent = stages.map((s) => ({
    ...s,
    percent: Math.round((s.value / total) * 100),
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
      <div className="space-y-4">
        {stagesWithPercent.map((stage) => (
          <div key={stage.label}>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-sm">{stage.label}</span>
              <span className="text-xs text-gray-600">
                {stage.value} ({stage.percent}%)
              </span>
            </div>
            <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
              <div
                className={`h-full ${stage.color} rounded transition-all`}
                style={{ width: `${stage.percent}%` }}
              />
              <div className="absolute inset-0 flex items-center px-3">
                <span className="text-xs font-semibold text-white drop-shadow">
                  {stage.percent}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
