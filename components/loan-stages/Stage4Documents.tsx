'use client'
import { useState } from 'react'
import { useLoanDraftStore, UploadedFile } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Upload, FileText, Image, CheckCircle, X, File } from 'lucide-react'

const DOCUMENT_CATEGORIES = {
  customer: [
    { id: 'identity_proof', label: 'Identity Proof (Aadhaar/Passport)', required: true },
    { id: 'pan_card', label: 'PAN Card', required: true },
    { id: 'passport_photo', label: 'Passport Size Photo', required: true },
    { id: 'address_proof', label: 'Address Proof', required: true },
    { id: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: false },
    { id: 'income_proof', label: 'Income Proof (Salary Slip/ITR)', required: false },
  ],
  nominee: [
    { id: 'nominee_identity', label: 'Nominee Identity Proof', required: false },
    { id: 'nominee_address', label: 'Nominee Address Proof', required: false },
  ],
  guarantor: [
    { id: 'guarantor_identity', label: 'Guarantor Identity Proof', required: true },
    { id: 'guarantor_pan', label: 'Guarantor PAN Card', required: true },
    { id: 'guarantor_address', label: 'Guarantor Address Proof', required: true },
  ],
  vehicle: [
    { id: 'rc_book', label: 'RC Book', required: false },
    { id: 'insurance', label: 'Insurance Copy', required: false },
    { id: 'vehicle_images', label: 'Vehicle Images (Front/Back/Sides)', required: false },
    { id: 'invoice', label: 'Purchase Invoice', required: false },
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
  const { showToast } = useUIStore()

  const handleFile = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      showToast('Please upload only images (JPG, PNG, GIF) or PDF files', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be less than 5MB', 'error')
      return
    }

    // Store only metadata, not base64 to avoid localStorage quota
    onUpload({
      category,
      fileName: file.name,
      size: file.size,
    })
    showToast(`${file.name} uploaded successfully`, 'success')
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
                <CheckCircle size={20} style={{ color: 'var(--success)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {file.fileName}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'Uploaded'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemove(file.fileName)}
                className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
                title="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {/* Add another file button */}
          <label className="block">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleChange}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed cursor-pointer hover:bg-[var(--hover)] transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <Upload size={16} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Add Another File</span>
            </div>
          </label>
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
  const { stage4, setStage4, completeStage, setCurrentStage, stage2 } = useLoanDraftStore()
  const { showToast } = useUIStore()

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

  const handleNext = () => {
    // Check required documents
    const requiredCustomerDocs = DOCUMENT_CATEGORIES.customer.filter((d) => d.required)
    const uploadedCustomerCategories = new Set(stage4.customerDocs.map((d) => d.category))
    
    const missingDocs = requiredCustomerDocs.filter((d) => !uploadedCustomerCategories.has(d.id))
    
    if (missingDocs.length > 0) {
      showToast(`Please upload: ${missingDocs.map((d) => d.label).join(', ')}`, 'error')
      return
    }

    const requiredGuarantorDocs = DOCUMENT_CATEGORIES.guarantor.filter((d) => d.required)
    const uploadedGuarantorCategories = new Set(stage4.guarantorDocs.map((d) => d.category))
    
    const missingGuarantorDocs = requiredGuarantorDocs.filter((d) => !uploadedGuarantorCategories.has(d.id))
    
    if (missingGuarantorDocs.length > 0) {
      showToast(`Please upload guarantor documents: ${missingGuarantorDocs.map((d) => d.label).join(', ')}`, 'error')
      return
    }

    completeStage(4)
    setCurrentStage(5)
    showToast('Documents uploaded successfully!', 'success')
  }

  const handleSkip = () => {
    if (stage4.customerDocs.length === 0 && stage4.guarantorDocs.length === 0) {
      showToast('Skipping document upload. You can upload documents later.', 'info')
    }
    completeStage(4)
    setCurrentStage(5)
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
      <Card title="Nominee Documents (Optional)" icon={<FileText size={18} />}>
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
        <Button onClick={() => setCurrentStage(3)} variant="outline">
          Previous
        </Button>
        <div className="flex gap-3">
          <Button onClick={handleSkip} variant="outline">
            Skip for Now
          </Button>
          <Button onClick={handleNext}>
            Next: Review & Submit
          </Button>
        </div>
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
