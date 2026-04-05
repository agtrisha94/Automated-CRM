/**
 * Agreement Badge Component
 * Shows if all 3 models agree on score category
 */
import { Badge } from '@/components/ui'

interface AgreementBadgeProps {
  /**
   * Whether all 3 models (RULE, LR, RF) agree on the score category
   */
  agreement: boolean
}

export function AgreementBadge({ agreement }: AgreementBadgeProps) {
  if (agreement) {
    return (
      <Badge variant="success" className="flex items-center gap-1">
        <span>✓</span>
        <span>All models agree</span>
      </Badge>
    )
  }

  return (
    <Badge variant="warning" className="flex items-center gap-1">
      <span>⚠</span>
      <span>Models disagree</span>
    </Badge>
  )
}
