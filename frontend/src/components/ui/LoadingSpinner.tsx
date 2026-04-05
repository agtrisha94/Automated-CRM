/**
 * LoadingSpinner Component
 * Centered spinner for async operations
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
  label?: string
}

export function LoadingSpinner({ size = 'md', fullscreen = false, label }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4',
  }

  const spinnerContent = (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`${sizeClasses[size]} border-gray-300 border-t-blue-600 rounded-full animate-spin`}
      />
      {label && <p className="text-gray-600 font-medium">{label}</p>}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
        {spinnerContent}
      </div>
    )
  }

  return <div className="flex justify-center items-center p-8">{spinnerContent}</div>
}
