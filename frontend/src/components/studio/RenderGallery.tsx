import { useState } from 'react'
import { motion } from 'framer-motion'
import { ImageOff, Maximize2 } from 'lucide-react'
import { cn } from '../../lib/cn'

/** Adapts to however many renders the backend returns (1 today, up to 3). */
export function RenderGallery({ renders }: { renders: string[] }) {
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const usable = renders.filter((r) => !broken.has(r))

  if (usable.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-sand-300 bg-sand-100/40 py-16 text-center dark:border-night-border dark:bg-night-surface/40">
        <ImageOff className="text-ink-400 dark:text-night-muted" size={24} />
        <p className="mt-3 max-w-xs text-sm text-ink-500 dark:text-night-muted">
          The render isn't available right now — your products and design concept are still
          ready below.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid gap-4',
        usable.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2',
      )}
    >
      {usable.map((url, i) => (
        <motion.a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="group relative overflow-hidden rounded-2xl border border-sand-200 shadow-sm dark:border-night-border"
        >
          <img
            src={url}
            alt={`Redesign render ${i + 1}`}
            onError={() => setBroken((p) => new Set(p).add(url))}
            className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-700 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 dark:bg-night-surface/90 dark:text-night-text">
            <Maximize2 size={15} />
          </span>
        </motion.a>
      ))}
    </div>
  )
}
