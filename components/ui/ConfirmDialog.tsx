'use client'
import { useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ConfirmDialogProps {
  open: boolean
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title = 'Confirm', message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading, onConfirm, onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', h)
    // Focus cancel on open (safer default)
    setTimeout(() => cancelRef.current?.focus(), 50)
    return () => document.removeEventListener('keydown', h)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: variant === 'danger' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)' }}>
            <AlertTriangle size={20}
              style={{ color: variant === 'danger' ? 'var(--error)' : '#F59E0B' }}
              aria-hidden="true" />
          </div>
          <h2 id="confirm-title" className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h2>
        </div>
        <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>{message}</p>
        <div className="flex gap-3 justify-end">
          <Button ref={cancelRef} variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} size="sm"
            onClick={onConfirm} loading={loading} disabled={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
