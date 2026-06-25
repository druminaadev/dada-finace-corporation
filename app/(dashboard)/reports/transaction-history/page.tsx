'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, parseISO } from 'date-fns'
import { Receipt, TrendingUp, Clock, Banknote, CalendarRange, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

const MODE_COLORS: Record<string, { bg: string; color: string }> = {
  Cash:           { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  UPI:            { bg: 'var(--accent-tint)',       color: 'var(--accent)' },
  'Bank Transfer':{ bg: 'rgba(139,92,246,0.12)',   color: '#8B5CF6' },
}

export default function TransactionHistoryPage() {
  const { emis, loans, customers, employees } = useStore()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const collected = useMemo(() => emis
    .filter(e => (e.status === 'paid' || e.status === 'paid_late') && e.paidDate)
    .filter(e => {
      if (from && e.paidDate! < from) return false
      if (to && e.paidDate! > to) return false
      return true
    })
    .sort((a, b) => (b.paidDate ?? '').localeCompare(a.paidDate ?? '')),
    [emis, from, to])

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const totalAmount = collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const onTime = collected.filter(e => e.status === 'paid').length
  const late = collected.filter(e => e.status === 'paid_late').length

  const inputStyle = { background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }

  const handleExport = (formatType: string) => {
    const dataToExport = collected.map(e => {
      const loan = loans.find(l => l.id === e.loanId)
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null
      const emp = employees.find(x => x.id === e.collectedBy)
      return {
        'Date': e.paidDate ?? '—',
        'Loan No': loan?.loanNo ?? '—',
        'Customer': customer?.name ?? '—',
        'EMI #': `#${e.instNo}`,
        'Amount': e.paidAmount ?? 0,
        'Mode': e.paymentMode ?? '—',
        'Collected By': emp?.name ?? '—',
        'Status': e.status === 'paid' ? 'On Time' : 'Late'
      }
    })
    if (formatType === 'csv') exportCSV(dataToExport, 'Transaction_History')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Transaction_History')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Transaction History Report')
    else if (formatType === 'print') printTable(dataToExport, 'Transaction History Report')
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
        title="Transaction History"
        subtitle="All EMI payment transactions with date range filter"
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

      {/* Date Range Filter */}
      <div className="rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <CalendarRange size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Date Range</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl outline-none" style={inputStyle} />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)}
            className="h-9 px-3 text-sm rounded-xl outline-none" style={inputStyle} />
        </div>
        {(from || to) && (
          <button onClick={() => { setFrom(''); setTo('') }}
            className="text-xs px-3 py-1.5 rounded-xl cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Transactions', value: collected.length, icon: Receipt, color: 'var(--accent)', tint: 'var(--accent-tint)' },
          { label: 'Total Amount', value: fmt(totalAmount), icon: Banknote, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
          { label: 'On Time', value: onTime, icon: TrendingUp, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
          { label: 'Late Payments', value: late, icon: Clock, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
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

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Transaction Records</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            {collected.length} records
          </span>
        </div>
        {collected.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📋</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No transactions found{from || to ? ' for selected range' : ''}
            </div>
          </div>
        ) : (
          <>
          {/* Mobile cards */}
          <div className="block sm:hidden py-1">
            {collected.map(e => {
              const loan = loans.find(l => l.id === e.loanId)
              const customer = loan ? customers.find(c => c.id === loan.customerId) : null
              const emp = employees.find(x => x.id === e.collectedBy)
              const mc = MODE_COLORS[e.paymentMode ?? ''] ?? { bg: 'var(--hover)', color: 'var(--text-secondary)' }
              return (
                <div key={e.id} className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text-primary)' }}>{customer?.name ?? '—'}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>{loan?.loanNo ?? '—'}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold shrink-0"
                      style={e.status === 'paid' ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)' } : { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                      {e.status === 'paid' ? 'On Time' : 'Late'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    {([['Date', e.paidDate ? format(parseISO(e.paidDate), 'dd/MM/yyyy') : '—'], ['EMI #', `#${e.instNo}`], ['Amount', fmt(e.paidAmount ?? 0)], ['Mode', e.paymentMode ?? '—'], ['Collected By', emp?.name ?? '—']] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: label === 'Amount' ? 'var(--success)' : label === 'Mode' ? mc.color : 'var(--text-primary)' }}>{value}</div>
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
                  {['Date', 'Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {collected.map((e, i) => {
                  const loan = loans.find(l => l.id === e.loanId)
                  const customer = loan ? customers.find(c => c.id === loan.customerId) : null
                  const emp = employees.find(x => x.id === e.collectedBy)
                  const mc = MODE_COLORS[e.paymentMode ?? ''] ?? { bg: 'var(--hover)', color: 'var(--text-secondary)' }
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                      <td className="px-5 py-3.5 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        {e.paidDate ? format(parseISO(e.paidDate), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-xs" style={{ color: 'var(--accent)' }}>{loan?.loanNo ?? '—'}</td>
                      <td className="px-5 py-3.5 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{customer?.name ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>#{e.instNo}</td>
                      <td className="px-5 py-3.5 font-bold text-xs" style={{ color: 'var(--success)' }}>{fmt(e.paidAmount ?? 0)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: mc.bg, color: mc.color }}>{e.paymentMode ?? '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{emp?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={e.status === 'paid' ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)' } : { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}>
                          {e.status === 'paid' ? 'On Time' : 'Late'}
                        </span>
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
