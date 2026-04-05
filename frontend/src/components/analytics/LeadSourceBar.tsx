/**
 * Lead Source Bar Chart
 * Shows count of leads by source (FORM, WEBHOOK, MANUAL, IMPORT)
 */
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui'
import { SOURCE_COLORS } from '@/constants/colors'
import type { AnalyticsPayload } from '@/types/Analytics.types'

interface LeadSourceBarProps {
  data: AnalyticsPayload | null
  loading: boolean
}

export function LeadSourceBar({ data, loading }: LeadSourceBarProps) {
  if (loading || !data?.bySource) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
        <div className="h-64 animate-pulse bg-gray-200 rounded" />
      </Card>
    )
  }

  const chartData = [
    { name: 'Form', count: data.bySource.FORM || 0, fill: SOURCE_COLORS.FORM },
    { name: 'Webhook', count: data.bySource.WEBHOOK || 0, fill: SOURCE_COLORS.WEBHOOK },
    { name: 'Manual', count: data.bySource.MANUAL || 0, fill: SOURCE_COLORS.MANUAL },
    { name: 'Import', count: data.bySource.IMPORT || 0, fill: SOURCE_COLORS.IMPORT },
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Leads by Source</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
            {chartData.map((entry) => (
              <Bar key={entry.name} dataKey="count" fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
