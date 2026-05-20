// Global color system for the application - Custom Purple & Pink Theme
export const COLORS = {
  // Primary Brand Colors - Custom Purple/Pink Theme
  primary: 'var(--accent)',
  primaryLight: 'var(--accent-light)',
  primaryDark: 'var(--accent-dark)',
  secondary: 'var(--accent-pink)',
  
  // Status Colors
  pending: 'var(--accent-pink)',
  approved: '#10B981',
  disbursed: '#462C7D',
  rejected: '#EF4444',
  
  // Accent Colors
  purple: 'var(--accent-dark)',
  violet: 'var(--accent-light)',
  teal: 'var(--accent-pink)',
  green: '#10B981',
  cyan: '#06B6D4',
  indigo: 'var(--accent-dark)',
  emerald: '#059669',
  pink: 'var(--accent-pink)',
  orange: 'var(--accent)',
  orangeLight: 'var(--accent-pink)',
  orangeTint: 'var(--accent-tint)',
  orangeTintLight: 'var(--accent-tint)',
  orangeShadow: 'rgba(131, 28, 145, 0.25)',
  
  // Neutral Colors
  dark: 'var(--text-primary)',
  darkSecondary: 'var(--text-secondary)',
  gray: 'var(--text-secondary)',
  lightGray: 'var(--border)',
  white: 'var(--surface)',
  
  // Background Colors
  bgPrimary: 'var(--bg)',
  bgSecondary: 'var(--hover)',
  bgTertiary: 'var(--card)',
  bgAccent: 'var(--bg)',
  
  // Border Colors
  borderPrimary: 'var(--border)',
  borderSecondary: 'var(--border)',
  borderLight: 'var(--border)',
  
  // Opacity Variants
  primaryAlpha12: 'var(--accent-tint)',
  primaryAlpha16: 'var(--accent-tint)',
  primaryAlpha18: 'var(--accent-tint)',
  primaryAlpha25: 'var(--accent-tint)',
  secondaryAlpha25: 'rgba(213, 82, 163, 0.25)',
  secondaryAlpha12: 'rgba(213, 82, 163, 0.12)',
  
  // Shadow Colors
  shadowPrimary: '0 24px 70px rgba(70, 44, 125, 0.18)',
  shadowSecondary: '0 18px 45px rgba(70, 44, 125, 0.18)',
  shadowCard: '0 16px 40px rgba(30, 41, 59, 0.12)',
  
  // Chart Colors
  chart: {
    personal: '#462C7D',
    business: '#831C91',
    home: '#D552A3',
    auto: '#10B981',
  },
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
  primary: 'linear-gradient(135deg, var(--accent-dark) 0%, var(--accent-light) 50%, var(--accent-pink) 100%)',
  hero: 'linear-gradient(135deg, var(--surface) 0%, var(--bg) 56%, var(--card) 100%)',
  card: 'radial-gradient(circle at 12% 12%, rgba(70, 44, 125, 0.25), transparent 30%), radial-gradient(circle at 82% 18%, rgba(213, 82, 163, 0.18), transparent 30%), linear-gradient(135deg, var(--surface) 0%, var(--bg) 56%, var(--card) 100%)',
  sidebar: 'linear-gradient(180deg, var(--surface) 0%, var(--bg) 100%)',
} as const
