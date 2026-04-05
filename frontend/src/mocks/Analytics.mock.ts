import type {
  DistributionSlice,
  SourceBreakdownRow,
  FunnelStage,
  TrendPoint,
  SparsityDataPoint,
  AnalyticsPayload,
} from '@/types/Analytics.types'

// ── Score distribution ──────────────────────────────────────────
export const mockScoreDistributionRule: DistributionSlice[] = [
  { category: 'COLD', count: 18, percentage: 36 },
  { category: 'WARM', count: 20, percentage: 40 },
  { category: 'HOT',  count: 12, percentage: 24 },
]

export const mockScoreDistributionML: DistributionSlice[] = [
  { category: 'COLD', count: 15, percentage: 30 },
  { category: 'WARM', count: 19, percentage: 38 },
  { category: 'HOT',  count: 16, percentage: 32 },
]

// ── Source breakdown ─────────────────────────────────────────────
export const mockSourceBreakdown: SourceBreakdownRow[] = [
  { source: 'WEBHOOK', total: 30, hot: 10, warm: 13, cold: 7  },
  { source: 'MANUAL',  total: 20, hot:  5, warm:  8, cold: 7  },
]

// ── Conversion funnel ────────────────────────────────────────────
export const mockConversionFunnel: FunnelStage[] = [
  { stage: 'Total Leads',  count: 50,  dropOffPct: null },
  { stage: 'Contacted',    count: 32,  dropOffPct: 36   },
  { stage: 'Qualified',    count: 18,  dropOffPct: 44   },
  { stage: 'Converted',    count:  7,  dropOffPct: 61   },
]

// ── Score over time (weekly averages) ───────────────────────────
export const mockScoreOverTime: TrendPoint[] = [
  { week: '2025-W01', ruleAvg: 48, lrAvg: 54, rfAvg: 52 },
  { week: '2025-W02', ruleAvg: 51, lrAvg: 58, rfAvg: 55 },
  { week: '2025-W03', ruleAvg: 53, lrAvg: 60, rfAvg: 57 },
  { week: '2025-W04', ruleAvg: 55, lrAvg: 62, rfAvg: 59 },
  { week: '2025-W05', ruleAvg: 54, lrAvg: 61, rfAvg: 58 },
  { week: '2025-W06', ruleAvg: 57, lrAvg: 64, rfAvg: 61 },
  { week: '2025-W07', ruleAvg: 59, lrAvg: 66, rfAvg: 63 },
]

// ── Sparsity curve (Figure 2 in paper) ──────────────────────────
// Format: F1 scores across 5 seeds for 3 models at 7 dataset sizes
// mean ± std per point. Seeds simulated to give realistic variance.
const sparsitySizes = [50, 100, 200, 300, 500, 700, 1000]

const ruleF1:  number[][] = [
  [0.61, 0.62, 0.60, 0.63, 0.61], // n=50
  [0.63, 0.64, 0.62, 0.65, 0.63], // n=100
  [0.64, 0.65, 0.63, 0.66, 0.64], // n=200
  [0.65, 0.66, 0.64, 0.67, 0.65], // n=300
  [0.65, 0.66, 0.64, 0.67, 0.65], // n=500
  [0.65, 0.66, 0.64, 0.67, 0.65], // n=700
  [0.65, 0.66, 0.64, 0.67, 0.65], // n=1000 — rule-based is data-agnostic
]

const lrF1: number[][] = [
  [0.54, 0.56, 0.53, 0.55, 0.54], // n=50   — poor with sparse data
  [0.61, 0.63, 0.60, 0.62, 0.61], // n=100
  [0.67, 0.69, 0.66, 0.68, 0.67], // n=200
  [0.71, 0.73, 0.70, 0.72, 0.71], // n=300
  [0.74, 0.76, 0.73, 0.75, 0.74], // n=500
  [0.76, 0.78, 0.75, 0.77, 0.76], // n=700
  [0.77, 0.79, 0.76, 0.78, 0.77], // n=1000
]

const rfF1: number[][] = [
  [0.50, 0.52, 0.49, 0.51, 0.50], // n=50   — worst with sparse data
  [0.59, 0.61, 0.58, 0.60, 0.59], // n=100
  [0.68, 0.70, 0.67, 0.69, 0.68], // n=200
  [0.74, 0.76, 0.73, 0.75, 0.74], // n=300
  [0.79, 0.81, 0.78, 0.80, 0.79], // n=500
  [0.82, 0.84, 0.81, 0.83, 0.82], // n=700
  [0.84, 0.86, 0.83, 0.85, 0.84], // n=1000
]

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function std(arr: number[]): number {
  const m = mean(arr)
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / arr.length)
}

export const mockSparsityCurve: SparsityDataPoint[] = sparsitySizes.map((n, i) => ({
  datasetSize: n,
  ruleMean:    parseFloat(mean(ruleF1[i]).toFixed(3)),
  ruleStd:     parseFloat(std(ruleF1[i]).toFixed(3)),
  lrMean:      parseFloat(mean(lrF1[i]).toFixed(3)),
  lrStd:       parseFloat(std(lrF1[i]).toFixed(3)),
  rfMean:      parseFloat(mean(rfF1[i]).toFixed(3)),
  rfStd:       parseFloat(std(rfF1[i]).toFixed(3)),
}))

// ── Full Analytics Payload (for Phase 2.5 components) ────────────
export const mockAnalyticsPayload: AnalyticsPayload = {
  totalLeads: 50,
  conversionRate: 0.14, // 7 converted out of 50
  avgScore: 58,
  
  byScoreCategory: {
    HOT: 12,
    WARM: 20,
    COLD: 18,
  },
  
  bySource: {
    FORM: 15,
    WEBHOOK: 20,
    MANUAL: 10,
    IMPORT: 5,
  },
  
  byStatus: {
    NEW: 18,
    CONTACTED: 14,
    QUALIFIED: 11,
    CONVERTED: 7,
    LOST: 0,
  },
  
  scoreTrend: [
    { date: '2026-03-24', avgScore: 45 },
    { date: '2026-03-25', avgScore: 48 },
    { date: '2026-03-26', avgScore: 51 },
    { date: '2026-03-27', avgScore: 54 },
    { date: '2026-03-28', avgScore: 56 },
    { date: '2026-03-29', avgScore: 57 },
    { date: '2026-03-30', avgScore: 58 },
  ],
  
  sparsity: mockSparsityCurve,
  
  // Model metrics
  ruleAccuracy: 0.65,
  lrAccuracy: 0.77,
  rfAccuracy: 0.84,
  ruleAvgLatencyMs: 11,
  lrAvgLatencyMs: 45,
  rfAvgLatencyMs: 85,
}