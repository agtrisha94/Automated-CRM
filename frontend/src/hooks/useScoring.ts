/**
 * useScoring Hook
 * Manages lead scoring state, score comparison, and active mode
 */
import { useCallback } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  selectActiveMode,
  selectCompareResult,
  selectLatencyHistory,
  selectIsComparing,
  selectScoringError,
} from '@/store'
import { runScoreCompare, setActiveMode } from '@/store/slices/scoringSlice'
import type { ScoringMode } from '@/types/Scoring.types'

export function useScoring() {
  const dispatch = useAppDispatch()

  // Selectors
  const activeMode = useAppSelector(selectActiveMode)
  const compareResult = useAppSelector(selectCompareResult)
  const latencyHistory = useAppSelector(selectLatencyHistory)
  const isComparing = useAppSelector(selectIsComparing)
  const error = useAppSelector(selectScoringError)

  // Run comparison for a lead
  const compareScores = useCallback(
    async (leadId: string) => {
      return dispatch(runScoreCompare(leadId))
    },
    [dispatch]
  )

  // Change active scoring mode (RULE, LR, RF)
  const setMode = useCallback(
    (mode: ScoringMode) => {
      dispatch(setActiveMode(mode))
    },
    [dispatch]
  )

  return {
    // State
    activeMode,
    compareResult,
    latencyHistory,
    isComparing,
    error,
    // Actions
    compareScores,
    setMode,
  }
}
