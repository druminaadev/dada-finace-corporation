'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileText, DollarSign, CheckCircle, Clock, Filter, Download, Printer, FileSpreadsheet, GitBranch, Tag, Activity } from 'lucide-react'
import { Dropdown, SelectDropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  disbursed: { bg: 'rgba(16,185,129,0.12)', color: '#10B981' },
  approved:  { bg: 'rgba(59,130,246,0.12)',  color: '#3B82F6' },
  pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#F59E0B' },
  rejected:  { bg: 'rgba(239,68,68,0.12)',   color: '#EF4444' },
}

export default function LoanPortfolioPage() {
  const { loans, customers, loanTypes, branches, emis } = useStore()
  const [filterBranch, setFilterBranch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [search, setSearch] = useState('')

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const getOutstanding = (loanId: number) =>
    emis.filter(e => e.loanId === loanId && e.status !== 'paid' && e.status !== 'paid_late').reduce((s, e) => s + e.emiAmount, 0)

  const filtered = useMemo(() => loans.filter(l => {
    const c = customers.find(x => x.id === l.customerId)
    if (filterBranch && c?.branchId !== Number(filterBranch)) return false
    if (filterType && l.loanTypeId !== Number(filterType)) return false
    if (filterStatus && l.status !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (!l.loanNo.toLowerCase().includes(q) && !(c?.name ?? '').toLowerCase().includes(q)) return false
    }
    return true
  }), [loans, customers, filterBranch, filterType, filterStatus, search])

  const enriched = filtered.map(l => {
    const c = customers.find(x => x.id === l.customerId)
    const lt = loanTypes.find(x => x.id === l.loanTypeId)
    return { ...l, customerName: c?.name ?? '—', loanTypeName: lt?.name ?? '—', outstanding: getOutstanding(l.id) }
  })

  const stats = [
    { label: 'Total Loans', value: filtered.length, icon: FileText, color: 'var(--accent)', tint: 'var(--accent-tint)' },
    { label: 'Total Amount', value: fmt(filtered.reduce((s, l) => s + l.amount, 0)), icon: DollarSign, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
    { label: 'Active (Disbursed)', value: filtered.filter(l => l.status === 'disbursed').length, icon: CheckCircle, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
    { label: 'Pending Approval', value: filtered.filter(l => l.status === 'pending').length, icon: Clock, color: '#F59E0B', tint: 'rgba(245,158,11,0.12)' },
  ]

  const handleExport = (formatType: string) => {
    const dataToExport = enriched.map(l => ({
      'Loan No': l.loanNo,
      'Customer': l.customerName,
      'Type': l.loanTypeName,
      'Amount': l.amount,
      'Outstanding': l.outstanding,
      'Installments': l.installments,
      'Status': l.status
    }))
    if (formatType === 'csv') exportCSV(dataToExport, 'Loan_Portfolio')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Loan_Portfolio')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Loan Portfolio Report')
    else if (formatType === 'print') printTable(dataToExport, 'Loan Portfolio Report')
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
        title="Loan Portfolio Report"
        subtitle="Complete view of all loans with filters"
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
              <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-3"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mr-1">
          <Filter size={15} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Filters</span>
        </div>
        <input
          placeholder="Search loan no or customer..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="h-9 px-3 text-sm rounded-xl outline-none min-w-[200px]"
          style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
        <SelectDropdown
          placeholder="All Branches"
          icon={GitBranch}
          options={branches.map(b => ({ value: b.id, label: b.name }))}
          value={filterBranch}
          onChange={setFilterBranch}
          width={200}
        />
        <SelectDropdown
          placeholder="All Types"
          icon={Tag}
          options={loanTypes.map(t => ({ value: t.id, label: t.name }))}
          value={filterType}
          onChange={setFilterType}
          width={180}
        />
        <SelectDropdown
          placeholder="All Status"
          icon={Activity}
          options={['pending', 'approved', 'disbursed', 'rejected'].map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          value={filterStatus}
          onChange={setFilterStatus}
          width={160}
        />
        {(filterBranch || filterType || filterStatus || search) && (
          <button onClick={() => { setFilterBranch(''); setFilterType(''); setFilterStatus(''); setSearch('') }}
            className="text-xs px-3 py-1.5 rounded-xl cursor-pointer"
            style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
            Clear
          </button>
        )}
        <span className="ml-auto text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {enriched.length} results
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        {enriched.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>No loans match your filters</div>
          </div>
        ) : (
          <>
          {/* Mobile cards */}
          <div className="block sm:hidden py-1">
            {enriched.map(l => {
              const sc = STATUS_COLORS[l.status] ?? STATUS_COLORS.pending
              return (
                <div key={l.id} className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text-primary)' }}>{l.customerName}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--accent)' }}>{l.loanNo}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize shrink-0" style={{ background: sc.bg, color: sc.color }}>{l.status}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    {([['Type', l.loanTypeName], ['Amount', fmt(l.amount)], ['Outstanding', l.outstanding > 0 ? fmt(l.outstanding) : '—'], ['Installments', String(l.installments)]] as [string, string][]).map(([label, value]) => (
                      <div key={label}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
                        <div className="text-xs font-semibold mt-0.5" style={{ color: label === 'Amount' ? '#F59E0B' : label === 'Outstanding' && l.outstanding > 0 ? 'var(--error)' : 'var(--text-primary)' }}>{value}</div>
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
                  {['Loan No', 'Customer', 'Type', 'Amount', 'Outstanding', 'Installments', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map((l, i) => {
                  const sc = STATUS_COLORS[l.status] ?? STATUS_COLORS.pending
                  return (
                    <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                      <td className="px-5 py-3.5 font-semibold text-xs" style={{ color: 'var(--accent)' }}>{l.loanNo}</td>
                      <td className="px-5 py-3.5 font-medium text-xs" style={{ color: 'var(--text-primary)' }}>{l.customerName}</td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{l.loanTypeName}</td>
                      <td className="px-5 py-3.5 font-semibold text-xs" style={{ color: '#F59E0B' }}>{fmt(l.amount)}</td>
                      <td className="px-5 py-3.5 text-xs font-medium" style={{ color: l.outstanding > 0 ? 'var(--error)' : 'var(--success)' }}>
                        {l.outstanding > 0 ? fmt(l.outstanding) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs" style={{ color: 'var(--text-primary)' }}>{l.installments}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: sc.bg, color: sc.color }}>{l.status}</span>
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
