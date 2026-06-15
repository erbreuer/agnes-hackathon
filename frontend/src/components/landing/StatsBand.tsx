import { Container } from '../ui/Container'
import { Reveal } from '../ui/Reveal'
import { STATS } from '../../data/showcase'

export function StatsBand() {
  return (
    <section className="py-10">
      <Container>
        <Reveal className="overflow-hidden rounded-3xl border border-sand-200 bg-cta-gradient/[0.06] dark:border-night-border">
          <div className="grid divide-sand-200 dark:divide-night-border sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-8 text-center">
                <div className="font-display text-4xl font-semibold text-ink-900 dark:text-night-text">
                  {s.value}
                </div>
                <div className="mt-2 font-mono text-mono-caption uppercase text-ink-500 dark:text-night-muted">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
