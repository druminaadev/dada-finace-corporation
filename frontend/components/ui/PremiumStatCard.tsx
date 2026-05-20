'use client'
import React from 'react'
import { LucideIcon } from 'lucide-react'

interface PremiumStatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: {
    value: number
    isPositive: boolean
  }
  iconColor: string
  iconBg: string
  glow?: boolean
}

export function PremiumStatCard({ icon: Icon, label, value, trend, iconColor, iconBg, glow = false }: PremiumStatCardProps) {
  return (
    <div 
      className={`
        glass-card-premium
        p-6 
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:scale-[1.02]
        cursor-pointer
        group
        relative
        overflow-hidden
        ${glow ? 'neon-glow-orange' : ''}
      `}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-[#831C91]/5 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div 
          className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
          style={{ 
            background: iconBg,
            boxShadow: `0 8px 24px ${iconColor}40`
          }}
        >
          <Icon size={26} style={{ color: iconColor }} />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {label}
            </p>
            {trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${trend.isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-white leading-none group-hover:text-glow transition-all duration-300">
            {value}
          </p>
        </div>
      </div>

      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="animate-shimmer absolute inset-0" />
      </div>
    </div>
  )
}
