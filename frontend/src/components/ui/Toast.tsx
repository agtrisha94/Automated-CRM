/**
 * Toast Component
 * Displays toast notifications from Redux uiSlice
 */
import { useAppDispatch, useAppSelector } from '@/store'
import { useEffect } from 'react'
import { removeToast } from '@/store/slices/uiSlice'
import type { ToastItem, ToastType } from '@/types/Ui.types'

function ToastItemComponent({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id))
    }, toast.durationMs)

    return () => clearTimeout(timer)
  }, [toast.id, toast.durationMs, dispatch])

  const typeClasses: Record<ToastType, string> = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-blue-50 text-blue-800 border-blue-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
  }

  const iconEmoji: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  }

  return (
    <div className={`border rounded-lg shadow-md p-4 flex gap-3 items-start ${typeClasses[toast.type]}`}>
      <span className="text-lg font-bold">{iconEmoji[toast.type]}</span>
      <div className="flex-1">
        <h3 className="font-semibold">{toast.title}</h3>
        {toast.message && <p className="text-sm mt-1">{toast.message}</p>}
      </div>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="text-gray-400 hover:text-gray-600 font-bold"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.ui.toasts)

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50 max-w-md">
      {toasts.map((toast) => (
        <ToastItemComponent key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
