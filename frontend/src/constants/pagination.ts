/**
 * Pagination Constants
 * Default values and options for lead list pagination
 */

export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 20
export const PAGE_SIZE_OPTIONS = [10, 20, 50]

// Maximum leads per page
export const MAX_PAGE_SIZE = 100

// List view defaults
export const PAGINATION_DEFAULTS = {
  page: DEFAULT_PAGE,
  limit: DEFAULT_PAGE_SIZE,
} as const
