import { Container } from '../ui/Container'
import { Badge } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { HOW_STEPS } from '../../data/showcase'

export function HowItWorks() {
  return (
    <section className="border-y border-sand-200 bg-sand-100/40 py-20 dark:border-night-border dark:bg-night-surface/30 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <Badge>How it works</Badge>
          <h2 className="font-display mt-5 text-h2 font-semibold text-ink-900 dark:text-night-text">
            From photo to shoppable room in four steps.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 dark:border-night-border dark:bg-night-border sm:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((s, i) => (
            <Reveal
              key={s.n}
              delay={i * 0.08}
              className="group bg-sand-50 p-7 transition-colors hover:bg-white dark:bg-night-bg dark:hover:bg-night-surface"
            >
              <span className="font-mono text-mono-caption text-teal-500 dark:text-teal-400">
                {s.n}
              </span>
              <h3 className="font-display mt-3 text-h3 font-semibold text-ink-900 dark:text-night-text">
                {s.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-500 dark:text-night-muted">
                {s.body}
              </p>
              <div className="mt-6 h-0.5 w-8 origin-left scale-x-100 rounded-full bg-teal-400 transition-transform duration-300 group-hover:scale-x-150" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
