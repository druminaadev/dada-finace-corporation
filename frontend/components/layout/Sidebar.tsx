'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, UserCircle, CreditCard,
  ChevronDown, UserPlus, List, UserCheck, FilePlus, 
  FileText, CheckSquare, CheckCircle, Banknote, X, 
  Calendar, BarChart2, TrendingUp, AlertTriangle, Star, Clock, Wallet,
  ClipboardList, Activity, PanelLeftClose, PanelLeftOpen,
  Calculator, Settings, HelpCircle, Building2
} from 'lucide-react'
import { COLORS, GRADIENTS } from '@/lib/colors'

interface NavChild { label: string; path: string; icon: React.ElementType; badge?: string }
interface NavGroup {
  label: string
  icon: React.ElementType
  color: string
  children: NavChild[]
}

const NAV: NavGroup[] = [
  {
    label: 'Employees', icon: Users, color: '#831C91',
    children: [
      { label: 'Add Employee', path: '/employees/add', icon: UserPlus },
      { label: 'Employee List', path: '/employees/list', icon: List },
    ],
  },
  {
    label: 'Customers', icon: UserCircle, color: '#D552A3',
    children: [
      { label: 'Add Customer', path: '/customers/add', icon: UserPlus },
      { label: 'Customer List', path: '/customers/list', icon: UserCheck },
    ],
  },
  {
    label: 'Loans', icon: CreditCard, color: '#462C7D',
    children: [
      { label: 'Add Loan', path: '/loans/add', icon: FilePlus },
      { label: 'All Loans', path: '/loans/list', icon: FileText },
      { label: 'Approved', path: '/loans/approved', icon: CheckCircle },
      { label: 'Disbursed', path: '/loans/disbursed', icon: Banknote },
      { label: 'Pending Approval', path: '/loans/approval', icon: CheckSquare, badge: 'New' },
    ],
  },
  {
    label: 'EMI', icon: Calendar, color: '#831C91',
    children: [
      { label: 'EMI Collection', path: '/emi/collection', icon: ClipboardList },
      { label: 'EMI Calendar', path: '/emi/calendar', icon: Calendar },
      { label: 'Upcoming EMI', path: '/emi/upcoming', icon: Clock },
      { label: 'Payment Methods', path: '/emi/payment-methods', icon: Wallet },
    ],
  },
  {
    label: 'Reports', icon: BarChart2, color: '#D552A3',
    children: [
      { label: 'Daily Collection', path: '/reports/daily-collection', icon: Activity },
      { label: 'Transaction History', path: '/reports/transaction-history', icon: FileText },
      { label: 'Loan Portfolio', path: '/reports/portfolio', icon: ClipboardList },
      { label: 'Branch Performance', path: '/reports/branch-performance', icon: Building2 },
      { label: 'Employee Performance', path: '/reports/employee-performance', icon: Users },
      { label: 'Outstanding Dues', path: '/reports/outstanding', icon: AlertTriangle },
      { label: 'Business Trend', path: '/reports/business-trend', icon: TrendingUp },
    ],
  },
  {
    label: 'Tools', icon: Calculator, color: '#462C7D',
    children: [
      { label: 'EMI Calculator', path: '/tools/emi-calculator', icon: Calculator },
      { label: 'Civil Score', path: '/civil-score', icon: Star },
    ],
  },
]

const BOTTOM_NAV = [
  { label: 'Settings', path: '/settings', icon: Settings, color: '#462C7D' },
  { label: 'Help & Support', path: '/help', icon: HelpCircle, color: '#831C91' },
]

function BrandLogo() {
  return (
    <div className="w-11 h-11 flex items-center justify-center shrink-0 overflow-hidden">
      <Image
        src="/nexzen-icon.png"
        alt="NEXZEN"
        width={44}
        height={44}
        className="h-11 w-11 object-contain"
        priority
      />
    </div>
  )
}

interface SidebarProps {
  open: boolean
  onClose?: () => void
  collapsed: boolean
  onToggleCollapse: () => void
}

export function Sidebar({ open, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState<string[]>(['Loans', 'EMI'])

  const toggle = (label: string) =>
    setExpanded(p => p.includes(label) ? p.filter(x => x !== label) : [...p, label])

  const isGroupActive = (group: NavGroup) =>
    group.children.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))

  const isDashboard = pathname === '/'

  return (
    <>
      {open && onClose && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'fixed lg:static inset-y-0 left-0 z-40 flex flex-col',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'w-[68px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        style={{
          background: GRADIENTS.sidebar,
          borderRight: `1px solid ${COLORS.borderPrimary}`,
          boxShadow: COLORS.shadowSecondary,
        }}
      >
        <div
          className="flex items-center justify-between shrink-0 h-16"
          style={{ 
            borderBottom: `1px solid ${COLORS.borderPrimary}`,
            background: COLORS.bgPrimary,
            paddingLeft: collapsed ? '12px' : '16px',
            paddingRight: collapsed ? '12px' : '16px',
          }}
        >
          {collapsed ? (
            <div className="flex items-center justify-center w-full">
              <BrandLogo />
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <BrandLogo />

                <div className="min-w-0 flex-1">
                  <div
                    className="text-sm font-bold leading-tight truncate"
                    style={{ 
                      background: GRADIENTS.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    NEXZEN
                  </div>
                  <div
                    className="text-[10px] font-medium mt-0.5 truncate"
                    style={{ color: COLORS.primary }}
                  >
                    Loan Management
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onClose && (
                  <button
                    onClick={onClose}
                    className="lg:hidden p-1.5 rounded-lg cursor-pointer transition-colors"
                    style={{ color: COLORS.gray }}
                    onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex absolute -right-3.5 top-12 w-7 h-7 border-2 border-white dark:border-slate-800 rounded-full items-center justify-center text-white transition-all z-50 shadow-lg hover:shadow-xl hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #462C7D, #831C91)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #831C91, #D552A3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, #462C7D, #831C91)')}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>

        <nav
          className="flex-1 overflow-y-auto py-3"
          style={{ scrollbarWidth: 'none' }}
        >
          <div className={collapsed ? 'px-2 mb-1' : 'px-3 mb-1'}>
            <NavItem
              href="/"
              active={isDashboard}
              icon={LayoutDashboard}
              iconColor="#462C7D"
              label="Dashboard"
              collapsed={collapsed}
              onClick={onClose}
            />
          </div>

          {NAV.map((group) => {
            const groupActive = isGroupActive(group)
            const isOpen = expanded.includes(group.label)

            return (
              <div key={group.label} className={collapsed ? 'px-2 mb-1' : 'px-3 mb-1'}>
                {collapsed ? (
                  <div className="relative group/tip">
                    <button
                      className="w-full flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background: groupActive ? COLORS.primaryAlpha12 : 'transparent',
                        color: groupActive ? COLORS.primary : COLORS.gray,
                      }}
                      onMouseEnter={e => { if (!groupActive) e.currentTarget.style.background = COLORS.bgSecondary }}
                      onMouseLeave={e => { if (!groupActive) e.currentTarget.style.background = 'transparent' }}
                      onClick={() => {
                        onToggleCollapse()
                        setExpanded(p => p.includes(group.label) ? p : [...p, group.label])
                      }}
                    >
                      <group.icon size={17} style={{ color: groupActive ? COLORS.primary : group.color, opacity: groupActive ? 1 : 0.7 }} />
                    </button>
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg"
                      style={{ background: COLORS.dark, color: COLORS.white }}
                    >
                      {group.label}
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => toggle(group.label)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors group/header"
                      style={{
                        background: groupActive && !isOpen ? COLORS.primaryAlpha12 : 'transparent',
                      }}
                      onMouseEnter={e => { if (!(groupActive && !isOpen)) e.currentTarget.style.background = COLORS.bgSecondary }}
                      onMouseLeave={e => { if (!(groupActive && !isOpen)) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: `${group.color}18` }}
                      >
                        <group.icon size={13} style={{ color: group.color }} />
                      </div>

                      <span
                        className="flex-1 text-left text-xs font-semibold uppercase tracking-wider truncate"
                        style={{ color: groupActive ? COLORS.dark : COLORS.gray }}
                      >
                        {group.label}
                      </span>

                      <ChevronDown
                        size={13}
                        style={{
                          color: COLORS.gray,
                          transition: 'transform 0.2s',
                          transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                          flexShrink: 0,
                        }}
                      />
                    </button>

                    <div
                      className="overflow-hidden transition-all duration-200 ease-in-out"
                      style={{ maxHeight: isOpen ? '600px' : '0', opacity: isOpen ? 1 : 0 }}
                    >
                      <div className="mt-0.5 ml-3 pl-3 space-y-0.5" style={{ borderLeft: `1px solid ${COLORS.borderLight}` }}>
                        {group.children.map(child => {
                          const childActive = pathname === child.path || pathname.startsWith(child.path + '/')
                          return (
                            <NavItem
                              key={child.path}
                              href={child.path}
                              active={childActive}
                              icon={child.icon}
                              iconColor={group.color}
                              label={child.label}
                              badge={child.badge}
                              collapsed={false}
                              onClick={onClose}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </nav>

        <div
          className="px-3 py-3 shrink-0 space-y-1"
          style={{ borderTop: `1px solid ${COLORS.borderLight}` }}
        >
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

            if (collapsed) {
              return (
                <div key={item.path} className="relative group/bottom">
                  <Link
                    href={item.path}
                    onClick={onClose}
                    className="w-full flex items-center justify-center p-2.5 rounded-lg cursor-pointer transition-colors"
                    style={{
                      background: isActive ? COLORS.primaryAlpha12 : 'transparent',
                      color: isActive ? COLORS.primary : COLORS.gray,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.bgSecondary }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icon size={17} style={{ color: isActive ? COLORS.primary : item.color, opacity: isActive ? 1 : 0.7 }} />
                  </Link>
                  <div
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/bottom:opacity-100 transition-opacity z-50 shadow-lg"
                    style={{ background: COLORS.dark, color: COLORS.white }}
                  >
                    {item.label}
                  </div>
                </div>
              )
            }

            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                style={{
                  background: isActive ? COLORS.primaryAlpha12 : 'transparent',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = COLORS.bgSecondary }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: isActive ? `${item.color}18` : COLORS.bgSecondary }}
                >
                  <Icon size={15} style={{ color: isActive ? item.color : COLORS.gray }} />
                </div>
                <span
                  className="flex-1 text-left text-sm font-medium"
                  style={{ color: isActive ? COLORS.dark : COLORS.gray }}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: COLORS.primary }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </aside>
    </>
  )
}

interface NavItemProps {
  href: string
  active: boolean
  icon: React.ElementType
  iconColor: string
  label: string
  badge?: string
  collapsed: boolean
  onClick?: () => void
}

function NavItem({ href, active, icon: Icon, iconColor, label, badge, collapsed, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150 group/item"
      style={{
        color: active ? COLORS.dark : COLORS.gray,
        background: active ? COLORS.primaryAlpha12 : 'transparent',
        fontWeight: active ? 600 : 400,
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = COLORS.bgSecondary }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      title={collapsed ? label : undefined}
    >
      {active && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: COLORS.primary }}
        />
      )}

      <Icon
        size={14}
        style={{
          color: active ? COLORS.primary : iconColor,
          opacity: active ? 1 : 0.65,
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
      />

      {!collapsed && (
        <>
          <span className="flex-1 text-sm leading-none truncate">{label}</span>

          {badge && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
              style={{ background: '#EF444420', color: '#EF4444' }}
            >
              {badge}
            </span>
          )}

          {active && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: COLORS.primary }}
            />
          )}
        </>
      )}

      {collapsed && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover/item:opacity-100 transition-opacity z-50 shadow-lg"
          style={{ background: COLORS.dark, color: COLORS.white }}
        >
          {label}
        </div>
      )}
    </Link>
  )
}
