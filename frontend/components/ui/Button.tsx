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

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${className}`

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`,
          color: '#FFFFFF',
          border: 'none',
          boxShadow: COLORS.shadowPrimary,
        }
      case 'success':
        return {
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
        }
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
        }
      case 'outline':
        return {
          background: 'transparent',
          color: COLORS.primary,
          border: `2px solid ${COLORS.primary}`,
          boxShadow: `0 2px 8px ${COLORS.primaryAlpha12}`,
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: COLORS.dark,
          border: `1px solid ${COLORS.borderLight}`,
          boxShadow: 'none',
        }
      default:
        return {}
    }
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget
    switch (variant) {
      case 'primary':
        target.style.background = `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`
        target.style.transform = 'scale(1.02)'
        target.style.boxShadow = COLORS.shadowSecondary
        break
      case 'success':
        target.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
        target.style.transform = 'scale(1.02)'
        break
      case 'danger':
        target.style.background = 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)'
        target.style.transform = 'scale(1.02)'
        break
      case 'outline':
        target.style.background = `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 100%)`
        target.style.color = '#FFFFFF'
        target.style.borderColor = 'transparent'
        target.style.transform = 'scale(1.02)'
        break
      case 'ghost':
        target.style.background = COLORS.bgSecondary
        target.style.transform = 'scale(1.02)'
        break
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const target = e.currentTarget
    const originalStyles = getVariantStyles()
    target.style.background = originalStyles.background || 'transparent'
    target.style.color = originalStyles.color || COLORS.dark
    target.style.borderColor = originalStyles.border?.includes('solid') ? originalStyles.border.split('solid ')[1] : 'transparent'
    target.style.transform = 'scale(1)'
    target.style.boxShadow = originalStyles.boxShadow || 'none'
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={baseClasses}
      style={getVariantStyles()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}