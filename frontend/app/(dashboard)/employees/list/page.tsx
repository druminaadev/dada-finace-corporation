'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, Upload, X, Camera, CheckCircle, ShieldCheck, User } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StandardTable } from '@/components/ui/StandardTable'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useStore, type Employee } from '@/store/appStore'

const ROLES = ['Loan Officer', 'Senior Officer', 'Branch Manager', 'Accountant', 'Field Agent']

export default function EmployeeListPage() {
  const { employees, branches, updateEmployee, deleteEmployee } = useStore()
  
  const router = useRouter()
  const [editModal, setEditModal] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [form, setForm] = useState({ name: '', code: '', branchId: '', contact: '', role: '', email: '' })
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null)
  const [photoConfirmed, setPhotoConfirmed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const openEdit = (e: Employee) => {
    setEditing(e)
    setForm({ name: e.name, code: e.code, branchId: String(e.branchId), contact: e.contact, role: e.role, email: e.email })
    setEmployeePhoto(null)
    setPhotoConfirmed(false)
    setEditModal(true)
  }
  const save = () => {
    if (!editing) return
    updateEmployee(editing.id, { ...form, branchId: Number(form.branchId) })
    setEditModal(false)
  }

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    setEmployeePhoto(file)
    setPhotoConfirmed(false)
  }

  const photoUrl = employeePhoto ? URL.createObjectURL(employeePhoto) : null
  const enriched = employees.map(e => ({ ...e, branchName: branches.find(b => b.id === e.branchId)?.name ?? '—' }))

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
        columns={[
          { key: 'id', header: '#', width: 'w-12' },
          { key: 'code', header: 'Code' },
          { key: 'name', header: 'Name' },
          { key: 'role', header: 'Role' },
          { key: 'branchName', header: 'Branch' },
          { key: 'contact', header: 'Contact' },
          { key: 'email', header: 'Email' },
          {
            key: 'actions',
            header: 'Actions',
            sortable: false,
            accessor: (row) => (
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(row as unknown as Employee)}
                  className="p-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ color: 'var(--accent)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-tint)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => {
                    deleteEmployee((row as unknown as Employee).id)
                  }}
                  className="p-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ color: 'var(--error)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--error-tint)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ),
          },
        ]}
      />
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
          <Input label="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} type="email" />
        </div>

        {/* ── Photo Section ── */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Camera size={15} style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Employee Photo</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>(optional · max 5MB)</span>
          </div>

          {!photoUrl ? (
            /* ── Upload Zone ── */
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl cursor-pointer transition-all duration-200 py-10"
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
                background: dragOver ? 'var(--accent-tint)' : 'var(--hover)',
              }}
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
                  <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    Click to upload
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>or drag & drop</span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>PNG, JPG, WEBP up to 5MB</p>
              </div>
            </div>
          ) : (
            /* ── Preview ── */
            <div className="flex items-center gap-5 rounded-2xl p-4"
              style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 group"
                style={{ border: '2px solid var(--accent)' }}>
                <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={20} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: photoConfirmed ? 'var(--success)' : 'var(--accent)' }}>
                  {photoConfirmed
                    ? <ShieldCheck size={13} className="text-white" />
                    : <CheckCircle size={13} className="text-white" />
                  }
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={14} style={{ color: photoConfirmed ? 'var(--success)' : 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: photoConfirmed ? 'var(--success)' : 'var(--accent)' }}>
                    {photoConfirmed ? 'Photo confirmed ✓' : 'Photo uploaded — please confirm'}
                  </span>
                </div>
                <p className="text-xs mb-3 truncate" style={{ color: 'var(--text-secondary)' }}>
                  {employeePhoto.name} · {(employeePhoto.size / 1024).toFixed(0)} KB
                </p>
                <div className="flex flex-wrap gap-2">
                  {!photoConfirmed && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                      style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.35)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.22)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
                    >
                      <ShieldCheck size={12} /> Confirm Photo
                    </button>
                  )}
                  {photoConfirmed && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.35)' }}
                    >
                      <CheckCircle size={12} /> Confirmed
                    </span>
                  )}
                  <label
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    style={{ background: 'var(--accent-tint)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent)', (e.currentTarget as HTMLElement).style.color = '#fff')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent-tint)', (e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
                  >
                    <Upload size={12} /> Change Photo
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                  </label>
                  <button
                    type="button"
                    onClick={() => { setEmployeePhoto(null); setPhotoConfirmed(false); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--error)', border: '1px solid rgba(239,68,68,0.2)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                  >
                    <X size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {!photoUrl && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => handleFile(e.target.files?.[0])}
            />
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" size="sm" onClick={() => setEditModal(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={save}>
            Update
          </Button>
        </div>
      </Modal>
    </>
  )
}
