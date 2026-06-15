import { Wallet, MessagesSquare, ShoppingBag } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Container } from '../ui/Container'
import { Badge } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { Card } from '../ui/Card'
import { VALUES } from '../../data/showcase'

const ICONS: LucideIcon[] = [ShoppingBag, Wallet, MessagesSquare]

export function ValueGrid() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="max-w-2xl">
          <Badge>Why Hygge</Badge>
          <h2 className="font-display mt-5 text-h2 font-semibold text-ink-900 dark:text-night-text">
            The cozy of Scandinavian design, the precision of real retail.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {VALUES.map((v, i) => {
            const Icon = ICONS[i]
            return (
              <Reveal key={v.title} delay={i * 0.08}>
                <Card hover className="h-full p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-teal-50 text-teal-600 dark:bg-night-raised dark:text-teal-400">
                    <Icon size={20} />
                  </span>
                  <h3 className="font-display mt-5 text-h3 font-semibold text-ink-900 dark:text-night-text">
                    {v.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-ink-500 dark:text-night-muted">
                    {v.body}
                  </p>
                </Card>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
