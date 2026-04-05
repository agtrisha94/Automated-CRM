/**
 * Analytics Header - KPI Cards
 * Displays 4 key metrics: Total Leads, Conversion Rate, HOT Leads, Avg Score
 */
import { Card } from '@/components/ui'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface AnalyticsHeaderProps {
  data: AnalyticsPayload | null
  loading: boolean
}

export function AnalyticsHeader({ data, loading }: AnalyticsHeaderProps) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="h-16 animate-pulse bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      label: 'Total Leads',
      value: data.totalLeads?.toString() || '0',
      icon: '👥',
    },
    {
      label: 'Conversion Rate',
      value: `${((data.conversionRate || 0) * 100).toFixed(1)}%`,
      icon: '📈',
    },
    {
      label: 'HOT Leads',
      value: data.byScoreCategory?.HOT?.toString() || '0',
      icon: '🔥',
      color: 'text-red-500',
    },
    {
      label: 'Avg Score',
      value: (data.avgScore?.toFixed(1) || '0') + '/100',
      icon: '⭐',
      color: 'text-amber-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
              <p className={`text-2xl font-bold mt-2 ${kpi.color || 'text-gray-900'}`}>{kpi.value}</p>
            </div>
            <div className="text-2xl">{kpi.icon}</div>
          </div>
        </Card>
      ))}
    </div>
  )
}
