'use client'
import { useMemo } from 'react'
import { useStore, type EMIInstalment } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { format, parseISO } from 'date-fns'
import { Wallet, CreditCard, Banknote, ReceiptText } from 'lucide-react'

type PaymentRow = EMIInstalment & {
  loanNo: string
  customerName: string
  amountFmt: string
  paidDateFmt: string
  paymentMode: string
}

const modeTone: Record<string, string> = {
  Cash: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  Paytm: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  'Bank Transfer': 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
}

export default function PaymentMethodsPage() {
  const { emis, loans, customers } = useStore()
  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const paidEmis = useMemo(() => emis.filter(e => e.status === 'paid' || e.status === 'paid_late'), [emis])

  const paymentStats = useMemo(() => {
    const stats: Record<string, { count: number; amount: number }> = {}
    paidEmis.forEach(e => {
      const mode = e.paymentMode || 'Cash'
      if (!stats[mode]) stats[mode] = { count: 0, amount: 0 }
      stats[mode].count += 1
      stats[mode].amount += e.paidAmount || 0
    })
    return stats
  }, [paidEmis])

  const totalCollected = paidEmis.reduce((sum, emi) => sum + (emi.paidAmount ?? 0), 0)
  const totalTransactions = paidEmis.length

  const enriched: PaymentRow[] = paidEmis.map(emi => {
    const loan = loans.find(l => l.id === emi.loanId)
    const customer = loan ? customers.find(c => c.id === loan.customerId) : null
    return {
      ...emi,
      loanNo: loan?.loanNo ?? '-',
      customerName: customer?.name ?? '-',
      amountFmt: fmt(emi.paidAmount || 0),
      paidDateFmt: emi.paidDate ? format(parseISO(emi.paidDate), 'dd MMM yyyy') : '-',
      paymentMode: emi.paymentMode || 'Cash',
    }
  })

  const getIcon = (mode: string) => {
    if (mode === 'Paytm') return <Wallet size={20} />
    if (mode === 'Bank Transfer') return <Banknote size={20} />
    return <CreditCard size={20} />
  }

  return (
    <>
      <PageHeader title="Payment Methods Analytics" subtitle="Review EMI collection channels and transaction history" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200 flex items-center justify-center">
                <ReceiptText size={21} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total Collected</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{fmt(totalCollected)}</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Transactions</p>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{totalTransactions}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(paymentStats).map(([mode, data]) => {
              const share = totalCollected ? Math.round((data.amount / totalCollected) * 100) : 0
              return (
                <div key={mode} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide truncate">{mode}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">{fmt(data.amount)}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{data.count} transactions</p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${modeTone[mode] ?? modeTone.Cash}`}>
                      {getIcon(mode)}
                    </div>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-[#462C7D]" style={{ width: `${share}%` }} />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{share}% of collected amount</p>
                </div>
              )
            })}
          </div>
        </div>

        <StandardTable<PaymentRow>
          data={enriched}
          searchPlaceholder="Search by customer, loan..."
          columns={[
            { key: 'instNo', header: '#' },
            { key: 'loanNo', header: 'Loan No' },
            { key: 'customerName', header: 'Customer' },
            { key: 'amountFmt', header: 'Amount Paid' },
            {
              key: 'paymentMode',
              header: 'Payment Mode',
              accessor: (row) => (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${modeTone[row.paymentMode] ?? modeTone.Cash}`}>
                  {row.paymentMode}
                </span>
              ),
            },
            { key: 'paidDateFmt', header: 'Payment Date' },
          ]}
        />
      </div>
    </>
  )
}
