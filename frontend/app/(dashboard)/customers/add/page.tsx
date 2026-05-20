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
  Save, X, Send, CheckCircle, Camera, RotateCcw,
  ChevronRight, ChevronLeft, User, Phone, CreditCard,
  MapPin, Mail, Briefcase, Building2, Eye
} from 'lucide-react'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'

const STEPS = ['Verify Aadhaar', 'Personal Info', 'Bank Details', 'Preview & Save']

export default function AddCustomerPage() {
  const { showToast } = useUIStore()
  const { addCustomer, branches, employees } = useStore()
  const router = useRouter()

  const [step, setStep] = useState(0) // 0=aadhaar, 1=personal, 2=bank, 3=preview
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
      if (age > 0) set('age', String(age))
    }
  }, [formData.dob])

  // Camera helpers
  const startCamera = async () => {
    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = ms; setStream(ms); setShowCamera(true)
    } catch (err: any) {
      showToast(err.name === 'NotAllowedError' ? 'Camera permission denied' : 'Camera not available', 'error')
    }
  }
  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    streamRef.current = null; setStream(null); setShowCamera(false)
  }
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !stream) { showToast('Camera not ready', 'error'); return }
    const v = videoRef.current, c = canvasRef.current
    if (!v.videoWidth) { showToast('Camera warming up, try again', 'info'); return }
    c.width = v.videoWidth; c.height = v.videoHeight
    const ctx = c.getContext('2d')!
    ctx.save(); ctx.translate(c.width, 0); ctx.scale(-1, 1)
    ctx.drawImage(v, 0, 0, c.width, c.height); ctx.restore()
    setPhotoDataUrl(c.toDataURL('image/jpeg', 0.8))
    setPhotoTaken(true); stopCamera()
    showToast('Photo captured!', 'success')
  }

  useEffect(() => {
    if (!showCamera || !stream || !videoRef.current) return
    const v = videoRef.current; v.srcObject = stream; v.play().catch(() => {})
    return () => { if (v.srcObject === stream) v.srcObject = null }
  }, [showCamera, stream])
  useEffect(() => () => streamRef.current?.getTracks().forEach(t => t.stop()), [])

  // OTP
  const handleSendOtp = async () => {
    if (!/^\d{12}$/.test(aadhaar)) { showToast('Aadhaar must be 12 digits', 'error'); return }
    setSending(true)
    await new Promise(r => setTimeout(r, 800))
    setOtpSent(true); setMaskedPhone('******7890'); setDevOtp('123456')
    showToast('OTP sent to ******7890', 'success'); setSending(false)
  }
  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) { showToast('OTP must be 6 digits', 'error'); return }
    setVerifying(true)
    await new Promise(r => setTimeout(r, 800))
    if (otp !== '123456') { showToast('Invalid OTP. Use 123456', 'error'); setVerifying(false); return }
    setFormData(p => ({ ...p, name: 'John Doe', dob: '1990-01-15', gender: 'Male', mobile: '9876547890', address: '123 Main Street, City', aadhar: aadhaar }))
    setStep(1); showToast('Aadhaar verified! Complete remaining details', 'success'); setVerifying(false)
  }

  // Validation per step
  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.name) { showToast('Customer name is required', 'error'); return false }
      if (!formData.mobile || !/^[6-9]\d{9}$/.test(formData.mobile)) { showToast('Valid mobile number is required', 'error'); return false }
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
      showToast('Name, mobile, and Aadhaar are required', 'error'); return
    }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))
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
      nominee: null, guarantor1: null, guarantor2: null
    })
    useUIStore.getState().addNotification('New Customer Registered', `${formData.name} registered. Mobile: ${formData.mobile}`)
    showToast('Customer registered successfully!', 'success')
    setSubmitting(false)
    router.push('/customers/list')
  }

  // Step progress bar
  const StepBar = () => (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((label, i) => (
        <div key={i} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all`}
              style={{
                background: i < step ? 'var(--success)' : i === step ? 'var(--accent)' : 'var(--hover)',
                color: i <= step ? '#fff' : 'var(--text-secondary)',
                border: i === step ? '2px solid var(--accent)' : 'none'
              }}>
              {i < step ? <CheckCircle size={14} /> : i + 1}
            </div>
            <span className="text-[10px] mt-1 font-medium whitespace-nowrap hidden sm:block"
              style={{ color: i === step ? 'var(--accent)' : 'var(--text-secondary)' }}>{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex-1 h-0.5 mx-1" style={{ background: i < step ? 'var(--success)' : 'var(--border)' }} />
          )}
        </div>
      ))}
    </div>
  )

  // ── Step 0: Aadhaar ──
  if (step === 0) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 1 of 4 — Aadhaar Verification" />
      <StepBar />
      <Card title="Verify Aadhaar">
        <div className="space-y-5 max-w-xl">
          <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--hover)', color: 'var(--text-secondary)' }}>
            Enter the customer's 12-digit Aadhaar number. An OTP will be sent to their registered mobile.
          </div>
          <div className="flex gap-3">
            <Input label="Aadhaar Number" required placeholder="Enter 12-digit Aadhaar" maxLength={12}
              value={aadhaar} onChange={e => setAadhaar(e.target.value.replace(/\D/g, ''))} disabled={otpSent} />
            <div className="flex items-end">
              <Button onClick={handleSendOtp} disabled={sending || otpSent} loading={sending}>
                <Send size={15} /> {otpSent ? 'Sent ✓' : 'Send OTP'}
              </Button>
            </div>
          </div>
          {otpSent && (
            <>
              <div className="p-3 rounded-xl text-sm" style={{ background: 'var(--accent-tint)', color: 'var(--accent)' }}>
                OTP sent to {maskedPhone}
                {devOtp && <span className="ml-2 font-mono font-bold">(DEV: {devOtp})</span>}
              </div>
              <div className="flex gap-3">
                <Input label="Enter OTP" required placeholder="6-digit OTP" maxLength={6}
                  value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} />
                <div className="flex items-end">
                  <Button onClick={handleVerifyOtp} disabled={verifying} loading={verifying}>
                    <CheckCircle size={15} /> Verify
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  )

  // ── Step 1: Personal Info ──
  if (step === 1) return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 2 of 4 — Personal Information" />
      <StepBar />
      <div className="flex flex-col gap-4">
        {/* Photo */}
        <Card title="Customer Photo (Optional)">
          {!showCamera && !photoTaken && (
            <div className="flex flex-col items-center gap-3 py-8 rounded-xl cursor-pointer"
              style={{ border: '2px dashed var(--border)', background: 'var(--hover)' }}
              onClick={startCamera}>
              <Camera size={32} style={{ color: 'var(--accent)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>Click to start camera</span>
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
            <Input label="Father's Name" value={formData.fatherName} onChange={e => set('fatherName', e.target.value)} />
            <Input label="Mother's Name" value={formData.motherName} onChange={e => set('motherName', e.target.value)} />
            <Input label="Date of Birth" type="date" value={formData.dob} onChange={e => set('dob', e.target.value)} />
            <Input label="Age" value={formData.age} readOnly />
            <Select label="Gender" value={formData.gender} onChange={e => set('gender', e.target.value)}
              options={['Male', 'Female', 'Other'].map(v => ({ value: v, label: v }))} placeholder="Select Gender" />
            <Select label="Marital Status" value={formData.maritalStatus} onChange={e => set('maritalStatus', e.target.value)}
              options={['Single', 'Married', 'Divorced', 'Widowed'].map(v => ({ value: v, label: v }))} placeholder="Select Status" />
            <Input label="Blood Group" value={formData.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} placeholder="e.g. B+" />
            <Input label="Occupation" value={formData.occupation} onChange={e => set('occupation', e.target.value)} />
            <Input label="Mobile Number" required value={formData.mobile} onChange={e => set('mobile', e.target.value)} />
            <Input label="Alt Mobile" value={formData.altMobile} onChange={e => set('altMobile', e.target.value)} />
            <Input label="Email" type="email" value={formData.email} onChange={e => set('email', e.target.value)} />
            <Input label="Aadhaar" value={formData.aadhar} readOnly />
            <Input label="PAN" value={formData.pan} onChange={e => set('pan', e.target.value.toUpperCase())} maxLength={10} />
            <Input label="Job Address" value={formData.jobAddress} onChange={e => set('jobAddress', e.target.value)} />
            <Select label="Branch" value={formData.branchId} onChange={e => set('branchId', e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))} placeholder="Select Branch" />
            <Select label="Assigned Employee" value={formData.employeeId} onChange={e => set('employeeId', e.target.value)}
              options={employees.map(emp => ({ value: emp.id, label: emp.name }))} placeholder="Select Employee" />
          </div>
          <div className="mt-4">
            <Textarea label="Residential Address" rows={2} value={formData.address} onChange={e => set('address', e.target.value)} />
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
      <PageHeader title="Add Customer" subtitle="Step 3 of 4 — Bank Details" />
      <StepBar />
      <Card title="Bank Details">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Input label="Account Number" value={formData.bankAccountNo} onChange={e => set('bankAccountNo', e.target.value)} />
          <Input label="Account Holder Name" value={formData.bankHolderName} onChange={e => set('bankHolderName', e.target.value)} />
          <Input label="Bank Name" value={formData.bankName} onChange={e => set('bankName', e.target.value)} />
          <Input label="Branch" value={formData.bankBranch} onChange={e => set('bankBranch', e.target.value)} />
          <Input label="IFSC Code" value={formData.bankIfsc} onChange={e => set('bankIfsc', e.target.value.toUpperCase())} maxLength={11} />
        </div>
      </Card>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={handleBack}><ChevronLeft size={15} /> Back</Button>
        <Button onClick={handleNext}>Save & Preview <ChevronRight size={15} /></Button>
      </div>
    </div>
  )

  // ── Step 3: Preview & Save ──
  return (
    <div>
      <PageHeader title="Add Customer" subtitle="Step 4 of 4 — Preview & Confirm" />
      <StepBar />
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
          <div className="rounded-xl p-4" style={{ background: 'var(--hover)', border: '1px solid var(--border)' }}>
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
