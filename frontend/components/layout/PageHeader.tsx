'use client'
import React from 'react'
import { Button } from '@/components/ui/Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  steps?: string[]
  currentStep?: number
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
}

export function PageHeader({ title, subtitle, steps, currentStep, action }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        )}
        {steps && steps.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: i <= (currentStep ?? 0) ? 'var(--accent)' : 'var(--border)',
                      color: i <= (currentStep ?? 0) ? '#fff' : 'var(--text-secondary)',
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs hidden sm:inline" style={{ color: i <= (currentStep ?? 0) ? 'var(--accent)' : 'var(--text-secondary)' }}>{s}</span>
                </div>
                {i < steps.length - 1 && <div className="h-px w-4 flex-shrink-0" style={{ background: 'var(--border)' }} />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {action && (
        /* If label is empty, render the icon node directly (e.g. a Dropdown trigger) */
        action.label === '' && action.icon ? (
          <div
            className="inline-flex items-center justify-center h-9 px-4 rounded-xl font-semibold text-sm text-white cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}
          >
            {action.icon}
          </div>
        ) : (
          <Button onClick={action.onClick} size="sm" className="flex items-center gap-2">
            {action.icon}
            {action.label}
          </Button>
        )
      )}
    </div>
  )
}
