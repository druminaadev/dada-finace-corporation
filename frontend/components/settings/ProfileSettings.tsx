'use client'
import { useState } from 'react'
import { Camera, Save } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

export default function ProfileSettings() {
  const { showToast } = useUIStore()
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@nexzen.com',
    phone: '+91 98765 43210',
    role: 'Administrator',
    department: 'Management',
  })

  const handleSave = () => {
    showToast('Profile updated successfully', 'success')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #e2e8f0' }}>
      <div className="flex items-start gap-6 mb-8">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, #462C7D, #831C91)' }}
          >
            AU
          </div>
          <button
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg border-2 border-white"
            style={{ color: '#462C7D' }}
          >
            <Camera size={16} />
          </button>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-1" style={{ color: '#1e293b' }}>Profile Information</h2>
          <p className="text-sm text-slate-500">Update your personal details and contact information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Role</label>
          <input
            type="text"
            value={formData.role}
            disabled
            className="w-full px-4 py-2.5 rounded-lg border bg-slate-50"
            style={{ borderColor: '#e2e8f0', color: '#94a3b8' }}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#475569' }}>Department</label>
          <input
            type="text"
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border outline-none transition-all"
            style={{ borderColor: '#e2e8f0' }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#462C7D'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-6 border-t" style={{ borderColor: '#e2e8f0' }}>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg, #462C7D, #831C91)' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  )
}
