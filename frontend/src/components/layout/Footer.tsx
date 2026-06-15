import { Link } from 'react-router-dom'
import { Logo } from '../ui/Logo'
import { Container } from '../ui/Container'

const COLS = [
  {
    title: 'Product',
    links: [
      { to: '/studio', label: 'Studio' },
      { to: '/how-it-works', label: 'How it works' },
      { to: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Company',
    links: [
      { to: '/about', label: 'About' },
      { to: '/pricing', label: 'Plans' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="mt-24 border-t border-sand-200 bg-sand-100/50 dark:border-night-border dark:bg-night-surface/40">
      <Container className="py-14">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-ink-500 dark:text-night-muted">
              Design you can actually buy. Upload your room, set a budget, and get a
              redesign where every piece is a real, shoppable product.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-mono-caption uppercase text-ink-400 dark:text-night-muted">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-ink-700 transition-colors hover:text-teal-600 dark:text-night-text dark:hover:text-teal-400"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-sand-200 pt-6 text-sm text-ink-400 dark:border-night-border dark:text-night-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Hygge. Crafted with warmth.</p>
          <p className="font-mono text-mono-caption">
            Powered by Agnes AI · real SKUs before pixels
          </p>
        </div>
      </Container>
    </footer>
  )
}
