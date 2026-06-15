/** On-brand content + imagery for the marketing pages. Real copy, no lorem. */
import { MOCK_PRODUCTS } from './mock'

export const IMAGES = {
  roomBefore:
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
  roomAfter:
    'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=80',
  heroRender:
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=80',
}

export const HOW_STEPS = [
  {
    n: '01',
    title: 'Upload your room',
    body: 'Drop in a single photo. Hygge reads the layout, light, and what to keep.',
  },
  {
    n: '02',
    title: 'Set style & budget',
    body: 'Describe the vibe in plain words and set a hard budget. We never go over.',
  },
  {
    n: '03',
    title: 'We shop, then render',
    body: 'Real products are sourced first — then composited into your actual room.',
  },
  {
    n: '04',
    title: 'Refine in words',
    body: '“Cheaper sofa, more plants.” It re-plans, re-shops, and re-renders instantly.',
  },
]

export const VALUES = [
  {
    title: 'Real, not imaginary',
    body: 'Every item in a render maps to a live SKU and a working buy link. No “inspired by” dead ends.',
  },
  {
    title: 'On budget, always',
    body: 'Set a number and Hygge plans the whole room beneath it. The total is a promise, not a guess.',
  },
  {
    title: 'Yours in plain words',
    body: 'No mood-board busywork. Talk to it like a designer friend and watch the room change.',
  },
]

export const STATS = [
  { value: '100%', label: 'shoppable items' },
  { value: '<2min', label: 'to a full redesign' },
  { value: '3', label: 'Agnes models, one pipeline' },
  { value: '$0', label: 'over budget, ever' },
]

export const FLOATING_PRODUCTS = MOCK_PRODUCTS.slice(0, 4)
