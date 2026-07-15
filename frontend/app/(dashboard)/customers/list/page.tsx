'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Eye } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { type Customer, type Branch, type Employee } from '@/store/appStore'
import { customersApi, branchesApi, employeesApi } from '@/lib/apiService'
import { toast } from '@/store/toastStore'
import { format } from 'date-fns'
import { COLORS } from '@/lib/colors'

export default function CustomerListPage() {
  const router = useRouter()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [editForm, setEditForm] = useState<Partial<Customer>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Customer | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [cRes, bRes, eRes] = await Promise.all([
        customersApi.getAll({ search, limit: 100 }),
        branchesApi.getAll(),
        employeesApi.getAll({ limit: 100 }),
      ])
      setCustomers(cRes?.customers || cRes || [])
      setBranches(bRes?.branches || bRes || [])
      setEmployees(eRes?.users || eRes || [])
    } catch (err: any) {
      toast.error('Failed to load customers', err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchAll() }, [fetchAll])

  const enriched = customers.map(c => ({
    ...c,
    branchName: branches.find(b => b.id === c.branchId)?.name ?? '—',
    employeeName: employees.find(e => e.id === c.employeeId)?.name ?? '—',
    regDateFmt: c.createdAt ? format(new Date(c.createdAt), 'dd/MM/yyyy') : '—',
  }))

  const openEdit = (c: Customer) => { setEditCustomer(c); setEditForm({ ...c }) }

  const saveEdit = async () => {
    if (!editCustomer) return
    setSaving(true)
    try {
      await customersApi.update(editCustomer.id, editForm)
      toast.success('Customer updated successfully')
      setEditCustomer(null)
      fetchAll()
    } catch (err: any) {
      toast.error('Update failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await customersApi.delete(confirmDelete.id)
      toast.success('Customer deleted')
      setConfirmDelete(null)
      fetchAll()
    } catch (err: any) {
      toast.error('Delete failed', err.message)
    } finally {
      setDeleting(false)
    }
  }

  const f = (v: string | undefined) => v || '—'

  const actionBtn = (title: string, icon: React.ReactNode, onClick: () => void, color: string, hoverBg: string) => (
    <button title={title} aria-label={title} onClick={e => { e.stopPropagation(); onClick() }}
      className="p-1.5 rounded-lg cursor-pointer transition-colors" style={{ color }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = hoverBg }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
      {icon}
    </button>
  )

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
        loading={loading}
        searchPlaceholder="Search customers..."
        exportTitle="Customer List"
        columns={[
          { key: 'appNo', header: 'App No' },
          {
            key: 'name', header: 'Customer Name',
            accessor: (row) => (
              <div className="flex items-center gap-2.5">
                {row.photoUrl ? (
                  <img src={row.photoUrl} alt={row.name} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: 'var(--border)' }} />
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                    {row.name?.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-slate-800 dark:text-slate-100">{row.name}</span>
              </div>
            )
          },
          { key: 'phone', header: 'Mobile' },
          { key: 'aadhaarNumber', header: 'Aadhaar' },
          { key: 'branchName', header: 'Branch' },
          { key: 'employeeName', header: 'Employee' },
          { key: 'regDateFmt', header: 'Reg. Date' },
          {
            key: 'actions', header: 'Actions', sortable: false,
            accessor: (row) => (
              <div className="flex gap-1.5">
                {actionBtn('View Details', <Eye size={13} />, () => setViewCustomer(row as Customer), COLORS.primary, COLORS.primaryAlpha12)}
                {actionBtn('Edit Customer', <Pencil size={13} />, () => openEdit(row as Customer), '#F59E0B', 'rgba(245,158,11,0.12)')}
                {actionBtn('Delete Customer', <Trash2 size={13} />, () => setConfirmDelete(row as Customer), COLORS.rejected, 'rgba(239,68,68,0.12)')}
              </div>
            ),
          },
        ]}
      />

      {/* View Modal */}
      <Modal open={!!viewCustomer} onClose={() => setViewCustomer(null)} title="Customer Details" size="lg">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              {viewCustomer.photoUrl ? (
                <img src={viewCustomer.photoUrl} alt={viewCustomer.name} className="w-16 h-16 rounded-2xl object-cover border-2" style={{ borderColor: 'var(--accent)' }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                  {viewCustomer.name?.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{viewCustomer.name}</div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>App No: {viewCustomer.appNo || '—'}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Personal Info</div>
                <DetailRow label="Father Name" value={f(viewCustomer.fatherName)} />
                <DetailRow label="Mother Name" value={f(viewCustomer.motherName)} />
                <DetailRow label="Date of Birth" value={f(viewCustomer.dob)} />
                <DetailRow label="Gender" value={f(viewCustomer.gender)} />
                <DetailRow label="Marital Status" value={f(viewCustomer.maritalStatus)} />
                <DetailRow label="Blood Group" value={f(viewCustomer.bloodGroup)} />
                <DetailRow label="Occupation" value={f(viewCustomer.occupation)} />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--text-secondary)' }}>Contact & IDs</div>
                <DetailRow label="Mobile" value={f(viewCustomer.phone)} />
                <DetailRow label="Alt Mobile" value={f(viewCustomer.altPhone)} />
                <DetailRow label="Email" value={f(viewCustomer.email)} />
                <DetailRow label="Aadhaar" value={f(viewCustomer.aadhaarNumber)} />
                <DetailRow label="PAN" value={f(viewCustomer.panNumber)} />
                <DetailRow label="Address" value={f(viewCustomer.address)} />
                <DetailRow label="Branch" value={branches.find(b => b.id === viewCustomer.branchId)?.name ?? '—'} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setViewCustomer(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editCustomer} onClose={() => setEditCustomer(null)} title="Edit Customer" size="lg">
        {editCustomer && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" required value={editForm.name ?? ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
              <Input label="Father Name" value={editForm.fatherName ?? ''} onChange={e => setEditForm(p => ({ ...p, fatherName: e.target.value }))} />
              <Input label="Mother Name" value={editForm.motherName ?? ''} onChange={e => setEditForm(p => ({ ...p, motherName: e.target.value }))} />
              <Input label="Date of Birth" type="date" value={editForm.dob ?? ''} onChange={e => setEditForm(p => ({ ...p, dob: e.target.value }))} />
              <Select label="Gender" value={editForm.gender ?? ''} onChange={e => setEditForm(p => ({ ...p, gender: e.target.value }))}
                options={[{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]} placeholder="Select Gender" />
              <Input label="Mobile" required value={editForm.phone ?? ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
              <Input label="Alt Mobile" value={editForm.altPhone ?? ''} onChange={e => setEditForm(p => ({ ...p, altPhone: e.target.value }))} />
              <Input label="Email" type="email" value={editForm.email ?? ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
              <Input label="Aadhaar" value={editForm.aadhaarNumber ?? ''} onChange={e => setEditForm(p => ({ ...p, aadhaarNumber: e.target.value }))} />
              <Input label="PAN" value={editForm.panNumber ?? ''} onChange={e => setEditForm(p => ({ ...p, panNumber: e.target.value }))} />
              <Input label="Occupation" value={editForm.occupation ?? ''} onChange={e => setEditForm(p => ({ ...p, occupation: e.target.value }))} />
              <Select label="Branch" value={editForm.branchId ?? ''} onChange={e => setEditForm(p => ({ ...p, branchId: e.target.value }))}
                options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Select Branch" />
              <div className="sm:col-span-2">
                <Input label="Address" value={editForm.address ?? ''} onChange={e => setEditForm(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setEditCustomer(null)}>Cancel</Button>
              <Button size="sm" loading={saving} onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}
