'use client'
import { useState } from 'react'
import { useLoanDraftStore, PersonDetails } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { User, Users, Shield, Camera, Upload, X, CheckCircle } from 'lucide-react'

const RELATIONSHIPS = [
  { value: 'Father', label: 'Father' },
  { value: 'Mother', label: 'Mother' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Son', label: 'Son' },
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' },
]

interface PersonFormProps {
  title: string
  icon: React.ReactNode
  data: Partial<PersonDetails>
  onChange: (data: Partial<PersonDetails>) => void
  required?: boolean
}

function PersonForm({ title, icon, data, onChange, required }: PersonFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(data.photoFile || null)
  const [docPreview, setDocPreview] = useState<string | null>(data.documentFile || null)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store only file name, not base64 to avoid localStorage quota
      const fileName = file.name
      setPhotoPreview(URL.createObjectURL(file))
      onChange({ ...data, photoFile: fileName })
    }
  }

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Store only file name, not base64 to avoid localStorage quota
      const fileName = file.name
      setDocPreview(fileName)
      onChange({ ...data, documentFile: fileName })
    }
  }

  const age = data.dob ? Math.floor((Date.now() - new Date(data.dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : ''

  return (
    <Card title={title} icon={icon}>
      <div className="space-y-4">
        {/* Photo Upload */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Photo {required && <span style={{ color: 'var(--error)' }}>*</span>}
          </label>
          <div className="flex items-center gap-4">
            {photoPreview ? (
              <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2" style={{ borderColor: 'var(--accent)' }}>
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => {
                    setPhotoPreview(null)
                    onChange({ ...data, photoFile: undefined })
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: 'var(--hover)', border: '2px dashed var(--border)' }}>
                <Camera size={32} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}
            <label className="cursor-pointer">
              <div className="px-4 py-2 rounded-lg font-semibold text-sm transition-all" style={{ background: 'var(--accent)', color: '#fff' }}>
                <Camera size={16} className="inline mr-2" />
                {photoPreview ? 'Change Photo' : 'Upload Photo'}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Full Name"
            required={required}
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: e.target.value })}
            placeholder="Enter full name"
          />
          <Input
            label="Mobile Number"
            required={required}
            value={data.phone || ''}
            onChange={(e) => onChange({ ...data, phone: e.target.value })}
            placeholder="10-digit mobile"
            maxLength={10}
          />
          <Input
            label="Email"
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: e.target.value })}
            placeholder="email@example.com"
          />
          <Input
            label="Aadhaar Number"
            required={required}
            value={data.aadhaar || ''}
            onChange={(e) => onChange({ ...data, aadhaar: e.target.value.replace(/\D/g, '') })}
            placeholder="12-digit Aadhaar"
            maxLength={12}
          />
          <Input
            label="PAN Number"
            value={data.pan || ''}
            onChange={(e) => onChange({ ...data, pan: e.target.value.toUpperCase() })}
            placeholder="ABCDE1234F"
            maxLength={10}
          />
          <Select
            label="Relationship"
            required={required}
            value={data.relationship || ''}
            onChange={(e) => onChange({ ...data, relationship: e.target.value })}
            options={RELATIONSHIPS}
            placeholder="Select relationship"
          />
          <Input
            label="Date of Birth"
            type="date"
            value={data.dob || ''}
            onChange={(e) => onChange({ ...data, dob: e.target.value })}
          />
          <Input
            label="Age"
            value={age.toString()}
            readOnly
            placeholder="Auto-calculated"
          />
          <Input
            label="Occupation"
            value={data.occupation || ''}
            onChange={(e) => onChange({ ...data, occupation: e.target.value })}
            placeholder="Enter occupation"
          />
          <Input
            label="Monthly Income (₹)"
            type="number"
            value={data.income || ''}
            onChange={(e) => onChange({ ...data, income: e.target.value })}
            placeholder="Enter income"
          />
        </div>

        <Textarea
          label="Address"
          required={required}
          rows={2}
          value={data.address || ''}
          onChange={(e) => onChange({ ...data, address: e.target.value })}
          placeholder="Enter complete address"
        />

        {/* Document Upload */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>
            Identity Document {required && <span style={{ color: 'var(--error)' }}>*</span>}
          </label>
          <div className="flex items-center gap-4">
            {docPreview ? (
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
                <CheckCircle size={20} style={{ color: 'var(--accent)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>Document Uploaded</span>
                <button
                  onClick={() => {
                    setDocPreview(null)
                    onChange({ ...data, documentFile: undefined })
                  }}
                  className="ml-2 p-1 rounded-full hover:bg-red-100 text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <div className="px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 border-dashed" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                  <Upload size={16} className="inline mr-2" />
                  Upload Document
                </div>
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleDocUpload} />
              </label>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default function Stage3GuarantorNominee() {
  const { stage3, setStage3, completeStage, setCurrentStage } = useLoanDraftStore()
  const { showToast } = useUIStore()
  const [activeNominee, setActiveNominee] = useState(0)
  const [activeGuarantor, setActiveGuarantor] = useState(0)

  const handleNext = () => {
    const nominee1Filled = stage3.nominees[0].name && stage3.nominees[0].phone && stage3.nominees[0].aadhaar
    const guarantor1Filled = stage3.guarantors[0].name && stage3.guarantors[0].phone && stage3.guarantors[0].aadhaar

    if (!nominee1Filled) {
      showToast('Please fill at least one nominee details', 'error')
      return
    }
    if (!guarantor1Filled) {
      showToast('Please fill at least one guarantor details', 'error')
      return
    }

    completeStage(3)
    setCurrentStage(4)
    showToast('Stage 3 completed successfully!', 'success')
  }

  return (
    <div className="space-y-6">
      {/* Nominees Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: 'var(--accent-tint)' }}>
            <Users size={24} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nominee Details</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add at least 1 nominee (maximum 2)</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveNominee(idx)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeNominee === idx
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-[var(--hover)] hover:bg-gray-200'
              }`}
            >
              Nominee {idx + 1} {idx === 0 && <span className="text-xs">(Required)</span>}
            </button>
          ))}
        </div>

        <PersonForm
          title={`Nominee ${activeNominee + 1}`}
          icon={<User size={18} />}
          data={stage3.nominees[activeNominee]}
          onChange={(data) => {
            const updated = [...stage3.nominees] as [Partial<PersonDetails>, Partial<PersonDetails>]
            updated[activeNominee] = data
            setStage3({ nominees: updated })
          }}
          required={activeNominee === 0}
        />
      </div>

      {/* Guarantors Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl" style={{ background: 'var(--success-tint)' }}>
            <Shield size={24} style={{ color: 'var(--success)' }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Guarantor Details</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Add at least 1 guarantor (maximum 2)</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[0, 1].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveGuarantor(idx)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                activeGuarantor === idx
                  ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-[var(--hover)] hover:bg-gray-200'
              }`}
            >
              Guarantor {idx + 1} {idx === 0 && <span className="text-xs">(Required)</span>}
            </button>
          ))}
        </div>

        <PersonForm
          title={`Guarantor ${activeGuarantor + 1}`}
          icon={<Shield size={18} />}
          data={stage3.guarantors[activeGuarantor]}
          onChange={(data) => {
            const updated = [...stage3.guarantors] as [Partial<PersonDetails>, Partial<PersonDetails>]
            updated[activeGuarantor] = data
            setStage3({ guarantors: updated })
          }}
          required={activeGuarantor === 0}
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button onClick={() => setCurrentStage(2)} variant="outline">
          Previous
        </Button>
        <Button onClick={handleNext}>
          Next: Document Upload
        </Button>
      </div>
    </div>
  )
}
