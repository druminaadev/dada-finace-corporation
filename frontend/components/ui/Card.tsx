'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

interface CardProps { title?: string; children: React.ReactNode; className?: string }
export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-[var(--card)] rounded-2xl border border-gray-100 dark:border-[var(--border)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`} style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)' }}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[var(--border)]" style={{ background: `linear-gradient(to right, ${COLORS.orangeTintLight}, var(--surface))` }}>
          <h3 className="text-sm font-bold flex items-center gap-2 text-[#1A1A1A] dark:text-[var(--text-primary)]">
            <span className="w-1 h-5 rounded-full shadow-lg" style={{ background: `linear-gradient(to bottom, ${COLORS.orange}, ${COLORS.orangeLight})`, boxShadow: `0 2px 8px ${COLORS.orangeShadow}` }}></span>
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  )
}
