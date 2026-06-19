// Global color system for the application - Modern Warm Olive-Cream CRM Theme
export const COLORS = {
  // Primary Brand Colors
  primary: 'var(--primary)',
  primaryLight: 'var(--primary-light)',
  primaryDark: 'var(--primary-dark)',
  secondary: 'var(--secondary)',

  // Status Colors
  pending: 'var(--secondary)',
  approved: 'var(--success)',
  disbursed: 'var(--primary)',
  rejected: 'var(--error)',

  // Accent Colors mapped to warm palette
  purple: 'var(--primary-dark)',
  violet: 'var(--primary-light)',
  teal: 'var(--secondary)',
  green: 'var(--success)',
  cyan: 'var(--primary-light)',
  indigo: 'var(--primary-dark)',
  emerald: 'var(--success)',
  pink: 'var(--secondary)',
  orange: 'var(--secondary)',
  orangeLight: 'var(--secondary)',
  orangeTint: 'var(--accent-tint)',
  orangeTintLight: 'var(--accent-tint)',
  orangeShadow: 'rgba(177, 148, 112, 0.2)',

  // Neutral Colors
  dark: 'var(--text-primary)',
  darkSecondary: 'var(--text-secondary)',
  gray: 'var(--text-secondary)',
  lightGray: 'var(--border)',
  white: 'var(--surface)',

  // Background Colors
  bgPrimary: 'var(--background)',
  bgSecondary: 'var(--hover)',
  bgTertiary: 'var(--surface)',
  bgAccent: 'var(--background)',

  // Border Colors
  borderPrimary: 'var(--border)',
  borderSecondary: 'var(--border)',
  borderLight: 'var(--border)',

  // Opacity Variants
  primaryAlpha12: 'var(--accent-tint)',
  primaryAlpha16: 'var(--accent-tint)',
  primaryAlpha18: 'var(--accent-tint)',
  primaryAlpha25: 'var(--accent-tint)',
  secondaryAlpha25: 'rgba(177, 148, 112, 0.25)',
  secondaryAlpha12: 'rgba(177, 148, 112, 0.12)',

  // Shadow Colors
  shadowPrimary: '0 24px 70px rgba(67, 118, 108, 0.12)',
  shadowSecondary: '0 18px 45px rgba(67, 118, 108, 0.1)',
  shadowCard: '0 16px 40px rgba(118, 69, 59, 0.05)',
} as const

// Status color mapping
export const statusColors = {
  pending: COLORS.pending,
  approved: COLORS.approved,
  disbursed: COLORS.disbursed,
  rejected: COLORS.rejected,
} as const

// Gradient definitions
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--secondary) 100%)',
  hero: 'linear-gradient(135deg, var(--surface) 0%, var(--background) 56%, var(--surface) 100%)',
  card: 'radial-gradient(circle at 12% 12%, rgba(67, 118, 108, 0.15), transparent 30%), radial-gradient(circle at 82% 18%, rgba(177, 148, 112, 0.12), transparent 30%), linear-gradient(135deg, var(--surface) 0%, var(--background) 56%, var(--surface) 100%)',
  sidebar: 'linear-gradient(180deg, var(--surface) 0%, var(--background) 100%)',
} as const

// Chart Colors matching the CRM design system
export const CHART_COLORS = {
  personal: '#43766C',   // Primary Olive Green
  business: '#B19470',   // Secondary Muted Gold
  home: '#76453B',       // Text Terracotta/Dark Accent
  auto: '#3B7A57',       // Success Sage Green
} as const
