/**
 * Offline mock for /design + /refine. Used automatically when the backend is
 * unreachable so the Studio is always demoable. Mirrors the real result shape.
 */
import type { DesignResult, ProgressEvt, StageId, WarningEvt } from '../lib/api'

const STAGES: { stage: StageId; label: string }[] = [
  { stage: 'analyze', label: 'Analyzing your space' },
  { stage: 'plan', label: 'Planning the design' },
  { stage: 'scout', label: 'Searching for real products' },
  { stage: 'render', label: 'Rendering your room' },
]

export const MOCK_PRODUCTS = [
  {
    name: 'Söderhamn 3-Seat Sofa, Sage',
    price: 699,
    link: 'https://www.ikea.com',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  },
  {
    name: 'Walnut Oval Coffee Table',
    price: 245,
    link: 'https://www.article.com',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80',
  },
  {
    name: 'Hand-Knotted Wool Rug 5×8',
    price: 189,
    link: 'https://www.ruggable.com',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&q=80',
  },
  {
    name: 'RANARP Floor Lamp, Black',
    price: 59,
    link: 'https://www.ikea.com',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80',
  },
  {
    name: 'Linen Throw Cushion, Ochre',
    price: 38,
    link: 'https://www.westelm.com',
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600&q=80',
  },
  {
    name: 'Potted Fiddle-Leaf Fig',
    price: 74,
    link: 'https://www.thesill.com',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=600&q=80',
  },
]

export const MOCK_RESULT: DesignResult = {
  session_id: 'mock-session',
  space_brief: {
    style: 'Mid-Century Modern',
    palette: ['warm sand', 'walnut', 'sage green', 'brass'],
    lighting: 'bright, large north-facing window',
    fixed_elements: ['hardwood floor', 'large window', 'recessed lights'],
    approx_size: 'medium ~18 sqm',
    keep: ['hardwood floor', 'window'],
    replace: ['worn sofa', 'dated rug'],
  },
  renders: [
    'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1024&q=80',
  ],
  products: MOCK_PRODUCTS,
  design_summary:
    'A warm Scandinavian refresh: a sage three-seater anchors the room against the walnut tones of a soft oval coffee table, layered over a hand-knotted wool rug. A slim black floor lamp and a fiddle-leaf fig add height and life while keeping every line clean.',
  warnings: [],
  mocked: true,
}

export async function mockStream(
  handlers: { onProgress?: (e: ProgressEvt) => void; onWarning?: (e: WarningEvt) => void },
  opts: { prompt?: string; refine?: boolean } = {},
): Promise<DesignResult> {
  const stages = opts.refine ? STAGES.slice(1) : STAGES
  for (const s of stages) {
    handlers.onProgress?.(s)
    await delay(650)
  }
  return { ...MOCK_RESULT, design_summary: tweakSummary(opts) }
}

function tweakSummary(opts: { prompt?: string; refine?: boolean }): string {
  if (opts.refine && opts.prompt) {
    return `Updated per your note — "${opts.prompt}". ${MOCK_RESULT.design_summary}`
  }
  return MOCK_RESULT.design_summary ?? ''
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
