'use client'
import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'

export default function NotificationSettings() {
  const { showToast } = useUIStore()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    emiReminders: true,
    loanApprovals: true,
    paymentAlerts: true,
  })

  const handleToggle = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] })
    showToast('Notification preferences updated', 'success')
  }

  const items = [
    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
    { key: 'smsNotifications', label: 'SMS Notifications', description: 'Receive notifications via SMS' },
    { key: 'emiReminders', label: 'EMI Reminders', description: 'Get reminders for upcoming EMI payments' },
    { key: 'loanApprovals', label: 'Loan Approvals', description: 'Notifications for loan approval requests' },
    { key: 'paymentAlerts', label: 'Payment Alerts', description: 'Alerts for successful payments' },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #e2e8f0' }}>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e293b' }}>Notification Preferences</h2>
        <p className="text-sm text-slate-500">Manage how you receive notifications and alerts</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 rounded-lg border"
            style={{ borderColor: '#e2e8f0' }}
          >
            <div className="flex-1">
              <div className="text-sm font-semibold mb-1" style={{ color: '#1e293b' }}>{item.label}</div>
              <div className="text-xs text-slate-500">{item.description}</div>
            </div>
            <button
              onClick={() => handleToggle(item.key)}
              className="relative w-12 h-6 rounded-full transition-all"
              style={{
                background: settings[item.key as keyof typeof settings]
                  ? 'linear-gradient(135deg, #462C7D, #831C91)'
                  : '#cbd5e1',
              }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all"
                style={{
                  left: settings[item.key as keyof typeof settings] ? '26px' : '2px',
                }}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
