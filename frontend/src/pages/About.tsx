import { ArrowRight } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { PageHeader } from '../components/ui/PageHeader'
import { Reveal } from '../components/ui/Reveal'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { STATS } from '../data/showcase'

const TECH = [
  { k: 'Vision + language', v: 'agnes-2.0-flash reads the room and plans the design.' },
  { k: 'Composition', v: 'agnes-image-2.0-flash places real products into your photo.' },
  { k: 'Retrieval', v: 'SerpApi + a curated catalog source live, in-budget products.' },
  { k: 'Stack', v: 'FastAPI backend · React + Vite frontend · no database, all in-session.' },
]

export default function About() {
  return (
    <>
      <PageHeader
        eyebrow="Our story"
        title="We think design should end at a checkout, not a daydream."
        subtitle="Hygge is the Danish art of cozy contentment. We paired that warmth with retrieval-first AI so a beautiful room is also a buyable one."
      />

      <Container className="py-16 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <h2 className="font-display text-h2 font-semibold text-ink-900 dark:text-night-text">
              The problem with pretty pictures
            </h2>
            <div className="mt-5 space-y-4 text-ink-500 dark:text-night-muted">
              <p>
                AI can dream up a stunning living room in seconds. Then you fall in love with a
                sofa that doesn't exist, a lamp no one sells, and a rug you'll never find. The
                magic evaporates the moment you try to actually buy it.
              </p>
              <p>
                Hygge works the other way around. It retrieves real, in-stock products within
                your budget <em>first</em>, then composites those exact pieces into a photo of
                your room. Every item you see has a price and a buy link. What's beautiful is
                also, finally, attainable.
              </p>
              <p>
                Built in a weekend on Agnes AI — using three of its models in one deliberate
                pipeline — Hygge is a small proof of a big idea: generative design that respects
                reality.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Card className="p-7">
              <Badge>Under the hood</Badge>
              <dl className="mt-5 space-y-5">
                {TECH.map((t) => (
                  <div key={t.k}>
                    <dt className="font-display font-semibold text-ink-900 dark:text-night-text">{t.k}</dt>
                    <dd className="mt-1 text-sm text-ink-500 dark:text-night-muted">{t.v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </Reveal>
        </div>

        <Reveal className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 dark:border-night-border dark:bg-night-border sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-sand-50 px-6 py-8 text-center dark:bg-night-bg">
              <div className="font-display text-4xl font-semibold text-ink-900 dark:text-night-text">{s.value}</div>
              <div className="mt-2 font-mono text-mono-caption uppercase text-ink-500 dark:text-night-muted">{s.label}</div>
            </div>
          ))}
        </Reveal>

        <Reveal className="mt-16 text-center">
          <h2 className="font-display text-h2 font-semibold text-ink-900 dark:text-night-text">
            See it for yourself.
          </h2>
          <div className="mt-6">
            <Button to="/studio" size="lg">
              Redesign a room <ArrowRight size={18} />
            </Button>
          </div>
        </Reveal>
      </Container>
    </>
  )
}
