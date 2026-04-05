/**
 * Color Constants
 * Tailwind color tokens for scoring categories, lead statuses, sources, and charts
 */

// ──── Score Category Colors (HOT/WARM/COLD) ────
export const SCORE_CATEGORY_COLORS = {
  HOT: '#ef4444', // red-500
  WARM: '#fbbf24', // amber-400
  COLD: '#93c5fd', // blue-300
} as const

// ──── Lead Status Colors ────
export const STATUS_COLORS = {
  NEW: '#3b82f6', // blue-500
  CONTACTED: '#8b5cf6', // violet-500
  QUALIFIED: '#10b981', // emerald-500
  CONVERTED: '#059669', // emerald-600
  LOST: '#6b7280', // gray-500
} as const

// ──── Lead Source Colors ────
export const SOURCE_COLORS = {
  FORM: '#3b82f6', // blue-500
  WEBHOOK: '#8b5cf6', // violet-500
  MANUAL: '#f59e0b', // amber-500
  IMPORT: '#ec4899', // pink-500
} as const

// ──── Recharts Palette (6 colors for pie/line/bar charts) ────
export const CHART_PALETTE = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
] as const

// ──── Tailwind Class Strings (for dynamic className) ────
export const SCORE_CATEGORY_TAILWIND = {
  HOT: 'text-red-500 bg-red-50 border-red-200',
  WARM: 'text-amber-600 bg-amber-50 border-amber-200',
  COLD: 'text-blue-600 bg-blue-50 border-blue-200',
} as const

export const STATUS_TAILWIND = {
  NEW: 'text-blue-600 bg-blue-50 border-blue-200',
  CONTACTED: 'text-violet-600 bg-violet-50 border-violet-200',
  QUALIFIED: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  CONVERTED: 'text-emerald-700 bg-emerald-50 border-emerald-300',
  LOST: 'text-gray-600 bg-gray-50 border-gray-200',
} as const
