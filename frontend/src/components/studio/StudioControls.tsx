import { cn } from '../../lib/cn'

const STYLES = [
  'Scandinavian',
  'Mid-century modern',
  'Japandi',
  'Warm minimalist',
  'Boho',
  'Industrial',
]

export function StylePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="font-mono text-mono-caption uppercase text-ink-500 dark:text-night-muted">
        Style
      </label>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {STYLES.map((s) => {
          const active = value === s
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              aria-pressed={active}
              className={cn(
                'rounded-full border px-3.5 py-1.5 text-sm transition-all',
                active
                  ? 'border-teal-400 bg-teal-50 text-teal-700 shadow-glow-sm dark:bg-night-raised dark:text-teal-400'
                  : 'border-sand-200 text-ink-700 hover:border-teal-300 dark:border-night-border dark:text-night-text',
              )}
            >
              {s}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function BudgetSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const pct = ((value - 200) / (10000 - 200)) * 100
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="font-mono text-mono-caption uppercase text-ink-500 dark:text-night-muted">
          Budget
        </label>
        <span className="font-display text-xl font-semibold text-ink-900 dark:text-night-text">
          ${value.toLocaleString()}
        </span>
      </div>
      <input
        type="range"
        min={200}
        max={10000}
        step={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Budget in dollars"
        className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-teal-500 [&::-webkit-slider-thumb]:shadow-md"
        style={{
          background: `linear-gradient(to right, #0FB98E ${pct}%, #E9DFCF ${pct}%)`,
        }}
      />
      <div className="mt-1.5 flex justify-between font-mono text-mono-caption text-ink-400 dark:text-night-muted">
        <span>$200</span>
        <span>$10k</span>
      </div>
    </div>
  )
}
