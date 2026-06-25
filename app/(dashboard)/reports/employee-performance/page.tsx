'use client'
import { useMemo } from 'react'
import { useStore } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Users, TrendingUp, AlertTriangle, UserCheck, Download, Printer, FileSpreadsheet } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { exportCSV, exportExcel, exportPDF, printTable } from '@/lib/exportUtils'

export default function EmployeePerformancePage() {
  const { employees, loans, customers, emis } = useStore()
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const data = useMemo(() => employees.map(emp => {
    const empLoans = loans.filter(l => l.employeeId === emp.id)
    const disbursed = empLoans.filter(l => l.status === 'disbursed')
    const totalDisbursed = disbursed.reduce((s, l) => s + l.amount, 0)
    const empLoanIds = empLoans.map(l => l.id)
    const collected = emis.filter(e => empLoanIds.includes(e.loanId) && (e.status === 'paid' || e.status === 'paid_late')).reduce((s, e) => s + (e.paidAmount ?? 0), 0)
    const overdueCount = emis.filter(e => empLoanIds.includes(e.loanId) && e.status === 'overdue').length
    const customersAdded = customers.filter(c => c.employeeId === emp.id).length
    const score = totalDisbursed / 1000 + collected / 500 - overdueCount * 10 + customersAdded * 5
    return { emp, loans: empLoans.length, disbursedCount: disbursed.length, totalDisbursed, collected, overdueCount, customersAdded, score }
  }).sort((a, b) => b.score - a.score), [employees, loans, customers, emis])

  const maxDisbursed = Math.max(...data.map(d => d.totalDisbursed), 1)

  const summaryStats = [
    { label: 'Total Employees', value: employees.length, icon: Users, color: 'var(--accent)', tint: 'var(--accent-tint)' },
    { label: 'Total Customers Added', value: data.reduce((s, d) => s + d.customersAdded, 0), icon: UserCheck, color: '#8B5CF6', tint: 'rgba(139,92,246,0.12)' },
    { label: 'Total EMI Collected', value: fmt(data.reduce((s, d) => s + d.collected, 0)), icon: TrendingUp, color: 'var(--success)', tint: 'rgba(16,185,129,0.12)' },
    { label: 'Total Overdue EMIs', value: data.reduce((s, d) => s + d.overdueCount, 0), icon: AlertTriangle, color: 'var(--error)', tint: 'rgba(239,68,68,0.12)' },
  ]

  const rankLabels = ['🥇', '🥈', '🥉']

  const handleExport = (formatType: string) => {
    const dataToExport = data.map((d, i) => ({
      'Rank': `#${i + 1}`,
      'Employee Code': d.emp.code,
      'Name': d.emp.name,
      'Role': d.emp.role,
      'Customers Added': d.customersAdded,
      'Loans Initiated': d.loans,
      'Disbursed Amount': d.totalDisbursed,
      'EMI Collected': d.collected,
      'Overdue EMIs': d.overdueCount,
      'Performance Score': Math.round(d.score)
    }))
    if (formatType === 'csv') exportCSV(dataToExport, 'Employee_Performance')
    else if (formatType === 'excel') exportExcel(dataToExport, 'Employee_Performance')
    else if (formatType === 'pdf') exportPDF(dataToExport, 'Employee Performance Report')
    else if (formatType === 'print') printTable(dataToExport, 'Employee Performance Report')
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
        title="Employee Performance Report"
        subtitle="Ranked performance metrics for all employees"
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

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryStats.map(s => (
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

      {/* Top 3 Podium */}
      {data.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {data.slice(0, 3).map((d, i) => (
            <div key={d.emp.id} className="rounded-2xl p-5 text-center relative overflow-hidden"
              style={{ background: 'var(--surface)', border: `1px solid ${i === 0 ? '#F59E0B' : 'var(--border)'}` }}>
              {i === 0 && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }} />}
              <div className="text-3xl mb-2">{rankLabels[i]}</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold text-white"
                style={{ background: `linear-gradient(135deg, var(--accent), var(--accent-hover))` }}>
                {d.emp.name.charAt(0)}
              </div>
              <div className="text-sm font-bold mb-0.5" style={{ color: 'var(--text-primary)' }}>{d.emp.name}</div>
              <div className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{d.emp.role}</div>
              <div className="text-xs font-semibold" style={{ color: 'var(--success)' }}>{fmt(d.collected)} collected</div>
            </div>
          ))}
        </div>
      )}

      {/* Full Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>All Employees — Ranked by Performance</h3>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            {data.length} employees
          </span>
        </div>
        {/* Mobile cards */}
        <div className="block sm:hidden py-1">
          {data.map((d, i) => (
            <div key={d.emp.id} className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                    {d.emp.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-[15px] leading-snug" style={{ color: 'var(--text-primary)' }}>{d.emp.name}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>{d.emp.code}</div>
                  </div>
                </div>
                <div className="text-xl shrink-0">{i < 3 ? rankLabels[i] : `#${i + 1}`}</div>
              </div>
              <div className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>{d.emp.role}</div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {([['Customers', String(d.customersAdded)], ['Loans', String(d.loans)], ['Disbursed', fmt(d.totalDisbursed)], ['Collected', fmt(d.collected)], ['Overdue', String(d.overdueCount)]] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
                    <div className="text-xs font-semibold mt-0.5" style={{ color: label === 'Overdue' && d.overdueCount > 0 ? 'var(--error)' : label === 'Collected' ? 'var(--success)' : label === 'Disbursed' ? '#F59E0B' : 'var(--text-primary)' }}>{value}</div>
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
                {['Rank', 'Employee', 'Role', 'Customers', 'Loans', 'Disbursed', 'EMI Collected', 'Disbursement Progress', 'Overdue'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                    style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => (
                <tr key={d.emp.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--hover)' : 'transparent' }}>
                  <td className="px-5 py-3.5">
                    <span className="text-base">{i < 3 ? rankLabels[i] : `#${i + 1}`}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))' }}>
                        {d.emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>{d.emp.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.emp.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                      {d.emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-center" style={{ color: '#8B5CF6' }}>{d.customersAdded}</td>
                  <td className="px-5 py-3.5 text-center" style={{ color: 'var(--text-primary)' }}>{d.loans}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: '#F59E0B' }}>{fmt(d.totalDisbursed)}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: 'var(--success)' }}>{fmt(d.collected)}</td>
                  <td className="px-5 py-3.5 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                        <div className="h-1.5 rounded-full"
                          style={{ width: `${Math.round((d.totalDisbursed / maxDisbursed) * 100)}%`, background: 'linear-gradient(90deg, var(--accent), #8B5CF6)' }} />
                      </div>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {Math.round((d.totalDisbursed / maxDisbursed) * 100)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold`}
                      style={d.overdueCount > 0
                        ? { background: 'rgba(239,68,68,0.12)', color: 'var(--error)' }
                        : { background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>
                      {d.overdueCount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
