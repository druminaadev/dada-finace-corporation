'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ToastContainer } from '@/components/ui/Toast'
import { Eye, EyeOff, Lock, Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'

const SLIDES = [
  {
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900&q=80',
    title: 'Streamline Your Loan Management',
    desc: 'Manage loans, customers, and employees efficiently with our comprehensive platform.',
  },
  {
    img: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=80',
    title: 'Real-time Analytics',
    desc: 'Track loan performance and customer insights instantly with live dashboards.',
  },
  {
    img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=900&q=80',
    title: 'Secure & Compliant',
    desc: 'Bank-grade security with full audit trails trusted by 500+ businesses.',
  },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActiveSlide(s => (s + 1) % SLIDES.length), 4000)
    return () => clearInterval(t)
  }, [])
  const { login, isAuthenticated, hasHydrated } = useAuthStore()
  const { showToast } = useUIStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [hasHydrated, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const ok = await login(email, password)
    setLoading(false)
    if (ok) { showToast('Login successful! Welcome back.', 'success'); router.push('/dashboard') }
    else showToast('Invalid username or password', 'error')
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <ToastContainer />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
            D
          </div>
          <div>
            <div className="text-base font-bold text-white drop-shadow">NEXZEN</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>Loan Management System</div>
          </div>
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl cursor-pointer transition-colors"
          style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <div className="flex-1 flex min-h-screen">

        {/* Left — Image Slider panel */}
        <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-opacity duration-700"
              style={{ opacity: activeSlide === i ? 1 : 0, zIndex: activeSlide === i ? 1 : 0 }}
            >
              {/* Background image */}
              <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
            </div>
          ))}

          {/* Curved right edge */}
          <svg className="absolute right-0 top-0 h-full w-20 z-10" viewBox="0 0 80 800" preserveAspectRatio="none"
            style={{ color: 'var(--bg)' }}>
            <path d="M80,0 C40,200 40,600 80,800 L80,0 Z" fill="currentColor" />
          </svg>

          {/* Slide text */}
          <div className="absolute bottom-16 left-10 right-16 z-10">
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight drop-shadow">{SLIDES[activeSlide].title}</h2>
            <p className="text-sm text-white/80 mb-6 leading-relaxed drop-shadow">{SLIDES[activeSlide].desc}</p>
            {/* Dots */}
            <div className="flex gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className="rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: activeSlide === i ? 24 : 8,
                    height: 8,
                    background: activeSlide === i ? '#fff' : 'rgba(255,255,255,0.45)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login form */}
        <div className="w-full lg:w-[45%] flex items-center justify-center p-8"
          style={{ background: 'var(--bg)' }}>

          {/* Subtle bg blob */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"
            style={{ background: 'var(--accent-tint)' }} />

          <div className="w-full max-w-sm relative z-10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Welcome Back 👋</h2>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Sign in to access your dashboard</p>
            </div>

            {/* Card */}
            <div className="rounded-2xl shadow-sm p-8"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--accent-tint)' }}>
                  <Lock size={15} style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Sign In</h3>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter email"
                  type="email"
                  required
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Password <span style={{ color: 'var(--error)' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      className="w-full h-10 px-3 pr-10 text-sm rounded-lg outline-none transition-colors"
                      style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-tint)' }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
                    />
                    <button type="button" onClick={() => setShowPwd(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      style={{ color: 'var(--text-secondary)' }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <Button type="submit" loading={loading} className="w-full mt-1" size="lg">
                  Sign In
                </Button>
              </form>

              {/* Demo credentials */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: 'var(--text-primary)' }}>Demo Credentials</p>
                <div className="space-y-2 text-xs">
                  {[
                    { role: 'Admin',    cred: 'admin@loanmanagement.com / admin123' },
                    { role: 'Employee', cred: 'employee@loanmanagement.com / admin123' },
                    { role: 'User',     cred: 'user@loanmanagement.com / admin123' },
                  ].map(c => (
                    <div key={c.role} className="flex items-center justify-between">
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{c.role}</span>
                      <span className="font-mono text-[11px] px-2.5 py-1 rounded-lg"
                        style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                        {c.cred}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
              Copyright © 2025 NEXZEN
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
