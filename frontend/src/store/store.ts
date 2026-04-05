import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import leadsReducer from './slices/leadsSlice'
import filtersReducer from './slices/filtersSlice'
import scoringReducer from './slices/scoringSlice'
import analyticsReducer from './slices/analyticsSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    leads: leadsReducer,
    filters: filtersReducer,
    scoring: scoringReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ['ui.toasts', 'ui.notifications'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export typed hooks for use in components
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()