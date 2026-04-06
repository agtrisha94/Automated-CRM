export const ScoringMode = {
  RULE: 'RULE',
  LR: 'LR',
  RF: 'RF',
} as const;

export type ScoringMode = typeof ScoringMode[keyof typeof ScoringMode];

export const ScoreCategory = {
  COLD: 'COLD',
  WARM: 'WARM',
  HOT: 'HOT',
} as const;

export type ScoreCategory = typeof ScoreCategory[keyof typeof ScoreCategory];

export interface ScoreHistoryEntry {
  id: string;
  leadId: string;
  oldScore: number;
  newScore: number;
  mode: ScoringMode;
  latencyMs: number;
  scoredAt: string; // ISO 8601
}

export type FeatureKey =
  | 'emailOpens'
  | 'websiteVisits'
  | 'formFills'
  | 'isCLevel'
  | 'isVP'
  | 'isDirector'
  | 'isEnterprise'
  | 'isSME'
  | 'isTechFinance';

export interface FeatureImportance {
  featureKey: FeatureKey;
  lrWeight: number;
  rfImportance: number;
  humanLabel: string;
}

export interface ScoringResult {
  leadId: string;
  ruleScore: number;
  mlScore: number;
  rfScore: number;
  ruleCategory: ScoreCategory;
  mlCategory: ScoreCategory;
  rfCategory: ScoreCategory;
  ruleLatencyMs: number;
  mlLatencyMs: number;
  rfLatencyMs: number;
  /** true when all 3 models agree on category */
  agreement: boolean;
  /** rfScore minus ruleScore */
  delta: number;
  history?: ScoreHistoryEntry[];
}

export interface CompareResult extends ScoringResult {
  featureImportances?: FeatureImportance[];
}