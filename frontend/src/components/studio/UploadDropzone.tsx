import { useCallback, useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { cn } from '../../lib/cn'

export function UploadDropzone({
  preview,
  onFile,
  onClear,
}: {
  preview: string | null
  onFile: (file: File) => void
  onClear: () => void
}) {
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = useCallback(
    (file?: File | null) => {
      if (file && file.type.startsWith('image/')) onFile(file)
    },
    [onFile],
  )

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => pick(e.target.files?.[0])}
      />

      {preview ? (
        <div className="group relative overflow-hidden rounded-2xl border border-sand-200 dark:border-night-border">
          <img src={preview} alt="Your room" className="aspect-[4/3] w-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label="Remove photo"
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-700 shadow-sm backdrop-blur transition hover:bg-white dark:bg-night-surface/90 dark:text-night-text"
          >
            <X size={16} />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 py-2 text-sm font-medium text-ink-900 opacity-0 shadow-sm backdrop-blur transition group-hover:opacity-100 dark:bg-night-surface/90 dark:text-night-text"
          >
            Replace photo
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault()
            setDrag(true)
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDrag(false)
            pick(e.dataTransfer.files?.[0])
          }}
          className={cn(
            'flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed text-center transition-colors',
            drag
              ? 'border-teal-400 bg-teal-50/60 dark:bg-night-raised'
              : 'border-sand-300 bg-sand-100/40 hover:border-teal-400 hover:bg-sand-100 dark:border-night-border dark:bg-night-surface/40 dark:hover:bg-night-raised',
          )}
        >
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-teal-600 shadow-sm dark:bg-night-surface dark:text-teal-400">
            <ImagePlus size={22} />
          </span>
          <span className="text-sm font-medium text-ink-900 dark:text-night-text">
            Drop a room photo, or click to upload
          </span>
          <span className="font-mono text-mono-caption text-ink-400 dark:text-night-muted">
            JPG or PNG · one room, good light
          </span>
        </button>
      )}
    </div>
  )
}
