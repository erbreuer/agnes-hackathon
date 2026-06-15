import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { fadeRise } from '../../lib/motion'

/** Fades + rises content 16px when it scrolls into view (once). */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'section' | 'li' | 'span'
}) {
  const MotionTag = motion[as]
  return (
    <MotionTag
      className={className}
      variants={fadeRise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  )
}
