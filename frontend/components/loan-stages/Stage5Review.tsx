'use client'
import { useState } from 'react'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Edit, FileText, User, Users, Shield, DollarSign, Calendar, Percent } from 'lucide-react'

export default function Stage5Review() {
  const { stage1, stage2, stage3, stage4, setCurrentStage, setSubmitting, setSubmitted } = useLoanDraftStore()
  const { showToast } = useUIStore()
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmittingLocal] = useState(false)

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

  const handleSubmit = async () => {
    if (!agreed) {
      showToast('Please agree to terms and conditions', 'error')
      return
    }

    setSubmittingLocal(true)
    setSubmitting(true)

    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000))

    // In frontend-only mode, add to store
    const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'
    
    if (FRONTEND_ONLY) {
      const { addLoan } = await import('@/store/appStore').then((m) => ({ addLoan: m.useStore.getState().addLoan }))
      
      const loanAmount = parseFloat(stage2.loanDetails.amount || '0')
      const interestRate = parseFloat(stage2.loanDetails.interestRate || '0')
      const tenure = parseInt(stage2.loanDetails.tenure || '0')
      
      addLoan({
        customerId: 1, // Will be replaced with actual customer ID
        employeeId: 1,
        loanDate: new Date().toISOString().split('T')[0],
        emiStartDate: stage2.loanDetails.emiStartDate || new Date().toISOString().split('T')[0],
        loanTypeId: stage2.loanDetails.loanCategory === 'PERSONAL' ? 1 : stage2.loanDetails.loanCategory === 'GOLD' ? 3 : 4,
        amount: loanAmount,
        installments: tenure,
        interestRate: interestRate,
        interestAmount: Math.round((loanAmount * interestRate * tenure) / 1200),
        fileCharges: parseFloat(stage2.loanDetails.processingFee || '0'),
        otherCharges: 0,
        intervalDays: 'Monthly',
        remarks: stage2.loanDetails.notes || '',
        security: { type: 'vehicle', fileUrls: [] },
        receiver: { mobile: stage2.customerDetails.phone || '', documentUrl: '' },
      })
    }

    setSubmitted('LOAN' + Date.now())
    showToast('Loan application submitted successfully!', 'success')
  }

  const loanAmount = parseFloat(stage2.loanDetails.amount || '0')
  const interestRate = parseFloat(stage2.loanDetails.interestRate || '0')
  const tenure = parseInt(stage2.loanDetails.tenure || '0')
  const emiAmount = stage2.loanDetails.emiAmount || 0
  const totalPayable = emiAmount * tenure
  const totalInterest = totalPayable - loanAmount

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <Card title="Loan Summary" icon={<DollarSign size={18} />}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg" style={{ background: 'var(--accent-tint)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Loan Amount
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
              {formatCurrency(loanAmount)}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Interest Rate
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {interestRate}%
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              EMI Amount
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
              {formatCurrency(emiAmount)}
            </p>
          </div>
          <div className="p-4 rounded-lg" style={{ background: 'var(--success-tint)' }}>
            <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>
              Total Payable
            </p>
            <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
              {formatCurrency(totalPayable)}
            </p>
          </div>
        </div>
        <div className="mt-4 p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Loan Type</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {stage2.loanDetails.loanCategory}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Tenure</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {tenure} Months
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-secondary)' }}>Processing Fee</p>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {formatCurrency(parseFloat(stage2.loanDetails.processingFee || '0'))}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Customer Details */}
      <Card
        title="Customer Details"
        icon={<User size={18} />}
        action={
          <button
            onClick={() => setCurrentStage(2)}
            className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover)] transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            <Edit size={14} /> Edit
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Name</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage2.customerDetails.name || stage1.aadhaarData?.name}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Mobile</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage2.customerDetails.phone || stage1.aadhaarData?.phone}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Email</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage2.customerDetails.email || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Aadhaar</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage1.aadhaarData?.aadhaar}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>PAN</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage2.customerDetails.pan || 'N/A'}
            </p>
          </div>
          <div>
            <p style={{ color: 'var(--text-secondary)' }}>Occupation</p>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {stage2.customerDetails.occupation || 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Nominees & Guarantors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="Nominees"
          icon={<Users size={18} />}
          action={
            <button
              onClick={() => setCurrentStage(3)}
              className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover)] transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              <Edit size={14} /> Edit
            </button>
          }
        >
          {stage3.nominees.filter((n) => n.name).map((nominee, idx) => (
            <div key={idx} className="mb-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {nominee.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {nominee.phone} • {nominee.relationship}
              </p>
            </div>
          ))}
        </Card>

        <Card
          title="Guarantors"
          icon={<Shield size={18} />}
          action={
            <button
              onClick={() => setCurrentStage(3)}
              className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover)] transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              <Edit size={14} /> Edit
            </button>
          }
        >
          {stage3.guarantors.filter((g) => g.name).map((guarantor, idx) => (
            <div key={idx} className="mb-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                {guarantor.name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {guarantor.phone} • {guarantor.relationship}
              </p>
            </div>
          ))}
        </Card>
      </div>

      {/* Documents Checklist */}
      <Card
        title="Documents Uploaded"
        icon={<FileText size={18} />}
        action={
          <button
            onClick={() => setCurrentStage(4)}
            className="flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--hover)] transition-colors"
            style={{ color: 'var(--accent)' }}
          >
            <Edit size={14} /> Edit
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { label: 'Customer Documents', count: stage4.customerDocs.length },
            { label: 'Nominee Documents', count: stage4.nomineeDocs.length },
            { label: 'Guarantor Documents', count: stage4.guarantorDocs.length },
            { label: 'Vehicle Documents', count: stage4.vehicleDocs.length },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {item.label}
              </span>
              <span className="flex items-center gap-2 text-sm font-bold" style={{ color: item.count > 0 ? 'var(--success)' : 'var(--text-secondary)' }}>
                {item.count > 0 && <CheckCircle size={16} />}
                {item.count} files
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Terms & Conditions */}
      <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-5 h-5 rounded cursor-pointer"
            style={{ accentColor: 'var(--accent)' }}
          />
          <div className="text-sm">
            <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
              I agree to the terms and conditions
            </p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              I confirm that all the information provided is accurate and complete. I understand that providing false information may result in rejection of my loan application or legal action. I agree to repay the loan as per the agreed terms and conditions.
            </p>
          </div>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button onClick={() => setCurrentStage(4)} variant="outline" disabled={submitting}>
          Previous
        </Button>
        <Button onClick={handleSubmit} disabled={!agreed || submitting} className="flex-1">
          {submitting ? 'Submitting...' : 'Submit Loan Application'}
        </Button>
      </div>
    </div>
  )
}
