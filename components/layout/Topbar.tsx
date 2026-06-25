'use client'
import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, Bell, CheckCheck, Trash2, Sun, Moon, Search } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { COLORS, GRADIENTS } from '@/lib/colors'

const SEARCH_OPTIONS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Customers List', path: '/customers/list' },
  { label: 'Add Customer', path: '/customers/add' },
  { label: 'Loans List', path: '/loans/list' },
  { label: 'Add Loan', path: '/loans/add' },
  { label: 'Apply Loan', path: '/loans/apply' },
  { label: 'Loan Approval', path: '/loans/approval' },
  { label: 'Approved Loans', path: '/loans/approved' },
  { label: 'Disbursed Loans', path: '/loans/disbursed' },
  { label: 'Loan Documents', path: '/loans/documents' },
  { label: 'EMI Calculator', path: '/emi/calculator' },
  { label: 'EMI Calendar', path: '/emi/calendar' },
  { label: 'EMI Collection', path: '/emi/collection' },
  { label: 'Upcoming EMI', path: '/emi/upcoming' },
  { label: 'Payment Methods', path: '/emi/payment-methods' },
  { label: 'Employees List', path: '/employees/list' },
  { label: 'Add Employee', path: '/employees/add' },
  { label: 'Civil Score', path: '/civil-score' },
  { label: 'Reports - Portfolio', path: '/reports/portfolio' },
  { label: 'Reports - Outstanding', path: '/reports/outstanding' },
  { label: 'Reports - Daily Collection', path: '/reports/daily-collection' },
  { label: 'Reports - Business Trend', path: '/reports/business-trend' },
  { label: 'Reports - Branch Performance', path: '/reports/branch-performance' },
  { label: 'Reports - Employee Performance', path: '/reports/employee-performance' },
  { label: 'Reports - Transaction History', path: '/reports/transaction-history' },
  { label: 'Master - Loan Types', path: '/master/loan-types' },
  { label: 'Master - Banks', path: '/master/banks' },
  { label: 'Master - Branches', path: '/master/branches' },
  { label: 'Master - Areas', path: '/master/areas' },
  { label: 'Master - Cities', path: '/master/cities' },
  { label: 'Master - States', path: '/master/states' },
  { label: 'Settings', path: '/settings' },
  { label: 'Help', path: '/help' },
]

interface TopbarProps { onMenuToggle: () => void }

export function Topbar({ onMenuToggle }: TopbarProps) {
  const { user, logout } = useAuthStore()
  const { notifications, markAllRead, markOneRead, clearAll, showToast } = useUIStore()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  const filteredOptions = searchQuery.trim()
    ? SEARCH_OPTIONS.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : []

  const unread = notifications.filter(n => !n.read).length

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    showToast('Logged out successfully', 'info')
    router.push('/login')
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-4 lg:px-6 shrink-0 z-30 relative"
      style={{
        background: COLORS.white,
        borderBottom: `1px solid ${COLORS.borderLight}`,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg cursor-pointer lg:hidden transition-colors"
          style={{ color: COLORS.gray }}
          onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Menu size={20} />
        </button>

        {/* Search Bar */}
        <div className="hidden md:block relative" ref={searchRef} style={{ minWidth: '320px' }}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all">
            <Search size={16} style={{ color: COLORS.gray }} />
            <input
              type="text"
              placeholder="Search loans, customers..."
              className="flex-1 bg-transparent outline-none text-sm"
              style={{ color: COLORS.dark }}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true) }}
              onFocus={() => setSearchOpen(true)}
            />
          </div>
          {searchOpen && filteredOptions.length > 0 && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-[999]"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.borderLight}`, boxShadow: COLORS.shadowCard }}
            >
              {filteredOptions.map(opt => (
                <button
                  key={opt.path}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors"
                  style={{ color: COLORS.dark }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => { router.push(opt.path); setSearchQuery(''); setSearchOpen(false) }}
                >
                  <Search size={13} style={{ color: COLORS.gray }} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          title="Toggle theme"
          style={{ color: COLORS.gray }}
          onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(p => !p)}
            className="relative p-2 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
            style={{ color: COLORS.gray }}
            onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Bell size={18} />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                style={{ background: COLORS.secondary }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl z-[999]"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.borderLight}`, boxShadow: COLORS.shadowCard }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: COLORS.dark }}>Notifications</span>
                  {unread > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: COLORS.secondaryAlpha12, color: COLORS.secondary }}>
                      {unread} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button
                      onClick={() => {
                        markAllRead()
                        showToast('All marked as read', 'success')
                      }}
                      className="text-[11px] flex items-center gap-1 cursor-pointer font-semibold"
                      style={{ color: COLORS.primary }}
                    >
                      <CheckCheck size={12} /> Mark all
                    </button>
                  )}
                  <button
                    onClick={() => {
                      clearAll()
                      showToast('Notifications cleared', 'info')
                    }}
                    className="p-1 cursor-pointer rounded transition-colors"
                    style={{ color: COLORS.gray }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    title="Clear all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12" style={{ color: COLORS.gray }}>
                    <Bell size={32} className="mb-2 opacity-20" />
                    <span className="text-xs">No notifications</span>
                  </div>
                ) : (
                  notifications.map(n => (
                    <button
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      className="w-full text-left px-4 py-3 transition-colors flex items-start gap-3 border-b"
                      style={{
                        background: !n.read ? COLORS.primaryAlpha12 : 'transparent',
                        borderBottomColor: COLORS.borderLight,
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
                      onMouseLeave={e => (e.currentTarget.style.background = !n.read ? COLORS.primaryAlpha12 : 'transparent')}
                    >
                      <span
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: !n.read ? COLORS.primary : COLORS.lightGray }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate" style={{ color: !n.read ? COLORS.dark : COLORS.gray }}>
                          {n.title}
                        </div>
                        <div className="text-[11px] mt-0.5 leading-relaxed" style={{ color: COLORS.gray }}>
                          {n.message}
                        </div>
                      </div>
                      <span className="text-[10px] shrink-0 mt-0.5 whitespace-nowrap" style={{ color: COLORS.gray }}>
                        {n.time}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6" style={{ background: COLORS.borderLight }} />

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(p => !p)}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ background: profileOpen ? COLORS.bgSecondary : 'transparent' }}
            onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
            onMouseLeave={e => (e.currentTarget.style.background = profileOpen ? COLORS.bgSecondary : 'transparent')}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm"
              style={{ background: GRADIENTS.primary, color: COLORS.white }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold leading-tight" style={{ color: COLORS.dark }}>
                {user?.name || 'User'}
              </div>
              <div className="text-[10px] font-medium capitalize" style={{ color: COLORS.gray }}>
                {user?.role || 'Admin'}
              </div>
            </div>
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-xl z-[999] overflow-hidden"
              style={{ background: COLORS.white, border: `1px solid ${COLORS.borderLight}`, boxShadow: COLORS.shadowCard }}
            >
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
                <div className="text-sm font-bold" style={{ color: COLORS.dark }}>
                  {user?.name || 'User'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: COLORS.gray }}>
                  {user?.role || 'Admin'}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors"
                  style={{ color: '#EF4444' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <LogOut size={15} />
                  <span className="text-sm font-semibold">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
