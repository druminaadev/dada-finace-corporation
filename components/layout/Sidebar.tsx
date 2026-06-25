'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, UserCircle, CreditCard,
  ChevronDown, ChevronLeft, ChevronRight, UserPlus, List, UserCheck, FilePlus,
  FileText, CheckSquare, CheckCircle, Banknote, X,
  Calendar, BarChart2, TrendingUp, AlertTriangle, Star, Clock, Wallet,
  ClipboardList, Activity, Calculator, Settings, HelpCircle, Building2
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
    label: 'Employees', icon: Users, color: 'var(--primary-light)',
    children: [
      { label: 'Add Employee', path: '/employees/add', icon: UserPlus },
      { label: 'Employee List', path: '/employees/list', icon: List },
    ],
  },
  {
    label: 'Customers', icon: UserCircle, color: 'var(--secondary)',
    children: [
      { label: 'Add Customer', path: '/customers/add', icon: UserPlus },
      { label: 'Customer List', path: '/customers/list', icon: UserCheck },
    ],
  },
  {
    label: 'Loans', icon: CreditCard, color: 'var(--primary)',
    children: [
      { label: 'Add Loan', path: '/loans/add', icon: FilePlus },
      { label: 'All Loans', path: '/loans/list', icon: FileText },
      { label: 'Approved', path: '/loans/approved', icon: CheckCircle },
      { label: 'Disbursed', path: '/loans/disbursed', icon: Banknote },
      { label: 'Pending Approval', path: '/loans/approval', icon: CheckSquare, badge: 'New' },
    ],
  },
  {
    label: 'EMI', icon: Calendar, color: 'var(--primary-light)',
    children: [
      { label: 'EMI Collection', path: '/emi/collection', icon: ClipboardList },
      { label: 'EMI Calendar', path: '/emi/calendar', icon: Calendar },
      { label: 'Upcoming EMI', path: '/emi/upcoming', icon: Clock },
      { label: 'Payment Methods', path: '/emi/payment-methods', icon: Wallet },
    ],
  },
  {
    label: 'Reports', icon: BarChart2, color: 'var(--secondary)',
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
    label: 'Tools', icon: Calculator, color: 'var(--primary)',
    children: [
      { label: 'EMI Calculator', path: '/tools/emi-calculator', icon: Calculator },
      { label: 'Civil Score', path: '/civil-score', icon: Star },
      { label: 'Expense Report', path: '/tools/expenses', icon: FileText },
    ],
  },
]

const BOTTOM_NAV = [
  { label: 'Settings', path: '/settings', icon: Settings, color: 'var(--primary)' },
  { label: 'Help & Support', path: '/help', icon: HelpCircle, color: 'var(--primary-light)' },
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
  const [expanded, setExpanded] = useState<string[]>(() =>
    NAV.filter(g => g.children.some(c => pathname === c.path || pathname.startsWith(c.path + '/'))).map(g => g.label)
  )

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
          className="flex items-center shrink-0 h-16 px-4"
          style={{
            borderBottom: `1px solid ${COLORS.borderPrimary}`,
            background: COLORS.bgPrimary,
          }}
        >
          {collapsed ? (
            <div className="flex items-center justify-center w-full">
              <BrandLogo />
            </div>
          ) : (
            <div className="flex items-center w-full gap-3">
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
              {onClose && (
                <button
                  onClick={onClose}
                  className="lg:hidden p-1.5 rounded-lg cursor-pointer transition-colors shrink-0"
                  style={{ color: COLORS.gray }}
                  onMouseEnter={e => (e.currentTarget.style.background = COLORS.bgSecondary)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="hidden lg:flex absolute -right-4 top-[52px] w-8 h-8 rounded-full items-center justify-center transition-all duration-200 z-50 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, var(--primary-dark), var(--primary))',
            border: '2.5px solid var(--surface)',
            boxShadow: '0 0 0 1px var(--primary), 0 4px 12px rgba(67,118,108,0.35)',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary), var(--primary-light))')}
          onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-dark), var(--primary))')}
        >
          {collapsed
            ? <ChevronRight size={15} color="#FFFFFF" strokeWidth={3} />
            : <ChevronLeft  size={15} color="#FFFFFF" strokeWidth={3} />}
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
              iconColor="var(--primary)"
              label="Dashboard"
              collapsed={collapsed}
              onClick={onClose}
              isTopLevel
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
  isTopLevel?: boolean
}

function NavItem({ href, active, icon: Icon, iconColor, label, badge, collapsed, onClick, isTopLevel }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "relative flex items-center rounded-lg transition-all duration-150 group/item",
        collapsed ? "justify-center w-full p-2.5" : "gap-2.5 px-2.5 py-2"
      ].join(" ")}
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

      {isTopLevel && !collapsed ? (
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
          style={{ background: active ? `${iconColor}18` : `${iconColor}0c` }}
        >
          <Icon size={13} style={{ color: active ? COLORS.primary : iconColor }} />
        </div>
      ) : (
        <Icon
          size={collapsed ? 17 : 14}
          style={{
            color: active ? COLORS.primary : iconColor,
            opacity: active ? 1 : 0.65,
            flexShrink: 0,
            transition: 'color 0.15s',
          }}
        />
      )}

      {!collapsed && (
        <>
          <span
            className={[
              "flex-1 text-left truncate",
              isTopLevel ? "text-xs font-semibold uppercase tracking-wider" : "text-sm leading-none"
            ].join(" ")}
            style={{ color: active ? COLORS.dark : COLORS.gray }}
          >
            {label}
          </span>

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
