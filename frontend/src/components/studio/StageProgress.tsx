import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { StageId } from '../../lib/api'

const ALL: { id: StageId; label: string }[] = [
  { id: 'analyze', label: 'Analyzing your space' },
  { id: 'plan', label: 'Planning the design' },
  { id: 'scout', label: 'Sourcing real products' },
  { id: 'render', label: 'Rendering your room' },
]

export function StageProgress({
  active,
  stages = ALL,
}: {
  active: StageId | null
  stages?: { id: StageId; label: string }[]
}) {
  const activeIndex = active ? stages.findIndex((s) => s.id === active) : -1
  return (
    <ul className="space-y-3" aria-live="polite">
      {stages.map((s, i) => {
        const state =
          activeIndex === -1
            ? 'pending'
            : i < activeIndex
              ? 'done'
              : i === activeIndex
                ? 'active'
                : 'pending'
        return (
          <li key={s.id} className="flex items-center gap-3">
            <span
              className={cn(
                'grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors',
                state === 'done' && 'border-teal-500 bg-teal-500 text-white',
                state === 'active' && 'border-teal-400 text-teal-500',
                state === 'pending' &&
                  'border-sand-300 text-transparent dark:border-night-border',
              )}
            >
              {state === 'done' ? (
                <Check size={13} />
              ) : state === 'active' ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" />
              ) : (
                <span className="h-1.5 w-1.5 rounded-full bg-sand-300 dark:bg-night-border" />
              )}
            </span>
            <span
              className={cn(
                'text-sm transition-colors',
                state === 'pending'
                  ? 'text-ink-400 dark:text-night-muted'
                  : 'text-ink-900 dark:text-night-text',
              )}
            >
              {s.label}
              {state === 'active' && '…'}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
