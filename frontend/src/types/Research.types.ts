/** Must match the string values of ScoringMode enum exactly */
export type ModelKey = 'RULE' | 'LR' | 'RF';

export interface ModelMetrics {
  model: ModelKey;
  label: string;
  precision: number;
  recall: number;
  f1: number;
  aucRoc: number;
}

export interface LatencyStat {
  model: ModelKey;
  label: string;
  meanMs: number;
  stdMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
}

export interface ConfusionMatrix {
  model: ModelKey;
  label: string;
  matrix: [[number, number], [number, number]];
  labels: [string, string];
}

export interface CostBenefitRow {
  model: ModelKey;
  label: string;
  trainingTimeMs: number;
  avgInferenceMs: number;
  maintenanceEffort: 'Low' | 'Medium' | 'High';
  f1At200: number;
  f1At1000: number;
}

export type InterpretabilityScore = 'full' | 'partial' | 'none';

export interface InterpretabilityRow {
  dimension: string;
  description: string;
  rule: InterpretabilityScore;
  lr: InterpretabilityScore;
  rf: InterpretabilityScore;
}

/** All 9 feature fields required for a live scoring request */
export interface LiveScoreInput {
  emailOpens: number;
  websiteVisits: number;
  formFills: number;
  isCLevel: number;
  isVP: number;
  isDirector: number;
  isEnterprise: number;
  isSME: number;
  isTechFinance: number;
}

/** Performance metrics for a single model */
export interface ModelPerformance {
  f1: number
  precision: number
  recall: number
  aucRoc: number
  avgLatencyMs: number
}

/** All research metrics combined */
export interface ResearchMetrics {
  rules: ModelPerformance
  lr: ModelPerformance
  rf: ModelPerformance
}

/** Confusion matrix for a single model */
export interface ConfusionMatrixData {
  tp: number
  fp: number
  tn: number
  fn: number
}

/** All confusion matrices */
export interface ConfusionMatricesData {
  rules: ConfusionMatrixData
  lr: ConfusionMatrixData
  rf: ConfusionMatrixData
}

/** Feature importance for a model */
export interface FeatureImportance {
  name: string
  importance: number
}

/** All feature importances by model */
export interface FeatureImportances {
  rules: FeatureImportance[]
  lr: FeatureImportance[]
  rf: FeatureImportance[]
}