'use client'
import { useStore } from '@/store/appStore'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/Button'
import { Edit, Save } from 'lucide-react'

function getLabel(score: number) {
  if (score >= 800) return 'Excellent'
  if (score >= 600) return 'Good'
  if (score >= 400) return 'Average'
  return 'Risky'
}

function DocumentContent() {
  const params = useSearchParams()
  const loanId = Number(params.get('loanId'))
  const docType = params.get('type') ?? 'contract'
  const { loans, customers, employees, loanTypes, civilScores } = useStore()
  const [isEditing, setIsEditing] = useState(false)
  const [savedHTML, setSavedHTML] = useState<string | null>(null)

  const loan = loans.find(l => l.id === loanId)
  const customer = loan ? customers.find(c => c.id === loan.customerId) : null
  const employee = loan ? employees.find(e => e.id === loan.employeeId) : null
  const loanType = loan ? loanTypes.find(t => t.id === loan.loanTypeId) : null
  const scoreData = customer ? (civilScores[customer.id] ?? { score: 700 }) : null

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
  const fmtDate = (d: string) => { try { return format(parseISO(d), 'dd/MM/yyyy') } catch { return d } }

  // Load saved content on mount
  useEffect(() => {
    const saved = localStorage.getItem(`doc_${loanId}_${docType}`)
    if (saved) setSavedHTML(saved)
  }, [loanId, docType])

  if (!loan || !customer) return <div className="p-8 text-center text-slate-500">Loan not found. Please go back and select a valid loan.</div>

  const totalPayable = loan.amount + loan.interestAmount + loan.fileCharges + loan.otherCharges

  const handleSave = () => {
    const container = document.querySelector('.document-container')
    if (container) {
      const content = container.querySelector('.document-content')
      if (content) {
        const html = content.innerHTML
        localStorage.setItem(`doc_${loanId}_${docType}`, html)
        setSavedHTML(html)
        setIsEditing(false)
        alert('✓ Changes saved successfully!')
      }
    }
  }

  const handleReset = () => {
    if (confirm('Reset to original document? All changes will be lost.')) {
      localStorage.removeItem(`doc_${loanId}_${docType}`)
      setSavedHTML(null)
      setIsEditing(false)
      alert('✓ Document reset to original')
    }
  }

  const Header = () => (
    <div className="text-center mb-8 pb-4 border-b-2 border-slate-800">
      <h1 className="text-2xl font-bold text-slate-900" contentEditable={isEditing} suppressContentEditableWarning>NEXZEN</h1>
      <p className="text-sm text-slate-600 mt-1" contentEditable={isEditing} suppressContentEditableWarning>Loan Management System</p>
      <p className="text-xs text-slate-500 mt-0.5" contentEditable={isEditing} suppressContentEditableWarning>Confidential Document</p>
    </div>
  )

  const Field = ({ label, value }: { label: string; value: string | number | undefined }) => (
    <div className="flex gap-2 py-1 border-b border-slate-100">
      <span className="text-xs font-semibold text-slate-500 w-40 flex-shrink-0">{label}:</span>
      <span className="text-xs text-slate-800" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '2px 4px' : '0' }}>{value ?? '—'}</span>
    </div>
  )

  const SignatureRow = () => (
    <div className="flex justify-between mt-12 pt-4">
      <div className="text-center">
        <div className="border-t border-slate-400 w-40 mb-1" />
        <p className="text-xs text-slate-500" contentEditable={isEditing} suppressContentEditableWarning>Customer Signature</p>
      </div>
      <div className="text-center">
        <div className="border-t border-slate-400 w-40 mb-1" />
        <p className="text-xs text-slate-500" contentEditable={isEditing} suppressContentEditableWarning>Authorised Signatory</p>
      </div>
    </div>
  )

  const renderDoc = () => {
    switch (docType) {
      case 'contract':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>LOAN AGREEMENT</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-0 mb-6">
              <Field label="Loan No" value={loan.loanNo} />
              <Field label="Loan Date" value={fmtDate(loan.loanDate)} />
              <Field label="Customer Name" value={customer.name} />
              <Field label="Application No" value={customer.appNo} />
              <Field label="Father's Name" value={customer.fatherName} />
              <Field label="Mobile" value={customer.mobile} />
              <Field label="Aadhar No" value={customer.aadhar} />
              <Field label="PAN No" value={customer.pan} />
              <Field label="Loan Type" value={loanType?.name} />
              <Field label="Loan Amount" value={fmt(loan.amount)} />
              <Field label="Interest Rate" value={`${loan.interestRate}%`} />
              <Field label="Interest Amount" value={fmt(loan.interestAmount)} />
              <Field label="File Charges" value={fmt(loan.fileCharges)} />
              <Field label="Other Charges" value={fmt(loan.otherCharges)} />
              <Field label="Total Payable" value={fmt(totalPayable)} />
              <Field label="Installments" value={loan.installments} />
              <Field label="Interval" value={loan.intervalDays} />
              <Field label="EMI Start Date" value={fmtDate(loan.emiStartDate)} />
              <Field label="Employee" value={employee?.name} />
              <Field label="Remarks" value={loan.remarks} />
            </div>
            <div className="mt-4 p-3 bg-slate-50 rounded text-xs text-slate-600 leading-relaxed" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none' }}>
              I/We hereby agree to repay the above loan amount along with interest as per the schedule. I/We confirm that all information provided is accurate and true.
            </div>
            <SignatureRow />
          </>
        )
      case 'sanction':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>LOAN SANCTION LETTER</h2>
            <p className="text-sm text-slate-700 mb-4" contentEditable={isEditing} suppressContentEditableWarning>Date: {fmtDate(loan.loanDate)}</p>
            <p className="text-sm text-slate-700 mb-6" contentEditable={isEditing} suppressContentEditableWarning>To,<br /><strong>{customer.name}</strong><br />{customer.mobile}</p>
            <p className="text-sm text-slate-700 mb-4" contentEditable={isEditing} suppressContentEditableWarning>Dear {customer.name},</p>
            <p className="text-sm text-slate-700 mb-4" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '4px' : '0' }}>
              We are pleased to inform you that your loan application <strong>{customer.appNo}</strong> has been sanctioned by NEXZEN.
            </p>
            <div className="my-4 grid grid-cols-2 gap-x-8">
              <Field label="Sanctioned Amount" value={fmt(loan.amount)} />
              <Field label="Interest Rate" value={`${loan.interestRate}% per annum`} />
              <Field label="Repayment Period" value={`${loan.installments} installments`} />
              <Field label="EMI Start Date" value={fmtDate(loan.emiStartDate)} />
            </div>
            <p className="text-sm text-slate-700 mt-4" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '4px' : '0' }}>Please collect the disbursed amount from our branch at the earliest.</p>
            <SignatureRow />
          </>
        )
      case 'promissory':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>PROMISSORY NOTE</h2>
            <p className="text-sm text-slate-700 mb-6" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '4px' : '0' }}>
              I, <strong>{customer.name}</strong>, son/daughter of <strong>{customer.fatherName}</strong>, residing at {customer.mobile}, hereby promise to pay NEXZEN or order, the sum of <strong>{fmt(loan.amount)}</strong> (Rupees {loan.amount} only) with interest at <strong>{loan.interestRate}%</strong> per annum, in <strong>{loan.installments}</strong> equal installments commencing from <strong>{fmtDate(loan.emiStartDate)}</strong>.
            </p>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Principal Amount" value={fmt(loan.amount)} />
              <Field label="Total Interest" value={fmt(loan.interestAmount)} />
              <Field label="Total Payable" value={fmt(totalPayable)} />
              <Field label="Loan No" value={loan.loanNo} />
            </div>
            <SignatureRow />
          </>
        )
      case 'receiver':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>RECEIVER DETAILS</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Loan No" value={loan.loanNo} />
              <Field label="Loan Date" value={fmtDate(loan.loanDate)} />
              <Field label="Customer Name" value={customer.name} />
              <Field label="Loan Amount" value={fmt(loan.amount)} />
              <Field label="Receiver Mobile" value={loan.receiver.mobile || '—'} />
            </div>
            <SignatureRow />
          </>
        )
      case 'cash-voucher':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>CASH DISBURSEMENT VOUCHER</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Voucher No" value={`CV-${loan.loanNo}`} />
              <Field label="Date" value={fmtDate(loan.loanDate)} />
              <Field label="Paid To" value={customer.name} />
              <Field label="Amount" value={fmt(loan.amount)} />
              <Field label="Purpose" value={`Loan Disbursement — ${loan.loanNo}`} />
              <Field label="Mode" value="Cash" />
              <Field label="Prepared By" value={employee?.name} />
            </div>
            <div className="mt-6 p-3 border border-slate-300 rounded text-center">
              <p className="text-sm font-semibold text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>Amount in Words:</p>
              <p className="text-sm text-slate-600 mt-1" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '4px' : '0' }}>Rupees {loan.amount} Only</p>
            </div>
            <SignatureRow />
          </>
        )
      case 'voucher':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>GENERAL VOUCHER</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Voucher No" value={`GV-${loan.loanNo}`} />
              <Field label="Date" value={fmtDate(loan.loanDate)} />
              <Field label="Account" value={`Loan Account — ${loan.loanNo}`} />
              <Field label="Amount" value={fmt(loan.amount)} />
              <Field label="Narration" value={`Loan disbursement to ${customer.name}`} />
              <Field label="Prepared By" value={employee?.name} />
            </div>
            <SignatureRow />
          </>
        )
      case 'mortgage':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>MORTGAGE / SECURITY DETAILS</h2>
            <div className="grid grid-cols-2 gap-x-8 mb-4">
              <Field label="Loan No" value={loan.loanNo} />
              <Field label="Customer" value={customer.name} />
              <Field label="Security Type" value={loan.security.type.toUpperCase()} />
            </div>
            {loan.security.type === 'vehicle' ? (
              <div className="grid grid-cols-2 gap-x-8">
                <Field label="Vehicle Model" value={loan.security.modelName} />
                <Field label="Registration No" value={loan.security.regNo} />
                <Field label="Chassis No" value={loan.security.chassisNo} />
                <Field label="No. of Keys" value={loan.security.keys} />
                <Field label="RC Book Received" value={loan.security.rcReceived ? 'Yes' : 'No'} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-8">
                <Field label="Item Name" value={loan.security.itemName} />
                <Field label="Weight (grams)" value={loan.security.weight} />
                <Field label="No. of Pieces" value={loan.security.pieces} />
              </div>
            )}
            <SignatureRow />
          </>
        )
      case 'gold-receipt':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>GOLD RECEIPT</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Receipt Date" value={fmtDate(loan.loanDate)} />
              <Field label="Loan No" value={loan.loanNo} />
              <Field label="Customer Name" value={customer.name} />
              <Field label="Mobile" value={customer.mobile} />
              <Field label="Item Name" value={loan.security.itemName ?? '—'} />
              <Field label="Weight (grams)" value={loan.security.weight ?? '—'} />
              <Field label="No. of Pieces" value={loan.security.pieces ?? '—'} />
              <Field label="Loan Amount" value={fmt(loan.amount)} />
            </div>
            <p className="text-xs text-slate-500 mt-6" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '4px' : '0' }}>The above gold items have been received as security against the loan. Items will be returned upon full repayment.</p>
            <SignatureRow />
          </>
        )
      case 'declaration':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>DECLARATION FORM</h2>
            <p className="text-sm text-slate-700 mb-4" contentEditable={isEditing} suppressContentEditableWarning>I, <strong>{customer.name}</strong>, hereby declare that:</p>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 mb-6" contentEditable={isEditing} suppressContentEditableWarning style={{ outline: isEditing ? '1px dashed var(--primary-light)' : 'none', padding: isEditing ? '8px' : '0' }}>
              <li>All information provided in the loan application is true and accurate.</li>
              <li>I have not suppressed any material information.</li>
              <li>I agree to repay the loan as per the agreed schedule.</li>
              <li>I understand that default may result in legal action.</li>
              <li>The security provided is free from any encumbrance.</li>
            </ol>
            <div className="grid grid-cols-2 gap-x-8">
              <Field label="Customer Name" value={customer.name} />
              <Field label="Application No" value={customer.appNo} />
              <Field label="Aadhar No" value={customer.aadhar} />
              <Field label="Date" value={fmtDate(loan.loanDate)} />
            </div>
            <SignatureRow />
          </>
        )
      case 'nominee':
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>NOMINEE DETAILS</h2>
            {customer.nominee ? (
              <div className="grid grid-cols-2 gap-x-8">
                <Field label="Nominee Name" value={customer.nominee.name} />
                <Field label="Relation" value={customer.nominee.relation} />
                <Field label="Date of Birth" value={fmtDate(customer.nominee.dob)} />
                <Field label="Mobile" value={customer.nominee.mobile} />
                <Field label="Identity Proof" value={customer.nominee.identityProof} />
                <Field label="Identity No" value={customer.nominee.identityNo} />
                <Field label="Address" value={customer.nominee.address} />
              </div>
            ) : <p className="text-sm text-slate-500" contentEditable={isEditing} suppressContentEditableWarning>No nominee details recorded.</p>}
            <SignatureRow />
          </>
        )
      case 'guarantor1':
      case 'guarantor2': {
        const g = docType === 'guarantor1' ? customer.guarantor1 : customer.guarantor2
        const slot = docType === 'guarantor1' ? '1' : '2'
        return (
          <>
            <Header />
            <h2 className="text-lg font-bold text-center mb-6 text-slate-800" contentEditable={isEditing} suppressContentEditableWarning>GUARANTOR {slot} DETAILS</h2>
            {g ? (
              <div className="grid grid-cols-2 gap-x-8">
                <Field label="Name" value={g.name} />
                <Field label="Relation" value={g.relation} />
                <Field label="Date of Birth" value={fmtDate(g.dob)} />
                <Field label="Mobile" value={g.mobile} />
                <Field label="Identity Proof" value={g.identityProof} />
                <Field label="Identity No" value={g.identityNo} />
                <Field label="Address" value={g.address} />
                <Field label="Bank Account" value={g.accountNo} />
                <Field label="Bank Name" value={g.bankName} />
                <Field label="IFSC Code" value={g.ifsc} />
              </div>
            ) : <p className="text-sm text-slate-500" contentEditable={isEditing} suppressContentEditableWarning>No guarantor {slot} details recorded.</p>}
            <SignatureRow />
          </>
        )
      }
      default:
        return <p className="text-slate-500">Unknown document type.</p>
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-10 print:shadow-none print:rounded-none document-container">
        {savedHTML ? (
          <div className="document-content" dangerouslySetInnerHTML={{ __html: savedHTML }} />
        ) : (
          <div className="document-content">{renderDoc()}</div>
        )}
        <div className="mt-8 pt-4 border-t border-slate-200 print:hidden flex gap-3 justify-center flex-wrap">
          {isEditing ? (
            <>
              <Button onClick={handleSave} variant="success">
                <Save size={16} /> Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit size={16} /> Edit Document
            </Button>
          )}
          <Button onClick={() => window.print()}>
            Print / Save PDF
          </Button>
          {savedHTML && (
            <Button onClick={handleReset} variant="danger">
              Reset to Original
            </Button>
          )}
          <Button variant="outline" onClick={() => window.close()}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DocumentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading document...</div>}>
      <DocumentContent />
    </Suspense>
  )
}
