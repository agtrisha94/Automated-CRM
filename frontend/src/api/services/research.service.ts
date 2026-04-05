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
  if (config.USE_MOCKS) {
    return mockResearchMetrics
  }

  // Backend returns { metrics: [...], comparison: {...}, summary: {...} }
  // We need to transform it to { rules, lr, rf } format
  interface BackendMetrics {
    model: string
    f1: number
    aucRoc: number
    precision: number
    recall: number
    avgLatencyMs: number
    nSamples: number
  }

  interface BackendResponse {
    metrics: BackendMetrics[]
    comparison: { agreementRate: number; avgDelta: number }
    summary: { bestF1: number; bestAucRoc: number }
  }

  const { data } = await fastapiClient.get<BackendResponse>('/research/metrics')
  
  // Transform backend response to frontend expected format
  const rulesMetrics = data.metrics.find((m: BackendMetrics) => m.model === 'rules')
  const lrMetrics = data.metrics.find((m: BackendMetrics) => m.model === 'logistic_regression')
  const rfMetrics = data.metrics.find((m: BackendMetrics) => m.model === 'random_forest')

  return {
    rules: {
      f1: rulesMetrics?.f1 ?? 0,
      precision: rulesMetrics?.precision ?? 0,
      recall: rulesMetrics?.recall ?? 0,
      aucRoc: rulesMetrics?.aucRoc ?? 0,
      avgLatencyMs: rulesMetrics?.avgLatencyMs ?? 0,
    },
    lr: {
      f1: lrMetrics?.f1 ?? 0,
      precision: lrMetrics?.precision ?? 0,
      recall: lrMetrics?.recall ?? 0,
      aucRoc: lrMetrics?.aucRoc ?? 0,
      avgLatencyMs: lrMetrics?.avgLatencyMs ?? 0,
    },
    rf: {
      f1: rfMetrics?.f1 ?? 0,
      precision: rfMetrics?.precision ?? 0,
      recall: rfMetrics?.recall ?? 0,
      aucRoc: rfMetrics?.aucRoc ?? 0,
      avgLatencyMs: rfMetrics?.avgLatencyMs ?? 0,
    },
  }
}

/**
 * Get confusion matrices for all 3 models
 */
export async function getConfusionMatrices(): Promise<ConfusionMatricesData> {
  if (config.USE_MOCKS) {
    return mockConfusionMatrices
  }

  const { data } = await fastapiClient.get<ConfusionMatricesData>('/research/confusion-matrices')
  return data
}

/**
 * Get feature importances for all 3 models
 */
export async function getFeatureImportances(): Promise<FeatureImportances> {
  if (config.USE_MOCKS) {
    return mockFeatureImportances
  }

  const { data } = await fastapiClient.get<FeatureImportances>('/research/feature-importances')
  return data
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
    // Mock: generate random scores
    return {
      ruleScore: Math.floor(Math.random() * 100),
      mlScore: Math.floor(Math.random() * 100),
      rfScore: Math.floor(Math.random() * 100),
      ruleLatencyMs: Math.floor(Math.random() * 10) + 3,
      mlLatencyMs: Math.floor(Math.random() * 30) + 30,
      rfLatencyMs: Math.floor(Math.random() * 40) + 60,
    }
  }

  const { data } = await fastapiClient.post('/score/compare', input)
  return data
}
