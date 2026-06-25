'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, CheckCircle, Banknote, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { Badge } from '@/components/ui/Badge'
import { DownloadDropdown } from '@/components/ui/DownloadDropdown'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
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

const INTERVALS = ['7 Days', '14 Days', 'Monthly', 'Quarterly']

export function LoanListView({ filterStatus, title, subtitle, showApprove, showDisburse }: LoanListProps) {
  const { loans, customers, employees, loanTypes, approveLoan, disburseLoan, deleteLoan, updateLoan } = useStore()
  const { showToast, addNotification } = useUIStore()
  const router = useRouter()

  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [confirmAction, setConfirmAction] = useState<'approve' | 'disburse' | 'delete' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const [viewLoan, setViewLoan] = useState<Loan | null>(null)
  const [editLoan, setEditLoan] = useState<Loan | null>(null)
  const [editForm, setEditForm] = useState<Partial<Loan>>({})

  const filtered = filterStatus ? loans.filter(l => l.status === filterStatus) : loans
  const formatINR = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const openConfirm = (id: number, action: 'approve' | 'disburse' | 'delete') => {
    setConfirmId(id)
    setConfirmAction(action)
  }
  const closeConfirm = () => { setConfirmId(null); setConfirmAction(null) }

  const openView = (loan: Loan) => setViewLoan(loan)

  const openEdit = (loan: Loan) => {
    setEditLoan(loan)
    setEditForm({ ...loan })
  }

  const saveEdit = () => {
    if (!editLoan) return
    if (!editForm.amount || editForm.amount <= 0) { showToast('Valid amount is required', 'error'); return }
    updateLoan(editLoan.id, editForm)
    showToast(`Loan ${editLoan.loanNo} updated`, 'success')
    setEditLoan(null)
  }

  const execute = async () => {
    if (!confirmId || !confirmAction) return
    setActionLoading(true)
    try {
      const loan = loans.find(l => l.id === confirmId)
      if (confirmAction === 'approve') {
        approveLoan(confirmId)
        showToast(`Loan ${loan?.loanNo} approved`, 'success')
        addNotification('Loan Approved', `${loan?.loanNo} has been approved.`)
      } else if (confirmAction === 'disburse') {
        disburseLoan(confirmId)
        showToast(`Loan ${loan?.loanNo} disbursed — funds released`, 'success')
        addNotification('Loan Disbursed', `${loan?.loanNo} has been disbursed.`)
      } else {
        deleteLoan(confirmId)
        showToast(`Loan ${loan?.loanNo} deleted`, 'warning')
      }
    } finally {
      setActionLoading(false)
      closeConfirm()
    }
  }

  const enriched = filtered.map(l => ({
    ...l,
    customerName: customers.find(c => c.id === l.customerId)?.name ?? '—',
    employeeName: employees.find(e => e.id === l.employeeId)?.name ?? '—',
    amountFmt: formatINR(l.amount),
    dateFmt: format(new Date(l.loanDate), 'dd/MM/yyyy'),
  }))

  const actionBtn = (
    title: string,
    icon: React.ReactNode,
    onClick: () => void,
    color: string,
    hoverBg: string,
  ) => (
    <button
      title={title}
      aria-label={title}
      onClick={e => { e.stopPropagation(); onClick() }}
      className="p-1.5 rounded-lg transition-all duration-200 cursor-pointer"
      style={{ color }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {icon}
    </button>
  )

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 dark:text-slate-100 font-semibold text-right">{value || '—'}</span>
    </div>
  )

  const renderMobileCard = (row: typeof enriched[0]) => {
    const loan = row as unknown as Loan
    return (
      <div className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-snug">{row.customerName}</div>
            <div className="text-xs text-slate-400 mt-0.5">{loan.loanNo}</div>
            <div className="mt-1.5"><Badge status={loan.status} /></div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <DownloadDropdown loanId={loan.id} />
            {actionBtn('View Loan', <Eye size={13} />, () => openView(loan), COLORS.primary, COLORS.primaryAlpha12)}
            {actionBtn('Edit Loan', <Pencil size={13} />, () => openEdit(loan), '#F59E0B', 'rgba(245,158,11,0.12)')}
            {(showApprove || loan.status === 'pending') &&
              actionBtn('Approve', <CheckCircle size={13} />, () => openConfirm(loan.id, 'approve'), COLORS.green, COLORS.secondaryAlpha12)}
            {(showDisburse || loan.status === 'approved') &&
              actionBtn('Disburse', <Banknote size={13} />, () => openConfirm(loan.id, 'disburse'), COLORS.green, COLORS.secondaryAlpha12)}
            {actionBtn('Delete', <Trash2 size={13} />, () => openConfirm(loan.id, 'delete'), COLORS.rejected, 'rgba(239,68,68,0.1)')}
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
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
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
        exportTitle={title}
        mobileCard={renderMobileCard}
        columns={[
          { key: 'loanNo', header: 'Loan ID' },
          {
            key: 'customerName',
            header: 'Customer',
            accessor: (row) => {
              const loan = row as any
              const customer = customers.find(c => c.id === loan.customerId)
              return (
                <div className="flex items-center gap-2.5">
                  {customer?.photoUrl ? (
                    <img src={customer.photoUrl} alt={row.customerName} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: 'var(--border)' }} />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                      {row.customerName.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{row.customerName}</span>
                </div>
              )
            }
          },
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
                  {actionBtn('View Loan', <Eye size={14} />, () => openView(loan), COLORS.primary, COLORS.primaryAlpha12)}
                  {actionBtn('Edit Loan', <Pencil size={14} />, () => openEdit(loan), '#F59E0B', 'rgba(245,158,11,0.12)')}
                  {(showApprove || loan.status === 'pending') &&
                    actionBtn('Approve Loan', <CheckCircle size={14} />, () => openConfirm(loan.id, 'approve'), COLORS.green, COLORS.secondaryAlpha12)}
                  {(showDisburse || loan.status === 'approved') &&
                    actionBtn('Disburse Loan', <Banknote size={14} />, () => openConfirm(loan.id, 'disburse'), COLORS.green, COLORS.secondaryAlpha12)}
                  {actionBtn('Delete Loan', <Trash2 size={14} />, () => openConfirm(loan.id, 'delete'), COLORS.rejected, 'rgba(239,68,68,0.15)')}
                </div>
              )
            },
          },
        ]}
      />
 
      {/* ── View Loan Modal ── */}
      <Modal open={!!viewLoan} onClose={() => setViewLoan(null)} title="Loan Details" size="lg">
        {viewLoan && (() => {
          const customer = customers.find(c => c.id === viewLoan.customerId)
          const employee = employees.find(e => e.id === viewLoan.employeeId)
          const loanType = loanTypes.find(lt => lt.id === viewLoan.loanTypeId)
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  {customer?.photoUrl ? (
                    <img src={customer.photoUrl} alt={customer.name} className="w-14 h-14 rounded-2xl object-cover border-2 flex-shrink-0" style={{ borderColor: 'var(--accent)' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                      style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                      {customer?.name?.charAt(0) ?? '?'}
                    </div>
                  )}
                  <div>
                    <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{viewLoan.loanNo}</div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Customer: {customer?.name ?? '—'}</div>
                  </div>
                </div>
                <Badge status={viewLoan.status} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Loan Info</div>
                  <DetailRow label="Loan No" value={viewLoan.loanNo} />
                  <DetailRow label="Customer" value={customer?.name ?? '—'} />
                  <DetailRow label="Employee" value={employee?.name ?? '—'} />
                  <DetailRow label="Loan Type" value={loanType?.name ?? '—'} />
                  <DetailRow label="Status" value={viewLoan.status.charAt(0).toUpperCase() + viewLoan.status.slice(1)} />
                  <DetailRow label="Loan Date" value={format(new Date(viewLoan.loanDate), 'dd/MM/yyyy')} />
                  <DetailRow label="EMI Start" value={viewLoan.emiStartDate ? format(new Date(viewLoan.emiStartDate), 'dd/MM/yyyy') : '—'} />
                  <DetailRow label="Interval" value={viewLoan.intervalDays} />
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Financial Details</div>
                  <DetailRow label="Loan Amount" value={formatINR(viewLoan.amount)} />
                  <DetailRow label="Interest Rate" value={`${viewLoan.interestRate}%`} />
                  <DetailRow label="Interest Amount" value={formatINR(viewLoan.interestAmount)} />
                  <DetailRow label="Total Payable" value={formatINR(viewLoan.amount + viewLoan.interestAmount)} />
                  <DetailRow label="Installments" value={String(viewLoan.installments)} />
                  <DetailRow label="File Charges" value={formatINR(viewLoan.fileCharges)} />
                  <DetailRow label="Other Charges" value={formatINR(viewLoan.otherCharges)} />
                  {viewLoan.remarks && <DetailRow label="Remarks" value={viewLoan.remarks} />}
                </div>
              </div>
              {viewLoan.security && (
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Security</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <DetailRow label="Type" value={viewLoan.security.type?.toUpperCase() ?? '—'} />
                    {viewLoan.security.type === 'vehicle' && (
                      <>
                        <DetailRow label="Model" value={viewLoan.security.modelName ?? '—'} />
                        <DetailRow label="Reg No" value={viewLoan.security.regNo ?? '—'} />
                        <DetailRow label="Chassis No" value={viewLoan.security.chassisNo ?? '—'} />
                      </>
                    )}
                    {viewLoan.security.type === 'gold' && (
                      <>
                        <DetailRow label="Item" value={viewLoan.security.itemName ?? '—'} />
                        <DetailRow label="Weight" value={viewLoan.security.weight ? `${viewLoan.security.weight}g` : '—'} />
                        <DetailRow label="Pieces" value={String(viewLoan.security.pieces ?? '—')} />
                      </>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setViewLoan(null)}>Close</Button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* ── Edit Loan Modal ── */}
      <Modal open={!!editLoan} onClose={() => setEditLoan(null)} title="Edit Loan" size="lg">
        {editLoan && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Loan No" value={editLoan.loanNo} readOnly className="font-semibold text-slate-500" />
              <Select
                label="Customer"
                value={editForm.customerId ? String(editForm.customerId) : ''}
                onChange={e => setEditForm(p => ({ ...p, customerId: Number(e.target.value) }))}
                options={customers.map(c => ({ value: c.id, label: c.name }))}
                placeholder="Select Customer"
              />
              <Select
                label="Employee"
                value={editForm.employeeId ? String(editForm.employeeId) : ''}
                onChange={e => setEditForm(p => ({ ...p, employeeId: Number(e.target.value) }))}
                options={employees.map(e => ({ value: e.id, label: e.name }))}
                placeholder="Select Employee"
              />
              <Select
                label="Loan Type"
                value={editForm.loanTypeId ? String(editForm.loanTypeId) : ''}
                onChange={e => setEditForm(p => ({ ...p, loanTypeId: Number(e.target.value) }))}
                options={loanTypes.map(lt => ({ value: lt.id, label: lt.name }))}
                placeholder="Select Loan Type"
              />
              <Input
                label="Loan Amount (₹)"
                type="number"
                value={editForm.amount ?? ''}
                onChange={e => setEditForm(p => ({ ...p, amount: Number(e.target.value) }))}
                required
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                value={editForm.interestRate ?? ''}
                onChange={e => setEditForm(p => ({ ...p, interestRate: Number(e.target.value) }))}
              />
              <Input
                label="Installments"
                type="number"
                value={editForm.installments ?? ''}
                onChange={e => setEditForm(p => ({ ...p, installments: Number(e.target.value) }))}
              />
              <Select
                label="Interval"
                value={editForm.intervalDays ?? ''}
                onChange={e => setEditForm(p => ({ ...p, intervalDays: e.target.value }))}
                options={INTERVALS.map(i => ({ value: i, label: i }))}
                placeholder="Select Interval"
              />
              <Input
                label="Loan Date"
                type="date"
                value={editForm.loanDate ?? ''}
                onChange={e => setEditForm(p => ({ ...p, loanDate: e.target.value }))}
              />
              <Input
                label="EMI Start Date"
                type="date"
                value={editForm.emiStartDate ?? ''}
                onChange={e => setEditForm(p => ({ ...p, emiStartDate: e.target.value }))}
              />
              <Input
                label="File Charges (₹)"
                type="number"
                value={editForm.fileCharges ?? ''}
                onChange={e => setEditForm(p => ({ ...p, fileCharges: Number(e.target.value) }))}
              />
              <Input
                label="Other Charges (₹)"
                type="number"
                value={editForm.otherCharges ?? ''}
                onChange={e => setEditForm(p => ({ ...p, otherCharges: Number(e.target.value) }))}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Remarks"
                  value={editForm.remarks ?? ''}
                  onChange={e => setEditForm(p => ({ ...p, remarks: e.target.value }))}
                  placeholder="Optional remarks"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditLoan(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmId}
        title={confirmAction === 'delete' ? 'Delete Loan' : confirmAction === 'approve' ? 'Approve Loan' : 'Disburse Loan'}
        message={
          confirmAction === 'delete'
            ? 'Are you sure you want to delete this loan? This action cannot be undone.'
            : confirmAction === 'approve'
            ? 'Approve this loan application? The loan will move to Approved status.'
            : 'Mark this loan as disbursed? Funds will be released to the customer.'
        }
        confirmLabel={confirmAction === 'delete' ? 'Delete' : confirmAction === 'approve' ? 'Approve' : 'Disburse'}
        variant={confirmAction === 'delete' ? 'danger' : 'warning'}
        loading={actionLoading}
        onConfirm={execute}
        onCancel={closeConfirm}
      />
    </>
  )
}
