'use client'
import { useState } from 'react'
import { useUIStore } from '@/store/uiStore'

export default function SecuritySettings() {
  const { showToast } = useUIStore()
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match', 'error')
      return
    }
    showToast('Password updated successfully', 'success')
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #e2e8f0' }}>
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-1" style={{ color: '#1e293b' }}>Security Settings</h2>
        <p className="text-sm text-slate-500">Update your password and manage account security</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Current Password</label>
          <input
            type="password"
            value={passwordForm.oldPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>New Password</label>
          <input
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Confirm New Password</label>
          <input
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            required
          />
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-lg text-white font-semibold transition-all mt-4"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-light))' }}
        >
          Update Password
        </button>
      </form>
    </div>
  )
}
