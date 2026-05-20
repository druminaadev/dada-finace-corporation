'use client'
import React from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: string; isPositive: boolean }
  className?: string
}

export function StatCard({ title, value, icon, trend, className = '' }: StatCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[var(--card)] rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${className}`}
      style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
            {title}
          </p>
          <h3 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {value}
          </h3>
          {trend && (
            <p className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #831C91 0%, #D552A3 100%)' }}
        >
          <span className="text-white">{icon}</span>
        </div>
      </div>
    </div>
  )
}
