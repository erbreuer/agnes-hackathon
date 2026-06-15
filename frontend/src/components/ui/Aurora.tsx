import { cn } from '../../lib/cn'

/**
 * Soft aurora/mesh gradient backdrop — drifting blurred blobs in teal + amber
 * over the sand canvas. Decorative only (aria-hidden). Pair with <Grain/>.
 */
export function Aurora({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
    >
      <div className="absolute -left-[10%] -top-[20%] h-[55vh] w-[55vh] rounded-full bg-teal-400/30 blur-[90px] animate-aurora-drift dark:bg-teal-500/25" />
      <div
        className="absolute -right-[5%] top-[5%] h-[45vh] w-[45vh] rounded-full bg-amber-300/40 blur-[100px] animate-aurora-drift dark:bg-amber-400/20"
        style={{ animationDelay: '-5s' }}
      />
      <div
        className="absolute bottom-[-25%] left-[30%] h-[50vh] w-[60vh] rounded-full bg-teal-100/60 blur-[110px] animate-aurora-drift dark:bg-teal-700/25"
        style={{ animationDelay: '-9s' }}
      />
    </div>
  )
}
