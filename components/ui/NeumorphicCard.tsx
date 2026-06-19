'use client'
import React from 'react'

interface NeumorphicCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glass?: boolean
}

export function NeumorphicCard({ children, className = '', hover = false, glass = false }: NeumorphicCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[var(--card)] rounded-2xl p-6 transition-all duration-300 border border-gray-100 dark:border-[var(--border)] ${hover ? 'hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]' : ''} ${className}`}
      style={{
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      }}
    >
      {children}
    </div>
  )
}
