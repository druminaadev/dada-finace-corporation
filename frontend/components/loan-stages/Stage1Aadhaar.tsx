'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useAuthStore } from '@/store/authStore'
import { Send, CheckCircle, ArrowRight, User, Phone, MapPin, Calendar, SkipForward, ShieldCheck, ShieldOff } from 'lucide-react'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function Stage1Aadhaar({ onNext }: { onNext: () => void }) {
  
  const { token } = useAuthStore()
  const {
    stage1,
    otpSent,
    maskedPhone,
    devOtp,
    setStage1,
    setOtpState,
    completeStage,
    setDraftId,
    setAadhaarSkipped,
  } = useLoanDraftStore()

  const [aadhaar, setAadhaar] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSkip = () => {
    setAadhaarSkipped(true)
    setStage1({ aadhaarVerified: false, aadhaarData: null })
    completeStage(1)
    onNext()
  }

  const handleSendOtp = async () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      return
    }
    setSending(true)
    setOtpState({ otpError: null })

    if (FRONTEND_ONLY) {
      await new Promise(r => setTimeout(r, 800))
      setOtpState({ otpSent: true, maskedPhone: '******7890', devOtp: '123456' })
      setSending(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/loan-application/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')
      setOtpState({ otpSent: true, maskedPhone: data.data.maskedPhone, devOtp: data.data.devOtp })
    } catch (err: any) {
      setOtpState({ otpError: err.message })
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      return
    }
    setVerifying(true)
    setOtpState({ otpError: null })

    if (FRONTEND_ONLY) {
      await new Promise(r => setTimeout(r, 800))
      if (otp !== '123456') {
        setVerifying(false)
        return
      }
      setStage1({
        aadhaarVerified: true,
        aadhaarData: {
          aadhaar,
          name: 'John Doe',
          dob: '1990-01-15',
          gender: 'Male',
          phone: '9876543210',
          address: '123 Main Street, City, State - 123456',
        },
      })
      completeStage(1)
      setVerifying(false)
      return
    }

    try {
      const res = await fetch(`${API_BASE}/loan-application/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, otp }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')

      const draftRes = await fetch(`${API_BASE}/loan-application/drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      })
      const draftData = await draftRes.json()
      if (!draftRes.ok) throw new Error(draftData.message || 'Failed to initialize draft')

      const draftId = draftData.data.id
      setDraftId(draftId)

      const saveRes = await fetch(`${API_BASE}/loan-application/drafts/${draftId}/stage/1`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ aadhaarVerified: true, aadhaarData: data.data.aadhaarData }),
      })
      const saveResult = await saveRes.json()
      if (!saveRes.ok) throw new Error(saveResult.message || 'Failed to save Stage 1 details')

      setStage1({ aadhaarVerified: true, aadhaarData: data.data.aadhaarData })
      completeStage(1)
    } catch (err: any) {
      setOtpState({ otpError: err.message })
    } finally {
      setVerifying(false)
    }
  }

  // ── Verified state ──────────────────────────────────────────
  if (stage1.aadhaarVerified && stage1.aadhaarData) {
    const d = stage1.aadhaarData
    return (
      <Card title="✅ Aadhaar Verified">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--accent-tint)' }}>
            <CheckCircle size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>Verification Complete</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Customer details fetched from Aadhaar database</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { icon: User, label: 'Full Name', value: d.name },
              { icon: Phone, label: 'Mobile Number', value: d.phone },
              { icon: Calendar, label: 'Date of Birth', value: new Date(d.dob).toLocaleDateString('en-IN') },
              { icon: MapPin, label: 'Address', value: d.address },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
                <Icon size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</p>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={onNext}>
              Next: Customer & Loan Details <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // ── Main form ───────────────────────────────────────────────
  return (
    <div className="space-y-4">

      {/* Header options — Verify or Skip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Verify with Aadhaar card */}
        <div
          className="flex items-start gap-4 p-5 rounded-2xl cursor-default"
          style={{
            background: 'linear-gradient(135deg, rgba(70,44,125,0.08) 0%, rgba(131,28,145,0.06) 100%)',
            border: '2px solid rgba(70,44,125,0.25)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #462C7D, #831C91)' }}
          >
            <ShieldCheck size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>Verify with Aadhaar</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Enter 12-digit Aadhaar number. OTP will be sent to the registered mobile number for instant verification.
            </p>
          </div>
        </div>

        {/* Don't have Aadhaar card */}
        <div
          className="flex items-start gap-4 p-5 rounded-2xl cursor-default"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.03) 100%)',
            border: '2px dashed rgba(239,68,68,0.3)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            <ShieldOff size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>Don't have Aadhaar?</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Skip Aadhaar verification and fill customer details manually in the next step.
            </p>
            <Button variant="danger" size="sm" onClick={handleSkip}>
              <SkipForward size={14} /> Skip — Fill Manually
            </Button>
          </div>
        </div>

      </div>

      {/* Aadhaar OTP form */}
      <Card title="Stage 1 — Aadhaar OTP Verification">
        <div className="space-y-5">

          {/* Step 1 — Enter Aadhaar */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
              Step 1 — Enter Aadhaar Number
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Aadhaar Number"
                required
                placeholder="Enter 12-digit Aadhaar"
                maxLength={12}
                value={aadhaar}
                onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, ''))}
                disabled={otpSent}
              />
              <div className="flex items-end">
                <Button onClick={handleSendOtp} disabled={sending || otpSent} className="w-full">
                  <Send size={16} />
                  {sending ? 'Sending...' : otpSent ? '✓ OTP Sent' : 'Send OTP'}
                </Button>
              </div>
            </div>
          </div>

          {/* Step 2 — Enter OTP */}
          {otpSent && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                Step 2 — Enter OTP
              </p>

              <div
                className="flex items-start gap-3 p-3 rounded-xl mb-4"
                style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}
              >
                <CheckCircle size={16} style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                    OTP sent to {maskedPhone}
                  </p>
                  {devOtp && (
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      <strong>DEV MODE:</strong> OTP is <code className="font-mono font-bold">{devOtp}</code>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Enter OTP"
                  required
                  placeholder="6-digit OTP"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
                <div className="flex items-end">
                  <Button onClick={handleVerifyOtp} disabled={verifying} className="w-full">
                    <CheckCircle size={16} />
                    {verifying ? 'Verifying...' : 'Verify OTP'}
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer skip */}
        <div
          className="flex items-center justify-between mt-6 pt-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Don't have Aadhaar details right now?
          </p>
          <Button variant="outline" size="sm" onClick={handleSkip}>
            <SkipForward size={14} /> Skip for Now
          </Button>
        </div>

      </Card>
    </div>
  )
}
