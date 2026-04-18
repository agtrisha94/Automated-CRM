/**
 * Research API Service
 * Handles research dashboard endpoints (FastAPI backend)
 * Includes metrics, sparsity experiments, score comparison
 */
import { fastapiClient } from '../clients'
import type { AnalyticsPayload } from '@/types/Analytics.types'
import type { ResearchMetrics, ConfusionMatricesData, FeatureImportances } from '@/types/Research.types'
import { mockResearchMetrics, mockConfusionMatrices, mockFeatureImportances } from '@/mocks/Research.mock'
import { config } from '../config'

export interface CompareScoreInput {
  features: {
    emailOpens?: number
    websiteVisits?: number
    formFills?: number
    [key: string]: number | undefined
  }
}

/**
 * Get model performance metrics (F1, AUC-ROC, precision, recall, latency)
 * Used for paper results and model comparison page
 */
export async function getMetrics(): Promise<ResearchMetrics> {
  // Always use mocks for research data (FastAPI endpoints not fully implemented)
  return mockResearchMetrics
}

/**
 * Get confusion matrices for all 3 models
 */
export async function getConfusionMatrices(): Promise<ConfusionMatricesData> {
  // Always use mocks for research data (FastAPI endpoints not fully implemented)
  return mockConfusionMatrices
}

/**
 * Get feature importances for all 3 models
 */
export async function getFeatureImportances(): Promise<FeatureImportances> {
  // Always use mocks for research data (FastAPI endpoints not fully implemented)
  return mockFeatureImportances
}

/**
 * Run sparsity experiment (15-20 seconds long-running operation)
 * Tests model behavior as features become sparse, returns full analytics payload
 */
export async function runSparsity(): Promise<AnalyticsPayload> {
  if (config.USE_MOCKS) {
    // Mock: simulate a 2-second long-running operation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const { mockAnalyticsPayload } = await import('@/mocks/Analytics.mock')
    return mockAnalyticsPayload
  }

  const { data } = await fastapiClient.post<AnalyticsPayload>('/research/sparsity', {})
  return data
}

/**
 * Compare scores across all 3 models for given features
 * Allows ad-hoc scoring comparison without a stored lead
 */
export async function scoreCompare(input: CompareScoreInput): Promise<any> {
  if (config.USE_MOCKS) {
    return {
      ruleScore: 72.5,
      mlScore: 68.3,
      rfScore: 71.2,
      ruleCategory: 'WARM',
      mlCategory: 'WARM',
      rfCategory: 'WARM',
      agreement: true,
      ruleLatencyMs: 4,
      mlLatencyMs: 23,
      rfLatencyMs: 18,
      delta: 4.2,
      timeRelevance: {
        daysSinceCreated: 45.5,
        daysSinceActivity: 2.3,
        recencyScore: 87.5,
        engagementVelocity: 3.2,
        activityFreshness: 'active'
      }
    }
  }

  const { data } = await fastapiClient.post('/score/compare', input.features)
  return data
}
