/**
 * Sidebar Component
 * Navigation links and score category filter
 */
import { NavLink as RouterNavLink } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store'
import { toggleScoreCategory } from '@/store/slices/filtersSlice'
import { SCORE_CATEGORY_COLORS } from '@/constants/colors'
import type { ScoreCategory } from '@/types/Scoring.types'

const navItems = [
  { to: '/leads', label: 'Lead List' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/models', label: 'Model Comparison' },
]

const scoreCategories: ScoreCategory[] = ['COLD', 'WARM', 'HOT']

export default function Sidebar() {
  const dispatch = useAppDispatch()
  const { scoreCategories: selectedCategories } = useAppSelector((state) => state.filters)

  const toggleCategory = (category: ScoreCategory) => {
    dispatch(toggleScoreCategory(category))
  }

  return (
    <aside className="flex flex-col shrink-0 w-64 bg-slate-900 text-slate-200 border-r border-slate-800">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-800">
        <span className="text-white font-semibold tracking-tight">LeadScore</span>
        <span className="text-xs px-2 py-1 rounded bg-blue-600 text-white font-mono">AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {navItems.map(({ to, label }) => (
          <RouterNavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              [
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800',
              ].join(' ')
            }
          >
            {label}
          </RouterNavLink>
        ))}
      </nav>

      {/* Score Category Filter */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Score Categories
        </h3>
        <div className="flex flex-col gap-2">
          {scoreCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={[
                'px-3 py-2 rounded-md text-sm font-medium transition-all',
                selectedCategories.includes(category)
                  ? 'text-white opacity-100'
                  : 'text-slate-400 opacity-50 hover:opacity-75',
              ].join(' ')}
              style={{
                backgroundColor: selectedCategories.includes(category)
                  ? `${SCORE_CATEGORY_COLORS[category]}20`
                  : undefined,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
