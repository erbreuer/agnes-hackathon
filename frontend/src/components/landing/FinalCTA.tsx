import { ArrowRight } from 'lucide-react'
import { Container } from '../ui/Container'
import { Button } from '../ui/Button'
import { Aurora } from '../ui/Aurora'
import { Reveal } from '../ui/Reveal'

export function FinalCTA() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-3xl border border-sand-200 bg-sand-100 px-6 py-16 text-center shadow-md dark:border-night-border dark:bg-night-surface sm:px-12 sm:py-20">
          <Aurora />
          <div className="grain absolute inset-0" aria-hidden="true" />
          <div className="relative">
            <h2 className="font-display mx-auto max-w-2xl text-h1 font-semibold text-balance text-ink-900 dark:text-night-text">
              Your room, redesigned and ready to check out.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-ink-500 dark:text-night-muted">
              Upload a photo and see it furnished with real pieces in under two minutes.
              Refine until it feels like home.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button to="/studio" size="lg">
                Start designing <ArrowRight size={18} />
              </Button>
              <Button to="/pricing" variant="secondary" size="lg">
                View pricing
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
