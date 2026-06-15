import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

/**
 * Hygge wordmark. Fraunces display with the double-g set as a teal ligature-ish
 * accent — the signature mark.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Hygge — home"
      className={cn(
        'group inline-flex items-center gap-2 font-display font-semibold tracking-tight',
        className,
      )}
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-cta-gradient text-ink-900 shadow-glow-sm transition-transform duration-300 ease-spring group-hover:rotate-[-8deg]">
        <span className="font-display text-lg font-bold leading-none">h</span>
      </span>
      <span className="font-display text-[1.4rem] leading-none text-ink-900 dark:text-night-text">
        Hy
        <span className="text-teal-500 dark:text-teal-400">gg</span>
        e
      </span>
    </Link>
  )
}
