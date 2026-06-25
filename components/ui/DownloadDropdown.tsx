'use client'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FileText, Download, ChevronDown } from 'lucide-react'
import { useStore } from '@/store/appStore'

const DOCUMENTS = [
  { key: 'receiver',     label: 'Receiver Details' },
  { key: 'nominee',      label: 'Nominee Details' },
  { key: 'guarantor1',   label: 'Guarantor 1 Details' },
  { key: 'guarantor2',   label: 'Guarantor 2 Details' },
  { key: 'contract',     label: 'Loan Contract' },
  { key: 'sanction',     label: 'Loan Sanction Letter' },
  { key: 'promissory',   label: 'Promissory Note' },
  { key: 'cash-voucher', label: 'Cash Voucher' },
  { key: 'voucher',      label: 'Voucher' },
  { key: 'mortgage',     label: 'Mortgage Details' },
  { key: 'gold-receipt', label: 'Gold Receipt' },
  { key: 'declaration',  label: 'Declaration Form' },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateDocHTML(docKey: string, loan: any, customer: any): string {
  const date = new Date().toLocaleDateString('en-IN')
  const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(loan.amount)
  const customerName = customer?.name ?? 'N/A'

  const base = `<html><head><style>body{font-family:Arial,sans-serif;padding:40px;color:#1a1a1a;font-size:13px}h1{color:#1E40AF;border-bottom:2px solid #1E40AF;padding-bottom:8px;font-size:18px}h2{color:#374151;font-size:14px;margin-top:20px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}th{background:#f1f5f9;font-weight:600;color:#374151}.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.company{font-size:20px;font-weight:700;color:#1E40AF}.footer{margin-top:40px;border-top:1px solid #e5e7eb;padding-top:16px;font-size:11px;color:#6b7280;text-align:center}.sign-area{display:flex;justify-content:space-between;margin-top:60px}.sign-box{text-align:center;width:200px}.sign-line{border-top:1px solid #374151;padding-top:8px;font-size:11px;color:#6b7280}</style></head><body><div class="header"><div><div class="company">🏦 NEXZEN</div><div style="color:#6b7280;font-size:11px">Loan Management System</div></div><div style="text-align:right;font-size:11px;color:#6b7280">Date: ${date}<br/>Loan No: ${loan.loanNo}</div></div>`
  const footer = `<div class="sign-area"><div class="sign-box"><div class="sign-line">Borrower Signature</div></div><div class="sign-box"><div class="sign-line">Authorized Signatory</div></div></div><div class="footer">Copyright © 2025 NEXZEN. All rights reserved.</div></body></html>`

  const docs: Record<string, string> = {
    receiver: `${base}<h1>Receiver Details</h1><table><tr><th>Field</th><th>Details</th></tr><tr><td>Loan No</td><td>${loan.loanNo}</td></tr><tr><td>Customer Name</td><td>${customerName}</td></tr><tr><td>Receiver Mobile</td><td>${loan.receiver.mobile}</td></tr><tr><td>Loan Amount</td><td>${amount}</td></tr><tr><td>Disbursement Date</td><td>${loan.loanDate}</td></tr></table>${footer}`,
    nominee: `${base}<h1>Nominee Details</h1>${customer?.nominee ? `<table><tr><th>Field</th><th>Details</th></tr><tr><td>Nominee Name</td><td>${customer.nominee.name}</td></tr><tr><td>Relation</td><td>${customer.nominee.relation}</td></tr><tr><td>Mobile</td><td>${customer.nominee.mobile}</td></tr><tr><td>Identity Proof</td><td>${customer.nominee.identityProof} - ${customer.nominee.identityNo}</td></tr><tr><td>Address</td><td>${customer.nominee.address}</td></tr><tr><td>Bank Account</td><td>${customer.nominee.accountNo} | ${customer.nominee.bankName}</td></tr><tr><td>IFSC</td><td>${customer.nominee.ifsc}</td></tr></table>` : '<p>No nominee details available.</p>'}${footer}`,
    guarantor1: `${base}<h1>Guarantor 1 Details</h1>${customer?.guarantor1 ? `<table><tr><th>Field</th><th>Details</th></tr><tr><td>Name</td><td>${customer.guarantor1.name}</td></tr><tr><td>Relation</td><td>${customer.guarantor1.relation}</td></tr><tr><td>Mobile</td><td>${customer.guarantor1.mobile}</td></tr><tr><td>Address</td><td>${customer.guarantor1.address}</td></tr><tr><td>Bank</td><td>${customer.guarantor1.accountNo} | ${customer.guarantor1.bankName}</td></tr></table>` : '<p>No guarantor 1 details available.</p>'}${footer}`,
    guarantor2: `${base}<h1>Guarantor 2 Details</h1>${customer?.guarantor2 ? `<table><tr><th>Field</th><th>Details</th></tr><tr><td>Name</td><td>${customer.guarantor2.name}</td></tr><tr><td>Relation</td><td>${customer.guarantor2.relation}</td></tr><tr><td>Mobile</td><td>${customer.guarantor2.mobile}</td></tr></table>` : '<p>No guarantor 2 details available.</p>'}${footer}`,
    contract: `${base}<h1>Loan Contract</h1><p>This Loan Agreement is entered into on <strong>${loan.loanDate}</strong> between <strong>NEXZEN</strong> (Lender) and <strong>${customerName}</strong> (Borrower).</p><h2>Loan Terms</h2><table><tr><th>Parameter</th><th>Value</th></tr><tr><td>Loan Amount</td><td>${amount}</td></tr><tr><td>Interest Rate</td><td>${loan.interestRate}% (Flat Rate)</td></tr><tr><td>Total Interest</td><td>₹${loan.interestAmount.toLocaleString('en-IN')}</td></tr><tr><td>No. of Installments</td><td>${loan.installments}</td></tr><tr><td>EMI Start Date</td><td>${loan.emiStartDate}</td></tr><tr><td>Interval</td><td>${loan.intervalDays}</td></tr><tr><td>File Charges</td><td>₹${loan.fileCharges.toLocaleString('en-IN')}</td></tr><tr><td>Other Charges</td><td>₹${loan.otherCharges.toLocaleString('en-IN')}</td></tr></table>${footer}`,
    sanction: `${base}<h1>Loan Sanction Letter</h1><p>Dear <strong>${customerName}</strong>,</p><p>We are pleased to inform you that your loan application has been <strong>sanctioned</strong> with the following terms:</p><table><tr><th>Detail</th><th>Value</th></tr><tr><td>Loan Reference No</td><td>${loan.loanNo}</td></tr><tr><td>Sanctioned Amount</td><td>${amount}</td></tr><tr><td>Rate of Interest</td><td>${loan.interestRate}% per annum (Flat)</td></tr><tr><td>Tenure</td><td>${loan.installments} installments</td></tr><tr><td>EMI Frequency</td><td>${loan.intervalDays}</td></tr><tr><td>EMI Start Date</td><td>${loan.emiStartDate}</td></tr></table>${footer}`,
    promissory: `${base}<h1>Promissory Note</h1><p>I, <strong>${customerName}</strong>, hereby promise to pay to <strong>NEXZEN</strong> the sum of <strong>${amount}</strong> with interest at <strong>${loan.interestRate}%</strong> per annum.</p><table><tr><th>Loan No</th><th>Principal</th><th>Interest</th><th>Total Payable</th></tr><tr><td>${loan.loanNo}</td><td>${amount}</td><td>₹${loan.interestAmount.toLocaleString('en-IN')}</td><td>₹${(loan.amount + loan.interestAmount).toLocaleString('en-IN')}</td></tr></table>${footer}`,
    'cash-voucher': `${base}<h1>Cash Disbursement Voucher</h1><table><tr><th>Field</th><th>Details</th></tr><tr><td>Voucher No</td><td>CV-${loan.loanNo}</td></tr><tr><td>Date</td><td>${loan.loanDate}</td></tr><tr><td>Paid To</td><td>${customerName}</td></tr><tr><td>Amount</td><td>${amount}</td></tr><tr><td>Purpose</td><td>Loan Disbursement - ${loan.loanNo}</td></tr><tr><td>Mode</td><td>Cash</td></tr></table>${footer}`,
    voucher: `${base}<h1>General Voucher</h1><table><tr><th>Field</th><th>Details</th></tr><tr><td>Voucher No</td><td>GV-${loan.loanNo}</td></tr><tr><td>Date</td><td>${date}</td></tr><tr><td>Account</td><td>Loan Account - ${loan.loanNo}</td></tr><tr><td>Amount</td><td>${amount}</td></tr><tr><td>Narration</td><td>Loan disbursement to ${customerName}</td></tr></table>${footer}`,
    mortgage: `${base}<h1>Mortgage / Security Details</h1><table><tr><th>Field</th><th>Details</th></tr><tr><td>Loan No</td><td>${loan.loanNo}</td></tr><tr><td>Borrower</td><td>${customerName}</td></tr><tr><td>Security Type</td><td>${loan.security.type.toUpperCase()}</td></tr>${loan.security.type === 'vehicle' ? `<tr><td>Vehicle Model</td><td>${loan.security.modelName}</td></tr><tr><td>Registration No</td><td>${loan.security.regNo}</td></tr><tr><td>Chassis No</td><td>${loan.security.chassisNo}</td></tr><tr><td>No. of Keys</td><td>${loan.security.keys}</td></tr><tr><td>RC Book Received</td><td>${loan.security.rcReceived ? 'Yes' : 'No'}</td></tr>` : `<tr><td>Item Name</td><td>${loan.security.itemName}</td></tr><tr><td>Weight</td><td>${loan.security.weight} grams</td></tr><tr><td>No. of Pieces</td><td>${loan.security.pieces}</td></tr>`}</table>${footer}`,
    'gold-receipt': `${base}<h1>Gold Receipt</h1>${loan.security.type === 'gold' ? `<p>Gold items received as collateral for Loan No. <strong>${loan.loanNo}</strong>.</p><table><tr><th>Item Name</th><th>Weight (g)</th><th>No. of Pieces</th><th>Loan Amount</th></tr><tr><td>${loan.security.itemName}</td><td>${loan.security.weight}</td><td>${loan.security.pieces}</td><td>${amount}</td></tr></table>` : '<p>This loan does not have gold as security.</p>'}${footer}`,
    declaration: `${base}<h1>Declaration Form</h1><p>I, <strong>${customerName}</strong>, hereby declare that:</p><ol style="line-height:2"><li>All information provided is true and correct.</li><li>I have not suppressed any material information.</li><li>I agree to the terms and conditions of the loan.</li><li>I understand that providing false information is a criminal offence.</li><li>I authorize NEXZEN to verify all submitted documents.</li><li>I agree to repay the loan as per the agreed schedule.</li></ol><p><strong>Loan Reference:</strong> ${loan.loanNo} | <strong>Amount:</strong> ${amount}</p>${footer}`,
  }
  return docs[docKey] ?? `${base}<h1>Document</h1><p>Document not available.</p>${footer}`
}

export function DownloadDropdown({ loanId }: { loanId: number }) {
  const [open, setOpen] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const { loans, customers } = useStore()

  // Position the portal dropdown relative to the button
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      const dropW = 224
      const left = rect.right - dropW < 0 ? rect.left : rect.right - dropW
      setDropPos({ top: rect.bottom + 6, left })
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        dropRef.current && !dropRef.current.contains(e.target as Node)
      ) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const download = (docKey: string) => {
    window.open(`/loans/documents?loanId=${loanId}&type=${docKey}`, '_blank')
    setOpen(false)
  }

  const dropdown = open ? (
    <div
      ref={dropRef}
      style={{
        position: 'fixed',
        top: dropPos.top,
        left: dropPos.left,
        width: 232,
        zIndex: 99999,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        boxShadow: '0 8px 32px rgba(118,69,59,0.10), 0 2px 8px rgba(118,69,59,0.06)',
        overflow: 'hidden',
        animation: 'ddFadeIn 0.18s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <style>{`
        @keyframes ddFadeIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        padding: '12px 14px 8px',
        borderBottom: '1px solid var(--border)',
        background: 'linear-gradient(135deg, var(--accent-tint), rgba(177,148,112,0.08))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Download size={13} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Documents</div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', opacity: 0.7, marginTop: 1 }}>Select to download</div>
          </div>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: '6px 6px', maxHeight: 320, overflowY: 'auto', scrollbarWidth: 'thin' }}>
        {DOCUMENTS.map((doc) => (
          <button
            key={doc.key}
            onClick={(e) => { e.stopPropagation(); download(doc.key) }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', textAlign: 'left', transition: 'background 0.13s ease',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--hover)'
              const arrow = e.currentTarget.querySelector('.dd-arrow') as HTMLElement
              if (arrow) arrow.style.opacity = '1'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              const arrow = e.currentTarget.querySelector('.dd-arrow') as HTMLElement
              if (arrow) arrow.style.opacity = '0'
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: 'rgba(67,118,108,0.10)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={13} style={{ color: 'var(--primary)' }} />
            </div>
            <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500, lineHeight: 1.3 }}>{doc.label}</span>
            <Download className="dd-arrow" size={12} style={{ color: 'var(--primary)', opacity: 0, transition: 'opacity 0.13s', flexShrink: 0 }} />
          </button>
        ))}
      </div>
    </div>
  ) : null

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); setOpen(p => !p) }}
        title="Download Documents"
        aria-expanded={open}
        aria-haspopup="true"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '5px 9px', borderRadius: 8, border: 'none', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, transition: 'all 0.15s ease',
          background: open ? 'var(--accent-tint)' : 'rgba(67,118,108,0.07)',
          color: open ? 'var(--primary)' : 'var(--text-secondary)',
          boxShadow: open ? '0 0 0 1.5px var(--primary)' : 'none',
        }}
        onMouseEnter={e => {
          if (!open) {
            e.currentTarget.style.background = 'var(--accent-tint)'
            e.currentTarget.style.color = 'var(--primary)'
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            e.currentTarget.style.background = 'rgba(67,118,108,0.07)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }
        }}
      >
        <Download size={13} />
        <ChevronDown size={10} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {typeof window !== 'undefined' && dropdown && createPortal(dropdown, document.body)}
    </div>
  )
}
