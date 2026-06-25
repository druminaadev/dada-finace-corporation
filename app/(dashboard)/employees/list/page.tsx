'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Eye, Upload, X, Camera, CheckCircle, ShieldCheck, User } from 'lucide-react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStore, type Employee } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { COLORS } from '@/lib/colors'

const ROLES = ['Loan Officer', 'Senior Officer', 'Branch Manager', 'Accountant', 'Field Agent']

export default function EmployeeListPage() {
  const { employees, branches, updateEmployee, deleteEmployee } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()

  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null)
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState({ name: '', code: '', branchId: '', contact: '', role: '', email: '' })
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState('')
  const [photoConfirmed, setPhotoConfirmed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null)

  const openView = (e: Employee) => setViewEmployee(e)

  const openEdit = (e: Employee) => {
    setEditing(e)
    setForm({ name: e.name, code: e.code, branchId: String(e.branchId), contact: e.contact, role: e.role, email: e.email })
    setEmployeePhoto(null)
    setCurrentPhotoUrl(e.photoUrl || '')
    setPhotoConfirmed(!!e.photoUrl)
    setEditModal(true)
  }

  const save = () => {
    if (!editing) return
    if (!form.name.trim()) { showToast('Name is required', 'error'); return }
    if (!form.contact.trim()) { showToast('Contact is required', 'error'); return }
    if (!/^[6-9]\d{9}$/.test(form.contact.trim())) { showToast('Valid 10-digit contact number is required', 'error'); return }
    if (!form.branchId) { showToast('Branch is required', 'error'); return }
    if (!form.role) { showToast('Role is required', 'error'); return }
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) { showToast('Valid Email is required', 'error'); return }
    if (employeePhoto && !photoConfirmed) {
      showToast('Please confirm the employee photo', 'error')
      return
    }

    const updateDetails = (pUrl?: string) => {
      updateEmployee(editing.id, {
        ...form,
        branchId: Number(form.branchId),
        photoUrl: pUrl !== undefined ? pUrl : currentPhotoUrl
      })
      showToast('Employee updated', 'success')
      setEditModal(false)
    }

    if (employeePhoto) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateDetails(reader.result as string)
      }
      reader.readAsDataURL(employeePhoto)
    } else {
      updateDetails()
    }
  }

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    setEmployeePhoto(file)
    setPhotoConfirmed(false)
  }

  const photoUrl = employeePhoto ? URL.createObjectURL(employeePhoto) : currentPhotoUrl
  const enriched = employees.map(e => ({ ...e, branchName: branches.find(b => b.id === e.branchId)?.name ?? '—' }))

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

  const DetailRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 text-sm border-b border-slate-100 dark:border-slate-700 last:border-0">
      <span className="text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      <span className="text-slate-800 dark:text-slate-100 font-semibold text-right">{value || '—'}</span>
    </div>
  )

  const renderMobileCard = (row: typeof enriched[0]) => (
    <div className="mx-4 my-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-100 text-base leading-tight">{row.name}</div>
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{row.code}</div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {actionBtn('View Employee', <Eye size={13} />, () => openView(row as unknown as Employee), COLORS.primary, COLORS.primaryAlpha12)}
          {actionBtn('Edit Employee', <Pencil size={13} />, () => openEdit(row as unknown as Employee), '#F59E0B', 'rgba(245,158,11,0.12)')}
          {actionBtn('Delete Employee', <Trash2 size={13} />, () => setConfirmDelete(row as unknown as Employee), COLORS.rejected, 'rgba(239,68,68,0.1)')}
        </div>
      </div>
      <div className="inline-block mb-3 px-2.5 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
        {row.role}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        {([
          ['Branch', row.branchName],
          ['Contact', row.contact],
          ['Email', row.email],
        ] as [string, string][]).map(([label, value]) => (
          <div key={label}>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</div>
            <div className="text-xs text-slate-700 dark:text-slate-300 truncate mt-0.5">{value || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        title="Employee List"
        subtitle="View and manage all employees"
        action={{ label: 'Add Employee', onClick: () => router.push('/employees/add'), icon: <Plus size={14} /> }}
      />
      <StandardTable
        data={enriched}
        searchPlaceholder="Search employees..."
        exportTitle="Employee List"
        mobileCard={renderMobileCard}
        columns={[
          { key: 'id', header: '#', width: 'w-12' },
          { key: 'code', header: 'Code' },
          {
            key: 'name',
            header: 'Name',
            accessor: (row) => {
              const e = row as unknown as Employee
              return (
                <div className="flex items-center gap-2.5">
                  {e.photoUrl ? (
                    <img src={e.photoUrl} alt={e.name} className="w-8 h-8 rounded-full object-cover border" style={{ borderColor: 'var(--border)' }} />
                  ) : (
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                      {e.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-semibold text-slate-800 dark:text-slate-100">{e.name}</span>
                </div>
              )
            }
          },
          { key: 'role', header: 'Role' },
          { key: 'branchName', header: 'Branch' },
          { key: 'contact', header: 'Contact' },
          { key: 'email', header: 'Email' },
          {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            accessor: (row) => (
              <div className="flex gap-1.5">
                {actionBtn('View Employee', <Eye size={13} />, () => openView(row as unknown as Employee), COLORS.primary, COLORS.primaryAlpha12)}
                {actionBtn('Edit Employee', <Pencil size={13} />, () => openEdit(row as unknown as Employee), '#F59E0B', 'rgba(245,158,11,0.12)')}
                {actionBtn('Delete Employee', <Trash2 size={13} />, () => setConfirmDelete(row as unknown as Employee), COLORS.rejected, 'rgba(239,68,68,0.12)')}
              </div>
            ),
          },
        ]}
      />

      {/* ── View Modal ── */}
      <Modal open={!!viewEmployee} onClose={() => setViewEmployee(null)} title="Employee Details" size="md">
        {viewEmployee && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
              {viewEmployee.photoUrl ? (
                <img src={viewEmployee.photoUrl} alt={viewEmployee.name} className="w-14 h-14 rounded-2xl object-cover border-2 flex-shrink-0" style={{ borderColor: 'var(--accent)' }} />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
                  style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                  {viewEmployee.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{viewEmployee.name}</div>
                <div className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{viewEmployee.role}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Code: {viewEmployee.code}</div>
              </div>
            </div>
            <DetailRow label="Employee ID" value={String(viewEmployee.id)} />
            <DetailRow label="Employee Code" value={viewEmployee.code} />
            <DetailRow label="Full Name" value={viewEmployee.name} />
            <DetailRow label="Role" value={viewEmployee.role} />
            <DetailRow label="Branch" value={branches.find(b => b.id === viewEmployee.branchId)?.name ?? '—'} />
            <DetailRow label="Contact" value={viewEmployee.contact} />
            <DetailRow label="Email" value={viewEmployee.email || '—'} />
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Edit Employee">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Code" value={form.code} readOnly className="font-semibold text-slate-500 dark:text-slate-300" />
          <Select
            label="Branch"
            value={form.branchId}
            onChange={e => setForm(p => ({ ...p, branchId: e.target.value }))}
            options={branches.map(b => ({ value: b.id, label: b.name }))}
            placeholder="Select Branch"
            required
          />
          <Input label="Contact" value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} required />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
            options={ROLES.map(r => ({ value: r, label: r }))}
            placeholder="Select Role"
            required
          />
          <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" required />
        </div>

        {/* Photo Section */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Camera size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Employee Photo</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>(optional · max 5MB)</span>
          </div>
          {!photoUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all duration-200 py-10"
              style={{ border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`, background: dragOver ? 'var(--accent-tint)' : 'var(--hover)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
              onMouseLeave={e => { if (!dragOver) e.currentTarget.style.borderColor = 'var(--border)' }}
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
                <User size={36} style={{ color: 'var(--text-secondary)' }} />
              </div>
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center mb-1">
                  <Upload size={15} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Click to upload</span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>or drag & drop</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>PNG, JPG, WEBP up to 5MB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-5 rounded-2xl p-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 group" style={{ border: '2px solid var(--accent)' }}>
                <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => fileInputRef.current?.click()}>
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{employeePhoto ? employeePhoto.name : 'Current Photo'}</p>
                {employeePhoto && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{(employeePhoto.size / 1024).toFixed(0)} KB</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {!photoConfirmed ? (
                    <button type="button" onClick={() => { setPhotoConfirmed(true); showToast('Photo confirmed!', 'success') }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                      style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.35)' }}>
                      <ShieldCheck size={12} /> Confirm Photo
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.35)' }}>
                      <CheckCircle size={12} /> Confirmed
                    </span>
                  )}
                  <button type="button"
                    onClick={() => { setEmployeePhoto(null); setCurrentPhotoUrl(''); setPhotoConfirmed(false); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setEditModal(false)}>Cancel</Button>
          <Button size="sm" onClick={save}>Update</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Employee"
        message={`Are you sure you want to delete employee "${confirmDelete?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={() => { deleteEmployee(confirmDelete!.id); showToast('Employee deleted', 'warning'); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  )
}
