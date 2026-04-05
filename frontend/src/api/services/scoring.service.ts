/**
 * Scoring API Service
 * Handles lead scoring endpoints (via NestJS backend)
 */
import { nestjsClient } from '../clients'
import type { CompareResult, ScoringMode } from '@/types/Scoring.types'
import { config } from '../config'

/**
 * Compare scores across all 3 models for a lead (Rule vs LR vs RF)
 * Calls NestJS backend which fetches lead data and calls FastAPI for ML scoring
 */
export async function compareScores(leadId: string): Promise<CompareResult> {
  if (config.USE_MOCKS) {
    // Mock: return random comparison result
    const ruleScore = Math.floor(Math.random() * 100)
    const mlScore = Math.floor(Math.random() * 100)
    const rfScore = Math.floor(Math.random() * 100)
    
    return {
      leadId,
      ruleScore,
      mlScore,
      rfScore,
      ruleLatencyMs: Math.floor(Math.random() * 10) + 3,
      mlLatencyMs: Math.floor(Math.random() * 30) + 30,
      rfLatencyMs: Math.floor(Math.random() * 40) + 60,
      ruleCategory: ruleScore >= 70 ? ('HOT' as const) : ruleScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      mlCategory: mlScore >= 70 ? ('HOT' as const) : mlScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      rfCategory: rfScore >= 70 ? ('HOT' as const) : rfScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      agreement: ruleScore === mlScore,
      delta: rfScore - ruleScore,
      history: [],
      featureImportances: [
        { featureKey: 'emailOpens', lrWeight: Math.random() * 0.3, rfImportance: Math.random() * 0.3, humanLabel: 'Email Opens' },
        { featureKey: 'websiteVisits', lrWeight: Math.random() * 0.25, rfImportance: Math.random() * 0.25, humanLabel: 'Website Visits' },
        { featureKey: 'formFills', lrWeight: Math.random() * 0.2, rfImportance: Math.random() * 0.2, humanLabel: 'Form Fills' },
        { featureKey: 'isEnterprise', lrWeight: Math.random() * 0.1, rfImportance: Math.random() * 0.1, humanLabel: 'Enterprise' },
        { featureKey: 'isSME', lrWeight: Math.random() * 0.08, rfImportance: Math.random() * 0.08, humanLabel: 'SME' },
        { featureKey: 'isCLevel', lrWeight: Math.random() * 0.07, rfImportance: Math.random() * 0.07, humanLabel: 'C-Level' },
      ],
    }
  }

  // Call NestJS backend which handles lead data fetching and FastAPI communication
  const { data } = await nestjsClient.post<CompareResult>(`/scoring/${leadId}/compare`)
  return data
}

/**
 * Set active scoring mode for a lead (RULE, LR, RF)
 * Updates lead status in NestJS; FastAPI will use this on next comparison
 */
export async function setActiveMode(leadId: string, mode: ScoringMode): Promise<void> {
  if (config.USE_MOCKS) {
    // TODO: Update mock lead active mode
    throw new Error('Mock setActiveMode not implemented')
  }

  await nestjsClient.patch(`/leads/${leadId}`, {
    activeMode: mode,
  })
}
