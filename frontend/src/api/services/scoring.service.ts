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
    // Mock mode: generate synthetic comparison data
    const ruleScore = Math.floor(Math.random() * 100)
    const mlScore = Math.floor(Math.random() * 100)
    const rfScore = Math.floor(Math.random() * 100)
    
    const ruleCategory = ruleScore >= 70 ? ('HOT' as const) : ruleScore >= 40 ? ('WARM' as const) : ('COLD' as const)
    const mlCategory = mlScore >= 70 ? ('HOT' as const) : mlScore >= 40 ? ('WARM' as const) : ('COLD' as const)
    const rfCategory = rfScore >= 70 ? ('HOT' as const) : rfScore >= 40 ? ('WARM' as const) : ('COLD' as const)

    return {
      leadId,
      ruleScore,
      mlScore,
      rfScore,
      ruleLatencyMs: Math.floor(Math.random() * 10) + 3,
      mlLatencyMs: Math.floor(Math.random() * 30) + 30,
      rfLatencyMs: Math.floor(Math.random() * 40) + 60,
      ruleCategory,
      mlCategory,
      rfCategory,
      agreement: ruleCategory === mlCategory && mlCategory === rfCategory,
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

  // Call the real backend endpoint instead of using mock data
  try {
    const response = await nestjsClient.post<CompareResult>(
      `/scoring/${leadId}/compare`,
      {},
      { timeout: config.NESTJS_TIMEOUT }
    )
    return response.data
  } catch (error) {
    console.error(`Failed to compare scores for lead ${leadId}:`, error)
    
    // Provide helpful error messages
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        console.error('🔴 Network error: Check if NestJS backend is running on port 3000')
      } else if (error.message.includes('timeout')) {
        console.error('⏱️ Timeout: FastAPI service may not be responding (port 8000)')
      } else if (error.message.includes('404')) {
        console.error('❌ Lead not found:', leadId)
      } else if (error.message.includes('500')) {
        console.error('⚠️ Internal server error in backend - check server logs')
      }
    }
    
    throw error
  }
}

/**
 * Set active scoring mode for a lead (RULE, LR, RF)
 * Updates lead status in NestJS; FastAPI will use this on next comparison
 */
export async function setActiveMode(leadId: string, mode: ScoringMode): Promise<void> {
  if (config.USE_MOCKS) {
    // Mock mode: Just acknowledge the mode change
    // In mock mode, activeMode is not persisted on the lead object
    console.log(`[Mock] Set active scoring mode for lead ${leadId} to ${mode}`)
    return
  }

  await nestjsClient.patch(`/leads/${leadId}`, {
    activeMode: mode,
  })
}
