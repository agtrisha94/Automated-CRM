/**
 * Dynamic Sidebar Component
 * Navigation + page-specific filters in one unified sidebar
 * Adapts content based on current page
 */
import { useLocation, NavLink as RouterNavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  toggleScoreCategory,
  setSearchQuery,
  toggleStatus,
  toggleSource,
  setDateRange,
  clearAllFilters,
} from '@/store/slices/filtersSlice'
import { Button } from '@/components/ui'
import { SCORE_CATEGORY_COLORS } from '@/constants/colors'
import { LEAD_STATUS_OPTIONS, LEAD_SOURCE_OPTIONS } from '@/constants/enums'
import type { ScoreCategory } from '@/types/Scoring.types'

const navItems = [
  { to: '/leads', label: 'Lead List', icon: '📋' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/models', label: 'Model Comparison', icon: '🔬' },
]

const scoreCategories: ScoreCategory[] = ['COLD', 'WARM', 'HOT']

export default function DynamicSidebar() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const filters = useAppSelector((state) => state.filters)
  const selectedCategories = useAppSelector((state) => state.filters.scoreCategories)
  const isLeadListPage = location.pathname === '/leads'

  const toggleCategory = (category: ScoreCategory) => {
    dispatch(toggleScoreCategory(category))
  }

  return (
    <aside className="flex flex-col shrink-0 w-72 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-200 border-r border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <span className="text-white font-bold text-lg tracking-tight">LeadScore</span>
        <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-mono font-semibold">
          AI
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation Section */}
        <nav className="flex flex-col gap-1 p-4 border-b border-slate-800/50">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">
            Navigation
          </h3>
          {navItems.map(({ to, label, icon }) => (
            <RouterNavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'px-3 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50',
                ].join(' ')
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </RouterNavLink>
          ))}
        </nav>

        {/* Lead-Specific Filters (only on Lead List page) */}
        {isLeadListPage && (
          <div className="p-4 space-y-5 border-b border-slate-800/50">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Filters
            </h3>

            {/* Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                placeholder="Name, email..."
                className="w-full px-3 py-2 text-sm bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Status
              </label>
              <div className="space-y-2">
                {LEAD_STATUS_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.statuses.includes(option.value)}
                      onChange={() => dispatch(toggleStatus(option.value))}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Source
              </label>
              <div className="space-y-2">
                {LEAD_SOURCE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(option.value)}
                      onChange={() => dispatch(toggleSource(option.value))}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 accent-blue-500 cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-slate-300 group-hover:text-white transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-2">
                Date Range
              </label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={filters.dateRange.from || ''}
                  onChange={(e) =>
                    dispatch(setDateRange({ from: e.target.value || null, to: filters.dateRange.to }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateRange.to || ''}
                  onChange={(e) =>
                    dispatch(
                      setDateRange({ from: filters.dateRange.from, to: e.target.value || null })
                    )
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-800/50 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => dispatch(clearAllFilters())}
              className="w-full text-xs"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Score Category Filter (Always visible) */}
        <div className="p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Score Categories
          </h3>
          <div className="flex flex-col gap-2">
            {scoreCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={[
                  'px-3 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 flex items-center justify-between',
                  selectedCategories.includes(category)
                    ? 'border-current text-white'
                    : 'border-slate-700 text-slate-400 opacity-60 hover:opacity-80',
                ].join(' ')}
                style={{
                  backgroundColor: selectedCategories.includes(category)
                    ? `${SCORE_CATEGORY_COLORS[category]}15`
                    : undefined,
                  borderColor: selectedCategories.includes(category)
                    ? SCORE_CATEGORY_COLORS[category]
                    : undefined,
                  color: selectedCategories.includes(category)
                    ? SCORE_CATEGORY_COLORS[category]
                    : undefined,
                }}
              >
                <span>{category}</span>
                {selectedCategories.includes(category) && <span className="text-lg">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
