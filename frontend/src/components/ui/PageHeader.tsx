import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Container } from './Container'
import { Badge } from './Badge'
import { Aurora } from './Aurora'
import { stagger, fadeRise } from '../../lib/motion'

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: ReactNode
  subtitle?: string
  children?: ReactNode
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-sand-200 dark:border-night-border">
      <Aurora className="opacity-70" />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <Container className="relative py-16 text-center sm:py-20">
        <motion.div variants={stagger(0.08)} initial="hidden" animate="show">
          <motion.div variants={fadeRise} className="flex justify-center">
            <Badge>{eyebrow}</Badge>
          </motion.div>
          <motion.h1
            variants={fadeRise}
            className="font-display mx-auto mt-5 max-w-3xl text-h1 font-semibold text-balance text-ink-900 dark:text-night-text"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <motion.p
              variants={fadeRise}
              className="mx-auto mt-4 max-w-prose text-lg text-ink-500 dark:text-night-muted"
            >
              {subtitle}
            </motion.p>
          )}
          {children && <motion.div variants={fadeRise} className="mt-8">{children}</motion.div>}
        </motion.div>
      </Container>
    </section>
  )
}
