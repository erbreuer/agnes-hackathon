/**
 * Single API module for Hygge. Talks to the FastAPI backend (POST /design,
 * POST /refine — NDJSON streaming) and transparently falls back to a local
 * mock when the backend isn't reachable, so the UI is always demoable.
 *
 * The API contract (do not change) is defined in CLAUDE.md. Both endpoints
 * stream newline-delimited JSON events; the final `result` line carries the
 * full payload.
 */
import { MOCK_RESULT, mockStream } from '../data/mock'

const BASE = 'http://localhost:8000'

export type StageId = 'analyze' | 'plan' | 'scout' | 'render'

export type Product = { name: string; price: number; link: string; image: string }

export type DesignResult = {
  session_id: string
  space_brief: Record<string, unknown>
  renders: string[]
  products: Product[]
  design_summary?: string
  warnings?: string[]
  /** true when served from the offline mock (backend unreachable). */
  mocked?: boolean
}

export type ProgressEvt = { stage: StageId; label: string }
export type WarningEvt = { stage: string; message: string }

type Handlers = {
  onProgress?: (e: ProgressEvt) => void
  onWarning?: (e: WarningEvt) => void
}

export async function getHealth(): Promise<{ ok: boolean; model_reply?: string }> {
  try {
    const resp = await fetch(`${BASE}/health`)
    if (!resp.ok) return { ok: false }
    return resp.json()
  } catch {
    return { ok: false }
  }
}

/** Read an NDJSON stream, dispatching status/warning events; resolve with result. */
async function consumeNdjson(
  resp: Response,
  { onProgress, onWarning }: Handlers,
): Promise<DesignResult> {
  if (!resp.ok || !resp.body) throw new Error(`request failed: ${resp.status}`)
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let result: DesignResult | null = null

  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let nl: number
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim()
      buffer = buffer.slice(nl + 1)
      if (!line) continue
      let evt: Record<string, unknown>
      try {
        evt = JSON.parse(line)
      } catch {
        continue
      }
      if (evt.event === 'status') onProgress?.(evt as unknown as ProgressEvt)
      else if (evt.event === 'warning') onWarning?.(evt as unknown as WarningEvt)
      else if (evt.event === 'result') result = evt.data as DesignResult
      else if (evt.event === 'error') throw new Error((evt.message as string) || 'pipeline error')
    }
  }
  if (!result) throw new Error('stream ended without a result event')
  return result
}

export type DesignArgs = {
  roomImage: string // raw base64, no data: prefix
  prompt: string
  budget: string | number
  refImages?: string[]
} & Handlers

export async function postDesign(args: DesignArgs): Promise<DesignResult> {
  const { roomImage, prompt, budget, refImages = [], ...handlers } = args
  try {
    const resp = await fetch(`${BASE}/design`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_image: roomImage,
        prompt,
        budget: Number(budget),
        ref_images: refImages,
      }),
    })
    return await consumeNdjson(resp, handlers)
  } catch (err) {
    if (isNetworkError(err)) return mockStream(handlers, { prompt: String(prompt) })
    throw err
  }
}

export type RefineArgs = { sessionId: string; feedback: string } & Handlers

export async function postRefine(args: RefineArgs): Promise<DesignResult> {
  const { sessionId, feedback, ...handlers } = args
  try {
    const resp = await fetch(`${BASE}/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, feedback }),
    })
    return await consumeNdjson(resp, handlers)
  } catch (err) {
    if (isNetworkError(err)) return mockStream(handlers, { prompt: feedback, refine: true })
    throw err
  }
}

/** A failed fetch (backend down / CORS / DNS) throws a TypeError, not an HTTP error. */
function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError
}

export { MOCK_RESULT }
