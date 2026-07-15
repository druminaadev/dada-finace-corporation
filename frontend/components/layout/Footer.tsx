'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { COLORS } from '@/lib/colors'

export function Footer() {
  const [date, setDate] = useState<Date | null>(null)

  useEffect(() => {
    const updateDate = () => setDate(new Date())

    const initialTimer = setTimeout(updateDate, 0)
    const timer = setInterval(updateDate, 1000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(timer)
    }
  }, [])

  return (
    <footer className="h-9 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 shrink-0" style={{ borderTopColor: COLORS.borderLight, backgroundColor: COLORS.white }}>
      <span className="text-xs text-slate-500 dark:text-slate-400" style={{ color: COLORS.gray }}>
        Copyright &copy; 2025 Dada Finance &amp; Corporation. All rights reserved.
      </span>
      <span className="text-xs text-slate-500 dark:text-slate-400" style={{ color: COLORS.gray }}>
        {date ? `Date: ${format(date, 'dd-M-yyyy')} | Time: ${format(date, 'h:mm:ss aa')}` : ''}
      </span>
    </footer>
  )
}
