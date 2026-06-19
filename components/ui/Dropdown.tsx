'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  trigger: React.ReactNode
  items: DropdownItem[]
  onSelect?: (item: DropdownItem) => void
  value?: string | number
  align?: 'left' | 'right'
  width?: number
  className?: string
  variant?: 'default' | 'ghost' | 'outline'
  disabled?: boolean
  placeholder?: string
}

/* ── Main Component ─────────────────────────────────── */
export function Dropdown({
  trigger, items, onSelect, value,
  align = 'left', width = 200,
  className = '', variant = 'default',
  disabled = false, placeholder,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({})
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const panelH = Math.min(items.length * 44 + 12, 320)
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < panelH + 8 && rect.top > panelH + 8

    setPanelStyle({
      position: 'fixed',
      width,
      zIndex: 99999,
      ...(align === 'right'
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left }),
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + 4 }
        : { top: rect.bottom + 4 }),
    })
  }, [align, width, items.length])

  const handleToggle = () => {
    if (disabled) return
    if (!open) updatePosition()
    setOpen(p => !p)
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const t = e.target as Node
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

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

  const selected = value !== undefined ? items.find(i => i.value === value) : undefined
  const displayLabel = selected?.label ?? placeholder

  const triggerBg =
    variant === 'ghost' ? (open ? 'var(--hover)' : 'transparent') :
    variant === 'outline' ? 'var(--surface)' :
    'var(--surface)'

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
        animation: 'dropdownIn 0.14s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div style={{ padding: '6px', maxHeight: 320, overflowY: 'auto' }}>
        {items.map((item, idx) => {
          const Icon = item.icon
          const isSel = value !== undefined && item.value === value
          return (
            <div key={idx}>
              {item.dividerBefore && (
                <div style={{ height: 1, margin: '4px 8px', background: 'var(--border)' }} />
              )}
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  if (!item.disabled) { onSelect?.(item); setOpen(false) }
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 8, border: 'none',
                  background: isSel ? 'var(--accent-tint)' : 'transparent',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  textAlign: 'left', fontSize: 13,
                  fontWeight: isSel ? 600 : 400,
                  color: item.danger ? 'var(--error)' : isSel ? 'var(--primary)' : 'var(--text-primary)',
                  opacity: item.disabled ? 0.4 : 1,
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => {
                  if (!item.disabled)
                    e.currentTarget.style.background = item.danger ? 'rgba(239,68,68,0.08)' : 'var(--hover)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = isSel ? 'var(--accent-tint)' : 'transparent'
                }}
              >
                {Icon && (
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: item.danger ? 'rgba(239,68,68,0.1)' : isSel ? 'var(--accent-tint)' : 'var(--hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} style={{ color: item.danger ? 'var(--error)' : isSel ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  </span>
                )}
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 999,
                    background: item.badgeColor ? `${item.badgeColor}20` : 'var(--accent-tint)',
                    color: item.badgeColor ?? 'var(--primary)', flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                )}
                {isSel && !item.badge && <Check size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  ) : null

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
        style={{
          background: triggerBg,
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
          color: 'var(--text-primary)',
          boxShadow: open ? '0 0 0 3px rgba(67,118,108,0.15)' : 'none',
        }}
        onMouseEnter={e => { if (!open && !disabled) e.currentTarget.style.borderColor = 'var(--primary)' }}
        onMouseLeave={e => { if (!open && !disabled) e.currentTarget.style.borderColor = 'var(--border)' }}
      >
        {typeof trigger === 'string' ? (
          <>
            <span style={{ color: displayLabel ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {displayLabel ?? trigger}
            </span>
            <ChevronDown
              size={14}
              style={{
                color: 'var(--text-secondary)', flexShrink: 0,
                transition: 'transform 0.2s ease',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </>
        ) : (
          trigger
        )}
      </button>

      {typeof window !== 'undefined' && panel && createPortal(panel, document.body)}
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
            {Icon && <Icon size={14} style={{ color: selected ? 'var(--primary)' : 'var(--text-secondary)', flexShrink: 0 }} />}
            <span style={{ color: selected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {selected?.label ?? placeholder}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-secondary)', marginLeft: 'auto', flexShrink: 0 }} />
          </span>
        }
        items={value ? [{ label: 'All (clear)', value: '' }, ...items] : items}
        value={value}
        onSelect={item => onChange(String(item.value ?? ''))}
        width={width}
        align={align}
        variant="outline"
      />
    </div>
  )
}
