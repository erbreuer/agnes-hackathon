import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Small mono-caption pill — e.g. an eyebrow label above a heading. */
export function Badge({
  children,
  className,
  icon,
}: {
  children: ReactNode
  className?: string
  icon?: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-white/60 px-3 py-1 font-mono text-mono-caption uppercase text-ink-500 backdrop-blur dark:border-night-border dark:bg-night-surface/60 dark:text-night-muted',
        className,
      )}
    >
      {icon && <span className="text-teal-500 dark:text-teal-400">{icon}</span>}
      {children}
    </span>
  )
}
