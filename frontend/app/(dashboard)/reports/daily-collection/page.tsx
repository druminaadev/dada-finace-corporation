'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { format, parseISO } from 'date-fns'
import { Calendar, TrendingUp, Banknote, Smartphone, Building2, Users, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'

export default function DailyCollectionPage() {
  const { emis, loans, customers, employees, branches } = useStore()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const collected = useMemo(() => emis.filter(e => e.paidDate === date), [emis, date])
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const total = collected.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byCash = collected.filter(e => e.paymentMode === 'Cash').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byUPI = collected.filter(e => e.paymentMode === 'UPI').reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const byBank = collected.filter(e => e.paymentMode === 'Bank Transfer').reduce((s, e) => s + (e.paidAmount ?? 0), 0)

  const branchTotals = useMemo(() => {
    const map: Record<number, number> = {}
    collected.forEach(e => {
      const loan = loans.find(l => l.id === e.loanId)
      const customer = loan ? customers.find(c => c.id === loan.customerId) : null
      if (customer) map[customer.branchId] = (map[customer.branchId] ?? 0) + (e.paidAmount ?? 0)
    })
    return map
  }, [collected, loans, customers])

  const stats = [
    { label: 'Total Collected', value: fmt(total), icon: TrendingUp, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
    { label: 'Cash', value: fmt(byCash), icon: Banknote, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
    { label: 'UPI', value: fmt(byUPI), icon: Smartphone, color: 'var(--accent)', tint: 'var(--accent-tint)' },
    { label: 'Bank Transfer', value: fmt(byBank), icon: Building2, color: '#8B5CF6', tint: 'rgba(139,92,246,0.12)' },
  ]

  const exportItems = [
    { label: 'Export as CSV', value: 'csv', icon: FileSpreadsheet },
    { label: 'Export as PDF', value: 'pdf', icon: Download },
    { label: 'Print Report', value: 'print', icon: Printer, dividerBefore: true },
  ]

  return (
    <>
      <PageHeader
        title="Daily Collection Report"
        subtitle="Track all EMI collections for a specific date"
        action={{
          label: '',
          onClick: () => {},
          icon: (
            <Dropdown
              trigger={<span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white"><Download size={14} />Export</span>}
              items={exportItems}
              onSelect={item => item.value === 'print' ? window.print() : alert(`Exporting as ${item.value}`)}
              align="right"
              width={200}
              variant="ghost"
            />
          ),
        }}
      />

      {/* Date Picker */}
      <div className="rounded-2xl p-5 mb-6 flex flex-wrap items-center gap-4"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <Calendar size={18} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Select Date</span>
        </div>
        <input
          type="date" value={date} onChange={e => setDate(e.target.value)}
          className="h-9 px-3 text-sm rounded-xl outline-none"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <div className="ml-auto text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {format(parseISO(date), 'EEEE, dd MMMM yyyy')}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.tint }}>
              <s.icon size={20} style={{ color: s.color }} />
            </div>
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</div>
              <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Branch Breakdown */}
      {branches.length > 0 && (
        <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Branch-wise Breakdown</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {branches.map(b => (
              <div key={b.id} className="rounded-xl px-4 py-3 flex flex-col gap-0.5"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{b.name}</div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(branchTotals[b.id] ?? 0)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Collection Details</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            {collected.length} entries
          </span>
        </div>
        {collected.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No collections on {format(parseISO(date), 'dd MMM yyyy')}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--hover)', borderBottom: '1px solid var(--border)' }}>
                  {['Loan No', 'Customer', 'EMI #', 'Amount', 'Mode', 'Collected By'].map(h => (
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
                  return (
                    <tr key={e.id}
                      style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                      <td className="px-5 py-3.5 font-semibold text-xs" style={{ color: 'var(--accent)' }}>{loan?.loanNo ?? '—'}</td>
                      <td className="px-5 py-3.5 font-medium" style={{ color: 'var(--text-primary)' }}>{customer?.name ?? '—'}</td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>#{e.instNo}</td>
                      <td className="px-5 py-3.5 font-bold" style={{ color: 'var(--success)' }}>{fmt(e.paidAmount ?? 0)}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium"
                          style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                          {e.paymentMode}
                        </span>
                      </td>
                      <td className="px-5 py-3.5" style={{ color: 'var(--text-secondary)' }}>{emp?.name ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
