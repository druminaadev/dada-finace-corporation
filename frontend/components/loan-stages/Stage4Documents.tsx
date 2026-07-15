'use client'
import { useState } from 'react'
import { useLoanDraftStore, UploadedFile } from '@/store/loanDraftStore'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, Image, CheckCircle, X, Trash2 } from 'lucide-react'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const DOCUMENT_CATEGORIES = {
  customer: [
    { id: 'identity_proof', label: 'Identity Proof (Aadhaar/Passport)', required: true },
    { id: 'pan_card', label: 'PAN Card', required: true },
    { id: 'passport_photo', label: 'Passport Size Photo', required: true },
    { id: 'address_proof', label: 'Address Proof', required: true },
    { id: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true },
    { id: 'income_proof', label: 'Income Proof (Salary Slip/ITR)', required: true },
  ],
  nominee: [
    { id: 'nominee_identity', label: 'Nominee Identity Proof', required: true },
    { id: 'nominee_address', label: 'Nominee Address Proof', required: true },
  ],
  guarantor: [
    { id: 'guarantor_identity', label: 'Guarantor Identity Proof', required: true },
    { id: 'guarantor_pan', label: 'Guarantor PAN Card', required: true },
    { id: 'guarantor_address', label: 'Guarantor Address Proof', required: true },
  ],
  vehicle: [
    { id: 'rc_book', label: 'RC Book', required: true },
    { id: 'insurance', label: 'Insurance Copy', required: true },
    { id: 'vehicle_images', label: 'Vehicle Images (Front/Back/Sides)', required: true },
    { id: 'invoice', label: 'Purchase Invoice', required: true },
  ],
}

interface DocumentUploadProps {
  category: string
  label: string
  required: boolean
  files: UploadedFile[]
  onUpload: (file: UploadedFile) => void
  onRemove: (fileName: string) => void
}

function DocumentUpload({ category, label, required, files, onUpload, onRemove }: DocumentUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [uploadingFile, setUploadingFile] = useState<{ name: string; progress: number } | null>(null)
  

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    setUploadingFile({ name: file.name, progress: 0 })
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadingFile(null)
        onUpload({
          category,
          fileName: file.name,
          size: file.size,
        })
      } else {
        setUploadingFile({ name: file.name, progress })
      }
    }, 200)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const uploaded = files.filter((f) => f.category === category)

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        {label}
        {required && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Required</span>}
      </label>

      {uploaded.length > 0 ? (
        <div className="space-y-2">
          {uploaded.map((file) => (
            <div
              key={file.fileName}
              className="flex items-center justify-between p-3 rounded-lg border"
              style={{ background: 'var(--accent-tint)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle size={20} style={{ color: confirmed[file.fileName] ? 'var(--success)' : 'var(--text-secondary)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {file.fileName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!confirmed[file.fileName] && (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmed(prev => ({ ...prev, [file.fileName]: true }))
                    }}
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                  >
                    Confirm
                  </button>
                )}
                {confirmed[file.fileName] && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--success)', color: '#fff' }}>Confirmed</span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    onRemove(file.fileName)
                    setConfirmed(prev => { const c = { ...prev }; delete c[file.fileName]; return c })
                  }}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: '#ef4444' }}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : uploadingFile ? (
        <div className="flex flex-col justify-center gap-3 p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
          <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
            <span className="truncate max-w-[70%]">Uploading {uploadingFile.name}...</span>
            <span>{uploadingFile.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{ width: `${uploadingFile.progress}%`, background: 'var(--primary)' }}
            />
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleChange}
            className="hidden"
          />
          <div
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
              dragActive ? 'border-[var(--primary)] bg-[var(--primary)]/5 scale-105' : 'border-gray-300 dark:border-gray-700 hover:border-[var(--primary)] hover:bg-[var(--hover)]'
            }`}
            style={{ background: dragActive ? 'var(--accent-tint)' : 'var(--surface)' }}
          >
            <Upload size={40} className="mx-auto mb-3" style={{ color: dragActive ? 'var(--accent)' : 'var(--text-secondary)' }} />
            <p className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Click to upload or drag and drop
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              PDF, JPG, PNG or GIF (Max 5MB)
            </p>
          </div>
        </label>
      )}
    </div>
  )
}

export default function Stage4Documents() {
  const { token } = useAuthStore()
  const { stage4, setStage4, completeStage, setCurrentStage, stage2, draftId } = useLoanDraftStore()
  
  const [saving, setSaving] = useState(false)

  const handleUpload = (category: 'customerDocs' | 'nomineeDocs' | 'guarantorDocs' | 'vehicleDocs', file: UploadedFile) => {
    setStage4({
      [category]: [...stage4[category], file],
    })
  }

  const handleRemove = (category: 'customerDocs' | 'nomineeDocs' | 'guarantorDocs' | 'vehicleDocs', fileName: string) => {
    setStage4({
      [category]: stage4[category].filter((f) => f.fileName !== fileName),
    })
  }

  const saveStage4 = async () => {
    if (!FRONTEND_ONLY) {
      const res = await fetch(`${API_BASE}/loan-application/drafts/${draftId}/stage/4`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          customerDocs: stage4.customerDocs,
          nomineeDocs: stage4.nomineeDocs,
          guarantorDocs: stage4.guarantorDocs,
          vehicleDocs: stage4.vehicleDocs,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save Stage 4 details')
    }
  }

  const handleNext = async () => {
    // Check required documents for Customer
    const requiredCustomerDocs = DOCUMENT_CATEGORIES.customer.filter((d) => d.required)
    const uploadedCustomerCategories = new Set(stage4.customerDocs.map((d) => d.category))
    const missingDocs = requiredCustomerDocs.filter((d) => !uploadedCustomerCategories.has(d.id))
    if (missingDocs.length > 0) {
      return
    }

    // Check required documents for Nominee
    const requiredNomineeDocs = DOCUMENT_CATEGORIES.nominee.filter((d) => d.required)
    const uploadedNomineeCategories = new Set(stage4.nomineeDocs.map((d) => d.category))
    const missingNomineeDocs = requiredNomineeDocs.filter((d) => !uploadedNomineeCategories.has(d.id))
    if (missingNomineeDocs.length > 0) {
      return
    }

    // Check required documents for Guarantor
    const requiredGuarantorDocs = DOCUMENT_CATEGORIES.guarantor.filter((d) => d.required)
    const uploadedGuarantorCategories = new Set(stage4.guarantorDocs.map((d) => d.category))
    const missingGuarantorDocs = requiredGuarantorDocs.filter((d) => !uploadedGuarantorCategories.has(d.id))
    if (missingGuarantorDocs.length > 0) {
      return
    }

    // Check required documents for Vehicle (if applicable)
    if (isVehicleLoan) {
      const requiredVehicleDocs = DOCUMENT_CATEGORIES.vehicle.filter((d) => d.required)
      const uploadedVehicleCategories = new Set(stage4.vehicleDocs.map((d) => d.category))
      const missingVehicleDocs = requiredVehicleDocs.filter((d) => !uploadedVehicleCategories.has(d.id))
      if (missingVehicleDocs.length > 0) {
        return
      }
    }

    setSaving(true)
    try {
      await saveStage4()
      completeStage(4)
      setCurrentStage(5)
    } catch (err: any) {
    } finally {
      setSaving(false)
    }
  }

  const isVehicleLoan = stage2.loanDetails.loanCategory === 'VEHICLE'

  return (
    <div className="space-y-6">
      {/* Customer Documents */}
      <Card title="Customer Documents" icon={<FileText size={18} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_CATEGORIES.customer.map((doc) => (
            <DocumentUpload
              key={doc.id}
              category={doc.id}
              label={doc.label}
              required={doc.required}
              files={stage4.customerDocs}
              onUpload={(file) => handleUpload('customerDocs', file)}
              onRemove={(fileName) => handleRemove('customerDocs', fileName)}
            />
          ))}
        </div>
      </Card>

      {/* Nominee Documents */}
      <Card title="Nominee Documents" icon={<FileText size={18} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_CATEGORIES.nominee.map((doc) => (
            <DocumentUpload
              key={doc.id}
              category={doc.id}
              label={doc.label}
              required={doc.required}
              files={stage4.nomineeDocs}
              onUpload={(file) => handleUpload('nomineeDocs', file)}
              onRemove={(fileName) => handleRemove('nomineeDocs', fileName)}
            />
          ))}
        </div>
      </Card>

      {/* Guarantor Documents */}
      <Card title="Guarantor Documents" icon={<FileText size={18} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOCUMENT_CATEGORIES.guarantor.map((doc) => (
            <DocumentUpload
              key={doc.id}
              category={doc.id}
              label={doc.label}
              required={doc.required}
              files={stage4.guarantorDocs}
              onUpload={(file) => handleUpload('guarantorDocs', file)}
              onRemove={(fileName) => handleRemove('guarantorDocs', fileName)}
            />
          ))}
        </div>
      </Card>

      {/* Vehicle Documents (if vehicle loan) */}
      {isVehicleLoan && (
        <Card title="Vehicle Documents" icon={<Image size={18} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOCUMENT_CATEGORIES.vehicle.map((doc) => (
              <DocumentUpload
                key={doc.id}
                category={doc.id}
                label={doc.label}
                required={doc.required}
                files={stage4.vehicleDocs}
                onUpload={(file) => handleUpload('vehicleDocs', file)}
                onRemove={(fileName) => handleRemove('vehicleDocs', fileName)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center gap-3">
        <Button onClick={() => setCurrentStage(3)} variant="outline" disabled={saving}>
          Previous
        </Button>
        <Button onClick={handleNext} loading={saving} disabled={saving}>
          Next: Review & Submit
        </Button>
      </div>

      {/* Upload Summary */}
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stage4.customerDocs.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customer Docs</p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stage4.nomineeDocs.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nominee Docs</p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stage4.guarantorDocs.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Guarantor Docs</p>
          </div>
          <div className="text-center p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stage4.vehicleDocs.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Vehicle Docs</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
