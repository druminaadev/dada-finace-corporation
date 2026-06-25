'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

type Variant = 'primary' | 'success' | 'danger' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
}

const variantStyles: Record<Variant, React.CSSProperties> = {
  primary: {
    background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
    color: '#FFFFFF', border: 'none', boxShadow: COLORS.shadowPrimary,
  },
  success: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#FFFFFF', border: 'none', boxShadow: '0 4px 14px rgba(16,185,129,0.3)',
  },
  danger: {
    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
    color: '#FFFFFF', border: 'none', boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
  },
  outline: {
    background: 'transparent', color: COLORS.primary,
    border: `2px solid ${COLORS.primary}`, boxShadow: `0 2px 8px ${COLORS.primaryAlpha12}`,
  },
  ghost: {
    background: 'transparent', color: COLORS.dark,
    border: `1px solid ${COLORS.borderLight}`, boxShadow: 'none',
  },
}

const hoverStyles: Record<Variant, Partial<React.CSSProperties>> = {
  primary:  { background: `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`, transform: 'scale(1.02)', boxShadow: COLORS.shadowSecondary },
  success:  { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', transform: 'scale(1.02)' },
  danger:   { background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)', transform: 'scale(1.02)' },
  outline:  { background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`, color: '#FFFFFF', border: 'none', transform: 'scale(1.02)' },
  ghost:    { background: COLORS.bgSecondary, transform: 'scale(1.02)' },
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className = '', disabled, onClick, ...props }, ref) => {
    const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) { e.preventDefault(); return }
      onClick?.(e)
    }

    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled || loading}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        className={base}
        style={variantStyles[variant]}
        onClick={handleClick}
        onMouseEnter={e => {
          if (disabled || loading) return
          Object.assign(e.currentTarget.style, hoverStyles[variant])
        }}
        onMouseLeave={e => {
          Object.assign(e.currentTarget.style, variantStyles[variant])
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
