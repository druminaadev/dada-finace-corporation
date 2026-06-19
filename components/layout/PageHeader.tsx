'use client'
import React from 'react'
import { CheckCircle } from 'lucide-react'
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

export function PageHeader({ title, subtitle, steps, currentStep = 0, action }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{title}</h1>
          {subtitle && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
          )}
        </div>
        {action && (
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
      {steps && steps.length > 0 && (
        <div className="flex items-center w-full">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all"
                  style={{
                    background: i < currentStep ? 'var(--success)' : i === currentStep ? 'var(--accent)' : 'var(--hover)',
                    color: i <= currentStep ? '#fff' : 'var(--text-secondary)',
                    border: i === currentStep ? '2px solid var(--accent)' : '2px solid transparent',
                    minWidth: 40,
                  }}
                >
                  {i < currentStep ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span
                  className="text-[11px] mt-1 font-medium text-center hidden sm:block"
                  style={{ color: i === currentStep ? 'var(--accent)' : 'var(--text-secondary)', whiteSpace: 'nowrap' }}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2" style={{ background: i < currentStep ? 'var(--success)' : 'var(--border)' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
