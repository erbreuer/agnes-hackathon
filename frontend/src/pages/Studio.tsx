import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Sparkles, Wand2, Send, Info } from 'lucide-react'
import { Container } from '../components/ui/Container'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { UploadDropzone } from '../components/studio/UploadDropzone'
import { StylePicker, BudgetSlider } from '../components/studio/StudioControls'
import { StageProgress } from '../components/studio/StageProgress'
import { RenderGallery } from '../components/studio/RenderGallery'
import { ProductCard } from '../components/studio/ProductCard'
import { RenderSkeleton, ProductSkeletonGrid } from '../components/studio/Skeletons'
import { postDesign, postRefine, type DesignResult, type StageId } from '../lib/api'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).replace(/^data:[^;]+;base64,/, ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const REFINE_STAGES: { id: StageId; label: string }[] = [
  { id: 'plan', label: 'Re-planning with your feedback' },
  { id: 'scout', label: 'Sourcing real products' },
  { id: 'render', label: 'Rendering your room' },
]

export default function Studio() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('Scandinavian')
  const [budget, setBudget] = useState(1500)

  const [loading, setLoading] = useState(false)
  const [refining, setRefining] = useState(false)
  const [activeStage, setActiveStage] = useState<StageId | null>(null)
  const [results, setResults] = useState<DesignResult | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')

  const busy = loading || refining

  const handlePhoto = useCallback((file: File) => {
    setPhoto(file)
    setPreview(URL.createObjectURL(file))
  }, [])

  const handleGenerate = useCallback(async () => {
    if (!photo) return
    setLoading(true)
    setError(null)
    setWarnings([])
    setActiveStage(null)
    try {
      const roomImage = await fileToBase64(photo)
      const fullPrompt = [style, prompt].filter(Boolean).join(' — ')
      const data = await postDesign({
        roomImage,
        prompt: fullPrompt,
        budget,
        onProgress: (e) => setActiveStage(e.stage),
        onWarning: (e) => setWarnings((w) => [...w, e.message]),
      })
      setResults(data)
      if (data.warnings?.length) setWarnings(data.warnings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setLoading(false)
      setActiveStage(null)
    }
  }, [photo, prompt, style, budget])

  const handleRefine = useCallback(async () => {
    if (!results || !feedback.trim()) return
    setRefining(true)
    setError(null)
    setWarnings([])
    setActiveStage(null)
    try {
      const data = await postRefine({
        sessionId: results.session_id,
        feedback,
        onProgress: (e) => setActiveStage(e.stage),
        onWarning: (e) => setWarnings((w) => [...w, e.message]),
      })
      setResults(data)
      if (data.warnings?.length) setWarnings(data.warnings)
      setFeedback('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong — please try again.')
    } finally {
      setRefining(false)
      setActiveStage(null)
    }
  }, [results, feedback])

  return (
    <Container className="py-12 sm:py-16">
      <div className="mx-auto max-w-2xl text-center">
        <Badge icon={<Wand2 size={12} />}>Studio</Badge>
        <h1 className="font-display mt-5 text-h1 font-semibold text-ink-900 dark:text-night-text">
          Let's redesign your room.
        </h1>
        <p className="mt-3 text-ink-500 dark:text-night-muted">
          Upload a photo, set your style and budget, and we'll furnish it with real products.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[400px_1fr] lg:items-start">
        {/* ── Controls ── */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm dark:border-night-border dark:bg-night-surface">
            <UploadDropzone preview={preview} onFile={handlePhoto} onClear={() => { setPhoto(null); setPreview(null) }} />

            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="prompt" className="font-mono text-mono-caption uppercase text-ink-500 dark:text-night-muted">
                  Your vision
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="cozy, lots of plants, warm wood tones…"
                  className="mt-2.5 w-full resize-none rounded-xl border border-sand-200 bg-sand-50 px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-teal-400 dark:border-night-border dark:bg-night-bg dark:text-night-text dark:placeholder:text-night-muted"
                />
              </div>

              <StylePicker value={style} onChange={setStyle} />
              <BudgetSlider value={budget} onChange={setBudget} />
            </div>

            <Button
              onClick={handleGenerate}
              size="lg"
              disabled={!photo || busy}
              className="mt-7 w-full"
            >
              {loading ? 'Designing…' : (<><Sparkles size={17} /> Generate redesign</>)}
            </Button>
            {!photo && (
              <p className="mt-3 text-center font-mono text-mono-caption text-ink-400 dark:text-night-muted">
                Upload a photo to begin
              </p>
            )}
          </div>
        </div>

        {/* ── Results canvas ── */}
        <div className="min-h-[420px]">
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-2xl border border-clay-400/40 bg-clay-400/10 p-4 text-sm text-clay-500">
              <AlertTriangle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {warnings.length > 0 && (
            <div className="mb-5 space-y-2">
              {warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-3 rounded-xl border border-amber-300/50 bg-amber-300/10 p-3 text-sm text-amber-500">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>{w}</p>
                </div>
              ))}
            </div>
          )}

          {busy ? (
            <div className="space-y-8">
              <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm dark:border-night-border dark:bg-night-surface">
                <StageProgress active={activeStage} stages={refining ? REFINE_STAGES : undefined} />
              </div>
              <RenderSkeleton />
              <ProductSkeletonGrid />
            </div>
          ) : results ? (
            <Results results={results} feedback={feedback} setFeedback={setFeedback} onRefine={handleRefine} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </Container>
  )
}

function Results({
  results,
  feedback,
  setFeedback,
  onRefine,
}: {
  results: DesignResult
  feedback: string
  setFeedback: (v: string) => void
  onRefine: () => void
}) {
  const total = results.products.reduce((s, p) => s + (p.price || 0), 0)
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
      {results.mocked && (
        <p className="font-mono text-mono-caption text-ink-400 dark:text-night-muted">
          Showing a sample design — backend offline.
        </p>
      )}

      {results.design_summary && (
        <div className="rounded-2xl border border-sand-200 bg-sand-100/50 p-5 dark:border-night-border dark:bg-night-surface/50">
          <span className="font-mono text-mono-caption uppercase text-teal-600 dark:text-teal-400">
            Design concept
          </span>
          <p className="mt-2 font-display text-lg italic leading-relaxed text-ink-700 dark:text-night-text">
            "{results.design_summary}"
          </p>
        </div>
      )}

      <section>
        <h2 className="font-display text-h3 font-semibold text-ink-900 dark:text-night-text">Your render</h2>
        <div className="mt-4">
          <RenderGallery renders={results.renders} />
        </div>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-h3 font-semibold text-ink-900 dark:text-night-text">
            Shop the look
          </h2>
          <span className="font-mono text-mono-caption text-ink-500 dark:text-night-muted">
            {results.products.length} items · ${total.toLocaleString()}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {results.products.map((p, i) => (
            <ProductCard key={`${p.name}-${i}`} product={p} />
          ))}
        </div>
      </section>

      {/* Refine */}
      <section className="rounded-2xl border border-sand-200 bg-white p-5 shadow-sm dark:border-night-border dark:bg-night-surface">
        <h2 className="font-display text-h3 font-semibold text-ink-900 dark:text-night-text">
          Not quite? Refine it.
        </h2>
        <p className="mt-1.5 text-sm text-ink-500 dark:text-night-muted">
          Tell Hygge what to change in plain words — it'll re-plan and re-render.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onRefine()}
            placeholder="cheaper sofa, add more plants…"
            className="flex-1 rounded-xl border border-sand-200 bg-sand-50 px-4 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-teal-400 dark:border-night-border dark:bg-night-bg dark:text-night-text dark:placeholder:text-night-muted"
          />
          <Button onClick={onRefine} disabled={!feedback.trim()} className="shrink-0">
            <Send size={16} /> Refine
          </Button>
        </div>
      </section>
    </motion.div>
  )
}

function EmptyState() {
  return (
    <div className="grid h-full min-h-[420px] place-items-center rounded-2xl border border-dashed border-sand-300 bg-sand-100/30 p-8 text-center dark:border-night-border dark:bg-night-surface/30">
      <div className="max-w-sm">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-cta-gradient text-ink-900 shadow-glow-sm">
          <Wand2 size={24} />
        </span>
        <h3 className="font-display mt-5 text-h3 font-semibold text-ink-900 dark:text-night-text">
          Your redesign appears here
        </h3>
        <p className="mt-2 text-sm text-ink-500 dark:text-night-muted">
          Upload a room photo and hit generate. You'll get a photorealistic render plus a
          shoppable product list — all within budget.
        </p>
      </div>
    </div>
  )
}
