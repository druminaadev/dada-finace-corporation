'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, CheckCircle, Banknote, Download } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { Badge } from '@/components/ui/Badge'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { COLORS } from '@/lib/colors'
import { useStore, type Loan } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { format } from 'date-fns'

interface LoanListProps {
  filterStatus?: 'pending' | 'approved' | 'disbursed'
  title: string
  subtitle?: string
  showApprove?: boolean
  showDisburse?: boolean
}

export function LoanListView({ filterStatus, title, subtitle, showApprove, showDisburse }: LoanListProps) {
  const { loans, customers, employees, approveLoan, disburseLoan, deleteLoan } = useStore()
  const { showToast, addNotification } = useUIStore()
  const router = useRouter()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'disburse' | 'delete' | null>(null)

  const filtered = filterStatus ? loans.filter(l => l.status === filterStatus) : loans
  const formatINR = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const confirm = (id: number, action: 'approve' | 'disburse' | 'delete') => {
    setConfirmId(id); setConfirmAction(action)
  }

  const execute = () => {
    if (!confirmId || !confirmAction) return
    const loan = loans.find(l => l.id === confirmId)
    if (confirmAction === 'approve') {
      approveLoan(confirmId)
      showToast(`Loan ${loan?.loanNo} approved — moved to Approved list`, 'success')
      addNotification('Loan Approved', `${loan?.loanNo} has been approved.`)
    } else if (confirmAction === 'disburse') {
      disburseLoan(confirmId)
      showToast(`Loan ${loan?.loanNo} disbursed — funds released`, 'success')
      addNotification('Loan Disbursed', `${loan?.loanNo} has been disbursed.`)
    } else {
      deleteLoan(confirmId)
      showToast(`Loan ${loan?.loanNo} deleted`, 'warning')
    }
    setConfirmId(null); setConfirmAction(null)
  }

  const enriched = filtered.map(l => ({
    ...l,
    customerName: customers.find(c => c.id === l.customerId)?.name ?? '—',
    employeeName: employees.find(e => e.id === l.employeeId)?.name ?? '—',
    amountFmt: formatINR(l.amount),
    dateFmt: format(new Date(l.loanDate), 'dd/MM/yyyy'),
  }))

  const renderMobileCard = (row: typeof enriched[0]) => {
    const loan = row as unknown as Loan
    return (
      <div className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-snug">{row.customerName}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{loan.loanNo}</div>
            <div className="mt-1.5"><Badge status={loan.status} /></div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DownloadDropdown loanId={loan.id} />
            <button title="Edit" onClick={() => router.push(`/customers/${loan.customerId}/details`)}
              className="p-2 rounded-xl" style={{ color: COLORS.primary, background: COLORS.primaryAlpha12 }}>
              <Pencil size={13} />
            </button>
            {(showApprove || loan.status === 'pending') && (
              <button title="Approve" onClick={() => confirm(loan.id, 'approve')}
                className="p-2 rounded-xl" style={{ color: COLORS.green, background: COLORS.secondaryAlpha12 }}>
                <CheckCircle size={13} />
              </button>
            )}
            {(showDisburse || loan.status === 'approved') && (
              <button title="Disburse" onClick={() => confirm(loan.id, 'disburse')}
                className="p-2 rounded-xl" style={{ color: COLORS.green, background: COLORS.secondaryAlpha12 }}>
                <Banknote size={13} />
              </button>
            )}
            <button title="Delete" onClick={() => confirm(loan.id, 'delete')}
              className="p-2 rounded-xl" style={{ color: COLORS.rejected, background: 'rgba(239,68,68,0.1)' }}>
              <Trash2 size={13} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
          {([
            ['Amount', row.amountFmt],
            ['Employee', row.employeeName],
            ['EMIs', String(loan.installments)],
            ['Rate %', String(loan.interestRate)],
            ['Date', row.dateFmt],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader 
        title={title} 
        subtitle={subtitle}
        action={{ label: 'Add Loan', onClick: () => router.push('/loans/add'), icon: <Plus size={14} /> }} 
      />
      <StandardTable
        data={enriched}
        searchPlaceholder="Search loans..."
        mobileCard={renderMobileCard}
        columns={[
          { key: 'loanNo', header: 'Loan ID' },
          { key: 'customerName', header: 'Customer' },
          { key: 'employeeName', header: 'Employee' },
          { key: 'amountFmt', header: 'Amount' },
          { key: 'installments', header: 'EMIs' },
          { key: 'interestRate', header: 'Rate %' },
          { key: 'status', header: 'Status', sortable: false, accessor: (row) => <Badge status={(row as unknown as Loan).status} /> },
          { key: 'dateFmt', header: 'Date' },
          {
            key: 'actions', header: 'Actions', sortable: false, accessor: (row) => {
              const loan = row as unknown as Loan
              return (
                <div className="flex items-center gap-1 flex-nowrap">
                  <DownloadDropdown loanId={loan.id} />
                  <button title="View Details" onClick={() => router.push(`/customers/${loan.customerId}/details`)}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: COLORS.primary }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = COLORS.primaryAlpha12
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}>
                    <Pencil size={14} />
                  </button>
                  {(showApprove || loan.status === 'pending') && (
                    <button title="Approve" onClick={() => confirm(loan.id, 'approve')}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: COLORS.green }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = COLORS.secondaryAlpha12
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}>
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {(showDisburse || loan.status === 'approved') && (
                    <button title="Disburse" onClick={() => confirm(loan.id, 'disburse')}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: COLORS.green }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = COLORS.secondaryAlpha12
                        e.currentTarget.style.transform = 'scale(1.1)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.transform = 'scale(1)'
                      }}>
                      <Banknote size={14} />
                    </button>
                  )}
                  <button title="Delete" onClick={() => confirm(loan.id, 'delete')}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: COLORS.rejected }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              )
            }
          },
        ]}
      />
      <Modal open={!!confirmId} onClose={() => { setConfirmId(null); setConfirmAction(null) }} title="Confirm Action" size="sm">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          {confirmAction === 'delete' ? 'Are you sure you want to delete this loan? This cannot be undone.'
            : confirmAction === 'approve' ? 'Approve this loan application?'
            : 'Mark this loan as disbursed?'}
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={() => { setConfirmId(null); setConfirmAction(null) }}>Cancel</Button>
          <Button size="sm"
            variant={confirmAction === 'delete' ? 'danger' : confirmAction === 'approve' ? 'success' : 'primary'}
            onClick={execute}>
            {confirmAction === 'delete' ? 'Delete' : confirmAction === 'approve' ? 'Approve' : 'Disburse'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
