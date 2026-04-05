import type { RootState } from '../store'
import type { Lead } from '@/types/Leads.types'

export const selectActiveMode = (state: RootState) => state.scoring.activeMode
export const selectCompareResult = (state: RootState) => state.scoring.compareResult
export const selectLatencyHistory = (state: RootState) => state.scoring.latencyHistory
export const selectIsComparing = (state: RootState) => state.scoring.isComparing
export const selectScoringError = (state: RootState) => state.scoring.error

// Get the active score for a lead based on current mode
export const selectActiveScoreForLead = (state: RootState, lead: Lead) => {
  const mode = state.scoring.activeMode
  switch (mode) {
    case 'RULE':
      return lead.ruleScore ?? lead.activeScore
    case 'LR':
      return lead.mlScore ?? lead.activeScore
    case 'RF':
      // If RF score not available, fall back to ML or active
      return lead.mlScore ?? lead.activeScore
    default:
      return lead.activeScore
  }
}

// Latency stats
export const selectAvgLatency = (state: RootState) => {
  const { latencyHistory } = state.scoring
  if (latencyHistory.length === 0) return { ruleMs: 0, lrMs: 0, rfMs: 0 }

  const sum = latencyHistory.reduce(
    (acc: { ruleMs: number; lrMs: number; rfMs: number }, record: any) => ({
      ruleMs: acc.ruleMs + record.ruleMs,
      lrMs: acc.lrMs + record.lrMs,
      rfMs: acc.rfMs + record.rfMs,
    }),
    { ruleMs: 0, lrMs: 0, rfMs: 0 }
  )
  return {
    ruleMs: Math.round(sum.ruleMs / latencyHistory.length),
    lrMs: Math.round(sum.lrMs / latencyHistory.length),
    rfMs: Math.round(sum.rfMs / latencyHistory.length),
  }
}
