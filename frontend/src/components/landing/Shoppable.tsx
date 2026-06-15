import { motion } from 'framer-motion'
import { ExternalLink, BadgeCheck } from 'lucide-react'
import { Container } from '../ui/Container'
import { Badge } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { MOCK_PRODUCTS } from '../../data/mock'

export function Shoppable() {
  const products = MOCK_PRODUCTS.slice(0, 4)
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <Badge icon={<BadgeCheck size={12} />}>Shoppable, not imaginary</Badge>
            <h2 className="font-display mt-5 text-h2 font-semibold text-balance text-ink-900 dark:text-night-text">
              Every pixel in the render is a product with a price tag.
            </h2>
            <p className="mt-5 max-w-prose text-ink-500 dark:text-night-muted">
              Most AI tools dream up furniture you can never find. Hygge works backwards —
              it retrieves real items within your budget first, then composites those exact
              pieces into your room. What you see is what you can buy.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'Live buy links on every item',
                'Prices that respect your total budget',
                'Swap anything by just asking',
              ].map((t) => (
                <li key={t} className="flex items-center gap-3 text-ink-700 dark:text-night-text">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-teal-50 text-teal-600 dark:bg-night-raised dark:text-teal-400">
                    <BadgeCheck size={13} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Floating product cards */}
          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            {products.map((p, i) => (
              <motion.a
                key={p.name}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className={[
                  'group block overflow-hidden rounded-2xl border border-sand-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-night-border dark:bg-night-surface',
                  i % 2 === 1 ? 'sm:translate-y-6' : '',
                ].join(' ')}
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-ink-700 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 dark:bg-night-surface/90 dark:text-night-text">
                    <ExternalLink size={13} />
                  </span>
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-medium text-ink-900 dark:text-night-text">
                    {p.name}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-teal-600 dark:text-teal-400">
                    ${p.price}
                  </p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
