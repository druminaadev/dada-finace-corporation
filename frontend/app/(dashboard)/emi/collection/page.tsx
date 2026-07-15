'use client'
import { useState, useMemo } from 'react'
import type React from 'react'
import { useStore, type EMIInstalment } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoanSearchPicker } from '@/components/emi/LoanSearchPicker'
import { format, parseISO } from 'date-fns'
import { Wallet, AlertCircle, CheckCircle2, Clock, CalendarDays, UserRound, ListChecks } from 'lucide-react'

const statusColor: Record<EMIInstalment['status'], string> = {
  upcoming: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  paid_late: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
  overdue: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
}

const statusLabel: Record<EMIInstalment['status'], string> = {
  upcoming: 'Upcoming',
  paid: 'Paid',
  paid_late: 'Paid Late',
  overdue: 'Overdue',
}

function MetricTile({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  tone: 'green' | 'blue' | 'red' | 'slate'
}) {
  const toneClass = {
    green: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/25 dark:text-emerald-300 dark:border-emerald-800/70',
    blue: 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-900/25 dark:text-sky-300 dark:border-sky-800/70',
    red: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/25 dark:text-rose-300 dark:border-rose-800/70',
    slate: 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600',
  }[tone]

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2 truncate">{value}</p>
          {sub && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${toneClass}`}>
          <Icon size={19} />
        </div>
      </div>
    </div>
  )
}

export default function EMICollectionPage() {
  const { loans, customers, employees, emis, generateEMIs, collectEMI } = useStore()
  
  const [selectedLoan, setSelectedLoan] = useState('')
  const [collectModal, setCollectModal] = useState<EMIInstalment | null>(null)
  const [form, setForm] = useState({ paidAmount: '', paymentMode: 'Cash', collectedBy: '', paidDate: new Date().toISOString().split('T')[0] })

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const disbursedLoans = loans.filter(l => l.status === 'disbursed')
  const loanEmis = useMemo(() => emis.filter(e => e.loanId === Number(selectedLoan)), [emis, selectedLoan])
  const loan = disbursedLoans.find(l => l.id === Number(selectedLoan))
  const customer = loan ? customers.find(c => c.id === loan.customerId) : null

  const paidEmis = loanEmis.filter(e => e.status === 'paid' || e.status === 'paid_late')
  const dueEmis = loanEmis.filter(e => e.status !== 'paid' && e.status !== 'paid_late')
  const totalCollected = paidEmis.reduce((s, e) => s + (e.paidAmount ?? 0), 0)
  const totalOutstanding = dueEmis.reduce((s, e) => s + e.emiAmount, 0)
  const overdueCount = loanEmis.filter(e => e.status === 'overdue').length
  const nextDue = dueEmis.sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const completionRate = loanEmis.length ? Math.round((paidEmis.length / loanEmis.length) * 100) : 0

  function handleGenerate() {
    if (!selectedLoan) return
    generateEMIs(Number(selectedLoan))
  }

  function handleCollect() {
    if (!collectModal) return
    collectEMI(collectModal.id, Number(form.paidAmount), form.paymentMode, Number(form.collectedBy), form.paidDate)
    setCollectModal(null)
  }

  const openCollect = (emi: EMIInstalment) => {
    setCollectModal(emi)
    setForm(f => ({ ...f, paidAmount: String(emi.emiAmount) }))
  }

  return (
    <>
      <PageHeader title="EMI Collection" subtitle="Collect installments and track active loan recovery" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="flex-1 min-w-0">
              <LoanSearchPicker
                label="Search Disbursed Loan"
                loans={disbursedLoans}
                customers={customers}
                value={selectedLoan}
                onChange={setSelectedLoan}
              />
            </div>
            {selectedLoan && loanEmis.length === 0 && (
              <Button onClick={handleGenerate} className="lg:mt-7">
                <ListChecks size={16} /> Generate Schedule
              </Button>
            )}
          </div>

          {customer && loan && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-3">
                <UserRound size={17} className="text-slate-500 dark:text-slate-300" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Borrower</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-3">
                <Wallet size={17} className="text-slate-500 dark:text-slate-300" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loan Amount</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{fmt(loan.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 px-3 py-3">
                <CalendarDays size={17} className="text-slate-500 dark:text-slate-300" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Schedule</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{loan.installments} installments</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {customer && loan && loanEmis.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <MetricTile label="Total Collected" value={fmt(totalCollected)} sub={`${paidEmis.length} installments paid`} icon={CheckCircle2} tone="green" />
              <MetricTile label="Outstanding" value={fmt(totalOutstanding)} sub={`${dueEmis.length} installments pending`} icon={Wallet} tone="blue" />
              <MetricTile label="Overdue EMIs" value={String(overdueCount)} sub={overdueCount ? 'Needs follow-up' : 'No overdue payments'} icon={AlertCircle} tone="red" />
              <MetricTile
                label="Next Due"
                value={nextDue ? format(parseISO(nextDue.dueDate), 'dd MMM yyyy') : 'Cleared'}
                sub={nextDue ? fmt(nextDue.emiAmount) : 'No pending EMI'}
                icon={Clock}
                tone="slate"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{loan.loanNo} collection progress</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{paidEmis.length} of {loanEmis.length} installments collected</p>
                </div>
                <span className="w-fit rounded-full bg-slate-100 dark:bg-slate-700 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-200">{completionRate}% complete</span>
              </div>
              <div className="mt-4 h-2.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-sky-500 to-[#462C7D]" style={{ width: `${completionRate}%` }} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Installment Schedule</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Amounts, due dates, and collection status</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                      {['#', 'Due Date', 'EMI Amount', 'Principal', 'Interest', 'Outstanding', 'Status', 'Paid Date', 'Action'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loanEmis.map((emi, i) => (
                      <tr key={emi.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-[#FFF5F8]/50 dark:hover:bg-[#462C7D]/10 transition-colors ${i % 2 === 1 ? 'bg-slate-50/30 dark:bg-slate-700/10' : ''}`}>
                        <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{emi.instNo}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{format(parseISO(emi.dueDate), 'dd/MM/yyyy')}</td>
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-100">{fmt(emi.emiAmount)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.principal)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.interest)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{fmt(emi.outstanding)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${statusColor[emi.status]}`}>
                            {statusLabel[emi.status]}
                          </span>
                          {emi.penaltyAmount ? <span className="ml-2 text-xs text-rose-600 dark:text-rose-400 font-semibold">+{fmt(emi.penaltyAmount)}</span> : null}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {emi.paidDate ? format(parseISO(emi.paidDate), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          {(emi.status === 'overdue' || emi.status === 'upcoming') && (
                            <Button size="sm" onClick={() => openCollect(emi)}>
                              Collect
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal open={!!collectModal} onClose={() => setCollectModal(null)} title={`Collect EMI #${collectModal?.instNo}`}>
        <div className="flex flex-col gap-4">
          <Input label="Amount (₹)" type="number" value={form.paidAmount} onChange={e => setForm(f => ({ ...f, paidAmount: e.target.value }))} />
          <Select
            label="Payment Mode"
            options={['Cash', 'Paytm', 'Bank Transfer'].map(v => ({ value: v, label: v }))}
            value={form.paymentMode}
            onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
          />
          <Select
            label="Collected By"
            placeholder="Select employee"
            options={employees.map(e => ({ value: e.id, label: e.name }))}
            value={form.collectedBy}
            onChange={e => setForm(f => ({ ...f, collectedBy: e.target.value }))}
          />
          <Input label="Collection Date" type="date" value={form.paidDate} onChange={e => setForm(f => ({ ...f, paidDate: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCollect}>Save Collection</Button>
            <Button variant="outline" onClick={() => setCollectModal(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
