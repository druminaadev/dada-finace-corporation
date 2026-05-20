'use client'
import { useState, useMemo, useEffect } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'

interface EMIScheduleItem {
  month: number
  date: string
  emi: number
  principal: number
  interest: number
  balance: number
  status: 'paid' | 'current' | 'upcoming'
}

export default function EMICalculatorPage() {
  const [loanAmount, setLoanAmount] = useState(500000)
  const [interestRate, setInterestRate] = useState(12)
  const [tenureYears, setTenureYears] = useState(2)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [prepayment, setPrepayment] = useState(0)
  const [showPrepayment, setShowPrepayment] = useState(false)

  const { monthlyEMI, totalInterest, totalPayment, schedule } = useMemo(() => {
    const P = loanAmount
    const r = interestRate / 12 / 100
    const n = tenureYears * 12

    if (P <= 0 || n <= 0) {
      return { monthlyEMI: 0, totalInterest: 0, totalPayment: 0, schedule: [] }
    }

    const emi = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)

    const schedule: EMIScheduleItem[] = []
    let balance = P
    const start = new Date(startDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 1; i <= n; i++) {
      const monthDate = new Date(start)
      monthDate.setMonth(start.getMonth() + i - 1)

      const interestPaid = balance * r
      let principalPaid = emi - interestPaid

      if (i === 6 && prepayment > 0) {
        principalPaid += prepayment
      }

      balance = Math.max(0, balance - principalPaid)

      let status: 'paid' | 'current' | 'upcoming' = 'upcoming'
      if (monthDate < today) status = 'paid'
      else if (monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear()) status = 'current'

      schedule.push({
        month: i,
        date: monthDate.toISOString().split('T')[0],
        emi: Math.round(emi + (i === 6 && prepayment > 0 ? prepayment : 0)),
        principal: Math.round(principalPaid),
        interest: Math.round(interestPaid),
        balance: Math.round(balance),
        status,
      })
    }

    const total = schedule.reduce((sum, item) => sum + item.emi, 0)
    const interest = total - P

    return {
      monthlyEMI: Math.round(emi),
      totalInterest: Math.round(interest),
      totalPayment: Math.round(total),
      schedule,
    }
  }, [loanAmount, interestRate, tenureYears, startDate, prepayment])

  const principalPercent = totalPayment > 0 ? (loanAmount / totalPayment) * 100 : 0
  const interestPercent = totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0

  useEffect(() => {
    const saved = localStorage.getItem('emi-calculator-data')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        queueMicrotask(() => {
          setLoanAmount(data.loanAmount || 500000)
          setInterestRate(data.interestRate || 12)
          setTenureYears(data.tenureYears || 2)
        })
      } catch { }
    }
  }, [])

  const saveInputs = () => {
    localStorage.setItem('emi-calculator-data', JSON.stringify({ loanAmount, interestRate, tenureYears }))
    alert('Inputs saved successfully!')
  }

  const downloadSchedule = () => {
    let csv = 'Month,Date,EMI Amount,Principal,Interest,Balance\n'
    schedule.forEach(item => {
      csv += `${item.month},${item.date},${item.emi},${item.principal},${item.interest},${item.balance}\n`
    })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `emi-schedule-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
  }

  return (
    <>
      <PageHeader title="EMI Calculator" />

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Calculator Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Loan Details</h2>
              <Button size="sm" variant="ghost" onClick={saveInputs}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loan Amount</label>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="10000000"
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span>₹10K</span>
                  <span>₹1Cr</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Interest Rate (% per year)</label>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span>1%</span>
                  <span>30%</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Loan Tenure</label>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400">{tenureYears} {tenureYears === 1 ? 'Year' : 'Years'} ({tenureYears * 12} Months)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">EMI Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <button
                  onClick={() => setShowPrepayment(!showPrepayment)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform ${showPrepayment ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Add Prepayment (Month 6)
                </button>
                {showPrepayment && (
                  <div className="mt-3 animate-slideDown">
                    <input
                      type="number"
                      placeholder="Prepayment amount"
                      value={prepayment || ''}
                      onChange={(e) => setPrepayment(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 border border-blue-200 dark:border-slate-700 rounded-xl p-6 shadow-lg">
            <div className="text-center mb-6">
              <div className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">Monthly EMI</div>
              <div className="text-4xl font-bold text-blue-900 dark:text-blue-100 animate-pulse">₹{monthlyEMI.toLocaleString('en-IN')}</div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg p-4 border border-green-200 dark:border-green-800/50">
                <div className="text-xs text-green-700 dark:text-green-300 mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Principal
                </div>
                <div className="text-lg font-bold text-green-900 dark:text-green-100">₹{loanAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg p-4 border border-[#831C91]/20">
                <div className="text-xs text-[#831C91] dark:text-[#D552A3] mb-1 flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#831C91] rounded-full"></span>
                  Interest
                </div>
                <div className="text-lg font-bold text-[#831C91] dark:text-[#D552A3]">₹{totalInterest.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur rounded-lg p-4 border border-slate-300 dark:border-slate-600 mb-4">
              <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Payment</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹{totalPayment.toLocaleString('en-IN')}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Breakdown</div>
              <div className="flex h-3 rounded-full overflow-hidden shadow-inner">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-500 transition-all duration-700 ease-out"
                  style={{ width: `${principalPercent}%` }}
                />
                <div
                  className="bg-gradient-to-r from-[#831C91] to-[#D552A3] transition-all duration-700 ease-out"
                  style={{ width: `${interestPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs">
                <span className="text-green-700 dark:text-green-300 font-medium">{principalPercent.toFixed(1)}%</span>
                <span className="text-[#831C91] dark:text-[#D552A3] font-medium">{interestPercent.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* EMI Schedule Calendar */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Payment Schedule</h2>
            <Button size="sm" variant="outline" onClick={downloadSchedule}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </Button>
          </div>

          <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
            {schedule.map((item) => {
              const isSelected = selectedMonth === item.month
              const isPaid = item.status === 'paid'
              const isCurrent = item.status === 'current'
              const hasPrepayment = item.emi > monthlyEMI

              return (
                <div
                  key={item.month}
                  onClick={() => setSelectedMonth(isSelected ? null : item.month)}
                  className={`group p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg scale-[1.02] ring-2 ring-blue-200 dark:ring-blue-800'
                      : isCurrent
                        ? 'border-blue-400 dark:border-blue-600 bg-blue-50/70 dark:bg-blue-900/20 hover:shadow-md'
                        : isPaid
                          ? 'border-green-200 dark:border-green-800/50 bg-green-50/30 dark:bg-green-900/10 hover:shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md hover:scale-[1.01]'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${isPaid ? 'bg-green-500 text-white' :
                          isCurrent ? 'bg-blue-500 text-white animate-pulse' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                        {isPaid ? '✓' : item.month}
                      </div>
                      <div>
                        <div className={`text-sm font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                          }`}>
                          Month {item.month}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(item.date)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-base font-bold ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                        ₹{item.emi.toLocaleString('en-IN')}
                      </div>
                      {isCurrent && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-blue-500 text-white rounded-full">
                          Due Now
                        </span>
                      )}
                      {hasPrepayment && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-500 text-white rounded-full">
                          + Prepayment
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800 space-y-3 animate-slideDown">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/70 dark:bg-slate-900/50 rounded-lg p-3 border border-green-200 dark:border-green-800/50">
                          <div className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1 mb-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Principal
                          </div>
                          <div className="text-lg font-bold text-green-900 dark:text-green-100">₹{item.principal.toLocaleString('en-IN')}</div>
                        </div>
                        <div className="bg-white/70 dark:bg-slate-900/50 rounded-lg p-3 border border-[#831C91]/20">
                          <div className="text-xs text-[#831C91] dark:text-[#D552A3] flex items-center gap-1 mb-1">
                            <span className="w-2 h-2 bg-[#831C91] rounded-full"></span>
                            Interest
                          </div>
                          <div className="text-lg font-bold text-[#831C91] dark:text-[#D552A3]">₹{item.interest.toLocaleString('en-IN')}</div>
                        </div>
                      </div>
                      <div className="bg-white/70 dark:bg-slate-900/50 rounded-lg p-3 border border-slate-300 dark:border-slate-600">
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Remaining Balance</div>
                        <div className="text-xl font-bold text-slate-900 dark:text-slate-100">₹{item.balance.toLocaleString('en-IN')}</div>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <div className="bg-green-500 transition-all" style={{ width: `${(item.principal / item.emi) * 100}%` }} />
                        <div className="bg-[#831C91] transition-all" style={{ width: `${(item.interest / item.emi) * 100}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${isPaid ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            style={{ width: `${((item.month / schedule.length) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {Math.round((item.month / schedule.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {schedule.length === 0 && (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <svg className="w-20 h-20 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Adjust loan details to generate payment schedule</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
          transition: all 0.2s;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
        }
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #cbd5e1, #94a3b8);
          border-radius: 4px;
          transition: background 0.2s;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #475569, #334155);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #94a3b8, #64748b);
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
