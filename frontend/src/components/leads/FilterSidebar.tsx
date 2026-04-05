/**
 * Filter Sidebar
 * Multi-select filters for leads (status, source, category, date range, search)
 */
import { useAppDispatch, useAppSelector } from '@/store'
import {
  setSearchQuery,
  toggleStatus,
  toggleSource,
  toggleScoreCategory,
  setDateRange,
  clearAllFilters,
} from '@/store/slices/filtersSlice'
import { Button } from '@/components/ui'
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/constants/enums'
import type { ScoreCategory } from '@/types/Scoring.types'

const SCORE_CATEGORY_OPTIONS = ['COLD', 'WARM', 'HOT'] as const

export function FilterSidebar() {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          placeholder="Name, email, company..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <div className="space-y-2">
          {LEAD_STATUS_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.statuses.includes(option.value)}
                onChange={() => dispatch(toggleStatus(option.value))}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
        <div className="space-y-2">
          {LEAD_SOURCE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.sources.includes(option.value)}
                onChange={() => dispatch(toggleSource(option.value))}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Score Category</label>
        <div className="space-y-2">
          {SCORE_CATEGORY_OPTIONS.map((cat) => (
            <label key={cat} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.scoreCategories.includes(cat as ScoreCategory)}
                onChange={() => dispatch(toggleScoreCategory(cat as ScoreCategory))}
                className="rounded border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateRange.from || ''}
            onChange={(e) =>
              dispatch(setDateRange({ from: e.target.value || null, to: filters.dateRange.to }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <input
            type="date"
            value={filters.dateRange.to || ''}
            onChange={(e) =>
              dispatch(setDateRange({ from: filters.dateRange.from, to: e.target.value || null }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={() => dispatch(clearAllFilters())}
        className="w-full"
      >
        Clear Filters
      </Button>
    </div>
  )
}
