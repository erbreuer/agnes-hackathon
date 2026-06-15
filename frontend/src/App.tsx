import { useState, useCallback, useRef } from 'react'
import { postDesign, postRefine } from './api.js'
import './App.css'

// Callback ref: attaches the IntersectionObserver when the element actually
// mounts. (A useEffect with [] deps ran before the results sections existed —
// ref.current was null, so .visible was never added and the whole results
// panel stayed at opacity:0. This fires on every mount, including late ones.)
function useFlyIn() {
  const observerRef = useRef<IntersectionObserver | null>(null)
  return useCallback((el: HTMLElement | null) => {
    observerRef.current?.disconnect()
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.05 }
    )
    observer.observe(el)
    observerRef.current = observer
  }, [])
}

type Product = { name: string; price: number; link: string; image: string }
type Results = {
  session_id: string
  space_brief: Record<string, unknown>
  renders: string[]
  products: Product[]
  design_summary?: string
  warnings?: string[]
}

type StageId = 'analyze' | 'plan' | 'scout' | 'render'
type Stage = { id: StageId; label: string }

const DESIGN_STAGES: Stage[] = [
  { id: 'analyze', label: 'Analyzing your space' },
  { id: 'plan',    label: 'Planning the design' },
  { id: 'scout',   label: 'Searching for real products' },
  { id: 'render',  label: 'Rendering your room' },
]
const REFINE_STAGES: Stage[] = [
  { id: 'plan',    label: 'Re-planning with your feedback' },
  { id: 'scout',   label: 'Searching for real products' },
  { id: 'render',  label: 'Rendering your room' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.replace(/^data:[^;]+;base64,/, ''))
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function StageProgress({ stages, activeStage }: { stages: Stage[]; activeStage: StageId | null }) {
  const activeIndex = activeStage ? stages.findIndex(s => s.id === activeStage) : -1
  return (
    <ul className="stage-progress" aria-live="polite">
      {stages.map((s, i) => {
        const state =
          activeIndex === -1 ? 'pending' :
          i < activeIndex   ? 'done'    :
          i === activeIndex ? 'active'  : 'pending'
        return (
          <li key={s.id} className={`stage stage--${state}`}>
            <span className="stage-icon" aria-hidden="true">
              {state === 'done' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6.2l2.3 2.3L9.5 3.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : state === 'active' ? (
                <span className="stage-dot stage-dot--pulse" />
              ) : (
                <span className="stage-dot" />
              )}
            </span>
            <span className="stage-label">{s.label}{state === 'active' && '…'}</span>
          </li>
        )
      })}
    </ul>
  )
}

export default function App() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoHistory, setPhotoHistory] = useState<{ file: File; preview: string }[]>([])
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('1500')
  const [refUrls, setRefUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [results, setResults] = useState<Results | null>(null)
  const [feedback, setFeedback] = useState('')
  const [refining, setRefining] = useState(false)
  const [activeStage, setActiveStage] = useState<StageId | null>(null)
  const [brokenRenders, setBrokenRenders] = useState<Set<string>>(new Set())

  const handlePhoto = useCallback((file: File) => {
    const preview = URL.createObjectURL(file)
    setPhoto(file)
    setPhotoPreview(preview)
    setPhotoHistory(prev => {
      const already = prev.find(p => p.file.name === file.name && p.file.size === file.size)
      if (already) return prev.map(p => p === already ? { file, preview } : p)
      return [...prev, { file, preview }]
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handlePhoto(file)
  }, [handlePhoto])

  const handleGenerate = useCallback(async () => {
    if (!photo || !prompt || !budget) return
    setLoading(true)
    setError(null)
    setWarnings([])
    setBrokenRenders(new Set())
    setActiveStage(null)
    try {
      const roomImage = await fileToBase64(photo)
      const refImages: string[] = refUrls ? refUrls.split(',').map((u: string) => u.trim()).filter((u): u is string => u.length > 0) : []
      const data = await postDesign({
        roomImage, prompt, budget, refImages,
        onProgress: (evt: { stage: string }) => setActiveStage(evt.stage as StageId),
        onWarning:  (evt: { message: string }) => setWarnings(prev => [...prev, evt.message]),
      })
      setResults(data)
      // Fold any backend-returned warnings into the banner too (covers final warnings
      // emitted right before result, in case the stream callback hadn't flushed).
      if (data.warnings?.length) setWarnings(data.warnings)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setLoading(false)
      setActiveStage(null)
    }
  }, [photo, prompt, budget, refUrls])

  const handleRefine = useCallback(async () => {
    if (!results || !feedback) return
    setRefining(true)
    setError(null)
    setWarnings([])
    setBrokenRenders(new Set())
    setActiveStage(null)
    try {
      const data = await postRefine({
        sessionId: results.session_id, feedback,
        onProgress: (evt: { stage: string }) => setActiveStage(evt.stage as StageId),
        onWarning:  (evt: { message: string }) => setWarnings(prev => [...prev, evt.message]),
      })
      setResults(data)
      if (data.warnings?.length) setWarnings(data.warnings)
      setFeedback('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setRefining(false)
      setActiveStage(null)
    }
  }, [results, feedback])

  const summaryRef = useFlyIn()
  const rendersRef = useFlyIn()
  const productsRef = useFlyIn()
  const refineRef = useFlyIn()

  const formPanel = (
    <div className="form-panel">
      <section className="card form-card">
        <h2 className="form-heading">Design your room</h2>
        <p className="form-sub">Upload a photo, describe your vision, set a budget.</p>

        {/* ── Photo upload row ── */}
        <div className="upload-row">
          <button
            type="button"
            className="upload-btn"
            onClick={() => document.getElementById('file-input')?.click()}
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <path d="M7.5 1.5v8M4 5l3.5-3.5L11 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 11.5v1a1 1 0 001 1h10a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {photo ? 'Change photo' : 'Upload photo'}
          </button>

          {photoHistory.map((p, i) => (
            <button
              key={i}
              className={`photo-thumb-btn ${p.preview === photoPreview ? 'photo-thumb-btn--active' : ''}`}
              onClick={() => { setPhoto(p.file); setPhotoPreview(p.preview) }}
              title={p.file.name}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={p.preview} alt="" className="photo-thumb" />
            </button>
          ))}
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
        />

        <label className="field-label">Describe your vision</label>
        <textarea
          className="textarea"
          rows={1}
          placeholder="e.g. cozy Scandinavian feel, warm tones, more plants"
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
          }}
          disabled={loading}
        />

        <label className="field-label">Budget</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">$</span>
          <input
            className="input input--budget"
            type="number"
            min={0}
            placeholder="1 500"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            disabled={loading}
          />
        </div>

        <label className="field-label">Reference image URLs <span className="muted">(comma-separated)</span></label>
        <input
          className="input"
          type="text"
          placeholder="https://example.com/inspo1.jpg, https://..."
          value={refUrls}
          onChange={e => setRefUrls(e.target.value)}
          disabled={loading}
        />

        {error && <div className="error-banner" role="alert">{error}</div>}

        {warnings.length > 0 && (
          <div className="warning-banner" role="status">
            <strong>Heads up:</strong>
            <ul>
              {warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </div>
        )}

        {loading && (
          <StageProgress stages={DESIGN_STAGES} activeStage={activeStage} />
        )}

        <button
          className="btn btn--primary"
          onClick={handleGenerate}
          disabled={loading || !photo || !prompt || !budget}
        >
          {loading ? <><span className="spinner" /> Generating…</> : 'Generate Design'}
        </button>
      </section>
    </div>
  )

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <div>
            <span className="wordmark">Hygge</span>
            <span className="tagline">interior design</span>
          </div>
        </div>
      </header>

      {!results && (
        <div className="hero">
          <p className="hero-eyebrow">Creative · Cosy · Home</p>
          <h1 className="hero-title">
            Design a room you<br /><em>never want to leave</em>
          </h1>
          <p className="hero-sub">Upload a photo, describe the feeling you want, and Agnes finds real furniture you can buy today.</p>
        </div>
      )}

      <div className={`layout ${results ? 'layout--split' : 'layout--center'}`}>
        {formPanel}

        {results && (
          <div className="results-panel">
            {results.design_summary && (
              <div ref={summaryRef} className="summary-banner fly-in-scroll">
                <span className="summary-label">Design concept</span>
                <p className="design-summary">"{results.design_summary}"</p>
              </div>
            )}

            <section ref={rendersRef} className="card fly-in-scroll">
              <h2>Your renders</h2>
              {results.renders.length === 0 ? (
                <p className="render-empty">
                  No render available — Agnes's image service didn't return one.
                  Your products and design concept are still ready below.
                </p>
              ) : (
                <div className="renders-grid">
                  {results.renders.map((url, i) => (
                    brokenRenders.has(url) ? (
                      <div key={i} className="render-link render-broken" role="img" aria-label="Render unavailable">
                        <span className="render-broken-icon" aria-hidden="true">⚠</span>
                        <span>Render image unavailable.<br />Agnes's image host is unreachable right now.</span>
                      </div>
                    ) : (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="render-link">
                        <img
                          src={url}
                          alt={`Render ${i + 1}`}
                          className="render-img"
                          onError={() => setBrokenRenders(prev => new Set(prev).add(url))}
                        />
                      </a>
                    )
                  ))}
                </div>
              )}
            </section>

            <section ref={productsRef} className="card fly-in-scroll">
              <h2>Shop the look</h2>
              <div className="products-grid">
                {results.products.map((p, i) => (
                  <div key={i} className="product-card">
                    <img src={p.image} alt={p.name} className="product-img" />
                    <div className="product-info">
                      <p className="product-name">{p.name}</p>
                      <p className="product-price">${typeof p.price === 'number' ? p.price.toFixed(0) : p.price}</p>
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="buy-btn">
                        Buy →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section ref={refineRef} className="card refine-card fly-in-scroll">
              <h2>Refine the design</h2>
              <p className="card-sub">Not quite right? Tell Agnes what to change.</p>
              <div className="refine-row">
                <input
                  className="input refine-input"
                  type="text"
                  placeholder="e.g. cheaper sofa, add more plants, warmer lighting"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRefine()}
                  disabled={refining}
                />
                <button
                  className="btn btn--secondary"
                  onClick={handleRefine}
                  disabled={refining || !feedback}
                >
                  {refining ? <><span className="spinner spinner--dark" /> Refining…</> : 'Refine'}
                </button>
              </div>
              {refining && (
                <StageProgress stages={REFINE_STAGES} activeStage={activeStage} />
              )}
            </section>
          </div>
        )}
      </div>

      <footer className="footer">
        <span>Agnes AI · Interior Design</span>
      </footer>
    </div>
  )
}
