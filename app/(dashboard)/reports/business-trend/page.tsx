'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format, startOfMonth, parseISO } from 'date-fns'
import { TrendingUp, DollarSign, PiggyBank, BarChart2, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

export default function BusinessTrendPage() {
  const { loans, emis } = useStore()
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; disbursed: number; collected: number; interest: number; fileCharges: number }> = {}
    loans.forEach(l => {
      const key = format(startOfMonth(parseISO(l.loanDate)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].disbursed += l.amount
      map[key].interest += l.interestAmount
      map[key].fileCharges += l.fileCharges + l.otherCharges
    })
    emis.filter(e => e.paidDate).forEach(e => {
      const key = format(startOfMonth(parseISO(e.paidDate!)), 'MMM yy')
      if (!map[key]) map[key] = { month: key, disbursed: 0, collected: 0, interest: 0, fileCharges: 0 }
      map[key].collected += e.paidAmount ?? 0
    })
    return Object.values(map).slice(-12)
  }, [loans, emis])

  const totalInterest = loans.reduce((s, l) => s + l.interestAmount, 0)
  const totalCharges = loans.reduce((s, l) => s + l.fileCharges + l.otherCharges, 0)
  const totalCollected = emis.filter(e => e.status === 'paid' || e.status === 'paid_late').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const totalDisbursed = loans.reduce((s, l) => s + l.amount, 0)

  const stats = [
    { label: 'Total Disbursed', value: fmt(totalDisbursed), icon: DollarSign, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
    { label: 'Total EMI Collected', value: fmt(totalCollected), icon: TrendingUp, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
    { label: 'Interest Income', value: fmt(totalInterest), icon: PiggyBank, color: 'var(--accent)', tint: 'var(--accent-tint)' },
    { label: 'File & Other Charges', value: fmt(totalCharges), icon: BarChart2, color: '#8B5CF6', tint: 'rgba(139,92,246,0.12)' },
  ]

  const tooltipStyle = {
    contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px' },
  }

  const handleExport = (formatType: string) => {
    const dataToExport = [...monthlyData].reverse().map(row => ({
      'Month': row.month,
      'Disbursed': row.disbursed,
      'Collected': row.collected,
      'Interest': row.interest,
      'Charges': row.fileCharges
    }))
    if (formatType === 'csv') exportCSV(dataToExport, 'Business_Trend')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Business_Trend')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Business Trend Report')
    else if (formatType === 'print') printTable(dataToExport, 'Business Trend Report')
  }

  const exportItems = [
    { label: 'Export as CSV', value: 'csv', icon: FileSpreadsheet },
    { label: 'Export as Excel', value: 'excel', icon: FileSpreadsheet },
    { label: 'Export as PDF', value: 'pdf', icon: Download },
    { label: 'Print Report', value: 'print', icon: Printer, dividerBefore: true },
  ]

  return (
    <>
      <PageHeader
        title="Business Trend Report"
        subtitle="Monthly disbursement and collection trends over time"
        action={{
          label: '',
          onClick: () => {},
          icon: (
            <Dropdown
              trigger={<span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white"><Download size={14} />Export</span>}
              items={exportItems}
              onSelect={item => handleExport(String(item.value ?? ''))}
              align="right"
              width={200}
              variant="ghost"
            />
          ),
        }}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.tint }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Area Chart */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Monthly Disbursement vs Collection (Last 12 Months)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="disbGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="collGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v, name) => [fmt(Number(v)), name]} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '16px' }} />
            <Area type="monotone" dataKey="disbursed" name="Disbursed" stroke="#F59E0B" strokeWidth={2.5} fill="url(#disbGrad)" dot={false} />
            <Area type="monotone" dataKey="collected" name="Collected" stroke="#10B981" strokeWidth={2.5} fill="url(#collGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Monthly Breakdown</h3>
        </div>
        {/* Mobile cards */}
        <div className="block sm:hidden py-1">
          {[...monthlyData].reverse().map(row => (
            <div key={row.month} className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
              <div className="font-semibold text-[15px] mb-3" style={{ color: 'var(--text-primary)' }}>{row.month}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {([['Disbursed', fmt(row.disbursed), '#F59E0B'], ['Collected', fmt(row.collected), 'var(--success)'], ['Interest', fmt(row.interest), 'var(--accent)'], ['Charges', fmt(row.fileCharges), '#8B5CF6']] as [string, string, string][]).map(([label, value, color]) => (
                  <div key={label}>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}>
                {['Month', 'Disbursed', 'Collected', 'Interest', 'Charges'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...monthlyData].reverse().map((row, i) => (
                <tr key={row.month} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.month}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: '#F59E0B' }}>{fmt(row.disbursed)}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--success)' }}>{fmt(row.collected)}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--accent)' }}>{fmt(row.interest)}</td>
                  <td className="px-5 py-3.5 font-medium" style={{ color: '#8B5CF6' }}>{fmt(row.fileCharges)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
