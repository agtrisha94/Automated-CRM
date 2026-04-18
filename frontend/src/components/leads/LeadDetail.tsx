/**
 * Lead Detail Panel
 * Side panel showing deep scoring analysis for selected lead
 */
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectCompareResult, selectIsComparing, selectScoringError } from '@/store'
import { runScoreCompare } from '@/store/slices/scoringSlice'
import { Button, Card, ScoreBadge } from '@/components/ui'
import { ScoreComparisonPanel } from '@/components/scoring'
import { TimeRelevanceBadge } from '@/components/TimeRelevanceBadge'
import { InteractionForm } from './InteractionForm'
import { InteractionTimeline } from './InteractionTimeline'
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '@/constants/enums'
import type { Lead, InteractionType } from '@/types/Leads.types'

interface LeadDetailProps {
  lead: Lead | null
  isOpen: boolean
  onClose: () => void
}

export function LeadDetail({ lead, isOpen, onClose }: LeadDetailProps) {
  const dispatch = useAppDispatch()
  const compareResult = useAppSelector(selectCompareResult)
  const isComparing = useAppSelector(selectIsComparing)
  const scoringError = useAppSelector(selectScoringError)
  const [activeTab, setActiveTab] = useState<'scoring' | 'interactions'>('scoring')
  const [isAddingInteraction, setIsAddingInteraction] = useState(false)

  if (!isOpen || !lead) return null

  const handleCompare = async () => {
    await dispatch(runScoreCompare(lead.id))
  }

  const handleAddInteraction = (type: InteractionType, notes: string, duration?: number) => {
    console.log('Adding interaction:', { type, notes, duration })
    // TODO: Call addInteraction API when backend is ready
    setIsAddingInteraction(false)
  }

  return (
    <div className="w-96 bg-white h-full shadow-xl overflow-y-auto border-l border-gray-200">
      <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{lead.name}</h2>
              <p className="text-sm text-gray-600">{lead.email}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          {/* Lead Info */}
          <Card>
            <div className="p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Company</span>
                <span className="font-medium">{lead.company || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Job Title</span>
                <span className="font-medium">{lead.jobTitle || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="font-medium">{LEAD_STATUS_LABELS[lead.status]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Source</span>
                <span className="font-medium">{LEAD_SOURCE_LABELS[lead.source]}</span>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('scoring')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'scoring'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Scoring
            </button>
            <button
              onClick={() => setActiveTab('interactions')}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'interactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Interactions
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'scoring' && (
            <div className="space-y-4">
              {/* Score */}
              <Card>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Score</span>
                    <ScoreBadge score={lead.activeScore} category={lead.scoreCategory} />
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleCompare}
                    disabled={isComparing}
                    className="w-full"
                  >
                    {isComparing ? 'Comparing...' : 'Compare Models'}
                  </Button>
                </div>
              </Card>

              {/* Score Comparison Result */}
              <div>
                <ScoreComparisonPanel compareResult={compareResult} isLoading={isComparing} error={scoringError} />
              </div>

              {/* Time Relevance Metrics */}
              {compareResult?.timeRelevance && (
                <div>
                  <TimeRelevanceBadge timeRelevance={compareResult.timeRelevance} />
                </div>
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div className="space-y-4">
              {!isAddingInteraction ? (
                <Button
                  variant="primary"
                  onClick={() => setIsAddingInteraction(true)}
                  className="w-full"
                >
                  + Add Interaction
                </Button>
              ) : (
                <div className="space-y-2">
                  <InteractionForm
                    onSubmit={handleAddInteraction}
                    isLoading={false}
                  />
                  <Button
                    variant="secondary"
                    onClick={() => setIsAddingInteraction(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <Card>
                <div className="p-0">
                  <InteractionTimeline lead={lead} />
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
  )
}