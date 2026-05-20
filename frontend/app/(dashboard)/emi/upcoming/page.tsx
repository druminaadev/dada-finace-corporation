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
              ? 'border-[#462C7D] bg-[#462C7D] text-white dark:border-[#D552A3] dark:bg-[#D552A3]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          {item.label}
        </button>
      ))}
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
          columns={[
            { key: 'instNo', header: '#' },
            { key: 'loanNo', header: 'Loan No' },
            { key: 'customerName', header: 'Customer' },
            { key: 'customerMobile', header: 'Mobile' },
            { key: 'dueDateFmt', header: 'Due Date' },
            {
              key: 'daysLeft',
              header: 'Priority',
              accessor: (row) => {
                const days = row.daysLeft
                const label = days < 0 ? `${Math.abs(days)} days overdue` : days === 0 ? 'Due today' : `${days} days left`
                const tone = days < 0
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800'
                  : days <= 3
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600'
                return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${tone}`}>{label}</span>
              },
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
