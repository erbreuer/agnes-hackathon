import { useState, useCallback } from 'react'
import { postDesign, postRefine } from './api.js'
import './App.css'

type Product = { name: string; price: number; link: string; image: string }
type Results = {
  session_id: string
  space_brief: Record<string, unknown>
  renders: string[]
  products: Product[]
  design_summary?: string
}

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

export default function App() {
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoHistory, setPhotoHistory] = useState<{ file: File; preview: string }[]>([])
  const [prompt, setPrompt] = useState('')
  const [budget, setBudget] = useState('1500')
  const [refUrls, setRefUrls] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<Results | null>(null)
  const [feedback, setFeedback] = useState('')
  const [refining, setRefining] = useState(false)

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
    try {
      const roomImage = await fileToBase64(photo)
      const refImages: string[] = refUrls ? refUrls.split(',').map((u: string) => u.trim()).filter((u): u is string => u.length > 0) : []
      const data = await postDesign({ roomImage, prompt, budget, refImages })
      setResults(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setLoading(false)
    }
  }, [photo, prompt, budget, refUrls])

  const handleRefine = useCallback(async () => {
    if (!results || !feedback) return
    setRefining(true)
    setError(null)
    try {
      const data = await postRefine({ sessionId: results.session_id, feedback })
      setResults(data)
      setFeedback('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong — try again')
    } finally {
      setRefining(false)
    }
  }, [results, feedback])

  const formPanel = (
    <div className="form-panel">
      <section className="card form-card">
        <h2>Design your room</h2>
        <p className="card-sub">Upload a photo, describe your vision, set a budget.</p>

        <div
          className={`dropzone ${photo ? 'dropzone--filled' : ''}`}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          {photoPreview ? (
            <img src={photoPreview} alt="Room preview" className="dropzone-preview" />
          ) : (
            <div className="dropzone-hint">
              <img src="/books.svg" alt="" className="dropzone-icon" />
              <span>Drop your room photo here or <u>browse photos</u></span>
            </div>
          )}
        </div>

        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={e => e.target.files?.[0] && handlePhoto(e.target.files[0])}
        />

        {photoHistory.length > 1 && (
          <div className="photo-strip">
            {photoHistory.map((p, i) => (
              <button
                key={i}
                className={`photo-thumb-btn ${p.preview === photoPreview ? 'photo-thumb-btn--active' : ''}`}
                onClick={e => { e.stopPropagation(); setPhoto(p.file); setPhotoPreview(p.preview) }}
                title={p.file.name}
              >
                <img src={p.preview} alt={`Photo ${i + 1}`} className="photo-thumb" />
              </button>
            ))}
          </div>
        )}

        <label className="field-label">Describe your vision</label>
        <textarea
          className="textarea"
          rows={3}
          placeholder="e.g. cozy Scandinavian feel, warm tones, more plants"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          disabled={loading}
        />

        <label className="field-label">Budget</label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">$</span>
          <input
            className="input input--budget"
            type="number"
            min={0}
            placeholder="1500"
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

        {error && <div className="error-banner">{error}</div>}

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
              <div className="summary-banner">
                <span className="summary-label">Design concept</span>
                <p className="design-summary">"{results.design_summary}"</p>
              </div>
            )}

            <section className="card">
              <h2>Your renders</h2>
              <div className="renders-grid">
                {results.renders.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="render-link">
                    <img src={url} alt={`Render ${i + 1}`} className="render-img" />
                  </a>
                ))}
              </div>
            </section>

            <section className="card">
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

            <section className="card refine-card">
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
