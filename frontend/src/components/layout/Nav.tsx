import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/cn'
import { Logo } from '../ui/Logo'
import { Button } from '../ui/Button'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { to: '/studio', label: 'Studio' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
]

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          'transition-all duration-300 ease-out-soft',
          scrolled
            ? 'glass border-b border-sand-200/70 dark:border-night-border/70'
            : 'border-b border-transparent',
        )}
      >
        <nav className="mx-auto flex max-w-container items-center justify-between px-5 py-3 sm:px-8">
          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : 'text-ink-500 hover:text-ink-900 dark:text-night-muted dark:hover:text-night-text',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button to="/studio" size="sm" className="hidden sm:inline-flex">
              <Sparkles size={15} /> Try it
            </Button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className="grid h-9 w-9 place-items-center rounded-full border border-sand-200 text-ink-700 dark:border-night-border dark:text-night-muted md:hidden"
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="glass mx-3 mt-2 rounded-2xl border border-sand-200/70 p-3 shadow-md dark:border-night-border/70 md:hidden"
          >
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-teal-50 text-teal-700 dark:bg-night-raised dark:text-teal-400'
                      : 'text-ink-700 hover:bg-sand-100 dark:text-night-text dark:hover:bg-night-raised',
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Button to="/studio" size="md" className="mt-2 w-full">
              <Sparkles size={16} /> Try it free
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
