'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { COLORS } from '@/lib/colors'

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'size'> {
  label?: string
  error?: string
  required?: boolean
  options: { value: string | number; label: string }[]
  placeholder?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, required, options, placeholder, value, onChange, disabled, className = '', ...props }, ref) => {
    const [open, setOpen] = useState(false)
    // internalValue drives what the custom button displays
    // it is seeded from the controlled `value` prop, and updated on every selection
    const [internalValue, setInternalValue] = useState<string>(String(value ?? ''))
    const containerRef = useRef<HTMLDivElement>(null)
    const nativeSelectRef = useRef<HTMLSelectElement | null>(null)

    // Keep internalValue in sync when the controlled `value` prop changes from outside
    useEffect(() => {
      setInternalValue(String(value ?? ''))
    }, [value])

    // Also watch the hidden native select for changes driven by react-hook-form
    // (e.g. reset(), setValue()) — those update the native element directly
    useEffect(() => {
      const el = nativeSelectRef.current
      if (!el) return
      const handler = () => setInternalValue(el.value)
      el.addEventListener('change', handler)
      return () => el.removeEventListener('change', handler)
    }, [])

    // close on outside click
    useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [])

    // close on Escape
    useEffect(() => {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [])

    const selected = options.find(o => String(o.value) === internalValue)

    const handleSelect = (opt: { value: string | number; label: string }) => {
      const strVal = String(opt.value)
      setInternalValue(strVal)

      // Update the hidden native select so react-hook-form stays in sync
      const el = nativeSelectRef.current
      if (el) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set
        setter?.call(el, strVal)
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }

      // Also call the passed onChange for controlled components
      onChange?.({ target: { value: strVal } } as React.ChangeEvent<HTMLSelectElement>)
      setOpen(false)
    }

    const borderColor = error ? COLORS.orange : open ? 'var(--accent)' : 'var(--border)'
    const shadow = open ? '0 0 0 3px var(--accent-tint)' : '0 1px 2px rgba(0,0,0,0.04)'

    return (
      <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
        {label && (
          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {required && <span style={{ color: COLORS.orange }} className="ml-0.5">*</span>}
          </label>
        )}

        {/* Hidden native select — receives ref + all react-hook-form props */}
        <select
          ref={el => {
            nativeSelectRef.current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el
          }}
          value={internalValue}
          onChange={e => {
            setInternalValue(e.target.value)
            onChange?.(e)
          }}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Custom dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(p => !p)}
            className="w-full h-11 px-4 pr-10 text-sm rounded-xl text-left flex items-center transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'var(--surface)',
              border: `1.5px solid ${borderColor}`,
              boxShadow: shadow,
              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}
          >
            <span className="flex-1 truncate">{selected?.label ?? placeholder ?? 'Select...'}</span>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200"
              style={{
                color: 'var(--text-secondary)',
                transform: open ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%) rotate(0deg)',
              }}
            />
          </button>

          {/* Dropdown panel */}
          {open && (
            <div
              className="absolute left-0 right-0 z-[999] mt-1.5 rounded-2xl overflow-hidden"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                animation: 'selectDropIn 0.15s ease',
              }}
            >
              <style>{`
                @keyframes selectDropIn {
                  from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                  to   { opacity: 1; transform: translateY(0) scale(1); }
                }
              `}</style>
              <div className="py-1.5 max-h-60 overflow-y-auto">
                {placeholder && (
                  <button
                    type="button"
                    onClick={() => handleSelect({ value: '', label: '' })}
                    className="w-full flex items-center px-3 py-2 text-sm text-left transition-colors duration-100 cursor-pointer"
                    style={{ color: 'var(--text-secondary)', background: 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span className="flex-1 truncate italic">{placeholder}</span>
                  </button>
                )}
                {options.map(opt => {
                  const isSelected = String(opt.value) === internalValue
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors duration-100 cursor-pointer"
                      style={{
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        background: isSelected ? 'var(--accent-tint)' : 'transparent',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--hover)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = isSelected ? 'var(--accent-tint)' : 'transparent' }}
                    >
                      <span className="flex-1 truncate">{opt.label}</span>
                      {isSelected && <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs" style={{ color: COLORS.orange }}>{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
