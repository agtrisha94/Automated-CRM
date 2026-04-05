import type {
  ResearchMetrics,
  ConfusionMatricesData,
  FeatureImportances,
} from '@/types/Research.types'

// ── Research Metrics (F1, Precision, Recall, AUC-ROC, Latency) ────
export const mockResearchMetrics: ResearchMetrics = {
  rules: {
    f1: 0.625,
    precision: 0.64,
    recall: 0.61,
    aucRoc: 0.68,
    avgLatencyMs: 11,
  },
  lr: {
    f1: 0.755,
    precision: 0.77,
    recall: 0.74,
    aucRoc: 0.81,
    avgLatencyMs: 43,
  },
  rf: {
    f1: 0.815,
    precision: 0.82,
    recall: 0.81,
    aucRoc: 0.87,
    avgLatencyMs: 67,
  },
}

// ── Confusion Matrices (TP, FP, TN, FN for each model) ────
export const mockConfusionMatrices: ConfusionMatricesData = {
  rules: {
    tp: 610,
    fp: 360,
    tn: 640,
    fn: 390,
  },
  lr: {
    tp: 740,
    fp: 230,
    tn: 770,
    fn: 260,
  },
  rf: {
    tp: 810,
    fp: 180,
    tn: 820,
    fn: 190,
  },
}

// ── Feature Importances (top features per model) ────
export const mockFeatureImportances: FeatureImportances = {
  rules: [
    { name: 'emailOpens', importance: 0.25 },
    { name: 'websiteVisits', importance: 0.20 },
    { name: 'formFills', importance: 0.18 },
    { name: 'companySize', importance: 0.15 },
    { name: 'industry', importance: 0.12 },
    { name: 'callsAttended', importance: 0.05 },
    { name: 'meetingsAttended', importance: 0.03 },
    { name: 'demosAttended', importance: 0.02 },
    { name: 'daysSinceFirstInteraction', importance: 0.00 },
  ],
  lr: [
    { name: 'emailOpens', importance: 0.28 },
    { name: 'websiteVisits', importance: 0.22 },
    { name: 'meetingsAttended', importance: 0.15 },
    { name: 'formFills', importance: 0.13 },
    { name: 'callsAttended', importance: 0.10 },
    { name: 'companySize', importance: 0.07 },
    { name: 'industry', importance: 0.03 },
    { name: 'demosAttended', importance: 0.02 },
    { name: 'daysSinceFirstInteraction', importance: 0.00 },
  ],
  rf: [
    { name: 'emailOpens', importance: 0.30 },
    { name: 'websiteVisits', importance: 0.24 },
    { name: 'meetingsAttended', importance: 0.18 },
    { name: 'callsAttended', importance: 0.12 },
    { name: 'formFills', importance: 0.08 },
    { name: 'companySize', importance: 0.05 },
    { name: 'demosAttended', importance: 0.02 },
    { name: 'industry', importance: 0.01 },
    { name: 'daysSinceFirstInteraction', importance: 0.00 },
  ],
}