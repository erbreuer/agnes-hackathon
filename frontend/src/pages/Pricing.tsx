import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { PageHeader } from '../components/ui/PageHeader'
import { Reveal } from '../components/ui/Reveal'
import { Button } from '../components/ui/Button'
import { cn } from '../lib/cn'

type Tier = {
  name: string
  blurb: string
  monthly: number
  features: string[]
  cta: string
  featured?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    blurb: 'For a one-off room refresh.',
    monthly: 0,
    features: ['3 redesigns / month', 'Shoppable product links', 'Standard render quality', 'One refine per design'],
    cta: 'Start free',
  },
  {
    name: 'Plus',
    blurb: 'For the serial re-arranger.',
    monthly: 12,
    features: ['Unlimited redesigns', 'Unlimited refines', 'High-res renders', 'Budget & style presets', 'Save & compare rooms'],
    cta: 'Go Plus',
    featured: true,
  },
  {
    name: 'Pro',
    blurb: 'For designers & stagers.',
    monthly: 39,
    features: ['Everything in Plus', 'Client-shareable boards', 'Bulk room projects', 'Priority rendering', 'Export shopping lists'],
    cta: 'Go Pro',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(true)
  return (
    <>
      <PageHeader
        eyebrow="Pricing"
        title="Simple plans. Real rooms."
        subtitle="Start free. Upgrade when your home — or your client list — grows."
      >
        <div className="inline-flex items-center gap-3 rounded-full border border-sand-200 bg-white/70 p-1 dark:border-night-border dark:bg-night-surface/70">
          <button
            onClick={() => setAnnual(false)}
            className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition', !annual ? 'bg-sand-100 text-ink-900 dark:bg-night-raised dark:text-night-text' : 'text-ink-500 dark:text-night-muted')}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn('rounded-full px-4 py-1.5 text-sm font-medium transition', annual ? 'bg-sand-100 text-ink-900 dark:bg-night-raised dark:text-night-text' : 'text-ink-500 dark:text-night-muted')}
          >
            Annual <span className="text-teal-600 dark:text-teal-400">−20%</span>
          </button>
        </div>
      </PageHeader>

      <Container className="py-16 sm:py-24">
        <div className="grid items-stretch gap-6 lg:grid-cols-3">
          {TIERS.map((t, i) => {
            const price = annual ? Math.round(t.monthly * 0.8) : t.monthly
            return (
              <Reveal key={t.name} delay={i * 0.08}>
                <div
                  className={cn(
                    'flex h-full flex-col rounded-3xl border p-7 shadow-sm transition-all',
                    t.featured
                      ? 'border-teal-400 bg-white shadow-glow-sm dark:bg-night-surface'
                      : 'border-sand-200 bg-white dark:border-night-border dark:bg-night-surface',
                  )}
                >
                  {t.featured && (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-cta-gradient px-3 py-1 font-mono text-mono-caption uppercase text-ink-900">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-display text-h3 font-semibold text-ink-900 dark:text-night-text">{t.name}</h3>
                  <p className="mt-1 text-sm text-ink-500 dark:text-night-muted">{t.blurb}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="font-display text-5xl font-semibold text-ink-900 dark:text-night-text">${price}</span>
                    <span className="text-ink-400 dark:text-night-muted">/mo</span>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3">
                    {t.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-ink-700 dark:text-night-text">
                        <Check size={16} className="mt-0.5 shrink-0 text-teal-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    to="/studio"
                    variant={t.featured ? 'primary' : 'secondary'}
                    className="mt-7 w-full"
                  >
                    {t.cta} <ArrowRight size={16} />
                  </Button>
                </div>
              </Reveal>
            )
          })}
        </div>
        <p className="mt-10 text-center font-mono text-mono-caption text-ink-400 dark:text-night-muted">
          Prices illustrative · cancel anytime · no card to start
        </p>
      </Container>
    </>
  )
}
