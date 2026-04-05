/**
 * InteractionForm Component
 * Form for adding new interactions (calls, emails, meetings, demos)
 */
import { useState } from 'react'
import { Button } from '@/components/ui'
import type { InteractionType } from '@/types/Leads.types'
import { INTERACTION_TYPE_LABELS } from '@/constants/enums'

interface InteractionFormProps {
  onSubmit: (type: InteractionType, notes: string, duration?: number) => void
  isLoading?: boolean
}

export function InteractionForm({ onSubmit, isLoading = false }: InteractionFormProps) {
  const [type, setType] = useState<InteractionType>('EMAIL')
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState<number | undefined>()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(type, notes, duration)
    setNotes('')
    setDuration(undefined)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Interaction Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InteractionType)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(INTERACTION_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any notes about this interaction..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Duration (minutes, optional)</label>
        <input
          type="number"
          value={duration || ''}
          onChange={(e) => setDuration(e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="15"
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          min="0"
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Adding...' : 'Add Interaction'}
      </Button>
    </form>
  )
}
