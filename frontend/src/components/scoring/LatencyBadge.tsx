/**
 * Latency Badge Component
 * Displays latency metrics for each scoring model
 */
import { Card } from '@/components/ui'

interface LatencyBadgeProps {
  /**
   * Latency in milliseconds for rule-based scoring
   */
  ruleMs: number
  /**
   * Latency in milliseconds for logistic regression model
   */
  lrMs: number
  /**
   * Latency in milliseconds for random forest model
   */
  rfMs: number
}

export function LatencyBadge({ ruleMs, lrMs, rfMs }: LatencyBadgeProps) {
  const maxLatency = Math.max(ruleMs, lrMs, rfMs)

  return (
    <Card className="bg-gray-50 p-3">
      <div className="space-y-2">
        <LatencyBar model="RULE" latency={ruleMs} max={maxLatency} />
        <LatencyBar model="LR" latency={lrMs} max={maxLatency} />
        <LatencyBar model="RF" latency={rfMs} max={maxLatency} />
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Note: Latency varies by feature count and system load
      </p>
    </Card>
  )
}

function LatencyBar({ model, latency, max }: { model: string; latency: number; max: number }) {
  const percentage = max > 0 ? (latency / max) * 100 : 0
  const barColor = model === 'RULE' ? 'bg-blue-500' : model === 'LR' ? 'bg-purple-500' : 'bg-green-500'

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium">
        <span>{model}</span>
        <span className="text-gray-600">{latency}ms</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${barColor} transition-all duration-300`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
