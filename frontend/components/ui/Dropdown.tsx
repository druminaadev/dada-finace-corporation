'use client'
import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

/* ── Types ─────────────────────────────────────────── */
export interface DropdownItem {
  label: string
  value?: string | number
  icon?: React.ElementType
  badge?: string
  badgeColor?: string
  disabled?: boolean
  danger?: boolean
  dividerBefore?: boolean
}

interface DropdownProps {
  /** The trigger element — button text or custom ReactNode */
  trigger: React.ReactNode
  items: DropdownItem[]
  /** Called when an item is clicked */
  onSelect?: (item: DropdownItem) => void
  /** Currently selected value (for select-style dropdowns) */
  value?: string | number
  /** Alignment of the panel relative to the trigger */
  align?: 'left' | 'right'
  /** Width of the dropdown panel */
  width?: number
  /** Extra class on the trigger wrapper */
  className?: string
  /** Variant of the trigger button */
  variant?: 'default' | 'ghost' | 'outline'
  disabled?: boolean
  placeholder?: string
}

/* ── Main Component ─────────────────────────────────── */
export function Dropdown({
  trigger,
  items,
  onSelect,
  value,
  align = 'left',
  width = 200,
  className = '',
  variant = 'default',
  disabled = false,
  placeholder,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const selected = value !== undefined ? items.find(i => i.value === value) : undefined
  const displayLabel = selected?.label ?? placeholder

  const triggerStyles: React.CSSProperties =
    variant === 'ghost'
      ? { background: open ? 'var(--hover)' : 'transparent', border: '1px solid transparent', color: 'var(--text-primary)' }
      : variant === 'outline'
      ? { background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
      : { background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)' }

  return (
    <div>
      <div ref={ref} className={`relative inline-block ${className}`}>

        {/* Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(p => !p)}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
          style={{
            ...triggerStyles,
            boxShadow: open ? '0 0 0 3px var(--accent-tint)' : 'none',
            borderColor: open ? 'var(--accent)' : triggerStyles.border?.toString().split(' ').pop(),
          }}
          onMouseEnter={e => { if (!open && !disabled) e.currentTarget.style.borderColor = 'var(--accent)' }}
          onMouseLeave={e => { if (!open && !disabled) e.currentTarget.style.borderColor = triggerStyles.border?.toString().split(' ').pop() ?? 'var(--border)' }}
        >
          {/* If trigger is a string, render it; otherwise render the ReactNode */}
          {typeof trigger === 'string' ? (
            <>
              <span style={{ color: displayLabel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {displayLabel ?? trigger}
              </span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--text-secondary)',
                  transition: 'transform 0.2s',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                }}
              />
            </>
          ) : (
            trigger
          )}
        </button>

        {/* Panel */}
        {open && (
          <div
            className="absolute z-[999] mt-1.5 rounded-2xl overflow-hidden"
            style={{
              width,
              [align === 'right' ? 'right' : 'left']: 0,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
              animation: 'dropdownIn 0.15s ease',
            }}
          >
            <style>{`
              @keyframes dropdownIn {
                from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                to   { opacity: 1; transform: translateY(0)   scale(1); }
              }
            `}</style>

            <div className="py-1.5">
              {items.map((item, idx) => {
                const Icon = item.icon
                const isSelected = value !== undefined && item.value === value
                return (
                  <div key={idx}>
                    {item.dividerBefore && (
                      <div className="my-1.5 mx-3" style={{ height: 1, background: 'var(--border)' }} />
                    )}
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={() => {
                        if (!item.disabled) {
                          onSelect?.(item)
                          setOpen(false)
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors duration-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        color: item.danger ? 'var(--error)' : isSelected ? 'var(--accent)' : 'var(--text-primary)',
                        background: isSelected ? 'var(--accent-tint)' : 'transparent',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                      onMouseEnter={e => {
                        if (!item.disabled)
                          e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'var(--hover)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isSelected ? 'var(--accent-tint)' : 'transparent'
                      }}
                    >
                      {Icon && (
                        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: item.danger ? 'rgba(239,68,68,0.1)' : isSelected ? 'var(--accent-tint)' : 'var(--hover)' }}>
                          <Icon size={14} style={{ color: item.danger ? 'var(--error)' : isSelected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                        </span>
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none flex-shrink-0"
                          style={{ background: item.badgeColor ? `${item.badgeColor}20` : 'var(--accent-tint)', color: item.badgeColor ?? 'var(--accent)' }}>
                          {item.badge}
                        </span>
                      )}
                      {isSelected && !item.badge && (
                        <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── SelectDropdown — convenience wrapper for filter selects ── */
interface SelectDropdownProps {
  label?: string
  placeholder?: string
  options: { value: string | number; label: string }[]
  value: string
  onChange: (value: string) => void
  icon?: React.ElementType
  width?: number
  align?: 'left' | 'right'
}

export function SelectDropdown({ label, placeholder = 'Select...', options, value, onChange, icon: Icon, width = 180, align }: SelectDropdownProps) {
  const items: DropdownItem[] = options.map(o => ({ label: o.label, value: o.value }))
  const selected = options.find(o => String(o.value) === String(value))

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
      <Dropdown
        trigger={
          <span className="inline-flex items-center gap-2 text-sm">
            {Icon && <Icon size={14} style={{ color: selected ? 'var(--accent)' : 'var(--text-secondary)', flexShrink: 0 }} />}
            <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }} />
          </span>
        }
        items={value ? [{ label: `All (clear)`, value: '', dividerBefore: false }, ...items] : items}
        value={value}
        onSelect={item => onChange(String(item.value ?? ''))}
        width={width}
        align={align}
        variant="outline"
      />
    </div>
  )
}
