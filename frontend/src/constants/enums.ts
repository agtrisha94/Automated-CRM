/**
 * Enum Constants
 * Human-readable labels and thresholds for enums
 */
import type { LeadStatus, LeadSource, InteractionType } from '@/types/Leads.types'
import type { ScoringMode, ScoreCategory } from '@/types/Scoring.types'

// ──── Lead Status Labels ────
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  CONVERTED: 'Converted',
  LOST: 'Lost',
} as const

// ──── Lead Source Labels ────
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  FORM: 'Web Form',
  WEBHOOK: 'Webhook',
  MANUAL: 'Manual',
  IMPORT: 'Import',
} as const

// ──── Interaction Type Labels ────
export const INTERACTION_TYPE_LABELS: Record<InteractionType, string> = {
  EMAIL: 'Email',
  CALL: 'Call',
  MEETING: 'Meeting',
  DEMO: 'Demo',
} as const

// ──── Scoring Mode Labels ────
export const SCORING_MODE_LABELS: Record<ScoringMode, string> = {
  RULE: 'Rule-Based',
  LR: 'Logistic Regression',
  RF: 'Random Forest',
} as const

// ──── Score Category Thresholds & Labels ────
export const SCORE_CATEGORY_THRESHOLDS: Record<
  ScoreCategory,
  { label: string; minScore: number; maxScore: number }
> = {
  COLD: { label: 'Cold', minScore: 0, maxScore: 39 },
  WARM: { label: 'Warm', minScore: 40, maxScore: 69 },
  HOT: { label: 'Hot', minScore: 70, maxScore: 100 },
} as const

// ──── Score Category Helper ────
export function getCategoryFromScore(score: number): ScoreCategory {
  if (score < 40) return 'COLD'
  if (score < 70) return 'WARM'
  return 'HOT'
}

export function getCategoryLabel(category: ScoreCategory): string {
  return SCORE_CATEGORY_THRESHOLDS[category].label
}

// ──── Status Options (for dropdowns) ────
export const LEAD_STATUS_OPTIONS = Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => ({
  value: value as LeadStatus,
  label,
}))

export const LEAD_SOURCE_OPTIONS = Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => ({
  value: value as LeadSource,
  label,
}))

export const SCORING_MODE_OPTIONS = Object.entries(SCORING_MODE_LABELS).map(([value, label]) => ({
  value: value as ScoringMode,
  label,
}))
