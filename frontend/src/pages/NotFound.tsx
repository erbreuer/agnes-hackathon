import { Home, ArrowLeft } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { Button } from '../components/ui/Button'
import { Aurora } from '../components/ui/Aurora'

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[70vh] items-center overflow-hidden">
      <Aurora />
      <div className="grain absolute inset-0" aria-hidden="true" />
      <Container className="relative text-center">
        <p className="font-display text-[7rem] font-semibold leading-none text-ink-900 dark:text-night-text sm:text-[10rem]">
          4<span className="bg-cta-gradient bg-clip-text text-transparent">0</span>4
        </p>
        <h1 className="font-display mt-2 text-h2 font-semibold text-ink-900 dark:text-night-text">
          This room doesn't exist yet.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-500 dark:text-night-muted">
          The page you're looking for moved or was never furnished. Let's get you back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" size="lg">
            <Home size={18} /> Back home
          </Button>
          <Button to="/studio" variant="secondary" size="lg">
            <ArrowLeft size={18} /> Open the studio
          </Button>
        </div>
      </Container>
    </section>
  )
}
