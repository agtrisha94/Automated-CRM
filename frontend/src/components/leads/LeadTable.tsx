/**
 * Lead Table
 * Table wrapper displaying paginated leads
 */
import { LeadTableHeader } from './LeadTableHeader'
import { LeadTableRow } from './LeadTableRow'
import { Skeleton } from '@/components/ui'
import type { Lead } from '@/types/Leads.types'

interface LeadTableProps {
  leads: Lead[]
  loading?: boolean
  error?: string | null
  onViewLead: (lead: Lead) => void
}

export function LeadTable({ leads, loading = false, error, onViewLead }: LeadTableProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Error loading leads: {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <LeadTableHeader />
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: 10 }).map((_, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-40" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-4 w-32" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-16" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="px-6 py-4">
                  <Skeleton className="h-8 w-16" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
        No leads found. Try adjusting your filters or create a new lead.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <LeadTableHeader />
        <tbody className="divide-y divide-gray-200">
          {leads.map((lead) => (
            <LeadTableRow key={lead.id} lead={lead} onView={onViewLead} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
