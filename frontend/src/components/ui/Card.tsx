/**
 * Card Component
 * Container with border and shadow
 */
import type { ReactNode, HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  hover?: boolean
}

export function Card({ children, hover = false, className, ...props }: CardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-md ${hover ? 'hover:shadow-lg transition-shadow duration-300' : ''} p-6 ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className, ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-0 py-0 pb-4 border-b border-gray-200 mb-4 ${className || ''}`} {...props}>
      <h3 className="text-lg font-bold text-gray-900">{children}</h3>
    </div>
  )
}

export function CardBody({ children, className, ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className, ...props }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg ${className || ''}`} {...props}>
      {children}
    </div>
  )
}
