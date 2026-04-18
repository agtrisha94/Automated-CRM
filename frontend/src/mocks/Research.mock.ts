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
    { name: 'emailOpens', importance: 0.22 },
    { name: 'websiteVisits', importance: 0.18 },
    { name: 'formFills', importance: 0.16 },
    { name: 'recencyScore', importance: 0.14 },       // NEW: Time relevance
    { name: 'engagementVelocity', importance: 0.10 }, // NEW: Time relevance
    { name: 'companySize', importance: 0.12 },
    { name: 'industry', importance: 0.05 },
    { name: 'daysSinceCreated', importance: 0.02 },   // NEW: Time relevance
    { name: 'callsAttended', importance: 0.01 },
  ],
  lr: [
    { name: 'emailOpens', importance: 0.25 },
    { name: 'websiteVisits', importance: 0.20 },
    { name: 'recencyScore', importance: 0.16 },       // NEW: Time relevance
    { name: 'meetingsAttended', importance: 0.13 },
    { name: 'engagementVelocity', importance: 0.10 }, // NEW: Time relevance
    { name: 'formFills', importance: 0.08 },
    { name: 'companySize', importance: 0.05 },
    { name: 'daysSinceCreated', importance: 0.02 },   // NEW: Time relevance
    { name: 'industry', importance: 0.01 },
  ],
  rf: [
    { name: 'emailOpens', importance: 0.27 },
    { name: 'websiteVisits', importance: 0.22 },
    { name: 'recencyScore', importance: 0.18 },       // NEW: Time relevance
    { name: 'meetingsAttended', importance: 0.15 },
    { name: 'engagementVelocity', importance: 0.12 }, // NEW: Time relevance
    { name: 'callsAttended', importance: 0.03 },
    { name: 'formFills', importance: 0.02 },
    { name: 'companySize', importance: 0.02 },
    { name: 'daysSinceCreated', importance: 0.01 },   // NEW: Time relevance
  ],
}