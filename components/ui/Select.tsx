'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
    const [internalValue, setInternalValue] = useState<string>(String(value ?? ''))
    const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({})
    const triggerRef = useRef<HTMLButtonElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const nativeSelectRef = useRef<HTMLSelectElement | null>(null)
    const panelRef = useRef<HTMLDivElement>(null)

    // Sync controlled value
    useEffect(() => { setInternalValue(String(value ?? '')) }, [value])

    // Sync from native (react-hook-form reset/setValue)
    useEffect(() => {
      const el = nativeSelectRef.current
      if (!el) return
      const handler = () => setInternalValue(el.value)
      el.addEventListener('change', handler)
      return () => el.removeEventListener('change', handler)
    }, [])

    // Position panel via portal
    const updatePosition = useCallback(() => {
      if (!triggerRef.current) return
      const rect = triggerRef.current.getBoundingClientRect()
      const panelH = 240
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < panelH + 8 && rect.top > panelH + 8

      setPanelStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      })
    }, [])

    // Open/close
    const handleToggle = () => {
      if (disabled) return
      if (!open) updatePosition()
      setOpen(p => !p)
    }

    // Close on outside click
    useEffect(() => {
      if (!open) return
      const handler = (e: MouseEvent) => {
        const t = e.target as Node
        if (
          containerRef.current?.contains(t) ||
          panelRef.current?.contains(t)
        ) return
        setOpen(false)
      }
      document.addEventListener('mousedown', handler)
      return () => document.removeEventListener('mousedown', handler)
    }, [open])

    // Close on Escape
    useEffect(() => {
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }, [])

    // Reposition on scroll/resize
    useEffect(() => {
      if (!open) return
      const handler = () => updatePosition()
      window.addEventListener('scroll', handler, true)
      window.addEventListener('resize', handler)
      return () => {
        window.removeEventListener('scroll', handler, true)
        window.removeEventListener('resize', handler)
      }
    }, [open, updatePosition])

    const selected = options.find(o => String(o.value) === internalValue)

    const handleSelect = (opt: { value: string | number; label: string }) => {
      const strVal = String(opt.value)
      setInternalValue(strVal)

      const el = nativeSelectRef.current
      if (el) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set
        setter?.call(el, strVal)
        el.dispatchEvent(new Event('change', { bubbles: true }))
      }

      onChange?.({ target: { value: strVal } } as React.ChangeEvent<HTMLSelectElement>)
      setOpen(false)
    }

    const borderColor = error ? COLORS.orange : open ? 'var(--primary)' : 'var(--border)'
    const shadow = open ? '0 0 0 3px rgba(67,118,108,0.15)' : '0 1px 3px rgba(0,0,0,0.04)'

    const panel = open ? (
      <div
        ref={panelRef}
        style={{
          ...panelStyle,
          background: 'var(--surface)',
          border: '1.5px solid var(--border)',
          borderRadius: 14,
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
          overflow: 'hidden',
          animation: 'selectDropIn 0.14s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        <style>{`
          @keyframes selectDropIn {
            from { opacity: 0; transform: translateY(-6px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <div style={{ padding: '6px', maxHeight: 240, overflowY: 'auto' }}>
          {placeholder && (
            <button
              type="button"
              onClick={() => handleSelect({ value: '', label: '' })}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                padding: '8px 12px', borderRadius: 8, border: 'none',
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                fontSize: 13, fontStyle: 'italic', color: 'var(--text-secondary)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {placeholder}
            </button>
          )}
          {options.map(opt => {
            const isSel = String(opt.value) === internalValue
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: isSel ? 'var(--accent-tint)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left',
                  fontSize: 13, fontWeight: isSel ? 600 : 400,
                  color: isSel ? 'var(--primary)' : 'var(--text-primary)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = 'var(--hover)' }}
                onMouseLeave={e => { e.currentTarget.style.background = isSel ? 'var(--accent-tint)' : 'transparent' }}
              >
                <span style={{ flex: 1 }}>{opt.label}</span>
                {isSel && <Check size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>
    ) : null

    return (
      <div className={`flex flex-col gap-1.5 ${className}`} ref={containerRef}>
        {label && (
          <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {label}
            {required && <span style={{ color: COLORS.orange }} className="ml-0.5">*</span>}
          </label>
        )}

        {/* Hidden native select for form libs */}
        <select
          ref={el => {
            nativeSelectRef.current = el
            if (typeof ref === 'function') ref(el)
            else if (ref) (ref as React.MutableRefObject<HTMLSelectElement | null>).current = el
          }}
          value={internalValue}
          onChange={e => { setInternalValue(e.target.value); onChange?.(e) }}
          disabled={disabled}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        {/* Custom trigger */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={handleToggle}
          className="w-full h-11 px-4 text-sm text-left flex items-center gap-2 transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'var(--surface)',
            border: `1.5px solid ${borderColor}`,
            borderRadius: 10,
            boxShadow: shadow,
            color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
          }}
        >
          <span className="flex-1 truncate">{selected?.label ?? placeholder ?? 'Select...'}</span>
          <ChevronDown
            size={15}
            style={{
              color: 'var(--text-secondary)',
              flexShrink: 0,
              transition: 'transform 0.2s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>

        {typeof window !== 'undefined' && panel && createPortal(panel, document.body)}

        {error && <p className="text-xs" style={{ color: COLORS.orange }}>{error}</p>}
      </div>
    )
  }
)
Select.displayName = 'Select'
