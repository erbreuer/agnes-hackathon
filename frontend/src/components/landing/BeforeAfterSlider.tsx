import { useCallback, useRef, useState } from 'react'
import { MoveHorizontal } from 'lucide-react'
import { Container } from '../ui/Container'
import { Badge } from '../ui/Badge'
import { Reveal } from '../ui/Reveal'
import { IMAGES } from '../../data/showcase'

export function BeforeAfterSlider() {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pct = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.min(100, Math.max(0, pct)))
  }, [])

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4))
    if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4))
  }

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Badge>Before → After</Badge>
          <h2 className="font-display mt-5 text-h2 font-semibold text-ink-900 dark:text-night-text">
            Same room. Real furniture. Drag to compare.
          </h2>
          <p className="mt-4 text-ink-500 dark:text-night-muted">
            Hygge keeps your walls, windows, and light — and dresses the room in pieces you
            can buy today.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-12">
          <div
            ref={ref}
            className="relative mx-auto aspect-[16/10] max-w-4xl select-none overflow-hidden rounded-3xl border border-sand-200 shadow-lg dark:border-night-border"
            onMouseMove={(e) => dragging.current && setFromClientX(e.clientX)}
            onMouseDown={(e) => {
              dragging.current = true
              setFromClientX(e.clientX)
            }}
            onMouseUp={() => (dragging.current = false)}
            onMouseLeave={() => (dragging.current = false)}
            onTouchMove={(e) => setFromClientX(e.touches[0].clientX)}
          >
            {/* After (full) */}
            <img
              src={IMAGES.roomAfter}
              alt="Room after Hygge redesign"
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
            <span className="absolute right-4 top-4 rounded-full bg-white/85 px-3 py-1 font-mono text-mono-caption uppercase text-teal-600 backdrop-blur dark:bg-night-surface/85 dark:text-teal-400">
              After
            </span>

            {/* Before (clipped) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
            >
              <img
                src={IMAGES.roomBefore}
                alt="Empty room before redesign"
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 font-mono text-mono-caption uppercase text-ink-500 backdrop-blur dark:bg-night-surface/85 dark:text-night-muted">
                Before
              </span>
            </div>

            {/* Handle */}
            <div
              role="slider"
              tabIndex={0}
              aria-label="Compare before and after"
              aria-valuenow={Math.round(pos)}
              aria-valuemin={0}
              aria-valuemax={100}
              onKeyDown={onKey}
              className="absolute inset-y-0 z-10 -ml-px w-0.5 cursor-ew-resize bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06)]"
              style={{ left: `${pos}%` }}
            >
              <div className="absolute top-1/2 left-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-sand-200 bg-white text-ink-700 shadow-md dark:border-night-border dark:bg-night-surface dark:text-night-text">
                <MoveHorizontal size={18} />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
