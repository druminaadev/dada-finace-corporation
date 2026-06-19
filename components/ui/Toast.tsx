'use client'
import { useUIStore } from '@/store/uiStore'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const STYLES = {
  success: {
    icon: CheckCircle,
    bg: 'var(--toast-success-bg)',
    border: 'var(--toast-success-border)',
    iconColor: 'var(--toast-success-icon)',
    text: 'var(--toast-success-text)',
  },
  error: {
    icon: XCircle,
    bg: 'var(--toast-error-bg)',
    border: 'var(--toast-error-border)',
    iconColor: 'var(--toast-error-icon)',
    text: 'var(--toast-error-text)',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'var(--toast-warning-bg)',
    border: 'var(--toast-warning-border)',
    iconColor: 'var(--toast-warning-icon)',
    text: 'var(--toast-warning-text)',
  },
  info: {
    icon: Info,
    bg: 'var(--toast-info-bg)',
    border: 'var(--toast-info-border)',
    iconColor: 'var(--toast-info-icon)',
    text: 'var(--toast-info-text)',
  },
}

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore()
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(t => {
        const s = STYLES[t.type]
        const Icon = s.icon
        return (
          <div
            key={t.id}
            className="flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto"
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              animation: 'slideInRight 0.25s ease',
            }}
          >
            <Icon size={16} style={{ color: s.iconColor, flexShrink: 0, marginTop: 2 }} />
            <span className="text-sm font-medium flex-1" style={{ color: s.text }}>
              {t.message}
            </span>
            <button
              onClick={() => removeToast(t.id)}
              className="cursor-pointer shrink-0 transition-opacity"
              style={{ color: s.text, opacity: 0.65 }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
