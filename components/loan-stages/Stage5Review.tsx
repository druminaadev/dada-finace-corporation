'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  CheckCircle, Edit, FileText, User, Users, Shield,
  DollarSign, Calendar, Percent, CreditCard, MapPin, Phone, Mail,
  Building, Briefcase,
} from 'lucide-react'
import { maskAadhaar, maskPAN } from '@/lib/validation'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export default function Stage5Review() {
  const router = useRouter()
  const { token } = useAuthStore()
  const { stage1, stage2, stage3, stage4, draftId, setCurrentStage, setSubmitting, setSubmitted, resetDraft } = useLoanDraftStore()
  const { showToast } = useUIStore()
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmittingLocal] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const loanAmount = parseFloat(stage2.loanDetails.amount || '0')
  const interestRate = parseFloat(stage2.loanDetails.interestRate || '0')
  const tenure = parseInt(stage2.loanDetails.tenure || '0')
  const emiAmount = stage2.loanDetails.emiAmount || 0
  const totalPayable = emiAmount * tenure
  const totalInterest = totalPayable - loanAmount

  const handleSubmit = async () => {
    if (!agreed) { showToast('Please agree to terms and conditions', 'error'); return }
    if (submitting) return // prevent duplicate submit

    setSubmittingLocal(true)
    setSubmitting(true)

    try {
      const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'
      let loanId = 'LOAN' + Date.now()

      if (FRONTEND_ONLY) {
        await new Promise(r => setTimeout(r, 1500))
        const { useStore } = await import('@/store/appStore')
        const { addLoan, customers } = useStore.getState()

        // Create customer record if Aadhaar data exists
        let customerId = 1
        if (stage2.customerDetails.name) {
          // Find existing customer by phone or create new
          const existing = customers.find(c =>
            c.mobile === stage2.customerDetails.phone ||
            c.name.toLowerCase() === (stage2.customerDetails.name || '').toLowerCase()
          )
          customerId = existing?.id ?? 1
        }

        addLoan({
          customerId,
          employeeId: 1,
          loanDate: new Date().toISOString().split('T')[0],
          emiStartDate: stage2.loanDetails.emiStartDate || new Date().toISOString().split('T')[0],
          loanTypeId: stage2.loanDetails.loanCategory === 'PERSONAL' ? 1 : stage2.loanDetails.loanCategory === 'GOLD' ? 3 : 4,
          amount: loanAmount,
          installments: tenure,
          interestRate,
          interestAmount: Math.round(totalInterest),
          fileCharges: parseFloat(stage2.loanDetails.processingFee || '0'),
          otherCharges: 0,
          intervalDays: 'Monthly',
          remarks: stage2.loanDetails.notes || '',
          security: { type: 'vehicle', fileUrls: [] },
          receiver: { mobile: stage2.customerDetails.phone || '', documentUrl: '' },
        })
      } else {
        const res = await fetch(`${API_BASE}/loan-application/drafts/${draftId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Submission failed')
        loanId = data.data?.loan?.loanNo || loanId
      }

      setSubmitted(loanId)
      showToast('Loan application submitted successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'Submission failed. Please try again.', 'error')
      setSubmitting(false)
      setSubmittingLocal(false)
    }
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{value || 'N/A'}</p>
    </div>
  )

  const editBtn = (stage: number) => (
    <button
      onClick={() => setCurrentStage(stage)}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      style={{ color: 'var(--accent)' }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-tint)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      aria-label={`Edit stage ${stage}`}
    >
      <Edit size={13} /> Edit
    </button>
  )

  return (
    <div className="space-y-5">
      {/* ── Financial Summary ── */}
      <Card title="Loan Summary" icon={<DollarSign size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Loan Amount',    value: fmt(loanAmount),   color: 'var(--accent)',   bg: 'var(--accent-tint)' },
            { label: 'Interest Rate',  value: `${interestRate}%`, color: 'var(--text-primary)', bg: 'var(--hover)' },
            { label: 'Monthly EMI',    value: fmt(emiAmount),    color: '#f97316',         bg: 'var(--hover)' },
            { label: 'Total Payable',  value: fmt(totalPayable), color: 'var(--success)',  bg: 'var(--success-tint)' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl" style={{ background: s.bg }}>
              <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
              <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm p-3 rounded-xl" style={{ background: 'var(--hover)' }}>
          <InfoRow label="Loan Type"      value={stage2.loanDetails.loanCategory || ''} />
          <InfoRow label="Interest Type"  value={stage2.loanDetails.interestType || ''} />
          <InfoRow label="Tenure"         value={`${tenure} Months`} />
          <InfoRow label="Total Interest" value={fmt(Math.max(0, totalInterest))} />
          <InfoRow label="Processing Fee" value={fmt(parseFloat(stage2.loanDetails.processingFee || '0'))} />
          <InfoRow label="EMI Start Date" value={stage2.loanDetails.emiStartDate || ''} />
          <InfoRow label="Loan Purpose"   value={stage2.loanDetails.purpose || ''} />
          <InfoRow label="Notes"          value={stage2.loanDetails.notes || ''} />
        </div>
      </Card>

      {/* ── Customer Details ── */}
      <Card title="Customer Details" icon={<User size={18} />} action={editBtn(2)}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoRow label="Full Name"       value={stage2.customerDetails.name || stage1.aadhaarData?.name || ''} />
          <InfoRow label="Mobile"          value={stage2.customerDetails.phone || stage1.aadhaarData?.phone || ''} />
          <InfoRow label="Alt Mobile"      value={stage2.customerDetails.altPhone || ''} />
          <InfoRow label="Email"           value={stage2.customerDetails.email || ''} />
          <InfoRow label="Aadhaar"         value={maskAadhaar(stage1.aadhaarData?.aadhaar || '')} />
          <InfoRow label="PAN"             value={stage2.customerDetails.pan ? maskPAN(stage2.customerDetails.pan) : ''} />
          <InfoRow label="Date of Birth"   value={stage2.customerDetails.dob || stage1.aadhaarData?.dob || ''} />
          <InfoRow label="Age"             value={stage2.customerDetails.age ? `${stage2.customerDetails.age} yrs` : ''} />
          <InfoRow label="Gender"          value={stage2.customerDetails.gender || stage1.aadhaarData?.gender || ''} />
          <InfoRow label="Marital Status"  value={stage2.customerDetails.maritalStatus || ''} />
          <InfoRow label="Occupation"      value={stage2.customerDetails.occupation || ''} />
          <InfoRow label="Monthly Income"  value={stage2.customerDetails.income ? fmt(parseFloat(stage2.customerDetails.income)) : ''} />
          <InfoRow label="Father's Name"   value={stage2.customerDetails.fatherName || ''} />
          <InfoRow label="Mother's Name"   value={stage2.customerDetails.motherName || ''} />
          <InfoRow label="Blood Group"     value={stage2.customerDetails.bloodGroup || ''} />
          <InfoRow label="Business Info"   value={stage2.customerDetails.businessInfo || ''} />
        </div>
        <div className="mt-3">
          <InfoRow label="Address" value={stage2.customerDetails.address || stage1.aadhaarData?.address || ''} />
        </div>
        {stage2.customerDetails.bankAccountNo && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--hover)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>Bank Details</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <InfoRow label="Account No"   value={stage2.customerDetails.bankAccountNo || ''} />
              <InfoRow label="Holder Name"  value={stage2.customerDetails.bankHolderName || ''} />
              <InfoRow label="Bank Name"    value={stage2.customerDetails.bankName || ''} />
              <InfoRow label="Branch"       value={stage2.customerDetails.bankBranch || ''} />
              <InfoRow label="IFSC"         value={stage2.customerDetails.bankIfsc || ''} />
            </div>
          </div>
        )}
      </Card>

      {/* ── Nominees & Guarantors ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Nominees" icon={<Users size={18} />} action={editBtn(3)}>
          {stage3.nominees.filter(n => n.name).length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No nominees added</p>
          ) : stage3.nominees.filter(n => n.name).map((nominee, idx) => {
            const calculateAge = (dobString?: string) => {
              if (!dobString) return ''
              try {
                const age = Math.floor((Date.now() - new Date(dobString).getTime()) / (365.25 * 24 * 3600 * 1000))
                return isNaN(age) ? '' : `${age} yrs`
              } catch {
                return ''
              }
            }
            return (
              <div key={idx} className="mb-3 p-3 rounded-xl" style={{ background: 'var(--hover)' }}>
                <div className="flex items-start gap-3">
                  {nominee.photoFile ? (
                    <img src={nominee.photoFile} alt={nominee.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      style={{ border: '2px solid var(--success)' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--accent-tint)', color: 'var(--accent)', fontSize: 20, fontWeight: 700 }}>
                      {(nominee.name || '?')[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{nominee.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{nominee.phone} • {nominee.relationship}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {nominee.email && <p className="truncate">Email: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nominee.email}</span></p>}
                      {nominee.aadhaar && <p>Aadhaar: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{maskAadhaar(nominee.aadhaar)}</span></p>}
                      {nominee.dob && <p>DOB: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nominee.dob} {calculateAge(nominee.dob) && `(${calculateAge(nominee.dob)})`}</span></p>}
                      {nominee.occupation && <p>Occ: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{nominee.occupation}</span></p>}
                      {nominee.income && <p>Income: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{fmt(parseFloat(nominee.income))}</span></p>}
                    </div>
                    {nominee.address && <p className="text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800" style={{ color: 'var(--text-secondary)' }}>Address: {nominee.address}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </Card>

        <Card title="Guarantors" icon={<Shield size={18} />} action={editBtn(3)}>
          {stage3.guarantors.filter(g => g.name).length === 0 ? (
            <p className="text-sm text-center py-4" style={{ color: 'var(--text-secondary)' }}>No guarantors added</p>
          ) : stage3.guarantors.filter(g => g.name).map((guarantor, idx) => {
            const calculateAge = (dobString?: string) => {
              if (!dobString) return ''
              try {
                const age = Math.floor((Date.now() - new Date(dobString).getTime()) / (365.25 * 24 * 3600 * 1000))
                return isNaN(age) ? '' : `${age} yrs`
              } catch {
                return ''
              }
            }
            return (
              <div key={idx} className="mb-3 p-3 rounded-xl" style={{ background: 'var(--hover)' }}>
                <div className="flex items-start gap-3">
                  {guarantor.photoFile ? (
                    <img src={guarantor.photoFile} alt={guarantor.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      style={{ border: '2px solid var(--success)' }} />
                  ) : (
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--success-tint)', color: 'var(--success)', fontSize: 20, fontWeight: 700 }}>
                      {(guarantor.name || '?')[0]}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{guarantor.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{guarantor.phone} • {guarantor.relationship}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {guarantor.email && <p className="truncate">Email: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{guarantor.email}</span></p>}
                      {guarantor.aadhaar && <p>Aadhaar: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{maskAadhaar(guarantor.aadhaar)}</span></p>}
                      {guarantor.pan && <p>PAN: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{maskPAN(guarantor.pan)}</span></p>}
                      {guarantor.dob && <p>DOB: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{guarantor.dob} {calculateAge(guarantor.dob) && `(${calculateAge(guarantor.dob)})`}</span></p>}
                      {guarantor.occupation && <p>Occ: <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{guarantor.occupation}</span></p>}
                      {guarantor.income && <p>Income: <span className="font-semibold font-mono" style={{ color: 'var(--text-primary)' }}>{fmt(parseFloat(guarantor.income))}</span></p>}
                    </div>
                    {guarantor.address && <p className="text-xs mt-2 pt-2 border-t border-slate-100 dark:border-slate-800" style={{ color: 'var(--text-secondary)' }}>Address: {guarantor.address}</p>}
                  </div>
                </div>
              </div>
            )
          })}
        </Card>
      </div>

      {/* ── Documents ── */}
      <Card title="Documents Uploaded" icon={<FileText size={18} />} action={editBtn(4)}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Customer Docs',  count: stage4.customerDocs.length,  docs: stage4.customerDocs },
            { label: 'Nominee Docs',   count: stage4.nomineeDocs.length,   docs: stage4.nomineeDocs },
            { label: 'Guarantor Docs', count: stage4.guarantorDocs.length, docs: stage4.guarantorDocs },
            { label: 'Vehicle Docs',   count: stage4.vehicleDocs.length,   docs: stage4.vehicleDocs },
          ].map(item => (
            <div key={item.label} className="p-3 rounded-xl" style={{ background: item.count > 0 ? 'var(--accent-tint)' : 'var(--hover)' }}>
              <p className="text-2xl font-bold mb-0.5" style={{ color: item.count > 0 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {item.count}
              </p>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
              {item.docs.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {item.docs.map(d => (
                    <li key={d.fileName} className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>• {d.fileName}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Terms ── */}
      <div className="p-4 rounded-xl border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: 'var(--accent)' }}
            aria-label="Agree to terms and conditions"
          />
          <div className="text-sm">
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              I agree to the terms and conditions
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              I confirm that all information provided is accurate and complete. I understand that providing false
              information may result in rejection of the loan application or legal action. I agree to repay the
              loan as per the agreed terms.
            </p>
          </div>
        </label>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3">
        <Button onClick={() => setCurrentStage(4)} variant="outline" disabled={submitting}>
          Previous
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!agreed || submitting}
          loading={submitting}
          className="flex-1"
        >
          {submitting ? 'Submitting...' : 'Submit Loan Application'}
        </Button>
      </div>
    </div>
  )
}
