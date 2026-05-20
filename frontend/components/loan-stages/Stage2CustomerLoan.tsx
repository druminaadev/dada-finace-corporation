'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'

export function Stage2CustomerLoan({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const { showToast } = useUIStore()
  const { stage1, stage2, setStage2, completeStage } = useLoanDraftStore()

  const [customer, setCustomer] = useState(stage2.customerDetails || {})
  const [loan, setLoan] = useState(stage2.loanDetails || { loanCategory: 'PERSONAL', interestType: 'FLAT' })
  const [emiAmount, setEmiAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  // Auto-fill from Aadhaar data
  useEffect(() => {
    if (stage1.aadhaarData && !customer.name) {
      const d = stage1.aadhaarData
      setCustomer((prev) => ({
        ...prev,
        name: d.name,
        phone: d.phone,
        dob: d.dob,
        gender: d.gender,
        address: d.address,
      }))
    }
  }, [stage1.aadhaarData, customer.name])

  // Calculate EMI
  useEffect(() => {
    const amt = parseFloat(String(loan.amount || '0')) || 0
    const rate = parseFloat(String(loan.interestRate || '0')) || 0
    const tenure = parseInt(String(loan.tenure || '0')) || 0

    if (amt > 0 && rate > 0 && tenure > 0) {
      if (loan.interestType === 'REDUCING') {
        const monthlyRate = rate / 12 / 100
        const emi = (amt * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1)
        setEmiAmount(Math.round(emi))
      } else {
        const totalInterest = amt * (rate / 100) * (tenure / 12)
        setEmiAmount(Math.round((amt + totalInterest) / tenure))
      }
    } else {
      setEmiAmount(0)
    }
  }, [loan.amount, loan.interestRate, loan.tenure, loan.interestType])

  const handleSave = async (andNext = false) => {
    if (!customer.name?.trim() || !customer.phone?.trim()) {
      showToast('Customer name and phone are required', 'error')
      return
    }
    if (!loan.amount || !loan.interestRate || !loan.tenure) {
      showToast('Loan amount, interest rate, and tenure are required', 'error')
      return
    }

    // Validate phone number
    if (customer.phone && !/^\d{10}$/.test(customer.phone.trim())) {
      showToast('Phone number must be 10 digits', 'error')
      return
    }

    setSaving(true)

    try {
      if (FRONTEND_ONLY) {
        await new Promise(r => setTimeout(r, 500))
      }
      
      setStage2({ customerDetails: customer, loanDetails: { ...loan, emiAmount } })
      completeStage(2)
      showToast('Stage 2 saved successfully', 'success')
      
      if (andNext) {
        setTimeout(() => onNext(), 100)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="space-y-6">
      <Card title="Customer Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Full Name" required value={customer.name || ''} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
          <Input label="Mobile Number" required value={customer.phone || ''} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
          <Input label="Alt Mobile" value={customer.altPhone || ''} onChange={(e) => setCustomer({ ...customer, altPhone: e.target.value })} />
          <Input label="Email" type="email" value={customer.email || ''} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} />
          <Input label="Date of Birth" type="date" value={customer.dob || ''} onChange={(e) => setCustomer({ ...customer, dob: e.target.value })} />
          <Input label="Age" type="number" value={customer.age || ''} onChange={(e) => setCustomer({ ...customer, age: e.target.value })} />
          <Select
            label="Gender"
            value={customer.gender || ''}
            onChange={(e) => setCustomer({ ...customer, gender: e.target.value })}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' },
            ]}
            placeholder="Select gender"
          />
          <Select
            label="Marital Status"
            value={customer.maritalStatus || ''}
            onChange={(e) => setCustomer({ ...customer, maritalStatus: e.target.value })}
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Divorced', label: 'Divorced' },
              { value: 'Widowed', label: 'Widowed' },
            ]}
            placeholder="Select status"
          />
          <Input label="Occupation" value={customer.occupation || ''} onChange={(e) => setCustomer({ ...customer, occupation: e.target.value })} />
          <Input label="Monthly Income (₹)" type="number" value={customer.income || ''} onChange={(e) => setCustomer({ ...customer, income: e.target.value })} />
          <Input label="Father's Name" value={customer.fatherName || ''} onChange={(e) => setCustomer({ ...customer, fatherName: e.target.value })} />
          <Input label="Mother's Name" value={customer.motherName || ''} onChange={(e) => setCustomer({ ...customer, motherName: e.target.value })} />
          <Input label="PAN Number" value={customer.pan || ''} onChange={(e) => setCustomer({ ...customer, pan: e.target.value.toUpperCase() })} maxLength={10} />
          <Input label="Blood Group" value={customer.bloodGroup || ''} onChange={(e) => setCustomer({ ...customer, bloodGroup: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Address" rows={2} value={customer.address || ''} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} />
        </div>
        <div className="mt-4">
          <Textarea label="Business Information" rows={2} value={customer.businessInfo || ''} onChange={(e) => setCustomer({ ...customer, businessInfo: e.target.value })} placeholder="Business name, type, years in operation..." />
        </div>
      </Card>

      <Card title="Bank Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" value={customer.bankAccountNo || ''} onChange={(e) => setCustomer({ ...customer, bankAccountNo: e.target.value })} />
          <Input label="Account Holder Name" value={customer.bankHolderName || ''} onChange={(e) => setCustomer({ ...customer, bankHolderName: e.target.value })} />
          <Input label="Bank Name" value={customer.bankName || ''} onChange={(e) => setCustomer({ ...customer, bankName: e.target.value })} />
          <Input label="Branch" value={customer.bankBranch || ''} onChange={(e) => setCustomer({ ...customer, bankBranch: e.target.value })} />
          <Input label="IFSC Code" value={customer.bankIfsc || ''} onChange={(e) => setCustomer({ ...customer, bankIfsc: e.target.value.toUpperCase() })} maxLength={11} />
        </div>
      </Card>

      <Card title="Loan Details">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select
            label="Loan Category"
            required
            value={loan.loanCategory || 'PERSONAL'}
            onChange={(e) => setLoan({ ...loan, loanCategory: e.target.value as any })}
            options={[
              { value: 'PERSONAL', label: 'Personal Loan' },
              { value: 'GOLD', label: 'Gold Loan' },
              { value: 'VEHICLE', label: 'Vehicle Loan' },
            ]}
          />
          <Input label="Loan Amount (₹)" required type="number" value={loan.amount || ''} onChange={(e) => setLoan({ ...loan, amount: e.target.value })} placeholder="e.g. 100000" />
          <Input label="Interest Rate (%)" required type="number" step="0.1" value={loan.interestRate || ''} onChange={(e) => setLoan({ ...loan, interestRate: e.target.value })} placeholder="e.g. 12" />
          <Select
            label="Interest Type"
            required
            value={loan.interestType || 'FLAT'}
            onChange={(e) => setLoan({ ...loan, interestType: e.target.value as any })}
            options={[
              { value: 'FLAT', label: 'Flat Rate' },
              { value: 'REDUCING', label: 'Reducing Balance' },
            ]}
          />
          <Input label="Tenure (months)" required type="number" value={loan.tenure || ''} onChange={(e) => setLoan({ ...loan, tenure: e.target.value })} placeholder="e.g. 12" />
          <Input label="Processing Fee (₹)" type="number" value={loan.processingFee || ''} onChange={(e) => setLoan({ ...loan, processingFee: e.target.value })} placeholder="0" />
          <Input label="EMI Start Date" type="date" value={loan.emiStartDate || ''} onChange={(e) => setLoan({ ...loan, emiStartDate: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Principal</div>
            <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(parseFloat(loan.amount as string) || 0)}</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>EMI Amount</div>
            <div className="text-base font-bold" style={{ color: '#f97316' }}>{fmt(emiAmount)}</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Total Payable</div>
            <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{fmt(emiAmount * (parseInt(loan.tenure as string) || 0))}</div>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
            <div className="text-xs mb-1" style={{ color: 'var(--accent)' }}>Interest Type</div>
            <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{loan.interestType}</div>
          </div>
        </div>

        <div className="mt-4">
          <Textarea label="Loan Purpose" rows={2} value={loan.purpose || ''} onChange={(e) => setLoan({ ...loan, purpose: e.target.value })} placeholder="Purpose of the loan..." />
        </div>
        <div className="mt-4">
          <Textarea label="Notes" rows={2} value={loan.notes || ''} onChange={(e) => setLoan({ ...loan, notes: e.target.value })} placeholder="Additional notes..." />
        </div>
      </Card>

      <div className="flex gap-3 justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft size={16} /> Previous
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => handleSave(false)} disabled={saving}>
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={() => handleSave(true)} disabled={saving}>
            {saving ? 'Saving...' : 'Next: Guarantor & Nominee'} <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
