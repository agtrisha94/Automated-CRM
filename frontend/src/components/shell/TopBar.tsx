/**
 * TopBar Component
 * Title, scoring mode toggle, and notifications badge
 */
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { setActiveMode } from '@/store/slices/scoringSlice'
import { selectActiveMode } from '@/store'
import { selectUnreadCount } from '@/store/slices/uiSlice'
import { NotificationsPanel } from './NotificationsPanel'
import type { ScoringMode } from '@/types/Scoring.types'

const scoringModes: ScoringMode[] = ['RULE', 'LR', 'RF']

export default function TopBar() {
  const dispatch = useAppDispatch()
  const activeMode = useAppSelector(selectActiveMode)
  const unreadCount = useAppSelector(selectUnreadCount)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleModeChange = (mode: ScoringMode) => {
    dispatch(setActiveMode(mode))
  }

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-slate-200">
      {/* Title */}
      <h1 className="text-lg font-semibold text-slate-900">Lead Scoring Dashboard</h1>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Scoring Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600">Score Mode:</span>
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {scoringModes.map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={[
                  'px-3 py-1 text-sm font-medium rounded transition-all',
                  activeMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900',
                ].join(' ')}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications Badge */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Notifications"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <NotificationsPanel isOpen={notificationsOpen} />
        </div>
      </div>
    </header>
  )
}
