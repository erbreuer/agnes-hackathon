import { useState } from 'react'
import { ExternalLink, ImageOff } from 'lucide-react'
import type { Product } from '../../lib/api'

export function ProductCard({ product }: { product: Product }) {
  const [broken, setBroken] = useState(false)
  return (
    <a
      href={product.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-all duration-300 ease-out-soft hover:-translate-y-1 hover:shadow-md dark:border-night-border dark:bg-night-surface"
    >
      <div className="relative aspect-square overflow-hidden bg-sand-100 dark:bg-night-raised">
        {broken ? (
          <div className="grid h-full w-full place-items-center text-ink-400 dark:text-night-muted">
            <ImageOff size={22} />
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-2 text-sm font-medium text-ink-900 dark:text-night-text">
          {product.name}
        </p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-lg font-semibold text-ink-900 dark:text-night-text">
            ${product.price}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 transition-colors group-hover:text-teal-700 dark:text-teal-400">
            Buy <ExternalLink size={13} />
          </span>
        </div>
      </div>
    </a>
  )
}
