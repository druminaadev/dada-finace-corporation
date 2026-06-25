'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { Search, User, Phone, MapPin, ChevronRight, ChevronLeft, Save, Mail, Share2, Hash } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'

export default function AddLoanPage() {
  const { showToast } = useUIStore()
  const { token } = useAuthStore()
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(1)
  const goBack = () => { setCurrentStage(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ id: number; name: string; phone: string; aadhaar: string; address: string }[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<{ id: number; name: string; phone: string; aadhaar: string; address: string; email?: string } | null>(null)
  const [searching, setSearching] = useState(false)

  const [loanData, setLoanData] = useState({
    loanCategory: 'PERSONAL',
    amount: '',
    interestRate: '',
    interestType: 'FLAT',
    tenureType: 'MONTHLY',
    tenure: '',
    processingFee: '0',
    emiStartDate: '',
    notes: ''
  })

  const [emiAmount, setEmiAmount] = useState(0)
  const [agreed, setAgreed] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [submittedLoanNo, setSubmittedLoanNo] = useState('')
  const [nextLoanNo, setNextLoanNo] = useState('LN001')

  useEffect(() => {
    import('@/store/appStore').then(m => {
      const loans = m.useStore.getState().loans
      const nextId = loans.length ? Math.max(...loans.map((x: { id: number }) => x.id)) + 1 : 1
      setNextLoanNo(`LN${String(nextId).padStart(3, '0')}`)
    })
  }, [currentStage])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      showToast('Enter name, mobile, or Aadhaar to search', 'error')
      return
    }
    setSearching(true)
    
    if (FRONTEND_ONLY) {
      await new Promise(r => setTimeout(r, 500))
      const query = searchQuery.toLowerCase()
      
      const { customers } = await import('@/store/appStore').then(m => ({ customers: m.useStore.getState().customers }))
      
      const results = customers
        .filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.mobile.includes(query) || 
          c.aadhar.includes(query)
        )
        .map(c => ({
          id: c.id,
          name: c.name,
          phone: c.mobile,
          aadhaar: c.aadhar,
          address: c.jobAddress || 'N/A'
        }))
      
      setSearchResults(results)
      if (results.length === 0) showToast('No customers found', 'info')
      setSearching(false)
      return
    }
    
    try {
      const res = await fetch(`${API_BASE}/customers?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSearchResults(data.data || [])
      if (data.data.length === 0) showToast('No customers found', 'info')
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Search failed', 'error')
    } finally {
      setSearching(false)
    }
  }

  const selectCustomer = (customer: { id: number; name: string; phone: string; aadhaar: string; address: string }) => {
    setSelectedCustomer(customer)
    setSearchResults([])
    setSearchQuery('')
  }

  const showAllCustomers = async () => {
    const { customers } = await import('@/store/appStore').then(m => ({ customers: m.useStore.getState().customers }))
    const results = customers.map(c => ({
      id: c.id,
      name: c.name,
      phone: c.mobile,
      aadhaar: c.aadhar,
      address: c.jobAddress || 'N/A'
    }))
    setSearchResults(results)
    showToast('Showing all customers', 'info')
  }

  useEffect(() => {
    const amt = parseFloat(loanData.amount) || 0
    const rate = parseFloat(loanData.interestRate) || 0
    let tenureMonths = parseInt(loanData.tenure) || 0

    if (loanData.tenureType === 'YEARLY') {
      tenureMonths = tenureMonths * 12
    }

    if (amt > 0 && rate > 0 && tenureMonths > 0) {
      try {
        let emi: number
        if (loanData.interestType === 'REDUCING') {
          const monthlyRate = rate / 12 / 100
          emi = (amt * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1)
        } else {
          const totalInterest = amt * (rate / 100) * (tenureMonths / 12)
          emi = (amt + totalInterest) / tenureMonths
        }
        setTimeout(() => setEmiAmount(isNaN(emi) ? 0 : Math.round(emi)), 0)
      } catch (error) {
        console.error('EMI calculation error:', error)
        setTimeout(() => setEmiAmount(0), 0)
      }
    } else {
      setTimeout(() => setEmiAmount(0), 0)
    }
  }, [loanData.amount, loanData.interestRate, loanData.tenure, loanData.interestType, loanData.tenureType])

  const handleNextFromStep2 = () => {
    if (!selectedCustomer) { 
      showToast('Please select a customer', 'error')
      return 
    }
    if (!loanData.amount || !loanData.interestRate || !loanData.tenure) {
      showToast('Amount, interest rate, and tenure are required', 'error')
      return
    }
    // Validate amount is positive
    if (parseFloat(loanData.amount) <= 0) {
      showToast('Loan amount must be greater than 0', 'error')
      return
    }
    // Validate interest rate
    if (parseFloat(loanData.interestRate) <= 0) {
      showToast('Interest rate must be greater than 0', 'error')
      return
    }
    // Validate tenure
    if (parseInt(loanData.tenure) <= 0) {
      showToast('Tenure must be greater than 0', 'error')
      return
    }
    
    showToast('Loan details saved successfully', 'success')
    setCurrentStage(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  const handleShareEmail = (loanNo: string) => {
    const subject = `Loan Application ${loanNo} - Confirmation`
    const body = `Dear ${selectedCustomer?.name},\n\nYour loan application has been successfully submitted.\n\nLoan Details:\n- Loan Number: ${loanNo}\n- Amount: ${fmt(parseFloat(loanData.amount))}\n- Interest Rate: ${loanData.interestRate}%\n- Tenure: ${loanData.tenure} ${loanData.tenureType === 'MONTHLY' ? 'Months' : 'Years'}\n- EMI Amount: ${fmt(emiAmount)}\n\nThank you for choosing our services.\n\nBest Regards,\nNexzen Finance`
    window.open(`mailto:${selectedCustomer?.email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    showToast('Email client opened', 'success')
  }

  const handleShareWhatsApp = (loanNo: string) => {
    const message = `*Loan Application Confirmation*\n\nDear ${selectedCustomer?.name},\n\nYour loan application has been successfully submitted.\n\n*Loan Details:*\n• Loan Number: ${loanNo}\n• Amount: ${fmt(parseFloat(loanData.amount))}\n• Interest Rate: ${loanData.interestRate}%\n• Tenure: ${loanData.tenure} ${loanData.tenureType === 'MONTHLY' ? 'Months' : 'Years'}\n• EMI Amount: ${fmt(emiAmount)}\n\nThank you for choosing our services.\n\n_Nexzen Finance_`
    window.open(`https://wa.me/${selectedCustomer?.phone}?text=${encodeURIComponent(message)}`)
    showToast('WhatsApp opened', 'success')
  }

  return (
    <div className="min-h-screen bg-[var(--background)] dark:bg-[var(--bg)]">
      <PageHeader title="Add Loan Application" />
      
      <div className="flex flex-col gap-4 pb-8">
        {currentStage === 1 && (
          <>
            <Card title="Step 1: Search & Select Customer">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Input
                    placeholder="Search by name, mobile, or Aadhaar"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={searching}>
                    <Search size={16} /> {searching ? 'Searching...' : 'Search'}
                  </Button>
                  {FRONTEND_ONLY && (
                    <Button variant="outline" onClick={showAllCustomers}>
                      <User size={16} /> Show All
                    </Button>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="p-4 rounded-lg border cursor-pointer hover:bg-[var(--hover)] transition"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center gap-3">
                          <User size={20} style={{ color: 'var(--accent)' }} />
                          <div className="flex-1">
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{customer.name}</p>
                            <div className="flex gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              <span className="flex items-center gap-1"><Phone size={14} /> {customer.phone}</span>
                              <span>Aadhaar: {customer.aadhaar}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-lg" style={{ color: 'var(--accent)' }}>
                          {selectedCustomer.name}
                        </p>
                        <div className="flex gap-4 text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                          <span className="flex items-center gap-1"><Phone size={14} /> {selectedCustomer.phone}</span>
                          <span className="flex items-center gap-1"><MapPin size={14} /> {selectedCustomer.address}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                        Change
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {selectedCustomer && (
              <Card title="Step 2: Loan Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Select
                    label="Loan Category"
                    required
                    value={loanData.loanCategory}
                    onChange={(e) => setLoanData({ ...loanData, loanCategory: e.target.value })}
                    options={[
                      { value: 'PERSONAL', label: 'Personal Loan' },
                      { value: 'GOLD', label: 'Gold Loan' },
                      { value: 'VEHICLE', label: 'Vehicle Loan' },
                    ]}
                  />
                  <Input
                    label="Loan Amount (₹)"
                    required
                    type="number"
                    value={loanData.amount}
                    onChange={(e) => setLoanData({ ...loanData, amount: e.target.value })}
                    placeholder="e.g. 100000"
                  />
                  <Input
                    label="Interest Rate (%)"
                    required
                    type="number"
                    step="0.1"
                    value={loanData.interestRate}
                    onChange={(e) => setLoanData({ ...loanData, interestRate: e.target.value })}
                    placeholder="e.g. 12"
                  />
                  <Select
                    label="Interest Type"
                    required
                    value={loanData.interestType}
                    onChange={(e) => setLoanData({ ...loanData, interestType: e.target.value })}
                    options={[
                      { value: 'FLAT', label: 'Flat Rate' },
                      { value: 'REDUCING', label: 'Reducing Balance' },
                    ]}
                  />
                  <Select
                    label="Tenure Type"
                    required
                    value={loanData.tenureType}
                    onChange={(e) => setLoanData({ ...loanData, tenureType: e.target.value })}
                    options={[
                      { value: 'MONTHLY', label: 'Monthly' },
                      { value: 'YEARLY', label: 'Yearly' },
                    ]}
                  />
                  <Input
                    label={`Tenure (${loanData.tenureType === 'MONTHLY' ? 'Months' : 'Years'})`}
                    required
                    type="number"
                    value={loanData.tenure}
                    onChange={(e) => setLoanData({ ...loanData, tenure: e.target.value })}
                    placeholder={loanData.tenureType === 'MONTHLY' ? 'e.g. 12' : 'e.g. 1'}
                  />
                  <Input
                    label="Processing Fee (₹)"
                    type="number"
                    value={loanData.processingFee}
                    onChange={(e) => setLoanData({ ...loanData, processingFee: e.target.value })}
                    placeholder="0"
                  />
                  <Input
                    label="EMI Start Date"
                    type="date"
                    value={loanData.emiStartDate}
                    onChange={(e) => setLoanData({ ...loanData, emiStartDate: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Principal</div>
                    <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {fmt(parseFloat(loanData.amount) || 0)}
                    </div>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>EMI Amount</div>
                    <div className="text-base font-bold" style={{ color: '#f97316' }}>{fmt(emiAmount)}</div>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--hover)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Total Payable</div>
                    <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {fmt(emiAmount * (loanData.tenureType === 'YEARLY' ? parseInt(loanData.tenure || '0') * 12 : parseInt(loanData.tenure || '0')))}
                    </div>
                  </div>
                  <div className="rounded-lg p-3 text-center" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
                    <div className="text-xs mb-1" style={{ color: 'var(--accent)' }}>Tenure</div>
                    <div className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                      {loanData.tenure} {loanData.tenureType === 'MONTHLY' ? 'Months' : 'Years'}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Textarea
                    label="Notes"
                    rows={2}
                    value={loanData.notes}
                    onChange={(e) => setLoanData({ ...loanData, notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" size="lg" onClick={() => {
                    showToast('Draft saved successfully', 'success')
                  }}>
                    <Save size={16} /> Save Draft
                  </Button>
                  <Button onClick={handleNextFromStep2} size="lg">
                    Save & Continue <ChevronRight size={16} />
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {currentStage === 2 && (
          <Card title="Step 2: Review & Submit">
            <div className="space-y-6">
              {/* Loan ID Display */}
              <div className="relative overflow-hidden rounded-2xl p-5 flex items-center justify-between gap-4"
                style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, var(--primary-light) 100%)', boxShadow: '0 8px 32px rgba(67,118,108,0.28)' }}>
                <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-10" style={{ background: 'white' }} />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-10" style={{ background: 'white' }} />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                    <Hash size={22} color="white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>Loan Application No.</p>
                    <p className="text-3xl font-black tracking-tight" style={{ color: 'white', letterSpacing: '-0.02em' }}>{nextLoanNo}</p>
                  </div>
                </div>
                <div className="relative flex flex-col items-end gap-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(255,255,255,0.18)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                    PENDING
                  </span>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg" style={{ background: 'var(--accent-tint)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Loan Amount</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    {fmt(parseFloat(loanData.amount) || 0)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Interest Rate</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {loanData.interestRate}%
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>EMI Amount</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {fmt(emiAmount)}
                  </p>
                </div>
                <div className="p-4 rounded-lg" style={{ background: 'var(--success-tint)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>Total Payable</p>
                  <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                    {fmt(emiAmount * (loanData.tenureType === 'YEARLY' ? parseInt(loanData.tenure || '0') * 12 : parseInt(loanData.tenure || '0')))}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Name</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedCustomer?.name}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Mobile</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedCustomer?.phone}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Aadhaar</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedCustomer?.aadhaar}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ background: 'var(--hover)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Loan Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loan Type</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{loanData.loanCategory}</p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Tenure</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {loanData.tenure} {loanData.tenureType === 'MONTHLY' ? 'Months' : 'Years'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Processing Fee</p>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {fmt(parseFloat(loanData.processingFee || '0'))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="mt-1 w-5 h-5 rounded cursor-pointer" 
                    style={{ accentColor: 'var(--accent)' }}
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <div className="text-sm">
                    <p className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>I agree to the terms and conditions</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      I confirm that all the information provided is accurate and complete. I understand that providing false information may result in rejection of my loan application.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </Card>
        )}

        {currentStage >= 2 && (
          <div className="flex justify-between items-center gap-4 mt-6 p-4 rounded-xl" style={{ background: 'var(--hover)' }}>
            <Button variant="outline" size="lg" onClick={goBack}>
              <ChevronLeft size={18} /> Previous
            </Button>
            <Button
              size="lg"
              onClick={() => {
                if (currentStage === 2) {
                  if (!selectedCustomer) { showToast('Please select a customer', 'error'); return }
                  if (!agreed) { showToast('Please agree to terms and conditions', 'error'); return }
                  const submitLoan = async () => {
                    const { addLoan } = await import('@/store/appStore').then(m => ({ addLoan: m.useStore.getState().addLoan }))
                    let tenureMonths = parseInt(loanData.tenure)
                    if (loanData.tenureType === 'YEARLY') tenureMonths *= 12
                    const totalInterest = loanData.interestType === 'FLAT'
                      ? parseFloat(loanData.amount) * (parseFloat(loanData.interestRate) / 100) * (tenureMonths / 12) : 0
                    addLoan({
                      customerId: selectedCustomer.id, employeeId: 1,
                      loanDate: new Date().toISOString().split('T')[0],
                      emiStartDate: loanData.emiStartDate || new Date().toISOString().split('T')[0],
                      loanTypeId: loanData.loanCategory === 'PERSONAL' ? 1 : loanData.loanCategory === 'GOLD' ? 3 : 4,
                      amount: parseFloat(loanData.amount), installments: tenureMonths,
                      interestRate: parseFloat(loanData.interestRate), interestAmount: Math.round(totalInterest),
                      fileCharges: parseFloat(loanData.processingFee), otherCharges: 0,
                      intervalDays: 'Monthly', remarks: loanData.notes,
                      security: { type: 'vehicle', fileUrls: [] },
                      receiver: { mobile: selectedCustomer.phone, documentUrl: '' }
                    })
                    const updatedLoans = await import('@/store/appStore').then(m => m.useStore.getState().loans)
                    const newLoan = updatedLoans[updatedLoans.length - 1]
                    const { addNotification } = await import('@/store/uiStore').then(m => ({ addNotification: m.useUIStore.getState().addNotification }))
                    addNotification('Loan Application Submitted', `Loan ${newLoan.loanNo} for ${selectedCustomer.name} created. Amount: ${fmt(parseFloat(loanData.amount))}`)
                    setSubmittedLoanNo(newLoan.loanNo)
                    showToast(`Loan ${newLoan.loanNo} created successfully!`, 'success')
                    setShowShareModal(true)
                  }
                  submitLoan()
                }
              }}
            >
              {currentStage === 2 ? <><Save size={18} /> Confirm & Submit</> : <>Save & Continue <ChevronRight size={18} /></>}
            </Button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => {
          setShowShareModal(false)
          router.push('/loans/list')
        }}>
          <div className="bg-white dark:bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--success-tint)' }}>
                <Save size={32} style={{ color: 'var(--success)' }} />
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Loan Created Successfully!</h2>
              <p className="text-lg font-semibold" style={{ color: 'var(--accent)' }}>Loan Number: {submittedLoanNo}</p>
              <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>Share loan details with customer</p>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => handleShareWhatsApp(submittedLoanNo)} 
                size="lg"
                className="w-full"
                style={{ background: '#25D366', boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)' }}
              >
                <Share2 size={20} /> Share via WhatsApp
              </Button>
              <Button 
                onClick={() => handleShareEmail(submittedLoanNo)} 
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Mail size={20} /> Share via Email
              </Button>
              <Button 
                onClick={() => {
                  setShowShareModal(false)
                  router.push('/loans/list')
                }} 
                variant="ghost"
                size="lg"
                className="w-full"
              >
                Skip & Go to Loans List
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
