'use client'
import { statusColors } from '@/lib/colors'

type Status = 'pending' | 'approved' | 'disbursed'

const cfg: Record<Status, { dot: string; text: string; bg: string }> = {
  pending: {
    dot: statusColors.pending,
    text: 'text-pink-700 dark:text-pink-300',
    bg: 'bg-pink-50/80 dark:bg-pink-900/20',
  },
  approved: {
    dot: statusColors.approved,
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50/80 dark:bg-emerald-900/20',
  },
  disbursed: {
    dot: '#462C7D',
    text: 'text-[#462C7D] dark:text-[#D552A3]',
    bg: 'bg-[#462C7D]/10 dark:bg-[#D552A3]/15',
  },
}

export function Badge({ status }: { status: Status }) {
  const item = cfg[status]

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-bold ${item.bg} ${item.text}`}>
      <span className="h-2 w-2 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.85)]" style={{ background: item.dot }} />
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  )
}
