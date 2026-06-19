'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string; error?: string; required?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required, className = '', style, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">
          {label}{required && <span style={{ color: COLORS.orange }} className="ml-0.5">*</span>}
        </label>
      )}
      <textarea ref={ref} {...props} rows={props.rows ?? 3}
        className={`px-4 py-3 text-sm rounded-xl outline-none transition-all resize-none bg-white dark:bg-[var(--form-field)] text-[#2C2C2C] dark:text-[var(--text-primary)] ${className}`}
        style={{
          border: `1.5px solid ${error ? COLORS.orange : 'var(--border)'}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          ...style,
        }}
        onFocus={e => {
          e.currentTarget.style.borderColor = COLORS.orange
          e.currentTarget.style.boxShadow = `0 0 0 3px ${COLORS.orangeTint}`
        }}
        onBlur={e => {
          e.currentTarget.style.borderColor = error ? COLORS.orange : 'var(--border)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)'
        }}
      />
      {error && <p className="text-xs" style={{ color: COLORS.orange }}>{error}</p>}
    </div>
  )
)
Textarea.displayName = 'Textarea'
