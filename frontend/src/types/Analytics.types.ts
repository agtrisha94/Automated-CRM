import type { ScoreCategory } from './Scoring.types';
import type { LeadSource } from './Leads.types';

export interface DistributionSlice {
  category: ScoreCategory;
  count: number;
  percentage: number;
}

export interface SourceBreakdownRow {
  source: LeadSource;
  total: number;
  hot: number;
  warm: number;
  cold: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  /** null for the first stage (no prior stage to drop from) */
  dropOffPct: number | null;
}

export interface TrendPoint {
  week: string;
  ruleAvg: number;
  lrAvg: number;
  rfAvg: number;
}

export interface SparsityDataPoint {
  datasetSize: number;
  ruleMean: number;
  ruleStd: number;
  lrMean: number;
  lrStd: number;
  rfMean: number;
  rfStd: number;
}

export interface ScoreTrendPoint {
  date: string;
  avgScore: number;
}

/** Shape returned by GET /api/analytics */
export interface AnalyticsPayload {
  totalLeads: number;
  conversionRate: number;
  avgScore: number;
  
  // Pie chart
  byScoreCategory: {
    HOT: number;
    WARM: number;
    COLD: number;
  };
  
  // Bar chart
  bySource: {
    FORM: number;
    WEBHOOK: number;
    MANUAL: number;
    IMPORT: number;
  };
  
  // Funnel
  byStatus: {
    NEW: number;
    CONTACTED: number;
    QUALIFIED: number;
    CONVERTED: number;
    LOST: number;
  };
  
  // Line chart
  scoreTrend: ScoreTrendPoint[];
  
  // Sparsity experiment
  sparsity: SparsityDataPoint[];
  
  // Model metrics
  ruleAccuracy?: number;
  lrAccuracy?: number;
  rfAccuracy?: number;
  ruleAvgLatencyMs?: number;
  lrAvgLatencyMs?: number;
  rfAvgLatencyMs?: number;
  
  // Legacy fields (for compatibility)
  distribution?: DistributionSlice[];
  sourceBreakdown?: SourceBreakdownRow[];
  funnel?: FunnelStage[];
  trend?: TrendPoint[];
}