'use client'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore, type EMIInstalment } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { format, parseISO, addDays, isBefore } from 'date-fns'
import { AlertTriangle, Calendar, Clock, Wallet } from 'lucide-react'

type UpcomingRow = EMIInstalment & {
  loanNo: string
  customerName: string
  customerMobile: string
  amountFmt: string
  dueDateFmt: string
  daysLeft: number
}

const statusPill: Record<'upcoming' | 'overdue', string> = {
  upcoming: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
}

function priorityTone(days: number) {
  if (days < 0) return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
  if (days <= 3) return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
  return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600'
}

function priorityLabel(days: number) {
  if (days < 0) return `${Math.abs(days)} days overdue`
  if (days === 0) return 'Due today'
  return `${days} days left`
}

export default function UpcomingEMIPage() {
  const { emis, loans, customers } = useStore()
  const router = useRouter()
  const [daysFilter, setDaysFilter] = useState('7')

  const daysWindow = Number(daysFilter)
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const upcomingEmis = useMemo(() => {
    const today = new Date()
    const endDate = addDays(today, daysWindow)
    return emis.filter(e => {
      if (e.status !== 'upcoming' && e.status !== 'overdue') return false
      const dueDate = parseISO(e.dueDate)
      return isBefore(dueDate, endDate) || dueDate.toDateString() === endDate.toDateString()
    })
  }, [emis, daysWindow])

  const enriched: UpcomingRow[] = upcomingEmis.map(emi => {
    const today = new Date()
    const loan = loans.find(l => l.id === emi.loanId)
    const customer = loan ? customers.find(c => c.id === loan.customerId) : null
    return {
      ...emi,
      loanNo: loan?.loanNo ?? '-',
      customerName: customer?.name ?? '-',
      customerMobile: customer?.mobile ?? '-',
      amountFmt: fmt(emi.emiAmount),
      dueDateFmt: format(parseISO(emi.dueDate), 'dd MMM yyyy'),
      daysLeft: Math.ceil((parseISO(emi.dueDate).getTime() - today.getTime()) / 86400000),
    }
  })

  const overdueRows = enriched.filter(e => e.daysLeft < 0)
  const dueSoonRows = enriched.filter(e => e.daysLeft >= 0 && e.daysLeft <= 3)
  const totalDue = enriched.reduce((sum, e) => sum + e.emiAmount, 0)

  const filters = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due Window</span>
      {[
        { value: '7', label: 'Next 7 Days' },
        { value: '15', label: 'Next 15 Days' },
        { value: '30', label: 'Next 30 Days' },
      ].map(item => (
        <button
          key={item.value}
          type="button"
          onClick={() => setDaysFilter(item.value)}
          className={`h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${
            daysFilter === item.value
              ? 'border-[var(--primary)] bg-[var(--primary)] text-white dark:border-[var(--secondary)] dark:bg-[var(--secondary)]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )

  const renderMobileCard = (row: UpcomingRow) => (
    <div className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-snug truncate">{row.customerName}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{row.loanNo} · EMI #{row.instNo}</div>
        </div>
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold shrink-0 ${statusPill[row.status as 'upcoming' | 'overdue']}`}>
          {row.status === 'overdue' ? 'Overdue' : 'Upcoming'}
        </span>
      </div>
      <div className="mb-3">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${priorityTone(row.daysLeft)}`}>
          {priorityLabel(row.daysLeft)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {([
          ['Mobile', row.customerMobile],
          ['Due Date', row.dueDateFmt],
          ['EMI Amount', row.amountFmt],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Upcoming EMI Payments"
        subtitle="Prioritize due and overdue installments"
        action={{
          label: 'View Calendar',
          onClick: () => router.push('/emi/calendar'),
          icon: <Calendar size={13} />,
        }}
      />

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-900/25 dark:text-sky-300 flex items-center justify-center"><Wallet size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Due</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{fmt(totalDue)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/25 dark:text-rose-300 flex items-center justify-center"><AlertTriangle size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Overdue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{overdueRows.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300 flex items-center justify-center"><Clock size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due in 3 Days</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{dueSoonRows.length}</p>
            </div>
          </div>
        </div>

        <StandardTable<UpcomingRow>
          data={enriched}
          searchPlaceholder="Search by customer, loan..."
          filters={filters}
          mobileCard={renderMobileCard}
          columns={[
            { key: 'instNo', header: '#' },
            { key: 'loanNo', header: 'Loan No' },
            { key: 'customerName', header: 'Customer' },
            { key: 'customerMobile', header: 'Mobile' },
            { key: 'dueDateFmt', header: 'Due Date' },
            {
              key: 'daysLeft',
              header: 'Priority',
              accessor: (row) => (
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${priorityTone(row.daysLeft)}`}>
                  {priorityLabel(row.daysLeft)}
                </span>
              ),
            },
            { key: 'amountFmt', header: 'EMI Amount' },
            {
              key: 'status',
              header: 'Status',
              sortable: false,
              accessor: (row) => (
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusPill[row.status as 'upcoming' | 'overdue']}`}>
                  {row.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              ),
            },
          ]}
        />
      </div>
    </>
  )
}
