'use client'
import { useState, useRef } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { validateImageFile } from '@/lib/validation'

interface ImageUploadWithProgressProps {
  label: string
  required?: boolean
  value?: string | null
  onChange: (file: File | null, preview: string | null) => void
  onConfirm?: (confirmed: boolean) => void
}

export function ImageUploadWithProgress({
  label,
  required,
  value,
  onChange,
  onConfirm,
}: ImageUploadWithProgressProps) {
  const [preview, setPreview]     = useState<string | null>(value || null)
  const [uploading, setUploading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [fileName, setFileName]   = useState<string>('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setConfirmed(false)
    setProgress(0)

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      onChange(null, null)
      onConfirm?.(false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }

    setFileName(file.name)
    setUploading(true)

    const reader = new FileReader()
    reader.onloadstart = () => setProgress(5)
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setProgress(5 + Math.round((ev.loaded / ev.total) * 85))
      }
    }
    reader.onload = () => {
      const result = reader.result as string
      setPreview(result)
      setProgress(100)
      setUploading(false)
      onChange(file, result)
    }
    reader.onerror = () => {
      setError('Failed to read the file. Please try again.')
      setUploading(false)
      setProgress(0)
      onChange(null, null)
      onConfirm?.(false)
    }
    reader.readAsDataURL(file)
  }

  const handleConfirm = async () => {
    if (!preview || confirming) return
    setConfirming(true)
    setError(null)
    setProgress(0)

    try {
      // Animate progress 0→100 over ~750ms to represent the confirmation step
      await new Promise<void>((resolve) => {
        let p = 0
        const tick = () => {
          p += 10
          setProgress(Math.min(p, 100))
          if (p < 100) setTimeout(tick, 75)
          else resolve()
        }
        tick()
      })
      setConfirmed(true)
      setProgress(100)
      onConfirm?.(true)
    } catch {
      setError('Confirmation failed. Please try again.')
      setConfirmed(false)
      onConfirm?.(false)
    } finally {
      setConfirming(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    setConfirmed(false)
    setProgress(0)
    setError(null)
    setFileName('')
    onChange(null, null)
    onConfirm?.(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  const isProcessing = uploading || confirming

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--error)' }} aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={15} aria-hidden="true" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="Dismiss error">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div
          className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 transition-all"
          style={{
            border: `2px ${confirmed ? 'solid' : 'dashed'} ${
              confirmed ? 'var(--success)' : preview ? 'var(--accent)' : error ? 'var(--error)' : 'var(--border)'
            }`,
            background: 'var(--hover)',
          }}
          aria-label={preview ? `Preview of ${fileName}` : 'No photo selected'}
        >
          {preview ? (
            <img src={preview} alt={`Preview of ${fileName}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1">
              <Camera size={28} style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>No photo</span>
            </div>
          )}
          {confirmed && (
            <div className="absolute top-1 right-1 p-1 rounded-full" style={{ background: 'var(--success)' }}>
              <CheckCircle size={13} color="#fff" aria-hidden="true" />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 space-y-2 min-w-0">
          {isProcessing ? (
            /* ── Progress state ── */
            <div className="space-y-2" aria-live="polite" aria-atomic="true">
              <div className="flex items-center gap-2">
                <Loader2 size={15} className="animate-spin flex-shrink-0" style={{ color: 'var(--accent)' }} aria-hidden="true" />
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {confirming ? 'Confirming photo…' : 'Reading file…'}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--hover)' }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${confirming ? 'Confirm' : 'Upload'} progress: ${progress}%`}
              >
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                  }}
                />
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {progress}% complete
              </span>
            </div>
          ) : preview ? (
            /* ── Preview actions ── */
            <div className="space-y-2">
              {fileName && (
                <p className="text-xs truncate font-medium" style={{ color: 'var(--text-secondary)' }} title={fileName}>
                  {fileName}
                </p>
              )}
              {confirmed ? (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle size={15} aria-hidden="true" />
                  Photo Confirmed ✓
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={confirming}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-60"
                  style={{ background: 'var(--success)', color: '#fff' }}
                  aria-label="Confirm this photo"
                >
                  <CheckCircle size={15} aria-hidden="true" />
                  Confirm Photo
                </button>
              )}
              <div className="flex gap-2 flex-wrap">
                <label
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all"
                  style={{ background: 'var(--accent-tint)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                  aria-label="Change photo"
                >
                  <RefreshCw size={11} aria-hidden="true" /> Change
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    className="sr-only"
                    onChange={handleFileSelect}
                    aria-label={`Change ${label}`}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}
                  aria-label="Remove photo"
                >
                  <X size={11} aria-hidden="true" /> Remove
                </button>
              </div>
            </div>
          ) : (
            /* ── Upload trigger ── */
            <label className="cursor-pointer inline-block">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <Upload size={15} aria-hidden="true" />
                Upload Photo
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleFileSelect}
                aria-label={`Upload ${label}`}
                aria-required={required}
              />
            </label>
          )}

          {!preview && !isProcessing && (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              JPG, PNG, GIF, or WebP · Max 5 MB
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
