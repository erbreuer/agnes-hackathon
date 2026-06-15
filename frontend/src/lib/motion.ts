import type { Variants, Transition } from 'framer-motion'

/** Shared motion language: ease-out, 200-400ms, content fades + rises 16px. */
export const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1]
export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30 }

export const fadeRise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.5, ease: easeOut } },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOut } },
}

/** Parent that staggers its children's reveal. */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
})

/** Standard scroll-reveal props for a section. */
export const reveal = {
  variants: fadeRise,
  initial: 'hidden' as const,
  whileInView: 'show' as const,
  viewport: { once: true, margin: '-80px' },
}

/** Route page-transition wrapper props. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: easeOut },
}
