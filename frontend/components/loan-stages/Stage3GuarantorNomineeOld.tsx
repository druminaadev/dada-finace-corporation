'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useLoanDraftStore, PersonDetails } from '@/store/loanDraftStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ArrowLeft, ArrowRight, Save, Users, Shield } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const RELATIONSHIPS = ['Spouse', 'Father', 'Mother', 'Brother', 'Sister', 'Son', 'Daughter', 'Friend', 'Other']

export function Stage3GuarantorNominee({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { showToast } = useUIStore()
  const { token } = useAuthStore()
  const { stage3, draftId, setStage3, completeStage } = useLoanDraftStore()

  const [nominees, setNominees] = useState<[Partial<PersonDetails>, Partial<PersonDetails>]>(stage3.nominees)
  const [guarantors, setGuarantors] = useState<[Partial<PersonDetails>, Partial<PersonDetails>]>(stage3.guarantors)
  const [saving, setSaving] = useState(false)

  const updateNominee = (idx: 0 | 1, field: keyof PersonDetails, value: string) => {
    const updated: [Partial<PersonDetails>, Partial<PersonDetails>] = [...nominees]
    updated[idx] = { ...updated[idx], [field]: value }
    setNominees(updated)
  }

  const updateGuarantor = (idx: 0 | 1, field: keyof PersonDetails, value: string) => {
    const updated: [Partial<PersonDetails>, Partial<PersonDetails>] = [...guarantors]
    updated[idx] = { ...updated[idx], [field]: value }
    setGuarantors(updated)
  }

  const handleSave = async (andNext = false) => {
    const validNominees = nominees.filter((n) => n.name && n.phone)
    const validGuarantors = guarantors.filter((g) => g.name && g.phone)

    if (validNominees.length < 1) {
      showToast('At least 1 nominee is required', 'error')
      return
    }
    if (validGuarantors.length < 1) {
      showToast('At least 1 guarantor is required', 'error')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/loan-application/drafts/${draftId}/stage/3`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nominees: validNominees, guarantors: validGuarantors }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setStage3({ nominees, guarantors })
      completeStage(3)
      showToast('Stage 3 saved successfully', 'success')
      if (andNext) onNext()
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Nominees */}
      {[0, 1].map((idx) => (
        <Card key={`nominee-${idx}`} title={`Nominee ${idx + 1} ${idx === 0 ? '(Required)' : '(Optional)'}`}>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <Users size={18} style={{ color: 'var(--accent)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Person designated to receive benefits in case of borrower's death
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Full Name"
              required={idx === 0}
              value={nominees[idx as 0 | 1].name || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'name', e.target.value)}
            />
            <Input
              label="Mobile Number"
              required={idx === 0}
              value={nominees[idx as 0 | 1].phone || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'phone', e.target.value)}
            />
            <Select
              label="Relationship"
              value={nominees[idx as 0 | 1].relationship || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'relationship', e.target.value)}
              options={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
              placeholder="Select relationship"
            />
            <Input
              label="Aadhaar Number"
              value={nominees[idx as 0 | 1].aadhaar || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'aadhaar', e.target.value.replace(/\D/g, ''))}
              maxLength={12}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={nominees[idx as 0 | 1].dob || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'dob', e.target.value)}
            />
            <Input
              label="Occupation"
              value={nominees[idx as 0 | 1].occupation || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'occupation', e.target.value)}
            />
            <Input
              label="Monthly Income (₹)"
              type="number"
              value={nominees[idx as 0 | 1].income || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'income', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Address"
              rows={2}
              value={nominees[idx as 0 | 1].address || ''}
              onChange={(e) => updateNominee(idx as 0 | 1, 'address', e.target.value)}
            />
          </div>
        </Card>
      ))}

      {/* Guarantors */}
      {[0, 1].map((idx) => (
        <Card key={`guarantor-${idx}`} title={`Guarantor ${idx + 1} ${idx === 0 ? '(Required)' : '(Optional)'}`}>
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
            <Shield size={18} style={{ color: 'var(--accent)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Person who agrees to repay the loan if the borrower defaults
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input
              label="Full Name"
              required={idx === 0}
              value={guarantors[idx as 0 | 1].name || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'name', e.target.value)}
            />
            <Input
              label="Mobile Number"
              required={idx === 0}
              value={guarantors[idx as 0 | 1].phone || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'phone', e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              value={guarantors[idx as 0 | 1].email || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'email', e.target.value)}
            />
            <Select
              label="Relationship"
              value={guarantors[idx as 0 | 1].relationship || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'relationship', e.target.value)}
              options={RELATIONSHIPS.map((r) => ({ value: r, label: r }))}
              placeholder="Select relationship"
            />
            <Input
              label="Aadhaar Number"
              value={guarantors[idx as 0 | 1].aadhaar || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'aadhaar', e.target.value.replace(/\D/g, ''))}
              maxLength={12}
            />
            <Input
              label="PAN Number"
              value={guarantors[idx as 0 | 1].pan || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'pan', e.target.value.toUpperCase())}
              maxLength={10}
            />
            <Input
              label="Occupation"
              required={idx === 0}
              value={guarantors[idx as 0 | 1].occupation || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'occupation', e.target.value)}
            />
            <Input
              label="Monthly Income (₹)"
              required={idx === 0}
              type="number"
              value={guarantors[idx as 0 | 1].income || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'income', e.target.value)}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={guarantors[idx as 0 | 1].dob || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'dob', e.target.value)}
            />
          </div>
          <div className="mt-4">
            <Textarea
              label="Address"
              rows={2}
              value={guarantors[idx as 0 | 1].address || ''}
              onChange={(e) => updateGuarantor(idx as 0 | 1, 'address', e.target.value)}
            />
          </div>
        </Card>
      ))}

      <div className="flex gap-3 justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft size={16} /> Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Next'} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
