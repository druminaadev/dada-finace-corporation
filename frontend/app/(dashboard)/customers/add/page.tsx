'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/store/uiStore'
import { useStore } from '@/store/appStore'
import {
  Save, X, Send, Camera, RotateCcw,
  ChevronRight, ChevronLeft, User, Phone, CreditCard,
  MapPin, Mail, Briefcase, Building2, Eye, CheckCircle,
  Upload
} from 'lucide-react'

const STEPS = ['Verify Aadhaar', 'Personal Info', 'Bank Details', 'Nominee & Guarantors', 'Upload Documents', 'Preview & Save']

const DOC_LIST = [
  { id: 'identity_proof', label: 'Identity Proof (Aadhaar/Passport)', required: true },
  { id: 'pan_card', label: 'PAN Card', required: true },
  { id: 'passport_photo', label: 'Passport Size Photo', required: true },
  { id: 'address_proof', label: 'Address Proof', required: true },
  { id: 'bank_statement', label: 'Bank Statement (Last 6 months)', required: true },
  { id: 'income_proof', label: 'Income Proof (Salary Slip/ITR)', required: true },
  { id: 'guarantor_identity', label: 'Guarantor Identity Proof', required: true },
  { id: 'guarantor_pan', label: 'Guarantor PAN Card', required: true },
  { id: 'guarantor_address', label: 'Guarantor Address Proof', required: true },
]

export default function AddCustomerPage() {
  
  const { addCustomer, branches, employees } = useStore()
  const router = useRouter()

  const [step, setStep] = useState(0) // 0=aadhaar, 1=personal, 2=bank, 3=nominee/guarantors, 4=documents, 5=preview
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; size: number } | null>>({})
  const [confirmedDocs, setConfirmedDocs] = useState<Record<string, boolean>>({})
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [aadhaar, setAadhaar] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [maskedPhone, setMaskedPhone] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '', fatherName: '', motherName: '', dob: '', age: '', gender: '', maritalStatus: '',
    bloodGroup: '', occupation: '', mobile: '', altMobile: '', email: '', aadhar: '',
    pan: '', address: '', jobAddress: '',
    branchId: '1', employeeId: '1',
    bankAccountNo: '', bankHolderName: '', bankName: '', bankBranch: '', bankIfsc: ''
  })

  const [nomineeData, setNomineeData] = useState({ name: '', mobile: '', relationship: '', dob: '', address: '' })
  const [guarantor1Data, setGuarantor1Data] = useState({ name: '', mobile: '', email: '', aadhar: '', pan: '', relationship: '', occupation: '', income: '', address: '' })
  const [guarantor2Data, setGuarantor2Data] = useState({ name: '', mobile: '', email: '', aadhar: '', pan: '', relationship: '', occupation: '', income: '', address: '' })

  // Photo
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photoTaken, setPhotoTaken] = useState(false)
  const [photoDataUrl, setPhotoDataUrl] = useState('')
  const [showCamera, setShowCamera] = useState(false)

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (formData.dob) {
      const age = Math.floor((Date.now() - new Date(formData.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
      if (age > 0) setTimeout(() => set('age', String(age)), 0)
    }
  }, [formData.dob])

  // Camera helpers
  const startCamera = async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = ms; setStream(ms); setShowCamera(true)
    } catch (err: unknown) {
      const errName = err instanceof Error ? (err as Error & { name: string }).name : ''
    }
  }
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    streamRef.current = null; setStream(null); setShowCamera(false)
  }
  const capturePhoto = () => {
    const v = videoRef.current, c = canvasRef.current
    if (!v || !c || !stream) return
    c.width = v.videoWidth; c.height = v.videoHeight
    const ctx = c.getContext('2d')!
    ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1)
    ctx.drawImage(v, 0, 0, c.width, c.height); ctx.restore()
    setPhotoDataUrl(c.toDataURL('image/jpeg', 0.8))
    setPhotoTaken(true); stopCamera()
  }

  useEffect(() => {
    if (!showCamera || !stream || !videoRef.current) return
    const v = videoRef.current; v.srcObject = stream; v.play().catch(() => { })
    return () => { if (v.srcObject === stream) v.srcObject = null }
  }, [showCamera, stream])
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  // OTP
  const handleSendOtp = async () => {
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    setOtpSent(true); setMaskedPhone('******7890'); setDevOtp('123456')
  }
  const handleVerifyOtp = async () => {
    setVerifying(true)
    await new Promise(r => setTimeout(r, 800))
    setFormData(p => ({ ...p, name: 'John Doe', dob: '1990-01-15', gender: 'Male', mobile: '9876547890', address: '123 Main Street, City', aadhar: aadhaar }))
  }

  // Validation per step
  const validateStep = (s: number) => {
    if (s === 1) {
    }
    if (s === 2) {
    }
    if (s === 3) {
      // Nominee details

      // Guarantor 1 details

      // Guarantor 2 (optional, but if filled, all fields are required)
      const hasGuarantor2Info = !!(
        guarantor2Data.name?.trim() ||
        guarantor2Data.mobile?.trim() ||
        guarantor2Data.email?.trim() ||
        guarantor2Data.aadhar?.trim() ||
        guarantor2Data.pan?.trim() ||
        guarantor2Data.relationship?.trim() ||
        guarantor2Data.occupation?.trim() ||
        guarantor2Data.income ||
        guarantor2Data.address?.trim()
      )
      if (hasGuarantor2Info) {
      }
    }
    if (s === 4) {
      const missing = DOC_LIST.filter(doc => doc.required && !uploadedDocs[doc.id])
      if (missing.length > 0) {
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep(s => s + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleBack = () => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSubmit = async () => {
    if (!formData.name || !formData.mobile || !formData.aadhar) {
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    const toNominee = (d: typeof nomineeData) => ({
      identityProof: '', identityNo: '', name: d.name, relation: d.relationship,
      dob: d.dob, age: 0, mobile: d.mobile, address: d.address,
      photoUrl: '', accountNo: '', holderName: '', bankName: '', bankBranch: '', ifsc: '', documentUrl: ''
    })
    const toGuarantor = (d: typeof guarantor1Data, slot: 1 | 2) => ({
      identityProof: '', identityNo: '', name: d.name, relation: d.relationship,
      dob: '', age: 0, mobile: d.mobile, address: d.address,
      photoUrl: '', accountNo: '', holderName: '', bankName: '', bankBranch: '', ifsc: '', documentUrl: '',
      slot
    })
    addCustomer({
      name: formData.name, fatherName: formData.fatherName, motherName: formData.motherName,
      dob: formData.dob, age: parseInt(formData.age) || 0, gender: formData.gender,
      maritalStatus: formData.maritalStatus, bloodGroup: formData.bloodGroup,
      occupation: formData.occupation, regDate: new Date().toISOString().split('T')[0],
      mobile: formData.mobile, altMobile: formData.altMobile, email: formData.email,
      aadhar: formData.aadhar, pan: formData.pan, jobAddress: formData.jobAddress,
      stateId: 1, cityId: 1, areaId: 1,
      branchId: Number(formData.branchId) || 1,
      employeeId: Number(formData.employeeId) || 1,
      photoUrl: photoDataUrl,
      bank: { accountNo: formData.bankAccountNo, holderName: formData.bankHolderName, bankName: formData.bankName, bankBranch: formData.bankBranch, ifsc: formData.bankIfsc, documentUrl: '' },
      nominee: nomineeData.name ? toNominee(nomineeData) : null,
      guarantor1: guarantor1Data.name ? toGuarantor(guarantor1Data, 1) : null,
      guarantor2: guarantor2Data.name ? toGuarantor(guarantor2Data, 2) : null
    })
    useUIStore.getState().addNotification('New Customer Registered', `${formData.name} registered. Mobile: ${formData.mobile}`)
    setSubmitting(false)
    router.push('/customers/list')
  }

  // ── Step 0: Aadhaar ──
  if (step === 0) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 1 of 6 — Aadhaar Verification" steps={STEPS} currentStep={step} />



      {/* OTP Form */}
      <Card title="Aadhaar OTP Verification">
        <div className="space-y-5">
          <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--hover)', color: 'var(--text-secondary)' }}>
            Enter the customer's 12-digit Aadhaar number. An OTP will be sent to their registered mobile.
          </div>

          {/* Step 1 */}
          <div>
            <div className="flex gap-3">
              <Input label="Aadhaar Number" required placeholder="Enter 12-digit Aadhaar" maxLength={12}
                value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} disabled={otpSent} />
              <div className="flex items-end">
                <Button onClick={handleSendOtp} disabled={sending || otpSent} loading={sending}>
                  <Send size={15} /> {otpSent ? 'Sent ✓' : 'Send OTP'}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          {otpSent && (
            <div>

              <div className="p-3 rounded-xl text-sm mb-4" style={{ background: 'var(--accent-tint)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                OTP sent to {maskedPhone}
                {devOtp && <span className="ml-2 font-mono font-bold">(DEV: {devOtp})</span>}
              </div>
              <div className="flex gap-3">
                <Input label="Enter OTP" required placeholder="6-digit OTP" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                <div className="flex items-end">
                  <Button onClick={handleVerifyOtp} disabled={verifying} loading={verifying}>
                    <CheckCircle size={15} /> Verify OTP
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer skip */}
        <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Don't have Aadhaar details right now?</p>
          <Button variant="outline" size="sm" onClick={() => {
            setStep(1)
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}>
            <ChevronRight size={14} /> Skip for Now
          </Button>
        </div>
      </Card>
    </div>
  )

  // ── Step 1: Personal Info ──
  if (step === 1) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 2 of 6 — Personal Information" steps={STEPS} currentStep={step} />
      <div className="flex flex-col gap-4">
        {/* Photo */}
        <Card title="Customer Photo">
          {!showCamera && !photoTaken && (
            <div className="flex flex-col items-center gap-3 py-8 rounded-xl cursor-pointer"
              style={{ border: '2px dashed var(--border)', background: 'var(--hover)' }}
              onClick={startCamera}>
              <Camera size={32} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Click to start camera (Required)</span>
            </div>
          )}
          {showCamera && stream && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden mx-auto" style={{ maxWidth: 480, border: '2px solid var(--accent)' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: 320, objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }} />
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1.5" style={{ background: 'rgba(239,68,68,0.9)', color: '#fff' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={capturePhoto}><Camera size={15} /> Capture</Button>
                <Button variant="outline" onClick={stopCamera}><X size={15} /> Cancel</Button>
              </div>
            </div>
          )}
          {photoTaken && photoDataUrl && (
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <img src={photoDataUrl} alt="Customer" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" style={{ border: '2px solid var(--success)' }} />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Photo captured</span>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setPhotoTaken(false); setPhotoDataUrl(''); startCamera() }}>
                  <RotateCcw size={13} /> Retake
                </Button>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </Card>

        <Card title="Personal Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Customer Name" required value={formData.name} onChange={e => set('name', e.target.value)} />
            <Input label="Father's Name" required value={formData.fatherName} onChange={e => set('fatherName', e.target.value)} />
            <Input label="Mother's Name" required value={formData.motherName} onChange={e => set('motherName', e.target.value)} />
            <Input label="Date of Birth" required type="date" value={formData.dob} onChange={e => set('dob', e.target.value)} />
            <Input label="Age" required value={formData.age} readOnly />
            <Select label="Gender" required value={formData.gender} onChange={e => set('gender', e.target.value)}
              options={['Male', 'Female', 'Other'].map(v => ({ value: v, label: v }))} placeholder="Select Gender" />
            <Select label="Marital Status" required value={formData.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}
              options={['Single', 'Married', 'Divorced', 'Widowed'].map(v => ({ value: v, label: v }))} placeholder="Select Status" />
            <Input label="Blood Group" required value={formData.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} placeholder="e.g. B+" />
            <Input label="Occupation" required value={formData.occupation} onChange={e => set('occupation', e.target.value)} />
            <Input label="Mobile Number" required value={formData.mobile} onChange={e => set('mobile', e.target.value)} />
            <Input label="Alt Mobile" required value={formData.altMobile} onChange={e => set('altMobile', e.target.value)} />
            <Input label="Email" required type="email" value={formData.email} onChange={e => set('email', e.target.value)} />
            <Input label="Aadhaar" required value={formData.aadhar} readOnly />
            <Input label="PAN" required value={formData.pan} onChange={e => set('pan', e.target.value.toUpperCase())} maxLength={10} />
            <Input label="Job Address" required value={formData.jobAddress} onChange={e => set('jobAddress', e.target.value)} />
            <Select label="Branch" required value={formData.branchId} onChange={e => set('branchId', e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Select Branch" />
            <Select label="Assigned Employee" required value={formData.employeeId} onChange={e => set('employeeId', e.target.value)}
              options={employees.map(emp => ({ value: emp.id, label: emp.name }))} placeholder="Select Employee" />
          </div>
          <div className="mt-4">
            <Textarea label="Residential Address" required rows={2} value={formData.address} onChange={e => set('address', e.target.value)} />
          </div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
          <Button onClick={handleNext}>Save & Continue <ChevronRight size={15} /></Button>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Bank Details ──
  if (step === 2) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 3 of 6 — Bank Details" steps={STEPS} currentStep={step} />
      <Card title="Bank Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" required value={formData.bankAccountNo} onChange={e => set('bankAccountNo', e.target.value)} />
          <Input label="Account Holder Name" required value={formData.bankHolderName} onChange={e => set('bankHolderName', e.target.value)} />
          <Input label="Bank Name" required value={formData.bankName} onChange={e => set('bankName', e.target.value)} />
          <Input label="Branch" required value={formData.bankBranch} onChange={e => set('bankBranch', e.target.value)} />
          <Input label="IFSC Code" required value={formData.bankIfsc} onChange={e => set('bankIfsc', e.target.value.toUpperCase())} maxLength={11} />
        </div>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
        <Button onClick={handleNext}>Save & Continue <ChevronRight size={15} /></Button>
      </div>
    </div>
  )

  const relOptions = ['Father', 'Mother', 'Spouse', 'Son', 'Daughter', 'Brother', 'Sister', 'Friend', 'Other'].map(v => ({ value: v, label: v }))

  const handleFileUpload = (docId: string, file: File) => {

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [docId]: 0 }))
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadProgress(prev => {
          const next = { ...prev }
          delete next[docId]
          return next
        })
        setUploadedDocs(p => ({ ...p, [docId]: { name: file.name, size: file.size } }))
      } else {
        setUploadProgress(prev => ({ ...prev, [docId]: progress }))
      }
    }, 200)
  }

  // ── Step 3: Nominee & Guarantors ──
  if (step === 3) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 4 of 6 — Nominee & Guarantors" steps={STEPS} currentStep={step} />
      <div className="flex flex-col gap-4">
        <Card title="Nominee Information">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Full Name" required placeholder="Nominee name" value={nomineeData.name} onChange={e => setNomineeData(p => ({ ...p, name: e.target.value }))} />
            <Input label="Mobile Number" required placeholder="10-digit mobile" maxLength={10} value={nomineeData.mobile} onChange={e => setNomineeData(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))} />
            <Select label="Relationship" required options={relOptions} placeholder="Select" value={nomineeData.relationship} onChange={e => setNomineeData(p => ({ ...p, relationship: e.target.value }))} />
            <Input label="Date of Birth" required type="date" value={nomineeData.dob} onChange={e => setNomineeData(p => ({ ...p, dob: e.target.value }))} />
          </div>
          <div className="mt-4"><Textarea label="Address" required rows={2} value={nomineeData.address} onChange={e => setNomineeData(p => ({ ...p, address: e.target.value }))} /></div>
        </Card>

        <Card title="Guarantor 1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Full Name" required placeholder="Guarantor 1 name" value={guarantor1Data.name} onChange={e => setGuarantor1Data(p => ({ ...p, name: e.target.value }))} />
            <Input label="Mobile Number" required placeholder="10-digit mobile" maxLength={10} value={guarantor1Data.mobile} onChange={e => setGuarantor1Data(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))} />
            <Input label="Email" required type="email" value={guarantor1Data.email} onChange={e => setGuarantor1Data(p => ({ ...p, email: e.target.value }))} />
            <Input label="Aadhaar Number" required placeholder="12-digit Aadhaar" maxLength={12} value={guarantor1Data.aadhar} onChange={e => setGuarantor1Data(p => ({ ...p, aadhar: e.target.value.replace(/\D/g, '') }))} />
            <Input label="PAN Number" required placeholder="ABCDE1234F" maxLength={10} value={guarantor1Data.pan} onChange={e => setGuarantor1Data(p => ({ ...p, pan: e.target.value.toUpperCase() }))} />
            <Select label="Relationship" required options={relOptions} placeholder="Select" value={guarantor1Data.relationship} onChange={e => setGuarantor1Data(p => ({ ...p, relationship: e.target.value }))} />
            <Input label="Occupation" required value={guarantor1Data.occupation} onChange={e => setGuarantor1Data(p => ({ ...p, occupation: e.target.value }))} />
            <Input label="Monthly Income (₹)" required type="number" value={guarantor1Data.income} onChange={e => setGuarantor1Data(p => ({ ...p, income: e.target.value }))} />
          </div>
          <div className="mt-4"><Textarea label="Address" required rows={2} value={guarantor1Data.address} onChange={e => setGuarantor1Data(p => ({ ...p, address: e.target.value }))} /></div>
        </Card>

        <Card title="Guarantor 2 (Optional)">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Full Name" placeholder="Guarantor 2 name" value={guarantor2Data.name} onChange={e => setGuarantor2Data(p => ({ ...p, name: e.target.value }))} />
            <Input label="Mobile Number" placeholder="10-digit mobile" maxLength={10} value={guarantor2Data.mobile} onChange={e => setGuarantor2Data(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))} />
            <Input label="Email" type="email" value={guarantor2Data.email} onChange={e => setGuarantor2Data(p => ({ ...p, email: e.target.value }))} />
            <Input label="Aadhaar Number" placeholder="12-digit Aadhaar" maxLength={12} value={guarantor2Data.aadhar} onChange={e => setGuarantor2Data(p => ({ ...p, aadhar: e.target.value.replace(/\D/g, '') }))} />
            <Input label="PAN Number" placeholder="ABCDE1234F" maxLength={10} value={guarantor2Data.pan} onChange={e => setGuarantor2Data(p => ({ ...p, pan: e.target.value.toUpperCase() }))} />
            <Select label="Relationship" options={relOptions} placeholder="Select" value={guarantor2Data.relationship} onChange={e => setGuarantor2Data(p => ({ ...p, relationship: e.target.value }))} />
            <Input label="Occupation" value={guarantor2Data.occupation} onChange={e => setGuarantor2Data(p => ({ ...p, occupation: e.target.value }))} />
            <Input label="Monthly Income (₹)" type="number" value={guarantor2Data.income} onChange={e => setGuarantor2Data(p => ({ ...p, income: e.target.value }))} />
          </div>
          <div className="mt-4"><Textarea label="Address" rows={2} value={guarantor2Data.address} onChange={e => setGuarantor2Data(p => ({ ...p, address: e.target.value }))} /></div>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
          <Button onClick={handleNext}>Save & Continue <ChevronRight size={15} /></Button>
        </div>
      </div>
    </div>
  )

  // ── Step 4: Upload Documents ──
  if (step === 4) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 5 of 6 — Upload Documents" steps={STEPS} currentStep={step} />
      <div className="flex flex-col gap-4">
        <Card title="Customer & Guarantor Documents">
          <div className="p-3 rounded-xl text-sm mb-4" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
            Upload required documents. Accepted: PDF, JPG, PNG (max 5MB each). Required fields are marked.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DOC_LIST.map(doc => {
              const uploaded = uploadedDocs[doc.id]
              return (
                <div key={doc.id}>
                  <label className="text-xs font-semibold flex items-center gap-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                    {doc.label}
                    {doc.required && <span className="px-1.5 py-0.5 rounded-full text-[10px]" style={{ background: 'rgba(184,58,58,0.1)', color: 'var(--error)' }}>Required</span>}
                  </label>
                  {uploaded ? (
                    <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={16} style={{ color: confirmedDocs[doc.id] ? 'var(--success)' : 'var(--accent)', flexShrink: 0 }} />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{uploaded.name}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{(uploaded.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {confirmedDocs[doc.id] ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)' }}>Confirmed</span>
                        ) : (
                          <button onClick={() => setConfirmedDocs(p => ({ ...p, [doc.id]: true }))} className="text-[10px] px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--accent)', color: '#fff' }}>Confirm</button>
                        )}
                        <button onClick={() => { setUploadedDocs(p => ({ ...p, [doc.id]: null })); setConfirmedDocs(p => { const c = { ...p }; delete c[doc.id]; return c }) }} className="p-1.5 rounded-lg" style={{ color: 'var(--error)' }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : uploadProgress[doc.id] !== undefined ? (
                    <div className="flex flex-col justify-center gap-3 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                      <div className="flex justify-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        <span>Uploading...</span>
                        <span>{uploadProgress[doc.id]}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-200"
                          style={{ width: `${uploadProgress[doc.id]}%`, background: 'var(--primary)' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(doc.id, f) }} />
                      <div className="flex flex-col items-center gap-2 p-5 rounded-xl transition-all"
                        style={{ border: '2px dashed var(--border)', background: 'var(--hover)' }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <Upload size={20} style={{ color: 'var(--accent)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Click to upload</span>
                      </div>
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Upload summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{Object.values(uploadedDocs).filter(Boolean).length}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Uploaded</div>
          </div>
          <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--text-secondary)' }}>{DOC_LIST.length - Object.values(uploadedDocs).filter(Boolean).length}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Remaining</div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
          <div className="flex gap-3">
            <Button onClick={handleNext}>Save & Preview <ChevronRight size={15} /></Button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 5: Preview & Save ──
  return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 6 of 6 — Preview & Confirm" steps={STEPS} currentStep={step} />
      <div className="flex flex-col gap-4">
        {/* Preview card */}
        <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-5">
            <Eye size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Review Customer Details</h3>
          </div>

          <div className="flex flex-col md:flex-row gap-5 mb-5">
            {/* Photo */}
            <div className="flex-shrink-0">
              {photoDataUrl
                ? <img src={photoDataUrl} alt="Customer" className="w-24 h-24 rounded-2xl object-cover" style={{ border: '2px solid var(--accent)' }} />
                : <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-3xl font-bold" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>{formData.name.charAt(0) || '?'}</div>
              }
            </div>
            {/* Personal */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
              {[
                { icon: User, label: 'Name', value: formData.name },
                { icon: User, label: 'Father', value: formData.fatherName || '—' },
                { icon: User, label: 'DOB', value: formData.dob || '—' },
                { icon: User, label: 'Age', value: formData.age ? `${formData.age} yrs` : '—' },
                { icon: User, label: 'Gender', value: formData.gender || '—' },
                { icon: User, label: 'Marital', value: formData.maritalStatus || '—' },
                { icon: Phone, label: 'Mobile', value: formData.mobile },
                { icon: Mail, label: 'Email', value: formData.email || '—' },
                { icon: CreditCard, label: 'Aadhaar', value: formData.aadhar },
                { icon: CreditCard, label: 'PAN', value: formData.pan || '—' },
                { icon: Briefcase, label: 'Occupation', value: formData.occupation || '—' },
                { icon: MapPin, label: 'Address', value: formData.address || '—' },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2 min-w-0">
                  <r.icon size={12} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>{r.label}</div>
                    <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank */}
          <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={13} style={{ color: 'var(--accent)' }} />
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Bank Details</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
              {[
                { label: 'Account No', value: formData.bankAccountNo || '—' },
                { label: 'Holder Name', value: formData.bankHolderName || '—' },
                { label: 'Bank', value: formData.bankName || '—' },
                { label: 'Branch', value: formData.bankBranch || '—' },
                { label: 'IFSC', value: formData.bankIfsc || '—' },
              ].map(r => (
                <div key={r.label}>
                  <div className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>{r.label}</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Nominee */}
          {nomineeData.name && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Nominee</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-2">
                {[{ label: 'Name', value: nomineeData.name }, { label: 'Mobile', value: nomineeData.mobile || '—' }, { label: 'Relationship', value: nomineeData.relationship || '—' }].map(r => (
                  <div key={r.label}>
                    <div className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>{r.label}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantor 1 */}
          {guarantor1Data.name && (
            <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Guarantor 1</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-2">
                {[{ label: 'Name', value: guarantor1Data.name }, { label: 'Mobile', value: guarantor1Data.mobile || '—' }, { label: 'Relationship', value: guarantor1Data.relationship || '—' }, { label: 'Occupation', value: guarantor1Data.occupation || '—' }].map(r => (
                  <div key={r.label}>
                    <div className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>{r.label}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guarantor 2 */}
          {guarantor2Data.name && (
            <div className="rounded-xl p-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>Guarantor 2</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-2">
                {[{ label: 'Name', value: guarantor2Data.name }, { label: 'Mobile', value: guarantor2Data.mobile || '—' }, { label: 'Relationship', value: guarantor2Data.relationship || '—' }, { label: 'Occupation', value: guarantor2Data.occupation || '—' }].map(r => (
                  <div key={r.label}>
                    <div className="text-[10px] uppercase tracking-wide font-medium" style={{ color: 'var(--text-secondary)' }}>{r.label}</div>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/customers/list')} disabled={submitting}>
              <X size={15} /> Cancel
            </Button>
            <Button onClick={handleSubmit} loading={submitting} disabled={submitting}>
              <Save size={15} /> Confirm & Register
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
