/**
 * Analytics API Service
 * Handles analytics dashboard endpoints (NestJS backend)
 */
import { nestjsClient } from '../clients'
import type { AnalyticsPayload } from '@/types/Analytics.types'
import { mockAnalyticsPayload } from '@/mocks/Analytics.mock'
import { config } from '../config'

export interface ResearchAnalytics {
  totalComparisons: number
  agreementRate: number
  avgDelta: number
  ruleAvgLatencyMs: number
  mlAvgLatencyMs: number
  byCategory: {
    COLD: { agreement: number; count: number }
    WARM: { agreement: number; count: number }
    HOT: { agreement: number; count: number }
  }
}

/**
 * Get main analytics dashboard data
 * Distribution, funnel, trends, source breakdown, etc.
 */
export async function getAnalytics(): Promise<AnalyticsPayload> {
  if (config.USE_MOCKS) {
    return mockAnalyticsPayload
  }

  const { data } = await nestjsClient.get<AnalyticsPayload>('/analytics/overview')
  return data
}

/**
 * Get research-specific analytics (model comparison metrics)
 * Used by research dashboard to show rule-based vs ML model performance
 */
export async function getResearchAnalytics(): Promise<ResearchAnalytics> {
  if (config.USE_MOCKS) {
    return {
      totalComparisons: 1000,
      agreementRate: 0.82,
      avgDelta: 4.2,
      ruleAvgLatencyMs: 11,
      mlAvgLatencyMs: 43,
      byCategory: {
        COLD: { agreement: 0.91, count: 500 },
        WARM: { agreement: 0.79, count: 350 },
        HOT: { agreement: 0.68, count: 150 },
      },
    }
  }

  const { data } = await nestjsClient.get<ResearchAnalytics>('/analytics/model-comparison')
  return data
}
