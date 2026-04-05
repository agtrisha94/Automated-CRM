/**
 * Feature Constants
 * Maps feature keys (from ML models) to human-readable labels
 * Used by FeatureImportanceChart and LiveScoreTester
 */

/**
 * Feature name mapping
 * These are the engagement features tracked for each lead
 */
export const FEATURE_LABELS: Record<string, string> = {
  // Engagement signals
  emailOpens: 'Email Opens',
  websiteVisits: 'Website Visits',
  formFills: 'Form Fills',

  // Company signals
  companySize: 'Company Size',
  industry: 'Industry',

  // Interaction history
  callsAttended: 'Calls Attended',
  meetingsAttended: 'Meetings Attended',
  demosAttended: 'Demos Attended',

  // Time-based
  daysSinceFirstInteraction: 'Days Since First Contact',
} as const

/**
 * Feature descriptions (for tooltips)
 */
export const FEATURE_DESCRIPTIONS: Record<string, string> = {
  emailOpens: 'Number of times lead opened marketing emails',
  websiteVisits: 'Number of visits to website',
  formFills: 'Number of forms filled out',
  companySize: 'Size of lead company (startup/SME/enterprise)',
  industry: 'Industry vertical',
  callsAttended: 'Number of sales calls attended',
  meetingsAttended: 'Number of meetings attended',
  demosAttended: 'Number of product demos attended',
  daysSinceFirstInteraction: 'Days elapsed since first engagement',
} as const

/**
 * Get feature label with fallback
 */
export function getFeatureLabel(featureKey: string): string {
  return FEATURE_LABELS[featureKey as keyof typeof FEATURE_LABELS] || featureKey
}

/**
 * Get feature description with fallback
 */
export function getFeatureDescription(featureKey: string): string {
  return FEATURE_DESCRIPTIONS[featureKey as keyof typeof FEATURE_DESCRIPTIONS] || ''
}

/**
 * All feature keys for iteration
 */
export const FEATURE_KEYS = [
  'emailOpens',
  'websiteVisits',
  'formFills',
  'companySize',
  'industry',
  'callsAttended',
  'meetingsAttended',
  'demosAttended',
  'daysSinceFirstInteraction',
] as const
