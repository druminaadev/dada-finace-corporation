'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type Toast, type ToastType } from '@/store/toastStore'

const config: Record<ToastType, { icon: React.ReactNode; bar: string; bg: string; border: string; title: string }> = {
  success: {
    icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    bar: 'bg-emerald-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-emerald-200 dark:border-emerald-800',
    title: 'text-emerald-700 dark:text-emerald-400',
  },
  error: {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    bar: 'bg-red-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-red-200 dark:border-red-800',
    title: 'text-red-700 dark:text-red-400',
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    bar: 'bg-amber-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-amber-200 dark:border-amber-800',
    title: 'text-amber-700 dark:text-amber-400',
  },
  info: {
    icon: <Info className="w-5 h-5 text-blue-500" />,
    bar: 'bg-blue-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-blue-200 dark:border-blue-800',
    title: 'text-blue-700 dark:text-blue-400',
  },
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.remove)
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const c = config[toast.type]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const dismiss = () => {
    setLeaving(true)
    setTimeout(() => remove(toast.id), 300)
  }

  return (
    <div
      className={`
        relative flex items-start gap-3 w-80 rounded-xl border shadow-lg px-4 py-3 overflow-hidden
        transition-all duration-300 ease-out
        ${c.bg} ${c.border}
        ${visible && !leaving ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-full scale-95'}
      `}
    >
      {/* left color bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${c.bar}`} />

      <div className="mt-0.5 shrink-0">{c.icon}</div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${c.title}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">{toast.message}</p>
        )}
      </div>

      <button
        onClick={dismiss}
        className="shrink-0 mt-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  )
}
