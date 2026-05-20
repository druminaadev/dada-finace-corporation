'use client'

import { useRouter } from 'next/navigation'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle,
  Clock,
  CreditCard,
  IndianRupee,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { format, parseISO, startOfMonth } from 'date-fns'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Badge } from '@/components/ui/Badge'
import { GradientButton } from '@/components/ui/GradientButton'
import { NeumorphicCard } from '@/components/ui/NeumorphicCard'
import { useStore } from '@/store/appStore'
import { COLORS, statusColors } from '@/lib/colors'

type IconType = typeof CreditCard

export default function Dashboard() {
  const { loans, customers, employees } = useStore()
  const router = useRouter()

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const pendingLoans = loans.filter(l => l.status === 'pending')
  const approvedLoans = loans.filter(l => l.status === 'approved')
  const disbursedLoans = loans.filter(l => l.status === 'disbursed')

  const totalDisbursed = disbursedLoans.reduce((s, l) => s + l.amount, 0)
  const totalPending = pendingLoans.reduce((s, l) => s + l.amount, 0)
  const totalApproved = approvedLoans.reduce((s, l) => s + l.amount, 0)
  const totalPortfolio = loans.reduce((s, l) => s + l.amount, 0)
  const activeLoans = approvedLoans.length + disbursedLoans.length
  const avgLoanAmount = loans.length > 0 ? totalPortfolio / loans.length : 0
  const approvalRate = loans.length > 0 ? Math.round((activeLoans / loans.length) * 100) : 0

  const thisMonthLoans = loans.filter(l => {
    const loanMonth = format(parseISO(l.loanDate), 'MMM yy')
    return loanMonth === format(new Date(), 'MMM yy')
  }).length

  const lastMonthLoans = loans.filter(l => {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    return format(parseISO(l.loanDate), 'MMM yy') === format(lastMonth, 'MMM yy')
  }).length

  const loanGrowth = lastMonthLoans > 0 ? ((thisMonthLoans - lastMonthLoans) / lastMonthLoans) * 100 : thisMonthLoans > 0 ? 100 : 0
  const isGrowthPositive = loanGrowth >= 0

  const monthlyMap: Record<string, { month: string; loans: number; amount: number }> = {}
  loans.forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, loans: 0, amount: 0 }
    monthlyMap[key].loans += 1
    monthlyMap[key].amount += l.amount
  })
  const trendData = Object.values(monthlyMap).slice(-6)

  const donutData = [
    { name: 'Pending', value: pendingLoans.length, color: statusColors.pending },
    { name: 'Approved', value: approvedLoans.length, color: statusColors.approved },
    { name: 'Disbursed', value: disbursedLoans.length, color: statusColors.disbursed },
  ].filter(d => d.value > 0)

  const disbursedMap: Record<string, number> = {}
  disbursedLoans.forEach(l => {
    const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
    disbursedMap[key] = (disbursedMap[key] ?? 0) + l.amount
  })
  const barData = Object.entries(disbursedMap).map(([month, amount]) => ({ month, amount })).slice(-6)



  const recentLoans = [...loans].sort((a, b) => b.id - a.id).slice(0, 6)

  const tooltipStyle = {
    contentStyle: {
      background: COLORS.white,
      border: `1px solid ${COLORS.lightGray}`,
      borderRadius: '14px',
      color: COLORS.dark,
      fontSize: '12px',
      boxShadow: COLORS.shadowCard,
    },
    labelStyle: { color: COLORS.darkSecondary, fontWeight: 700 },
  }

  const kpis: Array<{
    label: string
    value: string | number
    hint: string
    icon: IconType
    color: string
    bg: string
  }> = [
    {
      label: 'Total Loans',
      value: loans.length,
      hint: `${thisMonthLoans} opened this month`,
      icon: CreditCard,
      color: COLORS.primary,
      bg: COLORS.primaryAlpha12,
    },
    {
      label: 'Customers',
      value: customers.length,
      hint: 'Registered borrowers',
      icon: Users,
      color: COLORS.teal,
      bg: COLORS.primaryAlpha12,
    },
    {
      label: 'Avg Ticket',
      value: formatINR(avgLoanAmount),
      hint: 'Across all applications',
      icon: Wallet,
      color: COLORS.purple,
      bg: COLORS.primaryAlpha12,
    },
    {
      label: 'Approval Rate',
      value: `${approvalRate}%`,
      hint: 'Approved + disbursed',
      icon: Target,
      color: COLORS.green,
      bg: COLORS.primaryAlpha12,
    },
  ]

  const pipeline = [
    { label: 'Pending', count: pendingLoans.length, amount: totalPending, icon: Clock, color: statusColors.pending },
    { label: 'Approved', count: approvedLoans.length, amount: totalApproved, icon: CheckCircle, color: statusColors.approved },
    { label: 'Disbursed', count: disbursedLoans.length, amount: totalDisbursed, icon: Banknote, color: statusColors.disbursed },
  ]

  return (
    <div className="min-h-screen space-y-5 p-4 sm:p-6">
      <section className="relative overflow-hidden rounded-3xl border border-[#D552A3]/20 bg-white p-5 text-[#1E293B] shadow-[0_24px_70px_rgba(70,44,125,0.16)] sm:p-7">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(70,44,125,0.25),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(131,28,145,0.18),transparent_30%),linear-gradient(135deg,#FFFFFF_0%,#FFF5F8_56%,#F5E6F0_100%)]" />
        <div className="absolute right-8 top-8 hidden h-32 w-32 rounded-full border border-[#D552A3]/30 sm:block" />
        <div className="absolute bottom-0 right-0 h-28 w-64 rounded-tl-full bg-[#D552A3]/20" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D552A3]/30 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#462C7D] shadow-sm backdrop-blur">
              <Sparkles size={14} />
              Finance command center
            </div>
            <div>
              <h1 className="max-w-3xl text-3xl font-black leading-tight sm:text-5xl">Good Morning, John!</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B] sm:text-base">
                Track disbursements, approvals, collections, and customer momentum from one polished workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <GradientButton size="md" onClick={() => router.push('/loans/apply')}>
                <Plus size={16} /> New Loan Application
              </GradientButton>
              <GradientButton size="md" variant="outline" onClick={() => router.push('/customers/add')}>
                <Users size={16} /> Add Customer
              </GradientButton>
            </div>
          </div>

          <div className="rounded-2xl border border-[#D552A3]/30 bg-white/80 p-5 shadow-[0_18px_45px_rgba(70,44,125,0.16)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#462C7D]">Disbursed Portfolio</p>
                <h2 className="mt-3 text-3xl font-black sm:text-4xl">{formatINR(totalDisbursed)}</h2>
                <p className="mt-2 text-sm text-[#64748B]">From {disbursedLoans.length} completed loans</p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F8] text-[#462C7D]">
                <IndianRupee size={24} />
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#D552A3]/20 bg-[#FFF5F8] p-3">
                <p className="text-xs text-[#64748B]">Monthly Growth</p>
                <div className="mt-2 flex items-center gap-1 text-lg font-black">
                  {isGrowthPositive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  {Math.abs(loanGrowth).toFixed(1)}%
                </div>
              </div>
              <div className="rounded-2xl border border-[#D552A3]/20 bg-[#FFF5F8] p-3">
                <p className="text-xs text-[#64748B]">Portfolio Value</p>
                <p className="mt-2 text-lg font-black">{formatINR(totalPortfolio)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(item => {
          const Icon = item.icon
          return (
            <NeumorphicCard key={item.label} className="group overflow-hidden p-5 hover:-translate-y-1 hover:shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-gray-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-black leading-none text-[#1A1A1A] dark:text-white">{item.value}</p>
                  <p className="mt-2 text-xs text-[#64748B] dark:text-gray-400">{item.hint}</p>
                </div>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110" style={{ background: item.bg, color: item.color }}>
                  <Icon size={23} />
                </span>
              </div>
            </NeumorphicCard>
          )
        })}
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <NeumorphicCard className="xl:col-span-8">
          <PanelHeader
            icon={<Activity size={18} />}
            title="Loan Momentum"
            subtitle="Applications and amount movement over the last 6 months"
          />
          <ResponsiveContainer width="100%" height={285}>
            <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="loanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#462C7D" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#462C7D" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Loans']} />
              <Area
                type="monotone"
                dataKey="loans"
                stroke="#462C7D"
                strokeWidth={3}
                fill="url(#loanGrad)"
                dot={{ fill: '#462C7D', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </NeumorphicCard>

        <div className="grid gap-4 xl:col-span-4">
          {pipeline.map(item => {
            const Icon = item.icon
            return (
              <NeumorphicCard key={item.label} className="p-5 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `${item.color}1F`, color: item.color }}>
                      <Icon size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-[#1A1A1A] dark:text-white">{item.label}</p>
                      <p className="text-xs text-[#64748B] dark:text-gray-400">{item.count} loans</p>
                    </div>
                  </div>
                  <p className="text-right text-lg font-black text-[#1A1A1A] dark:text-white">{formatINR(item.amount)}</p>
                </div>
              </NeumorphicCard>
            )
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-1">
        <NeumorphicCard className="bg-[#FEFEFF] p-5 shadow-[0_18px_45px_rgba(70,44,125,0.10)]">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-base font-black text-[#1A1A1A] dark:text-white">Monthly Disbursement</h2>
              <p className="mt-5 text-xs font-semibold text-[#94A3B8]">Total amount disbursed</p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-black leading-none text-[#1A1A1A] dark:text-white">{formatINR(totalDisbursed)}</span>
                <span className="pb-0.5 text-sm font-semibold text-[#94A3B8]">/ {formatINR(totalPortfolio || totalDisbursed)}</span>
              </div>
            </div>
            <div className="flex w-fit rounded-full bg-[#F1F5F9] p-1 text-xs font-bold text-[#94A3B8]">
              <button type="button" className="rounded-full px-4 py-2 transition-colors hover:text-[#462C7D]">Weekly</button>
              <button type="button" className="rounded-full bg-white px-4 py-2 text-[#1A1A1A] shadow-[0_3px_10px_rgba(0,0,0,0.10)]">Monthly</button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-4 pl-1 text-[11px] font-semibold text-[#64748B]">
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#462C7D]" />
              Disbursed
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D552A3]" />
              Monthly capacity
            </span>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={barData} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barSize={34}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D552A3" stopOpacity={1} />
                  <stop offset="52%" stopColor="#831C91" stopOpacity={0.96} />
                  <stop offset="100%" stopColor="#462C7D" stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0E6ED" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `${Number(v) / 1000}k`} />
              <Tooltip {...tooltipStyle} formatter={(v) => [formatINR(Number(v)), 'Disbursed']} />
              <Bar
                dataKey="amount"
                fill="url(#barGrad)"
                radius={[14, 14, 5, 5]}
                background={{ fill: '#FFF5F8', radius: 14 }}
              />
            </BarChart>
          </ResponsiveContainer>
        </NeumorphicCard>
      </section>

      <NeumorphicCard className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <PanelHeader icon={<Clock size={18} />} title="Recent Loans" subtitle={`Latest ${recentLoans.length} loan applications`} compact />
          <GradientButton size="sm" variant="outline" onClick={() => router.push('/loans/list')}>
            View All <ArrowUpRight size={14} />
          </GradientButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="bg-[#FAFAFA] dark:bg-[var(--card)]">
                {['Loan ID', 'Customer', 'Employee', 'Amount', 'Installments', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-[#64748B] dark:text-gray-400">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map(loan => {
                const customer = customers.find(c => c.id === loan.customerId)
                const employee = employees.find(e => e.id === loan.employeeId)
                return (
                  <tr key={loan.id} className="border-t border-gray-100 transition-colors hover:bg-[#FFF5F8]/70 dark:border-gray-800 dark:hover:bg-[#462C7D]/10">
                    <td className="px-4 py-3 font-bold text-[#462C7D]">{loan.loanNo}</td>
                    <td className="px-4 py-3 font-semibold text-[#1A1A1A] dark:text-white">{customer?.name ?? '-'}</td>
                    <td className="px-4 py-3 text-[#64748B] dark:text-gray-400">{employee?.name ?? '-'}</td>
                    <td className="px-4 py-3 font-bold text-[#1A1A1A] dark:text-white">{formatINR(loan.amount)}</td>
                    <td className="px-4 py-3 text-[#64748B] dark:text-gray-400">{loan.installments}</td>
                    <td className="px-4 py-3"><Badge status={loan.status} /></td>
                    <td className="px-4 py-3 text-xs font-medium text-[#64748B] dark:text-gray-400">{format(parseISO(loan.loanDate), 'dd/MM/yyyy')}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </NeumorphicCard>
    </div>
  )
}

function PanelHeader({
  icon,
  title,
  subtitle,
  compact = false,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-3 ${compact ? '' : 'mb-5'}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF5F8] text-[#462C7D] dark:bg-[#462C7D]/30">
        {icon}
      </span>
      <div>
        <h2 className="text-base font-black text-[#1A1A1A] dark:text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-[#64748B] dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-semibold text-[#64748B] dark:border-[var(--border)] dark:bg-[var(--card)] dark:text-[var(--text-secondary)]">
      {label}
    </div>
  )
}
