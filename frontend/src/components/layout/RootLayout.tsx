import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { pageTransition } from '../../lib/motion'

export function RootLayout() {
  const { pathname } = useLocation()

  // Scroll to top on route change.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <Nav />
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">
          <motion.div key={pathname} {...pageTransition}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  )
}
