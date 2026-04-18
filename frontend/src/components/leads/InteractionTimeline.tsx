/**
 * InteractionTimeline Component
 * Displays a timeline of all interactions for a lead
 */
import type { Lead } from '@/types/Leads.types'
import { INTERACTION_TYPE_LABELS } from '@/constants/enums'
import { formatDistanceToNow } from 'date-fns'
import { useEffect, useState } from 'react'
import { getInteractionsForLead } from '@/api/services/leads.service'

interface InteractionTimelineProps {
  lead: Lead | null
}

// Interaction data type
interface Interaction {
  id: string
  type: 'EMAIL' | 'CALL' | 'MEETING' | 'DEMO'
  notes?: string
  duration?: number
  timestamp: string
}

export function InteractionTimeline({ lead }: InteractionTimelineProps) {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(false)

  // Mock interactions for demo when API returns empty
  const mockInteractions: Interaction[] = [
    {
      id: '1',
      type: 'EMAIL',
      notes: 'Sent product overview',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'CALL',
      notes: 'Initial discovery call - very interested',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'MEETING',
      notes: 'Demo scheduled for next week',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Fetch interactions whenever lead changes
  useEffect(() => {
    if (!lead?.id) {
      setInteractions([])
      return
    }

    const fetchInteractions = async () => {
      setLoading(true)
      try {
        const data = await getInteractionsForLead(lead.id)
        // If no interactions from API, use mock data for demo
        setInteractions(data && data.length > 0 ? data : mockInteractions)
      } catch (error) {
        console.error('Failed to fetch interactions:', error)
        // Fall back to mock interactions on error
        setInteractions(mockInteractions)
      } finally {
        setLoading(false)
      }
    }

    fetchInteractions()
  }, [lead?.id])

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        Loading interactions...
      </div>
    )
  }

  if (!interactions || interactions.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No interactions yet. Add one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-3 p-3">
      {interactions.map((interaction, index) => (
        <div key={interaction.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            {index < interactions.length - 1 && <div className="w-0.5 h-12 bg-slate-300 my-1"></div>}
          </div>

          {/* Content */}
          <div className="flex-1 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {INTERACTION_TYPE_LABELS[interaction.type]}
              </span>
              <span className="text-xs text-slate-500">
                {formatDistanceToNow(new Date(interaction.timestamp), { addSuffix: true })}
              </span>
            </div>
            {interaction.notes && <p className="text-sm text-slate-700 mt-1">{interaction.notes}</p>}
            {interaction.duration && (
              <p className="text-xs text-slate-500 mt-1">Duration: {interaction.duration} minutes</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
