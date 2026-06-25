'use client'
import { useState, useRef } from 'react'
import { Camera, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { validateImageFile } from '@/lib/validation'

interface PhotoUploadProps {
  label?: string
  required?: boolean
  /** Existing preview URL (base64 or object URL) */
  value?: string | null
  /** Called with (dataURL | null) whenever photo changes */
  onChange: (dataUrl: string | null) => void
  className?: string
}

export function PhotoUpload({ label = 'Photo', required, value, onChange, className = '' }: PhotoUploadProps) {
  const [preview,   setPreview]   = useState<string | null>(value ?? null)
  const [progress,  setProgress]  = useState(0)
  const [loading,   setLoading]   = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setPreview(null); setProgress(0); setLoading(false)
    setConfirmed(false); setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleFile = (file: File) => {
    const res = validateImageFile(file)
    if (!res.valid) { setError(res.error || 'Invalid image file'); return }

    setError(null); setConfirmed(false); setLoading(true); setProgress(0)

    const reader = new FileReader()
    reader.onprogress = e => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 90))
    }
    reader.onload = () => {
      setProgress(100)
      setPreview(reader.result as string)
      setLoading(false)
      onChange(reader.result as string)
    }
    reader.onerror = () => {
      setError('Failed to read file — please try again')
      setLoading(false); setProgress(0)
    }
    reader.readAsDataURL(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleConfirm = () => {
    setConfirmed(true)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="text-xs font-semibold block" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--error)' }} aria-hidden="true"> *</span>}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      {/* Error banner */}
      {error && (
        <div role="alert" className="flex items-center gap-2 p-2.5 rounded-lg text-sm"
          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}>
          <AlertCircle size={15} aria-hidden="true" />
          {error}
        </div>
      )}

      <div className="flex items-start gap-4 flex-wrap">
        {/* Photo preview or placeholder */}
        {preview ? (
          <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border-2"
            style={{ borderColor: confirmed ? 'var(--success)' : 'var(--accent)' }}>
            <img src={preview} alt="Photo preview" className="w-full h-full object-cover" />
            {confirmed && (
              <div className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'var(--success)' }}>
                <CheckCircle size={13} color="#fff" aria-hidden="true" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-28 h-28 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--hover)', border: '2px dashed var(--border)' }}
            aria-hidden="true">
            <Camera size={28} style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}

        {/* Actions */}
        <div className="flex-1 space-y-2 min-w-0">
          {/* Progress bar */}
          {loading && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin"
                  style={{ color: 'var(--accent)' }} aria-hidden="true" />
                <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  Uploading… {progress}%
                </span>
              </div>
              <div role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}
                className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--hover)' }}>
                <div className="h-full transition-all duration-200"
                  style={{ width: `${progress}%`, background: 'linear-gradient(90deg,var(--primary),var(--accent))' }} />
              </div>
            </div>
          )}

          {/* Upload success state */}
          {!loading && preview && !confirmed && (
            <div>
              <p className="text-xs text-green-700 dark:text-green-400 mb-2 font-medium">
                ✓ Upload complete — please confirm the photo
              </p>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}
              >
                <CheckCircle size={13} aria-hidden="true" /> Confirm Photo
              </button>
            </div>
          )}

          {!loading && preview && confirmed && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
              <CheckCircle size={13} aria-hidden="true" /> Photo Confirmed
            </div>
          )}

          {/* Upload / Change button */}
          {!loading && (
            <div className="flex items-center gap-2 flex-wrap">
              <label className="cursor-pointer">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--accent)', color: '#fff' }}>
                  <Upload size={13} aria-hidden="true" />
                  {preview ? 'Change Photo' : 'Upload Photo'}
                </span>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  className="sr-only"
                  onChange={handleChange}
                  aria-label={`${label} upload`}
                />
              </label>

              {preview && (
                <button type="button" onClick={reset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)' }}
                  aria-label="Remove photo">
                  <X size={13} aria-hidden="true" /> Remove
                </button>
              )}
            </div>
          )}
          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>
            JPG, PNG, GIF, WebP · max 5 MB
          </p>
        </div>
      </div>
    </div>
  )
}
