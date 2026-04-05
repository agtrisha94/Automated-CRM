/**
 * Scoring API Service
 * Handles lead scoring endpoints (both NestJS and FastAPI)
 */
import { nestjsClient, fastapiClient } from '../clients'
import type { CompareResult, ScoringMode } from '@/types/Scoring.types'
import { config } from '../config'

/**
 * Compare scores across all 3 models for a lead (Rule vs LR vs RF)
 * Calls FastAPI backend which runs all models and returns comparison
 */
export async function compareScores(leadId: string): Promise<CompareResult> {
  if (config.USE_MOCKS) {
    // Mock: return random comparison result
    const ruleScore = Math.floor(Math.random() * 100)
    const lrScore = Math.floor(Math.random() * 100)
    const rfScore = Math.floor(Math.random() * 100)
    
    return {
      leadId,
      ruleScore,
      lrScore,
      rfScore,
      ruleLatencyMs: Math.floor(Math.random() * 10) + 3,
      lrLatencyMs: Math.floor(Math.random() * 30) + 30,
      rfLatencyMs: Math.floor(Math.random() * 40) + 60,
      ruleCategory: ruleScore >= 70 ? ('HOT' as const) : ruleScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      lrCategory: lrScore >= 70 ? ('HOT' as const) : lrScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      rfCategory: rfScore >= 70 ? ('HOT' as const) : rfScore >= 40 ? ('WARM' as const) : ('COLD' as const),
      agreement: ruleScore === lrScore,
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

  const { data } = await fastapiClient.post<CompareResult>('/score/compare', {
    lead_id: leadId,
  })
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
