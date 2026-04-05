/**
 * Skeleton Component
 * Loading placeholder for content
 */
import type { HTMLAttributes } from 'react'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ width = '100%', height = 20, variant = 'text', className, ...props }: SkeletonProps) {
  const borderRadiusClass = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }

  return (
    <div
      className={`bg-gray-200 animate-pulse ${borderRadiusClass[variant]} ${className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      {...props}
    />
  )
}

export function SkeletonRow() {
  return (
    <div className="flex gap-4 p-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton height={16} width="60%" />
        <Skeleton height={12} width="80%" />
      </div>
    </div>
  )
}
