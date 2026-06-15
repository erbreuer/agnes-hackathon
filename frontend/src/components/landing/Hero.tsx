import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Tag } from 'lucide-react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { Aurora } from '../ui/Aurora'
import { fadeRise, stagger } from '../../lib/motion'
import { IMAGES, FLOATING_PRODUCTS } from '../../data/showcase'

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Aurora />
      <div className="grain absolute inset-0" aria-hidden="true" />

      <Container className="relative pb-20 pt-20 sm:pt-28 lg:pb-28 lg:pt-32">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Copy */}
          <motion.div variants={stagger(0.1)} initial="hidden" animate="show">
            <motion.div variants={fadeRise}>
              <Badge icon={<Sparkles size={12} />}>Retrieval-first interior design</Badge>
            </motion.div>

            <motion.h1
              variants={fadeRise}
              className="font-display mt-6 text-display font-semibold tracking-tight text-balance text-ink-900 dark:text-night-text"
            >
              Design you can
              <br />
              <span className="relative">
                actually{' '}
                <span className="bg-cta-gradient bg-clip-text text-transparent">buy</span>
                .
              </span>
            </motion.h1>

            <motion.p
              variants={fadeRise}
              className="mt-6 max-w-prose text-lg leading-relaxed text-ink-500 dark:text-night-muted"
            >
              Upload a photo of your room. Hygge redesigns it with{' '}
              <span className="text-ink-900 dark:text-night-text">real, purchasable products</span>{' '}
              — within your budget, with a buy link on every piece.
            </motion.p>

            <motion.div variants={fadeRise} className="mt-9 flex flex-wrap items-center gap-3">
              <Button to="/studio" size="lg">
                Redesign my room <ArrowRight size={18} />
              </Button>
              <Button to="/how-it-works" variant="secondary" size="lg">
                See how it works
              </Button>
            </motion.div>

            <motion.p
              variants={fadeRise}
              className="mt-6 font-mono text-mono-caption uppercase text-ink-400 dark:text-night-muted"
            >
              No card needed · Real SKUs before pixels
            </motion.p>
          </motion.div>

          {/* Render preview with floating price tags */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-lg dark:border-night-border dark:bg-night-surface">
              <img
                src={IMAGES.roomAfter}
                alt="A living room redesigned by Hygge — sage sofa, walnut table, wool rug"
                className="aspect-[4/5] w-full object-cover sm:aspect-[4/3]"
                loading="eager"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/30 via-transparent to-transparent" />
            </div>

            {FLOATING_PRODUCTS.slice(0, 3).map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                className={[
                  'absolute flex items-center gap-2 rounded-full border border-sand-200 bg-white/90 px-3 py-1.5 shadow-md backdrop-blur dark:border-night-border dark:bg-night-surface/90',
                  i === 0 ? 'left-4 top-6' : i === 1 ? '-left-3 bottom-24' : 'right-4 bottom-8',
                ].join(' ')}
              >
                <Tag size={13} className="text-teal-500" />
                <span className="max-w-[10rem] truncate text-xs font-medium text-ink-900 dark:text-night-text">
                  {p.name.split(',')[0]}
                </span>
                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                  ${p.price}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
