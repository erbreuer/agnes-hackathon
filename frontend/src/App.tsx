import { useState, useCallback, useEffect, useRef } from 'react'
import { postDesign, postRefine } from './api.js'
import './App.css'

function useFlyIn() {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref as React.RefObject<HTMLElement> & React.RefObject<HTMLDivElement> & React.RefObject<HTMLSelectElement>
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
type FieldErrors = {
  photo?: string
  prompt?: string
  budget?: string
  refUrls?: string
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

function isValidUrl(s: string) {
  try { new URL(s); return true } catch { return false }
}

function validateForm(photo: File | null, prompt: string, budget: string, refUrls: string): FieldErrors {
  const errs: FieldErrors = {}
  if (!photo) errs.photo = 'Please upload a room photo.'
  if (!prompt.trim()) errs.prompt = 'Please describe your vision.'
  else if (prompt.trim().length < 5) errs.prompt = 'Description must be at least 5 characters.'
  const b = Number(budget)
  if (!budget) errs.budget = 'Please enter a budget.'
  else if (isNaN(b) || b <= 0) errs.budget = 'Budget must be a positive number.'
  else if (b > 1_000_000) errs.budget = 'Budget seems too high — max $1,000,000.'
  if (refUrls.trim()) {
    const invalid = refUrls.split(',').map(u => u.trim()).filter(u => u && !isValidUrl(u))
    if (invalid.length) errs.refUrls = `Invalid URL${invalid.length > 1 ? 's' : ''}: ${invalid.join(', ')}`
  }
  return errs
}

export default function App() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoHistory, setPhotoHistory] = useState<{ file: File; preview: string }[]>([])
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('')
  const [refUrls, setRefUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [results, setResults] = useState<Results | null>(null)
  const [feedback, setFeedback] = useState('')
  const [refining, setRefining] = useState(false)
  const [activeStage, setActiveStage] = useState<StageId | null>(null)
  const [brokenRenders, setBrokenRenders] = useState<Set<string>>(new Set())
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!lightboxSrc) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxSrc(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxSrc])

  const handlePhoto = useCallback((file: File) => {
    const preview = URL.createObjectURL(file)
    setPhoto(file)
    setPhotoPreview(preview)
    setPhotoHistory(prev => {
      const already = prev.find(p => p.file.name === file.name && p.file.size === file.size)
      if (already) return prev.map(p => p === already ? { file, preview } : p)
      return [...prev, { file, preview }]
    })
    setFieldErrors(prev => ({ ...prev, photo: undefined }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handlePhoto(file)
  }, [handlePhoto])

  const handleGenerate = useCallback(async () => {
    const errs = validateForm(photo, prompt, budget, refUrls)
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setFieldErrors({})
    setLoading(true)
    setError(null)
    setWarnings([])
    setBrokenRenders(new Set())
    setActiveStage(null)
    try {
      const roomImage = await fileToBase64(photo!)
      const refImages: string[] = refUrls ? refUrls.split(',').map((u: string) => u.trim()).filter((u): u is string => u.length > 0) : []
      const data = await postDesign({
        roomImage, prompt, budget, refImages,
        onProgress: (evt: { stage: string }) => setActiveStage(evt.stage as StageId),
        onWarning:  (evt: { message: string }) => setWarnings(prev => [...prev, evt.message]),
      })
      setResults(data)
      if (data.warnings?.length) setWarnings(data.warnings)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setLoading(false)
      setActiveStage(null)
    }
  }, [photo, prompt, budget, refUrls])

  const handleRefine = useCallback(async () => {
    if (!results || !feedback.trim()) return
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

        {/* ── Photo upload ── */}
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
        </div>

        {photoHistory.length > 0 && (
          <div className="upload-row upload-row--thumbs">
            {photoHistory.map((p, i) => (
              <button
                key={i}
                className={`photo-thumb-btn ${p.preview === photoPreview ? 'photo-thumb-btn--active' : ''}`}
                onClick={() => { setPhoto(p.file); setPhotoPreview(p.preview); setLightboxSrc(p.preview) }}
                title={p.file.name}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={p.preview} alt="" className="photo-thumb" />
              </button>
            ))}
          </div>
        )}
        {fieldErrors.photo && <p className="field-error">{fieldErrors.photo}</p>}

        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
        />

        <label className="field-label">Describe your vision</label>
        <textarea
          className={`textarea${fieldErrors.prompt ? ' field--invalid' : ''}`}
          rows={1}
          placeholder="e.g. cozy Scandinavian feel, warm tones, more plants"
          value={prompt}
          onChange={e => {
            setPrompt(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = e.target.scrollHeight + 'px'
            if (fieldErrors.prompt) setFieldErrors(prev => ({ ...prev, prompt: undefined }))
          }}
          disabled={loading}
        />
        {fieldErrors.prompt && <p className="field-error">{fieldErrors.prompt}</p>}

        <label className="field-label">Budget</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">$</span>
          <input
            className={`input input--budget${fieldErrors.budget ? ' field--invalid' : ''}`}
            type="number"
            min={0}
            placeholder="1 500"
            value={budget}
            onChange={e => {
              setBudget(e.target.value)
              if (fieldErrors.budget) setFieldErrors(prev => ({ ...prev, budget: undefined }))
            }}
            disabled={loading}
          />
        </div>
        {fieldErrors.budget && <p className="field-error">{fieldErrors.budget}</p>}

        <label className="field-label">Reference image URLs <span className="muted">(comma-separated)</span></label>
        <input
          className={`input${fieldErrors.refUrls ? ' field--invalid' : ''}`}
          type="text"
          placeholder="https://example.com/inspo1.jpg, https://..."
          value={refUrls}
          onChange={e => {
            setRefUrls(e.target.value)
            if (fieldErrors.refUrls) setFieldErrors(prev => ({ ...prev, refUrls: undefined }))
          }}
          disabled={loading}
        />
        {fieldErrors.refUrls && <p className="field-error">{fieldErrors.refUrls}</p>}

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
          disabled={loading}
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

      {lightboxSrc && (
        <div className="photo-lightbox" onClick={() => setLightboxSrc(null)} role="dialog" aria-modal="true" aria-label="Photo preview">
          <img src={lightboxSrc} alt="Full size preview" onClick={e => e.stopPropagation()} />
          <button className="photo-lightbox-close" onClick={() => setLightboxSrc(null)} aria-label="Close">✕</button>
        </div>
      )}
    </div>
  )
}
