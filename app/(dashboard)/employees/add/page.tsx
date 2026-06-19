'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { getNextEmployeeCode, useStore } from '@/store/appStore'
import { useUIStore } from '@/store/uiStore'
import { User, Upload, X, Camera, CheckCircle, ShieldCheck } from 'lucide-react'

interface EmployeeForm { name: string; branchId: string; contact: string; role: string; email: string }
const ROLES = ['Loan Officer', 'Senior Officer', 'Branch Manager', 'Accountant', 'Field Agent']

export default function AddEmployeePage() {
  const { branches, employees, addEmployee } = useStore()
  const { showToast } = useUIStore()
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, reset } = useForm<EmployeeForm>()
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null)
  const [photoConfirmed, setPhotoConfirmed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const nextEmployeeCode = getNextEmployeeCode(employees)

  const onSubmit = (data: EmployeeForm) => {
    addEmployee({ ...data, branchId: Number(data.branchId) })
    const { addNotification } = useUIStore.getState()
    addNotification('New Employee Added', `${data.name} (${nextEmployeeCode}) has been successfully added to the system.`)
    showToast('Employee added successfully!', 'success')
    reset()
    router.push('/employees/list')
  }

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) { showToast('Please select an image file', 'error'); return }
    if (file.size > 5 * 1024 * 1024) { showToast('Image must be under 5MB', 'error'); return }
    setEmployeePhoto(file)
    setPhotoConfirmed(false)
  }

  const photoUrl = employeePhoto ? URL.createObjectURL(employeePhoto) : null

  return (
    <>
      <PageHeader title="Add Employee" subtitle="Fill in the details to register a new employee" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card title="Employee Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Employee Name" required placeholder="Full name" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Employee Code" value={nextEmployeeCode} readOnly className="font-semibold" />
            <Select label="Branch" required placeholder="Select Branch" options={branches.map(b => ({ value: b.id, label: b.name }))} error={errors.branchId?.message} {...register('branchId', { required: 'Required' })} />
            <Input label="Contact Number" required placeholder="10-digit mobile" error={errors.contact?.message} {...register('contact', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile' } })} />
            <Select label="Role / Designation" required placeholder="Select Role" options={ROLES.map(r => ({ value: r, label: r }))} error={errors.role?.message} {...register('role', { required: 'Required' })} />
            <Input label="Email ID" placeholder="employee@company.com" type="email" {...register('email')} />
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
                {/* Avatar placeholder */}
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

                {/* Photo with hover overlay */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 group"
                  style={{ border: '2px solid var(--accent)' }}>
                  <img src={photoUrl} alt="Employee" className="w-full h-full object-cover" />
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera size={20} className="text-white" />
                  </div>
                  {/* Confirmed / uploaded badge on thumbnail */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ background: photoConfirmed ? 'var(--success)' : 'var(--accent)' }}>
                    {photoConfirmed
                      ? <ShieldCheck size={13} className="text-white" />
                      : <CheckCircle size={13} className="text-white" />
                    }
                  </div>
                </div>

                {/* Info + actions */}
                <div className="flex-1 min-w-0">
                  {/* Uploaded / Confirmed status */}
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={14} style={{ color: photoConfirmed ? 'var(--success)' : 'var(--accent)' }} />
                    <span className="text-sm font-semibold" style={{ color: photoConfirmed ? 'var(--success)' : 'var(--accent)' }}>
                      {photoConfirmed ? 'Photo confirmed ✓' : 'Photo uploaded — please confirm'}
                    </span>
                  </div>
                  <p className="text-xs mb-3 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {employeePhoto?.name} · {employeePhoto ? (employeePhoto.size / 1024).toFixed(0) : 0} KB
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {/* Confirm button — shown only when not yet confirmed */}
                    {!photoConfirmed && (
                      <button
                        type="button"
                        onClick={() => { setPhotoConfirmed(true); showToast('Photo confirmed!', 'success') }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                        style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.35)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.22)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.12)')}
                      >
                        <ShieldCheck size={12} /> Confirm Photo
                      </button>
                    )}
                    {/* Confirmed badge */}
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

            {/* Hidden file input for upload zone click */}
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
        </Card>

        <div className="flex gap-3 mt-6 justify-end">
          <Button type="submit" size="lg">Save Employee</Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.push('/employees/list')}>Cancel</Button>
        </div>
      </form>
    </>
  )
}
