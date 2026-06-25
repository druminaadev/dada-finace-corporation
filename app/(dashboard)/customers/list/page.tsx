'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Eye, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useStore, type Customer } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { format } from 'date-fns'
import { COLORS } from '@/lib/colors'

export default function CustomerListPage() {
  const { customers, branches, employees, states, cities, areas, updateCustomer, deleteCustomer } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState<Partial<Customer>>({})
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const enriched = customers.map(c => ({
    ...c,
    branchName: branches.find(b => b.id === c.branchId)?.name ?? '—',
    employeeName: employees.find(e => e.id === c.employeeId)?.name ?? '—',
    regDateFmt: c.regDate ? format(new Date(c.regDate), 'dd/MM/yyyy') : '—',
  }))

  const openView = (c: Customer) => setViewCustomer(c)

  const openEdit = (c: Customer) => {
    setEditCustomer(c)
    setEditForm({ ...c })
  }

  const saveEdit = () => {
    if (!editCustomer) return
    if (!editForm.name?.trim()) { showToast('Name is required', 'error'); return }
    if (!editForm.mobile?.trim()) { showToast('Mobile is required', 'error'); return }
    updateCustomer(editCustomer.id, editForm)
    showToast('Customer updated successfully', 'success')
    setEditCustomer(null)
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      deleteCustomer(confirmDelete.id)
      showToast(`Customer "${confirmDelete.name}" deleted`, 'warning')
    } finally {
      setDeleting(false)
      setConfirmDelete(null)
    }
  }

  const f = (v: string | undefined) => v || '—'

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
      className="p-1.5 rounded-lg cursor-pointer transition-colors"
      style={{ color }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
    >
      {icon}
    </button>
  )

  const renderMobileCard = (row: typeof enriched[0]) => {
    const c = row as unknown as Customer
    return (
      <div className="mx-3 my-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 dark:text-slate-100 text-[15px] leading-snug truncate">{row.name}</div>
            <div className="text-xs text-slate-400 mt-0.5">{row.appNo}</div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {actionBtn('View Details', <Eye size={13} />, () => openView(c), COLORS.primary, COLORS.primaryAlpha12)}
            {actionBtn('Edit Customer', <Pencil size={13} />, () => openEdit(c), '#F59E0B', 'rgba(245,158,11,0.12)')}
            {actionBtn('Delete Customer', <Trash2 size={13} />, () => setConfirmDelete(c), COLORS.rejected, 'rgba(239,68,68,0.1)')}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3">
          {([
            ['Mobile', row.mobile],
            ['Aadhar', row.aadhar],
            ['Branch', row.branchName],
            ['Employee', row.employeeName],
            ['Reg. Date', row.regDateFmt],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</div>
              <div className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">{value || '—'}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 dark:text-slate-100 font-semibold text-right max-w-[60%] truncate">{value}</span>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Customer List"
        subtitle="View and manage all registered customers"
        action={{ label: 'Add Customer', onClick: () => router.push('/customers/add'), icon: <Plus size={14} /> }}
      />

      <StandardTable
        data={enriched}
        searchPlaceholder="Search customers..."
        exportTitle="Customer List"
        mobileCard={renderMobileCard}
        columns={[
          { key: 'appNo', header: 'App No' },
          {
            key: 'name',
            header: 'Customer Name',
            accessor: (row) => {
              const c = row as unknown as Customer
              return (
                <div className="flex items-center gap-2.5">
                  {c.photoUrl ? (
                    <img src={c.photoUrl} alt={c.name} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: 'var(--border)' }} />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{c.name}</span>
                </div>
              )
            }
          },
          { key: 'mobile', header: 'Mobile' },
          { key: 'aadhar', header: 'Aadhar' },
          { key: 'branchName', header: 'Branch' },
          { key: 'employeeName', header: 'Employee' },
          { key: 'regDateFmt', header: 'Reg. Date' },
          {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            accessor: (row) => {
              const c = row as unknown as Customer
              return (
                <div className="flex gap-1.5">
                  {actionBtn('View Details', <Eye size={13} />, () => openView(c), COLORS.primary, COLORS.primaryAlpha12)}
                  {actionBtn('Edit Customer', <Pencil size={13} />, () => openEdit(c), '#F59E0B', 'rgba(245,158,11,0.12)')}
                  {actionBtn('Delete Customer', <Trash2 size={13} />, () => setConfirmDelete(c), COLORS.rejected, 'rgba(239,68,68,0.12)')}
                </div>
              )
            },
          },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal open={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details" size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              {viewCustomer.photoUrl ? (
                <img src={viewCustomer.photoUrl} alt={viewCustomer.name} className="w-16 h-16 rounded-2xl object-cover border-2" style={{ borderColor: 'var(--accent)' }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                  {viewCustomer.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{viewCustomer.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>App No: {viewCustomer.appNo}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Personal Info</div>
                <DetailRow label="Father Name" value={f(viewCustomer.fatherName)} />
                <DetailRow label="Mother Name" value={f(viewCustomer.motherName)} />
                <DetailRow label="Date of Birth" value={f(viewCustomer.dob)} />
                <DetailRow label="Age" value={viewCustomer.age ? `${viewCustomer.age} yrs` : '—'} />
                <DetailRow label="Gender" value={f(viewCustomer.gender)} />
                <DetailRow label="Marital Status" value={f(viewCustomer.maritalStatus)} />
                <DetailRow label="Blood Group" value={f(viewCustomer.bloodGroup)} />
                <DetailRow label="Occupation" value={f(viewCustomer.occupation)} />
                <DetailRow label="Reg. Date" value={viewCustomer.regDate ? format(new Date(viewCustomer.regDate), 'dd/MM/yyyy') : '—'} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Contact & IDs</div>
                <DetailRow label="Mobile" value={f(viewCustomer.mobile)} />
                <DetailRow label="Alt Mobile" value={f(viewCustomer.altMobile)} />
                <DetailRow label="Email" value={f(viewCustomer.email)} />
                <DetailRow label="Aadhar" value={f(viewCustomer.aadhar)} />
                <DetailRow label="PAN" value={f(viewCustomer.pan)} />
                <DetailRow label="Address" value={f(viewCustomer.jobAddress)} />
                <DetailRow label="Branch" value={branches.find(b => b.id === viewCustomer.branchId)?.name ?? '—'} />
                <DetailRow label="Employee" value={employees.find(e => e.id === viewCustomer.employeeId)?.name ?? '—'} />
              </div>
            </div>
            {viewCustomer.bank && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Bank Details</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                  <DetailRow label="Account No" value={f(viewCustomer.bank.accountNo)} />
                  <DetailRow label="Holder Name" value={f(viewCustomer.bank.holderName)} />
                  <DetailRow label="Bank Name" value={f(viewCustomer.bank.bankName)} />
                  <DetailRow label="Branch" value={f(viewCustomer.bank.bankBranch)} />
                  <DetailRow label="IFSC" value={f(viewCustomer.bank.ifsc)} />
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewCustomer(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer" size="lg">
        {editCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" required value={editForm.name ?? ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} placeholder="Full name" />
              <Input label="Father Name" value={editForm.fatherName ?? ''} onChange={e => setEditForm(p => ({ ...p, fatherName: e.target.value }))} placeholder="Father's name" />
              <Input label="Mother Name" value={editForm.motherName ?? ''} onChange={e => setEditForm(p => ({ ...p, motherName: e.target.value }))} placeholder="Mother's name" />
              <Input label="Date of Birth" type="date" value={editForm.dob ?? ''} onChange={e => setEditForm(p => ({ ...p, dob: e.target.value }))} />
              <Select label="Gender" value={editForm.gender ?? ''} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }, { value: 'Other', label: 'Other' }]} placeholder="Select Gender" />
              <Select label="Marital Status" value={editForm.maritalStatus ?? ''} onChange={e => setEditForm(p => ({ ...p, maritalStatus: e.target.value }))}
                options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }, { value: 'Divorced', label: 'Divorced' }, { value: 'Widowed', label: 'Widowed' }]} placeholder="Select Status" />
              <Input label="Mobile" required value={editForm.mobile ?? ''} onChange={e => setEditForm(p => ({ ...p, mobile: e.target.value }))} placeholder="10-digit mobile" />
              <Input label="Alt Mobile" value={editForm.altMobile ?? ''} onChange={e => setEditForm(p => ({ ...p, altMobile: e.target.value }))} placeholder="Alternate mobile" />
              <Input label="Email" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} placeholder="Email address" />
              <Input label="Aadhar" value={editForm.aadhar ?? ''} onChange={e => setEditForm(p => ({ ...p, aadhar: e.target.value }))} placeholder="Aadhar number" />
              <Input label="PAN" value={editForm.pan ?? ''} onChange={e => setEditForm(p => ({ ...p, pan: e.target.value }))} placeholder="PAN number" />
              <Input label="Occupation" value={editForm.occupation ?? ''} onChange={e => setEditForm(p => ({ ...p, occupation: e.target.value }))} placeholder="Occupation" />
              <Select label="Branch" value={editForm.branchId ? String(editForm.branchId) : ''} onChange={e => setEditForm(p => ({ ...p, branchId: Number(e.target.value) }))}
                options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Select Branch" />
              <Select label="Employee" value={editForm.employeeId ? String(editForm.employeeId) : ''} onChange={e => setEditForm(p => ({ ...p, employeeId: Number(e.target.value) }))}
                options={employees.map(em => ({ value: em.id, label: em.name }))} placeholder="Select Employee" />
              <div className="sm:col-span-2">
                <Input label="Address" value={editForm.jobAddress ?? ''} onChange={e => setEditForm(p => ({ ...p, jobAddress: e.target.value }))} placeholder="Full address" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditCustomer(null)}>Cancel</Button>
              <Button size="sm" onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? All associated data will be permanently removed.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}
