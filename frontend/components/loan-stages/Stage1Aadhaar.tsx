'use client'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useLoanDraftStore } from '@/store/loanDraftStore'
import { useUIStore } from '@/store/uiStore'
import { Send, CheckCircle, ArrowRight, User, Phone, MapPin, Calendar } from 'lucide-react'

const FRONTEND_ONLY = process.env.NEXT_PUBLIC_FRONTEND_ONLY !== 'false'

export function Stage1Aadhaar({ onNext }: { onNext: () => void }) {
  const { showToast } = useUIStore()
  const {
    stage1,
    otpSent,
    maskedPhone,
    devOtp,
    setStage1,
    setOtpState,
    completeStage,
  } = useLoanDraftStore()

  const [aadhaar, setAadhaar] = useState('')
  const [otp, setOtp] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const handleSendOtp = async () => {
    if (!/^\d{12}$/.test(aadhaar)) {
      showToast('Aadhaar must be exactly 12 digits', 'error')
      return
    }

    setSending(true)
    setOtpState({ otpError: null })

    if (FRONTEND_ONLY) {
      await new Promise(r => setTimeout(r, 800))
      setOtpState({
        otpSent: true,
        maskedPhone: '******7890',
        devOtp: '123456',
      })
      showToast('OTP sent to ******7890', 'success')
      setSending(false)
      return
    }

    try {
      const res = await fetch('/api/loan-application/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Failed to send OTP')

      setOtpState({
        otpSent: true,
        maskedPhone: data.data.maskedPhone,
        devOtp: data.data.devOtp,
      })
      showToast(`OTP sent to ${data.data.maskedPhone}`, 'success')
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP', 'error')
      setOtpState({ otpError: err.message })
    } finally {
      setSending(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      showToast('OTP must be 6 digits', 'error')
      return
    }

    setVerifying(true)
    setOtpState({ otpError: null })

    if (FRONTEND_ONLY) {
      await new Promise(r => setTimeout(r, 800))
      if (otp !== '123456') {
        showToast('Invalid OTP. Use 123456', 'error')
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
      showToast('Aadhaar verified successfully!', 'success')
      setVerifying(false)
      return
    }

    try {
      const res = await fetch('/api/loan-application/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aadhaar, otp }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.message || 'Invalid OTP')

      setStage1({
        aadhaarVerified: true,
        aadhaarData: data.data.aadhaarData,
      })
      completeStage(1)
      showToast('Aadhaar verified successfully!', 'success')
    } catch (err: any) {
      showToast(err.message || 'OTP verification failed', 'error')
      setOtpState({ otpError: err.message })
    } finally {
      setVerifying(false)
    }
  }

  if (stage1.aadhaarVerified && stage1.aadhaarData) {
    const d = stage1.aadhaarData
    return (
      <Card title="✅ Aadhaar Verified">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--accent-tint)' }}>
            <CheckCircle size={24} style={{ color: 'var(--accent)' }} />
            <div>
              <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Verification Complete
              </p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                Customer details fetched from Aadhaar database
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <User size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {d.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <Phone size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Mobile Number
                </p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {d.phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <Calendar size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Date of Birth
                </p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {new Date(d.dob).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
              <MapPin size={18} style={{ color: 'var(--accent)', marginTop: 2 }} />
              <div>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Address
                </p>
                <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                  {d.address}
                </p>
              </div>
            </div>
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

  return (
    <Card title="Stage 1 — Aadhaar OTP Verification">
      <div className="space-y-6">
        <div className="p-4 rounded-xl" style={{ background: 'var(--hover)' }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter the customer's 12-digit Aadhaar number. An OTP will be sent to their registered mobile number for
            verification.
          </p>
        </div>

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
              <Send size={16} /> {sending ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
            </Button>
          </div>
        </div>

        {otpSent && (
          <>
            <div className="p-4 rounded-xl" style={{ background: 'var(--accent-tint)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                OTP sent to {maskedPhone}
              </p>
              {devOtp && (
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <strong>DEV MODE:</strong> OTP is <code className="font-mono font-bold">{devOtp}</code>
                </p>
              )}
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
                  <CheckCircle size={16} /> {verifying ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
