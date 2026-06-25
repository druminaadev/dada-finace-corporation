'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { GitBranch, TrendingUp, Wallet, AlertTriangle, FileText, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

export default function BranchPerformancePage() {
  const { branches, loans, customers, emis } = useStore()
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => branches.map(b => {
    const branchCustomerIds = customers.filter(c => c.branchId === b.id).map(c => c.id)
    const branchLoans = loans.filter(l => branchCustomerIds.includes(l.customerId))
    const disbursed = branchLoans.filter(l => l.status === 'disbursed').reduce((s, l) => s + l.amount, 0)
    const branchLoanIds = branchLoans.map(l => l.id)
    const collected = emis.filter(e => branchLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdue = emis.filter(e => branchLoanIds.includes(e.loanId) && e.status === 'overdue').length
    const collectionRate = disbursed > 0 ? Math.min(100, Math.round((collected / disbursed) * 100)) : 0
    return { name: b.name.replace(' Branch', '').replace(' Main', ''), fullName: b.name, disbursed, collected, overdue, loans: branchLoans.length, collectionRate }
  }), [branches, loans, customers, emis])

  const totalDisbursed = data.reduce((s, d) => s + d.disbursed, 0)
  const totalCollected = data.reduce((s, d) => s + d.collected, 0)
  const totalOverdue = data.reduce((s, d) => s + d.overdue, 0)
  const totalLoans = data.reduce((s, d) => s + d.loans, 0)

  const tooltipStyle = {
    contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)', fontSize: '12px' },
  }

  const summaryStats = [
    { label: 'Total Branches', value: branches.length, icon: GitBranch, color: 'var(--accent)', tint: 'var(--accent-tint)' },
    { label: 'Total Loans', value: totalLoans, icon: FileText, color: '#8B5CF6', tint: 'rgba(139,92,246,0.12)' },
    { label: 'Total Disbursed', value: fmt(totalDisbursed), icon: Wallet, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
    { label: 'Total Collected', value: fmt(totalCollected), icon: TrendingUp, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
    { label: 'Total Overdue EMIs', value: totalOverdue, icon: AlertTriangle, color: 'var(--error)', tint: 'rgba(239,68,68,0.12)' },
  ]

  const handleExport = (formatType: string) => {
    const dataToExport = data.map(b => ({
      'Branch Name': b.fullName,
      'Total Loans': b.loans,
      'Disbursed': b.disbursed,
      'Collected': b.collected,
      'Overdue EMIs': b.overdue,
      'Collection Rate (%)': `${b.collectionRate}%`
    }))
    if (formatType === 'csv') exportCSV(dataToExport, 'Branch_Performance')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Branch_Performance')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Branch Performance Report')
    else if (formatType === 'print') printTable(dataToExport, 'Branch Performance Report')
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
        title="Branch Performance Report"
        subtitle="Compare performance metrics across all branches"
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

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {summaryStats.map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex flex-col gap-3"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.tint }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {data.map(b => (
          <div key={b.name} className="rounded-2xl p-5"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-tint)' }}>
                <GitBranch size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{b.fullName}</div>
            </div>
            <div className="space-y-2.5 text-xs mb-4">
              {[
                { label: 'Total Loans', value: b.loans, color: 'var(--text-primary)' },
                { label: 'Disbursed', value: fmt(b.disbursed), color: '#F59E0B' },
                { label: 'Collected', value: fmt(b.collected), color: 'var(--success)' },
                { label: 'Overdue EMIs', value: b.overdue, color: b.overdue > 0 ? 'var(--error)' : 'var(--success)' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                  <span className="font-semibold" style={{ color: row.color }}>{row.value}</span>
                </div>
              ))}
            </div>
            {/* Collection Rate Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-secondary)' }}>Collection Rate</span>
                <span className="font-bold" style={{ color: 'var(--success)' }}>{b.collectionRate}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${b.collectionRate}%`, background: 'linear-gradient(90deg, var(--accent), var(--success))' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold mb-5" style={{ color: 'var(--text-primary)' }}>Disbursed vs Collected by Branch</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }} barSize={28} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={(v, name) => [fmt(Number(v)), name]} />
            <Legend wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '16px' }} />
            <Bar dataKey="disbursed" name="Disbursed" fill="#F59E0B" radius={[6, 6, 0, 0]} />
            <Bar dataKey="collected" name="Collected" fill="var(--success)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
