import { Eye, PencilRuler, Search, Image as ImageIcon, MessageSquareText, ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { PageHeader } from '../components/ui/PageHeader'
import { Reveal } from '../components/ui/Reveal'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

const PIPELINE: { icon: LucideIcon; agent: string; model: string; body: string }[] = [
  { icon: Eye, agent: 'Analyze space', model: 'agnes-2.0-flash · vision', body: 'Reads your photo into a structured brief: style, palette, light, what to keep.' },
  { icon: PencilRuler, agent: 'Plan design', model: 'agnes-2.0-flash', body: 'Turns the brief + your budget into a shopping list with per-item price caps.' },
  { icon: Search, agent: 'Scout products', model: 'SerpApi + catalog', body: 'Finds real, in-stock products under each cap — the SKUs, before any pixels.' },
  { icon: ImageIcon, agent: 'Render room', model: 'agnes-image-2.0-flash', body: 'Composites those exact products into your actual room, keeping its perspective.' },
  { icon: MessageSquareText, agent: 'Refine', model: 'agnes-2.0-flash', body: 'Your plain-language feedback re-runs the plan → shop → render loop instantly.' },
]

export default function HowItWorks() {
  return (
    <>
      <PageHeader
        eyebrow="The pipeline"
        title={<>Real SKUs before pixels.</>}
        subtitle="Most tools imagine furniture, then leave you to find it. Hygge inverts that: it retrieves real, purchasable products first — then renders them into your room."
      />

      <Container className="py-16 sm:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge>Five agents · three Agnes models</Badge>
          <h2 className="font-display mt-5 text-h2 font-semibold text-ink-900 dark:text-night-text">
            One request runs the whole studio.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-4">
          {PIPELINE.map((step, i) => (
            <Reveal key={step.agent} delay={i * 0.06}>
              <Card hover className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-night-raised dark:text-teal-400">
                    <step.icon size={22} />
                  </span>
                  <span className="font-mono text-mono-caption text-ink-400 dark:text-night-muted sm:hidden">
                    0{i + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="font-display text-h3 font-semibold text-ink-900 dark:text-night-text">
                      {step.agent}
                    </h3>
                    <span className="rounded-full bg-sand-100 px-2.5 py-0.5 font-mono text-mono-caption text-ink-500 dark:bg-night-raised dark:text-night-muted">
                      {step.model}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500 dark:text-night-muted">
                    {step.body}
                  </p>
                </div>
                <span className="hidden font-display text-3xl font-semibold text-sand-300 dark:text-night-border sm:block">
                  0{i + 1}
                </span>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Button to="/studio" size="lg">
            Try the studio <ArrowRight size={18} />
          </Button>
        </Reveal>
      </Container>
    </>
  )
}
