/**
 * Lead Table Row
 * Single lead in the table with score badge, status, source
 */
import { Button, ScoreBadge, Badge } from '@/components/ui'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/constants'
import type { Lead } from '@/types/Leads.types'

interface LeadTableRowProps {
  lead: Lead
  onView: (lead: Lead) => void
}

export function LeadTableRow({ lead, onView }: LeadTableRowProps) {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lead.name}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.email}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{lead.company || '—'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <ScoreBadge score={lead.activeScore} category={lead.scoreCategory} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="info" className="text-xs">
          {LEAD_STATUS_LABELS[lead.status]}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="info" className="text-xs">
          {LEAD_SOURCE_LABELS[lead.source]}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onView(lead)}
        >
          View
        </Button>
      </td>
    </tr>
  )
}
