'use client'
import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Customer, Loan } from '@/store/appStore'

interface LoanSearchPickerProps {
  label: string
  loans: Loan[]
  customers: Customer[]
  value: string
  onChange: (loanId: string) => void
  placeholder?: string
}

export function LoanSearchPicker({
  label,
  loans,
  customers,
  value,
  onChange,
  placeholder = 'Search loan no, customer, mobile...',
}: LoanSearchPickerProps) {
  const [query, setQuery] = useState('')
  const selectedLoan = loans.find(loan => String(loan.id) === value)
  const selectedCustomer = selectedLoan ? customers.find(customer => customer.id === selectedLoan.customerId) : null

  const filteredLoans = useMemo(() => {
    const text = query.trim().toLowerCase()

    return loans
      .map(loan => {
        const customer = customers.find(item => item.id === loan.customerId)
        return { loan, customer }
      })
      .filter(({ loan, customer }) => {
        if (!text) return true

        return [
          loan.loanNo,
          loan.amount,
          loan.status,
          customer?.name,
          customer?.mobile,
          customer?.appNo,
        ]
          .filter(Boolean)
          .some(item => String(item).toLowerCase().includes(text))
      })
      .slice(0, 8)
  }, [customers, loans, query])

  const clearSelection = () => {
    onChange('')
    setQuery('')
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold text-[#6B6B6B] dark:text-gray-300">{label}</label>
        {selectedLoan && (
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300"
          >
            <X size={13} /> Clear
          </button>
        )}
      </div>

      {selectedLoan && selectedCustomer ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#462C7D]/20 bg-[#FFF5F8] px-3 py-2.5 dark:border-[#D552A3]/30 dark:bg-[#462C7D]/20">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
              {selectedLoan.loanNo} - {selectedCustomer.name}
            </p>
            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
              {selectedCustomer.mobile} | Rs. {selectedLoan.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={placeholder}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#462C7D] focus:ring-2 focus:ring-[#462C7D]/20 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            {filteredLoans.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-400 dark:text-slate-500">No loans found</div>
            ) : (
              filteredLoans.map(({ loan, customer }) => (
                <button
                  key={loan.id}
                  type="button"
                  onClick={() => {
                    onChange(String(loan.id))
                    setQuery('')
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2.5 text-left transition-colors last:border-b-0 hover:bg-[#FFF5F8] dark:border-slate-700 dark:hover:bg-[#462C7D]/20"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                      {loan.loanNo} - {customer?.name ?? 'N/A'}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {customer?.mobile ?? 'No mobile'} | Rs. {loan.amount.toLocaleString('en-IN')}
                    </span>
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold capitalize text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {loan.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
