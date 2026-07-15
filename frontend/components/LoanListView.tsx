'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, CheckCircle, Banknote } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { Badge } from '@/components/ui/Badge'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { COLORS } from '@/lib/colors'
import { loansApi } from '@/lib/apiService'
import { toast } from '@/store/toastStore'
import { type Loan } from '@/store/appStore'
import { format } from 'date-fns'

interface LoanListProps {
  filterStatus?: 'pending' | 'approved' | 'disbursed'
  title: string
  subtitle?: string
  showApprove?: boolean
  showDisburse?: boolean
}

export function LoanListView({ filterStatus, title, subtitle, showApprove, showDisburse }: LoanListProps) {
  const router = useRouter()
  const [loans, setLoans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'disburse' | 'delete' | null>(null)
  const [acting, setActing] = useState(false)

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true)
      const data = await loansApi.getAll(filterStatus ? { status: filterStatus } : undefined)
      setLoans(data?.loans ?? data ?? [])
    } catch {
      toast.error('Failed to load loans')
    } finally {
      setLoading(false)
    }
  }, [filterStatus])

  useEffect(() => { fetchLoans() }, [fetchLoans])

  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const confirm = (id: string, action: 'approve' | 'disburse' | 'delete') => {
    setConfirmId(id); setConfirmAction(action)
  }

  const execute = async () => {
    if (!confirmId || !confirmAction) return
    setActing(true)
    try {
      if (confirmAction === 'approve') {
        await loansApi.approve(confirmId)
        toast.success('Loan approved successfully')
      } else if (confirmAction === 'disburse') {
        await loansApi.disburse(confirmId)
        toast.success('Loan disbursed successfully')
      } else {
        await loansApi.delete(confirmId)
        toast.success('Loan deleted')
      }
      await fetchLoans()
    } catch (e: any) {
      toast.error(e.message || 'Action failed')
    } finally {
      setActing(false)
      setConfirmId(null); setConfirmAction(null)
    }
  }

  const enriched = loans.map(l => ({
    ...l,
    customerName: l.customer?.name ?? l.customerName ?? '—',
    employeeName: l.employee?.name ?? l.employeeName ?? '—',
    amountFmt: formatINR(l.amount ?? 0),
    dateFmt: l.loanDate ? format(new Date(l.loanDate), 'dd/MM/yyyy') : '—',
  }))

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={{ label: 'Add Loan', onClick: () => router.push('/loans/add'), icon: <Plus size={14} /> }}
      />
      <StandardTable
        data={enriched}
        loading={loading}
        searchPlaceholder="Search loans..."
        columns={[
          { key: 'loanNo', header: 'Loan ID' },
          { key: 'customerName', header: 'Customer' },
          { key: 'employeeName', header: 'Employee' },
          { key: 'amountFmt', header: 'Amount' },
          { key: 'installments', header: 'EMIs' },
          { key: 'interestRate', header: 'Rate %' },
          { key: 'status', header: 'Status', sortable: false, accessor: (row) => <Badge status={(row as any).status} /> },
          { key: 'dateFmt', header: 'Date' },
          {
            key: 'actions', header: 'Actions', sortable: false, accessor: (row) => {
              const loan = row as any
              return (
                <div className="flex items-center gap-1 flex-nowrap">
                  <DownloadDropdown loanId={loan.id} />
                  <button title="View Details" onClick={() => router.push(`/customers/${loan.customerId}/details`)}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: COLORS.primary }}
                    onMouseEnter={e => { e.currentTarget.style.background = COLORS.primaryAlpha12; e.currentTarget.style.transform = 'scale(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
                    <Pencil size={14} />
                  </button>
                  {(showApprove || loan.status === 'pending') && (
                    <button title="Approve" onClick={() => confirm(loan.id, 'approve')}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: COLORS.green }}
                      onMouseEnter={e => { e.currentTarget.style.background = COLORS.secondaryAlpha12; e.currentTarget.style.transform = 'scale(1.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
                      <CheckCircle size={14} />
                    </button>
                  )}
                  {(showDisburse || loan.status === 'approved') && (
                    <button title="Disburse" onClick={() => confirm(loan.id, 'disburse')}
                      className="p-1.5 rounded-lg transition-all duration-200"
                      style={{ color: COLORS.green }}
                      onMouseEnter={e => { e.currentTarget.style.background = COLORS.secondaryAlpha12; e.currentTarget.style.transform = 'scale(1.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
                      <Banknote size={14} />
                    </button>
                  )}
                  <button title="Delete" onClick={() => confirm(loan.id, 'delete')}
                    className="p-1.5 rounded-lg transition-all duration-200"
                    style={{ color: COLORS.rejected }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'; e.currentTarget.style.transform = 'scale(1.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)' }}>
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
          <Button size="sm" disabled={acting}
            variant={confirmAction === 'delete' ? 'danger' : confirmAction === 'approve' ? 'success' : 'primary'}
            onClick={execute}>
            {acting ? 'Processing...' : confirmAction === 'delete' ? 'Delete' : confirmAction === 'approve' ? 'Approve' : 'Disburse'}
          </Button>
        </div>
      </Modal>
    </>
  )
}
