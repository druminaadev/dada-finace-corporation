'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, parseISO } from 'date-fns'
import { AlertTriangle, Clock, DollarSign, Users, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

export default function OutstandingDuesPage() {
  const { emis, loans, customers } = useStore()
  const today = new Date().toISOString().split('T')[0]

  const overdueEmis = useMemo(() => emis.filter(e => e.status === 'overdue'), [emis])

  const grouped = useMemo(() => {
    const map: Record<number, { customer: typeof customers[0] | undefined; loan: typeof loans[0] | undefined; emis: typeof overdueEmis; totalOverdue: number; daysOverdue: number }> = {}
    overdueEmis.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      if (!loan) return
      if (!map[loan.customerId]) {
        map[loan.customerId] = { customer: customers.find(c => c.id === loan.customerId), loan, emis: [], totalOverdue: 0, daysOverdue: 0 }
      }
      map[loan.customerId].emis.push(e)
      map[loan.customerId].totalOverdue += e.emiAmount
      const days = Math.floor((new Date(today).getTime() - new Date(e.dueDate).getTime()) / 86400000)
      map[loan.customerId].daysOverdue = Math.max(map[loan.customerId].daysOverdue, days)
    })
    return Object.values(map).sort((a, b) => b.daysOverdue - a.daysOverdue)
  }, [overdueEmis, loans, customers, today])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const critical = grouped.filter(g => g.daysOverdue > 60).length
  const high = grouped.filter(g => g.daysOverdue > 30 && g.daysOverdue <= 60).length
  const moderate = grouped.filter(g => g.daysOverdue <= 30).length

  const getSeverity = (days: number) => {
    if (days > 60) return { label: 'Critical', bg: 'rgba(239,68,68,0.12)', color: 'var(--error)' }
    if (days > 30) return { label: 'High', bg: 'rgba(245,158,11,0.12)', color: '#F59E0B' }
    return { label: 'Moderate', bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6' }
  }

  const handleExport = (formatType: string) => {
    const dataToExport = grouped.map(g => {
      const sev = getSeverity(g.daysOverdue)
      const oldestDueDate = g.emis.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]?.dueDate
      return {
        'Customer': g.customer?.name ?? '—',
        'Mobile': g.customer?.mobile ?? '—',
        'Loan No': g.loan?.loanNo ?? '—',
        'Overdue EMIs': g.emis.length,
        'Overdue Amount': g.totalOverdue,
        'Severity': sev.label,
        'Days Overdue': g.daysOverdue,
        'Oldest Due Date': oldestDueDate ? format(parseISO(oldestDueDate), 'dd/MM/yyyy') : '—'
      }
    })
    if (formatType === 'csv') exportCSV(dataToExport, 'Outstanding_Dues')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Outstanding_Dues')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Outstanding Dues Report')
    else if (formatType === 'print') printTable(dataToExport, 'Outstanding Dues Report')
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
        title="Outstanding Dues Report"
        subtitle="Overdue accounts sorted by urgency"
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
        {[
          { label: 'Overdue Accounts', value: grouped.length, icon: Users, color: 'var(--error)', tint: 'rgba(239,68,68,0.12)' },
          { label: 'Total Overdue EMIs', value: overdueEmis.length, icon: Clock, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
          { label: 'Total Overdue Amount', value: fmt(grouped.reduce((s, g) => s + g.totalOverdue, 0)), icon: DollarSign, color: 'var(--error)', tint: 'rgba(239,68,68,0.12)' },
          { label: 'Critical (>60 days)', value: critical, icon: AlertTriangle, color: 'var(--error)', tint: 'rgba(239,68,68,0.12)' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.tint }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Severity Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { ...getSeverity(61), label: 'Critical (>60 days)', count: critical },
          { ...getSeverity(45), label: 'High (31–60 days)', count: high },
          { ...getSeverity(15), label: 'Moderate (≤30 days)', count: moderate },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'var(--surface)', border: `1px solid ${s.color}30` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
              <AlertTriangle size={18} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Overdue Accounts</h3>
          {grouped.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--error)' }}>
              {grouped.length} accounts
            </span>
          )}
        </div>
        {grouped.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>All Clear!</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No overdue accounts found</div>
          </div>
        ) : (
          <>
          {/* Mobile cards */}
          <div className="block sm:hidden py-1">
            {grouped.map((g, i) => {
              const sev = getSeverity(g.daysOverdue)
              return (
                <div key={i} className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text-primary)' }}>{g.customer?.name ?? '—'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>{g.loan?.loanNo ?? '—'}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    {([['Mobile', g.customer?.mobile ?? '—'], ['Overdue EMIs', String(g.emis.length)], ['Amount', fmt(g.totalOverdue)], ['Days Overdue', `${g.daysOverdue}d`]] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: label === 'Amount' || label === 'Overdue EMIs' || label === 'Days Overdue' ? sev.color : 'var(--text-primary)' }}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Mobile', 'Loan No', 'Overdue EMIs', 'Overdue Amount', 'Severity', 'Days Overdue', 'Oldest Due Date'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped.map((g, i) => {
                  const sev = getSeverity(g.daysOverdue)
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{g.customer?.name ?? '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{g.customer?.mobile ?? '—'}</td>
                      <td className="px-5 py-3.5 font-semibold text-xs" style={{ color: 'var(--accent)' }}>{g.loan?.loanNo ?? '—'}</td>
                      <td className="px-5 py-3.5 text-center font-bold" style={{ color: 'var(--error)' }}>{g.emis.length}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: 'var(--error)' }}>{fmt(g.totalOverdue)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sev.bg, color: sev.color }}>{sev.label}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: sev.bg, color: sev.color }}>{g.daysOverdue}d</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {format(parseISO(g.emis.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0].dueDate), 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </>
  )
}
