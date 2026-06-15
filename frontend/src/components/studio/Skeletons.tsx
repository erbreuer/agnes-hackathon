/** Shimmer skeletons for the loading state. */
export function RenderSkeleton() {
  return (
    <div className="shimmer aspect-[4/3] w-full rounded-2xl bg-sand-200/70 dark:bg-night-raised" />
  )
}

export function ProductSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-sand-200 dark:border-night-border"
        >
          <div className="shimmer aspect-square bg-sand-200/70 dark:bg-night-raised" />
          <div className="space-y-2 p-3.5">
            <div className="shimmer h-3.5 w-3/4 rounded bg-sand-200/70 dark:bg-night-raised" />
            <div className="shimmer h-3.5 w-1/3 rounded bg-sand-200/70 dark:bg-night-raised" />
          </div>
        </div>
      ))}
    </div>
  )
}
