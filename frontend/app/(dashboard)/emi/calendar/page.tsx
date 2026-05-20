'use client'
import { useState, useMemo } from 'react'
import { useStore, type EMIInstalment } from '@/store/appStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { LoanSearchPicker } from '@/components/emi/LoanSearchPicker'
import { useUIStore } from '@/store/uiStore'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock, Wallet } from 'lucide-react'

const DOT: Record<EMIInstalment['status'], string> = {
  paid: 'bg-emerald-500',
  paid_late: 'bg-violet-500',
  overdue: 'bg-rose-500',
  upcoming: 'bg-sky-500',
}

const STATUS_META: Record<EMIInstalment['status'], { label: string; pill: string }> = {
  paid: { label: 'Paid', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
  paid_late: { label: 'Paid Late', pill: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800' },
  overdue: { label: 'Overdue', pill: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800' },
  upcoming: { label: 'Upcoming', pill: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800' },
}

export default function EMICalendarPage() {
  const { loans, customers, emis, employees, generateEMIs, collectEMI } = useStore()
  const { showToast } = useUIStore()
  const [selectedLoan, setSelectedLoan] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [collectModal, setCollectModal] = useState<EMIInstalment | null>(null)
  const [form, setForm] = useState({ paidAmount: '', paymentMode: 'Cash', collectedBy: '', paidDate: new Date().toISOString().split('T')[0] })
  const [statusFilter, setStatusFilter] = useState('all')

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const calendarLoans = loans.filter(l => l.status === 'disbursed' || emis.some(e => e.loanId === l.id))
  const filteredEmis = useMemo(() => {
    if (!selectedLoan) return emis
    return emis.filter(e => e.loanId === Number(selectedLoan))
  }, [emis, selectedLoan])
  const loanEmis = useMemo(() => emis.filter(e => e.loanId === Number(selectedLoan)), [emis, selectedLoan])
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  const startPad = getDay(startOfMonth(currentMonth))
  const monthKey = format(currentMonth, 'yyyy-MM')

  const monthEmis = useMemo(() => {
    return filteredEmis.filter(e => format(parseISO(e.dueDate), 'yyyy-MM') === monthKey)
  }, [filteredEmis, monthKey])

  const emiByDate = useMemo(() => {
    const map: Record<string, EMIInstalment[]> = {}
    monthEmis.forEach(e => {
      if (statusFilter !== 'all' && e.status !== statusFilter) return
      if (!map[e.dueDate]) map[e.dueDate] = []
      map[e.dueDate].push(e)
    })
    return map
  }, [monthEmis, statusFilter])

  const monthDue = monthEmis.reduce((sum, e) => sum + e.emiAmount, 0)
  const monthCollected = monthEmis.reduce((sum, e) => sum + (e.paidAmount ?? 0), 0)
  const monthOverdue = monthEmis.filter(e => e.status === 'overdue').length
  const monthUpcoming = monthEmis.filter(e => e.status === 'upcoming').length

  function handleGenerate() {
    if (!selectedLoan) return
    generateEMIs(Number(selectedLoan))
    showToast('EMI schedule generated!', 'success')
  }

  function handleCollect() {
    if (!collectModal) return
    collectEMI(collectModal.id, Number(form.paidAmount), form.paymentMode, Number(form.collectedBy), form.paidDate)
    showToast('EMI collected!', 'success')
    setCollectModal(null)
  }

  const openCollect = (emi: EMIInstalment) => {
    if (emi.status !== 'overdue' && emi.status !== 'upcoming') return
    setCollectModal(emi)
    setForm(f => ({ ...f, paidAmount: String(emi.emiAmount) }))
  }

  const prevMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))

  const loan = loans.find(l => l.id === Number(selectedLoan))
  const customer = loan ? customers.find(c => c.id === loan.customerId) : null

  return (
    <>
      <PageHeader title="EMI Calendar" subtitle="Track due dates and collect installments by month" />
      <div className="flex flex-col gap-4">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px_auto] gap-3 items-start">
            <LoanSearchPicker
              label="Search Loan"
              loans={calendarLoans}
              customers={customers}
              value={selectedLoan}
              onChange={setSelectedLoan}
              placeholder="Search loan no, borrower, mobile... Leave empty for all"
            />
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">Status</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'overdue', label: 'Overdue' },
                  { value: 'paid', label: 'Paid' },
                  { value: 'paid_late', label: 'Paid Late' },
                ].map(item => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setStatusFilter(item.value)}
                    className={`h-9 rounded-lg border px-3 text-xs font-bold transition-colors ${
                      statusFilter === item.value
                        ? 'border-[#462C7D] bg-[#462C7D] text-white dark:border-[#D552A3] dark:bg-[#D552A3]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {selectedLoan && loanEmis.length === 0 && (
              <Button onClick={handleGenerate} className="lg:mt-7">Generate Schedule</Button>
            )}
          </div>

          {customer && loan && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Borrower</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{customer.name}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loan</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{loan.loanNo}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loan Amount</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{fmt(loan.amount)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Installments</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{loan.installments}</p>
              </div>
            </div>
          )}

          {!selectedLoan && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Calendar Scope</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">All Loans</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled EMIs</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{emis.length}</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Customers</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">{new Set(emis.map(e => e.loanId)).size} loan schedules</p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-700/40 p-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Search Filter</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate mt-1">Optional</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-900/25 dark:text-sky-300 flex items-center justify-center"><Wallet size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Month Due</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{fmt(monthDue)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300 flex items-center justify-center"><CheckCircle2 size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Collected</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{fmt(monthCollected)}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-900/25 dark:text-rose-300 flex items-center justify-center"><AlertTriangle size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Overdue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{monthOverdue}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-slate-50 text-slate-700 dark:bg-slate-700/50 dark:text-slate-200 flex items-center justify-center"><Clock size={19} /></span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Upcoming</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{monthUpcoming}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{format(currentMonth, 'MMMM yyyy')}</h2>
              <button onClick={() => setCurrentMonth(new Date())} className="text-xs font-semibold text-[#462C7D] dark:text-[#D552A3] mt-1">Today</button>
            </div>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer text-slate-700 dark:text-slate-300 transition-colors"
              title="Next month"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} className="min-h-24" />)}
            {days.map(day => {
              const key = format(day, 'yyyy-MM-dd')
              const dayEmis = emiByDate[key] ?? []
              const dayTotal = dayEmis.reduce((sum, emi) => sum + emi.emiAmount, 0)
              const isToday = key === new Date().toISOString().split('T')[0]

              return (
                <div
                  key={key}
                  className={`min-h-24 rounded-lg p-2 border transition-all ${
                    isToday
                      ? 'border-[#462C7D] bg-[#FFF5F8] dark:bg-[#462C7D]/20 ring-2 ring-[#462C7D]/20'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className={`text-xs font-bold ${isToday ? 'text-[#462C7D] dark:text-[#D552A3]' : 'text-slate-600 dark:text-slate-400'}`}>
                      {format(day, 'd')}
                    </span>
                    {dayEmis.length > 0 && <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{fmt(dayTotal)}</span>}
                  </div>

                  {dayEmis.length > 0 && (
                    <div className="space-y-1">
                      {dayEmis.slice(0, 3).map(emi => {
                        const emiLoan = loans.find(l => l.id === emi.loanId)
                        const emiCustomer = emiLoan ? customers.find(c => c.id === emiLoan.customerId) : null
                        return (
                          <button
                            key={emi.id}
                            onClick={() => openCollect(emi)}
                            className="w-full text-left rounded-md px-2 py-1.5 flex items-center gap-1.5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-600"
                            title={`${emiCustomer?.name ?? ''} - EMI #${emi.instNo}`}
                          >
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${DOT[emi.status]}`} />
                            <span className="text-[10px] text-slate-700 dark:text-slate-300 truncate font-semibold">
                              #{emi.instNo} {emiCustomer?.name ?? 'N/A'}
                            </span>
                          </button>
                        )
                      })}
                      {dayEmis.length > 3 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-bold">+{dayEmis.length - 3} more</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 mt-4 flex-wrap pt-4 border-t border-slate-200 dark:border-slate-700">
            {(Object.keys(STATUS_META) as EMIInstalment['status'][]).map(status => (
              <div key={status} className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-bold ${STATUS_META[status].pill}`}>
                <span className={`w-2 h-2 rounded-full ${DOT[status]}`} />
                {STATUS_META[status].label}
              </div>
            ))}
          </div>
        </div>
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
