'use client'
import { useState } from 'react'
import { useLoanDraftStore, PersonDetails } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { ImageUploadWithProgress } from '@/components/ui/ImageUploadWithProgress'
import { User, Users, Shield, Upload, CheckCircle, X } from 'lucide-react'
import { validatePhone, validateAadhaar, sanitizeInput } from '@/lib/validation'
import { useAuthStore } from '@/store/authStore'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

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
  const [photoConfirmed, setPhotoConfirmed] = useState(false)
  const [docPreview, setDocPreview] = useState<string | null>(data.documentFile || null)
  const { showToast } = useUIStore()

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileName = file.name
      setDocPreview(fileName)
      onChange({ ...data, documentFile: fileName })
    }
  }

  const age = data.dob ? Math.floor((Date.now() - new Date(data.dob).getTime()) / (365.25 * 24 * 3600 * 1000)) : ''

  return (
    <Card title={title} icon={icon}>
      <div className="space-y-4">
        {/* Photo Upload with Progress */}
        <ImageUploadWithProgress
          label="Photo"
          required={required}
          value={data.photoFile || null}
          onChange={(file, preview) => {
            onChange({ ...data, photoFile: preview || undefined })
          }}
          onConfirm={(confirmed) => setPhotoConfirmed(confirmed)}
        />

        {/* Personal Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input
            label="Full Name"
            required={required}
            value={data.name || ''}
            onChange={(e) => onChange({ ...data, name: sanitizeInput(e.target.value) })}
            placeholder="Enter full name"
          />
          <Input
            label="Mobile Number"
            required={required}
            value={data.phone || ''}
            onChange={(e) => {
              const phone = e.target.value.replace(/\D/g, '')
              onChange({ ...data, phone })
            }}
            placeholder="10-digit mobile"
            maxLength={10}
          />
          <Input
            label="Email"
            required={required}
            type="email"
            value={data.email || ''}
            onChange={(e) => onChange({ ...data, email: sanitizeInput(e.target.value) })}
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
            required={required}
            value={data.pan || ''}
            onChange={(e) => onChange({ ...data, pan: sanitizeInput(e.target.value.toUpperCase()) })}
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
            required={required}
            type="date"
            value={data.dob || ''}
            onChange={(e) => onChange({ ...data, dob: e.target.value })}
          />
          <Input
            label="Age"
            required={required}
            value={age.toString()}
            readOnly
            placeholder="Auto-calculated"
          />
          <Input
            label="Occupation"
            required={required}
            value={data.occupation || ''}
            onChange={(e) => onChange({ ...data, occupation: sanitizeInput(e.target.value) })}
            placeholder="Enter occupation"
          />
          <Input
            label="Monthly Income (₹)"
            required={required}
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
          onChange={(e) => onChange({ ...data, address: sanitizeInput(e.target.value) })}
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
                  type="button"
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

function validatePerson(
  person: Partial<PersonDetails>,
  label: string,
  showToast: (msg: string, type: 'error' | 'success' | 'warning' | 'info') => void
): boolean {
  if (!person.photoFile) {
    showToast(`Photo is required for ${label}`, 'error')
    return false
  }
  if (!person.name?.trim()) {
    showToast(`Full Name is required for ${label}`, 'error')
    return false
  }
  if (!person.phone?.trim()) {
    showToast(`Mobile Number is required for ${label}`, 'error')
    return false
  }
  if (!/^\d{10}$/.test(person.phone.trim())) {
    showToast(`Mobile Number must be 10 digits for ${label}`, 'error')
    return false
  }
  if (!person.email?.trim()) {
    showToast(`Email is required for ${label}`, 'error')
    return false
  }
  if (!/\S+@\S+\.\S+/.test(person.email.trim())) {
    showToast(`Please enter a valid email address for ${label}`, 'error')
    return false
  }
  if (!person.aadhaar?.trim()) {
    showToast(`Aadhaar Number is required for ${label}`, 'error')
    return false
  }
  if (!/^\d{12}$/.test(person.aadhaar.trim())) {
    showToast(`Aadhaar Number must be 12 digits for ${label}`, 'error')
    return false
  }
  if (!person.pan?.trim()) {
    showToast(`PAN Number is required for ${label}`, 'error')
    return false
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(person.pan.trim().toUpperCase())) {
    showToast(`Invalid PAN Number format (e.g. ABCDE1234F) for ${label}`, 'error')
    return false
  }
  if (!person.relationship?.trim()) {
    showToast(`Relationship is required for ${label}`, 'error')
    return false
  }
  if (!person.dob?.trim()) {
    showToast(`Date of Birth is required for ${label}`, 'error')
    return false
  }
  if (!person.occupation?.trim()) {
    showToast(`Occupation is required for ${label}`, 'error')
    return false
  }
  if (!person.income || parseFloat(String(person.income)) <= 0) {
    showToast(`Monthly Income is required and must be greater than 0 for ${label}`, 'error')
    return false
  }
  if (!person.address?.trim()) {
    showToast(`Address is required for ${label}`, 'error')
    return false
  }
  if (!person.documentFile) {
    showToast(`Identity Document is required for ${label}`, 'error')
    return false
  }
  return true
}

function isPersonPartiallyFilled(person: Partial<PersonDetails>): boolean {
  return !!(
    person.photoFile ||
    person.name?.trim() ||
    person.phone?.trim() ||
    person.email?.trim() ||
    person.aadhaar?.trim() ||
    person.pan?.trim() ||
    person.relationship?.trim() ||
    person.dob?.trim() ||
    person.occupation?.trim() ||
    person.income ||
    person.address?.trim() ||
    person.documentFile
  )
}

export default function Stage3GuarantorNominee() {
  const { token } = useAuthStore()
  const { stage3, draftId, setStage3, completeStage, setCurrentStage } = useLoanDraftStore()
  const { showToast } = useUIStore()
  const [activeNominee, setActiveNominee] = useState(0)
  const [activeGuarantor, setActiveGuarantor] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleNext = async () => {
    // Validate nominee 1
    const nominee1 = stage3.nominees[0]
    if (!validatePerson(nominee1, 'Nominee 1', showToast)) {
      return
    }

    // Validate nominee 2 if partially filled
    const nominee2 = stage3.nominees[1]
    if (nominee2 && isPersonPartiallyFilled(nominee2)) {
      if (!validatePerson(nominee2, 'Nominee 2', showToast)) {
        return
      }
    }

    // Validate guarantor 1
    const guarantor1 = stage3.guarantors[0]
    if (!validatePerson(guarantor1, 'Guarantor 1', showToast)) {
      return
    }

    // Validate guarantor 2 if partially filled
    const guarantor2 = stage3.guarantors[1]
    if (guarantor2 && isPersonPartiallyFilled(guarantor2)) {
      if (!validatePerson(guarantor2, 'Guarantor 2', showToast)) {
        return
      }
    }

    setSaving(true)
    try {
      if (!FRONTEND_ONLY) {
        const res = await fetch(`${API_BASE}/loan-application/drafts/${draftId}/stage/3`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ nominees: stage3.nominees, guarantors: stage3.guarantors }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to save Stage 3 details')
      }

      completeStage(3)
      setCurrentStage(4)
      showToast('Stage 3 completed successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to save Stage 3 to backend', 'error')
    } finally {
      setSaving(false)
    }
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
        <Button onClick={() => setCurrentStage(2)} variant="outline" disabled={saving}>
          Previous
        </Button>
        <Button onClick={handleNext} loading={saving} disabled={saving}>
          Next: Document Upload
        </Button>
      </div>
    </div>
  )
}
