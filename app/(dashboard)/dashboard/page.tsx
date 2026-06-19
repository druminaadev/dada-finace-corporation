'use client'

// ============================================================
// OLD DASHBOARD — preserved as comment below
// (previously showed Loan Momentum area chart, pipeline cards,
//  Monthly Disbursement bar chart, and Recent Loans table)
// ============================================================
/*
  OLD DASHBOARD CODE STARTS
  ... (see git history for full implementation)
  OLD DASHBOARD CODE ENDS
*/

import { useRouter } from 'next/navigation'
import {
  ArrowDownRight,
  ArrowUpRight,
  History,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ─── palette ─────────────────────────────────────────────────
const FG  = '#1A3C2E'  // Deep Forest Green
const MG  = '#4CAF7D'  // Mint / Sage Green
const AMB = '#F59E0B'  // Amber
const COR = '#EF4444'  // Coral / Red
const GRY = '#94A3B8'  // Gray

// ─── helpers ─────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const DeltaBadge = ({ n, positive }: { n: number; positive: boolean }) => (
  <span
    className="inline-flex items-center gap-0.5 text-sm font-bold"
    style={{ color: positive ? '#22c55e' : COR }}
  >
    {n > 0 ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
    {Math.abs(n)}%
  </span>
)

// ─── data ────────────────────────────────────────────────────
const MONTHLY_BARS = [
  { month: 'Jan', upcoming: 420, collected: 390 },
  { month: 'Feb', upcoming: 380, collected: 340 },
  { month: 'Mar', upcoming: 460, collected: 430 },
  { month: 'Apr', upcoming: 500, collected: 470 },
  { month: 'May', upcoming: 530, collected: 490 },
  { month: 'Jun', upcoming: 490, collected: 460 },
  { month: 'Jul', upcoming: 560, collected: 520 },
  { month: 'Aug', upcoming: 610, collected: 570 },
  { month: 'Sep', upcoming: 580, collected: 550 },
  { month: 'Oct', upcoming: 640, collected: 600 },
  { month: 'Nov', upcoming: 670, collected: 630 },
  { month: 'Dec', upcoming: 720, collected: 680 },
]

const LOAN_TARGETS = [
  { name: 'Loan Account A', current: 820000,  target: 1000000 },
  { name: 'Loan Account B', current: 560000,  target: 800000  },
  { name: 'Loan Account C', current: 310000,  target: 600000  },
]

const DONUT_DATA = [
  { name: 'On Time',            value: 60, color: FG  },
  { name: 'Overdue 1-30 Days',  value: 20, color: MG  },
  { name: 'Overdue 30-60 Days', value: 12, color: AMB },
  { name: 'Overdue 60+ Days',   value:  5, color: COR },
  { name: 'Partially Paid',     value:  3, color: GRY },
]

const PORTFOLIOS = [
  { label: 'Portfolio A', amount: 1420000, weight: 38 },
  { label: 'Portfolio B', amount:  980000, weight: 26 },
  { label: 'Portfolio C', amount:  720000, weight: 19 },
  { label: 'Portfolio D', amount:  640000, weight: 17 },
]

const REPAYMENTS = [
  { id: 'C-1042', ref: 'LN-20481', datetime: '12 Jun, 02:14 PM', amount: 4200,  mode: 'UPI',          status: 'Success' },
  { id: 'C-2031', ref: 'LN-20399', datetime: '12 Jun, 11:30 AM', amount: 8750,  mode: 'Bank Transfer', status: 'Pending' },
  { id: 'C-3318', ref: 'LN-19874', datetime: '11 Jun, 09:45 AM', amount: 3100,  mode: 'Cash',          status: 'Success' },
  { id: 'C-1198', ref: 'LN-18540', datetime: '10 Jun, 05:00 PM', amount: 12500, mode: 'Cheque',        status: 'Pending' },
  { id: 'C-4402', ref: 'LN-17233', datetime: '09 Jun, 03:20 PM', amount: 6800,  mode: 'UPI',           status: 'Success' },
]

const ACTIVITY = [
  { initials: 'OA', name: 'Officer A reviewed Loan App',    time: 'Yesterday, 04:30 PM' },
  { initials: 'OB', name: 'Officer B approved Loan #20481', time: 'Yesterday, 02:15 PM' },
  { initials: 'OC', name: 'Officer C disbursed $8,750',     time: '2 days ago, 10:00 AM' },
  { initials: 'OD', name: 'Officer D flagged Loan #19874',  time: '3 days ago, 09:30 AM' },
]

// ─── Card wrapper ─────────────────────────────────────────────
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card rounded-2xl ${className}`}>
      {children}
    </div>
  )
}

// ─── page ─────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-transparent">
      {/* ── 2-column root grid ── */}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">

        {/* ════════════════════════════════════════
            LEFT COLUMN
        ════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">

          {/* General Overview — premium credit-card */}
          <div
            className="relative overflow-hidden rounded-2xl p-6 text-white"
            style={{
              background: `linear-gradient(135deg, ${FG} 0%, #2D6A4F 55%, #40916C 100%)`,
              boxShadow: '0 12px 48px rgba(26,60,46,0.45), 0 4px 16px rgba(26,60,46,0.2), inset 0 1px 0 rgba(255,255,255,0.15)'
            }}
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -right-4 h-32 w-32 rounded-full bg-white/5" />
            <div className="absolute top-1/2 -left-6 h-24 w-24 rounded-full bg-white/5" />

            <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-green-200">
              General Overview
            </p>

            <div className="relative z-10 mt-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-300">
                Total Portfolio Value
              </p>
              <p className="text-3xl font-black">{fmt(5420000)}</p>
            </div>

            <div className="relative z-10 mt-5 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-300">
                Active Loan Portfolio
              </p>
              <p className="text-2xl font-bold">{fmt(2860000)}</p>
            </div>

            {/* action buttons */}
            <div className="relative z-10 mt-7 flex justify-between">
              {[
                { icon: <Plus size={18} />,      label: 'Top Up'   },
                { icon: <Send size={18} />,       label: 'Transfer' },
                { icon: <RefreshCw size={18} />,  label: 'Request'  },
                { icon: <History size={18} />,    label: 'History'  },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  type="button"
                  className="flex flex-col items-center gap-2"
                  onClick={() => label === 'History' && router.push('/loans/list')}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition hover:bg-white/30">
                    {icon}
                  </span>
                  <span className="text-xs font-semibold text-green-100">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Daily Disbursement Limit */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">Daily Disbursement Limit</p>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: 'rgba(76,175,125,0.12)', color: MG }}>Active</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>$12,500 / $100,000</span>
              <span className="font-black text-base" style={{ color: MG }}>12.5%</span>
            </div>
            <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full" style={{ background: 'rgba(76,175,125,0.12)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: '12.5%', background: `linear-gradient(90deg, ${MG}, #6DD5A0)` }} />
            </div>
            <p className="mt-2 text-xs text-slate-400">Daily limit resets at midnight</p>
          </Card>

          {/* Outstanding Loans Tracker */}
          <Card className="p-5">
            <p className="mb-4 text-sm font-bold text-slate-700">Outstanding Loans Tracker</p>
            <div className="space-y-5">
              {LOAN_TARGETS.map(({ name, current, target }) => {
                const progress = Math.round((current / target) * 100)
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">{name}</span>
                      <span className="text-xs font-semibold text-slate-400">{progress}%</span>
                    </div>
                    <div className="my-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(26,60,46,0.08)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${FG}, ${MG})` }} />
                    </div>
                    <div className="flex justify-between">
                      <p className="text-sm font-bold" style={{ color: FG }}>{fmt(current)}</p>
                      <p className="text-xs text-slate-400">of {fmt(target)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Recent Activity Feed */}
          <Card className="p-5">
            <p className="mb-4 text-sm font-bold text-slate-800">Recent Activity</p>
            <div className="space-y-3">
              {ACTIVITY.map(({ initials, name, time }) => (
                <div key={time} className="flex items-start gap-3 rounded-xl p-2 transition-colors hover:bg-white/40">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${FG}, ${MG})` }}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-slate-700">{name}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ════════════════════════════════════════
            RIGHT COLUMN (main content)
        ════════════════════════════════════════ */}
        <div className="flex flex-col gap-5">

          {/* Top 4 summary metric cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Total Loans Disbursed', value: 3840000, delta: 12.5, positive: true,  accent: FG  },
              { label: 'Total EMI Collected',   value: 1260000, delta: -3.1, positive: false, accent: MG  },
              { label: 'Total Outstanding Dues',value:  980000, delta: -8.6, positive: true,  accent: AMB },
              { label: 'Active Borrowers',       value:    1248, delta:  5.4, positive: true,  accent: FG,  isCount: true },
            ].map(({ label, value, delta, positive, accent, isCount }) => (
              <Card key={label} className="p-5">
                <div className="flex items-start justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  <span className="h-2 w-2 rounded-full mt-1 opacity-70" style={{ background: accent }} />
                </div>
                <p className="mt-3 text-2xl font-black text-slate-800">
                  {isCount ? value.toLocaleString() : fmt(value)}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <DeltaBadge n={delta} positive={positive} />
                  <span className="text-xs text-slate-400">vs last month</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Collection Trends — dual bar chart */}
          <Card className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-base font-black text-slate-800">Collection Trends</p>
                <p className="mt-0.5 text-sm text-slate-400">12-month EMI overview</p>
              </div>
              <select className="rounded-xl border border-slate-200 bg-white/60 backdrop-blur-sm px-3 py-2 text-sm font-semibold text-slate-600 shadow-sm outline-none cursor-pointer">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>

            <div className="mb-4 flex gap-5 text-sm font-semibold text-slate-500">
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: FG }} />
                Upcoming EMI
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: MG }} />
                Collected EMI
              </span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={MONTHLY_BARS} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} barSize={12} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 13 }}
                />
                <Bar dataKey="upcoming"  fill={FG} radius={[4, 4, 0, 0]} />
                <Bar dataKey="collected" fill={MG} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Repayments Table */}
          <Card className="overflow-hidden p-0">
            <div className="border-b border-white/40 px-6 py-5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <p className="text-base font-black text-slate-800">Recent Repayments</p>
              <span className="text-xs font-semibold text-slate-400">{REPAYMENTS.length} transactions</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.25)' }}>
                    {['Customer ID', 'Loan Ref No.', 'Date & Time', 'Amount', 'Payment Mode', 'Status'].map(h => (
                      <th
                        key={h}
                        className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wide text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {REPAYMENTS.map(r => (
                    <tr key={r.ref} className="border-t border-white/30 hover:bg-white/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{r.id}</td>
                      <td className="px-5 py-3.5 text-sm font-bold" style={{ color: FG }}>{r.ref}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{r.datetime}</td>
                      <td className="px-5 py-3.5 text-sm font-black text-slate-800">{fmt(r.amount)}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{r.mode}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                          style={
                            r.status === 'Success'
                              ? { background: 'rgba(34,197,94,0.12)', color: '#15803D', border: '1px solid rgba(34,197,94,0.2)' }
                              : { background: 'rgba(245,158,11,0.12)', color: '#B45309', border: '1px solid rgba(245,158,11,0.2)' }
                          }
                        >
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.status === 'Success' ? '#22c55e' : AMB }} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Bottom row — Donut + Portfolios side by side */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* EMI Repayment Status — Donut */}
            <Card className="p-6">
              <p className="text-base font-black text-slate-800">EMI Repayment Status</p>
              <p className="mt-0.5 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">Breakdown by repayment behaviour</p>

              <div className="relative">
                <ResponsiveContainer width="100%" height={190}>
                  <PieChart>
                    <Pie
                      data={DONUT_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={84}
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {DONUT_DATA.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, fontSize: 12 }}
                      formatter={(v) => [`${v}%`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xs font-semibold text-slate-400">Total EMI</p>
                  <p className="text-lg font-black text-slate-800">{fmt(2240000)}</p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                {DONUT_DATA.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                      {name}
                    </span>
                    <span className="font-bold text-slate-700">{value}%</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Loan Portfolios Ranking */}
            <Card className="p-6">
              <p className="mb-1 text-base font-black text-slate-800">Top Loan Portfolios</p>
              <p className="mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wide">By portfolio weight</p>
              <div className="space-y-4">
                {PORTFOLIOS.map(({ label, amount, weight }, i) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-semibold text-slate-700">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-black text-white" style={{ background: i === 0 ? FG : i === 1 ? MG : i === 2 ? AMB : GRY }}>{i + 1}</span>
                        {label}
                      </span>
                      <span className="font-black text-slate-600">{weight}%</span>
                    </div>
                    <div className="my-2 h-2 w-full overflow-hidden rounded-full" style={{ background: 'rgba(26,60,46,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${weight}%`, background: i === 0 ? `linear-gradient(90deg, ${FG}, ${MG})` : i === 1 ? `linear-gradient(90deg, ${MG}, #6DD5A0)` : i === 2 ? `linear-gradient(90deg, ${AMB}, #FBBF24)` : `linear-gradient(90deg, ${GRY}, #CBD5E1)` }}
                      />
                    </div>
                    <p className="text-sm font-bold" style={{ color: FG }}>{fmt(amount)}</p>
                  </div>
                ))}
              </div>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}
