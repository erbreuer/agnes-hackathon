import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Layered soft-shadow surface card with 2xl corners. */
export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-sand-200 bg-white shadow-sm dark:border-night-border dark:bg-night-surface',
        hover &&
          'transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}
