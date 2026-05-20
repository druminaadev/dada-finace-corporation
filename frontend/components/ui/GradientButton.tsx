'use client'
import React from 'react'
import { COLORS } from '@/lib/colors'

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function GradientButton({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  children, 
  className = '', 
  disabled, 
  ...props 
}: GradientButtonProps) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  const baseStyle = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

  if (variant === 'outline') {
    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`
      e.currentTarget.style.color = '#FFFFFF'
      e.currentTarget.style.borderColor = 'transparent'
      e.currentTarget.style.transform = 'scale(1.02)'
      e.currentTarget.style.boxShadow = COLORS.shadowSecondary
    }

    const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = COLORS.primary
      e.currentTarget.style.borderColor = COLORS.primary
      e.currentTarget.style.transform = 'scale(1)'
      e.currentTarget.style.boxShadow = `0 4px 14px ${COLORS.primaryAlpha16}`
    }

    return (
      <button
        {...props}
        disabled={disabled || loading}
        className={`${baseStyle} ${sizes[size]} ${className}`}
        style={{
          background: 'transparent',
          color: COLORS.primary,
          border: `2px solid ${COLORS.primary}`,
          boxShadow: `0 4px 14px ${COLORS.primaryAlpha16}`,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {loading && <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
        {children}
      </button>
    )
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 50%, ${COLORS.primaryLight} 100%)`
    e.currentTarget.style.transform = 'scale(1.02)'
    e.currentTarget.style.boxShadow = COLORS.shadowSecondary
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.secondary} 100%)`
    e.currentTarget.style.transform = 'scale(1)'
    e.currentTarget.style.boxShadow = COLORS.shadowPrimary
  }

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseStyle} ${sizes[size]} ${className}`}
      style={{
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryLight} 50%, ${COLORS.secondary} 100%)`,
        color: '#FFFFFF',
        border: 'none',
        boxShadow: COLORS.shadowPrimary,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  )
}